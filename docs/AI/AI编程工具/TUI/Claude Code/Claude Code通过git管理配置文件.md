# Claude Code通过git管理配置文件

如果想要通过git管理配置文件，就不能在配置文件中暴露apikey

claude配置文件 `settings.json` 中可以不写 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN` 

```json
{
  "env": {
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "gpt-5.4",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "doubao-seed-2-0-pro",
    "ANTHROPIC_DEFAULT_FAST_MODEL": "doubao-seed-2-0-lite-260215",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "model": "haiku",
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true
  },
  "theme": "auto"
}
```



可以放到一个配置文件中，例如 `~/.zshrc.local` ，再通过 `~/.zshrc` 引用

```shell
export ANTHROPIC_BASE_URL="https://xxx.com"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_APIKEY"
```

