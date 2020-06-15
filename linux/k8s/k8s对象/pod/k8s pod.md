# k8s pod

[kubectl run命令中文网站](http://docs.kubernetes.org.cn/468.html)

[kubectl run generator参数官网说明](https://kubernetes.io/docs/reference/kubectl/conventions/#generators)





# pod容器分类

## Infrastructure Container：基础容器

- **维护整个Pod网络空间**

## InitContainers：初始化容器

- **先于业务容器开始执行**

## Containers：业务容器

- **并行启动**





# pod操作

## 1.1 创建pod

- 命令方式

```python
kubectl run nginx --image=nginx:1.16 --replicas=3 --generator=run-pod/v1
  
  
--generator=run-pod/v1就是指定创建的类型为pod  
```

- yaml文件方式

```yaml
cat >nginx-pod.yaml<<EOF
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: 10.0.0.130:5000/nginx:latest
      ports:
        - containerPort: 80
  imagePullSecrets:
    - name: myregistrykey
EOF    


kubectl create -f nginx-pod.yaml
```

创建pod过程中遇到的问题

> 镜像是使用了master本机的register私有仓库，配置了认证，创建pod拉取镜像报错如下

```python
Warning  Failed     14m (x4 over 15m)     kubelet, k8s-node2  Failed to pull image "10.0.0.130:5000/nginx:latest": rpc error: code = Unknown desc = Error response from daemon: Get http://10.0.0.130:5000/v2/nginx/manifests/latest: no basic auth credentials
```

解决方法：

> 创建一个register的认证，名称为myregistrykey，然后在pod的yaml文件中定义如下即可
>
> imagePullSecrets:
>
>   - name: myregistrykey

```python
#创建认证
kubectl create secret docker-registry myregistrykey  --docker-server=10.0.0.130:5000 --docker-username=test --docker-password=123456
  
secret/myregistrykey created 

#删除认证
kubectl delete secrets myregistrykey
```

## 1.2 查看pod

```python
#查看所有pod
kubectl get pods

#指定pod查看
kubectl get pod pod-name

#查看pod详细信息
kubectl describe pod pod-name
```



## 1.3 删除pod

```python
#删除pod
kubectl delete pod pod-name
```







# 静态pod

## 1.静态pod说明

- 静态 Pod 直接由特定节点上的`kubelet`进程来管理，不通过 master 节点上的`apiserver`。无法与我们常用的控制器`Deployment`或者`DaemonSet`进行关联，它由`kubelet`进程自己来监控，当`pod`崩溃时重启该`pod`，`kubelet`也无法对他们进行健康检查。静态 pod 始终绑定在某一个`kubelet`，并且始终运行在同一个节点上。 `kubelet`会自动为每一个静态 pod 在 Kubernetes 的 apiserver 上创建一个镜像 Pod（Mirror Pod），因此我们可以在 apiserver 中查询到该 pod，但是不能通过 apiserver 进行控制（例如不能删除）。

- kubeadm安装的k8s中，``etcd``  、``kube-apiserver``、  ``kube-controller-manager``、``kube-scheduler``都是以静态pod的方式部署，路径为``/etc/kubernetes/manifests/``，只需要把yaml文件放在此路径就会启动静态pod，移除yaml文件则会删除静态pod

- 静态pod使用``kubectl delete``命令无法删除，但是在1.17.4版本中官方的dashboard中可以删除，其余版本没有测试





## 2.创建静态pod

- **创建静态 Pod 有两种方式：配置文件和 HTTP 两种方式**

### 配置文件方式

配置文件就是放在特定目录下的标准的 JSON 或 YAML 格式的 pod 定义文件。用`kubelet --pod-manifest-path=`来启动`kubelet`进程，kubelet 定期的去扫描这个目录，根据这个目录下出现或消失的 YAML/JSON 文件来创建或删除静态 pod。

比如我们在 node01 这个节点上用静态 pod 的方式来启动一个 nginx 的服务。我们登录到node01节点上面，可以通过下面命令找到kubelet对应的启动配置文件

```python
$ systemctl status kubelet
kubelet.service - kubelet: The Kubernetes Node Agent
   Loaded: loaded (/usr/lib/systemd/system/kubelet.service; enabled; vendor preset: disabled)
  Drop-In: /usr/lib/systemd/system/kubelet.service.d
           └─10-kubeadm.conf
   Active: active (running) since Tue 2020-03-31 20:08:43 CST; 1 weeks 2 days ago
     Docs: https://kubernetes.io/docs/
 Main PID: 20088 (kubelet)
    Tasks: 17
   Memory: 177.3M
   CGroup: /system.slice/kubelet.service
           └─20088 /usr/bin/kubelet --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --config=...
```

配置文件路径为：

```python
/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
```

```shell
# Note: This dropin only works with kubeadm and kubelet v1.11+
[Service]
Environment="KUBELET_KUBECONFIG_ARGS=--bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf"
Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml"
# This is a file that "kubeadm init" and "kubeadm join" generates at runtime, populating the KUBELET_KUBEADM_ARGS variable dynamically
EnvironmentFile=-/var/lib/kubelet/kubeadm-flags.env
# This is a file that the user can use for overrides of the kubelet args as a last resort. Preferably, the user should use
# the .NodeRegistration.KubeletExtraArgs object in the configuration files instead. KUBELET_EXTRA_ARGS should be sourced from this file.
EnvironmentFile=-/etc/sysconfig/kubelet
ExecStart=
ExecStart=/usr/bin/kubelet $KUBELET_KUBECONFIG_ARGS $KUBELET_CONFIG_ARGS $KUBELET_KUBEADM_ARGS $KUBELET_EXTRA_ARGS
```

打开这个文件我们可以看到其中有一条如下的环境变量配置： ``Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml"``这个文件的内容如下

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
authentication:
  anonymous:
    enabled: false
  webhook:
    cacheTTL: 0s
    enabled: true
  x509:
    clientCAFile: /etc/kubernetes/pki/ca.crt
authorization:
  mode: Webhook
  webhook:
    cacheAuthorizedTTL: 0s
    cacheUnauthorizedTTL: 0s
clusterDNS:
- 10.96.0.10
clusterDomain: cluster.local
cpuManagerReconcilePeriod: 0s
evictionPressureTransitionPeriod: 0s
fileCheckFrequency: 0s
healthzBindAddress: 127.0.0.1
healthzPort: 10248
httpCheckFrequency: 0s
imageMinimumGCAge: 0s
kind: KubeletConfiguration
nodeStatusReportFrequency: 0s
nodeStatusUpdateFrequency: 0s
rotateCertificates: true
runtimeRequestTimeout: 0s
staticPodPath: /etc/kubernetes/manifests
streamingConnectionIdleTimeout: 0s
syncFrequency: 0s
volumeStatsAggPeriod: 0s
```

其中有一项``staticPodPath: /etc/kubernetes/manifests``

所以如果我们通过`kubeadm`的方式来安装的集群环境，对应的`kubelet`已经配置了我们的静态 Pod 文件的路径，那就是`/etc/kubernetes/manifests`，所以我们只需要在该目录下面创建一个标准的 Pod 的 JSON 或者 YAML 文件即可：

如果你的 kubelet 启动参数中没有配置上面的`--pod-manifest-path`参数的话，那么添加上这个参数然后重启 kubelet 即可。

```yaml
$ cat >/etc/kubernetes/manifest/static-web.yaml<<EOF
apiVersion: v1
kind: Pod
metadata:
  name: static-web
  labels:
    app: static
spec:
  containers:
    - name: web
      image: nginx
      ports:
        - name: web
          containerPort: 80
EOF
```



### HTTP方式

kubelet 周期地从`–manifest-url=`参数指定的地址下载文件，并且把它翻译成 JSON/YAML 格式的 pod 定义。此后的操作方式与`–pod-manifest-path=`相同，kubelet 会不时地重新下载该文件，当文件变化时对应地终止或启动静态 pod。







