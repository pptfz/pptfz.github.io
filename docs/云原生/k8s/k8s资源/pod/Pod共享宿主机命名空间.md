# Pod 共享宿主机命名空间

[toc]

## 引言

绝大多数 Pod 运行在 Kubernetes 精心搭建的"隔离舱"里：独立网络栈、独立进程空间、独立 IPC。但有一类特殊组件——节点监控（node-exporter）、网络插件（CNI）、kube-proxy——它们恰恰**需要打破这层隔离**，直接使用或观测宿主机本身。让 Pod 打破隔离舱的，就是 Pod spec 里的三个字段：`hostNetwork`、`hostPID`、`hostIPC`。

本文面向从 0 学 k8s 的读者，逐一讲清这三个字段的用途、风险与典型使用场景，并顺带讲清容易与之混淆的 `shareProcessNamespace`（Pod 内部进程共享）。Pod 与 pause 容器的基础知识见 [pod简介](./pod简介.md) 与 [infra容器pause详解](./infra容器pause详解.md)。

## 官方文档参考

| 页面名 | URL |
| --- | --- |
| 在 Pod 中的容器之间共享进程命名空间（任务） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/share-process-namespace/ |
| Pod（概念，含共享上下文与 Pod 联网） | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/ |
| 管理集群（任务总目录） | https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/ |

> 以上链接均为 Kubernetes 中文官网地址，已逐一验证有效。

## 1. 先回顾：默认情况下 Pod 隔离了什么

正常 Pod 的隔离来自 Linux 命名空间，这些命名空间由 Pod 内第一个启动的 pause 容器持有（详见 [infra容器pause详解](./infra容器pause详解.md)）：

| 命名空间 | 隔离内容 | Pod 默认行为 |
| --- | --- | --- |
| NET（网络） | 网卡、IP、端口、路由表 | 每个 Pod 独立 IP，独立端口空间 |
| PID（进程） | 进程编号、进程树 | 各容器进程互不可见 |
| IPC（进程间通信） | SystemV 信号量、POSIX 共享内存 | Pod 内容器间隔离于宿主机 |

而 hostNetwork / hostPID / hostIPC 的本质，就是**让 Pod 放弃自己的某个命名空间，改为直接加入宿主机的对应命名空间**。

![Pod 共享宿主机命名空间的三个字段](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-host-namespaces.png)

## 2. hostNetwork：使用宿主机网络栈

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-host-network
spec:
  hostNetwork: true        # Pod 共享宿主机网络命名空间
  containers:
    - name: app
      image: nginx:1.27
```

开启后的行为：

- **Pod 不再分配独立的 Pod IP**，Pod 内看到的网卡就是节点的 eth0，IP 即节点 IP；
- 容器监听的端口就是**节点上的端口**，无需也不应再配 NodePort/hostPort；
- 无法通过 `localhost` 访问"其他 Pod"——同一节点上用宿主机网络的其他进程都能被 localhost 直达。

### 典型场景

- **kube-proxy / CNI 组件**（calico-node、flannel 等）：需要直接操作节点网络、监听节点端口，官方与社区组件普遍使用 hostNetwork；
- **node-exporter**：Prometheus 的节点指标采集器，需要采集节点级网络指标并以节点 IP 暴露端口；
- **网络性能敏感组件**：省去 veth/ NAT 一层的转发开销。

### 风险

- **端口冲突**：容器监听的端口与节点上已有进程冲突时直接启动失败；
- **攻击面扩大**：Pod 拿到的是节点 IP，一旦容器被攻破，攻击者对外的立足点就是节点网络本身；
- **调度器不感知端口占用**：多个 hostNetwork Pod 若监听同一端口，可能被调度到同一节点互相冲突。

## 3. hostPID：看见宿主机的所有进程

```yaml
spec:
  hostPID: true            # Pod 共享宿主机 PID 命名空间
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
```

开启后的行为：容器内的 `ps aux` 看到的不再是容器自己的进程树，而是**节点上的全部进程**——包括 kubelet、容器运行时、以及其他 Pod 的进程。进程视角从"隔离舱小房间"切换成了"整台机器大厅"。

### 典型场景

- **监控采集**：需要按进程维度采集节点指标（如 process-exporter）；
- **故障排查**：节点级调试工具 Pod 需要观察真实进程、向宿主机进程发送信号（配合 privileged 使用）；
- **安全 agent**：基于进程行为的入侵检测（如 Falco 类组件）需要全节点进程视图。

### 风险

- 能观测到其他 Pod 的进程命令行、环境变量级别的信息（`/proc` 泄露）；
- 配合 capability 提权时可对宿主机任意进程发信号，等于获得节点级杀伤能力。

## 4. hostIPC：与宿主机进程共享 IPC 资源

```yaml
spec:
  hostIPC: true            # Pod 共享宿主机 IPC 命名空间
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "ipcs | head"]
```

开启后的行为：容器与宿主机进程共享 SystemV 信号量、消息队列和 POSIX 共享内存段（`ipcs` 可查看宿主机的 IPC 对象）。

这是三者中**使用场景最少**的字段：只有极少数遗留应用依赖宿主机上的 SystemV IPC（一些传统 HPC、数据库共享内存方案），云原生组件几乎不用。风险在于：能读到宿主机共享内存中的数据，也能干扰宿主机进程的 IPC 同步，因此默认保持关闭。

## 5. shareProcessNamespace：Pod 内部的进程共享（别与 hostPID 混淆）

`hostPID` 打通的是"Pod 与宿主机"，而 `shareProcessNamespace` 打通的是"Pod 内部各容器之间"：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: two-containers
spec:
  shareProcessNamespace: true   # Pod 内所有容器共享 PID 命名空间
  containers:
    - name: nginx
      image: nginx:1.27
    - name: shell
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
      securityContext:
        capabilities:
          add: ["SYS_PTRACE"]   # 需要 ptrace 才能对另一容器进程操作
```

进入 shell 容器执行 `ps aux`，可以**看到 nginx 容器里的进程**——默认情况下这是不可能的。

### 与 PID 1 的关系

默认情况下，每个容器有自己独立的 PID 命名空间，容器主进程就是该容器的 PID 1，孤儿进程靠各容器自己收割。开启 `shareProcessNamespace: true` 后：

- pause 容器成为**整个 Pod 唯一的 PID 1**（原理见 [infra容器pause详解](./infra容器pause详解.md) 第 3 节）；
- 所有容器的进程挂在同一棵进程树下，由 pause 统一收割孤儿/僵尸进程；
- 各容器之间从此互相可见、可 ptrace、可发信号。

:::caution 官方安全提醒
官方文档指出：开启进程命名空间共享后，容器中的进程对同一 Pod 中的所有其他容器可见，需评估安全影响；此外 **Windows 不支持该特性**。这也是它默认关闭的原因——进程互见本身就是信息泄露面。
:::

### 三者辨析速查

| 字段 | 打通的范围 | 效果 |
| --- | --- | --- |
| `hostPID: true` | Pod 与宿主机 | 可见节点全部进程 |
| `shareProcessNamespace: true` | Pod 内部各容器 | 可见同 Pod 其他容器进程 |
| 两者同时开 | —— | Pod 可见节点全部进程（范围取并集） |

## 6. 与 Pod 安全标准的关联

[Pod 安全标准](https://kubernetes.io/zh-cn/docs/concepts/security/pod-security-standards/)（Pod Security Standards）按安全等级约束了这些字段的可用性：

| 等级 | hostNetwork | hostPID | hostIPC | shareProcessNamespace |
| --- | --- | --- | --- | --- |
| privileged | 允许 | 允许 | 允许 | 允许 |
| baseline | 禁止 | 禁止 | 禁止 | 允许 |
| restricted | 禁止 | 禁止 | 禁止 | 允许 |

也就是说，baseline 与 restricted 等级下这三个 host* 字段全部被禁止——这正说明它们是"高权限、高风险"配置，只应留给集群级基础设施组件（kube-system 下的 DaemonSet 等），业务 Pod 一律不应使用。

## 7. 安全提醒与最佳实践

:::warning 五条安全底线
1. **业务工作负载禁用 hostNetwork/hostPID/hostIPC**，仅在 privileged 安全等级的命名空间（通常是 kube-system）中为基础设施组件启用；
2. 若必须使用，优先选择 hostNetwork（影响面相对可控），避免无必要地开启 hostPID；
3. hostIPC 基本可以视为"遗留兼容字段"，新架构设计不应依赖它；
4. shareProcessNamespace 会暴露 Pod 内其他容器的进程信息，多租户场景下评估后再开；
5. 配合 Pod 安全准入（Pod Security Admission）在命名空间层面强制 baseline/restricted，从准入环节拦下违规 Pod。
:::

## 8. 验证实验：亲手感受三个字段

```bash
# 对比宿主机网络：hostNetwork Pod 内看到的 IP 是节点 IP
kubectl run net-test --image=busybox:1.36 --restart=Never \
  --overrides='{"spec":{"hostNetwork":true,"containers":[{"name":"net-test","image":"busybox:1.36","command":["sh","-c","ip addr show eth0; sleep 60"]}]}}'
kubectl logs net-test          # 输出的 IP 与节点 IP 一致

# hostPID：容器内 ps 可见宿主机进程
kubectl run pid-test --image=busybox:1.36 --restart=Never \
  --overrides='{"spec":{"hostPID":true,"containers":[{"name":"pid-test","image":"busybox:1.36","command":["sh","-c","ps aux | head -5; sleep 60"]}]}}'
kubectl logs pid-test          # 可见 kubelet 等宿主机进程

# 默认 Pod：ps 只看到容器自己的进程
kubectl run ns-test --image=busybox:1.36 --restart=Never \
  -- sh -c "ps aux; sleep 60"
kubectl logs ns-test           # 只有 sleep 与 ps 自己

kubectl delete pod net-test pid-test ns-test
```

## 相关笔记

- [pod简介](./pod简介.md)——Pod 基础概念
- [infra容器pause详解](./infra容器pause详解.md)——pause 容器如何持有命名空间
- [Pod创建流程详解](./Pod创建流程详解.md)——pause 沙箱在创建流程中的位置
- [pod生命周期](./pod生命周期.md)——Pod 运行期间的行为
- [init容器](./init容器.md)——Pod 内多容器协作的另一种形式
