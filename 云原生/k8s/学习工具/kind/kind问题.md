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















