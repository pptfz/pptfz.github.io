# argocd示例应用

[argocd示例应用github](https://github.com/argoproj/argocd-example-apps)

以下是argocd官方提供的示例应用

| 应用                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [guestbook](https://github.com/argoproj/argocd-example-apps/blob/master/guestbook) | 用纯 YAML 格式编写一个简单的 `Hello World` 留言板应用        |
| [helm-guestbook](https://github.com/argoproj/argocd-example-apps/blob/master/helm-guestbook) | 使用 Helm Chart 部署的示例                                   |
| [jsonnet-guestbook](https://github.com/argoproj/argocd-example-apps/blob/master/jsonnet-guestbook) | 使用 jsonnet 部署的示例                                      |
| [jsonnet-guestbook-tla](https://github.com/argoproj/argocd-example-apps/blob/master/jsonnet-guestbook-tla) | 使用 jsonnet 部署的示例，并支持通过顶层参数（top-level arguments）动态配置应用行为（如调整副本数、镜像版本、服务端口等） |
| [kustomize-guestbook](https://github.com/argoproj/argocd-example-apps/blob/master/kustomize-guestbook) | 使用 Kustomize（版本 2+）部署的示例                          |
| [pre-post-sync](https://github.com/argoproj/argocd-example-apps/blob/master/pre-post-sync) | 演示 Argo CD PreSync 和 PostSync 钩子                        |
| [sync-waves](https://github.com/argoproj/argocd-example-apps/blob/master/sync-waves) | 演示利用 Argo CD 的同步波浪（Sync Waves）和钩子（Hooks）功能，实现分阶段、有依赖关系的应用部署 |
| [helm-dependency](https://github.com/argoproj/argocd-example-apps/blob/master/helm-dependency) | 对来自上游仓库的现成 Helm Chart（即开箱即用的标准化 Chart）进行自定义配置 |
| [sock-shop](https://github.com/argoproj/argocd-example-apps/blob/master/sock-shop) | 一个微服务demo([https://microservices-demo.github.io](https://microservices-demo.github.io/)) |
| [plugins](https://github.com/argoproj/argocd-example-apps/blob/master/plugins) | 演示如何在 Argo CD 中使用配置管理插件（Config Management Plugins, CMP）的示例应用 |
| [blue-green](https://github.com/argoproj/argocd-example-apps/blob/master/blue-green) | 使用 [Argo Rollouts](https://github.com/argoproj/argo-rollouts) 完成蓝绿部署 |
| [apps](https://github.com/argoproj/argocd-example-apps/blob/master/apps) | 其他应用程序组成的应用                                       |



## 创建应用

### UI页面

#### 创建应用

`Applications` -> `+ NEW APP`

![iShot_2025-05-21_17.02.41](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-21_17.02.41.png)





#### `GENERAL(一般)` 配置

![iShot_2025-05-23_10.58.56](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-23_10.58.56.png)



#### `SOURCE(git仓库)` 配置

![iShot_2025-05-23_11.06.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-23_11.06.54.png)





#### `DESTINATION(目标部署集群)` 配置

![iShot_2025-05-23_11.11.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-23_11.11.55.png)



### CLI命令行

#### 登录argocd

```shell
$ argocd login argocd.ops.com --insecure --grpc-web         
Username: admin
Password: 
'admin:login' logged in successfully
Context 'argocd.ops.com' updated
```



#### 查看当前集群

```shell
$ argocd cluster list
SERVER                          NAME        VERSION  STATUS   MESSAGE                                                  PROJECT
https://kubernetes.default.svc  in-cluster           Unknown  Cluster has no applications and is not being monitored.
```



#### 设置当前命名空间为 `argocd`

```shell
kubectl config set-context --current --namespace=argocd
```



#### 创建应用程序

:::tip 说明

使用 `argocd` 命令创建应用程序的语法如下

```shell
argocd app create 应用程序名称 \
  --repo git仓库地址 \
  --path git仓库子目录 \
  --dest-server 目标k8s集群地址 \
  --dest-namespace 应用部署的命名空间
```

:::

```shell
export APP_NAME='guestbook'
export GIT_REPO='https://gitee.com/pptfz/argocd-example-apps'
export GIT_REPO_PATH='guestbook'
export DEST_CLUSTER='https://kubernetes.default.svc'
export DEST_CLUSTER_NAMESPACE='default'

argocd app create ${APP_NAME} \
  --repo ${GIT_REPO} \
  --path ${GIT_REPO_PATH} \
  --dest-server ${DEST_CLUSTER} \
  --dest-namespace ${DEST_CLUSTER_NAMESPACE}
```



## 查看应用

应用创建完成后就可以开始同步了

![iShot_2025-05-23_11.18.17](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-23_11.18.17.png)



在配置的目标命名空间 `default` 中查看，可以看到pod已经成功运行了

查看pod

```shell
$ k -n default get pods
NAME                            READY   STATUS    RESTARTS   AGE
guestbook-ui-7cf4fd7cb9-c29kb   1/1     Running   0          119s
```



查看svc

```shell
$ k -n default get svc
NAME           TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
guestbook-ui   ClusterIP   10.96.68.1   <none>        80/TCP    2m15s
```



在官方示例应用 [argocd-example-apps](https://github.com/argoproj/argocd-example-apps) 中，我们部署的是示例应用 `guestbook` ，以下为yaml文件

[guestbook/guestbook-ui-deployment.yaml](https://github.com/argoproj/argocd-example-apps/blob/master/guestbook/guestbook-ui-deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: guestbook-ui
spec:
  replicas: 1
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: guestbook-ui
  template:
    metadata:
      labels:
        app: guestbook-ui
    spec:
      containers:
      - image: quay.io/argoprojlabs/argocd-e2e-container:0.2
        name: guestbook-ui
        ports:
        - containerPort: 80
```



[guestbook/guestbook-ui-svc.yaml](https://github.com/argoproj/argocd-example-apps/blob/master/guestbook/guestbook-ui-svc.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: guestbook-ui
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: guestbook-ui
```



