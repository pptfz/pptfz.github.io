# StatefulSet详解

[官方文档：StatefulSet](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/statefulset/)

StatefulSet 是用来管理**有状态应用**的工作负载 API 对象。它和 Deployment 同样管理一组 Pod，但给每个 Pod 维护一个**有粘性的 ID**：Pod 基于相同规约创建却**不能相互替换**——无论怎么调度、重建多少次，每个 Pod 的序号、主机名、DNS 名字和绑定的存储都保持不变。

适合 StatefulSet 的场景（满足任意一条即可）：

1. **稳定的、唯一的网络标识符**（如 MySQL 主从、Kafka Broker、ZooKeeper 节点间互寻）
2. **稳定的、持久的存储**（每个实例独享一块盘）
3. **有序的、优雅的部署和扩缩**（必须先启动 0 号再启动 1 号）
4. **有序的、自动的滚动更新**（从最大序号开始逐个替换）

:::tip 一句话判断
"稳定的"指的是 Pod 调度或重调度的全过程中 ID 保持持久。如果应用既不需要稳定标识、也不在乎启动顺序，请用 Deployment——无状态才是 K8s 的舒适区。
:::

## 使用限制

- 给定 Pod 的存储必须由 PV 制备器基于 `storageClass` 动态制备，或由管理员预先制备；
- **删除或缩容 StatefulSet 不会删除关联的存储卷**（数据安全优先，清理需手动）；
- StatefulSet 依赖 **Headless Service** 提供网络标识，且这个 Service **需要你自己创建**；
- 删除 StatefulSet 时不保证 Pod 的终止顺序；想要有序体面地终止，先把它**缩容到 0** 再删；
- 默认 `OrderedReady` 策略下滚动更新可能进入需要**人工干预**的损坏状态（见"强制回滚"一节）。

## 组成：三大件

![StatefulSet 的组成](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/sts_structure.png)

一个完整的 StatefulSet 由三部分协作：

| 组件 | 作用 |
| ---- | ---- |
| **Headless Service**（`clusterIP: None`） | 不做负载均衡，专管 DNS：给每个 Pod 一个稳定域名 |
| **StatefulSet** | `.spec.serviceName` 指向上面的 Service，按序号管理 Pod |
| **volumeClaimTemplates** | 卷申领模板——每个 Pod 实例化一份独立 PVC，而不是共享一个卷 |

官方示例（nginx + 独立存储）：

```bash
cat > statefulset.yaml << 'EOF'
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None                # 【Headless Service 标志】不做负载均衡，专管 DNS 域名
  selector:                      # 与 StatefulSet 模板标签一致，给每个 Pod 注册稳定域名
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web                      # Pod 名将由此派生：web-0、web-1、web-2……
spec:
  selector:
    matchLabels:
      app: nginx                 # 必须匹配模板标签；创建后不可修改
  serviceName: "nginx"           # 【STS 特有】指向 Headless Service，决定 Pod 的 DNS 域
                                 # Pod DNS：web-0.nginx.default.svc.cluster.local
  replicas: 3                    # 默认 1；交给 HPA 管理时不要写
  minReadySeconds: 10            # 稳定就绪 10 秒才算可用；滚动更新进度检查也用它
  podManagementPolicy: OrderedReady  # 【STS 特有】默认按序创建 0→1→2（前一个 Ready 才建下一个）、
                                     # 删除严格逆序；改 Parallel 则并行创建/终止不等待（仅无顺序
                                     # 要求时用，会失去全部顺序保证）
  template:
    metadata:
      labels:
        app: nginx
    spec:
      terminationGracePeriodSeconds: 10   # 别设 0！有状态应用需要体面退出的时间
      containers:
      - name: nginx
        image: registry.k8s.io/nginx-slim:0.24
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www              # 对应下面的卷申领模板名
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:          # 【STS 特有·核心】每个 Pod 用此模板实例化一份独立 PVC，
  - metadata:                    # 而不是像 Deployment 那样共享一个卷
      name: www                  # 生成的 PVC 名：www-web-0、www-web-1……与 Pod 一一绑定
    spec:
      accessModes: ["ReadWriteOncePod"]     # 生产环境官方建议；单节点读写可用 ReadWriteOnce
      storageClassName: "my-storage-class"  # 不写则用集群默认 StorageClass；需支持动态制备
      resources:
        requests:
          storage: 1Gi           # 每个 Pod 一块 1Gi 的独立 PV；删除 STS 默认不删这些 PVC
  # ---- 以下也是 STS 特有，示例未启用、以注释说明 ----
  # ordinals:                     # 自定义起始序号（GA v1.31）：Pod 序号变为 start ~ start+replicas-1
  #   start: 1                    # 默认从 0 开始
  # revisionHistoryLimit: 10      # 保留的 ControllerRevision 数（默认 10），供回滚；设 0 = 放弃回滚
  # updateStrategy:
  #   type: RollingUpdate        # 默认从最大序号开始逆序逐个更新（web-2 → web-1 → web-0）
  #   rollingUpdate:
  #     partition: 0             # 只有序号 >= partition 的 Pod 才更新；用于金丝雀/分阶段上线
  #     maxUnavailable: 1        # 更新期间最多几个 Pod 同时不可用（Beta since v1.35，不能为 0）
  # persistentVolumeClaimRetentionPolicy:  # PVC 保留策略（GA since v1.32），默认全 Retain
  #   whenDeleted: Retain        # 删除 STS 时：PVC 保留
  #   whenScaled: Delete         # 缩容掉的 Pod：PVC 一起删除
EOF

kubectl apply -f statefulset.yaml
```

## Pod 的稳定身份

![Pod 的稳定身份](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/sts_identity.png)

每个 StatefulSet Pod 的身份由三样东西构成，**全部与调度到哪个节点无关**：

- **序号**：N 个副本分到 `0` 到 `N-1` 的唯一序号，主机名就是 `web-0`、`web-1`……控制器还会自动打标签 `apps.kubernetes.io/pod-index`（GA v1.32）和 `statefulset.kubernetes.io/pod-name`（可用它给特定 Pod 单独绑 Service）。从 v1.31 起 `.spec.ordinals.start` 可以自定义起始序号（GA）。
- **稳定的网络标识**：Pod DNS = `$(Pod 名).$(serviceName).$(namespace).svc.cluster.local`，例如 `web-0.nginx.default.svc.cluster.local`——其他 Pod 用这个名字访问，永远命中"0 号实例"，即使它刚被重建。
- **稳定的存储**：`volumeClaimTemplates` 为每个 Pod 生成一个 PVC（如 `www-web-0`），Pod 重调度时**重新挂载同一个 PV**。

| 集群域名 | Service | StatefulSet | Pod DNS | Pod 主机名 |
| ---- | ---- | ---- | ---- | ---- |
| cluster.local | default/nginx | default/web | web-0.nginx.default.svc.cluster.local | web-0 |
| cluster.local | foo/nginx | foo/web | web-0.nginx.foo.svc.cluster.local | web-0 |
| kube.local | foo/nginx | foo/web | web-0.nginx.foo.svc.kube.local | web-0 |

:::caution DNS 负缓存
Pod 刚启动时，它的 DNS 记录可能查不到（DNS 负缓存导致）。解决办法：应用直连 API Server 用 watch 机制感知 Pod 变化，而不是依赖 DNS 发现；或在 CoreDNS 的 ConfigMap 里调短缓存时长（默认 30 秒）。
:::

## 有序部署与扩缩

![有序部署与扩缩](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/sts_scaling.png)

默认策略 `OrderedReady` 下的保证：

- N 个副本**按 0 → 1 → 2 顺序创建**：`web-0` 进入 Running 且 Ready 之前，`web-1` 不会开始部署；
- **删除时严格逆序**（2 → 1 → 0）：一个 Pod 终止前，它的所有继任者必须已完全关闭；
- 扩缩之前，**前面所有 Pod 必须 Running 且 Ready**（配了 `minReadySeconds` 还要求稳定可用）；
- 失败会阻塞后续：`web-2` 等待部署期间 `web-0` 挂了，`web-2` 会一直等 `web-0` 恢复。

`.spec.podManagementPolicy` 可以改变这一行为：

| 策略 | 行为 |
| ---- | ---- |
| `OrderedReady`（默认） | 完整的顺序保证，适合大多数有状态应用 |
| `Parallel` | 并行创建/终止所有 Pod，不等待彼此；配合 `maxUnavailable > 1` 更新时可以"并发替换"，加速更新——但不再保证顺序，**不适合严格顺序的应用** |

:::caution 缩容不删数据
把 `replicas` 从 3 缩到 1 时，`web-1`、`web-2` 的 Pod 被删除，但它们的 PVC **原样保留**——再扩回 3 个时，新 `web-2` 会挂回原来的数据。这是设计行为；想连数据一起清理，用 `persistentVolumeClaimRetentionPolicy`（见下文）。
:::

## 滚动更新与金丝雀

![滚动更新与 partition](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/sts_update.png)

`.spec.updateStrategy.type` 三种策略：

| 策略 | 行为 |
| ---- | ---- |
| `RollingUpdate`（默认） | 从**最大序号到最小序号**逐个更新：`web-2` 更新并 Running/Ready 后才动 `web-1`（配 `minReadySeconds` 会额外等待） |
| `OnDelete` | 控制器不自动更新；你手动删除 Pod，重建的那个才是新版本 |
| `Recreate`（v1.37 Alpha） | 先删除全部旧 Pod、等完全终止后再按新模板重建——新旧版本永不同时运行，有停机窗口，适合独占共享资源或磁盘格式不兼容的场景 |

`RollingUpdate` 的两个调节旋钮：

- **`partition`（分区滚动更新）**：只有序号 **>= partition** 的 Pod 会被更新；小于 partition 的 Pod 即使被删除也按**旧版本**重建。`partition` 大于 `replicas` 时模板更新不落地到任何 Pod。典型用法：先设 `partition = replicas - 1` 只让 `web-2` 当金丝雀，验证没问题后逐步调小到 0 完成全量上线。
- **`maxUnavailable`（Beta since v1.35，默认 1，不能为 0）**：允许更新期间最多几个 Pod 同时不可用，支持绝对数或百分比（四舍五入）。

:::caution 强制回滚的大坑
如果更新后的 Pod 因配置错误始终无法 Running/Ready，滚动更新会卡住。此时**仅仅 `rollout undo` 还原模板是不够的**——由于 kubernetes/kubernetes#67250，StatefulSet 会继续等待那个坏 Pod 就绪（永远不会发生）。正确做法：还原模板后，**手动删除坏掉的 Pod**，控制器才会用还原后的模板重建。
:::

## 修订版本历史与回滚

StatefulSet 用 **ControllerRevision** 对象维护模板快照：每次更新 `spec.template` 都会产生一个递增修订号。`.spec.revisionHistoryLimit` 控制保留数量（**默认 10**，超出最早的被垃圾回收）。

```bash
kubectl rollout history statefulset/web              # 查看修订版本历史
kubectl rollout undo statefulset/web --to-revision=3 # 回滚到指定修订版本
kubectl get controllerrevisions -l app=nginx         # 直接列出修订对象
kubectl get controllerrevision/web-3 -o yaml         # 查看某个修订的完整配置
```

:::caution ControllerRevision 使用注意
`revisionHistoryLimit` 建议 5–10；设为 0 等于放弃回滚能力。不要手动编辑 ControllerRevision，也别把它当备份机制——那是备份工具的活。
:::

## PVC 保留策略

![PVC 保留策略](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/sts_pvc_retention.png)

GA since v1.32（默认启用），`.spec.persistentVolumeClaimRetentionPolicy` 从两个维度控制 PVC 的删除，各取 `Retain` 或 `Delete`：

```yaml
spec:
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain   # 删除 StatefulSet 时
    whenScaled: Delete    # 缩容掉 Pod 时
```

- **`Retain`（默认）**：PVC 不受影响，与旧版本行为一致；
- **`Delete`**：对应 PVC 一起删除（控制器给 PVC 加属主引用，由垃圾回收器在 Pod 终止后清理）。

注意：策略只作用于**因删除 StatefulSet 或缩容而移除的 Pod**；节点故障被替换的 Pod 始终保留 PVC。控制器崩溃恢复期间不会删 PVC（等属主引用更新后再删，所以不要在此时强行删 Pod）。

## 排查速查

| 现象 | 排查方向 |
| ---- | ---- |
| 新 Pod 的 DNS 查不到 | DNS 负缓存：改用 API watch 感知，或调低 CoreDNS 缓存（默认 30 秒） |
| 滚动更新卡住不动 | 检查 `minReadySeconds`；若是坏版本卡住，还原模板后**手动删坏 Pod**（见强制回滚） |
| 扩容迟迟不动 | 前序 Pod 是否 Running 且 Ready；`web-0` 的故障会阻塞整条链 |
| 想要体面删除整个 STS | 先 `kubectl scale --replicas=0` 等缩完，再删除（直接删除不保证终止顺序） |
| 缩容后数据不见了 | 检查 `persistentVolumeClaimRetentionPolicy` 是否设了 `Delete` |

## 避坑清单

1. Headless Service **要自己创建**，`serviceName` 指向它
2. 删除/缩容 **不删 PVC**，数据要自己清（或配置保留策略）
3. 不要把 `terminationGracePeriodSeconds` 设为 0（官方强烈阻止，不安全）
4. 有 HPA 管扩缩时**不要写** `.spec.replicas`；手动 scale 后 apply 会覆盖
5. 回滚卡住时只还原模板没用，**必须手动删坏 Pod**
6. `revisionHistoryLimit: 0` 等于放弃回滚
7. 严格顺序敏感的应用不要用 `Parallel` 策略
