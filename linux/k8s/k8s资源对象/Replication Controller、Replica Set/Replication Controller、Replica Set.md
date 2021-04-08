[toc]



# Replication Controller、Replica Set



[kubectl命令官方文档](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)

[k8s资源对象对应的api版本](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/)



# 一、Replication Controller

`Replication Controller`简称`RC`，`RC`是`Kubernetes`系统中的核心概念之一，简单来说，`RC`可以保证在任意时间运行`Pod`的副本数量，能够保证`Pod`总是可用的。如果实际`Pod`数量比指定的多那就结束掉多余的，如果实际数量比指定的少就新启动一些`Pod`，当`Pod`失败、被删除或者挂掉后，`RC`都会去自动创建新的`Pod`来保证副本数量，所以即使只有一个`Pod`，我们也应该使用`RC`来管理我们的`Pod`。



[rolling-update自2018.4已经移除](https://github.com/kubernetes/kubernetes/pull/88057)  [已经替换为rollout](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout)



yaml文件

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: rc-demo
  labels:
    name: rc
spec:
  replicas: 3
  selector:
    name: rc
  template:
    metadata:
     labels:
       name: rc
    spec:
     containers:
     - name: nginx-demo
       image: nginx:1.16
       ports:
       - containerPort: 80
```







# 二、Replica Set



yaml文件

```yaml
---
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: rs-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      name: rs
  template:
    metadata:
      labels:
        name: rs
    spec:
      containers:
      - name: rs-demo
        image: nginx:1.16
        ports:
        - containerPort: 80
```



`Replication Set`简称`RS`，随着`Kubernetes`的高速发展，官方已经推荐我们使用`RS`和`Deployment`来代替`RC`了，实际上`RS`和`RC`的功能基本一致，目前唯一的一个区别就是`RC`只支持基于等式的`selector`（env=dev或environment!=qa），但`RS`还支持基于集合的`selector`（version in (v1.0, v2.0)），这对复杂的运维管理就非常方便了。

`kubectl`命令行工具中关于`RC`的大部分命令同样适用于我们的`RS`资源对象。不过我们也很少会去单独使用`RS`，它主要被`Deployment`这个更加高层的资源对象使用，除非用户需要自定义升级功能或根本不需要升级`Pod`，在一般情况下，我们推荐使用`Deployment`而不直接使用`Replica Set`。