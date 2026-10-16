[toc]

# 使用Ansible一键部署k8s集群（v1.37）

> 本文是[《使用kubeadm安装最新版k8s集群（v1.37）》](./使用kubeadm安装最新版k8s集群-v1.37.md)的**配套自动化部署笔记**：把手工分步安装的 5 个步骤原样自动化，5 个 play 文件与该笔记的第 1~5 节一一对应，完全按 Kubernetes 官方文档顺序执行。
>
> 设计原则：
>
> - **失败即中止**：任一节点任一任务失败（下载失败、安装失败、校验失败），整个部署立即停止
> - **可重复执行**：所有任务幂等，排查修复后直接重跑，已完成的步骤自动跳过
> - **自动识别操作系统**：RedHat 系（Rocky/CentOS/RHEL）走 yum 分支，Debian 系（Ubuntu）走 apt 分支

## 1. 使用方法

### 1.1 准备文件

先创建目录结构（以 `k8s-ansible/` 为例）：

```bash
mkdir -p k8s-ansible/{group_vars,plays} && cd k8s-ansible
```

然后把[第 3 节](#3-完整文件内容)中的 **`cat > ...` 命令块按顺序整段复制到终端执行**（每块回车后即生成对应文件），最终目录结构如下：

```bash
k8s-ansible/
├── inventory.ini          # 主机清单：节点 IP 在这里改（唯一需要改 IP 的地方）
├── group_vars/
│   └── all.yml            # 全局变量：版本、网段、镜像仓库
├── site.yml               # 入口：按顺序导入 5 个分步 play
└── plays/
    ├── 01-prepare.yml     # 步骤 1：前置准备
    ├── 02-containerd.yml  # 步骤 2：容器运行时
    ├── 03-k8s-packages.yml# 步骤 3：kubeadm/kubelet/kubectl
    ├── 04-master-init.yml # 步骤 4：初始化 master
    └── 05-node-join.yml   # 步骤 5：node 加入集群 + 最终验证
```

### 1.2 执行

```bash
# 前提：三台机器已配置 SSH 免密登录，执行用户有 sudo/root 权限
cd k8s-ansible/

# 1. 修改 inventory.ini 中的节点 IP（10.0.0.10/11/12 换成你的）
# 2. 按需修改 group_vars/all.yml（版本、网段、镜像仓库）

# 语法检查（不实际连接节点）
ansible-playbook -i inventory.ini site.yml --syntax-check

# 正式安装
ansible-playbook -i inventory.ini site.yml
```

:::caution 变量与手工笔记一一对应  
`group_vars/all.yml` 中的变量（`k8s_version`、`pod_cidr`、`image_registry` 等）与手工安装笔记开头的「变量约定」**一一对应**，两边保持一致即可混用手工/自动方式安装。  
:::

### 1.3 首次运行报 UNREACHABLE：Host key verification failed（常见）

**现象**：`Gathering Facts` 阶段卡在 `The authenticity of host '10.0.0.21' can't be established`，非交互执行时报 `fatal: UNREACHABLE! => Host key verification failed`。

**原因**：SSH 的 `known_hosts` 是按「连接时用的地址」记录密钥的。如果你之前只用主机名（`k8s-node01`）或别的 IP 免密登录过，而 `inventory.ini` 里写的是**节点 IP**，SSH 按「IP」这个身份找不到记录，就会要求人工确认密钥；ansible 非交互执行确认不了，直接 UNREACHABLE。

**解决一（推荐）：先把三个节点的密钥收集进 known_hosts，再跑 playbook**

```bash
# IP 换成 inventory.ini 里的实际节点 IP
ssh-keyscan -t ed25519,rsa 10.0.0.20 10.0.0.21 10.0.0.22 >> ~/.ssh/known_hosts

# 验证：不输 yes 直接能连上
ansible all -i inventory.ini -m ping
```

**解决二：关闭主机密钥检查（实验环境可用）**

最省事的方式是在 playbook 目录放一个 `ansible.cfg`（完整内容见 3.9 节，一行命令即可创建），ansible 会自动读取，之后不再出现任何确认提示：

```bash
cat > ansible.cfg << 'EOF'
[defaults]
host_key_checking = False
EOF
```

也可以只对单次执行临时生效（不改任何文件）：

```bash
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini site.yml
```

:::caution 克隆虚拟机的额外提醒  
如果你是用 VM 模板克隆出来的节点，三台机器的 SSH 主机密钥会**完全相同**（报错里两个 IP 显示同一个 fingerprint 就是这个现象）。实验环境无妨；生产环境建议每台克隆机重新生成主机密钥：`rm /etc/ssh/ssh_host_* && ssh-keygen -A && systemctl restart sshd`，否则严格校验密钥的环境会把它们视为同一台机器。  
:::

## 2. 与手工步骤的对应关系

| Play 文件               | 手工笔记章节           | 内容                                                                |
| --------------------- | ---------------- | ----------------------------------------------------------------- |
| `01-prepare.yml`      | 第 1 节 前置准备       | 硬件检查（内存/CPU）、主机名、hosts、swap、SELinux/AppArmor、时间同步、内核模块、sysctl、防火墙 |
| `02-containerd.yml`   | 第 2 节 容器运行时      | containerd/runc/CNI 下载解压、SystemdCgroup、pause 镜像、启动验证              |
| `03-k8s-packages.yml` | 第 3 节 三件套安装      | pkgs.k8s.io 仓库（yum/apt 自动识别）、指定版本安装与锁版本、版本一致性校验                   |
| `04-master-init.yml`  | 第 4 节 初始化 master | 预拉镜像、`kubeadm init`、kubectl 凭证、flannel（含网段校验）、等待 CoreDNS          |
| `05-node-join.yml`    | 第 5 节 添加 node    | 逐台 join（token 现场生成）、等待所有节点 Ready、输出集群状态                           |

## 3. 完整文件内容

:::tip 一键生成全部文件  
以下每个代码块都是**可直接整段复制执行**的 heredoc 命令：`<<'EOF'` 带单引号，YAML 中的 `{{ }}` Ansible 变量会**原样写入文件**，不会被 shell 展开。配合 1.1 的 `mkdir` 命令，8 块复制完即完成全部文件准备。  
:::

### 3.1 inventory.ini

```bash
cat > inventory.ini <<'EOF'
# ============================================================
# Kubernetes 集群主机清单 —— 换环境只需要改这里的 IP
# 主机名不可重复（kubeadm 要求主机名/MAC/product_uuid 唯一）
# ============================================================

[k8s_master]
k8s-master01 ansible_host=10.0.0.10

[k8s_nodes]
k8s-node01 ansible_host=10.0.0.11
k8s-node02 ansible_host=10.0.0.12

[k8s_cluster:children]
k8s_master
k8s_nodes

# 也可按需加连接参数，例如：
# [k8s_cluster:vars]
# ansible_user=root
# ansible_ssh_private_key_file=~/.ssh/id_rsa
EOF
```

### 3.2 group_vars/all.yml

```bash
cat > group_vars/all.yml <<'EOF'
# ============================================================
# Kubernetes 集群安装全局变量 —— 与手工笔记「变量约定」一一对应
# 换版本 / 换网段 / 换镜像仓库只需要改这个文件
# ============================================================

# ---------- 版本变量（写笔记时的最新版，可按需修改）----------
k8s_version: v1.37.1          # Kubernetes 稳定版（带 v 前缀），见 https://dl.k8s.io/release/stable.txt
                              # 注意：yum/dnf 的包名不带 v（playbook 中已用 replace 过滤器处理）
k8s_minor: "1.37"             # pkgs.k8s.io 仓库小版本
k8s_deb_pkg_version: 1.37.1-1.1   # Ubuntu apt 包版本（不带 v 前缀，以 apt-cache madison kubeadm 输出为准）
containerd_version: "2.4.1"   # containerd 版本
runc_version: "1.5.2"         # runc 版本
cni_plugins_version: v1.9.1   # CNI 插件版本
flannel_version: v0.28.9      # flannel 版本
pause_version: "3.10"         # pause 沙箱镜像版本

# ---------- 集群网络（节点 IP 在 inventory.ini 里改）----------
pod_cidr: 10.244.0.0/16       # Pod 网段（flannel 默认，须与 kube-flannel.yml 的 Network 一致）
service_cidr: 10.96.0.0/12    # Service 网段（官方默认）

# ---------- 镜像仓库（国内网络可替换）----------
image_registry: registry.k8s.io
# 国内拉取失败时可换成：
# image_registry: registry.aliyuncs.com/google_containers
pause_image: "registry.k8s.io/pause:{{ pause_version }}"
# 国内网络可换成：
# pause_image: "registry.aliyuncs.com/google_containers/pause:{{ pause_version }}"

# ---------- 其他 ----------
ntp_server: ntp.aliyun.com    # 时间同步服务器
download_dir: /tmp/k8s-install    # 安装包下载目录（重复执行时已下载的自动跳过）
flannel_wait_timeout: 600s    # 等待 CoreDNS 就绪的超时时间
node_ready_retries: 30        # 等待所有节点 Ready 的重试次数（每次间隔 10 秒）
EOF
```

### 3.3 site.yml

```bash
cat > site.yml <<'EOF'
# ============================================================
# kubeadm 一键部署 Kubernetes 集群（v1.37）—— 入口
# 完全按照 kubernetes.io 官方文档步骤，5 个 play 对应手工笔记第 1~5 节
#
# 使用方法：
#   ansible-playbook -i inventory.ini site.yml
#
# 设计原则：
#   - 失败即中止：任一节点任一任务失败，整个部署立即停止（any_errors_fatal）
#   - 可重复执行：所有任务幂等，已完成的步骤自动跳过
#   - 自动识别操作系统：RedHat 系走 yum 分支，Debian/Ubuntu 走 apt 分支
# ============================================================

- import_playbook: plays/01-prepare.yml
- import_playbook: plays/02-containerd.yml
- import_playbook: plays/03-k8s-packages.yml
- import_playbook: plays/04-master-init.yml
- import_playbook: plays/05-node-join.yml
EOF
```

### 3.4 plays/01-prepare.yml

```bash
cat > plays/01-prepare.yml <<'EOF'
# ============================================================
# 步骤 1：前置准备（所有节点）—— 对应手工笔记第 1 节
# 官方文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/
# 主机名、hosts、swap、SELinux/AppArmor、时间同步、内核模块、sysctl、防火墙
# ============================================================
- name: 步骤 1 | 前置准备（所有节点）
  hosts: k8s_cluster
  any_errors_fatal: true    # 任何一个节点失败，立即中止整个部署
  become: true
  tasks:
    - name: 校验操作系统类型（仅支持 RedHat 系与 Debian 系，fail fast）
      ansible.builtin.assert:
        that: ansible_facts['os_family'] in ['RedHat', 'Debian']
        success_msg: "OS 检测通过：{{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}（{{ ansible_facts['os_family'] }} 系）"
        fail_msg: >-
          不支持的操作系统：{{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}。
          本 playbook 仅支持 RedHat 系（Rocky/CentOS/RHEL）与 Debian 系（Ubuntu/Debian）；
          后续的包管理、SELinux/AppArmor、防火墙、chrony 等分支都依赖 os_family 判断。

    - name: 检查全局变量是否已正确配置（fail fast）
      ansible.builtin.assert:
        that:
          - k8s_version is defined
          - k8s_minor is defined
          - pod_cidr is defined
          - service_cidr is defined
        fail_msg: "group_vars/all.yml 中的变量未正确配置，请检查后再执行"

    - name: 检查内存不低于 2GB（官方要求）
      ansible.builtin.assert:
        that: ansible_memtotal_mb >= 1900
        fail_msg: "内存不足 2GB，不满足官方最低要求"

    - name: 控制平面节点 CPU 至少 2 核（官方要求）
      ansible.builtin.assert:
        that: ansible_facts['processor_vcpus'] >= 2
        fail_msg: "控制平面节点 CPU 不足 2 核，不满足官方最低要求"
      when: inventory_hostname in groups['k8s_master']

    # ---------- 1.1 主机名与 hosts 解析 ----------
    - name: 设置主机名（与 inventory 中定义一致，幂等）
      ansible.builtin.hostname:
        name: "{{ inventory_hostname }}"

    - name: 配置 hosts 解析（IP 取自 inventory，换环境只改 inventory.ini）
      ansible.builtin.blockinfile:
        path: /etc/hosts
        marker: "# {mark} ANSIBLE MANAGED - k8s cluster"
        block: |
          {% for h in groups['k8s_cluster'] %}
          {{ hostvars[h].ansible_host }} {{ h }}
          {% endfor %}

    # ---------- 1.2 关闭 swap ----------
    - name: 关闭 swap 并注释 /etc/fstab 中的 swap 行（官方要求，幂等）
      ansible.builtin.shell: |
        swapoff -a
        if grep -qE '^\s*[^#].*\sswap\s' /etc/fstab; then
          sed -ri 's/.*swap.*/#&/' /etc/fstab
          echo changed
        fi
      register: swap_off
      changed_when: "'changed' in swap_off.stdout"

    - name: 验证 swap 已关闭（总量应为 0，否则失败退出）
      ansible.builtin.shell: free -m | awk '/Swap/{print $2}'
      register: swap_check
      changed_when: false
      failed_when: swap_check.stdout.strip() != '0'

    # ---------- 1.3 安全模块（RedHat 设 SELinux permissive；Ubuntu 用 AppArmor 无需操作）----------
    - name: 将 SELinux 设置为 permissive 模式（仅 RedHat 系，官方要求）
      ansible.builtin.shell: |
        if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
          setenforce 0
          echo changed
        fi
      register: selinux_off
      changed_when: "'changed' in selinux_off.stdout"
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 持久化 SELinux permissive（仅 RedHat 系）
      ansible.builtin.lineinfile:
        path: /etc/selinux/config
        regexp: '^SELINUX='
        line: 'SELINUX=permissive'
      when: ansible_facts['os_family'] == 'RedHat'

    # ---------- 1.4 时间同步 ----------
    - name: 安装 chrony
      ansible.builtin.package:
        name: chrony
        state: present

    - name: 配置 NTP 服务器（RedHat 系，配置文件 /etc/chrony.conf）
      ansible.builtin.replace:
        path: /etc/chrony.conf
        regexp: '^(pool|server)\s+\S+'
        replace: 'pool {{ ntp_server }} iburst'
      when: ansible_facts['os_family'] == 'RedHat'
      notify: 重启 chrony

    - name: 配置 NTP 服务器（Ubuntu，配置文件 /etc/chrony/chrony.conf）
      ansible.builtin.replace:
        path: /etc/chrony/chrony.conf
        regexp: '^(pool|server)\s+\S+'
        replace: 'pool {{ ntp_server }} iburst'
      when: ansible_facts['os_family'] == 'Debian'
      notify: 重启 chrony

    - name: 启动 chrony 并设置开机自启（服务名：RedHat 为 chronyd，Ubuntu 为 chrony）
      ansible.builtin.service:
        name: "{{ 'chronyd' if ansible_facts['os_family'] == 'RedHat' else 'chrony' }}"
        state: started
        enabled: true

    # ---------- 1.5 内核模块与 sysctl（Ubuntu 与 RedHat 系命令完全相同）----------
    - name: 加载 overlay、br_netfilter 模块并持久化（官方 + flannel 要求）
      ansible.builtin.copy:
        dest: /etc/modules-load.d/k8s.conf
        mode: "0644"
        content: |
          overlay
          br_netfilter

    - name: 立即加载内核模块（幂等）
      ansible.builtin.shell: modprobe overlay && modprobe br_netfilter
      changed_when: false

    - name: 配置 sysctl 参数（官方要求，重启后保持不变）
      ansible.builtin.copy:
        dest: /etc/sysctl.d/k8s.conf
        mode: "0644"
        content: |
          net.bridge.bridge-nf-call-iptables  = 1
          net.bridge.bridge-nf-call-ip6tables = 1
          net.ipv4.ip_forward                 = 1

    - name: 应用 sysctl 参数（幂等）
      ansible.builtin.command: sysctl --system
      changed_when: false

    - name: 验证 br_netfilter 已加载（flannel 依赖，缺失直接失败退出）
      ansible.builtin.command: lsmod
      register: lsmod_out
      changed_when: false
      failed_when: "'br_netfilter' not in lsmod_out.stdout"

    - name: 验证 IPv4 转发已开启（缺失直接失败退出）
      ansible.builtin.command: sysctl -n net.ipv4.ip_forward
      register: ip_forward
      changed_when: false
      failed_when: ip_forward.stdout.strip() != '1'

    # ---------- 1.6 防火墙（实验环境关闭；生产环境请按官方端口表精确放行）----------
    - name: 关闭 firewalld（仅 RedHat 系，未启用则跳过）
      ansible.builtin.shell: |
        if systemctl list-unit-files firewalld.service 2>/dev/null | grep -q firewalld \
           && systemctl is-active firewalld >/dev/null 2>&1; then
          systemctl disable --now firewalld
        fi
      when: ansible_facts['os_family'] == 'RedHat'
      changed_when: false

    - name: 关闭 ufw（仅 Ubuntu，未启用则跳过）
      ansible.builtin.shell: |
        if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q 'Status: active'; then
          ufw disable
        fi
      when: ansible_facts['os_family'] == 'Debian'
      changed_when: false

  handlers:
    - name: 重启 chrony
      ansible.builtin.service:
        name: "{{ 'chronyd' if ansible_facts['os_family'] == 'RedHat' else 'chrony' }}"
        state: restarted
EOF
```


```
```


### 3.5 plays/02-containerd.yml

```bash
cat > plays/02-containerd.yml <<'EOF'
# ============================================================
# 步骤 2：安装容器运行时 containerd（所有节点）—— 对应手工笔记第 2 节
# 官方文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/
# containerd 官方入门：https://github.com/containerd/containerd/blob/main/docs/getting-started.md
# 按官方推荐使用二进制 tar 包安装，命令与发行版无关（Ubuntu/Rocky 相同）
# ============================================================
- name: 步骤 2 | 安装容器运行时 containerd（所有节点）
  hosts: k8s_cluster
  any_errors_fatal: true
  become: true
  vars:
    # 架构自动映射：x86_64 → amd64，aarch64（ARM）→ arm64，按每台节点的事实自动判断
    go_arch: "{{ 'arm64' if ansible_facts['architecture'] == 'aarch64' else 'amd64' }}"
  tasks:
    - name: 创建下载目录
      ansible.builtin.file:
        path: "{{ download_dir }}"
        state: directory
        mode: "0755"

    # ---------- 2.1 统一下载与分发（公网只走 master 一次，其余全走内网拷贝）----------
    - name: 统一在主节点下载所有安装包（带进度显示，失败自动重试后中止）
      ansible.builtin.shell: |
        curl -fL --progress-bar --retry 5 --retry-delay 3 --connect-timeout 15 \
          -o "{{ download_dir }}/{{ item.dest }}" "{{ item.url }}" \
          -w '\n{{ item.dest }} 下载完成：%{size_download} 字节，平均 %{speed_download} B/s\n'
      loop:
        - dest: "containerd-{{ containerd_version }}-linux-{{ go_arch }}.tar.gz"
          url: "https://github.com/containerd/containerd/releases/download/v{{ containerd_version }}/containerd-{{ containerd_version }}-linux-{{ go_arch }}.tar.gz"
        - dest: "runc.{{ go_arch }}"
          url: "https://github.com/opencontainers/runc/releases/download/v{{ runc_version }}/runc.{{ go_arch }}"
        - dest: "cni-plugins-linux-{{ go_arch }}-{{ cni_plugins_version }}.tgz"
          url: "https://github.com/containernetworking/plugins/releases/download/{{ cni_plugins_version }}/cni-plugins-linux-{{ go_arch }}-{{ cni_plugins_version }}.tgz"
        - dest: "containerd.service"
          url: "https://raw.githubusercontent.com/containerd/containerd/main/containerd.service"
        - dest: "kube-flannel.yml"
          url: "https://github.com/flannel-io/flannel/releases/download/{{ flannel_version }}/kube-flannel.yml"
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true
      args:
        creates: "{{ download_dir }}/{{ item.dest }}"

    - name: 从主节点拉取下载产物到控制机（作为分发中转）
      ansible.builtin.fetch:
        src: "{{ download_dir }}/{{ item }}"
        dest: "{{ playbook_dir }}/.k8s-pkgs/"
        flat: true
      loop:
        - "containerd-{{ containerd_version }}-linux-{{ go_arch }}.tar.gz"
        - "runc.{{ go_arch }}"
        - "cni-plugins-linux-{{ go_arch }}-{{ cni_plugins_version }}.tgz"
        - "containerd.service"
        - "kube-flannel.yml"
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true

    - name: 将下载产物分发到所有节点（内网拷贝，含主节点自身）
      ansible.builtin.copy:
        src: "{{ playbook_dir }}/.k8s-pkgs/{{ item }}"
        dest: "{{ download_dir }}/{{ item }}"
        mode: "0644"
      loop:
        - "containerd-{{ containerd_version }}-linux-{{ go_arch }}.tar.gz"
        - "runc.{{ go_arch }}"
        - "cni-plugins-linux-{{ go_arch }}-{{ cni_plugins_version }}.tgz"
        - "containerd.service"
        - "kube-flannel.yml"

    - name: 解压 containerd 到 /usr/local（幂等：已安装则跳过）
      ansible.builtin.unarchive:
        src: "{{ download_dir }}/containerd-{{ containerd_version }}-linux-{{ go_arch }}.tar.gz"
        dest: /usr/local
        creates: /usr/local/bin/containerd

    - name: 安装 containerd systemd 服务文件（从统一下载产物安装，幂等）
      ansible.builtin.copy:
        src: "{{ download_dir }}/containerd.service"
        dest: /usr/lib/systemd/system/containerd.service
        remote_src: true
        mode: "0644"
      register: containerd_service_file

    # ---------- 2.2 安装 runc ----------
    - name: 安装 runc 到 /usr/local/sbin（幂等：已安装则跳过）
      ansible.builtin.command: install -m 755 {{ download_dir }}/runc.{{ go_arch }} /usr/local/sbin/runc
      args:
        creates: /usr/local/sbin/runc

    # ---------- 2.3 安装 CNI 插件 ----------
    - name: 创建 CNI 插件目录（官方路径 /opt/cni/bin）
      ansible.builtin.file:
        path: /opt/cni/bin
        state: directory
        mode: "0755"

    - name: 解压 CNI 插件到 /opt/cni/bin（幂等：已安装则跳过）
      ansible.builtin.unarchive:
        src: "{{ download_dir }}/cni-plugins-linux-{{ go_arch }}-{{ cni_plugins_version }}.tgz"
        dest: /opt/cni/bin
        creates: /opt/cni/bin/loopback

    # ---------- 2.4 生成配置并设置 systemd cgroup 驱动 ----------
    - name: 创建 /etc/containerd 目录（tar 包安装不会自动创建）
      ansible.builtin.file:
        path: /etc/containerd
        state: directory
        mode: "0755"

    - name: 生成 containerd 默认配置（幂等：已存在则不覆盖）
      # 注意：ansible 非登录 shell 的 PATH 不含 /usr/local/bin，必须用绝对路径
      ansible.builtin.shell: /usr/local/bin/containerd config default > /etc/containerd/config.toml
      args:
        creates: /etc/containerd/config.toml

    - name: 将 runc 的 cgroup 驱动改为 systemd（官方要求，与 kubelet 一致）
      ansible.builtin.lineinfile:
        path: /etc/containerd/config.toml
        regexp: '^SystemdCgroup = false'
        line: 'SystemdCgroup = true'

    - name: 验证 SystemdCgroup 已开启（默认配置省略该项时失败退出，提示手动处理）
      ansible.builtin.command: grep -c 'SystemdCgroup = true' /etc/containerd/config.toml
      register: cgroup_check
      changed_when: false
      failed_when: cgroup_check.stdout | int < 1

    # ---------- 2.5 配置 pause 沙箱镜像 ----------
    - name: 配置 pause 沙箱镜像（国内网络可在 group_vars 中替换镜像地址）
      ansible.builtin.lineinfile:
        path: /etc/containerd/config.toml
        regexp: '^sandbox_image = '
        line: 'sandbox_image = "{{ pause_image }}"'

    # ---------- 2.6 启动 containerd（失败自动收集诊断日志后再退出，不瞎猜）----------
    - name: 启动 containerd 并设置开机自启
      block:
        - name: 启动 containerd
          ansible.builtin.systemd:
            name: containerd
            state: restarted
            enabled: true
            daemon_reload: true
      rescue:
        - name: 启动失败，收集诊断信息（状态 / 日志 / 架构对照 / 配置解析）
          ansible.builtin.shell: |
            echo '===== systemctl status ====='
            systemctl status containerd.service --no-pager -l 2>&1 | tail -20 || true
            echo '===== journalctl 最近 40 行 ====='
            journalctl -u containerd.service --no-pager -n 40 2>&1 || true
            echo '===== 架构对照（二进制架构必须与 uname 一致）====='
            uname -m
            file /usr/local/bin/containerd 2>/dev/null || true
            echo '===== 配置文件解析检查 ====='
            /usr/local/bin/containerd config dump >/dev/null 2>&1 && echo 'config.toml 可正常解析' || echo 'config.toml 解析失败'
          register: diag_logs
          changed_when: false

        - name: 输出诊断结果并中止部署
          ansible.builtin.fail:
            msg: "{{ diag_logs.stdout_lines }}"

    - name: 验证 containerd 运行正常（异常直接失败退出）
      ansible.builtin.command: ctr version
      register: ctr_ver
      changed_when: false
      failed_when: ctr_ver.rc != 0
EOF
```

:::tip 关于下载进度显示与统一下载设计  
所有公网下载**只在主节点执行一次**（`delegate_to: master` + `run_once`），其余节点（含主节点自身）通过控制机中转的内网拷贝分发——节点再多也不会重复访问 GitHub，个别节点网络抖动不再影响整体安装。

大文件下载用 `curl --progress-bar`，任务输出里会留下进度条和速度汇总。但要注意 ansible 的机制：**任务执行期间终端不会实时刷新**，进度条在任务结束时统一输出。想在执行期间实时观察，可以在控制机另开一个终端：

```bash
# 目录换成 group_vars/all.yml 里的 download_dir
watch -n 2 ls -lh /tmp/k8s-download/
```

全部安装包加起来约 60MB，下载失败的常见原因是国内访问 GitHub 不稳——`--retry 5` 会自动重试；仍失败的话，手动下载好这 5 个文件放到**控制机的 `k8s-ansible/.k8s-pkgs/` 目录**再跑 playbook，下载任务会因主节点缺文件而重试，但分发任务直接用现成文件，或者干脆手动把 5 个文件放到主节点的 `download_dir`（curl 的 `creates` 检测到存在会全部跳过）。  
:::

### 3.6 plays/03-k8s-packages.yml

:::tip 先确认仓库里有这个版本，再执行  
`k8s_version` / `k8s_deb_pkg_version` **不能凭感觉填**，要以 pkgs.k8s.io 仓库实际提供的版本为准。执行 playbook 前可在任意一台节点先查询（把 `v1.37` 换成你的 `k8s_minor`）：

```bash
# RedHat 系：列出仓库中 kubelet 的全部可用版本
dnf --disablerepo="*" --enablerepo="kubernetes" list --showduplicates kubelet

# Ubuntu：查看 apt 仓库中的版本（输出即 k8s_deb_pkg_version 的取值）
apt-cache madison kubeadm
```

截至写笔记时，`v1.37` 仓库实际提供 **1.37.0 和 1.37.1** 两个版本，三件套（kubelet/kubeadm/kubectl）均覆盖 `aarch64` 与 `x86_64` 双架构（rpm 包全名为 `kubelet-1.37.1-150500.1.1`，dnf 支持只写 `kubelet-1.37.1` 自动匹配 release 段）。另注意：yum/dnf 包名**不带 v 前缀**，写 `kubelet-v1.37.1` 会直接报 No package。
:::

:::info 本节安装方式：主节点统一下载 → 分发 → 各节点本地安装
三件套是 100MB 级大包，且 pkgs.k8s.io 在国内访问不稳定，**多台节点各自从公网下载经常报 `Cannot download, all mirrors were already tried without success`**（实测三台并发时 master 成功、node 全挂）。因此 RedHat 分支延续 3.5 节的模式：

1. **主节点统一下载**：`dnf download --resolve` 下载三件套 + kubernetes-cni + cri-tools（后两个是 kubeadm 的 rpm 依赖，一并下好，node 安装时**完全离线**），失败自动重试 3 次；
2. **控制机中转** → **分发到所有节点**；
3. **各节点 `dnf localinstall` 本地安装**：已装同版本自动跳过（幂等），失败自动重试，安装前先 `rpm --import` 导入仓库公钥通过 gpg 校验。

两个附带说明：`kubernetes-cni` rpm 会接管 `/opt/cni/bin`（与 3.5 节手动解压的 CNI 是同一路径，以 rpm 版本为准，flannel 均兼容）；`download_dir/rpms/` 与控制机 `.k8s-pkgs/rpms/` 会保留安装包缓存，重跑时直接复用。

:::caution dnf download 报 No package 的真正原因：仓库的 exclude
官方推荐的 repo 配置里有 `exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni`（防止 yum upgrade 误升级三件套）。这一行会把这些包从**一切查询和下载中排除**，三种命令的豁免方式各不相同：

| 命令 | 豁免 exclude 的方式 |
| ---- | ------------------ |
| `yum list` / `dnf list` | 命令行加 `--disableexcludes=kubernetes` |
| ansible `yum/dnf` 模块 install | 模块参数 `disable_excludes: kubernetes` |
| `dnf download` | **命令行加 `--disableexcludes=kubernetes`（没有其他参数可用）** |

漏加就会出现 `No package kubelet-... available / Exiting due to strict setting`，和包名写法无关。另外 `dnf download` 的 spec 解析比 install 严格，传完整 `version-release`（如 `kubelet-1.37.1-150500.1.1`）最稳——下载任务里已用 `yum list` 输出自动解析，无需手写。

还有第三个坑：`dnf download` **不加 `--arch` 时默认下载全部架构**（aarch64/ppc64le/s390x/x86_64 全拉下来），且 `--resolve` 在本机解析其他架构的依赖会直接报 `does not have a compatible architecture`。必须加 `--arch=$(uname -m),noarch` 只取本机架构和 noarch 包。
:::
:::

```bash
cat > plays/03-k8s-packages.yml <<'EOF'
# ============================================================
# 步骤 3：安装 kubeadm、kubelet、kubectl（所有节点）—— 对应手工笔记第 3 节
# 官方文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/
# 自动识别操作系统：RedHat 系走 yum 分支，Debian/Ubuntu 走 apt 分支
# ============================================================
- name: 步骤 3 | 安装 kubeadm、kubelet、kubectl（所有节点）
  hosts: k8s_cluster
  any_errors_fatal: true
  become: true
  tasks:
    # ==================== RedHat 系（Rocky / CentOS / RHEL）====================
    - name: 配置 pkgs.k8s.io yum 仓库（RedHat 系）
      ansible.builtin.copy:
        dest: /etc/yum.repos.d/kubernetes.repo
        mode: "0644"
        content: |
          [kubernetes]
          name=Kubernetes
          baseurl=https://pkgs.k8s.io/core:/stable:/v{{ k8s_minor }}/rpm/
          enabled=1
          gpgcheck=1
          gpgkey=https://pkgs.k8s.io/core:/stable:/v{{ k8s_minor }}/rpm/repodata/repomd.xml.key
          exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 查询仓库中 kubelet 可用版本（RedHat 系，先查后装）
      # yum 是 Rocky10 上 dnf 的别名命令，CentOS 7 也兼容
      ansible.builtin.command: yum --showduplicates list kubelet --disableexcludes=kubernetes
      register: kubelet_rpm_versions
      changed_when: false
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 校验目标版本在仓库中存在（RedHat 系，不存在立即中止并列出可用版本）
      # 包名不带 v：k8s_version=v1.37.1 时实际要装的 rpm 版本号是 1.37.1
      ansible.builtin.assert:
        that:
          - kubelet_rpm_versions.stdout is search((k8s_version | replace('v', '')) ~ '-')
        fail_msg: >-
          目标版本 {{ k8s_version }}（rpm 版本号 {{ k8s_version | replace('v', '') }}）不在仓库中！
          请修改 group_vars 的 k8s_version 为下列可用版本之一：{{ kubelet_rpm_versions.stdout_lines }}
        success_msg: "已确认仓库中存在目标版本 {{ k8s_version }}，开始安装"
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 主节点统一下载三件套及依赖 rpm（一处下载全部分发，失败自动重试）
      # kubelet ~110MB / kubectl ~100MB，node 各自从 pkgs.k8s.io 拉大包容易失败
      # （Cannot download, all mirrors were already tried），改为只在 master 下载一次
      # kubernetes-cni、cri-tools 是 kubeadm 的 rpm 依赖，一并下好，node 安装时完全离线
      # 注意 1：仓库配置里 exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
      #   会把这些包从一切查询/下载中排除，dnf download 必须加 --disableexcludes=kubernetes，
      #   否则报 No package ... / Exiting due to strict setting（dnf install 有模块级
      #   disable_excludes 参数，dnf download 只能用命令行选项）
      # 注意 2：dnf download 的 spec 解析比 install 严格，用完整 version-release 最稳
      # 注意 3：dnf download 不加 --arch 时默认下载【全部架构】的 rpm
      #   （aarch64/ppc64le/s390x/x86_64 全拉），--resolve 在本机解析其他架构依赖时
      #   必报 does not have a compatible architecture；必须限定 本机架构 + noarch
      ansible.builtin.shell: |
        set -o pipefail
        RPMS_DIR="{{ download_dir }}/rpms"
        mkdir -p "$RPMS_DIR"
        if ls "$RPMS_DIR"/kubelet-{{ k8s_version | replace('v', '') }}-*.rpm >/dev/null 2>&1; then
          echo "kubelet rpm 已存在，跳过下载"
          exit 0
        fi
        PKG_VER=$(yum --showduplicates list kubelet --disableexcludes=kubernetes \
          | awk '/^kubelet\./ {print $2}' \
          | grep -F "{{ k8s_version | replace('v', '') }}-" | head -1)
        if [ -z "$PKG_VER" ]; then
          echo "仓库中未找到 kubelet {{ k8s_version | replace('v', '') }} 对应的 rpm" >&2
          exit 1
        fi
        echo "解析到完整版本: kubelet-${PKG_VER}（架构 $(uname -m)）"
        dnf -y download --disableexcludes=kubernetes --resolve \
          --arch=$(uname -m),noarch --destdir "$RPMS_DIR" \
          "kubelet-${PKG_VER}" "kubeadm-${PKG_VER}" "kubectl-${PKG_VER}" \
          kubernetes-cni cri-tools
      register: rpm_download
      retries: 3
      delay: 5
      until: rpm_download is succeeded
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 列出主节点已下载的全部 rpm
      ansible.builtin.find:
        paths: "{{ download_dir }}/rpms"
        patterns: "*.rpm"
      register: rpm_files
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 校验三件套及依赖 rpm 均已下载（缺文件立即中止）
      ansible.builtin.assert:
        that:
          - rpm_files.files | selectattr('path', 'search', 'kubelet-' ~ (k8s_version | replace('v', ''))) | list | length > 0
          - rpm_files.files | selectattr('path', 'search', 'kubeadm-') | list | length > 0
          - rpm_files.files | selectattr('path', 'search', 'kubectl-') | list | length > 0
          - rpm_files.files | selectattr('path', 'search', 'kubernetes-cni-') | list | length > 0
          - rpm_files.files | selectattr('path', 'search', 'cri-tools-') | list | length > 0
        fail_msg: "rpm 下载不完整，当前只有：{{ rpm_files.files | map(attribute='path') | map('basename') | list }}"
        success_msg: "共 {{ rpm_files.files | length }} 个 rpm 已就绪，开始分发"
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 中转 rpm 到控制机（.k8s-pkgs/rpms/）
      ansible.builtin.fetch:
        src: "{{ item.path }}"
        dest: "{{ playbook_dir }}/.k8s-pkgs/rpms/"
        flat: true
      loop: "{{ rpm_files.files }}"
      loop_control:
        label: "{{ item.path | basename }}"
      delegate_to: "{{ groups['k8s_master'][0] }}"
      run_once: true
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 分发 rpm 到所有节点
      ansible.builtin.copy:
        src: "{{ playbook_dir }}/.k8s-pkgs/rpms/{{ item.path | basename }}"
        dest: "{{ download_dir }}/rpms/"
        mode: "0644"
      loop: "{{ rpm_files.files }}"
      loop_control:
        label: "{{ item.path | basename }}"
      when: ansible_facts['os_family'] == 'RedHat'

    - name: 本地安装三件套及依赖（所有节点，已装自动跳过，失败自动重试）
      # 先 rpm --import 导入仓库公钥，localinstall 本地 rpm 时才能通过 gpg 校验；
      # disable_excludes 用于绕过仓库里 exclude=kubelet kubeadm kubectl 的限制；
      # 幂等：rpm -q 查到三件套同版本已装则直接跳过，重跑不会重复安装
      ansible.builtin.shell: |
        if rpm -q kubelet-{{ k8s_version | replace('v', '') }} >/dev/null 2>&1 \
           && rpm -q kubeadm-{{ k8s_version | replace('v', '') }} >/dev/null 2>&1 \
           && rpm -q kubectl-{{ k8s_version | replace('v', '') }} >/dev/null 2>&1; then
          echo "已安装，跳过"
          exit 0
        fi
        rpm --import https://pkgs.k8s.io/core:/stable:/v{{ k8s_minor }}/rpm/repodata/repomd.xml.key
        dnf -y localinstall {{ download_dir }}/rpms/*.rpm --disableexcludes=kubernetes
      register: rpm_install
      retries: 3
      delay: 5
      until: rpm_install is succeeded
      changed_when: "'已安装，跳过' not in rpm_install.stdout"
      when: ansible_facts['os_family'] == 'RedHat'

    # ==================== Debian 系（Ubuntu）====================
    - name: 安装依赖并更新缓存（Ubuntu）
      ansible.builtin.apt:
        name:
          - apt-transport-https
          - ca-certificates
          - curl
          - gpg
        state: present
        update_cache: true
        cache_valid_time: 3600
      when: ansible_facts['os_family'] == 'Debian'

    - name: 导入 pkgs.k8s.io 仓库公钥（Ubuntu，幂等：已存在则跳过）
      ansible.builtin.shell: |
        mkdir -p -m 755 /etc/apt/keyrings
        if [ ! -f /etc/apt/keyrings/kubernetes-apt-keyring.gpg ]; then
          curl -fsSL https://pkgs.k8s.io/core:/stable:/v{{ k8s_minor }}/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        fi
      when: ansible_facts['os_family'] == 'Debian'
      changed_when: false

    - name: 配置 pkgs.k8s.io apt 仓库（Ubuntu）
      ansible.builtin.copy:
        dest: /etc/apt/sources.list.d/kubernetes.list
        mode: "0644"
        content: |
          deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v{{ k8s_minor }}/deb/ /
      when: ansible_facts['os_family'] == 'Debian'
      register: apt_repo

    - name: 更新 apt 缓存（仓库配置发生变更时）
      ansible.builtin.apt:
        update_cache: true
      when: ansible_facts['os_family'] == 'Debian' and apt_repo is changed

    - name: 查询仓库中 kubelet 可用版本（Ubuntu，先查后装）
      ansible.builtin.command: apt-cache madison kubelet
      register: kubelet_deb_versions
      changed_when: false
      when: ansible_facts['os_family'] == 'Debian'

    - name: 校验目标版本在仓库中存在（Ubuntu，不存在立即中止并列出可用版本）
      ansible.builtin.assert:
        that:
          - k8s_deb_pkg_version in kubelet_deb_versions.stdout
        fail_msg: >-
          目标版本 {{ k8s_deb_pkg_version }} 不在 apt 仓库中！
          请修改 group_vars 的 k8s_deb_pkg_version 为下列可用版本之一：{{ kubelet_deb_versions.stdout_lines }}
        success_msg: "已确认仓库中存在目标版本 {{ k8s_deb_pkg_version }}，开始安装"
      when: ansible_facts['os_family'] == 'Debian'

    - name: 安装三件套指定版本（Ubuntu，版本变量 k8s_deb_pkg_version，不带 v 前缀，失败自动重试）
      ansible.builtin.apt:
        name:
          - "kubelet={{ k8s_deb_pkg_version }}"
          - "kubeadm={{ k8s_deb_pkg_version }}"
          - "kubectl={{ k8s_deb_pkg_version }}"
        state: present
      register: apt_install
      retries: 3
      delay: 5
      until: apt_install is succeeded
      when: ansible_facts['os_family'] == 'Debian'

    - name: 锁定三件套版本防止 apt upgrade 自动升级（Ubuntu 官方命令 apt-mark hold）
      ansible.builtin.command: apt-mark hold kubelet kubeadm kubectl
      when: ansible_facts['os_family'] == 'Debian'
      changed_when: false

    # ==================== 通用验证 ====================
    - name: 验证 kubeadm 版本与目标版本一致（不一致直接失败退出）
      ansible.builtin.command: kubeadm version -o short
      register: kubeadm_ver
      changed_when: false
      failed_when: k8s_version not in kubeadm_ver.stdout

    - name: 验证 kubelet、kubectl 版本一致
      ansible.builtin.command: "{{ ver_cmd }}"
      loop:
        - kubelet --version
        - kubectl version --client
      loop_control:
        loop_var: ver_cmd
      register: ver_check
      changed_when: false
      failed_when: k8s_version not in ver_check.stdout

    # 官方说明：kubelet 在 kubeadm init/join 之前每隔几秒重启一次（crashloop）是正常现象，
    # 因此这里只设置开机自启，不强制要求服务处于 running 状态
    - name: 设置 kubelet 开机自启（init 前处于 crashloop 属正常现象，官方说明）
      ansible.builtin.systemd:
        name: kubelet
        enabled: true
EOF
```

### 3.7 plays/04-master-init.yml

```bash
cat > plays/04-master-init.yml <<'EOF'
# ============================================================
# 步骤 4：初始化 master 节点（仅 k8s-master01）—— 对应手工笔记第 4 节
# 官方文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/
# 幂等设计：检测 /etc/kubernetes/admin.conf，已初始化则跳过（不会重复 init）
# ============================================================
- name: 步骤 4 | 初始化 master 节点
  hosts: k8s_master
  any_errors_fatal: true
  become: true
  tasks:
    - name: 检查是否已初始化（幂等：已初始化则跳过 kubeadm init）
      ansible.builtin.stat:
        path: /etc/kubernetes/admin.conf
      register: k8s_initialized

    # ---------- 4.1 预拉取控制平面镜像 ----------
    - name: 获取控制平面镜像清单（按 image_registry 与 k8s_version 生成）
      ansible.builtin.command:
        argv:
          - kubeadm
          - config
          - images
          - list
          - --image-repository={{ image_registry }}
          - --kubernetes-version={{ k8s_version }}
      register: cp_image_list
      changed_when: false
      when: not k8s_initialized.stat.exists

    - name: 逐个预拉取控制平面镜像（每个镜像独立进度与重试；国内网络请先在 group_vars 替换 image_registry）
      # 不用 kubeadm config images pull 一条命令拉全部：ansible 不实时刷新输出，
      # 执行时看起来像卡死；改为逐镜像 crictl pull——每个镜像独立任务行、
      # crictl 自带 layer 下载进度条，失败只重拉当前这一个镜像，不从头来
      ansible.builtin.shell: |
        crictl --runtime-endpoint=unix:///run/containerd/containerd.sock pull {{ item }}
      loop: "{{ cp_image_list.stdout_lines }}"
      loop_control:
        label: "{{ item | basename }}"
      register: image_pull
      retries: 3
      delay: 5
      until: image_pull is succeeded
      changed_when: image_pull.stderr is not search('up to date')
      when: not k8s_initialized.stat.exists

    # ---------- 4.2 初始化控制平面 ----------
    - name: 初始化控制平面（kubeadm init，advertise-address 取自 inventory）
      ansible.builtin.command:
        argv:
          - kubeadm
          - init
          - --apiserver-advertise-address={{ hostvars[inventory_hostname].ansible_host }}
          - --image-repository={{ image_registry }}
          - --kubernetes-version={{ k8s_version }}
          - --pod-network-cidr={{ pod_cidr }}
          - --service-cidr={{ service_cidr }}
      when: not k8s_initialized.stat.exists

    # ---------- 4.3 配置 kubectl（为 root 用户）----------
    - name: 创建 kubectl 配置目录
      ansible.builtin.file:
        path: /root/.kube
        state: directory
        mode: "0700"

    - name: 配置 kubectl 凭证（幂等：已存在则跳过）
      ansible.builtin.copy:
        src: /etc/kubernetes/admin.conf
        dest: /root/.kube/config
        remote_src: true
        mode: "0600"
        force: false

    # ---------- 4.3.1 kubectl 便捷配置（官方 Quick Reference 推荐写法）----------
    - name: 安装 bash-completion（kubectl 补全依赖，官方说明需先安装该软件包）
      # package 模块自动按系统选择 yum/apt，RedHat 与 Debian 通用
      ansible.builtin.package:
        name: bash-completion
        state: present

    - name: 配置 kubectl 补全与 k 别名（写入 /root/.bashrc，幂等：标记块存在则跳过）
      # 官方 Quick Reference（kubectl 快速参考）写法：
      #   source <(kubectl completion bash)  +  alias k=kubectl  +  complete 绑定
      # blockinfile 用标记块包裹，重复执行不会重复写入
      ansible.builtin.blockinfile:
        path: /root/.bashrc
        create: true
        mode: "0644"
        marker: "# {mark} ANSIBLE MANAGED: kubectl 补全与别名"
        block: |
          # kubectl 自动补全（Kubernetes 官方 Quick Reference）
          source <(kubectl completion bash)
          # k 别名 + 补全绑定（官方 Quick Reference）
          alias k=kubectl
          complete -o default -F __start_kubectl k
          # 常用衍生别名（社区惯例，kube-system 命名空间快捷操作）
          alias ksys='kubectl -n kube-system'
          complete -o default -F __start_kubectl ksys

    - name: kubectl 便捷配置完成提示（重新登录或 source /root/.bashrc 后生效）
      ansible.builtin.debug:
        msg: "已配置 kubectl 补全与 k/ksys 别名，重新登录 shell 或执行 source /root/.bashrc 生效"

    # ---------- 4.4 安装 Pod 网络插件 flannel ----------
    - name: 分发 kube-flannel.yml 到主节点（已在步骤 2 统一下载，见 3.5 节 2.1）
      ansible.builtin.copy:
        src: "{{ playbook_dir }}/.k8s-pkgs/kube-flannel.yml"
        dest: "{{ download_dir }}/kube-flannel.yml"
        mode: "0644"

    - name: 校验 flannel Network 网段与 POD_CIDR 一致（不一致直接失败退出，提示检查网段配置）
      ansible.builtin.command: grep -A 4 'net-conf.json' {{ download_dir }}/kube-flannel.yml
      register: flannel_conf
      changed_when: false
      failed_when: pod_cidr not in flannel_conf.stdout

    - name: 安装 flannel（kubectl apply，幂等）
      ansible.builtin.command: kubectl apply -f {{ download_dir }}/kube-flannel.yml
      register: flannel_apply
      changed_when: "'created' in flannel_apply.stdout"
      failed_when: flannel_apply.rc != 0

    # ---------- 4.5 验证控制平面 ----------
    - name: 等待 CoreDNS 就绪（轮询：init 完成后 addon Pod 创建有延迟，kubectl wait 对不存在的 Pod 会立即报错）
      # 不用 kubectl wait：CoreDNS Pod 尚未创建时它直接报 no matching resources found（不等待）。
      # 轮询 10 分钟：每 5 秒查一次 kube-dns Pod 状态，全部 Running 才通过；
      # 超时则输出 kube-system 全部 Pod 状态和节点状态，方便定位（多为 flannel 未就绪或镜像未拉完）
      ansible.builtin.shell: |
        for i in $(seq 1 120); do
          STATUS=$(kubectl get pods -l k8s-app=kube-dns -n kube-system --no-headers 2>/dev/null | awk '{print $3}' | sort -u)
          if [ "$STATUS" = "Running" ]; then
            echo "CoreDNS 已就绪（第 $i 次检查）"
            exit 0
          fi
          sleep 5
        done
        echo "===== 等待超时，诊断信息如下 =====" >&2
        echo "--- kube-system Pod 状态 ---" >&2
        kubectl get pods -n kube-system -o wide >&2
        echo "--- 节点状态 ---" >&2
        kubectl get nodes -o wide >&2
        exit 1
      changed_when: false

    - name: 显示控制平面 Pod 状态
      ansible.builtin.command: kubectl get pods -A
      register: pods_status
      changed_when: false

    - name: 输出控制平面 Pod 状态
      ansible.builtin.debug:
        var: pods_status.stdout_lines
EOF
```

### 3.8 plays/05-node-join.yml

```bash
cat > plays/05-node-join.yml <<'EOF'
# ============================================================
# 步骤 5：添加 node 节点 + 最终验证 —— 对应手工笔记第 5 节
# 官方文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/
# 幂等设计：检测 /etc/kubernetes/kubelet.conf，已加入则跳过
# join 命令每次在 master 上现场生成（kubeadm token create），不存在 token 过期问题
# serial: 1 —— 逐台加入，一台失败立即停止，避免批量出问题
# ============================================================
- name: 步骤 5 | 添加 node 节点
  hosts: k8s_nodes
  serial: 1
  any_errors_fatal: true
  become: true
  tasks:
    - name: 检查是否已加入集群（幂等：已加入则跳过 join）
      ansible.builtin.stat:
        path: /etc/kubernetes/kubelet.conf
      register: joined

    - name: 在 master 上现场生成 join 命令（含新 token，见官方 kubeadm token 文档）
      ansible.builtin.command: kubeadm token create --print-join-command
      delegate_to: "{{ groups['k8s_master'][0] }}"
      register: join_command
      changed_when: false
      when: not joined.stat.exists

    - name: 加入集群（join 失败立即中止）
      ansible.builtin.command: "{{ join_command.stdout }}"
      args:
        creates: /etc/kubernetes/kubelet.conf
      when: not joined.stat.exists

    - name: 确认 kubelet 服务运行
      ansible.builtin.systemd:
        name: kubelet
        state: started

# ============================================================
# 最终验证：等待所有节点 Ready（node 加入后 flannel DaemonSet
# 会自动在其上运行，需要 1~2 分钟，因此用轮询等待）
# ============================================================
- name: 最终验证 | 等待所有节点 Ready
  hosts: k8s_master
  any_errors_fatal: true
  become: true
  tasks:
    - name: 轮询等待所有节点 Ready（每 10 秒一次，超时即失败退出）
      ansible.builtin.command: kubectl get nodes --no-headers
      register: node_status
      until:
        - node_status.stdout_lines | length == groups['k8s_cluster'] | length
        - "'NotReady' not in node_status.stdout"
      retries: "{{ node_ready_retries }}"
      delay: 10
      changed_when: false

    - name: 显示集群节点状态
      ansible.builtin.command: kubectl get nodes -o wide
      register: nodes_out
      changed_when: false

    - name: 输出集群节点状态
      ansible.builtin.debug:
        var: nodes_out.stdout_lines

    - name: 部署完成提示
      ansible.builtin.debug:
        msg: "集群部署完成：{{ groups['k8s_cluster'] | length }} 个节点全部 Ready，可开始使用 kubectl 部署应用"
EOF
```

### 3.9 ansible.cfg（可选：自动处理 SSH 首次连接确认）

ansible 无法替你"输入 yes"——首次连接新节点时 SSH 的主机密钥确认是交互式的，非交互执行会直接 UNREACHABLE（见 1.3 节）。正确做法是告诉 SSH 不要问：把下面这个文件放在 `inventory.ini` 同目录，`ansible-playbook` 运行时会**自动读取当前目录的 `ansible.cfg`**，对所有成员生效，谁执行、在哪执行都不再需要人工确认：

```bash
cat > ansible.cfg <<'EOF'
[defaults]
# 关闭主机密钥检查：首次连接自动接受，不再询问 yes
# 仅建议实验/内网环境使用；生产环境请用 ssh-keyscan 预先登记密钥
host_key_checking = False
EOF
```

:::tip 更稳妥的变体  
如果既想免确认又保留"密钥变更告警"，把上面换成 `[ssh_connection]` 段的 `ssh_args = -o StrictHostKeyChecking=accept-new`：首次见到新密钥自动登记，密钥变化仍会拦截（防止中间人）。  
:::

## 4. 失败处理与幂等设计

**失败即中止**：

- 所有 play 设置 `any_errors_fatal: true`——任一节点任一任务失败，整个部署立即停止，不会"带病继续"
- 关键操作后都有验证任务（swap 是否关闭、br_netfilter 是否加载、SystemdCgroup 是否开启、三件套版本是否一致、flannel 网段是否匹配），验证不过直接失败退出
- GitHub 下载（containerd/runc/CNI/flannel）均设置超时，下载失败立即中止；国内网络建议先替换 `group_vars/all.yml` 中的镜像仓库变量，或给执行机配置代理

**可重复执行（幂等）**：

- 配置文件、软件包类任务：Ansible 模块自身幂等，无变化自动跳过
- 二进制解压/安装：`creates` 判断（如 `/usr/local/bin/containerd`），已安装直接跳过
- `kubeadm init`：检测 `/etc/kubernetes/admin.conf`，已初始化则**不会重复 init**
- `kubeadm join`：检测 `/etc/kubernetes/kubelet.conf`，已加入则跳过；join 命令每次在 master 上用 `kubeadm token create --print-join-command` 现场生成，**不存在 token 过期问题**
- node 加入采用 `serial: 1` 逐台执行，一台失败立即停止，不会批量出问题

**安装失败想重来**：先在失败节点执行 `kubeadm reset`（见手工笔记 6.7）并删除 `/etc/kubernetes` 后，直接重跑 playbook 即可。

**操作系统自动识别**：playbook 通过 `ansible_facts['os_family']` 自动走 RedHat（yum）或 Debian（apt）分支，与手工笔记中的双系统选项卡一一对应，无需修改。
