# 本机通过config文件连接多个k8s集群

# 背景说明

> **我们有多个k8s集群，并且想要通过config文件来连接多个k8s集群，方法就是将2个集群的 `config` 文件合并到一个 `config` 文件中，通过使用 `kubectl config use-context context_name` 来访问集群。简而言之就是通过设置 `context` 来让 `kubectl` 访问不同的k8s集群。**



# config文件信息

现在有2个 `config` 文件，一个是mac本机k8s集群文件 `config-mac`，另外一个是公司内网测试集群文件 `config-company`， 通过 `config` 信息，可以看到两个集群的 `cluster name` 、`context name` 以及用户信息。

config文件1 `config-mac` 内容

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: xxx
    server: https://kubernetes.docker.internal:6443
  name: docker-desktop
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
current-context: docker-desktop
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: xxx
    client-key-data: xxx
```



config文件2 `config-company` 内容

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: xxx
    server: https://10.0.19.31:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
preferences: {}
users:
- name: kubernetes-admin
  user:
    client-certificate-data: xxx
    client-key-data: xxx
```



# 合并config文件



```shell
cd $HOME/.kube/config
KUBECONFIG=config-mac:config-company kubectl config view --flatten > $HOME/.kube/config
```





# 使用说明

## 查看 `cluster name` 以及 `context name`

```yaml
$ kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://kubernetes.docker.internal:6443
  name: docker-desktop
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.19.31:6443
  name: kubernetes
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
- name: kubernetes-admin
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```



## 查看当前使用的集群

```shell
$ kubectl config current-context
docker-desktop
```



## 修改当前使用的集群

`kubernetes-admin@kubernetes` 是通过命令 `kubectl config view` 查询结果中与 `context` 同级的 `name` 中的集群名字

```shell
$ kubectl config use-context kubernetes-admin@kubernetes
Switched to context "kubernetes-admin@kubernetes".
```

