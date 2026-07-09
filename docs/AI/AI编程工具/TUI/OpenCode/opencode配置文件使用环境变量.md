# opencode配置文件使用环境变量

[opencode使用环境变量](https://opencode.ai/docs/zh-cn/config/#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

在opencode配置文件中，使用 `{env:VARIABLE_NAME}` 来替换环境变量

```json
  "provider": {
    "zmexing": {
      "npm": "@ai-sdk/openai-compatible",

      "options": {
        "baseURL": "{env:LITELLM_BASEURL}",
        "apiKey": "{env:LITELLM_APIKEY}"
      },

      "models": {
        "gpt54": {
          "name": "GPT-5.4"
        },

        "glm-5": {
          "name": "GLM-5"
        },
```

