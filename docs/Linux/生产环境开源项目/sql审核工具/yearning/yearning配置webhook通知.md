# yearning配置webhook通知

yearning内置的webhook通知目前只支持钉钉，当然也可以通过程序自定义通知

![iShot_2025-10-09_18.57.17](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2025-10-09_18.57.17.png)





## 配置飞书webhook通知

### 目录内容

```shell
$ tree send-feishu-webhook/
send-feishu-webhook/
├── config.yaml
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
└── send-feishu-webhook.go

1 directory, 6 files
```



### 配置文件 `config.yaml`

:::tip 说明

- 支持webhook安全校验
- 根据不同数据源发送消息到不同webhook 
- 开头的配置是作为**默认配置**，当工单的数据源没有在任何webhook组中匹配到时或者不需要使用匹配数据源功能时使用

:::

```yaml
feishu:
  # 默认发送webhook
  webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  secret: "xxx"

server:
  port: 5000
  mode: "release"

webhooks:
  ###################################################### ai ######################################################
  - name: "ai"
    data_sources:
      - "airobot"
      - "aiteacher"
    webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
    secret: "xxx"

  ###################################################### game ######################################################
  - name: "game"
    data_sources:
      - "gameaaa"
      - "gamebbb"
    webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
    secret: "xxx"


  ###################################################### 后续新增 ######################################################
  # 全新的webhook组
  - name: "webhook_new_team"
    data_sources:
      - "team_a_db"
      - "team_b_db" 
      - "analytics_db"
    webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/ffffffffffff"
    secret: "secret_for_new_team"
```



### 程序代码

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
    "regexp"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "gopkg.in/yaml.v3"
)

// Config 配置文件结构体
type Config struct {
    Feishu    FeishuConfig     `yaml:"feishu"`
    Server    ServerConfig     `yaml:"server"`
    Webhooks  []WebhookConfig  `yaml:"webhooks"`
}

type FeishuConfig struct {
    WebhookURL string `yaml:"webhook_url"`
    Secret     string `yaml:"secret"`
}

type ServerConfig struct {
    Port int    `yaml:"port"`
    Mode string `yaml:"mode"`
}

type WebhookConfig struct {
    Name        string   `yaml:"name"`        // webhook名称标识
    DataSources []string `yaml:"data_sources"` // 该webhook对应的数据源列表
    WebhookURL  string   `yaml:"webhook_url"`  // 飞书webhook地址
    Secret      string   `yaml:"secret"`       // 签名密钥
}

// 全局配置变量
var AppConfig *Config

// LoadConfig 加载配置文件
func LoadConfig(configPath string) (*Config, error) {
    config := &Config{}

    file, err := os.Open(configPath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    decoder := yaml.NewDecoder(file)
    if err := decoder.Decode(config); err != nil {
        return nil, err
    }

    return config, nil
}

// InitConfig 初始化配置
func InitConfig() {
    configPath := "config.yaml"
    if path := os.Getenv("CONFIG_PATH"); path != "" {
        configPath = path
    }

    config, err := LoadConfig(configPath)
    if err != nil {
        log.Fatalf("Error loading config: %v", err)
    }

    AppConfig = config
    log.Printf("Configuration loaded successfully from %s", configPath)
    log.Printf("Loaded %d webhook configurations", len(config.Webhooks))
    
    // 打印webhook配置信息
    for _, webhook := range config.Webhooks {
        log.Printf("Webhook '%s' handles data sources: %v", 
            webhook.Name, webhook.DataSources)
    }
}

// calculateFeishuSignature 计算飞书webhook签名（修正版）
func calculateFeishuSignature(secret string, timestamp int64) string {
    // 飞书签名规则：timestamp + "\n" + secret
    stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
    
    log.Printf("String to sign: %q", stringToSign)
    
    // 使用HMAC-SHA256算法计算签名
    h := hmac.New(sha256.New, []byte(stringToSign))
    h.Write([]byte("")) // 飞书签名是对空字符串进行签名
    
    // 对结果进行Base64编码
    signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
    
    log.Printf("Calculated signature: %s", signature)
    return signature
}

// extractMarkdownText 提取并分行处理 markdown 的 text 字段
func extractMarkdownText(data map[string]interface{}) []string {
    markdown, ok := data["markdown"].(map[string]interface{})
    if !ok {
        log.Println("Markdown field not found or invalid")
        return []string{}
    }

    text, ok := markdown["text"].(string)
    if !ok || text == "" {
        log.Println("Markdown text is empty or not provided.")
        return []string{}
    }

    // 按换行符分割，并过滤掉空行
    lines := strings.Split(text, "\n")
    var result []string
    for _, line := range lines {
        if trimmed := strings.TrimSpace(line); trimmed != "" {
            // 只过滤真正的标题行，保留所有包含冒号的键值对
            if !isRedundantTitleLine(trimmed) {
                result = append(result, trimmed)
            }
        }
    }

    log.Println("Extracted lines from markdown text:")
    for _, line := range result {
        log.Println(line)
    }

    return result
}

// extractDataSource 从消息内容中提取数据源信息
func extractDataSource(lines []string) string {
    for _, line := range lines {
        key, value := cleanInputLine(line)
        if key == "数据源" && value != "" {
            log.Printf("Found data source: %s", value)
            return value
        }
    }
    log.Println("Data source not found in message")
    return ""
}

// findWebhookConfig 根据数据源名称查找对应的webhook配置
func findWebhookConfig(dataSourceName string) *WebhookConfig {
    if AppConfig == nil || len(AppConfig.Webhooks) == 0 {
        log.Println("No webhook configurations available")
        return nil
    }

    // 遍历所有webhook配置，查找数据源是否在该webhook的数据源列表中
    for _, webhook := range AppConfig.Webhooks {
        for _, ds := range webhook.DataSources {
            if ds == dataSourceName {
                log.Printf("Found matching webhook '%s' for data source: %s", webhook.Name, dataSourceName)
                return &webhook
            }
        }
    }

    log.Printf("No matching webhook found for data source: %s", dataSourceName)
    return nil
}

// isRedundantTitleLine 判断是否为冗余的标题行
func isRedundantTitleLine(line string) bool {
    redundantTitles := []string{
        "Yearning 工单通知",
        "## Yearning工单通知",
        "# Yearning工单通知",
        "Yearning工单通知",
    }
    
    for _, title := range redundantTitles {
        if strings.TrimSpace(line) == strings.TrimSpace(title) {
            return true
        }
    }
    return false
}

// getStatusEmoji 根据状态返回对应的emoji
func getStatusEmoji(status string) string {
    switch {
    case strings.Contains(status, "已提交"):
        return "📤"
    case strings.Contains(status, "已审核"):
        return "✅"
    case strings.Contains(status, "已执行"):
        return "🚀"
    case strings.Contains(status, "已驳回"):
        return "❌"
    case strings.Contains(status, "已转交"):
        return "↪️"
    case strings.Contains(status, "待处理"):
        return "⏳"
    default:
        return "📋"
    }
}

// cleanInputLine 清理输入行，去除多余的*号和空格
func cleanInputLine(line string) (string, string) {
    // 去除行首的•和空格
    cleanedLine := strings.TrimSpace(strings.TrimPrefix(line, "•"))
    
    // 使用正则表达式匹配键值对
    re := regexp.MustCompile(`([^:]+):\s*(.+)`)
    matches := re.FindStringSubmatch(cleanedLine)
    
    if len(matches) == 3 {
        key := strings.TrimSpace(matches[1])
        value := strings.TrimSpace(matches[2])
        
        // 去除key中的*号
        key = strings.Trim(key, "*")
        key = strings.TrimSpace(key)
        
        // 去除value中的*号
        value = strings.Trim(value, "*")
        value = strings.TrimSpace(value)
        
        return key, value
    }
    
    return "", cleanedLine
}

// getBeijingTime 获取北京时间（UTC+8）
func getBeijingTime() string {
    // 设置时区为北京时间
    beijingLocation, err := time.LoadLocation("Asia/Shanghai")
    if err != nil {
        // 如果加载时区失败，使用 UTC+8
        beijingLocation = time.FixedZone("CST", 8*60*60)
    }
    
    now := time.Now().In(beijingLocation)
    return now.Format("2006-01-02 15:04:05")
}

// formatNotificationContent 格式化通知内容
func formatNotificationContent(lines []string) string {
    var formattedLines []string
    
    // 添加北京时间信息（加粗）
    beijingTime := getBeijingTime()
    formattedLines = append(formattedLines, fmt.Sprintf("🕐 **通知时间**: %s", beijingTime))
    
    for _, line := range lines {
        key, value := cleanInputLine(line)
        
        if key != "" && value != "" {
            // 为不同字段添加emoji和格式，字段名加粗
            switch key {
            case "工单编号":
                // 移除开头和结尾的 ` 符号
                cleanValue := strings.Trim(value, "`")
                formattedLines = append(formattedLines, fmt.Sprintf("📄 **%s**: %s", key, cleanValue))
            case "数据源":
                formattedLines = append(formattedLines, fmt.Sprintf("🗄️ **%s**: %s", key, value))
            case "工单说明":
                formattedLines = append(formattedLines, fmt.Sprintf("📝 **%s**: %s", key, value))
            case "提交人员":
                formattedLines = append(formattedLines, fmt.Sprintf("👤 **%s**: %s", key, value))
            case "下一步操作人":
                formattedLines = append(formattedLines, fmt.Sprintf("➡️ **%s**: %s", key, value))
            case "平台地址":
                // 直接显示域名，不显示为链接
                formattedLines = append(formattedLines, fmt.Sprintf("🌐 **%s**: %s", key, value))
            case "状态":
                // 根据状态显示不同的emoji，状态值也加粗
                statusEmoji := getStatusEmoji(value)
                formattedLines = append(formattedLines, fmt.Sprintf("%s **%s**: **%s**", statusEmoji, key, value))
            default:
                formattedLines = append(formattedLines, fmt.Sprintf("• **%s**: %s", key, value))
            }
        } else {
            // 如果无法解析为键值对，直接显示原始内容
            formattedLines = append(formattedLines, fmt.Sprintf("• %s", line))
        }
    }
    
    return strings.Join(formattedLines, "\n")
}

// sendFeishuNotification 发送通知到飞书（修复签名问题）
func sendFeishuNotification(lines []string, webhookConfig *WebhookConfig) {
    if webhookConfig == nil {
        log.Println("No webhook configuration provided")
        return
    }

    // 使用秒级时间戳
    timestamp := time.Now().Unix()
    
    // 检查是否需要签名
    var signature string
    if webhookConfig.Secret != "" {
        signature = calculateFeishuSignature(webhookConfig.Secret, timestamp)
        log.Printf("Using signature for secure webhook")
    } else {
        log.Printf("No secret provided, sending without signature")
    }

    // 重新格式化消息内容
    formattedContent := formatNotificationContent(lines)

    // 构建请求数据
    sendData := map[string]interface{}{
        "msg_type": "interactive",
        "card": map[string]interface{}{
            "config": map[string]interface{}{
                "wide_screen_mode": true,
            },
            "elements": []map[string]interface{}{
                {
                    "tag": "div",
                    "text": map[string]interface{}{
                        "tag":     "lark_md",
                        "content": formattedContent,
                    },
                },
            },
            "header": map[string]interface{}{
                "template": "blue",
                "title": map[string]interface{}{
                    "content": "📋 Yearning 工单通知",
                    "tag":     "plain_text",
                },
            },
        },
    }

    // 如果启用了安全校验，添加timestamp和sign字段
    if webhookConfig.Secret != "" {
        sendData["timestamp"] = strconv.FormatInt(timestamp, 10)
        sendData["sign"] = signature
    }

    jsonData, err := json.Marshal(sendData)
    if err != nil {
        log.Printf("Error marshaling JSON: %v", err)
        return
    }

    log.Printf("Sending to webhook: %s", webhookConfig.Name)
    log.Printf("Webhook URL: %s", webhookConfig.WebhookURL)
    log.Printf("Timestamp: %d", timestamp)
    if webhookConfig.Secret != "" {
        log.Printf("Signature: %s", signature)
    }
    log.Printf("Request Body: %s", string(jsonData))

    // 发送请求
    resp, err := http.Post(webhookConfig.WebhookURL, "application/json", strings.NewReader(string(jsonData)))
    if err != nil {
        log.Printf("Error sending request: %v", err)
        return
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Printf("Error reading response: %v", err)
        return
    }

    log.Printf("Response Status: %d", resp.StatusCode)
    log.Printf("Response Body: %s", string(body))

    if resp.StatusCode == 200 {
        log.Printf("Notification sent successfully to webhook: %s", webhookConfig.Name)
    } else {
        log.Printf("Failed to send notification to webhook %s. Status code: %d, Response: %s", 
            webhookConfig.Name, resp.StatusCode, string(body))
    }
}

// handleYearningNotification 处理接收到的 Yearning 通知
func handleYearningNotification(c *gin.Context) {
    var data map[string]interface{}

    if err := c.BindJSON(&data); err != nil {
        log.Printf("Invalid request: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    jsonData, _ := json.MarshalIndent(data, "", "  ")
    log.Printf("Received Body: %s", string(jsonData))

    // 提取 markdown 的 text 字段并逐行处理
    lines := extractMarkdownText(data)
    
    // 提取数据源信息
    dataSourceName := extractDataSource(lines)
    
    // 根据数据源查找对应的webhook配置
    var webhookConfig *WebhookConfig
    if dataSourceName != "" {
        webhookConfig = findWebhookConfig(dataSourceName)
    }
    
    // 如果没有找到对应的webhook配置，使用默认配置
    if webhookConfig == nil {
        log.Println("Using default feishu configuration")
        if AppConfig != nil {
            webhookConfig = &WebhookConfig{
                Name:       "default",
                WebhookURL: AppConfig.Feishu.WebhookURL,
                Secret:     AppConfig.Feishu.Secret,
            }
        } else {
            log.Println("No configuration available")
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration not available"})
            return
        }
    }

    // 发送提取内容到对应的飞书群
    sendFeishuNotification(lines, webhookConfig)

    c.JSON(http.StatusOK, gin.H{"message": "Notification processed."})
}

func main() {
    // 初始化配置
    InitConfig()

    // 设置Gin模式
    gin.SetMode(AppConfig.Server.Mode)
    
    router := gin.Default()
    
    // 同时支持根路径和/webhook/yearning路径
    router.POST("/", handleYearningNotification)
    router.POST("/webhook/yearning", handleYearningNotification)

    port := fmt.Sprintf(":%d", AppConfig.Server.Port)
    log.Printf("Server starting on %s", port)
    
    if err := router.Run(port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}

```



### Dockerfile内容

```dockerfile
# =========================
# 构建阶段
# =========================
FROM golang:1.25-alpine3.22 AS builder

# 设置 Go 模块代理加速
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=off

# 设置工作目录
WORKDIR /app

# 复制 go.mod 和 go.sum 文件（利用缓存）
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -o send-feishu-webhook .

# =========================
# 运行阶段
# =========================
FROM alpine:3.18

# 安装 CA 证书（用于 HTTPS 请求）
RUN apk --no-cache add ca-certificates

# 创建非 root 用户
RUN adduser -D -g '' appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件和配置文件
COPY --from=builder /app/send-feishu-webhook .
COPY --from=builder /app/config.yaml .

# 设置权限
RUN chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["./send-feishu-webhook"]
```



### docker compose内容

```yaml
services:
  send-feishu-webhook:
    image: xxx/send-feishu-webhook:v1
    ports:
      - "5000:5000"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    restart: always
    hostname: send-feishu-webhook
    container_name: send-feishu-webhook
    networks:
      - send-feishu-webhook

networks:
  send-feishu-webhook:
    driver: bridge
```



### 通知效果

![iShot_2025-10-10_15.36.50](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2025-10-10_15.36.50.png)





## 配置企业微信webhook通知

### 目录内容

```shell
$ tree send-qiyewechat-webhook/
send-qiyewechat-webhook/
├── config.yaml
├── docker-compose.yaml
├── Dockerfile
├── go.mod
├── go.sum
└── send-qiyewechat-webhook.go

1 directory, 6 files
```





### 配置文件 `config.yaml`

:::tip 说明

- 支持webhook安全校验
- 根据不同数据源发送消息到不同webhook 
- 开头的配置是作为**默认配置**，当工单的数据源没有在任何webhook组中匹配到时或者不需要使用匹配数据源功能时使用

:::

```yaml
wechat:
  # 企业微信默认群
  webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
  secret: "YOUR_DEFAULT_SECRET"

server:
  port: 5000
  mode: "release"

webhooks:
  ###################################################### ai ######################################################
  - name: "ai"
    data_sources:
      - "airobot"
      - "aiteacher"
    webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    secret: "AI_TEAM_SECRET"

  ###################################################### game ######################################################
  - name: "game"
    data_sources:
      - "gameaaa"
      - "gamebbb"
    webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    secret: "GAME_TEAM_SECRET"
```





### 程序代码

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
    "regexp"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "gopkg.in/yaml.v3"
)

// Config 配置文件结构体
type Config struct {
    WeCom     WeComConfig      `yaml:"wechat"`
    Server    ServerConfig     `yaml:"server"`
    Webhooks  []WebhookConfig  `yaml:"webhooks"`
}

type WeComConfig struct {
    WebhookURL string `yaml:"webhook_url"`
    Secret     string `yaml:"secret"`
}

type ServerConfig struct {
    Port int    `yaml:"port"`
    Mode string `yaml:"mode"`
}

type WebhookConfig struct {
    Name        string   `yaml:"name"`        // webhook名称标识
    DataSources []string `yaml:"data_sources"` // 该webhook对应的数据源列表
    WebhookURL  string   `yaml:"webhook_url"`  // 企业微信webhook地址
    Secret      string   `yaml:"secret"`       // 签名密钥
}

// 全局配置变量
var AppConfig *Config

// LoadConfig 加载配置文件
func LoadConfig(configPath string) (*Config, error) {
    config := &Config{}

    file, err := os.Open(configPath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    decoder := yaml.NewDecoder(file)
    if err := decoder.Decode(config); err != nil {
        return nil, err
    }

    return config, nil
}

// InitConfig 初始化配置
func InitConfig() {
    configPath := "config.yaml"
    if path := os.Getenv("CONFIG_PATH"); path != "" {
        configPath = path
    }

    config, err := LoadConfig(configPath)
    if err != nil {
        log.Fatalf("Error loading config: %v", err)
    }

    AppConfig = config
    log.Printf("Configuration loaded successfully from %s", configPath)
    log.Printf("Loaded %d webhook configurations", len(config.Webhooks))
    
    // 打印webhook配置信息
    for _, webhook := range config.Webhooks {
        log.Printf("Webhook '%s' handles data sources: %v", 
            webhook.Name, webhook.DataSources)
    }
}

// calculateWeComSignature 计算企业微信webhook签名
func calculateWeComSignature(secret string, timestamp int64) string {
    // 企业微信签名规则：将timestamp+"\n"+密钥当做签名字符串
    stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
    
    log.Printf("String to sign: %q", stringToSign)
    
    // 使用HMAC-SHA256算法计算签名
    h := hmac.New(sha256.New, []byte(stringToSign))
    h.Write([]byte(""))
    
    // 对结果进行Base64编码
    signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
    
    log.Printf("Calculated signature: %s", signature)
    return signature
}

// extractMarkdownText 提取并分行处理 markdown 的 text 字段
func extractMarkdownText(data map[string]interface{}) []string {
    markdown, ok := data["markdown"].(map[string]interface{})
    if !ok {
        log.Println("Markdown field not found or invalid")
        return []string{}
    }

    text, ok := markdown["text"].(string)
    if !ok || text == "" {
        log.Println("Markdown text is empty or not provided.")
        return []string{}
    }

    // 按换行符分割，并过滤掉空行
    lines := strings.Split(text, "\n")
    var result []string
    for _, line := range lines {
        if trimmed := strings.TrimSpace(line); trimmed != "" {
            // 只过滤真正的标题行，保留所有包含冒号的键值对
            if !isRedundantTitleLine(trimmed) {
                result = append(result, trimmed)
            }
        }
    }

    log.Println("Extracted lines from markdown text:")
    for _, line := range result {
        log.Println(line)
    }

    return result
}

// extractDataSource 从消息内容中提取数据源信息
func extractDataSource(lines []string) string {
    for _, line := range lines {
        key, value := cleanInputLine(line)
        if key == "数据源" && value != "" {
            log.Printf("Found data source: %s", value)
            return value
        }
    }
    log.Println("Data source not found in message")
    return ""
}

// findWebhookConfig 根据数据源名称查找对应的webhook配置
func findWebhookConfig(dataSourceName string) *WebhookConfig {
    if AppConfig == nil || len(AppConfig.Webhooks) == 0 {
        log.Println("No webhook configurations available")
        return nil
    }

    // 遍历所有webhook配置，查找数据源是否在该webhook的数据源列表中
    for _, webhook := range AppConfig.Webhooks {
        for _, ds := range webhook.DataSources {
            if ds == dataSourceName {
                log.Printf("Found matching webhook '%s' for data source: %s", webhook.Name, dataSourceName)
                return &webhook
            }
        }
    }

    log.Printf("No matching webhook found for data source: %s", dataSourceName)
    return nil
}

// isRedundantTitleLine 判断是否为冗余的标题行
func isRedundantTitleLine(line string) bool {
    redundantTitles := []string{
        "Yearning 工单通知",
        "## Yearning工单通知",
        "# Yearning工单通知",
        "Yearning工单通知",
    }
    
    for _, title := range redundantTitles {
        if strings.TrimSpace(line) == strings.TrimSpace(title) {
            return true
        }
    }
    return false
}

// getStatusEmoji 根据状态返回对应的emoji
func getStatusEmoji(status string) string {
    switch {
    case strings.Contains(status, "已提交"):
        return "📤"
    case strings.Contains(status, "已审核"):
        return "✅"
    case strings.Contains(status, "已执行"):
        return "🚀"
    case strings.Contains(status, "已驳回"):
        return "❌"
    case strings.Contains(status, "已转交"):
        return "↪️"
    case strings.Contains(status, "待处理"):
        return "⏳"
    default:
        return "📋"
    }
}

// cleanInputLine 清理输入行，去除多余的*号和空格
func cleanInputLine(line string) (string, string) {
    // 去除行首的•和空格
    cleanedLine := strings.TrimSpace(strings.TrimPrefix(line, "•"))
    
    // 使用正则表达式匹配键值对
    re := regexp.MustCompile(`([^:]+):\s*(.+)`)
    matches := re.FindStringSubmatch(cleanedLine)
    
    if len(matches) == 3 {
        key := strings.TrimSpace(matches[1])
        value := strings.TrimSpace(matches[2])
        
        // 去除key中的*号
        key = strings.Trim(key, "*")
        key = strings.TrimSpace(key)
        
        // 去除value中的*号
        value = strings.Trim(value, "*")
        value = strings.TrimSpace(value)
        
        return key, value
    }
    
    return "", cleanedLine
}

// getBeijingTime 获取北京时间（UTC+8）
func getBeijingTime() string {
    // 设置时区为北京时间
    beijingLocation, err := time.LoadLocation("Asia/Shanghai")
    if err != nil {
        // 如果加载时区失败，使用 UTC+8
        beijingLocation = time.FixedZone("CST", 8*60*60)
    }
    
    now := time.Now().In(beijingLocation)
    return now.Format("2006-01-02 15:04:05")
}

// formatNotificationContent 格式化通知内容 - 企业微信Markdown格式
func formatNotificationContent(lines []string) string {
    var formattedLines []string
    
    // 添加标题和北京时间信息
    formattedLines = append(formattedLines, "## 📋 Yearning 工单通知")
    formattedLines = append(formattedLines, "")
    beijingTime := getBeijingTime()
    formattedLines = append(formattedLines, fmt.Sprintf("**🕐 通知时间**: %s", beijingTime))
    formattedLines = append(formattedLines, "")
    
    for _, line := range lines {
        key, value := cleanInputLine(line)
        
        if key != "" && value != "" {
            // 为不同字段添加emoji和格式
            switch key {
            case "工单编号":
                cleanValue := strings.Trim(value, "`")
                formattedLines = append(formattedLines, fmt.Sprintf("**📄 %s**: %s", key, cleanValue))
            case "数据源":
                formattedLines = append(formattedLines, fmt.Sprintf("**🗄️ %s**: %s", key, value))
            case "工单说明":
                formattedLines = append(formattedLines, fmt.Sprintf("**📝 %s**: %s", key, value))
            case "提交人员":
                formattedLines = append(formattedLines, fmt.Sprintf("**👤 %s**: %s", key, value))
            case "下一步操作人":
                formattedLines = append(formattedLines, fmt.Sprintf("**➡️ %s**: %s", key, value))
            case "平台地址":
                formattedLines = append(formattedLines, fmt.Sprintf("**🌐 %s**: %s", key, value))
            case "状态":
                statusEmoji := getStatusEmoji(value)
                formattedLines = append(formattedLines, fmt.Sprintf("**%s %s**: <font color=\"warning\">%s</font>", statusEmoji, key, value))
            default:
                formattedLines = append(formattedLines, fmt.Sprintf("**• %s**: %s", key, value))
            }
        } else {
            // 如果无法解析为键值对，直接显示原始内容
            formattedLines = append(formattedLines, fmt.Sprintf("• %s", line))
        }
    }
    
    return strings.Join(formattedLines, "\n")
}

// sendWeComNotification 发送通知到企业微信
func sendWeComNotification(lines []string, webhookConfig *WebhookConfig) {
    if webhookConfig == nil {
        log.Println("No webhook configuration provided")
        return
    }

    // 使用秒级时间戳
    timestamp := time.Now().Unix()
    
    // 构建webhook URL（企业微信需要将签名参数放在URL中）
    webhookURL := webhookConfig.WebhookURL
    
    // 如果启用了安全校验，添加timestamp和sign参数到URL
    if webhookConfig.Secret != "" {
        signature := calculateWeComSignature(webhookConfig.Secret, timestamp)
        webhookURL = fmt.Sprintf("%s&timestamp=%d&sign=%s", 
            webhookConfig.WebhookURL, timestamp, signature)
        log.Printf("Using signature for secure webhook")
    } else {
        log.Printf("No secret provided, sending without signature")
    }

    // 重新格式化消息内容
    formattedContent := formatNotificationContent(lines)

    // 构建请求数据 - 企业微信markdown消息格式
    sendData := map[string]interface{}{
        "msgtype": "markdown",
        "markdown": map[string]interface{}{
            "content": formattedContent,
        },
    }

    jsonData, err := json.Marshal(sendData)
    if err != nil {
        log.Printf("Error marshaling JSON: %v", err)
        return
    }

    log.Printf("Sending to webhook: %s", webhookConfig.Name)
    log.Printf("Webhook URL: %s", webhookURL)
    log.Printf("Timestamp: %d", timestamp)
    log.Printf("Request Body: %s", string(jsonData))

    // 发送请求
    resp, err := http.Post(webhookURL, "application/json", strings.NewReader(string(jsonData)))
    if err != nil {
        log.Printf("Error sending request: %v", err)
        return
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Printf("Error reading response: %v", err)
        return
    }

    log.Printf("Response Status: %d", resp.StatusCode)
    log.Printf("Response Body: %s", string(body))

    // 解析企业微信响应
    var response map[string]interface{}
    if err := json.Unmarshal(body, &response); err == nil {
        if errcode, ok := response["errcode"].(float64); ok {
            if errcode == 0 {
                log.Printf("Notification sent successfully to webhook: %s", webhookConfig.Name)
            } else {
                errmsg := response["errmsg"]
                log.Printf("Failed to send notification to webhook %s. ErrCode: %.0f, ErrMsg: %v", 
                    webhookConfig.Name, errcode, errmsg)
            }
        }
    } else {
        log.Printf("Failed to parse response: %v", err)
    }
}

// handleYearningNotification 处理接收到的 Yearning 通知
func handleYearningNotification(c *gin.Context) {
    var data map[string]interface{}

    if err := c.BindJSON(&data); err != nil {
        log.Printf("Invalid request: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    jsonData, _ := json.MarshalIndent(data, "", "  ")
    log.Printf("Received Body: %s", string(jsonData))

    // 提取 markdown 的 text 字段并逐行处理
    lines := extractMarkdownText(data)
    
    // 提取数据源信息
    dataSourceName := extractDataSource(lines)
    
    // 根据数据源查找对应的webhook配置
    var webhookConfig *WebhookConfig
    if dataSourceName != "" {
        webhookConfig = findWebhookConfig(dataSourceName)
    }
    
    // 如果没有找到对应的webhook配置，使用默认配置
    if webhookConfig == nil {
        log.Println("Using default wechat configuration")
        if AppConfig != nil {
            webhookConfig = &WebhookConfig{
                Name:       "default",
                WebhookURL: AppConfig.WeCom.WebhookURL,
                Secret:     AppConfig.WeCom.Secret,
            }
        } else {
            log.Println("No configuration available")
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration not available"})
            return
        }
    }

    // 发送提取内容到对应的企业微信群
    sendWeComNotification(lines, webhookConfig)

    c.JSON(http.StatusOK, gin.H{"message": "Notification processed."})
}

func main() {
    // 初始化配置
    InitConfig()

    // 设置Gin模式
    gin.SetMode(AppConfig.Server.Mode)
    
    router := gin.Default()
    
    // 同时支持根路径和/webhook/yearning路径
    router.POST("/", handleYearningNotification)
    router.POST("/webhook/yearning", handleYearningNotification)

    port := fmt.Sprintf(":%d", AppConfig.Server.Port)
    log.Printf("Server starting on %s", port)
    
    if err := router.Run(port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}

```





### Dockerfile内容

```dockerfile
# =========================
# 构建阶段
# =========================
FROM golang:1.25-alpine3.22 AS builder

# 设置 Go 模块代理加速
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=off

# 设置工作目录
WORKDIR /app

# 复制 go.mod 和 go.sum 文件（利用缓存）
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -o send-qiyewechat-webhook .

# =========================
# 运行阶段
# =========================
FROM alpine:3.18

# 安装 CA 证书（用于 HTTPS 请求）
RUN apk --no-cache add ca-certificates

# 创建非 root 用户
RUN adduser -D -g '' appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件和配置文件
COPY --from=builder /app/send-qiyewechat-webhook .
COPY --from=builder /app/config.yaml .

# 设置权限
RUN chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["./send-qiyewechat-webhook"]
```



### docker compose内容

```yaml
services:
  send-qiyewechat-webhook:
    image: xxx/send-qiyewechat-webhook:v1
    ports:
      - "5000:5000"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    restart: always
    hostname: send-qiyewechat-webhook
    container_name: send-qiyewechat-webhook
    networks:
      - send-qiyewechat-webhook

networks:
  send-qiyewechat-webhook:
    driver: bridge
```



### 通知效果

![iShot_2025-10-10_15.17.30](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2025-10-10_15.17.30.png)





## 配置钉钉webhook通知

### 目录内容

```shell
$ tree send-dingtalk-webhook/
send-dingtalk-webhook/
├── config.yaml
├── docker-compose.yaml
├── Dockerfile
├── go.mod
├── go.sum
└── send-dingtalk-webhook.go

1 directory, 6 files
```



### 配置文件 `config.yaml`

:::tip 说明

- 支持webhook安全校验
- 根据不同数据源发送消息到不同webhook 
- 开头的配置是作为**默认配置**，当工单的数据源没有在任何webhook组中匹配到时或者不需要使用匹配数据源功能时使用

:::

```yaml
dingtalk:
  # 钉钉默认群
  webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=YOUR_DEFAULT_TOKEN"
  secret: "YOUR_DEFAULT_SECRET"

server:
  port: 5000
  mode: "release"

webhooks:
  ###################################################### ai ######################################################
  - name: "ai"
    data_sources:
      - "airobot"
      - "aiteacher"
    webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=AI_TEAM_TOKEN"
    secret: "AI_TEAM_SECRET"

  ###################################################### game ######################################################
  - name: "game"
    data_sources:
      - "gameaaa"
      - "gamebbb"
    webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=GAME_TEAM_TOKEN"
    secret: "GAME_TEAM_SECRET"
```





### 程序代码

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
    "net/url"
    "os"
    "regexp"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "gopkg.in/yaml.v3"
)

// Config 配置文件结构体
type Config struct {
    DingTalk  DingTalkConfig   `yaml:"dingtalk"`
    Server    ServerConfig     `yaml:"server"`
    Webhooks  []WebhookConfig  `yaml:"webhooks"`
}

type DingTalkConfig struct {
    WebhookURL string `yaml:"webhook_url"`
    Secret     string `yaml:"secret"`
}

type ServerConfig struct {
    Port int    `yaml:"port"`
    Mode string `yaml:"mode"`
}

type WebhookConfig struct {
    Name        string   `yaml:"name"`        // webhook名称标识
    DataSources []string `yaml:"data_sources"` // 该webhook对应的数据源列表
    WebhookURL  string   `yaml:"webhook_url"`  // 钉钉webhook地址
    Secret      string   `yaml:"secret"`       // 签名密钥
}

// 全局配置变量
var AppConfig *Config

// LoadConfig 加载配置文件
func LoadConfig(configPath string) (*Config, error) {
    config := &Config{}

    file, err := os.Open(configPath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    decoder := yaml.NewDecoder(file)
    if err := decoder.Decode(config); err != nil {
        return nil, err
    }

    return config, nil
}

// InitConfig 初始化配置
func InitConfig() {
    configPath := "config.yaml"
    if path := os.Getenv("CONFIG_PATH"); path != "" {
        configPath = path
    }

    config, err := LoadConfig(configPath)
    if err != nil {
        log.Fatalf("Error loading config: %v", err)
    }

    AppConfig = config
    log.Printf("Configuration loaded successfully from %s", configPath)
    log.Printf("Loaded %d webhook configurations", len(config.Webhooks))
    
    // 检查默认配置
    if config.DingTalk.WebhookURL == "" {
        log.Printf("WARNING: Default dingtalk webhook_url is empty")
    }
    
    // 打印webhook配置信息
    for _, webhook := range config.Webhooks {
        log.Printf("Webhook '%s' handles data sources: %v", 
            webhook.Name, webhook.DataSources)
    }
}

// calculateDingTalkSignature 计算钉钉webhook签名
func calculateDingTalkSignature(secret string, timestamp int64) string {
    // 钉钉签名规则：timestamp + "\n" + secret
    stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
    
    log.Printf("String to sign: %q", stringToSign)
    
    // 使用HMAC-SHA256算法计算签名
    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(stringToSign))
    
    // 对结果进行Base64编码
    signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
    
    log.Printf("Calculated signature: %s", signature)
    return signature
}

// extractMarkdownText 提取并分行处理 markdown 的 text 字段
func extractMarkdownText(data map[string]interface{}) []string {
    markdown, ok := data["markdown"].(map[string]interface{})
    if !ok {
        log.Println("Markdown field not found or invalid")
        return []string{}
    }

    text, ok := markdown["text"].(string)
    if !ok || text == "" {
        log.Println("Markdown text is empty or not provided.")
        return []string{}
    }

    // 按换行符分割，并过滤掉空行
    lines := strings.Split(text, "\n")
    var result []string
    for _, line := range lines {
        if trimmed := strings.TrimSpace(line); trimmed != "" {
            // 只过滤真正的标题行，保留所有包含冒号的键值对
            if !isRedundantTitleLine(trimmed) {
                result = append(result, trimmed)
            }
        }
    }

    log.Println("Extracted lines from markdown text:")
    for _, line := range result {
        log.Println(line)
    }

    return result
}

// extractDataSource 从消息内容中提取数据源信息
func extractDataSource(lines []string) string {
    for _, line := range lines {
        key, value := cleanInputLine(line)
        if key == "数据源" && value != "" {
            log.Printf("Found data source: %s", value)
            return value
        }
    }
    log.Println("Data source not found in message")
    return ""
}

// findWebhookConfig 根据数据源名称查找对应的webhook配置
func findWebhookConfig(dataSourceName string) *WebhookConfig {
    if AppConfig == nil || len(AppConfig.Webhooks) == 0 {
        log.Println("No webhook configurations available")
        return nil
    }

    // 遍历所有webhook配置，查找数据源是否在该webhook的数据源列表中
    for _, webhook := range AppConfig.Webhooks {
        for _, ds := range webhook.DataSources {
            if ds == dataSourceName {
                log.Printf("Found matching webhook '%s' for data source: %s", webhook.Name, dataSourceName)
                return &webhook
            }
        }
    }

    log.Printf("No matching webhook found for data source: %s", dataSourceName)
    return nil
}

// isRedundantTitleLine 判断是否为冗余的标题行
func isRedundantTitleLine(line string) bool {
    redundantTitles := []string{
        "Yearning 工单通知",
        "## Yearning工单通知",
        "# Yearning工单通知",
        "Yearning工单通知",
    }
    
    for _, title := range redundantTitles {
        if strings.TrimSpace(line) == strings.TrimSpace(title) {
            return true
        }
    }
    return false
}

// getStatusEmoji 根据状态返回对应的emoji
func getStatusEmoji(status string) string {
    switch {
    case strings.Contains(status, "已提交"):
        return "📤"
    case strings.Contains(status, "已审核"):
        return "✅"
    case strings.Contains(status, "已执行"):
        return "🚀"
    case strings.Contains(status, "已驳回"):
        return "❌"
    case strings.Contains(status, "已转交"):
        return "↪️"
    case strings.Contains(status, "待处理"):
        return "⏳"
    case strings.Contains(status, "已撤销"):
        return "🗑️"
    default:
        return "📋"
    }
}

// cleanInputLine 清理输入行，去除多余的*号和空格
func cleanInputLine(line string) (string, string) {
    // 去除行首的•和空格
    cleanedLine := strings.TrimSpace(strings.TrimPrefix(line, "•"))
    
    // 使用正则表达式匹配键值对
    re := regexp.MustCompile(`([^:]+):\s*(.+)`)
    matches := re.FindStringSubmatch(cleanedLine)
    
    if len(matches) == 3 {
        key := strings.TrimSpace(matches[1])
        value := strings.TrimSpace(matches[2])
        
        // 去除key中的*号
        key = strings.Trim(key, "*")
        key = strings.TrimSpace(key)
        
        // 去除value中的*号
        value = strings.Trim(value, "*")
        value = strings.TrimSpace(value)
        
        return key, value
    }
    
    return "", cleanedLine
}

// removeHTMLTags 移除HTML标签，只保留纯文本
func removeHTMLTags(text string) string {
    // 移除font标签
    re := regexp.MustCompile(`<font[^>]*>(.*?)</font>`)
    text = re.ReplaceAllString(text, "$1")
    
    // 移除其他HTML标签
    re = regexp.MustCompile(`<[^>]*>`)
    text = re.ReplaceAllString(text, "")
    
    return strings.TrimSpace(text)
}

// getBeijingTime 获取北京时间（UTC+8）
func getBeijingTime() string {
    // 设置时区为北京时间
    beijingLocation, err := time.LoadLocation("Asia/Shanghai")
    if err != nil {
        // 如果加载时区失败，使用 UTC+8
        beijingLocation = time.FixedZone("CST", 8*60*60)
    }
    
    now := time.Now().In(beijingLocation)
    return now.Format("2006-01-02 15:04:05")
}

// formatNotificationContent 格式化通知内容 - 钉钉Markdown格式
func formatNotificationContent(lines []string) string {
    var formattedLines []string
    
    // 添加标题和北京时间信息
    formattedLines = append(formattedLines, "## 📋 Yearning 工单通知")
    formattedLines = append(formattedLines, "")
    beijingTime := getBeijingTime()
    formattedLines = append(formattedLines, fmt.Sprintf("🕐 **通知时间**: %s", beijingTime))
    formattedLines = append(formattedLines, "")
    
    for _, line := range lines {
        key, value := cleanInputLine(line)
        
        if key != "" && value != "" {
            // 移除HTML标签，获取纯文本
            cleanValue := removeHTMLTags(value)
            
            // 为不同字段添加emoji和格式
            switch key {
            case "工单编号":
                formattedLines = append(formattedLines, fmt.Sprintf("📄 **%s**: `%s`", key, cleanValue))
            case "数据源":
                formattedLines = append(formattedLines, fmt.Sprintf("🗄️ **%s**: %s", key, cleanValue))
            case "工单说明":
                formattedLines = append(formattedLines, fmt.Sprintf("📝 **%s**: %s", key, cleanValue))
            case "提交人员":
                formattedLines = append(formattedLines, fmt.Sprintf("👤 **%s**: %s", key, cleanValue))
            case "下一步操作人":
                formattedLines = append(formattedLines, fmt.Sprintf("➡️ **%s**: %s", key, cleanValue))
            case "平台地址":
                // 保留链接格式
                formattedLines = append(formattedLines, fmt.Sprintf("🌐 **%s**: %s", key, value))
            case "状态":
                statusEmoji := getStatusEmoji(cleanValue)
                formattedLines = append(formattedLines, fmt.Sprintf("%s **%s**: **%s**", statusEmoji, key, cleanValue))
            default:
                formattedLines = append(formattedLines, fmt.Sprintf("• **%s**: %s", key, cleanValue))
            }
        } else {
            // 如果无法解析为键值对，直接显示原始内容
            formattedLines = append(formattedLines, fmt.Sprintf("• %s", line))
        }
        formattedLines = append(formattedLines, "") // 空行分隔
    }
    
    return strings.Join(formattedLines, "\n")
}

// sendDingTalkNotification 发送通知到钉钉
func sendDingTalkNotification(lines []string, webhookConfig *WebhookConfig) {
    if webhookConfig == nil {
        log.Println("No webhook configuration provided")
        return
    }

    // 检查webhook URL是否为空
    if webhookConfig.WebhookURL == "" {
        log.Printf("ERROR: Webhook URL is empty for %s", webhookConfig.Name)
        return
    }

    // 使用毫秒级时间戳（钉钉要求）
    timestamp := time.Now().UnixMilli()
    
    // 构建webhook URL（钉钉需要将签名参数放在URL中）
    webhookURL := webhookConfig.WebhookURL
    
    // 如果启用了安全校验，添加timestamp和sign参数到URL
    if webhookConfig.Secret != "" {
        signature := calculateDingTalkSignature(webhookConfig.Secret, timestamp)
        signatureEscaped := url.QueryEscape(signature)
        
        // 检查URL是否已经有参数
        if strings.Contains(webhookURL, "?") {
            webhookURL = fmt.Sprintf("%s&timestamp=%d&sign=%s", webhookURL, timestamp, signatureEscaped)
        } else {
            webhookURL = fmt.Sprintf("%s?timestamp=%d&sign=%s", webhookURL, timestamp, signatureEscaped)
        }
        log.Printf("Using signature for secure webhook")
    } else {
        log.Printf("No secret provided, sending without signature")
    }

    // 重新格式化消息内容
    formattedContent := formatNotificationContent(lines)

    // 构建请求数据 - 钉钉markdown消息格式
    sendData := map[string]interface{}{
        "msgtype": "markdown",
        "markdown": map[string]interface{}{
            "title": "📋 Yearning 工单通知",
            "text":  formattedContent,
        },
        "at": map[string]interface{}{
            "isAtAll": false,
        },
    }

    jsonData, err := json.Marshal(sendData)
    if err != nil {
        log.Printf("Error marshaling JSON: %v", err)
        return
    }

    log.Printf("Sending to webhook: %s", webhookConfig.Name)
    log.Printf("Webhook URL: %s", webhookURL)
    log.Printf("Timestamp: %d", timestamp)
    log.Printf("Request Body: %s", string(jsonData))

    // 发送请求
    req, err := http.NewRequest("POST", webhookURL, strings.NewReader(string(jsonData)))
    if err != nil {
        log.Printf("Error creating request: %v", err)
        return
    }
    req.Header.Set("Content-Type", "application/json;charset=utf-8")

    client := &http.Client{Timeout: 10 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        log.Printf("Error sending request: %v", err)
        return
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Printf("Error reading response: %v", err)
        return
    }

    log.Printf("Response Status: %d", resp.StatusCode)
    log.Printf("Response Body: %s", string(body))

    // 解析钉钉响应
    var response map[string]interface{}
    if err := json.Unmarshal(body, &response); err == nil {
        if errcode, ok := response["errcode"].(float64); ok {
            if errcode == 0 {
                log.Printf("Notification sent successfully to webhook: %s", webhookConfig.Name)
            } else {
                errmsg := response["errmsg"]
                log.Printf("Failed to send notification to webhook %s. ErrCode: %.0f, ErrMsg: %v", 
                    webhookConfig.Name, errcode, errmsg)
            }
        }
    } else {
        log.Printf("Failed to parse response: %v", err)
    }
}

// handleYearningNotification 处理接收到的 Yearning 通知
func handleYearningNotification(c *gin.Context) {
    var data map[string]interface{}

    if err := c.BindJSON(&data); err != nil {
        log.Printf("Invalid request: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    jsonData, _ := json.MarshalIndent(data, "", "  ")
    log.Printf("Received Body: %s", string(jsonData))

    // 提取 markdown 的 text 字段并逐行处理
    lines := extractMarkdownText(data)
    
    // 提取数据源信息
    dataSourceName := extractDataSource(lines)
    
    // 根据数据源查找对应的webhook配置
    var webhookConfig *WebhookConfig
    if dataSourceName != "" {
        webhookConfig = findWebhookConfig(dataSourceName)
    }
    
    // 如果没有找到对应的webhook配置，使用默认配置
    if webhookConfig == nil {
        log.Println("Using default dingtalk configuration")
        if AppConfig != nil && AppConfig.DingTalk.WebhookURL != "" {
            webhookConfig = &WebhookConfig{
                Name:       "default",
                WebhookURL: AppConfig.DingTalk.WebhookURL,
                Secret:     AppConfig.DingTalk.Secret,
            }
        } else {
            log.Println("No configuration available and default webhook_url is empty")
            c.JSON(http.StatusInternalServerError, gin.H{"error": "No valid webhook configuration available"})
            return
        }
    }

    // 发送提取内容到对应的钉钉群
    sendDingTalkNotification(lines, webhookConfig)

    c.JSON(http.StatusOK, gin.H{"message": "Notification processed."})
}

func main() {
    // 初始化配置
    InitConfig()

    // 设置Gin模式
    gin.SetMode(AppConfig.Server.Mode)
    
    router := gin.Default()
    
    // 同时支持根路径和/webhook/yearning路径
    router.POST("/", handleYearningNotification)
    router.POST("/webhook/yearning", handleYearningNotification)

    port := fmt.Sprintf(":%d", AppConfig.Server.Port)
    log.Printf("Server starting on %s", port)
    
    if err := router.Run(port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}

```



### Dockerfile内容

```dockerfile
# =========================
# 构建阶段
# =========================
FROM golang:1.25-alpine3.22 AS builder

# 设置 Go 模块代理加速
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=off

# 设置工作目录
WORKDIR /app

# 复制 go.mod 和 go.sum 文件（利用缓存）
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -o send-dingtalk-webhook .

# =========================
# 运行阶段
# =========================
FROM alpine:3.18

# 安装 CA 证书（用于 HTTPS 请求）
RUN apk --no-cache add ca-certificates

# 创建非 root 用户
RUN adduser -D -g '' appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件和配置文件
COPY --from=builder /app/send-dingtalk-webhook .
COPY --from=builder /app/config.yaml .

# 设置权限
RUN chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["./send-dingtalk-webhook"]
```





### docker compose内容

```yaml
services:
  send-dingtalk-webhook:
    image: xxx/send-dingtalk-webhook:v1
    ports:
      - "5000:5000"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    restart: always
    hostname: send-dingtalk-webhook
    container_name: send-dingtalk-webhook
    networks:
      - send-dingtalk-webhook

networks:
  send-dingtalk-webhook:
    driver: bridge
```



### 通知效果

![iShot_2025-10-10_14.56.38](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2025-10-10_14.56.38.png)