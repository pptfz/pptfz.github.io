# 使用kubeadm在Rocky linux上安装k8s集群

[kubeadm安装官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)



## 实验环境



| 角色   | IP         | 主机名     | containerd版本 | 硬件配置 | 系统                                | 内核                         | 安装组件                                                     |
| ------ | ---------- | ---------- | -------------- | -------- | ----------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| master | 10.0.0.10  | k8s-master | 1.7.17         | 2c4g     | Rocky Linux release 9.3 (Blue Onyx) | 5.14.0-362.8.1.el9_3.aarch64 | kube-apiserver，kube-controller-manager，kube-scheduler，kubelet，etcd |
| Node01 | 10.0.0.100 | K8s-node01 | 1.7.17         | 4c8g     | Rocky Linux release 9.3 (Blue Onyx) | 5.14.0-362.8.1.el9_3.aarch64 | kubelet，kube-proxy，containerd，etcd                        |
| node02 | 10.0.0.101 | k8s-node02 | 1.7.17         | 4c8g     | Rocky Linux release 9.3 (Blue Onyx) | 5.14.0-362.8.1.el9_3.aarch64 | kubelet，kube-proxy，containerd，etcd                        |
| node03 | 10.0.0.102 | k8s-node03 | 1.7.17         | 2c4g     | Rocky Linux release 9.3 (Blue Onyx) | 5.14.0-362.8.1.el9_3.aarch64 | kubelet，kube-proxy，containerd，etcd                        |



## 准备开始

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#%E5%87%86%E5%A4%87%E5%BC%80%E5%A7%8B)

- 一台兼容的 Linux 主机。Kubernetes 项目为基于 Debian 和 Red Hat 的 Linux 发行版以及一些不提供包管理器的发行版提供通用的指令。
- 每台机器 2 GB 或更多的 RAM（如果少于这个数字将会影响你应用的运行内存）。
- CPU 2 核心及以上。
- 集群中的所有机器的网络彼此均能相互连接（公网和内网都可以）。
- 节点之中不可以有重复的主机名、MAC 地址或 product_uuid。请参见[这里](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#verify-mac-address)了解更多详细信息。
- 开启机器上的某些端口。请参见[这里](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports)了解更多详细信息。
- 交换分区的配置。kubelet 的默认行为是在节点上检测到交换内存时无法启动。 kubelet 自 v1.22 起已开始支持交换分区。自 v1.28 起，仅针对 cgroup v2 支持交换分区； kubelet 的 NodeSwap 特性门控处于 Beta 阶段，但默认被禁用。
  - 如果 kubelet 未被正确配置使用交换分区，则你**必须**禁用交换分区。 例如，`sudo swapoff -a` 将暂时禁用交换分区。要使此更改在重启后保持不变，请确保在如 `/etc/fstab`、`systemd.swap` 等配置文件中禁用交换分区，具体取决于你的系统如何配置。



:::tip 说明

`kubeadm` 的安装是通过使用动态链接的二进制文件完成的，安装时假设你的目标系统提供 `glibc`。 这个假设在许多 Linux 发行版（包括 Debian、Ubuntu、Fedora、CentOS 等）上是合理的， 但对于不包含默认 `glibc` 的自定义和轻量级发行版（如 Alpine Linux），情况并非总是如此。 预期的情况是，发行版要么包含 `glibc`， 要么提供了一个[兼容层](https://wiki.alpinelinux.org/wiki/Running_glibc_programs)以提供所需的符号。

:::



## 确保每个节点上 MAC 地址和 product_uuid 的唯一性

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#verify-mac-address)

- 你可以使用命令 `ip link` 或 `ifconfig -a` 来获取网络接口的 MAC 地址
- 可以使用 `sudo cat /sys/class/dmi/id/product_uuid` 命令对 product_uuid 校验

一般来讲，硬件设备会拥有唯一的地址，但是有些虚拟机的地址可能会重复。 Kubernetes 使用这些值来唯一确定集群中的节点。 如果这些值在每个节点上不唯一，可能会导致安装[失败](https://github.com/kubernetes/kubeadm/issues/31)。



## 检查网络适配器

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-network-adapters)

如果你有一个以上的网络适配器，同时你的 Kubernetes 组件通过默认路由不可达，我们建议你预先添加 IP 路由规则， 这样 Kubernetes 集群就可以通过对应的适配器完成连接。



## 检查所需端口

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports)

启用这些[必要的端口](https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/)后才能使 Kubernetes 的各组件相互通信。 可以使用 [netcat](https://netcat.sourceforge.net/) 之类的工具来检查端口是否开放，例如：

```shell
nc 127.0.0.1 6443 -v
```

你使用的 Pod 网络插件 (详见后续章节) 也可能需要开启某些特定端口。 由于各个 Pod 网络插件的功能都有所不同，请参阅他们各自文档中对端口的要求。



**master节点需要启用的端口**

| 协议 | 方向 | 端口范围  | 目的                    | 使用者               |
| ---- | ---- | --------- | ----------------------- | -------------------- |
| TCP  | 入站 | 6443      | Kubernetes API 服务器   | 所有                 |
| TCP  | 入站 | 2379-2380 | etcd 服务器客户端 API   | kube-apiserver、etcd |
| TCP  | 入站 | 10250     | kubelet API             | 自身、控制面         |
| TCP  | 入站 | 10259     | kube-scheduler          | 自身                 |
| TCP  | 入站 | 10257     | kube-controller-manager | 自身                 |



**node节点需要启用的端口**

| 协议 | 方向 | 端口范围    | 目的               | 使用者           |
| ---- | ---- | ----------- | ------------------ | ---------------- |
| TCP  | 入站 | 10250       | kubelet API        | 自身、控制面     |
| TCP  | 入站 | 10256       | kube-proxy         | 自身、负载均衡器 |
| TCP  | 入站 | 30000-32767 | NodePort Services† | 所有             |





## 安装容器运行时

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-runtime)

为了在 Pod 中运行容器，Kubernetes 使用 [容器运行时（Container Runtime）](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes)。

默认情况下，Kubernetes 使用 [容器运行时接口（Container Runtime Interface，CRI）](https://kubernetes.io/zh-cn/docs/concepts/overview/components/#container-runtime) 来与你所选择的容器运行时交互。

如果你不指定运行时，kubeadm 会自动尝试通过扫描已知的端点列表来检测已安装的容器运行时。

如果检测到有多个或者没有容器运行时，kubeadm 将抛出一个错误并要求你指定一个想要使用的运行时。

参阅[容器运行时](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/) 以了解更多信息。

:::tip 说明

Docker Engine 没有实现 [CRI](https://kubernetes.io/zh-cn/docs/concepts/architecture/cri/)， 而这是容器运行时在 Kubernetes 中工作所需要的。 为此，必须安装一个额外的服务 [cri-dockerd](https://github.com/Mirantis/cri-dockerd)。 cri-dockerd 是一个基于传统的内置 Docker 引擎支持的项目， 它在 1.24 版本从 kubelet 中[移除](https://kubernetes.io/zh-cn/dockershim)。

:::

下面的表格包括被支持的操作系统的已知端点。

| 运行时                            | Unix 域套接字                                |
| --------------------------------- | -------------------------------------------- |
| containerd                        | `unix:///var/run/containerd/containerd.sock` |
| CRI-O                             | `unix:///var/run/crio/crio.sock`             |
| Docker Engine（使用 cri-dockerd） | `unix:///var/run/cri-dockerd.sock`           |



### 容器运行时类型

[containerd](https://github.com/containerd/containerd)

[cri-o](https://github.com/cri-o/cri-o)

[docker](https://docs.docker.com/engine/install/#server)   [cri-dockerd](https://github.com/Mirantis/cri-dockerd)

[Mirantis Container Runtime](https://docs.mirantis.com/mcr/20.10/install.html)



### 安装和配置先决条件

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#install-and-configure-prerequisites)

#### 启用 IPv4 数据包转发

```bash
# 设置所需的 sysctl 参数，参数在重新启动后保持不变
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
EOF

# 应用 sysctl 参数而不重新启动
sudo sysctl --system
```



使用以下命令验证 `net.ipv4.ip_forward` 是否设置为 1：

```bash
sysctl net.ipv4.ip_forward
```



### cgroup 驱动

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#cgroup-drivers)

在 Linux 上，[控制组（CGroup）](https://kubernetes.io/zh-cn/docs/reference/glossary/?all=true#term-cgroup)用于限制分配给进程的资源。

[kubelet](https://kubernetes.io/docs/reference/generated/kubelet) 和底层容器运行时都需要对接控制组来强制执行 [为 Pod 和容器管理资源](https://kubernetes.io/zh-cn/docs/concepts/configuration/manage-resources-containers/) 并为诸如 CPU、内存这类资源设置请求和限制。若要对接控制组，kubelet 和容器运行时需要使用一个 **cgroup 驱动**。 关键的一点是 kubelet 和容器运行时需使用相同的 cgroup 驱动并且采用相同的配置。

可用的 cgroup 驱动有两个：

- [`cgroupfs`](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#cgroupfs-cgroup-driver)
- [`systemd`](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#systemd-cgroup-driver)

#### cgroupfs 驱动

`cgroupfs` 驱动是 [kubelet 中默认的 cgroup 驱动](https://kubernetes.io/zh-cn/docs/reference/config-api/kubelet-config.v1beta1)。 当使用 `cgroupfs` 驱动时， kubelet 和容器运行时将直接对接 cgroup 文件系统来配置 cgroup。

当 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 是初始化系统时， **不** 推荐使用 `cgroupfs` 驱动，因为 systemd 期望系统上只有一个 cgroup 管理器。 此外，如果你使用 [cgroup v2](https://kubernetes.io/zh-cn/docs/concepts/architecture/cgroups)， 则应用 `systemd` cgroup 驱动取代 `cgroupfs`。

#### systemd cgroup 驱动

当某个 Linux 系统发行版使用 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 作为其初始化系统时，初始化进程会生成并使用一个 root 控制组（`cgroup`），并充当 cgroup 管理器。

systemd 与 cgroup 集成紧密，并将为每个 systemd 单元分配一个 cgroup。 因此，如果你 `systemd` 用作初始化系统，同时使用 `cgroupfs` 驱动，则系统中会存在两个不同的 cgroup 管理器。

同时存在两个 cgroup 管理器将造成系统中针对可用的资源和使用中的资源出现两个视图。某些情况下， 将 kubelet 和容器运行时配置为使用 `cgroupfs`、但为剩余的进程使用 `systemd` 的那些节点将在资源压力增大时变得不稳定。

当 systemd 是选定的初始化系统时，缓解这个不稳定问题的方法是针对 kubelet 和容器运行时将 `systemd` 用作 cgroup 驱动。

要将 `systemd` 设置为 cgroup 驱动，需编辑 [`KubeletConfiguration`](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubelet-config-file/) 的 `cgroupDriver` 选项，并将其设置为 `systemd`。例如：

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
...
cgroupDriver: systemd
```



:::tip 说明

从 v1.22 开始，在使用 kubeadm 创建集群时，如果用户没有在 `KubeletConfiguration` 下设置 `cgroupDriver` 字段，kubeadm 默认使用 `systemd`。

:::



在 Kubernetes v1.28 中，启用 `KubeletCgroupDriverFromCRI` [特性门控](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/feature-gates/)结合支持 `RuntimeConfig` CRI RPC 的容器运行时，kubelet 会自动从运行时检测适当的 Cgroup 驱动程序，并忽略 kubelet 配置中的 `cgroupDriver` 设置。

如果你将 `systemd` 配置为 kubelet 的 cgroup 驱动，你也必须将 `systemd` 配置为容器运行时的 cgroup 驱动。参阅容器运行时文档，了解指示说明。例如：

- [containerd](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#containerd-systemd)
- [CRI-O](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#cri-o)



:::caution 注意

更改已加入集群的节点的 cgroup 驱动是一项敏感的操作。 如果 kubelet 已经使用某 cgroup 驱动的语义创建了 Pod，更改运行时以使用别的 cgroup 驱动，当为现有 Pod 重新创建 PodSandbox 时会产生错误。 重启 kubelet 也可能无法解决此类问题。

如果你有切实可行的自动化方案，使用其他已更新配置的节点来替换该节点， 或者使用自动化方案来重新安装。

:::



### 安装containerd

#### 安装containerd

[查看k8s和containerd版本兼容关系](https://github.com/containerd/containerd/blob/main/RELEASES.md#kubernetes-support)

[containerd官方安装文档](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)



:::caution 注意

从v1.6版本开始，捆绑包 `cri-containerd-*.tar.gz` 已经被弃用，并且会在v2.0版本删除，这里有 [官方说明](https://github.com/containerd/containerd/blob/main/RELEASES.md#deprecated-features) 

:::



下载安装包

```bash
export CONTAINERD_VERSION=1.7.17
export ARCHITECTURE=arm64
wget https://github.com/containerd/containerd/releases/download/v${CONTAINERD_VERSION}/containerd-${CONTAINERD_VERSION}-linux-${ARCHITECTURE}.tar.gz
```



压缩包内容如下

```bash
$ tar tf containerd-${CONTAINERD_VERSION}-linux-${ARCHITECTURE}.tar.gz 
bin/
bin/containerd-shim
bin/containerd-stress
bin/ctr
bin/containerd-shim-runc-v2
bin/containerd-shim-runc-v1
bin/containerd
```



解压缩

```bash
tar Cxzvf /usr/local containerd-${CONTAINERD_VERSION}-linux-${ARCHITECTURE}.tar.gz
```



使用systemd管理containerd

下载文件

```shell
curl https://raw.githubusercontent.com/containerd/containerd/main/containerd.service -o /usr/lib/systemd/system/containerd.service
```



`containerd.service` 文件内容如下

```bash
# Copyright The containerd Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target local-fs.target

[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd

Type=notify
Delegate=yes
KillMode=process
Restart=always
RestartSec=5

# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNPROC=infinity
LimitCORE=infinity

# Comment TasksMax if your systemd version does not supports it.
# Only systemd 226 and above support this version.
TasksMax=infinity
OOMScoreAdjust=-999

[Install]
WantedBy=multi-user.target
```



重新加载 systemd 的配置并设置containerd服务开机自启

```shell
systemctl daemon-reload
systemctl enable --now containerd
```



#### 安装runc

[runc github地址](https://github.com/opencontainers/runc)

下载安装包

```bash
export RUNC_VERSION=1.1.12
export ARCHITECTURE=arm64
wget https://github.com/opencontainers/runc/releases/download/v${RUNC_VERSION}/runc.${ARCHITECTURE}
```



安装

```bash
install -m 755 runc.${ARCHITECTURE} /usr/local/sbin/runc
```



验证

```bash
$ runc -v
runc version 1.1.12
commit: v1.1.12-0-g51d5e946
spec: 1.0.2-dev
go: go1.20.13
libseccomp: 2.5.4
```



#### 安装CNI插件

[CNI插件github地址](https://github.com/containernetworking/plugins)

下载安装包

```bash
export CNI_VERSION=1.5.0
export ARCHITECTURE=arm64
wget https://github.com/containernetworking/plugins/releases/download/v${CNI_VERSION}/cni-plugins-linux-${ARCHITECTURE}-v${CNI_VERSION}.tgz
```



安装包内容如下

```bash
$ tar tf cni-plugins-linux-${ARCHITECTURE}-v${CNI_VERSION}.tgz
./
./dhcp
./loopback
./README.md
./bandwidth
./ipvlan
./vlan
./static
./host-device
./LICENSE
./bridge
./dummy
./tuning
./vrf
./tap
./portmap
./firewall
./ptp
./host-local
./macvlan
./sbr
```



解压缩

```bash
tar Cxzvf /usr/local/bin cni-plugins-linux-${ARCHITECTURE}-v${CNI_VERSION}.tgz
```





### 配置containerd

#### 创建containerd配置文件

[官方说明文档](https://github.com/containerd/containerd/blob/main/docs/getting-started.md#advanced-topics)

```shell
mkdir -p /etc/containerd && containerd config default > /etc/containerd/config.toml
```



#### 配置 systemd group 驱动

:::tip 说明

当 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 是初始化系统时， **不** 推荐使用 `cgroupfs` 驱动，因为 systemd 期望系统上只有一个 cgroup 管理器。 此外，如果你使用 [cgroup v2](https://kubernetes.io/zh-cn/docs/concepts/architecture/cgroups)， 则应用 `systemd` cgroup 驱动取代 `cgroupfs`。

当某个 Linux 系统发行版使用 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 作为其初始化系统时，初始化进程会生成并使用一个 root 控制组（`cgroup`），并充当 cgroup 管理器。

systemd 与 cgroup 集成紧密，并将为每个 systemd 单元分配一个 cgroup。 因此，如果你 `systemd` 用作初始化系统，同时使用 `cgroupfs` 驱动，则系统中会存在两个不同的 cgroup 管理器。

同时存在两个 cgroup 管理器将造成系统中针对可用的资源和使用中的资源出现两个视图。某些情况下， 将 kubelet 和容器运行时配置为使用 `cgroupfs`、但为剩余的进程使用 `systemd` 的那些节点将在资源压力增大时变得不稳定。

当 systemd 是选定的初始化系统时，缓解这个不稳定问题的方法是针对 kubelet 和容器运行时将 `systemd` 用作 cgroup 驱动。

:::



修改 `/etc/containerd/config.toml`

```shell
修改
    SystemdCgroup = false

修改为
    SystemdCgroup = true
```



用如下命令修改

```bash
sed -i.bak 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```



#### 修改 pause 镜像地址

:::tip 说明

在 `/etc/containerd/config.toml` 配置文件中，pause镜像的默认地址是 `registry.k8s.io/pause:3.9`，由于某些特殊原因，需要修改这个镜像的地址，可以使用ucloud提供的加速地址

`uhub.service.ucloud.cn/996.icu/pause:3.9` 或者阿里云提供的加速地址 `registry.aliyuncs.com/k8sxio/pause:3.9`

:::

```shell
[plugins."io.containerd.grpc.v1.cri"]
  ......
  sandbox_image = "registry.k8s.io/pause:3.9"
```



用如下命令修改

```shell
sed -i 's#registry.k8s.io#registry.aliyuncs.com/k8sxio#' /etc/containerd/config.toml
```



#### 配置containerd镜像仓库加速

[containerd官方文档](https://github.com/containerd/containerd/blob/main/docs/hosts.md)

[阿里云官方文档](https://help.aliyun.com/zh/acr/user-guide/accelerate-the-pulls-of-docker-official-images?spm=5176.28426678.J_HeJR_wZokYt378dwP-lLl.261.21795181n1ykLy&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@60750.S_BB1@bl+BB2@bl+RQW@ag0+os0.ID_60750-RL_containerd%E9%95%9C%E5%83%8F%E4%BB%93%E5%BA%93%E5%8A%A0%E9%80%9F-LOC_search~UND~helpdoc~UND~item-OR_ser-V_3-P0_0)

##### 修改配置文件

修改 `/etc/containerd/config.toml` ，修改 `config_path` ，新增 `/etc/containerd/certs.d`

```yaml
[plugins."io.containerd.grpc.v1.cri".registry]
      config_path = "/etc/containerd/certs.d"
```



##### 重启containerd

```shell
systemctl restart containerd
```



##### 创建目录

```bash
mkdir -p /etc/containerd/certs.d/docker.io
```



##### 创建 `hosts.toml` 文件并写入以下内容

```bash
cat > /etc/containerd/certs.d/docker.io/hosts.toml << 'EOF'
server = "https://registry-1.docker.io"

[host."https://bqr1dr1n.mirror.aliyuncs.com"]
  capabilities = ["pull", "resolve", "push"]
EOF
```



##### 验证镜像下载加速

:::tip 说明

使用 `ctr` 命令验证下载加速需要手动指定  `--hosts-dir` 

使用 `--debug=true` 可以查看具体信息，其中 `DEBU[0000] resolving                                     host=bqr1dr1n.mirror.aliyuncs.com` 信息就表明下载加速走的是配置的地址

:::

```bash
$ ctr -n k8s.io --debug=true i pull --hosts-dir=/etc/containerd/certs.d docker.io/library/centos:centos7.9.2009
DEBU[0000] fetching                                      image="docker.io/library/centos:centos7.9.2009"
DEBU[0000] loading host directory                        dir=/etc/containerd/certs.d/docker.io
DEBU[0000] resolving                                     host=bqr1dr1n.mirror.aliyuncs.com
DEBU[0000] do request                                    host=bqr1dr1n.mirror.aliyuncs.com request.header.accept="application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json, */*" request.header.user-agent=containerd/v1.7.17 request.method=HEAD url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/centos7.9.2009?ns=docker.io"
DEBU[0015] fetch response received                       host=bqr1dr1n.mirror.aliyuncs.com response.header.content-length=1199 response.header.content-type=application/vnd.docker.distribution.manifest.list.v2+json response.header.date="Fri, 24 May 2024 12:37:17 GMT" response.header.docker-content-digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" response.header.docker-distribution-api-version=registry/2.0 response.header.etag="\"sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987\"" response.status="200 OK" url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/centos7.9.2009?ns=docker.io"
DEBU[0015] resolved                                      desc.digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" host=bqr1dr1n.mirror.aliyuncs.com
DEBU[0015] loading host directory                        dir=/etc/containerd/certs.d/docker.io
DEBU[0015] fetch                                         digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" mediatype=application/vnd.docker.distribution.manifest.list.v2+json size=1199
DEBU[0015] do request                                    digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" mediatype=application/vnd.docker.distribution.manifest.list.v2+json request.header.accept="application/vnd.docker.distribution.manifest.list.v2+json, */*" request.header.user-agent=containerd/v1.7.17 request.method=GET size=1199 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987?ns=docker.io"
DEBU[0016] fetch response received                       digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" mediatype=application/vnd.docker.distribution.manifest.list.v2+json response.header.content-length=1199 response.header.content-type=application/vnd.docker.distribution.manifest.list.v2+json response.header.date="Fri, 24 May 2024 12:37:18 GMT" response.header.docker-content-digest="sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987" response.header.docker-distribution-api-version=registry/2.0 response.header.etag="\"sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987\"" response.status="200 OK" size=1199 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987?ns=docker.io"
DEBU[0016] fetch                                         digest="sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87" mediatype=application/vnd.docker.distribution.manifest.v2+json size=530
DEBU[0016] do request                                    digest="sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87" mediatype=application/vnd.docker.distribution.manifest.v2+json request.header.accept="application/vnd.docker.distribution.manifest.v2+json, */*" request.header.user-agent=containerd/v1.7.17 request.method=GET size=530 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87?ns=docker.io"
DEBU[0016] fetch response received                       digest="sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87" mediatype=application/vnd.docker.distribution.manifest.v2+json response.header.content-length=530 response.header.content-type=application/vnd.docker.distribution.manifest.v2+json response.header.date="Fri, 24 May 2024 12:37:18 GMT" response.header.docker-content-digest="sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87" response.header.docker-distribution-api-version=registry/2.0 response.header.etag="\"sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87\"" response.status="200 OK" size=530 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/manifests/sha256:864a7acea4a5e8fa7a4d83720fbcbadbe38b183f46f3600e04a3f8c1d961ed87?ns=docker.io"
DEBU[0016] fetch                                         digest="sha256:6717b8ec66cd6add0272c6391165585613c31314a43ff77d9751b53010e531ec" mediatype=application/vnd.docker.image.rootfs.diff.tar.gzip size=108374945
DEBU[0016] fetch                                         digest="sha256:dfc30428e1631ce2adb2a7978c667f88dc033a3c2991943f5e2307d857ed0370" mediatype=application/vnd.docker.container.image.v1+json size=2770
DEBU[0016] do request                                    digest="sha256:dfc30428e1631ce2adb2a7978c667f88dc033a3c2991943f5e2307d857ed0370" mediatype=application/vnd.docker.container.image.v1+json request.header.accept="application/vnd.docker.container.image.v1+json, */*" request.header.user-agent=containerd/v1.7.17 request.method=GET size=2770 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/blobs/sha256:dfc30428e1631ce2adb2a7978c667f88dc033a3c2991943f5e2307d857ed0370?ns=docker.io"
DEBU[0016] do request                                    digest="sha256:6717b8ec66cd6add0272c6391165585613c31314a43ff77d9751b53010e531ec" mediatype=application/vnd.docker.image.rootfs.diff.tar.gzip request.header.accept="application/vnd.docker.image.rootfs.diff.tar.gzip, */*" request.header.user-agent=containerd/v1.7.17 request.method=GET size=108374945 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/blobs/sha256:6717b8ec66cd6add0272c6391165585613c31314a43ff77d9751b53010e531ec?ns=docker.io"
DEBU[0018] fetch response received                       digest="sha256:dfc30428e1631ce2adb2a7978c667f88dc033a3c2991943f5e2307d857ed0370" mediatype=application/vnd.docker.container.image.v1+json response.header.accept-ranges=bytes response.header.connection=keep-alive response.header.content-length=2770 response.header.content-type=application/octet-stream response.header.date="Fri, 24 May 2024 12:37:20 GMT" response.header.etag="\"858C8D660CF7A6AD53DD55B2FF6A70CC-1\"" response.header.last-modified="Thu, 16 Sep 2021 04:27:31 GMT" response.header.server=AliyunOSS response.header.x-oss-hash-crc64ecma=17094106414512831035 response.header.x-oss-object-type=Multipart response.header.x-oss-request-id=66508A00EAC5D23836F0034C response.header.x-oss-server-time=132 response.header.x-oss-storage-class=Standard response.status="200 OK" size=2770 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/blobs/sha256:dfc30428e1631ce2adb2a7978c667f88dc033a3c2991943f5e2307d857ed0370?ns=docker.io"
DEBU[0018] fetch response received                       digest="sha256:6717b8ec66cd6add0272c6391165585613c31314a43ff77d9751b53010e531ec" mediatype=application/vnd.docker.image.rootfs.diff.tar.gzip response.header.accept-ranges=bytes response.header.connection=keep-alive response.header.content-length=108374945 response.header.content-type=application/octet-stream response.header.date="Fri, 24 May 2024 12:37:20 GMT" response.header.etag="\"76ADAA83857B8D1557F847298BECEEA8-10\"" response.header.last-modified="Sun, 15 Nov 2020 06:09:39 GMT" response.header.server=AliyunOSS response.header.x-oss-hash-crc64ecma=10643295449866978854 response.header.x-oss-object-type=Multipart response.header.x-oss-request-id=66508A006F20953038FEEC41 response.header.x-oss-server-time=175 response.header.x-oss-storage-class=Standard response.status="200 OK" size=108374945 url="https://bqr1dr1n.mirror.aliyuncs.com/v2/library/centos/blobs/sha256:6717b8ec66cd6add0272c6391165585613c31314a43ff77d9751b53010e531ec?ns=docker.io"
DEBU[0317] unpacking                                     image="docker.io/library/centos:centos7.9.2009"
unpacking linux/arm64/v8 sha256:9d4bcbbb213dfd745b58be38b13b996ebb5ac315fe75711bd618426a630e0987...
done: 1.495863023s	
```



### 安装其他工具

#### 安装cri-tools（可选）

[cri-tools github地址](https://github.com/kubernetes-sigs/cri-tools)

[cri-tools官方文档](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)

下载安装包

```bash
export CRICTL_VERSION=1.30.0
export ARCHITECTURE=arm64
wget https://github.com/kubernetes-sigs/cri-tools/releases/download/v${CRICTL_VERSION}/crictl-v${CRICTL_VERSION}-linux-${ARCHITECTURE}.tar.gz
```



解压缩

```bash
tar Cxzvf /usr/local/bin crictl-v${CRICTL_VERSION}-linux-${ARCHITECTURE}.tar.gz
```



执行命令有警告

```bash
$ crictl images
WARN[0000] image connect using default endpoints: [unix:///run/containerd/containerd.sock unix:///run/crio/crio.sock unix:///var/run/cri-dockerd.sock]. As the default settings are now deprecated, you should set the endpoint instead. 
```



解决方法

因为使用的是containerd，因此需要将容器运行时修改为containerd，修改完成后就可以成功执行命令了

```shell
crictl config --set runtime-endpoint=unix:///run/containerd/containerd.sock --set image-endpoint=unix:///run/containerd/containerd.sock
```



`/etc/crictl.yaml` 文件内容最终如下

```yaml
$ cat /etc/crictl.yaml 
runtime-endpoint: "unix:///run/containerd/containerd.sock"
image-endpoint: "unix:///run/containerd/containerd.sock"
timeout: 0
debug: false
pull-image-on-create: false
disable-pull-on-run: false
```



配置 `crictl` 命令补全

```shell
echo "source <(crictl completion bash)" >> ~/.bashrc
source ~/.bashrc
```



#### 安装nerdctl（可选）

[nerdctl github地址](https://github.com/containerd/nerdctl)

:::tip 说明

`nerdctl` 是一个适用于containerd的dcoker兼容CLI

安装containerd后需要使用 `ctr` 命令管理操作容器，但是操作命令与docker相差比较大， `nerdctl` 就很好的解决了这个问题，既能在使用containerd的同时又能使用原先docker命令的用法 

:::



下载安装包

:::tip 说明

如果没有安装 containerd，则可以下载 `nerdctl-full-\<VERSION>-linux-<ARCHITECTURE>.tar.gz` 包进行安装，并且 `nerdctl-full` 这个包是与containerd版本一一对应的，即containerd发布一个版本后，`nerdctl-full` 也随即发布一个版本，虽然2者版本号不一致，但是是互相对应的

:::

```bash
# 这里安装的containerd版本为1.7.17
export NERDCTL_VERSION=1.7.6
export ARCHITECTURE=arm64
wget https://github.com/containerd/nerdctl/releases/download/v${NERDCTL_VERSION}/nerdctl-${NERDCTL_VERSION}-linux-${ARCHITECTURE}.tar.gz
```



解压缩

:::tip 说明

压缩包内容为 `nerdctl` 命令以及 `containerd-rootless-setuptool.sh` 和 `containerd-rootless.sh` ，均有执行权限

```bash
$ tar tf nerdctl-${NERDCTL_VERSION}-linux-${ARCHITECTURE}.tar.gz 
nerdctl
containerd-rootless-setuptool.sh
containerd-rootless.sh
```

:::

```shell
tar xf nerdctl-${NERDCTL_VERSION}-linux-${ARCHITECTURE}.tar.gz 
```



拷贝二进制文件

```shell
mv nerdctl /usr/local/bin
```



配置 `nerdctl` 命令补全

```shell
echo "source <(nerdctl completion bash)" >> ~/.bashrc
source ~/.bashrc
```



##### 安装nerdctl其他组件

###### [CNI plugins CNI 插件 ](https://github.com/containernetworking/plugins) 

此插件用于执行 `nerdctl run` 命令，强烈建议使用 v1.1.0 或更高版本。旧版本需要额外的 CNI 隔离插件来隔离桥接网络 



###### [BuildKit 构建套件 ](https://github.com/moby/buildkit) （可选）

此插件用于执行 `nerdctl build` ，强烈建议使用 v0.11.0 或更高版本。某些功能（例如使用 `nerdctl system prune`）不适用于旧版本。



BuildKit 守护程序需要运行，参考 [有关设置 BuildKit 的文档](https://github.com/containerd/nerdctl/blob/main/docs/build.md) ，否则运行 `nerdctl build` 会报错如下

```bash
$ nerdctl build
ERRO[0000] `buildctl` needs to be installed and `buildkitd` needs to be running, see https://github.com/moby/buildkit  error="failed to ping to host unix:///run/buildkit-default/buildkitd.sock: exec: \"buildctl\": executable file not found in $PATH\nfailed to ping to host unix:///run/buildkit/buildkitd.sock: exec: \"buildctl\": executable file not found in $PATH"
FATA[0000] no buildkit host is available, tried 2 candidates: failed to ping to host unix:///run/buildkit-default/buildkitd.sock: exec: "buildctl": executable file not found in $PATH
failed to ping to host unix:///run/buildkit/buildkitd.sock: exec: "buildctl": executable file not found in $PATH 
```



下载安装包

```shell
export BUILDKIT_VERSION=0.13.2
export ARCHITECTURE=arm64
wget https://github.com/moby/buildkit/releases/download/v${BUILDKIT_VERSION}/buildkit-v${BUILDKIT_VERSION}.linux-${ARCHITECTURE}.tar.gz
```



解压缩

:::tip 说明

压缩包内容如下

```bash
$ tar tf buildkit-v${BUILDKIT_VERSION}.linux-${ARCHITECTURE}.tar.gz
bin/
bin/buildctl
bin/buildkit-cni-bridge
bin/buildkit-cni-firewall
bin/buildkit-cni-host-local
bin/buildkit-cni-loopback
bin/buildkit-qemu-arm
bin/buildkit-qemu-i386
bin/buildkit-qemu-mips64
bin/buildkit-qemu-mips64el
bin/buildkit-qemu-ppc64le
bin/buildkit-qemu-riscv64
bin/buildkit-qemu-s390x
bin/buildkit-qemu-x86_64
bin/buildkit-runc
bin/buildkitd
```

:::

```bash
tar xf buildkit-v${BUILDKIT_VERSION}.linux-${ARCHITECTURE}.tar.gz
```



拷贝 `buildkitd` 命令

```shell
cp bin/buildkitd /usr/local/bin
```



启动 `buildkitd`

```shell
buildkitd &
```



`buildkitd` 启动成功后就可以执行 `nerdctl build` 命令了



###### [RootlessKit](https://github.com/rootless-containers/rootlesskit) and [slirp4netns](https://github.com/rootless-containers/slirp4netns) （可选）

RootlessKit 需要是 v0.10.0 或更高版本。推荐v0.14.1或更高版本。

slirp4netns 需要是 v0.4.0 或更高版本。推荐v1.1.7或更高版本。

此插件用于 `rootless` 模式，可以参考[docker官方对rootless模式的说明](https://docs.docker.com/engine/security/rootless/)





:::info 说明

以上3个插件包含在 `nerdctl-full-<VERSION>-<OS>-<ARCH>.tar.gz` 中，但不包含在 `nerdctl-<VERSION>-<OS>-<ARCH>.tar.gz` 中

:::





#### docker和containerd常用命令对比

| 命令                 | docker           | crictl            | nerdctl           | ctr                      |
| -------------------- | ---------------- | ----------------- | ----------------- | ------------------------ |
| 查看容器列表         | `docker ps`      | `crictl ps`       | `nerdctl ps`      | `ctr -n k8s.io c ls`     |
| 查看容器详情         | `docker inspect` | `crictl inspect`  | `nerdctl inspect` | `ctr -n k8s.io c info`   |
| 查看容器日志         | `docker logs`    | `crictl logs`     | `nerdctl logs`    | 无                       |
| 容器内执行命令       | `docker exec`    | `crictl exec`     | `nerdctl exec`    | 无                       |
| 挂载容器             | `docker attach`  | `crictl attach`   | `nerdctl attach`  | 无                       |
| 显示容器资源使用情况 | `docker stats`   | `crictl stats`    | `nerdctl stats`   | 无                       |
| 创建容器             | `docker create`  | `crictl create`   | `nerdctl create`  | `ctr -n k8s.io c create` |
| 启动容器             | `docker start`   | `crictl start`    | `nerdctl start`   | `ctr -n k8s.io run`      |
| 停止容器             | `docker stop`    | `crictl stop`     | `nerdctl stop`    | 无                       |
| 删除容器             | `docker rm`      | `crictl rm`       | `nerdctl rm`      | `ctr -n k8s.io c del`    |
| 查看镜像列表         | `docker images`  | `crictl images`   | `nerdctl images`  | `ctr -n k8s.io i ls`     |
| 查看镜像详情         | `docker inspect` | `crictl inspecti` | `nerdctl inspect` | 无                       |
| 拉取镜像             | `docker pull`    | `crictl pull`     | `nerdctl pull`    | `ctr -n k8s.io i pull`   |
| 推送镜像             | `docker push`    | 无                | `nerdctl push`    | `ctr -n k8s.io i push`   |
| 删除镜像             | `docker rmi`     | `crictl rmi`      | `nerdctl rmi`     | `ctr -n k8s.io i rm`     |
| 查看Pod列表          | 无               | `crictl pods`     | 无                | 无                       |
| 查看Pod详情          | 无               | `crictl inspectp` | 无                | 无                       |
| 启动Pod              | 无               | `crictl runp`     | 无                | 无                       |
| 停止Pod              | 无               | `crictl stop`     | 无                | 无                       |



## 安装kubeadm、kubelet、kubectl

### 配置yum源

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-kubeadm-kubelet-and-kubectl)

官方yum源

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```



阿里云yum源

```bash
cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/repodata/repomd.xml.key
EOF
```





### 安装 kubelet、kubeadm 和 kubectl，并启用 kubelet 以确保它在启动时自动启动

查看可安装的版本

```shell
yum list kubeadm --showduplicates
```



指定安装版本

```bash
export K8S_VERSION=1.28.3
yum -y install kubelet-${K8S_VERSION} kubeadm-${K8S_VERSION} kubectl-${K8S_VERSION} --disableexcludes=kubernetes
systemctl enable --now kubelet
```



安装最新版

```bash
yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
systemctl enable --now kubelet
```



### 设置 `kubectl` 命令补全

```shell
yum -y install bash-completion 
echo "source <(kubectl completion bash)" >> ~/.bashrc && source ~/.bashrc
```



## 使用kubeadm创建集群

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)



### 初始化master节点

可执行 `kubeadm config print init-defaults` 查看默认配置

```yaml
$ kubeadm config print init-defaults
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
  advertiseAddress: 1.2.3.4
  bindPort: 6443
nodeRegistration:
  criSocket: unix:///var/run/containerd/containerd.sock
  imagePullPolicy: IfNotPresent
  name: node
  taints: null
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
imageRepository: registry.k8s.io
kind: ClusterConfiguration
kubernetesVersion: 1.30.0
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
scheduler: {}
```



#### 初始化方式

##### 配置文件方式

:::tip 说明

初始化方式有命令行和配置文件方式2种

配置文件方式可以参考[官方说明文档](https://pkg.go.dev/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta3) ，如下是官方示例完整配置文件

```yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
bootstrapTokens:
- token: "9a08jv.c0izixklcxtmnze7"
  description: "kubeadm bootstrap token"
  ttl: "24h"
- token: "783bde.3f89s0fje9f38fhf"
  description: "another bootstrap token"
  usages:
  - authentication
  - signing
  groups:
  - system:bootstrappers:kubeadm:default-node-token
nodeRegistration:
  name: "ec2-10-100-0-1"
  criSocket: "unix:///var/run/containerd/containerd.sock"
  taints:
  - key: "kubeadmNode"
    value: "someValue"
    effect: "NoSchedule"
  kubeletExtraArgs:
    v: 4
  ignorePreflightErrors:
  - IsPrivilegedUser
  imagePullPolicy: "IfNotPresent"
localAPIEndpoint:
  advertiseAddress: "10.100.0.1"
  bindPort: 6443
certificateKey: "e6a2eb8581237ab72a4f494f30285ec12a9694d750b9785706a83bfcbbbd2204"
skipPhases:
- addon/kube-proxy
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
etcd:
  # one of local or external
  local:
    imageRepository: "registry.k8s.io"
    imageTag: "3.2.24"
    dataDir: "/var/lib/etcd"
    extraArgs:
      listen-client-urls: "http://10.100.0.1:2379"
    serverCertSANs:
    -  "ec2-10-100-0-1.compute-1.amazonaws.com"
    peerCertSANs:
    - "10.100.0.1"
  # external:
    # endpoints:
    # - "10.100.0.1:2379"
    # - "10.100.0.2:2379"
    # caFile: "/etcd/kubernetes/pki/etcd/etcd-ca.crt"
    # certFile: "/etcd/kubernetes/pki/etcd/etcd.crt"
    # keyFile: "/etcd/kubernetes/pki/etcd/etcd.key"
networking:
  serviceSubnet: "10.96.0.0/16"
  podSubnet: "10.244.0.0/24"
  dnsDomain: "cluster.local"
kubernetesVersion: "v1.21.0"
controlPlaneEndpoint: "10.100.0.1:6443"
apiServer:
  extraArgs:
    authorization-mode: "Node,RBAC"
  extraVolumes:
  - name: "some-volume"
    hostPath: "/etc/some-path"
    mountPath: "/etc/some-pod-path"
    readOnly: false
    pathType: File
  certSANs:
  - "10.100.1.1"
  - "ec2-10-100-0-1.compute-1.amazonaws.com"
  timeoutForControlPlane: 4m0s
controllerManager:
  extraArgs:
    "node-cidr-mask-size": "20"
  extraVolumes:
  - name: "some-volume"
    hostPath: "/etc/some-path"
    mountPath: "/etc/some-pod-path"
    readOnly: false
    pathType: File
scheduler:
  extraArgs:
    address: "10.100.0.1"
  extraVolumes:
  - name: "some-volume"
    hostPath: "/etc/some-path"
    mountPath: "/etc/some-pod-path"
    readOnly: false
    pathType: File
certificatesDir: "/etc/kubernetes/pki"
imageRepository: "registry.k8s.io"
clusterName: "example-cluster"
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
# kubelet specific options here
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
# kube-proxy specific options here
```

:::

指定配置文件方式

```sh
kubeadm init --config kubeadm.yaml 
```



`kubeadm.yaml ` 文件内容

```yaml
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
  advertiseAddress: 10.0.0.10  # 指定master节点内网IP
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
mode: iptables  # kube-proxy 模式

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
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: 1.30.1
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
```





##### 命令行方式

:::tip 说明

初始化前也可以执行 `kubeadm config images pull`  把需要的镜像先拉取下来

```shell
kubeadm config images pull --image-repository registry.aliyuncs.com/google_containers
```

:::

命令行方式

```bash
kubeadm init \
--apiserver-advertise-address=10.0.0.12 \
--image-repository registry.aliyuncs.com/google_containers \
--kubernetes-version v1.30.0 \
--service-cidr=10.96.0.0/16 \
--pod-network-cidr=10.244.0.0/16
```





完整输出如下

```bash
[init] Using Kubernetes version: v1.30.1
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [k8s-master01 kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 10.0.0.10]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [k8s-master01 localhost] and IPs [10.0.0.10 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [k8s-master01 localhost] and IPs [10.0.0.10 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "super-admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests"
[kubelet-check] Waiting for a healthy kubelet. This can take up to 4m0s
[kubelet-check] The kubelet is healthy after 502.42734ms
[api-check] Waiting for a healthy API server. This can take up to 4m0s
[api-check] The API server is healthy after 4.003326169s
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the labels: [node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: abcdef.0123456789abcdef
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
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

kubeadm join 10.0.0.10:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:8a7e980fb917404682f8cbf5e09d2d822c7a0e541cddeadba28907bffbbd5aaa 
```



#### `kubeadm init` 选项

[官方文档](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-init/)

| 选项                                 | 说明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| --apiserver-advertise-address string | API 服务器所公布的其正在监听的 IP 地址。如果未设置，则使用默认网络接口。 |
| --apiserver-bind-port int32          | API 服务器绑定的端口。默认值：6443                           |
| --apiserver-cert-extra-sans strings  | 用于 API Server 服务证书的可选附加主题备用名称（SAN）。可以是 IP 地址和 DNS 名称。 |
| --cert-dir string                    | 保存和存储证书的路径。默认值 `/etc/kubernetes/pki`           |
| --certificate-key string             | 用于加密 kubeadm-certs Secret 中的控制平面证书的密钥。       |
| --config string                      | kubeadm 配置文件的路径。                                     |
| --control-plane-endpoint string      | 为控制平面指定一个稳定的 IP 地址或 DNS 名称。                |
| --cri-socket string                  | 要连接的 CRI 套接字的路径。如果为空，则 kubeadm 将尝试自动检测此值； 仅当安装了多个 CRI 或具有非标准 CRI 套接字时，才使用此选项。 |
| --dry-run                            | 不做任何更改；只输出将要执行的操作。                         |
| --feature-gates string               | 一组用来描述各种功能特性的键值（key=value）对。选项是：EtcdLearnerMode=true  PublicKeysECDSA=true  RootlessControlPlane=true  UpgradeAddonsBeforeControlPlane=true |
| -h, --help                           | init 操作的帮助命令。                                        |
| --ignore-preflight-errors strings    | 错误将显示为警告的检查列表；例如：`IsPrivilegedUser,Swap`。取值为 `all`  时将忽略检查中的所有错误。 |
| --image-repository string            | 选择用于拉取控制平面镜像的容器仓库。默认值`registry.k8s.io`  |
| --kubernetes-version string          | 为控制平面选择一个特定的 Kubernetes 版本。默认值：`stable-1` |
| --node-name string                   | 指定节点的名称。                                             |
| --patches string                     | 它包含名为 `target[suffix][+patchtype].extension` 的文件的目录的路径。 例如，`kube-apiserver0+merge.yaml`或仅仅是 `etcd.json`。 `target` 可以是 `kube-apiserver`、`kube-controller-manager`、`kube-scheduler`、`etcd`、`kubeletconfiguration` 之一。 `patchtype` 可以是 `strategic`、`merge` 或者 `json` 之一， 并且它们与 kubectl 支持的补丁格式相同。 默认<br/>的 `patchtype` 是 `strategic`。 `extension` 必须是`json` 或`yaml`。 `suffix` 是一个可选字符串，可用于确定首先按字母顺序应用哪些补丁。 |
| --pod-network-cidr string            | 指明 Pod 网络可以使用的 IP 地址段。如果设置了这个参数，控制平面将会为每一个节点自动分配 CIDR。 |
| --service-cidr string                | 为服务的虚拟 IP 地址另外指定 IP 地址段。默认值：`10.96.0.0/12` |
| --service-dns-domain string          | 为服务另外指定域名，例如：`myorg.internal`。 默认值：`cluster.local` |
| --skip-certificate-key-print         | 不要打印用于加密控制平面证书的密钥。                         |
| --skip-phases strings                | 要跳过的阶段列表。                                           |
| --skip-token-print                   | 跳过打印 `kubeadm init` 生成的默认引导令牌。                 |
| --token string                       | 这个令牌用于建立控制平面节点与工作节点间的双向通信。 格式为 `[a-z0-9]{6}.[a-z0-9]{16}` - 示例：`abcdef.0123456789abcdef` |
| --token-ttl duration                 | 令牌被自动删除之前的持续时间（例如 1s，2m，3h）。如果设置为 `0`，则令牌将永不过期。 |
| --upload-certs                       | 将控制平面证书上传到 kubeadm-certs Secret。                  |



**`Init` 命令的工作流程**

1.在做出变更前运行一系列的预检项来验证系统状态。一些检查项目仅仅触发警告， 其它的则会被视为错误并且退出 kubeadm，除非问题得到解决或者用户指定了 `--ignore-preflight-errors=<错误列表>` 参数。

2.生成一个自签名的 CA 证书来为集群中的每一个组件建立身份标识。 用户可以通过将其放入 `--cert-dir` 配置的证书目录中（默认为 `/etc/kubernetes/pki`） 来提供他们自己的 CA 证书以及/或者密钥。 APIServer 证书将为任何 `--apiserver-cert-extra-sans` 参数值提供附加的 SAN 条目，必要时将其小写。

3.将 kubeconfig 文件写入 `/etc/kubernetes/` 目录以便 kubelet、控制器管理器和调度器用来连接到 API 服务器，它们每一个都有自己的身份标识，同时生成一个名为 `admin.conf` 的独立的 kubeconfig 文件，用于管理操作。

4.为 API 服务器、控制器管理器和调度器生成静态 Pod 的清单文件。假使没有提供一个外部的 etcd 服务的话，也会为 etcd 生成一份额外的静态 Pod 清单文件

静态 Pod 的清单文件被写入到 `/etc/kubernetes/manifests` 目录； kubelet 会监视这个目录以便在系统启动的时候创建 Pod。

一旦控制平面的 Pod 都运行起来，`kubeadm init` 的工作流程就继续往下执行。

5.对控制平面节点应用标签和污点标记以便不会在它上面运行其它的工作负载。

6.生成令牌，将来其他节点可使用该令牌向控制平面注册自己。如 [kubeadm token](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-token/) 文档所述，用户可以选择通过 `--token` 提供令牌。

7.为了使得节点能够遵照[启动引导令牌](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/bootstrap-tokens/)和 [TLS 启动引导](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/) 这两份文档中描述的机制加入到集群中，kubeadm 会执行所有的必要配置：

- 创建一个 ConfigMap 提供添加集群节点所需的信息，并为该 ConfigMap 设置相关的 RBAC 访问规则。
- 允许启动引导令牌访问 CSR 签名 API。
- 配置自动签发新的 CSR 请求。

更多相关信息，请查看 [kubeadm join](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-join/)。

8.通过 API 服务器安装一个 DNS 服务器 (CoreDNS) 和 kube-proxy 附加组件。 在 Kubernetes v1.11 和更高版本中，CoreDNS 是默认的 DNS 服务器。 请注意，尽管已部署 DNS 服务器，但直到安装 CNI 时才调度它。



:::caution 警告

从 v1.18 开始，在 kubeadm 中使用 kube-dns 的支持已被废弃，并已在 v1.21 版本中移除。

:::



### 拷贝 `kubeconfig` 文件

```shell
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```



### 添加node节点到集群

[kubeadm join 官方文档](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-join/)

```bash
kubeadm join 10.0.0.10:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:8a7e980fb917404682f8cbf5e09d2d822c7a0e541cddeadba28907bffbbd5aaa
```



在node节点执行 `kubeadm join` 输出如下

```bash
$ kubeadm join 10.0.0.10:6443 --token abcdef.0123456789abcdef \
> --discovery-token-ca-cert-hash sha256:8a7e980fb917404682f8cbf5e09d2d822c7a0e541cddeadba28907bffbbd5aaa
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-check] Waiting for a healthy kubelet. This can take up to 4m0s
[kubelet-check] The kubelet is healthy after 502.113877ms
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```



#### 查看token

:::tip 说明

默认情况下，令牌会在 24 小时后过期。如果要在当前令牌过期后将节点加入集群， 则可以通过在控制平面节点上运行以下命令来创建新令牌：

```bash
kubeadm token create
```

:::

```shell
$ kubeadm token list
TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION                                                EXTRA GROUPS
abcdef.0123456789abcdef   23h         2024-05-25T09:32:35Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
```



#### 查看sha256

```shell
$ openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
8a7e980fb917404682f8cbf5e09d2d822c7a0e541cddeadba28907bffbbd5aaa
```



#### 同时查看token和sha256

:::caution 注意

执行此命令会重新创建一个token

:::

```bash
$ kubeadm token create --print-join-command
kubeadm join 10.0.0.10:6443 --token knn1yv.a0qmgazqdo3mpgb2 --discovery-token-ca-cert-hash sha256:70bd8cbebb1209e556866de47a97a627dfb8fac3a7821702bcb48ebeffffb78c 
```



如果想要在master节点上进行调度pod，例如单机 Kubernetes 集群，应该运行如下命令

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```



### 安装网络插件

[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network)

可以在这里查看k8s [支持的网络插件](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/addons/#networking-and-network-policy)

:::caution 注意

**你必须部署一个基于 Pod 网络插件的 [容器网络接口](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/) (CNI)，以便你的 Pod 可以相互通信。 在安装网络之前，集群 DNS (CoreDNS) 将不会启动。**

```bash
$ kubectl get po -A
NAMESPACE     NAME                                   READY   STATUS    RESTARTS   AGE
kube-system   coredns-7b5944fdcf-dxw2r               0/1     Pending   0          10m
kube-system   coredns-7b5944fdcf-pdlqb               0/1     Pending   0          10m
kube-system   etcd-k8s-master01                      1/1     Running   1          10m
kube-system   kube-apiserver-k8s-master01            1/1     Running   1          10m
kube-system   kube-controller-manager-k8s-master01   1/1     Running   1          10m
kube-system   kube-proxy-9bzcn                       1/1     Running   0          7m32s
kube-system   kube-proxy-f98fd                       1/1     Running   0          10m
kube-system   kube-proxy-kpbt7                       1/1     Running   0          7m36s
kube-system   kube-proxy-r2bf7                       1/1     Running   0          7m31s
kube-system   kube-scheduler-k8s-master01            1/1     Running   1          10m
```



- 注意你的 Pod 网络不得与任何主机网络重叠： 如果有重叠，你很可能会遇到问题。 （如果你发现网络插件的首选 Pod 网络与某些主机网络之间存在冲突， 则应考虑使用一个合适的 CIDR 块来代替， 然后在执行 `kubeadm init` 时使用 `--pod-network-cidr` 参数并在你的网络插件的 YAML 中替换它）。

- 默认情况下，`kubeadm` 将集群设置为使用和强制使用 [RBAC](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/)（基于角色的访问控制）。 确保你的 Pod 网络插件支持 RBAC，以及用于部署它的清单也是如此。

- 如果要为集群使用 IPv6（双协议栈或仅单协议栈 IPv6 网络）， 请确保你的 Pod 网络插件支持 IPv6。 IPv6 支持已在 CNI [v0.6.0](https://github.com/containernetworking/cni/releases/tag/v0.6.0) 版本中添加。

:::



#### flannel

[flannnel github](https://github.com/flannel-io/flannel)



#### calico

[calico github](https://github.com/projectcalico/calico)

[calico官网](https://docs.tigera.io/)



##### 安装calico tigera-operator和自定义资源

:::caution 注意

在部署资源的时候，使用 `kubectl apply` 可能会报错如下，解决方法就是使用 `kubectl create`，可以查看这个 [issues](https://github.com/projectcalico/calico/issues/7826)

```bash
The CustomResourceDefinition "installations.operator.tigera.io" is invalid: metadata.annotations: Too long: must have at most 262144 bytes
```

:::

```sh
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/tigera-operator.yaml
```



##### 安装calico

:::caution 注意

`custom-resources.yaml` 文件中的pod网段默认是 `192.168.0.0/16` ，如果集群的pod网段不是 `192.168.0.0/16` 则需要修改

:::

```sh
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/custom-resources.yaml
```



### 完成安装

查看所有pod状态

```bash
$ kubectl get pod -A
NAMESPACE          NAME                                       READY   STATUS    RESTARTS   AGE
calico-apiserver   calico-apiserver-7647545445-2t5s8          1/1     Running   0          104s
calico-apiserver   calico-apiserver-7647545445-j7bq7          1/1     Running   0          104s
calico-system      calico-kube-controllers-594f57d65d-2n56s   1/1     Running   0          9m21s
calico-system      calico-node-2xcgw                          1/1     Running   0          9m21s
calico-system      calico-node-46kn6                          1/1     Running   0          9m21s
calico-system      calico-node-fmk4z                          1/1     Running   0          9m21s
calico-system      calico-node-mhmhj                          1/1     Running   0          9m21s
calico-system      calico-typha-74f979894f-57bkn              1/1     Running   0          9m19s
calico-system      calico-typha-74f979894f-5llqq              1/1     Running   0          9m21s
calico-system      csi-node-driver-jt88w                      2/2     Running   0          9m21s
calico-system      csi-node-driver-m9zqr                      2/2     Running   0          9m21s
calico-system      csi-node-driver-qhd55                      2/2     Running   0          9m21s
calico-system      csi-node-driver-s5w4r                      2/2     Running   0          9m21s
kube-system        coredns-7b5944fdcf-dxw2r                   1/1     Running   0          29m
kube-system        coredns-7b5944fdcf-pdlqb                   1/1     Running   0          29m
kube-system        etcd-k8s-master01                          1/1     Running   1          29m
kube-system        kube-apiserver-k8s-master01                1/1     Running   1          29m
kube-system        kube-controller-manager-k8s-master01       1/1     Running   1          29m
kube-system        kube-proxy-9bzcn                           1/1     Running   0          26m
kube-system        kube-proxy-f98fd                           1/1     Running   0          29m
kube-system        kube-proxy-kpbt7                           1/1     Running   0          26m
kube-system        kube-proxy-r2bf7                           1/1     Running   0          26m
kube-system        kube-scheduler-k8s-master01                1/1     Running   1          29m
tigera-operator    tigera-operator-76ff79f7fd-spclf           1/1     Running   0          12m
```



安装完网络插件后，当所有pod都为 `running` 状态后，集群所有节点状态才为 `Ready`

```bash
$ kubectl get no
NAME           STATUS   ROLES           AGE   VERSION
k8s-master01   Ready    control-plane   30m   v1.30.1
k8s-node01     Ready    <none>          27m   v1.30.1
k8s-node02     Ready    <none>          27m   v1.30.1
k8s-node03     Ready    <none>          27m   v1.30.1
```

