[toc]



# kubeadm 专题 一 init 究竟干了些什么

[本文严重抄袭至互联网](https://www.jianshu.com/p/1e65610dd223)



**kubeadm 所在层次**

kubeadm 属于第二层，用于管理集群。

![iShot2020-04-1518.37.50](https://github.com/pptfz/picgo-images/blob/master/img/iShot2020-04-1518.37.50.png)



## kubeadm init 的流程（phase）介绍

> phase 阶段

```shell
preflight                  预置检查
kubelet-start                生成 kubelet 配置，并重启kubelet
certs                        生成认证
  /etcd-ca                   生成自签名CA以为etcd配置标识
  /apiserver-etcd-client     生成apiserver用于访问etcd的证书
  /etcd-healthcheck-client   生成liveness探针使用的证书，用于检查etcd 的 healtcheck 状态
  /etcd-server               生成 etcd 服务使用的的证书
  /etcd-peer                 为etcd节点生成证书以相互通信
  /ca                        生成自签名的 Kubernetes CA，为其他 Kubernetes 组件预配标识
  /apiserver                 生成用于提供 Kubernetes API 的证书 api server端证书
  /apiserver-kubelet-client  为 API 服务器生成证书以连接到 kubelet
  /front-proxy-ca            生成自签名 CA 以预配front proxy 标识
  /front-proxy-client        为前端代理客户端生成证书
  /sa                        生成用于对服务帐户令牌及其公钥进行签名的私钥
kubeconfig                   生成 control plane 和 admin 管理员相关的kubeconfig 文件
  /admin                     生成admin 管理员和kubeadm 自身使用的kubeconfig文件
  /kubelet                   生成kebelet使用的，仅用于引导集群（bootstrap）的kubeconfig 文件
  /controller-manager        生成 controller manager 使用的kubeconfig文件
  /scheduler                 生成 scheduler 使用的kubeconfig文件
kubelet-start                生成kubelet的环境变量文件/var/lib/kubelet/kubeadm-flags.env 和 配置信息文件 /var/lib/kubelet/config.yaml，然后 启动/重启 kubelet（systemd 模式）
control-plane                生成拉起 control plane（master）static Pod 的 manifest 文件
  /apiserver                 生成拉起 kube-apiserver 的 static Pod manifest
  /controller-manager        生成拉起 kube-controller-manager 的static Pod manifest
  /scheduler                 生成拉起 kube-scheduler 的 static Pod manifest
etcd                         生成本地 ETCD的 static Pod manifest 文件
  /local                     生成单节点本地 ETCD static Pod manifest 文件
upload-config                上传kubeadm和kubelet配置为 ConfigMap
  /kubeadm                   上传 kubeadm ClusterConfiguration 为 ConfigMap
  /kubelet                   上传 kubelet component config 为 ConfigMap
upload-certs                 上传证书到 kubeadm-certs
mark-control-plane           标识节点为 control-plane
bootstrap-token              生成 bootstrap tokens 用于其他节点加入集群
addon                        安装所需的插件以通过一致性测试
  /coredns                   安装 CoreDNS 插件
  /kube-proxy                安装 kube-proxy 插件
```





## kubeadm 命令行参数

命令用法

```python
kubeadm init [flags]
```

参数说明

```shell
--apiserver-advertise-address string   设置 apiserver 绑定的 IP.

--apiserver-bind-port int32            设置apiserver 监听的端口. (默认 6443)

--apiserver-cert-extra-sans strings    api证书中指定额外的Subject Alternative Names (SANs) 可以是IP 也可以是DNS名称。 证书是和SAN绑定的。

--cert-dir string                      证书存放的目录 (默认 "/etc/kubernetes/pki")

--certificate-key string               kubeadm-cert secret 中 用于加密 control-plane 证书的key

--config string                        kubeadm 配置文件的路径.

--cri-socket string                    CRI socket 文件路径，如果为空 kubeadm 将自动发现相关的socket文件; 只有当机器中存在多个 CRI  socket 或者 存在非标准 CRI socket 时才指定.

--dry-run                              测试，并不真正执行;输出运行后的结果.

--feature-gates string                 指定启用哪些额外的feature 使用 key=value 对的形式。

--help                                 帮助文档

--ignore-preflight-errors strings      忽略前置检查错误，被忽略的错误将被显示为警告. 例子: 'IsPrivilegedUser,Swap'. Value 'all' ignores errors from all checks.

--image-repository string              选择拉取 control plane images 的镜像repo (default "k8s.gcr.io")

--kubernetes-version string            选择K8S版本. (default "stable-1")

--node-name string                     指定node的名称，默认使用 node 的 hostname.

--pod-network-cidr string              指定 pod 的网络， control plane 会自动将 网络发布到其他节点的node，让其上启动的容器使用此网络

--service-cidr string                  指定service 的IP 范围. (default "10.96.0.0/12")

--service-dns-domain string            指定 service 的 dns 后缀, e.g. "myorg.internal". (default "cluster.local")

--skip-certificate-key-print           不打印 control-plane 用于加密证书的key.

--skip-phases strings                  跳过指定的阶段（phase）

--skip-token-print                     不打印 kubeadm init 生成的 default bootstrap token 

--token string                         指定 node 和control plane 之间，简历双向认证的token ，格式为 [a-z0-9]{6}\.[a-z0-9]{16} - e.g. abcdef.0123456789abcdef

--token-ttl duration                   token 自动删除的时间间隔。 (e.g. 1s, 2m, 3h). 如果设置为 '0', token 永不过期 (default 24h0m0s)

--upload-certs                         上传 control-plane 证书到 kubeadm-certs Secret.
```





## init 工作流

kubeadm init通过执行以下步骤来引导Kubernetes控制平面节点：

1.在进行更改之前运行一系列飞行前检查以验证系统状态。某些检查仅触发警告，其他检查被视为错误，并将退出kubeadm，直到问题得到纠正或用户指定 `--ignore-preflight-errors = <list-of-errors>` 来忽略错误。

2.生成自签名 CA（或使用现有CA），以便为群集中的每个组件设置标识。如果用户通过将其放在通过--cert-dir配置的cert目录（默认情况下为`/etc/kubernetes/pki`）中提供了自己的CA证书和/或密钥，则会跳过此步骤，如使[用自定义证书文档](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Freference%2Fsetup-tools%2Fkubeadm%2Fkubeadm-init%2F%23custom-certificates)中所述。 APIServer证书将 `--apiserver-cert-extra-sans` 参数提供的额外SAN条目添加到证书信息中，如果需要，可以小写。

3.在 `/etc/kubernetes/` 中为 kubelet， controller-manager和scheduler 写入kubeconfig文件，用于连接到API服务器，每个都有自己的标识，以及另一个名为 `admin.conf` 的管理员kubeconfig文件。

4.生成启动 kubelet 服务所需的配置文件和环境变量，并启动kubelet （systemd 方式）生成文件如下

- /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf 环境变量
- /etc/kubernetes/bootstrap-kubelet.conf/
- /etc/kubernetes/kubelet.conf
- /var/lib/kubelet/config.yaml
- /var/lib/kubelet/kubeadm-flags.env 环境变量



**kubelet 使用4个文件的方式如下**

```shell
$ systemctl status kubelet
● kubelet.service - kubelet: The Kubernetes Node Agent
   Loaded: loaded (/usr/lib/systemd/system/kubelet.service; disabled; vendor preset: disabled)
  Drop-In: /usr/lib/systemd/system/kubelet.service.d
           └─10-kubeadm.conf
   Active: active (running) since Sun 2019-08-18 14:16:37 CST; 13min ago
     Docs: https://kubernetes.io/docs/
 Main PID: 14980 (kubelet)
   CGroup: /system.slice/kubelet.service
           └─14980 /usr/bin/kubelet --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --config=/var/lib/kubelet/config.yaml
```



1.为apiserver，control-manager 和scheduler 生成静态Pod清单。

如果未提供外部etcd，则会为etcd生成其他静态Pod清单。 Static Pod清单写入`/etc/kubernetes/manifests`; kubelet监视此目录以便Pods在启动时创建。

control plane 的pod 启动后，init 开始继续执行后面的流程。

2.将标签和污点应用于控制平面节点，以便不会在那里运行其他工作负载。

3.生成其他节点将来可用于向控件平面注册自己的令牌。或者，用户可以通过`--token` 参数来指定一个令牌。,具体在 [kubeadm token](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Freference%2Fsetup-tools%2Fkubeadm%2Fkubeadm-token%2F) 文档中.

4.进行所有必要的配置，以允许其他节点通过[引导令牌 bootstrap token](https://links.jianshu.com/go?to=https%EF%BC%9A%2F%2Fkubernetes.io%2Fdocs%2F%E5%BC%95%E7%94%A8%2F%E8%AE%BF%E9%97%AE-authn-authz%2Fboottrap-tokens%2F) 和 [TLS boostrap](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Freference%2Fcommand-line-tools-reference%2Fkubelet-tls-bootstrapping%2F) 机制进行加入

- 写入加入集群的所需的信息到configmap， 设置相关的RBAC 规则。
- 让bootstrap token 访问 CSR`（证书签名请求）` 签名 API
- Configure auto-approval for new CSR requests. 对CSR 请求`（证书签名请求）`配置自动同意。

通过 API server 安装 DNS 服务器 （CoreDNS） 和 kube-proxy 组件。在 Kubernetes 版本 1.11 和更高版本中，CoreDNS 是默认 DNS 服务器。要安装 kube-dns 而不是 CoreDNS，必须在 kubeadm 配置文件的ClusterConfiguration 字段中配置 DNS 附加组件(通过 kubeadm config 文件）。请注意，虽然已部署 DNS 服务器，但安装 CNI 前该POD 不会被调度到节点（可以理解为不回被实际部署，或不会生效）。

## kubeadm init phase 的用法

### 查看 kubeadm init phase 列表

```shell
$ kubeadm init phase
Use this command to invoke single phase of the init workflow

Usage:
  kubeadm init phase [command]

Available Commands:
  addon              Install required addons for passing Conformance tests
  bootstrap-token    Generates bootstrap tokens used to join a node to a cluster
  certs              Certificate generation
  control-plane      Generate all static Pod manifest files necessary to establish the control plane
  etcd               Generate static Pod manifest file for local etcd
  kubeconfig         Generate all kubeconfig files necessary to establish the control plane and the admin kubeconfig file
  kubelet-start      Write kubelet settings and (re)start the kubelet
  mark-control-plane Mark a node as a control-plane
  preflight          Run pre-flight checks
  upload-certs       Upload certificates to kubeadm-certs
  upload-config      Upload the kubeadm and kubelet configuration to a ConfigMap
```



### 可以查看某个具体的phase下的子phase 列表

```shell
$ kubeadm init phase control-plane --help
This command is not meant to be run on its own. See list of available subcommands.

Usage:
  kubeadm init phase control-plane [flags]
  kubeadm init phase control-plane [command]

Available Commands: #下面的就是子phase
  all                Generate all static Pod manifest files
  apiserver          Generates the kube-apiserver static Pod manifest
  controller-manager Generates the kube-controller-manager static Pod manifest
  scheduler          Generates the kube-scheduler static Pod manifest
```



### 查看 control-plane phase 下 controller-manager 子 phase 的用法详情

```shell
$ kubeadm init phase control-plane controller-manager --help
Generates the kube-controller-manager static Pod manifest

Usage:
  kubeadm init phase control-plane controller-manager [flags]

Flags:
      --cert-dir string                                 The path where to save and store the certificates. (default "/etc/kubernetes/pki")
      --config string                                   Path to a kubeadm configuration file.
      --controller-manager-extra-args mapStringString   A set of extra flags to pass to the Controller Manager or override default ones in form of <flagname>=<value>
  -h, --help                                            help for controller-manager
      --image-repository string                         Choose a container registry to pull control plane images from (default "k8s.gcr.io")
      --kubernetes-version string                       Choose a specific Kubernetes version for the control plane. (default "stable-1")
      --pod-network-cidr string                         Specify range of IP addresses for the pod network. If set, the control plane will automatically allocate CIDRs for every node.
```



### 执行某个 phase 或者跳过某个 phase

```shell
sudo kubeadm init phase control-plane all --config=configfile.yaml
sudo kubeadm init phase etcd local --config=configfile.yaml
# you can now modify the control plane and etcd manifest files
sudo kubeadm init --skip-phases=control-plane,etcd --config=configfile.yaml
```



## kubeadm config 文件

> 注意，这个 config 文件特性在1.15 中依然是 beta，在将来可能改变

查看 kubeadm config print的帮助

```shell
[root@rancher ~]# kubeadm config print -h
This command prints configurations for subcommands provided.

Usage:
  kubeadm config print [flags]
  kubeadm config print [command]

Available Commands:
  init-defaults Print default init configuration, that can be used for 'kubeadm init'
  join-defaults Print default join configuration, that can be used for 'kubeadm join'
```



打印默认的init 配置文件

```shell
kubeadm config print init-defaults > initconfig.yaml
```

打开 initconfig， 内容如下

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 1.2.3.4
  bindPort: 6443
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  name: rancher.local
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: k8s.gcr.io
kind: ClusterConfiguration
kubernetesVersion: v1.14.0
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
scheduler: {}
```



上面的内容只包含额了最简话的InitConfiguration type 的内容，kubeadm 完整的内容包含5大部分，如下，每个type 之间，需要用yaml的 `---` 文档隔离进行分离。
 init-full-config.yaml 文件结构

```yaml
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: InitConfiguration
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: JoinConfiguration
```

想细的内容可以参阅[kubeadm api](https://links.jianshu.com/go?to=https%3A%2F%2Fgodoc.org%2Fk8s.io%2Fkubernetes%2Fcmd%2Fkubeadm%2Fapp%2Fapis%2Fkubeadm%2Fv1beta2)，kube-proxy配置部分的内容细节在这里[KubeProxyConfiguration ](https://links.jianshu.com/go?to=https%3A%2F%2Fgodoc.org%2Fk8s.io%2Fkubernetes%2Fpkg%2Fproxy%2Fapis%2Fconfig%23KubeProxyConfiguration)
 比如我要修改kube-proxy的模式为IPVS 那么修改后的init-full-config.yaml 内容为如下

```yaml
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: InitConfiguration
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: "ipvs"  修改在这里
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: JoinConfiguration
```

关于如何通过kubeadm 配置启用 IPVS 请[参阅](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fkubernetes%2Fkubernetes%2Fblob%2Fmaster%2Fpkg%2Fproxy%2Fipvs%2FREADME.md)
关于如何定制化 control plane 请[参阅](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Fsetup%2Fproduction-environment%2Ftools%2Fkubeadm%2Fcontrol-plane-flags%2F)



### 使用自定义镜像仓库

对于google 提供的镜像，在众所周知的原因下，无法访问。所以需要使用国内镜像或者自建的镜像仓库。 kubeadm 提供了参数，同事也支持修改 kubeadm config 文件来指定定制化的仓库

```yaml
# imageRepository: k8s.gcr.io
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers 
```

通过如下命令，可以查看和拉取 init 所需的镜像。

```shell
kubeadm config images list 
kubeadm config images pull --config init-full-config.yaml
```





### kubeadm 配置 cri runtime

kubelet 默认使用 `docker` 作为runtime 并使用内建的 `dockershim` 进行交互。
 其他的runtime包括:

- [cri-containerd](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fcontainerd%2Fcri-containerd)
- [cri-o](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fkubernetes-incubator%2Fcri-o)
- [frakti](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fkubernetes%2Ffrakti)
- [rkt](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fkubernetes-incubator%2Frktlet)

安装文档 [CRI installation instructions](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Fsetup%2Fcri)

根据安装文档安装好runtime后，需要对kubeadm 和kubelet 做如下配置

1.在每个节点安装runtime 对应的 shim，如何安装在runtime 说明文档中有介绍

2.配置 kubelet 使用远程 CRI runtime （实际是使用linux sockets），记得修改 RUNTIME_ENDPOINT 为你自己对应的值，比如  `/var/run/{your_runtime}.sock:`
 比如，如下是cri的配置文件。

```shell
cat > /etc/systemd/system/kubelet.service.d/20-cri.conf <<EOF
[Service]
Environment="KUBELET_EXTRA_ARGS=--container-runtime=remote --container-runtime-endpoint=$RUNTIME_ENDPOINT"
EOF

systemctl daemon-reload
```

你也可以通过kubeadm init/reset 的 `--cri-socket` 参数来是先同样的事情。



## kubeadm 自动化

与其像[kubeadm 基础教程](https://links.jianshu.com/go?to=https%3A%2F%2Fkubernetes.io%2Fdocs%2Fsetup%2Fproduction-environment%2Ftools%2Fkubeadm%2Fcreate-cluster-kubeadm%2F)中那样，将从 kubeadm init 获得的令牌复制到每个节点，不如并行化令牌分发，以便更轻松地实现自动化。要实现此自动化，您必须知道控制平面节点在启动后将具有的 IP 地址。

步骤

1.使用 kubeadm 生成令牌（token）

```shell
kubeadm token generate
```

2.用此令牌(token)同时启动控制平面节点和工作节点。当它们启动时，它们会找到彼此并形成集群。相同的 `--token` 参数可以在kubeadm init和kubeadm join上使用

3.可以用同样的方法来添加master节点，通过设置 `--certificate-key` 参数来达到加入的目的。可以通过如下命令来生成key，给每个master 节点使用

```shell
kubeadm alpha certs certificate-key
```

集群启动之后，可以通过`/etc/kubernetes/admin.conf`中的凭证来和集群信。

> 这种方式不允许root ca 通过--discovery-token-ca-cert-hash 来验证证书hash 所以有一定的安全隐患。

