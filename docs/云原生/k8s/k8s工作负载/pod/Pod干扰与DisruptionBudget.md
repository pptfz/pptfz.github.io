# Pod 干扰与 DisruptionBudget

## 引言

节点要升级内核、集群要缩容、误删了 Deployment——这些操作都会让 Pod 被动消失。有些消失是意外（硬件故障、内核崩溃），有些是"计划内"的（管理员主动腾空节点）。Kubernetes 把前者叫**非自愿干扰**，后者叫**自愿干扰**，并为后者提供了一套保护机制：**Pod 干扰预算（PodDisruptionBudget，PDB）**。它是"节点安全下线"与"应用高可用"之间的契约：管理员可以继续做维护，但同一时刻被主动驱逐的副本数不能超过应用声明能容忍的范围。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| 干扰（Disruptions）概念页 | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/disruptions/ |
| 配置 Pod 干扰预算（任务） | https://kubernetes.io/zh-cn/docs/tasks/run-application/configure-pdb/ |
| 安全腾空节点（任务） | https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/safely-drain-node/ |

## 1. 两类干扰

**非自愿干扰（Involuntary Disruptions）**——不可避免的情况，PDB 管不了它们：

- 节点下层物理机硬件故障、内核错误
- 云厂商或虚拟机管理程序故障导致虚拟机消失
- 节点因网络隔离从集群中消失
- 节点资源不足导致 Pod 被驱逐（节点压力驱逐）
- 集群管理员误删虚拟机

**自愿干扰（Voluntary Disruptions）**——由人或自动化工具主动发起，PDB 只保护这一类：

- 应用所有者：删除 Deployment 等控制器、更新 Pod 模板触发重建、直接删除 Pod
- 集群管理员：`kubectl drain` 腾空节点修复/升级、缩容集群时下线节点、给其他 Pod 腾资源

:::caution 并非所有自愿干扰都受 PDB 约束
删除 Deployment 或直接删除 Pod 的操作会**跳过** PDB 检查。PDB 只约束走 Eviction API 的驱逐（`kubectl drain` 就走这条路）。想靠 PDB 防手滑 `kubectl delete pod`，是防不住的。
:::

## 2. PDB 的定位：限制的是"速率"不是"结果"

PDB 无法阻止自愿干扰发生，它限制的是**同一时刻自愿驱逐的数量**。例如 `replicas: 5` 的 Deployment 配了允许 4 个可用的 PDB，那么 Eviction API 在任意时刻最多只放行 1 个 Pod 被驱逐——剩下的驱逐请求会被拒绝，`kubectl drain` 会周期性重试直到超时或条件满足。

PDB 与其他机制的关系（容易混淆的三件事）：

| 机制 | 作用范围 |
| --- | --- |
| PDB | 只管**自愿干扰**（Eviction API 驱逐） |
| 滚动升级删除的 Pod | **计入** PDB 预算，但 Deployment/StatefulSet 滚动升级本身**不受** PDB 限制，升级期间的可用性由各自的 `strategy` 配置管 |
| 非自愿干扰 | 不受 PDB 限制，但会**占用**预算（可用副本变少，后续驱逐更难放行） |

## 3. 配置 PDB

PDB 通过标签选择器圈定一组 Pod（与 Deployment 选 Pod 的逻辑一致），"预期副本数"从管理这些 Pod 的工作负载资源的 `.spec.replicas` 读取（控制平面通过 `metadata.ownerReferences` 找到关联的控制器）。

```bash
cat > pdb-demo.yaml <<'EOF'
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  # minAvailable 与 maxUnavailable 二选一
  # minAvailable：最少要有几个可用副本（绝对数或百分比）
  minAvailable: 2
  # maxUnavailable：最多允许几个不可用（绝对数或百分比），v1.21 起可用
  # maxUnavailable: 1
  # 【关键】selector 圈定受保护的 Pod 集合，写法与 Deployment selector 一致
  selector:
    matchLabels:
      app: web
  # 【v1.27+】不健康 Pod 驱逐策略：
  #   IfHealthyBudget（默认）：不健康的 Pod 不计入预算，驱逐会等它恢复——
  #     应用持续不健康时可能卡住 drain
  #   AlwaysAllow：无论健康与否都放行驱逐，保证节点腾空不被"僵尸应用"卡死
  unhealthyPodEvictionPolicy: AlwaysAllow
EOF
kubectl apply -f pdb-demo.yaml
```

| 配置方式 | 示例 | 语义 |
| --- | --- | --- |
| `minAvailable: 2` | 5 副本 | 任意时刻至少 2 个可用，最多放行 3 个同时驱逐 |
| `minAvailable: 50%` | 5 副本 | 至少 2.5 → **向上取整为 3** 个可用 |
| `maxUnavailable: 1` | 5 副本 | 最多 1 个不可用 |

:::tip 用百分比时 minAvailable 向上取整、maxUnavailable 向下取整
这与 Deployment 的 maxSurge/maxUnavailable 取整规则同方向：保证保护方向永远偏保守。
:::

## 4. Eviction API 与 kubectl drain

集群管理员执行干扰性操作时，正确姿势是调用 **Eviction API**（`kubectl drain` 内部就是它），而不是直接删 Pod：

```bash
# drain = cordon（标记不可调度）+ 逐个驱逐节点上的 Pod
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data
```

驱逐被拒绝时（超出 PDB 预算），drain 会周期性重试失败的请求，直到节点上所有 Pod 都被终止或达到超时。被驱逐的 Pod 会体面终止，遵循 PodSpec 的 `terminationGracePeriodSeconds`。

一个典型时间线（3 节点集群、3 副本应用、PDB 要求 minAvailable: 2）：

1. `drain node-1` 驱逐 pod-a，Deployment 立即创建替代 Pod pod-d
2. pod-d 未就绪前，可用副本只剩 2，此时 `drain node-2` 只能驱逐 1 个 Pod，第二个驱逐请求被拒绝
3. 如果 pod-d 因资源不足调度不上去，drain 就会一直阻塞——管理员需要扩容节点才能继续

这个例子说明 PDB 实际上把"中断发生的速率"交给了以下因素共同决定：应用副本数、优雅关闭耗时、新实例启动耗时、控制器类型、集群资源余量。

## 5. Pod 干扰状况 DisruptionTarget

**特性状态：** 自 v1.31 起稳定（特性门控已移除）

Pod 因干扰被删除时，会被添加 `DisruptionTarget` 状况，其 `reason` 字段给出终止原因：

| reason | 含义 |
| --- | --- |
| `PreemptionByScheduler` | 被调度器抢占（让位给更高优先级的 Pod） |
| `DeletionByTaintManager` | 不能容忍 `NoExecute` 污点，被节点生命周期控制器删除 |
| `EvictionByEvictionAPI` | 通过 Eviction API 驱逐 |
| `DeletionByPodGC` | 绑定的节点已不存在，被 Pod 垃圾收集删除 |
| `TerminationByKubelet` | 节点压力驱逐、节点体面关闭、系统关键 Pod 抢占 |

:::info DisruptionTarget 不一定意味着 Pod 真的会被删
干扰可能被中断，控制平面可能重试但不保证成功；这种情况下一段时间后该状况会被清除。其他中断场景（如超出容器资源限制被杀）**不会**添加此状况，因为那类失败源于 Pod 自身、重试还会复发。

用 Job/CronJob 时，可以把 `DisruptionTarget` 纳入 Pod 失效策略（podFailurePolicy）的判断条件，让被干扰的任务 Pod 不计入 backoffLimit。
:::

## 6. 我的总结与避坑清单

1. **PDB 防不了 `kubectl delete pod` 和删控制器**——它只约束 Eviction API 路径的驱逐，手滑删除是另一个层面的事故
2. **给每个关键多副本应用都配 PDB**，哪怕就一行 `maxUnavailable: 1`；没有它，`kubectl drain` 可能同时清空一个应用的所有副本
3. **StatefulSet 场景注意**：替代 Pod（如 pod-0）必须等旧 Pod 完全终止后才会创建，腾空节奏天然更慢，PDB 要留出余量
4. **应用持续不健康会卡死 drain**：默认的不健康 Pod 驱逐策略会一直等它恢复；确定想强推维护时用 `unhealthyPodEvictionPolicy: AlwaysAllow`
5. **百分比取整方向要记牢**：minAvailable 向上取整、maxUnavailable 向下取整，都是保守方向
6. **滚动升级与 PDB 互不干涉**：升级删 Pod 计入预算但不被 PDB 拦截，可用性由 Deployment 的 strategy 保证，别指望 PDB 兼管滚动发布
7. **非自愿干扰会"吃掉"预算**：节点宕机导致副本减少后，剩余的驱逐窗口也会收紧，这符合直觉但要提前做好容量规划
