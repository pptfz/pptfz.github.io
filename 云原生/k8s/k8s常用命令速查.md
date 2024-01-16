# k8s常用命令速查

## 强制删除pod

```sh
kubectl delete pod <pod-name> --grace-period=0 --force
```



## 存储类

设置默认存储类

```sh
kubectl patch storageclass <storage-class-name> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```



## 查看node节点上调度的pod

```sh
kubectl get pods --field-selector spec.nodeName=<Node_Name>
```



## 查看未达到期望副本数的资源

```sh
kubectl get deployments --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,DEPLOYMENT:.metadata.name,DESIRED:.spec.replicas,CURRENT:.status.replicas" --sort-by=.metadata.namespace | awk 'NR>1 && $3 != $4'
```



## 手动设置资源的副本数

```shell
kubectl scale deployment <deployment-name> --replicas=<desired-replica-count> -n <namespace>
```



## 污点

[污点官方文档](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/taint-and-toleration/)

### 查看所有节点的污点

```sh
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```



### 查看某个节点的污点

```sh
kubectl describe node <node-name> | grep Taints
```



### 给某个节点添加污点

:::tip命令

```sh
kubectl taint nodes <node-name> key=value:effect
```

:::

示例

这将在 `node-1` 节点上设置一个名为 `key1`、值为 `value1` 的污点，效果为 `NoSchedule`，即不允许在具有此污点的节点上调度 Pod。

```sh
kubectl taint nodes node-1 key1=value1:NoSchedule
```



### 取消某个节点的污点

:::tip命令

```sh
kubectl taint nodes <node-name> key:-
```

:::

示例

这将从 `node-1` 节点上移除名为 `key1` 的污点

```sh
kubectl taint nodes node-1 key1:-
```



## 标签

[标签官方文档](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)



### 查看所有节点标签

```sh
kubectl get nodes --show-labels
```





### 查看某个节点的标签

:::tip命令

```sh
kubectl get nodes <node-name> --show-labels
```

:::



示例

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```



### 给某个节点添加标签

:::tip命令

```sh
kubectl label nodes <your-node-name> key=value
```

:::



示例

给 `ops-ingress-worker3` 节点添加一个键为 `disktype` 值为 `ssd` 的标签

```sh
kubectl label nodes ops-ingress-worker3 disktype=ssd
```



查看

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,disktype=ssd,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```



### 取消某个节点的标签

:::tip命令

**取消标签只需要指定键，不需要指定值**

```sh
kubectl label nodes <your-node-name> key-
```

:::



示例

取消 `ops-ingress-worker3` 节点添键为 `disktype` 的标签

```shell
kubectl label nodes ops-ingress-worker3 disktype-
```



查看

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```

