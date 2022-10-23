# pod hook

[pod hook官方文档](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/attach-handler-lifecycle-event/)



## pod hook说明

Kubernetes 支持 postStart 和 preStop 事件。 当一个容器启动后，Kubernetes 将立即发送 postStart 事件；在容器被终结之前， Kubernetes 将发送一个 preStop 事件。容器可以为每个事件指定一个处理程序。



## pod hook分类

### postStart

Kubernetes 在容器创建后立即发送 postStart 事件。 然而，postStart 处理函数的调用不保证早于容器的入口点（entrypoint） 的执行。postStart 处理函数与容器的代码是异步执行的，但 Kubernetes 的容器管理逻辑会一直阻塞等待 postStart 处理函数执行完毕。 只有 postStart 处理函数执行完毕，容器的状态才会变成 RUNNING。

### preStop

Kubernetes 在容器结束前立即发送 preStop 事件。除非 Pod 宽限期限超时，Kubernetes 的容器管理逻辑会一直阻塞等待 preStop 处理函数执行完毕。更多的相关细节，可以参阅 [Pods 的结束](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)。



### 回调函数实现方式

容器可以通过实现和注册该回调的处理程序来访问该回调。 针对容器，有两种类型的回调处理程序可供实现：

#### Exec 

在容器的 cgroups 和名字空间中执行特定的命令（例如 `pre-stop.sh`）。 命令所消耗的资源计入容器的资源消耗。

#### HTTP

对容器上的特定端点执行 HTTP 请求。





## 定义 postStart 和 preStop 处理函数

## postStart

:::tip

以下文件创建了一个nginx镜像的pod，pod在启动前会调用postStart函数，因此会执行 `command` 中指定的命令，即把 `echo Hello from the postStart handler` 内容写入到 `/usr/share/message`

:::

编辑yaml文件

```yaml
cat > lifecycle-demo-poststart.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo-poststart
spec:
  containers:
  - name: lifecycle-demo-container-poststart
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
EOF
```



创建pod

```shell
kubectl apply -f lifecycle-demo-poststart.yaml 
```



查看pod

```shell
$ kubectl get pod lifecycle-demo-poststart 
NAME                       READY   STATUS    RESTARTS   AGE
lifecycle-demo-poststart   1/1     Running   0          72s
```



查看容器中 `/usr/share/message` 文件内容

> 可以看到容器中 `/usr/share/message`  中已经写入了我们在创建pod时指定的内容

```shell
$ kubectl exec -it lifecycle-demo-poststart -- cat /usr/share/message
Hello from the postStart handler
```



## preStop

当用户请求删除含有 Pod 的资源对象时（如 Deployment 等），K8S 为了让应用程序优雅关闭（即让应用程序完成正在处理的请求后，再关闭软件），K8S 提供两种信息通知：

- 默认：K8S 通知 node 执行容器 `stop` 命令，容器运行时会先向容器中 PID 为 1 的进程发送系统信号 `SIGTERM`，然后等待容器中的应用程序终止执行，如果等待时间达到设定的超时时间，或者默认超时时间（30s），会继续发送 `SIGKILL` 的系统信号强行 kill 掉进程
- 使用 Pod 生命周期（利用 `PreStop` 回调函数），它在发送终止信号之前执行





:::tip

以下文件创建了一个nginx镜像的pod，pod在停止前会调用preStop函数，因此会执行 `command` 中指定的命令，即优雅的退出nginx进程

:::

编辑yaml文件

```yaml
cat > lifecycle-demo-prestop.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo-prestop
spec:
  containers:
  - name: lifecycle-demo-container-prestop
    image: nginx
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh","-c","nginx -s quit; while killall -0 nginx; do sleep 1; done"]
EOF
```



:::tip

以下文件创建了一个nginx镜像的pod，pod在停止前会调用preStop函数，因此会执行 `command` 中指定的命令

同时我们声明了一个 hostPath 类型的 Volume，在容器里面声明挂载到了这个 Volume，所以当我们删除pod，退出容器之前，在容器里面输出的信息也会同样的保存到宿主机（一定要是 pod 被调度到的目标节点）的 `/tmp` 目录下面

:::



```yaml
cat > lifecycle-demo2-prestop.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo2-prestop
spec:
  volumes:
  - name: message
    hostPath:
      path: /tmp
  containers:
  - name: lifecycle-demo2-prestop
    image: nginx
    ports:
    - containerPort: 80
    volumeMounts:
    - name: message
      mountPath: /usr/share/
    lifecycle:
      preStop:
        exec:
          command: ['/bin/sh', '-c', 'echo Hello from the preStop Handler > /usr/share/message']
EOF
```



创建pod

```shell
kubectl apply -f lifecycle-demo2-prestop.yaml
```



查看 lifecycle-demo2-prestop 这个pod被调度的节点，可以看到被调度到了 `k8s-node02` 节点

```shell
$ kubectl describe pod lifecycle-demo2-prestop 
...
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  42s   default-scheduler  Successfully assigned test/lifecycle-demo2-prestop to k8s-node02
  Normal  Pulling    42s   kubelet            Pulling image "nginx"
  Normal  Pulled     42s   kubelet            Successfully pulled image "nginx" in 291.455476ms
  Normal  Created    42s   kubelet            Created container lifecycle-demo2-prestop
  Normal  Started    41s   kubelet            Started container lifecycle-demo2-prestop
```



删除 lifecycle-demo2-prestop 这个pod

```shell
kubectl delete pod lifecycle-demo2-prestop
```



`k8s-node02` 节点查看 `/tmp/message` ，可以看到当删除 lifecycle-demo2-prestop 这个pod时，先执行了prestop函数，即向 `/usr/share/message` 下写入了内容，因为我们做了hostpath挂载，因此会持久化到pod所在节点的目录上

```shell
$ cat /tmp/message 
Hello from the preStop Handler
```


