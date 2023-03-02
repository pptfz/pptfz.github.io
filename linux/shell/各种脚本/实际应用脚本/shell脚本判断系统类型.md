[toc]



# shell脚本判断系统类型

## 一、场景说明

在生产环境中服务器的系统类型可能会有多种，例如有CentOS、Ubuntu、Debian等等，在做批量操作(如shell脚本、ansible等)的时候就需要对服务器等系统类型做判断，然后执行不同的命令，例如执行安装命令，CentOS系统执行 `yum` 命令，Ubuntu、Debian执行 `apt` 命令



## 二、判断方法

这里以常用的Ubuntu和CentOS为例

### 2.1 CentOS 

**方法一	查看文件**

`/etc/redhat-release `

```sh
$ cat /etc/redhat-release 
CentOS Linux release 7.8.2003 (Core)
```



`/etc/centos-release`

```sh
$ cat /etc/centos-release
CentOS Linux release 7.8.2003 (Core)
```



`/etc/issue`

```sh
# CentOS6中会显示具体版本，CentOS7中显示如下
$ cat /etc/issue
\S
Kernel \r on an \m
```



`/etc/os-release`

```sh
$ cat /etc/os-release 
NAME="CentOS Linux"
VERSION="7 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="7"
PRETTY_NAME="CentOS Linux 7 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:7"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-7"
CENTOS_MANTISBT_PROJECT_VERSION="7"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="7"
```



**方法二	通过命令**

命令 `lsb_release`，通过 `yum -y install redhat-lsb-core`  安装

```sh
$ lsb_release -a
LSB Version:	:core-4.1-amd64:core-4.1-noarch
Distributor ID:	CentOS
Description:	CentOS Linux release 7.8.2003 (Core)
Release:	7.8.2003
Codename:	Core
```



### 2.2 Ubuntu

**方法一	查看文件**

```sh
$ cat /etc/issue
Ubuntu 16.04.1 LTS \n \l
```



**方法二	通过命令**

命令 `lsb_release` ，通过 `apt -y install lsb-core` 安装

```sh
$ lsb_release 
LSB Version:	core-9.20160110ubuntu0.2-amd64:core-9.20160110ubuntu0.2-noarch:security-9.20160110ubuntu0.2-amd64:security-9.20160110ubuntu0.2-noarch
```



## 三、最佳判断方法

在生产我们常用的方法就是根据 `/etc/os-release` 返回的内容进行判断

[openvpn一键安装脚本](https://github.com/Nyr/openvpn-install/raw/branch/branch/master/openvpn-install.sh) 中有写对系统类型的判断

```sh
# Detect OS
# $os_version variables aren't always in use, but are kept here for convenience
if grep -qs "ubuntu" /etc/os-release; then
	os="ubuntu"
	os_version=$(grep 'VERSION_ID' /etc/os-release | cut -d '"' -f 2 | tr -d '.')
	group_name="nogroup"
elif [[ -e /etc/debian_version ]]; then
	os="debian"
	os_version=$(grep -oE '[0-9]+' /etc/debian_version | head -1)
	group_name="nogroup"
elif [[ -e /etc/centos-release ]]; then
	os="centos"
	os_version=$(grep -oE '[0-9]+' /etc/centos-release | head -1)
	group_name="nobody"
elif [[ -e /etc/fedora-release ]]; then
	os="fedora"
	os_version=$(grep -oE '[0-9]+' /etc/fedora-release | head -1)
	group_name="nobody"
else
	echo "This installer seems to be running on an unsupported distribution.
Supported distributions are Ubuntu, Debian, CentOS, and Fedora."
	exit
fi
```





**判断示例**

```sh
$ grep -w NAME /etc/os-release |awk -F'[="]+' '{print $2}'
CentOS Linux

$ grep -w NAME /etc/os-release |awk -F'[="]+' '{print $2}'
Ubuntu
```

