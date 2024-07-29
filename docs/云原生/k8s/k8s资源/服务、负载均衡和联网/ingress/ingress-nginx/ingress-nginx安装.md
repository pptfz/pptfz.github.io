# ingress-nginx安装

[ingress k8s官方说明文档](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/)

[ingress-nginx官方文档](https://kubernetes.github.io/ingress-nginx/)

[ingress-nginx github地址](https://github.com/kubernetes/ingress-nginx)





## ingress说明

[Ingress](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.28/#ingress-v1-networking-k8s-io) 提供从集群外部到集群内[服务](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/)的 HTTP 和 HTTPS 路由。 流量路由由 Ingress 资源所定义的规则来控制。

下面是 Ingress 的一个简单示例，可将所有流量都发送到同一 Service



![iShot_2023-12-11_19.21.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-12-11_19.21.03.png)

通过配置，Ingress 可为 Service 提供外部可访问的 URL、对其流量作负载均衡、 终止 SSL/TLS，以及基于名称的虚拟托管等能力。 [Ingress 控制器](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress-controllers) 负责完成 Ingress 的工作，具体实现上通常会使用某个负载均衡器， 不过也可以配置边缘路由器或其他前端来帮助处理流量。

Ingress 不会随意公开端口或协议。 将 HTTP 和 HTTPS 以外的服务开放到 Internet 时，通常使用 [Service.Type=NodePort](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#type-nodeport) 或 [Service.Type=LoadBalancer](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#loadbalancer) 类型的 Service。



## ingress控制器说明

[ingress控制器 k8s官方文档](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress-controllers/)



为了让 Ingress 资源工作，集群必须有一个正在运行的 Ingress 控制器。

与作为 `kube-controller-manager` 可执行文件的一部分运行的其他类型的控制器不同， Ingress 控制器不是随集群自动启动的。 基于此页面，你可选择最适合你的集群的 ingress 控制器实现。

Kubernetes 作为一个项目，目前支持和维护 [AWS](https://github.com/kubernetes-sigs/aws-load-balancer-controller#readme)、 [GCE](https://git.k8s.io/ingress-gce/README.md#readme) 和 [Nginx](https://git.k8s.io/ingress-nginx/README.md#readme) Ingress 控制器。

ingress-nginx是ingress控制器中的一种，其他类型的ingress控制器可以参考 [官方文档](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress-controllers/)



## ingress-nginx安装

### 裸机注意事项

在云环境中，部署ingress-nginx的时候，我们一般会选择创建一个loadbalancer类型的svc，同时也会创建一个相应的lb，以此来作为对外的统一入口，但是部署在裸机服务器上的 Kubernetes 集群，以及使用通用 Linux 发行版（如 CentOS、Ubuntu...）手动安装 Kubernetes 的 `原始` VM ，这种环境下需要不同的设置才能像云环境中那样提供相同类型的访问



云环境中会有

![iShot_2023-12-12_14.39.12](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-12-12_14.39.12.png)



VM环境

![iShot_2023-12-12_14.40.20](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2023-12-12_14.40.20.png)





#### 解决方案

[纯软件解决方案：MetalLB](https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#a-pure-software-solution-metallb)

[通过 NodePort 服务](https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#over-a-nodeport-service)

[通过主机网络](https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#via-the-host-network)

[使用自配置边缘](https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#using-a-self-provisioned-edge)

[外部IP](https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#external-ips)



### 安装

#### 安装ingress-nginx

[ingress-nginx官方安装文档](https://kubernetes.github.io/ingress-nginx/deploy/)



添加helm仓库

```shell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```



下载安装包

```sh
helm pull ingress-nginx/ingress-nginx
```



解压缩

```shell
tar xf ingress-nginx-4.8.4.tgz && cd ingress-nginx
```



修改 `values.yaml`

:::tip 说明

由于某些特殊原因，无法访问  `registry.k8s.io`  ，我们可以使用 ucloud 提供的镜像加速解决

:::

修改 `values.yaml` 中所有  `registry.k8s.io`



安装

```sh
helm upgrade --install ingress-nginx -n ingress-nginx --create-namespace .
```



查看pod运行状态

:::tip 说明

如果设置了 `defaultBackend` ，则会运行一个名为 `ingress-nginx-defaultbackend` 的deployment

```sh
$ kubectl get pod
NAME                                            READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-5c7ff55b75-s4p9p       1/1     Running   0          3m22s
ingress-nginx-defaultbackend-64f4cbc798-h2kfk   1/1     Running   0          3m22s
```

:::



```sh
$ kubectl -n ingress-nginx get pod
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-5865555b87-r6465   1/1     Running   0          8m58s
```



:::caution 注意

在安装的时候可以指定 `ingressclass` 名称，集群中可以有多个 `ingress-nginx-controller`

```shell
$ kubectl get ingressclass
NAME    CONTROLLER             PARAMETERS   AGE
nginx   k8s.io/ingress-nginx   <none>       2d19h
```

:::



#### 安装MetalLB

[MetalLB官方文档](https://metallb.universe.tf/)

[MetalLB github](https://github.com/metallb/metallb)



添加helm仓库

```bash
helm repo add metallb https://metallb.github.io/metallb
helm repo update 
```



下载安装包

```bash
helm pull metallb/metallb
```



解压缩

```bash
tar xf metallb-0.13.12.tgz && cd metallb
```



修改 `values.yaml`

:::tip 说明

由于某些特殊原因，无法访问  `gcr.io`  ，我们可以使用 ucloud 提供的镜像加速解决

修改 `values.yaml` 中所有  `gcr.io`

:::

安装

```bash
helm upgrade --install metallb -n metallb-system --create-namespace .
```



查看pod运行状态

```bash
$ kubectl get pod
NAME                                  READY   STATUS    RESTARTS   AGE
metallb-controller-5f9bb77dcd-mdr7l   1/1     Running   0          6m14s
metallb-speaker-7nw84                 4/4     Running   0          20m
metallb-speaker-9bfxd                 4/4     Running   0          6m3s
```



查看 `ingress-nginx` 命名空间下的 svc，可以看到名为 `ingress-nginx-controller` 的svc类型是 `LoadBalancer` ，因为不是云环境，因此 `EXTERNAL-IP` 状态是 `<pending>`

```bash
$ kubectl get svc -n ingress-nginx
NAME                                 TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.110.240.95   <pending>     80:31285/TCP,443:30307/TCP   13m
ingress-nginx-controller-admission   ClusterIP      10.98.175.165   <none>        443/TCP                      13m
```



为了解决以上问题，安装完metallb后，还需要创建以下资源

:::caution 注意

`addresses` 字段指定的ip地址段要与node节点的网络在同一个地址段

:::

```yaml
cat > metallb-IPAddressPool.yaml << EOF
---
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
  - 203.0.113.10-203.0.113.15
  autoAssign: true
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
  - default
EOF
```



应用以上yaml文件以创建 `IPAddressPool` 和 `L2Advertisement` 资源对象

```bash
kubectl apply -f metallb-IPAddressPool.yaml 
```



查看创建的 `IPAddressPool`

```bash
$ kubectl get IPAddressPool -n metallb-system
NAME      AGE
default   45s
```



创建完  `IPAddressPool` 在查看 `ingress-nginx` 命名空间下的 svc ，可以看到，之前名为 `ingress-nginx-controller` 的svc状态已经不是  `<pending>` 了，此时已经获取到了我们创建的 `IPAddressPool` 中指定的ip地址池中的ip

```bash
$ kubectl get svc -n ingress-nginx
NAME                                 TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.110.240.95   203.0.113.10   80:31285/TCP,443:30307/TCP   29m
ingress-nginx-controller-admission   ClusterIP      10.98.175.165   <none>         443/TCP                      29m
```



编辑示例文件

```yaml
cat > use-ingress-example.yaml << EOF
kind: Pod
apiVersion: v1
metadata:
  name: foo-app
  labels:
    app: foo
spec:
  containers:
  - command:
    - /agnhost
    - netexec
    - --http-port
    - "8080"
    image: uhub.service.ucloud.cn/996.icu/agnhost:2.39  
    name: foo-app
---
kind: Service
apiVersion: v1
metadata:
  name: foo-service
spec:
  selector:
    app: foo
  ports:
  # Default port used by the image
  - port: 8080
---
kind: Pod
apiVersion: v1
metadata:
  name: bar-app
  labels:
    app: bar
spec:
  containers:
  - command:
    - /agnhost
    - netexec
    - --http-port
    - "8080"
    image: uhub.service.ucloud.cn/996.icu/agnhost:2.39
    name: bar-app
---
kind: Service
apiVersion: v1
metadata:
  name: bar-service
spec:
  selector:
    app: bar
  ports:
  # Default port used by the image
  - port: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx-prod
  rules:
  - host: test.ops.com
    http:
      paths:
      #- pathType: Prefix
      - pathType: ImplementationSpecific
        path: /foo(/|$)(.*)
        backend:
          service:
            name: foo-service
            port:
              number: 8080
      #- pathType: Prefix
      - pathType: ImplementationSpecific
        path: /bar(/|$)(.*)
        backend:
          service:
            name: bar-service
            port:
              number: 8080
---
EOF
```



创建

```bash
kubectl apply -f use-ingress-example.yaml 
```



查看 ingress

```bash
$ kubectl get ing
NAME              CLASS        HOSTS          ADDRESS      PORTS   AGE
example-ingress   nginx-prod   test.ops.com   203.0.113.10   80      69m
```



本机做host后访问

```bash
$ curl test.ops.com/bar/hostname
bar-app

$ curl test.ops.com/foo/hostname
foo-app
```

