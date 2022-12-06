# HorizontalPodAutoscaler使用示例

[HorizontalPodAutoscaler](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/)（简称 HPA ） 自动更新工作负载资源（例如 [Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/) 或者 [StatefulSet](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/statefulset/)）， 目的是自动扩缩工作负载以满足需求。

水平扩缩意味着对增加的负载的响应是部署更多的 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/)。 这与 “垂直（Vertical）” 扩缩不同，对于 Kubernetes， 垂直扩缩意味着将更多资源（例如：内存或 CPU）分配给已经为工作负载运行的 Pod。

如果负载减少，并且 Pod 的数量高于配置的最小值， HorizontalPodAutoscaler 会指示工作负载资源（Deployment、StatefulSet 或其他类似资源）缩减。

本文档将引导你完成启用 HorizontalPodAutoscaler 以自动管理示例 Web 应用程序的扩缩的示例。 此示例工作负载是运行一些 PHP 代码的 Apache httpd。



## 前提准备

你的 Kubernetes 服务器版本必须不低于版本 1.23. 要获知版本信息，请输入 `kubectl version`.

按照本演练进行操作，你需要一个部署并配置了 [Metrics Server](https://github.com/kubernetes-sigs/metrics-server#readme) 的集群。 Kubernetes Metrics Server 从集群中的 [kubelets](https://kubernetes.io/docs/reference/generated/kubelet) 收集资源指标， 并通过 [Kubernetes API](https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/) 公开这些指标， 使用 [APIService](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/) 添加代表指标读数的新资源。

要了解如何部署 Metrics Server，请参阅 [metrics-server 文档](https://github.com/kubernetes-sigs/metrics-server#deployment)。



## 运行 php-apache 服务器并暴露服务

为了演示 HorizontalPodAutoscaler，你将首先启动一个 Deployment 用 `hpa-example` 镜像运行一个容器， 然后使用以下清单文件将其暴露为一个 [服务（Service）](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/)：

```yaml
cat > php-apache.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  replicas: 1
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        #image: registry.k8s.io/hpa-example
        image: uhub.service.ucloud.cn/996.icu/hpa-example:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
EOF
```



创建

```shell
kubectl apply -f php-apache.yaml 
```



查看，会创建名为 `php-apache` 的 `deployment` 和 `service`

```shell
$ kubectl get all
NAME                              READY   STATUS    RESTARTS   AGE
pod/php-apache-6d9d9dd4fb-5hmwb   1/1     Running   0          76s

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/php-apache   ClusterIP   10.96.106.148   <none>        80/TCP    76s

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/php-apache   1/1     1            1           76s

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/php-apache-6d9d9dd4fb   1         1         1       76s
```



## 创建 HorizontalPodAutoscaler

现在服务器正在运行，使用 `kubectl` 创建自动扩缩器。 [`kubectl autoscale`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#autoscale) 子命令是 `kubectl` 的一部分， 可以帮助你执行此操作。

你将很快运行一个创建 HorizontalPodAutoscaler 的命令， 该 HorizontalPodAutoscaler 维护由你在这些说明的第一步中创建的 php-apache Deployment 控制的 Pod 存在 1 到 10 个副本。

粗略地说，HPA [控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/)将增加和减少副本的数量 （通过更新 Deployment）以保持所有 Pod 的平均 CPU 利用率为 50%。 Deployment 然后更新 ReplicaSet —— 这是所有 Deployment 在 Kubernetes 中工作方式的一部分 —— 然后 ReplicaSet 根据其 `.spec` 的更改添加或删除 Pod。

由于每个 Pod 通过 `kubectl run` 请求 200 milli-cores，这意味着平均 CPU 使用率为 100 milli-cores。 有关算法的更多详细信息， 请参阅[算法详细信息](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)。



创建 HorizontalPodAutoscaler：

```sh
kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10
```



查看hpa

```shell
# 可以使用 hpa 或 horizontalpodautoscaler 任何一个名字都可以
$ kubectl get hpa
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         10        1          26s
```



请注意当前的 CPU 利用率是 0%，这是由于我们尚未发送任何请求到服务器 （`TARGET` 列显示了相应 Deployment 所控制的所有 Pod 的平均 CPU 利用率）。



## 增加负载

接下来，看看自动扩缩器如何对增加的负载做出反应。 为此，你将启动一个不同的 Pod 作为客户端。 客户端 Pod 中的容器在无限循环中运行，向 php-apache 服务发送查询。

```shell
# 在新的终端中运行
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://php-apache; done"
```



一分钟时间左右之后，通过以下命令，我们可以看到 CPU 负载升高了；例如：

```shell
$ kubectl get hpa php-apache --watch
NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   240%/50%   1         10        4          4m2s
```



此时查看pod，可以看到pod数量已经增多了

```shell
$ kubectl get pod
NAME                          READY   STATUS    RESTARTS   AGE
load-generator                1/1     Running   0          74s
php-apache-6d9d9dd4fb-2ldl9   1/1     Running   0          44s
php-apache-6d9d9dd4fb-5hmwb   1/1     Running   0          13m
php-apache-6d9d9dd4fb-9frdd   1/1     Running   0          44s
php-apache-6d9d9dd4fb-fspqt   1/1     Running   0          29s
php-apache-6d9d9dd4fb-nb8z9   1/1     Running   0          44s
```



查看deployment

```shell
$ kubectl get deployment php-apache 
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
php-apache   7/7     7            7           14m
```



查看hpa

```sh
$ kubectl get hpa
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   44%/50%   1         10        7          5m34s
```



可以看到deployment中的副本数量和hpa中的副本数量相同



:::tip说明

有时最终副本的数量可能需要几分钟才能稳定下来。由于环境的差异， 不同环境中最终的副本数量可能与本示例中的数量不同。

:::





## 停止产生负载

在我们创建 `busybox` 容器的终端中，输入 `<Ctrl> + C` 来终止负载的产生。



持续查看hpa，可以看到一段时间后，由于我们手动停止了 `busybox` 容器，因此负载会降为0

```shell
$ kubectl get hpa php-apache --watch
NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   240%/50%   1         10        4          4m2s
php-apache   Deployment/php-apache   76%/50%    1         10        5          4m15s
php-apache   Deployment/php-apache   57%/50%    1         10        5          4m30s
php-apache   Deployment/php-apache   64%/50%    1         10        6          4m46s
php-apache   Deployment/php-apache   57%/50%    1         10        6          5m1s
php-apache   Deployment/php-apache   55%/50%    1         10        7          5m16s
php-apache   Deployment/php-apache   44%/50%    1         10        7          5m31s
php-apache   Deployment/php-apache   47%/50%    1         10        7          5m46s
php-apache   Deployment/php-apache   47%/50%    1         10        7          6m1s
php-apache   Deployment/php-apache   46%/50%    1         10        7          6m16s
php-apache   Deployment/php-apache   42%/50%    1         10        7          6m31s
php-apache   Deployment/php-apache   50%/50%    1         10        7          6m46s
php-apache   Deployment/php-apache   10%/50%    1         10        7          7m1s
php-apache   Deployment/php-apache   0%/50%     1         10        7          7m16s
```





查看deployment，一旦 CPU 利用率降至 0，HPA 会自动将副本数缩减为 1。

```shell
$ kubectl get deployment php-apache
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
php-apache   1/1     1            1           24m
```





## 基于多项度量指标和自定义度量指标自动扩缩

利用 `autoscaling/v2` API 版本，你可以在自动扩缩 php-apache 这个 Deployment 时使用其他度量指标。



首先，将 HorizontalPodAutoscaler 的 YAML 文件改为 `autoscaling/v2` 格式：

```shell
kubectl get hpa php-apache -o yaml > /tmp/hpa-v2.yaml
```



查看 `/tmp/hpa-v2.yaml`

```yaml
$ cat /tmp/hpa-v2.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  creationTimestamp: "2022-12-03T14:53:06Z"
  name: php-apache
  namespace: test
  resourceVersion: "81599"
  uid: c0859860-36b7-49cc-bd28-c373200ab4b9
spec:
  maxReplicas: 10
  metrics:
  - resource:
      name: cpu
      target:
        averageUtilization: 50
        type: Utilization
    type: Resource
  minReplicas: 1
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
status:
  conditions:
  - lastTransitionTime: "2022-12-03T14:53:21Z"
    message: recommended size matches current size
    reason: ReadyForNewScale
    status: "True"
    type: AbleToScale
  - lastTransitionTime: "2022-12-03T14:53:21Z"
    message: the HPA was able to successfully calculate a replica count from cpu resource
      utilization (percentage of request)
    reason: ValidMetricFound
    status: "True"
    type: ScalingActive
  - lastTransitionTime: "2022-12-03T15:05:07Z"
    message: the desired replica count is less than the minimum replica count
    reason: TooFewReplicas
    status: "True"
    type: ScalingLimited
  currentMetrics:
  - resource:
      current:
        averageUtilization: 0
        averageValue: 1m
      name: cpu
    type: Resource
  currentReplicas: 1
  desiredReplicas: 1
  lastScaleTime: "2022-12-03T15:05:07Z"
```



需要注意的是，`targetCPUUtilizationPercentage` 字段已经被名为 `metrics` 的数组所取代。 CPU 利用率这个度量指标是一个 *resource metric*（资源度量指标），因为它表示容器上指定资源的百分比。 除 CPU 外，你还可以指定其他资源度量指标。默认情况下，目前唯一支持的其他资源度量指标为内存。 只要 `metrics.k8s.io` API 存在，这些资源度量指标就是可用的，并且他们不会在不同的 Kubernetes 集群中改变名称。

你还可以指定资源度量指标使用绝对数值，而不是百分比，你需要将 `target.type` 从 `Utilization` 替换成 `AverageValue`，同时设置 `target.averageValue` 而非 `target.averageUtilization` 的值。

还有两种其他类型的度量指标，他们被认为是 *custom metrics*（自定义度量指标）： 即 Pod 度量指标和 Object 度量指标。 这些度量指标可能具有特定于集群的名称，并且需要更高级的集群监控设置。

第一种可选的度量指标类型是 **Pod 度量指标**。这些指标从某一方面描述了 Pod， 在不同 Pod 之间进行平均，并通过与一个目标值比对来确定副本的数量。 它们的工作方式与资源度量指标非常相像，只是它们 **仅** 支持 `target` 类型为 `AverageValue`。



Pod 度量指标通过如下代码块定义：

```yaml
type: Pods
pods:
  metric:
    name: packets-per-second
  target:
    type: AverageValue
    averageValue: 1k
```

第二种可选的度量指标类型是对象 **（Object）度量指标**。 这些度量指标用于描述在相同名字空间中的别的对象，而非 Pod。 请注意这些度量指标不一定来自某对象，它们仅用于描述这些对象。 对象度量指标支持的 `target` 类型包括 `Value` 和 `AverageValue`。 如果是 `Value` 类型，`target` 值将直接与 API 返回的度量指标比较， 而对于 `AverageValue` 类型，API 返回的度量值将按照 Pod 数量拆分， 然后再与 `target` 值比较。 下面的 YAML 文件展示了一个表示 `requests-per-second` 的度量指标。

```yaml
type: Object
object:
  metric:
    name: requests-per-second
  describedObject:
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    name: main-route
  target:
    type: Value
    value: 2k
```

如果你指定了多个上述类型的度量指标，HorizontalPodAutoscaler 将会依次考量各个指标。 HorizontalPodAutoscaler 将会计算每一个指标所提议的副本数量，然后最终选择一个最高值。

比如，如果你的监控系统能够提供网络流量数据，你可以通过 `kubectl edit` 命令将上述 Horizontal Pod Autoscaler 的定义更改为：

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: 1k
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        name: main-route
      target:
        type: Value
        value: 10k
status:
  observedGeneration: 1
  lastScaleTime: <some-time>
  currentReplicas: 1
  desiredReplicas: 1
  currentMetrics:
  - type: Resource
    resource:
      name: cpu
    current:
      averageUtilization: 0
      averageValue: 0
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        name: main-route
      current:
        value: 10k
```

这样，你的 HorizontalPodAutoscaler 将会尝试确保每个 Pod 的 CPU 利用率在 50% 以内， 每秒能够服务 1000 个数据包请求， 并确保所有在 Ingress 后的 Pod 每秒能够服务的请求总数达到 10000 个。



### 基于更特别的度量值来扩缩

许多度量流水线允许你通过名称或附加的 **标签** 来描述度量指标。 对于所有非资源类型度量指标（Pod、Object 和后面将介绍的 External）， 可以额外指定一个标签选择算符。例如，如果你希望收集包含 `verb` 标签的 `http_requests` 度量指标，可以按如下所示设置度量指标块，使得扩缩操作仅针对 GET 请求执行：

```yaml
type: Object
object:
  metric:
    name: http_requests
    selector: {matchLabels: {verb: GET}}
```

这个选择算符使用与 Kubernetes 标签选择算符相同的语法。 如果名称和标签选择算符匹配到多个系列，监测管道会决定如何将多个系列合并成单个值。 选择算符是可以累加的，它不会选择目标以外的对象（类型为 `Pods` 的目标 Pod 或者类型为 `Object` 的目标对象）。



### 基于与 Kubernetes 对象无关的度量指标执行扩缩

运行在 Kubernetes 上的应用程序可能需要基于与 Kubernetes 集群中的任何对象没有明显关系的度量指标进行自动扩缩， 例如那些描述与任何 Kubernetes 名字空间中的服务都无直接关联的度量指标。 在 Kubernetes 1.10 及之后版本中，你可以使用外部度量指标（external metrics）。

使用外部度量指标时，需要了解你所使用的监控系统，相关的设置与使用自定义指标时类似。 外部度量指标使得你可以使用你的监控系统的任何指标来自动扩缩你的集群。 你需要在 `metric` 块中提供 `name` 和 `selector`，同时将类型由 `Object` 改为 `External`。 如果 `metricSelector` 匹配到多个度量指标，HorizontalPodAutoscaler 将会把它们加和。 外部度量指标同时支持 `Value` 和 `AverageValue` 类型，这与 `Object` 类型的度量指标相同。

例如，如果你的应用程序处理来自主机上消息队列的任务， 为了让每 30 个任务有 1 个工作者实例，你可以将下面的内容添加到 HorizontalPodAutoscaler 的配置中。

```yaml
- type: External
  external:
    metric:
      name: queue_messages_ready
      selector:
        matchLabels:
          queue: "worker_tasks"
    target:
      type: AverageValue
      averageValue: 30
```

如果可能，还是推荐定制度量指标而不是外部度量指标，因为这便于让系统管理员加固定制度量指标 API。 而外部度量指标 API 可以允许访问所有的度量指标。 当暴露这些服务时，系统管理员需要仔细考虑这个问题。



## 附录：Horizontal Pod Autoscaler 状态条件

使用 `autoscaling/v2` 格式的 HorizontalPodAutoscaler 时，你将可以看到 Kubernetes 为 HorizongtalPodAutoscaler 设置的状态条件（Status Conditions）。 这些状态条件可以显示当前 HorizontalPodAutoscaler 是否能够执行扩缩以及是否受到一定的限制。

`status.conditions` 字段展示了这些状态条件。 可以通过 `kubectl describe hpa` 命令查看当前影响 HorizontalPodAutoscaler 的各种状态条件信息：

```shell
kubectl describe hpa cm-test
Name:                           cm-test
Namespace:                      prom
Labels:                         <none>
Annotations:                    <none>
CreationTimestamp:              Fri, 16 Jun 2017 18:09:22 +0000
Reference:                      ReplicationController/cm-test
Metrics:                        ( current / target )
  "http_requests" on pods:      66m / 500m
Min replicas:                   1
Max replicas:                   4
ReplicationController pods:     1 current / 1 desired
Conditions:
  Type                  Status  Reason                  Message
  ----                  ------  ------                  -------
  AbleToScale           True    ReadyForNewScale        the last scale time was sufficiently old as to warrant a new scale
  ScalingActive         True    ValidMetricFound        the HPA was able to successfully calculate a replica count from pods metric http_requests
  ScalingLimited        False   DesiredWithinRange      the desired replica count is within the acceptable range
Events:
```

对于上面展示的这个 HorizontalPodAutoscaler，我们可以看出有若干状态条件处于健康状态。 首先，`AbleToScale` 表明 HPA 是否可以获取和更新扩缩信息，以及是否存在阻止扩缩的各种回退条件。 其次，`ScalingActive` 表明 HPA 是否被启用（即目标的副本数量不为零） 以及是否能够完成扩缩计算。 当这一状态为 `False` 时，通常表明获取度量指标存在问题。 最后一个条件 `ScalingLimited` 表明所需扩缩的值被 HorizontalPodAutoscaler 所定义的最大或者最小值所限制（即已经达到最大或者最小扩缩值）。 这通常表明你可能需要调整 HorizontalPodAutoscaler 所定义的最大或者最小副本数量的限制了。



## 量纲

HorizontalPodAutoscaler 和 度量指标 API 中的所有的度量指标使用 Kubernetes 中称为[量纲（Quantity）](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-quantity)的特殊整数表示。 例如，数量 `10500m` 用十进制表示为 `10.5`。 如果可能的话，度量指标 API 将返回没有后缀的整数，否则返回以千分单位的数量。 这意味着你可能会看到你的度量指标在 `1` 和 `1500m`（也就是在十进制记数法中的 `1` 和 `1.5`）之间波动。



## 以声明式方式创建 Autoscaler

除了使用 `kubectl autoscale` 命令，也可以使用以下清单以声明方式创建 HorizontalPodAutoscaler：

```yaml
cat > php-apache.yaml << EOF
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50
EOF
```



使用如下命令创建 Autoscaler：

```shell
$ kubectl create -f php-apache.yaml
horizontalpodautoscaler.autoscaling/php-apache created
```



t