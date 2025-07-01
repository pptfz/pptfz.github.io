[toc]



# pod健康检查

[pod健康检查官方文档](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)



## 探针分类

### Liveness	存活探针

[kubelet](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kubelet/) 使用存活探针来确定什么时候要重启容器。 例如，存活探针可以探测到应用死锁（应用程序在运行，但是无法继续执行后面的步骤）情况。 重启这种状态下的容器有助于提高应用的可用性，即使其中存在缺陷。



### Readiness	可读探针

kubelet 使用就绪探针可以知道容器何时准备好接受请求流量，当一个 Pod 内的所有容器都就绪时，才能认为该 Pod 就绪。 这种信号的一个用途就是控制哪个 Pod 作为 Service 的后端。 若 Pod 尚未就绪，会被从 Service 的负载均衡器中剔除。



### Startup	启动探针

kubelet 使用启动探针来了解应用容器何时启动。 如果配置了这类探针，你就可以控制容器在启动成功后再进行存活性和就绪态检查， 确保这些存活、就绪探针不会影响应用的启动。 启动探针可以用于对慢启动容器进行存活性检测，避免它们在启动运行之前就被杀掉。





## 探针检查机制

使用探针来检查容器有四种不同的方法。 每个探针都必须准确定义为这四种机制中的一种：

### exec

在容器内执行指定命令。如果命令退出时返回码为 0 则认为诊断成功。



### grpc

使用 [gRPC](https://grpc.io/) 执行一个远程过程调用。 目标应该实现 [gRPC健康检查](https://grpc.io/grpc/core/md_doc_health-checking.html)。 如果响应的状态是 "SERVING"，则认为诊断成功。 gRPC 探针是一个 Alpha 特性，只有在你启用了 "GRPCContainerProbe" [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)时才能使用。



### httpGet

对容器的 IP 地址上指定端口和路径执行 HTTP `GET` 请求。如果响应的状态码大于等于 200 且小于 400，则诊断被认为是成功的。



### tcpSocket

对容器的 IP 地址上的指定端口执行 TCP 检查。如果端口打开，则诊断被认为是成功的。 如果远程系统（容器）在打开连接后立即将其关闭，这算作是健康的。





## 探针配置方式

### 定义存活命令

:::tip

第一种类型的存活探测方式是执行一段命令

许多长时间运行的应用最终会进入损坏状态，除非重新启动，否则无法被恢复。 Kubernetes 提供了存活探针来发现并处理这种情况。

:::

编辑yaml文件

```yaml
cat > exec-liveness.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-exec
spec:
  containers:
  - name: liveness
    #image: registry.k8s.io/busybox
    image: mirrorgooglecontainers/busybox
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -f /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5 # 执行第一次探测前等待5秒
      periodSeconds: 5 # 每5秒执行一次存活探测
EOF
```



在这个配置文件中，可以看到 Pod 中只有一个 `Container`。 `periodSeconds` 字段指定了 kubelet 应该每 5 秒执行一次存活探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一次探测前应该等待 5 秒。 kubelet 在容器内执行命令 `cat /tmp/healthy` 来进行探测。 如果命令执行成功并且返回值为 0，kubelet 就会认为这个容器是健康存活的。 如果这个命令返回非 0 值，kubelet 会杀死这个容器并重新启动它。

当容器启动时，执行如下的命令：

```shell
/bin/sh -c "touch /tmp/healthy; sleep 30; rm -f /tmp/healthy; sleep 600"
```



这个容器生命的前 30 秒，`/tmp/healthy` 文件是存在的。 所以在这最开始的 30 秒内，执行命令 `cat /tmp/healthy` 会返回成功代码。 30 秒之后，执行命令 `cat /tmp/healthy` 就会返回失败代码。



创建pod

```shell
kubectl apply -f exec-liveness.yaml 
```



输出结果表明还没有存活探针失败：

```sh
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  18s   default-scheduler  Successfully assigned test/liveness-exec to k8s-node02
  Normal  Pulling    17s   kubelet            Pulling image "mirrorgooglecontainers/busybox"
  Normal  Pulled     2s    kubelet            Successfully pulled image "mirrorgooglecontainers/busybox" in 15.315916502s
  Normal  Created    2s    kubelet            Created container liveness
  Normal  Started    2s    kubelet            Started container liveness
```



在输出结果的最下面，有信息显示存活探针失败了，这个失败的容器被杀死并且被重建了。

```shell
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  85s                default-scheduler  Successfully assigned test/liveness-exec to k8s-node02
  Normal   Pulling    84s                kubelet            Pulling image "mirrorgooglecontainers/busybox"
  Normal   Pulled     69s                kubelet            Successfully pulled image "mirrorgooglecontainers/busybox" in 15.315916502s
  Normal   Created    69s                kubelet            Created container liveness
  Normal   Started    69s                kubelet            Started container liveness
  Warning  Unhealthy  25s (x3 over 35s)  kubelet            Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory
  Normal   Killing    25s                kubelet            Container liveness failed liveness probe, will be restarted
```



再等 30 秒，确认这个容器被重启了，输出结果显示 `RESTARTS` 的值增加了 1。 请注意，一旦失败的容器恢复为运行状态，`RESTARTS` 计数器就会增加 1：

```shell
$ kubectl get pod liveness-exec 
NAME            READY   STATUS    RESTARTS      AGE
liveness-exec   1/1     Running   1 (26s ago)   116s
```



最后pod的状态会变为 `CrashLoopBackOff`

```shell
$ kubectl get pod liveness-exec 
NAME            READY   STATUS             RESTARTS        AGE
liveness-exec   0/1     CrashLoopBackOff   9 (3m34s ago)   24m
```



### 定义一个存活态 HTTP 请求接口

:::tip

第二种类型的存活探测方式是使用 HTTP GET 请求

:::

编辑yaml文件

```yaml
cat > http-liveness.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-http
spec:
  containers:
  - name: liveness
    #image: registry.k8s.io/liveness
    image: mirrorgooglecontainers/liveness
    args:
    - /server
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3 # 执行第一次探测前等待3秒
      periodSeconds: 3 # 每3秒执行一次存活探测
EOF
```



在这个配置文件中，你可以看到 Pod 也只有一个容器。 `periodSeconds` 字段指定了 kubelet 每隔 3 秒执行一次存活探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一次探测前应该等待 3 秒。 kubelet 会向容器内运行的服务（服务在监听 8080 端口）发送一个 HTTP GET 请求来执行探测。 如果服务器上 `/healthz` 路径下的处理程序返回成功代码，则 kubelet 认为容器是健康存活的。 如果处理程序返回失败代码，则 kubelet 会杀死这个容器并将其重启。

返回大于或等于 200 并且小于 400 的任何代码都标示成功，其它返回代码都标示失败。

你可以访问 [server.go](https://github.com/kubernetes/kubernetes/blob/master/test/images/agnhost/liveness/server.go)。 阅读服务的源码。 容器存活期间的最开始 10 秒中，`/healthz` 处理程序返回 200 的状态码。 之后处理程序返回 500 的状态码。

```go
http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
    duration := time.Now().Sub(started)
    if duration.Seconds() > 10 {
        w.WriteHeader(500)
        w.Write([]byte(fmt.Sprintf("error: %v", duration.Seconds())))
    } else {
        w.WriteHeader(200)
        w.Write([]byte("ok"))
    }
})
```

kubelet 在容器启动之后 3 秒开始执行健康检测。所以前几次健康检查都是成功的。 但是 10 秒之后，健康检查会失败，并且 kubelet 会杀死容器再重新启动容器。



创建pod

```shell
kubectl apply -f http-liveness.yaml 
```



10 秒之后，通过查看 Pod 事件来确认存活探针已经失败，并且容器被重新启动了。

```shell
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  31s   default-scheduler  Successfully assigned test/liveness-http to k8s-node02
  Normal   Pulling    30s   kubelet            Pulling image "mirrorgooglecontainers/liveness"
  Normal   Pulled     13s   kubelet            Successfully pulled image "mirrorgooglecontainers/liveness" in 17.100600651s
  Normal   Created    13s   kubelet            Created container liveness
  Normal   Started    13s   kubelet            Started container liveness
  Warning  Unhealthy  1s    kubelet            Liveness probe failed: HTTP probe failed with statuscode: 500
```



:::tip

在 1.13 之前（包括 1.13）的版本中，如果在 Pod 运行的节点上设置了环境变量 `http_proxy`（或者 `HTTP_PROXY`），HTTP 的存活探测会使用这个代理。 在 1.13 之后的版本中，设置本地的 HTTP 代理环境变量不会影响 HTTP 的存活探测。

:::



最后pod的状态会变为 `CrashLoopBackOff`

```shell
$ kubectl get pod liveness-http 
NAME            READY   STATUS             RESTARTS      AGE
liveness-http   0/1     CrashLoopBackOff   5 (59s ago)   5m2s
```



### 定义 TCP 的存活探测

:::tip

第三种类型的存活探测是使用 TCP 套接字。 使用这种配置时，kubelet 会尝试在指定端口和容器建立套接字链接。 如果能建立连接，这个容器就被看作是健康的，如果不能则这个容器就被看作是有问题的。

:::



编辑yaml文件

```yaml
cat > tcp-liveness-readiness.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: goproxy
  labels:
    app: goproxy
spec:
  containers:
  - name: goproxy
    #image: registry.k8s.io/goproxy:0.1
    image: mirrorgooglecontainers/goproxy:0.1
    ports:
    - containerPort: 8080
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 15 # 执行第一次探测前等待15秒
      periodSeconds: 20 # 每20秒执行一次存活探测
EOF
```



如你所见，TCP 检测的配置和 HTTP 检测非常相似。 下面这个例子同时使用就绪和存活探针。kubelet 会在容器启动 5 秒后发送第一个就绪探针。 探针会尝试连接 `goproxy` 容器的 8080 端口。 如果探测成功，这个 Pod 会被标记为就绪状态，kubelet 将继续每隔 10 秒运行一次探测。

除了就绪探针，这个配置包括了一个存活探针。 kubelet 会在容器启动 15 秒后进行第一次存活探测。 与就绪探针类似，存活探针会尝试连接 `goproxy` 容器的 8080 端口。 如果存活探测失败，容器会被重新启动。



创建pod

```
kubectl apply -f tcp-liveness-readiness.yaml 
```



### 定义 gRPC 存活探针

**特性状态：** `Kubernetes v1.24 [beta]`

如果你的应用实现了 [gRPC 健康检查协议](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)， kubelet 可以配置为使用该协议来执行应用存活性检查。 你必须启用 `GRPCContainerProbe` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/) 才能配置依赖于 gRPC 的检查机制。



编辑yaml文件

```yaml
cat > grpc-liveness.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: etcd-with-grpc
spec:
  containers:
  - name: etcd
    #image: registry.k8s.io/etcd:3.5.1-0
    image: mirrorgooglecontainers/etcd:3.5.1-0
    command: [ "/usr/local/bin/etcd", "--data-dir",  "/var/lib/etcd", "--listen-client-urls", "http://0.0.0.0:2379", "--advertise-client-urls", "http://127.0.0.1:2379", "--log-level", "debug"]
    ports:
    - containerPort: 2379
    livenessProbe:
      grpc:
        port: 2379
      initialDelaySeconds: 10
EOF
```

要使用 gRPC 探针，必须配置 `port` 属性。如果健康状态端点配置在非默认服务之上， 你还必须设置 `service` 属性。



:::tip说明

与 HTTP 和 TCP 探针不同，gRPC 探测**不能使用**命名端口或定制主机。

配置问题（例如：错误的 `port` 和 `service`、未实现健康检查协议） 都被认作是探测失败，这一点与 HTTP 和 TCP 探针类似。

:::



创建pod

```shell
kubectl apply -f grpc-liveness.yaml
```



15 秒钟之后，查看 Pod 事件确认存活性检查并未失败：

```shell
kubectl describe pod etcd-with-grpc
```



在 Kubernetes 1.23 之前，gRPC 健康探测通常使用 [grpc-health-probe](https://github.com/grpc-ecosystem/grpc-health-probe/) 来实现，如博客 [Health checking gRPC servers on Kubernetes（对 Kubernetes 上的 gRPC 服务器执行健康检查）](https://kubernetes.io/blog/2018/10/01/health-checking-grpc-servers-on-kubernetes/)所描述。 内置的 gRPC 探针行为与 `grpc-health-probe` 所实现的行为类似。 从 `grpc-health-probe` 迁移到内置探针时，请注意以下差异：

- 内置探针运行时针对的是 Pod 的 IP 地址，不像 `grpc-health-probe` 那样通常针对 `127.0.0.1` 执行探测； 请一定配置你的 gRPC 端点使之监听于 Pod 的 IP 地址之上。
- 内置探针不支持任何身份认证参数（例如 `-tls`）。
- 对于内置的探针而言，不存在错误代码。所有错误都被视作探测失败。
- 如果 `ExecProbeTimeout` 特性门控被设置为 `false`，则 `grpc-health-probe` 不会考虑 `timeoutSeconds` 设置状态（默认值为 1s）， 而内置探针则会在超时时返回失败。



### 使用命名端口

对于 HTTP 和 TCP 存活检测可以使用命名的 [`port`](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/#ports)（gRPC 探针不支持使用命名端口）。

例如：

```yaml
ports:
- name: liveness-port
  containerPort: 8080
  hostPort: 8080

livenessProbe:
  httpGet:
    path: /healthz
    port: liveness-port
```



### 使用启动探针保护慢启动容器

有时候，会有一些现有的应用在启动时需要较长的初始化时间。 要这种情况下，若要不影响对死锁作出快速响应的探测，设置存活探测参数是要技巧的。 技巧就是使用相同的命令来设置启动探测，针对 HTTP 或 TCP 检测，可以通过将 `failureThreshold * periodSeconds` 参数设置为足够长的时间来应对糟糕情况下的启动时间。

这样，前面的例子就变成了：

```yaml
ports:
- name: liveness-port
  containerPort: 8080
  hostPort: 8080

livenessProbe:
  httpGet:
    path: /healthz
    port: liveness-port
  failureThreshold: 1
  periodSeconds: 10

startupProbe:
  httpGet:
    path: /healthz
    port: liveness-port
  failureThreshold: 30 # 探测成功后，最少连续探测失败多少次才被认定为失败，默认是3，最小值是1
  periodSeconds: 10
```



幸亏有启动探测，应用程序将会有最多 5 分钟（30 * 10 = 300s）的时间来完成其启动过程。 一旦启动探测成功一次，存活探测任务就会接管对容器的探测，对容器死锁作出快速响应。 如果启动探测一直没有成功，容器会在 300 秒后被杀死，并且根据 `restartPolicy` 来执行进一步处置。



### 定义就绪探针

有时候，应用会暂时性地无法为请求提供服务。 例如，应用在启动时可能需要加载大量的数据或配置文件，或是启动后要依赖等待外部服务。 在这种情况下，既不想杀死应用，也不想给它发送请求。 Kubernetes 提供了就绪探针来发现并缓解这些情况。 容器所在 Pod 上报还未就绪的信息，并且不接受通过 Kubernetes Service 的流量。

:::tip说明

就绪探针在容器的整个生命周期中保持运行状态。

:::



:::caution

存活探针 **不等待** 就绪性探针成功。 如果要在执行存活探针之前等待，应该使用 `initialDelaySeconds` 或 `startupProbe`。

:::



就绪探针的配置和存活探针的配置相似。 唯一区别就是要使用 `readinessProbe` 字段，而不是 `livenessProbe` 字段。

```yaml
readinessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```



HTTP 和 TCP 的就绪探针配置也和存活探针的配置完全相同。

就绪和存活探测可以在同一个容器上并行使用。 两者共同使用，可以确保流量不会发给还未就绪的容器，当这些探测失败时容器会被重新启动。



## 配置探针

[Probe](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#probe-v1-core) 有很多配置字段，可以使用这些字段精确地控制启动、存活和就绪检测的行为：

- `initialDelaySeconds`：容器启动后要等待多少秒后才启动启动、存活和就绪探针， 默认是 0 秒，最小值是 0。
- `periodSeconds`：执行探测的时间间隔（单位是秒）。默认是 10 秒。最小值是 1。
- `timeoutSeconds`：探测的超时后等待多少秒。默认值是 1 秒。最小值是 1。
- `successThreshold`：探针在失败后，被视为成功的最小连续成功数。默认值是 1。 存活和启动探测的这个值必须是 1。最小值是 1。
- `failureThreshold`：当探测失败时，Kubernetes 的重试次数。 对存活探测而言，放弃就意味着重新启动容器。 对就绪探测而言，放弃意味着 Pod 会被打上未就绪的标签。默认值是 3。最小值是 1。

:::tip说明

在 Kubernetes 1.20 版本之前，`exec` 探针会忽略 `timeoutSeconds`： 探针会无限期地持续运行，甚至可能超过所配置的限期，直到返回结果为止。

这一缺陷在 Kubernetes v1.20 版本中得到修复。你可能一直依赖于之前错误的探测行为， 甚至都没有觉察到这一问题的存在，因为默认的超时值是 1 秒钟。 作为集群管理员，你可以在所有的 kubelet 上禁用 `ExecProbeTimeout` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/) （将其设置为 `false`），从而恢复之前版本中的运行行为。之后当集群中所有的 exec 探针都设置了 `timeoutSeconds` 参数后，移除此标志重载。 如果你有 Pod 受到此默认 1 秒钟超时值的影响，你应该更新这些 Pod 对应的探针的超时值， 这样才能为最终去除该特性门控做好准备。

当此缺陷被修复之后，在使用 `dockershim` 容器运行时的 Kubernetes `1.20+` 版本中，对于 exec 探针而言，容器中的进程可能会因为超时值的设置保持持续运行， 即使探针返回了失败状态。

:::



:::caution

如果就绪态探针的实现不正确，可能会导致容器中进程的数量不断上升。 如果不对其采取措施，很可能导致资源枯竭的状况。

:::



### HTTP 探测

[HTTP Probes](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#httpgetaction-v1-core) 允许针对 `httpGet` 配置额外的字段：

- `host`：连接使用的主机名，默认是 Pod 的 IP。也可以在 HTTP 头中设置 “Host” 来代替。
- `scheme` ：用于设置连接主机的方式（HTTP 还是 HTTPS）。默认是 "HTTP"。
- `path`：访问 HTTP 服务的路径。默认值为 "/"。
- `httpHeaders`：请求中自定义的 HTTP 头。HTTP 头字段允许重复。
- `port`：访问容器的端口号或者端口名。如果数字必须在 1～65535 之间。

对于 HTTP 探测，kubelet 发送一个 HTTP 请求到指定的路径和端口来执行检测。 除非 `httpGet` 中的 `host` 字段设置了，否则 kubelet 默认是给 Pod 的 IP 地址发送探测。 如果 `scheme` 字段设置为了 `HTTPS`，kubelet 会跳过证书验证发送 HTTPS 请求。 大多数情况下，不需要设置 `host` 字段。 这里有个需要设置 `host` 字段的场景，假设容器监听 127.0.0.1，并且 Pod 的 `hostNetwork` 字段设置为了 `true`。那么 `httpGet` 中的 `host` 字段应该设置为 127.0.0.1。 可能更常见的情况是如果 Pod 依赖虚拟主机，你不应该设置 `host` 字段，而是应该在 `httpHeaders` 中设置 `Host`。

针对 HTTP 探针，kubelet 除了必需的 `Host` 头部之外还发送两个请求头部字段： `User-Agent` 和 `Accept`。这些头部的默认值分别是 `kube-probe/{{ skew currentVersion >}}` （其中 `1.25` 是 kubelet 的版本号）和 `*/*`。

你可以通过为探测设置 `.httpHeaders` 来重载默认的头部字段值；例如：

```yaml
livenessProbe:
  httpGet:
    httpHeaders:
      - name: Accept
        value: application/json

startupProbe:
  httpGet:
    httpHeaders:
      - name: User-Agent
        value: MyUserAgent
```



你也可以通过将这些头部字段定义为空值，从请求中去掉这些头部字段。

```yaml
livenessProbe:
  httpGet:
    httpHeaders:
      - name: Accept
        value: ""

startupProbe:
  httpGet:
    httpHeaders:
      - name: User-Agent
        value: ""
```



### TCP 探测

对于 TCP 探测而言，kubelet 在节点上（不是在 Pod 里面）发起探测连接， 这意味着你不能在 `host` 参数上配置服务名称，因为 kubelet 不能解析服务名称。



### 探针层面的 `terminationGracePeriodSeconds`

**特性状态：** `Kubernetes v1.25 [beta]`

在 1.21 发行版之前，Pod 层面的 `terminationGracePeriodSeconds` 被用来终止存活探测或启动探测失败的容器。 这一行为上的关联不是我们想要的，可能导致 Pod 层面设置了 `terminationGracePeriodSeconds` 时容器要花非常长的时间才能重新启动。

在 1.21 及更高版本中，用户可以指定一个探针层面的 `terminationGracePeriodSeconds` 作为探针规约的一部分。 当 Pod 层面和探针层面的 `terminationGracePeriodSeconds` 都已设置，kubelet 将使用探针层面设置的值。

:::tip说明

从 Kubernetes 1.25 开始，默认启用 `ProbeTerminationGracePeriod` 特性。 选择禁用此特性的用户，请注意以下事项:

- `ProbeTerminationGracePeriod` 特性门控只能用在 API 服务器上。 kubelet 始终优先选用探针级别 `terminationGracePeriodSeconds` 字段 （如果它存在于 Pod 上）。

- 如果你已经为现有 Pod 设置了 `terminationGracePeriodSeconds` 字段并且不再希望使用针对每个探针的终止宽限期，则必须删除现有的这类 Pod。

- 当你（或控制平面或某些其他组件）创建替换 Pod，并且特性门控 `ProbeTerminationGracePeriod` 被禁用时，即使 Pod 或 Pod 模板指定了 `terminationGracePeriodSeconds` 字段， API 服务器也会忽略探针级别的 `terminationGracePeriodSeconds` 字段设置。

:::



例如

```yaml
spec:
  terminationGracePeriodSeconds: 3600  # Pod 级别设置
  containers:
  - name: test
    image: ...

    ports:
    - name: liveness-port
      containerPort: 8080
      hostPort: 8080

    livenessProbe:
      httpGet:
        path: /healthz
        port: liveness-port
      failureThreshold: 1
      periodSeconds: 60
      # 重载 Pod 级别的 terminationGracePeriodSeconds
      terminationGracePeriodSeconds: 60
```

