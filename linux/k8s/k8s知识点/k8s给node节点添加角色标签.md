[toc]

### k8s给node节点添加角色标签

使用命令 `kubectl get nodes` 查看k8s集群中的node节点时， `ROLES` 处中的 node 节点显示为 `<none>`

```shell
$ kubectl get nodes
NAME        STATUS   ROLES    AGE    VERSION
master1     Ready    master   133m   v1.19.3
k8s-node1   Ready    <none>   128m   v1.19.3
k8s-node2   Ready    <none>   128m   v1.19.3
```



语法

=代表增加标签	-代表删除标签

> **增加标签**
>
> - **kubectl label nodes node主机名 node-role.kubernetes.io/标签名=**
>
> **删除标签**
>
> - **kubectl label nodes node主机名 node-role.kubernetes.io/标签名-**



现在添加一个标签

```shell
kubectl label nodes k8s-node1 node-role.kubernetes.io/node1=
kubectl label nodes k8s-node2 node-role.kubernetes.io/node2=
```



查看

```shell
$ kubectl get nodes
NAME        STATUS   ROLES    AGE    VERSION
k8s-node1   Ready    node1    133m   v1.19.3
k8s-node2   Ready    node2    133m   v1.19.3
master1     Ready    master   138m   v1.19.3
```

