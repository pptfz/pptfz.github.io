# gitlab runner安装配置

[gitlab官方文档](https://docs.gitlab.com/)

[gitlab官方文档归档地址](https://docs.gitlab.com/archives/)

[gitlab github地址](https://github.com/gitlabhq/gitlabhq)

[gitlab runner 官方文档](https://docs.gitlab.com/runner/)

[gitlab runner安装官方文档](https://docs.gitlab.com/runner/install/)



## 1.gitlab runner简介

### 1.1 简介

GitLab Runner 是一个与 GitLab CI/CD 一起使用以在管道中运行作业的应用程序



### 1.2 特性

GitLab Runner 具有以下功能

- 同时运行多个作业。
- 对多个服务器（甚至每个项目）使用多个令牌。
- 限制每个令牌的并发作业数。
- 可以运行作业：
  - 本地。
  - 使用 Docker 容器。
  - 使用 Docker 容器并通过 SSH 执行作业。
  - 在不同的云和虚拟化管理程序上使用具有自动缩放功能的 Docker 容器。
  - 连接到远程 SSH 服务器。
- 用 Go 编写并作为单个二进制文件分发，没有任何其他要求。
- 支持 Bash、PowerShell Core 和 Windows PowerShell。
- 适用于 GNU/Linux、macOS 和 Windows（几乎可以在任何可以运行 Docker 的地方）。
- 允许自定义作业运行环境。
- 无需重新启动即可自动重新加载配置。
- 易于使用的设置，支持 Docker、Docker-SSH、Parallels 或 SSH 运行环境。
- 启用 Docker 容器的缓存。
- 易于安装为 GNU/Linux、macOS 和 Windows 的服务。
- 嵌入式 Prometheus 指标 HTTP 服务器。
- Referee workers监控 Prometheus 指标和其他特定于工作的数据并将其传递给 GitLab。



### 1.3 runner 执行流程

![iShot_2022-07-04_10.59.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-07-04_10.59.44.png)



- Runner向 `/api/v4/runners` 发送POST请求，请求里带有注册 `Token`
- 注册成功后返回 `runner_token`
- Runner通过循环向 `/api/v4/rquest` 发送POST请求，请求里带上 `runner_token`
- 认证通过后接口返回带有任务信息的 `payload` 和任务相关的 `job_token`
- 然后将任务信息发送给执行器，执行器使用 `job_token` 来
- 克隆所需的代码
- 下载配置或组件
- 执行器执行完成后，返回任务输出和任务状态信息
- `Runner` 向 `GitLab` 返回任务输出、任务状态以及 `job_token`



### 1.4 gitlab runner相关术语

- **GitLab Runner** : 安装在目标计算平台上执行 GitLab CI 作业的应用程序
- **runner configuration** : 在 `config.toml` 文件中的单个 `[[runner]]` 条目在用户界面（UI）中显示为一个**运行器**（runner）

- **runner manager** : 读取 `config.toml`并同时运行所有 runner 配置的进程
- **runner** : 在选定的机器上执行作业的进程。根据执行器的类型，这台机器可能是运行器管理器本地的（使用 `shell` 或 `docker` 执行器），也可能是由自动缩放器创建的远程机器（使用 `docker-autoscaler` 或 `kubernetes`）
- **machine** : 运行程序在其中运行的虚拟机 （VM） 或 Pod。GitLab Runner 会自动生成一个唯一的、持久的机器 ID，这样当多台机器被赋予相同的 runner 配置时，作业可以单独路由，但 runner 配置在 UI 中分组



## 2.安装gitlab runner

gitlab runner支持多种安装方式，具体可以查看官方文档，这里我们选择使用helm chat模版在k8s中安装

[k8s安装runner官方文档](https://docs.gitlab.com/runner/install/kubernetes.html)

### 2.1 添加仓库

```shell
helm repo add gitlab https://charts.gitlab.io
```



### 2.2 查看chat

在下载前可以通过如下命令获取 `Helm Chart` 和 `GitLab Runner` 之间的版本映射

```shell
$ helm search repo -l gitlab/gitlab-runner
NAME                	CHART VERSION	APP VERSION	DESCRIPTION  
gitlab/gitlab-runner	0.42.0       	15.1.0     	GitLab Runner
gitlab/gitlab-runner	0.41.0       	15.0.0     	GitLab Runner
gitlab/gitlab-runner	0.40.1       	14.10.1    	GitLab Runner
gitlab/gitlab-runner	0.40.0       	14.10.0    	GitLab Runner
gitlab/gitlab-runner	0.39.1       	14.9.2     	GitLab Runner
gitlab/gitlab-runner	0.39.0       	14.9.0     	GitLab Runner
gitlab/gitlab-runner	0.38.2       	14.8.3     	GitLab Runner
gitlab/gitlab-runner	0.38.1       	14.8.2     	GitLab Runner
gitlab/gitlab-runner	0.38.0       	14.8.0     	GitLab Runner
gitlab/gitlab-runner	0.37.3       	14.7.1     	GitLab Runner
gitlab/gitlab-runner	0.37.2       	14.7.0     	GitLab Runner
gitlab/gitlab-runner	0.37.1       	bleeding   	GitLab Runner
gitlab/gitlab-runner	0.37.0       	14.7.0     	GitLab Runner
gitlab/gitlab-runner	0.36.1       	14.6.1     	GitLab Runner
gitlab/gitlab-runner	0.36.0       	14.6.0     	GitLab Runner
gitlab/gitlab-runner	0.35.3       	14.5.2     	GitLab Runner
gitlab/gitlab-runner	0.35.2       	14.5.2     	GitLab Runner
gitlab/gitlab-runner	0.35.0       	14.5.0     	GitLab Runner
gitlab/gitlab-runner	0.34.2       	14.4.2     	GitLab Runner
gitlab/gitlab-runner	0.34.1       	14.4.1     	GitLab Runner
gitlab/gitlab-runner	0.34.0       	14.4.0     	GitLab Runner
gitlab/gitlab-runner	0.33.3       	14.3.4     	GitLab Runner
gitlab/gitlab-runner	0.33.2       	14.3.3     	GitLab Runner
gitlab/gitlab-runner	0.33.1       	14.3.2     	GitLab Runner
gitlab/gitlab-runner	0.33.0       	14.3.0     	GitLab Runner
gitlab/gitlab-runner	0.32.0       	14.2.0     	GitLab Runner
gitlab/gitlab-runner	0.31.0       	14.1.0     	GitLab Runner
gitlab/gitlab-runner	0.30.0       	14.0.0     	GitLab Runner
gitlab/gitlab-runner	0.29.0       	13.12.0    	GitLab Runner
gitlab/gitlab-runner	0.28.0       	13.11.0    	GitLab Runner
gitlab/gitlab-runner	0.27.0       	13.10.0    	GitLab Runner
......
```



### 2.3 下载chat

```shell
helm pull gitlab/gitlab-runner --version=0.37.2
```



### 2.4 解压缩包

```shell
tar xf gitlab-runner-0.37.2.tgz
```



目录结构如下

```shell
$ tree gitlab-runner
gitlab-runner
├── CHANGELOG.md
├── Chart.yaml
├── CONTRIBUTING.md
├── LICENSE
├── Makefile
├── NOTICE
├── README.md
├── templates
│   ├── _cache.tpl
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── _env_vars.tpl
│   ├── _helpers.tpl
│   ├── hpa.yaml
│   ├── NOTES.txt
│   ├── role-binding.yaml
│   ├── role.yaml
│   ├── secrets.yaml
│   ├── service-account.yaml
│   ├── servicemonitor.yaml
│   ├── service-session-server.yaml
│   └── service.yaml
├── values-qk.yaml
└── values.yaml

1 directory, 23 files
```



## 3.配置gitlab runner

[官方文档](https://docs.gitlab.com/runner/install/kubernetes.html)中指定了2个必须配置项

- gitlabUrl 指定用于注册runner的gitlab地址

- runnerRegistrationToken 指定用于将runner添加到gitlab的注册令牌(这个可以在gitlab中生成，[也可以将注册令牌存储在secret中](https://docs.gitlab.com/runner/install/kubernetes.html#store-registration-tokens-or-runner-tokens-in-secrets))

  - 配置示例如下

    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: gitlab-runner-secret
    type: Opaque
    data:
      runner-registration-token: "NlZrN1pzb3NxUXlmcmVBeFhUWnIK" #base64 encoded registration token
      runner-token: ""
    ```

    ```yaml
    runners:
      secret: gitlab-runner-secret
    ```

    

接下来修改chat模版中的 `values.yaml` 文件，这里做如下修改

### 3.1 配置 `gitlabUrl`

```yaml
gitlabUrl: http://你的gitlabIP或域名/
```



### 3.2 配置 `runnerRegistrationToken`

```yaml
runnerRegistrationToken: "xxx"
```



### 3.3 配置 `unregisterRunner`

[官方文档关于一些参数的说明](https://docs.gitlab.com/charts/charts/gitlab/gitlab-runner/#installation-command-line-options)，`unregisterRunners` 为 `true` 的意思为，当更新runner版本或者修改配置文件时，注销掉所有的注册runner

```yaml
unregisterRunners: true
```



### 3.4 配置 `checkInterval`

[官方文档对于checkInterval的说明](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#how-check_interval-works)

这个参数简单理解就是Runner间隔多久去GitLab上检查是否有job

⚠️默认是3秒，如果设置为0或者更低还是默认3秒

```yaml
checkInterval: 3
```



### 3.5 配置rbac

```yaml
create: true
```





```yaml
resources: ["pods", "pods/exec", "secrets","configmaps"]
verbs: ["get", "list", "watch", "create", "patch", "delete"]
rules:
    - apiGroups: ["extensions", "apps"]
      resources: ["deployments"]
      verbs: ["create", "delete", "get", "list", "watch", "patch", "update"]
    - apiGroups: [""]
      resources: ["services"]
      verbs: ["create", "delete", "get", "list", "watch", "patch", "update"]
    - apiGroups: [""]
      resources: ["pods","pods/attach"]
      verbs: ["create","delete","get","list","patch","update","watch"]
    - apiGroups: [""]
      resources: ["pods/exec"]
      verbs: ["create","delete","get","list","patch","update","watch"]
    - apiGroups: [""]
      resources: ["pods/log"]
      verbs: ["get","list","watch"]
    - apiGroups: [""]
      resources: ["secrets"]
      verbs: ["create","delete","get","list","patch","update","watch"]
    - apiGroups: [""]
      resources: ["configmaps"]
      verbs: ["create","delete","get","list","patch","update","watch"]
    - apiGroups: ["extensions","apps"]
      resources: ["ingresses"]
      verbs: ["create","delete","get","list","patch","update","watch"]
    - apiGroups: [""]
      resources: ["persistentvolumeclaims"]
      verbs: ["create","delete","get","list","patch","update","watch"]
```



### 3.6 配置 helpers

[helper image官方文档说明](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#helper-image)

[docker hub helper image地址](https://hub.docker.com/r/gitlab/gitlab-runner-helper/tags)

```yaml
helpers:
  image: "gitlab/gitlab-runner-helper:ubuntu-x86_64-v14.10.2-pwsh"
```







