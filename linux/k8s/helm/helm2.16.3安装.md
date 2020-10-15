# k8s集群安装helm安装

**说明**

> **在k8s集群安装helm v2.16.3，kubeadm安装k8s v1.17.4版本**



[helm发行版本github地址](https://github.com/helm/helm/releases)



[本文严重抄袭至互联网](https://cloud.tencent.com/developer/article/1444758)



# 一、helm简介

很多人都使用过Ubuntu下的ap-get或者CentOS下的yum, 这两者都是Linux系统下的包管理工具。采用apt-get/yum,应用开发者可以管理应用包之间的依赖关系，发布应用；用户则可以以简单的方式查找、安装、升级、卸载应用程序。

我们可以将Helm看作Kubernetes下的apt-get/yum。Helm是Deis (https://deis.com/) 开发的一个用于kubernetes的包管理器。每个包称为一个Chart，一个Chart是一个目录（一般情况下会将目录进行打包压缩，形成name-version.tgz格式的单一文件，方便传输和存储）。

对于应用发布者而言，可以通过Helm打包应用，管理应用依赖关系，管理应用版本并发布应用到软件仓库。

对于使用者而言，使用Helm后不用需要了解Kubernetes的Yaml语法并编写应用部署文件，可以通过Helm下载并在kubernetes上安装需要的应用。

除此以外，Helm还提供了kubernetes上的软件部署，删除，升级，回滚应用的强大功能。

# Helm 组件及相关术语

## Helm

> Helm 是一个命令行下的客户端工具。主要用于 Kubernetes 应用程序 Chart 的创建、打包、发布以及创建和管理本地和远程的 Chart 仓库。

## Tiller

> Tiller 是 Helm 的服务端，部署在 Kubernetes 集群中。Tiller 用于接收 Helm 的请求，并根据 Chart 生成 Kubernetes 的部署文件（ Helm 称为 Release ），然后提交给 Kubernetes 创建应用。Tiller 还提供了 Release 的升级、删除、回滚等一系列功能。

## Chart

> Helm 的软件包，采用 TAR 格式。类似于 APT 的 DEB 包或者 YUM 的 RPM 包，其包含了一组定义 Kubernetes 资源相关的 YAML 文件。

## Repoistory

> Helm 的软件仓库，Repository 本质上是一个 Web 服务器，该服务器保存了一系列的 Chart 软件包以供用户下载，并且提供了一个该 Repository 的 Chart 包的清单文件以供查询。Helm 可以同时管理多个不同的 Repository。

## Release

> 使用 `helm install` 命令在 Kubernetes 集群中部署的 Chart 称为 Release。
>
>  注：需要注意的是：Helm 中提到的 Release 和我们通常概念中的版本有所不同，这里的 Release 可以理解为 Helm 使用 Chart 包部署的一个应用实例。 

# Helm工作原理

![iShot2020-10-15 14.44.49](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 14.44.49.png)



**Chart Install 过程：**

1. Helm从指定的目录或者tgz文件中解析出Chart结构信息
2. Helm将指定的Chart结构和Values信息通过gRPC传递给Tiller
3. Tiller根据Chart和Values生成一个Release
4. Tiller将Release发送给Kubernetes用于生成Release

**Chart Update过程：**

1. Helm从指定的目录或者tgz文件中解析出Chart结构信息
2. Helm将要更新的Release的名称和Chart结构，Values信息传递给Tiller
3. Tiller生成Release并更新指定名称的Release的History
4. Tiller将Release发送给Kubernetes用于更新Release

**Chart Rollback过程：**

1. Helm将要回滚的Release的名称传递给Tiller
2. Tiller根据Release的名称查找History
3. Tiller从History中获取上一个Release
4. Tiller将上一个Release发送给Kubernetes用于替换当前Release



# 二、helm安装

## 客户端helm安装

### 1.下载helm客户端

```python
wget https://get.helm.sh/helm-v2.16.3-linux-amd64.tar.gz
```



### 2.解压缩并拷贝helm二进制文件

```python
tar xf helm-v2.16.3-linux-amd64.tar.gz
cp linux-amd64/helm /usr/local/bin
```



## 服务端tiller安装

### 1.集群每个节点安装socat

> **否则会报错``Error: cannot connect to Tiller``**

```python
yum install -y socat 
```



### 2.初始化helm，部署tiller

Tiller 是以 Deployment 方式部署在 Kubernetes 集群中的，只需执行``helm init``命令便可简单的完成安装，但是Helm默认会去 storage.googleapis.com 拉取镜像。。。。。。这里需要使用阿里云的仓库完成安装

```python
#添加阿里云的仓库
helm init --client-only --stable-repo-url https://aliacs-app-catalog.oss-cn-hangzhou.aliyuncs.com/charts/
helm repo add incubator https://aliacs-app-catalog.oss-cn-hangzhou.aliyuncs.com/charts-incubator/
helm repo update

#创建服务端
helm init --service-account tiller --upgrade -i registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.16.3  --stable-repo-url https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts

#创建TLS认证服务端，参考地址：https://github.com/gjmzj/kubeasz/blob/master/docs/guide/helm.md

helm init --service-account tiller --upgrade -i registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.16.3 --tiller-tls-cert /etc/kubernetes/ssl/tiller001.pem --tiller-tls-key /etc/kubernetes/ssl/tiller001-key.pem --tls-ca-cert /etc/kubernetes/ssl/ca.pem --tiller-namespace kube-system --stable-repo-url https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts    
```



### 3.给tiller授权

> 因为 Helm 的服务端 Tiller 是一个部署在 Kubernetes 中 kube-system namespace下的deployment，它会去连接 kube-api在Kubernetes里创建和删除应用。
>
> 而从Kubernetes1.6版本开始，API Server 启用了RBAC授权。目前的Tiller部署时默认没有定义授权的ServiceAccount，这会导致访问API Server时被拒绝。所以我们需要明确为Tiller部署添加授权。

**创建 Kubernetes 的服务帐号和绑定角色**

```python
kubectl create serviceaccount --namespace kube-system tiller

kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
```

**为tiller设置帐号**

```python
#使用kubectl patch更新API对象
kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}' 

#验证是否授权成功
kubectl get deploy --namespace kube-system   tiller-deploy  --output yaml|grep  serviceAccount
      serviceAccount: tiller
      serviceAccountName: tiller
```



### 4.验证tiller是否安装成功

```python
kubectl -n kube-system get pods|grep tiller
tiller-deploy-6d8dfbb696-4cbcz             1/1     Running   0          88s

输入命令	helm version	显示结果以下既为成功
Client: &version.Version{SemVer:"v2.16.3", GitCommit:"1ee0254c86d4ed6887327dabed7aa7da29d7eb0d", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.16.3", GitCommit:"1ee0254c86d4ed6887327dabed7aa7da29d7eb0d", GitTreeState:"clean"}
```



### 5.卸载helm服务端tiller

```python
$ helm reset 
或
$ helm reset -f		强制删除
```



# 三、helm使用

### 1.更换仓库

> 若遇到Unable to get an update from the “stable” chart repository ([https://kubernetes-charts.storage.googleapis.com](https://kubernetes-charts.storage.googleapis.com/)) 错误 手动更换stable 存储库为阿里云的存储库

```python
#先移除原先的仓库
helm repo remove stable

#添加新的仓库地址
helm repo add stable https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts
  
#更新仓库
helm repo update
```



### 2.查看在存储库中可用的所有 Helm charts：

```python
$ helm search |head -5
NAME                                            	CHART VERSION	APP VERSION	DESCRIPTION                                                 
incubator/ack-advanced-horizontal-pod-autoscaler	0.1.0        	1.0        	A Helm chart for Kubernetes                                 
incubator/ack-ahas-pilot                        	1.7.2        	1.7.2      	A cloud service that aims to improve the high availabilit...
incubator/ack-ahas-sentinel-pilot               	0.1.1        	0.1.1      	Ahas sentinel Pilot - Webhook Admission Controller          
incubator/ack-ahas-springcloud-gateway          	0.1.1        	0.1.1      	Spring Cloud Gateway with AHAS Sentinel integration Helm ...


#更新charts列表
helm repo update
```



### 3.安装ingress-nginx

> Monocular是一个开源软件，用于管理kubernetes上以Helm Charts形式创建的服务，可以通过它的web页面来安装helm Charts

创建rbac

```python
cat > helm.rbac.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiller
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: tiller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: tiller
    namespace: kube-system
EOF
```

```python
kubectl apply -f helm.rbac.yaml
```



安装Nginx Ingress controller，安装的k8s集群启用了RBAC，则一定要加rbac.create=true参数

```javascript
helm install stable/nginx-ingress \
-n nginx-ingress \
--namespace kube-system  \
--set controller.hostNetwork=true,rbac.create=true \
--set controller.replicaCount=1


结果报错如下
Error: validation failed: unable to recognize "": no matches for kind "Deployment" in version "extensions/v1beta1"


解决方法
将Deployment和StatefuSet apiVersion更改为apiVersion: apps/v1

1.先search
执行	helm search nginx-ingress

2.如果有兼容性问题，需要手动先fetch
helm fetch stable/nginx-ingress

然后会下载nginx-ingress-0.9.5.tgz

解压缩这个包，然后搜索extensions/v1beta1
[root@k8s-master ~]# grep -R "extensions/v1beta1" nginx-ingress
nginx-ingress/templates/NOTES.txt:  apiVersion: extensions/v1beta1
nginx-ingress/templates/controller-daemonset.yaml:apiVersion: extensions/v1beta1
nginx-ingress/templates/controller-deployment.yaml:apiVersion: extensions/v1beta1
nginx-ingress/templates/default-backend-deployment.yaml:apiVersion: extensions/v1beta1

把以上这些文件中的v1beta1修改为v1

grep -irl "extensions/v1beta1" nginx-ingress | grep deploy | xargs sed -i 's#extensions/v1beta1#apps/v1#g'
 
修改完后应用本地的nginx-ingress包，但是不会操作！！！


创建helm-rbac.yaml文件后手动删除了，结果报错如下

Error: the server has asked for the client to provide credentials

把运行的tiller的pod干掉，让他自动重启
```