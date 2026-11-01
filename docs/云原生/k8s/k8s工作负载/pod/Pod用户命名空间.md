# Pod 用户命名空间

## 引言

容器里以 root 运行的进程，在宿主机上也是 root——这是 Linux 容器安全的经典软肋：一旦容器逃逸，攻击者直接拿到宿主机 root 权限；即便不逃逸，容器内 root 也能对挂载进来的宿主机文件为所欲为。**用户命名空间（User Namespaces）**通过 UID 映射把这件事颠倒过来：容器内照样是 root（apt、dnf 都能正常用），但映射到宿主机上的是一个无特权的普通用户。Kubernetes 从 v1.36 起将此特性 GA，Pod 只需一行 `hostUsers: false` 即可启用。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| 用户命名空间（概念页） | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/user-namespaces/ |
| 为 Pod 配置用户命名空间（任务页） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/user-namespaces/ |

## 特性状态

- v1.28 alpha（`UserNamespacesSupport` 特性门控）
- 逐步 beta → **v1.36 GA 并锁定**：显式设置该特性门控会被忽略（不报错）

## 1. 原理：UID 映射

用户命名空间是 Linux 的隔离能力之一，它把容器内的用户/组 ID 映射到宿主机上**另一组不重叠的** ID：

- 容器内进程自认为是 root（uid 0），具备用户命名空间**内部**的完整权限
- 在命名空间之外（即宿主机视角），它只是一个无特权用户——宿主机上 `ps aux` 看到的属主和容器内 `id` 看到的完全不同
- 启用方式：`spec.hostUsers: false`（默认 true，即与宿主机共享用户命名空间）

```bash
cat > userns-pod.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: userns-demo
spec:
  # 【关键字段】false = 使用独立的用户命名空间
  # kubelet 为该 Pod 挑选一段主机上不重叠的 UID/GID 区间
  hostUsers: false
  containers:
  - name: app
    image: nginx:1.27
EOF
kubectl apply -f userns-pod.yaml
```

kubelet 保证**同一节点上不会有两个 Pod 使用相同的映射区间**，因此：

- 容器逃逸后只是宿主机上的一个普通用户，对宿主机能做的事非常有限
- Pod 之间也彼此隔离，A Pod 的 root 动不了 B Pod 的文件
- 多个被评为 HIGH/CRITICAL 的安全漏洞在用户命名空间激活时**无法被利用**，未来漏洞预计也会被减轻

## 2. 权能（Capabilities）也被关进命名空间

授予 Pod 的 Linux 权能只在它自己的用户命名空间内有效：

- `CAP_SYS_MODULE`：完全失效，Pod 无法加载内核模块
- `CAP_SYS_ADMIN`：仅在 Pod 的用户命名空间内有效，出了这个命名空间什么都不算

对比不启用用户命名空间时：root 容器逃逸后在节点上仍是 root，被授予的权能在宿主机上照常生效——启用后这两条全部不成立。

## 3. 对卷与文件所有权的处理

`runAsUser`、`runAsGroup`、`fsGroup` 等字段**始终指容器内的用户**，由 kubelet 做 idmap 挂载转换后，宿主机文件的所有权不受影响：

- Pod 挂载卷中创建/读取的 inode 属主与不启用用户命名空间时相同
- Pod 可以随时开启/关闭用户命名空间，不影响卷内文件属主
- 通过在容器内设置合适的用户，还能与不使用用户命名空间的 Pod **共享卷**

**有效 UID/GID 范围**：默认 0–65535。超出范围的文件属主会被视为"溢出 ID"（通常 65534），且即使以 65534 运行也改不了这些文件。需要更大范围时用 kubelet 配置扩展。

## 4. 节点要求（启用前提）

这是 **仅 Linux** 的特性，对内核、文件系统、运行时都有要求：

| 组件 | 要求 |
| --- | --- |
| 内核 | 最低 **Linux 6.3**（tmpfs 从该版本支持 idmap 挂载；服务账号令牌、Secret 都用 tmpfs） |
| 文件系统 | `/var/lib/kubelet/pods/` 所在文件系统及 Pod 卷所用文件系统均需支持 idmap 挂载：btrfs、ext4、xfs、fat、tmpfs、overlayfs 等 |
| OCI 运行时 | crun ≥ 1.9（推荐 1.13+）或 runc ≥ 1.2 |
| CRI 运行时 | containerd ≥ 2.0 或 CRI-O ≥ 1.25 |

**自定义 UID 区间**（可选）：kubelet 默认从 65536 起分配 Pod 的 UID 区间（避开宿主机常用的 0–65535，防止 CVE-2021-25741 一类的越权读文件）。要自定义需满足：系统存在 `kubelet` 用户、PATH 中有 `getsubids` 与 `getent`、`/etc/subuid` 与 `/etc/subgid` 中配置从属 ID 范围：

```text
# 格式：name:firstID:count
# firstID 必须 ≥ 65536 且是 65536 的倍数；count 是 65536 的倍数
# 且至少为 65536 × maxPods；UID/GID 范围必须相同；只能有一行
kubelet:65536:7208960
```

:::caution 修改区间配置前必须腾空节点
节点上有用户命名空间 Pod 在跑时改 subuid/subgid 配置，kubelet 可能因无法满足新配置而启动失败。先 drain、再改、再重启 kubelet（注意 DaemonSet Pod 和容忍了不可调度污点的 Pod 不会被驱逐）。

每个 Pod 的 ID 计数可从 v1.33 起通过 KubeletConfiguration 的 `userNamespaces.idsPerPod` 调整（须为 65536 的倍数，默认 65536）。
:::

## 5. 与 Pod 安全准入（PSA）的联动

对启用用户命名空间的 Pod，Kubernetes 会**受控放宽**部分安全标准检查——因为命名空间内的 root 不可能映射到宿主机特权用户，所以这些限制失去意义：

- **Baseline 与 Restricted 下都不再限制**：`spec.securityContext.runAsNonRoot` 及各容器的 `runAsNonRoot`、`runAsUser`
- **Baseline 下放宽**：`procMount` 字段的合法性检查（Restricted 下仍只能用默认/空 procMount）

## 6. 限制

启用 `hostUsers: false` 的 Pod：

- **不允许共享其他宿主机命名空间**：`hostNetwork: true`、`hostIPC: true`、`hostPID: true` 全部禁止
- **不能使用 `volumeDevices`**（原始块设备卷，如 `/dev/sda`），对 containers、initContainers、ephemeralContainers 全部生效
- **不支持 NFS 卷**：Linux NFS 客户端尚不支持 ID 映射挂载；其他不支持 idmap 的文件系统同样失败，事件报错形如 `failed to set MOUNT_ATTR_IDMAP ... (maybe the filesystem used doesn't support idmap mounts on this kernel?)`

**可观测性**：kubelet 导出两个 Prometheus 指标——`started_user_namespaced_pods_total`（尝试创建的用户命名空间 Pod 计数）与 `started_user_namespaced_pods_errors_total`（创建失败计数）。

## 7. 与"共享宿主机命名空间"的关系

两者是同一枚硬币的两面：`hostNetwork/hostPID/hostIPC: true` 是**主动放弃隔离换取便利**（调试、系统级组件）；`hostUsers: false` 是**主动加强隔离换取安全**。用户命名空间 Pod 与这三种共享互斥，正好构成完整的隔离光谱。

## 8. 我的总结与避坑清单

1. **一行 `hostUsers: false` 就能启用**，但节点侧的配套（内核 ≥ 6.3、文件系统 idmap、containerd ≥ 2.0/runc ≥ 1.2）才是真正的门槛，灰度前先在测试节点验证
2. **NFS 卷直接不可用**，用 NFS 存储的集群要绕开这个特性或换存储
3. **hostUsers: false 与 hostNetwork/hostPID/hostIPC 互斥**，系统级 DaemonSet 别开用户命名空间
4. **容器内应用基本无感**：root 照样当、apt 照样装、卷文件属主不变，迁移成本低；唯一要留意的是 65535 之外的宿主机 UID 文件会变成溢出 ID 不可写
5. **改 subuid/subgid 必须先腾空节点**，否则 kubelet 可能起不来
6. **PSA 的 runAsNonRoot/runAsUser 检查被放宽**：安全基线扫描工具要把用户命名空间 Pod 单列，否则会误报
7. **监控补两个指标**：`started_user_namespaced_pods_total/errors_total`，失败激增通常是节点文件系统/运行时配置不齐
