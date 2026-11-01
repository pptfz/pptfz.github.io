# Deployment详解

[官方文档：Deployment](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/)

Deployment 的定位是**为 Pod 和 ReplicaSet 提供声明式更新能力**：你只描述期望状态（用什么镜像、几个副本、什么更新策略），Deployment 控制器就会以受控的速率把集群的实际状态变更为期望状态。它不直接管 Pod，而是管理一排 ReplicaSet——每个版本对应一个 RS，版本的创建、切换、保留、回滚全部由它编排。

:::tip 一句话定位
实际生产中 Deployment 是无状态负载的**标准入口**：上线、滚动更新、回滚、扩缩容、金丝雀发布都从它走。它底下的 ReplicaSet 负责维持单个版本的副本数，Deployment 负责在多个版本之间做编排——两层分工的详细解释见 RS 笔记中的"与 Deployment 的关系"一节。
:::

## 工作原理

![Deployment 工作原理](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/deploy_principle.png)

Deployment 控制器运行在 kube-controller-manager 中，是一个标准的控制循环：

1. **watch 期望状态**：监视 `.spec.template`、`.spec.replicas`、`.spec.strategy` 等字段；
2. **对比实际状态**：读取各 ReplicaSet 的运行情况和 `.status.conditions`；
3. **执行动作**：Pod 模板变化时创建**全新的 RS**并按策略逐步扩新缩旧；扩缩容时直接调整 RS 副本数；同时把结果写回 `.status`。

几个由控制器自动维护的关键机制：

- **RS 命名规则**：`[Deployment 名称]-[pod-template-hash]`，例如 `nginx-deployment-66b6c48dd5`。这个哈希由控制器对 Pod 模板内容计算得出，保证每次模板变更生成的 RS 名字不重复。
- **pod-template-hash 标签**：控制器给每个 RS 自动打上这个标签，确保不同版本的 RS 互不重叠。**不要修改这个标签**。
- **只读的 RS**：不要手动创建、修改或删除 Deployment 拥有的 RS——手改模板会被下一次对账覆盖，手删 RS 会破坏回滚链。

## 创建 Deployment

```bash
cat > nginx-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3                    # 期望副本数，默认 1；交给 HPA 管理时不要写（会打架）
  selector:                      # 【创建后不可修改】必须匹配模板标签；也不要与其他控制器的
    matchLabels:                 # selector 重叠，否则多个控制器抢同一批 Pod
      app: nginx
  template:                      # 【只有改动这里才触发滚动更新/产生新修订版本】
    metadata:                    # 扩缩容、改副本数都不算"上线"
      labels:
        app: nginx
    spec:
      terminationGracePeriodSeconds: 30   # Pod 层通用字段：体面退出的宽限期（默认 30s）
      containers:
      - name: nginx
        image: nginx:1.14.2      # 改镜像版本 → 创建全新 RS，旧 RS 原样保留作回滚快照
        ports:
        - containerPort: 80
  # paused: false                # 置 true 暂停上线：暂停期间的模板修改不触发滚动更新，
  #                              # 恢复后一次性生效；注意暂停状态不可回滚
  # ---- 以下为 Deployment 特有字段（最小示例不含也能跑，这里补充说明默认值）----
  minReadySeconds: 10            # 新 Pod 稳定就绪多久才算"可用"，防"刚 Ready 就崩"的抖动（默认 0）
  progressDeadlineSeconds: 600   # 超过此秒数无进展判定上线失败（默认 600，必须 > minReadySeconds）
  revisionHistoryLimit: 10       # 保留多少个旧 RS 供回滚（默认 10；设 0 等于放弃回滚）
  strategy:                      # 更新策略；type 另一选项 Recreate 会先杀光旧 Pod 再建，有停机窗口
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%              # 允许超出的 Pod 上限，百分比向上取整：3 副本时总数最多瞬时 4 个
      maxUnavailable: 25%        # 允许不可用的 Pod 上限，百分比向下取整：全程可用 Pod 不少于 3 个
                                 # 两者也可写绝对数（如 1）；不能同时为 0
EOF

kubectl apply -f nginx-deployment.yaml
```

查看创建结果：

```bash
kubectl get deployments
# NAME               READY   UP-TO-DATE   AVAILABLE   AGE
# nginx-deployment   3/3     3            3           15s
```

各字段含义：

| 字段 | 含义 |
| ---- | ---- |
| `READY` | 就绪副本数 / 期望副本数 |
| `UP-TO-DATE` | 已更新到最新模板的副本数 |
| `AVAILABLE` | 当前可供使用的副本数 |
| `AGE` | 运行时长 |

观察它创建出的 RS 和 Pod：

```bash
kubectl get rs
# NAME                          DESIRED   CURRENT   READY   AGE
# nginx-deployment-66b6c48dd5   3         3         3       20s

kubectl get pods --show-labels
kubectl rollout status deployment/nginx-deployment   # 等待上线完成
```

:::caution 选择算符不要与其他控制器重叠
selector 和 Pod 标签不要与其他 Deployment、StatefulSet 等控制器的选择算符重叠——多个控制器抢同一批 Pod 会互相删对方的孩子，产生难以预料的后果。
:::

## 滚动更新过程

只有 **Pod 模板（`.spec.template`）变化**才会触发上线（rollout）；单纯扩缩容、改标签外的字段不会。

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1
# 或 kubectl edit deployment/nginx-deployment

kubectl rollout status deployment/nginx-deployment
```

![滚动更新过程](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/deploy_rolling.png)

默认策略是 `RollingUpdate`，由两个参数控制节奏（都支持绝对数或百分比）：

| 参数 | 默认值 | 含义 | 取整规则 |
| ---- | ------ | ---- | -------- |
| `maxUnavailable` | 25% | 更新期间允许**不可用**的 Pod 上限 | 百分比**向下**取整 |
| `maxSurge` | 25% | 允许**超出**期望数的 Pod 上限 | 百分比**向上**取整 |

3 副本 + 默认 25% 意味着：整个更新过程中**可用 Pod 始终不少于 3 个**（服务无感），**总 Pod 数最多瞬时到 4 个**（多消耗一点资源）。想要更快的更新节奏可以显式配置：

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 1
```

两个细节值得知道：

- **翻转（rollover）**：上一轮更新还没完成时又发起新更新，控制器不会等待——它会立即为最新版本再建一个 RS 开始扩容，刚才还在扩的那个 RS 被归入"旧"列表开始缩容。连续多次 `set image` 不会排队，永远以最新期望为准。
- **终止中的 Pod 也占资源**：K8s 计算 `availableReplicas` 时不考虑正在终止的 Pod，上线期间实际资源消耗可能短暂超过 `replicas + maxSurge`（直到 `terminationGracePeriodSeconds` 到期）。

:::caution Recreate 策略慎用
`strategy.type: Recreate` 会**先杀死全部旧 Pod 再创建新 Pod**，更新期间服务完全中断。只有能接受停机窗口的场景才用它；需要"最多 n 个不可用"的强保证时应考虑 StatefulSet。
:::

## 修改 selector 的限制

`.spec.selector` **创建后不可变**——`kubectl patch`、`edit`、`apply`、`helm upgrade` 都改不了。确需修改只能删除重建（默认会连 Pod 一起删；要保留 Pod 用 `kubectl delete --cascade=orphan`）。分两种情况：

- **收紧选择算符**（新增匹配条件）：必须同步修改 Pod 模板标签使其继续匹配，否则 API 直接拒绝；旧 RS 会被孤立（脱离 Deployment 管理），并创建全新的 RS。
- **放宽选择算符**（移除条件）：属于覆盖性变更，不需要改模板标签，旧 RS 不会被孤立、也不会创建新 RS，但已移除的标签仍留在现有 Pod/RS 上，需要一次滚动更新清理干净。

## 回滚

默认保留所有上线历史。注意：只有 Pod 模板变化才产生新修订版本（revision），扩缩容不算。

```bash
kubectl rollout history deployment/nginx-deployment          # 查看全部修订版本
kubectl rollout history deployment/nginx-deployment --revision=2   # 查看某版本详情

kubectl rollout undo deployment/nginx-deployment             # 回滚到上一版
kubectl rollout undo deployment/nginx-deployment --to-revision=2   # 回滚到指定版本
```

`CHANGE-CAUSE` 列显示的是 `kubernetes.io/change-cause` 注解的内容，建议每次上线前标注清楚（旧的 `--record` 标志已废弃，不要再用）：

```bash
kubectl annotate deployment/nginx-deployment \
  kubernetes.io/change-cause="nginx:1.16.1 修复缓存穿透"
```

一个典型的失败上线：镜像 tag 拼写错误（如 `nginx:1.161`），新 Pod 一直 `ImagePullBackOff`，控制器会**自动停止**有问题的上线——不再对新 RS 扩容（缩到 `maxUnavailable` 允许的程度就停），旧 RS 的 Pod 继续提供服务。此时 `rollout undo` 一下即可恢复。

## 扩缩容与比例缩放

```bash
kubectl scale deployment/nginx-deployment --replicas=10
kubectl autoscale deployment/nginx-deployment --min=10 --max=15 --cpu-percent=80   # 交给 HPA
```

:::caution 扩缩容的两个坑
1. 手动 `kubectl scale` 之后再用清单 `kubectl apply`，清单里的 `replicas` 会**覆盖**手动扩缩的结果。
2. 如果已经交给 HPA 管副本数，**不要再在清单里写 `.spec.replicas`**，否则两者打架。
:::

**比例缩放（Proportional Scaling）**：滚动更新进行中时，新旧两个 RS 同时有副本。此刻若 HPA 或手动 scale 修改副本数，控制器会把新增副本**按比例分摊**到所有活跃的 RS 上（副本多的多分，剩余的全给副本最多的；`replicas=0` 的 RS 不参与），避免一次把新版本拉满或把旧版本抽空。例如 10 副本、`maxSurge=3`、`maxUnavailable=2`，更新被卡住时 HPA 扩到 15：3 个新副本分配给旧 RS、2 个给新 RS。

## 暂停与恢复

上线过程中想连续改多处（镜像 + 资源限制 + 环境变量），可以暂停后攒一批改动，恢复时一次性触发一次上线：

```bash
kubectl rollout pause deployment/nginx-deployment

kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1
kubectl set resources deployment/nginx-deployment -c=nginx \
  --limits=cpu=200m,memory=512Mi
# ... 继续任意多项修改，暂停期间都不会触发上线

kubectl rollout resume deployment/nginx-deployment
kubectl get rs --watch   # 观察一次完整的滚动更新
```

:::caution 暂停状态的 Deployment 不可回滚
`rollout undo` 对暂停中的 Deployment 会失败，必须先 `rollout resume`。
:::

## Deployment 的状态

![Deployment 的三种状态](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/deploy_status.png)

| 状态 | 判定 | 典型 reason |
| ---- | ---- | ----------- |
| 进行中 | 新建/扩容新 RS、缩容旧 RS、新 Pod 就绪 | `NewReplicaSetCreated`、`ReplicaSetUpdated` |
| 完成 | 全部副本已更新、可用、无旧副本 | `NewReplicaSetAvailable`（此时 `rollout status` 退出码为 0） |
| 失败 | 超过 `.spec.progressDeadlineSeconds`（默认 600 秒）无进展 | `ProgressDeadlineExceeded` |

失败的可能原因：配额不足、就绪探测失败、镜像拉取错误、权限不足、LimitRange 限制、应用运行时配置错误。配额不足时还会看到 `ReplicaFailure: True / FailedCreate` 状况，扩容或加配额即可解决。

:::caution K8s 不会自动处理失败的上线
Deployment 对失败只做**报告**（`.status.conditions`），不会自动回滚——这是有意的设计，把决策留给更上层的编排（比如基于状态的自动回滚工具）。失败的 Deployment 依然可以扩缩容、回滚、暂停。另外，暂停中的 Deployment 不检测进度超时。
:::

## 清理策略

`.spec.revisionHistoryLimit` 控制保留多少个旧 RS（默认 **10**），超出的旧 RS 由后台垃圾回收——但删掉旧 RS 就意味着失去那个版本的回滚能力。

- 设为 **0** 会清空全部历史，**完全无法回滚**（滚动更新本身仍正常，只是不留快照）；
- 清理动作只在 Deployment 达到完整状态**之后**才执行，所以设 0 时每次上线也会先创建新 RS 再移除旧的；
- 如果 Pod 反复崩溃导致连续多次上线、始终没达到完整状态，旧 RS 数量可能暂时超过这个限制。

## 金丝雀部署

K8s 原生的金丝雀做法不是某个字段，而是一个模式：**每个版本建一个独立的 Deployment，共用同一个 Service 的 selector**。新版本 Deployment 先给 1 个副本，让 Service 把少量流量分给它，验证无误后再扩新缩旧直至替换完成。结合 `kubectl rollout pause/resume` 可以精细控制节奏。

## 编写规约

`.spec` 各字段速查：

| 字段 | 必需 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `.spec.template` | 是 | — | Pod 模板，语法与 Pod 相同但不含 `apiVersion`/`kind`；`restartPolicy` 只允许 `Always` |
| `.spec.selector` | 是 | — | 必须匹配模板标签，创建后不可变；`apps/v1` 不会自动默认 |
| `.spec.replicas` | 否 | 1 | 有 HPA 时不要设置 |
| `.spec.strategy` | 否 | RollingUpdate | `Recreate` 或 `RollingUpdate`（含 `maxSurge`/`maxUnavailable`） |
| `.spec.minReadySeconds` | 否 | 0 | 新 Pod 无崩溃地保持就绪多久才算"可用" |
| `.spec.progressDeadlineSeconds` | 否 | 600 | 判定上线失败的进度超时，必须大于 `minReadySeconds` |
| `.spec.revisionHistoryLimit` | 否 | 10 | 保留的旧 RS 数量 |
| `.spec.paused` | 否 | false | 暂停上线 |

Deployment 名称必须是合法 **DNS 子域**。`minReadySeconds` 配合就绪探针使用，可以避免"新 Pod 刚起来就 Ready、随即又崩溃"的抖动被当成上线成功。

## 避坑清单

1. **不要手动管理** Deployment 拥有的 RS，不要改 `pod-template-hash` 标签
2. selector 创建后**不可变**；与其他控制器的 selector **不要重叠**
3. 只有 Pod 模板变化才触发上线/产生修订版本；扩缩容不触发
4. 手动 scale 后 apply 清单会覆盖手动结果；有 HPA 就别写 `replicas`
5. 暂停状态不可回滚；`revisionHistoryLimit: 0` 等于放弃回滚
6. `--record` 已废弃，用 `kubernetes.io/change-cause` 注解代替
7. K8s 对失败的上线只报告不处理，可结合外部工具自动回滚
