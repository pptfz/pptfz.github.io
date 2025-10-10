# yearning配置webhook通知

yearning内置的webhook通知目前只支持钉钉，当然也可以通过程序自定义通知

![iShot_2025-10-09_18.57.17](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-09_18.57.17.png)





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

```yaml
feishu:
  webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  secret: "xxxxxxxxxxxxxxxxxxxxxxx"

server:
  port: 5000
  mode: "release"
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
    Feishu FeishuConfig `yaml:"feishu"`
    Server ServerConfig `yaml:"server"`
}

type FeishuConfig struct {
    WebhookURL string `yaml:"webhook_url"`
    Secret     string `yaml:"secret"`
}

type ServerConfig struct {
    Port int    `yaml:"port"`
    Mode string `yaml:"mode"`
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
}

// calculateSignature 计算签名
func calculateSignature(secret string, timestamp int64) string {
    stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
    hmacCode := hmac.New(sha256.New, []byte(stringToSign))
    hmacCode.Write([]byte(stringToSign))
    signature := base64.StdEncoding.EncodeToString(hmacCode.Sum(nil))
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

// sendFeishuNotification 发送通知到飞书（优化版）
func sendFeishuNotification(lines []string) {
    if AppConfig == nil {
        log.Println("Configuration not initialized")
        return
    }

    timestamp := time.Now().Unix()
    signature := calculateSignature(AppConfig.Feishu.Secret, timestamp)

    // 重新格式化消息内容
    formattedContent := formatNotificationContent(lines)

    sendData := map[string]interface{}{
        "timestamp": timestamp,
        "sign":      signature,
        "msg_type":  "interactive",
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

    jsonData, err := json.Marshal(sendData)
    if err != nil {
        log.Printf("Error marshaling JSON: %v", err)
        return
    }

    log.Printf("Webhook URL: %s", AppConfig.Feishu.WebhookURL)
    log.Printf("Request Body: %s", string(jsonData))

    resp, err := http.Post(AppConfig.Feishu.WebhookURL, "application/json", strings.NewReader(string(jsonData)))
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

    log.Printf("Response: %d %s", resp.StatusCode, string(body))

    if resp.StatusCode == 200 {
        log.Println("Notification sent successfully.")
    } else {
        log.Printf("Failed to send notification. Status code: %d, Response: %s", resp.StatusCode, string(body))
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

    // 发送提取内容到飞书
    sendFeishuNotification(lines)

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

![iShot_2025-10-10_15.36.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-10_15.36.50.png)





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

```yaml
feishu:
  webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  secret: "xxxxxxxxxxxxxxxxxxxxxxx"

server:
  port: 5000
  mode: "release"
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
    WeCom  WeComConfig  `yaml:"wecom"`
    Server ServerConfig `yaml:"server"`
}

type WeComConfig struct {
    WebhookURL string `yaml:"webhook_url"`
    Secret     string `yaml:"secret"`
}

type ServerConfig struct {
    Port int    `yaml:"port"`
    Mode string `yaml:"mode"`
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
}

// calculateWxSignature 计算企业微信签名
func calculateWxSignature(secret string, timestamp int64) string {
    stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(stringToSign))
    return base64.StdEncoding.EncodeToString(mac.Sum(nil))
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

    lines := strings.Split(text, "\n")
    var result []string
    for _, line := range lines {
        if trimmed := strings.TrimSpace(line); trimmed != "" {
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

// isRedundantTitleLine 判断是否为冗余的标题行
func isRedundantTitleLine(line string) bool {
    redundantTitles := []string{
        "Yearning 工单通知",
        "## Yearning工单通知",
        "# Yearning工单通知",
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
    cleanedLine := strings.TrimSpace(strings.TrimPrefix(line, "•"))
    re := regexp.MustCompile(`([^:]+):\s*(.+)`)
    matches := re.FindStringSubmatch(cleanedLine)
    if len(matches) == 3 {
        key := strings.TrimSpace(strings.Trim(matches[1], "*"))
        value := strings.TrimSpace(strings.Trim(matches[2], "*"))
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
    
    // 添加北京时间信息
    beijingTime := getBeijingTime()
    formattedLines = append(formattedLines, fmt.Sprintf("🕐 **通知时间**: %s", beijingTime))
    formattedLines = append(formattedLines, "") // 空行分隔
    
    for _, line := range lines {
        key, value := cleanInputLine(line)
        if key != "" && value != "" {
            switch key {
            case "工单编号":
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
                formattedLines = append(formattedLines, fmt.Sprintf("🌐 **%s**: %s", key, value))
            case "状态":
                statusEmoji := getStatusEmoji(value)
                formattedLines = append(formattedLines, fmt.Sprintf("%s **%s**: **%s**", statusEmoji, key, value))
            default:
                formattedLines = append(formattedLines, fmt.Sprintf("• **%s**: %s", key, value))
            }
        } else {
            formattedLines = append(formattedLines, fmt.Sprintf("• %s", line))
        }
    }
    return strings.Join(formattedLines, "\n")
}

// sendWeComNotification 发送企业微信消息
func sendWeComNotification(lines []string) {
    if AppConfig == nil {
        log.Println("Configuration not initialized")
        return
    }

    timestamp := time.Now().Unix()
    signature := calculateWxSignature(AppConfig.WeCom.Secret, timestamp)
    url := fmt.Sprintf("%s&timestamp=%d&sign=%s", AppConfig.WeCom.WebhookURL, timestamp, signature)

    formattedContent := formatNotificationContent(lines)

    sendData := map[string]interface{}{
        "msgtype": "markdown",
        "markdown": map[string]string{
            "content": formattedContent,
        },
        "at": map[string]interface{}{
            "atMobiles": []string{},
            "isAtAll":   false,
        },
    }

    jsonData, err := json.Marshal(sendData)
    if err != nil {
        log.Printf("Error marshaling JSON: %v", err)
        return
    }

    log.Printf("Webhook URL: %s", url)
    log.Printf("Request Body: %s", string(jsonData))

    resp, err := http.Post(url, "application/json", strings.NewReader(string(jsonData)))
    if err != nil {
        log.Printf("Error sending request: %v", err)
        return
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    log.Printf("Response: %d %s", resp.StatusCode, string(body))
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

    lines := extractMarkdownText(data)
    sendWeComNotification(lines)

    c.JSON(http.StatusOK, gin.H{"message": "Notification processed."})
}

func main() {
    InitConfig()

    gin.SetMode(AppConfig.Server.Mode)
    router := gin.Default()

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

![iShot_2025-10-10_15.17.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-10_15.17.30.png)





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

```yaml
dingtalk:
  webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=你的token"
  secret: "SECxxxxx"
server:
  port: 5000
  mode: release
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

// ==========================
// 配置结构体
// ==========================
type Config struct {
	DingTalk DingTalkConfig `yaml:"dingtalk"`
	Server   ServerConfig   `yaml:"server"`
}

type DingTalkConfig struct {
	WebhookURL string `yaml:"webhook_url"`
	Secret     string `yaml:"secret"`
}

type ServerConfig struct {
	Port int    `yaml:"port"`
	Mode string `yaml:"mode"`
}

var AppConfig *Config

// ==========================
// 配置加载
// ==========================
func LoadConfig(configPath string) (*Config, error) {
	file, err := os.Open(configPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	config := &Config{}
	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(config); err != nil {
		return nil, err
	}
	return config, nil
}

func InitConfig() {
	configPath := "config.yaml"
	if path := os.Getenv("CONFIG_PATH"); path != "" {
		configPath = path
	}

	cfg, err := LoadConfig(configPath)
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}
	AppConfig = cfg
	log.Printf("Configuration loaded successfully from %s", configPath)
}

// ==========================
// 签名计算（钉钉）
// ==========================
func calculateDingTalkSignature(secret string, timestamp int64) string {
	// stringToSign = timestamp + "\n" + secret
	stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(stringToSign))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// ==========================
// Markdown 解析 + 格式化（和你原逻辑一致）
// ==========================
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

	lines := strings.Split(text, "\n")
	var result []string
	for _, line := range lines {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
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

func isRedundantTitleLine(line string) bool {
	redundant := []string{
		"Yearning 工单通知",
		"# Yearning工单通知",
		"## Yearning工单通知",
	}
	for _, t := range redundant {
		if strings.TrimSpace(line) == strings.TrimSpace(t) {
			return true
		}
	}
	return false
}

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

func cleanInputLine(line string) (string, string) {
	cleanedLine := strings.TrimSpace(strings.TrimPrefix(line, "•"))
	re := regexp.MustCompile(`([^:]+):\s*(.+)`)
	matches := re.FindStringSubmatch(cleanedLine)
	if len(matches) == 3 {
		key := strings.TrimSpace(strings.Trim(matches[1], "*"))
		value := strings.TrimSpace(strings.Trim(matches[2], "*"))
		return key, value
	}
	return "", cleanedLine
}

// 获取北京时间
func getBeijingTime() string {
	// 设置时区为北京时间
	beijingLocation, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		// 如果加载时区失败，使用本地时间
		beijingLocation = time.FixedZone("CST", 8*60*60) // UTC+8
	}
	
	now := time.Now().In(beijingLocation)
	return now.Format("2006-01-02 15:04:05")
}

func formatNotificationContent(lines []string) string {
	var formattedLines []string
	
	// 添加北京时间信息到通知内容开头
	beijingTime := getBeijingTime()
	formattedLines = append(formattedLines, fmt.Sprintf("🕐 **通知时间**: %s", beijingTime))
	formattedLines = append(formattedLines, "") // 空行分隔

	for _, line := range lines {
		key, value := cleanInputLine(line)
		if key != "" && value != "" {
			switch key {
			case "工单编号":
				formattedLines = append(formattedLines, fmt.Sprintf("📄 **%s**: %s", key, strings.Trim(value, "`")))
			case "数据源":
				formattedLines = append(formattedLines, fmt.Sprintf("🗄️ **%s**: %s", key, value))
			case "工单说明":
				formattedLines = append(formattedLines, fmt.Sprintf("📝 **%s**: %s", key, value))
			case "提交人员":
				formattedLines = append(formattedLines, fmt.Sprintf("👤 **%s**: %s", key, value))
			case "下一步操作人":
				formattedLines = append(formattedLines, fmt.Sprintf("➡️ **%s**: %s", key, value))
			case "平台地址":
				formattedLines = append(formattedLines, fmt.Sprintf("🌐 **%s**: %s", key, value))
			case "状态":
				emoji := getStatusEmoji(value)
				formattedLines = append(formattedLines, fmt.Sprintf("%s **%s**: **%s**", emoji, key, value))
			default:
				formattedLines = append(formattedLines, fmt.Sprintf("• **%s**: %s", key, value))
			}
		} else {
			formattedLines = append(formattedLines, fmt.Sprintf("• %s", line))
		}
	}
	// 钉钉 markdown 支持 html-like 或 markdown 文本，这里以 markdown 风格为主
	// 合并时保持换行
	return strings.Join(formattedLines, "\n\n")
}

// ==========================
// 发送钉钉通知（修正：对 sign 做 URL Encode，并检查 webhook_url）
// ==========================
func sendDingTalkNotification(lines []string) {
	if AppConfig == nil {
		log.Println("Configuration not initialized")
		return
	}
	// timestamp 要用毫秒
	timestamp := time.Now().UnixMilli()
	sign := calculateDingTalkSignature(AppConfig.DingTalk.Secret, timestamp)
	signEscaped := url.QueryEscape(sign)

	// 确保 webhook_url 包含 access_token 参数（必须）
	base := AppConfig.DingTalk.WebhookURL
	if base == "" {
		log.Println("DingTalk webhook_url is empty in config")
		return
	}

	// 如果 webhook_url 未带 ?access_token=，提醒用户（尽早发现配置错误）
	if !strings.Contains(base, "access_token=") {
		log.Printf("Warning: webhook_url does not contain access_token parameter: %s", base)
		// 仍继续构造 URL（调用方可能已把 token 放在其他位置）
	}

	// 如果已有 ? 则 append & 否则用 ?
	sep := "?"
	if strings.Contains(base, "?") {
		sep = "&"
	}
	fullURL := fmt.Sprintf("%s%stimestamp=%d&sign=%s", base, sep, timestamp, signEscaped)

	content := formatNotificationContent(lines)
	payload := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"title": "Yearning 通知",
			"text":  content,
		},
		"at": map[string]interface{}{
			"isAtAll": false,
		},
	}

	jsonData, _ := json.Marshal(payload)
	log.Printf("DingTalk URL: %s", fullURL)
	log.Printf("Request Body: %s", string(jsonData))

	req, err := http.NewRequest("POST", fullURL, strings.NewReader(string(jsonData)))
	if err != nil {
		log.Printf("Create request error: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json;charset=utf-8")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending request: %v", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	log.Printf("HTTP Status: %d, Body: %s", resp.StatusCode, string(body))

	// 钉钉返回的 JSON 中通常包含 errcode、errmsg
	var respJSON map[string]interface{}
	if err := json.Unmarshal(body, &respJSON); err == nil {
		if code, ok := respJSON["errcode"].(float64); ok && int(code) != 0 {
			log.Printf("DingTalk API error: %v", respJSON)
		}
	}
}

// ==========================
// HTTP Handler & main
// ==========================
func handleYearningNotification(c *gin.Context) {
	var data map[string]interface{}
	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	lines := extractMarkdownText(data)
	sendDingTalkNotification(lines)
	c.JSON(http.StatusOK, gin.H{"message": "Notification processed"})
}

func main() {
	InitConfig()

	gin.SetMode(AppConfig.Server.Mode)
	router := gin.Default()
	router.POST("/webhook/yearning", handleYearningNotification)
        router.POST("/", handleYearningNotification)

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

![iShot_2025-10-10_14.56.38](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-10_14.56.38.png)