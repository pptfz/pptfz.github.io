# 合并多个kubeconfig文件

## 合并kubeconfig文件

:::tip 说明

可以执行如下命令进行多个kubeconfig文件的合并

```shell
KUBECONFIG=config_name1:config_name2:config_name3 kubectl config view --merge --flatten > config.new
```

:::



假设 `$HOME/.kube/` 目录中有2个 kubeconfig 文件，默认的 `config` 以及自定义名称的 `custom-config`

```shell
KUBECONFIG=config:custom-config kubectl config view --merge --flatten > config.new
```



重命名旧 `$HOME.kube/config` 文件

```shell
mv $HOME/.kube/config $HOME/.kube/config.old
```



重命名 `config.new`

```shell
mv $HOME/.kube/config.new $HOME/.kube/config
```



### 列出集群上下文

:::tip 说明

这里的 `kind-ops-ingress` 是本机安装的kind集群，`orbstack` 是orbstack软件，`kubernetes-admin@kubernetes` 是自定义的k8s集群

:::

```shell
$ kubectl config get-contexts -o name
kind-ops-ingress
kubernetes-admin@kubernetes
orbstack
```



### 查看集群上下文

```shell
$ kubectl config get-contexts        
CURRENT   NAME                          CLUSTER            AUTHINFO           NAMESPACE
*         kind-ops-ingress              kind-ops-ingress   kind-ops-ingress   monitor
          kubernetes-admin@kubernetes   kubernetes         kubernetes-admin   default
          orbstack                      orbstack           orbstack
```



### 切换集群上下文

```shell
$ kubectl config use-context kubernetes-admin@kubernetes
Switched to context "kubernetes-admin@kubernetes".
```



### 删除集群上下文

:::tip 说明

执行如下命令可以删除集群上下文

```shell
kubectl config delete-context <context-name>
```

:::



先查看集群上下文

```shell
kubectl config get-contexts -o=name
```



删除某一个集群的上下文

```shell
kubectl config delete-context kubernetes-admin@kubernetes
```



## 将新集群加入kubeconfig文件

备份原有 `config` 文件

```shell
cp config{,.bak}
```



将新 `kubeconfig` 内容写入到 `new-kubeconfig.yaml`

```shell
cat config > new-kubeconfig.yaml
```



设置环境变量以同时使用 `~/.kube/config` 和 `new-kubeconfig.yaml` 文件

```shell
export KUBECONFIG=~/.kube/config:new-kubeconfig.yaml
```



合并 `kubeconfig` 文件

```shell
kubectl config view --merge --flatten > merged-config.yaml
```



将生成的合并文件替换原有的 `~/.kube/config` 文件

```shell
mv merged-config.yaml ~/.kube/config
```

