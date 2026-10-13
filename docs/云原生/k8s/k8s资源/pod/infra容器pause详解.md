[toc]

# infra 容器（pause）详解

## 官方文档参考

| 主题 | 官方链接 |
| --- | --- |
| Pause 容器（官方定义，Windows 容器页内的 Pause 容器章节） | https://kubernetes.io/zh-cn/docs/concepts/windows/intro/ |
| 容器运行时（重载沙箱 pause 镜像的配置） | https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/ |
| 容器运行时接口 CRI（PodSandbox 概念） | https://kubernetes.io/docs/concepts/architecture/cri/（中文页暂缺） |
| 在 Pod 中的容器之间共享进程命名空间 | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/share-process-namespace/ |
| pause 镜像源码（kubernetes 仓库 build/pause） | https://github.com/kubernetes/kubernetes/tree/master/build/pause |
| Pod 概述（共享上下文） | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/ |

> 相关笔记：[Pod创建流程详解](./Pod创建流程详解.md) 讲了 pause 在创建流程中的位置；kubelet 视角的深入分析见[图解版](./图解kubernetes%20pod创建流程大揭秘.md)（4. 运行沙箱容器一节）。

## 1. pause 是什么

每个 Pod 里其实都有**一个你看不见的容器**——infra 容器，也叫 **pause 容器**或**沙箱（sandbox）容器**。它是 CRI 运行时创建 Pod 时**最先启动**的容器，运行官方维护的 `registry.k8s.io/pause` 镜像——一个用 C 写的极简程序，启动后永远 sleep，几乎不消耗资源（镜像仅约 300KB）。

官方对它的定义（引自[官方文档](https://kubernetes.io/zh-cn/docs/concepts/windows/intro/) Pause 容器章节）：

> 在 Kubernetes Pod 中，首先创建一个基础容器或 "pause" 容器来承载容器。在 Linux 中，构成 Pod 的 cgroup 和命名空间维持持续存在需要一个进程；而 pause 进程就提供了这个功能。属于同一 Pod 的容器（包括基础容器和工作容器）共享一个公共网络端点（相同的 IPv4 和/或 IPv6 地址，相同的网络端口空间）。Kubernetes 使用 pause 容器以允许工作容器崩溃或重启，而不会丢失任何网络配置。

一句话总结：**pause 的意义不是干活，而是"占住"命名空间——它是整个 Pod 的地基**。

![pause 命名空间共享原理](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pause-ns-sharing.png)

## 2. 为什么需要 pause

### 2.1 Linux 命名空间需要进程维系

Linux 命名空间的生命周期跟着进程走：**命名空间由属于它的进程维系，最后一个进程退出，命名空间就销毁**。而 Pod 的模型要求 net/ipc/uts 等命名空间在整个 Pod 生命周期内持续存在——所以必须有一个"钉子户"进程，从 Pod 创建活到 Pod 删除。pause 就是这个钉子户。

### 2.2 Pod IP 配置在 pause 的网络命名空间里

创建时序决定了网络归属：

1. CRI（containerd 等）先启动 **pause**，它持有 NET NS
2. **CNI 插件**在 pause 的 NET NS 里配置 eth0、分配 Pod IP
3. 业务容器启动时 **join（setns）到 pause 的 NET NS**，从而共享同一网络栈

所以严格地说：**Pod IP 不属于任何业务容器，它属于 pause 的网络命名空间**。

### 2.3 业务容器崩溃重启，网络不受影响

这是官方明确说明的设计目标：

![崩溃重启对比](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pause-restart.png)

如果没有 pause、由某个业务容器持有网络命名空间，那它一崩溃，整个 Pod 的 IP、iptables 规则全部消失，其他容器瞬间断网。有了 pause，工作容器怎么 crash、重启多少次，Pod IP 都不变，Service 和客户端完全无感知——这也解释了[容器探针](./pod健康检查.md)重启容器时为什么不需要重新分配 IP。

## 3. PID 1 与僵尸进程收割

Linux 里 PID 1（init 进程）有一个天职：**收割孤儿进程**。子进程退出后父进程必须 `wait()` 它，否则变成僵尸进程占用进程表项；父进程先退出时，子进程被过继给 PID 1 处理。

在 Pod 的 PID 命名空间里，pause 进程就是 **PID 1**，天然承担这个职责：

![PID 1 与僵尸进程](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pause-pid1.png)

需要注意两种模式的差别：

- **默认（各容器 PID NS 独立）**：每个业务容器内自己的主进程就是该容器的 PID 1，应用要自己处理好子进程和信号（这也是很多应用在容器里产生僵尸进程的原因）
- **`spec.shareProcessNamespace: true`**：所有容器共享一个 PID 命名空间，pause 成为全 Pod 唯一的 PID 1，统一负责收割孤儿进程；代价是所有容器的进程彼此可见（配置方法见[官方任务文档](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/share-process-namespace/)）

:::caution 注意
官方提醒：开启进程命名空间共享后，容器内进程能看到同一 Pod 其他容器的进程，要评估安全影响；另外 Windows 不支持该特性（Windows 无法共享进程命名空间，Pod 内只能共享网络）。
:::

## 4. 在节点上观察 pause

`kubectl get pod` 永远看不到 pause——它是 CRI 层面创建的基础设施容器，不属于 `spec.containers`，用户无法配置它。到节点上用 `crictl` 就现形了：

```bash
# 列出节点上所有容器（示例输出）
$ crictl ps
CONTAINER     IMAGE                          CREATED      STATE    NAME              ATTEMPT  POD
c89f1a2b3d4   registry.k8s.io/pause:3.10     3 days ago   Running  k8s_POD_web       0        web
e4f5a6b7c8d   nginx:1.27                     3 days ago   Running  k8s_nginx_web     0        web

# 每个 Pod 沙箱也独立可见
$ crictl pods
POD           NAME    STATE    NAMESPACE   INFRA-ID
9a8b7c6d5e4   web     Ready    default     c89f1a2b3d4
```

可以看到：**一个 Pod = 1 个 pause 容器 + N 个业务容器**。这也是排查"节点上容器数比 Pod 数多"这类疑问的答案——多出来的就是 pause。

## 5. 运维相关：pause 镜像的配置

### 5.1 覆盖沙箱镜像（国内环境常见操作）

`registry.k8s.io` 在国内经常拉不下来，[容器运行时官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)给出了各运行时的覆盖方法：

**containerd**（`/etc/containerd/config.toml`）：

```toml
[plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "registry.k8s.io/pause:3.10"
```

修改后需 `systemctl restart containerd`。

**CRI-O**（`/etc/crio/crio.conf`，支持 `systemctl reload crio` 热加载）：

```toml
[crio.image]
pause_image = "registry.k8s.io/pause:3.10"
```

**cri-dockerd**：命令行参数 `--pod-infra-container-image` 指定。

:::tip 国内镜像源
把 `sandbox_image` 换成国内可达的源（如阿里云 `registry.aliyuncs.com/google_containers/pause:3.10`）是国内部署 k8s 的标准操作。用 kubeadm 装集群时的统一镜像源替换思路见[使用kubeadm安装最新版k8s集群](../../k8s安装/使用kubeadm安装最新版k8s集群-v1.37.md)第 6 节「中国用户常见问题」。
:::

### 5.2 版本说明

官方文档不同页面的 pause 镜像版本示例并不完全同步（容器运行时页配置示例为 `pause:3.10`，部分页面仍写 `3.6`），**以你集群 containerd/CRI-O 配置里实际声明的版本为准**；升级 k8s 大版本时建议同步检查 pause 版本。

## 6. 常见问题速查

| 问题 | 答案 |
| --- | --- |
| Pod IP 到底属于谁？ | 属于 pause 的 NET NS，业务容器只是 join 进来 |
| 业务容器重启为什么 IP 不变？ | NET NS 由 pause 持有，业务容器生死不影响它（官方设计目标） |
| 为什么 kubectl 看不到 pause？ | 它是 CRI 创建的 infra 容器，不在 `spec.containers` 里，只能用 crictl/ctr 在节点上看到 |
| pause 挂了会怎样？ | Pod 沙箱损坏，kubelet 会重建整个沙箱，**Pod 内所有容器一起重启**，并可能分配新 IP |
| pause 占用资源吗？ | 几乎不占：极简 C 程序 + 约 300KB 镜像，启动后永远 sleep |
| Windows 节点也有 pause 吗？ | 有。但 Windows 没有 namespace 共享机制，Pod 内只能共享网络（pause 同样先创建并持有网络端点） |
| 一个节点上容器数比 Pod 数多？ | 正常，每个 Pod 多一个 pause 容器，`crictl ps` 可验证 |

## 7. 小结

- pause 是 Pod 的**基础设施容器**：最先创建、永远 sleep、用户不可见也不可配置
- 三大职责：**占住命名空间**（net/ipc/uts + 维系 cgroup）、**提供稳定网络端点**（Pod IP 归它）、**充当 PID 1**（收割孤儿进程）
- 它是「Pod 内容器共享网络、崩溃重启 IP 不变」这些 Kubernetes 行为的底层实现基础
- 国内环境记得覆盖 `sandbox_image`，避免拉取 `registry.k8s.io/pause` 失败卡住 Pod 创建
