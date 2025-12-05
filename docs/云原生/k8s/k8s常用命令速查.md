# k8s常用命令速查

## kubectl

### 设置当前 context 的默认 namespace

```shell
export CONTEXT=production
export NS=production
kubectl config set-context $CONTEXT --namespace=$NS
```



## pod

### 强制删除pod

```sh
kubectl delete pod <pod-name> --grace-period=0 --force
```



### 查看pod包含的容器

:::tip 说明

一般情况下，一个pod可能包含多个容器

:::

通过自定义列

```shell
$ export POD_NAME='xxx'
$ kubectl get pod ${POD_NAME} -o 'custom-columns=NAME:.metadata.name,CONTAINERS:.spec.containers[*].name'
NAME                                            CONTAINERS
prometheus-prometheus-server-75c956b9cc-w8l4p   prometheus-prometheus-server-configmap-reload,prometheus-prometheus-server
```



通过 `jq` 命令

```shell
$ export POD_NAME='xxx'
$ kubectl get pod ${POD_NAME} -o json | jq '.spec.containers[].name'
"prometheus-prometheus-server-configmap-reload"
"prometheus-prometheus-server"
```



## node

### 查看node节点拥有的镜像

```shell
kubectl get nodes -o json | jq -r '.items[] | "\(.metadata.name): \(.status.images[].names[])"'
```



### 查看node节点上调度的pod

```sh
export NODE_NAME=''
kubectl get pods --field-selector spec.nodeName=$NODE_NAME
```



### 查看某个node节点上被 `oom kill` 的pod

```shell
export NODE_NAME=''
(
  echo -e "NODE_NAME\tPOD_NAME\tCONTAINER_NAME\tREASON\tFINISHED_AT"
  kubectl get pods --field-selector spec.nodeName=$NODE_NAME -o json | \
    jq -r '.items[] |
      .metadata.name as $pod_name |
      .spec.nodeName as $node_name |
      .status.containerStatuses[]? |
      select(.lastState.terminated.reason == "OOMKilled") |
      "\($node_name)\t\($pod_name)\t\(.name)\tOOMKilled\t\(.lastState.terminated.finishedAt)"'
) | column -t
```



### 查看某个node节点上运行的pod的资源分配情况

```shell
export NODE_NAME=''
(
  echo -e "POD\tREQUEST_CPU\tREQUEST_MEM\tLIMIT_CPU\tLIMIT_MEM"
  kubectl get pods --field-selector spec.nodeName=$NODE_NAME -o json | \
    jq -r '.items[] | 
      [.metadata.name, 
       (.spec.containers[] | 
          .resources.requests.cpu // "none", 
          .resources.requests.memory // "none", 
          .resources.limits.cpu // "none", 
          .resources.limits.memory // "none")] | @tsv'
) | column -t
```



## 存储类

### 设置默认存储类

```sh
export SC_NAME=openebs-hostpath
kubectl patch storageclass ${SC_NAME} -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```



## 查看证书过期时间

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="通过kubeadm命令" label="通过kubeadm命令" default>
:::tip 说明

**组件证书**：

- 例如 `admin.conf`、`apiserver`、`apiserver-kubelet-client` 等证书，有效期为 1 年。这些证书在 2025 年 11 月 8 日到期，目前还剩 **298 天**

**证书颁发机构 (CA)**：

- 根 CA (`ca`)、ETCD CA (`etcd-ca`)、以及前端代理 CA (`front-proxy-ca`) 的有效期为 **10 年**，到期时间是 2034 年 11 月 6 日

:::

```shell
$ kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Nov 08, 2025 09:40 UTC   298d            ca                      no      
apiserver                  Nov 08, 2025 09:40 UTC   298d            ca                      no      
apiserver-etcd-client      Nov 08, 2025 09:40 UTC   298d            etcd-ca                 no      
apiserver-kubelet-client   Nov 08, 2025 09:40 UTC   298d            ca                      no      
controller-manager.conf    Nov 08, 2025 09:40 UTC   298d            ca                      no      
etcd-healthcheck-client    Nov 08, 2025 09:40 UTC   298d            etcd-ca                 no      
etcd-peer                  Nov 08, 2025 09:40 UTC   298d            etcd-ca                 no      
etcd-server                Nov 08, 2025 09:40 UTC   298d            etcd-ca                 no      
front-proxy-client         Nov 08, 2025 09:40 UTC   298d            front-proxy-ca          no      
scheduler.conf             Nov 08, 2025 09:40 UTC   298d            ca                      no      
super-admin.conf           Nov 08, 2025 09:40 UTC   298d            ca                      no      

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Nov 06, 2034 09:40 UTC   9y              no      
etcd-ca                 Nov 06, 2034 09:40 UTC   9y              no      
front-proxy-ca          Nov 06, 2034 09:40 UTC   9y              no      
```

  </TabItem>
  <TabItem value="通过kubectl命令" label="通过kubectl命令">

组件证书

```shell
$ kubectl config view --raw -o jsonpath='{.users[*].user.client-certificate-data}' | base64 -d | openssl x509 -noout -dates
notBefore=Nov  8 09:35:40 2024 GMT
notAfter=Nov  8 09:40:40 2025 GMT
```



根证书

```shell
$ kubectl get configmap kube-root-ca.crt -n kube-system -o jsonpath='{.data.ca\.crt}' | openssl x509 -noout -dates
notBefore=Nov  8 09:35:40 2024 GMT
notAfter=Nov  6 09:40:40 2034 GMT
```

 

secret证书

```shell
$ export SECRET_NAME=xxx
$ kubectl get secret $SECRET_NAME -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -dates
notBefore=Dec 12 00:00:00 2024 GMT
notAfter=Dec 12 23:59:59 2025 GMT
```



```shell
$ export SECRET_NAME=xxx
$ kubectl get secret $SECRET_NAME -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -text | grep -A 2 -B 2 Validity
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=CN, O=WoTrus CA Limited, CN=WoTrus OV Server CA  [Run by the Issuer]
        Validity
            Not Before: Dec 12 00:00:00 2024 GMT
            Not After : Dec 12 23:59:59 2025 GMT
```





 </TabItem>
</Tabs>



## 查看未达到期望副本数的资源

```sh
kubectl get deploy --all-namespaces -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,READY:.status.readyReplicas,DESIRED:.spec.replicas --no-headers=true | awk '$3 != $4 && $NF != 0'
```



## 手动设置资源的副本数

```shell
kubectl scale deployment <deployment-name> --replicas=<desired-replica-count> -n <namespace>
```



## 污点

[污点官方文档](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/taint-and-toleration/)

### 查看所有节点的污点

```sh
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```



### 查看某个节点的污点

```sh
kubectl describe node <node-name> | grep Taints
```



### 给某个节点添加污点

:::tip 命令

```sh
kubectl taint nodes <node-name> key=value:effect
```

:::

示例

这将在 `node-1` 节点上设置一个名为 `key1`、值为 `value1` 的污点，效果为 `NoSchedule`，即不允许在具有此污点的节点上调度 Pod。

```sh
kubectl taint nodes node-1 key1=value1:NoSchedule
```



### 取消某个节点的污点

:::tip 命令

```sh
kubectl taint nodes <node-name> key:value-
```

:::

示例

这将从 `node-1` 节点上移除名为 `key1` 的污点

```sh
kubectl taint nodes node-1 key1:value-
```



## 标签

[标签官方文档](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)



### 查看所有节点标签

```sh
kubectl get nodes --show-labels
```



### 查看某个节点的标签

:::tip 命令

```sh
kubectl get nodes <node-name> --show-labels
```

:::



示例

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```



### 给某个节点添加标签

:::tip 命令

```sh
kubectl label nodes <your-node-name> key=value
```

:::



示例

给 `ops-ingress-worker3` 节点添加一个键为 `disktype` 值为 `ssd` 的标签

```sh
kubectl label nodes ops-ingress-worker3 disktype=ssd
```



查看

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,disktype=ssd,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```



### 取消某个节点的标签

:::tip 命令

**取消标签只需要指定键，不需要指定值**

```sh
kubectl label nodes <your-node-name> key-
```

:::



示例

取消 `ops-ingress-worker3` 节点添键为 `disktype` 的标签

```shell
kubectl label nodes ops-ingress-worker3 disktype-
```



查看

```sh
$ kubectl get nodes ops-ingress-worker3 --show-labels
NAME                  STATUS   ROLES    AGE   VERSION   LABELS
ops-ingress-worker3   Ready    <none>   57d   v1.27.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,ingress-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=ops-ingress-worker3,kubernetes.io/os=linux
```



## 调度

### 设置节点为不可调度

```shell
kubectl cordon $NODENAME
```



### 恢复节点为可调度

```shell
kubectl uncordon $NODENAME
```



### 清空节点

[清空节点官方文档](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/safely-drain-node/)

:::tip 说明

如果存在 DaemonSet 管理的 Pod，你将需要为 `kubectl` 设置 `--ignore-daemonsets` 以成功地清空节点。 `kubectl drain` 子命令自身实际上不清空节点上的 DaemonSet Pod 集合： DaemonSet 控制器（作为控制平面的一部分）会立即用新的等效 Pod 替换缺少的 Pod。 DaemonSet 控制器还会创建忽略不可调度污点的 Pod，这种污点允许在你正在清空的节点上启动新的 Pod。

:::



:::caution 注意

如果有一些 Pod 使用了 `emptyDir` 卷或本地存储，这些 Pod 默认情况下不会被删除。要强制删除这些 Pod，可以使用 `--delete-emptydir-data` 参数

```shell
$ kubectl drain --ignore-daemonsets 10.246.140.15
node/10.246.140.15 already cordoned
error: unable to drain node "10.246.140.15", aborting command...

There are pending nodes to be drained:
 10.246.140.15
error: cannot delete Pods with local storage (use --delete-emptydir-data to override): istio-system/istio-ingressgateway-6867ddc5fd-ldvfq, redis/drc-ecc-redis-0-0, redis/drc-ecc-redis-1-1, redis/drc-ecc-redis-2-0, redis/drc-local-test-1-1, redis/drc-local-test-2-1, redis/drc-local-test-7-0-1, redis/drc-test1-zone-stage-ten-2-0, redis/drc-uuap-redis-0-0
```

:::

```shell
kubectl drain --ignore-daemonsets $NODENAME
```



执行成功后最后提示如下

```sh
pod/xxx evicted
pod/xxx evicted
node/10.246.140.15 evicted
```



## 集群

### 查看当前集群的容器运行时

```shell
kubectl get nodes -o wide
```



```shell
export NODE_NAME='ops-ingress-worker'
kubectl describe no $NODE_NAME | grep 'Container Runtime'
```



```shell
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.nodeInfo.containerRuntimeVersion}{"\n"}{end}'
```







