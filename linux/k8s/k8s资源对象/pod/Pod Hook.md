# pod hook

Kubernetes 支持 postStart 和 preStop 事件。 当一个容器启动后，Kubernetes 将立即发送 postStart 事件；在容器被终结之前， Kubernetes 将发送一个 preStop 事件。容器可以为每个事件指定一个处理程序。

## 定义 postStart 和 preStop 处理函数

编辑yaml文件

```yaml
cat > lifecycle-events.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: lifecycle-demo-container
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
      preStop:
        exec:
          command: ["/bin/sh","-c","nginx -s quit; while killall -0 nginx; do sleep 1; done"]
EOF
```



在上述配置文件中，你可以看到 postStart 命令在容器的 `/usr/share` 目录下写入文件 `message`。 命令 preStop 负责优雅地终止 nginx 服务。当因为失效而导致容器终止时，这一处理方式很有用。

创建 Pod：

```shell
kubectl apply -f lifecycle-events.yaml
```



验证 Pod 中的容器已经运行：

```shell
kubectl get pod lifecycle-demo
```



验证 `postStart` 处理函数创建了 `message` 文件

```shell
$ kubectl exec -it lifecycle-demo -- cat /usr/share/message
Hello from the postStart handler
```



## 讨论

Kubernetes 在容器创建后立即发送 postStart 事件。 然而，postStart 处理函数的调用不保证早于容器的入口点（entrypoint） 的执行。postStart 处理函数与容器的代码是异步执行的，但 Kubernetes 的容器管理逻辑会一直阻塞等待 postStart 处理函数执行完毕。 只有 postStart 处理函数执行完毕，容器的状态才会变成 RUNNING。

Kubernetes 在容器结束前立即发送 preStop 事件。除非 Pod 宽限期限超时，Kubernetes 的容器管理逻辑 会一直阻塞等待 preStop 处理函数执行完毕。更多的相关细节，可以参阅 [Pods 的结束](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)。

> **说明：** Kubernetes 只有在 Pod *结束（Terminated）* 的时候才会发送 preStop 事件， 这意味着在 Pod *完成（Completed）* 时 preStop 的事件处理逻辑不会被触发。这个限制在 [issue #55087](https://github.com/kubernetes/kubernetes/issues/55807) 中被追踪。
