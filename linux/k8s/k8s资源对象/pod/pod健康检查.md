[toc]



# pod健康检查

[pod健康检查官方文档](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-TCP-liveness-probe)

## 探针分类

### liveness probe（存活探针）

> **kubelet 通过使用 liveness probe 来确定你的应用程序是否正在运行，通俗点讲就是是否还活着。一般来说，如果你的程序一旦崩溃了， Kubernetes 就会立刻知道这个程序已经终止了，然后就会重启这个程序。而我们的 liveness probe 的目的就是来捕获到当前应用程序还有没有终止，还有没有崩溃，如果出现了这些情况，那么就重启处于该状态下的容器，使应用程序在存在 bug 的情况下依然能够继续运行下去。**

### readiness probe（可读性探针）

> **kubelet 使用 readiness probe 来确定容器是否已经就绪可以接收流量过来了。这个探针通俗点讲就是说是否准备好了，现在可以开始工作了。只有当 Pod 中的容器都处于就绪状态的时候 kubelet 才会认定该 Pod 处于就绪状态，因为一个 Pod 下面可能会有多个容器。当然 Pod 如果处于非就绪状态，那么我们就会将他从我们的工作队列(实际上就是Service)中移除出来，这样我们的流量就不会被路由到这个 Pod 里面来了。**

`Pod`中容器的生命周期的两个钩子函数，`PostStart`与`PreStop`，其中`PostStart`是在容器创建后立即执行的，而`PreStop`这个钩子函数则是在容器终止之前执行的。除了上面这两个钩子函数以外，还有一项配置会影响到容器的生命周期的，那就是健康检查的探针。

在`kubernetes`集群当中，我们可以通过配置`liveness probe`（存活探针）和`readiness probe`（可读性探针）来影响容器的生存周期。

和前面的钩子函数一样的，我们这两个探针的支持三种配置方式：

* exec：执行一段命令
* http：检测某个 http 请求
* tcpSocket：使用此配置， kubelet 将尝试在指定端口上打开容器的套接字。如果可以建立连接，容器被认为是健康的，如果不能就认为是失败的。实际上就是检查端口



## 探针配置方式

[kubelet](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kubelet/) 使用存活探测器来知道什么时候要重启容器。 例如，存活探测器可以捕捉到死锁（应用程序在运行，但是无法继续执行后面的步骤）。 这样的情况下重启容器有助于让应用程序在有问题的情况下更可用。

kubelet 使用就绪探测器可以知道容器什么时候准备好了并可以开始接受请求流量， 当一个 Pod 内的所有容器都准备好了，才能把这个 Pod 看作就绪了。 这种信号的一个用途就是控制哪个 Pod 作为 Service 的后端。 在 Pod 还没有准备好的时候，会从 Service 的负载均衡器中被剔除的。

kubelet 使用启动探测器可以知道应用程序容器什么时候启动了。 如果配置了这类探测器，就可以控制容器在启动成功后再进行存活性和就绪检查， 确保这些存活、就绪探测器不会影响应用程序的启动。 这可以用于对慢启动容器进行存活性检测，避免它们在启动运行之前就被杀掉。



### 定义存活命令 exec

第一种类型的存活探测是运行特定命令

许多长时间运行的应用程序最终会过渡到断开的状态，除非重新启动，否则无法恢复。 Kubernetes 提供了存活探测器来发现并补救这种情况。

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
    # image: k8s.gcr.io/busybox
    image: mirrorgooglecontainers/busybox # 如不能科学上网，则修改k8s.gcr.io为docker官方提供的mirrorgooglecontainers
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
EOF
```



在这个配置文件中，可以看到 Pod 中只有一个容器。 `periodSeconds` 字段指定了 kubelet 应该每 5 秒执行一次存活探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一次探测前应该等待 5 秒。 kubelet 在容器内执行命令 `cat /tmp/healthy` 来进行探测。 如果命令执行成功并且返回值为 0，kubelet 就会认为这个容器是健康存活的。 如果这个命令返回非 0 值，kubelet 会杀死这个容器并重新启动它。

当容器启动时，执行如下的命令：

```shell
/bin/sh -c "touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600"
```



这个容器生命的前 30 秒， `/tmp/healthy` 文件是存在的。 所以在这最开始的 30 秒内，执行命令 `cat /tmp/healthy` 会返回成功代码。 30 秒之后，执行命令 `cat /tmp/healthy` 就会返回失败代码。

创建 Pod：

```shell
kubectl apply -f exec-liveness.yaml
```



输出结果表明还没有存活探测器失败：

```shell
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  27s   default-scheduler  Successfully assigned hehe/liveness-exec to k8s-node02
  Normal  Pulling    27s   kubelet            Pulling image "mirrorgooglecontainers/busybox"
  Normal  Pulled     6s    kubelet            Successfully pulled image "mirrorgooglecontainers/busybox" in 20.357008603s
  Normal  Created    6s    kubelet            Created container liveness
  Normal  Started    5s    kubelet            Started container liveness
```



35 秒之后，再来看 Pod 的事件：

```
kubectl describe pod liveness-exec
```



在输出结果的最下面，有信息显示存活探测器失败了，这个容器被杀死并且被重建了。

```shell
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  64s               default-scheduler  Successfully assigned hehe/liveness-exec to k8s-node02
  Normal   Pulling    64s               kubelet            Pulling image "mirrorgooglecontainers/busybox"
  Normal   Pulled     43s               kubelet            Successfully pulled image "mirrorgooglecontainers/busybox" in 20.357008603s
  Normal   Created    43s               kubelet            Created container liveness
  Normal   Started    42s               kubelet            Started container liveness
  Warning  Unhealthy  5s (x2 over 10s)  kubelet            Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory
```



再等另外 30 秒，检查看这个容器被重启了：

```shell
kubectl get pod liveness-exec
```



输出结果显示 `RESTARTS` 的值增加了 1。

```shell
NAME            READY   STATUS    RESTARTS      AGE
liveness-exec   1/1     Running   1 (43s ago)   2m18s
```



### 定义一个存活态 HTTP 请求接口 http

第二种类型的存活探测方式是使用 HTTP GET 请求

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
    # image: k8s.gcr.io/liveness
    image: mirrorgooglecontainers/liveness # 如不能科学上网，则修改k8s.gcr.io为docker官方提供的mirrorgooglecontainers
    args:
    - /server
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3
      periodSeconds: 3
EOF
```



在这个配置文件中，可以看到 Pod 也只有一个容器。 `periodSeconds` 字段指定了 kubelet 每隔 3 秒执行一次存活探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一次探测前应该等待 3 秒。 kubelet 会向容器内运行的服务（服务会监听 8080 端口）发送一个 HTTP GET 请求来执行探测。 如果服务器上 `/healthz` 路径下的处理程序返回成功代码，则 kubelet 认为容器是健康存活的。 如果处理程序返回失败代码，则 kubelet 会杀死这个容器并且重新启动它。

任何大于或等于 200 并且小于 400 的返回代码标示成功，其它返回代码都标示失败。

可以在这里看服务的源码 [server.go](https://github.com/kubernetes/kubernetes/raw/branch/branch/master/test/images/agnhost/liveness/server.go)。

容器存活的最开始 10 秒中，`/healthz` 处理程序返回一个 200 的状态码。之后处理程序返回 500 的状态码。

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

创建一个 Pod 来测试 HTTP 的存活检测：

```shell
kubectl apply -f http-liveness.yaml
```



10 秒之后，通过看 Pod 事件来检测存活探测器已经失败了并且容器被重新启动了。

```shell
kubectl describe pod liveness-http
```



```shell
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  48s               default-scheduler  Successfully assigned hehe/liveness-http to k8s-node01
  Normal   Pulled     28s               kubelet            Successfully pulled image "mirrorgooglecontainers/liveness" in 18.956899406s
  Normal   Created    27s               kubelet            Created container liveness
  Normal   Started    27s               kubelet            Started container liveness
  Normal   Pulling    9s (x2 over 47s)  kubelet            Pulling image "mirrorgooglecontainers/liveness"
  Warning  Unhealthy  9s (x3 over 15s)  kubelet            Liveness probe failed: HTTP probe failed with statuscode: 500
  Normal   Killing    9s                kubelet            Container liveness failed liveness probe, will be restarted
```



在 1.13（包括 1.13版本）之前的版本中，如果在 Pod 运行的节点上设置了环境变量 `http_proxy`（或者 `HTTP_PROXY`），HTTP 的存活探测会使用这个代理。 在 1.13 之后的版本中，设置本地的 HTTP 代理环境变量不会影响 HTTP 的存活探测。



### 定义 TCP 的存活探测 tcpSocket

第三种类型的存活探测是使用 TCP 套接字。 通过配置，kubelet 会尝试在指定端口和容器建立套接字链接。 如果能建立连接，这个容器就被看作是健康的，如果不能则这个容器就被看作是有问题的。



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
    # image: k8s.gcr.io/goproxy:0.1
    image: mirrorgooglecontainers/goproxy:0.1 # 如不能科学上网，则修改k8s.gcr.io为docker官方提供的mirrorgooglecontainers
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
      initialDelaySeconds: 15
      periodSeconds: 20
EOF
```



如你所见，TCP 检测的配置和 HTTP 检测非常相似。 下面这个例子同时使用就绪和存活探测器。kubelet 会在容器启动 5 秒后发送第一个就绪探测。 这会尝试连接 `goproxy` 容器的 8080 端口。 如果探测成功，这个 Pod 会被标记为就绪状态，kubelet 将继续每隔 10 秒运行一次检测。

除了就绪探测，这个配置包括了一个存活探测。 kubelet 会在容器启动 15 秒后进行第一次存活探测。 与就绪探测类似，会尝试连接 `goproxy` 容器的 8080 端口。 如果存活探测失败，这个容器会被重新启动。

```shell
kubectl apply -f tcp-liveness-readiness.yaml
```



15 秒之后，通过看 Pod 事件来检测存活探测器：

```shell
kubectl describe pod goproxy
```



## 使用命名端口

对于 HTTP 或者 TCP 存活检测可以使用命名的 [ContainerPort](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#containerport-v1-core)。

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

## 使用启动探测器保护慢启动容器

有时候，会有一些现有的应用程序在启动时需要较多的初始化时间。 要不影响对引起探测死锁的快速响应，这种情况下，设置存活探测参数是要技巧的。 技巧就是使用一个命令来设置启动探测，针对HTTP 或者 TCP 检测，可以通过设置 `failureThreshold * periodSeconds` 参数来保证有足够长的时间应对糟糕情况下的启动时间。

所以，前面的例子就变成了：

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
  failureThreshold: 30
  periodSeconds: 10
```

幸亏有启动探测，应用程序将会有最多 5 分钟(30 * 10 = 300s) 的时间来完成它的启动。 一旦启动探测成功一次，存活探测任务就会接管对容器的探测，对容器死锁可以快速响应。 如果启动探测一直没有成功，容器会在 300 秒后被杀死，并且根据 `restartPolicy` 来设置 Pod 状态。



## 定义就绪探测器

有时候，应用程序会暂时性的不能提供通信服务。 例如，应用程序在启动时可能需要加载很大的数据或配置文件，或是启动后要依赖等待外部服务。 在这种情况下，既不想杀死应用程序，也不想给它发送请求。 Kubernetes 提供了就绪探测器来发现并缓解这些情况。 容器所在 Pod 上报还未就绪的信息，并且不接受通过 Kubernetes Service 的流量。

> **说明：** 就绪探测器在容器的整个生命周期中保持运行状态。

> **注意：** 活跃性探测器 *不等待* 就绪性探测器成功。 如果要在执行活跃性探测器之前等待，应该使用 initialDelaySeconds 或 startupProbe。

**<span style=color:red>就绪探测器的配置和存活探测器的配置相似。 唯一区别就是要使用 `readinessProbe` 字段，而不是 `livenessProbe` 字段。</span>**

```yaml
readinessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

HTTP 和 TCP 的就绪探测器配置也和存活探测器的配置一样的。

就绪和存活探测可以在同一个容器上并行使用。 两者都用可以确保流量不会发给还没有准备好的容器，并且容器会在它们失败的时候被重新启动。

## 配置探测器

[Probe](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#probe-v1-core) 有很多配置字段，可以使用这些字段精确的控制存活和就绪检测的行为：

- `initialDelaySeconds`：容器启动后要等待多少秒后存活和就绪探测器才被初始化，默认是 0 秒，最小值是 0。
- `periodSeconds`：执行探测的时间间隔（单位是秒）。默认是 10 秒。最小值是 1。
- `timeoutSeconds`：探测的超时后等待多少秒。默认值是 1 秒。最小值是 1。
- `successThreshold`：探测器在失败后，被视为成功的最小连续成功数。默认值是 1。 存活和启动探测的这个值必须是 1。最小值是 1。
- `failureThreshold`：当探测失败时，Kubernetes 的重试次数。 存活探测情况下的放弃就意味着重新启动容器。 就绪探测情况下的放弃 Pod 会被打上未就绪的标签。默认值是 3。最小值是 1。

> **说明：**
>
> 在 Kubernetes 1.20 版本之前，exec 探针会忽略 `timeoutSeconds`：探针会无限期地 持续运行，甚至可能超过所配置的限期，直到返回结果为止。
>
> 这一缺陷在 Kubernetes v1.20 版本中得到修复。你可能一直依赖于之前错误的探测行为， 甚至你都没有觉察到这一问题的存在，因为默认的超时值是 1 秒钟。 作为集群管理员，你可以在所有的 kubelet 上禁用 `ExecProbeTimeout` [特性门控](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/feature-gates/) （将其设置为 `false`），从而恢复之前版本中的运行行为，之后当集群中所有的 exec 探针都设置了 `timeoutSeconds` 参数后，移除此标志重载。 如果你有 Pods 受到此默认 1 秒钟超时值的影响，你应该更新 Pod 对应的探针的 超时值，这样才能为最终去除该特性门控做好准备。
>
> 当此缺陷被修复之后，在使用 `dockershim` 容器运行时的 Kubernetes `1.20+` 版本中，对于 exec 探针而言，容器中的进程可能会因为超时值的设置保持持续运行， 即使探针返回了失败状态。

> **注意：**
>
> 如果就绪态探针的实现不正确，可能会导致容器中进程的数量不断上升。 如果不对其采取措施，很可能导致资源枯竭的状况。



### HTTP 探测 

[HTTP Probes](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#httpgetaction-v1-core) 可以在 `httpGet` 上配置额外的字段：

- `host`：连接使用的主机名，默认是 Pod 的 IP。也可以在 HTTP 头中设置 “Host” 来代替。
- `scheme` ：用于设置连接主机的方式（HTTP 还是 HTTPS）。默认是 HTTP。
- `path`：访问 HTTP 服务的路径。默认值为 "/"。
- `httpHeaders`：请求中自定义的 HTTP 头。HTTP 头字段允许重复。
- `port`：访问容器的端口号或者端口名。如果数字必须在 1 ～ 65535 之间。

对于 HTTP 探测，kubelet 发送一个 HTTP 请求到指定的路径和端口来执行检测。 除非 `httpGet` 中的 `host` 字段设置了，否则 kubelet 默认是给 Pod 的 IP 地址发送探测。 如果 `scheme` 字段设置为了 `HTTPS`，kubelet 会跳过证书验证发送 HTTPS 请求。 大多数情况下，不需要设置`host` 字段。 这里有个需要设置 `host` 字段的场景，假设容器监听 127.0.0.1，并且 Pod 的 `hostNetwork` 字段设置为了 `true`。那么 `httpGet` 中的 `host` 字段应该设置为 127.0.0.1。 可能更常见的情况是如果 Pod 依赖虚拟主机，你不应该设置 `host` 字段，而是应该在 `httpHeaders` 中设置 `Host`。

针对 HTTP 探针，kubelet 除了必需的 `Host` 头部之外还发送两个请求头部字段： `User-Agent` 和 `Accept`。这些头部的默认值分别是 `kube-probe/{{ skew latestVersion >}}` （其中 `1.23` 是 kubelet 的版本号）和 `*/*`。

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

对于一次 TCP 探测，kubelet 在节点上（不是在 Pod 里面）建立探测连接， 这意味着你不能在 `host` 参数上配置服务名称，因为 kubelet 不能解析服务名称。

### 探测器级别 `terminationGracePeriodSeconds`[ ](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#探测器级别-terminationgraceperiodseconds)

**FEATURE STATE:** `Kubernetes v1.22 [beta]`

在 1.21 及更高版本中，当特性门控 `ProbeTerminationGracePeriod` 为 启用状态时，用户可以指定一个探测级别的 `terminationGracePeriodSeconds` 作为 探针规格的一部分。当特性门控被启用时，并且 Pod 级和探针级的 `terminationGracePeriodSeconds` 都已设置，kubelet 将 使用探针级设置的值。

> **说明：**
>
> 从 Kubernetes 1.22 开始，`ProbeTerminationGracePeriod` 特性门控只 在 API 服务器上可用。 kubelet 始终遵守探针级别 `terminationGracePeriodSeconds` 字段（如果它存在于 Pod 上）。
>
> 如果你已经为现有 Pod 设置了 “terminationGracePeriodSeconds” 字段并且 不再希望使用针对每个探针的终止宽限期，则必须删除那些现有的 Pod。
>
> 当你（或控制平面或某些其他组件）创建替换 Pods，并且特性门控 “ProbeTerminationGracePeriod” 被禁用，那么 API 服务器会忽略 Pod 级别的 `terminationGracePeriodSeconds` 字段，即使 Pod 或 Pod 模板指定了它。

例如:

```yaml
spec:
  terminationGracePeriodSeconds: 3600  # pod-level
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
      # Override pod-level terminationGracePeriodSeconds #
      terminationGracePeriodSeconds: 60
```

探测器级别的 `terminationGracePeriodSeconds` 不能用于设置就绪态探针。 它将被 API 服务器拒绝。
