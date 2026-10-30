# 自动清理已完成的job

[自动清理已完成的job官方文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ttlafterfinished/)



**特性状态：** `Kubernetes v1.23 [stable]`

TTL-after-finished [控制器](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/) 提供了一种 TTL 机制来限制已完成执行的资源对象的生命周期。 TTL 控制器目前只处理 [Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/)。



## TTL-after-finished 控制器

TTL-after-finished 控制器只支持 Job。集群操作员可以通过指定 Job 的 `.spec.ttlSecondsAfterFinished` 字段来自动清理已结束的作业（`Complete` 或 `Failed`），如 [示例](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/#clean-up-finished-jobs-automatically) 所示。

TTL-after-finished 控制器假设作业能在执行完成后的 TTL 秒内被清理，也就是当 TTL 过期后。 当 TTL 控制器清理作业时，它将做级联删除操作，即删除资源对象的同时也删除其依赖对象。 注意，当资源被删除时，由该资源的生命周期保证其终结器（Finalizers）等被执行。

可以随时设置 TTL 秒。以下是设置 Job 的 `.spec.ttlSecondsAfterFinished` 字段的一些示例：

- 在作业清单（manifest）中指定此字段，以便 Job 在完成后的某个时间被自动清除。
- 将此字段设置为现有的、已完成的作业，以采用此新功能。
- 在创建作业时使用 [mutating admission webhook](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/extensible-admission-controllers/#admission-webhooks) 动态设置该字段。集群管理员可以使用它对完成的作业强制执行 TTL 策略。
- 使用 [mutating admission webhook](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/extensible-admission-controllers/#admission-webhooks) 在作业完成后动态设置该字段，并根据作业状态、标签等选择不同的 TTL 值。



`ttlSecondsAfterFinished` 字段用于指定已完成的job多少秒后自动删除

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  ttlSecondsAfterFinished: 60
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34.0
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
  backoffLimit: 4
```





## 警告

### 更新 TTL 秒数

请注意，在创建 Job 或已经执行结束后，仍可以修改其 TTL 周期，例如 Job 的 `.spec.ttlSecondsAfterFinished` 字段。 但是一旦 Job 变为可被删除状态（当其 TTL 已过期时），即使你通过 API 增加其 TTL 时长得到了成功的响应，系统也不保证 Job 将被保留。



### 时间偏差

由于 TTL-after-finished 控制器使用存储在 Kubernetes 资源中的时间戳来确定 TTL 是否已过期， 因此该功能对集群中的时间偏差很敏感，这可能导致 TTL-after-finished 控制器在错误的时间清理资源对象。

时钟并不总是如此正确，但差异应该很小。 设置非零 TTL 时请注意避免这种风险。