# 检测cvm孤儿实例

## 背景说明

腾讯云tke集群，节点池下线节点后，cvm会成为孤儿实例，即不在tke节点池中，也不是一台有意义的cvm，因此需要做个监控检查



## 代码

[腾讯云cvm API文档](https://cloud.tencent.com/document/api/213/15728)

[腾讯云查询TKE集群列表文档](https://cloud.tencent.com/document/api/457/31862)

[腾讯云查询TKE集群节点信息文档](https://cloud.tencent.com/document/api/457/31863)

代码

```go
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"reflect"

	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	cvm "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/cvm/v20170312"
	tke "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/tke/v20180525"
	"gopkg.in/yaml.v2"
)

// ==================== 配置结构 ====================
type Config struct {
	TencentCloud TencentCloudConfig `yaml:"tencentcloud"`
	Webhook      WebhookConfig      `yaml:"webhook"`
	Logging      LoggingConfig      `yaml:"logging"`
}

type TencentCloudConfig struct {
	SecretID  string `yaml:"secret_id"`
	SecretKey string `yaml:"secret_key"`
	Region    string `yaml:"region"`
}

type WebhookConfig struct {
	Enabled  bool              `yaml:"enabled"`
	Timeout  int               `yaml:"timeout"`
	Platforms WebhookPlatforms `yaml:"platforms"`
}

type WebhookPlatforms struct {
	Wecom    WebhookPlatformConfig `yaml:"wecom"`
	Dingtalk WebhookPlatformConfig `yaml:"dingtalk"`
	Feishu   WebhookPlatformConfig `yaml:"feishu"`
}

type WebhookPlatformConfig struct {
	Enabled bool   `yaml:"enabled"`
	URL     string `yaml:"url"`
	Secret  string `yaml:"secret,omitempty"`
}

type LoggingConfig struct {
	Level string `yaml:"level"`
}

// ==================== CVM相关 ====================
type OrphanedVM struct {
	InstanceID   string            `json:"instance_id"`
	InstanceName string            `json:"instance_name"`
	PrivateIP    string            `json:"private_ip,omitempty"`
	PublicIP     string            `json:"public_ip,omitempty"`
	Tags         map[string]string `json:"tags"`
}

// TKE相关标签
var tkeLabels = []string{"tke", "qcloud-app", "tencentcloud", "kubernetes", "cluster", "node"}

// ==================== 配置加载 ====================
func loadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}
	return &config, nil
}

// ==================== 腾讯云客户端 ====================
func newCVMClient(config *Config) (*cvm.Client, error) {
	cred := common.NewCredential(config.TencentCloud.SecretID, config.TencentCloud.SecretKey)
	cpf := profile.NewClientProfile()
	cpf.HttpProfile.Endpoint = "cvm.tencentcloudapi.com"
	return cvm.NewClient(cred, config.TencentCloud.Region, cpf)
}

func newTKEClient(config *Config) (*tke.Client, error) {
	cred := common.NewCredential(config.TencentCloud.SecretID, config.TencentCloud.SecretKey)
	cpf := profile.NewClientProfile()
	cpf.HttpProfile.Endpoint = "tke.tencentcloudapi.com"
	return tke.NewClient(cred, config.TencentCloud.Region, cpf)
}

// ==================== CVM实例操作 ====================
func getAllCVMInstances(cvmClient *cvm.Client) ([]*cvm.Instance, error) {
	var allInstances []*cvm.Instance
	offset, limit := int64(0), int64(100)
	var totalCount int64 = 0

	for {
		req := cvm.NewDescribeInstancesRequest()
		req.Offset = &offset
		req.Limit = &limit
		resp, err := cvmClient.DescribeInstances(req)
		if err != nil {
			return nil, err
		}
		if resp.Response == nil || resp.Response.InstanceSet == nil {
			break
		}
		allInstances = append(allInstances, resp.Response.InstanceSet...)
		if totalCount == 0 && resp.Response.TotalCount != nil {
			totalCount = *resp.Response.TotalCount
		}
		if int64(len(allInstances)) >= totalCount {
			break
		}
		offset += limit
		time.Sleep(100 * time.Millisecond)
	}
	log.Printf("总共获取到 %d 个CVM实例", len(allInstances))
	return allInstances, nil
}

func filterTKEInstances(instances []*cvm.Instance) []*cvm.Instance {
	var tkeInstances []*cvm.Instance
	for _, instance := range instances {
		if hasTKELabels(instance) {
			tkeInstances = append(tkeInstances, instance)
		}
	}
	return tkeInstances
}

func hasTKELabels(instance *cvm.Instance) bool {
	if instance.InstanceName != nil {
		name := strings.ToLower(*instance.InstanceName)
		if strings.Contains(name, "tke") || strings.Contains(name, "k8s") || strings.Contains(name, "-np-") {
			return true
		}
	}
	if instance.Tags != nil {
		for _, tag := range instance.Tags {
			if tag.Key == nil {
				continue
			}
			key := strings.ToLower(*tag.Key)
			value := ""
			if tag.Value != nil {
				value = strings.ToLower(*tag.Value)
			}
			for _, tkeLabel := range tkeLabels {
				if strings.Contains(key, tkeLabel) || strings.Contains(value, tkeLabel) {
					return true
				}
			}
		}
	}
	return false
}

func getPrivateIP(instance *cvm.Instance) string {
	v := reflect.ValueOf(instance).Elem()
	if ips := v.FieldByName("PrivateIpAddresses"); ips.IsValid() {
		if ipList, ok := ips.Interface().([]*string); ok && len(ipList) > 0 && ipList[0] != nil {
			return *ipList[0]
		}
	}
	return ""
}

func getPublicIP(instance *cvm.Instance) string {
	v := reflect.ValueOf(instance).Elem()
	if ips := v.FieldByName("PublicIpAddresses"); ips.IsValid() {
		if ipList, ok := ips.Interface().([]*string); ok && len(ipList) > 0 && ipList[0] != nil {
			return *ipList[0]
		}
	}
	return ""
}

func getInstanceName(instance *cvm.Instance) string {
	if instance.InstanceName != nil {
		return *instance.InstanceName
	}
	return "unknown"
}

// ==================== TKE节点操作 ====================
func getTKENodes(tkeClient *tke.Client) (map[string]bool, error) {
	clusterNodes := make(map[string]bool)
	clusters, err := getTKEClusters(tkeClient)
	if err != nil {
		return nil, err
	}
	for _, cluster := range clusters {
		if cluster.ClusterId == nil {
			continue
		}
		nodes, err := getAllClusterNodes(tkeClient, cluster)
		if err != nil {
			continue
		}
		for _, node := range nodes {
			if node.InstanceId != nil {
				clusterNodes[strings.ToLower(*node.InstanceId)] = true
			}
		}
	}
	return clusterNodes, nil
}

func getTKEClusters(tkeClient *tke.Client) ([]*tke.Cluster, error) {
	req := tke.NewDescribeClustersRequest()
	limit := int64(50)
	req.Limit = &limit
	resp, err := tkeClient.DescribeClusters(req)
	if err != nil {
		return nil, err
	}
	return resp.Response.Clusters, nil
}

func getAllClusterNodes(tkeClient *tke.Client, cluster *tke.Cluster) ([]*tke.Instance, error) {
	var allNodes []*tke.Instance
	offset, limit := int64(0), int64(100)
	for {
		req := tke.NewDescribeClusterInstancesRequest()
		req.ClusterId = cluster.ClusterId
		req.Offset = &offset
		req.Limit = &limit
		resp, err := tkeClient.DescribeClusterInstances(req)
		if err != nil {
			return nil, err
		}
		if resp.Response == nil || resp.Response.InstanceSet == nil {
			break
		}
		allNodes = append(allNodes, resp.Response.InstanceSet...)
		if int64(len(resp.Response.InstanceSet)) < limit {
			break
		}
		offset += limit
		time.Sleep(100 * time.Millisecond)
	}
	return allNodes, nil
}

// ==================== 孤儿实例检查 ====================
func findOrphanedCVM(tkeInstances []*cvm.Instance, tkeNodes map[string]bool) []OrphanedVM {
	var orphaned []OrphanedVM
	for _, instance := range tkeInstances {
		if instance.InstanceId == nil {
			continue
		}
		
		// 跳过待回收状态的实例
		if instance.InstanceState != nil {
			state := strings.ToLower(*instance.InstanceState)
			// SHUTDOWN 表示已关机待回收,这些实例会自动释放,不需要告警
			if state == "shutdown" {
				log.Printf("跳过待回收实例: %s (状态: %s)", *instance.InstanceId, *instance.InstanceState)
				continue
			}
		}
		
		instanceID := strings.ToLower(*instance.InstanceId)
		if !tkeNodes[instanceID] {
			vm := OrphanedVM{
				InstanceID:   instanceID,
				InstanceName: getInstanceName(instance),
				PrivateIP:    getPrivateIP(instance),
				PublicIP:     getPublicIP(instance),
				Tags:         make(map[string]string),
			}
			if instance.Tags != nil {
				for _, tag := range instance.Tags {
					if tag.Key != nil {
						key := *tag.Key
						value := ""
						if tag.Value != nil {
							value = *tag.Value
						}
						vm.Tags[key] = value
					}
				}
			}
			orphaned = append(orphaned, vm)
		}
	}
	return orphaned
}

// ==================== Webhook消息构建 ====================
func buildCommonMessageContent(orphaned []OrphanedVM) string {
	// 构建头部
	content := fmt.Sprintf("🚨 **孤儿 CVM 实例告警**\n\n")
	content += fmt.Sprintf("【实例总数】 %d\n", len(orphaned))
	content += fmt.Sprintf("【发生时间】 %s\n", time.Now().Format("2006-01-02 15:04:05"))
	content += fmt.Sprintf("【告警级别】 `WARNING`\n\n")
	content += "━━━━━━━━━━━━━━━━━━\n\n"
	
	// 构建详细列表
	if len(orphaned) > 0 {
		content += "📌 **孤儿实例明细**\n\n"
		
		numberEmojis := []string{"1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"}
		
		for i, vm := range orphaned {
			emoji := "🔢"
			if i < len(numberEmojis) {
				emoji = numberEmojis[i]
			}
			
			content += fmt.Sprintf("%s **%s**\n", emoji, vm.InstanceID)
			content += fmt.Sprintf("• 名称：%s\n", vm.InstanceName)
			
			if vm.PrivateIP != "" {
				content += fmt.Sprintf("• 内网IP：`%s`\n", vm.PrivateIP)
			}
			if vm.PublicIP != "" {
				content += fmt.Sprintf("• 公网IP：`%s`\n", vm.PublicIP)
			}
			
			if len(vm.Tags) > 0 {
				content += "• 标签："
				tagParts := []string{}
				for k, v := range vm.Tags {
					tagParts = append(tagParts, fmt.Sprintf("%s=%s", k, v))
				}
				content += strings.Join(tagParts, ", ")
				content += "\n"
			}
			content += "\n"
		}
		
		// 构建快速汇总
		content += "━━━━━━━━━━━━━━━━━━\n\n"
		content += "📊 **快速汇总（便于复制）**\n\n"
		
		// 实例ID列表
		instanceIDs := []string{}
		privateIPs := []string{}
		
		for _, vm := range orphaned {
			instanceIDs = append(instanceIDs, vm.InstanceID)
			if vm.PrivateIP != "" {
				privateIPs = append(privateIPs, vm.PrivateIP)
			}
		}
		
		content += fmt.Sprintf("**实例ID：**\n`%s`\n\n", strings.Join(instanceIDs, ", "))
		
		if len(privateIPs) > 0 {
			content += fmt.Sprintf("**内网IP：**\n`%s`", strings.Join(privateIPs, ", "))
		}
	}
	
	return content
}

func buildWecomMessage(orphaned []OrphanedVM) ([]byte, error) {
	msg := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"content": buildCommonMessageContent(orphaned),
		},
	}
	return json.Marshal(msg)
}

func buildDingtalkMessage(orphaned []OrphanedVM) ([]byte, error) {
	// 钉钉的 Markdown 需要特殊处理换行
	content := buildCommonMessageContent(orphaned)
	// 钉钉需要两个空格+换行符来实现换行
	content = strings.ReplaceAll(content, "\n", "  \n")
	
	msg := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"title": "孤儿CVM实例告警",
			"text":  content,
		},
		"at": map[string]interface{}{"isAtAll": false},
	}
	return json.Marshal(msg)
}

func buildFeishuMessage(orphaned []OrphanedVM) ([]byte, error) {
	// 飞书不支持反引号,需要移除
	content := buildCommonMessageContent(orphaned)
	content = strings.ReplaceAll(content, "`", "")
	
	elements := []map[string]interface{}{
		{"tag": "markdown", "content": content},
	}
	msg := map[string]interface{}{
		"msg_type": "interactive",
		"card": map[string]interface{}{
			"config":   map[string]interface{}{"wide_screen_mode": true},
			"header":   map[string]interface{}{"title": map[string]interface{}{"tag": "plain_text", "content": "🚨 孤儿CVM实例告警"}, "template": "red"},
			"elements": elements,
		},
	}
	return json.Marshal(msg)
}

// ==================== 签名 ====================
func generateDingtalkSignature(secret string) (string, string) {
	timestamp := fmt.Sprintf("%d", time.Now().UnixMilli())
	stringToSign := timestamp + "\n" + secret
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(stringToSign))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return timestamp, signature
}

func generateFeishuSignature(secret string, timestamp int64) (string, error) {
	// timestamp + "\n" + secret 作为 HMAC 的 key
	stringToSign := fmt.Sprintf("%v", timestamp) + "\n" + secret
	var data []byte
	h := hmac.New(sha256.New, []byte(stringToSign))
	_, err := h.Write(data)
	if err != nil {
		return "", err
	}
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return signature, nil
}

// ==================== Webhook发送 ====================
func sendWebhookMessage(config *Config, platform string, url string, secret string, message []byte) error {
	client := &http.Client{Timeout: time.Duration(config.Webhook.Timeout) * time.Second}
	finalURL := url
	var finalMessage []byte = message

	if platform == "dingtalk" && secret != "" {
		ts, sig := generateDingtalkSignature(secret)
		finalURL = fmt.Sprintf("%s&timestamp=%s&sign=%s", url, ts, sig)
	}
	
	// 飞书需要在请求体中包含签名
	if platform == "feishu" && secret != "" {
		timestamp := time.Now().Unix() // 秒级时间戳
		sign, err := generateFeishuSignature(secret, timestamp)
		if err != nil {
			return fmt.Errorf("生成飞书签名失败: %v", err)
		}
		
		// 解析原始消息
		var msgMap map[string]interface{}
		json.Unmarshal(message, &msgMap)
		// 添加签名字段
		msgMap["timestamp"] = fmt.Sprintf("%v", timestamp)
		msgMap["sign"] = sign
		finalMessage, _ = json.Marshal(msgMap)
	} else {
		finalMessage = message
	}

	resp, err := client.Post(finalURL, "application/json", strings.NewReader(string(finalMessage)))
	if err != nil {
		return fmt.Errorf("%s Webhook请求失败: %v", platform, err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	log.Printf("%s Webhook返回: %s", platform, string(body))
	return nil
}

func sendWebhookAlerts(config *Config, orphaned []OrphanedVM) error {
	if !config.Webhook.Enabled || len(orphaned) == 0 {
		return nil
	}

	if config.Webhook.Platforms.Wecom.Enabled && config.Webhook.Platforms.Wecom.URL != "" {
		msg, _ := buildWecomMessage(orphaned)
		_ = sendWebhookMessage(config, "wecom", config.Webhook.Platforms.Wecom.URL, "", msg)
	}

	if config.Webhook.Platforms.Dingtalk.Enabled && config.Webhook.Platforms.Dingtalk.URL != "" {
		msg, _ := buildDingtalkMessage(orphaned)
		_ = sendWebhookMessage(config, "dingtalk", config.Webhook.Platforms.Dingtalk.URL, config.Webhook.Platforms.Dingtalk.Secret, msg)
	}

	if config.Webhook.Platforms.Feishu.Enabled && config.Webhook.Platforms.Feishu.URL != "" {
		msg, _ := buildFeishuMessage(orphaned)
		_ = sendWebhookMessage(config, "feishu", config.Webhook.Platforms.Feishu.URL, config.Webhook.Platforms.Feishu.Secret, msg)
	}

	return nil
}

// ==================== 主逻辑 ====================
func runCheck(config *Config) error {
	cvmClient, _ := newCVMClient(config)
	tkeClient, _ := newTKEClient(config)

	allInstances, _ := getAllCVMInstances(cvmClient)
	tkeInstances := filterTKEInstances(allInstances)
	tkeNodes, _ := getTKENodes(tkeClient)
	orphaned := findOrphanedCVM(tkeInstances, tkeNodes)

	log.Printf("发现 %d 个孤儿CVM实例", len(orphaned))
	sendWebhookAlerts(config, orphaned)
	return nil
}

func main() {
	configPath := "./config.yaml"
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	}
	config, err := loadConfig(configPath)
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}
	if err := runCheck(config); err != nil {
		log.Fatalf("检查失败: %v", err)
	}
	log.Println("检查完成")
}
```



配置文件 `config.yaml`

```yaml
tencentcloud:
  secret_id: "AKxxx"
  secret_key: "xxx"
  region: "ap-beijing"

webhook:
  enabled: true
  timeout: 10
  platforms:
    wecom:
      enabled: true
      url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    dingtalk:
      enabled: true
      url: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
      secret: "xxx"
    feishu:
      enabled: true
      url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
      secret: "xxx"
logging:
  level: "info"
```



## 通知效果

- 飞书

![iShot_2026-01-12_10.11.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-12_10.11.54.png)



- 企业微信

![iShot_2026-01-12_14.40.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-12_14.40.30.png)



- 钉钉

  ![iShot_2026-01-12_14.43.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-12_14.43.30.png)



















