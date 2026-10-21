# ubuntu使用记录

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

记录 ubuntu 各版本使用中的配置与踩坑，涉及版本差异的内容用选项卡区分（同一页面的版本选项卡联动切换）。

:::info 版本说明

| 版本 | 代号 | 状态 |
| :--- | :--- | :--- |
| 18.04 | bionic | 标准支持已结束（2023-05），仅 ESM 扩展安全维护 |
| 22.04 | jammy | LTS，标准支持至 2027-04 |
| 26.04 | resolute | LTS（2026-04 发布），安装过程见 [Ubuntu26.04安装](./Ubuntu26.04安装.md) |

:::

## 配置网络

ubuntu 各版本均使用 [netplan](https://github.com/canonical/netplan) 管理网络，配置文件在 `/etc/netplan/` 目录下，但**不同版本的默认配置文件名和语法有差异**，注意区分：

<Tabs groupId="ubuntu-version">
  <TabItem value="1804" label="18.04" default>

默认配置文件是 `/etc/netplan/01-network-manager-all.yaml`（desktop 版默认由 NetworkManager 接管）

```yaml
//编辑文件
root@ubuntu18:~# cat /etc/netplan/01-network-manager-all.yaml
# Let NetworkManager manage all devices on this system
network:
    ethernets:
       enp0s5:		#⚠️这里要看一下网卡的名称
           dhcp4: false
           addresses: [10.0.0.15/24]
           gateway4: 10.0.0.1
           nameservers:
                 addresses: [223.5.5.5,114.114.114.114]
    version: 2
    renderer: networkd

//使设置生效
netplan apply
```

:::caution 注意

`gateway4` 写法只在老版本 netplan（18.04）可用，**22.04 起已废弃、26.04 已彻底移除**，新版必须用 `routes` 写法（见 22.04 / 26.04 选项卡）。

:::

  </TabItem>
  <TabItem value="2204" label="22.04">

### 禁用cloud-init

[cloud-init](https://github.com/canonical/cloud-init) 是用于跨平台云实例初始化的行业标准多分配方法

`/etc/netplan/50-cloud-init.yaml` 默认配置如下，其中的ip地址相关信息是在安装系统的时候指定的

```yaml
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        enp0s5:
            addresses:
            - 192.168.2.100/24
            nameservers:
                addresses:
                - 223.5.5.5
                - 114.114.114.114
                search: []
            routes:
            -   to: default
                via: 192.168.2.1
    version: 2
```

文件中注释处也有说明，如果想要禁用 `cloud-init` 需要在 `/etc/cloud/cloud.cfg.d/99-disable-network-config.cfg` 文件中写入内容 `network: {config: disabled}`

```shell
echo 'network: {config: disabled}' >> /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

### 配置静态ip

[ubuntu网络配置官方文档](https://documentation.ubuntu.com/server/explanation/networking/configuring-networks/index.html)

可以参考官方 [静态ip配置](https://documentation.ubuntu.com/server/explanation/networking/configuring-networks/index.html#static-ip-address-assignment) 文档

:::tip 说明

ubuntu网络配置需要在 `/etc/netplan` 目录下编辑 `*.yaml` 文件作为网络配置文件

注意修改 `ethernets` 的网卡名称，这里为 `eth0` ，ubuntu默认名称一般为 `enp*`

:::

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 10.10.10.2/24
      routes:
        - to: default
          via: 10.10.10.1
      nameservers:
          search: [mydomain, otherdomain]
          addresses: [10.10.10.1, 1.1.1.1]
```

### 应用网络配置

```shell
netplan apply
```

#### 执行 `netplan apply` 有警告

```shell
WARNING:root:Cannot call Open vSwitch: ovsdb-server.service is not running.
```

解决方法

安装 Open vSwitch（包含 `ovsdb-server`）

`ovsdb-server` 是 **Open vSwitch** 的一个组件，因此你需要安装 **Open vSwitch** 来获取它。

首先，更新你的包列表并安装 **Open vSwitch**：

```shell
sudo apt update
sudo apt install openvswitch-switch
```

安装后，你可以检查 `ovsdb-server` 服务的状态：

```shell
sudo systemctl status ovsdb-server
```

启动并启用 `ovsdb-server` 服务

:::tip 说明

安装后，你可以启动 `ovsdb-server` 服务，并确保它在系统启动时自动启动

:::

```shell
sudo systemctl start ovsdb-server
sudo systemctl enable ovsdb-server
```

确认 `ovsdb-server` 是否运行

:::tip 说明

 `ovsdb-server` 运行成功后，在执行 `netplan apply` 就不会有警告了

:::

```shell
sudo systemctl status ovsdb-server
```

检查 Open vSwitch 配置

你可以使用以下命令检查 Open vSwitch 配置，这将显示 Open vSwitch 的当前配置，确认 `ovsdb-server` 已正确运行

```shell
sudo ovs-vsctl show
```

  </TabItem>
  <TabItem value="2604" label="26.04">

默认配置文件是安装器（subiquity）生成的 `/etc/netplan/00-installer-config.yaml`

:::caution 注意

26.04 的 netplan 为 1.2 版本，**旧写法 `gateway4` 已彻底删除**，网关必须用 `routes` 写法；另外配置文件权限过宽（全局可读）会触发告警，建议 `chmod 600`。

:::

### DHCP 拿不到 IPv4 的坑（Parallels 虚机实测）

安装器默认配置 `dhcp4: true` 写得没问题，网卡状态也是 `UP`，但只有 IPv6 链路本地地址，**IPv4 一直拿不到**——这是 Parallels 共享网络（Shared Network）的 DHCP 服务没响应，虚拟机侧怎么 `netplan apply` 都没用。

排查方法：

```bash
ip -4 addr show enp0s5    # 只有 fe80:: 开头的 v6 地址、没有 inet v4，即 DHCP 未响应
sudo networkctl status enp0s5 | head -30
journalctl -u systemd-networkd -b --no-pager | grep -iE 'dhcp|enp0s5' | tail -20
```

:::tip 说明

不等 DHCP，直接配静态 IP 立即可用，这也是最终的定版配置。注意 Parallels 的 DHCP 地址池默认从 `10.211.55.3` 左右开始，静态 IP 选 `.30`~`.200` 不会撞地址。

:::

### 配置静态 ip（实测定版）

Parallels 共享网络默认网段 `10.211.55.0/24`，网关 `10.211.55.1`。先在 **Mac 上**确认：`ifconfig vnic0` 看到 `inet 10.211.55.2` 即为此网段，否则整体替换。

保留安装器生成的 `match` / `set-name` 结构（MAC 地址以 `ip a` 输出为准）：

```bash
sudo tee /etc/netplan/00-installer-config.yaml <<'EOF'
network:
  version: 2
  ethernets:
    enp0s5:
      dhcp4: false
      dhcp6: false
      match:
        macaddress: 00:1c:42:ec:09:0b
      set-name: enp0s5
      addresses:
        - 10.211.55.30/24
      routes:
        - to: default
          via: 10.211.55.1
      nameservers:
        addresses: [223.5.5.5, 114.114.114.114]
EOF

sudo chmod 600 /etc/netplan/00-installer-config.yaml
sudo netplan apply
```

验证：

```bash
ip -4 addr show enp0s5     # 应看到 inet 10.211.55.30/24
ip route                    # 应有 default via 10.211.55.1
ping -c 3 223.5.5.5         # 通外网
```

云镜像（VPS/公有云）的机器由 cloud-init 托管网络，需要先禁用再自建配置：

```shell
echo 'network: {config: disabled}' | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
sudo rm /etc/netplan/50-cloud-init.yaml
# 删除后必须紧接着写好自己的 netplan 配置再重启，否则下次开机无网络
```

  </TabItem>
</Tabs>

## 查看IP信息

:::tip 说明

ubuntu 最小化/服务器安装不带 `net-tools`（没有 `ifconfig`），统一用 `ip` / `netplan` / `resolvectl` 这套。

:::

```bash
ip addr                 # 所有网卡及 IP（简写 ip a）
ip -br a                # 精简输出，一行一个网卡，日常查 IP 最快
ip -4 addr show enp0s5  # 只看某网卡的 IPv4（静态地址 valid_lft 显示 forever，DHCP 显示倒计时）
ip route                # 路由表（确认网关和默认路由）
resolvectl status       # DNS 配置
sudo netplan status     # netplan 视角总览：网卡、IP、后端(networkd)、配置文件来源
```

## 开启 SSH 服务

:::tip 说明

Server 版安装时勾选了 `Install OpenSSH server` 的无需此步，18.04 **desktop 版**默认只装了 ssh-agent，需要手动装 sshd：

:::

```shell
sudo apt -y install openssh-server

//启动服务
sudo service ssh start
```

## 安装 python3.6

:::tip 说明

ubuntu18.04 默认 python 版本是 3.7

:::

```shell
root@ubuntu18:~# python3
Python 3.7.5rc1 (default, Oct  8 2019, 16:47:45)
[GCC 9.2.1 20191008] on linux
Type "help", "copyright", "credits" or "license" for more information.

root@ubuntu18:~# python3.7
Python 3.7.5rc1 (default, Oct  8 2019, 16:47:45)
[GCC 9.2.1 20191008] on linux
Type "help", "copyright", "credits" or "license" for more information.
```

安装依赖包

```shell
apt -y install python3-dev libffi-dev libssl-dev zlib*
```

源码编译安装 python3.6

```shell
./configure --enable-optimizations --prefix=/usr/local/python36
make
make altinstall		#防止覆盖原来的版本
```

设置环境变量

```shell
echo "PATH=/usr/local/python36/bin:$PATH" >/etc/profile.d/python36.sh && source /etc/profile.d/python36.sh
```

设置 pip 国内源

```shell
mkdir /root/.pip
cat >/root/.pip/pip.conf <<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
EOF
```

[ubuntu安装python3.6问题](https://stackoverflow.com/questions/41489439/pip3-installs-inside-virtual-environment-with-python3-6-failing-due-to-ssl-modul)

## 配置国内安装源

先备份原有文件：

```shell
cp /etc/apt/sources.list{,.bak}
```

各版本的源配置文件与代号不同：

<Tabs groupId="ubuntu-version">
  <TabItem value="1804" label="18.04" default>

配置文件为 `/etc/apt/sources.list`，代号 `bionic`：

```shell
cat >/etc/apt/sources.list<<'EOF'
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
EOF

//更新
apt update
```

  </TabItem>
  <TabItem value="2204" label="22.04">

配置文件为 `/etc/apt/sources.list`，代号 `jammy`：

```shell
cat > /etc/apt/sources.list <<'EOF'
deb https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse

# deb https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
EOF
```

arm架构下执行 `apt update` 报错404

:::tip 说明

原因是机器的cpu是arm架构，默认匹配都是x86架构处理器的软件包，用错源自然找不到所需的包裹信息，报404错误

解决方法是将源中 `ubuntu` 全部替换为为 `ubuntu-ports` 即可

:::

```shell
Err:57 https://mirrors.aliyun.com/ubuntu jammy-updates/main arm64 Packages
  404  Not Found [IP: 211.100.18.47 443]
Ign:58 https://mirrors.aliyun.com/ubuntu jammy-updates/restricted arm64 Packages
Ign:59 https://mirrors.aliyun.com/ubuntu jammy-updates/universe arm64 Packages
Ign:60 https://mirrors.aliyun.com/ubuntu jammy-updates/multiverse arm64 Packages
Err:61 https://mirrors.aliyun.com/ubuntu jammy-backports/main arm64 Packages
  404  Not Found [IP: 211.100.18.47 443]
Ign:62 https://mirrors.aliyun.com/ubuntu jammy-backports/universe arm64 Packages
Ign:63 https://mirrors.aliyun.com/ubuntu jammy-backports/multiverse arm64 Packages
Reading package lists... Done
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-security/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-updates/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-backports/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Some index files failed to download. They have been ignored, or old ones used instead.
```

  </TabItem>
  <TabItem value="2604" label="26.04">

26.04 改用 **deb822 格式**，配置文件不再是 `/etc/apt/sources.list`，而是 `/etc/apt/sources.list.d/ubuntu.sources`（安装时可在镜像源一步直接填国内地址）。

装完后替换为国内源，直接对文件内的 URI 做替换即可（无需手写整个文件）：

```shell
# 备份
cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

# 将官方源替换为阿里云镜像
sed -i 's|http://archive.ubuntu.com/ubuntu|https://mirrors.aliyun.com/ubuntu|g; s|http://security.ubuntu.com/ubuntu|https://mirrors.aliyun.com/ubuntu|g' /etc/apt/sources.list.d/ubuntu.sources

# 更新
apt update
```

:::tip 说明

deb822 格式的字段化结构（`Types` / `URIs` / `Suites`），26.04（resolute）按[阿里云官方镜像页](https://developer.aliyun.com/mirror/ubuntu)的推荐配置是两个 stanza（security 单独一个）：

```yaml
Types: deb
URIs: https://mirrors.aliyun.com/ubuntu
Suites: resolute resolute-updates resolute-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: https://mirrors.aliyun.com/ubuntu
Suites: resolute-security
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

:::

  </TabItem>
</Tabs>

## 禁用防火墙

```shell
sudo ufw disable
```

## 修改时区/时间

### 修改时区

查看时区

```shell
$ timedatectl
               Local time: Thu 2025-03-13 03:19:45 UTC
           Universal time: Thu 2025-03-13 03:19:45 UTC
                 RTC time: Thu 2025-03-13 03:19:45
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

列出可用时区

```shell
timedatectl list-timezones
```

设置时区

```shell
sudo timedatectl set-timezone Asia/Shanghai
```

验证修改

```shell
$ timedatectl
               Local time: Thu 2025-03-13 11:23:50 CST
           Universal time: Thu 2025-03-13 03:23:50 UTC
                 RTC time: Thu 2025-03-13 03:23:49
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

### 修改时间显示格式

ubuntu22.04/26.04默认是12小时制

```shell
$ date
Thu Mar 13 03:09:43 AM UTC 2025
```

方法一：编辑 `/etc/default/locale` ，增加如下内容（22.04 实测）

```shell
LC_TIME=en_DK.UTF-8
```

使配置生效

```shell
sudo locale-gen
sudo update-locale
```

方法二：`localectl` 一条命令（26.04 实测，同样重新登录后生效）

```shell
sudo locale-gen en_GB.UTF-8
sudo localectl set-locale LC_TIME=en_GB.UTF-8
```

验证（重新登录后）

```shell
$ date
Thu Mar 13 11:27:05 CST 2025
```

## 设置历史命令显示时间

编辑内容并使配置生效

<Tabs>
  <TabItem value="bash" label="bash" default>

```shell
cat >> ~/.bashrc << EOF
export HISTTIMEFORMAT='%F %T '
EOF

source ~/.bashrc
```

  </TabItem>
  <TabItem value="zsh" label="zsh">

```shell
cat >> ~/.zshrc << EOF
export HISTTIMEFORMAT='%F %T '
EOF

source ~/.zshrc
```

  </TabItem>
</Tabs>

输出示例

```shell
$ history
    1  2025-03-13 11:09:38 ping baidu.com
    2  2025-03-13 11:09:38 cd /etc/netplan/
    3  2025-03-13 11:09:38 ls
```

## 修改默认编辑器

ubuntu默认编辑器是 [nano](https://www.nano-editor.org/) ，例如执行 `visudo` 的时候就是使用nano打开的，但是用不习惯，使用如下命令修改为 [vim](https://www.vim.org/)

```shell
export EDITOR=vim
export VISUAL=vim
```

## 配置 `sudo su -` 不需要密码

在ubuntu22.04 `/etc/sudoers` 中进行如下配置是不生效的

```shell
youruser ALL=(ALL) NOPASSWD: ALL
```

如下配置是生效的

```shell
echo "youruser ALL=(ALL) NOPASSWD: /bin/su -" | sudo tee /etc/sudoers.d/youruser
```
