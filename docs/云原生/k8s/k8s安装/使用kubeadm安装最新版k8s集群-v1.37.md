import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[toc]

# 使用kubeadm安装最新版k8s集群（v1.37）

> 本文**完全按照 Kubernetes 官方文档**的步骤，使用 kubeadm 部署一个「1 master + 2 node」的最新版（v1.37）Kubernetes 集群。操作系统覆盖当前主流的两大阵营：**Ubuntu（Debian 系）** 与 **Rocky Linux / CentOS / RHEL（Red Hat 系）**——所有因操作系统而异的步骤都用**选项卡**区分，切换一次全文联动。三台机器请使用同一种操作系统。所有组件版本、IP、网段均用**变量**表示，换环境时只需要改变量，不用改命令。
>
> 每一步操作都附上了对应的官方文档链接，建议对照官方文档一起阅读。全文命令默认以 `root` 用户执行（Ubuntu 中官方命令自带的 `sudo` 可省略）。
>
> 笔记中**所有 IP、版本、网段均以变量表示**（见「变量约定」），换环境只需要修改变量。不想手工敲命令的话，配套笔记[《使用Ansible一键部署k8s集群（v1.37）》](./使用Ansible一键部署k8s集群-v1.37.md)提供了与本文步骤一一对应的一键部署 Playbook（失败即中止、可重复执行），见[第 7 节](#7-使用-ansible-一键安装可选)。

## 官方文档参考

| 文档 | 链接 |
| --- | --- |
| 安装 kubeadm（官方） | https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/ |
| 容器运行时（官方） | https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/ |
| 使用 kubeadm 创建集群（官方） | https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/ |
| 端口和协议（官方） | https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/ |
| 版本偏差策略（官方） | https://kubernetes.io/zh-cn/releases/version-skew-policy/ |
| containerd 官方入门文档 | https://github.com/containerd/containerd/blob/main/docs/getting-started.md |
| containerd 与 Kubernetes 版本兼容关系 | https://github.com/containerd/containerd/blob/main/RELEASES.md#kubernetes-support |
| flannel（GitHub） | https://github.com/flannel-io/flannel |

:::info 说明
Kubernetes 官方自 2023 年 9 月 13 日起已**弃用旧软件包仓库**（`apt.kubernetes.io` / `yum.kubernetes.io`），新版一律使用 [pkgs.k8s.io](https://kubernetes.io/zh-cn/blog/2023/08/15/pkgs-k8s-io-introduction/) 上的新仓库，本文使用的就是新仓库。详见[官方弃用公告](https://kubernetes.io/zh-cn/blog/2023/08/31/legacy-package-repository-deprecation/)。
:::

## 集群规划

![kubeadm 集群拓扑：1 master + 2 node](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/k8s-kubeadm-topology.png)

| 角色 | IP（变量） | 主机名 | 硬件配置 | 系统 | 安装组件 |
| --- | --- | --- | --- | --- | --- |
| master | 10.0.0.10（`MASTER_IP`） | k8s-master01 | 2c4g | Ubuntu 24.04 LTS 或 Rocky Linux 10（三台一致） | kube-apiserver、etcd、kube-controller-manager、kube-scheduler、kubelet、containerd |
| node | 10.0.0.11（`NODE01_IP`） | k8s-node01 | 2c4g | 同上 | kubelet、kube-proxy、containerd |
| node | 10.0.0.12（`NODE02_IP`） | k8s-node02 | 2c4g | 同上 | kubelet、kube-proxy、containerd |

:::tip 变量约定（全文通用）

以下变量贯穿全文，**先在三台机器上都执行一遍**（后续命令直接复制粘贴，无需再改任何 IP）。换版本、换 IP、换网段只需要改这里：

```bash
# ===== 版本变量（写本文时的最新版，可按需修改）=====
export K8S_VERSION=v1.37.1            # Kubernetes 稳定版，见 https://dl.k8s.io/release/stable.txt
export K8S_MINOR=1.37                 # pkgs.k8s.io 仓库对应的小版本
export CONTAINERD_VERSION=2.4.1       # containerd 版本
export RUNC_VERSION=1.5.2             # runc 版本
export CNI_PLUGINS_VERSION=v1.9.1     # CNI 插件版本
export FLANNEL_VERSION=v0.28.9        # flannel 版本
export PAUSE_VERSION=3.10             # pause 沙箱镜像版本

# ===== 集群网络变量 =====
export MASTER_IP=10.0.0.10            # master 节点 IP
export NODE01_IP=10.0.0.11            # 第一个 node 节点 IP
export NODE02_IP=10.0.0.12            # 第二个 node 节点 IP
export POD_CIDR=10.244.0.0/16         # Pod 网段（flannel 默认值）
export SERVICE_CIDR=10.96.0.0/12      # Service 网段（官方默认值）

# ===== 镜像仓库变量 =====
export IMAGE_REGISTRY=registry.k8s.io # 控制平面镜像仓库（国内网络可替换，见第 6 节）
```

:::

[官方文档：准备开始](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#%E5%87%86%E5%A4%87%E5%BC%80%E5%A7%8B)要求每台机器满足：

- 2 GB 及以上内存（低于会影响应用运行）
- 控制平面机器 CPU 2 核及以上
- 集群中所有机器网络互通
- 节点之间不可以有重复的 `主机名`、`MAC 地址` 或 `product_uuid`

## 1. 前置准备（所有节点）

> 以下操作在 **k8s-master01、k8s-node01、k8s-node02 三台机器上全部执行**。

### 1.1 设置主机名与 hosts 解析

```bash
# 分别在三台机器上执行（以 master 为例）
hostnamectl set-hostname k8s-master01
```

```bash
# 三台机器上都添加 hosts 解析（IP 全部来自变量区块，换环境只改变量即可）
cat >> /etc/hosts <<EOF
${MASTER_IP} k8s-master01
${NODE01_IP} k8s-node01
${NODE02_IP} k8s-node02
EOF
```

:::caution 注意
节点之中不可以有重复的 `主机名`、`MAC 地址` 或 `product_uuid`，Kubernetes 使用这些值来唯一确定集群中的节点，重复会导致安装失败（[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#verify-mac-address)）。检查方法：

```bash
# MAC 地址
ip link
# product_uuid
cat /sys/class/dmi/id/product_uuid
```
:::

### 1.2 关闭 swap

[官方文档：准备开始](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#%E5%87%86%E5%A4%87%E5%BC%80%E5%A7%8B)要求：如果 kubelet 未被正确配置使用交换分区，则**必须禁用交换分区**。

```bash
# 临时关闭
swapoff -a

# 永久关闭：注释 /etc/fstab 中 swap 相关行
sed -ri 's/.*swap.*/#&/' /etc/fstab

# 验证，输出应为空
free -m | grep -i swap
```

### 1.3 安全模块配置（SELinux / AppArmor）

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)将「将 SELinux 设置为 permissive 模式」这一步放在**基于 Red Hat 的发行版**小节下：这是允许容器访问主机文件系统所必需的，例如部分容器网络插件需要这一能力。

<Tabs groupId="os">
<TabItem value="rhel" label="Rocky / CentOS / RHEL" default>

```bash
# 将 SELinux 设置为 permissive 模式（相当于将其禁用）
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

</TabItem>
<TabItem value="ubuntu" label="Ubuntu">

Ubuntu 默认使用 **AppArmor** 而非 SELinux，官方文档**没有**针对 Ubuntu 的对应步骤，**无需任何操作**。

</TabItem>
</Tabs>

### 1.4 时间同步

三台机器时间必须一致，否则证书校验、TLS 引导都会出问题（国内环境建议直接用阿里云 NTP）：

<Tabs groupId="os">
<TabItem value="rhel" label="Rocky / CentOS / RHEL" default>

```bash
dnf -y install chrony
sed -i 's/^pool.*/pool ntp.aliyun.com iburst/' /etc/chrony.conf
systemctl enable --now chronyd
chronyc sources
```

</TabItem>
<TabItem value="ubuntu" label="Ubuntu">

```bash
apt-get -y install chrony
# 注意：Ubuntu 的 chrony 配置文件在 /etc/chrony/ 目录下
sed -i 's/^pool.*/pool ntp.aliyun.com iburst/' /etc/chrony/chrony.conf
systemctl enable --now chrony
chronyc sources
```

</TabItem>
</Tabs>

### 1.5 加载内核模块并开启 IPv4 转发

[官方文档：容器运行时 - 安装和配置先决条件](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)要求开启 IPv4 数据包转发；此外 flannel 官方明确说明需要 `br_netfilter` 模块（从 k8s 1.30 起 kubeadm 不再检查该模块，缺失会导致 flannel 无法正常工作）。**这一节 Ubuntu 和 Red Hat 系命令完全相同，无需区分**：

```bash
# 加载 overlay、br_netfilter 模块并持久化
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter

# 设置所需的 sysctl 参数，参数在重新启动后保持不变
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# 应用 sysctl 参数而不重新启动
sysctl --system
```

验证：

```bash
lsmod | grep -E 'br_netfilter|overlay'
sysctl net.bridge.bridge-nf-call-iptables net.bridge.bridge-nf-call-ip6tables net.ipv4.ip_forward
```

### 1.6 检查所需端口

[官方文档：检查所需端口](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports)、[端口和协议](https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/)。

**master 节点需要启用的端口**

| 协议 | 方向 | 端口范围 | 目的 | 使用者 |
| ---- | ---- | --------- | ----------------------- | -------------------- |
| TCP | 入站 | 6443 | Kubernetes API server | 所有 |
| TCP | 入站 | 2379-2380 | etcd server client API | kube-apiserver, etcd |
| TCP | 入站 | 10250 | Kubelet API | 自身, master 节点 |
| TCP | 入站 | 10259 | kube-scheduler | 自身 |
| TCP | 入站 | 10257 | kube-controller-manager | 自身 |

**node 节点需要启用的端口**

| 协议 | 方向 | 端口范围 | 目的 | 使用者 |
| ---- | ---- | ----------- | ------------------ | ---------------- |
| TCP | 入站 | 10250 | Kubelet API | 自身, master 节点 |
| TCP | 入站 | 30000-32767 | NodePort Services | 所有 |

```bash
# 测试端口是否开放（示例）
nc 127.0.0.1 6443 -zv -w 2
```

:::tip 说明
实验环境建议直接关闭防火墙：Red Hat 系执行 `systemctl disable --now firewalld`，Ubuntu 执行 `ufw disable`（Ubuntu 默认不启用 ufw，`ufw status` 显示 `inactive` 则无需处理）；生产环境请按上表精确放行端口。
:::

## 2. 安装容器运行时 containerd（所有节点）

[官方文档：安装容器运行时](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-runtime)：Kubernetes 使用容器运行时接口（CRI）与容器运行时交互，本文按照官方推荐使用 containerd（[官方容器运行时文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)）。

:::caution 注意
Docker Engine 没有实现 CRI，如果一定要用 Docker 需要额外安装 cri-dockerd（官方说明）。本文按官方推荐使用 containerd。
:::

[containerd 与 Kubernetes 版本兼容关系](https://github.com/containerd/containerd/blob/main/RELEASES.md#kubernetes-support)。

:::info 说明
本节按 containerd 官方入门文档使用**二进制 tar 包**方式安装，命令与发行版无关，**Ubuntu 和 Red Hat 系完全相同**。Ubuntu 也可以 `apt-get install containerd`，但仓库版本通常较旧、默认配置需要自行调整，因此本文统一采用官方推荐方式。
:::

### 2.1 安装 containerd

[官方入门文档：Getting Started with containerd](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)。

```bash
# 下载（变量 CONTAINERD_VERSION=2.4.1）
wget https://github.com/containerd/containerd/releases/download/v${CONTAINERD_VERSION}/containerd-${CONTAINERD_VERSION}-linux-amd64.tar.gz

# 解压到 /usr/local
tar Cxzvf /usr/local containerd-${CONTAINERD_VERSION}-linux-amd64.tar.gz

# 使用 systemd 管理 containerd
curl https://raw.githubusercontent.com/containerd/containerd/main/containerd.service -o /usr/lib/systemd/system/containerd.service
systemctl daemon-reload
```

### 2.2 安装 runc

[runc（GitHub）](https://github.com/opencontainers/runc)

```bash
# 下载（变量 RUNC_VERSION=1.5.2）
wget https://github.com/opencontainers/runc/releases/download/v${RUNC_VERSION}/runc.amd64

# 安装
install -m 755 runc.amd64 /usr/local/sbin/runc

# 验证
runc -v
```

### 2.3 安装 CNI 插件

[官方文档：安装 kubeadm - 安装 CNI 插件](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)（大多数 Pod 网络都需要）。[CNI plugins（GitHub）](https://github.com/containernetworking/plugins)

```bash
# 变量 CNI_PLUGINS_VERSION=v1.9.1（官方文档页面示例为 v1.3.0，按最新版填写即可）
ARCH="amd64"
DEST="/opt/cni/bin"
mkdir -p "$DEST"
curl -L "https://github.com/containernetworking/plugins/releases/download/${CNI_PLUGINS_VERSION}/cni-plugins-linux-${ARCH}-${CNI_PLUGINS_VERSION}.tgz" | tar -C "$DEST" -xz
```

### 2.4 生成配置文件并配置 systemd cgroup 驱动

[官方文档：systemd cgroup 驱动](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#systemd-cgroup-driver)

```bash
# 生成默认配置
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
```

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)要求：当 systemd 是初始化系统时，kubelet 和容器运行时需使用相同的 cgroup 驱动，即都配置为 `systemd`：

```bash
# 将 runc 的 cgroup 驱动改为 systemd
sed -i.bak 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# 验证
grep -n 'SystemdCgroup' /etc/containerd/config.toml
```

:::caution 注意
`SystemdCgroup` 所在的配置段在 containerd 1.x 和 2.x 中**不同**（官方文档两种都给了）：

- containerd **1.x**：`[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]`
- containerd **2.x**：`[plugins.'io.containerd.cri.v1.runtime'.containerd.runtimes.runc.options']`

本文安装的 2.4.1 属于 2.x。如果 `grep` 没有匹配到任何行（说明默认配置中省略了该项），需要在对应小节下手动添加 `SystemdCgroup = true`。
:::

:::info 说明
如果从 RPM/deb 软件包安装 containerd，官方提醒：包内默认配置可能禁用了 CRI 插件，需确保 `cri` 没有出现在 `/etc/containerd/config.toml` 的 `disabled_plugins` 列表中，否则无法用于 Kubernetes。
:::

### 2.5 修改 pause 沙箱镜像

[官方文档：重载沙箱（pause）镜像](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)：pause 镜像默认从 `registry.k8s.io` 拉取，国内网络拉取慢或失败时，可替换为国内可用的镜像地址（见第 6 节）。

```bash
# 变量 PAUSE_VERSION=3.10（v1.37 官方默认值）
# 国内网络可把 registry.k8s.io 替换为可用的镜像仓库，例如：
# sed -i 's#registry.k8s.io/pause#registry.aliyuncs.com/google_containers/pause#' /etc/containerd/config.toml
grep -n "sandbox_image" /etc/containerd/config.toml
```

### 2.6 启动 containerd

```bash
systemctl enable --now containerd
systemctl status containerd
```

## 3. 安装 kubeadm、kubelet、kubectl（所有节点）

[官方文档：安装 kubeadm、kubelet 和 kubectl](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

需要在每台机器上安装：

- `kubeadm`：用来初始化集群的指令
- `kubelet`：在集群中的每个节点上用来启动 Pod 和容器等
- `kubectl`：用来与集群通信的命令行工具

### 3.1 配置 pkgs.k8s.io 官方仓库

每个 Kubernetes 小版本都有一个专用的软件包仓库（[官方说明](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)）。注意命令中的小版本号用变量 `K8S_MINOR` 表示：

<Tabs groupId="os">
<TabItem value="rhel" label="Rocky / CentOS / RHEL" default>

```bash
# 变量 K8S_MINOR=1.37（此操作会覆盖 /etc/yum.repos.d/kubernetes.repo 中现存的所有配置）
cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```

</TabItem>
<TabItem value="ubuntu" label="Ubuntu">

```bash
# 变量 K8S_MINOR=1.37

# 1. 更新包索引并安装依赖（apt-transport-https 可能是虚拟包，如果是的话可以跳过安装这个包）
apt-get update
apt-get install -y apt-transport-https ca-certificates curl gpg

# 2. 下载仓库公钥（所有小版本共用同一把签名密钥，可忽略 URL 中的版本）
mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# 3. 添加 apt 仓库（此操作会覆盖 /etc/apt/sources.list.d/kubernetes.list 中现存的所有配置）
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list
```

</TabItem>
</Tabs>

### 3.2 安装三件套并锁定版本

<Tabs groupId="os">
<TabItem value="rhel" label="Rocky / CentOS / RHEL" default>

```bash
# 查看仓库中可安装的版本
yum list kubeadm --showduplicates

# 安装（变量 K8S_VERSION=v1.37.1，三件套版本必须一致）
yum -y install kubelet-${K8S_VERSION} kubeadm-${K8S_VERSION} kubectl-${K8S_VERSION} --disableexcludes=kubernetes

# 启用 kubelet 并设置开机自启
systemctl enable --now kubelet
```

</TabItem>
<TabItem value="ubuntu" label="Ubuntu">

官方命令为安装后用 `apt-mark hold` 锁定版本（防止 `apt upgrade` 自动升级 Kubernetes 组件，升级 k8s 必须走 kubeadm 专属流程）。指定版本时注意：apt 的版本号**不带 `v` 前缀**且带 `-1.1` 修订号，以 `apt-cache madison` 的实际输出为准：

```bash
# 查看仓库中可安装的版本
apt-get update
apt-cache madison kubeadm

# 安装（变量 K8S_VERSION=v1.37.1；${K8S_VERSION#v} 会自动去掉 v 前缀，即 1.37.1-1.1）
apt-get install -y kubelet=${K8S_VERSION#v}-1.1 kubeadm=${K8S_VERSION#v}-1.1 kubectl=${K8S_VERSION#v}-1.1

# 锁定版本（官方命令）
apt-mark hold kubelet kubeadm kubectl

# 启用 kubelet 并设置开机自启
systemctl enable --now kubelet
```

</TabItem>
</Tabs>

:::caution kubelet 反复重启是正常现象
[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)说明：kubelet 现在会每隔几秒重启一次，处于 crashloop 状态等待 kubeadm 发布指令，**这是正常现象**。初始化控制平面后 kubelet 将正常运行。
:::

:::info 版本偏差说明
[官方版本偏差策略](https://kubernetes.io/zh-cn/releases/version-skew-policy/)：kubelet 的版本不可以超过 API 服务器的版本，控制平面与 kubelet 之间可以存在**一个**次要版本的偏差。kubeadm 的版本必须与 kubernetesVersion 相同或大一个版本。
:::

### 3.3 配置 kubectl 命令补全

<Tabs groupId="os">
<TabItem value="rhel" label="Rocky / CentOS / RHEL" default>

```bash
dnf -y install bash-completion
echo "source <(kubectl completion bash)" >> ~/.bashrc && source ~/.bashrc
```

</TabItem>
<TabItem value="ubuntu" label="Ubuntu">

```bash
apt-get -y install bash-completion
echo "source <(kubectl completion bash)" >> ~/.bashrc && source ~/.bashrc
```

</TabItem>
</Tabs>

## 4. 初始化 master 节点（仅在 k8s-master01 执行）

![kubeadm 安装流程](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/k8s-kubeadm-install-flow.png)

### 4.1 （可选）预拉取控制平面镜像

[官方文档：准备所需的容器镜像](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)：离线或网络不佳时，可提前拉取镜像。国内网络建议先执行这一步确认镜像能拉下来，再 init：

```bash
# 变量 IMAGE_REGISTRY=registry.k8s.io（国内可换成可用的镜像仓库）
kubeadm config images pull --image-repository ${IMAGE_REGISTRY} --kubernetes-version ${K8S_VERSION}
```

:::tip 说明
拉取失败时可以把 `IMAGE_REGISTRY` 换成国内镜像仓库（如 `registry.aliyuncs.com/google_containers`），镜像站的可用性随时间变化，以实际测试为准（详见第 6 节）。
:::

### 4.2 初始化控制平面

[官方文档：初始化控制平面节点](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

`kubeadm init` 会先运行一系列预检查，然后下载并安装集群控制平面组件，可能需要几分钟：

```bash
kubeadm init \
  --apiserver-advertise-address=${MASTER_IP} \
  --image-repository ${IMAGE_REGISTRY} \
  --kubernetes-version ${K8S_VERSION} \
  --pod-network-cidr=${POD_CIDR} \
  --service-cidr=${SERVICE_CIDR}
```

| 参数 | 说明 |
| --- | --- |
| `--apiserver-advertise-address` | API 服务器公布其正在监听的 IP 地址（master 内网 IP） |
| `--image-repository` | 拉取控制平面镜像的仓库，默认 `registry.k8s.io` |
| `--kubernetes-version` | 指定安装的 Kubernetes 版本 |
| `--pod-network-cidr` | Pod 网络可以使用的 IP 地址段，**必须与所选 CNI 插件的网段一致**（flannel 默认 `10.244.0.0/16`） |
| `--service-cidr` | Service 的虚拟 IP 地址段，默认 `10.96.0.0/12` |

初始化成功后的输出（**务必把 join 命令记录下来**）：

```none
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 10.0.0.10:6443 --token <token> \
        --discovery-token-ca-cert-hash sha256:<hash>
```

### 4.3 配置 kubectl

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)：

```bash
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```

### 4.4 安装 Pod 网络插件 flannel

[官方文档：安装 Pod 网络附加组件](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network)：**必须部署一个基于 Pod 网络插件的 CNI，Pod 才能相互通信；不装网络插件，CoreDNS 不会启动。**

:::caution 注意
- 你的 Pod 网络不得与任何主机网络重叠
- 每个集群只能安装一个 Pod 网络
- flannel 要求 Pod 网段为 `10.244.0.0/16`（即 `kube-flannel.yml` 中 `net-conf.json` 的 `Network` 字段），如果 init 时用了别的 `POD_CIDR`，必须同步修改该字段
:::

[flannel（GitHub）](https://github.com/flannel-io/flannel)：

```bash
# 下载（变量 FLANNEL_VERSION=v0.28.9），建议下载下来检查 Network 字段后再安装
wget https://github.com/flannel-io/flannel/releases/download/v${FLANNEL_VERSION}/kube-flannel.yml

# 确认 Network 字段与 POD_CIDR 一致（默认 10.244.0.0/16）
grep -A 4 'net-conf.json' kube-flannel.yml

# 安装
kubectl apply -f kube-flannel.yml
```

### 4.5 验证控制平面

```bash
# CoreDNS 等 Pod 正常 Running 后，master 节点才会 Ready
kubectl get pods -A
```

```none
NAMESPACE      NAME                                  READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-xxxxx                 1/1     Running   0          1m
kube-system    coredns-xxxxx-xxxxx                   1/1     Running   0          5m
kube-system    etcd-k8s-master01                     1/1     Running   0          5m
kube-system    kube-apiserver-k8s-master01           1/1     Running   0          5m
kube-system    kube-controller-manager-k8s-master01  1/1     Running   0          5m
kube-system    kube-proxy-xxxxx                      1/1     Running   0          5m
kube-system    kube-scheduler-k8s-master01           1/1     Running   0          5m
```

## 5. 添加 node 节点（在 k8s-node01、k8s-node02 上执行）

[官方文档：添加工作节点](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

### 5.1 加入集群

在**两个 node 节点**上分别执行 `kubeadm init` 最后输出的 join 命令：

```bash
kubeadm join ${MASTER_IP}:6443 --token <token> \
        --discovery-token-ca-cert-hash sha256:<hash>
```

:::caution 注意
`<token>` 和 `<hash>` 是 `kubeadm init` 输出的真实值（token 是密钥，注意保存安全）。默认 token 24 小时过期，过期后见 5.2。
:::

### 5.2 token 过期处理

[官方文档：kubeadm token](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-token/)：

```bash
# 在 master 上执行：生成新 token 并直接打印完整的 join 命令
kubeadm token create --print-join-command

# 查看 token 列表
kubeadm token list

# 手动计算 discovery-token-ca-cert-hash
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | \
   openssl dgst -sha256 -hex | sed 's/^.* //'
```

### 5.3 验证集群

在 master 上执行，两个 node 加入并启动 flannel 后（需要 1~2 分钟），所有节点 `Ready`：

```bash
kubectl get nodes -o wide
```

```none
NAME           STATUS   ROLES           AGE   VERSION
k8s-master01   Ready    control-plane   30m   v1.37.1
k8s-node01     Ready    <none>          2m    v1.37.1
k8s-node02     Ready    <none>          1m    v1.37.1
```

## 6. 中国用户常见问题

:::tip 说明
以下是官方文档不会写、但国内环境经常踩的坑，按出现频率排序。
:::

### 6.1 控制平面镜像拉取慢或失败（`registry.k8s.io` 超时）

`kubeadm init` 卡在拉取 `kube-apiserver` 等镜像：

- init 时通过 `--image-repository`（变量 `IMAGE_REGISTRY`）换成国内镜像仓库，例如 `registry.aliyuncs.com/google_containers`
- 镜像站可用性随时间变化，**建议先跑 `kubeadm config images pull` 验证能拉通再 init**

### 6.2 pause 沙箱镜像拉取失败

现象：节点 Ready 但 Pod 一直 `ContainerCreating`，`crictl ps -a` 报 pause 镜像拉取失败。解决：修改 `/etc/containerd/config.toml` 中的 `sandbox_image`（见 2.5），然后 `systemctl restart containerd`。

### 6.3 flannel 镜像拉取失败

新版 flannel 镜像在 `ghcr.io`/`docker.io`，拉不动时可以手动 `crictl pull` 一个国内可用的同名镜像再 `ctr -n k8s.io images tag` 回原名，或者修改 `kube-flannel.yml` 中的镜像地址。

### 6.4 时间不同步导致的各种诡异问题

证书校验失败、node 一直 `NotReady`、TLS bootstrap 失败……先 `chronyc sources` 对时间。见 1.4。

### 6.5 br_netfilter 模块缺失导致 flannel 起不来

k8s 1.30 起 kubeadm 不再预检该模块，忘了执行 1.5 的话 flannel Pod 会异常。检查：`lsmod | grep br_netfilter`。

### 6.6 想在 master 上也跑业务 Pod（单机场景）

```bash
# 官方文档：控制平面节点隔离
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

### 6.7 安装失败想重来

[官方文档：kubeadm reset](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-reset/)：

```bash
kubeadm reset
# reset 不会重置 iptables/IPVS，需要手动清理
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X
```

## 7. 使用 Ansible 一键安装（可选）

> 第 1~5 节是**手工分步安装**（学习、理解官方文档用）。如果想一键部署，配套笔记 **[《使用Ansible一键部署k8s集群（v1.37）》](./使用Ansible一键部署k8s集群-v1.37.md)** 把本文的 5 个步骤原样自动化了：5 个 play 文件与本文第 1~5 节一一对应，完全按官方文档顺序执行。
>
> 核心特性：
>
> - **失败即中止**：任一节点任一任务失败（下载失败、安装失败、校验失败），整个部署立即停止
> - **可重复执行**：所有任务幂等，排查修复后直接重跑，已完成的步骤自动跳过（init/join 检测标记文件，不会重复执行）
> - **变量一一对应**：`group_vars/all.yml` 与本文「变量约定」一致，节点 IP 在 `inventory.ini` 一处修改
> - **自动识别操作系统**：RedHat 系走 yum 分支，Ubuntu 走 apt 分支，与本文选项卡一一对应

## 附录：变量速查表

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `K8S_VERSION` | `v1.37.1` | 安装的 Kubernetes 版本（[最新稳定版](https://dl.k8s.io/release/stable.txt)） |
| `K8S_MINOR` | `1.37` | pkgs.k8s.io 仓库的小版本号 |
| `CONTAINERD_VERSION` | `2.4.1` | containerd 版本 |
| `RUNC_VERSION` | `1.5.2` | runc 版本 |
| `CNI_PLUGINS_VERSION` | `v1.9.1` | CNI 插件版本 |
| `FLANNEL_VERSION` | `v0.28.9` | flannel 版本 |
| `PAUSE_VERSION` | `3.10` | pause 沙箱镜像版本 |
| `MASTER_IP` | `10.0.0.10` | master 节点 IP |
| `NODE01_IP` | `10.0.0.11` | 第一个 node 节点 IP |
| `NODE02_IP` | `10.0.0.12` | 第二个 node 节点 IP |
| `POD_CIDR` | `10.244.0.0/16` | Pod 网段（须与 flannel `Network` 一致） |
| `SERVICE_CIDR` | `10.96.0.0/12` | Service 网段 |
| `IMAGE_REGISTRY` | `registry.k8s.io` | 控制平面镜像仓库（国内可替换） |
