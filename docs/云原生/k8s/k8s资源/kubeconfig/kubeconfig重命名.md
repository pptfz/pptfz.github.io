# kubeconfig重命名

:::tip 说明

kubeconfig重命名需要修改 `NAME` 、`CLUSTER` 、`AUTHINFO` 3个指标

```shell
$ k config get-contexts 
CURRENT   NAME                          CLUSTER      AUTHINFO           NAMESPACE
*         kubernetes-admin@kubernetes   kubernetes   kubernetes-admin   kube-prometheus-stack
```

:::

:::caution 注意

macOS 的 `sed -i` 需要一个参数指定备份后缀（可以是空字符串，但空字符串后面不能直接跟文件名，必须写成 `-i ''` ），格式是 `sed -i '' "s/old/new/g" 文件名`

```shell
sed -i '' "s/name: $OLD_AUTHINFO/name: $NEW_AUTHINFO/g" $KUBE_CONFIG
sed -i '' "s/user: $OLD_AUTHINFO/user: $NEW_AUTHINFO/g" $KUBE_CONFIG

sed -i '' "s/name: $OLD_CLUSTER/name: $NEW_CLUSTER/g" $KUBE_CONFIG
sed -i '' "s/cluster: $OLD_CLUSTER/cluster: $NEW_CLUSTER/g" $KUBE_CONFIG
```

:::

```shell
# 设置环境变量
export OLD_NAME=kubernetes-admin@kubernetes
export OLD_CLUSTER=kubernetes
export OLD_AUTHINFO=kubernetes-admin

export NEW_NAME=rocky10
export NEW_CLUSTER=rocky10
export NEW_AUTHINFO=rocky10

# config文件路径
export KUBE_CONFIG=~/.kube/config

# 修改 contexts 名
kubectl config rename-context $OLD_NAME $NEW_NAME

# 修改 users 名
sed -i "s/name: \"$OLD_AUTHINFO\"/name: \"$NEW_AUTHINFO\"/g" $KUBE_CONFIG
sed -i "s/user: \"$OLD_AUTHINFO\"/user: \"$NEW_AUTHINFO\"/g" $KUBE_CONFIG

# 修改 cluster 名
sed -i "s/name: $OLD_CLUSTER/name: $NEW_CLUSTER/g" ~/.kube/config
sed -i "s/cluster: $OLD_CLUSTER/cluster: $NEW_CLUSTER/g" ~/.kube/config
```



修改完成后查看

```shell
$ k config get-contexts 
CURRENT   NAME      CLUSTER   AUTHINFO   NAMESPACE
*         rocky10   rocky10   rocky10    kube-prometheus-stack
```

