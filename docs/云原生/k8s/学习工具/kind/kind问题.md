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

提了个 [issues](https://github.com/kubernetes-sigs/kind/issues/3365) ，老外帮解决的，就是在使用kind创建集群的时候，将配置文件中的 `InitConfiguration`  修改为 `JoinConfiguration` 就可以了，在 [官方文档](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file) 中也有相关配置说明

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



