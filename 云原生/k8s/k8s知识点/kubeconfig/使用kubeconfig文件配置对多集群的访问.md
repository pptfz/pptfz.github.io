# 使用kubeconfig文件配置对多集群的访问

[使用kubeconfig文件组织集群访问](https://kubernetes.io/zh-cn/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

[使用kubeconfig文件配置对多集群的访问](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)



## 定义集群、用户、上下文

假设现在有 `qa` 和 `pre` 2个集群，需要将2个集群的config信息合并，首先创建 `config` 文件，配置文件描述了集群、用户名和上下文

```yaml
cat > config << EOF
apiVersion: v1
kind: Config
preferences: {}

clusters:
- cluster:
  name: qa
- cluster:
  name: pre

users:
- name: qa
- name: pre

contexts:
- context:
  name: qa
- context:
  name: pre
EOF
```



## 配置

### 将集群详细信息添加到配置文件中

```sh
kubectl config --kubeconfig=config set-cluster pre --server=https://x.x.x.x --certificate-authority=pre-config
kubectl config --kubeconfig=config set-cluster qa --server=https://x.x.x.x --certificate-authority=qa-config
```





### 将用户详细信息添加到配置文件中

```sh
kubectl config --kubeconfig=config set-credentials pre --client-certificate=pre-config --client-key=pre-config
kubectl config --kubeconfig=config set-credentials qa --client-certificate=qa-config --client-key=qa-config
```



### 将上下文详细信息添加到配置文件中

```sh
kubectl config --kubeconfig=config set-context pre --cluster=pre --user=pre
kubectl config --kubeconfig=config set-context qa --cluster=qa --user=qa
```







```
kubectl config --kubeconfig=config view
```

