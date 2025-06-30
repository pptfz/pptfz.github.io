# OpenEBS

[OpenEBS官网](https://openebs.io/)

[OpenEBS github](https://github.com/openebs/openebs)



## 1.简介

### 1.1 什么是OpenEBS 

OpenEBS 将 Kubernetes 工作节点可用的任何存储转换为本地或分布式 Kubernetes 持久卷。 OpenEBS 帮助应用程序和平台团队轻松部署需要快速、高度持久、可靠和可扩展的 [容器附加存储](https://openebs.io/docs/concepts/cas)  的 Kubernetes 有状态工作负载。

OpenEBS 也是基于 NVMe 的存储部署的首选。

OpenEBS 最初由 [MayaData](https://mayadata.io/) 构建并捐赠给云原生计算基金会，现在是一个 [CNCF 沙箱项目](https://www.cncf.io/sandbox-projects/)。



### 1.2 OpenEBS是做什么的

OpenEBS 管理每个 Kubernetes 节点上可用的存储，并使用该存储为有状态工作负载提供本地或分布式（也称为复制）持久卷。

![iShot_2023-04-12_17.19.46](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2023-04-12_17.19.46.png)





在[本地卷](https://openebs.io/docs/#local-volumes)的情况下

- OpenEBS 可以使用原始块设备或分区，或使用主机路径上的子目录，或使用 LVM、ZFS 或稀疏(sparse)文件来创建持久卷。
- 本地卷直接安装到 Stateful Pod 中，数据路径中没有来自 OpenEBS 的任何额外开销，从而减少了延迟。
- OpenEBS 为本地卷提供了额外的工具，用于监控、备份/恢复、灾难恢复、ZFS 或 LVM 支持的快照、基于容量的调度等。





在[分布式(又名复制)卷](https://openebs.io/docs/#replicated-volumes)的情况下

- OpenEBS 使用其引擎之一（Mayastor、cStor 或 Jiva）为每个分布式持久卷创建微服务。
- Stateful Pod 将数据写入 OpenEBS 引擎，这些引擎将数据同步复制到集群中的多个节点。 OpenEBS 引擎本身部署为 pod，由 Kubernetes 编排。 当运行有状态 pod 的节点发生故障时，该 pod 将被重新调度到集群中的另一个节点，OpenEBS 使用其他节点上的可用数据副本提供对数据的访问。
- Stateful Pod 使用 iSCSI（cStor 和 Jiva）或 NVMeoF（Mayastor）连接到 OpenEBS 分布式持久卷。
- OpenEBS cStor 和 Jiva 专注于存储的易用性和耐用性。 这些引擎分别使用定制版本的 ZFS 和 Longhorn 技术将数据写入存储。
- OpenEBS Mayastor 是最新的引擎，以耐用性和性能为设计目标而开发； OpenEBS Mayastor 有效地管理计算（hugepages、内核）和存储（NVMe 驱动器）以提供快速的分布式块存储。





## 2.安装

### 2.1 添加仓库

```shell
helm repo add openebs https://openebs.github.io/charts
helm repo update
```



### 2.2 下载包

```shell
helm pull openebs/openebs
tar xf openebs-3.5.0.tgz
```



### 2.3 安装

```shell
cd openebs
helm upgrade --install openebs -n storageclass --create-namespace .
```



### 2.4 查看安装

:::tip 说明

1. `openebs-localpv-provisioner`：这是 OpenEBS 的本地持久化卷 Provisioner 组件，它使用 Kubernetes 的 HostPath Volume 插件来提供本地持久化存储功能。当使用者在 Kubernetes 集群中创建一个 PVC（PersistentVolumeClaim）时，这个组件会为其创建一个 HostPath PV（PersistentVolume），从而提供持久化存储。这个组件通常适用于测试和开发环境。
2. `openebs-ndm`：这是 OpenEBS 的 Node Disk Manager（NDM）组件之一，它在每个 Kubernetes 节点上运行，用于发现、管理和分配节点上的块设备。这个组件会监视节点上的块设备，并将其标记为可用或不可用状态。当 OpenEBS 创建 Volume 时，`openebs-ndm` 会查找可用的块设备并将其分配给 Volume。
3. `openebs-ndm-operator`：这是 OpenEBS 的 Node Disk Manager（NDM）操作符，它在 Kubernetes 集群中运行，负责管理节点上的块设备，并与 Kubernetes 节点进行交互。这个组件会监视 Kubernetes 集群中的节点，并确保每个节点上都运行了 `openebs-ndm` 组件。它还负责管理节点上的块设备，并在需要时创建或删除它们。

综上所述，这三个组件都是 OpenEBS 的一部分，用于提供持久化存储和管理节点上的块设备。其中，`openebs-localpv-provisioner` 提供了本地持久化存储功能，`openebs-ndm` 负责管理节点上的块设备，而 `openebs-ndm-operator` 则负责管理 `openebs-ndm` 组件，并确保其在每个节点上都运行。

:::

```shell
$ kubectl get pod
NAME                                               READY   STATUS    RESTARTS   AGE
openebs-localpv-provisioner-5b46fd78cc-99crg       1/1     Running   0          103m
openebs-ndm-47bjp                                  1/1     Running   0          103m
openebs-ndm-operator-579c488d69-6ggjv              1/1     Running   0          103m
```



默认会创建 `openebs-device` 和 `openebs-hostpath` 2个storageclass

:::tip 说明

OpenEBS 安装完成后默认提供了两个 StorageClass，分别是 `openebs-device` 和 `openebs-hostpath`，它们之间的区别如下：

1. `openebs-device` StorageClass：这是一个动态 Provisioning StorageClass，用于在 OpenEBS 中创建块设备。当使用这个 StorageClass 创建 PVC 时，OpenEBS 会自动创建一个块设备并分配给这个 PVC。这个 StorageClass 适用于需要持久化存储的应用程序，例如数据库等。
2. `openebs-hostpath` StorageClass：这也是一个动态 Provisioning StorageClass，但使用的是 Kubernetes HostPath，它将数据存储在本地节点的文件系统上。当使用这个 StorageClass 创建 PVC 时，OpenEBS 会在本地节点上创建一个文件夹，并将其用作数据存储。这个 StorageClass 适用于需要临时性存储的应用程序，例如日志等。

因此，`openebs-device` 适用于需要持久化存储的应用程序，而 `openebs-hostpath` 适用于需要临时性存储的应用程序。这两个 StorageClass 都是动态 Provisioning 的，这意味着当使用者创建一个 PVC 时，OpenEBS 会自动为其创建一个对应的 PV，从而提供持久化存储。

:::

```shell
$ kubectl get sc
NAME                   PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
openebs-device         openebs.io/local                                Delete          WaitForFirstConsumer   false                  103m
openebs-hostpath       openebs.io/local                                Delete          WaitForFirstConsumer   false                  103m
```





默认会生成 `ndm` 、`sparse` 2个目录

```shell
$ tree /var/openebs/
/var/openebs/
├── ndm
└── sparse

2 directories, 0 files
```





## 3.使用示例

### 3.1 mysql数据持久化

#### 3.1.1 添加helm仓库

```shell
helm repo add mysql https://charts.bitnami.com/bitnami
```



#### 3.1.2 下载包

```shell
helm pull mysql/mysql
```



#### 3.1.3 解压缩

```shell
tar xf mysql-9.7.1.tgz
cd mysql
```



#### 3.1.4 编辑 `values.yaml`

指定sc为 `openebs-hostpath`

```yaml
storageClass: "openebs-hostpath"
```



#### 3.1.5 安装

```shell
helm upgrade --install mysql -n testsc --create-namespace .
```



#### 3.1.6 查看pv/pvc

```shell
$ kubectl get pv 
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                              STORAGECLASS       REASON   AGE
pvc-7a5718fd-1a77-419a-bff6-29a3a0b9cc67   8Gi        RWO            Delete           Bound    testsc/data-mysql-0                                openebs-hostpath            12m
```



```shell
$ kubectl get pvc
NAME           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
data-mysql-0   Bound    pvc-7a5718fd-1a77-419a-bff6-29a3a0b9cc67   8Gi        RWO            openebs-hostpath   13m
```



使用 `openebs-hostpath` sc创建的持久化目录

```shell
$ pwd
/var/openebs/local/pvc-7a5718fd-1a77-419a-bff6-29a3a0b9cc67/data

$ ls
auto.cnf       binlog.000003  binlog.index  client-cert.pem    #ib_16384_1.dblwr  ibtmp1        my_database  mysql_upgrade_info  public_key.pem   sys
binlog.000001  binlog.000004  ca-key.pem    client-key.pem     ib_buffer_pool     #innodb_redo  mysql        performance_schema  server-cert.pem  undo_001
binlog.000002  binlog.000005  ca.pem        #ib_16384_0.dblwr  ibdata1            #innodb_temp  mysql.ibd    private_key.pem     server-key.pem   undo_002
```

