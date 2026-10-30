# PV、PVC 与 StorageClass 基础

[toc]

本文解决 Kubernetes 存储体系里最核心的一组概念问题：**Volume、PV、PVC、StorageClass 到底是什么关系？静态供给和动态供给有什么区别？accessModes、Reclaim 策略、PVC 的 Pending 状态又该怎么理解和排查？** 这些是每一个在 k8s 上跑有状态应用（MySQL、Redis、ES……）的人都绕不开的地基。

适合谁读：刚接触 k8s 存储、被一堆缩写（PV/PVC/SC/CSI）绕晕的初学者。本文以官方文档为纲，把概念逐个讲透，并配上三个可以直接跑的实战例子（hostPath 静态供给、NFS 动态供给、PVC 扩容）。偏生产级部署的内容（OpenEBS、NFS 搭建）见文末交叉引用的同目录笔记。

## 官方文档参考

| 页面 | 链接 |
| --- | --- |
| 持久卷（PersistentVolume） | https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/ |
| 存储类（StorageClass） | https://kubernetes.io/zh-cn/docs/concepts/storage/storage-classes/ |
| 卷（Volumes，含 CSI 章节） | https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/ |
| 容器存储接口 CSI 介绍（kubernetes-csi 官网） | https://kubernetes-csi.github.io/docs/ |
| CSI GA 公告博客 | https://kubernetes.io/blog/2019/01/15/container-storage-interface-ga/ |

:::caution CSI 独立文档页已下线
早期的中文页面 https://kubernetes.io/zh-cn/docs/concepts/storage/csi/ 已经 404，CSI 的内容被并入了卷（Volumes）文档的 [csi 章节](https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#csi)。CSI 生态（驱动列表、开发规范）的主站点是 https://kubernetes-csi.github.io/docs/ 。
:::

> 相关笔记：同目录的 [nfs共享存储](./nfs共享存储.md) 详细记录了 NFS 服务端搭建与 nfs-subdir-external-provisioner 的完整部署过程；[OpenEBS](./OpenEBS.md) 介绍了云原生本地存储方案。它们偏实战部署，本文补齐基础概念的地基。

## 1. 为什么 emptyDir 和 hostPath 不够

容器默认的文件系统是**临时的**：容器崩溃或重启后，kubelet 会用干净的镜像状态重建容器，运行期间写入的所有文件全部丢失。k8s 用 Volume 解决"容器重启数据丢失"和"多容器共享文件"两个问题，但不同 Volume 类型的"持久"程度差别巨大。

### 1.1 emptyDir：Pod 一死，数据全无

emptyDir 在 Pod 被调度到节点时创建，初始为空，Pod 内所有容器都可以读写。它的生命周期跟 **Pod** 绑定：

- 容器崩溃重启，emptyDir 数据还在（Pod 没死）
- **Pod 被删除（不管是手动删、被 Deployment 重建、还是节点故障驱逐），emptyDir 连同数据一起永久删除**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-emptydir
spec:
  containers:
  - image: nginx
    name: web
    volumeMounts:
    - mountPath: /cache        # emptyDir 挂载到容器的 /cache
      name: cache-volume
  volumes:
  - name: cache-volume
    emptyDir: {}               # 空目录，存储在节点磁盘上
```

### 1.2 hostPath：挂在节点上，Pod 换节点就抓瞎

hostPath 把节点文件系统上的一个目录挂进容器，数据存在**节点本地**。Pod 重建后数据不丢（只要还在同一个节点），但有三个致命问题：

1. **调度绑定节点**：Pod 一旦被调度到别的节点，看到的是新节点上的目录，原来的数据根本不在那里
2. **目录要自己管**：节点上目录不存在时行为取决于 `type` 配置，用不好就是空目录或权限报错
3. **安全风险**：容器可能借 hostPath 读取节点敏感文件，很多安全基线直接禁用它

:::tip emptyDir 和 hostPath 的定位
emptyDir 适合临时暂存（排序缓存、检查点、同 Pod 容器间共享文件），hostPath 适合节点级系统场景（DaemonSet 采集日志、读取节点 /etc）。它们都**不能**承载"Pod 在哪、漂到哪个节点，数据都跟着走"的需求——这正是 PV 出场的地方。
:::

一句话总结：**emptyDir 跟 Pod 一起死，hostPath 跟节点绑死，二者都给不出"数据独立于 Pod 生命周期"的承诺**。

## 2. 四个概念逐个讲清

k8s 存储体系用四个层层递进的抽象解决持久化问题。先用一个类比建立直觉：

| 概念 | 类比 | 一句话定义 |
| --- | --- | --- |
| Volume | 写字楼里的"挂载点" | Pod 级的目录抽象，是其他存储类型挂进容器的载体 |
| PV（PersistentVolume） | 集群里的"仓库" | 真正的存储资源，独立于任何 Pod 的生命周期 |
| PVC（PersistentVolumeClaim） | 租仓库的"合同" | 用户对存储的需求声明：多大、什么访问模式 |
| StorageClass | 仓库中介的"模板" | 描述哪一类存储怎么自动造出来，对接供给者 |

![存储四概念关系与两条供给路径](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pv-pvc-storageclass-flow.png)

### 2.1 Volume：Pod 里的挂载目录

Volume 是最基础的抽象——本质是"一个目录，可能带点数据"，通过 `.spec.volumes` 定义、`.spec.containers[*].volumeMounts` 挂载。k8s 支持几十种 Volume 类型：configMap、secret、emptyDir、hostPath、nfs、csi……**PV 和 PVC 最终也要以 `persistentVolumeClaim` 类型 Volume 的形式挂进容器**。Volume 解决"挂载"问题，但不解决"持久"问题。

### 2.2 PV：集群级别的存储资源

PV（PersistentVolume，持久卷）是集群里一块**实际存在的存储**（NFS 共享目录、云盘、Ceph RBD……），由管理员预先创建或系统动态供给。它是集群资源（和 Node 一样），**不属于任何 namespace**，生命周期独立于 Pod——Pod 删了，PV 还在。

### 2.3 PVC：用户对存储的"申请"

PVC（PersistentVolumeClaim，持久卷声明）是**面向用户的**：使用者不需要关心存储后端是什么，只要声明"我要 5Gi、可读写"（capacity + accessModes），k8s 就会去找一个满足条件的 PV 绑定（Binding）。PVC 属于 namespace，**PVC 和 PV 一对一绑定**。Pod 使用存储时只引用 PVC 名字：

```yaml
# Pod 中通过 PVC 使用存储——用户永远只跟 PVC 打交道
volumes:
- name: data
  persistentVolumeClaim:
    claimName: my-request    # 引用 PVC，不关心背后是 NFS 还是云盘
```

这种"需求与供给分离"的设计，让开发者和运维各管各的：开发者写 PVC，运维管 PV/存储后端。

### 2.4 StorageClass：存储的"品类模板"

StorageClass（存储类）回答的问题是："**当用户申请存储时，去哪里、按什么参数自动造一个 PV？**" 它把"存储类型"抽象成集群里的一个对象，主要字段：

- `provisioner`：供给者，决定用哪个存储后端（如 NFS 用 `kubernetes.io/no-provisioner` 之外的外部 provisioner、云盘用各自 CSI 驱动）
- `parameters`：传给供给者的参数（如磁盘类型、副本数）
- `reclaimPolicy`：绑定的 PV 被释放后怎么处理，`Delete`（默认）或 `Retain`
- `allowVolumeExpansion`：是否允许 PVC 扩容
- `volumeBindingMode`：`Immediate`（创建 PVC 立刻绑定）或 `WaitForFirstConsumer`（等第一个使用它的 Pod 调度后再绑定，避免拓扑不匹配）

用户在 PVC 里写 `storageClassName: xxx` 即可触发自动供给，详见下一节。

## 3. 静态供给 vs 动态供给

### 3.1 静态供给：管理员手工造 PV

流程：集群管理员**预先**创建一批 PV（比如 NFS 里手工划几个目录各建一个 PV），用户创建 PVC 后，控制器在已有 PV 中寻找匹配项（容量 ≥ 请求、accessModes 兼容、storageClassName 一致、selector 匹配），一对一绑定。

痛点很明显：**造多造少全靠猜**。PV 备多了是浪费，备少了 PVC 找不到匹配的 PV 只能一直 Pending；每来一种新需求都要管理员手工干预，无法规模化。

### 3.2 动态供给：StorageClass 自动造 PV

动态供给是生产环境的标准做法：管理员只需**提前创建好 StorageClass**（一次性工作），之后每个 PVC 只要指定 storageClassName，`provisioner`（通常是 CSI 驱动或外部 provisioner）就会监听到新 PVC，自动创建 PV 并绑定。

```yaml
# 一个典型的 StorageClass（NFS 场景示例）
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-client
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"  # 设为默认类，PVC 可不写 storageClassName
provisioner: k8s-sigs.io/nfs-subdir-external-provisioner  # 供给者，由部署的 provisioner 决定
parameters:
  archiveOnDelete: "true"      # 删除 PVC 时归档数据目录而不是直接删掉
reclaimPolicy: Delete          # PV 回收策略：Delete（动态供给默认）
allowVolumeExpansion: true     # 允许 PVC 扩容
volumeBindingMode: Immediate   # 创建 PVC 立即绑定（NFS 无拓扑限制；云盘常用 WaitForFirstConsumer）
```

:::tip 两个关键字段
`reclaimPolicy` 决定"删了 PVC 之后数据怎么办"；`allowVolumeExpansion: true` 是后面 PVC 扩容实战的**前提**，不写这个字段扩容会直接报错。
:::

两种方式对比：

| 维度 | 静态供给 | 动态供给 |
| --- | --- | --- |
| PV 由谁创建 | 管理员手工 | provisioner 按需自动 |
| 容量利用 | 靠预估，易浪费/不足 | 按需生产 |
| 运维成本 | 每种需求都要人管 | 建好 SC 后全自动 |
| 适用场景 | 已有现成存储要接入 | 绝大多数场景，生产首选 |

## 4. PV 详解：accessModes 与 Reclaim 策略

### 4.1 一个完整的 PV 示例

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs-001
spec:
  capacity:
    storage: 5Gi                 # PV 的容量
  volumeMode: Filesystem         # Filesystem（文件系统）或 Block（裸块设备）
  accessModes:
  - ReadWriteOnce                # 访问模式，见下节
  persistentVolumeReclaimPolicy: Retain   # 回收策略，见下节
  storageClassName: nfs-client   # 所属存储类；PVC 需指定同名 class 才能匹配
  nfs:                           # 具体的存储后端配置（这里是 NFS）
    server: 192.168.1.100
    path: /data/nfs/pv001
    readOnly: false
  # hostPath 写法（仅测试用）：
  # hostPath:
  #   path: /data/pv001
  #   type: DirectoryOrCreate
```

### 4.2 accessModes：注意是"节点级"不是"Pod 级"

PV 有三种访问模式，**这是本文最容易理解错的知识点**：

| 模式 | 全称 | 真实含义 |
| --- | --- | --- |
| RWO | ReadWriteOnce | 可被**单个节点**以读写方式挂载 |
| ROX | ReadOnlyMany | 可被**多个节点**以只读方式挂载 |
| RWX | ReadWriteMany | 可被**多个节点**以读写方式挂载 |

:::warning RWO 限制的是节点，不是 Pod
ReadWriteOnce 的 "Once" 指的是**单个节点**，不是单个 Pod。同一个节点上的多个 Pod 可以同时挂载同一个 RWO 卷（因为对存储后端来说它们是同一个挂载客户端）。反过来说，两个 Pod 如果被调度到**不同节点**，就不能同时挂同一个 RWO 卷——这是很多"数据库第二个副本起不来"问题的根源。另外，accessModes 只是"意向声明"，k8s 不做运行时强制，真正能不能多挂取决于存储后端的能力：NFS 天然支持 RWX，云盘通常只支持 RWO。
:::

### 4.3 Reclaim 策略：PVC 删除后 PV 去哪

当 PVC 被删除、与之绑定的 PV 被释放（Released）后，PV 的归宿由 `persistentVolumeReclaimPolicy` 决定：

| 策略 | 行为 | 说明 |
| --- | --- | --- |
| Retain | 保留 | PV 进入 Released 状态，数据和对象都在，需管理员手工确认后清理再复用，**生产推荐** |
| Delete | 删除 | 联动删除存储后端上的数据（动态供给的默认值），PVC 删了云盘/目录就真没了 |
| Recycle | 回收 | 执行 `rm -rf /thevolume/*` 后重新变为 Available，**已被废弃并在新版本中移除**，仅老集群可能见到 |

:::caution Delete 策略请谨慎
用动态供给 + Delete 策略时，误删 PVC 等于误删生产数据（nfs-subdir-external-provisioner 提供 `archiveOnDelete: "true"` 参数，删除时改为归档目录，算是给 NFS 场景兜底）。重要数据建议用 Retain，或者给 PVC 配置保护机制。
:::

## 5. PVC 详解与 phases 排查

### 5.1 PVC 示例与绑定条件

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-request
  namespace: default
spec:
  accessModes:
  - ReadWriteOnce              # 希望的访问模式
  resources:
    requests:
      storage: 5Gi             # 希望的容量
  storageClassName: nfs-client # 指定 StorageClass；不写则用默认类，写 "" 则只匹配无类的 PV
  # selector:                  # 可选：用 label 进一步筛选 PV
  #   matchLabels:
  #     release: stable
```

绑定成功的前提：PV 的容量 ≥ 请求、accessModes 兼容、storageClassName 一致、selector 匹配，且 PV 处于 Available 状态。

### 5.2 PVC 的三个 phase

用 `kubectl get pvc` 能看到 STATUS 列，对应 PVC 的三种 phase：

| Phase | 含义 |
| --- | --- |
| Pending | 还没绑定到 PV，等待中 |
| Bound | 已绑定到某个 PV，可用 |
| Lost | 绑定丢失（极少见，如绑定关系被手工破坏） |

### 5.3 Pending 排查三板斧

PVC 卡在 Pending 是新手最常撞见的问题。排查路径：

```bash
# 第一步：看事件，90% 的原因事件里直接说了
kubectl describe pvc my-request

# 第二步：确认集群里的 PV 情况
kubectl get pv

# 第三步：确认 StorageClass 是否存在、是否为默认
kubectl get sc
```

`describe pvc` 的 Events 里最常见的几条消息与对策：

| 事件消息 | 原因 | 对策 |
| --- | --- | --- |
| no persistent volumes available for this claim | 静态供给模式下没有匹配的 PV | 核对容量/accessModes/storageClassName 是否都匹配 |
| waiting for a volume to be created, either by external provisioner or manually | 动态供给没动作 | 检查 SC 的 provisioner 是否已部署、PVC 里 storageClassName 拼写是否正确 |
| storageclass.storage.k8s.io "xxx" not found | PVC 指定的 SC 不存在 | 创建 SC 或修正名字 |
| pod 挂载时 Timeout / FailedMount | PV 已 Bound 但后端存储连不上 | 检查 NFS server 可达性、export 权限、云盘 attach 状态 |

## 6. 实战一：hostPath 静态供给（单机测试）

:::caution 仅用于单节点测试环境
hostPath 把数据绑在单个节点上，且没有真正的"供给"能力，这里用它演示静态供给的完整流程最直观，**不要用于生产**。
:::

完整流程四步：建 PV → 建 PVC → 确认 Bound → Pod 挂载使用。

```yaml
# 01-pv.yaml：管理员手工创建 PV
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-hostpath-demo
  labels:                     # 给 PV 打标签，方便 PVC 用 selector 圈定
    type: local
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain   # 释放后保留，观察状态变化
  storageClassName: manual                # 自定义类名（没有 provisioner，纯匹配用）
  hostPath:
    path: /data/pv-demo
    type: DirectoryOrCreate    # 目录不存在就自动创建
```

```yaml
# 02-pvc.yaml：用户创建 PVC 申请存储
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-hostpath-demo
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi             # 与 PV 容量一致，确保匹配
  storageClassName: manual     # 必须与 PV 的 storageClassName 相同
  selector:
    matchLabels:
      type: local              # 通过 label 匹配上面打的标签
```

```yaml
# 03-pod.yaml：Pod 通过 PVC 使用存储
apiVersion: v1
kind: Pod
metadata:
  name: pod-use-pvc
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "echo hello-$(date) >> /data/log.txt && sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data         # 卷挂载到容器 /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-hostpath-demo   # 只引用 PVC 名字
```

```bash
# 依次创建并验证
kubectl apply -f 01-pv.yaml -f 02-pvc.yaml
kubectl get pv pvc-hostpath-demo   # 或 kubectl get pv，观察 STATUS 从 Available -> Bound
kubectl get pvc pvc-hostpath-demo  # STATUS 应为 Bound

kubectl apply -f 03-pod.yaml
kubectl exec pod-use-pvc -- cat /data/log.txt   # 数据写入成功

# 观察 Retain 策略的效果：删 PVC 后 PV 不消失
kubectl delete pvc pvc-hostpath-demo
kubectl get pv pv-hostpath-demo    # STATUS 变为 Released，数据仍在节点 /data/pv-demo
# 此时 PV 不可被新 PVC 复用，需手工删除 PV 并清理节点目录后重建
kubectl delete pv pv-hostpath-demo
```

## 7. 实战二：NFS 动态供给（nfs-subdir-external-provisioner）

这是国内自建集群（无云盘 CSI）最常见的动态供给方案：用 NFS 做后端，部署 nfs-subdir-external-provisioner，实现"创建 PVC 自动出 PV"。

前提：已有一台 NFS 服务端（搭建过程见 [nfs共享存储](./nfs共享存储.md) 第 1 节），所有节点能访问 `192.168.1.100:/data/nfs`。

```bash
# 添加 helm 仓库并部署 provisioner（NFS_SERVER/NFS_PATH 按实际环境修改）
helm repo add nfs-subdir-external-provisioner \
  https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm install nfs-provisioner \
  nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  --namespace nfs-provisioner --create-namespace \
  --set nfs.server=192.168.1.100 \
  --set nfs.path=/data/nfs \
  --set storageClass.name=nfs-client \
  --set storageClass.archiveOnDelete=true
```

:::tip 部署方式说明
上面用 helm 一条命令同时完成了三件事：部署 provisioner（Deployment + RBAC）、创建 StorageClass（nfs-client）。如果拉不动 GitHub 镜像，可用国内镜像源或直接 apply 官方 deploy 目录下的 YAML（把其中的镜像地址换成国内仓库代理），完整步骤见 [nfs共享存储](./nfs共享存储.md)。生产环境更推荐的云原生方案见 [OpenEBS](./OpenEBS.md)。
:::

部署完成后验证全链路：

```yaml
# 04-pvc-dynamic.yaml：指定 storageClassName 触发动态供给
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-nfs-dynamic
spec:
  accessModes:
  - ReadWriteMany              # NFS 支持多节点读写挂载
  resources:
    requests:
      storage: 2Gi
  storageClassName: nfs-client # 指向 provisioner 对应的 SC
```

```bash
kubectl apply -f 04-pvc-dynamic.yaml
kubectl get pvc pvc-nfs-dynamic
# STATUS 很快变为 Bound；再看 PV，是 provisioner 自动创建的：
kubectl get pv
# NAME                                       CAPACITY   CLAIM                     REASON   CLASS        STATUS
# pvc-3f8a...-dynamic                        2Gi        default/pvc-nfs-dynamic            nfs-client   Bound

# 到 NFS 服务端确认，目录已自动创建（命名规则：<namespace>-<pvc名>-<pv名>）
# /data/nfs/default-pvc-nfs-dynamic-pvc-3f8a.../

# 删除 PVC 再观察：archiveOnDelete=true 时目录被归档为 archived-xxx 而非删除
kubectl delete pvc pvc-nfs-dynamic
```

## 8. 实战三：PVC 扩容

在线扩容数据卷是动态供给的核心红利之一。前提条件：

1. StorageClass 设置了 `allowVolumeExpansion: true`（第 7 节的 SC 没显式关闭，部署时默认开启；没有就 `kubectl edit sc nfs-client` 加上）
2. 存储后端支持扩容（NFS provisioner 支持；部分老版本后端不支持）

```bash
# 直接修改 PVC 的请求容量（只能调大，不能调小）
kubectl patch pvc pvc-nfs-dynamic -p '{"spec":{"resources":{"requests":{"storage":"5Gi"}}}}'

# 观察扩容过程
kubectl get pvc pvc-nfs-dynamic -w
# CONDITIONS 里会经历 Resizing -> FileSystemResizePending -> Bound
```

:::warning 扩容的两阶段与缩容限制
扩容分两步：先扩后端存储（Resizing），再扩文件系统（FileSystemResizePending，Pod 重新挂载时完成；如果该 PVC 当前没有被 Pod 使用，重启一个使用它的 Pod 即可触发）。**PVC 只能扩大不能缩小**——想从 5Gi 改回 2Gi 会被直接拒绝，这是为了保护数据。扩容前建议备份，操作窗口避开业务高峰。
:::

## 9. 卷快照与 CSI：延伸阅读

本文提到的供给者（provisioner）绝大多数是 CSI 驱动。CSI（Container Storage Interface）是 k8s 与存储后端之间的标准插件接口，让存储厂商独立于 k8s 主代码开发驱动——NFS、Ceph、各云厂商云盘的现代支持方式都是 CSI。CSI 还带来两个进阶能力：

- **卷快照（VolumeSnapshot）**：对 PVC 做时间点备份、从快照恢复新卷（需要集群部署 snapshot CRD 与 snapshot-controller）
- **CSI 临时卷**：在 Pod spec 里直接内联 CSI 卷，无需 PVC

自建集群想更进一步做本地/分布式存储，建议阅读同目录的 [OpenEBS](./OpenEBS.md)；需要多节点读写共享存储的完整落地，见 [nfs共享存储](./nfs共享存储.md)。
