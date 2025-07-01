# headless service

[headless service官方文档](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#headless-services)



## 无头服务（Headless Services）

有时不需要或不想要负载均衡，以及单独的 Service IP。 遇到这种情况，可以通过指定 Cluster IP（`spec.clusterIP`）的值为 `"None"` 来创建 `Headless` Service。

你可以使用一个无头 Service 与其他服务发现机制进行接口，而不必与 Kubernetes 的实现捆绑在一起。

对于无头 `Services` 并不会分配 Cluster IP，kube-proxy 不会处理它们， 而且平台也不会为它们进行负载均衡和路由。 DNS 如何实现自动配置，依赖于 Service 是否定义了选择算符。

### 带选择算符的服务

对定义了选择算符的无头服务，Kubernetes 控制平面在 Kubernetes API 中创建 EndpointSlice 对象， 并且修改 DNS 配置返回 A 或 AAA 条记录（IPv4 或 IPv6 地址），通过这个地址直接到达 `Service` 的后端 Pod 上。

### 无选择算符的服务

对没有定义选择算符的无头服务，控制平面不会创建 EndpointSlice 对象。 然而 DNS 系统会查找和配置以下之一：

- 对于 [`type: ExternalName`](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#externalname) 服务，查找和配置其 CNAME 记录
- 对所有其他类型的服务，针对 Service 的就绪端点的所有 IP 地址，查找和配置 DNS A / AAAA 条记录
  - 对于 IPv4 端点，DNS 系统创建 A 条记录。
  - 对于 IPv6 端点，DNS 系统创建 AAAA 条记录。



以上是官方文档中对于headless service的介绍，比较简单



---



[这里有一篇关于headless service的文章](https://dev.to/eddiehale3/building-a-headless-service-in-kubernetes-3bk8)



## headless service使用场景

某些情况下需要与pod直接通信而不是通过负载均衡



## 什么是headless service

headless service是具有service ip的service，但是它不会进行负载均衡，而是直接返回所关联的pod的ip，这样就可以直接与pod交互而不是代理，配置service是headless service需要将 `.spec.clusterIP` 指定为 `None` 即可，并且可以在有或者没有选择算符的情况下使用



headless service配置示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-headless-service
spec:
  clusterIP: None # clusterIP指定为None
  selector:
    app: test-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```



下面是一个示例



创建一个包含5个pod的deployment

```yaml
cat > api-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  labels:
    app: api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: eddiehale/hellonodeapi
        ports:
        - containerPort: 3000
EOF
```



创建常规service

```yaml
cat > normal-service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: normal-service
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
EOF
```



创建无头service

```yaml
cat > headless-service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: headless-service
spec:
  clusterIP: None # clusterIP需要指定为None
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
EOF
```



创建这些资源

```shell
kubectl apply -f api-deployment.yaml
kubectl apply -f normal-service.yaml
kubectl apply -f headless-service.yaml
```



查看所有

```shell
$ kubectl get all
NAME                                 READY   STATUS    RESTARTS   AGE
pod/api-deployment-7898bdd89-6rtpb   1/1     Running   0          13s
pod/api-deployment-7898bdd89-9qvtl   1/1     Running   0          13s
pod/api-deployment-7898bdd89-bkw6f   1/1     Running   0          13s
pod/api-deployment-7898bdd89-hvlv6   1/1     Running   0          13s
pod/api-deployment-7898bdd89-j5r64   1/1     Running   0          13s

NAME                       TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
service/headless-service   ClusterIP   None          <none>        80/TCP    11s
service/normal-service     ClusterIP   10.96.1.136   <none>        80/TCP    13s

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/api-deployment   5/5     5            5           13s

NAME                                       DESIRED   CURRENT   READY   AGE
replicaset.apps/api-deployment-7898bdd89   5         5         5       13s
```





运行一个busybox来进行一些测试

```
kubectl run -it --image busybox:1.28.3 test --restart=Never --rm /bin/sh
```



解析常规service，可以看到只返回了service的ip地址

```shell
/ # nslookup normal-service
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      normal-service
Address 1: 10.96.1.136 normal-service.test.svc.cluster.local
```



解析无头service，可以看到直接返回了无头service所对应的5个pod的ip

```shell
/ # nslookup headless-service
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      headless-service
Address 1: 100.108.251.47 100-108-251-47.normal-service.test.svc.cluster.local
Address 2: 100.108.251.43 100-108-251-43.headless-service.test.svc.cluster.local
Address 3: 100.108.251.30 100-108-251-30.headless-service.test.svc.cluster.local
Address 4: 100.108.251.67 100-108-251-67.normal-service.test.svc.cluster.local
Address 5: 100.108.251.59 100-108-251-59.normal-service.test.svc.cluster.local
```







