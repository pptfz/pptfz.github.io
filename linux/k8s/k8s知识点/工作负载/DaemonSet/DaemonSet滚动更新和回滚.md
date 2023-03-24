# DaemonSet滚动更新和回滚

# DaemonSet滚动更新

[DaemonSet滚动更新官方文档](https://kubernetes.io/zh-cn/docs/tasks/manage-daemon/update-daemon-set/)



## DaemonSet 更新策略

DaemonSet 有两种更新策略：

- `OnDelete`: 使用 `OnDelete` 更新策略时，在更新 DaemonSet 模板后，只有当你手动删除老的 DaemonSet pods 之后，新的 DaemonSet Pod **才会**被自动创建。跟 Kubernetes 1.6 以前的版本类似。
- `RollingUpdate`: 这是默认的更新策略。使用 `RollingUpdate` 更新策略时，在更新 DaemonSet 模板后， 老的 DaemonSet Pod 将被终止，并且将以受控方式自动创建新的 DaemonSet Pod。 **更新期间，最多只能有 DaemonSet 的一个 Pod 运行于每个节点上。**



## 执行滚动更新

要启用 DaemonSet 的滚动更新功能，必须设置 `.spec.updateStrategy.type` 为 `RollingUpdate`。

你可能想设置 [`.spec.updateStrategy.rollingUpdate.maxUnavailable`](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/daemon-set-v1/#DaemonSetSpec) (默认为 1)， [`.spec.minReadySeconds`](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/daemon-set-v1/#DaemonSetSpec) (默认为 0) 和 [`.spec.updateStrategy.rollingUpdate.maxSurge`](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/daemon-set-v1/#DaemonSetSpec) （默认为 0）。



### 创建带有 `RollingUpdate` 更新策略的 DaemonSet

编辑yaml文件

```yaml
cat > fluentd-daemonset.yaml << EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # 这些容忍度设置是为了让该守护进程集在控制平面节点上运行
      # 如果你不希望自己的控制平面节点运行 Pod，可以删除它们
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
EOF
```



创建daemonset

```shell
kubectl apply -f fluentd-daemonset.yaml --record=true
```



查看daemonset

```shell
$ kubectl get ds -n kube-system
NAME                    DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
fluentd-elasticsearch   3         3         3       3            3           <none>                   19s
```



### 检查 DaemonSet 的滚动更新策略



```shell
$ kubectl get ds/fluentd-elasticsearch -o go-template='{{.spec.updateStrategy.type}}{{"\n"}}' -n kube-system
RollingUpdate
```



```shell
$ kubectl apply -f fluentd-daemonset.yaml --dry-run=client -o go-template='{{.spec.updateStrategy.type}}{{"\n"}}'
RollingUpdate
```



### 更新 DaemonSet 模板

对 `RollingUpdate` DaemonSet 的 `.spec.template` 的任何更新都将触发滚动更新。 这可以通过几个不同的 `kubectl` 命令来完成。



编辑yaml文件

:::tip说明

如果只更新容器镜像，可以使用如下命令

```shell
kubectl set image ds/fluentd-elasticsearch fluentd-elasticsearch=quay.io/fluentd_elasticsearch/fluentd:v2.6.0 -n kube-system
```

:::

```yaml
cat > fluentd-daemonset-update.yaml << EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # 这些容忍度设置是为了让该守护进程集在控制平面节点上运行
      # 如果你不希望自己的控制平面节点运行 Pod，可以删除它们
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
EOF
```





### 监视滚动更新状态

创建daemonset

```shell
$ kubectl apply -f fluentd-daemonset-update.yaml --record=true
daemonset.apps/fluentd-elasticsearch configured
```



查看滚动更新进度

```shell
$ kubectl rollout status ds/fluentd-elasticsearch -n kube-system
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 0 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 0 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 0 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 of 3 updated pods are available...
daemon set "fluentd-elasticsearch" successfully rolled out
```



## 故障排查

### DaemonSet 滚动更新卡住

有时，DaemonSet 滚动更新可能卡住，以下是一些可能的原因：

#### 一些节点可用资源耗尽

DaemonSet 滚动更新可能会卡住，其 Pod 至少在某个节点上无法调度运行。 当节点上[可用资源耗尽](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/node-pressure-eviction/)时， 这是可能的。

发生这种情况时，通过对 `kubectl get nodes` 和下面命令行的输出作比较， 找出没有调度 DaemonSet Pod 的节点：

```shell
kubectl get pods -l name=fluentd-elasticsearch -o wide -n kube-system
```

一旦找到这些节点，从节点上删除一些非 DaemonSet Pod，为新的 DaemonSet Pod 腾出空间。

:::tip说明

当所删除的 Pod 不受任何控制器管理，也不是多副本的 Pod时，上述操作将导致服务中断。 同时，上述操作也不会考虑 [PodDisruptionBudget](https://kubernetes.io/zh-cn/docs/tasks/run-application/configure-pdb/) 所施加的约束。

:::



#### 不完整的滚动更新

如果最近的 DaemonSet 模板更新被破坏了，比如，容器处于崩溃循环状态或者容器镜像不存在 （通常由于拼写错误），就会发生 DaemonSet 滚动更新中断。

要解决此问题，需再次更新 DaemonSet 模板。新的滚动更新不会被以前的不健康的滚动更新阻止。



#### 时钟偏差

如果在 DaemonSet 中指定了 `.spec.minReadySeconds`，主控节点和工作节点之间的时钟偏差会使 DaemonSet 无法检测到正确的滚动更新进度。



## 清理

从名字空间中删除 DaemonSet：

```shell
kubectl delete ds fluentd-elasticsearch -n kube-system
```



# DaemonSet回滚

### 步骤 1：找到想要 DaemonSet 回滚到的历史修订版本（revision）

列出 DaemonSet 的所有版本：

```shell
$ kubectl rollout history daemonset fluentd-elasticsearch 
daemonset.apps/fluentd-elasticsearch 
REVISION  CHANGE-CAUSE
1         kubectl apply --filename=daemonset.yaml --record=true
2         kubectl apply --filename=fluentd-daemonset.yaml --record=true
3         kubectl apply --filename=fluentd-daemonset-update.yaml --record=true
```



:::tip说明

在创建时，DaemonSet 的变化原因从 `kubernetes.io/change-cause` 注解（annotation） 复制到其修订版本中。用户可以在 `kubectl` 命令中设置 `--record=true`， 将执行的命令记录在变化原因注解中。

:::



执行以下命令，来查看指定版本的详细信息：

:::tip说明

执行命令 `kubectl rollout history daemonset <daemonset-name> --revision=<revision>` 查看ds历史修改记录

:::

```shell
$ kubectl rollout history daemonset fluentd-elasticsearch --revision=1
daemonset.apps/fluentd-elasticsearch with revision #1
Pod Template:
  Labels:	name=fluentd-elasticsearch
  Containers:
   fluentd-elasticsearch:
    Image:	quay.io/fluentd_elasticsearch/fluentd:v2.5.2
    Port:	<none>
    Host Port:	<none>
    Limits:
      memory:	200Mi
    Requests:
      cpu:	100m
      memory:	200Mi
    Environment:	<none>
    Mounts:
      /var/log from varlog (rw)
  Volumes:
   varlog:
    Type:	HostPath (bare host directory volume)
    Path:	/var/log
    HostPathType:	
```



### 步骤 2：回滚到指定版本

:::tip

执行命令 `kubectl rollout undo daemonset <daemonset-name> --to-revision=<revision>` 回滚到指定版本

如果 `--to-revision` 参数未指定，将回滚到最近的版本

:::

```shell
$ kubectl rollout undo daemonset fluentd-elasticsearch --to-revision=2
daemonset.apps/fluentd-elasticsearch rolled back
```



### 步骤 3：监视 DaemonSet 回滚进度

:::tip

执行命令 `kubectl rollout status ds ds-name` 查看回滚进度

:::

```shell
$ kubectl rollout status ds/fluentd-elasticsearch
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 1 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 out of 3 new pods have been updated...
Waiting for daemon set "fluentd-elasticsearch" rollout to finish: 2 of 3 updated pods are available...
daemon set "fluentd-elasticsearch" successfully rolled out
```



## 理解 DaemonSet 修订版本

在前面的 `kubectl rollout history` 步骤中，你获得了一个修订版本列表，每个修订版本都存储在名为 `ControllerRevision` 的资源中。

要查看每个修订版本中保存的内容，可以找到 DaemonSet 修订版本的原生资源：

```shell
kubectl get controllerrevision -l <daemonset-selector-key>=<daemonset-selector-value>
```



该命令返回 `ControllerRevisions` 列表：

```
NAME                               CONTROLLER                     REVISION   AGE
<daemonset-name>-<revision-hash>   DaemonSet/<daemonset-name>     1          1h
<daemonset-name>-<revision-hash>   DaemonSet/<daemonset-name>     2          1h
```

每个 `ControllerRevision` 中存储了相应 DaemonSet 版本的注解和模板。

`kubectl rollout undo` 选择特定的 `ControllerRevision`，并用 `ControllerRevision` 中存储的模板代替 DaemonSet 的模板。 `kubectl rollout undo` 相当于通过其他命令（如 `kubectl edit` 或 `kubectl apply`） 将 DaemonSet 模板更新至先前的版本。



例如如下输出

```shell
$ kubectl get controllerrevision -l name=fluentd-elasticsearch
NAME                               CONTROLLER                             REVISION   AGE
fluentd-elasticsearch-66558cc747   daemonset.apps/fluentd-elasticsearch   3          18m
fluentd-elasticsearch-6cd7f55654   daemonset.apps/fluentd-elasticsearch   4          22m
fluentd-elasticsearch-7578d665c9   daemonset.apps/fluentd-elasticsearch   5          19m
```



:::tip

注意 DaemonSet 修订版本只会正向变化。也就是说，回滚完成后，所回滚到的 `ControllerRevision` 版本号 (`.revision` 字段) 会增加。 例如，如果用户在系统中有版本 1 和版本 2，并从版本 2 回滚到版本 1， 带有 `.revision: 1` 的 `ControllerRevision` 将变为 `.revision: 3`。

:::



