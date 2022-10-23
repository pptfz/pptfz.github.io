# init容器

[init容器官方文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/init-containers/)



## Init 容器说明

Init 容器是一种特殊容器，在 [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/) 内的应用容器启动之前运行。Init 容器可以包括一些应用镜像中不存在的实用工具和安装脚本。



## 理解 Init 容器

每个 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 中可以包含多个容器， 应用运行在这些容器里面，同时 Pod 也可以有一个或多个先于应用容器启动的 Init 容器。

Init 容器与普通的容器非常像，除了如下两点：

- 它们总是运行到完成。
- 每个都必须在下一个启动之前成功完成。

如果 Pod 的 Init 容器失败，kubelet 会不断地重启该 Init 容器直到该容器成功为止。 然而，如果 Pod 对应的 `restartPolicy` 值为 "Never"，并且 Pod 的 Init 容器失败， 则 Kubernetes 会将整个 Pod 状态设置为失败。

为 Pod 设置 Init 容器需要在 [Pod 规约](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/#PodSpec)中添加 `initContainers` 字段， 该字段以 [Container](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#container-v1-core) 类型对象数组的形式组织，和应用的 `containers` 数组同级相邻。 参阅 API 参考的[容器](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/#Container)章节了解详情。

Init 容器的状态在 `status.initContainerStatuses` 字段中以容器状态数组的格式返回 （类似 `status.containerStatuses` 字段）。



### 与普通容器的不同之处

Init 容器支持应用容器的全部字段和特性，包括资源限制、数据卷和安全设置。 然而，Init 容器对资源请求和限制的处理稍有不同，在下面[资源](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/init-containers/#resources)节有说明。

同时 Init 容器不支持 `lifecycle`、`livenessProbe`、`readinessProbe` 和 `startupProbe`， 因为它们必须在 Pod 就绪之前运行完成。

如果为一个 Pod 指定了多个 Init 容器，这些容器会按顺序逐个运行。 每个 Init 容器必须运行成功，下一个才能够运行。当所有的 Init 容器运行完成时， Kubernetes 才会为 Pod 初始化应用容器并像平常一样运行。



## 使用 Init 容器

因为 Init 容器具有与应用容器分离的单独镜像，其启动相关代码具有如下优势：

- Init 容器可以包含一些安装过程中应用容器中不存在的实用工具或个性化代码。 例如，没有必要仅为了在安装过程中使用类似 `sed`、`awk`、`python` 或 `dig` 这样的工具而去 `FROM` 一个镜像来生成一个新的镜像。
- 应用镜像的创建者和部署者可以各自独立工作，而没有必要联合构建一个单独的应用镜像。

- 与同一 Pod 中的多个应用容器相比，Init 容器能以不同的文件系统视图运行。因此，Init 容器可以被赋予访问应用容器不能访问的 [Secret](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/) 的权限。
- 由于 Init 容器必须在应用容器启动之前运行完成，因此 Init 容器提供了一种机制来阻塞或延迟应用容器的启动，直到满足了一组先决条件。 一旦前置条件满足，Pod 内的所有的应用容器会并行启动。
- Init 容器可以安全地运行实用程序或自定义代码，而在其他方式下运行这些实用程序或自定义代码可能会降低应用容器镜像的安全性。 通过将不必要的工具分开，你可以限制应用容器镜像的被攻击范围。







### 使用 Init 容器的情况

下面的例子定义了一个具有 2 个 Init 容器的简单 Pod。 第一个等待 `myservice` 启动， 第二个等待 `mydb` 启动。 一旦这两个 Init 容器都启动完成，Pod 将启动 `spec` 节中的应用容器。

编辑yaml文件

```yaml
cat > myapp-init.yaml << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app.kubernetes.io/name: MyApp
spec:
  containers:
  - name: myapp-container
    image: busybox:1.28
    command: ['sh', '-c', 'echo The app is running! && sleep 3600']
  initContainers:
  - name: init-myservice
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done"]
  - name: init-mydb
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done"]
EOF
```



创建pod

```
kubectl apply -f myapp-init.yaml
```



查看日志

第一个容器

```shell
$ kubectl logs myapp-pod -c init-myservice
Server:    10.96.0.10
Address 1: 10.96.0.10

nslookup: can't resolve 'myservice.test.svc.cluster.local'
waiting for myservice
Server:    10.96.0.10
Address 1: 10.96.0.10

nslookup: can't resolve 'myservice.test.svc.cluster.local'
waiting for myservice
Server:    10.96.0.10
Address 1: 10.96.0.10

nslookup: can't resolve 'myservice.test.svc.cluster.local'
waiting for myservice
```



第二个容器

```shell
$ kubectl logs myapp-pod -c init-mydb 
Error from server (BadRequest): container "init-mydb" in pod "myapp-pod" is waiting to start: PodInitializing
```



可以看到，在这一刻，Init 容器将会等待至发现名称为 `mydb` 和 `myservice` 的 Service。当svc创建成功后，init容器会按顺序成功执行。



如下为创建这些 Service 的配置文件

```yaml
cat > myservice-init.yaml << EOF
---
apiVersion: v1
kind: Service
metadata:
  name: myservice
spec:
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
---
apiVersion: v1
kind: Service
metadata:
  name: mydb
spec:
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9377
EOF
```



创建 `mydb` 和 `myservice` svc

```shell
kubectl apply -f myservice-init.yaml 
```



当 `mydb` 和 `myservice` svc创建完成后，再次查看myapp-pod中容器日志

init-myservice容器日志

```shell
$ kubectl logs myapp-pod -c init-myservice
...
Name:      myservice.test.svc.cluster.local
Address 1: 10.101.113.34 myservice.test.svc.cluster.local
```



init-mydb容器日志

```shell
$ kubectl logs myapp-pod -c init-mydb
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      mydb.test.svc.cluster.local
Address 1: 10.108.52.122 mydb.test.svc.cluster.local
```



可以看到，2个init容器均已成功运行



## 创建一个包含 Init 容器的 Pod

本例中你将创建一个包含一个应用容器和一个 Init 容器的 Pod。Init 容器在应用容器启动前运行完成。

编辑yaml文件

```yaml
cat > init-containers.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
    volumeMounts:
    - name: workdir
      mountPath: /usr/share/nginx/html
  # 这些容器在 Pod 初始化期间运行
  initContainers:
  - name: install
    image: busybox:1.28
    command:
    - wget
    - "-O"
    - "/work-dir/index.html"
    - http://info.cern.ch
    volumeMounts:
    - name: workdir
      mountPath: "/work-dir"
  dnsPolicy: Default
  volumes:
  - name: workdir
    emptyDir: {}
EOF
```



配置文件中，你可以看到应用容器和 Init 容器共享了一个卷。Init 容器将共享卷挂载到了 `/work-dir` 目录，应用容器将共享卷挂载到了 `/usr/share/nginx/html` 目录。 Init 容器执行完下面的命令就终止：

```shell
wget -O /work-dir/index.html http://info.cern.ch
```

init 容器在 nginx 服务器的根目录写入 `index.html`。



创建pod

```shell
kubectl apply -f init-containers.yaml 
```



查看pod

```shell
$ kubectl get pod init-demo 
NAME        READY   STATUS    RESTARTS   AGE
init-demo   1/1     Running   0          40s
```



查看pod中的nginx容器下 `/usr/share/nginx/html/index.html` 内容

```shell
$ kubectl exec init-demo -it -- cat /usr/share/nginx/html/index.html
Defaulted container "nginx" out of: nginx, install (init)
<html><head></head><body><header>
<title>http://info.cern.ch</title>
</header>

<h1>http://info.cern.ch - home of the first website</h1>
<p>From here you can:</p>
<ul>
<li><a href="http://info.cern.ch/hypertext/WWW/TheProject.html">Browse the first website</a></li>
<li><a href="http://line-mode.cern.ch/www/hypertext/WWW/TheProject.html">Browse the first website using the line-mode browser simulator</a></li>
<li><a href="http://home.web.cern.ch/topics/birth-web">Learn about the birth of the web</a></li>
<li><a href="http://home.web.cern.ch/about">Learn about CERN, the physics laboratory where the web was born</a></li>
</ul>
</body></html>
```



以上结果说明init容器在应用程序容器运行之前运行，Init 容器将共享卷挂载到了 `/work-dir` 目录，应用容器将共享卷挂载到了 `/usr/share/nginx/html` 目录





