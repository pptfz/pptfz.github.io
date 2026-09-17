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
sed -i '' "s/name: \"$OLD_AUTHINFO\"/name: \"$NEW_AUTHINFO\"/g; s/user: \"$OLD_AUTHINFO\"/user: \"$NEW_AUTHINFO\"/g; s/name: $OLD_CLUSTER/name: $NEW_CLUSTER/g; s/cluster: $OLD_CLUSTER/cluster: $NEW_CLUSTER/g" "$KUBE_CONFIG"
```

:::

```shell
# 设置环境变量
export OLD_NAME=xxx
export OLD_CLUSTER=xxx
export OLD_AUTHINFO=xxx

export NEW_NAME=xxx
export NEW_CLUSTER=xxx
export NEW_AUTHINFO=xxx

# kubeconfig 路径
export KUBE_CONFIG="$HOME/.kube/config"

# 备份 kubeconfig
cp "$KUBE_CONFIG" "$KUBE_CONFIG.bak"

# 修改 context 名
kubectl --kubeconfig="$KUBE_CONFIG" config rename-context "$OLD_NAME" "$NEW_NAME"

# 修改 user 名及 cluster 名
sed -i "s/name: \"$OLD_AUTHINFO\"/name: \"$NEW_AUTHINFO\"/g; s/user: \"$OLD_AUTHINFO\"/user: \"$NEW_AUTHINFO\"/g; s/name: $OLD_CLUSTER/name: $NEW_CLUSTER/g; s/cluster: $OLD_CLUSTER/cluster: $NEW_CLUSTER/g" "$KUBE_CONFIG"

# 查看修改结果
kubectl --kubeconfig="$KUBE_CONFIG" config get-contexts

# 查看当前 context
kubectl --kubeconfig="$KUBE_CONFIG" config current-context
```



修改完成后查看

```shell
$ k config get-contexts 
CURRENT   NAME      CLUSTER   AUTHINFO   NAMESPACE
*         rocky10   rocky10   rocky10    kube-prometheus-stack
```

