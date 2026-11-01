# kubectl 命令行工具

## 官方文档参考

| 文档 | 链接 | 说明 |
| --- | --- | --- |
| kubectl 命令行工具（中文页） | https://kubernetes.io/zh-cn/docs/concepts/overview/kubectl/ | 官方中文页，链接有效 |
| The kubectl command-line tool（英文页） | https://kubernetes.io/docs/concepts/overview/kubectl/ | 正文内容以最新英文页为准 |

## 概述

kubectl 是与 Kubernetes 集群通信的主要命令行工具。Kubernetes 提供该命令行工具，通过 **Kubernetes API** 与集群的控制平面进行通信。

| 要点 | 说明 |
| --- | --- |
| 通信方式 | kubectl 通过 Kubernetes API 与集群通信，所有操作都是向 API 服务器发送 HTTP 请求 |
| 默认配置 | 默认查找 `$HOME/.kube` 目录下名为 `config` 的文件 |
| 指定其他配置 | 通过 `KUBECONFIG` 环境变量或 `--kubeconfig` 标志指定其他 kubeconfig 文件 |

```bash
# 通过环境变量指定 kubeconfig
export KUBECONFIG=~/my-cluster-kubeconfig.yaml

# 或者在命令行中临时指定
kubectl get pods --kubeconfig=~/my-cluster-kubeconfig.yaml
```

## kubectl 的角色

kubectl 是创建、查看、更新、删除 Kubernetes 对象的主要接口。它和运行在集群内部的 Kubernetes 组件、组件实现的 Kubernetes API 相互配合。无论你是在笔记本上运行 kubectl，还是在集群内的 Pod 中运行，它都是向 API 服务器发送请求。其他客户端（如客户端库、Headlamp 这类 Web 面板）也通过同一个 API 通信。

## kubectl 的工作原理

| 步骤 | 说明 |
| --- | --- |
| 1. 认证 | kubectl 连接 API 服务器，使用 kubeconfig 文件中定义的集群（cluster）、用户（user）和上下文（context）进行认证 |
| 2. 定位 | 从集群外运行时，kubectl 用 kubeconfig 找到 API 服务器地址和凭据；在 Pod 内运行（如 CI/CD 流水线）时，可使用 Pod 中挂载的 ServiceAccount 令牌做集群内认证 |
| 3. 转换 | 执行命令时，kubectl 将你的意图翻译成一个或多个针对 Kubernetes API 的 HTTP 请求 |
| 4. 处理 | API 服务器校验每个请求，将其应用到存储在 etcd 中的集群状态上，并返回结果 |

也就是说，kubectl 的每一个操作（无论是创建 Deployment 还是读取日志），走的都是同一条 API 驱动的路径。

:::tip 多集群切换是 kubeconfig 的能力
kubeconfig 可以定义多个集群、用户和上下文，因此无需重新配置环境即可在不同集群间切换：

```bash
# 查看当前上下文（当前操作的目标集群）
kubectl config current-context

# 切换到另一个上下文
kubectl config use-context my-production-cluster
```
:::

## kubectl 能做什么

kubectl 支持的操作大致分为以下几类：

| 类别 | 典型用途 |
| --- | --- |
| 管理资源 | 创建、更新、删除 Pod、Deployment、Service 等对象；推荐用 `kubectl apply` 基于配置文件做声明式管理 |
| 查看集群状态 | 列出和描述对象、查看事件、检查资源用量 |
| 调试 | 查看容器日志、在运行中的容器内执行命令、向 Pod 做端口转发 |
| 集群操作 | 维护时排空（drain）节点、封锁（cordon）节点以阻止新调度、管理集群配置 |
| 脚本与自动化 | 以 JSON、YAML 或自定义列（JSONPath）格式化输出，用于脚本和流水线 |

```bash
# 管理资源：声明式应用配置文件（生产推荐）
kubectl apply -f deployment.yaml

# 查看集群状态
kubectl get pods -A
kubectl describe node node-1

# 调试：查看日志 / 进入容器 / 端口转发
kubectl logs my-pod -c my-container
kubectl exec -it my-pod -- /bin/sh
kubectl port-forward my-pod 8080:80

# 集群操作：维护节点
kubectl cordon node-1     # 封锁节点，阻止新 Pod 调度
kubectl drain node-1      # 排空节点，迁移已有 Pod

# 脚本化：自定义输出
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
```

语法、命令参考和更多示例见官方 kubectl reference 文档。

## 声明式 vs 命令式

| 方式 | 代表命令 | 适用场景 | 特点 |
| --- | --- | --- | --- |
| 声明式管理 | `kubectl apply` + 版本受控的配置文件 | 生产工作负载 | 便于追踪变更、协作，可集成 GitOps 工作流 |
| 命令式命令 | `kubectl create`、`kubectl run` | 开发与实验 | 快捷方便，但难以复现和审计 |

:::tip 生产环境坚持声明式
官方建议生产工作负载优先使用 `kubectl apply` 配合版本受控的配置文件（Git 仓库）。命令式命令适合在开发、实验时快速创建对象，但集群里的"真实状态"无法从配置文件追溯，故障排查和回滚都会变得困难。
:::

## 使用插件扩展 kubectl

kubectl 可以通过**插件**添加新的子命令。插件是独立的二进制文件，遵循 `kubectl-<plugin-name>` 命名约定。Kubernetes 社区维护了大量插件，可用 Krew 插件管理器统一管理。

```bash
# 安装 krew 后，以安装插件 tree 为例
kubectl krew install tree

# 安装后即作为子命令使用（来自 kubectl-tree 二进制）
kubectl tree deployment my-app
```

## 版本兼容性

kubectl 支持**与集群控制平面相差 ±1 个次要版本**的版本偏差。例如 kubectl v1.32 可以配合 v1.31、v1.32、v1.33 的控制平面使用。使用兼容的版本可以避免意外行为，详见官方版本偏差策略。

:::caution kubectl 版本不宜过新或过旧
不要用远新于集群的 kubectl 客户端去操作老集群，也不要在集群升级很多轮后还拿着老 kubectl 不动。±1 个次要版本是官方支持范围，超出后可能出现字段不识别、命令行为异常等问题。
:::

## 我的总结与避坑清单

1. **生产只用 `kubectl apply`，不用 `kubectl edit`/`run`**：命令式的临时修改会让 Git 里的配置与集群真实状态漂移，下次 `apply` 时会把你手工改的内容悄悄覆盖回去。
2. **善用 `--dry-run=client -o yaml` 生成模板**：`kubectl create deployment xxx --dry-run=client -o yaml` 能快速得到可维护的 yaml 骨架，比从零手写快且不易写错字段。
3. **KUBECONFIG 支持多文件拼接**：`export KUBECONFIG=~/.kube/cluster-a:~/.kube/cluster-b` 可以合并多个配置文件，再靠 `kubectl config use-context` 切换，避免来回拷贝 config。
4. **操作前先确认上下文**：误删生产资源的常见原因是上下文切错了，重要操作前跑一下 `kubectl config current-context`，或者给上下文起一眼能看出环境的名字。
5. **集群内运行 kubectl 优先用 ServiceAccount 令牌**：在 Pod 里跑 kubectl（如 CI 镜像）不要把管理员 kubeconfig 打进镜像，应使用挂载的 ServiceAccount 并配合 RBAC 最小权限。
6. **保持 kubectl 与集群版本同步**：升级集群时一并升级 kubectl，维持在官方支持的 ±1 次要版本范围内。
7. **插件是普通可执行文件，注意来源安全**：Krew 之外的插件本质上是下载到 PATH 里的 `kubectl-*` 二进制，只从可信来源安装，避免执行来历不明的脚本。
8. **调试三板斧记熟**：`kubectl logs`（看日志）、`kubectl exec`（进容器）、`kubectl port-forward`（本地调试端口），排查问题时基本够用；更复杂场景再用 `kubectl debug` 的临时容器。
