# 使用CronJob运行自动化任务

[使用CronJob运行自动化任务官方文档](https://kubernetes.io/zh-cn/docs/tasks/job/automated-tasks-with-cron-jobs/)



你可以利用 [CronJob](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/cron-jobs/) 执行基于时间调度的 [Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/)。 这些自动化任务和 Linux 或者 Unix 系统的 [Cron](https://zh.wikipedia.org/wiki/Cron) 任务类似。

CronJob 在创建周期性以及重复性的任务时很有帮助，例如执行备份操作或者发送邮件。 CronJob 也可以在特定时间调度单个任务，例如你想调度低活跃周期的任务。

CronJob 有一些限制和特点。 例如，在特定状况下，同一个 CronJob 可以创建多个任务。 因此，任务应该是幂等的。

有关更多限制，请参考 [CronJob](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/cron-jobs)。



## 创建 CronJob

CronJob 需要一个配置文件。 以下是针对一个 CronJob 的清单，该 CronJob 每分钟运行一个简单的演示任务：

编辑yaml文件

```yaml
cat > cronjob.yaml << EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "* * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox:1.28
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
EOF
```



创建cronjob

```shell
kubectl apply -f cronjob.yaml 
```



查看cronjob

```shell
$ kubectl get cj hello 
NAME    SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE   AGE
hello   * * * * *   False     0        <none>          16s
```



查看job，默认会有3个job

```shell
$ kubectl get job
NAME             COMPLETIONS   DURATION   AGE
hello-27822611   1/1           4s         2m12s
hello-27822612   1/1           4s         72s
hello-27822613   1/1           4s         12s
```



一分钟后名为 `hello-27822611` 的job会删除，名为 `hello-27822614` 的job会创建

```shell
$ kubectl get job
NAME             COMPLETIONS   DURATION   AGE
hello-27822612   1/1           4s         2m5s
hello-27822613   1/1           4s         65s
hello-27822614   1/1           3s         5s
```



查看pod，默认会有3个pod

```shell
$ kubectl get pod
NAME                   READY   STATUS      RESTARTS   AGE
hello-27822611-ctlx7   0/1     Completed   0          2m25s
hello-27822612-plqs4   0/1     Completed   0          85s
hello-27822613-jhg64   0/1     Completed   0          25s
```



一分钟后名为 `hello-27822611-ctlx7` pod会被删除，名为`hello-27822614-cfvvm` 的pod会被创建

```shell
$ kubectl get pod
NAME                   READY   STATUS      RESTARTS   AGE
hello-27822612-plqs4   0/1     Completed   0          2m18s
hello-27822613-jhg64   0/1     Completed   0          78s
hello-27822614-cfvvm   0/1     Completed   0          18s
```



查看pod日志

```shell
# 在你的系统上将 "hello-27822616" 替换为 Job 名称
pods=$(kubectl get pods --selector=job-name=hello-27822616 --output=jsonpath={.items..metadata.name})
```



```shell
$ kubectl logs $pods
Fri Nov 25 06:16:01 UTC 2022
Hello from the Kubernetes cluster
```



:::tip说明

cronjob会创建job来执行具体的任务，job会以 `定义的job名称-随机数字` 命名，并且默认会有3个job，这是由`.spec.successfulJobsHistoryLimit` 字段决定的，随机数字每隔定义的执行时间增加1，并且心增加的pod会替换掉第一个pod

cronjob创建的job会自动添加标签

```shell
$ kubectl describe job hello-27822625 
Name:             hello-27822625
Namespace:        test
Selector:         controller-uid=101bfe9b-b32a-4ae5-b104-2da1bf43e2c6
Labels:           controller-uid=101bfe9b-b32a-4ae5-b104-2da1bf43e2c6
                  job-name=hello-27822625
...
```

:::



## 删除 CronJob

当你不再需要 CronJob 时，可以用 `kubectl delete cronjob <cronjob name>` 删掉它：

```shell
kubectl delete cronjob hello
```

删除 CronJob 会清除它创建的所有任务和 Pod，并阻止它创建额外的任务。 你可以查阅[垃圾收集](https://kubernetes.io/zh-cn/docs/concepts/architecture/garbage-collection/)。



## 编写 CronJob 声明信息

像 Kubernetes 的其他对象一样，CronJob 需要 `apiVersion`、`kind` 和 `metadata` 字段。 有关 Kubernetes 对象及它们的[清单](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-manifest)的更多信息， 请参考[资源管理](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/manage-deployment/)和 [使用 kubectl 管理资源](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/)文档。

CronJob 配置也需要包括 [`.spec`](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status) 部分。

:::tip说明

如果你修改了一个 CronJob，你所做的修改将只被应用到将来所运行的任务上， 对当前 CronJob 内处于运行中的 Job 集合（和 Job 里面的 Pod）不会产生任何变化，它们将继续运行。 也就是说，对 CronJob 的修改不更新现有的任务，即使这些任务处于运行状态。

:::



### 排期表

`.spec.schedule` 是 `.spec` 中的必需字段。它接受 [Cron](https://zh.wikipedia.org/wiki/Cron) 格式串，例如 `0 * * * *` or `@hourly`，作为它的任务被创建和执行的调度时间。

该格式也包含了扩展的 “Vixie cron” 步长值。 [FreeBSD 手册](https://www.freebsd.org/cgi/man.cgi?crontab(5))中解释如下:

> 步长可被用于范围组合。范围后面带有 `/<数字>` 可以声明范围内的步幅数值。 例如，`0-23/2` 可被用在小时字段来声明命令在其他数值的小时数执行 （V7 标准中对应的方法是 `0,2,4,6,8,10,12,14,16,18,20,22`）。 步长也可以放在通配符后面，因此如果你想表达 “每两小时”，就用 `*/2` 。

:::tip说明

调度中的问号 (`?`) 和星号 `*` 含义相同，它们用来表示给定字段的任何可用值。

:::



### 任务模板

`.spec.jobTemplate` 是任务的模板，它是必需的。它和 [Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/) 的语法完全一样， 只不过它是嵌套的，没有 `apiVersion` 和 `kind`。 有关如何编写一个任务的 `.spec`， 请参考[编写 Job 规约](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/#writing-a-job-spec)。



### 开始的最后期限

`.spec.startingDeadlineSeconds` 字段是可选的。 它表示任务如果由于某种原因错过了调度时间，开始该任务的截止时间的秒数。 过了截止时间，CronJob 就不会开始任务。 不满足这种最后期限的任务会被统计为失败任务。如果此字段未设置，那任务就没有最后期限。

如果 `.spec.startingDeadlineSeconds` 字段被设置（非空）， CronJob 控制器将会计算从预期创建 Job 到当前时间的时间差。 如果时间差大于该限制，则跳过此次执行。

例如，如果将其设置为 `200`，则 Job 控制器允许在实际调度之后最多 200 秒内创建 Job。



### 并发性规则

`.spec.concurrencyPolicy` 也是可选的。它声明了 CronJob 创建的任务执行时发生重叠如何处理。 spec 仅能声明下列规则中的一种：

- `Allow`（默认）：CronJob 允许并发任务执行。
- `Forbid`： CronJob 不允许并发任务执行；如果新任务的执行时间到了而老任务没有执行完，CronJob 会忽略新任务的执行。
- `Replace`：如果新任务的执行时间到了而老任务没有执行完，CronJob 会用新任务替换当前正在运行的任务。

请注意，并发性规则仅适用于相同 CronJob 创建的任务。如果有多个 CronJob，它们相应的任务总是允许并发执行的。



### 挂起

`.spec.suspend` 字段也是可选的。如果设置为 `true` ，后续发生的执行都会被挂起。 这个设置对已经开始的执行不起作用。默认是 `false`。

:::caution注意

在调度时间内挂起的执行都会被统计为错过的任务。当 `.spec.suspend` 从 `true` 改为 `false` 时， 且没有[开始的最后期限](https://kubernetes.io/zh-cn/docs/tasks/job/automated-tasks-with-cron-jobs/#starting-deadline)，错过的任务会被立即调度。

:::



### 任务历史限制

`.spec.successfulJobsHistoryLimit` 和 `.spec.failedJobsHistoryLimit` 是可选的。 这两个字段指定应保留多少已完成和失败的任务。 默认设置分别为 3 和 1。设置为 `0` 代表相应类型的任务完成后不会保留。

