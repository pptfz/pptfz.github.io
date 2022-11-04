# 使用 Deployment 运行一个无状态应用

[使用deployment创建无状态应用官方文档](https://kubernetes.io/zh-cn/docs/tasks/run-application/run-stateless-application-deployment/)

## 创建Deployment

编辑yaml文件

```yaml
cat > deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # 告知 Deployment 运行 2 个与该模板匹配的 Pod
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
EOF
```



创建deployment

```shell
$ kubectl apply -f  deployment.yaml 
deployment.apps/nginx-deployment created
```



查看deployment

```shell
$ kubectl get deploy
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   2/2     2            2           15s
```



查看deploy描述

```shell
$ kubectl describe deploy nginx-deployment 
Name:                   nginx-deployment
Namespace:              test
CreationTimestamp:      Fri, 04 Nov 2022 21:48:18 +0800
Labels:                 <none>
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=nginx
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.14.2
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-66b6c48dd5 (2/2 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  27s   deployment-controller  Scaled up replica set nginx-deployment-66b6c48dd5 to 2
```



查看deployment创建的pod

```shell
$ kubectl get pods -l app=nginx
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-66b6c48dd5-fqn4x   1/1     Running   0          39s
nginx-deployment-66b6c48dd5-jrpff   1/1     Running   0          39s
```



## 更新 Deployment

### 命令

```shell
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1
```



### 文件

编辑yaml文件

```yaml
cat > deployment-update.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.16.1 # 将 nginx 版本从 1.14.2 更新为 1.16.1
        ports:
        - containerPort: 80
EOF
```



创建新的deployment

```shell
$ kubectl apply -f deployment-update.yaml 
deployment.apps/nginx-deployment configured
```



查看pod，可以看到之间的旧pod正在被删除

```shell
$ kubectl get pods -l app=nginx
NAME                                READY   STATUS        RESTARTS   AGE
nginx-deployment-559d658b74-7xzs7   1/1     Running       0          4s
nginx-deployment-559d658b74-j6qf6   1/1     Running       0          2s
nginx-deployment-66b6c48dd5-fqn4x   1/1     Terminating   0          70s
```



## 通过增加副本数来扩缩应用

### 命令

```shell
kubectl scale deployment nginx-deployment --replicas=6
```



### 文件

你可以通过应用新的 YAML 文件来增加 Deployment 中 Pod 的数量。 下面的 YAML 文件将 `replicas` 设置为 4，指定该 Deployment 应有 4 个 Pod

编辑yaml文件

```yaml
cat > deployment-scale.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 4 # 将副本数从 2 更新为 4
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
EOF
```



创建扩容的deployment

```shell
$ kubectl apply -f deployment-scale.yaml 
deployment.apps/nginx-deployment configured
```



查看pod

```shell
$ kubectl get pods -l app=nginx
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-66b6c48dd5-4cfqb   1/1     Running   0          7s
nginx-deployment-66b6c48dd5-96m4l   1/1     Running   0          9s
nginx-deployment-66b6c48dd5-fwnk9   1/1     Running   0          7s
nginx-deployment-66b6c48dd5-hxrkd   1/1     Running   0          9s
```



## 删除 Deployment

基于名称删除 Deployment：

```shell
kubectl delete deployment nginx-deployment
```