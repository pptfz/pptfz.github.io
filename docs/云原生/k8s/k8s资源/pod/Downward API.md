# Downward API



[Downward API 官方文档](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/downward-api/)



## Downward API简介

对于容器来说，在不与 Kubernetes 过度耦合的情况下，拥有关于自身的信息有时是很有用的。 **Downward API** 允许容器在不使用 Kubernetes 客户端或 API 服务器的情况下获得自己或集群的信息。

例如，现有应用程序假设某特定的周知的环境变量是存在的，其中包含唯一标识符。 一种方法是对应用程序进行封装，但这很繁琐且容易出错，并且违背了低耦合的目标。 更好的选择是使用 Pod 名称作为标识符，并将 Pod 名称注入到周知的环境变量中。

在 Kubernetes 中，有两种方法可以将 Pod 和容器字段暴露给运行中的容器：

- 作为[环境变量](https://kubernetes.io/zh-cn/docs/tasks/inject-data-application/environment-variable-expose-pod-information/)
- 作为 [`downwardAPI` 卷中的文件](https://kubernetes.io/zh-cn/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/)

这两种暴露 Pod 和容器字段的方式统称为 **Downward API**。



## 可用字段

只有部分 Kubernetes API 字段可以通过 Downward API 使用。本节列出了你可以使用的字段。

你可以使用 `fieldRef` 传递来自可用的 Pod 级字段的信息。在 API 层面，一个 Pod 的 `spec` 总是定义了至少一个 [Container](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/#Container)。 你可以使用 `resourceFieldRef` 传递来自可用的 Container 级字段的信息。

### 可通过 `fieldRef` 获得的信息

对于大多数 Pod 级别的字段，你可以将它们作为环境变量或使用 `downwardAPI` 卷提供给容器。 通过这两种机制可用的字段有：

| 字段名                           | 含义                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| metadata.name                    | Pod 的名称                                                   |
| metadata.namespace               | Pod 的[命名空间](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/namespaces/) |
| metadata.uid                     | Pod 的唯一 ID                                                |
| metadata.annotations['KEY_NAME'] | Pod 的[注解](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/annotations/) `<KEY>` 的值（例如：`metadata.annotations['myannotation']`） |
| metadata.labels['KEY_NAME']      | Pod 的[标签](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/) `<KEY>` 的值（例如：`metadata.labels['mylabel']`） |
| spec.serviceAccountName          | Pod 的[服务账号](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-service-account/)名称 |
| spec.nodeName                    | Pod 运行时所处的[节点](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/)名称 |
| status.hostIP                    | Pod 所在节点的主 IP 地址                                     |
| status.podIP                     | Pod 的主 IP 地址（通常是其 IPv4 地址）                       |



此外，以下信息可以通过 `downwardAPI` 卷 `fieldRef` 获得，但**不能作为环境变量**获得：

| 字段名               | 含义                                                         |
| -------------------- | ------------------------------------------------------------ |
| metadata.labels      | Pod 的所有标签，格式为 `标签键名="转义后的标签值"`，每行一个标签 |
| metadata.annotations | Pod 的全部注解，格式为 `注解键名="转义后的注解值"`，每行一个注解 |





### 可通过 `resourceFieldRef` 获得的信息



| 字段名                               | 含义                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| resource: limits.cpu                 | 容器的 CPU 限制值                                            |
| resource: requests.cpu               | 容器的 CPU 请求值                                            |
| resource: limits.memory              | 容器的内存限制值                                             |
| resource: requests.memory            | 容器的内存请求值                                             |
| resource: limits.hugepages-\*        | 容器的巨页限制值（前提是启用了 `DownwardAPIHugePages` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)） |
| resource: requests.hugepages-\*      | 容器的巨页请求值（前提是启用了 `DownwardAPIHugePages` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)） |
| resource: limits.ephemeral-storage   | 容器的临时存储的限制值                                       |
| resource: requests.ephemeral-storage | 容器的临时存储的请求值                                       |







## 使用示例

### 环境变量

#### 使用pod字段作为环境变量的值

:::tip说明

本示例中的字段是 Pod 字段，不是 Pod 中 Container 的字段。

:::

编辑yaml文件

```yaml
cat > dapi-envars-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: dapi-envars-fieldref
spec:
  containers:
    - name: test-container
      #image: registry.k8s.io/busybox
      image: mirrorgooglecontainers/busybox
      command: [ "sh", "-c"]
      args:
      - while true; do
          echo -en '\n';
          printenv MY_NODE_NAME MY_POD_NAME MY_POD_NAMESPACE;
          printenv MY_POD_IP MY_POD_SERVICE_ACCOUNT;
          sleep 10;
        done;
      env:
        - name: MY_NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        - name: MY_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: MY_POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: MY_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: MY_POD_SERVICE_ACCOUNT
          valueFrom:
            fieldRef:
              fieldPath: spec.serviceAccountName
  restartPolicy: Never
EOF
```



这个清单中，你可以看到五个环境变量。`env` 字段定义了一组环境变量。

数组中第一个元素指定 `MY_NODE_NAME` 这个环境变量从 Pod 的 `spec.nodeName` 字段获取变量值。 同样，其它环境变量也是从 Pod 的字段获取它们的变量值。





创建pod

```shell
kubectl apply -f dapi-envars-pod.yaml 
```



查看日志

可以看到，日志中分别打印了 node主机名、pod名称、pod所在命名空间、pod IP、pod服务账号名称、

```shell
$ kubectl logs dapi-envars-fieldref

ctyun
dapi-envars-fieldref
test
10.88.1.16
default
```



在容器中执行 `prineenv` 命令打印刚才我们设置的变量

```shell
$ kubectl exec dapi-envars-fieldref -- printenv|grep MY
MY_NODE_NAME=ctyun
MY_POD_NAME=dapi-envars-fieldref
MY_POD_NAMESPACE=test
MY_POD_IP=10.88.1.16
MY_POD_SERVICE_ACCOUNT=default
```





#### 使用容器字段作为环境变量的值

编辑yaml文件

```yaml
cat > dapi-envars-container.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: dapi-envars-resourcefieldref
spec:
  containers:
    - name: test-container
      #image: registry.k8s.io/busybox:1.24
      image: mirrorgooglecontainers/busybox:1.24
      command: [ "sh", "-c"]
      args:
      - while true; do
          echo -en '\n';
          printenv MY_CPU_REQUEST MY_CPU_LIMIT;
          printenv MY_MEM_REQUEST MY_MEM_LIMIT;
          sleep 10;
        done;
      resources:
        requests:
          memory: "32Mi"
          cpu: "125m"
        limits:
          memory: "64Mi"
          cpu: "250m"
      env:
        - name: MY_CPU_REQUEST
          valueFrom:
            resourceFieldRef:
              containerName: test-container
              resource: requests.cpu
        - name: MY_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              containerName: test-container
              resource: limits.cpu
        - name: MY_MEM_REQUEST
          valueFrom:
            resourceFieldRef:
              containerName: test-container
              resource: requests.memory
        - name: MY_MEM_LIMIT
          valueFrom:
            resourceFieldRef:
              containerName: test-container
              resource: limits.memory
  restartPolicy: Never
EOF
```



这个清单中，你可以看到四个环境变量。`env` 字段定义了一组环境变量。 数组中第一个元素指定 `MY_CPU_REQUEST` 这个环境变量从容器的 `requests.cpu` 字段获取变量值。同样，其它的环境变量也是从特定于这个容器的字段中获取它们的变量值。



创建pod

```shell
kubectl apply -f dapi-envars-container.yaml 
```



查看容器日志

```shell
$ kubectl logs dapi-envars-resourcefieldref

1
1
33554432
67108864
```





### volume挂载

#### 使用pod字段作为环境变量的值

编辑yaml文件

```yaml
cat > dapi-volume-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: kubernetes-downwardapi-volume-example
  labels:
    zone: us-est-coast
    cluster: test-cluster1
    rack: rack-22
  annotations:
    build: two
    builder: john-doe
spec:
  containers:
    - name: client-container
      #image: registry.k8s.io/busybox
      image: mirrorgooglecontainers/busybox
      command: ["sh", "-c"]
      args:
      - while true; do
          if [[ -e /etc/podinfo/labels ]]; then
            echo -en '\n\n'; cat /etc/podinfo/labels; fi;
          if [[ -e /etc/podinfo/annotations ]]; then
            echo -en '\n\n'; cat /etc/podinfo/annotations; fi;
          sleep 5;
        done;
      volumeMounts:
        - name: podinfo
          mountPath: /etc/podinfo
  volumes:
    - name: podinfo
      downwardAPI:
        items:
          - path: "labels"
            fieldRef:
              fieldPath: metadata.labels
          - path: "annotations"
            fieldRef:
              fieldPath: metadata.annotations
EOF
```



创建pod

```shell
kubectl apply -f dapi-volume-pod.yaml 
```



查看容器日志

```shell
$ kubectl logs kubernetes-downwardapi-volume-example


cluster="test-cluster1"
rack="rack-22"
zone="us-est-coast"

build="two"
builder="john-doe"
kubectl.kubernetes.io/last-applied-configuration="{\"apiVersion\":\"v1\",\"kind\":\"Pod\",\"metadata\":{\"annotations\":{\"build\":\"two\",\"builder\":\"john-doe\"},\"labels\":{\"cluster\":\"test-cluster1\",\"rack\":\"rack-22\",\"zone\":\"us-est-coast\"},\"name\":\"kubernetes-downwardapi-volume-example\",\"namespace\":\"test\"},\"spec\":{\"containers\":[{\"args\":[\"while true; do if [[ -e /etc/podinfo/labels ]]; then echo -en '\\\\n\\\\n'; cat /etc/podinfo/labels; fi; if [[ -e /etc/podinfo/annotations ]]; then echo -en '\\\\n\\\\n'; cat /etc/podinfo/annotations; fi; sleep 5; done;\"],\"command\":[\"sh\",\"-c\"],\"image\":\"mirrorgooglecontainers/busybox\",\"name\":\"client-container\",\"volumeMounts\":[{\"mountPath\":\"/etc/podinfo\",\"name\":\"podinfo\"}]}],\"volumes\":[{\"downwardAPI\":{\"items\":[{\"fieldRef\":{\"fieldPath\":\"metadata.labels\"},\"path\":\"labels\"},{\"fieldRef\":{\"fieldPath\":\"metadata.annotations\"},\"path\":\"annotations\"}]},\"name\":\"podinfo\"}]}}\n"
kubernetes.io/config.seen="2022-10-30T16:43:22.852933515+08:00"
```



查看容器中 `/etc/podinfo/labels` 文件内容

```shell
$ kubectl exec kubernetes-downwardapi-volume-example -- cat /etc/podinfo/labels
cluster="test-cluster1"
rack="rack-22"
zone="us-est-coast"
```



查看容器中 `/etc/podinfo/annotations` 文件内容

```shell
$ kubectl exec kubernetes-downwardapi-volume-example -- cat /etc/podinfo/annotations
build="two"
builder="john-doe"
kubectl.kubernetes.io/last-applied-configuration="{\"apiVersion\":\"v1\",\"kind\":\"Pod\",\"metadata\":{\"annotations\":{\"build\":\"two\",\"builder\":\"john-doe\"},\"labels\":{\"cluster\":\"test-cluster1\",\"rack\":\"rack-22\",\"zone\":\"us-est-coast\"},\"name\":\"kubernetes-downwardapi-volume-example\",\"namespace\":\"test\"},\"spec\":{\"containers\":[{\"args\":[\"while true; do if [[ -e /etc/podinfo/labels ]]; then echo -en '\\\\n\\\\n'; cat /etc/podinfo/labels; fi; if [[ -e /etc/podinfo/annotations ]]; then echo -en '\\\\n\\\\n'; cat /etc/podinfo/annotations; fi; sleep 5; done;\"],\"command\":[\"sh\",\"-c\"],\"image\":\"mirrorgooglecontainers/busybox\",\"name\":\"client-container\",\"volumeMounts\":[{\"mountPath\":\"/etc/podinfo\",\"name\":\"podinfo\"}]}],\"volumes\":[{\"downwardAPI\":{\"items\":[{\"fieldRef\":{\"fieldPath\":\"metadata.labels\"},\"path\":\"labels\"},{\"fieldRef\":{\"fieldPath\":\"metadata.annotations\"},\"path\":\"annotations\"}]},\"name\":\"podinfo\"}]}}\n"
kubernetes.io/config.seen="2022-10-30T16:43:22.852933515+08:00"
```



查看 `/etc/podinfo` 目录下的文件

在输出中可以看到，`labels` 和 `annotations` 文件都在一个临时子目录中。 在这个例子中，这个临时子目录为 `..2022_10_30_08_43_23.124080477`。 在 `/etc/podinfo` 目录中，`..data` 是指向该临时子目录的符号链接。 另外在 `/etc/podinfo` 目录中，`labels` 和 `annotations` 也是符号链接。

```shell
$ kubectl exec kubernetes-downwardapi-volume-example -- ls -laR /etc/podinfo
/etc/podinfo:
total 4
drwxrwxrwt    3 root     root           120 Oct 30 08:43 .
drwxr-xr-x    1 root     root          4096 Oct 30 08:43 ..
drwxr-xr-x    2 root     root            80 Oct 30 08:43 ..2022_10_30_08_43_23.124080477
lrwxrwxrwx    1 root     root            31 Oct 30 08:43 ..data -> ..2022_10_30_08_43_23.124080477
lrwxrwxrwx    1 root     root            18 Oct 30 08:43 annotations -> ..data/annotations
lrwxrwxrwx    1 root     root            13 Oct 30 08:43 labels -> ..data/labels

/etc/podinfo/..2022_10_30_08_43_23.124080477:
total 8
drwxr-xr-x    2 root     root            80 Oct 30 08:43 .
drwxrwxrwt    3 root     root           120 Oct 30 08:43 ..
-rw-r--r--    1 root     root          1122 Oct 30 08:43 annotations
-rw-r--r--    1 root     root            58 Oct 30 08:43 labels
```



用符号链接可实现元数据的动态原子性刷新；更新将写入一个新的临时目录， 然后通过使用 [rename(2)](http://man7.org/linux/man-pages/man2/rename.2.html) 完成 `..data` 符号链接的原子性更新。

:::tip说明

如果容器以 [subPath](https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#using-subpath) 卷挂载方式来使用 Downward API，则该容器无法收到更新事件。

:::





#### 使用容器字段作为环境变量的值

编辑yaml文件

```yaml
cat > dapi-volume-container.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: kubernetes-downwardapi-volume-example-2
spec:
  containers:
    - name: client-container
      #image: registry.k8s.io/busybox:1.24
      image: mirrorgooglecontainers/busybox:1.24
      command: ["sh", "-c"]
      args:
      - while true; do
          echo -en '\n';
          if [[ -e /etc/podinfo/cpu_limit ]]; then
            echo -en '\n'; cat /etc/podinfo/cpu_limit; fi;
          if [[ -e /etc/podinfo/cpu_request ]]; then
            echo -en '\n'; cat /etc/podinfo/cpu_request; fi;
          if [[ -e /etc/podinfo/mem_limit ]]; then
            echo -en '\n'; cat /etc/podinfo/mem_limit; fi;
          if [[ -e /etc/podinfo/mem_request ]]; then
            echo -en '\n'; cat /etc/podinfo/mem_request; fi;
          sleep 5;
        done;
      resources:
        requests:
          memory: "32Mi"
          cpu: "125m"
        limits:
          memory: "64Mi"
          cpu: "250m"
      volumeMounts:
        - name: podinfo
          mountPath: /etc/podinfo
  volumes:
    - name: podinfo
      downwardAPI:
        items:
          - path: "cpu_limit"
            resourceFieldRef:
              containerName: client-container
              resource: limits.cpu
              divisor: 1m
          - path: "cpu_request"
            resourceFieldRef:
              containerName: client-container
              resource: requests.cpu
              divisor: 1m
          - path: "mem_limit"
            resourceFieldRef:
              containerName: client-container
              resource: limits.memory
              divisor: 1Mi
          - path: "mem_request"
            resourceFieldRef:
              containerName: client-container
              resource: requests.memory
              divisor: 1Mi
EOF
```



在这个清单中，你可以看到 Pod 有一个 [`downwardAPI` 卷](https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#downwardapi)， 并且这个卷会挂载到 Pod 内的单个容器的 `/etc/podinfo` 目录。

查看 `downwardAPI` 下面的 `items` 数组。 数组的每个元素定义一个 `downwardAPI` 卷。

第一个元素指定在名为 `client-container` 的容器中， 以 `1m` 所指定格式的 `limits.cpu` 字段的值应推送到名为 `cpu_limit` 的文件中。 `divisor` 字段是可选的，默认值为 `1`。1 的除数表示 CPU 资源的核数或内存资源的字节数。



创建pod

```shell
kubectl apply -f dapi-volume-container.yaml 
```



查看日志

```shell
$ kubectl logs -f kubernetes-downwardapi-volume-example-2 


250
125
64
32
```



查看容器 `/etc/podinfo/cpu_limit` 文件

```shell
$ kubectl exec kubernetes-downwardapi-volume-example-2 -- cat /etc/podinfo/cpu_limit
250
```



查看容器 `/etc/podinfo/cpu_request` 文件 

```shell
$ kubectl exec kubernetes-downwardapi-volume-example-2 -- cat /etc/podinfo/cpu_request
125
```



查看容器 `/etc/podinfo/mem_limit` 文件

```shell
$ kubectl exec kubernetes-downwardapi-volume-example-2 -- cat /etc/podinfo/mem_limit
64
```



查看容器 `/etc/podinfo/mem_request` 文件

```shell
$ kubectl exec kubernetes-downwardapi-volume-example-2 -- cat /etc/podinfo/mem_request
32
```

