[toc]

# Pod 创建流程详解

## 官方文档参考

本文以 Kubernetes 官方文档为依据（v1.37），建议对照阅读：

| 主题 | 官方链接 |
| --- | --- |
| Pod 概述 | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/ |
| Pod 的生命周期 | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/ |
| Kubernetes 架构（各组件职责） | https://kubernetes.io/zh-cn/docs/concepts/architecture/ |
| Kubernetes 调度器 | https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/kube-scheduler/ |
| 容器运行时接口 CRI | https://kubernetes.io/docs/concepts/architecture/cri/（中文页暂缺） |
| Init 容器 | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/init-containers/ |
| 配置存活、就绪和启动探针 | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| 容器生命周期回调（postStart/preStop） | https://kubernetes.io/zh-cn/docs/concepts/containers/container-lifecycle-hooks/ |

> 同目录下的进阶笔记：[图解kubernetes pod创建流程大揭秘](./图解kubernetes%20pod创建流程大揭秘.md) 与 [Pod创建流程代码版本kubelet篇](./pod创建流程代码版本kubelet篇.md) 深入到了 **kubelet 内部与源码级** 流程；本文聚焦**全局：一个 Pod 从提交 YAML 到 Running，各个组件是怎么协作的**。

## 1. 一图总览

以 `kubectl apply -f pod.yaml` 创建一个 Pod 为例，整个流程横跨**控制平面**和**工作节点**，核心组件按顺序接力：

![Pod 创建全流程](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-create-flow.png)

:::tip 一句话总结
Kubernetes 是**声明式 + 控制器模式**：你只提交期望状态，每个组件都在循环做「watch 资源变化 → 对比期望与实际 → 执行动作」，直到实际状态等于期望状态。
:::

本文使用的示例 YAML（下面所有步骤都以它为准）：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  restartPolicy: Always            # 重启策略，默认 Always
  initContainers:                  # Init 容器：串行执行，全部成功才启动业务容器
  - name: wait-service
    image: busybox:1.28
    command: ['sh', '-c', 'until nslookup myservice; do echo waiting; sleep 2; done']
  containers:                      # 业务容器
  - name: nginx
    image: nginx:1.27
    ports:
    - containerPort: 80
    lifecycle:                     # 生命周期回调
      postStart:
        exec:
          command: ['/bin/sh', '-c', 'echo started > /tmp/flag']
    livenessProbe:                 # 存活探针：失败则重启容器
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    readinessProbe:                # 就绪探针：失败则不接流量
      httpGet:
        path: /
        port: 80
      periodSeconds: 5
```

## 2. 控制平面阶段：从提交到「分配节点」

### 2.1 kubectl 提交，API Server 三道关卡

`kubectl apply` 把 YAML 提交给 **kube-apiserver**。API Server 是集群**唯一的读写入口**（任何组件都不直接操作 etcd），请求要过三道关卡：

1. **认证（Authentication）**：你是谁？——校验证书/Token 等
2. **鉴权（Authorization）**：你能干这件事吗？——RBAC 判断
3. **准入控制（Admission Control）**：允许以这种方式干吗？——若干准入插件依次检查/修改对象

全部通过后，Pod 对象被**持久化到 etcd**。此时 Pod 有两个关键特征：

- `spec.nodeName` 为**空**——还没有节点愿意接它
- 处于 `Pending` 阶段——等待调度

### 2.2 控制器：谁来创建这个 Pod

:::caution 注意
如果提交的是**裸 Pod**（如上例的 `kind: Pod`），本步骤不存在，API Server 收到后 etcd 里就直接有这个 Pod 了。生产环境更推荐通过 Deployment/ReplicaSet 等控制器创建 Pod，本步骤对应那种场景。
:::

如果 Pod 是由 `Deployment` 创建的，那么：

1. **Deployment 控制器** watch 到 Deployment 对象，创建对应的 **ReplicaSet**
2. **ReplicaSet 控制器** watch 到「期望副本数 3，实际 0」的缺口，**代用户创建 Pod 对象**（写入 etcd，`nodeName` 同样为空）

控制器不直接「执行」任何东西，它们只做一件事：对比期望状态与实际状态，通过操作 API Server 消除差异。

### 2.3 kube-scheduler：过滤 → 打分 → 绑定

[kube-scheduler 官方文档](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/kube-scheduler/)：调度器通过 **watch 机制**发现「新创建且未调度」的 Pod，为它选择节点，整个过程分两个阶段：

| 阶段 | 官方术语 | 做什么 |
| --- | --- | --- |
| 过滤 | Filtering（预选） | 从全部节点中筛出**能跑**这个 Pod 的：CPU/内存够不够、端口冲不冲突、亲和性/反亲和性满不满足、污点能不能容忍…… |
| 打分 | Scoring（优选） | 给候选节点打分选**最优**的：资源均衡、镜像本地已有、亲和性偏好…… |
| 绑定 | Binding | 调度结果写回 API Server——设置 `spec.nodeName`，这一步叫**绑定（bind）** |

:::caution Pod 只会被调度一次
官方明确：Pod 在其生命周期中**只会被调度一次**。一旦绑定到某节点，就会一直运行在该节点上，直到停止或被终止；节点挂了 Pod 也不会「搬走」，而是由控制器**另建一个新 Pod**（新 UID）来替换。
:::

**排查 Pod 一直 Pending？** 九成是调度阶段卡住了，常见原因：集群资源不足、不满足 nodeSelector/亲和性、节点有不能容忍的污点。用 `kubectl describe pod web` 看 Events 即可定位。

## 3. 节点阶段：kubelet 接管并真正启动容器

### 3.1 kubelet watch 到新 Pod

`spec.nodeName` 一写入，运行在该节点上的 **kubelet** 立刻通过 watch 感知到「有个 Pod 分给我了」。kubelet 是节点上的**容器大管家**，接管前会先做**准入检查**：当前节点资源压力是否满足（驱逐评估）、Pod 运行环境是否具备等，检查不通过则拒绝该 Pod。

### 3.2 调用 CRI：拉镜像 + 创建 pause 沙箱

kubelet **不直接操作容器**，而是通过 gRPC 调用实现了 [CRI（容器运行时接口）](https://kubernetes.io/docs/concepts/architecture/cri/) 的运行时（containerd、CRI-O 等）。CRI 定义了两组服务：

- **RuntimeService**：管理 Pod 沙箱和容器的生命周期
- **ImageService**：管理镜像（拉取、查询、删除）

启动顺序上，containerd 会先创建 **pause（沙箱/sandbox）容器**——它是 Pod 里第一个启动的容器，作用是**持有 network、IPC 等 Linux 命名空间**，让 Pod 内所有容器共享同一套网络栈（同一个 IP、同一组端口空间），这正是「Pod 内容器互通 localhost」的实现基础。

### 3.3 CNI 配置 Pod 网络

pause 沙箱起来后，kubelet 调用 **CNI 网络插件**（flannel、calico 等）为 Pod 配置网络：给 eth0 分配 **Pod IP**、写入路由。完成后 kubelet 会把 `PodReadyToStartContainers` 状况置为 `True`（该状况表示沙箱创建、网络配置、存储卷挂载均完成）。

### 3.4 容器启动序列：init 串行 → 业务并行

![Pod 启动序列](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-startup-sequence.png)

结合官方 [Init 容器文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/init-containers/)，Pod 内的启动顺序是严格定义的：

1. **pause 沙箱容器** 最先启动（持命名空间）
2. **CNI** 分配 Pod IP
3. **Init 容器逐个串行**启动：`wait-service` 成功退出后，下一个才启动；全部成功后 `Initialized` 状况置 `True`
4. **业务容器并行启动**：所有 init 容器完成后，`nginx` 等容器同时创建并启动；若配置了 `postStart` 回调，在容器启动后立即执行
5. **探针接管**：`startupProbe`（如配置）→ `livenessProbe` / `readinessProbe` 开始周期探测，`Ready=True` 后 Pod IP 进入 Service 的 EndpointSlice，开始接收流量

:::caution Init 容器的失败处理
Init 容器失败时，kubelet 会按 `restartPolicy` 重试：`Always`/`OnFailure` 会不断重试直到成功；若 `restartPolicy: Never`，Init 容器失败则**整个 Pod 直接失败**。Init 容器不支持 `lifecycle`、`livenessProbe`、`readinessProbe`、`startupProbe` 字段。
:::

## 4. Pod 的阶段（Phase）与状况（Conditions）

### 4.1 Phase 状态机

![Pod Phase 状态机](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-phase-state.png)

官方对 `status.phase` 的取值有严格定义，**只有 5 种**：

| Phase | 含义 |
| --- | --- |
| `Pending` | 已被接受，但一个或多个容器尚未创建/运行。**包括等调度的时间和拉镜像的时间** |
| `Running` | 已绑定节点，所有容器已创建，至少一个在运行（或处于启动/重启中） |
| `Succeeded` | 所有容器成功结束且不会重启 |
| `Failed` | 所有容器已终止，且至少一个以失败（非 0）退出 |
| `Unknown` | 无法取得 Pod 状态，通常是**与节点失联** |

:::caution 不要把 kubectl 的 STATUS 列当成 phase
`CrashLoopBackOff`、`Terminating`、`ImagePullBackOff` 这些只是 kubectl 显示的 **STATUS 字段**（人类可读的直觉提示），**不是 phase**。比如 CrashLoopBackOff 的 Pod，其 phase 其实是 `Running`。
:::

### 4.2 Pod 状况（Conditions）

Phase 是宏观概述，精细的状态用 `status.conditions` 表达，kubelet 维护的主要状况：

| Condition | 含义 |
| --- | --- |
| `PodScheduled` | 已被调度到某节点 |
| `PodReadyToStartContainers` | 沙箱创建成功、网络已配置、存储卷已挂载 |
| `Initialized` | 所有 Init 容器已成功完成 |
| `ContainersReady` | Pod 中所有容器都已就绪 |
| `Ready` | 可对外提供服务，应加入 Service 负载均衡池 |

全部为 `True` 才是真正可用的 Pod，`kubectl get pod` 显示的 `READY 1/1` 就取决于此。

## 5. 探针与重启策略：Running 之后如何保持健康

![三种探针](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-probes.png)

三种探针由 **kubelet 周期执行**，支持 `httpGet`、`tcpSocket`、`exec`、`grpc` 四种探测机制（配置方法见[官方任务文档](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)）：

- **startupProbe**：给慢启动应用留初始化时间，成功之前不执行其他探针；超过 `failureThreshold × periodSeconds` 仍未成功则杀掉容器
- **livenessProbe**：失败则 kubelet **重启容器**（`RESTARTS` +1），用于捕捉死锁等无法自愈的故障
- **readinessProbe**：失败只是 `Ready=False`，从 EndpointSlice 摘除、**不接流量但容器不重启**，恢复后自动回到负载均衡

容器失败后的处理由 `spec.restartPolicy` 决定（注意这是 **Pod 级**配置，对整个 Pod 生效）：

| 取值 | 行为 |
| --- | --- |
| `Always`（默认） | 任何退出都重启 |
| `OnFailure` | 仅非 0 退出（失败）时重启 |
| `Never` | 从不重启 |

详细展开见同目录 [pod健康检查](./pod健康检查.md)。

## 6. Pod 的终止（简述）

删除 Pod 时 Kubernetes 走**体面终止（graceful shutdown）**流程，默认宽限期 30 秒（`terminationGracePeriodSeconds`）：

1. API Server 标记 Pod 为 Terminating，同时控制面把它从 Service 的 EndpointSlice 中移除（不再接新流量）
2. kubelet 执行 **preStop 回调**（如配置），然后向容器主进程发送 **TERM（SIGTERM）信号**
3. 宽限期结束仍有进程存活 → 发送 **KILL（SIGKILL）** 强制终止
4. kubelet 触发 API Server 删除 Pod 对象

完整流程见官方 [Pod 的终止](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) 与同目录 [pod生命周期](./pod生命周期.md)、[pod hook](./pod%20hook.md)。

:::tip 常见坑
应用收不到 SIGTERM 就被强杀，通常是因为 shell 包装了主进程（PID 1 是 sh，信号传不进去），或 preStop/业务收尾时间超过了默认 30 秒宽限期——后者调大 `terminationGracePeriodSeconds` 即可。
:::

## 7. 常见异常速查

| kubectl STATUS | 阶段 | 常见原因 | 排查命令 |
| --- | --- | --- | --- |
| `Pending` | 调度失败 | 资源不足、亲和性不匹配、污点未容忍 | `kubectl describe pod` 看 Events |
| `ImagePullBackOff` | 拉镜像失败 | 镜像名/标签错、仓库需认证、网络不通 | `kubectl describe pod`；`crictl pull` 手动验证 |
| `CrashLoopBackOff` | 容器反复崩溃 | 应用启动报错、探针配置过急 | `kubectl logs --previous` 看上次崩溃日志 |
| `Init:CrashLoopBackOff` | Init 容器失败 | 依赖的服务没就绪、脚本错误 | `kubectl logs <pod> -c <init容器名>` |
| `Terminating` 卡住 | 终止卡住 | finalizer 未清理、进程不响应 SIGTERM | 检查 finalizer；确认宽限期与信号处理 |

## 8. 小结

- **控制平面**：kubectl → API Server（认证/鉴权/准入）→ etcd → 控制器创建 Pod → 调度器过滤/打分/绑定
- **工作节点**：kubelet watch → CRI 拉镜像、建 pause 沙箱 → CNI 分配 Pod IP → init 容器串行 → 业务容器并行 → 探针接管
- **状态体系**：phase 只有 5 种宏观取值；精细状态看 conditions；kubectl 的 STATUS 列不是 phase
- **保持健康**：探针负责发现故障（存活重启、就绪摘流量），restartPolicy 决定失败后怎么办

面试中回答「Pod 创建流程」，按上面的接力顺序讲清楚**每个组件做什么、通过什么接口协作**即可；想继续深入 kubelet 内部实现，读同目录的[图解版](./图解kubernetes%20pod创建流程大揭秘.md)和[代码版](./pod创建流程代码版本kubelet篇.md)。
