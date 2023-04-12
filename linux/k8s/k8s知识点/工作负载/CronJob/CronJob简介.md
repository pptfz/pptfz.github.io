# CronJob简介

[CronJob官方文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/cron-jobs/)



**特性状态：** `Kubernetes v1.21 [stable]`

*CronJob* 创建基于时隔重复调度的 [Jobs](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/)。

一个 CronJob 对象就像 *crontab* (cron table) 文件中的一行。 它用 [Cron](https://en.wikipedia.org/wiki/Cron) 格式进行编写， 并周期性地在给定的调度时间执行 Job。



:::caution注意

所有 **CronJob** 的 `schedule:` 时间都是基于 [kube-controller-manager](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-controller-manager/). 的时区。

如果你的控制平面在 Pod 或是裸容器中运行了 kube-controller-manager， 那么为该容器所设置的时区将会决定 Cron Job 的控制器所使用的时区。

如 [v1 CronJob API](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/cron-job-v1/) 所述，官方并不支持设置时区。

Kubernetes 项目官方并不支持设置如 `CRON_TZ` 或者 `TZ` 等变量。 `CRON_TZ` 或者 `TZ` 是用于解析和计算下一个 Job 创建时间所使用的内部库中一个实现细节。 不建议在生产集群中使用它。

:::



为 CronJob 资源创建清单时，请确保所提供的名称是一个合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)。 名称不能超过 52 个字符。 这是因为 CronJob 控制器将自动在提供的 Job 名称后附加 11 个字符，并且存在一个限制， 即 Job 名称的最大长度不能超过 63 个字符。



## CronJob

CronJob 用于执行周期性的动作，例如备份、报告生成等。 这些任务中的每一个都应该配置为周期性重复的（例如：每天/每周/每月一次）； 你可以定义任务开始执行的时间间隔。

### 示例

下面的 CronJob 示例清单会在每分钟打印出当前时间和问候消息：

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

[使用 CronJob 运行自动化任务](https://kubernetes.io/zh-cn/docs/tasks/job/automated-tasks-with-cron-jobs/) 一文会为你详细讲解此例。



创建cronjob

```shell
kubectl apply -f cronjob.yaml 
```



查看cronjob

```shell
$ kubectl get cronjob
NAME    SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE   AGE
hello   * * * * *   False     0        50s             74s
```



查看job

```shell
$ kubectl get job
NAME             COMPLETIONS   DURATION   AGE
hello-27821732   1/1           16s        73s
hello-27821733   1/1           4s         13s
```



查看pod

> cronjob创建后，会依据cron表达式创建新的job

```shell
$ kubectl get pod
NAME                   READY   STATUS      RESTARTS   AGE
hello-27821732-nw8sw   0/1     Completed   0          92s
hello-27821733-7fg8b   0/1     Completed   0          32s
```



查看pod日志

```shell
$ kubectl logs -f hello-27821732-nw8sw 
Thu Nov 24 15:32:13 UTC 2022
```



### Cron 时间表语法

```sh
# ┌───────────── 分钟 (0 - 59)
# │ ┌───────────── 小时 (0 - 23)
# │ │ ┌───────────── 月的某天 (1 - 31)
# │ │ │ ┌───────────── 月份 (1 - 12)
# │ │ │ │ ┌───────────── 周的某天 (0 - 6)（周日到周一；在某些系统上，7 也是星期日）
# │ │ │ │ │                          或者是 sun，mon，tue，web，thu，fri，sat
# │ │ │ │ │
# │ │ │ │ │
# * * * * *
```



| 输入                   | 描述                         | 相当于    |
| ---------------------- | ---------------------------- | --------- |
| @yearly (or @annually) | 每年 1 月 1 日的午夜运行一次 | 0 0 1 1 * |
| @monthly               | 每月第一天的午夜运行一次     | 0 0 1 * * |
| @weekly                | 每周的周日午夜运行一次       | 0 0 * * 0 |
| @daily (or @midnight)  | 每天午夜运行一次             | 0 0 * * * |
| @hourly                | 每小时的开始一次             | 0 * * * * |

例如，下面这行指出必须在每个星期五的午夜以及每个月 13 号的午夜开始任务：

```
0 0 13 * 5
```

要生成 CronJob 时间表表达式，你还可以使用 [crontab.guru](https://crontab.guru/) 之类的 Web 工具。



## 时区

对于没有指定时区的 CronJob，kube-controller-manager 基于本地时区解释排期表（Schedule）。

**特性状态：** `Kubernetes v1.25 [beta]`

如果启用了 `CronJobTimeZone` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)， 你可以为 CronJob 指定一个时区（如果你没有启用该特性门控，或者你使用的是不支持试验性时区功能的 Kubernetes 版本，集群中所有 CronJob 的时区都是未指定的）。

启用该特性后，你可以将 `spec.timeZone` 设置为有效[时区](https://zh.wikipedia.org/wiki/时区信息数据库)名称。 例如，设置 `spec.timeZone: "Etc/UTC"` 指示 Kubernetes 采用 UTC 来解释排期表。

Go 标准库中的时区数据库包含在二进制文件中，并用作备用数据库，以防系统上没有可用的外部数据库。



## CronJob 限制

CronJob 根据其计划编排，在每次该执行任务的时候大约会创建一个 Job。 我们之所以说 "大约"，是因为在某些情况下，可能会创建两个 Job，或者不会创建任何 Job。 我们试图使这些情况尽量少发生，但不能完全杜绝。因此，Job 应该是 *幂等的*。

如果 `startingDeadlineSeconds` 设置为很大的数值或未设置（默认），并且 `concurrencyPolicy` 设置为 `Allow`，则作业将始终至少运行一次。



:::caution

如果 `startingDeadlineSeconds` 的设置值低于 10 秒钟，CronJob 可能无法被调度。 这是因为 CronJob 控制器每 10 秒钟执行一次检查。

:::

对于每个 CronJob，CronJob [控制器（Controller）](https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/) 检查从上一次调度的时间点到现在所错过了调度次数。如果错过的调度次数超过 100 次， 那么它就不会启动这个任务，并记录这个错误:

```
Cannot determine if job needs to be started. Too many missed start time (> 100). Set or decrease .spec.startingDeadlineSeconds or check clock skew.
```

需要注意的是，如果 `startingDeadlineSeconds` 字段非空，则控制器会统计从 `startingDeadlineSeconds` 设置的值到现在而不是从上一个计划时间到现在错过了多少次 Job。 例如，如果 `startingDeadlineSeconds` 是 `200`，则控制器会统计在过去 200 秒中错过了多少次 Job。

如果未能在调度时间内创建 CronJob，则计为错过。 例如，如果 `concurrencyPolicy` 被设置为 `Forbid`，并且当前有一个调度仍在运行的情况下， 试图调度的 CronJob 将被计算为错过。

例如，假设一个 CronJob 被设置为从 `08:30:00` 开始每隔一分钟创建一个新的 Job， 并且它的 `startingDeadlineSeconds` 字段未被设置。如果 CronJob 控制器从 `08:29:00` 到 `10:21:00` 终止运行，则该 Job 将不会启动，因为其错过的调度 次数超过了 100。

为了进一步阐述这个概念，假设将 CronJob 设置为从 `08:30:00` 开始每隔一分钟创建一个新的 Job， 并将其 `startingDeadlineSeconds` 字段设置为 200 秒。 如果 CronJob 控制器恰好在与上一个示例相同的时间段（`08:29:00` 到 `10:21:00`）终止运行， 则 Job 仍将从 `10:22:00` 开始。 造成这种情况的原因是控制器现在检查在最近 200 秒（即 3 个错过的调度）中发生了多少次错过的 Job 调度，而不是从现在为止的最后一个调度时间开始。

CronJob 仅负责创建与其调度时间相匹配的 Job，而 Job 又负责管理其代表的 Pod。



## 控制器版本

从 Kubernetes v1.21 版本开始，CronJob 控制器的第二个版本被用作默认实现。 要禁用此默认 CronJob 控制器而使用原来的 CronJob 控制器，请在 [kube-controller-manager](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-controller-manager/) 中设置[特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/) `CronJobControllerV2`，将此标志设置为 `false`。例如：

```shell
--feature-gates="CronJobControllerV2=false"
```



