# pod生命周期

[k8s pod生命周期官方文档](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions)

![iShot2022-03-13 19.21.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-03-13 19.21.50.png)

 Pod 遵循一个预定义的生命周期，起始于 `Pending` [阶段](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase)，如果至少 其中有一个主要容器正常启动，则进入 `Running`，之后取决于 Pod 中是否有容器以 失败状态结束而进入 `Succeeded` 或者 `Failed` 阶段。

在 Pod 运行期间，`kubelet` 能够重启容器以处理一些失效场景。 在 Pod 内部，Kubernetes 跟踪不同容器的[状态](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#container-states) 并确定使 Pod 重新变得健康所需要采取的动作。

在 Kubernetes API 中，Pod 包含规约部分和实际状态部分。 Pod 对象的状态包含了一组 [Pod 状况（Conditions）](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions)。 如果应用需要的话，你也可以向其中注入[自定义的就绪性信息](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-readiness-gate)。

Pod 在其生命周期中只会被[调度](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/)一次。 一旦 Pod 被调度（分派）到某个节点，Pod 会一直在该节点运行，直到 Pod 停止或者被[终止](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)。

## Pod 生命期

和一个个独立的应用容器一样，Pod 也被认为是相对临时性（而不是长期存在）的实体。 Pod 会被创建、赋予一个唯一的 ID（[UID](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/names/#uids)）， 并被调度到节点，并在终止（根据重启策略）或删除之前一直运行在该节点。

如果一个[节点](https://kubernetes.io/zh/docs/concepts/architecture/nodes/)死掉了，调度到该节点的 Pod 也被计划在给定超时期限结束后[删除](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-garbage-collection)。

Pod 自身不具有自愈能力。如果 Pod 被调度到某[节点](https://kubernetes.io/zh/docs/concepts/architecture/nodes/) 而该节点之后失效，Pod 会被删除；类似地，Pod 无法在因节点资源耗尽或者节点维护而被驱逐期间继续存活。Kubernetes 使用一种高级抽象来管理这些相对而言可随时丢弃的 Pod 实例，称作 [控制器](https://kubernetes.io/zh/docs/concepts/architecture/controller/)。

任何给定的 Pod （由 UID 定义）从不会被“重新调度（rescheduled）”到不同的节点； 相反，这一 Pod 可以被一个新的、几乎完全相同的 Pod 替换掉。 如果需要，新 Pod 的名字可以不变，但是其 UID 会不同。

如果某物声称其生命期与某 Pod 相同，例如存储[卷](https://kubernetes.io/zh/docs/concepts/storage/volumes/)， 这就意味着该对象在此 Pod （UID 亦相同）存在期间也一直存在。 如果 Pod 因为任何原因被删除，甚至某完全相同的替代 Pod 被创建时， 这个相关的对象（例如这里的卷）也会被删除并重建。

**Pod 结构图例**

*一个包含多个容器的 Pod 中包含一个用来拉取文件的程序和一个 Web 服务器， 均使用持久卷作为容器间共享的存储。*

![iShot2022-03-13 18.16.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-03-13 18.16.55.png)

## Pod 阶段

Pod 的 `status` 字段是一个 [PodStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#podstatus-v1-core) 对象，其中包含一个 `phase` 字段。

Pod 的阶段（Phase）是 Pod 在其生命周期中所处位置的简单宏观概述。 该阶段并不是对容器或 Pod 状态的综合汇总，也不是为了成为完整的状态机。

Pod 阶段的数量和含义是严格定义的。 除了本文档中列举的内容外，不应该再假定 Pod 有其他的 `phase` 值。

下面是 `phase` 可能的值：

| 取值                | 描述                                                         |
| :------------------ | :----------------------------------------------------------- |
| `Pending`（悬决）   | Pod 已被 Kubernetes 系统接受，但有一个或者多个容器尚未创建亦未运行。此阶段包括等待 Pod 被调度的时间和通过网络下载镜像的时间。 |
| `Running`（运行中） | Pod 已经绑定到了某个节点，Pod 中所有的容器都已被创建。至少有一个容器仍在运行，或者正处于启动或重启状态。 |
| `Succeeded`（成功） | Pod 中的所有容器都已成功终止，并且不会再重启。               |
| `Failed`（失败）    | Pod 中的所有容器都已终止，并且至少有一个容器是因为失败终止。也就是说，容器以非 0 状态退出或者被系统终止。 |
| `Unknown`（未知）   | 因为某些原因无法取得 Pod 的状态。这种情况通常是因为与 Pod 所在主机通信失败。 |

如果某节点死掉或者与集群中其他节点失联，Kubernetes 会实施一种策略，将失去的节点上运行的所有 Pod 的 `phase` 设置为 `Failed`。



## 容器状态

Kubernetes 会跟踪 Pod 中每个容器的状态，就像它跟踪 Pod 总体上的[阶段](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase)一样。 你可以使用[容器生命周期回调](https://kubernetes.io/zh/docs/concepts/containers/container-lifecycle-hooks/) 来在容器生命周期中的特定时间点触发事件。

一旦[调度器](https://kubernetes.io/docs/reference/generated/kube-scheduler/)将 Pod 分派给某个节点，`kubelet` 就通过 [容器运行时](https://kubernetes.io/zh/docs/setup/production-environment/container-runtimes) 开始为 Pod 创建容器。 容器的状态有三种：`Waiting`（等待）、`Running`（运行中）和 `Terminated`（已终止）。

要检查 Pod 中容器的状态，你可以使用 `kubectl describe pod <pod 名称>`。 其输出中包含 Pod 中每个容器的状态。

每种状态都有特定的含义：

### `Waiting` （等待） 

如果容器并不处在 `Running` 或 `Terminated` 状态之一，它就处在 `Waiting` 状态。 处于 `Waiting` 状态的容器仍在运行它完成启动所需要的操作：例如，从某个容器镜像 仓库拉取容器镜像，或者向容器应用 [Secret](https://kubernetes.io/zh/docs/concepts/configuration/secret/) 数据等等。 当你使用 `kubectl` 来查询包含 `Waiting` 状态的容器的 Pod 时，你也会看到一个 Reason 字段，其中给出了容器处于等待状态的原因。

### `Running`（运行中） 

`Running` 状态表明容器正在执行状态并且没有问题发生。 如果配置了 `postStart` 回调，那么该回调已经执行且已完成。 如果你使用 `kubectl` 来查询包含 `Running` 状态的容器的 Pod 时，你也会看到 关于容器进入 `Running` 状态的信息。

### `Terminated`（已终止） 

处于 `Terminated` 状态的容器已经开始执行并且或者正常结束或者因为某些原因失败。 如果你使用 `kubectl` 来查询包含 `Terminated` 状态的容器的 Pod 时，你会看到 容器进入此状态的原因、退出代码以及容器执行期间的起止时间。

如果容器配置了 `preStop` 回调，则该回调会在容器进入 `Terminated` 状态之前执行。



## 容器重启策略

Pod 的 `spec` 中包含一个 `restartPolicy` 字段，其可能取值包括 `Always`、`OnFailure` 和 `Never`。默认值是 `Always`。

`restartPolicy` 适用于 Pod 中的所有容器。`restartPolicy` 仅针对同一节点上 `kubelet` 的容器重启动作。当 Pod 中的容器退出时，`kubelet` 会按指数回退 方式计算重启的延迟（10s、20s、40s、...），其最长延迟为 5 分钟。 一旦某容器执行了 10 分钟并且没有出现问题，`kubelet` 对该容器的重启回退计时器执行 重置操作。

## Pod 状况 

Pod 有一个 PodStatus 对象，其中包含一个 [PodConditions](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#podcondition-v1-core) 数组。Pod 可能通过也可能未通过其中的一些状况测试。

- `PodScheduled`：Pod 已经被调度到某节点；
- `ContainersReady`：Pod 中所有容器都已就绪；
- `Initialized`：所有的 [Init 容器](https://kubernetes.io/zh/docs/concepts/workloads/pods/init-containers/) 都已成功完成；
- `Ready`：Pod 可以为请求提供服务，并且应该被添加到对应服务的负载均衡池中。

| 字段名称             | 描述                                                         |
| :------------------- | :----------------------------------------------------------- |
| `type`               | Pod 状况的名称                                               |
| `status`             | 表明该状况是否适用，可能的取值有 "`True`", "`False`" 或 "`Unknown`" |
| `lastProbeTime`      | 上次探测 Pod 状况时的时间戳                                  |
| `lastTransitionTime` | Pod 上次从一种状态转换到另一种状态时的时间戳                 |
| `reason`             | 机器可读的、驼峰编码（UpperCamelCase）的文字，表述上次状况变化的原因 |
| `message`            | 人类可读的消息，给出上次状态转换的详细信息                   |



### Pod 就绪态 

**FEATURE STATE:** `Kubernetes v1.14 [stable]`

你的应用可以向 PodStatus 中注入额外的反馈或者信号：*Pod Readiness（Pod 就绪态）*。 要使用这一特性，可以设置 Pod 规约中的 `readinessGates` 列表，为 kubelet 提供一组额外的状况供其评估 Pod 就绪态时使用。

就绪态门控基于 Pod 的 `status.conditions` 字段的当前值来做决定。 如果 Kubernetes 无法在 `status.conditions` 字段中找到某状况，则该状况的状态值默认为 "`False`"。

这里是一个例子：

```yaml
kind: Pod
...
spec:
  readinessGates:
    - conditionType: "www.example.com/feature-1"
status:
  conditions:
    - type: Ready                              # 内置的 Pod 状况
      status: "False"
      lastProbeTime: null
      lastTransitionTime: 2018-01-01T00:00:00Z
    - type: "www.example.com/feature-1"        # 额外的 Pod 状况
      status: "False"
      lastProbeTime: null
      lastTransitionTime: 2018-01-01T00:00:00Z
  containerStatuses:
    - containerID: docker://abcd...
      ready: true
...
```

你所添加的 Pod 状况名称必须满足 Kubernetes [标签键名格式](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set)。

### Pod 就绪态的状态

命令 `kubectl patch` 不支持修改对象的状态。 如果需要设置 Pod 的 `status.conditions`，应用或者 [Operators](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/operator/) 需要使用 `PATCH` 操作。 你可以使用 [Kubernetes 客户端库](https://kubernetes.io/zh/docs/reference/using-api/client-libraries/) 之一来编写代码，针对 Pod 就绪态设置定制的 Pod 状况。

对于使用定制状况的 Pod 而言，只有当下面的陈述都适用时，该 Pod 才会被评估为就绪：

- Pod 中所有容器都已就绪；
- `readinessGates` 中的所有状况都为 `True` 值。

当 Pod 的容器都已就绪，但至少一个定制状况没有取值或者取值为 `False`， `kubelet` 将 Pod 的[状况](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions)设置为 `ContainersReady`。

## 容器探针 

probe 是由 [kubelet](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kubelet/) 对容器执行的定期诊断。 要执行诊断，kubelet 既可以在容器内执行代码，也可以发出一个网络请求。

### 检查机制 

使用探针来检查容器有四种不同的方法。 每个探针都必须准确定义为这四种机制中的一种：

- `exec`

  在容器内执行指定命令。如果命令退出时返回码为 0 则认为诊断成功。

- `grpc`

  使用 [gRPC](https://grpc.io/) 执行一个远程过程调用。 目标应该实现 [gRPC健康检查](https://grpc.io/grpc/core/md_doc_health-checking.html)。 如果响应的状态是 "SERVING"，则认为诊断成功。 gRPC 探针是一个 alpha 特性，只有在你启用了 "GRPCContainerProbe" [特性门控](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/feature-gate/)时才能使用。

- `httpGet`

  对容器的 IP 地址上指定端口和路径执行 HTTP `GET` 请求。如果响应的状态码大于等于 200 且小于 400，则诊断被认为是成功的。

- `tcpSocket`

  对容器的 IP 地址上的指定端口执行 TCP 检查。如果端口打开，则诊断被认为是成功的。 如果远程系统（容器）在打开连接后立即将其关闭，这算作是健康的。

### 探测结果 

每次探测都将获得以下三种结果之一：

- `Success`（成功）

  容器通过了诊断。

- `Failure`（失败）

  容器未通过诊断。

- `Unknown`（未知）

  诊断失败，因此不会采取任何行动。

### 探测类型 

针对运行中的容器，`kubelet` 可以选择是否执行以下三种探针，以及如何针对探测结果作出反应：

- `livenessProbe`

  指示容器是否正在运行。如果存活态探测失败，则 kubelet 会杀死容器， 并且容器将根据其[重启策略](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)决定未来。如果容器不提供存活探针， 则默认状态为 `Success`。

- `readinessProbe`

  指示容器是否准备好为请求提供服务。如果就绪态探测失败， 端点控制器将从与 Pod 匹配的所有服务的端点列表中删除该 Pod 的 IP 地址。 初始延迟之前的就绪态的状态值默认为 `Failure`。 如果容器不提供就绪态探针，则默认状态为 `Success`。

- `startupProbe`

  指示容器中的应用是否已经启动。如果提供了启动探针，则所有其他探针都会被 禁用，直到此探针成功为止。如果启动探测失败，`kubelet` 将杀死容器，而容器依其 [重启策略](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)进行重启。 如果容器没有提供启动探测，则默认状态为 `Success`。

如欲了解如何设置存活态、就绪态和启动探针的进一步细节，可以参阅 [配置存活态、就绪态和启动探针](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

#### 何时该使用存活态探针? 

**FEATURE STATE:** `Kubernetes v1.0 [stable]`

如果容器中的进程能够在遇到问题或不健康的情况下自行崩溃，则不一定需要存活态探针; `kubelet` 将根据 Pod 的`restartPolicy` 自动执行修复操作。

如果你希望容器在探测失败时被杀死并重新启动，那么请指定一个存活态探针， 并指定`restartPolicy` 为 "`Always`" 或 "`OnFailure`"。

#### 何时该使用就绪态探针? 

**FEATURE STATE:** `Kubernetes v1.0 [stable]`

如果要仅在探测成功时才开始向 Pod 发送请求流量，请指定就绪态探针。 在这种情况下，就绪态探针可能与存活态探针相同，但是规约中的就绪态探针的存在意味着 Pod 将在启动阶段不接收任何数据，并且只有在探针探测成功后才开始接收数据。

如果你希望容器能够自行进入维护状态，也可以指定一个就绪态探针，检查某个特定于 就绪态的因此不同于存活态探测的端点。

如果你的应用程序对后端服务有严格的依赖性，你可以同时实现存活态和就绪态探针。 当应用程序本身是健康的，存活态探针检测通过后，就绪态探针会额外检查每个所需的后端服务是否可用。 这可以帮助你避免将流量导向只能返回错误信息的 Pod。

如果你的容器需要在启动期间加载大型数据、配置文件或执行迁移，你可以使用 [启动探针](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#when-should-you-use-a-startup-probe)。 然而，如果你想区分已经失败的应用和仍在处理其启动数据的应用，你可能更倾向于使用就绪探针。

> **说明：**
>
> 请注意，如果你只是想在 Pod 被删除时能够排空请求，则不一定需要使用就绪态探针； 在删除 Pod 时，Pod 会自动将自身置于未就绪状态，无论就绪态探针是否存在。 等待 Pod 中的容器停止期间，Pod 会一直处于未就绪状态。



#### 何时该使用启动探针？ 

**FEATURE STATE:** `Kubernetes v1.18 [beta]`

对于所包含的容器需要较长时间才能启动就绪的 Pod 而言，启动探针是有用的。 你不再需要配置一个较长的存活态探测时间间隔，只需要设置另一个独立的配置选定， 对启动期间的容器执行探测，从而允许使用远远超出存活态时间间隔所允许的时长。

如果你的容器启动时间通常超出 `initialDelaySeconds + failureThreshold × periodSeconds` 总值，你应该设置一个启动探测，对存活态探针所使用的同一端点执行检查。 `periodSeconds` 的默认值是 10 秒。你应该将其 `failureThreshold` 设置得足够高， 以便容器有充足的时间完成启动，并且避免更改存活态探针所使用的默认值。 这一设置有助于减少死锁状况的发生。

## Pod 的终止 

由于 Pod 所代表的是在集群中节点上运行的进程，当不再需要这些进程时允许其体面地 终止是很重要的。一般不应武断地使用 `KILL` 信号终止它们，导致这些进程没有机会 完成清理操作。

设计的目标是令你能够请求删除进程，并且知道进程何时被终止，同时也能够确保删除 操作终将完成。当你请求删除某个 Pod 时，集群会记录并跟踪 Pod 的体面终止周期， 而不是直接强制地杀死 Pod。在存在强制关闭设施的前提下， [kubelet](https://kubernetes.io/docs/reference/generated/kubelet) 会尝试体面地终止 Pod。

通常情况下，容器运行时会发送一个 TERM 信号到每个容器中的主进程。 很多容器运行时都能够注意到容器镜像中 `STOPSIGNAL` 的值，并发送该信号而不是 TERM。 一旦超出了体面终止限期，容器运行时会向所有剩余进程发送 KILL 信号，之后 Pod 就会被从 [API 服务器](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kube-apiserver/) 上移除。如果 `kubelet` 或者容器运行时的管理服务在等待进程终止期间被重启， 集群会从头开始重试，赋予 Pod 完整的体面终止限期。

下面是一个例子：

1. 你使用 `kubectl` 工具手动删除某个特定的 Pod，而该 Pod 的体面终止限期是默认值（30 秒）。

2. API 服务器中的 Pod 对象被更新，记录涵盖体面终止限期在内 Pod 的最终死期，超出所计算时间点则认为 Pod 已死（dead）。 如果你使用 `kubectl describe` 来查验你正在删除的 Pod，该 Pod 会显示为 "Terminating" （正在终止）。 在 Pod 运行所在的节点上：`kubelet` 一旦看到 Pod 被标记为正在终止（已经设置了体面终止限期），`kubelet` 即开始本地的 Pod 关闭过程。

   1. 如果 Pod 中的容器之一定义了 `preStop` [回调](https://kubernetes.io/zh/docs/concepts/containers/container-lifecycle-hooks)， `kubelet` 开始在容器内运行该回调逻辑。如果超出体面终止限期时，`preStop` 回调逻辑 仍在运行，`kubelet` 会请求给予该 Pod 的宽限期一次性增加 2 秒钟。

      > **说明：** 如果 `preStop` 回调所需要的时间长于默认的体面终止限期，你必须修改 `terminationGracePeriodSeconds` 属性值来使其正常工作。

   2. `kubelet` 接下来触发容器运行时发送 TERM 信号给每个容器中的进程 1。

      > **说明：** Pod 中的容器会在不同时刻收到 TERM 信号，接收顺序也是不确定的。 如果关闭的顺序很重要，可以考虑使用 `preStop` 回调逻辑来协调。

3. 与此同时，`kubelet` 启动体面关闭逻辑，控制面会将 Pod 从对应的端点列表（以及端点切片列表， 如果启用了的话）中移除，过滤条件是 Pod 被对应的 [服务](https://kubernetes.io/zh/docs/concepts/services-networking/service/)以某 [选择算符](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/labels/)选定。 [ReplicaSets](https://kubernetes.io/zh/docs/concepts/workloads/controllers/replicaset/)和其他工作负载资源 不再将关闭进程中的 Pod 视为合法的、能够提供服务的副本。关闭动作很慢的 Pod 也无法继续处理请求数据，因为负载均衡器（例如服务代理）已经在终止宽限期开始的时候 将其从端点列表中移除。

4. 超出终止宽限期限时，`kubelet` 会触发强制关闭过程。容器运行时会向 Pod 中所有容器内 仍在运行的进程发送 `SIGKILL` 信号。 `kubelet` 也会清理隐藏的 `pause` 容器，如果容器运行时使用了这种容器的话。

5. `kubelet` 触发强制从 API 服务器上删除 Pod 对象的逻辑，并将体面终止限期设置为 0 （这意味着马上删除）。

6. API 服务器删除 Pod 的 API 对象，从任何客户端都无法再看到该对象。

### 强制终止 Pod

> **注意：** 对于某些工作负载及其 Pod 而言，强制删除很可能会带来某种破坏。

默认情况下，所有的删除操作都会附有 30 秒钟的宽限期限。 `kubectl delete` 命令支持 `--grace-period=<seconds>` 选项，允许你重载默认值， 设定自己希望的期限值。

将宽限期限强制设置为 `0` 意味着立即从 API 服务器删除 Pod。 如果 Pod 仍然运行于某节点上，强制删除操作会触发 `kubelet` 立即执行清理操作。

> **说明：** 你必须在设置 `--grace-period=0` 的同时额外设置 `--force` 参数才能发起强制删除请求。

执行强制删除操作时，API 服务器不再等待来自 `kubelet` 的、关于 Pod 已经在原来运行的节点上终止执行的确认消息。 API 服务器直接删除 Pod 对象，这样新的与之同名的 Pod 即可以被创建。 在节点侧，被设置为立即终止的 Pod 仍然会在被强行杀死之前获得一点点的宽限时间。

如果你需要强制删除 StatefulSet 的 Pod，请参阅 [从 StatefulSet 中删除 Pod](https://kubernetes.io/zh/docs/tasks/run-application/force-delete-stateful-set-pod/) 的任务文档。

### 失效 Pod 的垃圾收集 

对于已失败的 Pod 而言，对应的 API 对象仍然会保留在集群的 API 服务器上，直到 用户或者[控制器](https://kubernetes.io/zh/docs/concepts/architecture/controller/)进程显式地 将其删除。

控制面组件会在 Pod 个数超出所配置的阈值 （根据 `kube-controller-manager` 的 `terminated-pod-gc-threshold` 设置）时 删除已终止的 Pod（阶段值为 `Succeeded` 或 `Failed`）。 这一行为会避免随着时间演进不断创建和终止 Pod 而引起的资源泄露问题。
