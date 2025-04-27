# argocd安装

[argocd github](https://github.com/argoproj/argo-cd)

[argocd官网](https://argo-cd.readthedocs.io/)



## 架构

### argocd架构图

![iShot_2025-04-25_16.57.41](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-25_16.57.41.png)







### 包含组件

## API Server（ArgoCD 接口服务器）

**API Server** 是 ArgoCD 的核心服务，提供 **gRPC / REST 接口**，被 Web UI、CLI 和 CI/CD 系统调用。它的职责包括：

-  **应用管理与状态汇报**：接收和返回每个 Application 的状态信息（如是否同步、是否健康）
-  **执行操作指令**：比如同步（Sync）、回滚（Rollback）、执行自定义 Hook
-  **仓库与集群凭据管理**：Git 仓库地址、K8s 访问凭据等都通过 Secret 存储在集群里
-  **用户认证与授权**：支持对接外部身份认证系统（如 Dex、LDAP、GitHub 登录等）
-  **RBAC 权限控制**：基于角色的权限控制，限制用户对不同项目、应用的访问权限
-  **监听 Git Webhook 事件**：可接收 Git 推送事件，自动触发应用同步



## Repository Server（Git 仓库处理服务）

**Repository Server** 是 ArgoCD 的内部服务，主要作用是处理 Git 仓库中的内容：

- 在本地缓存 Git 仓库中的代码（防止每次都远程拉取）
- 根据给定信息生成 Kubernetes YAML 文件：
  - Git 仓库地址
  - 分支、tag 或 commit（revision）
  - 仓库中某个路径
  - 模板参数（如 Helm 的 values.yaml、Kustomize 的参数）

它就像一个渲染引擎，把 Git 配置转换成 Kubernetes 可以直接部署的 YAML 文件



## Application Controller（应用控制器）

**Application Controller** 是一个 Kubernetes 控制器，负责 ArgoCD 最核心的GitOps同步能力：

-  **实时监控应用状态**：对比当前集群的实际状态和 Git 仓库中期望的状态
- 如果状态不同（OutOfSync），就会标记出来
- 如果配置了自动同步，会立即进行更新操作，保持一致
- **支持自定义生命周期钩子**（Hooks）：
  - `PreSync`：同步前执行
  - `Sync`：同步时执行
  - `PostSync`：同步完成后执行

可以理解为：它是GitOps的执行官，负责让Git是真理真正落地到 Kubernetes 中









## 安装类型

Argo CD具有两种类型的安装：多租户(multi-tenant)和核心(core)

### 多租户	multi-tenant

**多租户部署**是 Argo CD 最常见的安装方式。这种部署模式通常由平台团队维护，面向多个应用开发团队提供服务

最终用户（即开发团队）可以通过 API Server 使用 Web UI 或 `argocd` 命令行工具来访问 Argo CD。使用命令行工具时，需要先执行 `argocd login <server-host>` 命令来进行登录配置（可以点击 [这里](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_login/) 了解详情）





### 核心	core

**Argo CD Core 部署**主要用于无头（headless）模式下的轻量级部署。这种安装方式适合那些**独立使用 Argo CD** 的集群管理员，他们不需要多租户特性

Core 版包含的组件更少、部署起来也更简单：

- **没有 API Server 和 Web UI**，只能通过 `argocd` CLI 或者直接操作 Kubernetes 对象来管理
- 安装的是各组件的**轻量版**，不支持高可用（非 HA 模式）

有关Argo CD 核心的更多详细信息，请参考 [官方文档](https://argo-cd.readthedocs.io/en/stable/operator-manual/core/)







| 组件名                             | 功能                  | 描述                                     |
| ---------------------------------- | --------------------- | ---------------------------------------- |
| `argocd-server`                    | API 层                | 接收 CLI/UI 请求，处理登录、展示应用状态 |
| `argocd-repo-server`               | 渲染引擎              | 把 Git 里的配置生成 K8s YAML             |
| `argocd-application-controller`    | GitOps 控制核心       | 比较实际状态 vs 期望状态，自动部署       |
| `argocd-dex-server`                | 可选组件              | 做身份认证（OAuth 登录）                 |
| `argocd-redis`                     | 缓存服务              | 给 Controller 提速，非核心               |
| `argocd-applicationset-controller` | 动态 Application 管理 | 自动创建 Application（如多集群部署）     |
| `argocd-notifications-controller`  | 通知控制器            | 发飞书/钉钉通知等                        |





## 安装

更多安装方式可以参考 [官方文档](https://argo-cd.readthedocs.io/en/stable/operator-manual/installation/)

这里选择helm安装，[argocd helm](https://artifacthub.io/packages/helm/argo-cd-oci/argo-cd)



添加仓库

```shell
helm repo add argo https://argoproj.github.io/argo-helm
```



更新仓库

```shell
helm repo update
```



下载包

```bash
helm pull argo/argo-cd
```



解压缩

```shell
tar xf argo-cd-7.8.28.tgz && cd argo-cd
```



修改 `values.yaml`







安装

```bash
helm upgrade --install argocd -n devops --create-namespace .
```

