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
NAME                    CHART VERSION   APP VERSION     DESCRIPTION  
gitlab/gitlab-runner    0.69.0          17.4.0          GitLab Runner
gitlab/gitlab-runner    0.68.1          17.3.1          GitLab Runner
gitlab/gitlab-runner    0.68.0          17.3.0          GitLab Runner
gitlab/gitlab-runner    0.67.1          17.2.1          GitLab Runner
gitlab/gitlab-runner    0.67.0          17.2.0          GitLab Runner
gitlab/gitlab-runner    0.66.1          17.1.1          GitLab Runner
gitlab/gitlab-runner    0.66.0          17.1.0          GitLab Runner
gitlab/gitlab-runner    0.65.2          17.0.2          GitLab Runner
gitlab/gitlab-runner    0.65.1          17.0.1          GitLab Runner
gitlab/gitlab-runner    0.65.0          17.0.0          GitLab Runner
gitlab/gitlab-runner    0.64.3          16.11.3         GitLab Runner
gitlab/gitlab-runner    0.64.2          16.11.2         GitLab Runner
gitlab/gitlab-runner    0.64.1          16.11.1         GitLab Runner
gitlab/gitlab-runner    0.64.0          16.11.0         GitLab Runner
gitlab/gitlab-runner    0.63.0          16.10.0         GitLab Runner
gitlab/gitlab-runner    0.62.1          16.9.1          GitLab Runner
gitlab/gitlab-runner    0.62.0          16.9.0          GitLab Runner
gitlab/gitlab-runner    0.61.3          16.8.1          GitLab Runner
gitlab/gitlab-runner    0.61.2          16.8.0          GitLab Runner
gitlab/gitlab-runner    0.61.1          16.8.0          GitLab Runner
gitlab/gitlab-runner    0.61.0          16.8.0          GitLab Runner
gitlab/gitlab-runner    0.60.1          16.7.1          GitLab Runner
gitlab/gitlab-runner    0.60.0          16.7.0          GitLab Runner
gitlab/gitlab-runner    0.59.3          16.6.2          GitLab Runner
gitlab/gitlab-runner    0.59.2          16.6.1          GitLab Runner
gitlab/gitlab-runner    0.59.1          16.6.0          GitLab Runner
gitlab/gitlab-runner    0.59.0          16.6.0          GitLab Runner
gitlab/gitlab-runner    0.58.2          16.5.0          GitLab Runner
gitlab/gitlab-runner    0.58.1          16.5.0          GitLab Runner
gitlab/gitlab-runner    0.58.0          16.5.0          GitLab Runner
gitlab/gitlab-runner    0.57.2          16.4.2          GitLab Runner
gitlab/gitlab-runner    0.57.1          16.4.1          GitLab Runner
gitlab/gitlab-runner    0.57.0          16.4.0          GitLab Runner
gitlab/gitlab-runner    0.56.3          16.3.3          GitLab Runner
gitlab/gitlab-runner    0.56.2          16.3.2          GitLab Runner
gitlab/gitlab-runner    0.56.1          16.3.1          GitLab Runner
gitlab/gitlab-runner    0.56.0          16.3.0          GitLab Runner
gitlab/gitlab-runner    0.55.3          16.2.3          GitLab Runner
gitlab/gitlab-runner    0.55.2          16.2.2          GitLab Runner
gitlab/gitlab-runner    0.55.1          16.2.1          GitLab Runner
gitlab/gitlab-runner    0.55.0          16.2.0          GitLab Runner
gitlab/gitlab-runner    0.54.1          16.1.1          GitLab Runner
gitlab/gitlab-runner    0.54.0          16.1.0          GitLab Runner
gitlab/gitlab-runner    0.53.3          16.0.3          GitLab Runner
gitlab/gitlab-runner    0.53.2          16.0.2          GitLab Runner
gitlab/gitlab-runner    0.53.1          16.0.1          GitLab Runner
gitlab/gitlab-runner    0.53.0          16.0.0          GitLab Runner
gitlab/gitlab-runner    0.52.1          15.11.1         GitLab Runner
gitlab/gitlab-runner    0.52.0          15.11.0         GitLab Runner
gitlab/gitlab-runner    0.51.1          15.10.1         GitLab Runner
gitlab/gitlab-runner    0.51.0          15.10.0         GitLab Runner
gitlab/gitlab-runner    0.50.1          15.9.1          GitLab Runner
gitlab/gitlab-runner    0.50.0          15.9.0          GitLab Runner
gitlab/gitlab-runner    0.49.3          15.8.3          GitLab Runner
gitlab/gitlab-runner    0.49.2          15.8.2          GitLab Runner
gitlab/gitlab-runner    0.49.1          15.8.1          GitLab Runner
gitlab/gitlab-runner    0.49.0          15.8.0          GitLab Runner
gitlab/gitlab-runner    0.48.3          15.7.4          GitLab Runner
gitlab/gitlab-runner    0.48.2          15.7.3          GitLab Runner
gitlab/gitlab-runner    0.48.1          15.7.2          GitLab Runner
gitlab/gitlab-runner    0.48.0          15.7.0          GitLab Runner
gitlab/gitlab-runner    0.47.3          15.6.3          GitLab Runner
gitlab/gitlab-runner    0.47.2          15.6.2          GitLab Runner
gitlab/gitlab-runner    0.47.1          15.6.1          GitLab Runner
gitlab/gitlab-runner    0.47.0          15.6.0          GitLab Runner
gitlab/gitlab-runner    0.46.1          15.5.1          GitLab Runner
gitlab/gitlab-runner    0.46.0          15.5.0          GitLab Runner
gitlab/gitlab-runner    0.45.2          15.4.2          GitLab Runner
gitlab/gitlab-runner    0.45.1          15.4.1          GitLab Runner
gitlab/gitlab-runner    0.45.0          15.4.0          GitLab Runner
gitlab/gitlab-runner    0.44.3          15.3.3          GitLab Runner
gitlab/gitlab-runner    0.44.2          15.3.2          GitLab Runner
gitlab/gitlab-runner    0.44.1          15.3.1          GitLab Runner
gitlab/gitlab-runner    0.44.0          15.3.0          GitLab Runner
gitlab/gitlab-runner    0.43.2          15.2.2          GitLab Runner
gitlab/gitlab-runner    0.43.1          15.2.1          GitLab Runner
gitlab/gitlab-runner    0.43.0          15.2.0          GitLab Runner
gitlab/gitlab-runner    0.42.0          15.1.0          GitLab Runner
gitlab/gitlab-runner    0.41.1          15.0.1          GitLab Runner
gitlab/gitlab-runner    0.41.0          15.0.0          GitLab Runner
gitlab/gitlab-runner    0.40.1          14.10.1         GitLab Runner
gitlab/gitlab-runner    0.40.0          14.10.0         GitLab Runner
gitlab/gitlab-runner    0.39.1          14.9.2          GitLab Runner
gitlab/gitlab-runner    0.39.0          14.9.0          GitLab Runner
gitlab/gitlab-runner    0.38.2          14.8.3          GitLab Runner
gitlab/gitlab-runner    0.38.1          14.8.2          GitLab Runner
gitlab/gitlab-runner    0.38.0          14.8.0          GitLab Runner
gitlab/gitlab-runner    0.37.3          14.7.1          GitLab Runner
gitlab/gitlab-runner    0.37.2          14.7.0          GitLab Runner
......
```



### 2.3 下载chat

:::tip 说明

可以通过 `--version=`  指定要下载的版本，不指定默认下载最新版

:::

```shell
helm pull gitlab/gitlab-runner
```



### 2.4 解压缩包

```shell
tar xf gitlab-runner-0.69.0.tgz
```



目录结构如下

```shell
$ tree gitlab-runner/
gitlab-runner/
├── CHANGELOG.md
├── CONTRIBUTING.md
├── Chart.yaml
├── DEVELOPMENT.md
├── LICENSE
├── Makefile
├── NOTICE
├── README.md
├── templates
│   ├── NOTES.txt
│   ├── _env_vars.tpl
│   ├── _helpers.tpl
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── extra-manifests.yaml
│   ├── hpa.yaml
│   ├── role-binding.yaml
│   ├── role.yaml
│   ├── secrets.yaml
│   ├── service-account.yaml
│   ├── service-session-server.yaml
│   ├── service.yaml
│   └── servicemonitor.yaml
└── values.yaml

2 directories, 23 files
```



## 3.配置gitlab runner

[使用helm chart配置gitlab runner官方文档](https://docs.gitlab.com/runner/install/kubernetes.html#configuring-gitlab-runner-using-the-helm-chart)

### 3.1 必须配置项目

#### 3.1.1 gitlabUrl

用于注册 Runner 的 GitLab 服务器完整 URL

在 `values.yaml` 中修改

```yaml
gitlabUrl: http://你的gitlabIP或域名/
```



#### 3.1.2 `rbac: { create: true }`

为 GitLab Runner 创建 RBAC 规则，以便其创建 Pod 来运行任务，如果你有一个现有的 `serviceAccount` 并希望使用它则应该设置 `rbac: { serviceAccountName: "SERVICE_ACCOUNT_NAME" }`，有关 `serviceAccount` 所需的最低权限的更多信息请参考 [官方文档](https://docs.gitlab.com/runner/executors/kubernetes/index.html#configure-runner-api-permissions)



在 `values.yaml` 中修改

```yaml
rbac:
  ## Specifies whether a Role and RoleBinding should be created
  ## If this value is set to `true`, `serviceAccount.create` should also be set to either `true` or `false`
  ##
  create: true
```







#### 3.1.3 `runnerToken` 和 `runnerRegistrationToken`

##### 3.1.3.1 `runnerToken` 

-  [在gitlab ui中创建的runner认证token](https://docs.gitlab.com/ee/ci/runners/runners_scope.html#create-an-instance-runner-with-a-runner-authentication-token)
- [直接设置token或将其存储在secret中](https://docs.gitlab.com/runner/install/kubernetes.html#store-registration-tokens-or-runner-tokens-in-secrets)





`admin` -> `CI/CD` -> `Runners` -> `new instance runner`

![iShot_2024-09-26_18.59.43](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-26_18.59.43.png)



添加tag以指定可以运行的job，可以参考 [官方文档](https://docs.gitlab.com/17.4/ee/ci/runners/configure_runners.html#control-jobs-that-a-runner-can-run)

![iShot_2024-09-26_19.35.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-26_19.35.30.png)



创建完runner的页面，复制显示的 `runner authentication token` 并在 `values.yaml` 中指定

![iShot_2024-09-26_19.40.48](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-26_19.40.48.png)



在 `values.yaml` 中修改

```yaml
runnerToken: "glrt-USJJE89hif1-1kwGFHtj"
```





##### 3.1.3.2 `runnerRegistrationToken`（在 [gitlab15.6中荒废](https://gitlab.com/gitlab-org/gitlab/-/merge_requests/102681)）

- 在gitlab实例中检测到的 [注册token](https://docs.gitlab.com/ee/ci/runners/)
- [直接设置token或将其存储在secret中](https://docs.gitlab.com/runner/install/kubernetes.html#store-registration-tokens-or-runner-tokens-in-secrets)









```
gitlab-runner register  --url http://10.80.15.241  --token glrt-USJJE89hif1-1kwGFHtj
```



```
gitlab-runner run
```





```yaml

```



### 3.2 其他配置项

#### 3.2.1 配置 `unregisterRunner`

:::tip 说明

[官方文档关于一些参数的说明](https://docs.gitlab.com/charts/charts/gitlab/gitlab-runner/#installation-command-line-options)，`unregisterRunners` 为 `true` 的意思为，当更新runner版本或者修改配置文件时，注销掉所有的注册runner

:::

```yaml
unregisterRunners: true
```



#### 3.2.2 配置 `checkInterval`

[官方文档对于checkInterval的说明](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#how-check_interval-works)

:::tip 说明

这个参数简单理解就是Runner间隔多久去GitLab上检查是否有job

默认是3秒，如果设置为0或者更低还是默认3秒

:::

```yaml
checkInterval: 3
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



## 4.安装

```shell
$ helm upgrade --install gitlab-runner --namespace ci --create-namespace .
Release "gitlab-runner" does not exist. Installing it now.
NAME: gitlab-runner
LAST DEPLOYED: Thu Sep 26 20:01:27 2024
NAMESPACE: ci
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Your GitLab Runner should now be registered against the GitLab instance reachable at: "http://10.80.15.241"

Runner namespace "ci" was found in runners.config template.

#############################################################################################
## WARNING: You enabled `rbac` without specifying if a service account should be created.  ##
## Please set `serviceAccount.create` to either `true` or `false`.                         ##
## For backwards compatibility a service account will be created.                          ##
#############################################################################################
```



查看pod

```shell
$ kubectl get pods                              
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-6468db9444-qx42h   1/1     Running   0          3m3s
```





## 5.注册runner

进入gitlab-runner pod中进行注册runner

```shell
$ gitlab-runner register  --url http://10.80.15.241  --token glrt-USJJE89hif1-1kwGFHtj
Runtime platform                                    arch=amd64 os=linux pid=153189 revision=2e25d6cf version=17.5.0~pre.71.g2e25d6cf
WARNING: Running in user-mode.                     
WARNING: The user-mode requires you to manually start builds processing: 
WARNING: $ gitlab-runner run                       
WARNING: Use sudo for system-mode:                 
WARNING: $ sudo gitlab-runner...                   
                                                   
Enter the GitLab instance URL (for example, https://gitlab.com/):
[http://10.80.15.241]: 
WARNING: A runner with this system ID and token has already been registered. 
Verifying runner... is valid                        runner=USJJE89hi
Enter a name for the runner. This is stored only in the local config.toml file:
[gitlab-runner-6468db9444-qx42h]: 
Enter an executor: virtualbox, docker-windows, docker+machine, instance, custom, ssh, parallels, docker-autoscaler, shell, docker, kubernetes:
[kubernetes]: 
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
 
Configuration (with the authentication token) was saved in "/home/gitlab-runner/.gitlab-runner/config.toml" 
```



在 `Admin` -> `CI/CD` -> `Runners` 查看注册的runner

![iShot_2024-09-29_15.53.08](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-29_15.53.08.png)



