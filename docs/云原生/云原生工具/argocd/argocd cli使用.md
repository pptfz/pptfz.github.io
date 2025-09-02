# argocd cli使用

## 安装

[argocd cli官方安装文档](https://argo-cd.readthedocs.io/en/stable/cli_installation/#download-with-curl)



### 下载二进制文件

```shell
export ARGOCD_CLI_VERSION=3.1.1
export ARCHITECTURE=$(
  case "$(uname -m)" in
    x86_64) echo amd64 ;;
    aarch64) echo arm64 ;;
    *) echo "unsupported"; exit 1 ;;
  esac
)

wget https://github.com/argoproj/argo-cd/releases/download/v${ARGOCD_CLI_VERSION}/argocd-linux-${ARCHITECTURE}
```



### 移动二进制文件

```shell
mv argocd-linux-${ARCHITECTURE} /usr/local/bin/argocd && chmod +x /usr/local/bin/argocd  
```



### 查看版本

```shell
$ argocd version
argocd: v3.1.1+fa342d1
  BuildDate: 2025-08-25T16:00:16Z
  GitCommit: fa342d153e0e7942938256aea491a68439a53c44
  GitTreeState: clean
  GoVersion: go1.24.6
  Compiler: gc
  Platform: linux/arm64
{"level":"fatal","msg":"Argo CD server address unspecified","time":"2025-09-02T19:15:31+08:00"}
```



## 集群 cluster

### 登录集群

登录argocd

:::tip 说明

这里有警告是因为使用的证书是自签名证书，可以使用 `--insecure` 跳过

```shell
$ argocd login argocd.ops.com                      
WARNING: server certificate had error: tls: failed to verify certificate: x509: certificate signed by unknown authority. Proceed insecurely (y/n)?
```



使用 `--insecure` 跳过证书验证后又提示如下，这个警告信息表明，ArgoCD CLI 在尝试使用 gRPC 协议与服务器通信时失败，并建议你改用 **gRPC-Web** 协议（一种兼容浏览器和某些网络环境的 gRPC 变体）

```shell
$ argocd login argocd.ops.com --insecure           
{"level":"warning","msg":"Failed to invoke grpc call. Use flag --grpc-web in grpc calls. To avoid this warning message, use flag --grpc-web.","time":"2025-05-15T11:26:11+08:00"}
```

:::

```shell
$ argocd login argocd.ops.com --insecure --grpc-web         
Username: admin
Password: 
'admin:login' logged in successfully
Context 'argocd.ops.com' updated
```





### 查看集群

:::tip 说明

这里查看集群显示状态为 `Unknown` 是因为还没有创建应用，创建应用后状态就会显示 `Successful`

```shell
$ argocd cluster list
SERVER                          NAME        VERSION  STATUS   MESSAGE                                                  PROJECT
https://kubernetes.default.svc  in-cluster           Unknown  Cluster has no applications and is not being monitored.  
```

:::



```shell
$ argocd cluster list
SERVER                          NAME        VERSION  STATUS      MESSAGE  PROJECT
https://kubernetes.default.svc  in-cluster  1.32     Successful
```



### 添加集群

查看 `context` 名称

```sh
kubectl config get-contexts -o name
```



添加集群

:::tip 说明

在添加集群的时候会有如下警告，`WARNING: This will create a service account `argocd-manager` on the cluster referenced by context `kubernetes-admin@kubernetes` with full cluster level privileges.` 

这是因为默认是 **高权限操作** ，ArgoCD 会为目标集群创建以下资源：

- `ClusterRole`：绑定 `cluster-admin` 权限（最高权限）
- `ServiceAccount`：用于 ArgoCD 控制目标集群
- `ClusterRoleBinding`：将高权限角色绑定到 ServiceAccount

**安全风险提示**
警告明确告知你：这个操作会赋予 ArgoCD **完全的集群控制权**（包括删除节点、修改所有资源等），需谨慎执行

```shell
$ export CONTEXTNAME=kubernetes-admin@kubernetes
$ argocd cluster add $CONTEXTNAME
WARNING: This will create a service account `argocd-manager` on the cluster referenced by context `kubernetes-admin@kubernetes` with full cluster level privileges. Do you want to continue [y/N]? y
{"level":"info","msg":"ServiceAccount \"argocd-manager\" created in namespace \"kube-system\"","time":"2025-05-26T11:38:21+08:00"}
{"level":"info","msg":"ClusterRole \"argocd-manager-role\" created","time":"2025-05-26T11:38:21+08:00"}
{"level":"info","msg":"ClusterRoleBinding \"argocd-manager-role-binding\" created","time":"2025-05-26T11:38:21+08:00"}
{"level":"info","msg":"Created bearer token secret for ServiceAccount \"argocd-manager\"","time":"2025-05-26T11:38:21+08:00"}
Cluster 'https://10.0.0.10:6443' added
```

:::

```shell
export CONTEXTNAME='xxx'
argocd cluster add $CONTEXTNAME
```





### 删除集群

```shell
argocd cluster rm 集群名称
```



```shell
$ argocd cluster rm kubernetes-admin@kubernetes
Are you sure you want to remove 'kubernetes-admin@kubernetes'? Any Apps deploying to this cluster will go to health status Unknown.[y/n] y
Cluster 'kubernetes-admin@kubernetes' removed
{"level":"info","msg":"ClusterRoleBinding \"argocd-manager-role-binding\" deleted","time":"2025-05-26T14:35:58+08:00"}
{"level":"info","msg":"ClusterRole \"argocd-manager-role\" deleted","time":"2025-05-26T14:35:58+08:00"}
{"level":"info","msg":"ServiceAccount \"argocd-manager\" deleted","time":"2025-05-26T14:35:58+08:00"}
```



## 应用 app

### 查看应用

```shell
$ argocd app list
NAME              CLUSTER                         NAMESPACE  PROJECT  STATUS  HEALTH   SYNCPOLICY  CONDITIONS  REPO                                         PATH       TARGET
argocd/guestbook  https://kubernetes.default.svc  default    default  Synced  Healthy  Manual      <none>      https://gitee.com/pptfz/argocd-example-apps  guestbook
```



### 创建应用

:::tip 说明

使用 `argocd` 命令创建应用程序的语法如下，如果不加 `--project` 指定项目，则默认使用 `default` 项目

```shell
argocd app create 应用程序名称 \
  --repo git仓库地址 \
  --path git仓库子目录 \
  --dest-server 目标k8s集群地址 \
  --dest-namespace 应用部署的命名空间 \
  --project 项目名称
```

:::

```shell
export APP_NAME='guestbook'
export GIT_REPO='https://gitee.com/pptfz/argocd-example-apps'
export GIT_REPO_PATH='guestbook'
export DEST_CLUSTER='https://kubernetes.default.svc'
export DEST_CLUSTER_NAMESPACE='default'
export PROJECT='test'

argocd app create ${APP_NAME} \
  --repo ${GIT_REPO} \
  --path ${GIT_REPO_PATH} \
  --project ${PROJECT} \
  --dest-server ${DEST_CLUSTER} \
  --dest-namespace ${DEST_CLUSTER_NAMESPACE}
```



### 删除应用

```shell
$ argocd app delete argocd/guestbook
Are you sure you want to delete 'argocd/guestbook' and all its resources? [y/n] y
application 'argocd/guestbook' deleted
```



## 项目 proj

### 查看项目

:::tip 说明

argocd默认只有一个 `default` 项目，可以被修改，但是不可以被删除

:::

```shell
$ argocd proj list
NAME     DESCRIPTION  DESTINATIONS  SOURCES  CLUSTER-RESOURCE-WHITELIST  NAMESPACE-RESOURCE-BLACKLIST  SIGNATURE-KEYS  ORPHANED-RESOURCES  DESTINATION-SERVICE-ACCOUNTS
default               *,*           *        */*                         <none>                        <none>          disabled            <none>
```



### 创建项目

:::tip 说明

使用 `argocd` 命令创建项目的语法如下

-  `-d` 指定命名空间

  ```shell
  argocd proj create 项目名称 \
    -d 集群地址,命名空间1 \
    -d 集群地址,命名空间2 \
    -s 允许使用的git仓库地址1,允许使用的git仓库地址2
  ```

- 使用 `-s` 选项可以指定多个git仓库地址

:::

```shell
argocd proj create test \
  -d https://10.0.0.10:6443,test \
  -d https://10.0.0.10:6443,ops \
  -s https://gitee.com/pptfz/argocd-example-apps \
  -s https://github.com/argoproj/argocd-example-apps
```



如果创建应用的时候，部署的目标命名空间没有在创建项目时允许的命名空间则会报错如下

![iShot_2025-05-27_16.23.13](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-27_16.23.13.png)



```shell
export APP_NAME='abc'
export GIT_REPO='https://gitee.com/pptfz/argocd-example-apps'
export GIT_REPO_PATH='guestbook'
export DEST_CLUSTER='https://10.0.0.10:6443'
export DEST_CLUSTER_NAMESPACE='abc'
export PROJECT='test'

argocd app create ${APP_NAME} \
  --repo ${GIT_REPO} \
  --path ${GIT_REPO_PATH} \
  --project ${PROJECT} \
  --dest-server ${DEST_CLUSTER} \
  --dest-namespace ${DEST_CLUSTER_NAMESPACE}
{"level":"fatal","msg":"rpc error: code = InvalidArgument desc = application spec for abc is invalid: InvalidSpecError: application destination server 'https://10.0.0.10:6443' and namespace 'abc' do not match any of the allowed destinations in project 'test'","time":"2025-05-27T16:32:14+08:00"}
```



### 删除项目

```shell
argocd proj delete test
```





