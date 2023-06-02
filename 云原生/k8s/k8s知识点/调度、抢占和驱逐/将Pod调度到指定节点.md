# 将Pod调度到指定节点

[官方文档](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/)



## 将pod调度到指定节点的方法

你可以约束一个 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 以便 **限制** 其只能在特定的[节点](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/)上运行， 或优先在特定的节点上运行。有几种方法可以实现这点，推荐的方法都是用 [标签选择算符](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)来进行选择。 通常这样的约束不是必须的，因为调度器将自动进行合理的放置（比如，将 Pod 分散到节点上， 而不是将 Pod 放置在可用资源不足的节点上等等）。但在某些情况下，你可能需要进一步控制 Pod 被部署到哪个节点。例如，确保 Pod 最终落在连接了 SSD 的机器上， 或者将来自两个不同的服务且有大量通信的 Pod 被放置在同一个可用区。

你可以使用下列方法中的任何一种来选择 Kubernetes 对特定 Pod 的调度：

- 与[节点标签](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#built-in-node-labels)匹配的 [nodeSelector](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#nodeSelector)
- [亲和性与反亲和性](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)
- [nodeName](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#nodename) 字段
- [Pod 拓扑分布约束](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#pod-topology-spread-constraints)



## 节点标签

与很多其他 Kubernetes 对象类似，节点也有[标签](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)。 你可以[手动地添加标签](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/assign-pods-nodes/#add-a-label-to-a-node)。 Kubernetes 也会为集群中所有节点添加一些标准的标签。 参见[常用的标签、注解和污点](https://kubernetes.io/zh-cn/docs/reference/labels-annotations-taints/)以了解常见的节点标签。

### 给节点添加标签

1.列出你的集群中的[节点](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/)， 包括这些节点上的标签：

```shell
$ kubectl get nodes --show-labels
NAME                STATUS   ROLES           AGE   VERSION   LABELS
ops-control-plane   Ready    control-plane   19h   v1.27.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-control-plane,kubernetes.io/os=linux,node-role.kubernetes.io/control-plane=,node.kubernetes.io/exclude-from-external-load-balancers=
ops-worker          Ready    <none>          19h   v1.27.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-worker,kubernetes.io/os=linux
ops-worker2         Ready    <none>          19h   v1.27.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-worker2,kubernetes.io/os=linux
ops-worker3         Ready    <none>          19h   v1.27.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-worker3,kubernetes.io/os=linux
```



2.从你的节点中选择一个，为它添加标签：

```shell
$ kubectl label nodes ops-worker disktype=ssd
node/ops-worker labeled
```



3.验证你选择的节点确实带有 `disktype=ssd` 标签：

```shell
$ kubectl get node ops-worker --show-labels
NAME         STATUS   ROLES    AGE   VERSION   LABELS
ops-worker   Ready    <none>   19h   v1.27.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,disktype=ssd,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-worker,kubernetes.io/os=linux
```



如果要取消标签可以执行 `kubectl label nodes <节点名称> <标签键>-`

```shell
$ kubectl label nodes ops-worker disktype-
node/ops-worker unlabeled
```



### 创建一个将被调度到你选择的节点的pod

因为指定了 `nodeSelector` ，因此pod会被调度到有 `disktype=ssd` 标签的node节点上

```yaml
cat > pod-nginx.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    env: test
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
  nodeSelector:
    disktype: ssd
EOF
```





### 创建一个会被调度到特定节点上的pod

因为指定了 `nodeName` ，因此pod会被调度到指定的node节点上

```yaml
cat > pod-nginx-specific-node.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  nodeName: ops-worker2 # 调度Pod到名为ops-worker2的node节点
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
EOF
```



## 亲和性与反亲和性

`nodeSelector` 提供了一种最简单的方法来将 Pod 约束到具有特定标签的节点上。 亲和性和反亲和性扩展了你可以定义的约束类型。使用亲和性与反亲和性的一些好处有：

- 亲和性、反亲和性语言的表达能力更强。`nodeSelector` 只能选择拥有所有指定标签的节点。 亲和性、反亲和性为你提供对选择逻辑的更强控制能力。
- 你可以标明某规则是“软需求”或者“偏好”，这样调度器在无法找到匹配节点时仍然调度该 Pod。
- 你可以使用节点上（或其他拓扑域中）运行的其他 Pod 的标签来实施调度约束， 而不是只能使用节点本身的标签。这个能力让你能够定义规则允许哪些 Pod 可以被放置在一起。

亲和性功能由两种类型的亲和性组成：

- **节点亲和性**功能类似于 `nodeSelector` 字段，但它的表达能力更强，并且允许你指定软规则。
- Pod 间亲和性/反亲和性允许你根据其他 Pod 的标签来约束 Pod。



### 节点亲和性

节点亲和性概念上类似于 `nodeSelector`， 它使你可以根据节点上的标签来约束 Pod 可以调度到哪些节点上。 节点亲和性有两种：

- `requiredDuringSchedulingIgnoredDuringExecution`： 调度器只有在规则被满足的时候才能执行调度。此功能类似于 `nodeSelector`， 但其语法表达能力更强。
- `preferredDuringSchedulingIgnoredDuringExecution`： 调度器会尝试寻找满足对应规则的节点。如果找不到匹配的节点，调度器仍然会调度该 Pod。

:::tip说明

在上述类型中，`IgnoredDuringExecution` 意味着如果节点标签在 Kubernetes 调度 Pod 后发生了变更，Pod 仍将继续运行。

:::



你可以使用 Pod 规约中的 `.spec.affinity.nodeAffinity` 字段来设置节点亲和性。 例如，考虑下面的 Pod 规约：

```yaml
cat > pod-with-node-affinity.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: with-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: topology.kubernetes.io/zone
            operator: In
            values:
            - antarctica-east1
            - antarctica-west1
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: another-node-label-key
            operator: In
            values:
            - another-node-label-value
  containers:
  - name: with-node-affinity
    image: registry.k8s.io/pause:2.0
EOF
```

在这一示例中，所应用的规则如下：

- 节点**必须**包含一个键名为 `topology.kubernetes.io/zone` 的标签， 并且该标签的取值**必须**为 `antarctica-east1` 或 `antarctica-west1`。
- 节点**最好**具有一个键名为 `another-node-label-key` 且取值为 `another-node-label-value` 的标签。

你可以使用 `operator` 字段来为 Kubernetes 设置在解释规则时要使用的逻辑操作符。 你可以使用 `In`、`NotIn`、`Exists`、`DoesNotExist`、`Gt` 和 `Lt` 之一作为操作符。

阅读[操作符](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#operators)了解有关这些操作的更多信息。

`NotIn` 和 `DoesNotExist` 可用来实现节点反亲和性行为。 你也可以使用[节点污点](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/taint-and-toleration/) 将 Pod 从特定节点上驱逐。



:::tip说明

如果你同时指定了 `nodeSelector` 和 `nodeAffinity`，**两者** 必须都要满足， 才能将 Pod 调度到候选节点上。

如果你在与 nodeAffinity 类型关联的 nodeSelectorTerms 中指定多个条件， 只要其中一个 `nodeSelectorTerms` 满足（各个条件按逻辑或操作组合）的话，Pod 就可以被调度到节点上。

如果你在与 `nodeSelectorTerms` 中的条件相关联的单个 `matchExpressions` 字段中指定多个表达式， 则只有当所有表达式都满足（各表达式按逻辑与操作组合）时，Pod 才能被调度到节点上。

:::



#### 依据强制的节点亲和性调度 Pod

下面清单描述了一个 Pod，它有一个节点亲和性配置 `requiredDuringSchedulingIgnoredDuringExecution`，`disktype=ssd`。 这意味着 pod 只会被调度到具有 `disktype=ssd` 标签的节点上。

```yaml
cat > pod-nginx-required-affinity.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd            
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
EOF
```



#### 使用首选的节点亲和性调度 Pod

本清单描述了一个 Pod，它有一个节点亲和性设置 `preferredDuringSchedulingIgnoredDuringExecution`，`disktype: ssd`。 这意味着 Pod 将首选具有 `disktype=ssd` 标签的节点。

```yaml
cat > pod-nginx-preferred-affinity.yaml < EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd          
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
EOF
```







#### 节点亲和性权重

你可以为 `preferredDuringSchedulingIgnoredDuringExecution` 亲和性类型的每个实例设置 `weight` 字段，其取值范围是 1 到 100。 当调度器找到能够满足 Pod 的其他调度请求的节点时，调度器会遍历节点满足的所有的偏好性规则， 并将对应表达式的 `weight` 值加和。

最终的加和值会添加到该节点的其他优先级函数的评分之上。 在调度器为 Pod 作出调度决定时，总分最高的节点的优先级也最高。



```yaml
cat > pod-with-affinity-anti-affinity.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: with-affinity-anti-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: label-1
            operator: In
            values:
            - key-1
      - weight: 50
        preference:
          matchExpressions:
          - key: label-2
            operator: In
            values:
            - key-2
  containers:
  - name: with-node-affinity
    image: registry.k8s.io/pause:2.0
EOF
```

如果存在两个候选节点，都满足 `preferredDuringSchedulingIgnoredDuringExecution` 规则， 其中一个节点具有标签 `label-1:key-1`，另一个节点具有标签 `label-2:key-2`， 调度器会考察各个节点的 `weight` 取值，并将该权重值添加到节点的其他得分值之上，



:::tip说明

如果你希望 Kubernetes 能够成功地调度此例中的 Pod，你必须拥有打了 `kubernetes.io/os=linux` 标签的节点。

:::



### pod间亲和性与反亲和性

 Pod 间亲和性与反亲和性使你可以基于已经在节点上运行的 **Pod** 的标签来约束 Pod 可以调度到的节点，而不是基于节点上的标签。

Pod 间亲和性与反亲和性的规则格式为“如果 X 上已经运行了一个或多个满足规则 Y 的 Pod， 则这个 Pod 应该（或者在反亲和性的情况下不应该）运行在 X 上”。 这里的 X 可以是节点、机架、云提供商可用区或地理区域或类似的拓扑域， Y 则是 Kubernetes 尝试满足的规则。

你通过[标签选择算符](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/#label-selectors) 的形式来表达规则（Y），并可根据需要指定选关联的名字空间列表。 Pod 在 Kubernetes 中是名字空间作用域的对象，因此 Pod 的标签也隐式地具有名字空间属性。 针对 Pod 标签的所有标签选择算符都要指定名字空间，Kubernetes 会在指定的名字空间内寻找标签。

你会通过 `topologyKey` 来表达拓扑域（X）的概念，其取值是系统用来标示域的节点标签键。 相关示例可参见[常用标签、注解和污点](https://kubernetes.io/zh-cn/docs/reference/labels-annotations-taints/)。

:::tip说明

Pod 间亲和性和反亲和性都需要相当的计算量，因此会在大规模集群中显著降低调度速度。 我们不建议在包含数百个节点的集群中使用这类设置。

Pod 反亲和性需要节点上存在一致性的标签。换言之， 集群中每个节点都必须拥有与 `topologyKey` 匹配的标签。 如果某些或者所有节点上不存在所指定的 `topologyKey` 标签，调度行为可能与预期的不同。

:::

#### pod亲和性与反亲和性类型

与[节点亲和性](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity)类似，Pod 的亲和性与反亲和性也有两种类型：

- `requiredDuringSchedulingIgnoredDuringExecution`
- `preferredDuringSchedulingIgnoredDuringExecution`

例如，你可以使用 `requiredDuringSchedulingIgnoredDuringExecution` 亲和性来告诉调度器， 将两个服务的 Pod 放到同一个云提供商可用区内，因为它们彼此之间通信非常频繁。 类似地，你可以使用 `preferredDuringSchedulingIgnoredDuringExecution` 反亲和性来将同一服务的多个 Pod 分布到多个云提供商可用区中。

要使用 Pod 间亲和性，可以使用 Pod 规约中的 `.affinity.podAffinity` 字段。 对于 Pod 间反亲和性，可以使用 Pod 规约中的 `.affinity.podAntiAffinity` 字段。



#### pod亲和性示例



```yaml
cat > pod-with-pod-affinity.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: security
            operator: In
            values:
            - S1
        topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: security
              operator: In
              values:
              - S2
          topologyKey: topology.kubernetes.io/zone
  containers:
  - name: with-pod-affinity
    image: registry.k8s.io/pause:2.0
EOF
```



本示例定义了一条 Pod 亲和性规则和一条 Pod 反亲和性规则。Pod 亲和性规则配置为 `requiredDuringSchedulingIgnoredDuringExecution`，而 Pod 反亲和性配置为 `preferredDuringSchedulingIgnoredDuringExecution`。

亲和性规则表示，仅当节点和至少一个已运行且有 `security=S1` 的标签的 Pod 处于同一区域时，才可以将该 Pod 调度到节点上。 更确切的说，调度器必须将 Pod 调度到具有 `topology.kubernetes.io/zone=V` 标签的节点上，并且集群中至少有一个位于该可用区的节点上运行着带有 `security=S1` 标签的 Pod。

反亲和性规则表示，如果节点处于 Pod 所在的同一可用区且至少一个 Pod 具有 `security=S2` 标签，则该 Pod 不应被调度到该节点上。 更确切地说， 如果同一可用区中存在其他运行着带有 `security=S2` 标签的 Pod 节点， 并且节点具有标签 `topology.kubernetes.io/zone=R`，Pod 不能被调度到该节点上。

查阅[设计文档](https://git.k8s.io/design-proposals-archive/scheduling/podaffinity.md) 以进一步熟悉 Pod 亲和性与反亲和性的示例。

你可以针对 Pod 间亲和性与反亲和性为其 `operator` 字段使用 `In`、`NotIn`、`Exists`、 `DoesNotExist` 等值。

阅读[操作符](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/#operators)了解有关这些操作的更多信息。

原则上，`topologyKey` 可以是任何合法的标签键。出于性能和安全原因，`topologyKey` 有一些限制：

- 对于 Pod 亲和性而言，在 `requiredDuringSchedulingIgnoredDuringExecution` 和 `preferredDuringSchedulingIgnoredDuringExecution` 中，`topologyKey` 不允许为空。
- 对于 `requiredDuringSchedulingIgnoredDuringExecution` 要求的 Pod 反亲和性， 准入控制器 `LimitPodHardAntiAffinityTopology` 要求 `topologyKey` 只能是 `kubernetes.io/hostname`。如果你希望使用其他定制拓扑逻辑， 你可以更改准入控制器或者禁用之。

除了 `labelSelector` 和 `topologyKey`，你也可以指定 `labelSelector` 要匹配的名字空间列表，方法是在 `labelSelector` 和 `topologyKey` 所在层同一层次上设置 `namespaces`。 如果 `namespaces` 被忽略或者为空，则默认为 Pod 亲和性/反亲和性的定义所在的名字空间。



#### 更实际的用例

Pod 间亲和性与反亲和性在与更高级别的集合（例如 ReplicaSet、StatefulSet、 Deployment 等）一起使用时，它们可能更加有用。 这些规则使得你可以配置一组工作负载，使其位于所定义的同一拓扑中； 例如优先将两个相关的 Pod 置于相同的节点上。

以一个三节点的集群为例。你使用该集群运行一个带有内存缓存（例如 Redis）的 Web 应用程序。 在此例中，还假设 Web 应用程序和内存缓存之间的延迟应尽可能低。 你可以使用 Pod 间的亲和性和反亲和性来尽可能地将该 Web 服务器与缓存并置。

在下面的 Redis 缓存 Deployment 示例中，副本上设置了标签 `app=store`。 `podAntiAffinity` 规则告诉调度器避免将多个带有 `app=store` 标签的副本部署到同一节点上。 因此，每个独立节点上会创建一个缓存实例。



```yaml
cat > pod-with-pod-antiaffinity-cache.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cache
spec:
  selector:
    matchLabels:
      app: store
  replicas: 3
  template:
    metadata:
      labels:
        app: store
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - store
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: redis-server
        image: redis:3.2-alpine
EOF
```



下例的 Deployment 为 Web 服务器创建带有标签 `app=web-store` 的副本。 Pod 亲和性规则告诉调度器将每个副本放到存在标签为 `app=store` 的 Pod 的节点上。 Pod 反亲和性规则告诉调度器决不要在单个节点上放置多个 `app=web-store` 服务器。

```yaml
cat > pod-with-pod-antiaffinity-web.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
spec:
  selector:
    matchLabels:
      app: web-store
  replicas: 3
  template:
    metadata:
      labels:
        app: web-store
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - web-store
            topologyKey: "kubernetes.io/hostname"
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - store
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: web-app
        image: nginx:1.16-alpine
EOF
```





创建前面两个 Deployment 会产生如下的集群布局，每个 Web 服务器与一个缓存实例并置， 并分别运行在三个独立的节点上。

|    node-1     |    node-2     |    node-3     |
| :-----------: | :-----------: | :-----------: |
| *webserver-1* | *webserver-2* | *webserver-3* |
|   *cache-1*   |   *cache-2*   |   *cache-3*   |

总体效果是每个缓存实例都非常可能被在同一个节点上运行的某个客户端访问。 这种方法旨在最大限度地减少偏差（负载不平衡）和延迟。

你可能还有使用 Pod 反亲和性的一些其他原因。 参阅 [ZooKeeper 教程](https://kubernetes.io/zh-cn/docs/tutorials/stateful-application/zookeeper/#tolerating-node-failure) 了解一个 StatefulSet 的示例，该 StatefulSet 配置了反亲和性以实现高可用， 所使用的是与此例相同的技术。









































