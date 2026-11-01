# Kubernetes 组件

## 官方文档参考

| 文档 | 链接 | 说明 |
| --- | --- | --- |
| Kubernetes 组件（中文页） | https://kubernetes.io/zh-cn/docs/concepts/overview/components/ | 官方中文页，链接有效 |
| Kubernetes Components（英文页） | https://kubernetes.io/docs/concepts/overview/components/ | 正文内容以最新英文页为准 |

## 概述

一个 Kubernetes 集群由**控制平面（Control Plane）**和一个或多个**工作节点（Worker Node）**组成。组件的整体分工如下：

| 分类 | 职责 | 部署位置 |
| --- | --- | --- |
| 控制平面组件 | 对集群做出全局决策（如调度、检测并响应事件），维护集群整体状态 | 通常部署在控制平面节点上，也可在单机上以容器方式运行（如 kind、minikube） |
| 节点组件 | 在每个节点上运行，维护运行中的 Pod 并提供 Kubernetes 运行时环境 | 集群中的每一个节点 |
| 插件（Addons） | 扩展 Kubernetes 的功能 | 以 Deployment/DaemonSet 等 Pod 方式运行在集群内 |

## 控制平面组件

控制平面组件负责管理集群的整体状态，例如做出全局决策（调度）、检测并响应集群事件（如 Deployment 副本数不满足时启动新 Pod）。

| 组件 | 是否可选 | 核心职责 |
| --- | --- | --- |
| kube-apiserver | 必需 | 暴露 Kubernetes HTTP API 的核心组件服务器，是所有 REST 操作的入口，也是控制平面的前端 |
| etcd | 必需 | 一致性且高可用的键值存储，保存 API 服务器**全部数据**（集群所有状态都在这里） |
| kube-scheduler | 必需 | 监视尚未绑定到节点的新创建的 Pod，为每个 Pod 选择一个合适的节点来运行 |
| kube-controller-manager | 必需 | 运行各种控制器进程，通过 API 服务器实现 Kubernetes API 的行为（如节点控制器、Job 控制器、EndpointSlice 控制器等） |
| cloud-controller-manager | 可选 | 嵌入特定云平台的控制逻辑，与底层云服务商 API 集成（如节点、路由、服务类型的控制器） |

:::tip 为什么 etcd 如此重要
etcd 中保存了集群的**全部状态数据**，是集群唯一的事实来源（Single Source of Truth）。生产环境务必对 etcd 做定期备份，并部署奇数个（3、5、7）实例组成仲裁以保证高可用。
:::

### cloud-controller-manager 的内嵌控制器（示例）

云控制器管理器内部运行多个基于云驱动实现的控制器：

| 控制器 | 职责 |
| --- | --- |
| 节点控制器 | 在节点停止响应后，在云侧创建标签/注释，并删除不可用节点 |
| 路由控制器 | 在底层云基础设施中设置路由 |
| 服务控制器 | 创建/更新/删除云负载均衡器 |

## 节点组件

节点组件在每个节点上运行，负责维护运行中的 Pod 并提供 Kubernetes 运行时环境。

| 组件 | 是否可选 | 核心职责 |
| --- | --- | --- |
| kubelet | 必需 | 保证 Pod（及其容器）正常运行。它接收 PodSpec 描述，确保其中描述的容器健康运行 |
| kube-proxy | 可选 | 维护节点上的网络规则，实现 Service 的虚拟 IP（基于操作系统的数据包过滤层实现，iptables/IPVS 等） |
| 容器运行时 | 必需 | 负责运行容器的软件。Kubernetes 支持符合 CRI 的运行时，如 containerd、CRI-O |

:::caution kube-proxy 虽然可选但基本必备
kube-proxy 在官方标注中是可选组件，那是因为某些特殊场景（如全部使用 HostNetwork 直连）可以不用它。但在绝大多数生产集群中，Service 的流量转发都依赖 kube-proxy，删掉它集群服务发现会直接失效。
:::

此外，节点上可能还需要额外软件，例如在 Linux 节点上通常还会运行 systemd 来监管本地组件。

## 插件（Addons）

插件使用 Kubernetes 资源（Deployment、DaemonSet 等）实现，扩展了集群的功能。几个重要的插件：

| 插件 | 作用 |
| --- | --- |
| DNS | 为整个集群提供 DNS 解析（CoreDNS），是集群必备插件之一 |
| Web 界面（Dashboard） | 通过 Web 界面管理集群 |
| 容器资源监控 | 收集并存储容器指标（如 Metrics Server + Prometheus 等） |
| 集群层面日志 | 将容器日志保存到集中式日志存储（如 ELK/Loki 等方案） |

:::tip 声明式 yaml 部署插件
插件本身也是 Kubernetes 资源，一般用声明式方式部署。例如一个典型的插件部署清单长这样：

```yaml
apiVersion: apps/v1
kind: Deployment          # 插件通常以 Deployment 或 DaemonSet 形式部署
metadata:
  name: coredns
  namespace: kube-system  # 集群级插件一般放在 kube-system 名字空间
spec:
  replicas: 2             # 控制副本数保证插件自身高可用
  selector:
    matchLabels:
      k8s-app: kube-dns
  template:
    spec:
      containers:
        - name: coredns
          image: registry.k8s.io/coredns/coredns:v1.11.1
```
:::

## 架构的灵活性

Kubernetes 允许这些组件以灵活的方式部署和管理，架构可适应从小型开发环境到大规模生产部署的各种需求。更详细的组件信息与集群架构配置方式，可参考官方 Cluster Architecture 页面。

:::caution 组件可能分布在同一物理节点
在测试环境（kubeadm 单机、kind、minikube）中，控制平面组件和工作节点组件常常运行在**同一台机器**上；而在生产环境中应将控制平面与工作节点分离，避免业务负载抢占控制平面资源。
:::

## 我的总结与避坑清单

1. **etcd 必须有备份**：集群所有对象状态都存在 etcd 里，etcd 数据损坏等于集群报废；kubeadm 集群建议配合 etcd snapshot 定时备份，恢复时也要恢复 etcd 而不是只重建控制平面。
2. **etcd 部署奇数个实例**：3 或 5 节点的 etcd 才能形成仲裁，偶数节点不仅不增加容错能力，还会降低可用性。
3. **控制平面与业务分离**：生产集群不要把 Pod 调度到控制平面节点（kubeadm 默认给控制平面节点打了 taint），避免业务负载挤占 apiserver/scheduler/etcd 资源。
4. **不要绕过 kube-apiserver 直接改 etcd**：所有变更都应走 apiserver，直接写 etcd 会绕过校验和准入控制，极易造成数据不一致。
5. **云控制器管理器按需部署**：在云上部署集群时应启用 cloud-controller-manager（否则 LoadBalancer 类型的 Service 不会真正生效）；自建机房则无需安装。
6. **kube-proxy 模式提前规划**：大规模集群建议使用 IPVS 模式，iptables 模式在 Service 数量多时规则线性增长，转发性能会明显下降。
7. **容器运行时只认 CRI**：Docker 作为内置运行时已被移除（1.24 起），新集群统一使用 containerd 或 CRI-O，不要再基于 dockershim 搭建。
8. **DNS 插件不能省**：CoreDNS 是 Service 名称解析的基础，很多"Pod 之间通过服务名访问不通"的问题根源就是 CoreDNS 异常，排查网络问题时先看它。
9. **组件版本与集群版本保持一致或近似**：升级集群时控制平面各组件应随集群一起升级，避免新旧组件之间出现不兼容的 API 行为。
