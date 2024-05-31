# service简介

[service官方文档](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/)



## service简介

Kubernetes 中 Service 是将运行在一个或一组 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 上的网络应用程序公开为网络服务的方法。

Kubernetes 中 Service 的一个关键目标是让你无需修改现有应用程序就能使用不熟悉的服务发现机制。 你可以在 Pod 中运行代码，无需顾虑这是为云原生世界设计的代码，还是为已容器化的老应用程序设计的代码。 你可以使用 Service 让一组 Pod 在网络上可用，让客户端能够与其交互。



## 定义service

Service 在 Kubernetes 中是一个[对象](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/kubernetes-objects/#kubernetes-objects) （与 Pod 或 ConfigMap 类似的对象）。你可以使用 Kubernetes API 创建、查看或修改 Service 定义。 通常你使用 `kubectl` 这类工具来进行这些 API 调用。

例如，假定有一组 Pod，每个 Pod 都在侦听 TCP 端口 9376，同时还被打上 `app.kubernetes.io/name=MyApp` 标签。 你可以定义一个 Service 来发布 TCP 侦听器。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
```

应用上述清单将创建一个名称为 "my-service" 的新 Service，它在所有 Pod 上指向 TCP 端口 9376，并且具有标签 `app.kubernetes.io/name: MyApp`。

Kubernetes 为该服务分配一个 IP 地址（有时称为 “集群 IP”），该 IP 地址由虚拟 IP 地址机制使用。 有关该机制的更多详情，请阅读[虚拟 IP 和服务代理](https://kubernetes.io/zh-cn/docs/reference/networking/virtual-ips/)。

Service 的控制器不断扫描与其选择算符匹配的 Pod，然后对 Service 的 EndpointSlices 集合执行所有必要的更新。

Service 对象的名称必须是有效的 [RFC 1035 标签名称](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#rfc-1035-label-names)。



:::tip说明

需要注意的是，Service 能够将一个接收 `port` 映射到任意的 `targetPort`。 默认情况下，`targetPort` 将被设置为与 `port` 字段相同的值。

:::



Pod 中的端口定义是有名字的，你可以在 Service 的 `targetPort` 属性中引用这些名称。 例如，我们可以通过以下方式将 Service 的 `targetPort` 绑定到 Pod 端口：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app.kubernetes.io/name: proxy
spec:
  containers:
  - name: nginx
    image: nginx:stable
    ports:
      - containerPort: 80
        name: http-web-svc

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app.kubernetes.io/name: proxy
  ports:
  - name: name-of-service-port
    protocol: TCP
    port: 80
    targetPort: http-web-svc
```

即使 Service 中使用同一配置名称混合使用多个 Pod，各 Pod 通过不同的端口号支持相同的网络协议， 此功能也可以使用。这为 Service 的部署和演化提供了很大的灵活性。 例如，你可以在新版本中更改 Pod 中后端软件公开的端口号，而不会破坏客户端。

服务的默认协议是 [TCP](https://kubernetes.io/zh-cn/docs/reference/networking/service-protocols/#protocol-tcp)； 你还可以使用任何其他[受支持的协议](https://kubernetes.io/zh-cn/docs/reference/networking/service-protocols/)。

由于许多服务需要公开多个端口，因此 Kubernetes 在服务对象上支持多个端口定义。 每个端口定义可以具有相同的 `protocol`，也可以具有不同的协议。



## 没有选择算符的 Service

由于选择算符的存在，服务最常见的用法是为 Kubernetes Pod 的访问提供抽象， 但是当与相应的 [EndpointSlices](https://kubernetes.io/zh-cn/docs/concepts/services-networking/endpoint-slices/) 对象一起使用且没有选择算符时， 服务也可以为其他类型的后端提供抽象，包括在集群外运行的后端。

例如：

- 希望在生产环境中使用外部的数据库集群，但测试环境使用自己的数据库。
- 希望服务指向另一个 [名字空间（Namespace）](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/namespaces/) 中或其它集群中的服务。
- 你正在将工作负载迁移到 Kubernetes。在评估该方法时，你仅在 Kubernetes 中运行一部分后端。

在任何这些场景中，都能够定义**未**指定与 Pod 匹配的选择算符的 Service。例如： 实例:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
```

由于此服务没有选择算符，因此不会自动创建相应的 EndpointSlice（和旧版 Endpoint）对象。 你可以通过手动添加 EndpointSlice 对象，将服务映射到运行该服务的网络地址和端口：

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: my-service-1 # 按惯例将服务的名称用作 EndpointSlice 名称的前缀
  labels:
    # 你应设置 "kubernetes.io/service-name" 标签。
    # 设置其值以匹配服务的名称
    kubernetes.io/service-name: my-service
addressType: IPv4
ports:
  - name: '' # 留空，因为 port 9376 未被 IANA 分配为已注册端口
    appProtocol: http
    protocol: TCP
    port: 9376
endpoints:
  - addresses:
      - "10.4.5.6" # 此列表中的 IP 地址可以按任何顺序显示
      - "10.1.2.3"
```



### 自定义 EndpointSlices

当为服务创建 [EndpointSlice](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#endpointslices) 对象时，可以为 EndpointSlice 使用任何名称。 命名空间中的每个 EndpointSlice 必须有一个唯一的名称。通过在 EndpointSlice 上设置 `kubernetes.io/service-name` [label](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/) 可以将 EndpointSlice 链接到服务。



:::tip说明

端点 IP 地址**必须不是** ：本地回路地址（IPv4 的 127.0.0.0/8、IPv6 的 ::1/128） 或链路本地地址（IPv4 的 169.254.0.0/16 和 224.0.0.0/24、IPv6 的 fe80::/64）。

端点 IP 地址不能是其他 Kubernetes 服务的集群 IP，因为 [kube-proxy](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-proxy/) 不支持将虚拟 IP 作为目标。

:::



对于你自己或在你自己代码中创建的 EndpointSlice，你还应该为 [`endpointslice.kubernetes.io/managed-by`](https://kubernetes.io/zh-cn/docs/reference/labels-annotations-taints/#endpointslicekubernetesiomanaged-by) 标签拣选一个值。如果你创建自己的控制器代码来管理 EndpointSlice， 请考虑使用类似于 `"my-domain.example/name-of-controller"` 的值。 如果你使用的是第三方工具，请使用全小写的工具名称，并将空格和其他标点符号更改为短划线 (`-`)。 如果人们直接使用 `kubectl` 之类的工具来管理 EndpointSlices，请使用描述这种手动管理的名称， 例如 `"staff"` 或 `"cluster-admins"`。你应该避免使用保留值 `"controller"`， 该值标识由 Kubernetes 自己的控制平面管理的 EndpointSlices。



### 访问没有选择算符的 Service

访问没有选择算符的 Service，与有选择算符的 Service 的原理相同。 在没有选择算符的 Service [示例](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#services-without-selectors)中， 流量被路由到 EndpointSlice 清单中定义的两个端点之一： 通过 TCP 协议连接到 10.1.2.3 或 10.4.5.6 的端口 9376。

:::tip说明

Kubernetes API 服务器不允许代理到未被映射至 Pod 上的端点。由于此约束，当 Service 没有选择算符时，诸如 `kubectl proxy <service-name>` 之类的操作将会失败。这可以防止 Kubernetes API 服务器被用作调用者可能无权访问的端点的代理。

:::

`ExternalName` Service 是 Service 的特例，它没有选择算符，而是使用 DNS 名称。 有关更多信息，请参阅 [ExternalName](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#externalname) 一节。



## 多端口 Service

对于某些服务，你需要公开多个端口。 Kubernetes 允许你在 Service 对象上配置多个端口定义。 为服务使用多个端口时，必须提供所有端口名称，以使它们无歧义。 例如：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 9376
    - name: https
      protocol: TCP
      port: 443
      targetPort: 9377
```



:::tip说明

与一般的 Kubernetes 名称一样，端口名称只能包含小写字母数字字符 和 `-`。 端口名称还必须以字母数字字符开头和结尾。

例如，名称 `123-abc` 和 `web` 有效，但是 `123_abc` 和 `-web` 无效。

:::



## 无头服务（Headless Services）

有时不需要或不想要负载均衡，以及单独的 Service IP。 遇到这种情况，可以通过指定 Cluster IP（`spec.clusterIP`）的值为 `"None"` 来创建 `Headless` Service。

你可以使用一个无头 Service 与其他服务发现机制进行接口，而不必与 Kubernetes 的实现捆绑在一起。

对于无头 `Services` 并不会分配 Cluster IP，kube-proxy 不会处理它们， 而且平台也不会为它们进行负载均衡和路由。 DNS 如何实现自动配置，依赖于 Service 是否定义了选择算符。



编辑yaml文件

```yaml
cat > headless-svc.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: headless-svc
spec:
  clusterIP: None # 无头svc的clusterIP的值为 None
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
EOF
```



创建无头svc

```shell
$ kubectl apply -f headless-svc.yaml
service/headless-svc created
```



查看svc

```shell
$ kubectl get svc
NAME            TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
headless-svc    ClusterIP   None          <none>        80/TCP    3s
```



### 带选择算符的服务

对定义了选择算符的无头服务，Kubernetes 控制平面在 Kubernetes API 中创建 EndpointSlice 对象， 并且修改 DNS 配置返回 A 或 AAA 条记录（IPv4 或 IPv6 地址），通过这个地址直接到达 `Service` 的后端 Pod 上。

### 无选择算符的服务

对没有定义选择算符的无头服务，控制平面不会创建 EndpointSlice 对象。 然而 DNS 系统会查找和配置以下之一：

- 对于 [`type: ExternalName`](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#externalname) 服务，查找和配置其 CNAME 记录
- 对所有其他类型的服务，针对 Service 的就绪端点的所有 IP 地址，查找和配置 DNS A / AAAA 条记录
  - 对于 IPv4 端点，DNS 系统创建 A 条记录。
  - 对于 IPv6 端点，DNS 系统创建 AAAA 条记录。



## 发布服务（服务类型）

对一些应用的某些部分（如前端），可能希望将其暴露给 Kubernetes 集群外部的 IP 地址。

Kubernetes `ServiceTypes` 允许指定你所需要的 Service 类型。

`Type` 的取值以及行为如下：

- `ClusterIP`：通过集群的内部 IP 暴露服务，选择该值时服务只能够在集群内部访问。 这也是你没有为服务显式指定 `type` 时使用的默认值。 你可以使用 [Ingress](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/) 或者 [Gateway API](https://gateway-api.sigs.k8s.io/) 向公众暴露服务。
- [`NodePort`](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#type-nodeport)：通过每个节点上的 IP 和静态端口（`NodePort`）暴露服务。 为了让节点端口可用，Kubernetes 设置了集群 IP 地址，这等同于你请求 `type: ClusterIP` 的服务。
- [`LoadBalancer`](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#loadbalancer)：使用云提供商的负载均衡器向外部暴露服务。 外部负载均衡器可以将流量路由到自动创建的 `NodePort` 服务和 `ClusterIP` 服务上。
- [`ExternalName`](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#externalname)：通过返回 `CNAME` 记录和对应值，可以将服务映射到 `externalName` 字段的内容（例如，`foo.bar.example.com`）。 无需创建任何类型代理。



:::tip说明

你需要使用 kube-dns 1.7 及以上版本或者 CoreDNS 0.0.8 及以上版本才能使用 `ExternalName` 类型。

:::



`type` 字段被设计为嵌套功能 - 每个级别都添加到前一个级别。 这并不是所有云提供商都严格要求的（例如：Google Compute Engine 不需要分配节点端口来使 `type: LoadBalancer` 工作，但另一个云提供商集成可能会这样做）。 虽然不需要严格的嵌套，但是 Service 的 Kubernetes API 设计无论如何都需要它。

你也可以使用 [Ingress](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/) 来暴露自己的服务。 Ingress 不是一种服务类型，但它充当集群的入口点。 它可以将路由规则整合到一个资源中，因为它可以在同一 IP 地址下公开多个服务。



### NodePort 类型

如果你将 `type` 字段设置为 `NodePort`，则 Kubernetes 控制平面将在 `--service-node-port-range` 标志指定的范围内分配端口（默认值：30000-32767）。 每个节点将那个端口（每个节点上的相同端口号）代理到你的服务中。 你的服务在其 `.spec.ports[*].nodePort` 字段中报告已分配的端口。

使用 NodePort 可以让你自由设置自己的负载均衡解决方案， 配置 Kubernetes 不完全支持的环境， 甚至直接暴露一个或多个节点的 IP 地址。

对于 NodePort 服务，Kubernetes 额外分配一个端口（TCP、UDP 或 SCTP 以匹配服务的协议）。 集群中的每个节点都将自己配置为监听分配的端口并将流量转发到与该服务关联的某个就绪端点。 通过使用适当的协议（例如 TCP）和适当的端口（分配给该服务）连接到所有节点， 你将能够从集群外部使用 `type: NodePort` 服务。



#### 选择你自己的端口

如果需要特定的端口号，你可以在 `nodePort` 字段中指定一个值。 控制平面将为你分配该端口或报告 API 事务失败。 这意味着你需要自己注意可能发生的端口冲突。 你还必须使用有效的端口号，该端口号在配置用于 NodePort 的范围内。

以下是 `type: NodePort` 服务的一个示例清单，它指定了一个 NodePort 值（在本例中为 30007）。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    # 默认情况下，为了方便起见，`targetPort` 被设置为与 `port` 字段相同的值。
    - port: 80
      targetPort: 80
      # 可选字段
      # 默认情况下，为了方便起见，Kubernetes 控制平面会从某个范围内分配一个端口号（默认：30000-32767）
      nodePort: 30007
```



#### 为 `type: NodePort` 服务自定义 IP 地址配置

你可以在集群中设置节点以使用特定 IP 地址来提供 NodePort 服务。 如果每个节点都连接到多个网络（例如：一个网络用于应用程序流量，另一个网络用于节点和控制平面之间的流量）， 你可能需要执行此操作。

如果你要指定特定的 IP 地址来代理端口，可以将 kube-proxy 的 `--nodeport-addresses` 标志或 [kube-proxy 配置文件](https://kubernetes.io/zh-cn/docs/reference/config-api/kube-proxy-config.v1alpha1/)的等效 `nodePortAddresses` 字段设置为特定的 IP 段。

此标志采用逗号分隔的 IP 段列表（例如 `10.0.0.0/8`、`192.0.2.0/25`）来指定 kube-proxy 应视为该节点本地的 IP 地址范围。

例如，如果你使用 `--nodeport-addresses=127.0.0.0/8` 标志启动 kube-proxy， 则 kube-proxy 仅选择 NodePort 服务的环回接口。 `--nodeport-addresses` 的默认值是一个空列表。 这意味着 kube-proxy 应考虑 NodePort 的所有可用网络接口。 （这也与早期的 Kubernetes 版本兼容。）



:::tip说明

此服务呈现为 `<NodeIP>:spec.ports[*].nodePort` 和 `.spec.clusterIP:spec.ports[*].port`。 如果设置了 kube-proxy 的 `--nodeport-addresses` 标志或 kube-proxy 配置文件中的等效字段， 则 `<NodeIP>` 将是过滤的节点 IP 地址（或可能的 IP 地址）。

:::



### LoadBalancer 类型

在使用支持外部负载均衡器的云提供商的服务时，设置 `type` 的值为 `"LoadBalancer"`， 将为 Service 提供负载均衡器。 负载均衡器是异步创建的，关于被提供的负载均衡器的信息将会通过 Service 的 `status.loadBalancer` 字段发布出去。

实例：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
  clusterIP: 10.0.171.239
  type: LoadBalancer
status:
  loadBalancer:
    ingress:
    - ip: 192.0.2.127
```



来自外部负载均衡器的流量将直接重定向到后端 Pod 上，不过实际它们是如何工作的，这要依赖于云提供商。

某些云提供商允许设置 `loadBalancerIP`。 在这些情况下，将根据用户设置的 `loadBalancerIP` 来创建负载均衡器。 如果没有设置 `loadBalancerIP` 字段，将会给负载均衡器指派一个临时 IP。 如果设置了 `loadBalancerIP`，但云提供商并不支持这种特性，那么设置的 `loadBalancerIP` 值将会被忽略掉。

要实现 `type: LoadBalancer` 的服务，Kubernetes 通常首先进行与请求 `type: NodePort` 服务等效的更改。 cloud-controller-manager 组件然后配置外部负载均衡器以将流量转发到已分配的节点端口。

你可以将负载均衡服务配置为[忽略](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#load-balancer-nodeport-allocation)分配节点端口， 前提是云提供商实现支持这点。



#### 混合协议类型的负载均衡器

**特性状态：** `Kubernetes v1.20 [alpha]`

默认情况下，对于 LoadBalancer 类型的服务，当定义了多个端口时， 所有端口必须具有相同的协议，并且该协议必须是受云提供商支持的协议。

当服务中定义了多个端口时，特性门控 `MixedProtocolLBService`（在 kube-apiserver 1.24 版本默认为启用）允许 LoadBalancer 类型的服务使用不同的协议。



:::tip说明

可用于 LoadBalancer 类型服务的协议集仍然由云提供商决定。 如果云提供商不支持混合协议，他们将只提供单一协议。

:::



#### 禁用负载均衡器节点端口分配

**特性状态：** `Kubernetes v1.24 [stable]`

你可以通过设置 `spec.allocateLoadBalancerNodePorts` 为 `false` 对类型为 LoadBalancer 的服务禁用节点端口分配。 这仅适用于直接将流量路由到 Pod 而不是使用节点端口的负载均衡器实现。 默认情况下，`spec.allocateLoadBalancerNodePorts` 为 `true`， LoadBalancer 类型的服务继续分配节点端口。 如果现有服务已被分配节点端口，将参数 `spec.allocateLoadBalancerNodePorts` 设置为 `false` 时，这些服务上已分配置的节点端口**不会**被自动释放。 你必须显式地在每个服务端口中删除 `nodePorts` 项以释放对应端口。

#### 设置负载均衡器实现的类别

**特性状态：** `Kubernetes v1.24 [stable]`

`spec.loadBalancerClass` 允许你不使用云提供商的默认负载均衡器实现，转而使用指定的负载均衡器实现。 默认情况下，`.spec.loadBalancerClass` 的取值是 `nil`，如果集群使用 `--cloud-provider` 配置了云提供商， `LoadBalancer` 类型服务会使用云提供商的默认负载均衡器实现。 如果设置了 `.spec.loadBalancerClass`，则假定存在某个与所指定的类相匹配的负载均衡器实现在监视服务变化。 所有默认的负载均衡器实现（例如，由云提供商所提供的）都会忽略设置了此字段的服务。`.spec.loadBalancerClass` 只能设置到类型为 `LoadBalancer` 的 Service 之上，而且一旦设置之后不可变更。

`.spec.loadBalancerClass` 的值必须是一个标签风格的标识符， 可以有选择地带有类似 "`internal-vip`" 或 "`example.com/internal-vip`" 这类前缀。 没有前缀的名字是保留给最终用户的。



#### 内部负载均衡器

在混合环境中，有时有必要在同一(虚拟)网络地址块内路由来自服务的流量。

在水平分割 DNS 环境中，你需要两个服务才能将内部和外部流量都路由到你的端点（Endpoints）。

如要设置内部负载均衡器，请根据你所使用的云运营商，为服务添加以下注解之一：



阿里云

[阿里云通过Annotation配置负载均衡帮助文档](https://help.aliyun.com/document_detail/86531.html)

```yaml
[...]
metadata:
  annotations:
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-address-type: "intranet"
[...]
```



腾讯云

[腾讯云通过Annotation配置负载均衡帮助文档](https://cloud.tencent.com/document/product/457/45487)

```yaml
[...]
metadata:
  annotations:
    service.kubernetes.io/qcloud-loadbalancer-internal-subnetid: subnet-xxxxx
[...]
```



### ExternalName 类型

类型为 ExternalName 的服务将服务映射到 DNS 名称，而不是典型的选择算符，例如 `my-service` 或者 `cassandra`。 你可以使用 `spec.externalName` 参数指定这些服务。

例如，以下 Service 定义将 `prod` 名称空间中的 `my-service` 服务映射到 `my.database.example.com`，其中 `my.database.example.com` 必须是一个可以被访问的地址，例如是云里边一个rds的地址

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: prod
spec:
  type: ExternalName
  externalName: my.database.example.com # 这里的域名必须是一个可以被访问的地址
```



:::tip说明

ExternalName 服务接受 IPv4 地址字符串，但作为包含数字的 DNS 名称，而不是 IP 地址。 类似于 IPv4 地址的外部名称不能由 CoreDNS 或 ingress-nginx 解析，因为外部名称旨在指定规范的 DNS 名称。 要对 IP 地址进行硬编码，请考虑使用[无头 Services](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#headless-services)。

:::



当查找主机 `my-service.prod.svc.cluster.local` 时，集群 DNS 服务返回 `CNAME` 记录， 其值为 `my.database.example.com`。 访问 `my-service` 的方式与其他服务的方式相同，但主要区别在于重定向发生在 DNS 级别，而不是通过代理或转发。 如果以后你决定将数据库移到集群中，则可以启动其 Pod，添加适当的选择算符或端点以及更改服务的 `type`。



:::caution

对于一些常见的协议，包括 HTTP 和 HTTPS，你使用 ExternalName 可能会遇到问题。 如果你使用 ExternalName，那么集群内客户端使用的主机名与 ExternalName 引用的名称不同。

对于使用主机名的协议，此差异可能会导致错误或意外响应。 HTTP 请求将具有源服务器无法识别的 `Host:` 标头； TLS 服务器将无法提供与客户端连接的主机名匹配的证书。

:::



:::tip说明

有关这部分内容，我们要感谢 [Alen Komljen](https://akomljen.com/) 刊登的 [Kubernetes Tips - Part1](https://akomljen.com/kubernetes-tips-part-1/) 这篇博文。

:::



### 外部 IP

如果外部的 IP 路由到集群中一个或多个 Node 上，Kubernetes Service 会被暴露给这些 `externalIPs`。 通过外部 IP（作为目的 IP 地址）进入到集群，打到 Service 的端口上的流量， 将会被路由到 Service 的 Endpoint 上。 `externalIPs` 不会被 Kubernetes 管理，它属于集群管理员的职责范畴。

根据 Service 的规定，`externalIPs` 可以同任意的 `ServiceType` 来一起指定。 在上面的例子中，`my-service` 可以在 "`198.51.100.32:80`" (`externalIP:port`) 上被客户端访问。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 49152
  externalIPs:
    - 198.51.100.32
```



## 粘性会话

如果你想确保来自特定客户端的连接每次都传递到同一个 Pod，你可以配置根据客户端 IP 地址来执行的会话亲和性。 阅读[会话亲和性](https://kubernetes.io/zh-cn/docs/reference/networking/virtual-ips/#session-affinity)了解更多。





