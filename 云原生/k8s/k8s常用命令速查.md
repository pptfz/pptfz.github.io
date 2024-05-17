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



## 查看证书过期时间

:::tip 命令

通过查看 `kubeconfig` 文件中 `client-certificate-data` 字段的值可以获取证书过期时间

```shell
echo xxx | base64 --decode | openssl x509 -noout -enddate
```

:::

示例

输出的时间是UTC时间，换成北京时间需要+8

```sh
echo xxx | base64 --decode | openssl x509 -noout -enddate
Warning: Reading certificate from stdin since no -in or -new option is given
notAfter=Nov  1 02:23:23 2024 GMT
```



## 查看node节点上调度的pod

```sh
kubectl get pods --field-selector spec.nodeName=<Node_Name>
```



## 查看未达到期望副本数的资源

```sh
kubectl get deploy --all-namespaces -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,READY:.status.readyReplicas,DESIRED:.spec.replicas --no-headers=true | awk '$3 != $4 '
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

:::tip 命令

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

:::tip 命令

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

:::tip 命令

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

:::tip 命令

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

:::tip 命令

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



## 调度

### 设置节点为不可调度

```shell
kubectl cordon $NODENAME
```



### 恢复节点为可调度

```shell
kubectl uncordon $NODENAME
```



### 清空节点

[清空节点官方文档](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/safely-drain-node/)

:::tip 说明

如果存在 DaemonSet 管理的 Pod，你将需要为 `kubectl` 设置 `--ignore-daemonsets` 以成功地清空节点。 `kubectl drain` 子命令自身实际上不清空节点上的 DaemonSet Pod 集合： DaemonSet 控制器（作为控制平面的一部分）会立即用新的等效 Pod 替换缺少的 Pod。 DaemonSet 控制器还会创建忽略不可调度污点的 Pod，这种污点允许在你正在清空的节点上启动新的 Pod。

:::



:::caution 注意

如果有一些 Pod 使用了 `emptyDir` 卷或本地存储，这些 Pod 默认情况下不会被删除。要强制删除这些 Pod，可以使用 `--delete-emptydir-data` 参数

```shell
$ kubectl drain --ignore-daemonsets 10.246.140.15
node/10.246.140.15 already cordoned
error: unable to drain node "10.246.140.15", aborting command...

There are pending nodes to be drained:
 10.246.140.15
error: cannot delete Pods with local storage (use --delete-emptydir-data to override): istio-system/istio-ingressgateway-6867ddc5fd-ldvfq, redis/drc-ecc-redis-0-0, redis/drc-ecc-redis-1-1, redis/drc-ecc-redis-2-0, redis/drc-local-test-1-1, redis/drc-local-test-2-1, redis/drc-local-test-7-0-1, redis/drc-test1-zone-stage-ten-2-0, redis/drc-uuap-redis-0-0
```

:::

```shell
kubectl drain --ignore-daemonsets $NODENAME
```



执行成功后最后提示如下

```sh
pod/xxx evicted
pod/xxx evicted
node/10.246.140.15 evicted
```

