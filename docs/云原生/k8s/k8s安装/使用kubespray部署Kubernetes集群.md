# 使用 kubespray 部署 Kubernetes 集群

:::tip 说明
kubespray 是 CNCF 官方（kubernetes-sigs）维护的集群部署工具，本质是一套 **Ansible playbook**。适用场景：3 台起步的多节点生产级集群自动化部署。环境示例：Mac 作为控制机，3 台 Rocky 10 ARM 虚拟机（1 master + 2 worker）。
:::

## 原理：它是什么、怎么工作的

**kubespray 不是安装程序，是一大堆 Ansible 剧本（YAML 任务清单）。**

运行模式是**控制机 → SSH → 所有节点**：

```
你执行 ansible-playbook 的机器（控制机）
        │ SSH 并发连到每一台
        ├──► master  （被装：etcd + 控制平面 + kubelet）
        ├──► worker1 （被装：kubelet + 容器运行时）
        └──► worker2 （被装：kubelet + 容器运行时）
```

三个核心机制：

1. **Agentless（无代理）**：目标节点什么都不用装（有 Python 即可），Ansible 通过 SSH 登上去执行任务，跑完就断开，没有常驻 agent
2. **Role 编排**：`cluster.yml` 按顺序调用几十个 role（预处理 OS → 装 containerd → CFSSL 生成证书 → 起 etcd → 控制平面静态 Pod → kubelet TLS Bootstrapping → CNI → CoreDNS），每一步都对应二进制部署里手动干的事
3. **幂等**：每个 task 声明"期望状态"，已满足就跳过，所以部署中断可重跑、加节点用 `scale.yml` 只动增量

:::info 和二进制部署的关系
kubespray 最终装出来的也是 kubeadm 风格的集群（控制平面跑在 `/etc/kubernetes/manifests/` 静态 Pod 里）。先手动装过一遍二进制，再看它的剧本每一步都会觉得眼熟，排错时能看懂它卡在哪。
:::

## 官方资料

| 资源 | 地址 |
|------|------|
| GitHub 仓库 | [github.com/kubernetes-sigs/kubespray](https://github.com/kubernetes-sigs/kubespray) |
| 官方文档 | [kubespray.io](https://kubespray.io) |
| Getting Started | [getting-started.md](https://github.com/kubernetes-sigs/kubespray/blob/master/docs/getting_started/getting-started.md) |
| k8s 官方文档页 | [kubernetes.io - tools/kubespray](https://kubernetes.io/docs/setup/production-environment/tools/kubespray/) |

## 前置条件

- **控制机**：Mac / 任意 Linux，要求 Python 3 + Ansible 14（ansible-core ≥ 2.21）+ Jinja 3.1+ + python-netaddr
- **目标节点**：
  - SSH 免密可达（`ssh-copy-id` 配好）
  - 能联网拉镜像和二进制（离线场景见官方 offline 文档）
  - IPv4 转发已开启
  - **firewalld 关掉**（kubespray 不管防火墙）
  - root 权限（或配置 `ansible_become`，跑命令时加 `-b`）
- 硬件底线：控制平面 2G 内存 / worker 1G 内存

## 部署步骤

### 1. 克隆仓库并锁定版本

```bash
git clone https://github.com/kubernetes-sigs/kubespray.git
cd kubespray && git checkout v2.31.0   # 务必锁 tag，master 分支常有 breaking change

python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 2. 生成 inventory（节点清单）

```bash
cp -r inventory/sample inventory/mycluster
vim inventory/mycluster/inventory.ini
```

1 master + 2 worker 的写法：

```ini
[all]
master ansible_host=10.211.55.10 ip=10.211.55.10
worker1 ansible_host=10.211.55.11 ip=10.211.55.11
worker2 ansible_host=10.211.55.12 ip=10.211.55.12

[kube_control_plane]
master

[etcd]
master

[kube_node]
worker1
worker2

[calico_rr]

[k8s_cluster:children]
kube_control_plane
kube_node
calico_rr
```

:::tip 3 台也能做 HA
3 台全做控制平面（master/worker1/worker2 都加进 `[kube_control_plane]` 和 `[etcd]`）就是标准 3 节点 HA 集群，官方推荐生产至少 3 个 etcd。
:::

### 3. 配置关键变量

```bash
vim inventory/mycluster/group_vars/k8s_cluster/k8s-cluster.yml
```

```yaml
kube_network_plugin: calico     # 默认 calico；学习环境可用 flannel 更简单
container_manager: containerd   # 默认即是

# 建议加上：部署完自动把 kubectl 和 kubeconfig 下发到控制机
kubectl_localhost: true
kubeconfig_localhost: true
```

### 4. 一键部署

```bash
ansible-playbook -i inventory/mycluster/inventory.ini cluster.yml -b -v \
  --private-key=~/.ssh/id_rsa
```

### 5. 验证

```bash
cd inventory/mycluster/artifacts && ./kubectl.sh get nodes
# 或把 admin.conf 拷成 ~/.kube/config 后直接 kubectl
```

## 日常运维 playbook

都带 `-i inventory/mycluster/inventory.ini -b` 执行：

| playbook | 用途 |
|----------|------|
| `cluster.yml` | 全新部署 / 全量重跑（幂等） |
| `scale.yml` | **加节点**：inventory 加新节点后跑，增量安装 |
| `remove-node.yml` | 删节点：`--extra-vars "node=worker2"`（首个控制平面/etcd 节点不支持删） |
| `upgrade-cluster.yml` | 集群升级（逐 minor 版本升，不能跳级） |
| `reset.yml` | **清空集群**，重装前用 |

## 版本管理

### 默认版本定义在哪

集中在 `roles/kubespray_defaults/defaults/main/download.yml`（所有组件版本的"总账本"）：

```yaml
kube_version: "{{ (kubelet_checksums['amd64'] | dict2items)[0].key }}"   # 从 checksum 表第一个 key 反推
etcd_version: "{{ etcd_supported_versions[kube_major_version] }}"        # 按 k8s 大版本自动配对
containerd_version: "{{ (containerd_archive_checksums['amd64'] | dict2items)[0].key }}"
calico_version: "{{ (calicoctl_binary_checksums['amd64'] | dict2items)[0].key }}"
cilium_version: "1.19.3"
flannel_version: 0.28.4
```

网络插件和运行时类型在 `group_vars/k8s_cluster/k8s-cluster.yml` 里选（`kube_network_plugin` / `container_manager`）。

### 查当前 inventory 实际会装什么版本

```bash
# 看 master 最终解析出的全部变量（版本都在里面）
ansible-inventory -i inventory/mycluster/inventory.ini --host master | grep -i version

# 单查一个
ansible master -i inventory/mycluster/inventory.ini -m debug -a "var=kube_version"
```

部署后在节点上核对：

```bash
kubectl version                          # 控制平面版本
kubectl get nodes                        # VERSION 列 = kubelet 版本
containerd --version && runc --version   # 运行时
kubectl -n kube-system get ds            # CNI
```

### 指定版本

**不要改 roles 里的默认文件**（升级 kubespray 会被冲掉），统一在 inventory 的 group_vars 覆盖：

```yaml
# group_vars/k8s_cluster/k8s-cluster.yml 或 group_vars/all/all.yml
kube_version: v1.37.1
```

```yaml
# group_vars/all/all.yml（其他组件）
containerd_version: 2.4.1
runc_version: v1.5.2
calico_version: v3.30.0
```

:::caution 指定版本的三个注意
1. **不是任意版本都能用**：下载时会按 checksum 表核对 sha256，表里没有的版本直接下载失败（需按官方 offline 文档补 checksum）
2. **etcd / CoreDNS 慎改**：官方按 k8s 大版本做了兼容配对，乱改可能装出异常组合
3. **改版本 ≠ 升级**：已部署集群跨版本要用 `upgrade-cluster.yml`，只能逐个 minor 升
:::

## 常见问题

| 问题 | 说明 |
|------|------|
| 部署卡在拉镜像 | 国内网络在 `group_vars/all/offline.yml` 配镜像源，或节点配代理 |
| Rocky 10 | 官方标记 experimental，CI 在跑基本可用；报错先看卡在哪个 task，多为 dnf 依赖 |
| 防火墙 | kubespray 不管理防火墙规则，部署前自行关闭 firewalld |
| 版本选择 | 锁 git tag 部署（如 v2.31.0），最低要求 K8s ≥ v1.35.0 |
| 中断重跑 | `cluster.yml` 幂等，直接重跑即可接着装 |
