# Kubernetes架构

Kubernetes 集群由一个**控制平面（Control Plane）**和一组用于运行容器化应用的工作机器（称作**节点 Node**）组成。每个集群至少需要一个工作节点来运行 Pod。工作节点托管组成应用负载的 Pod；控制平面管理集群中的工作节点和 Pod。生产环境中，控制平面通常跨多台计算机运行，而集群通常运行多个节点，以提供容错和高可用。

下面这张图给出了一个完整可运行的 Kubernetes 集群的组件全景：

![Kubernetes 集群组件全景](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/arch_cluster.png)

## 官方文档参考

| 文档 | 链接 |
| --- | --- |
| Kubernetes 架构（官方中文） | [https://kubernetes.io/zh-cn/docs/concepts/architecture/](https://kubernetes.io/zh-cn/docs/concepts/architecture/) |

> 说明：图中每个节点都运行 kube-proxy 组件，以确保 Service API 和相关行为在集群网络上可用；但如果所用的网络插件为流量代理提供了自己的第三方实现，节点便不需要运行 kube-proxy。组件的实际分布可能根据特定的集群设置和要求而有所不同。

## 控制平面组件

控制平面组件会为集群做出**全局决策**（比如资源的调度），并**检测和响应集群事件**（例如当不满足 Deployment 的 `replicas` 字段时，要启动新的 Pod）。控制平面组件可以在集群中的任何节点上运行，但为了简单起见，安装脚本通常会在同一台计算机上启动所有控制平面组件，并且不会在该计算机上运行用户容器。

| 组件 | 角色 | 关键要点 |
| --- | --- | --- |
| kube-apiserver | 公开 Kubernetes API、处理请求，是控制平面的前端 | 主要实现是 `kube-apiserver`；设计上支持**水平扩缩**，可运行多个实例并在其间平衡流量 |
| etcd | 一致且高可用的键值存储，用作 Kubernetes 所有集群数据的后台数据库 | 必须针对 etcd 数据制定**备份计划**；深入知识见 etcd 官方文档 |
| kube-scheduler | 监视新创建的、未指定运行节点的 Pod，并选择节点让 Pod 在上面运行 | 调度决策考虑：单个/多个 Pod 集合的资源需求、软硬件及策略约束、亲和性及反亲和性规范、数据位置、工作负载间的干扰、最后时限 |
| kube-controller-manager | 运行控制器进程的控制平面组件 | 每个控制器逻辑上是单独的进程，但为了降低复杂性被编译到同一个可执行文件、在同一进程中运行；可水平扩容 |
| cloud-controller-manager | 嵌入特定于云平台的控制逻辑，将集群连接到云提供商 API 之上 | 把"与云平台交互的组件"和"与集群交互的组件"分离开来；**仅运行云平台相关控制器**——自建/本地学习环境不含此组件 |

kube-controller-manager 中的典型控制器举例：

| 控制器 | 职责 |
| --- | --- |
| Node 控制器 | 在节点出现故障时进行通知和响应 |
| Job 控制器 | 监测代表一次性任务的 Job 对象，然后创建 Pod 来运行这些任务直至完成 |
| EndpointSlice 控制器 | 填充 EndpointSlice 对象（提供 Service 和 Pod 之间的链接） |
| ServiceAccount 控制器 | 为新的命名空间创建默认的 ServiceAccount |

cloud-controller-manager 中依赖云平台驱动的控制器：

| 控制器 | 职责 |
| --- | --- |
| Node 控制器 | 在节点终止响应后检查云平台，以确定节点是否已被删除 |
| Route 控制器 | 在底层云基础架构中设置路由 |
| Service 控制器 | 创建、更新和删除云平台上的负载均衡器 |

:::tip 为什么 kube-apiserver 可以水平扩缩而 etcd 要备份
kube-apiserver 是无状态的 API 网关，副本之间靠负载均衡分摊流量即可扩缩；而 etcd 是**唯一的有状态组件**，集群的全部对象数据都在它里面，一旦损坏且无备份，整个集群状态（Deployment、Secret、Service 等）全部丢失。生产环境务必对 etcd 做定期快照与异地存放。
:::

## 节点组件

节点组件在每个节点上运行，负责维护运行的 Pod 并提供 Kubernetes 运行时环境。

| 组件 | 是否必需 | 职责 |
| --- | --- | --- |
| kubelet | 必需 | 在集群每个节点上运行，保证容器都运行在 Pod 中。接收通过各类机制提供给它的 PodSpec，确保其中描述的容器处于运行状态且健康；**不管理不是由 Kubernetes 创建的容器** |
| kube-proxy | 可选 | 每个节点上运行的网络代理，实现 Kubernetes Service 概念的一部分。维护节点上的网络规则，允许从集群内部或外部的网络会话与 Pod 通信。若操作系统提供可用的数据包过滤层（如 iptables/IPVS），则通过它实现规则；否则仅做流量转发。若网络插件自行实现等效的数据包转发，可不运行 kube-proxy |
| 容器运行时 | 必需 | 负责管理 Kubernetes 环境中容器的执行和生命周期。Kubernetes 支持多种运行时，如 containerd、CRI-O 以及其他任何实现 Kubernetes CRI（容器运行环境接口）的运行时 |

## 插件（Addons）

插件使用 Kubernetes 资源（DaemonSet、Deployment 等）实现集群功能。因为这些插件提供**集群级别**的功能，插件中命名空间域的资源属于 `kube-system` 命名空间。

| 插件 | 作用 |
| --- | --- |
| DNS | 几乎所有集群都应有**集群 DNS**：它是一个 DNS 服务器，与环境中的其他 DNS 服务器一起工作，为 Kubernetes 服务提供 DNS 记录；Kubernetes 启动的容器自动将此 DNS 服务器包含在其 DNS 搜索列表中 |
| Web 界面（Dashboard） | 集群的通用、基于 Web 的用户界面，可管理集群中运行的应用程序以及集群本身，并进行故障排除 |
| 容器资源监控 | 将容器的一些常见时序度量值保存到集中数据库中，并提供浏览这些数据的界面 |
| 集群层面日志 | 将容器日志数据保存到集中的日志存储中，提供搜索和浏览接口 |
| 网络插件 | 实现容器网络接口（CNI）规范的软件组件，负责为 Pod 分配 IP 地址，并使这些 Pod 能在集群内部相互通信 |

## 架构变种

核心组件保持一致，但它们的**部署和管理方式**可能有所不同：

### 控制平面部署选项

| 部署方式 | 说明 |
| --- | --- |
| 传统部署 | 控制平面组件直接在专用机器或虚拟机上运行，通常作为 systemd 服务进行管理 |
| 静态 Pod | 控制平面组件作为静态 Pod 部署，由特定节点上的 kubelet 管理；这是 kubeadm 这类工具常用的方法 |
| 自托管 | 控制平面在 Kubernetes 集群本身内部作为 Pod 运行，由 Deployment、StatefulSet 或其他 Kubernetes 原语管理 |
| 托管 Kubernetes 服务 | 云平台通常将控制平面抽象出来，将其组件作为服务的一部分进行管理 |

### 工作负载调度说明

- 较小或开发集群中，控制平面组件和用户工作负载可能在**同一节点**上运行。
- 较大的生产集群通常将特定节点**专用于**控制平面组件，将其与用户工作负载隔离。
- 一些组织在控制平面节点上运行关键组件或监控工具。

### 集群管理工具

kubeadm、kops 和 Kubespray 等工具提供了不同的集群部署和管理方法，每种方法都有自己的组件布局和管理方式。

### 定制和可扩展性

- 可部署**自定义调度器**与默认调度器协同工作，也可完全替换默认调度器。
- API 服务器可通过 **CustomResourceDefinition（CRD）** 和 **API 聚合（Aggregation）** 进行扩展。
- 云平台可使用 **cloud-controller-manager** 与 Kubernetes 深度集成。

## 我的总结与避坑清单

1. 记忆主线：控制平面五件套（apiserver / etcd / scheduler / controller-manager / cloud-controller-manager）+ 节点三件套（kubelet / kube-proxy / 容器运行时）；kube-proxy 是唯一标注"可选"的节点组件。
2. etcd 是集群唯一真相来源，改apiserver、加节点都不会丢数据，但 etcd 磁盘坏且无备份 = 集群报废；生产必备份且定期演练恢复。
3. kubelet 只管 Kubernetes 创建的容器（通过 CRI），手动 `docker run` 起的容器不在它的管辖范围内，别指望 kubelet 帮你重启手工容器。
4. cloud-controller-manager 只在对接云厂商时存在；自建集群报错找不到它属于正常现象，不要盲目安装。
5. 组件部署方式多样：kubeadm 用静态 Pod 托管控制平面（kubelet 是"最底层"组件），排查控制平面问题要从静态 Pod 清单入手，而不是 `systemctl status kube-apiserver`。
6. 想扩展 API 优先考虑 CRD 而不是改内核代码；CRD + 聚合 API 是官方认可的扩展路径。
7. 节点上的网络规则由 kube-proxy 维护，但 CNI 插件可以接管这部分职责；遇到 Service 不通先确认 kube-proxy 模式（iptables/IPVS）与 CNI 是否冲突或重复。
