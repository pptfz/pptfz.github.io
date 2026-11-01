# K8s 概述

## 官方文档参考

| 文档 | 链接 |
| --- | --- |
| Kubernetes 概述（本篇来源） | https://kubernetes.io/zh-cn/docs/concepts/overview/ |
| Kubernetes 组件 | https://kubernetes.io/zh-cn/docs/concepts/overview/components/ |
| Kubernetes API | https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/ |
| kubectl 命令行工具 | https://kubernetes.io/zh-cn/docs/concepts/overview/kubectl/ |
| Kubernetes 架构 | https://kubernetes.io/zh-cn/docs/concepts/architecture/ |

> 以上链接均已逐一验证可访问（2026-11）。

## Kubernetes 是什么

> Kubernetes 是一个**可移植、可扩展的开源平台**，用于管理容器化的工作负载和服务，方便进行**声明式配置和自动化**。

- 名字源于希腊语，意为"舵手/飞行员"；缩写 **K8s** 是因为 K 和 s 之间有 8 个字母
- Google 于 **2014 年开源**，建立在 Google 十几年大规模生产级工作负载的运行经验之上（内部前身是 Borg）
- 核心思想：你**声明期望状态**，Kubernetes 通过一组独立的、可组合的控制进程**持续调和**实际状态向期望状态靠拢——不是按 A→B→C 执行工作流的"编排器"，而是"消除编排需求"的控制系统

## 部署方式的三个时代

| 时代 | 特点 | 问题 |
| --- | --- | --- |
| **传统部署**（物理机） | 应用直接跑在物理服务器上 | 应用间没有资源边界，互相抢资源；一机一应用则浪费严重、成本高 |
| **虚拟化部署**（VM） | 单台物理机跑多个虚拟机，应用隔离在各自 VM 中 | 资源利用率提升、可扩展，但每个 VM 是完整机器（含整套 OS），笨重 |
| **容器部署** | 容器类似 VM 但**共享宿主机 OS**，隔离更宽松，轻量、可移植 | ——当前主流 |

容器流行的原因：镜像构建敏捷（对比 VM 镜像）、镜像不可变带来的可靠回滚、开发与运维职责解耦（构建期做镜像而非部署期）、开发/测试/生产环境一致性、跨云与跨发行版可移植、微服务化、资源隔离与高利用率。

## Kubernetes 为你提供什么（10 项能力）

| 能力 | 一句话说明 |
| --- | --- |
| **服务发现与负载均衡** | 用 DNS 名或 IP 暴露容器；流量大时自动负载均衡分散流量 |
| **存储编排** | 自动挂载所选存储系统（本地存储、公有云盘等） |
| **自动化上线和回滚** | 描述期望状态后，K8s 以受控速率把实际状态调整为期望状态（滚动更新/回滚） |
| **自动装箱（bin packing）** | 声明每个容器的 CPU/内存需求，K8s 把容器调度到节点上最优利用资源 |
| **自愈（self-healing）** | 重启失败容器、替换重建、杀死不响应健康检查的容器，就绪前不对客户端暴露 |
| **Secret 与配置管理** | 密码、OAuth 令牌、SSH 密钥的存储与更新，无需重建镜像、不在栈配置中暴露 |
| **批量执行** | 除服务外还能管理批处理与 CI 工作负载，失败容器按需替换 |
| **水平扩缩** | 一条命令、UI 或基于 CPU 使用率的自动扩缩 |
| **IPv4/IPv6 双栈** | 为 Pod 和 Service 分配 IPv4 与 IPv6 地址 |
| **为可扩展性设计** | 不改上游源码即可为集群添加特性（CRD、聚合层等） |

## Kubernetes 不是什么

**不是传统的、包罗万象的 PaaS**。它工作在容器层而非硬件层，提供部署、扩缩、负载均衡等 PaaS 常见能力，但日志、监控、告警等默认方案是**可选、可插拔**的——K8s 提供构建开发者平台的积木，把选择权留给你。

具体不做的事：

- **不限制应用类型**：无状态、有状态、数据处理类工作负载都可以跑；能在容器里跑的应用就能在 K8s 上跑好
- **不部署源代码、不构建应用**：CI/CD 流程由组织的文化偏好和技术需求决定
- **不内置应用级服务**：不提供消息总线、Spark、MySQL、缓存、Ceph 这类中间件——它们可以跑在 K8s 上，或通过可移植机制访问
- **不指定日志/监控/告警方案**：只提供概念验证性的集成和指标收集导出机制
- **不提供也不强制某种配置语言/系统**（如 Jsonnet）：只提供声明式 API，任何声明式规范都可以对接
- **不做机器配置/维护/自愈**：节点本身的系统管理不在职责范围内

:::tip 一句话理解"消除编排"
传统编排是"先做 A，再做 B，再做 C"的工作流执行；K8s 是一组独立控制回路的集合，**不关心你怎么从 A 到 C**，只持续把现状推向声明的期望状态。去中心化的控制让系统更易用、更健壮、更有弹性。
:::

## 接下来读什么

- **Kubernetes 组件**（控制平面四大件 + 节点组件）：https://kubernetes.io/zh-cn/docs/concepts/overview/components/
- **Kubernetes API**（API 服务器、Discovery/OpenAPI、API 组与版本）：https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/
- **kubectl 命令行工具**：https://kubernetes.io/zh-cn/docs/concepts/overview/kubectl/
- **Kubernetes 架构**（集群全景、控制平面部署选项、架构变种）：https://kubernetes.io/zh-cn/docs/concepts/architecture/
