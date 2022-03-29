[toc]



# k8s设置通过kubeconfig登陆dashboard

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



# 1.创建cluster

```shell
kubectl config set-cluster kubernetes --certificate-authority=/etc/kubernetes/pki/ca.crt --server=10.0.0.130:6443 --kubeconfig=/root/dashbord-admin.conf
```



# 2.获取token

```shell
DASH_TOCKEN=$(kubectl get secret -n kube-system `kubectl get secret -n kube-system |grep dashboard |awk '{print $1}'` -o jsonpath={.data.token}|base64 -d)
```



# 3.创建credentials

```shell
kubectl config set-credentials dashboard-admin --token=$DASH_TOCKEN --kubeconfig=/root/dashbord-admin.conf
```



# 4.创建context

```shell
kubectl config set-context dashboard-admin@kubernetes --cluster=kubernetes --user=dashboard-admin --kubeconfig=/root/dashbord-admin.conf
```



# 5.切换context的current-context是dashboard-admin@kubernetes

```shell
kubectl config use-context dashboard-admin@kubernetes --kubeconfig=/root/dashbord-admin.conf
```



**下载dashboard-admin.conf然后登陆的时候选择这个文件即可**
