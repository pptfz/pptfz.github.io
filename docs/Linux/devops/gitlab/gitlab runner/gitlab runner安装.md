# gitlab runner安装配置

[gitlab官方文档](https://docs.gitlab.com/)

[gitlab官方文档归档地址](https://docs.gitlab.com/archives/)

[gitlab github地址](https://github.com/gitlabhq/gitlabhq)

[gitlab runner 官方文档](https://docs.gitlab.com/runner/)

[gitlab runner安装官方文档](https://docs.gitlab.com/runner/install/)



## gitlab runner简介

### 简介

GitLab Runner 是一个与 GitLab CI/CD 一起使用以在管道中运行作业的应用程序



### 特性

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



### runner 执行流程

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



### gitlab runner相关术语

- **GitLab Runner** :

  安装在目标计算平台上执行 GitLab CI 作业的应用程序，用来执行 GitLab CI 的流水线任务（CI Job），也就是执行 `.gitlab-ci.yml` 中定义的工作

- **runner configuration** :  

  指的是 `config.toml` 配置文件中的一个 `[[runner]]` 条目，每个 `[[runner]]` 会在 GitLab 的 Web 页面中显示为一个 Runner，且可以绑定不同的项目或标签

- **runner manager** : 

  是 GitLab Runner 主程序启动后，负责读取 `config.toml` 并并发运行多个 Runner 配置的后台进程

- **runner** : 

  是具体去执行 CI 任务的进程

  如果你使用的是 `shell` 或 `docker` executor，它就在本地运行

  如果是 `kubernetes` 或 `docker-autoscaler` executor，它会在远程（比如 K8s 的 Pod 或新建的 VM）上运行

- **machine** : 

  是指 Runner 执行任务所在的计算环境，比如一个虚拟机或一个 K8s Pod

  每台机器都会被自动分配一个唯一的、持久的 Machine ID

  即使多个机器用了相同的 Runner 配置，它们在 UI 上也可以区分开来，但会显示为属于同一个配置分组



![iShot_2025-06-16_14.01.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-16_14.01.30.png)



## 安装gitlab runner

gitlab runner支持多种安装方式，具体可以查看官方文档，这里我们选择使用helm chat模版在k8s中安装

[k8s安装runner官方文档](https://docs.gitlab.com/runner/install/kubernetes.html)

### 添加仓库

```shell
helm repo add gitlab https://charts.gitlab.io
```



### 查看chat

在下载前可以通过如下命令获取 `Helm Chart` 和 `GitLab Runner` 之间的版本映射

```shell
$ helm search repo -l gitlab/gitlab-runner
NAME                    CHART VERSION   APP VERSION     DESCRIPTION  
gitlab/gitlab-runner    0.77.2          18.0.2          GitLab Runner
gitlab/gitlab-runner    0.77.1          18.0.1          GitLab Runner
gitlab/gitlab-runner    0.77.0          18.0.0          GitLab Runner
gitlab/gitlab-runner    0.76.2          17.11.2         GitLab Runner
gitlab/gitlab-runner    0.76.1          17.11.1         GitLab Runner
gitlab/gitlab-runner    0.76.0          17.11.0         GitLab Runner
gitlab/gitlab-runner    0.75.1          17.10.1         GitLab Runner
gitlab/gitlab-runner    0.75.0          17.10.0         GitLab Runner
gitlab/gitlab-runner    0.74.3          17.9.3          GitLab Runner
gitlab/gitlab-runner    0.74.2          17.9.2          GitLab Runner
gitlab/gitlab-runner    0.74.1          17.9.1          GitLab Runner
gitlab/gitlab-runner    0.74.0          17.9.0          GitLab Runner
gitlab/gitlab-runner    0.73.5          17.8.5          GitLab Runner
gitlab/gitlab-runner    0.73.4          17.8.4          GitLab Runner
gitlab/gitlab-runner    0.73.3          17.8.3          GitLab Runner
......
```



### 下载chat

:::tip 说明

可以通过 `--version=`  指定要下载的版本，不指定默认下载最新版

这里选择下载 `0.77.2` 版本，和gitlab版本保持一致

:::

```shell
export RUNNER_VERSION=0.772
helm pull gitlab/gitlab-runner --version=$RUNNER_VERSION
```



### 解压缩包

```shell
tar xf gitlab-runner-$RUNNER_VERSION.tgz
```



目录结构如下

```shell
$ tree gitlab-runner/
gitlab-runner/
├── CHANGELOG.md
├── Chart.yaml
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── LICENSE
├── Makefile
├── NOTICE
├── README.md
├── templates
│   ├── _env_vars.tpl
│   ├── _helpers.tpl
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── extra-manifests.yaml
│   ├── hpa.yaml
│   ├── ingress-session-server.yaml
│   ├── NOTES.txt
│   ├── role-binding.yaml
│   ├── role.yaml
│   ├── secrets.yaml
│   ├── service-account.yaml
│   ├── service-session-server.yaml
│   ├── service.yaml
│   └── servicemonitor.yaml
└── values.yaml

2 directories, 24 files
```



### 配置gitlab runner

[使用helm chart配置gitlab runner官方文档](https://docs.gitlab.com/runner/install/kubernetes.html#configuring-gitlab-runner-using-the-helm-chart)

#### 必须配置项目

##### `gitlaburl`

用于注册 Runner 的 GitLab 服务器完整 URL

在 `values.yaml` 中修改

```yaml
gitlabUrl: http://你的gitlabIP或域名/
```



##### `rbac`

为 GitLab Runner 创建 RBAC 规则，以便其创建 Pod 来运行任务，如果你有一个现有的 `serviceAccount` 并希望使用它则应该设置 `rbac: { serviceAccountName: "SERVICE_ACCOUNT_NAME" }`，有关 `serviceAccount` 所需的最低权限的更多信息请参考 [官方文档](https://docs.gitlab.com/runner/executors/kubernetes/index.html#configure-runner-api-permissions)



在 `values.yaml` 中修改

```yaml
rbac:
  ## Specifies whether a Role and RoleBinding should be created
  ## If this value is set to `true`, `serviceAccount.create` should also be set to either `true` or `false`
  ##
  create: true
```



#####  `runnerToken` 

-  [在gitlab ui中创建的runner认证token](https://docs.gitlab.com/ee/ci/runners/runners_scope.html#create-an-instance-runner-with-a-runner-authentication-token)
- [直接设置token或将其存储在secret中](https://docs.gitlab.com/runner/install/kubernetes.html#store-registration-tokens-or-runner-tokens-in-secrets)

 

`admin` -> `CI/CD` -> `Runners` -> `Create instance runner`

![iShot_2025-06-16_14.32.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-16_14.32.11.png)



创建runner实例

:::tip 配置说明

- `Tags`

  添加tag以指定可以运行的job，可以参考 [官方文档](https://docs.gitlab.com/17.4/ee/ci/runners/configure_runners.html#control-jobs-that-a-runner-can-run)，多个tag以逗号分隔，例如 `macos, shared`

- `Run untagged jobs`

  **勾选**：这个Runner可以接受没有指定标签的"通用任务"

  **不勾选**：这个Runner只接受有明确标签要求的"专门任务"

- `Runner description` 

  给这个Runner添加一个描述，写清楚用途，比如"生产环境部署机器"、"前端打包专用"

- `Paused`

  临时停用这个Runner，不接新任务，适用于机器维护、故障排查时使用，已经在跑的任务继续跑，但不会分配新任务

- `Protected`

  只能运行受保护的分支，处于安全考虑是防止测试分支的代码在生产环境Runner上运行

- `Maximum job timeout`

  最大任务超时时间，单位为秒，最小值为600

:::

![iShot_2025-06-16_16.03.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-16_16.03.39.png)



创建完runner的页面，复制显示的 `runner authentication token` 并在 `values.yaml` 中指定

![iShot_2025-06-16_17.02.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-16_17.02.11.png)



在 `values.yaml` 中修改

```yaml
runnerToken: "glrt-vEfVkg2seFXXB8PK5k1rDHQ6MQp1OjEH.01.0w021s5dx"
```



#### 其他配置项

##### `unregisterRunner`

:::tip 说明

[官方文档关于一些参数的说明](https://docs.gitlab.com/charts/charts/gitlab/gitlab-runner/#installation-command-line-options)，`unregisterRunners` 为 `true` 的意思为当更新runner版本或者修改配置文件时，注销掉所有的注册runner

:::

```yaml
unregisterRunners: true
```



#####  `checkInterval`

[官方文档对于checkInterval的说明](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#how-check_interval-works)

:::tip 说明

这个参数简单理解就是Runner间隔多久去GitLab上检查是否有job

默认是3秒，如果设置为0或者更低还是默认3秒

:::

```yaml
checkInterval: 3
```





`serviceAccount`

:::tip 说明

如果启用了rbac，则需要手动为 GitLab Runner 创建一个 `ServiceAccount` ，否则安装的时候会有如下警告

```shell
WARNING: You enabled `rbac` without specifying if a service account should be created.
Please set `serviceAccount.create` to either `true` or `false`.
For backwards compatibility a service account will be created.
```

:::

```yaml
serviceAccount:
  ## Specifies whether a ServiceAccount should be created
  ##
  ## TODO: Set default to `false`
  create: true
```



### 执行安装

```shell
$ helm upgrade --install gitlab-runner --namespace gitlab-runner --create-namespace .
Release "gitlab-runner" does not exist. Installing it now.
NAME: gitlab-runner
LAST DEPLOYED: Tue Jun 17 10:57:01 2025
NAMESPACE: gitlab-runner
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Your GitLab Runner should now be registered against the GitLab instance reachable at: "http://gitlab.ops.com/"

Runner namespace "gitlab-runner" was found in runners.config template.
```



查看pod

:::tip 说明

执行安装命令后只会安装一个pod

:::

```shell
$ kubectl get pods                              
NAME                             READY   STATUS    RESTARTS   AGE
gitlab-runner-6468db9444-qx42h   1/1     Running   0          3m3s
```





## 注册gitlab runner

### 获取注册token

:::tip 说明

这一步骤的runner token仅在此处显示很短的时间，注册runner后，此令牌存储在 `config.toml` 中，无法再次从ui页面访问

:::

```shell
gitlab-runner register --url http://gitlab.ops.com  --token glrt-vEfVkg2seFXXB8PK5k1rDHQ6MQp1OjEH.01.0w021s5dx
```



```
gitlab-runner register --url http://10.0.0.102:88  --token glrt-vEfVkg2seFXXB8PK5k1rDHQ6MQp1OjEH.01.0w021s5dx
```



手动验证runner是否可以找到job

```
gitlab-runner run
```





### 注册runner

[注册runner官方文档](https://docs.gitlab.com/runner/register/)



进入gitlab-runner pod中进行注册runner

```shell
$ gitlab-runner register --url http://10.0.0.102:88  --token glrt-vEfVkg2seFXXB8PK5k1rDHQ6MQp1OjEH.01.0w021s5dx
Runtime platform                                    arch=arm64 os=linux pid=865 revision=4d7093e1 version=18.0.2
WARNING: Running in user-mode.                     
WARNING: The user-mode requires you to manually start builds processing: 
WARNING: $ gitlab-runner run                       
WARNING: Use sudo for system-mode:                 
WARNING: $ sudo gitlab-runner...                   
                                                   
Enter the GitLab instance URL (for example, https://gitlab.com/):
[http://10.0.0.102:88]: 
WARNING: A runner with this system ID and token has already been registered. 
Verifying runner... is valid                        runner=vEfVkg2se
Enter a name for the runner. This is stored only in the local config.toml file:
[gitlab-runner-9444659d7-6tgvn]: gitlab-runner run  
Enter an executor: virtualbox, docker-windows, docker+machine, docker-autoscaler, instance, custom, shell, ssh, parallels, docker, kubernetes:
[kubernetes]: kubernetes
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
 
Configuration (with the authentication token) was saved in "/home/gitlab-runner/.gitlab-runner/config.toml" 
```



在 `Admin` -> `CI/CD` -> `Runners` 查看注册的runner

:::tip 说明

只有注册成功的runner才会显示绿色的 `Online` 状态

未注册的runner显示的是灰色的 `Never contacted` 状态

:::

![iShot_2025-06-17_13.28.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-17_13.28.21.png)









