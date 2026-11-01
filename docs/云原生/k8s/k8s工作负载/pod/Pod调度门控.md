# Pod 调度门控 schedulingGates

## 引言

Pod 一旦创建，调度器就立刻开始为它寻找节点。但在真实环境里，有一类 Pod 需要先满足某些外部条件才"值得"被调度——比如要等外部配额系统审批、等依赖的 IP/网络资源就绪、或等批量作业的前置任务完成。让这些 Pod 提前进入调度队列，只会持续产生"资源不足"的失败调度，还干扰 Cluster Autoscaler 对真实容量的判断。**调度门控（schedulingGates）**就是为了显式表达"这个 Pod 我说可以了才能调度"而设计的：Pod 被创建后停在 `SchedulingGated` 状态，不进调度队列，直到门控被删除。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| Pod 调度就绪态（PodSchedulingReadiness） | https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/pod-scheduling-readiness/ |
| 设计提案 KEP-3521 | https://github.com/kubernetes/enhancements/blob/master/keps/sig-scheduling/3521-pod-scheduling-readiness |

## 特性状态

- v1.26 alpha（需开启 `PodSchedulingReadiness` 特性门控）
- v1.27 beta 默认启用
- **v1.30 GA（稳定）**，当前主流集群开箱即用

## 1. 基本用法

`schedulingGates` 是一个字符串列表，每个元素（如 `example.com/foo`）代表"调度前应满足的一项条件"。**该字段只能在创建 Pod 时初始化**；创建后可以按任意顺序删除门控，但**不允许新增**。

```bash
cat > pod-with-scheduling-gates.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  # 【关键字段】调度门控：带上它，Pod 创建后不会进入调度队列
  # name 使用反向域名风格，代表某一方（如外部调度框架）定义的条件
  schedulingGates:
  - name: example.com/foo
  - name: example.com/bar
  containers:
  - name: pause
    image: registry.k8s.io/pause:3.6
EOF
kubectl apply -f pod-with-scheduling-gates.yaml

kubectl get pod test-pod
# NAME       READY   STATUS            RESTARTS   AGE
# test-pod   0/1     SchedulingGated   0          7s
```

需要放行时，把 `schedulingGates` 从 spec 中**完全删除**（整段移除）再重新 apply，Pod 即进入正常调度流程：

```bash
# 验证门控已清空
kubectl get pod test-pod -o jsonpath='{.spec.schedulingGates}'
# （空输出）

kubectl get pod test-pod -o wide
# NAME       READY   STATUS    RESTARTS   AGE   IP         NODE
# test-pod   1/1     Running   0          15s   10.0.0.4   node-2
```

:::tip SchedulingGated 是一个独立状态
`kubectl get pod` 的 STATUS 列会显示 `SchedulingGated`，与 `Pending` 区分——前者是"被人为扣住"，后者是"排队等资源"。排查调度问题时先看这个状态，能少走弯路。
:::

## 2. 门控期间仍可修改调度指令

带门控的 Pod 有一个特殊能力：**在放行之前修改它的调度指令**。这对"先创建占位、等条件明确后再收紧"的模式很有用，普通 Pod 的这些字段创建后是不可变的。

约束是**只能收紧，不能放宽**——修改后的指令只允许 Pod 落在原先匹配的节点子集上：

| 字段 | 允许的修改 |
| --- | --- |
| `spec.nodeSelector` | 只允许增加条目（原本未设置时允许设置） |
| `affinity.nodeAffinity`（required） | 原来为空可任意设置；不为空只允许向 `matchExpressions`/`fieldExpressions` 追加条件（Terms 之间是或、表达式之间是与，追加只会缩小范围） |
| `affinity.nodeAffinity`（preferred） | 全部允许修改（首选项不具权威性） |

## 3. 可观测性

调度器指标 `scheduler_pending_pods` 新增标签值 `gated`，用于区分"调度失败在重试的 Pod"和"被门控扣住的 Pod"：

```bash
# 查看被门控扣住的 Pod 数量
scheduler_pending_pods{queue="gated"}
```

## 4. 典型使用场景

- **外部调度框架协同**：Kueue、Volcano 等批调度系统用门控接管 Pod 的调度时机，实现队列与配额管理
- **依赖外部资源**：IPAM 分配、GPU 池预约、跨集群协调完成后再放行
- **批量作业编排**：整组 Pod 创建后先扣住，条件满足时统一放行（与 gang scheduling 思路相通）
- **避免无效扩容**：被门控的 Pod 不参与调度，Cluster Autoscaler 不会因为它们触发的"资源不足"而盲目扩容

## 5. 我的总结与避坑清单

1. **门控只能创建时初始化，删除后不能加回来**——要重新扣住只能删掉 Pod 重建
2. **放行 = 整段删除 `schedulingGates` 字段**，不是把列表置空后再补内容
3. **门控期间可以收紧调度指令**（nodeSelector/nodeAffinity），这是普通 Pod 做不到的，适合"占位 + 后补条件"模式
4. **别忘了下游集成**：HPA、Job 控制器看到的都是 `SchedulingGated` 的 Pod，大批量门控 Pod 会占据副本数，监控告警要能识别这个状态
5. **与自定义调度器的边界**：门控只是"不进默认调度队列"，真正的复杂调度逻辑（队列、配额、gang）还是交给 Kueue/Volcano 这类框架，门控是它们实现的基础机制之一
