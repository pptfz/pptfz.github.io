# k8s默认命名空间

查看k8s默认命名空间，一共有4个，分别是 `default` 、`kube-node-lease`、`kube-public` 、`kube-system`

```shell
$ kubectl get ns
NAME                 STATUS   AGE
default              Active   24h
kube-node-lease      Active   24h
kube-public          Active   24h
kube-system          Active   24h
```



Kubernetes 默认命名空间有以下几个，每个命名空间中部署的服务也有所不同：

- **default**

  用于用户未指定命名空间的资源。通常用于开发和测试环境。

- **kube-system**

  用于 Kubernetes 内部系统组件，例如：

  - `kube-apiserver`
  - `kube-controller-manager`
  - `kube-scheduler`
  - `etcd`
  - `CoreDNS` 或 `kube-dns`
  - `kube-proxy`

- **kube-public**

  用于公共访问的资源，所有用户都可以读取，通常包含集群信息配置，集群初始化时自动创建。

- **kube-node-lease**

  存储每个节点的租约（Lease），节点租约用于节点心跳管理，提高集群的可伸缩性和性能。

这些命名空间在 Kubernetes 集群启动时自动创建，并用于管理和隔离不同的集群组件和资源。

