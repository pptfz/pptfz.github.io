# DaemonSet简介

[DaemonSet官方文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/daemonset/)



## DaemonSet简介

**DaemonSet** 确保全部（或者某些）节点上运行一个 Pod 的副本。 当有节点加入集群时， 也会为他们新增一个 Pod 。 当有节点从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。

DaemonSet 的一些典型用法：

- 在每个节点上运行集群守护进程
- 在每个节点上运行日志收集守护进程
- 在每个节点上运行监控守护进程

一种简单的用法是为每种类型的守护进程在所有的节点上都启动一个 DaemonSet。 一个稍微复杂的用法是为同一种守护进程部署多个 DaemonSet；每个具有不同的标志， 并且对不同硬件类型具有不同的内存、CPU 要求。



## 使用DaemonSet

### 创建 DaemonSet

编辑yaml文件

:::tip说明

`spec.selector.matchLabels.name` 必须与 `spec.template.metadata.labels.name` 相同

:::

```yaml
cat > daemonset.yaml << EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # 这些容忍度设置是为了让该守护进程集在控制平面节点上运行
      # 如果你不希望自己的控制平面节点运行 Pod，可以删除它们
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
EOF
```



创建daemonset

```shell
kubectl apply -f daemonset.yaml --record=true
```



查看daemonset

```shell
$ kubectl get ds
NAME                    DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
fluentd-elasticsearch   3         3         3       3            3           <none>                   2m37s
```



查看pod

```shell
$ kubectl get pod -o wide
NAME                                   READY   STATUS    RESTARTS   AGE   IP            NODE           NOMINATED NODE   READINESS GATES
fluentd-elasticsearch-tqq4v            1/1     Running   0          82s   10.244.2.23   k8s-node02     <none>           <none>
fluentd-elasticsearch-v4z64            1/1     Running   0          82s   10.244.1.2    k8s-node01     <none>           <none>
fluentd-elasticsearch-vbzmz            1/1     Running   0          82s   10.244.0.2    k8s-master01   <none>           <none>
```



### 必须字段

与所有其他 Kubernetes 配置一样，DaemonSet 也需要 `apiVersion`、`kind` 和 `metadata` 字段。 有关使用这些配置文件的通用信息， 参见[运行无状态应用](https://kubernetes.io/zh-cn/docs/tasks/run-application/run-stateless-application-deployment/)和[使用 kubectl 管理对象](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/)。

DaemonSet 对象的名称必须是一个合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)。

DaemonSet 也需要 [`.spec`](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status) 节区。



### Pod 模板

`.spec` 中唯一必需的字段是 `.spec.template`。

`.spec.template` 是一个 [Pod 模板](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/#pod-templates)。 除了它是嵌套的，因而不具有 `apiVersion` 或 `kind` 字段之外，它与 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 具有相同的 schema。

除了 Pod 必需字段外，在 DaemonSet 中的 Pod 模板必须指定合理的标签（查看 [Pod 选择算符](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/daemonset/#pod-selector)）。

在 DaemonSet 中的 Pod 模板必须具有一个值为 `Always` 的 [`RestartPolicy`](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)。 当该值未指定时，默认是 `Always`。



### Pod 选择算符

`.spec.selector` 字段表示 Pod 选择算符，它与 [Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/) 的 `.spec.selector` 的作用是相同的。

你必须指定与 `.spec.template` 的标签匹配的 Pod 选择算符。 此外，一旦创建了 DaemonSet，它的 `.spec.selector` 就不能修改。 修改 Pod 选择算符可能导致 Pod 意外悬浮，并且这对用户来说是费解的。

`spec.selector` 是一个对象，如下两个字段组成：

- `matchLabels` - 与 [ReplicationController](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/replicationcontroller/) 的 `.spec.selector` 的作用相同。
- `matchExpressions` - 允许构建更加复杂的选择器，可以通过指定 key、value 列表以及将 key 和 value 列表关联起来的 Operator。

当上述两个字段都指定时，结果会按逻辑与（AND）操作处理。

`.spec.selector` 必须与 `.spec.template.metadata.labels` 相匹配。 如果配置中这两个字段不匹配，则会被 API 拒绝。



### 仅在某些节点上运行 Pod

如果指定了 `.spec.template.spec.nodeSelector`，DaemonSet 控制器将在能够与 [Node 选择算符](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/)匹配的节点上创建 Pod。 类似这种情况，可以指定 `.spec.template.spec.affinity`，之后 DaemonSet 控制器将在能够与[节点亲和性](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/)匹配的节点上创建 Pod。 如果根本就没有指定，则 DaemonSet Controller 将在所有节点上创建 Pod。



## Daemon Pods 是如何被调度的

### 通过默认调度器调度

**特性状态：** `Kubernetes 1.17 [stable]`

DaemonSet 确保所有符合条件的节点都运行该 Pod 的一个副本。 通常，运行 Pod 的节点由 Kubernetes 调度器选择。 不过，DaemonSet Pods 由 DaemonSet 控制器创建和调度。这就带来了以下问题：

- Pod 行为的不一致性：正常 Pod 在被创建后等待调度时处于 `Pending` 状态， DaemonSet Pods 创建后不会处于 `Pending` 状态下。这使用户感到困惑。
- [Pod 抢占](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/pod-priority-preemption/)由默认调度器处理。 启用抢占后，DaemonSet 控制器将在不考虑 Pod 优先级和抢占的情况下制定调度决策。

`ScheduleDaemonSetPods` 允许你使用默认调度器而不是 DaemonSet 控制器来调度这些 DaemonSet， 方法是将 `NodeAffinity` 条件而不是 `.spec.nodeName` 条件添加到这些 DaemonSet Pod。 默认调度器接下来将 Pod 绑定到目标主机。 如果 DaemonSet Pod 的节点亲和性配置已存在，则被替换 （原始的节点亲和性配置在选择目标主机之前被考虑）。 DaemonSet 控制器仅在创建或修改 DaemonSet Pod 时执行这些操作， 并且不会更改 DaemonSet 的 `spec.template`。

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchFields:
      - key: metadata.name
        operator: In
        values:
        - target-host-name
```

此外，系统会自动添加 `node.kubernetes.io/unschedulable：NoSchedule` 容忍度到这些 DaemonSet Pod。在调度 DaemonSet Pod 时，默认调度器会忽略 `unschedulable` 节点。



### 污点和容忍度

尽管 Daemon Pod 遵循[污点和容忍度](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/taint-and-toleration)规则， 根据相关特性，控制器会自动将以下容忍度添加到 DaemonSet Pod：

| 容忍度键名                               | 效果       | 版本  | 描述                                                         |
| ---------------------------------------- | ---------- | ----- | ------------------------------------------------------------ |
| `node.kubernetes.io/not-ready`           | NoExecute  | 1.13+ | 当出现类似网络断开的情况导致节点问题时，DaemonSet Pod 不会被逐出。 |
| `node.kubernetes.io/unreachable`         | NoExecute  | 1.13+ | 当出现类似于网络断开的情况导致节点问题时，DaemonSet Pod 不会被逐出。 |
| `node.kubernetes.io/disk-pressure`       | NoSchedule | 1.8+  | DaemonSet Pod 被默认调度器调度时能够容忍磁盘压力属性。       |
| `node.kubernetes.io/memory-pressure`     | NoSchedule | 1.8+  | DaemonSet Pod 被默认调度器调度时能够容忍内存压力属性。       |
| `node.kubernetes.io/unschedulable`       | NoSchedule | 1.12+ | DaemonSet Pod 能够容忍默认调度器所设置的 `unschedulable` 属性. |
| `node.kubernetes.io/network-unavailable` | NoSchedule | 1.12+ | DaemonSet 在使用宿主网络时，能够容忍默认调度器所设置的 `network-unavailable` 属性。 |



## 与 Daemon Pods 通信

与 DaemonSet 中的 Pod 进行通信的几种可能模式如下：

- **推送（Push）**：配置 DaemonSet 中的 Pod，将更新发送到另一个服务，例如统计数据库。 这些服务没有客户端。
- **NodeIP 和已知端口**：DaemonSet 中的 Pod 可以使用 `hostPort`，从而可以通过节点 IP 访问到 Pod。客户端能通过某种方法获取节点 IP 列表，并且基于此也可以获取到相应的端口。
- **DNS**：创建具有相同 Pod 选择算符的[无头服务](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#headless-services)， 通过使用 `endpoints` 资源或从 DNS 中检索到多个 A 记录来发现 DaemonSet。
- **Service**：创建具有相同 Pod 选择算符的服务，并使用该服务随机访问到某个节点上的守护进程（没有办法访问到特定节点）。



## 更新 DaemonSet

如果节点的标签被修改，DaemonSet 将立刻向新匹配上的节点添加 Pod， 同时删除不匹配的节点上的 Pod。

你可以修改 DaemonSet 创建的 Pod。不过并非 Pod 的所有字段都可更新。 下次当某节点（即使具有相同的名称）被创建时，DaemonSet 控制器还会使用最初的模板。

你可以删除一个 DaemonSet。如果使用 `kubectl` 并指定 `--cascade=orphan` 选项， 则 Pod 将被保留在节点上。接下来如果创建使用相同选择算符的新 DaemonSet， 新的 DaemonSet 会收养已有的 Pod。 如果有 Pod 需要被替换，DaemonSet 会根据其 `updateStrategy` 来替换。

你可以对 DaemonSet [执行滚动更新](https://kubernetes.io/zh-cn/docs/tasks/manage-daemon/update-daemon-set/)操作。



## DaemonSet 的替代方案

### init 脚本

直接在节点上启动守护进程（例如使用 `init`、`upstartd` 或 `systemd`）的做法当然是可行的。 不过，基于 DaemonSet 来运行这些进程有如下一些好处：

- 像所运行的其他应用一样，DaemonSet 具备为守护进程提供监控和日志管理的能力。
- 为守护进程和应用所使用的配置语言和工具（如 Pod 模板、`kubectl`）是相同的。
- 在资源受限的容器中运行守护进程能够增加守护进程和应用容器的隔离性。 然而，这一点也可以通过在容器中运行守护进程但却不在 Pod 中运行之来实现。



### 裸 Pod

直接创建 Pod并指定其运行在特定的节点上也是可以的。 然而，DaemonSet 能够替换由于任何原因（例如节点失败、例行节点维护、内核升级） 而被删除或终止的 Pod。 由于这个原因，你应该使用 DaemonSet 而不是单独创建 Pod。



### 静态 Pod

通过在一个指定的、受 `kubelet` 监视的目录下编写文件来创建 Pod 也是可行的。 这类 Pod 被称为[静态 Pod](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/static-pod/)。 不像 DaemonSet，静态 Pod 不受 `kubectl` 和其它 Kubernetes API 客户端管理。 静态 Pod 不依赖于 API 服务器，这使得它们在启动引导新集群的情况下非常有用。 此外，静态 Pod 在将来可能会被废弃。



### Deployment

DaemonSet 与 [Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/) 非常类似， 它们都能创建 Pod，并且 Pod 中的进程都不希望被终止（例如，Web 服务器、存储服务器）。

建议为无状态的服务使用 Deployment，比如前端服务。 对这些服务而言，对副本的数量进行扩缩容、平滑升级，比精确控制 Pod 运行在某个主机上要重要得多。 当需要 Pod 副本总是运行在全部或特定主机上，并且当该 DaemonSet 提供了节点级别的功能（允许其他 Pod 在该特定节点上正确运行）时， 应该使用 DaemonSet。

例如，[网络插件](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/)通常包含一个以 DaemonSet 运行的组件。 这个 DaemonSet 组件确保它所在的节点的集群网络正常工作。



