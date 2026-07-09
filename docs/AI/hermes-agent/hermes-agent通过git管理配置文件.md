# hermes-agent通过git管理配置文件

在 `.hermes/config.yaml` 中配置 `api_key_env: APIKEY`

```yaml
model:
  default: glm-5.1
  provider: xxx
  base_url: https://xxx.com/v1
providers:
  zmexing:
    base_url: https://xxx.com/v1
    api_key_env: APIKEY
    api_mode: openai
    models:
```





然后在 `.hermes/.env` 配置 `APIKEY`

```yaml
APIKEY=xxx
```





