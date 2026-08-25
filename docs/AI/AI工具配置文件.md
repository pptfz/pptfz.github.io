# AI工具配置文件

## [hermes-agent](https://github.com/NousResearch/hermes-agent)

[hermes-agent配置环境变量](https://hermes-agent.nousresearch.com/docs/zh-Hans/reference/environment-variables)

配置文件 `~/.hermes/config.yaml`

:::tip 说明

`XXX_API_KEY` 变量的值存放于 `~/.hermes/.env`

:::

```yaml
providers:
  xxx:
    base_url: xxx
    api_key_env: XXX_API_KEY
    api_mode: openai
    models:
```





## [openclaw](https://github.com/openclaw/openclaw)

[openclaw配置环境变量](https://docs.openclaw.ai/zh-CN/help/environment/)

配置文件 `~/.openclaw/openclaw.json`

:::tip 说明

`XXX_API_KEY` 变量的值存放于 `~/.zshrc.local` ，在 `~/.zshrc` 中通过 `[ -f $HOME/.zshrc.local ] && source $HOME/.zshrc.local` 引用，也可以将变量的值存放于 `~/.zshrc` 

:::

```json
"models": {
    "mode": "merge",
    "providers": {
      "xxx": {
        "baseUrl": "xxx",
        "apiKey": {
          "source": "env",
          "provider": "default",
          "id": "XXX_API_KEY"
        },
```





## [opencode](https://github.com/anomalyco/opencode)

[opencode配置环境变量](https://opencode.ai/docs/zh-cn/config/#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

配置文件 `~/.config/opencode/opencode.json` 

```json
"provider": {
    "xxx": {
      "models": {
        "codex-auto-review": { "name": "codex-auto-review" },
        "gpt-5.6-terra": { "name": "gpt-5.6-terra" },
        "gpt-5.6": { "name": "gpt-5.6" },
},
        "doubao-seed-evolving": { "name": "doubao-seed-evolving" },
        "doubao-seed-2-0-lite-260215": { "name": "doubao-seed-2-0-lite-260215" }
      },
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "apiKey": "{env:xxx_APIKEY}",
        "baseURL": "{env:xxx_BASEURL}"
      }
    },
```





## [codex](https://github.com/openai/codex)

[codex配置环境变量](https://learn.chatgpt.com/docs/config-file/environment-variables)

配置文件 `~/.codex/config.toml`

```toml
[model_providers.xxx]
base_url = "xxx"
env_key = "xxx_APIKEY"
name = "xxx"
wire_api = "responses"
```



## [claude-code](https://github.com/anthropics/claude-code)

[claude-code配置环境变量](https://code.claude.com/docs/zh-CN/settings#environment-variables)

配置文件 `~/.claude/config.json`

:::tip 说明

环境变量（~/.zshrc.local）

| 变量名                 | 作用                                                         | 当前值                     |
| ---------------------- | ------------------------------------------------------------ | -------------------------- |
| `ANTHROPIC_BASE_URL`   | Claude API 地址，覆盖默认的官方 `api.anthropic.com`          | `xxx`                      |
| `ANTHROPIC_API_KEY`    | Anthropic 官方标准密钥（直连官方用），格式 `sk-ant-...`      | 未设（走网关时不用）       |
| `ANTHROPIC_AUTH_TOKEN` | Claude Code 专属密钥，网关/企业代理/OAuth 场景用，请求时放 HTTP 头 | xxx 网关 key（sk-c- 开头） |



settings.json（~/.claude/settings.json）

| 变量名                                     | 作用                          | 当前值                        |
| ------------------------------------------ | ----------------------------- | ----------------------------- |
| `ANTHROPIC_DEFAULT_SONNET_MODEL`           | 选 sonnet 时实际调用的模型    | `gpt-5.6`                     |
| `ANTHROPIC_DEFAULT_OPUS_MODEL`             | 选 opus 时实际调用的模型      | `gpt-5.6-terra`               |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL`            | 选 haiku 时实际调用的模型     | `glm-5-turbo`                 |
| `ANTHROPIC_DEFAULT_FAST_MODEL`             | fast 模式用的模型             | `doubao-seed-2-0-lite-260215` |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 禁用遥测/更新检查等非必要请求 | `1`                           |
| `API_TIMEOUT_MS`                           | 单次请求超时时间（毫秒）      | `3000000`（50分钟）           |

> 记忆：`BASE_URL` 填网关地址，`AUTH_TOKEN` 填网关密钥，四个 `DEFAULT_*_MODEL` 做别名映射到网关模型。换回官方直连时：注释掉 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`，改为 `ANTHROPIC_API_KEY=sk-ant-...` 即可。

:::

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "xxx",
    "ANTHROPIC_DEFAULT_FAST_MODEL": "doubao-seed-2-0-lite-260215",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5-turbo",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "gpt-5.6-terra",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "gpt-5.6",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "model": "sonnet",
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true
  },
  "theme": "auto"
}
```















