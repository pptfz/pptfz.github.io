# ubuntu22.04使用记录

## 配置网络

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

ubuntu使用 [netplan](https://github.com/canonical/netplan) 管理网络



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

```sh
sudo ovs-vsctl show
```







## 配置国内安装源

备份文件

```shell
cp /etc/apt/sources.list{,bak}
```



替换默认源

```shell
cat > /etc/apt/sources.list < EOF
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
Reading package lists... Done                                                  
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-security/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-updates/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Failed to fetch https://mirrors.aliyun.com/ubuntu/dists/jammy-backports/main/binary-arm64/Packages  404  Not Found [IP: 211.100.18.47 443]
E: Some index files failed to download. They have been ignored, or old ones used instead.
```





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





### 修改时间

ubuntu22.04默认是12小时制

```shell
$ date
Thu Mar 13 03:09:43 AM UTC 2025
```



编辑 `/etc/default/locale` ，增加如下内容

```sh
LC_TIME=en_DK.UTF-8
```



使配置生效

```sh
sudo locale-gen
sudo update-locale
```



验证

```shell
$ date
Thu Mar 13 11:27:05 AM CST 2025
```



## 设置历史命令显示时间

编辑内容并使配置生效

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

```bash
export EDITOR=vim
export VISUAL=vim
```



## 配置 `sudo su -` 不需要密码

在ubuntu22.04 `/etc/sudoers` 中进行如下配置是不生效的

```bash
youruser ALL=(ALL) NOPASSWD: ALL
```



如下配置是生效的

```shell
echo "youruser ALL=(ALL) NOPASSWD: /bin/su -" | sudo tee /etc/sudoers.d/youruser
```

