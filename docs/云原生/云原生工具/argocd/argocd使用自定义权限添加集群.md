# argocd使用自定义权限添加集群

## 创建自定义权限

创建自定义 `serviceaccount` 名称为 `argocd-limited-role`

```shell
kubectl create serviceaccount argocd-limited-role -n kube-system
```



创建创建自定义 `ClusterRole` ，名称为 `argocd-limited-role`

```yaml
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argocd-limited-role
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["get", "list", "watch", "create", "update"]
EOF
```



创建自定义 `ClusterRoleBinding` ，名称为 `argocd-limited-role-binding`

```yaml
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argocd-limited-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: argocd-limited-role
subjects:
- kind: ServiceAccount
  name: argocd-limited-role
  namespace: kube-system
EOF
```



## 添加集群



:::tip 说明

创建自定义权限后，添加集群时通过 `--service-account` 参数指定 `serviceaccount` ，由于创建的自定义权限没有 `delete` 等权限(非最高权限)，所以不会有如下警告

```shell
WARNING: This will create a service account `argocd-manager` on the cluster referenced by context `kubernetes-admin@kubernetes` with full cluster level privileges. Do you want to continue [y/N]? 
```

:::

```shell
$ argocd cluster add kubernetes-admin@kubernetes \
  --service-account argocd-limited-role \
  --system-namespace kube-system
{"level":"info","msg":"Created bearer token secret for ServiceAccount \"argocd-limited-role\"","time":"2025-05-26T14:58:50+08:00"}
Cluster 'https://10.0.0.10:6443' added
```

