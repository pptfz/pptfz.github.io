# openclaw通过git管理配置文件



openclaw配置文件 `openclaw.json` 

```json
  "models": {
    "mode": "merge",
    "providers": {
      "zmexing": {
        "baseUrl": "xxx",
        "apiKey": "xxx"
        "api": "openai-completions",
```



修改为

```json
  "models": {
    "mode": "merge",
    "providers": {
      "zmexing": {
        "baseUrl": "xxx",
        "apiKey": {
          "source": "env",
          "provider": "default",
          "id": "LITELLM_APIKEY"
```

