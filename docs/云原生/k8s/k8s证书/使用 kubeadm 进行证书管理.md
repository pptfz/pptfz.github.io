# 使用 kubeadm 进行证书管理



## k8s集群证书过期

[使用 kubeadm 进行证书管理官方文档](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/)



```shell
$ k get no
E0623 22:33:53.337139    2139 memcache.go:265] couldn't get current server API group list: Get "https://10.0.0.10:6443/api?timeout=32s": tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
E0623 22:33:53.341726    2139 memcache.go:265] couldn't get current server API group list: Get "https://10.0.0.10:6443/api?timeout=32s": tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
E0623 22:33:53.345711    2139 memcache.go:265] couldn't get current server API group list: Get "https://10.0.0.10:6443/api?timeout=32s": tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
E0623 22:33:53.349426    2139 memcache.go:265] couldn't get current server API group list: Get "https://10.0.0.10:6443/api?timeout=32s": tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
E0623 22:33:53.353446    2139 memcache.go:265] couldn't get current server API group list: Get "https://10.0.0.10:6443/api?timeout=32s": tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
Unable to connect to the server: tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T22:33:53+08:00 is after 2025-01-02T02:18:38Z
```



## 查看证书过期时间

### 查看控制平面组件证书过期时间

:::tip 说明

该命令显示 `/etc/kubernetes/pki` 文件夹中的客户端证书以及 kubeadm（`admin.conf`、`controller-manager.conf` 和 `scheduler.conf`） 使用的 kubeconfig 文件中嵌入的客户端证书的到期时间/剩余时间

可以看到证书在2025年1月2日过期，现在是2025年6月29日

:::

:::caution 注意

输出的列表中没有包含 `kubelet.conf` 配置文件，因为 kubeadm 将 kubelet 配置为[自动更新证书](https://kubernetes.io/zh-cn/docs/tasks/tls/certificate-rotation/)。 轮换的证书位于目录 `/var/lib/kubelet/pki`。 要修复过期的 kubelet 客户端证书，请参阅 [kubelet 客户端证书轮换失败](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/#kubelet-client-cert)

:::

```shell
$ kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[check-expiration] Error reading configuration from the Cluster. Falling back to default configuration

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Jan 02, 2025 02:18 UTC   <invalid>       ca                      no      
apiserver                  Jan 02, 2025 02:18 UTC   <invalid>       ca                      no      
apiserver-etcd-client      Jan 02, 2025 02:18 UTC   <invalid>       etcd-ca                 no      
apiserver-kubelet-client   Jan 02, 2025 02:18 UTC   <invalid>       ca                      no      
controller-manager.conf    Jan 02, 2025 02:18 UTC   <invalid>       ca                      no      
etcd-healthcheck-client    Jan 02, 2025 02:18 UTC   <invalid>       etcd-ca                 no      
etcd-peer                  Jan 02, 2025 02:18 UTC   <invalid>       etcd-ca                 no      
etcd-server                Jan 02, 2025 02:18 UTC   <invalid>       etcd-ca                 no      
front-proxy-client         Jan 02, 2025 02:18 UTC   <invalid>       front-proxy-ca          no      
scheduler.conf             Jan 02, 2025 02:18 UTC   <invalid>       ca                      no      

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Dec 31, 2033 02:18 UTC   8y              no      
etcd-ca                 Dec 31, 2033 02:18 UTC   8y              no      
front-proxy-ca          Dec 31, 2033 02:18 UTC   8y              no 
```



### 查看kubelet证书过期时间

:::tip 说明

也可以使用如下命令查看

```shell
openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -subject -dates
```

:::

```shell
$ openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -text | grep 'Not After'
            Not After : Jan  2 02:18:40 2025 GMT
```





## 手动更新证书

必须先更新kubelet的证书，否则后续重启控制平面组件会失败，因为kubeadm安装的k8s控制平面组件都是静态pod

### 更新kubelet证书

master节点和node节点都要进行操作

#### 删除文件

::tip 说明

删除之前先备份一下

:::

```shell
rm -rf /etc/kubernetes/kubelet.conf
rm -rf /var/lib/kubelet/pki/kubelet-client*
```



#### 重新生成 `kubelet.conf` 文件

:::caution 注意

此步骤在集群中具有 `/etc/kubernetes/pki/ca.key` 的、正常工作的控制平面节点上执行

需要注意 `$NODE` 为机器主机名

:::

```shell
kubeadm kubeconfig user --org system:nodes --client-name system:node:$hostname > kubelet.conf
```



#### 拷贝 `kubelet.conf` 

```
cp kubelet.conf /etc/kubernetes/kubelet.conf
```



#### 重启 `kubelet`

:::tip 说明

重启kubelet会重建证书，格式为当前日期，可用 `date "+%Y-%m-%d-%H-%M-%S"` 命令生成此格式

```
$ ll /var/lib/kubelet/pki/
-rw------- 1 root root 2818 Jun 29 13:55 kubelet-client-2025-06-29-13-55-27.pem
lrwxrwxrwx 1 root root   59 Jun 29 13:55 kubelet-client-current.pem -> /var/lib/kubelet/pki/kubelet-client-2025-06-29-13-55-27.pem
```

:::

```
systemctl restart kubelet
```



重启完成后kubelet就会变为 `running` 状态了





### 更新控制平面组件证书

#### 更新所有证书

```shell
$ kubeadm certs renew all
[renew] Reading configuration from the cluster...
[renew] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[renew] Error reading configuration from the Cluster. Falling back to default configuration

certificate embedded in the kubeconfig file for the admin to use and for kubeadm itself renewed
certificate for serving the Kubernetes API renewed
certificate the apiserver uses to access etcd renewed
certificate for the API server to connect to kubelet renewed
certificate embedded in the kubeconfig file for the controller manager to use renewed
certificate for liveness probes to healthcheck etcd renewed
certificate for etcd nodes to communicate with each other renewed
certificate for serving etcd renewed
certificate for the front proxy client renewed
certificate embedded in the kubeconfig file for the scheduler manager to use renewed

Done renewing certificates. You must restart the kube-apiserver, kube-controller-manager, kube-scheduler and etcd, so that they can use the new certificates.
```





#### 拷贝kubeconfig

```shell
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```





#### 手动批准csr

:::tip 说明

csr是kubelet 客户端证书签名请求，可以看到是有一些是 `Pending` 状态的

```
$ kubectl get csr
NAME        AGE     SIGNERNAME                                    REQUESTOR                  REQUESTEDDURATION   CONDITION
csr-2dvns   2m38s   kubernetes.io/kube-apiserver-client-kubelet   system:node:k8s-master01   <none>              Pending
csr-5fc2n   2m10s   kubernetes.io/kube-apiserver-client-kubelet   system:node:k8s-master01   <none>              Pending
csr-6g25s   543d    kubernetes.io/kube-apiserver-client-kubelet   system:bootstrap:abcdef    <none>              Approved,Issued
csr-lv2qv   543d    kubernetes.io/kube-apiserver-client-kubelet   system:bootstrap:abcdef    <none>              Approved,Issued
csr-p85rl   2m8s    kubernetes.io/kube-apiserver-client-kubelet   system:node:k8s-master01   <none>              Pending
csr-tl68m   543d    kubernetes.io/kube-apiserver-client-kubelet   system:node:k8s-master01   <none>              Approved,Issued
csr-w8g4z   543d    kubernetes.io/kube-apiserver-client-kubelet   system:bootstrap:abcdef    <none>              Approved,Issued
```

:::

```
kubectl get csr | grep Pending | awk '{print $1}' | xargs kubectl certificate approve
```





#### 重启控制平面 Pod

##### 移动文件

:::tip 说明

kubeadm安装的k8s，控制平面的组件都是静态pod，文件存放于 `/etc/kubernetes/manifests` 下，因此移除这些文件即可完成重启

:::

:::caution 注意

如果误删除了 `/etc/kubernetes/manifests` 的文件，则可以使用命令 `kubeadm init phase control-plane all` 进行恢复

:::

```
ll
total 16
-rw------- 1 root root 2411 Jan  3  2024 etcd.yaml
-rw------- 1 root root 3375 Jan  3  2024 kube-apiserver.yaml
-rw------- 1 root root 2901 Jan  3  2024 kube-controller-manager.yaml
-rw------- 1 root root 1487 Jan  3  2024 kube-scheduler.yaml
```



将文件移动后，相应的静态pod就会删除，等待20s，把文件移动回来，pod就会自动创建了，这样就完成了组件的重启

```shell
mv /etc/kubernetes/manifests/* /tmp
```





