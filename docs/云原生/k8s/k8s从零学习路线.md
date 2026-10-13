# k8s 从零学习路线

[toc]

> 本笔记是整个 k8s 笔记库的**导航页**：如果你和我一样从 0 开始学 Kubernetes，按下面的阶段顺序读下去即可。每个阶段解决一类问题，笔记之间已经互相交叉引用，读完一篇顺着链接就能进入下一篇。全部内容以 [Kubernetes 官方中文文档](https://kubernetes.io/zh-cn/docs/home/)为纲整理，官方链接都已逐篇验证。

## 学习顺序总览

```bash
阶段 0 准备安装  →  阶段 1 对象与 YAML  →  阶段 2 Pod 核心（重中之重）
→  阶段 3 工作负载  →  阶段 4 配置与存储  →  阶段 5 网络
→  阶段 6 安全与多租户  →  阶段 7 调度进阶  →  阶段 8 调试与运维
```

:::tip 学习建议
Pod 是 k8s 一切概念的基石——Service、Deployment、HPA 全部围绕它运转，所以**阶段 2 值得花掉整个学习过程一半的时间**。后面的工作负载、网络、安全，本质都是在回答"Pod 如何被管理、被访问、被保护"。
:::

## 阶段 0：准备与安装

先把一套集群跑起来，后面所有概念才有落点。安装笔记里 IP、版本全部变量化，Ubuntu / Red Hat 系双系统选项卡联动。

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 0.1 | [使用kubeadm安装最新版k8s集群（v1.37）](k8s安装/使用kubeadm安装最新版k8s集群-v1.37.md) | 1 master + 2 node，完全按官方文档分步手工安装，每步贴官方链接，是理解安装过程的主线 |
| 0.2 | [使用Ansible一键部署k8s集群（v1.37）](k8s安装/使用Ansible一键部署k8s集群-v1.37.md) | 与 0.1 步骤一一对应的自动化版本，失败即中止、可重复执行，想省事可以直接用 |

## 阶段 1：对象模型与 YAML

k8s 里一切都是"资源对象"，而对象都是 YAML 写出来的。这一阶段搞清楚对象模型和 YAML 语法。

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 1.1 | [YAML语法与k8s资源清单](k8s资源/yaml/yaml语法与k8s资源清单.md) | YAML 缩进规则（配层级图）、Maps/Lists、标量类型坑、锚点，以及 apiVersion/kind/metadata/spec 四大字段和 kubectl apply |
| 1.2 | [k8s默认命名空间](k8s资源/namespace/k8s默认命名空间.md) | namespace 是资源隔离的"文件夹"，先建立命名空间直觉 |

## 阶段 2：Pod 核心（重中之重）

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 2.1 | [pod简介](k8s资源/pod/pod简介.md) | Pod 是什么、为什么需要 Pod 而不是直接跑容器 |
| 2.2 | [Pod创建流程详解](k8s资源/pod/Pod创建流程详解.md) | **必读**：kubectl → API Server → etcd → Scheduler → kubelet → CRI 的全景链路，配流程图。宏观视角看懂"一个 YAML 是怎么变成容器的" |
| 2.3 | [infra容器pause详解](k8s资源/pod/infra容器pause详解.md) | Pod 内第一个容器、IP 的真正持有者、PID 1 僵尸进程收割——理解 Pod 网络与进程模型的关键 |
| 2.4 | [pod生命周期](k8s资源/pod/pod生命周期.md) | Phase 状态机、Conditions、重启策略，官方生命周期文档的完整落地 |
| 2.5 | [init容器](k8s资源/pod/init容器.md) | 串行的前置初始化容器 |
| 2.6 | [原生边车容器](k8s资源/pod/原生边车容器.md) | v1.29+ 的 `restartPolicy: Always` 边车，解决传统边车"卡死 Terminating"问题 |
| 2.7 | [pod健康检查](k8s资源/pod/pod健康检查.md) | 存活/就绪/启动三种探针，配"探针失败后会发生什么"对比图 |
| 2.8 | [pod hook](k8s资源/pod/pod%20hook.md) | postStart / preStop 生命周期回调，体面终止 |
| 2.9 | [Pod资源请求、限制与QoS](k8s资源/pod/Pod资源请求、限制与QoS.md) | requests/limits 语义、CPU throttle 与 OOMKill、三大 QoS 类与驱逐顺序——生产必会 |
| 2.10 | [Pod共享宿主机命名空间](k8s资源/pod/Pod共享宿主机命名空间.md) | hostNetwork/hostPID/hostIPC 与 shareProcessNamespace，及对应的安全约束 |

读完想看更深的实现：同目录还有 kubelet 内部视角的 [图解kubernetes pod创建流程大揭秘](k8s资源/pod/图解kubernetes%20pod创建流程大揭秘.md) 和源码视角的 [pod创建流程代码版本kubelet篇](k8s资源/pod/pod创建流程代码版本kubelet篇.md)。

## 阶段 3：工作负载

不直接创建裸 Pod，而是用更高层的控制器管理它们。

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 3.1 | [Deployment简介](k8s资源/工作负载/Deployment/Deployment简介.md) | 最常用：副本管理、滚动更新、回滚。配套实战见[使用 Deployment 运行一个无状态应用](k8s资源/工作负载/Deployment/使用%20Deployment%20运行一个无状态应用.md) |
| 3.2 | [ReplicaSet简介](k8s资源/工作负载/ReplicaSet/ReplicaSet简介.md) | Deployment 背后真正管副本数的角色 |
| 3.3 | [StatefulSet简介](k8s资源/工作负载/StatefulSet/StatefulSet简介.md) | 有状态应用：固定网络标识 + 固定存储 |
| 3.4 | [DaemonSet简介](k8s资源/工作负载/DaemonSet/DaemonSet简介.md) | 每个节点一个，日志/监控/网络组件的标准形态，配套[滚动更新和回滚](k8s资源/工作负载/DaemonSet/DaemonSet滚动更新和回滚.md) |
| 3.5 | [Job简介](k8s资源/工作负载/Job/Job简介.md) | 一次性任务，配套[自动清理已完成的job](k8s资源/工作负载/Job/自动清理已完成的job.md) |
| 3.6 | [CronJob简介](k8s资源/工作负载/CronJob/CronJob简介.md) | 定时任务，配套[使用CronJob运行自动化任务](k8s资源/工作负载/CronJob/使用CronJob运行自动化任务.md) |
| 3.7 | [HorizontalPodAutoscaler简介](k8s资源/工作负载/HorizontalPodAutoscaler/HorizontalPodAutoscaler简介.md) | 自动扩缩容，配套[使用示例](k8s资源/工作负载/HorizontalPodAutoscaler/HorizontalPodAutoscaler使用示例.md)（依赖 metrics-server，见阶段 8） |

## 阶段 4：配置与存储

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 4.1 | [ConfigMap简介](k8s资源/配置/ConfigMap/ConfigMap简介.md) | 配置与镜像解耦，配套[配置 Pod 使用 ConfigMap](k8s资源/配置/ConfigMap/配置%20Pod%20使用%20ConfigMap.md) |
| 4.2 | [Secret简介](k8s资源/配置/Secret/Secret简介.md) | 密码、证书类敏感配置 |
| 4.3 | [PV、PVC与StorageClass基础](k8s资源/存储/PV、PVC与StorageClass基础.md) | **存储地基**：四概念类比、静态/动态供给、accessModes、回收策略、Pending 排查与扩容 |
| 4.4 | [nfs共享存储](k8s资源/存储/nfs共享存储.md) | NFS 实战部署（静态） |
| 4.5 | [OpenEBS](k8s资源/存储/OpenEBS.md) | 云原生存储方案实战（动态） |

## 阶段 5：网络

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 5.1 | [service简介](k8s资源/服务、负载均衡和联网/service/service简介.md) | 一组 Pod 的稳定访问入口与负载均衡，配套 [headless service](k8s资源/服务、负载均衡和联网/service/headless%20service.md) |
| 5.2 | [ipvs规则知识点](kube-proxy代理模式/ipvs/ipvs规则知识点.md) | kube-proxy 的 iptables/ipvs 转发实现 |
| 5.3 | [ingress-nginx安装](k8s资源/服务、负载均衡和联网/ingress/ingress-nginx/ingress-nginx安装.md) | 七层入口，配套[知识点](k8s资源/服务、负载均衡和联网/ingress/ingress-nginx/ingress-nginx知识点.md)、[TLS](k8s资源/服务、负载均衡和联网/ingress/ingress-nginx/ingress-nginx配置tls.md)等系列 |
| 5.4 | [NetworkPolicy网络策略](k8s资源/服务、负载均衡和联网/NetworkPolicy网络策略.md) | Pod 间白名单防火墙；注意 Flannel 不支持，需 Calico 等策略型 CNI |

## 阶段 6：安全与多租户

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 6.1 | [RBAC与ServiceAccount](k8s资源/安全、访问与控制/RBAC与ServiceAccount.md) | 认证→授权→准入三步中的授权层，Role/Binding 四对象与最小权限实战 |
| 6.2 | [Pod安全标准与PSA准入](k8s资源/安全、访问与控制/Pod安全标准与PSA准入.md) | privileged/baseline/restricted 三级别，把 Deployment 改造到 restricted 的完整过程 |
| 6.3 | [LimitRange与ResourceQuota](k8s资源/安全、访问与控制/LimitRange与ResourceQuota.md) | 命名空间级的默认值与总量配额，多团队管控三板斧的另外两板 |

:::tip 三篇的关系
RBAC 管"**谁能操作 API**"，PSA 管"**什么样的 Pod 允许被创建**"，LimitRange/Quota 管"**一个命名空间最多能用多少资源**"——三者合起来构成 k8s 多租户安全的地基。
:::

## 阶段 7：调度进阶

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 7.1 | [将Pod调度到指定节点](k8s资源/调度、抢占和驱逐/将Pod调度到指定节点.md) | nodeName 与 nodeSelector 入门 |
| 7.2 | [污点和容忍度](k8s资源/调度、抢占和驱逐/污点和容忍度.md) | 节点"拒客"机制，master 不跑业务负载的原因 |
| 7.3 | [拓扑分布约束](k8s资源/调度、抢占和驱逐/拓扑分布约束.md) | maxSkew 让副本摊匀在不同节点/机房/可用区，配 maxSkew 计算图解 |

## 阶段 8：调试、监控与运维

| 顺序 | 笔记 | 说明 |
| --- | --- | --- |
| 8.1 | [临时容器与kubectl debug调试Pod](k8s资源/pod/临时容器与kubectl%20debug调试Pod.md) | distroless/崩溃容器没 shell 时的官方调试方案，三种用法 |
| 8.2 | [metrics server安装](监控/metrics-server/metrics%20server安装.md) | `kubectl top` 的数据来源，HPA 的前置依赖 |
| 8.3 | [kubectl top命令解析](k8s命令/kubectl%20top命令解析.md) | 资源用量的日常查看 |
| 8.4 | [Downward API](k8s资源/pod/Downward%20API.md) | 让容器感知自身元数据（Pod 名、IP、标签） |

其余专题（[k8s故障](k8s故障/)、[k8s证书](k8s证书/)、[k8s备份](k8s备份/)、[监控](监控/)、[云原生网关](云原生网关/)、[istio](k8s资源/服务、负载均衡和联网/istio/)、[kubeconfig 管理](k8s资源/kubeconfig/)）按需查阅。

## 官方文档地图（按本路线整理）

| 阶段 | 官方文档入口 |
| --- | --- |
| 安装 | https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/ |
| 对象与 YAML | https://kubernetes.io/docs/concepts/overview/working-with-objects/ |
| Pod 全家桶 | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/ |
| 工作负载 | https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ |
| 配置 | https://kubernetes.io/zh-cn/docs/concepts/configuration/ |
| 存储 | https://kubernetes.io/zh-cn/docs/concepts/storage/ |
| 网络 | https://kubernetes.io/zh-cn/docs/concepts/services-networking/ |
| 安全 | https://kubernetes.io/zh-cn/docs/concepts/security/ |
| 调度 | https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/ |
| 排错 | https://kubernetes.io/zh-cn/docs/tasks/debug/ |

:::caution 中文文档个别页面会 404
官方中文翻译滞后于英文站，个别中文页面可能 404 或内容偏旧（本库笔记中遇到的情况已在对应笔记里注明），此时把 URL 中的 `zh-cn/` 去掉改看英文版即可。
:::
