# LimitRange 与 ResourceQuota：命名空间资源管控

[toc]

## 引言

默认情况下，Kubernetes 里容器**可以申请无限多的 CPU 和内存**——一个 Pod 声明 `limits: 64` 核也不是不行。在多人共用的集群里，这意味着某个忘了写资源限制、或有 bug 吃爆内存的服务，可以拖垮整个集群的所有租户。

Kubernetes 用三层机制解决这个问题，本文按"由小到大"的顺序讲清楚：**Pod 容器级的 requests/limits → LimitRange（命名空间内逐对象兜底）→ ResourceQuota（命名空间总量天花板）**。全文面向从 0 开始学 k8s 的读者，每个概念都配完整可运行的 YAML 和超限报错示例，最后落到一个企业多团队 namespace 管控实战。

> Pod 级 requests/limits 的基本概念（什么是 request、什么是 limit、QoS 三档是怎么分的）在 [Pod 资源请求、限制与 QoS](../pod/Pod资源请求、限制与QoS.md) 里有详细展开，本文默认你了解这两个字段，聚焦命名空间层面的管控。

## 官方文档参考

| 页面名 | 链接 |
| --- | --- |
| 限制范围 LimitRange（中文） | https://kubernetes.io/zh-cn/docs/concepts/policy/limit-range/ |
| 资源配额 ResourceQuota（中文） | https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/ |
| 管理容器的计算资源（中文） | https://kubernetes.io/zh-cn/docs/concepts/configuration/manage-resources-containers/ |
| 资源配额演练（中文） | https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/manage-resources/quota-objects-per-namespace/ |
| 命名空间（中文） | https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/namespaces/ |

:::caution 注意地址差异
ResourceQuota 的官方中文文档地址是复数形式 resource-quotas/（不是 resource-quota/），后者是 404。
:::

## 1. 总览：三层管控各管什么

![多租户三层资源管控](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/three-layer-quota.png)

| 层 | 对象 | 管什么 | 谁来配 |
| --- | --- | --- | --- |
| 第 1 层 | Pod 的 `resources.requests/limits` | 单个容器用多少资源 | 开发者在清单里写 |
| 第 2 层 | LimitRange | 命名空间内**每个**容器/PVC 的默认值与上下限 | 命名空间管理员 |
| 第 3 层 | ResourceQuota | 命名空间**全部对象**的资源总量与对象个数 | 集群管理员 |

三者是递进关系，缺一不可：

- 只有三层中的第 3 层（Quota）没有第 2 层（LimitRange）时——启用了 cpu/memory 配额却忘写 requests 的 Pod 会被直接拒绝创建（官方明确行为），开发体验很差；
- 只有第 2 层没有第 3 层时——每个 Pod 都规矩，但一万个 Pod 加起来照样掏空集群；
- 两层都没有时——回到开头：谁都能申请无限资源。

## 2. LimitRange：给命名空间里的对象"兜底"

LimitRange 是命名空间作用域的策略对象，能做三件事：

1. **给没写 requests/limits 的容器自动注入默认值**（最常用）；
2. **限制单容器/单 Pod/单 PVC 的 min 与 max**，越界直接拒绝创建；
3. 限制单 Pod 内所有容器资源请求之和（`type: Pod`）。

### 2.1 完整示例与逐字段解释

```yaml
# limitrange-dev.yaml —— dev 命名空间的资源兜底策略
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: dev
spec:
  limits:
    # ---- 条目 1：约束类型是 Container，作用于命名空间内每个容器 ----
    - type: Container
      defaultRequest:          # 没写 requests 时自动注入：调度按这个值算
        cpu: 100m              # 0.1 核
        memory: 128Mi
      default:                 # 没写 limits 时自动注入：运行时的天花板
        cpu: 500m              # 0.5 核
        memory: 512Mi
      min:                     # 单容器请求下限：低于它直接拒绝创建
        cpu: 50m
        memory: 64Mi
      max:                     # 单容器上限：超过它直接拒绝创建
        cpu: "2"               # 防止单个 Pod 占满节点
        memory: 4Gi
      # maxLimitRequestRatio:   # 可选：limits 不得超 requests 的 N 倍
      #   cpu: 10
    # ---- 条目 2：约束类型是 PVC，限制单块卷的大小 ----
    - type: PersistentVolumeClaim
      min:
        storage: 1Gi           # 不允许创建太小的卷（浪费元数据）
      max:
        storage: 100Gi         # 不允许一块卷吃掉大半个存储池
```

字段速查（`type: Container` 时）：

| 字段 | 作用 |
| --- | --- |
| `defaultRequest` | 容器未写 `resources.requests` 时注入的默认请求值 |
| `default` | 容器未写 `resources.limits` 时注入的默认限制值 |
| `min` | 容器声明的 requests 不得低于此值 |
| `max` | 容器声明的 limits 不得高于此值（只写 limits 不写 requests 时，requests 也会被自动设为 limit） |
| `maxLimitRequestRatio` | limit / request 的最大倍数，防止"申请 1 核、上限 100 核"的巨型突发 |

### 2.2 自动注入的效果验证

```bash
# 创建一个故意不写 resources 的 Pod
kubectl run no-limit --image=nginx:1.27 -n dev

# 查看实际生效的资源字段
kubectl get pod no-limit -n dev -o jsonpath='{.spec.containers[0].resources}' | jq
# {
#   "limits":   { "cpu": "500m", "memory": "512Mi" },   <- default 注入
#   "requests": { "cpu": "100m", "memory": "128Mi" }    <- defaultRequest 注入
# }
```

注入发生在准入阶段，Pod YAML 里看不到、API 返回里才看得到。这就是"开发者忘写 requests 也能在配额命名空间里正常创建 Pod"的原理——LimitRange 替他补上了。

:::tip 注入不等于豁免 min/max
注意一个细节：如果开发者**显式写了** requests 但低于 `min`，或写了 limits 高于 `max`，Pod 会被直接拒绝并报 `Forbidden: ... minimum cpu usage per Container is ...`。自动注入只发生在"完全没写"的场景。
:::

## 3. ResourceQuota：命名空间的总量天花板

ResourceQuota 同样是命名空间作用域对象，限制的不是单个对象，而是**整个命名空间的总消耗**，分三大类。

### 3.1 三类配额

| 类别 | 典型配额项 | 含义 |
| --- | --- | --- |
| 计算资源 | `requests.cpu`、`requests.memory`、`limits.cpu`、`limits.memory` | 所有非终止状态 Pod 的请求/限制总和 |
| 对象数量 | `pods`、`services`、`configmaps`、`secrets`、`persistentvolumeclaims`、`services.loadbalancers`、`services.nodeports`、`count/deployments.apps` 等 | 该类对象在命名空间里的最大个数 |
| 存储 | `requests.storage`、`<存储类名>.storageclass.storage.k8s.io/requests.storage` | PVC 总容量，可按 StorageClass 分开限额（如 gold 500Gi、bronze 100Gi） |

```yaml
# resourcequota-dev.yaml —— dev 命名空间的总量配额
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    # ---- 计算资源：所有 Pod 的 requests/limits 总和 ----
    requests.cpu: "10"         # 全 ns 最多申请 10 核
    requests.memory: 20Gi
    limits.cpu: "20"           # 上限总量可以比 requests 总量高（允许突发）
    limits.memory: 40Gi
    # ---- 对象数量 ----
    pods: "50"                 # 最多 50 个非终止状态 Pod
    services: "10"
    services.loadbalancers: "2"  # LB 很贵，单独限量
    persistentvolumeclaims: "20"
    # ---- 存储 ----
    requests.storage: 500Gi
    standard.storageclass.storage.k8s.io/requests.storage: 400Gi  # 按 StorageClass 细分
```

:::warning 启用了计算资源配额，Pod 必须写 requests/limits
对 `cpu`/`memory` 这类计算资源启用配额后，命名空间里**每个新 Pod 都必须显式写 requests（或 limits）**，否则配额系统无法记账，创建会被拒绝。这正是上一节 LimitRange 的 `default`/`defaultRequest` 存在的第一理由——两者是一套组合拳：Quota 管总量、LimitRange 替忘写的人补值。
:::

### 3.2 scopes：让配额只管"某一类 Pod"

`scopes` 让配额只作用于匹配范围的 Pod，不同租户可以给不同性质的负载分开记账：

| scope | 匹配的 Pod |
| --- | --- |
| `BestEffort` | QoS 为 BestEffort 的 Pod（没写任何 requests/limits） |
| `NotBestEffort` | QoS 为 Burstable / Guaranteed 的 Pod |
| `Terminating` | 设置了 `spec.activeDeadlineSeconds >= 0` 的 Pod |
| `NotTerminating` | 未设置 activeDeadlineSeconds 的 Pod |
| `PriorityClass` | 引用了指定优先级的 Pod（配合 `scopeSelector`） |
| `CrossNamespacePodAffinity` | 设置了跨命名空间（反）亲和性的 Pod |

```yaml
# 例：对 BestEffort Pod 零容忍——单独一条配额把它们限制为 0 个
apiVersion: v1
kind: ResourceQuota
metadata:
  name: no-besteffort
  namespace: dev
spec:
  hard:
    pods: "0"            # BestEffort 的 Pod 一个都不许有
  scopes:
    - BestEffort         # 本配额只统计 BestEffort 范围
```

### 3.3 超配额时的真实报错

配额是准入控制强制的，超限请求直接被拒，HTTP 状态码 403：

```bash
# 假设 dev-quota 已把 requests.cpu 用满（10 核），再创建一个要 2 核的 Pod
$ kubectl run big-pod --image=nginx:1.27 -n dev \
    --overrides='{"spec":{"containers":[{"name":"nginx","image":"nginx:1.27",
    "resources":{"requests":{"cpu":"2","memory":"1Gi"}}}]}}'
Error from server (Forbidden): pods "big-pod" is forbidden:
exceeded quota: dev-quota, requested: requests.cpu=2,
used: requests.cpu=10, limited: requests.cpu=10
```

报错三要素：**requested（这次要多少）/ used（已用多少）/ limited（上限多少）**，一眼就能看出卡在哪一项。对象数量超限同理：

```bash
$ kubectl create deployment extra --image=nginx:1.27 -n dev
error: failed to create deployment: deployments.apps "extra" is forbidden:
exceeded quota: dev-quota, requested: pods=1,
used: pods=50, limited: pods=50
```

:::caution Deployment 创建成功 ≠ Pod 能跑起来
如果你创建的是一个超配额的 **Deployment**，Deployment 对象本身会创建成功（它只是声明），但其 Pod 会被配额拒绝，ReplicaSet 不断重试并报 `FailedCreate` 事件。排查时别只看 Deployment，要看 `kubectl get events -n dev` 和 ReplicaSet 事件。
:::

### 3.4 kubectl describe namespace：看配额用量

最常用的观察命令是 `kubectl describe namespace`，ResourceQuota 部分会列出每一项的 **Used / Hard** 对照：

```bash
$ kubectl describe namespace dev
Name:         dev
Labels:       pod-security.kubernetes.io/enforce=restricted
Annotations:  <none>
Status:       Active

Resource Quotas
  Name:            dev-quota
  Resource         Used    Hard
  --------         ---     ---
  limits.cpu       1500m   20
  limits.memory    3Gi     40Gi
  pods             6       50
  requests.cpu     900m    10
  requests.memory  1536Mi  20Gi
  requests.storage 80Gi    500Gi

No resource limits.    # 若有 LimitRange 会在这里列出
```

也可以直接看配额对象：`kubectl get resourcequota dev-quota -n dev`（输出同样的 Used/Hard 表格）。

## 4. 实战：企业多团队 namespace 管控

场景：集群有两个团队（team-a、team-b）共用 3 节点集群（每节点 8C16G）。目标：

1. 每个团队一个命名空间，资源总量固定，谁也别超卖；
2. 团队成员忘写资源限制也能正常部署；
3. 禁止无限制的 BestEffort Pod 和巨型单 Pod；
4. 对象数量封顶，防止滥用（比如批量创建 LB 型 Service）。

一次性方案如下（team-a 为例，team-b 改名套用即可）：

```yaml
# team-a-ns.yaml —— 多租户管控模板（team-a）
apiVersion: v1
kind: Namespace
metadata:
  name: team-a
  labels:
    pod-security.kubernetes.io/enforce: baseline   # 顺手上安全基线（见 PSA 那篇）
---
# 第 2 层：LimitRange —— 兜底 + 防巨型 Pod
apiVersion: v1
kind: LimitRange
metadata:
  name: team-a-lr
  namespace: team-a
spec:
  limits:
    - type: Container
      defaultRequest:        # 忘写就用这个，保证配额能记账
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 512Mi
      max:                   # 单容器不超过 2C4G
        cpu: "2"
        memory: 4Gi
      min:
        cpu: 50m
        memory: 64Mi
---
# 第 3 层：ResourceQuota —— 总量封顶
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-rq
  namespace: team-a
spec:
  hard:
    requests.cpu: "6"        # 按 16C 总量的比例切分，留系统余量
    requests.memory: 12Gi
    limits.cpu: "12"
    limits.memory: 24Gi
    pods: "60"
    services: "10"
    services.loadbalancers: "1"   # LB 按申请制分配
    persistentvolumeclaims: "30"
    requests.storage: 500Gi
```

配套的管理约定：

```bash
# 1. 用 RBAC 把团队用户限制在自己的命名空间（RoleBinding 引用内置 edit）
kubectl create rolebinding team-a-dev \
  --clusterrole=edit --user=team-a-lead -n team-a

# 2. 把两个 ResourceQuota 的修改权限只留给平台组，
#    防止团队自己把配额改大（edit 角色本身能改 ResourceQuota，需用 RBAC 收权）
kubectl create rolebinding protect-quota \
  --clusterrole=view --user=team-a-lead -n team-a \
  --dry-run=client -o yaml | kubectl apply -f -
# 生产上建议额外用准入策略限制对 resourcequota 的 update/delete

# 3. 定期巡检用量
kubectl get resourcequota -A
```

:::tip 配额是"先到先得"
官方文档明确：当集群总容量小于各命名空间配额之和时（本例 12C vs 集群 24C，故意超卖），资源竞争遵循**先到先得**。配额保证的是"不超过你那份"，不保证"你那份随时都有货"。容量规划时别把配额总和贴着物理容量配。
:::

## 5. 常见问题排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 创建 Pod 报 `exceeded quota` | 总量或个数超限 | `kubectl describe ns` 看哪项 Used 逼近 Hard，清理或申请扩容 |
| 启用配额后所有 Pod 创建失败，报必须设置 requests | 计算资源配额要求逐 Pod 声明资源 | 配 LimitRange 的 default/defaultRequest，或让开发补写 |
| Pod 状态卡在 Pending | 不是配额问题，是 requests 超过节点可分配资源被调度器拒绝 | `kubectl describe pod` 看 FailedScheduling 原因 |
| Pod 被驱逐 OOMKilled | 配额只管"声明"，运行时超 limits 才是根因 | 调大 limits 或排查内存泄漏 |
| Deployment 建好了但没有 Pod | Pod 被 Quota 拒，RS 反复重试 | `kubectl get events -n <ns>` 看 FailedCreate |
| LimitRange 改严了老 Pod 还在跑 | LimitRange 只在创建/更新时校验 | 滚动重建后新策略生效 |

## 结语

一张表收尾：**Pod 级 requests/limits 管单容器、LimitRange 管命名空间内的每个对象（默认值 + 上下限）、ResourceQuota 管命名空间的总量与对象数**。三者叠起来才是完整的多租户管控：Quota 画大饼、LimitRange 保证饼能分得下去、Pod 级声明决定每口吃多少。落地顺序建议先 LimitRange 后 ResourceQuota（避免配额启用瞬间打挂所有存量无声明负载），再逐步收紧 scopes 与对象数量。

资源申请多少会影响调度和 QoS 等级的判定，深入理解 requests/limits 本身请回到 [Pod 资源请求、限制与 QoS](../pod/Pod资源请求、限制与QoS.md)；本系列安全线的另一半（谁能操作 API）见 [RBAC 与 ServiceAccount](./RBAC与ServiceAccount.md)。
