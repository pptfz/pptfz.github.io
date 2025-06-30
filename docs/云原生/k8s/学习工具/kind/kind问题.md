# kind问题

## kind部署 `ingress` 之后无法telnet通本机80端口

按照 [文档](https://kind.sigs.k8s.io/docs/user/ingress/) 部署 `ingress` ，以下是官方文档给出的默认配置

```yaml
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```



无法telnet通本机80端口

```sh
$ telnet localhost 80
Trying ::1...
Connected to localhost.
Escape character is '^]'.
Connection closed by foreign host.
```



解决方法

提了个 [issues](https://github.com/kubernetes-sigs/kind/issues/3365) ，老外帮解决的，就是在使用kind创建集群的时候，将配置文件中的 `InitConfiguration`  修改为 `JoinConfiguration` 就可以了，在 [官方文档](https://kind.sigs.k8s.io/docs/user/configuration/#kubeadm-config-patches) 中也有相关配置说明

```yaml
10c10
<     kind: InitConfiguration
---
>     kind: JoinConfiguration
```



## kind使用私有registry问题

kind创建k8s集群后，如果在部署的资源中使用了私有registry，就会遇到pull镜像失败的问题

```shell
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  17s               default-scheduler  Successfully assigned kube-flannel/kube-flannel-ds-5bxxv to ops-ingress-worker2
  Normal   BackOff    17s               kubelet            Back-off pulling image "10.0.16.17:5000/flannel-io/flannel-cni-plugin:v1.6.2-flannel1"
  Warning  Failed     17s               kubelet            Error: ImagePullBackOff
  Normal   Pulling    2s (x2 over 17s)  kubelet            Pulling image "10.0.16.17:5000/flannel-io/flannel-cni-plugin:v1.6.2-flannel1"
  Warning  Failed     2s (x2 over 17s)  kubelet            Failed to pull image "10.0.16.17:5000/flannel-io/flannel-cni-plugin:v1.6.2-flannel1": failed to pull and unpack image "10.0.16.17:5000/flannel-io/flannel-cni-plugin:v1.6.2-flannel1": failed to resolve reference "10.0.16.17:5000/flannel-io/flannel-cni-plugin:v1.6.2-flannel1": failed to do request: Head "https://10.0.16.17:5000/v2/flannel-io/flannel-cni-plugin/manifests/v1.6.2-flannel1": http: server gave HTTP response to HTTPS client
  Warning  Failed     2s (x2 over 17s)  kubelet            Error: ErrImagePull
```



在测试环境下的解决方法是在创建kind集群的时候增加 `containerdConfigPatches` 以下的内容，即跳过安全认证

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ops-ingress 
networking:
  # the default CNI will not be installed
  disableDefaultCNI: true
nodes:
- role: control-plane
- role: worker
- role: worker
  kubeadmConfigPatches:
  - |
    kind: JoinConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
containerdConfigPatches:
  - |-
    [plugins."io.containerd.grpc.v1.cri".registry]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."10.0.16.17:5000"]
          endpoint = ["http://10.0.16.17:5000"]
      [plugins."io.containerd.grpc.v1.cri".registry.configs]
        [plugins."io.containerd.grpc.v1.cri".registry.configs."10.0.16.17:5000".tls]
          insecure_skip_verify = true
```



## 代理问题导致的kind拉取镜像失败

kind创建的k8s集群部署deployment拉取镜像失败

```shell
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  18s               default-scheduler  Successfully assigned ingress-nginx/ingress-nginx-admission-create-jm8fx to ops-ingress-worker2
  Normal   BackOff    18s               kubelet            Back-off pulling image "registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.4.4@sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f"
  Warning  Failed     18s               kubelet            Error: ImagePullBackOff
  Normal   Pulling    5s (x2 over 18s)  kubelet            Pulling image "registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.4.4@sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f"
  Warning  Failed     5s (x2 over 18s)  kubelet            Failed to pull image "registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.4.4@sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f": failed to pull and unpack image "registry.k8s.io/ingress-nginx/kube-webhook-certgen@sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f": failed to resolve reference "registry.k8s.io/ingress-nginx/kube-webhook-certgen@sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f": failed to do request: Head "https://registry.k8s.io/v2/ingress-nginx/kube-webhook-certgen/manifests/sha256:a9f03b34a3cbfbb26d103a14046ab2c5130a80c3d69d526ff8063d2b37b9fd3f": proxyconnect tcp: dial tcp 127.0.0.1:7890: connect: connection refused
  Warning  Failed     5s (x2 over 18s)  kubelet            Error: ErrImagePull
```



看events事件是如下报错

```shell
roxyconnect tcp: dial tcp 127.0.0.1:7890: connect: connection refused
```



原因是在创建kind集群前有相关代理配置，如下

```shell
$ env | grep -i proxy
http_proxy=http://127.0.0.1:7890
all_proxy=socks5://127.0.0.1:7890
GOPROXY=https://goproxy.cn,direct
https_proxy=http://127.0.0.1:7890
```



解决的方法是在创建kind集群前临时取消相关的代理变量配置

```shell
# 取消相关代理变量
$ unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

# 验证
$ env | grep -i proxy                                
all_proxy=socks5://127.0.0.1:7890
GOPROXY=https://goproxy.cn,direct
```

