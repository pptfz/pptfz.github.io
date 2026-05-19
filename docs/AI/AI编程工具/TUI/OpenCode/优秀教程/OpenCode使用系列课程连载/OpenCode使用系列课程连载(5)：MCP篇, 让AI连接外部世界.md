---
created: 2026-05-19T11:31:41 (UTC +08:00)
tags: []
source: https://mp.weixin.qq.com/s/yL-afheOMCwI5xtEeo9cLQ
author: 咚哒哒哒哒
---

# OpenCode使用系列课程连载(5)：MCP篇, 让AI连接外部世界

> ## Excerpt
> MCP篇 — 让AI连接外部世界AI现在已经很会说了。写代码、改Bug、聊架构，它都能接得挺顺。可你真让它去"查一下数据库最近10条记录"、"看看浏览器控制台有没有报错"、"找一下这个库的文档怎么用"，它大概率还是只能给建议，自己下不了手。问题就在这：它会说，但还不太会干。上一篇我们讲了Skills，说的是工作流怎么组织。那具体能力从哪来？答案就是这一篇的主角：MCP。01 Skills vs M

---
## MCP篇 — 让AI连接外部世界

![图片](OpenCode%E4%BD%BF%E7%94%A8%E7%B3%BB%E5%88%97%E8%AF%BE%E7%A8%8B%E8%BF%9E%E8%BD%BD(5)%EF%BC%9AMCP%E7%AF%87,%20%E8%AE%A9AI%E8%BF%9E%E6%8E%A5%E5%A4%96%E9%83%A8%E4%B8%96%E7%95%8C/640.png)

AI现在已经很会说了。写代码、改Bug、聊架构，它都能接得挺顺。可你真让它去"查一下数据库最近10条记录"、"看看浏览器控制台有没有报错"、"找一下这个库的文档怎么用"，它大概率还是只能给建议，自己下不了手。

问题就在这：**它会说，但还不太会干。**

上一篇我们讲了`Skills`，说的是工作流怎么组织。那具体能力从哪来？答案就是这一篇的主角：**MCP**。

___

## 01 Skills vs MCP：谁是包，谁是源

![图片](OpenCode%E4%BD%BF%E7%94%A8%E7%B3%BB%E5%88%97%E8%AF%BE%E7%A8%8B%E8%BF%9E%E8%BD%BD(5)%EF%BC%9AMCP%E7%AF%87,%20%E8%AE%A9AI%E8%BF%9E%E6%8E%A5%E5%A4%96%E9%83%A8%E4%B8%96%E7%95%8C/640.1.webp)

**`Skills` = USB主机上的软件**，管"怎么做事"：先干什么、后干什么、什么时候算完成。

**`MCP` = USB接口和设备**，管"能做什么"：查数据库、调试浏览器、搜文档，这些底层能力都来自它。

打个比方就很容易懂了：电脑没USB口，照样能开机、能跑软件，但接不了打印机、U盘、摄像头。OpenCode没MCP也一样，能聊方案，但干不了活。

___

## 02 MCP是什么：AI的USB接口

`MCP`全称`Model Context Protocol`。名字看着像协议文档，实际解决的问题很接地气：让AI能调用外部工具。

没有它，AI只能说："你可以查一下数据库。"或者"你打开DevTools看看。"有了它，AI就能自己去查、去截图、去搜文档。

你不用一上来记协议细节，先记住它最常见的三类能力就够了：

-   **Tools**：执行动作（查数据库、截图浏览器）
    
-   **Resources**：读取数据（读文件、拿日志）
    
-   **Prompts**：预设模板（固定格式查询）
    

___

## 03 MCP怎么装：配置文件三要素

讲到这里，很多人会下意识觉得：哦，那我去装个MCP就行。

还真不是。

MCP这东西，重点不在"装"，而在"接"。你得把它接进OpenCode，AI才能真的调用起来。

配置文件在`~/.config/opencode/opencode.json`，先看最核心的几项：

```json
{
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "environment": {
        "POSTGRES_CONNECTION_STRING": "{env:DATABASE_URL}"
      },
      "enabled": true
    }
  }
}
```

这段配置不用全背，先抓住三个核心字段：

|   字段    |            含义             |
|---------|---------------------------|
|  `type`   | 服务类型：`local`本地执行，`remote`远程连接 |
| `command` |       启动命令，必须是数组格式        |
| `enabled` |        是否启用，默认`true`        |

**常见踩坑**：

-   ❌ `command`写成字符串 `"npx xxx"` → ✓ 必须写成数组 `["npx", "-y", "xxx"]`
    
-   ❌ URL缺少协议 `"example.com/mcp"` → ✓ 必须写完整 `"https://example.com/mcp"`
    
-   ❌ 环境变量直接写值 → ✓ 用 `{env:变量名}` 格式，避免把密码写进配置文件
    

配完后重启OpenCode。右侧如果看到状态是`connected`，说明这条线已经接通了。

这一步的认知切换其实很关键：以前你是在给自己装工具；现在你是在给AI配工具。

___

## 04 实战1：Postgres MCP — 直接查数据库

先看一个最容易感受到价值的场景。

开发调试时，经常只是想看几条数据，结果还得专门开一次数据库客户端。这个场景里，`Postgres MCP`就很顺手。

**配置**：

```perl
{
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "environment": {
        "POSTGRES_CONNECTION_STRING": "{env:DATABASE_URL}"
      }
    }
  }
}
```

环境变量`DATABASE_URL`格式：`postgresql://用户:密码@主机:端口/数据库`

**对话示例**：

```bash
你：查一下users表最近10条记录，按created_at降序排列
```

OpenCode会通过`Postgres MCP`去执行SQL，结果直接回到对话里：

```sql
| id | name | email | created_at |
|----|------|-------|------------|
| 42 | 张三 | zhang@example.com | 2026-04-27 10:30 |
| 41 | 李四 | li@example.com | 2026-04-27 09:15 |
| ... | ... | ... | ... |
```

以前这件事一般要走一遍：打开`pgAdmin`、连库、找表、写SQL、执行、复制结果。现在一句话就够。

___

## 05 实战2：Chrome DevTools MCP — 调试已登录页面

再往前走一步，就是浏览器调试。

这个场景特别实用，尤其是那种已经登录、状态很复杂的页面。你不用重新走登录流程，AI可以直接连当前浏览器会话。

**配置**：

```perl
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "@anthropic-ai/mcp-server-chrome-devtools"]
    }
  }
}
```

**前提**：Chrome浏览器需要开启远程调试模式，启动参数加`--remote-debugging-port=9222`

**对话示例**：

```
你：帮我看看当前页面的网络请求有没有失败的
```

OpenCode会先读Network面板的数据，再把结论整理出来：

```bash
发现2个失败请求：
- /api/users 404 → 路由未注册
- /api/orders 500 → 后端报错，具体日志在控制台

建议检查后端路由配置和日志文件。
```

还可以顺手让它截图：

```
你：截个图，看看页面渲染有没有问题
```

截完图之后，再让它看布局、对齐、响应式这些问题，就比纯口头描述靠谱得多。

___

## 06 实战3：context7 MCP — 快速找文档

第三个场景更高频，几乎每天都会碰到。

写代码时最常见的卡点，不是完全不会写，而是忘了某个库的具体用法。这个时候，`context7`比你自己开浏览器慢慢翻省事得多。

**配置**：

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

**对话示例**：

```javascript
你：Cloudflare Worker怎么缓存JSON响应？
```

OpenCode会通过`context7`去找相关文档，再把关键用法整理出来：

```javascript
MCP篇 — 让AI连接外部世界Cloudflare Worker缓存JSON的方法：

1. 使用Cache API：
const cache = caches.default
const response = new Response(JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json' }
})
await cache.put(request, response)

2. 设置Cache-Control头：
headers: { 'Cache-Control': 'max-age=3600' }

完整示例见官方文档：https://developers.cloudflare.com/workers/examples/caching
```

以前这一步通常是：搜关键词、点进几篇文档、自己找那几行能用的代码。现在可以直接在对话里拿到结果。

___

## 07 常用MCP装机清单

如果你刚开始配`MCP`，不用一上来装一堆。按用途先装最常用的几类就够了：

### 绘图类

-   **Pencil MCP**：画产品原型，通过MCP让AI直接操作画布
    
-   **drawio MCP**：画流程图、架构图，导出PNG/SVG
    

### 浏览器类

-   **Chrome DevTools MCP**：调试已登录页面，截图、分析元素/请求
    
-   **Puppeteer MCP**：自动化抓取、截图、执行脚本
    

### 文档类

-   **context7**：搜索各种库和框架的官方文档
    

### 数据类

-   **Postgres MCP**：直接查询PostgreSQL数据库
    
-   **SQLite MCP**：轻量级数据库操作
    

### 协作类

-   **Slack MCP**：发消息、查频道内容
    

### 其他

-   **filesystem MCP**：沙箱模式文件操作
    
-   **memory MCP**：持久化键值存储
    
-   **gh\_grep MCP**：搜索GitHub代码片段
    

___

## 08 常见问题与排查

|      现象      |      原因       |                    解决                    |
|--------------|---------------|------------------------------------------|
|   MCP工具不出现   |   全局禁用或未启用    |             检查 `enabled: true`             |
| 连接状态显示failed | 命令格式错误或环境变量缺失 |       用 `opencode mcp debug 服务器名` 诊断       |
|  OAuth认证失败   |    Token过期    | `opencode mcp logout && opencode mcp auth` |
|    工具执行超时    |  timeout设置太短  |              默认30秒，复杂任务适当增加              |

调试命令：`opencode mcp debug 服务器名`，查看连接状态、认证信息、HTTP响应。

___

## 结语

说到底，`MCP`最有价值的地方，就是把AI从"会聊天"往前推了一步，推到"能干活"。

以前它更多是在给建议，现在它可以真的去查数据库、调浏览器、找文档、画原型。USB口让电脑能接各种设备，`MCP`让AI能接各种工具。
