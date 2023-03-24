# HorizontalPodAutoscaler简介

[HPA官方文档](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/)

# Pod 水平自动扩缩

在 Kubernetes 中，**HorizontalPodAutoscaler** 自动更新工作负载资源 （例如 [Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/) 或者 [StatefulSet](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/statefulset/)）， 目的是自动扩缩工作负载以满足需求。

水平扩缩意味着对增加的负载的响应是部署更多的 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/)。 这与 “垂直（Vertical）” 扩缩不同，对于 Kubernetes， 垂直扩缩意味着将更多资源（例如：内存或 CPU）分配给已经为工作负载运行的 Pod。

如果负载减少，并且 Pod 的数量高于配置的最小值， HorizontalPodAutoscaler 会指示工作负载资源（Deployment、StatefulSet 或其他类似资源）缩减。

水平 Pod 自动扩缩不适用于无法扩缩的对象（例如：[DaemonSet](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/daemonset/)。）

HorizontalPodAutoscaler 被实现为 Kubernetes API 资源和[控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/)。

资源决定了控制器的行为。 在 Kubernetes [控制平面](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-control-plane)内运行的水平 Pod 自动扩缩控制器会定期调整其目标（例如：Deployment）的所需规模，以匹配观察到的指标， 例如，平均 CPU 利用率、平均内存利用率或你指定的任何其他自定义指标。

使用水平 Pod 自动扩缩[演练示例](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)。



## HorizontalPodAutoscaler 是如何工作的

HorizontalPodAutoscaler 控制 Deployment 及其 ReplicaSet 的规模示意图

![iShot_2022-11-25_14.58.53](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-11-25_14.58.53.png)





Kubernetes 将水平 Pod 自动扩缩实现为一个间歇运行的控制回路（它不是一个连续的过程）。间隔由 [`kube-controller-manager`](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-controller-manager/) 的 `--horizontal-pod-autoscaler-sync-period` 参数设置（默认间隔为 15 秒）。

在每个时间段内，控制器管理器都会根据每个 HorizontalPodAutoscaler 定义中指定的指标查询资源利用率。 控制器管理器找到由 `scaleTargetRef` 定义的目标资源，然后根据目标资源的 `.spec.selector` 标签选择 Pod， 并从资源指标 API（针对每个 Pod 的资源指标）或自定义指标获取指标 API（适用于所有其他指标）。

- 对于按 Pod 统计的资源指标（如 CPU），控制器从资源指标 API 中获取每一个 HorizontalPodAutoscaler 指定的 Pod 的度量值，如果设置了目标使用率， 控制器获取每个 Pod 中的容器[资源使用](https://kubernetes.io/zh-cn/docs/concepts/configuration/manage-resources-containers/#requests-and-limits) 情况， 并计算资源使用率。如果设置了 target 值，将直接使用原始数据（不再计算百分比）。 接下来，控制器根据平均的资源使用率或原始值计算出扩缩的比例，进而计算出目标副本数。

  需要注意的是，如果 Pod 某些容器不支持资源采集，那么控制器将不会使用该 Pod 的 CPU 使用率。 下面的[算法细节](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)章节将会介绍详细的算法。

- 如果 Pod 使用自定义指示，控制器机制与资源指标类似，区别在于自定义指标只使用原始值，而不是使用率。

- 如果 Pod 使用对象指标和外部指标（每个指标描述一个对象信息）。 这个指标将直接根据目标设定值相比较，并生成一个上面提到的扩缩比例。 在 `autoscaling/v2beta2` 版本 API 中，这个指标也可以根据 Pod 数量平分后再计算。

HorizontalPodAutoscaler 的常见用途是将其配置为从[聚合 API](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/) （`metrics.k8s.io`、`custom.metrics.k8s.io` 或 `external.metrics.k8s.io`）获取指标。 `metrics.k8s.io` API 通常由名为 Metrics Server 的插件提供，需要单独启动。有关资源指标的更多信息， 请参阅 [Metrics Server](https://kubernetes.io/zh-cn/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/#metrics-server)。

对 [Metrics API 的支持](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-metrics-apis)解释了这些不同 API 的稳定性保证和支持状态

HorizontalPodAutoscaler 控制器访问支持扩缩的相应工作负载资源（例如：Deployment 和 StatefulSet）。 这些资源每个都有一个名为 `scale` 的子资源，该接口允许你动态设置副本的数量并检查它们的每个当前状态。 有关 Kubernetes API 子资源的一般信息， 请参阅 [Kubernetes API 概念](https://kubernetes.io/zh-cn/docs/reference/using-api/api-concepts/)。



### 算法细节

从最基本的角度来看，Pod 水平自动扩缩控制器根据当前指标和期望指标来计算扩缩比例。

```
期望副本数 = ceil[当前副本数 * (当前指标 / 期望指标)]
```



例如，如果当前指标值为 `200m`，而期望值为 `100m`，则副本数将加倍， 因为 `200.0 / 100.0 == 2.0` 如果当前值为 `50m`，则副本数将减半， 因为 `50.0 / 100.0 == 0.5`。如果比率足够接近 1.0（在全局可配置的容差范围内，默认为 0.1）， 则控制平面会跳过扩缩操作。

如果 HorizontalPodAutoscaler 指定的是 `targetAverageValue` 或 `targetAverageUtilization`， 那么将会把指定 Pod 度量值的平均值做为 `currentMetricValue`。

在检查容差并决定最终值之前，控制平面还会考虑是否缺少任何指标， 以及有多少 Pod [`已就绪`](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions)。

所有设置了删除时间戳的 Pod（带有删除时间戳的对象正在关闭/移除的过程中）都会被忽略， 所有失败的 Pod 都会被丢弃。

如果某个 Pod 缺失度量值，它将会被搁置，只在最终确定扩缩数量时再考虑。

当使用 CPU 指标来扩缩时，任何还未就绪（还在初始化，或者可能是不健康的）状态的 Pod **或** 最近的指标度量值采集于就绪状态前的 Pod，该 Pod 也会被搁置。

由于技术限制，HorizontalPodAutoscaler 控制器在确定是否保留某些 CPU 指标时无法准确确定 Pod 首次就绪的时间。 相反，如果 Pod 未准备好并在其启动后的一个可配置的短时间窗口内转换为准备好，它会认为 Pod “尚未准备好”。 该值使用 `--horizontal-pod-autoscaler-initial-readiness-delay` 标志配置，默认值为 30 秒。 一旦 Pod 准备就绪，如果它发生在自启动后较长的、可配置的时间内，它就会认为任何向准备就绪的转换都是第一个。 该值由 `-horizontal-pod-autoscaler-cpu-initialization-period` 标志配置，默认为 5 分钟。

在排除掉被搁置的 Pod 后，扩缩比例就会根据 `currentMetricValue/desiredMetricValue` 计算出来。

如果缺失某些度量值，控制平面会更保守地重新计算平均值，在需要缩小时假设这些 Pod 消耗了目标值的 100%， 在需要放大时假设这些 Pod 消耗了 0% 目标值。这可以在一定程度上抑制扩缩的幅度。

此外，如果存在任何尚未就绪的 Pod，工作负载会在不考虑遗漏指标或尚未就绪的 Pod 的情况下进行扩缩， 控制器保守地假设尚未就绪的 Pod 消耗了期望指标的 0%，从而进一步降低了扩缩的幅度。

考虑到尚未准备好的 Pod 和缺失的指标后，控制器会重新计算使用率。 如果新的比率与扩缩方向相反，或者在容差范围内，则控制器不会执行任何扩缩操作。 在其他情况下，新比率用于决定对 Pod 数量的任何更改。

注意，平均利用率的 **原始** 值是通过 HorizontalPodAutoscaler 状态体现的， 而不考虑尚未准备好的 Pod 或缺少的指标，即使使用新的使用率也是如此。

如果创建 HorizontalPodAutoscaler 时指定了多个指标， 那么会按照每个指标分别计算扩缩副本数，取最大值进行扩缩。 如果任何一个指标无法顺利地计算出扩缩副本数（比如，通过 API 获取指标时出错）， 并且可获取的指标建议缩容，那么本次扩缩会被跳过。 这表示，如果一个或多个指标给出的 `desiredReplicas` 值大于当前值，HPA 仍然能实现扩容。

最后，在 HPA 控制器执行扩缩操作之前，会记录扩缩建议信息。 控制器会在操作时间窗口中考虑所有的建议信息，并从中选择得分最高的建议。 这个值可通过 `kube-controller-manager` 服务的启动参数 `--horizontal-pod-autoscaler-downscale-stabilization` 进行配置， 默认值为 5 分钟。 这个配置可以让系统更为平滑地进行缩容操作，从而消除短时间内指标值快速波动产生的影响。



## API 对象

HorizontalPodAutoscaler 是 Kubernetes `autoscaling` API 组中的 API 资源。 当前的稳定版本可以在 `autoscaling/v2` API 版本中找到，其中包括对基于内存和自定义指标执行扩缩的支持。 在使用 `autoscaling/v1` 时，`autoscaling/v2` 中引入的新字段作为注释保留。

创建 HorizontalPodAutoscaler 对象时，需要确保所给的名称是一个合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)。 有关 API 对象的更多信息，请查阅 [HorizontalPodAutoscaler 对象文档](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#horizontalpodautoscaler-v2-autoscaling)。



## 工作量规模的稳定性

在使用 HorizontalPodAutoscaler 管理一组副本的规模时，由于评估的指标的动态特性， 副本的数量可能会经常波动。这有时被称为 **抖动（thrashing）** 或 **波动（flapping）**。 它类似于控制论中的 **滞后（hysteresis）** 概念。



## 滚动升级时扩缩

Kubernetes 允许你在 Deployment 上执行滚动更新。在这种情况下，Deployment 为你管理下层的 ReplicaSet。 当你为一个 Deployment 配置自动扩缩时，你要为每个 Deployment 绑定一个 HorizontalPodAutoscaler。 HorizontalPodAutoscaler 管理 Deployment 的 `replicas` 字段。 Deployment Controller 负责设置下层 ReplicaSet 的 `replicas` 字段， 以便确保在上线及后续过程副本个数合适。

如果你对一个副本个数被自动扩缩的 StatefulSet 执行滚动更新，该 StatefulSet 会直接管理它的 Pod 集合 （不存在类似 ReplicaSet 这样的中间资源）。



## 对资源指标的支持

HPA 的任何目标资源都可以基于其中的 Pods 的资源用量来实现扩缩。 在定义 Pod 规约时，类似 `cpu` 和 `memory` 这类资源请求必须被设定。 这些设定值被用来确定资源利用量并被 HPA 控制器用来对目标资源完成扩缩操作。 要使用基于资源利用率的扩缩，可以像下面这样指定一个指标源：

```yaml
type: Resource
resource:
  name: cpu
  target:
    type: Utilization
    averageUtilization: 60
```

基于这一指标设定，HPA 控制器会维持扩缩目标中的 Pods 的平均资源利用率在 60%。 利用率是 Pod 的当前资源用量与其请求值之间的比值。 关于如何计算利用率以及如何计算平均值的细节可参考[算法](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)小节。

:::tip说明

由于所有的容器的资源用量都会被累加起来，Pod 的总体资源用量值可能不会精确体现各个容器的资源用量。 这一现象也会导致一些问题，例如某个容器运行时的资源用量非常高，但因为 Pod 层面的资源用量总值让人在可接受的约束范围内，HPA 不会执行扩大目标对象规模的操作。

:::



### 容器资源指标

**特性状态：** `Kubernetes v1.20 [alpha]`

HorizontalPodAutoscaler API 也支持容器指标源，这时 HPA 可以跟踪记录一组 Pod 中各个容器的资源用量，进而触发扩缩目标对象的操作。 容器资源指标的支持使得你可以为特定 Pod 中最重要的容器配置规模扩缩阈值。 例如，如果你有一个 Web 应用和一个执行日志操作的边车容器，你可以基于 Web 应用的资源用量来执行扩缩，忽略边车容器的存在及其资源用量。

如果你更改扩缩目标对象，令其使用新的、包含一组不同的容器的 Pod 规约，你就需要修改 HPA 的规约才能基于新添加的容器来执行规模扩缩操作。 如果指标源中指定的容器不存在或者仅存在于部分 Pod 中，那么这些 Pod 会被忽略， HPA 会重新计算资源用量值。参阅[算法](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)小节进一步了解计算细节。 要使用容器资源用量来完成自动扩缩，可以像下面这样定义指标源：

```yaml
type: ContainerResource
containerResource:
  name: cpu
  container: application
  target:
    type: Utilization
    averageUtilization: 60
```

在上面的例子中，HPA 控制器会对目标对象执行扩缩操作以确保所有 Pod 中 `application` 容器的平均 CPU 用量为 60%。

:::tip说明

如果你要更改 HorizontalPodAutoscaler 所跟踪记录的容器的名称，你可以按一定顺序来执行这一更改， 确保在应用更改的过程中用来判定扩缩行为的容器可用。 在更新定义容器的资源（如 Deployment）之前，你需要更新相关的 HPA， 使之能够同时跟踪记录新的和老的容器名称。这样，HPA 就能够在整个更新过程中继续计算并提供扩缩操作建议。

一旦你已经将容器名称变更这一操作应用到整个负载对象至上，就可以从 HPA 的规约中去掉老的容器名称，完成清理操作。

:::



## 扩展自定义指标

**特性状态：** `Kubernetes v1.23 [stable]`

（之前的 `autoscaling/v2beta2` API 版本将此功能作为 beta 功能提供）

如果你使用 `autoscaling/v2` API 版本，则可以将 HorizontalPodAutoscaler 配置为基于自定义指标（未内置于 Kubernetes 或任何 Kubernetes 组件）进行扩缩。 HorizontalPodAutoscaler 控制器能够从 Kubernetes API 查询这些自定义指标。

有关要求，请参阅对 [Metrics APIs 的支持](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-metrics-apis)。





## 基于多个指标来执行扩缩

**特性状态：** `Kubernetes v1.23 [stable]`

（之前的 `autoscaling/v2beta2` API 版本将此功能作为 beta 功能提供）

如果你使用 `autoscaling/v2` API 版本，你可以为 HorizontalPodAutoscaler 指定多个指标以进行扩缩。 HorizontalPodAutoscaler 控制器评估每个指标，并根据该指标提出一个新的比例。 HorizontalPodAutoscaler 采用为每个指标推荐的最大比例， 并将工作负载设置为该大小（前提是这不大于你配置的总体最大值）。





## 对 Metrics API 的支持

默认情况下，HorizontalPodAutoscaler 控制器会从一系列的 API 中检索度量值。 集群管理员需要确保下述条件，以保证 HPA 控制器能够访问这些 API：

- 启用了 [API 聚合层](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/configure-aggregation-layer/)
- 相应的 API 已注册：
  - 对于资源指标，将使用 `metrics.k8s.io` API，一般由 [metrics-server](https://github.com/kubernetes-incubator/metrics-server) 提供。 它可以作为集群插件启动。
  - 对于自定义指标，将使用 `custom.metrics.k8s.io` API。 它由其他度量指标方案厂商的“适配器（Adapter）” API 服务器提供。 检查你的指标管道以查看是否有可用的 Kubernetes 指标适配器。
  - 对于外部指标，将使用 `external.metrics.k8s.io` API。可能由上面的自定义指标适配器提供。

关于指标来源以及其区别的更多信息，请参阅相关的设计文档， [HPA V2](https://github.com/kubernetes/design-proposals-archive/blob/main/autoscaling/hpa-v2.md)， [custom.metrics.k8s.io](https://github.com/kubernetes/design-proposals-archive/blob/main/instrumentation/custom-metrics-api.md) 和 [external.metrics.k8s.io](https://github.com/kubernetes/design-proposals-archive/blob/main/instrumentation/external-metrics-api.md)。

关于如何使用它们的示例， 请参考[使用自定义指标的教程](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/#autoscaling-on-multiple-metrics-and-custom-metrics) 和[使用外部指标的教程](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/#autoscaling-on-metrics-not-related-to-kubernetes-objects)。





## 可配置的扩缩行为

**特性状态：** `Kubernetes v1.23 [stable]`

（之前的 `autoscaling/v2beta2` API 版本将此功能作为 beta 功能提供）

如果你使用 `v2` HorizontalPodAutoscaler API，你可以使用 `behavior` 字段 （请参阅 [API 参考](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/horizontal-pod-autoscaler-v2/#HorizontalPodAutoscalerSpec)） 来配置单独的放大和缩小行为。你可以通过在行为字段下设置 `scaleUp` 和/或 `scaleDown` 来指定这些行为。

你可以指定一个 “稳定窗口”，以防止扩缩目标的副本计数发生[波动](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#flapping)。 扩缩策略还允许你在扩缩时控制副本的变化率。



### 扩缩策略

可以在规约的 `behavior` 部分中指定一个或多个扩缩策略。当指定多个策略时， 允许最大更改量的策略是默认选择的策略。以下示例显示了缩小时的这种行为：

```yaml
behavior:
  scaleDown:
    policies:
    - type: Pods
      value: 4
      periodSeconds: 60
    - type: Percent
      value: 10
      periodSeconds: 60
```

`periodSeconds` 表示在过去的多长时间内要求策略值为真。 第一个策略（Pods）允许在一分钟内最多缩容 4 个副本。第二个策略（Percent） 允许在一分钟内最多缩容当前副本个数的百分之十。

由于默认情况下会选择容许更大程度作出变更的策略，只有 Pod 副本数大于 40 时， 第二个策略才会被采用。如果副本数为 40 或者更少，则应用第一个策略。 例如，如果有 80 个副本，并且目标必须缩小到 10 个副本，那么在第一步中将减少 8 个副本。 在下一轮迭代中，当副本的数量为 72 时，10% 的 Pod 数为 7.2，但是这个数字向上取整为 8。 在 autoscaler 控制器的每个循环中，将根据当前副本的数量重新计算要更改的 Pod 数量。 当副本数量低于 40 时，应用第一个策略（Pods），一次减少 4 个副本。

可以指定扩缩方向的 `selectPolicy` 字段来更改策略选择。 通过设置 `Min` 的值，它将选择副本数变化最小的策略。 将该值设置为 `Disabled` 将完全禁用该方向的扩缩。



### 稳定窗口

当用于扩缩的指标不断波动时，稳定窗口用于限制副本计数的[波动](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#flapping)。 自动扩缩算法使用此窗口来推断先前的期望状态并避免对工作负载规模进行不必要的更改。

例如，在以下示例代码段中，为 `scaleDown` 指定了稳定窗口。

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
```

当指标显示目标应该缩容时，自动扩缩算法查看之前计算的期望状态，并使用指定时间间隔内的最大值。 在上面的例子中，过去 5 分钟的所有期望状态都会被考虑。

这近似于滚动最大值，并避免了扩缩算法频繁删除 Pod 而又触发重新创建等效 Pod。



### 默认行为

要使用自定义扩缩，不必指定所有字段。 只有需要自定义的字段才需要指定。 这些自定义值与默认值合并。 默认值与 HPA 算法中的现有行为匹配。

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
  scaleUp:
    stabilizationWindowSeconds: 0
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
    - type: Pods
      value: 4
      periodSeconds: 15
    selectPolicy: Max
```

用于缩小稳定窗口的时间为 **300** 秒（或是 `--horizontal-pod-autoscaler-downscale-stabilization` 参数设定值）。 只有一种缩容的策略，允许 100% 删除当前运行的副本，这意味着扩缩目标可以缩小到允许的最小副本数。 对于扩容，没有稳定窗口。当指标显示目标应该扩容时，目标会立即扩容。 这里有两种策略，每 15 秒添加 4 个 Pod 或 100% 当前运行的副本数，直到 HPA 达到稳定状态。



### 示例：更改缩容稳定窗口

将下面的 behavior 配置添加到 HPA 中，可提供一个 1 分钟的自定义缩容稳定窗口：

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 60
```



### 示例：限制缩容速率

将下面的 behavior 配置添加到 HPA 中，可限制 Pod 被 HPA 删除速率为每分钟 10%：

```yaml
behavior:
  scaleDown:
    policies:
    - type: Percent
      value: 10
      periodSeconds: 60
```



为了确保每分钟删除的 Pod 数不超过 5 个，可以添加第二个缩容策略，大小固定为 5，并将 `selectPolicy` 设置为最小值。 将 `selectPolicy` 设置为 `Min` 意味着 autoscaler 会选择影响 Pod 数量最小的策略:

```yaml
behavior:
  scaleDown:
    policies:
    - type: Percent
      value: 10
      periodSeconds: 60
    - type: Pods
      value: 5
      periodSeconds: 60
    selectPolicy: Min
```





### 示例：禁用缩容

`selectPolicy` 的值 `Disabled` 会关闭对给定方向的缩容。 因此使用以下策略，将会阻止缩容：

```yaml
behavior:
  scaleDown:
    selectPolicy: Disabled
```



## kubectl 对 HorizontalPodAutoscaler 的支持

与每个 API 资源一样，HorizontalPodAutoscaler 都被 `kubectl` 以标准方式支持。 你可以使用 `kubectl create` 命令创建一个新的自动扩缩器。 你可以通过 `kubectl get hpa` 列出自动扩缩器或通过 `kubectl describe hpa` 获取详细描述。 最后，你可以使用 `kubectl delete hpa` 删除自动扩缩器。

此外，还有一个特殊的 `kubectl autoscale` 命令用于创建 HorizontalPodAutoscaler 对象。 例如，执行 `kubectl autoscale rs foo --min=2 --max=5 --cpu-percent=80` 将为 ReplicaSet **foo** 创建一个自动扩缩器，目标 CPU 利用率设置为 `80%`，副本数在 2 到 5 之间。



## 隐式维护状态禁用

你可以在不必更改 HPA 配置的情况下隐式地为某个目标禁用 HPA。 如果此目标的期望副本个数被设置为 0，而 HPA 的最小副本个数大于 0， 则 HPA 会停止调整目标（并将其自身的 `ScalingActive` 状况设置为 `false`）， 直到你通过手动调整目标的期望副本个数或 HPA 的最小副本个数来重新激活。



### 将 Deployment 和 StatefulSet 迁移到水平自动扩缩

当启用 HPA 时，建议从它们的[清单](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-manifest)中删除 Deployment 和/或 StatefulSet 的 `spec.replicas` 的值。 如果不这样做，则只要应用对该对象的更改，例如通过 `kubectl apply -f deployment.yaml`， 这将指示 Kubernetes 将当前 Pod 数量扩缩到 `spec.replicas` 键的值。这可能不是所希望的， 并且当 HPA 处于活动状态时可能会很麻烦。

请记住，删除 `spec.replicas` 可能会导致 Pod 计数一次性降级，因为此键的默认值为 1 （参考 [Deployment Replicas](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment#replicas)）。 更新后，除 1 之外的所有 Pod 都将开始其终止程序。之后的任何部署应用程序都将正常运行， 并根据需要遵守滚动更新配置。你可以根据修改部署的方式选择以下两种方法之一来避免这种降级：



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="客户端" label="客户端apply操作(默认行为)" default>

1.`kubectl apply edit-last-applied deployment/<Deployment 名称>`

2.在编辑器中，删除 `spec.replicas`。当你保存并退出编辑器时，`kubectl` 会应用更新。 在此步骤中不会更改 Pod 计数。

3.你现在可以从清单中删除 `spec.replicas`。如果你使用源代码管理， 还应提交你的更改或采取任何其他步骤来修改源代码，以适应你如何跟踪更新。

4.从这里开始，你可以运行 `kubectl apply -f deployment.yaml`

 </TabItem>
  <TabItem value="服务器端" label="服务器端apply操作">
使用 [服务器端 Apply](https://kubernetes.io/zh-cn/docs/reference/using-api/server-side-apply/)机制， 你可以遵循 [交出所有权](https://kubernetes.io/zh-cn/docs/reference/using-api/server-side-apply/#transferring-ownership) 说明， 该指南涵盖了这个确切的用例。
  </TabItem>
</Tabs>

