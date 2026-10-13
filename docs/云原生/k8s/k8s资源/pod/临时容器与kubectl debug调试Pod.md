# 临时容器与 kubectl debug 调试 Pod

[toc]

线上 Pod 出了问题，`kubectl exec` 却报错 `container not running`——容器正在 CrashLoopBackOff 里反复崩溃，根本来不及进 shell；或者更糟，业务用的是 distroless 这类极简镜像，容器活得好好的，里面却没有 sh、没有 curl、连 ps 都没有。传统的"exec 进去看一眼"在这两种场景下完全失效。本文介绍的**临时容器（Ephemeral Container）**和 `kubectl debug` 命令，就是官方为解决这类排查困境给出的方案：不重启 Pod、不改动业务容器，把调试工具"注射"进去。适合已经会用 `kubectl exec` 和 `kubectl logs`、想掌握更进阶排障手段的读者。

> 相关笔记：[Pod简介](./pod简介.md)、[pod生命周期](./pod生命周期.md)（理解容器状态的基础）、[init容器](./init容器.md)（与边车容器同源的另一种特殊容器）、[原生边车容器](./原生边车容器.md)。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| 临时容器（概念页） | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/ephemeral-containers/ |
| 调试运行中的 Pod（任务页，kubectl debug 全部用法） | https://kubernetes.io/zh-cn/docs/tasks/debug/debug-application/debug-running-pod/ |
| 调试 Pod（任务页，Pending/Waiting/崩溃等基础排查） | https://kubernetes.io/zh-cn/docs/tasks/debug/debug-application/debug-pods/ |
| kubectl debug 命令参考 | https://kubernetes.io/zh-cn/docs/reference/kubectl/generated/kubectl_debug/ |

:::tip 链接说明
早期的调试任务页地址 `docs/tasks/debug/debugging-pods-and-containers/` 已经 404，官方将其拆分成了"调试 Pod"与"调试运行中的 Pod"两个页面，请以上表中两个任务页为准。
:::

## 1. 为什么需要临时容器

先看两个典型的"排查无门"场景：

**场景一：容器崩溃，exec 进不去。** `kubectl exec` 只能进入**正在运行**的容器。一个反复崩溃的容器，在两次重启之间往往只有几秒钟存活窗口，`kubectl exec` 常常直接报错：

```bash
$ kubectl exec -it mypod -- sh
error: unable to upgrade connection: container not found ("app")
```

即使侥幸进去，容器下次崩溃重启后又会被踢出来。

**场景二：镜像里根本没有调试工具。** 为了安全和体积，生产镜像越来越"干净"：distroless 镜像没有 shell、没有包管理器；官方的 nginx、openjdk 运行时镜像也精简掉了 curl、dig、tcpdump 等工具。容器在跑，但你想执行 `ps` 都做不到：

```bash
$ kubectl exec -it mypod -- sh
OCI runtime exec failed: exec: "sh": executable file not found in $PATH
```

解决办法只有两种：要么换一个塞满工具的镜像重新构建发布（改动大、周期长），要么把工具临时"注入"到出问题的 Pod 里——这正是临时容器的设计动机。

## 2. 临时容器与普通容器的区别

临时容器是一种特殊的容器，在**现有 Pod 中临时运行**，用于故障排查。它和普通容器共用同一个 Pod 的网络命名空间，可以看到同一 Pod 里其他容器的进程和地址。但它刻意做了大量"减法"，官方文档强调它是**用来检查服务，而不是用来构建应用程序**的：

| 能力 | 普通容器 | 临时容器 |
| --- | --- | --- |
| 持续运行、承载业务 | 是 | 否，仅用于观察和诊断 |
| `ports` / `livenessProbe` / `readinessProbe` / `startupProbe` | 支持 | **不支持**，这些字段没有意义 |
| `resources`（requests/limits） | 支持 | **不允许**，避免临时容器参与资源调度 |
| `lifecycle`（postStart/preStop） | 支持 | 不支持 |
| 参与 Pod 的 ready 判定与重启计数 | 是 | 否 |
| 退出后自动重启 | 按 restartPolicy | **永不重启**，退出即消失 |
| 直接写在 Pod spec 的 `containers` 里创建 | 是 | **不允许** |

其中两条限制值得展开：

- **没有资源声明**：临时容器不能设置 requests/limits，也就不会改变 Pod 已有的调度结果——它只是在现有 Pod 的资源余量里"借住"，kubelet 不为它预留任何资源。
- **不能重启**：临时容器退出（无论是你敲了 exit 还是进程崩溃）后不会再被拉起。排查完想再看，只能再注入一个新的临时容器。

:::caution 临时容器不会"补"到原始 Pod 上
临时容器加入的是**当前正在运行的这一个 Pod**。如果 Pod 是被 Deployment 管理的，Pod 重建后（节点故障、镜像更新、手动删除）注入的临时容器不会出现在新 Pod 里。这符合"临时"的定位，但意味着别用它做任何需要长期存在的事情。
:::

## 3. 如何添加临时容器

Pod 一旦创建，`spec.containers` 就是**不可修改**的，所以临时容器有一条与其他容器完全不同的添加路径。官方文档明确说明：

1. **不能通过编辑 Pod spec 添加**。即使你把临时容器写进 YAML 里的 `spec.ephemeralContainers` 字段再 `kubectl apply`，也不行——Pod spec 整体不可变，ephemeralContainers 不例外。
2. **只能走 `pods/ephemeralcontainers` 子资源**。API Server 为 Pod 单独开放了这个子资源，允许在 Pod 存活期间追加临时容器。日常操作用 `kubectl debug` 命令即可，它会自动帮你完成对子资源的 PATCH。
3. 需要程序化操作时（比如自己的运维平台），直接 PATCH 子资源也可以，后面第 4.4 节有示例。

```bash
# 手工方式：获取当前 ephemeralContainers 状态
$ kubectl get pod mypod -o jsonpath='{.spec.ephemeralContainers}'
# 用 strategic merge patch 追加临时容器（kubectl debug 的底层动作）
$ kubectl patch pod mypod --type=strategic \
    -p '{"spec":{"ephemeralContainers":[{"name":"debugger","image":"busybox:1.36"}]}}'
```

:::warning 版本要求
临时容器相关的 API（`EphemeralContainers` 特性）在 v1.22 alpha 引入，**v1.23 起进入 beta 并默认开启**，v1.25 正式 GA。当前主流集群（v1.25+）开箱即用，无需任何配置。
:::

## 4. kubectl debug 的三种用法

`kubectl debug` 是一把"多合一"的瑞士军刀，语法上按目标资源分三条路：

```bash
kubectl debug (POD | TYPE[[.VERSION].GROUP]/NAME) [ -- COMMAND [args...] ]
```

![kubectl debug 三种用法总览](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/kubectl-debug-ways.png)

### 4.1 给运行中的 Pod 注入临时容器

最常用的姿势：给一个正在运行的 Pod 加一个带工具的容器并立即进入交互 shell。

```bash
# 在 mypod 中创建一个交互式调试会话并立即挂接
$ kubectl debug mypod -it --image=busybox:1.36
Defaulting debug container name to debugger-8xrlb.
If you don't see a command prompt, try pressing enter.
/ #
```

此时当前 shell 位于临时容器内，它和业务容器共享网络命名空间，可以直接访问业务端口：

```bash
/ # wget -qO- 127.0.0.1:8080/healthz   # 探测同 Pod 业务容器（busybox 里没有 curl，用 wget）
```

几个关键参数：

- `--image`：调试容器的镜像，推荐用 `busybox`、`nicolaka/netshoot`（网络工具全家桶）等
- `-c <名字>`：显式指定临时容器名，不指定则自动生成 `debugger-xxxxx`
- `-i` / `-t`：分配 stdin 和 TTY，配合 `-it` 交互
- `--target <容器名>`：**让临时容器加入目标容器的进程命名空间**（要求目标 Pod 开启 `shareProcessNamespace`，或运行时支持容器级进程共享），这样能直接 `ps` 看到目标容器内的进程、用 `strace`/`gdb` 附加到业务进程上

```bash
# strace 调试目标容器进程的典型组合
$ kubectl debug mypod -it --image=nicolaka/netshoot --target=app
Targeting container "app". If you don't see processes from this container
it may be because the runtime doesn't support this feature.
Defaulting debug container name to debugger-tqw4p.
```

排查完直接退出 shell，然后清理临时容器（不会自动删除）：

```bash
$ kubectl delete pod mypod --wait=false   # 不能只删临时容器，只能删整个 Pod
```

:::caution 临时容器无法单独删除
临时容器一旦注入就**不可移除**，只能等 Pod 本身被删除。所以注入前想清楚：调试完这个 Pod 大概率要重建（Deployment 管理的 Pod 直接 `kubectl rollout restart` 或删掉让控制器拉起新的即可）。
:::

### 4.2 复制 Pod 调试

临时容器有局限：崩溃中的容器抓不到现场、distroless 镜像改不了启动命令。`--copy-to` 提供另一种思路——**复制出一个新 Pod**，在副本上随便折腾，原 Pod 纹丝不动：

```bash
# 复制出 my-debugger Pod，并注入一个交互式调试容器
$ kubectl debug mypod -it --copy-to=my-debugger --image=debian:12
```

副本默认**沿用原 Pod 的所有容器定义**，同时额外加入一个调试容器。常用组合：

```bash
# 让副本中原本崩溃的业务容器换成睡眠命令"按住不崩"，保留现场慢慢看
$ kubectl debug mypod -it --copy-to=my-debugger --container=app -- sh

# 把副本里所有容器镜像换成 busybox（* 通配所有容器）
$ kubectl debug mypod --copy-to=my-debugger --set-image=*=busybox:1.36

# 只换指定容器镜像：app 换成 debug 版本镜像
$ kubectl debug mypod --copy-to=my-debugger --set-image=app=app:debug

# 调试副本时让控制器接管（删掉复制出的 Pod 会触发重建，适合 Service 场景）
$ kubectl debug mypod --copy-to=my-debugger --replace

# 调度到与原 Pod 相同的节点（需要节点亲和排查时）
$ kubectl debug mypod --copy-to=my-debugger --same-node
```

参数速查：

| 参数 | 作用 |
| --- | --- |
| `--copy-to <新名字>` | 创建原 Pod 的副本，命名为指定名称 |
| `--container <名>` | 配合命令修改副本中该容器的启动命令（把崩溃容器换成 `sh` 抓现场） |
| `--set-image 容器=镜像` | 修改副本中的容器镜像，支持 `*=镜像` 批量替换 |
| `--replace` | 创建副本后**删除原 Pod**（ Service 流量切到副本上） |
| `--same-node` | 副本调度到原 Pod 所在节点 |
| `--keep-annotations` / `--keep-labels` | 保留原 Pod 的注解/标签 |
| `--keep-liveness` / `--keep-readiness` / `--keep-startup` | 保留原 Pod 的各类探针（默认移除，避免副本被探针反复重启干扰调试） |
| `--share-processes` | 副本中启用进程命名空间共享，默认 true |

:::tip 为什么复制出来的 Pod 不受 Deployment 管
`--copy-to` 生成的副本是**裸 Pod**，没有 ownerReference，Deployment/ReplicaSet 不会认识它——调试完随手 `kubectl delete pod my-debugger` 即可，不会引起控制器误判。这也是它比"直接改原 Pod"安全的原因。
:::

### 4.3 调试节点：kubectl debug node

Node 级别的排查（CNI 插件、kubelet 问题、磁盘、网络内核参数）传统上要 ssh 登录节点。很多安全收敛的集群早已禁止 ssh，`kubectl debug node/` 提供了替代：

```bash
$ kubectl debug node/node01 -it --image=busybox:1.36
Creating debugging pod node-debugger-node01-hz8mw with container debugger on node node01.
If you don't see a command prompt, try pressing enter.
/ # ls /host
bin   boot  dev   etc   home  lib   ...
```

这条命令做了三件事：

1. **新建一个 Pod**（不是往已有 Pod 注入），通过调度器绑定到目标节点，Pod 名自动形如 `node-debugger-<节点名>-<随机串>`
2. 容器运行在**主机命名空间**中：拥有 IPC、Network、PID 命名空间，能看到节点的 IP 和进程（`ps aux` 可直接看到 kubelet）
3. **节点根文件系统挂载到容器的 `/host`**，例如查 kubelet 日志就是 `/host/var/log/pods/`，改网络配置就是 `/host/etc/cni/...`

配合 `chroot` 可以无缝切进节点环境：

```bash
/ # chroot /host sh   # 使用节点自己的二进制和库（sh、ps、iptables 等）
# ip addr   # 这已经是节点上的网络视角了
```

调试完删除调试 Pod 即可，节点不受任何持久影响。

:::warning 权限与安全
`kubectl debug node/` 等价于把节点 root 视角交给了操作者，能读 `/host` 下的所有 Secret 挂载内容。生产集群务必通过 RBAC（`pods/create` + 调度权限）严格限制谁能使用它，并优先考虑 `--profile=baseline` / `--profile=restricted` 收敛能力。
:::

### 4.4 调试 profile 与子资源直改

v1.30 起命令行支持 `--profile` 快速设置容器的安全上下文：

| profile | 适用 |
| --- | --- |
| `general`（默认） | 通用调试 |
| `baseline` | 收敛权限，仅保留最基本的 root 能力 |
| `restricted` | 最严格，贴近 Pod Security Standards 的 restricted |
| `netadmin` | 需要改节点网络（iptables、ip route 等）的调试 |
| `sysadmin` | 需要 sys_admin 能力（挂载、chroot 深入操作）的调试 |

如果要在自己的平台/脚本里程序化注入，直接 PATCH `pods/ephemeralcontainers` 子资源（等价于 4.1 节命令的底层动作）：

```yaml
# patch.yaml：向 mypod 注入一个 netshoot 临时容器
spec:
  ephemeralContainers:        # 子资源只关心这个字段
  - name: net-debugger
    image: nicolaka/netshoot
    command: ["sleep", "3600"]
```

```bash
$ kubectl patch pod mypod --subresource=ephemeralcontainers --patch-file=patch.yaml
```

## 5. 常见排查场景速查

注入 `nicolaka/netshoot`（含 curl、tcpdump、nslookup、ss 等全套网络工具）后，和业务容器共享网络，可以直接干这些事：

```bash
# 场景 1：业务接口不通，先确认业务容器端口是否监听（共享网络，直接问 localhost）
$ curl -v 127.0.0.1:8080/api/health

# 场景 2：抓包分析——直接在 Pod 的网络命名空间里抓
$ tcpdump -i eth0 -w /tmp/dump.pcap port 8080

# 场景 3：DNS 解析链路排查
$ nslookup myservice.default.svc.cluster.local

# 场景 4：观察连接状态（TIME_WAIT 堆积、SYN 重传一目了然）
$ ss -tanp

# 场景 5：查看其他容器进程（--target 注入 + shareProcessNamespace 或支持容器级共享的运行时）
$ ps aux
$ cat /proc/<pid>/stack   # 看进程内核栈
```

各场景的选型建议：

| 现象 | 推荐手段 |
| --- | --- |
| 容器在跑，但镜像没工具 | 4.1 注入临时容器 |
| 容器反复崩溃，exec 不进去 | 4.2 复制 Pod + `--container=崩溃容器 -- sh` 换启动命令 |
| 怀疑 Pod 配置错（镜像标签、环境变量） | 4.2 复制 Pod + `--set-image` 逐项试错 |
| 需要 strace/gdb 附加业务进程 | 4.1 注入 + `--target` |
| 问题不在 Pod，在节点/CNI/内核 | 4.3 `kubectl debug node/` |
| 调试完需要清理 | 删掉调试 Pod 或 rollout 重启业务 Pod |

## 6. 小结

- 临时容器 = **为排查而生的"一次性观察容器"**：没有 ports/probes/resources，永不重启
- 临时容器**无法通过 Pod spec 添加**，只能通过 `pods/ephemeralcontainers` 子资源 PATCH，日常封装为 `kubectl debug`
- `kubectl debug` 三板斧：**注入临时容器**（在线观察）、**复制 Pod**（离线折腾、抢救崩溃现场）、**调试节点**（替代 ssh）
- 注入是不可撤回的（Pod 不删临时容器不消失），调试后重建 Pod 是标准收尾动作
