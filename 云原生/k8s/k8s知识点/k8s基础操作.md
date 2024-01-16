# k8s基础操作

[toc]



## 查看k8s中所有命名空间里面的pod

`kubectl get pod -A` 或 `kubectl get pod --all-namespaces`



| 字段      | 说明                                                         |
| --------- | ------------------------------------------------------------ |
| NAMESPACE | pod所属的命名空间                                            |
| NAME      | pod的名称                                                    |
| READY     | 表示pod是否就绪（Ready）的状态   格式为 `当前就绪的容器数量/总容器数量` |
| STATUS    | 表示pod的当前状态。常⻅的状态有Running（运行中）、Pending（等待中）、CrashLoopBackOff（崩溃循环中）、Error（错误）、Backoff（反复错误）、Terminating（正在删除） |
| RESTARTS  | 表示pod重启的次数                                            |
| AGE       | 表示pod创建的时间，以时间单位（如小时、分钟或秒）的格式显示  |



```sh
$ kubectl get pod -A      
NAMESPACE            NAME                                                READY   STATUS    RESTARTS        AGE
kube-system          coredns-5d78c9869d-26wvz                            1/1     Running   0               3m39s
kube-system          coredns-5d78c9869d-ns7rp                            1/1     Running   0               3m46s
kube-system          etcd-ops-ingress-control-plane                      1/1     Running   0               3m33s
kube-system          kindnet-8j6nh                                       1/1     Running   0               3m30s
kube-system          kindnet-bv6bj                                       1/1     Running   0               3m31s
kube-system          kindnet-p568d                                       1/1     Running   0               3m26s
kube-system          kindnet-wsgkj                                       1/1     Running   0               3m28s
kube-system          kube-apiserver-ops-ingress-control-plane            1/1     Running   0               3m26s
kube-system          kube-controller-manager-ops-ingress-control-plane   1/1     Running   0               2m55s
kube-system          kube-proxy-gqghp                                    1/1     Running   0               3m21s
kube-system          kube-proxy-k9j7w                                    1/1     Running   0               3m24s
kube-system          kube-proxy-q7gwp                                    1/1     Running   0               3m22s
kube-system          kube-proxy-x5w8c                                    1/1     Running   0               3m19s
kube-system          kube-scheduler-ops-ingress-control-plane            1/1     Running   0               2m22s
local-path-storage   local-path-provisioner-6bc4bddd6b-7jwxg             1/1     Running   0               67s
```



## 查看某个命名空间的pod

`kubectl get pod -n 命名空间` 或 `kubectl get pod --namespace 命名空间` 



```sh
$ kubectl get pod -n local-path-storage
NAME                                      READY   STATUS    RESTARTS   AGE
local-path-provisioner-6bc4bddd6b-7jwxg   1/1     Running   0          22m
```



不指定命名空间默认显示 `default` 命名空间的pod

```sh
$ kubectl get pod
No resources found in default namespace.
```



## 创建一个pod

`kubectl create deployment 名称 --image 镜像:版本 --replicas 副本数量`



| 参数       | 说明                                         |
| ---------- | -------------------------------------------- |
| 名称       | deployment名称，必须有且同一命名空间名称唯一 |
| --image    | 指定pod镜像，必须有                          |
| --replicas | 非必须，如果不设置默认副本数为1              |



创建deployment

```sh
$ kubectl create deployment test --image nginx:latest --replicas 2
deployment.apps/test created
```



查看deployment

```sh
$ kubectl get deployment                                          
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
test   2/2     2            2           4m36s
```



查看pod

```sh
$  kubectl get pods
NAME                    READY   STATUS    RESTARTS   AGE
test-7fbf5cfb6d-brtbb   1/1     Running   0          4m32s
test-7fbf5cfb6d-qwsdx   1/1     Running   0          4m32s
```



## 查看pod详细信息

`kubectl describe pod名称`



```sh
$ kubectl describe pod test-7fbf5cfb6d-brtbb
Name:             test-7fbf5cfb6d-brtbb
Namespace:        default
Priority:         0
Service Account:  default
Node:             ops-ingress-worker3/172.18.0.4
Start Time:       Thu, 23 Nov 2023 10:35:37 +0800
Labels:           app=test
                  pod-template-hash=7fbf5cfb6d
Annotations:      <none>
Status:           Running
IP:               10.244.3.6
IPs:
  IP:           10.244.3.6
Controlled By:  ReplicaSet/test-7fbf5cfb6d
Containers:
  nginx:
    Container ID:   containerd://91a61ae0679f49df43318853465e55bc7cf72cca3e9727c180a21119ecbaf7a5
    Image:          nginx:latest
    Image ID:       docker.io/library/nginx@sha256:10d1f5b58f74683ad34eb29287e07dab1e90f10af243f151bb50aa5dbb4d62ee
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Thu, 23 Nov 2023 10:38:45 +0800
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-99j67 (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  kube-api-access-99j67:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  10m    default-scheduler  Successfully assigned default/test-7fbf5cfb6d-brtbb to ops-ingress-worker3
  Normal  Pulling    10m    kubelet            Pulling image "nginx:latest"
  Normal  Pulled     7m19s  kubelet            Successfully pulled image "nginx:latest" in 2m55.333581167s (2m55.333657653s including waiting)
  Normal  Created    7m18s  kubelet            Created container nginx
  Normal  Started    7m10s  kubelet            Started container nginx
```



## 列出所有deployment的信息







