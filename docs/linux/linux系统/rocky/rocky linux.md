# rocky linux

[rocky linux 官网](https://rockylinux.org/)

[rocky linux github](https://github.com/rocky-linux/rocky)



## 操作系统信息

系统版本

```sh
$ cat /etc/redhat-release 
Rocky Linux release 9.3 (Blue Onyx)
```



内核版本（这里是在mac m芯片下的虚拟机实验，因此是arm架构）

```sh
$ uname -a
Linux localhost.localdomain 5.14.0-362.8.1.el9_3.aarch64 #1 SMP PREEMPT_DYNAMIC Thu Nov 9 05:21:32 UTC 2023 aarch64 aarch64 aarch64 GNU/Linux
```



## 时间

### 配置时间同步

```shell
echo "*/10 * * * * /usr/sbin/ntpdate ntp2.aliyun.com &>/dev/null" >> /var/spool/cron/root
```



### 设置24小时制

:::tip 说明

rocky9默认是12小时制

```shell
$ date
Wed May 15 02:49:40 PM CST 2024
```

:::



修改为24小时制，需要重新登陆

```shell
localectl set-locale LC_TIME=en_GB.UTF-8
```



## yum源

### 修改yum源为 [阿里云](https://developer.aliyun.com/mirror/rockylinux?spm=a2c6h.13651102.0.0.5a511b11685jQw)

```shell
sed -e 's|^mirrorlist=|#mirrorlist=|g' \
    -e 's|^#baseurl=http://dl.rockylinux.org/$contentdir|baseurl=https://mirrors.aliyun.com/rockylinux|g' \
    -i.bak \
    /etc/yum.repos.d/rocky*.repo

dnf makecache
```



### 修改epel源为 [阿里云](https://developer.aliyun.com/mirror/?serviceType=&tag=&keyword=epel)

[epel源官方网站](https://docs.fedoraproject.org/en-US/epel/)

安装 epel 源

```shell
dnf config-manager --set-enabled crb
dnf -y install epel-release
```



修改epel源为阿里云

```shell
sed -e 's|^metalink=|#metalink=|g' \
    -e 's|#baseurl=https://download.example/pub|baseurl=https://mirrors.aliyun.com|g' \
    -i.bak \
    /etc/yum.repos.d/epel*.repo
```



删除无用文件

```shell
mv /etc/yum.repos.d/epel-cisco-openh264.repo{,.old}
```



更新软件包索引和元数据

```shell
dnf makecache
```



## 网络

rocky linux 9 的网卡配置文件在 `/etc/NetworkManager/system-connections` 

```sh
$ ls /etc/NetworkManager/system-connections
enp0s5.nmconnection
```



网卡配置文件 `enp0s5.nmconnection` 内容如下

```sh
[connection]
id=enp0s5
uuid=7a0f760a-1618-3036-8d84-fda65a273071
type=ethernet
autoconnect-priority=-999
interface-name=enp0s5
timestamp=1714748743

[ethernet]

[ipv4]
address1=10.0.0.222/24,10.0.0.254
dns=223.5.5.5;180.76.76.76;114.114.114.114;
method=manual

[ipv6]
addr-gen-mode=eui64
method=auto

[proxy]
```

### networkManager

rocky linux 使用 [networkManager](https://github.com/BornToBeRoot/NETworkManager) 管理网络

[networkManager官网](https://borntoberoot.net/NETworkManager/)

#### 重启网络

:::tip 说明

使用如下命令重启网络会导致单个网卡出现2个ip，需要重启服务器才可以

```sh
systemctl restart NetworkManager
```

:::

使用如下命令可不重启服务器使网卡ip修改生效

```shell
# 查看连接名，一般为网卡名称
nmcli connection show

# 重载网卡
nmcli connection reload
nmcli connection up <连接名>
```



## ssh

### 允许root远程登陆

```shell
修改
	PermitRootLogin prohibit-password
修改为
	PermitRootLogin yes
```



## 安装软件包

### dnf安装

:::tip 说明

在rocky9中 `ntpdate` 命令的安装包名是 `ntpsec`

:::

```shell
dnf -y install ntpsec tar wget net-tools git vim tree lrzsz htop iftop iotop psmisc python3-devel zlib zlib-devel gcc gcc-c++ conntrack-tools jq socat bash-completion telnet nload strace tcpdump lsof sysstat telnet curl
```



### pip安装

```sh
# 安装 glances mycli 
pip3 install --upgrade pip
pip3 install glances mycli==1.24.0
```





## 关闭操作

### 关闭swap

```shell
sed -i.bak 's/.*swap.*/#&/' /etc/fstab
```



### 关闭防火墙

```shell
systemctl disable firewalld
```



### 关闭selinux

```shell
sed -i.bak 's/^SELINUXTYPE/#&/' /etc/selinux/config
```



## 优化操作

### 配置历史命令显示时间

```shell
cat >> /etc/bashrc << EOF
HISTFILESIZE=2000
HISTSIZE=2000
HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTTIMEFORMAT
EOF
source /etc/bashrc
```



### 修改系统最大文件描述符

```shell
cat >> /etc/security/limits.conf <<'EOF'
root soft nofile 65535
root hard nofile 65535
* soft nofile 65535
* hard nofile 65535
EOF
```



### 配置pip国内源

这里选择配置成 [阿里云源](https://developer.aliyun.com/mirror/pypi?spm=a2c6h.13651102.0.0.2ac31b112X3ylc)

```shell
[ -d ~/.pip ] || mkdir ~/.pip
cat > ~/.pip/pip.conf << EOF
[global]
index-url = https://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
EOF
```



### 设置别名

```shell
cat >> ~/.bashrc << EOF
alias n='netstat -ntpl'
alias u='netstat -nupl'
alias a='netstat -natupl'
EOF
```

