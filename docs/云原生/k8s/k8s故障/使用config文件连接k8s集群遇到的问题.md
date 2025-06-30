# 使用config连接k8s集群遇到的问题

使用 [kubeadm](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) 安装完k8s后，会在 `/etc/kubernetes/` 下生成配置文件 `admin.conf` ，然后我们会把这个文件拷贝到 `$HOME/.kube` 下并命名为 `config`，通过这个文件我们可以操作k8s集群



 将 `config` 文件放到 `$HOME/.kube` 后，执行 `kubectl cluster-info` 查看集群信息报错如下，其中 192.168.31.1 是我本地网络的路由器ip段

```shell
$ kubectl cluster-info     

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
Unable to connect to the server: dial tcp: lookup lb.kubesphere.local on 192.168.31.1:53: no such host
```



然后根据提示执行命令 `kubectl cluster-info dump` ，报错如下

```shell
$ kubectl cluster-info dump
Unable to connect to the server: dial tcp: lookup lb.kubesphere.local on 192.168.31.1:53: no such host
```



由于 `config` 文件是从虚拟机中拷贝下来的，所以直接登录到 master 节点执行命令 `kubectl cluster-info` 查看

```shell
$ kubectl cluster-info 
Kubernetes control plane is running at https://lb.kubesphere.local:6443
coredns is running at https://lb.kubesphere.local:6443/api/v1/namespaces/kube-system/services/coredns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```



可以看到 `apiserver` 地址为 `lb.kubesphere.local:6443` ，这是因为是使用 [kubekey](https://github.com/kubesphere/kubekey) 安装的k8s，然后 `kubekey` 自动把 `apiserver` 地址设置成了域名，而当把 `config` 文件下载到电脑本机使用的时候，本机电脑是无法解析 `lb.kubesphere.local` 这个域名的，因此需要把这个域名在本机做一下hosts解析，解析成虚拟机中 `apiserver` 服务器的ip地址就可以了

