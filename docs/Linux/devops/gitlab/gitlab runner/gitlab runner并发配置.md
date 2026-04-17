# gitlab runner并发配置

[gitlab runner配置官方文档](https://docs.gitlab.com/runner/configuration/)



## 配置文件说明

helm安装的gitlab runner pod配置文件路径是 `/home/gitlab-runner/.gitlab-runner/config.toml` ，通过cm的方式挂载



cm中 `config.template.toml` 是 `[[runners]]` 配置项的配置，`config.toml` 是全局的配置

```yaml
  config.template.toml: |
    [[runners]]
      # 单个 Runner 限制
      limit = 10
      # 请求并发（解决长轮询瓶颈）
      request_concurrency = 4
      # 启用自适应并发（可选）
      environment = ["FF_USE_ADAPTIVE_REQUEST_CONCURRENCY=true"]
      [runners.kubernetes]
        namespace = "gitlab-runner"
        image = "alpine"
        privileged = false
  config.toml: |
    shutdown_timeout = 0
    concurrent = 10
    check_interval = 3
    log_level = "info"
    listen_address = ":9252"
```







## 参数说明

3个并发参数的关系

```shell
concurrency        → 整个 Runner 最多同时跑几个任务（全局）
limit              → 每个 Runner 实例最多跑几个任务（单个）
request_concurrency → 每次向 GitLab 要几个任务（请求批次）
```



3个参数的作用域

```shell
┌─────────────────────────────────────────────────────────┐
│  concurrency (全局)                                      │
│  整个 GitLab Runner 系统最多同时跑的任务数                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  limit (单个 Runner)                               │  │
│  │  每个 Runner Pod/实例最多同时跑的任务数              │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  request_concurrency (请求层)                │  │  │
│  │  │  每次向 GitLab 要几个任务                      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```





## 配置示例

```toml
# 全局配置
shutdown_timeout = 0
concurrency = 10          # 全局最多 10 个任务
check_interval = 3
log_level = "info"
listen_address = ":9252"

[[runners]]
  # 单个 Runner 限制
  limit = 10              # 单 Pod 最多 10 个任务
  
  # 请求并发（解决长轮询瓶颈）
  request_concurrency = 4  # 每次要 4 个任务
  
  # 启用自适应并发（可选）
  environment = ["FF_USE_ADAPTIVE_REQUEST_CONCURRENCY=true"]
  
  [runners.kubernetes]
    namespace = "gitlab-runner"
    image = "alpine"
    privileged = false
```





