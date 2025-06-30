[toc]



# k8s设置通过kubeconfig登陆dashboard



[k8s设置通过kubeconfig登陆dashboard官方文档](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)





k8s 官方的dashboard每次登陆都需要输入token，而这个token一会特么就过期了，我就是本机实验，每次都得手动粘贴一大串命令获取token然后再登陆，非常麻烦

使用如下命令获取登陆dashboard的token

```shell
kubectl get secret `kubectl get secret -n kube-system|grep admin-token|awk '{print $1}'` -o jsonpath={.data.token} -n kube-system |base64 -d && echo
```





查看secrets

```shell
$ kubectl get secrets 
NAME                  TYPE                                  DATA   AGE
default-token-jlz9f   kubernetes.io/service-account-token   3      45h
```



































1.定义集群、用户和上下问

```yaml
cat > dashboard-config.yaml << EOF
apiVersion: v1
kind: Config
preferences: {}

clusters:
- cluster:
  name: ctyun

users:
- name: ctyun

contexts:
- context:
  name: ctyun
EOF
```



2.将集群详细信息添加到配置文件中

```
kubectl config --kubeconfig=dashboard-config.yaml set-cluster ctyun --server=https://192.168.1.96 --insecure-skip-tls-verify
```



3.将用户详细信息添加到配置文件中

:::caution注意

将密码保存到 Kubernetes 客户端配置中有风险。 一个较好的替代方式是使用凭据插件并单独保存这些凭据。 参阅 [client-go 凭据插件](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/#client-go-credential-plugins)

:::



:::tip说明

- 要删除用户，可以运行 `kubectl --kubeconfig=config-demo config unset users.<name>`
- 要删除集群，可以运行 `kubectl --kubeconfig=config-demo config unset clusters.<name>`
- 要删除上下文，可以运行 `kubectl --kubeconfig=config-demo config unset contexts.<name>`

:::

```
kubectl config --kubeconfig=dashboard-config.yaml set-credentials experimenter --username=admin --password=admin
```



4.将上下文详细信息添加到配置文件中

```
kubectl config --kubeconfig=dashboard-config.yaml set-context ctyun --cluster=ctyun --namespace=kubernetes-dashboard --user=admin
```





```
kubectl config --kubeconfig=dashboard-config.yaml view
```









## 1.创建cluster

```shell
kubectl config set-cluster kubernetes --certificate-authority=/etc/kubernetes/pki/ca.crt --server=10.0.0.130:6443 --kubeconfig=/root/dashbord-admin.conf
```



## 2.获取token

```shell
DASH_TOCKEN=$(kubectl get secret -n kube-system `kubectl get secret -n kube-system |grep dashboard |awk '{print $1}'` -o jsonpath={.data.token}|base64 -d)
```



## 3.创建credentials

```shell
kubectl config set-credentials dashboard-admin --token=$DASH_TOCKEN --kubeconfig=/root/dashbord-admin.conf
```



## 4.创建context

```shell
kubectl config set-context dashboard-admin@kubernetes --cluster=kubernetes --user=dashboard-admin --kubeconfig=/root/dashbord-admin.conf
```



## 5.切换context的current-context是dashboard-admin@kubernetes

```shell
kubectl config use-context dashboard-admin@kubernetes --kubeconfig=/root/dashbord-admin.conf
```



:::tip

**下载 `dashboard-admin.conf` 然后登陆的时候选择这个文件即可**

:::
