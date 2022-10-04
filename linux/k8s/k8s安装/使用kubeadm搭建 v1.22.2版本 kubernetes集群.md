[toc]



# 使用 kubeadm 搭建 v1.22.2 版本 Kubernetes 集群

# 1.环境准备

**单master架构图**

![iShot2020-07-0410.58.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-0410.58.42.png)





## 1.1 实验环境

| 角色       | IP地址             | 主机名           | containerd版本 | 硬件配置 | 系统          | 硬盘        | 内核                           | 安装组件                                                     |
| ---------- | ------------------ | ---------------- | -------------- | -------- | ------------- | ----------- | ------------------------------ | ------------------------------------------------------------ |
| **master** | **172.30.100.101** | **k8s-master01** | **1.5.5**      | **2C4G** | **CentOS7.6** | **40g+50g** | **3.10.0-957.21.3.el7.x86_64** | **kube-apiserver，kube-controller-manager，kube-scheduler，etcd** |
| **node1**  | **172.30.100.102** | **k8s-node01**   | **1.5.5**      | **2C4G** | **CentOS7.6** | **40g+50g** | **3.10.0-957.21.3.el7.x86_64** | **kubelet，kube-proxy，docker，etcd**                        |
| **node2**  | **172.30.100.103** | **k8s-node02**   | **1.5.5**      | **2C4G** | **CentOS7.6** | **40g+50g** | **3.10.0-957.21.3.el7.x86_64** | **kubelet，kube-proxy，docker，etcd**                        |



:::tip说明

**如无特殊说明，以下所有操作均在master节点**

**已提前配置好master可以免密登陆node节点**

**实验开始前已临时开启root远程登陆，实验结束后关闭root远程登陆，采用sudo用户密钥登陆方式**

:::





## 1.2 编辑环境变量文件

```shell
[ -d /opt/k8s/script ] || mkdir -p /opt/k8s/script && cd /opt/k8s/script
cat > /opt/k8s/script/env.sh <<EOF
export NODE_IPS=(172.30.100.101 172.30.100.102 172.30.100.103)
export NODE_NAMES=(k8s-master01 k8s-node01 k8s-node02)
export SSH_USER=root
export SSH_PORT=2299
export SSH_KEY_FILE=/root/.ssh/id_rsa
export K8S_VERSION=1.22.2
export POD_SUBNET=10.244.0.0/16
export SERVICE_SUBNET=10.96.0.0/12
EOF
```



## 1.3 每个节点配置host信息

```python
# 加载变量文件
source /opt/k8s/script/env.sh

# master节点编辑hosts文件
cat >> /etc/hosts << EOF
${NODE_IPS[0]} ${NODE_NAMES[0]}
${NODE_IPS[1]} ${NODE_NAMES[1]}
${NODE_IPS[2]} ${NODE_NAMES[2]}
EOF

# 拷贝hosts文件到node节点
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp -o StrictHostKeyChecking=no -P${SSH_PORT} -i${SSH_KEY_FILE} /etc/hosts ${SSH_USER}@${node_ip}:/etc 
  done  
```



## 1.4 创建 `/etc/sysctl.d/k8s.conf` 文件，添加如下内容

```python
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness = 0
EOF'
  done  

# 使配置生效  
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'modprobe br_netfilter && sysctl -p /etc/sysctl.d/k8s.conf'
  done    
```



**bridge-nf 说明**

bridge-nf 使得 netfilter 可以对 Linux 网桥上的 IPv4/ARP/IPv6 包过滤。比如，设置 `net.bridge.bridge-nf-call-iptables＝1` 后，二层的网桥在转发包时也会被 iptables的 FORWARD 规则所过滤。常用的选项包括：

- `net.bridge.bridge-nf-call-arptables`：是否在 arptables 的 FORWARD 中过滤网桥的 ARP 包
- `net.bridge.bridge-nf-call-ip6tables`：是否在 ip6tables 链中过滤 IPv6 包
- `net.bridge.bridge-nf-call-iptables`：是否在 iptables 链中过滤 IPv4 包
- `net.bridge.bridge-nf-filter-vlan-tagged`：是否在 iptables/arptables 中过滤打了 vlan 标签的包



## 1.5 安装ipvs

**创建 `/etc/sysconfig/modules/ipvs.modules` 文件，目的是保证在节点重启后能自动加载所需模块。使用 `lsmod | grep -e ip_vs -e nf_conntrack_ipv4` 命令查看是否已经正确加载所需的内核模块**



```shell
# 编辑文件
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'cat > /etc/sysconfig/modules/ipvs.modules << EOF
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
modprobe -- nf_conntrack_ipv4
EOF'
  done  

# 使配置生效  
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'chmod 755 /etc/sysconfig/modules/ipvs.modules && bash /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack_ipv4'
  done
```



**安装ipset和ipvsadm(便于查看 ipvs 的代理规则)**

```shell
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'yum -y install ipset ipvsadm'
  done
```





## 1.6 安装Containerd

[containerd github地址](https://github.com/containerd/containerd)

[containerd官网](https://containerd.io/)



### 1.6.1 下载安装包

由于 containerd 需要调用 runc，所以我们也需要先安装 runc，不过 containerd 提供了一个包含相关依赖的压缩包 `cri-containerd-cni-${VERSION}.${OS}-${ARCH}.tar.gz`，可以直接使用这个包来进行安装。

> 如果github下载速度较慢，可以使用 `https://download.fastgit.org/containerd/containerd/releases/download/v1.5.5/cri-containerd-cni-1.5.5-linux-amd64.tar.gz` 加速下载

```shell
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'wget -P /opt https://github.com/containerd/containerd/releases/download/v1.5.5/cri-containerd-cni-1.5.5-linux-amd64.tar.gz'
  done
```



### 1.6.2  安装配置containerd

#### 1.6.2.1 解压缩包

:::tip

**tar包解压缩后是3个目录 `etc` 、 `opt` 、 `usr`**

:::

```shell
for node_ip in ${NODE_IPS[@]}
  do
    {
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'tar xf /opt/cri-containerd-cni-1.5.5-linux-amd64.tar.gz -C /'
    }
  done
```



#### 1.6.2.2 导出命令 `PATH` 环境变量

```shell
for node_ip in ${NODE_IPS[@]}
  do
    {
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'echo "export PATH=$PATH:/usr/local/bin:/usr/local/sbin" > /etc/profile.d/containerd.sh && source /etc/profile'
    }
  done
```



#### 1.6.2.3 创建containerd配置文件

containerd 的默认配置文件为 `/etc/containerd/config.toml`，我们可以通过 `containerd config default > /etc/containerd/config.toml` 命令生成一个默认的配置

```shell
for node_ip in ${NODE_IPS[@]}
  do
    {
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'mkdir -p /etc/containerd && containerd config default > /etc/containerd/config.toml'
    }
  done
```



#### 1.6.2.4 修改containerd配置文件

对于使用 systemd 作为 init system 的 Linux 的发行版，使用 `systemd` 作为容器的 `cgroup driver` 可以确保节点在资源紧张的情况更加稳定，所以推荐将 containerd 的 cgroup driver 配置为 systemd

修改前面生成的配置文件 `/etc/containerd/config.toml`，在 `plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options` 配置块下面将 `SystemdCgroup` 设置为 `true`

```shell
修改
	SystemdCgroup = false

修改为
	SystemdCgroup = true
```



#### 1.6.2.5 配置containerd仓库加速

需要在 cri 配置块下面的 `registry` 配置块下面进行配置 `registry.mirrors`

> 如果我们的节点不能正常获取 `k8s.gcr.io` 的镜像，那么我们需要在上面重新配置 `sandbox_image` 镜像，否则后面 kubelet 覆盖该镜像不会生效：`Warning: For remote container runtime, --pod-infra-container-image is ignored in kubelet, which should be set in that remote runtime instead`。因此将 `sandbox_image` 中的镜像仓库地址修改为阿里云地址

```shell
[plugins."io.containerd.grpc.v1.cri"]
  ...
  # sandbox_image = "k8s.gcr.io/pause:3.5"
  sandbox_image = "registry.aliyuncs.com/k8sxio/pause:3.5"
  ...
  [plugins."io.containerd.grpc.v1.cri".registry]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
        endpoint = ["https://bqr1dr1n.mirror.aliyuncs.com"]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."k8s.gcr.io"]
        endpoint = ["https://registry.aliyuncs.com/k8sxio"]
```



`/etc/containerd/config.toml `  最终内容

```toml
cat > /etc/containerd/config.toml << EOF
disabled_plugins = []
imports = []
oom_score = 0
plugin_dir = ""
required_plugins = []
root = "/var/lib/containerd"
state = "/run/containerd"
version = 2

[cgroup]
  path = ""

[debug]
  address = ""
  format = ""
  gid = 0
  level = ""
  uid = 0

[grpc]
  address = "/run/containerd/containerd.sock"
  gid = 0
  max_recv_message_size = 16777216
  max_send_message_size = 16777216
  tcp_address = ""
  tcp_tls_cert = ""
  tcp_tls_key = ""
  uid = 0

[metrics]
  address = ""
  grpc_histogram = false

[plugins]

  [plugins."io.containerd.gc.v1.scheduler"]
    deletion_threshold = 0
    mutation_threshold = 100
    pause_threshold = 0.02
    schedule_delay = "0s"
    startup_delay = "100ms"

  [plugins."io.containerd.grpc.v1.cri"]
    disable_apparmor = false
    disable_cgroup = false
    disable_hugetlb_controller = true
    disable_proc_mount = false
    disable_tcp_service = true
    enable_selinux = false
    enable_tls_streaming = false
    ignore_image_defined_volumes = false
    max_concurrent_downloads = 3
    max_container_log_line_size = 16384
    netns_mounts_under_state_dir = false
    restrict_oom_score_adj = false
    sandbox_image = "registry.aliyuncs.com/k8sxio/pause:3.5"
    selinux_category_range = 1024
    stats_collect_period = 10
    stream_idle_timeout = "4h0m0s"
    stream_server_address = "127.0.0.1"
    stream_server_port = "0"
    systemd_cgroup = false
    tolerate_missing_hugetlb_controller = true
    unset_seccomp_profile = ""

    [plugins."io.containerd.grpc.v1.cri".cni]
      bin_dir = "/opt/cni/bin"
      conf_dir = "/etc/cni/net.d"
      conf_template = ""
      max_conf_num = 1

    [plugins."io.containerd.grpc.v1.cri".containerd]
      default_runtime_name = "runc"
      disable_snapshot_annotations = true
      discard_unpacked_layers = false
      no_pivot = false
      snapshotter = "overlayfs"

      [plugins."io.containerd.grpc.v1.cri".containerd.default_runtime]
        base_runtime_spec = ""
        container_annotations = []
        pod_annotations = []
        privileged_without_host_devices = false
        runtime_engine = ""
        runtime_root = ""
        runtime_type = ""

        [plugins."io.containerd.grpc.v1.cri".containerd.default_runtime.options]

      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          base_runtime_spec = ""
          container_annotations = []
          pod_annotations = []
          privileged_without_host_devices = false
          runtime_engine = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2"

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            BinaryName = ""
            CriuImagePath = ""
            CriuPath = ""
            CriuWorkPath = ""
            IoGid = 0
            IoUid = 0
            NoNewKeyring = false
            NoPivotRoot = false
            Root = ""
            ShimCgroup = ""
            SystemdCgroup = true

      [plugins."io.containerd.grpc.v1.cri".containerd.untrusted_workload_runtime]
        base_runtime_spec = ""
        container_annotations = []
        pod_annotations = []
        privileged_without_host_devices = false
        runtime_engine = ""
        runtime_root = ""
        runtime_type = ""

        [plugins."io.containerd.grpc.v1.cri".containerd.untrusted_workload_runtime.options]

    [plugins."io.containerd.grpc.v1.cri".image_decryption]
      key_model = "node"

    [plugins."io.containerd.grpc.v1.cri".registry]
      config_path = ""

      [plugins."io.containerd.grpc.v1.cri".registry.auths]

      [plugins."io.containerd.grpc.v1.cri".registry.configs]

      [plugins."io.containerd.grpc.v1.cri".registry.headers]

      [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
          endpoint = ["https://bqr1dr1n.mirror.aliyuncs.com"]
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."k8s.gcr.io"]
          endpoint = ["https://registry.aliyuncs.com/k8sxio"]

    [plugins."io.containerd.grpc.v1.cri".x509_key_pair_streaming]
      tls_cert_file = ""
      tls_key_file = ""

  [plugins."io.containerd.internal.v1.opt"]
    path = "/opt/containerd"

  [plugins."io.containerd.internal.v1.restart"]
    interval = "10s"

  [plugins."io.containerd.metadata.v1.bolt"]
    content_sharing_policy = "shared"

  [plugins."io.containerd.monitor.v1.cgroups"]
    no_prometheus = false

  [plugins."io.containerd.runtime.v1.linux"]
    no_shim = false
    runtime = "runc"
    runtime_root = ""
    shim = "containerd-shim"
    shim_debug = false

  [plugins."io.containerd.runtime.v2.task"]
    platforms = ["linux/amd64"]

  [plugins."io.containerd.service.v1.diff-service"]
    default = ["walking"]

  [plugins."io.containerd.snapshotter.v1.aufs"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.btrfs"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.devmapper"]
    async_remove = false
    base_image_size = ""
    pool_name = ""
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.native"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.overlayfs"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.zfs"]
    root_path = ""

[proxy_plugins]

[stream_processors]

  [stream_processors."io.containerd.ocicrypt.decoder.v1.tar"]
    accepts = ["application/vnd.oci.image.layer.v1.tar+encrypted"]
    args = ["--decryption-keys-path", "/etc/containerd/ocicrypt/keys"]
    env = ["OCICRYPT_KEYPROVIDER_CONFIG=/etc/containerd/ocicrypt/ocicrypt_keyprovider.conf"]
    path = "ctd-decoder"
    returns = "application/vnd.oci.image.layer.v1.tar"

  [stream_processors."io.containerd.ocicrypt.decoder.v1.tar.gzip"]
    accepts = ["application/vnd.oci.image.layer.v1.tar+gzip+encrypted"]
    args = ["--decryption-keys-path", "/etc/containerd/ocicrypt/keys"]
    env = ["OCICRYPT_KEYPROVIDER_CONFIG=/etc/containerd/ocicrypt/ocicrypt_keyprovider.conf"]
    path = "ctd-decoder"
    returns = "application/vnd.oci.image.layer.v1.tar+gzip"

[timeouts]
  "io.containerd.timeout.shim.cleanup" = "5s"
  "io.containerd.timeout.shim.load" = "5s"
  "io.containerd.timeout.shim.shutdown" = "3s"
  "io.containerd.timeout.task.state" = "2s"

[ttrpc]
  address = ""
  gid = 0
  uid = 0
EOF
```



拷贝文件到node节点

```shell
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp -o StrictHostKeyChecking=no -P${SSH_PORT} -i${SSH_KEY_FILE} /etc/containerd/config.toml ${SSH_USER}@${node_ip}:/etc/containerd
  done  
```





### 1.6.3 启动containerd

```shell
for node_ip in ${NODE_IPS[@]}
  do
    {
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'systemctl daemon-reload && systemctl enable containerd && systemctl start containerd'
    }
  done
```



### 1.6.4 验证

启动完成后就可以使用 containerd 的本地 CLI 工具 `ctr` 和 `crictl` 了，比如查看版本

```shell
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'ctr version'
  done
```



```shell
$ ctr version
Client:
  Version:  v1.5.5
  Revision: 72cec4be58a9eb6b2910f5d10f1c01ca47d231c0
  Go version: go1.16.6

Server:
  Version:  v1.5.5
  Revision: 72cec4be58a9eb6b2910f5d10f1c01ca47d231c0
  UUID: 992ed032-c65e-4aa1-b2dc-e15453b3ab42
```





## 1.7 安装Kubeadm

### 1.7.1 使用阿里云yum源

```python
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF' 
  done 
```



### 1.7.2 安装 kubeadm、kubelet、kubectl

:::tip

阿里云yum源会随官方更新最新版，因此指定版本

:::

```python
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'export K8S_VERSION=1.22.2 && yum -y install kubelet-${K8S_VERSION} kubeadm-${K8S_VERSION} kubectl-${K8S_VERSION}'
  done
```



查看版本

```shell
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'kubeadm version'
  done
```



### 1.7.3 设置kubelet开机自启

:::tip

**此时kubelet是无法启动的，因为只有完成master的 `kubeadm init` 的操作，kubelet才能正常启动**

:::

```python
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'systemctl enable kubelet'
  done
```



### 1.7.4 设置k8s命令自动补全

```python
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'yum -y reinstall bash-completion && \
source /usr/share/bash-completion/bash_completion && \
source <(kubectl completion bash) && \
echo "source <(kubectl completion bash)" >> ~/.bashrc'
  done
```





# 2.初始化集群

## 2.1 master节点操作，配置 kubeadm 初始化文件

当我们执行 `kubelet --help` 命令的时候可以看到原来大部分命令行参数都被 `DEPRECATED`了，这是因为官方推荐我们使用 `--config` 来指定配置文件，在配置文件中指定原来这些参数的配置，可以通过官方文档 [Set Kubelet parameters via a config file](https://kubernetes.io/docs/tasks/administer-cluster/kubelet-config-file/) 了解更多相关信息，这样 Kubernetes 就可以支持动态 Kubelet 配置（Dynamic Kubelet Configuration）了，参考 [Reconfigure a Node’s Kubelet in a Live Cluster](https://kubernetes.io/docs/tasks/administer-cluster/reconfigure-kubelet/)。



**可以通过如下命令导出默认的初始化配置**

```shell
kubeadm config print init-defaults > kubeadm.yaml
```



- **方法一**
  - **命令初始化**

```python
kubeadm init \
--apiserver-advertise-address=172.30.100.101 \
--image-repository registry.aliyuncs.com/google_containers \
--kubernetes-version v1.22.2 \
--service-cidr=10.96.0.0/16 \
--pod-network-cidr=10.20.0.0/16
```



| 参数                                                       | 说明                           |
| ---------------------------------------------------------- | ------------------------------ |
| --apiserver-advertise-address=172.30.100.101               | master节点IP                   |
| --image-repository registry.aliyuncs.com/google_containers | 指定阿里云镜像仓库             |
| --kubernetes-version v1.22.2                               | k8s版本                        |
| --service-cidr=10.96.0.0/16                                | service IP网段                 |
| --pod-network-cidr=10.20.0.0/16                            | pod IP网段，后续网络插件会用到 |



- **方法二**
  - **文件初始化**

[官方清单说明文档](https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta3)

```python
[ -d /opt/k8s/yaml ] || mkdir -p /opt/k8s/yaml && cd /opt/k8s/yaml
cat > kubeadm.yaml << EOF
apiVersion: kubeadm.k8s.io/v1beta3
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
  advertiseAddress: 172.30.100.101  # 指定master节点内网IP
  bindPort: 6443
nodeRegistration:
  criSocket: /run/containerd/containerd.sock  # 使用 containerd 的 Unix socket 地址
  imagePullPolicy: IfNotPresent
  name: k8s-master01 # master节点主机名
  taints:  # 给master添加污点，master节点不能调度应用
  - effect: "NoSchedule"
    key: "node-role.kubernetes.io/master"

---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs  # kube-proxy 模式

---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/k8sxio
kind: ClusterConfiguration
kubernetesVersion: 1.22.2
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.244.0.0/16  # 指定 pod 子网
scheduler: {}

---
apiVersion: kubelet.config.k8s.io/v1beta1
authentication:
  anonymous:
    enabled: false
  webhook:
    cacheTTL: 0s
    enabled: true
  x509:
    clientCAFile: /etc/kubernetes/pki/ca.crt
authorization:
  mode: Webhook
  webhook:
    cacheAuthorizedTTL: 0s
    cacheUnauthorizedTTL: 0s
clusterDNS:
- 10.96.0.10
clusterDomain: cluster.local
cpuManagerReconcilePeriod: 0s
evictionPressureTransitionPeriod: 0s
fileCheckFrequency: 0s
healthzBindAddress: 127.0.0.1
healthzPort: 10248
httpCheckFrequency: 0s
imageMinimumGCAge: 0s
kind: KubeletConfiguration
cgroupDriver: systemd  # 配置 cgroup driver
logging: {}
memorySwap: {}
nodeStatusReportFrequency: 0s
nodeStatusUpdateFrequency: 0s
rotateCertificates: true
runtimeRequestTimeout: 0s
shutdownGracePeriod: 0s
shutdownGracePeriodCriticalPods: 0s
staticPodPath: /etc/kubernetes/manifests
streamingConnectionIdleTimeout: 0s
syncFrequency: 0s
volumeStatsAggPeriod: 0s
EOF
```





## 2.2 初始化master

**可以先将需要的镜像pull下来**

```shell
$ kubeadm config images pull --config kubeadm.yaml
[config/images] Pulled registry.aliyuncs.com/k8sxio/kube-apiserver:v1.22.2
[config/images] Pulled registry.aliyuncs.com/k8sxio/kube-controller-manager:v1.22.2
[config/images] Pulled registry.aliyuncs.com/k8sxio/kube-scheduler:v1.22.2
[config/images] Pulled registry.aliyuncs.com/k8sxio/kube-proxy:v1.22.2
[config/images] Pulled registry.aliyuncs.com/k8sxio/pause:3.5
[config/images] Pulled registry.aliyuncs.com/k8sxio/etcd:3.5.0-0
failed to pull image "registry.aliyuncs.com/k8sxio/coredns:v1.8.4": output: time="2021-11-07T17:23:37+08:00" level=fatal msg="pulling image: rpc error: code = NotFound desc = failed to pull and unpack image \"registry.aliyuncs.com/k8sxio/coredns:v1.8.4\": failed to resolve reference \"registry.aliyuncs.com/k8sxio/coredns:v1.8.4\": registry.aliyuncs.com/k8sxio/coredns:v1.8.4: not found"
, error: exit status 1
To see the stack trace of this error execute with --v=5 or higher
```



上面在拉取 `coredns` 镜像的时候出错了，没有找到这个镜像，我们可以手动 pull 该镜像，然后重新 tag 下镜像地址即可

```shell
# 手动pull镜像
$ ctr -n k8s.io i pull docker.io/coredns/coredns:1.8.4
docker.io/coredns/coredns:1.8.4:                                                  resolved       |++++++++++++++++++++++++++++++++++++++|
index-sha256:6e5a02c21641597998b4be7cb5eb1e7b02c0d8d23cce4dd09f4682d463798890:    done           |++++++++++++++++++++++++++++++++++++++|
manifest-sha256:10683d82b024a58cc248c468c2632f9d1b260500f7cd9bb8e73f751048d7d6d4: done           |++++++++++++++++++++++++++++++++++++++|
layer-sha256:bc38a22c706b427217bcbd1a7ac7c8873e75efdd0e59d6b9f069b4b243db4b4b:    done           |++++++++++++++++++++++++++++++++++++++|
config-sha256:8d147537fb7d1ac8895da4d55a5e53621949981e2e6460976dae812f83d84a44:   done           |++++++++++++++++++++++++++++++++++++++|
layer-sha256:c6568d217a0023041ef9f729e8836b19f863bcdb612bb3a329ebc165539f5a80:    exists         |++++++++++++++++++++++++++++++++++++++|
elapsed: 12.4s                                                                    total:  12.0 M (991.3 KiB/s)
unpacking linux/amd64 sha256:6e5a02c21641597998b4be7cb5eb1e7b02c0d8d23cce4dd09f4682d463798890...
done: 410.185888ms

# 手动打tag
ctr -n k8s.io i tag docker.io/coredns/coredns:1.8.4 registry.aliyuncs.com/k8sxio/coredns:v1.8.4
```



**开始初始化集群**

```shell
kubeadm init --config kubeadm.yaml
```

```python
# 以下为完整输出结果
[init] Using Kubernetes version: v1.22.2
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [k8s-master01 kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 172.30.100.101]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [k8s-master01 localhost] and IPs [172.30.100.101 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [k8s-master01 localhost] and IPs [172.30.100.101 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 12.002784 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.22" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the labels: [node-role.kubernetes.io/master(deprecated) node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: abcdef.0123456789abcdef
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 172.30.100.101:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:4dbb97534e8304bb78023352236b898730062a35569e1c7f9247e6c7e81f250d  
```

`kubeadm init` 命令执行流程如下图所示

![iShot2020-10-20 16.02.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-20%2016.02.59.png)





**拷贝 kubeconfig 文件**

```python
# $HOME路径为/root
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```



## 2.3 master添加节点

**node1和node2相同操作**

**将master节点上的 `/root/.kube/config` 文件拷贝到node节点对应的文件中**

```python
for node_ip in ${NODE_IPS[@]}
  do
    {
    echo ">>> ${node_ip}"
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'mkdir -p $HOME/.kube'
    scp -P${SSH_PORT} -i${SSH_KEY_FILE} $HOME/.kube/config ${SSH_USER}@${node_ip}:$HOME/.kube
    ssh -p${SSH_PORT} -i${SSH_KEY_FILE} ${SSH_USER}@${node_ip} 'chown $(id -u):$(id -g) $HOME/.kube/config' 
    }
  done  
```

**将node1和node2加入到集群中**

这里需要用到2.2中初始化master最后生成的token和sha256值

```shell
kubeadm join 172.30.100.101:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:4dbb97534e8304bb78023352236b898730062a35569e1c7f9247e6c7e81f250d
```

```python
输出结果  
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.

```

`kubeadm join` 命令执行流程如下所示

![iShot2020-10-20 16.04.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-20%2016.04.22.png)





**如果忘记了token和sha256值，可以在master节点使用如下命令查看**

```shell
# 查看token
$ kubeadm token list
TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION                                                EXTRA GROUPS
abcdef.0123456789abcdef   23h         2021-11-08T10:22:16Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
            
# 查看sha256            
$ openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
4dbb97534e8304bb78023352236b898730062a35569e1c7f9247e6c7e81f250d

# 同时查看token和sha256
$ kubeadm token create --print-join-command
kubeadm join 172.30.100.101:6443 --token ztnnf4.rnk33s1lpfyc4w98 --discovery-token-ca-cert-hash sha256:4dbb97534e8304bb78023352236b898730062a35569e1c7f9247e6c7e81f250d
```



**这个时候其实集群还不能正常使用，因为还没有安装网络插件，接下来安装网络插件，可以在文档 https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/ 中选择我们自己的网络插件，这里我们安装 flannel**

[k8s网络插件官方文档](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

[calio插件官方文档](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

```shell
$ kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master01   Ready    control-plane,master   24m    v1.22.2
k8s-node01     Ready    <none>                 101s   v1.22.2
k8s-node02     Ready    <none>                 112s   v1.22.2
```



## 2.4 master节点安装网络插件flannel

### 2.4.1 下载文件

```shell
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```



### 2.4.2 修改文件内容

搜索 `kube-flannel-ds` ，在 `kube-flannel-ds` 中 `containers` 下的 `args` 添加一行 `- --iface=eth0`，这么做是为了避免机器中是多网卡的情况，这里手动指定一下网卡名称

```yaml
containers:
- name: kube-flannel
  image: quay.io/coreos/flannel:v0.15.0
  command:
  - /opt/bin/flanneld
  args:
  - --ip-masq
  - --kube-subnet-mgr
  - --iface=eth0	# 增加一行
```



### 2.4.3 修改完成后安装flannel网络插件

```shell
kubectl apply -f kube-flannel.yml
```

:::caution

这里有坑！！！，执行完 `kubectl apply -f kube-flannel.yml` 命令后查看所有pod状态，这个时候coredns一定是有问题的，查看coredns会发现如下报错

:::



`could not add IP address to "cni0": permission denied`

![iShot2021-11-14 17.36.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-14%2017.36.23.png)



![iShot2021-11-07 23.39.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-07%2023.39.13.png)



执行  `ip a`  命令查看网卡信息，可以看到有一个虚拟网卡 `cni0` ，这个虚拟网卡的IP段是 `10.88.0.0/16` 段的，这个就是应用flannel后创建的虚拟网卡

![iShot2021-11-14 17.37.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-14%2017.37.34.png)



查看cni配置文件

```shell
$  ls /etc/cni/net.d/
10-containerd-net.conflist  10-flannel.conflist
```



`10.88.0.0./16`  就是由 `/etc/cni/net.d/10-containerd-net.conflist ` 这个文件中定义的，而 `10-flannel.conflist` 才是我们想要的文件

```yaml
$ cat /etc/cni/net.d/10-containerd-net.conflist 
{
  "cniVersion": "0.4.0",
  "name": "containerd-net",
  "plugins": [
    {
      "type": "bridge",
      "bridge": "cni0",
      "isGateway": true,
      "ipMasq": true,
      "promiscMode": true,
      "ipam": {
        "type": "host-local",
        "ranges": [
          [{
            "subnet": "10.88.0.0/16"
          }],
          [{
            "subnet": "2001:4860:4860::/64"
          }]
        ],
        "routes": [
          { "dst": "0.0.0.0/0" },
          { "dst": "::/0" }
        ]
      }
    },
    {
      "type": "portmap",
      "capabilities": {"portMappings": true}
    }
  ]
}
```



这个 cni 插件类型是 `bridge` 网络，网桥的名称为 `cni0`，但是使用 bridge 网络的容器无法跨多个宿主机进行通信，跨主机通信需要借助其他的 cni 插件，比如上面我们安装的 Flannel，或者 Calico 等等，由于我们这里有两个 cni 配置，所以我们需要将 `10-containerd-net.conflist` 这个配置删除，因为如果这个目录中有多个 cni 配置文件，kubelet 将会使用按文件名的字典顺序排列的第一个作为配置文件，所以前面默认选择使用的是 `containerd-net` 这个插件。

```shell
mv /etc/cni/net.d/10-containerd-net.conflist /etc/cni/net.d/10-containerd-net.conflist.bak
ifconfig cni0 down && ip link delete cni0
systemctl daemon-reload
systemctl restart containerd kubelet
```



再次查看coredns就没有问题了

![iShot2021-11-14 17.53.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-14%2017.53.34.png)



### 2.4.4 安装完成后稍等一会查看pods状态，全部为running即为正确

```shell
$ kubectl get pods -n kube-system
NAME                                   READY   STATUS    RESTARTS   AGE
coredns-7568f67dbd-26nkx               1/1     Running   0          6d3h
coredns-7568f67dbd-n56bc               1/1     Running   0          6d3h
etcd-k8s-master01                      1/1     Running   0          6d3h
kube-apiserver-k8s-master01            1/1     Running   0          6d3h
kube-controller-manager-k8s-master01   1/1     Running   0          6d3h
kube-flannel-ds-7rbqf                  1/1     Running   0          20m
kube-flannel-ds-kwtzt                  1/1     Running   0          20m
kube-flannel-ds-tswz7                  1/1     Running   0          20m
kube-proxy-blqbn                       1/1     Running   0          6d3h
kube-proxy-mwqmv                       1/1     Running   0          6d3h
kube-proxy-sgwhm                       1/1     Running   0          6d3h
kube-scheduler-k8s-master01            1/1     Running   0          6d3h
```



### 2.4.5 查看node状态

```shell
$ kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master01   Ready    control-plane,master   6d3h   v1.22.2
k8s-node01     Ready    <none>                 6d3h   v1.22.2
k8s-node02     Ready    <none>                 6d3h   v1.22.2
```





## 2.5 安装Dashboard(可选)

### 2.5.1 下载yaml文件

[这里查看dashboard对应的k8s版本](https://github.com/kubernetes/dashboard/releases)

```shell
cd /opt/k8s/yaml
wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.4.0/aio/deploy/recommended.yaml
mv recommended.yaml dashboard-v2.4.0.yaml
```



###  2.5.2 修改文件

> **修改Service为NodePort类型**

```shell
# 原先内容
spec:
  ports:
    - port: 443
      targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard


# 修改后内容
spec:
  type: NodePort		# 新增一行，修改类型为nodeport
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30001   # 新增一行，指定nodeport端口
  selector:
    k8s-app: kubernetes-dashboard
```



### 2.5.3 部署dashboard

```shell
kubectl apply -f dashboard-v2.4.0.yaml
```



### 2.5.4 查看dashboard的运行状态及外网访问端口

```python
# 查看dashboard运行状态
$ kubectl get pods -n kubernetes-dashboard -l k8s-app=kubernetes-dashboard
NAME                                    READY   STATUS    RESTARTS   AGE
kubernetes-dashboard-576cb95f94-nmtkl   1/1     Running   0          6m55s

# 查看dashboard外网访问端口
$ kubectl get svc -n kubernetes-dashboard -l k8s-app=kubernetes-dashboard
NAME                   TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.99.205.24   <none>        443:30001/TCP   7m10s
```



### 2.5.5 创建一个具有全局所有权限的用户来登录Dashboard

```yaml
# 编辑admin.yaml文件
cat > /opt/k8s/yaml/admin.yaml <<EOF
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: admin
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
subjects:
- kind: ServiceAccount
  name: admin
  namespace: kubernetes-dashboard
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin
  namespace: kubernetes-dashboard
EOF

# 直接创建
kubectl apply -f /opt/k8s/yaml/admin.yaml
```



### 2.5.6 查看dashboard token

```shell
# 查看token
$ kubectl get secret -n kubernetes-dashboard|grep admin-token
admin-token-852sr                  kubernetes.io/service-account-token   3      103s

# 获取base64解码后的字符串，注意需要用到上边命令查看到的token，会生成很长的一串字符串
kubectl get secret admin-token-zcwfb -o jsonpath={.data.token} -n kubernetes-dashboard |base64 -d

# 直接用这条命令搞定
kubectl get secret `kubectl get secret -n kubernetes-dashboard | grep admin-token|awk '{print $1}'` -o jsonpath={.data.token} -n kubernetes-dashboard |base64 -d && echo
```



### 2.5.6 访问dashboard

:::tip

浏览器访问 `https://ip:30001`，注意是 `https`

:::



谷歌浏览器访问会提示如下

![iShot2021-10-01 15.46.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-01%2015.46.33.png)



通过火狐浏览器访问

![iShot2021-10-01 15.52.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-01%2015.52.45.png)



**然后粘贴2.5.6步骤中生成的base64字符串登陆dashboard，在登陆页面选择``令牌``一项**

![iShot2021-10-01 15.54.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-01%2015.54.35.png)



**登陆后的首界面**

![iShot2021-11-14 18.19.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-14 18.19.11.png)





## 2.7 安装k8s切换命名空间工具(可选)

```python
# 下载包
git clone https://github.com/ahmetb/kubectx.git
cp kubectx/kubens /usr/local/bin

# 查看所有命名空间
$ kubens

# 切换到kube-system命名空间
$ kubens kube-system
Context "kubernetes-admin@kubernetes" modified.
Active namespace is "kube-system".
```



<h3 style={{color: 'red'}}>到此，使用kubeadm安装k8s 1.22.2完成！！！</h3>







