[toc]



# centos8.2二进制安装k8s1.16.6

[本文抄袭至github](https://github.com/opsnull/follow-me-install-kubernetes-cluster)



# 一、环境准备

## 1.1 实验环境

| 角色        | IP地址        | 主机名          | docker版本  | 硬件配置 | 系统          | 内核                      | 安装组件                                                     |
| ----------- | ------------- | --------------- | ----------- | -------- | ------------- | ------------------------- | ------------------------------------------------------------ |
| **master1** | **10.0.0.30** | **k8s-master1** | **19.03.4** | **2c4g** | **CentOS8.2** | **4.18.0-193.el8.x86_64** | **kube-apiserver，kube-controller-manager，kube-scheduler，etcd** |
| **node1**   | **10.0.0.33** | **k8s-node1**   | **19.03.4** | **2c4g** | **CentOS8.2** | **4.18.0-193.el8.x86_64** | **kubelet，kube-proxy，docker，etcd**                        |
| **node2**   | **10.0.0.34** | **k8s-node2**   | **19.03.4** | **2c4g** | **CentOS8.2** | **4.18.0-193.el8.x86_64** | **kubelet，kube-proxy，docker，etcd**                        |



**CentOS8.2采用最小化安装，并执行了以下脚本**

```shell
#!/usr/bin/env bash
#

#修改系统yum源为aliyun并添加epel源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
[ ! -e /etc/yum.repos.d/CentOS-Base.repo ] && curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-8.repo
  
dnf clean all
dnf makecache

yum install -y https://mirrors.aliyun.com/epel/epel-release-latest-8.noarch.rpm

sed -i 's|^#baseurl=https://download.fedoraproject.org/pub|baseurl=https://mirrors.aliyun.com|' /etc/yum.repos.d/epel*
sed -i 's|^metalink|#metalink|' /etc/yum.repos.d/epel*


dnf -y install tar wget net-tools git vim tree lrzsz htop iftop iotop psmisc python36 python3-devel zlib zlib-devel gcc gcc-c++ conntrack-tools jq socat bash-completion telnet nload strace tcpdump lsof sysstat

#关闭防火墙、selinux、NetworkManager
systemctl disable firewalld NetworkManager
sed -i '7s/enforcing/disabled/' /etc/selinux/config

#同步时间计划任务
rpm -ivh http://mirrors.wlnmp.com/centos/wlnmp-release-centos.noarch.rpm && dnf -y install wntp

sed -i '/*\/10 \* \* \* \* \/usr\/sbin\/ntpdate ntp2\.aliyun\.com &>\/dev\/null/d' /var/spool/cron/root
echo "*/10 * * * * /usr/local/bin/ntpdate ntp2.aliyun.com &>/dev/null" >>/var/spool/cron/root

#历史命令显示时间
sed -i '/HISTFILESIZE=2000/d' /etc/bashrc
sed -i '/HISTSIZE=2000/d' /etc/bashrc
sed -i '/HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "/d' /etc/bashrc
sed -i '/export HISTTIMEFORMAT/d' /etc/bashrc
cat >>/etc/bashrc<<'EOF'
HISTFILESIZE=2000
HISTSIZE=2000
HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTTIMEFORMAT
EOF
source /etc/bashrc

#修改系统最大文件描述符
sed -i '/root soft nofile 65535/d' /etc/security/limits.conf
sed -i '/root hard nofile 65535/d' /etc/security/limits.conf
sed -i '/* soft nofile 65535/d' /etc/security/limits.conf
sed -i '/* hard nofile 65535/d' /etc/security/limits.conf
cat >>/etc/security/limits.conf<<'EOF'
root soft nofile 65535
root hard nofile 65535
* soft nofile 65535
* hard nofile 65535
EOF

#设置pip国内源
mkdir ~/.pip
cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF

pip3 install glances mycli

#个人习惯执行命令 netstat -ntpl，所以做一个别名
sed -i.bak "8c alias n='netstat -ntpl'" ~/.bashrc && source ~/.bashrc


#centos8使用NetworkManager管理网络
systemctl enable NetworkManager

reboot
```





## 1.2  每个节点配置host信息



```python
cat >> /etc/hosts << EOF
10.0.0.30 k8s-master1
10.0.0.31 k8s-master2
10.0.0.32 k8s-master3
10.0.0.33 k8s-node1
10.0.0.34 k8s-node2
10.0.0.35 k8s-node3
EOF

```



##  1.3禁用防火墙和selinux

```python
//禁用防火墙
systemctl stop firewalld && systemctl disable firewalld

//禁用selinux
#临时修改
setenforce 0

#永久修改，重启服务器后生效
sed -i '7s/enforcing/disabled/' /etc/selinux/config
```



## 1.4 关闭swap

```shell
#手动关闭swap
swapoff -a

#修改fstab文件，注释swap自动挂载
sed -i '/^\/dev\/mapper\/centos-swap/c#/dev/mapper/centos-swap swap                    swap    defaults        0 0' /etc/fstab

#查看swap是否关闭
$ free -m
              total        used        free      shared  buff/cache   available
Mem:           3932         126        3601           8         204        3581
Swap:             0           0           0
```



## 1.5 将桥接的IPv4流量传递到iptables的链

```shell
#向文件中写入以下内容
cat >/etc/sysctl.d/k8s.conf <<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

#执行以下命令生效
modprobe br_netfilter && sysctl -p /etc/sysctl.d/k8s.conf

```



## 1.6 配置时间同步

**master节点操作**

```shell
1.安装chrony
dnf -y install chrony

2.编辑chrony配置文件/etc/chrony.conf
    /修改以下1行，使用阿里云NTP服务器
    pool 2.centos.pool.ntp.org iburst
    修改为
    server ntp1.aliyun.com iburst
   /允许连接控制节点的网段，24行增加以下一行
    allow 10.0.0.0/24

#用以下命令修改
sed -i.bak '3d' /etc/chrony.conf && sed -i '3cserver ntp1.aliyun.com iburst' \
/etc/chrony.conf && sed -i '23callow 10.0.0.0/24' /etc/chrony.conf

3.启动NTP服务并设置开机自启
systemctl enable chronyd && systemctl start chronyd

4.检查端口，监听udp323端口
$ netstat -nupl|grep chronyd
udp        0      0 127.0.0.1:323           0.0.0.0:*              29356/chronyd       
udp        0      0 0.0.0.0:123             0.0.0.0:*              29356/chronyd       
udp6       0      0 ::1:323                 :::*                   29356/chronyd   

5.验证
$ chronyc sources
210 Number of sources = 1
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* 120.25.115.20                 2   6    37    29    +43us[ -830us] +/-   22ms
```



**node1、node2节点操作**

```shell
1.安装chrony
dnf -y install chrony

2.编辑chrony配置文件/etc/chrony.conf
    /修改以下1行，指定控制节点为NTP服务器
    pool 2.centos.pool.ntp.org iburst
    修改为
    server k8s-master1 iburst

#用以下命令修改
sed -i.bak '3d' /etc/chrony.conf && sed -i '3cserver k8s-master1 iburst' /etc/chrony.conf    

3.启动NTP服务并设置开机自启
systemctl enable chronyd && systemctl start chronyd

4.检查端口，监听udp323端口
$ netstat -nupl|grep chronyd
udp        0      0 127.0.0.1:323       0.0.0.0:*         1327/chronyd        
udp6       0      0 ::1:323             :::*              1327/chronyd     

5.验证，计算节点显示的是控制节点
$ chronyc sources
210 Number of sources = 1
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* k8s-master1                   3   6    17     9   +122ns[-9694ns] +/-   32ms
```



## 1.7 配置master节点可以免密登陆node节点

**生成密钥对**

```shell
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa &>/dev/null
```



**编辑expect自动化交互脚本**

这里机器用户名是`root`，密码是国际标准通用密码`1`

```shell
cat >ssh.exp <<'EOF'
#!/usr/bin/expect
if { $argc !=2 } {
  send_user "usage: expect ssh.exp file ip\n"
  exit
}

set file [lindex $argv 0]
set ip [lindex $argv 1]
set password "1"

spawn ssh-copy-id -i $file -p 22 root@$ip
expect {
  "yes/no" {send "yes\r";exp_continue}
  "*password" {send "$password\r"}
}
expect eof
EOF
```



**编辑shell脚本循环执行expect脚本**

```shell
#编辑脚本
cat > ssh.sh <<'EOF'
#!/bin/bash
for i in 30 33 34
do
  expect ~/ssh.exp ~/.ssh/id_rsa.pub 10.0.0.$i
done
EOF

#安装expect
dnf -y install expect

#执行脚本
sh ssh.sh
```





# 二、创建CA根证书和秘钥

CA根证书说明

- 为确保安全，`kubernetes` 系统各组件需要使用 `x509` 证书对通信进行加密和认证。

- CA (Certificate Authority) 是自签名的根证书，用来签名后续创建的其它证书。

- CA证书是集群所有节点共享的，**只需要创建一次**，后续用它签名其它所有证书。

- 本文档使用 `CloudFlare` 的 PKI 工具集 [cfssl](https://github.com/cloudflare/cfssl) 创建所有证书。



## 2.1 创建存放CA根证书的目录

```shell
mkdir -p /opt/k8s/cert && cd /opt/k8s/cert
```



## 2.2 下载并配置cfssl工具集

[cfssl官网](https://cfssl.org/)

[cfssl github地址](https://github.com/cloudflare/cfssl)

**cfssl是一个开源的证书管理工具，使用json文件生成证书，相比openssl更方便使用。**

```shell
#下载cfssl工具集
wget https://github.com/cloudflare/cfssl/releases/download/v1.4.1/cfssl-certinfo_1.4.1_linux_amd64
wget https://github.com/cloudflare/cfssl/releases/download/v1.4.1/cfssljson_1.4.1_linux_amd64
wget https://github.com/cloudflare/cfssl/releases/download/v1.4.1/cfssl_1.4.1_linux_amd64

#给予执行权限
chmod +x cfssl*

#修改名称并移动到/usr/local/bin
mv cfssl_1.4.1_linux_amd64 /usr/local/bin/cfssl
mv cfssljson_1.4.1_linux_amd64 /usr/local/bin/cfssljson
mv cfssl-certinfo_1.4.1_linux_amd64 /usr/local/bin/cfssl-certinfo
```



## 2.3 创建配置文件

```shell
cd /opt/k8s/cert
cat > ca-config.json <<EOF
{
  "signing": {
    "default": {
      "expiry": "876000h"
    },
    "profiles": {
      "kubernetes": {
        "usages": [
            "signing",
            "key encipherment",
            "server auth",
            "client auth"
        ],
        "expiry": "876000h"
      }
    }
  }
}
EOF
```



**配置文件中的一些参数说明**

- `signing`：表示该证书可用于签名其它证书（生成的 `ca.pem` 证书中 `CA=TRUE`）；
- `server auth`：表示 client 可以用该该证书对 server 提供的证书进行验证；
- `client auth`：表示 server 可以用该该证书对 client 提供的证书进行验证；
- `"expiry": "876000h"`：证书有效期设置为 100 年；



## 2.4 创建证书签名请求文件

```shell
cd /opt/k8s/cert
cat > ca-csr.json <<EOF
{
  "CN": "kubernetes-ca",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "k8s",
      "OU": "opsnull"
    }
  ],
  "ca": {
    "expiry": "876000h"
 }
}
EOF
```



**配置文件中的一些参数说明**

- `CN：Common Name`：kube-apiserver 从证书中提取该字段作为请求的**用户名 (User Name)**，浏览器使用该字段验证网站是否合法；
- `O：Organization`：kube-apiserver 从证书中提取该字段作为请求用户所属的**组 (Group)**；
- kube-apiserver 将提取的 `User、Group` 作为 `RBAC` 授权的用户标识；



**⚠️注意：**

- 不同证书 csr 文件的 CN、C、ST、L、O、OU 组合必须不同，否则可能出现 `PEER'S CERTIFICATE HAS AN INVALID SIGNATURE` 错误；

- 后续创建证书的 csr 文件时，CN 都不相同（C、ST、L、O、OU 相同），以达到区分的目的；



## 2.5 生成 CA 证书和私钥

```shell
cd /opt/k8s/cert
cfssl gencert -initca ca-csr.json | cfssljson -bare ca


#命令执行成功后会生成如下3个文件
ca.csr ca-key.pem  ca.pem
```



## 2.6 编辑定义脚本

后续使用的环境变量都定义在脚本`environment.sh`中，请根据**自己的机器、网络情况**修改。然后拷贝到**所有**节点

```shell
mkdir /opt/k8s/script
cat > /opt/k8s/script/environment.sh << 'EOF'
#!/usr/bin/env bash

# 生成 EncryptionConfig 所需的加密 key
export ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64)

# 集群各机器 IP 数组
export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)

# 集群各 IP 对应的主机名数组
export NODE_NAMES=(k8s-master1 k8s-node1 k8s-node2)

# etcd 集群服务地址列表
export ETCD_ENDPOINTS="https://10.0.0.30:2379,https://10.0.0.33:2379,https://10.0.0.34:2379"

# etcd 集群间通信的 IP 和端口
export ETCD_NODES="k8s-master1=https://10.0.0.30:2380,k8s-node1=https://10.0.0.33:2380,k8s-node2=https://10.0.0.34:2380"

# kube-apiserver 的反向代理(kube-nginx)地址端口
export KUBE_APISERVER="https://127.0.0.1:8443"

# 节点间互联网络接口名称
export IFACE="eth0"

# etcd 数据目录
export ETCD_DATA_DIR="/data/k8s/etcd/data"

# etcd WAL 目录，建议是 SSD 磁盘分区，或者和 ETCD_DATA_DIR 不同的磁盘分区
export ETCD_WAL_DIR="/data/k8s/etcd/wal"

# k8s 各组件数据目录
export K8S_DIR="/data/k8s/k8s"

## DOCKER_DIR 和 CONTAINERD_DIR 二选一
# docker 数据目录
export DOCKER_DIR="/data/k8s/docker"

# containerd 数据目录
export CONTAINERD_DIR="/data/k8s/containerd"

## 以下参数一般不需要修改

# TLS Bootstrapping 使用的 Token，可以使用命令 head -c 16 /dev/urandom | od -An -t x | tr -d ' ' 生成
BOOTSTRAP_TOKEN="41f7e4ba8b7be874fcff18bf5cf41a7c"

# 最好使用 当前未用的网段 来定义服务网段和 Pod 网段

# 服务网段，部署前路由不可达，部署后集群内路由可达(kube-proxy 保证)
SERVICE_CIDR="10.254.0.0/16"

# Pod 网段，建议 /16 段地址，部署前路由不可达，部署后集群内路由可达(flanneld 保证)
CLUSTER_CIDR="172.30.0.0/16"

# 服务端口范围 (NodePort Range)
export NODE_PORT_RANGE="30000-32767"

# kubernetes 服务 IP (一般是 SERVICE_CIDR 中第一个IP)
export CLUSTER_KUBERNETES_SVC_IP="10.254.0.1"

# 集群 DNS 服务 IP (从 SERVICE_CIDR 中预分配)
export CLUSTER_DNS_SVC_IP="10.254.0.2"

# 集群 DNS 域名（末尾不带点号）
export CLUSTER_DNS_DOMAIN="cluster.local"

# 将二进制目录 /opt/k8s/bin 加到 PATH 中
# export PATH=/opt/k8s/bin:$PATH
EOF
```



## 2.7 给其余节点分发证书文件

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /etc/kubernetes/cert"
    scp ca*.pem ca-config.json root@${node_ip}:/etc/kubernetes/cert
  done
```



**以上脚本执行过程说明**

- 1、`进入到目录/opt/k8s/cert`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量

- 3、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`

- 4、ssh连接到每一台机器，创建目录`/etc/kubernetes/cert`，然后拷贝`/opt/k8s/cert`目录下的`ca*.pem` `、 ca-config.json`文件到`/etc/kubernetes/cert`





# 三、安装和配置kubectl

本文档只需要**部署一次**，生成的 kubeconfig 文件是**通用的**，可以拷贝到需要执行 kubectl 命令的机器的 `~/.kube/config` 位置



## 3.1 下载和分发 kubectl 二进制文件

**创建工作目录**

```shell
mkdir -p /opt/k8s/kubectl && cd /opt/k8s/kubectl
```



**下载文件**

```shell
# 自行解决翻墙下载问题
wget https://dl.k8s.io/v1.16.6/kubernetes-client-linux-amd64.tar.gz 
tar xf kubernetes-client-linux-amd64.tar.gz
```



**分发到所有使用 kubectl 工具的节点**

```shell
cd /opt/k8s/kubectl
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp -p kubernetes/client/bin/kubectl root@${node_ip}:/usr/local/bin
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/kubectl`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`
- 4、将master节点的`/opt/k8s/kubectl/kubernetes/client/bin/kubectl`工具拷贝到每一个节点的`/usr/local/bin`下



## 3.2 创建 admin 证书和私钥

- kubectl 使用 https 协议与 kube-apiserver 进行安全通信，kube-apiserver 对 kubectl 请求包含的证书进行认证和授权。

- kubectl 后续用于集群管理，所以这里创建具有**最高权限**的 admin 证书。



### 3.2.1 创建证书签名请求

```shell
cd /opt/k8s/cert
cat > admin-csr.json <<EOF
{
  "CN": "admin",
  "hosts": [],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "system:masters",
      "OU": "opsnull"
    }
  ]
}
EOF
```



**配置文件参数说明**

- `O: system:masters`：kube-apiserver 收到使用该证书的客户端请求后，为请求添加组（Group）认证标识 `system:masters`；
- 预定义的 ClusterRoleBinding `cluster-admin` 将 Group `system:masters` 与 Role `cluster-admin` 绑定，该 Role 授予操作集群所需的**最高**权限；
- 该证书只会被 kubectl 当做 client 证书使用，所以 `hosts` 字段为空；



### 3.2.2 生成证书和私钥

**<span style=color:red>⚠️忽略警告消息 `[WARNING] This certificate lacks a "hosts" field.`；</span>**

```shell
cd /opt/k8s/cert
cfssl gencert -ca=/opt/k8s/cert/ca.pem \
  -ca-key=/opt/k8s/cert/ca-key.pem \
  -config=/opt/k8s/cert/ca-config.json \
  -profile=kubernetes admin-csr.json | cfssljson -bare admin


#命令执行成功后会生成如下文件
admin.csr  admin-key.pem  admin.pem
```



## 3.3 创建 kubeconfig 文件

kubectl 使用 kubeconfig 文件访问 apiserver，该文件包含 kube-apiserver 的地址和认证信息（CA 证书和客户端证书）



```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh

# 设置集群参数 ${NODE_IPS[0]}就是k8s-master1 10.0.0.30
kubectl config set-cluster kubernetes \
  --certificate-authority=/opt/k8s/cert/ca.pem \
  --embed-certs=true \
  --server=https://${NODE_IPS[0]}:6443 \
  --kubeconfig=kubectl.kubeconfig

# 设置客户端认证参数
kubectl config set-credentials admin \
  --client-certificate=/opt/k8s/cert/admin.pem \
  --client-key=/opt/k8s/cert/admin-key.pem \
  --embed-certs=true \
  --kubeconfig=kubectl.kubeconfig

# 设置上下文参数
kubectl config set-context kubernetes \
  --cluster=kubernetes \
  --user=admin \
  --kubeconfig=kubectl.kubeconfig

# 设置默认上下文
kubectl config use-context kubernetes --kubeconfig=kubectl.kubeconfig
```



**执行完成后会在`/opt/k8s/cert`中生成文件`kubectl.kubeconfig`**



**参数说明**

- `--certificate-authority`：验证 kube-apiserver 证书的根证书；
- `--client-certificate`、`--client-key`：刚生成的 `admin` 证书和私钥，与 kube-apiserver https 通信时使用；
- `--embed-certs=true`：将 ca.pem 和 admin.pem 证书内容嵌入到生成的 kubectl.kubeconfig 文件中(否则，写入的是证书文件路径，后续拷贝 kubeconfig 到其它机器时，还需要单独拷贝证书文件，不方便。)；
- `--server`：指定 kube-apiserver 的地址，这里指向第一个节点上的服务；



## 3.4 分发 kubeconfig 文件

**分发到所有使用 `kubectl` 命令的节点**

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ~/.kube"
    scp kubectl.kubeconfig root@${node_ip}:~/.kube/config
  done
```



**以上脚本执行过程说明**

- 1、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 2、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`
- 3、ssh连接到每一台机器，创建目录`~/.kube`，然后拷贝`/opt/k8s/cert`目录下的`kubectl.kubeconfig`文件到`~/.kube`





# 四、部署etcd集群

etcd 是基于 Raft 的分布式 KV 存储系统，由 CoreOS 开发，常用于服务发现、共享配置以及并发控制（如 leader 选举、分布式锁等）。

kubernetes 使用 etcd 集群持久化存储所有 API 对象、运行数据。

本文档介绍部署一个三节点高可用 etcd 集群的步骤：

- 下载和分发 etcd 二进制文件；
- 创建 etcd 集群各节点的 x509 证书，用于加密客户端(如 etcdctl) 与 etcd 集群、etcd 集群之间的通信；
- 创建 etcd 的 systemd unit 文件，配置服务参数；
- 检查集群工作状态；

etcd 集群节点名称和 IP 如下：

- k8s-master1：10.0.0.30
- k8s-node1：10.0.0.33
- k8s-node2：10.0.0.34



etcd可以单独部署，只要apiserver能连接到就行。这里为了节省资源选择部署在k8s的3台机器中

**<span style=color:red>⚠️flanneld 与本文档安装的 etcd v3.4.x 不兼容，如果要安装 flanneld（本文档使用 calio），则需要将 etcd降级到 v3.3.x 版本；</span>**



## 4.1 下载和分发 etcd 二进制文件

[etcd github地址](https://github.com/etcd-io/etcd)

[etcd官网](https://etcd.io/)



**创建目录**

```shell
mkdir /opt/k8s/etcd && cd /opt/k8s/etcd
```



**下载二进制文件**

```shell
wget https://github.com/etcd-io/etcd/releases/download/v3.4.9/etcd-v3.4.9-linux-amd64.tar.gz
tar xf etcd-v3.4.9-linux-amd64.tar.gz
```



**分发二进制文件到集群所有节点**

```shell
cd /opt/k8s/etcd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp etcd-v3.4.9-linux-amd64/etcd* root@${node_ip}:/usr/local/bin
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/etcd`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`
- 4、将master节点的`/opt/k8s/etcd/etcd-v3.4.9-linux-amd64/etcd、etcdctl`两个命令拷贝到每一个节点的`/usr/local/bin`下



## 4.2 创建 etcd 证书和私钥

### 4.2.1 创建证书签名请求

- `hosts`：指定授权使用该证书的 etcd 节点 IP 列表，**需要将 etcd 集群所有节点 IP 都列在其中**
- **<span style=color:red>⚠️文件中的IP是etcd节点的IP，哪些节点部署了etcd就写哪些节点的IP，为了方便后期扩展这里还可以多写几个IP</span>**

```shell
cd /opt/k8s/cert
cat > etcd-csr.json <<EOF
{
  "CN": "etcd",
  "hosts": [
    "127.0.0.1",
    "10.0.0.30",
    "10.0.0.33",
    "10.0.0.34"
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "k8s",
      "OU": "opsnull"
    }
  ]
}
EOF
```



### 4.2.2 生成证书和私钥

```shell
cd /opt/k8s/cert
cfssl gencert -ca=/opt/k8s/cert/ca.pem \
    -ca-key=/opt/k8s/cert/ca-key.pem \
    -config=/opt/k8s/cert/ca-config.json \
    -profile=kubernetes etcd-csr.json | cfssljson -bare etcd
    
    
#以上命令执行成功后会生成如下文件
etcd.csr  etcd-key.peml  etcd.pem
```



### 4.2.3 分发生成的证书和私钥到各 etcd 节点

```shell
cd /opt/k8s/cert
export NODE_IPS=(10.0.0.33 10.0.0.34)
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /opt/k8s/cert"
    scp etcd*.pem root@${node_ip}:/opt/k8s/cert
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/cert`
- 2、for循环变量`${NODE_IPS[@]}`，这个变量就是集群各机器 IP 数组
- 3、ssh连接到每一个节点，创建目录`/opt/k8s/cert`
- 4、将master节点的`/opt/k8s/cert/etcd*.pem`拷贝到每一个节点的`/opt/k8s/cert`下



## 4.3 创建 etcd 的 systemd unit 模板文件

**使用systemd管理etcd**

```shell
cd /opt/k8s/etcd
source /opt/k8s/bin/environment.sh
cat > etcd.service.template <<EOF
[Unit]
Description=Etcd Server
After=network.target
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
WorkingDirectory=${ETCD_DATA_DIR}
ExecStart=/usr/local/bin/etcd \\
  --data-dir=${ETCD_DATA_DIR} \\
  --wal-dir=${ETCD_WAL_DIR} \\
  --name=##NODE_NAME## \\
  --cert-file=/opt/k8s/cert/etcd.pem \\
  --key-file=/opt/k8s/cert/etcd-key.pem \\
  --trusted-ca-file=/etc/kubernetes/cert/ca.pem \\
  --peer-cert-file=/opt/k8s/cert/etcd.pem \\
  --peer-key-file=/opt/k8s/cert/etcd-key.pem \\
  --peer-trusted-ca-file=/etc/kubernetes/cert/ca.pem \\
  --peer-client-cert-auth \\
  --client-cert-auth \\
  --listen-peer-urls=https://##NODE_IP##:2380 \\
  --initial-advertise-peer-urls=https://##NODE_IP##:2380 \\
  --listen-client-urls=https://##NODE_IP##:2379,http://127.0.0.1:2379 \\
  --advertise-client-urls=https://##NODE_IP##:2379 \\
  --initial-cluster-token=etcd-cluster-0 \\
  --initial-cluster=${ETCD_NODES} \\
  --initial-cluster-state=new \\
  --auto-compaction-mode=periodic \\
  --auto-compaction-retention=1 \\
  --max-request-bytes=33554432 \\
  --quota-backend-bytes=6442450944 \\
  --heartbeat-interval=250 \\
  --election-timeout=2000
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```



**主要参数说明**

- `WorkingDirectory`、`--data-dir`：指定工作目录和数据目录为 `${ETCD_DATA_DIR}`，需在启动服务前创建这个目录；
- `--wal-dir`：指定 wal 目录，为了提高性能，一般使用 SSD 或者和 `--data-dir` 不同的磁盘；
- `--name`：指定节点名称，当 `--initial-cluster-state` 值为 `new` 时，`--name` 的参数值必须位于 `--initial-cluster` 列表中；
- `--cert-file`、`--key-file`：etcd server 与 client 通信时使用的证书和私钥；
- `--trusted-ca-file`：签名 client 证书的 CA 证书，用于验证 client 证书；
- `--peer-cert-file`、`--peer-key-file`：etcd 与 peer 通信使用的证书和私钥；
- `--peer-trusted-ca-file`：签名 peer 证书的 CA 证书，用于验证 peer 证书；



## 4.4 为各节点创建和分发 etcd systemd unit 文件

**替换模板文件中的变量，为各节点创建 systemd unit 文件**

```shell
cd /opt/k8s/etcd
source /opt/k8s/script/environment.sh
for (( i=0; i < 3; i++ ))
  do
    sed -e "s/##NODE_NAME##/${NODE_NAMES[i]}/" -e "s/##NODE_IP##/${NODE_IPS[i]}/" etcd.service.template > etcd-${NODE_IPS[i]}.service 
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/etcd`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、for循环3次
- 4、把systemd模版文件分别替换为`${NODE_NAMES}`定义的etcd集群节点
- 5、替换完成后生成3个文件
  - `etcd-10.0.0.30.service`
  - `etcd-10.0.0.33.service`  
  - `etcd-10.0.0.34.service`



**分发生成的 systemd unit 文件**

```shell
cd /opt/k8s/etcd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp etcd-${node_ip}.service root@${node_ip}:/usr/lib/systemd/system/etcd.service
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/etcd`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`
- 4、拷贝`/opt/k8s/etcd`下每一个节点的systemd文件到`/usr/lib/systemd/system/etcd.service`



## 4.5 启动etcd服务

- **必须先创建 etcd 数据目录和工作目录;**
- **etcd 进程首次启动时会等待其它节点的 etcd 加入集群，命令 `systemctl start etcd` 会卡住一段时间，为正常现象；**

```shell
cd /opt/k8s/etcd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ${ETCD_DATA_DIR} ${ETCD_WAL_DIR}"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable etcd && systemctl restart etcd " &
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/etcd`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、ssh连接到每一个节点，创建etcd数据目录和etcd wal目录
- 4、ssh连接到每一个节点，重新加载systemd，启动etcd并设置开机自启

**脚本中的两个变量对应的值**

- ETCD_DATA_DIR	/data/k8s/etcd/data

- ETCD_WAL_DIR	/data/k8s/etcd/wal





## 4.6 检查启动结果

```shell
cd /opt/k8s/work
source /opt/k8s/bin/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl status etcd|grep Active"
  done
```



**确保状态为 `active (running)`，否则使用命令`journalctl -u etcd`查看日志，确认原因**



## 4.7 验证服务状态

**部署完 etcd 集群后，在任一 etcd 节点上执行如下命令**

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    /usr/local/bin/etcdctl \
    --endpoints=https://${node_ip}:2379 \
    --cacert=/etc/kubernetes/cert/ca.pem \
    --cert=/opt/k8s/cert/etcd.pem \
    --key=/opt/k8s/cert/etcd-key.pem endpoint health
  done
```

- **3.4.3 版本的 etcd/etcdctl 默认启用了 V3 API，所以执行 etcdctl 命令时不需要再指定环境变量 `ETCDCTL_API=3`；**
- **从 K8S 1.13 开始，不再支持 v2 版本的 etcd；**



**正确输出结果**

```shell
>>> 10.0.0.30
https://10.0.0.30:2379 is healthy: successfully committed proposal: took = 7.559807ms
>>> 10.0.0.33
https://10.0.0.33:2379 is healthy: successfully committed proposal: took = 7.894138ms
>>> 10.0.0.34
https://10.0.0.34:2379 is healthy: successfully committed proposal: took = 6.715883ms
```



## 4.8 查看当前的 leader

```shell
source /opt/k8s/script/environment.sh
/usr/local/bin/etcdctl \
  -w table --cacert=/etc/kubernetes/cert/ca.pem \
  --cert=/opt/k8s/cert/etcd.pem \
  --key=/opt/k8s/cert/etcd-key.pem \
  --endpoints=${ETCD_ENDPOINTS} endpoint status 
```



**输出结果，可见当前的 leader 为10.0.0.34**

```shell
+------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
|        ENDPOINT        |        ID        | VERSION | DB SIZE | IS LEADER | IS LEARNER | RAFT TERM | RAFT INDEX | RAFT APPLIED INDEX | ERRORS |
+------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
| https://10.0.0.30:2379 | 730ef4b6cd5f7961 |   3.4.9 |   20 kB |     false |      false |         2 |          8 |                  8 |        |
| https://10.0.0.33:2379 | 5b9eb5c20fa5b89e |   3.4.9 |   20 kB |     false |      false |         2 |          8 |                  8 |        |
| https://10.0.0.34:2379 | aa5fec5bdc718820 |   3.4.9 |   20 kB |      true |      false |         2 |          8 |                  8 |        |
+------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
```



# 五、部署 containerd 组件

containerd 实现了 kubernetes 的 Container Runtime Interface (CRI) 接口，提供容器运行时核心功能，如镜像管理、容器管理等，相比 dockerd 更加简单、健壮和可移植。



## 5.1 下载和分发二进制文件

**创建目录**

```shell
mkdir /opt/k8s/containerd && cd /opt/k8s/containerd
```



**下载二进制文件**

```shell
wget https://github.com/kubernetes-sigs/cri-tools/releases/download/v1.17.0/crictl-v1.17.0-linux-amd64.tar.gz \
  https://github.com/opencontainers/runc/releases/download/v1.0.0-rc10/runc.amd64 \
  https://github.com/containernetworking/plugins/releases/download/v0.8.5/cni-plugins-linux-amd64-v0.8.5.tgz \
  https://github.com/containerd/containerd/releases/download/v1.3.3/containerd-1.3.3.linux-amd64.tar.gz 
```



**解压缩**

```shell
tar -xvf containerd-1.3.3.linux-amd64.tar.gz
tar -xvf crictl-v1.17.0-linux-amd64.tar.gz

mkdir cni-plugins
tar xf cni-plugins-linux-amd64-v0.8.5.tgz -C cni-plugins

mv runc.amd64 runc
```



**分发二进制文件到所有 worker 节点**

```shell
cd /opt/k8s/containerd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp -p bin/*  crictl  cni-plugins/*  runc  root@${node_ip}:/usr/local/bin
    ssh root@${node_ip}  mkdir -p /etc/cni/net.d
  done
```



## 5.2 创建和分发 containerd 配置文件

**创建配置文件**

```shell
cd /opt/k8s/containerd
source /opt/k8s/script/environment.sh
cat << EOF | tee containerd-config.toml
version = 2
root = "${CONTAINERD_DIR}/root"
state = "${CONTAINERD_DIR}/state"

[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
    sandbox_image = "registry.cn-beijing.aliyuncs.com/images_k8s/pause-amd64:3.1"
    [plugins."io.containerd.grpc.v1.cri".cni]
      bin_dir = "/usr/local/bin"
      conf_dir = "/etc/cni/net.d"
  [plugins."io.containerd.runtime.v1.linux"]
    shim = "containerd-shim"
    runtime = "runc"
    runtime_root = ""
    no_shim = false
    shim_debug = false
EOF
```



**分发文件**

```shell
cd /opt/k8s/containerd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /etc/containerd/ ${CONTAINERD_DIR}/{root,state}"
    scp containerd-config.toml root@${node_ip}:/etc/containerd/config.toml
  done
```



## 5.3 创建 containerd systemd unit 文件

```shell
cd /opt/k8s/containerd
cat <<EOF | tee containerd.service
[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target

[Service]
Environment="PATH=/usr/local/bin:/bin:/sbin:/usr/bin:/usr/sbin"
ExecStartPre=/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd
Restart=always
RestartSec=5
Delegate=yes
KillMode=process
OOMScoreAdjust=-999
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
EOF
```



## 5.4 分发 systemd unit 文件，启动 containerd 服务

```shell
cd /opt/k8s/containerd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp containerd.service root@${node_ip}:/usr/lib/systemd/system
    ssh root@${node_ip} "systemctl enable containerd && systemctl restart containerd"
  done
```



## 5.5 创建和分发 crictl 配置文件

crictl 是兼容 CRI 容器运行时的命令行工具，提供类似于 docker 命令的功能。具体参考[官方文档](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)。

```shell
cd /opt/k8s/containerd
cat << EOF | tee crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
debug: false
EOF
```



**分发到所有 worker 节点**

```shell
cd /opt/k8s/containerd
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp crictl.yaml root@${node_ip}:/etc/crictl.yaml
  done
```







# 六、部署master节点

## 6.1 下载二进制文件

kubernetes master 节点运行如下组件：

- kube-apiserver
- kube-scheduler
- kube-controller-manager

kube-apiserver、kube-scheduler 和 kube-controller-manager 均以多实例模式运行：

1. kube-scheduler 和 kube-controller-manager 会自动选举产生一个 leader 实例，其它实例处于阻塞模式，当 leader 挂了后，重新选举产生新的 leader，从而保证服务可用性；
2. kube-apiserver 是无状态的，可以通过 kube-nginx 进行代理访问（见[06-2.apiserver高可用](https://github.com/opsnull/follow-me-install-kubernetes-cluster/blob/master/06-2.apiserver高可用.md)），从而保证服务可用性；



**创建目录**

```shell
mkdir /opt/k8s/kubernetes-server && cd /opt/k8s/kubernetes-server
```



**下载二进制文件**

```shell
# 自行解决翻墙问题
wget https://dl.k8s.io/v1.16.6/kubernetes-server-linux-amd64.tar.gz  
tar xf kubernetes-server-linux-amd64.tar.gz
cd kubernetes && tar xf kubernetes-src.tar.gz
```



**将二进制文件拷贝到所有 master 节点**

```shell
cd /opt/k8s/kubernetes-server/kubernetes
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp -p server/bin/{apiextensions-apiserver,kube-apiserver,kube-controller-manager,kube-proxy,kube-scheduler,kubeadm,kubectl,kubelet,mounter} root@${node_ip}:/usr/local/bin/
  done
```



## 6.2 部署 kube-apiserver 集群

**本文档讲解部署一个三实例 kube-apiserver 集群的步骤**



### 6.2.1 创建 kubernetes-master 证书和私钥

**创建证书签名请求**

hosts 字段指定授权使用该证书的 **IP 和域名列表**，这里列出了 master 节点 IP、kubernetes 服务的 IP 和域名

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
cat > kubernetes-csr.json <<EOF
{
  "CN": "kubernetes-master",
  "hosts": [
    "127.0.0.1",
    "10.0.0.30",
    "10.0.0.33",
    "10.0.0.34",
    "${CLUSTER_KUBERNETES_SVC_IP}",
    "kubernetes",
    "kubernetes.default",
    "kubernetes.default.svc",
    "kubernetes.default.svc.cluster",
    "kubernetes.default.svc.cluster.local.",
    "kubernetes.default.svc.${CLUSTER_DNS_DOMAIN}."
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "k8s",
      "OU": "opsnull"
    }
  ]
}
EOF
```



**生成证书和私钥**

```shell
cfssl gencert -ca=/opt/k8s/cert/ca.pem \
  -ca-key=/opt/k8s/cert/ca-key.pem \
  -config=/opt/k8s/cert/ca-config.json \
  -profile=kubernetes kubernetes-csr.json | cfssljson -bare kubernetes
  
  
#上述命令执行成功后会生成如下文件
kubernetes.csr  kubernetes-key.pem  kubernetes.pem
```



**将生成的证书和私钥文件拷贝到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /etc/kubernetes/cert"
    scp kubernetes*.pem root@${node_ip}:/etc/kubernetes/cert/
  done
```



**以上脚本执行过程说明**

- 1、进入到目录`/opt/k8s/cert`
- 2、加载脚本`/opt/k8s/script/environment.sh`中的所有变量
- 3、for循环变量`${NODE_IPS[@]}`，这个变量就是`/opt/k8s/script/environment.sh`脚本中定义的集群各机器 IP 数组`export NODE_IPS=(10.0.0.30 10.0.0.33 10.0.0.34)`
- 4、ssh到每一个节点创建目录`/etc/kubernetes/cert`
- 5、拷贝`/opt/k8s/cert`下`kubernetes*.pem`到`/etc/kubernetes/cert`



### 6.2.2 创建加密配置文件

```shell
mkdir /opt/k8s/yaml && cd /opt/k8s/yaml
source /opt/k8s/script/environment.sh
cat > encryption-config.yaml <<EOF
kind: EncryptionConfig
apiVersion: v1
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: ${ENCRYPTION_KEY}
      - identity: {}
EOF
```



**将加密配置文件拷贝到 master 节点的 `/etc/kubernetes` 目录下**

```shell
cd /opt/k8s/yaml
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp encryption-config.yaml root@${node_ip}:/etc/kubernetes/
  done
```





### 6.2.3 创建审计策略文件

```shell
cd /opt/k8s/yaml
source /opt/k8s/script/environment.sh
cat > audit-policy.yaml <<EOF
apiVersion: audit.k8s.io/v1beta1
kind: Policy
rules:
  # The following requests were manually identified as high-volume and low-risk, so drop them.
  - level: None
    resources:
      - group: ""
        resources:
          - endpoints
          - services
          - services/status
    users:
      - 'system:kube-proxy'
    verbs:
      - watch

  - level: None
    resources:
      - group: ""
        resources:
          - nodes
          - nodes/status
    userGroups:
      - 'system:nodes'
    verbs:
      - get

  - level: None
    namespaces:
      - kube-system
    resources:
      - group: ""
        resources:
          - endpoints
    users:
      - 'system:kube-controller-manager'
      - 'system:kube-scheduler'
      - 'system:serviceaccount:kube-system:endpoint-controller'
    verbs:
      - get
      - update

  - level: None
    resources:
      - group: ""
        resources:
          - namespaces
          - namespaces/status
          - namespaces/finalize
    users:
      - 'system:apiserver'
    verbs:
      - get

  # Don't log HPA fetching metrics.
  - level: None
    resources:
      - group: metrics.k8s.io
    users:
      - 'system:kube-controller-manager'
    verbs:
      - get
      - list

  # Don't log these read-only URLs.
  - level: None
    nonResourceURLs:
      - '/healthz*'
      - /version
      - '/swagger*'

  # Don't log events requests.
  - level: None
    resources:
      - group: ""
        resources:
          - events

  # node and pod status calls from nodes are high-volume and can be large, don't log responses
  # for expected updates from nodes
  - level: Request
    omitStages:
      - RequestReceived
    resources:
      - group: ""
        resources:
          - nodes/status
          - pods/status
    users:
      - kubelet
      - 'system:node-problem-detector'
      - 'system:serviceaccount:kube-system:node-problem-detector'
    verbs:
      - update
      - patch

  - level: Request
    omitStages:
      - RequestReceived
    resources:
      - group: ""
        resources:
          - nodes/status
          - pods/status
    userGroups:
      - 'system:nodes'
    verbs:
      - update
      - patch

  # deletecollection calls can be large, don't log responses for expected namespace deletions
  - level: Request
    omitStages:
      - RequestReceived
    users:
      - 'system:serviceaccount:kube-system:namespace-controller'
    verbs:
      - deletecollection

  # Secrets, ConfigMaps, and TokenReviews can contain sensitive & binary data,
  # so only log at the Metadata level.
  - level: Metadata
    omitStages:
      - RequestReceived
    resources:
      - group: ""
        resources:
          - secrets
          - configmaps
      - group: authentication.k8s.io
        resources:
          - tokenreviews
  # Get repsonses can be large; skip them.
  - level: Request
    omitStages:
      - RequestReceived
    resources:
      - group: ""
      - group: admissionregistration.k8s.io
      - group: apiextensions.k8s.io
      - group: apiregistration.k8s.io
      - group: apps
      - group: authentication.k8s.io
      - group: authorization.k8s.io
      - group: autoscaling
      - group: batch
      - group: certificates.k8s.io
      - group: extensions
      - group: metrics.k8s.io
      - group: networking.k8s.io
      - group: policy
      - group: rbac.authorization.k8s.io
      - group: scheduling.k8s.io
      - group: settings.k8s.io
      - group: storage.k8s.io
    verbs:
      - get
      - list
      - watch

  # Default level for known APIs
  - level: RequestResponse
    omitStages:
      - RequestReceived
    resources:
      - group: ""
      - group: admissionregistration.k8s.io
      - group: apiextensions.k8s.io
      - group: apiregistration.k8s.io
      - group: apps
      - group: authentication.k8s.io
      - group: authorization.k8s.io
      - group: autoscaling
      - group: batch
      - group: certificates.k8s.io
      - group: extensions
      - group: metrics.k8s.io
      - group: networking.k8s.io
      - group: policy
      - group: rbac.authorization.k8s.io
      - group: scheduling.k8s.io
      - group: settings.k8s.io
      - group: storage.k8s.io
      
  # Default level for all other requests.
  - level: Metadata
    omitStages:
      - RequestReceived
EOF
```



**分发审计策略文件**

```shell
cd /opt/k8s/yaml
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp audit-policy.yaml root@${node_ip}:/etc/kubernetes/audit-policy.yaml
  done
```



### 6.2.4 创建后续访问 metrics-server 或 kube-prometheus 使用的证书

**创建证书签名请求**

```shell
cd /opt/k8s/cert
cat > proxy-client-csr.json <<EOF
{
  "CN": "aggregator",
  "hosts": [],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "k8s",
      "OU": "opsnull"
    }
  ]
}
EOF
```



- CN 名称需要位于 kube-apiserver 的 `--requestheader-allowed-names` 参数中，否则后续访问 metrics 时会提示权限不足。



**生成证书和私钥**

```shell
cfssl gencert -ca=/etc/kubernetes/cert/ca.pem \
  -ca-key=/etc/kubernetes/cert/ca-key.pem  \
  -config=/etc/kubernetes/cert/ca-config.json  \
  -profile=kubernetes proxy-client-csr.json | cfssljson -bare proxy-client
  
#上述命令执行成功后会生成如下文件  
proxy-client.csr  proxy-client.pem  proxy-client-key.pem  
```



**将生成的证书和私钥文件拷贝到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp proxy-client*.pem root@${node_ip}:/etc/kubernetes/cert/
  done
```



### 6.2.5 创建 kube-apiserver systemd unit 模板文件

**拷贝证书文件**

```shell
cp /opt/k8s/cert/kubernetes*.pem /etc/kubernetes/cert
```





```shell
cd /opt/k8s/kubernetes-server
source /opt/k8s/script/environment.sh

cat > kube-apiserver.service.template <<EOF
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=network.target

[Service]
WorkingDirectory=${K8S_DIR}/kube-apiserver
ExecStart=/usr/local/bin/kube-apiserver \\
  --advertise-address=##NODE_IP## \\
  --default-not-ready-toleration-seconds=360 \\
  --default-unreachable-toleration-seconds=360 \\
  --feature-gates=DynamicAuditing=true \\
  --max-mutating-requests-inflight=2000 \\
  --max-requests-inflight=4000 \\
  --default-watch-cache-size=200 \\
  --delete-collection-workers=2 \\
  --encryption-provider-config=/etc/kubernetes/encryption-config.yaml \\
  --etcd-cafile=/etc/kubernetes/cert/ca.pem \\
  --etcd-certfile=/opt/k8s/cert/etcd.pem \\
  --etcd-keyfile=/opt/k8s/cert/etcd-key.pem \\
  --etcd-servers=${ETCD_ENDPOINTS} \\
  --bind-address=##NODE_IP## \\
  --secure-port=6443 \\
  --tls-cert-file=/etc/kubernetes/cert/kubernetes.pem \\
  --tls-private-key-file=/etc/kubernetes/cert/kubernetes-key.pem \\
  --insecure-port=0 \\
  --audit-dynamic-configuration \\
  --audit-log-maxage=15 \\
  --audit-log-maxbackup=3 \\
  --audit-log-maxsize=100 \\
  --audit-log-truncate-enabled \\
  --audit-log-path=${K8S_DIR}/kube-apiserver/audit.log \\
  --audit-policy-file=/etc/kubernetes/audit-policy.yaml \\
  --profiling \\
  --anonymous-auth=false \\
  --client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --enable-bootstrap-token-auth \\
  --requestheader-allowed-names="aggregator" \\
  --requestheader-client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --requestheader-extra-headers-prefix="X-Remote-Extra-" \\
  --requestheader-group-headers=X-Remote-Group \\
  --requestheader-username-headers=X-Remote-User \\
  --service-account-key-file=/etc/kubernetes/cert/ca.pem \\
  --authorization-mode=Node,RBAC \\
  --runtime-config=api/all=true \\
  --enable-admission-plugins=NodeRestriction \\
  --allow-privileged=true \\
  --apiserver-count=3 \\
  --event-ttl=168h \\
  --kubelet-certificate-authority=/etc/kubernetes/cert/ca.pem \\
  --kubelet-client-certificate=/etc/kubernetes/cert/kubernetes.pem \\
  --kubelet-client-key=/etc/kubernetes/cert/kubernetes-key.pem \\
  --kubelet-https=true \\
  --kubelet-timeout=10s \\
  --proxy-client-cert-file=/etc/kubernetes/cert/proxy-client.pem \\
  --proxy-client-key-file=/etc/kubernetes/cert/proxy-client-key.pem \\
  --service-cluster-ip-range=${SERVICE_CIDR} \\
  --service-node-port-range=${NODE_PORT_RANGE} \\
  --logtostderr=true \\
  --v=2
Restart=on-failure
RestartSec=10
Type=notify
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```



**参数说明**

- `--advertise-address`：apiserver 对外通告的 IP（kubernetes 服务后端节点 IP）；
- `--default-*-toleration-seconds`：设置节点异常相关的阈值；
- `--max-*-requests-inflight`：请求相关的最大阈值；
- `--etcd-*`：访问 etcd 的证书和 etcd 服务器地址；
- `--bind-address`： https 监听的 IP，不能为 `127.0.0.1`，否则外界不能访问它的安全端口 6443；
- `--secret-port`：https 监听端口；
- `--insecure-port=0`：关闭监听 http 非安全端口(8080)；
- `--tls-*-file`：指定 apiserver 使用的证书、私钥和 CA 文件；
- `--audit-*`：配置审计策略和审计日志文件相关的参数；
- `--client-ca-file`：验证 client (kue-controller-manager、kube-scheduler、kubelet、kube-proxy 等)请求所带的证书；
- `--enable-bootstrap-token-auth`：启用 kubelet bootstrap 的 token 认证；
- `--requestheader-*`：kube-apiserver 的 aggregator layer 相关的配置参数，proxy-client & HPA 需要使用；
- `--requestheader-client-ca-file`：用于签名 `--proxy-client-cert-file` 和 `--proxy-client-key-file` 指定的证书；在启用了 metric aggregator 时使用；
- `--requestheader-allowed-names`：不能为空，值为逗号分割的 `--proxy-client-cert-file` 证书的 CN 名称，这里设置为 "aggregator"；
- `--service-account-key-file`：签名 ServiceAccount Token 的公钥文件，kube-controller-manager 的 `--service-account-private-key-file` 指定私钥文件，两者配对使用；
- `--runtime-config=api/all=true`： 启用所有版本的 APIs，如 autoscaling/v2alpha1；
- `--authorization-mode=Node,RBAC`、`--anonymous-auth=false`： 开启 Node 和 RBAC 授权模式，拒绝未授权的请求；
- `--enable-admission-plugins`：启用一些默认关闭的 plugins；
- `--allow-privileged`：运行执行 privileged 权限的容器；
- `--apiserver-count=3`：指定 apiserver 实例的数量；
- `--event-ttl`：指定 events 的保存时间；
- `--kubelet-*`：如果指定，则使用 https 访问 kubelet APIs；需要为证书对应的用户(上面 kubernetes*.pem 证书的用户为 kubernetes) 用户定义 RBAC 规则，否则访问 kubelet API 时提示未授权；
- `--proxy-client-*`：apiserver 访问 metrics-server 使用的证书；
- `--service-cluster-ip-range`： 指定 Service Cluster IP 地址段；
- `--service-node-port-range`： 指定 NodePort 的端口范围；

如果 kube-apiserver 机器**没有**运行 kube-proxy，则还需要添加 `--enable-aggregator-routing=true` 参数；

关于 `--requestheader-XXX` 相关参数，参考：

- https://github.com/kubernetes-incubator/apiserver-builder/blob/master/docs/concepts/auth.md
- https://docs.bitnami.com/kubernetes/how-to/configure-autoscaling-custom-metrics/

注意：

1. `--requestheader-client-ca-file` 指定的 CA 证书，必须具有 `client auth and server auth`；
2. 如果 `--requestheader-allowed-names` 不为空,且 `--proxy-client-cert-file` 证书的 CN 名称不在 allowed-names 中，则后续查看 node 或 pods 的 metrics 失败，提示：

```shell
$ kubectl top nodes
Error from server (Forbidden): nodes.metrics.k8s.io is forbidden: User "aggregator" cannot list resource "nodes" in API group "metrics.k8s.io" at the cluster scope
```





### 6.2.6 为各节点创建和分发 kube-apiserver systemd unit 文件

**替换模板文件中的变量，为各节点生成 systemd unit 文件**

```shell
cd /opt/k8s/kubernetes-server
source /opt/k8s/script/environment.sh
for (( i=0; i < 3; i++ ))
  do
    sed -e "s/##NODE_NAME##/${NODE_NAMES[i]}/" -e "s/##NODE_IP##/${NODE_IPS[i]}/" kube-apiserver.service.template > kube-apiserver-${NODE_IPS[i]}.service 
  done
```



**分发生成的 systemd unit 文件**

```shell
cd /opt/k8s/kubernetes-server
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-apiserver-${node_ip}.service root@${node_ip}:/usr/lib/systemd/system/kube-apiserver.service
  done
```



### 6.2.7 启动 kube-apiserver 服务

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ${K8S_DIR}/kube-apiserver"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable kube-apiserver && systemctl restart kube-apiserver"
  done
```



- K8S_DIR	/data/k8s/k8s



### 6.2.8 检查 kube-apiserver 运行状态

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl status kube-apiserver |grep 'Active:'"
  done
```



**正确输出结果**

```shell
>>> 10.0.0.30
   Active: active (running) since Mon 2020-07-06 12:27:41 CST; 1min 22s ago
>>> 10.0.0.33
   Active: active (running) since Mon 2020-07-06 12:27:45 CST; 1min 18s ago
>>> 10.0.0.34
   Active: active (running) since Mon 2020-07-06 12:27:48 CST; 1min 15s ago
```



### 6.2.9 检查集群状态

查看cluster-info

```shell
$ kubectl cluster-info
Kubernetes master is running at https://10.0.0.30:6443

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```



查看所有命名空间

```shell
$ kubectl get all --all-namespaces
NAMESPACE   NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
default     service/kubernetes   ClusterIP   10.254.0.1   <none>        443/TCP   21m
```



scheduler和controller-manager还没有部署，因此是连接失败的，但是etcd是都没有问题的

```shell
$ kubectl get componentstatuses
NAME                 STATUS      MESSAGE                                                                                     ERROR
scheduler            Unhealthy   Get http://127.0.0.1:10251/healthz: dial tcp 127.0.0.1:10251: connect: connection refused   
controller-manager   Unhealthy   Get http://127.0.0.1:10252/healthz: dial tcp 127.0.0.1:10252: connect: connection refused   
etcd-0               Healthy     {"health":"true"}                                                                           
etcd-2               Healthy     {"health":"true"}                                                                           
etcd-1               Healthy     {"health":"true"}                    
```



### 6.2.10 检查 kube-apiserver 监听的端口

- 6443: 接收 https 请求的安全端口，对所有请求做认证和授权；
- 由于关闭了非安全端口，故没有监听 8080；

```shell
$ netstat -lnpt|grep kube
tcp        0      0 10.0.0.30:6443          0.0.0.0:*               LISTEN      9905/kube-apiserver
```



## 6.3 部署高可用 kube-controller-manager 集群

本文档介绍部署高可用 kube-controller-manager 集群的步骤。

该集群包含 3 个节点，启动后将通过竞争选举机制产生一个 leader 节点，其它节点为阻塞状态。当 leader 节点不可用时，阻塞的节点将再次进行选举产生新的 leader 节点，从而保证服务的可用性。

为保证通信安全，本文档先生成 x509 证书和私钥，kube-controller-manager 在如下两种情况下使用该证书：

1. 与 kube-apiserver 的安全端口通信;
2. 在**安全端口**(https，10252) 输出 prometheus 格式的 metrics；



### 6.3.1 创建 kube-controller-manager 证书和私钥

**创建证书签名请求**

```shell
cd /opt/k8s/cert
cat > kube-controller-manager-csr.json <<EOF
{
    "CN": "system:kube-controller-manager",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "hosts": [
      "127.0.0.1",
      "10.0.0.30",
      "10.0.0.33",
      "10.0.0.34"
    ],
    "names": [
      {
        "C": "CN",
        "ST": "BeiJing",
        "L": "BeiJing",
        "O": "system:kube-controller-manager",
        "OU": "opsnull"
      }
    ]
}
EOF
```

- hosts 列表包含**所有** kube-controller-manager 节点 IP；
- CN 和 O 均为 `system:kube-controller-manager`，kubernetes 内置的 ClusterRoleBindings `system:kube-controller-manager` 赋予 kube-controller-manager 工作所需的权限。



**生成证书和私钥**

```shell
cd /opt/k8s/cert
cfssl gencert -ca=/opt/k8s/cert/ca.pem \
  -ca-key=/opt/k8s/cert/ca-key.pem \
  -config=/opt/k8s/cert/ca-config.json \
  -profile=kubernetes kube-controller-manager-csr.json | cfssljson -bare kube-controller-manager
  
  
#以上命令执行成功后会生成如下文件
kube-controller-manager-key.pem  kube-controller-manager.pem  kube-controller-manager.csr
```



**将生成的证书和私钥分发到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-controller-manager*.pem root@${node_ip}:/etc/kubernetes/cert/
  done
```



### 6.3.2 创建和分发 kubeconfig 文件

kube-controller-manager 使用 kubeconfig 文件访问 apiserver，该文件提供了 apiserver 地址、嵌入的 CA 证书和 kube-controller-manager 证书等信息

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
kubectl config set-cluster kubernetes \
  --certificate-authority=/opt/k8s/cert/ca.pem \
  --embed-certs=true \
  --server="https://##NODE_IP##:6443" \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config set-credentials system:kube-controller-manager \
  --client-certificate=kube-controller-manager.pem \
  --client-key=kube-controller-manager-key.pem \
  --embed-certs=true \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config set-context system:kube-controller-manager \
  --cluster=kubernetes \
  --user=system:kube-controller-manager \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config use-context system:kube-controller-manager --kubeconfig=kube-controller-manager.kubeconfig
```

- kube-controller-manager 与 kube-apiserver 混布，故直接通过**节点 IP** 访问 kube-apiserver；

- 执行完成后会生成文件`kube-controller-manager.kubeconfig`



**分发 kubeconfig 到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    sed -e "s/##NODE_IP##/${node_ip}/" kube-controller-manager.kubeconfig > kube-controller-manager-${node_ip}.kubeconfig
    scp kube-controller-manager-${node_ip}.kubeconfig root@${node_ip}:/etc/kubernetes/kube-controller-manager.kubeconfig
  done
```



### 6.3.3 创建 kube-controller-manager systemd unit 模板文件

**创建目录**

```shell
mkdir /opt/k8s/kube-controller-manager
```



```shell
cd /opt/k8s/kube-controller-manager
source /opt/k8s/script/environment.sh
cat > kube-controller-manager.service.template <<EOF
[Unit]
Description=Kubernetes Controller Manager
Documentation=https://github.com/GoogleCloudPlatform/kubernetes

[Service]
WorkingDirectory=${K8S_DIR}/kube-controller-manager
ExecStart=/usr/local/bin/kube-controller-manager \\
  --profiling \\
  --cluster-name=kubernetes \\
  --controllers=*,bootstrapsigner,tokencleaner \\
  --kube-api-qps=1000 \\
  --kube-api-burst=2000 \\
  --leader-elect \\
  --use-service-account-credentials\\
  --concurrent-service-syncs=2 \\
  --bind-address=##NODE_IP## \\
  --secure-port=10252 \\
  --tls-cert-file=/etc/kubernetes/cert/kube-controller-manager.pem \\
  --tls-private-key-file=/etc/kubernetes/cert/kube-controller-manager-key.pem \\
  --port=0 \\
  --authentication-kubeconfig=/etc/kubernetes/kube-controller-manager.kubeconfig \\
  --client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --requestheader-allowed-names="aggregator" \\
  --requestheader-client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --requestheader-extra-headers-prefix="X-Remote-Extra-" \\
  --requestheader-group-headers=X-Remote-Group \\
  --requestheader-username-headers=X-Remote-User \\
  --authorization-kubeconfig=/etc/kubernetes/kube-controller-manager.kubeconfig \\
  --cluster-signing-cert-file=/etc/kubernetes/cert/ca.pem \\
  --cluster-signing-key-file=/etc/kubernetes/cert/ca-key.pem \\
  --experimental-cluster-signing-duration=876000h \\
  --horizontal-pod-autoscaler-sync-period=10s \\
  --concurrent-deployment-syncs=10 \\
  --concurrent-gc-syncs=30 \\
  --node-cidr-mask-size=24 \\
  --service-cluster-ip-range=${SERVICE_CIDR} \\
  --pod-eviction-timeout=6m \\
  --terminated-pod-gc-threshold=10000 \\
  --root-ca-file=/etc/kubernetes/cert/ca.pem \\
  --service-account-private-key-file=/etc/kubernetes/cert/ca-key.pem \\
  --kubeconfig=/etc/kubernetes/kube-controller-manager.kubeconfig \\
  --logtostderr=true \\
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```



**参数说明**

- `--port=0`：关闭监听非安全端口（http），同时 `--address` 参数无效，`--bind-address` 参数有效；
- `--secure-port=10252`、`--bind-address=0.0.0.0`: 在所有网络接口监听 10252 端口的 https /metrics 请求；
- `--kubeconfig`：指定 kubeconfig 文件路径，kube-controller-manager 使用它连接和验证 kube-apiserver；
- `--authentication-kubeconfig` 和 `--authorization-kubeconfig`：kube-controller-manager 使用它连接 apiserver，对 client 的请求进行认证和授权。`kube-controller-manager` 不再使用 `--tls-ca-file` 对请求 https metrics 的 Client 证书进行校验。如果没有配置这两个 kubeconfig 参数，则 client 连接 kube-controller-manager https 端口的请求会被拒绝(提示权限不足)。
- `--cluster-signing-*-file`：签名 TLS Bootstrap 创建的证书；
- `--experimental-cluster-signing-duration`：指定 TLS Bootstrap 证书的有效期；
- `--root-ca-file`：放置到容器 ServiceAccount 中的 CA 证书，用来对 kube-apiserver 的证书进行校验；
- `--service-account-private-key-file`：签名 ServiceAccount 中 Token 的私钥文件，必须和 kube-apiserver 的 `--service-account-key-file` 指定的公钥文件配对使用；
- `--service-cluster-ip-range` ：指定 Service Cluster IP 网段，必须和 kube-apiserver 中的同名参数一致；
- `--leader-elect=true`：集群运行模式，启用选举功能；被选为 leader 的节点负责处理工作，其它节点为阻塞状态；
- `--controllers=*,bootstrapsigner,tokencleaner`：启用的控制器列表，tokencleaner 用于自动清理过期的 Bootstrap token；
- `--horizontal-pod-autoscaler-*`：custom metrics 相关参数，支持 autoscaling/v2alpha1；
- `--tls-cert-file`、`--tls-private-key-file`：使用 https 输出 metrics 时使用的 Server 证书和秘钥；
- `--use-service-account-credentials=true`: kube-controller-manager 中各 controller 使用 serviceaccount 访问 kube-apiserver；



### 6.3.4 为各节点创建和分发 kube-controller-mananger systemd unit 文件

**替换模板文件中的变量，为各节点创建 systemd unit 文件**

```shell
cd /opt/k8s/kube-controller-manager
source /opt/k8s/script/environment.sh
for (( i=0; i < 3; i++ ))
  do
    sed -e "s/##NODE_NAME##/${NODE_NAMES[i]}/" -e "s/##NODE_IP##/${NODE_IPS[i]}/" kube-controller-manager.service.template > kube-controller-manager-${NODE_IPS[i]}.service 
  done
ls kube-controller-manager*.service
```



**分发到所有 master 节点**

```shell
cd /opt/k8s/kube-controller-manager
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-controller-manager-${node_ip}.service root@${node_ip}:/usr/lib/systemd/system/kube-controller-manager.service
  done
```



### 6.3.5 启动 kube-controller-manager 服务

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ${K8S_DIR}/kube-controller-manager"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable kube-controller-manager && systemctl restart kube-controller-manager"
  done
```



### 6.3.6 检查服务运行状态

确保状态为 `active (running)`，否则使用命令`journalctl -u kube-controller-manager`查看日志，确认原因

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl status kube-controller-manager|grep Active"
  done
```



**正确输出**

```shell
>>> 10.0.0.30
   Active: active (running) since Mon 2020-07-06 13:01:34 CST; 8s ago
>>> 10.0.0.33
   Active: active (running) since Mon 2020-07-06 13:01:34 CST; 7s ago
>>> 10.0.0.34
   Active: active (running) since Mon 2020-07-06 13:01:35 CST; 7s ago
```



**kube-controller-manager 监听 10252 端口，接收 https 请求**

```shell
$ netstat -lnpt | grep kube-cont
tcp        0      0 10.0.0.30:10252         0.0.0.0:*               LISTEN      10698/kube-controll
```



### 6.3.7 查看输出的 metrics

```shell
$ curl -s --cacert /opt/k8s/cert/ca.pem --cert /opt/k8s/cert/admin.pem --key /opt/k8s/cert/admin-key.pem https://10.0.0.30:10252/metrics |head
# HELP apiserver_audit_event_total [ALPHA] Counter of audit events generated and sent to the audit backend.
# TYPE apiserver_audit_event_total counter
apiserver_audit_event_total 0
# HELP apiserver_audit_requests_rejected_total [ALPHA] Counter of apiserver requests rejected due to an error in audit logging backend.
# TYPE apiserver_audit_requests_rejected_total counter
apiserver_audit_requests_rejected_total 0
# HELP apiserver_client_certificate_expiration_seconds [ALPHA] Distribution of the remaining lifetime on the certificate used to authenticate a request.
# TYPE apiserver_client_certificate_expiration_seconds histogram
apiserver_client_certificate_expiration_seconds_bucket{le="0"} 0
apiserver_client_certificate_expiration_seconds_bucket{le="1800"} 0
```



### 6.3.8 查看当前的 leader

可见，当前的 leader 为k8s-master1

```shell
$ kubectl get endpoints kube-controller-manager --namespace=kube-system  -o yaml
apiVersion: v1
kind: Endpoints
metadata:
  annotations:
    control-plane.alpha.kubernetes.io/leader: '{"holderIdentity":"k8s-master1_660f3b51-12e3-40c7-86a4-b8547c9e5c54","leaseDurationSeconds":15,"acquireTime":"2020-07-06T05:01:34Z","renewTime":"2020-07-06T05:03:05Z","leaderTransitions":0}'
  creationTimestamp: "2020-07-06T05:01:34Z"
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:control-plane.alpha.kubernetes.io/leader: {}
    manager: kube-controller-manager
    operation: Update
    time: "2020-07-06T05:03:05Z"
  name: kube-controller-manager
  namespace: kube-system
  resourceVersion: "1139"
  selfLink: /api/v1/namespaces/kube-system/endpoints/kube-controller-manager
  uid: 53bcc2df-9aad-4dd1-bff9-d4a50f89625b
```



### 6.3.9 测试 kube-controller-manager 集群的高可用

停掉一个或两个节点的 kube-controller-manager 服务，观察其它节点的日志，看是否获取了 leader 权限



参考

1. 关于 controller 权限和 use-service-account-credentials 参数：https://github.com/kubernetes/kubernetes/issues/48208
2. kubelet 认证和授权：https://kubernetes.io/docs/admin/kubelet-authentication-authorization/#kubelet-authorization



## 6.4 部署高可用 kube-scheduler 集群

本文档介绍部署高可用 kube-scheduler 集群的步骤。

该集群包含 3 个节点，启动后将通过竞争选举机制产生一个 leader 节点，其它节点为阻塞状态。当 leader 节点不可用后，剩余节点将再次进行选举产生新的 leader 节点，从而保证服务的可用性。

为保证通信安全，本文档先生成 x509 证书和私钥，kube-scheduler 在如下两种情况下使用该证书：

1. 与 kube-apiserver 的安全端口通信;
2. 在**安全端口**(https，10251) 输出 prometheus 格式的 metrics；



### 6.4.1 创建 kube-scheduler 证书和私钥

**创建证书签名请求**

```shell
cd /opt/k8s/cert
cat > kube-scheduler-csr.json <<EOF
{
    "CN": "system:kube-scheduler",
    "hosts": [
      "127.0.0.1",
      "10.0.0.30",
      "10.0.0.33",
      "10.0.0.34"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
      {
        "C": "CN",
        "ST": "BeiJing",
        "L": "BeiJing",
        "O": "system:kube-scheduler",
        "OU": "opsnull"
      }
    ]
}
EOF
```

- hosts 列表包含**所有** kube-scheduler 节点 IP；
- CN 和 O 均为 `system:kube-scheduler`，kubernetes 内置的 ClusterRoleBindings `system:kube-scheduler` 将赋予 kube-scheduler 工作所需的权限；



**生成证书和私钥**

```shell
cd /opt/k8s/cert
cfssl gencert -ca=/opt/k8s/cert/ca.pem \
  -ca-key=/opt/k8s/cert/ca-key.pem \
  -config=/opt/k8s/cert/ca-config.json \
  -profile=kubernetes kube-scheduler-csr.json | cfssljson -bare kube-scheduler
  
#以上命令成功执行后会生成如下文件
kube-scheduler.csr  kube-scheduler-key.pem  kube-scheduler.pem
```



**将生成的证书和私钥分发到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-scheduler*.pem root@${node_ip}:/etc/kubernetes/cert/
  done
```



### 6.4.2 创建和分发 kubeconfig 文件

kube-scheduler 使用 kubeconfig 文件访问 apiserver，该文件提供了 apiserver 地址、嵌入的 CA 证书和 kube-scheduler 证书

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
kubectl config set-cluster kubernetes \
  --certificate-authority=/opt/k8s/cert/ca.pem \
  --embed-certs=true \
  --server="https://##NODE_IP##:6443" \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config set-credentials system:kube-scheduler \
  --client-certificate=kube-scheduler.pem \
  --client-key=kube-scheduler-key.pem \
  --embed-certs=true \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config set-context system:kube-scheduler \
  --cluster=kubernetes \
  --user=system:kube-scheduler \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config use-context system:kube-scheduler --kubeconfig=kube-scheduler.kubeconfig
```



执行完成后会生成文件`kube-scheduler.kubeconfig`



**分发 kubeconfig 到所有 master 节点**

```shell
cd /opt/k8s/cert
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    sed -e "s/##NODE_IP##/${node_ip}/" kube-scheduler.kubeconfig > kube-scheduler-${node_ip}.kubeconfig
    scp kube-scheduler-${node_ip}.kubeconfig root@${node_ip}:/etc/kubernetes/kube-scheduler.kubeconfig
  done
```



### 6.4.3 创建 kube-scheduler 配置文件

**创建目录**

```shell
mkdir /opt/k8s/kube-scheduler
```



```shell
cd /opt/k8s/kube-scheduler
cat >kube-scheduler.yaml.template <<EOF
apiVersion: kubescheduler.config.k8s.io/v1alpha1
kind: KubeSchedulerConfiguration
bindTimeoutSeconds: 600
clientConnection:
  burst: 200
  kubeconfig: "/etc/kubernetes/kube-scheduler.kubeconfig"
  qps: 100
enableContentionProfiling: false
enableProfiling: true
hardPodAffinitySymmetricWeight: 1
healthzBindAddress: ##NODE_IP##:10251
leaderElection:
  leaderElect: true
metricsBindAddress: ##NODE_IP##:10251
EOF
```

- `--kubeconfig`：指定 kubeconfig 文件路径，kube-scheduler 使用它连接和验证 kube-apiserver；
- `--leader-elect=true`：集群运行模式，启用选举功能；被选为 leader 的节点负责处理工作，其它节点为阻塞状态；



**替换模板文件中的变量**

```shell
cd /opt/k8s/kube-scheduler
source /opt/k8s/script/environment.sh
for (( i=0; i < 3; i++ ))
  do
    sed -e "s/##NODE_NAME##/${NODE_NAMES[i]}/" -e "s/##NODE_IP##/${NODE_IPS[i]}/" kube-scheduler.yaml.template > kube-scheduler-${NODE_IPS[i]}.yaml
  done
ls kube-scheduler*.yaml
```



**分发 kube-scheduler 配置文件到所有 master 节点**

- 重命名为 kube-scheduler.yaml;

```shell
cd /opt/k8s/kube-scheduler
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-scheduler-${node_ip}.yaml root@${node_ip}:/etc/kubernetes/kube-scheduler.yaml
  done
```



### 6.4.4 创建 kube-scheduler systemd unit 模板文件

```shell
cd /opt/k8s/kube-scheduler
source /opt/k8s/script/environment.sh
cat > kube-scheduler.service.template <<EOF
[Unit]
Description=Kubernetes Scheduler
Documentation=https://github.com/GoogleCloudPlatform/kubernetes

[Service]
WorkingDirectory=${K8S_DIR}/kube-scheduler
ExecStart=/usr/local/bin/kube-scheduler \\
  --config=/etc/kubernetes/kube-scheduler.yaml \\
  --bind-address=##NODE_IP## \\
  --secure-port=10259 \\
  --port=0 \\
  --tls-cert-file=/etc/kubernetes/cert/kube-scheduler.pem \\
  --tls-private-key-file=/etc/kubernetes/cert/kube-scheduler-key.pem \\
  --authentication-kubeconfig=/etc/kubernetes/kube-scheduler.kubeconfig \\
  --client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --requestheader-allowed-names="" \\
  --requestheader-client-ca-file=/etc/kubernetes/cert/ca.pem \\
  --requestheader-extra-headers-prefix="X-Remote-Extra-" \\
  --requestheader-group-headers=X-Remote-Group \\
  --requestheader-username-headers=X-Remote-User \\
  --authorization-kubeconfig=/etc/kubernetes/kube-scheduler.kubeconfig \\
  --logtostderr=true \\
  --v=2
Restart=always
RestartSec=5
StartLimitInterval=0

[Install]
WantedBy=multi-user.target
EOF
```



### 6.4.5 为各节点创建和分发 kube-scheduler systemd unit 文件

**替换模板文件中的变量，为各节点创建 systemd unit 文件**

```shell
cd /opt/k8s/kube-scheduler
source /opt/k8s/script/environment.sh
for (( i=0; i < 3; i++ ))
  do
    sed -e "s/##NODE_NAME##/${NODE_NAMES[i]}/" -e "s/##NODE_IP##/${NODE_IPS[i]}/" kube-scheduler.service.template > kube-scheduler-${NODE_IPS[i]}.service 
  done
ls kube-scheduler*.service
```



**分发 systemd unit 文件到所有 master 节点**

```shell
cd /opt/k8s/kube-scheduler
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-scheduler-${node_ip}.service root@${node_ip}:/usr/lib/systemd/system/kube-scheduler.service
  done
```



### 6.4.6 启动 kube-scheduler 服务

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ${K8S_DIR}/kube-scheduler"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable kube-scheduler && systemctl restart kube-scheduler"
  done
```



### 6.4.7 检查服务运行状态

确保状态为 `active (running)`，否则使用命令`journalctl -u kube-scheduler`查看日志，确认原因

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl status kube-scheduler|grep Active"
  done
```



**正确输出**

```shell
>>> 10.0.0.30
   Active: active (running) since Mon 2020-07-06 13:22:22 CST; 32s ago
>>> 10.0.0.33
   Active: active (running) since Mon 2020-07-06 13:22:23 CST; 32s ago
>>> 10.0.0.34
   Active: active (running) since Mon 2020-07-06 13:22:23 CST; 31s ago
```



### 6.4.8 查看输出的 metrics

注意：以下命令在 kube-scheduler 节点上执行。

kube-scheduler 监听 10251 和 10259 端口：

- 10251：接收 http 请求，非安全端口，不需要认证授权；
- 10259：接收 https 请求，安全端口，需要认证授权；

两个接口都对外提供 `/metrics` 和 `/healthz` 的访问。

```shell
netstat -lnpt |grep kube-sch
tcp        0      0 10.0.0.30:10251         0.0.0.0:*               LISTEN      11076/kube-schedule 
tcp        0      0 10.0.0.30:10259         0.0.0.0:*               LISTEN      11076/kube-schedule 
```



```shell
$ curl -s http://10.0.0.30:10251/metrics |head
# HELP apiserver_audit_event_total [ALPHA] Counter of audit events generated and sent to the audit backend.
# TYPE apiserver_audit_event_total counter
apiserver_audit_event_total 0
# HELP apiserver_audit_requests_rejected_total [ALPHA] Counter of apiserver requests rejected due to an error in audit logging backend.
# TYPE apiserver_audit_requests_rejected_total counter
apiserver_audit_requests_rejected_total 0
# HELP apiserver_client_certificate_expiration_seconds [ALPHA] Distribution of the remaining lifetime on the certificate used to authenticate a request.
# TYPE apiserver_client_certificate_expiration_seconds histogram
apiserver_client_certificate_expiration_seconds_bucket{le="0"} 0
apiserver_client_certificate_expiration_seconds_bucket{le="1800"} 0
```





```shell
$ curl -s --cacert /opt/k8s/cert/ca.pem --cert /opt/k8s/cert/admin.pem --key /opt/k8s/cert/admin-key.pem https://10.0.0.30:10259/metrics |head
# HELP apiserver_audit_event_total [ALPHA] Counter of audit events generated and sent to the audit backend.
# TYPE apiserver_audit_event_total counter
apiserver_audit_event_total 0
# HELP apiserver_audit_requests_rejected_total [ALPHA] Counter of apiserver requests rejected due to an error in audit logging backend.
# TYPE apiserver_audit_requests_rejected_total counter
apiserver_audit_requests_rejected_total 0
# HELP apiserver_client_certificate_expiration_seconds [ALPHA] Distribution of the remaining lifetime on the certificate used to authenticate a request.
# TYPE apiserver_client_certificate_expiration_seconds histogram
apiserver_client_certificate_expiration_seconds_bucket{le="0"} 0
apiserver_client_certificate_expiration_seconds_bucket{le="1800"} 0
```



### 6.4.9 查看当前的 leader

可见，当前的 leader 为k8s-master1

```shell
$ apiVersion: v1
kind: Endpoints
metadata:
  annotations:
    control-plane.alpha.kubernetes.io/leader: '{"holderIdentity":"k8s-master1_47f5fcdd-fe94-4068-9b70-e92ce2536b88","leaseDurationSeconds":15,"acquireTime":"2020-07-06T05:22:23Z","renewTime":"2020-07-06T05:27:15Z","leaderTransitions":0}'
  creationTimestamp: "2020-07-06T05:22:23Z"
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:control-plane.alpha.kubernetes.io/leader: {}
    manager: kube-scheduler
    operation: Update
    time: "2020-07-06T05:27:15Z"
  name: kube-scheduler
  namespace: kube-system
  resourceVersion: "3309"
  selfLink: /api/v1/namespaces/kube-system/endpoints/kube-scheduler
  uid: 8f32b145-8b64-4869-a75d-1cd7e02bcc2c
```



### 6.4.10 测试 kube-scheduler 集群的高可用

随便找一个或两个 master 节点，停掉 kube-scheduler 服务，看其它节点是否获取了 leader 权限



# 七、部署worker节点

kubernetes worker 节点运行如下组件：

- containerd
- kubelet
- kube-proxy
- calico
- kube-nginx



## 7.1 安装依赖包

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "dnf install -y chrony conntrack ipvsadm ipset jq iptables curl sysstat libseccomp wget socat git" &
  done
```





## 7.2 apiserver 高可用

本文档讲解使用 nginx 4 层透明代理功能实现 Kubernetes worker 节点组件高可用访问 kube-apiserver 集群的步骤



### 7.2.1 基于 nginx 代理的 kube-apiserver 高可用方案

- 控制节点的 kube-controller-manager、kube-scheduler 是多实例部署且连接本机的 kube-apiserver，所以只要有一个实例正常，就可以保证高可用；
- 集群内的 Pod 使用 K8S 服务域名 kubernetes 访问 kube-apiserver， kube-dns 会自动解析出多个 kube-apiserver 节点的 IP，所以也是高可用的；
- 在每个节点起一个 nginx 进程，后端对接多个 apiserver 实例，nginx 对它们做健康检查和负载均衡；
- kubelet、kube-proxy 通过本地的 nginx（监听 127.0.0.1）访问 kube-apiserver，从而实现 kube-apiserver 的高可用；





### 7.2.2 下载和编译 nginx

**创建目录**

```shell
mkdir /opt/k8s/nginx && cd /opt/k8s/nginx
```



**下载源码并解压缩**

```shell
wget http://nginx.org/download/nginx-1.15.3.tar.gz
tar xf nginx-1.15.3.tar.gz
```



**配置编译参数**

```shell
mkdir nginx-prefix
dnf -y install gcc make
./configure --with-stream --without-http --prefix=$(pwd)/nginx-prefix --without-http_uwsgi_module --without-http_scgi_module --without-http_fastcgi_module
```

- `--with-stream`：开启 4 层透明转发(TCP Proxy)功能；
- `--without-xxx`：关闭所有其他功能，这样生成的动态链接二进制程序依赖最小；



**输出如下**

```shell
Configuration summary
  + PCRE library is not used
  + OpenSSL library is not used
  + zlib library is not used

  nginx path prefix: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix"
  nginx binary file: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/sbin/nginx"
  nginx modules path: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/modules"
  nginx configuration prefix: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/conf"
  nginx configuration file: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/conf/nginx.conf"
  nginx pid file: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/logs/nginx.pid"
  nginx error log file: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/logs/error.log"
  nginx http access log file: "/opt/k8s/nginx/nginx-1.15.3/nginx-prefix/logs/access.log"
  nginx http client request body temporary files: "client_body_temp"
  nginx http proxy temporary files: "proxy_temp"
```



**编译和安装**

```shell
cd /opt/k8s/nginx/nginx-1.15.3
make && make install
```



**导出nginx命令**

```shell
ln -s /opt/k8s/nginx/nginx-1.15.3/nginx-prefix/sbin/nginx /usr/local/sbin
```



**验证版本**

```shell
$  nginx -V
nginx version: nginx/1.15.3
built by gcc 8.3.1 20191121 (Red Hat 8.3.1-5) (GCC) 
configure arguments: --with-stream --without-http --prefix=/opt/k8s/nginx/nginx-1.15.3/nginx-prefix --without-http_uwsgi_module --without-http_scgi_module --without-http_fastcgi_module
```



### 7.2.3 安装和部署 nginx

**创建目录结构**

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /opt/k8s/kube-nginx/{conf,logs,sbin}"
  done
```



**拷贝二进制程序**

- 重命名二进制文件为 kube-nginx；

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /opt/k8s/kube-nginx/{conf,logs,sbin}"
    scp /opt/k8s/nginx/nginx-1.15.3/nginx-prefix/sbin/nginx  root@${node_ip}:/opt/k8s/kube-nginx/sbin/kube-nginx
    ssh root@${node_ip} "chmod a+x /opt/k8s/kube-nginx/sbin/*"
  done
```



**配置 nginx，开启 4 层透明转发功能**

- `upstream backend` 中的 server 列表为集群中各 kube-apiserver 的节点 IP，**需要根据实际情况修改**

```shell
cd /opt/k8s/kube-nginx/conf
cat > kube-nginx.conf << \EOF
worker_processes 1;

events {
    worker_connections  1024;
}

stream {
    upstream backend {
        hash $remote_addr consistent;
        server 10.0.0.30:6443        max_fails=3 fail_timeout=30s;
        server 10.0.0.33:6443        max_fails=3 fail_timeout=30s;
        server 10.0.0.34:6443        max_fails=3 fail_timeout=30s;
    }

    server {
        listen 127.0.0.1:8443;
        proxy_connect_timeout 1s;
        proxy_pass backend;
    }
}
EOF
```



**分发配置文件**

```shell
cd /opt/k8s/kube-nginx/conf
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-nginx.conf  root@${node_ip}:/opt/k8s/kube-nginx/conf/kube-nginx.conf
  done
```



### 7.2.4 配置 systemd unit 文件，启动服务

**配置 kube-nginx systemd unit 文件**

```sh
cd /opt/k8s/kube-nginx/conf
cat > kube-nginx.service <<EOF
[Unit]
Description=kube-apiserver nginx proxy
After=network.target
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
ExecStartPre=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx -t
ExecStart=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx
ExecReload=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx -s reload
PrivateTmp=true
Restart=always
RestartSec=5
StartLimitInterval=0
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```



**分发 systemd unit 文件**

```shell
cd /opt/k8s/kube-nginx/conf
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp kube-nginx.service  root@${node_ip}:/usr/lib/systemd/system/
  done
```



**启动 kube-nginx 服务**

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable kube-nginx && systemctl restart kube-nginx"
  done
```



### 7.2.5 检查 kube-nginx 服务运行状态

确保状态为 `active (running)`，否则使用命令`journalctl -u kube-nginx`查看日志，确认原因

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "systemctl status kube-nginx |grep 'Active:'"
  done
```



**正确输出**

```shell
>>> 10.0.0.30
   Active: active (running) since Mon 2020-07-06 17:34:01 CST; 47s ago
>>> 10.0.0.33
   Active: active (running) since Mon 2020-07-06 17:34:01 CST; 46s ago
>>> 10.0.0.34
   Active: active (running) since Mon 2020-07-06 17:34:02 CST; 46s ago
```



## 7.3 部署 kubelet 组件

- kubelet 运行在每个 worker 节点上，接收 kube-apiserver 发送的请求，管理 Pod 容器，执行交互式命令，如 exec、run、logs 等。

- kubelet 启动时自动向 kube-apiserver 注册节点信息，内置的 cadvisor 统计和监控节点的资源使用情况。

- 为确保安全，部署时关闭了 kubelet 的非安全 http 端口，对请求进行认证和授权，拒绝未授权的访问(如 apiserver、heapster 的请求)。



### 7.3.1 创建 kubelet bootstrap kubeconfig 文件



```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
for node_name in ${NODE_NAMES[@]}
  do
    echo ">>> ${node_name}"

    # 创建 token
    export BOOTSTRAP_TOKEN=$(kubeadm token create \
      --description kubelet-bootstrap-token \
      --groups system:bootstrappers:${node_name} \
      --kubeconfig ~/.kube/config)

    # 设置集群参数
    kubectl config set-cluster kubernetes \
      --certificate-authority=/etc/kubernetes/cert/ca.pem \
      --embed-certs=true \
      --server=${KUBE_APISERVER} \
      --kubeconfig=kubelet-bootstrap-${node_name}.kubeconfig

    # 设置客户端认证参数
    kubectl config set-credentials kubelet-bootstrap \
      --token=${BOOTSTRAP_TOKEN} \
      --kubeconfig=kubelet-bootstrap-${node_name}.kubeconfig

    # 设置上下文参数
    kubectl config set-context default \
      --cluster=kubernetes \
      --user=kubelet-bootstrap \
      --kubeconfig=kubelet-bootstrap-${node_name}.kubeconfig

    # 设置默认上下文
    kubectl config use-context default --kubeconfig=kubelet-bootstrap-${node_name}.kubeconfig
  done
```

- 向 kubeconfig 写入的是 token，bootstrap 结束后 kube-controller-manager 为 kubelet 创建 client 和 server 证书；



**查看 kubeadm 为各节点创建的 token**

```shell
$ kubeadm token list --kubeconfig ~/.kube/config
TOKEN                     TTL         EXPIRES                     USAGES                   DESCRIPTION                                                EXTRA GROUPS
iigvk5.ohl7dhozb2f13py9   23h         2020-07-07T19:38:56+08:00   authentication,signing   kubelet-bootstrap-token                                    system:bootstrappers:k8s-node1
rcfo73.ghaepqfojj73nhgw   23h         2020-07-07T19:38:56+08:00   authentication,signing   kubelet-bootstrap-token                                    system:bootstrappers:k8s-node2
szsxrp.rz6tx5154vc4ankv   23h         2020-07-07T19:38:56+08:00   authentication,signing   kubelet-bootstrap-token                                    system:bootstrappers:k8s-master1
```

- token 有效期为 1 天，**超期后将不能**再被用来 boostrap kubelet，且会被 kube-controller-manager 的 tokencleaner 清理；
- kube-apiserver 接收 kubelet 的 bootstrap token 后，将请求的 user 设置为 `system:bootstrap:<Token ID>`，group 设置为 `system:bootstrappers`，后续将为这个 group 设置 ClusterRoleBinding；



### 7.3.2 分发 bootstrap kubeconfig 文件到所有 worker 节点

```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
for node_name in ${NODE_NAMES[@]}
  do
    echo ">>> ${node_name}"
    scp kubelet-bootstrap-${node_name}.kubeconfig root@${node_name}:/etc/kubernetes/kubelet-bootstrap.kubeconfig
  done
```



### 7.3.3 创建和分发 kubelet 参数配置文件

从 v1.10 开始，部分 kubelet 参数需在**配置文件**中配置，`kubelet --help` 会提示

```shell
DEPRECATED: This parameter should be set via the config file specified by the Kubelet's --config flag
```

创建 kubelet 参数配置文件模板（可配置项参考[代码中注释](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/apis/config/types.go)）

```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
cat > kubelet-config.yaml.template <<EOF
kind: KubeletConfiguration
apiVersion: kubelet.config.k8s.io/v1beta1
address: "##NODE_IP##"
staticPodPath: ""
syncFrequency: 1m
fileCheckFrequency: 20s
httpCheckFrequency: 20s
staticPodURL: ""
port: 10250
readOnlyPort: 0
rotateCertificates: true
serverTLSBootstrap: true
authentication:
  anonymous:
    enabled: false
  webhook:
    enabled: true
  x509:
    clientCAFile: "/etc/kubernetes/cert/ca.pem"
authorization:
  mode: Webhook
registryPullQPS: 0
registryBurst: 20
eventRecordQPS: 0
eventBurst: 20
enableDebuggingHandlers: true
enableContentionProfiling: true
healthzPort: 10248
healthzBindAddress: "##NODE_IP##"
clusterDomain: "${CLUSTER_DNS_DOMAIN}"
clusterDNS:
  - "${CLUSTER_DNS_SVC_IP}"
nodeStatusUpdateFrequency: 10s
nodeStatusReportFrequency: 1m
imageMinimumGCAge: 2m
imageGCHighThresholdPercent: 85
imageGCLowThresholdPercent: 80
volumeStatsAggPeriod: 1m
kubeletCgroups: ""
systemCgroups: ""
cgroupRoot: ""
cgroupsPerQOS: true
cgroupDriver: cgroupfs
runtimeRequestTimeout: 10m
hairpinMode: promiscuous-bridge
maxPods: 220
podCIDR: "${CLUSTER_CIDR}"
podPidsLimit: -1
resolvConf: /etc/resolv.conf
maxOpenFiles: 1000000
kubeAPIQPS: 1000
kubeAPIBurst: 2000
serializeImagePulls: false
evictionHard:
  memory.available:  "100Mi"
  nodefs.available:  "10%"
  nodefs.inodesFree: "5%"
  imagefs.available: "15%"
evictionSoft: {}
enableControllerAttachDetach: true
failSwapOn: true
containerLogMaxSize: 20Mi
containerLogMaxFiles: 10
systemReserved: {}
kubeReserved: {}
systemReservedCgroup: ""
kubeReservedCgroup: ""
enforceNodeAllocatable: ["pods"]
EOF
```



- address：kubelet 安全端口（https，10250）监听的地址，不能为 127.0.0.1，否则 kube-apiserver、heapster 等不能调用 kubelet 的 API；
- readOnlyPort=0：关闭只读端口(默认 10255)，等效为未指定；
- authentication.anonymous.enabled：设置为 false，不允许匿名�访问 10250 端口；
- authentication.x509.clientCAFile：指定签名客户端证书的 CA 证书，开启 HTTP 证书认证；
- authentication.webhook.enabled=true：开启 HTTPs bearer token 认证；
- 对于未通过 x509 证书和 webhook 认证的请求(kube-apiserver 或其他客户端)，将被拒绝，提示 Unauthorized；
- authroization.mode=Webhook：kubelet 使用 SubjectAccessReview API 查询 kube-apiserver 某 user、group 是否具有操作资源的权限(RBAC)；
- featureGates.RotateKubeletClientCertificate、featureGates.RotateKubeletServerCertificate：自动 rotate 证书，证书的有效期取决于 kube-controller-manager 的 --experimental-cluster-signing-duration 参数；
- 需要 root 账户运行；





**为各节点创建和分发 kubelet 配置文件**

```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do 
    echo ">>> ${node_ip}"
    sed -e "s/##NODE_IP##/${node_ip}/" kubelet-config.yaml.template > kubelet-config-${node_ip}.yaml.template
    scp kubelet-config-${node_ip}.yaml.template root@${node_ip}:/etc/kubernetes/kubelet-config.yaml
  done
```



### 7.3.4 创建和分发 kubelet systemd unit 文件

**创建 kubelet systemd unit 文件模板**

```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
cat > kubelet.service.template <<EOF
[Unit]
Description=Kubernetes Kubelet
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=containerd.service
Requires=containerd.service

[Service]
WorkingDirectory=${K8S_DIR}/kubelet
ExecStart=/opt/k8s/bin/kubelet \\
  --bootstrap-kubeconfig=/etc/kubernetes/kubelet-bootstrap.kubeconfig \\
  --cert-dir=/etc/kubernetes/cert \\
  --network-plugin=cni \\
  --cni-conf-dir=/etc/cni/net.d \\
  --container-runtime=remote \\
  --container-runtime-endpoint=unix:///var/run/containerd/containerd.sock \\
  --root-dir=${K8S_DIR}/kubelet \\
  --kubeconfig=/etc/kubernetes/kubelet.kubeconfig \\
  --config=/etc/kubernetes/kubelet-config.yaml \\
  --hostname-override=##NODE_NAME## \\
  --image-pull-progress-deadline=15m \\
  --volume-plugin-dir=${K8S_DIR}/kubelet/kubelet-plugins/volume/exec/ \\
  --logtostderr=true \\
  --v=2
Restart=always
RestartSec=5
StartLimitInterval=0

[Install]
WantedBy=multi-user.target
EOF
```

- 如果设置了 `--hostname-override` 选项，则 `kube-proxy` 也需要设置该选项，否则会出现找不到 Node 的情况；
- `--bootstrap-kubeconfig`：指向 bootstrap kubeconfig 文件，kubelet 使用该文件中的用户名和 token 向 kube-apiserver 发送 TLS Bootstrapping 请求；
- K8S approve kubelet 的 csr 请求后，在 `--cert-dir` 目录创建证书和私钥文件，然后写入 `--kubeconfig` 文件；
- `--pod-infra-container-image` 不使用 redhat 的 `pod-infrastructure:latest` 镜像，它不能回收容器的僵尸；



**为各节点创建和分发 kubelet systemd unit 文件**

```shell
cd /opt/k8s/kubernetes-node
source /opt/k8s/script/environment.sh
for node_name in ${NODE_NAMES[@]}
  do 
    echo ">>> ${node_name}"
    sed -e "s/##NODE_NAME##/${node_name}/" kubelet.service.template > kubelet-${node_name}.service
    scp kubelet-${node_name}.service root@${node_name}:/usr/lib/systemd/system/kubelet.service
  done
```



### 7.3.5 授予 kube-apiserver 访问 kubelet API 的权限

在执行 kubectl exec、run、logs 等命令时，apiserver 会将请求转发到 kubelet 的 https 端口。这里定义 RBAC 规则，授权 apiserver 使用的证书（kubernetes.pem）用户名（CN：kuberntes-master）访问 kubelet API 的权限：

```shell
kubectl create clusterrolebinding kube-apiserver:kubelet-apis --clusterrole=system:kubelet-api-admin --user kubernetes-master

```



### 7.3.6 Bootstrap Token Auth 和授予权限

kubelet 启动时查找 `--kubeletconfig` 参数对应的文件是否存在，如果不存在则使用 `--bootstrap-kubeconfig` 指定的 kubeconfig 文件向 kube-apiserver 发送证书签名请求 (CSR)。

kube-apiserver 收到 CSR 请求后，对其中的 Token 进行认证，认证通过后将请求的 user 设置为 `system:bootstrap:<Token ID>`，group 设置为 `system:bootstrappers`，这一过程称为 `Bootstrap Token Auth`。

默认情况下，这个 user 和 group 没有创建 CSR 的权限，kubelet 启动失败，错误日志如下：

```shell
$ sudo journalctl -u kubelet -a |grep -A 2 'certificatesigningrequests'
May 26 12:13:41 zhangjun-k8s-01 kubelet[128468]: I0526 12:13:41.798230  128468 certificate_manager.go:366] Rotating certificates
May 26 12:13:41 zhangjun-k8s-01 kubelet[128468]: E0526 12:13:41.801997  128468 certificate_manager.go:385] Failed while requesting a signed certificate from the master: cannot create certificate signing request: certificatesigningrequests.certificates.k8s.io is forbidden: User "system:bootstrap:82jfrm" cannot create resource "certificatesigningrequests" in API group "certificates.k8s.io" at the cluster scope
```



解决办法是：创建一个 clusterrolebinding，将 group system:bootstrappers 和 clusterrole system:node-bootstrapper 绑定：

```shell
kubectl create clusterrolebinding kubelet-bootstrap --clusterrole=system:node-bootstrapper --group=system:bootstrappers
```



### 7.3.7 自动 approve CSR 请求，生成 kubelet client 证书

kubelet 创建 CSR 请求后，下一步需要创建被 approve，有两种方式：

1. kube-controller-manager 自动 aprrove；
2. 手动使用命令 `kubectl certificate approve`；

CSR 被 approve 后，kubelet 向 kube-controller-manager 请求创建 client 证书，kube-controller-manager 中的 `csrapproving` controller 使用 `SubjectAccessReview` API 来检查 kubelet 请求（对应的 group 是 system:bootstrappers）是否具有相应的权限。

创建三个 ClusterRoleBinding，分别授予 group system:bootstrappers 和 group system:nodes 进行 approve client、renew client、renew server 证书的权限（server csr 是手动 approve 的，见后文）：

```shell
cd /opt/k8s/yaml
cat > csr-crb.yaml <<EOF
 # Approve all CSRs for the group "system:bootstrappers"
 kind: ClusterRoleBinding
 apiVersion: rbac.authorization.k8s.io/v1
 metadata:
   name: auto-approve-csrs-for-group
 subjects:
 - kind: Group
   name: system:bootstrappers
   apiGroup: rbac.authorization.k8s.io
 roleRef:
   kind: ClusterRole
   name: system:certificates.k8s.io:certificatesigningrequests:nodeclient
   apiGroup: rbac.authorization.k8s.io
---
 # To let a node of the group "system:nodes" renew its own credentials
 kind: ClusterRoleBinding
 apiVersion: rbac.authorization.k8s.io/v1
 metadata:
   name: node-client-cert-renewal
 subjects:
 - kind: Group
   name: system:nodes
   apiGroup: rbac.authorization.k8s.io
 roleRef:
   kind: ClusterRole
   name: system:certificates.k8s.io:certificatesigningrequests:selfnodeclient
   apiGroup: rbac.authorization.k8s.io
---
# A ClusterRole which instructs the CSR approver to approve a node requesting a
# serving cert matching its client cert.
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: approve-node-server-renewal-csr
rules:
- apiGroups: ["certificates.k8s.io"]
  resources: ["certificatesigningrequests/selfnodeserver"]
  verbs: ["create"]
---
 # To let a node of the group "system:nodes" renew its own server credentials
 kind: ClusterRoleBinding
 apiVersion: rbac.authorization.k8s.io/v1
 metadata:
   name: node-server-cert-renewal
 subjects:
 - kind: Group
   name: system:nodes
   apiGroup: rbac.authorization.k8s.io
 roleRef:
   kind: ClusterRole
   name: approve-node-server-renewal-csr
   apiGroup: rbac.authorization.k8s.io
EOF
kubectl apply -f csr-crb.yaml
```

- auto-approve-csrs-for-group：自动 approve node 的第一次 CSR； 注意第一次 CSR 时，请求的 Group 为 system:bootstrappers；
- node-client-cert-renewal：自动 approve node 后续过期的 client 证书，自动生成的证书 Group 为 system:nodes;
- node-server-cert-renewal：自动 approve node 后续过期的 server 证书，自动生成的证书 Group 为 system:nodes;



### 7.3.8 启动 kubelet 服务

- 启动服务前必须先创建工作目录；
- 关闭 swap 分区，否则 kubelet 会启动失败；

```shell
source /opt/k8s/script/environment.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p ${K8S_DIR}/kubelet/kubelet-plugins/volume/exec/"
    ssh root@${node_ip} "/usr/sbin/swapoff -a"
    ssh root@${node_ip} "systemctl daemon-reload && systemctl enable kubelet && systemctl restart kubelet"
  done
```

kubelet 启动后使用 --bootstrap-kubeconfig 向 kube-apiserver 发送 CSR 请求，当这个 CSR 被 approve 后，kube-controller-manager 为 kubelet 创建 TLS 客户端证书、私钥和 --kubeletconfig 文件。

注意：kube-controller-manager 需要配置 `--cluster-signing-cert-file` 和 `--cluster-signing-key-file` 参数，才会为 TLS Bootstrap 创建证书和私钥。



### 7.3.9 查看 kubelet 情况

稍等一会，三个节点的 CSR 都被自动 approved：

```shell

```











