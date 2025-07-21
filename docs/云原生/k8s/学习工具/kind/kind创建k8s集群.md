# kind创建k8s集群

更多的配置项可查看 [官方文档](https://kind.sigs.k8s.io/docs/user/configuration/)



编辑配置文件

```yaml
cat >> ops-ingress.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ops-ingress 
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
EOF
```





创建集群

```shell
$ kind create cluster --config ops-ingress.yaml
Creating cluster "ops-ingress" ...
 ✓ Ensuring node image (kindest/node:v1.32.2) 🖼
 ✓ Preparing nodes 📦 📦 📦  
 ✓ Writing configuration 📜 
 ✓ Starting control-plane 🕹️ 
 ✓ Installing CNI 🔌 
 ✓ Installing StorageClass 💾 
 ✓ Joining worker nodes 🚜 
Set kubectl context to "kind-ops-ingress"
You can now use your cluster with:

kubectl cluster-info --context kind-ops-ingress

Thanks for using kind! 😊
```



查看集群

```shell
$ kind get clusters
ops-ingress
```

