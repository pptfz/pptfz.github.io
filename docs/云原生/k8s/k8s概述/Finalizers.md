# Finalizers

**Finalizer（终结器）** 是带有命名空间的键，告诉 Kubernetes **等到特定的条件被满足后，再完全删除被标记为删除的资源**。Finalizer 提醒控制器清理被删除对象所拥有的资源，可用于控制资源的垃圾收集——例如在删除目标资源前清理相关 API 资源或基础设施。

## 官方文档参考

| 文档 | 语言 | 链接 |
| ---- | ---- | ---- |
| Finalizers（终结器）概念页 | 中文 | https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/finalizers/ |

## Finalizer 如何工作

当你请求删除一个带 Finalizer 的对象时，删除**并不会立即完成**，而是经历以下流程：

1. Kubernetes API 通过填充 `.metadata.deletionTimestamp` 来**标记**对象为待删除，并返回 `202` 状态码（HTTP "已接受"），使对象进入**只读**状态；
2. 控制平面或其他组件执行 Finalizer 所定义的清理行动，此时目标对象一直处于**终止中（Terminating）** 状态；
3. 清理完成后，控制器**删除目标对象上的 Finalizer**；
4. 当 `metadata.finalizers` 字段变为空时，Kubernetes 才认为删除完成，并真正删除该对象。

这个流程可以用下表概括：

| 阶段 | API 服务器行为 | 对象状态 |
| ---- | -------------- | -------- |
| 发起删除 | 填充 `deletionTimestamp`，返回 `202`，对象进入只读 | Terminating |
| 清理中 | 等待各控制器执行 Finalizer 定义的清理动作 | Terminating |
| 清理完成 | 控制器移除对应的 Finalizer 键 | 仍存在 |
| finalizers 为空 | 真正从 etcd 中删除对象 | 已删除 |

## metadata.finalizers 字段

Finalizer 存放在对象的 `metadata.finalizers` 字段中，它是一个字符串数组，每一项都是一个带命名空间前缀的键，例如 `example.com/my-finalizer`：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-configmap
  finalizers:
  - example.com/my-finalizer   # 自定义 Finalizer 键，由对应的控制器负责移除
data:
  key: value
```

内置系统也使用 Finalizer，例如 `kubernetes.io/pv-protection`（保护仍在使用中的 PersistentVolume）。

查看对象上的 Finalizer：

```bash
# 查看 finalizers 字段内容
kubectl get configmap my-configmap -o jsonpath='{.metadata.finalizers}'

# 或直接查看完整 YAML
kubectl get configmap my-configmap -o yaml
```

## Finalizer 与卡 Terminating 现象

:::caution 卡在 Terminating 的常见根因
如果对象上还挂着 Finalizer，而对应的控制器已经不存在（例如卸载了某个 Operator 或控制器组件、控制器代码有 Bug 未能移除 Finalizer），对象就会**永远停留在 Terminating 状态**。`kubectl delete` 已执行、`deletionTimestamp` 已打上，但对象就是删不掉。
排查思路：先用 `kubectl get <resource> <name> -o yaml` 查看对象上的 `finalizers` 列表，确认每个 Finalizer 应由哪个控制器负责清理、该控制器是否还在运行。
:::

处理卡 Terminating 的对象时，只有在**确认没有任何组件还需要清理该对象**的情况下，才可以手动移除 Finalizer（例如通过 `kubectl patch` 更新 `metadata.finalizers` 字段把对应键删掉）。强行移除 Finalizer 可能留下孤儿资源（如后端存储、云上负载均衡等未被清理）。

:::tip 与级联删除的关系
使用前台（foreground）或孤立（orphan）级联删除时，Kubernetes 也会给属主对象自动加上相应的 Finalizer（`foreground` / `orphan`），由垃圾收集控制器在删除属主前处理附属资源——详见属主与附属笔记。
:::

## 我的总结与避坑清单

1. 遇到资源卡在 Terminating，第一反应不要急着强制删，先 `kubectl get <resource> <name> -o yaml` 查 `metadata.finalizers` 和 `deletionTimestamp`，弄清楚是谁在"扣着"这个对象。
2. 卸载 Operator/CRD 前先清理其下所有自定义资源实例，否则控制器没了、Finalizer 没人移除，CR 对象会永久卡在 Terminating。
3. 手动 patch 掉 finalizers 是最后的逃生手段：必须确认背后的外部资源（云盘、LB、证书等）已手工清理，否则会留下无法追踪的孤儿资源。
4. 自研控制器时，Finalizer 的清理逻辑必须保证幂等、且在控制器启动时做资源回溯（informer 全量列举），防止在"添加 Finalizer 之后、清理完成之前"控制器宕机导致对象永久卡死。
5. Finalizer 中的键要带命名空间前缀（如 `example.com/xxx`）避免冲突；被标记删除（有 `deletionTimestamp`）的对象会进入只读状态，除移除 finalizers 外的更新请求都会被拒绝，控制器逻辑要能识别这一点。
