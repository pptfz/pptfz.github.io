# k8s常用命令速查

### 强制删除pod

```sh
kubectl delete pod <pod-name> --grace-period=0 --force
```



### 污点

[污点官方文档](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/taint-and-toleration/)

查看所有节点的污点

```sh
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```



查看某个节点的污点

```sh
kubectl describe node <node-name> | grep Taints
```



给某个节点添加污点

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



取消某个节点的污点

:::命令

```sh
kubectl taint nodes <node-name> key:-
```

:::

示例

这将从 `node-1` 节点上移除名为 `key1` 的污点

```sh
kubectl taint nodes node-1 key1:-
```

