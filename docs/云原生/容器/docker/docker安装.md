[toc]

## 快速安装（官方脚本，自动判断系统）

官方提供一键安装脚本，会**自动判断当前发行版**（Ubuntu/Debian/CentOS/RHEL/Fedora/SLES 等），再选择对应包管理器完成安装，各系统通用：

```shell
# 下载官方一键安装脚本并执行
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 国内网络下载慢，可指定阿里云镜像源
# sh get-docker.sh --mirror Aliyun

# 启动并设置开机自启
systemctl enable --now docker
```

:::tip 手动安装

一键脚本适合新机器一把梭；需要控制版本、换软件源（阿里云等）或了解各发行版差异的，看下面的 [包管理器安装](#包管理器安装)。

:::



## 配置docker镜像加速

```json
{
    "registry-mirrors": [
        "https://0vmzj3q6.mirror.aliyuncs.com",
        "https://docker.m.daocloud.io",
        "https://mirror.baidubce.com",
        "https://dockerproxy.com",
        "https://mirror.iscas.ac.cn",
        "https://huecker.io",
        "https://dockerhub.timeweb.cloud",
        "https://noohub.ru",
        "https://vlgh0kqj.mirror.aliyuncs.com"
    ]
}
```



# docker安装

[docker官方安装文档（总览）](https://docs.docker.com/engine/install/)

官方支持包管理器安装的发行版（各发行版官方文档入口）：

| 发行版 | 包管理器 | 官方文档 |
| ------ | -------- | -------- |
| CentOS | yum/dnf | [install/centos](https://docs.docker.com/engine/install/centos/) |
| RHEL   | yum/dnf | [install/rhel](https://docs.docker.com/engine/install/rhel/) |
| Fedora | dnf     | [install/fedora](https://docs.docker.com/engine/install/fedora/) |
| Ubuntu | apt     | [install/ubuntu](https://docs.docker.com/engine/install/ubuntu/) |
| Debian | apt     | [install/debian](https://docs.docker.com/engine/install/debian/) |
| SLES   | zypper  | [install/sles](https://docs.docker.com/engine/install/sles/) |

:::tip 先判断系统再安装

不确定当前是什么系统时，先看 `/etc/os-release`：

```shell
cat /etc/os-release | grep -E "^(ID|VERSION_ID)="
# ID=ubuntu / centos / rhel / debian / fedora / sles ...
```

按 ID 选择下面对应的小节；懒得区分就用文首的官方一键脚本。

:::

## 包管理器安装

### CentOS / RHEL（yum）

#### 下载yum源

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="阿里云源" label="阿里云源" default>

```shell
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

  </TabItem>
  <TabItem value="官方源" label="官方源">

```shell
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

  </TabItem>
</Tabs>





#### 安装docker

<Tabs>

  <TabItem value="最新版" label="最新版" default>

```shell
yum -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

  </TabItem>

  <TabItem value="指定版本" label="指定版本">

查看可用版本

```shell
$ yum list docker-ce --showduplicates | sort -r
Loading mirror speeds from cached hostfile
Loaded plugins: fastestmirror, langpacks
Installed Packages
docker-ce.x86_64            3:26.1.4-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.1.4-1.el7                     @docker-ce-stable
docker-ce.x86_64            3:26.1.3-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.1.2-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.1.1-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.1.0-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.0.2-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.0.1-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:26.0.0-1.el7                     docker-ce-stable 
docker-ce.x86_64            3:25.0.5-1.el7                     docker-ce-stable 
......
```



安装指定版本

```shell
export DOCKER_VERSION=25.0.5
yum -y install docker-ce-${DOCKER_VERSION}.ce docker-ce-cli-${DOCKER_VERSION}.ce containerd.io docker-buildx-plugin docker-compose-plugin
```

 </TabItem>

</Tabs>



#### 启动docker

```shell
systemctl start docker && systemctl enable docker  
```



#### 查看docker版本

```shell
$ docker version
Client: Docker Engine - Community
 Version:           29.1.2
 API version:       1.52
 Go version:        go1.25.5
 Git commit:        890dcca
 Built:             Tue Dec  2 21:55:19 2025
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          29.1.2
  API version:      1.52 (minimum version 1.44)
  Go version:       go1.25.5
  Git commit:       de45c2a
  Built:            Tue Dec  2 21:55:19 2025
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v2.2.0
  GitCommit:        1c4457e00facac03ce1d75f7b6777a7a851e5c41
 runc:
  Version:          1.3.4
  GitCommit:        v1.3.4-0-gd6d73eb8
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```



### Ubuntu（apt）

官方文档：[docs.docker.com/engine/install/ubuntu](https://docs.docker.com/engine/install/ubuntu/)

#### 添加仓库并安装

```shell
# 1. 添加官方 GPG 密钥
apt-get update
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# 2. 添加 apt 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. 安装（最新版）
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. 启动并设置开机自启
systemctl enable --now docker
```

:::tip 换阿里云源

国内网络把上面第 2 步里的 `https://download.docker.com/linux/ubuntu` 替换为 `https://mirrors.aliyun.com/docker-ce/linux/ubuntu` 即可，其余不变。

:::

#### 安装指定版本（apt）

```shell
# 查看可用版本
apt-cache madison docker-ce | awk '{ print $3 }'

# 安装指定版本
export DOCKER_VERSION=29.1.2
apt-get install -y docker-ce=${DOCKER_VERSION} docker-ce-cli=${DOCKER_VERSION} containerd.io docker-buildx-plugin docker-compose-plugin
```

### Debian（apt）

官方文档：[docs.docker.com/engine/install/debian](https://docs.docker.com/engine/install/debian/)

流程与 Ubuntu 完全一致，只有两处不同：GPG 地址和仓库地址把 `ubuntu` 换成 `debian`，版本变量用 `$VERSION_CODENAME`：

```shell
# GPG 密钥
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# apt 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装与启动（同 Ubuntu）
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

### Fedora（dnf）

官方文档：[docs.docker.com/engine/install/fedora](https://docs.docker.com/engine/install/fedora/)

```shell
# 1. 安装 dnf 插件
dnf -y install dnf-plugins-core

# 2. 添加仓库
dnf config-manager addrepo --from-repofile=https://download.docker.com/linux/fedora/docker-ce.repo
# Fedora 40 及更早版本（dnf4）没有 addrepo 子命令，用：
# dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# 3. 安装并启动
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

:::tip RHEL 用户

RHEL 与 CentOS 用同一套 yum/dnf 流程，把仓库地址里的 `centos` 换成 `rhel` 即可（见上方表格的官方文档链接）。CentOS 8/9 的 `yum` 命令实际是 `dnf` 的别名，上文本体命令通用。

:::





## 二进制安装docker

[docker二进制包下载地址](https://download.docker.com/linux/static/stable/x86_64/)



### 下载docker二进制包

<Tabs>

  <TabItem value="amd64" label="amd64" default>

```shell
export DOCKER_VERSION=29.2.1
wget https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz
```

  </TabItem>

  <TabItem value="arm64" label="arm64">

```shell
export DOCKER_VERSION=29.2.1
wget https://download.docker.com/linux/static/stable/aarch64/docker-${DOCKER_VERSION}.tgz
```

  </TabItem>

</Tabs>



### 解压缩包

```shell
tar xf docker-${DOCKER_VERSION}.tgz -C /usr/local/
```



### 导出环境变量

:::tip 说明

如果后续想要使用systemd管理docker，最好把docker二进制包中的所有文件拷贝到 `/usr/bin` ，否则会管理失败

:::

```shell
cp /usr/local/docker/* /usr/bin
```



### 使用systemd管理docker

[Control Docker with systemd 官方文档关于使用systemd管理docker的说明](https://docs.docker.com/config/daemon/systemd/)



如果你是使用二进制方式安装的 docker，那么你也许需要整合 docker 到 systemd 中去。为了完成这个任务，你需要安装两个单元文件（service 和 socket）到 `/etc/systemd/system` 中去

:::tip 说明

Manually create the systemd unit files

When installing the binary without a package, you may want to integrate Docker with systemd. For this, install the two unit files (`service` and `socket`) from [the github repository](https://github.com/moby/moby/tree/master/contrib/init/systemd) to `/etc/systemd/system`.

:::

需要下载的是 ``docker.service.rpm`` 和 ``docker.socket`` 这两个文件，需要把 ``docker.service.rpm`` 重命名为 ``docker.service`` ，然后再移动到 ``/etc/systemd/system``下

```shell
wget https://github.com/moby/moby/raw/branch/branch/master/contrib/init/systemd/docker.service.rpm
wget https://github.com/moby/moby/raw/branch/branch/master/contrib/init/systemd/docker.socket  
```



这里我们直接向文件写入内容

- `docker.service`

```shell
cat > /etc/systemd/system/docker.service <<'EOF'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target

[Service]
Type=notify
# the default is not to use systemd for cgroups because the delegate issues still
# exists and systemd currently does not support the cgroup feature set required
# for containers run by docker
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
# Uncomment TasksMax if your systemd version supports it.
# Only systemd 226 and above support this version.
#TasksMax=infinity
TimeoutStartSec=0
# set delegate yes so that systemd does not reset the cgroups of docker containers
Delegate=yes
# kill only the docker process, not all processes in the cgroup
KillMode=process
# restart the docker process if it exits prematurely
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
EOF
```



- `docker.socket`

```shell
cat >/etc/systemd/system/docker.socket<<EOF
[Unit]
Description=Docker Socket for the API

[Socket]
# If /var/run is not implemented as a symlink to /run, you may need to
# specify ListenStream=/var/run/docker.sock instead.
ListenStream=/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF
```



[linux中 `/etc/systemd/system` 和 `/usr/lib/systemd/system` 的区别](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)



每一个 Unit（服务等） 都有一个配置文件，告诉 Systemd 怎么启动这个 Unit 。
Systemd 默认从目录 `/etc/systemd/system/` 读取配置文件。
但是，里面存放的大部分文件都是符号链接，指向目录 `/usr/lib/systemd/system/` ，真正的配置文件存放在那个目录。 `systemctl enable `命令用于在上面两个目录之间，建立符号链接关系。

:::tip 说明

 执行 `sudo systemctl enable clamd@scan.service` 等同于

`sudo ln -s '/usr/lib/systemd/system/clamd@scan.service' '/etc/systemd/system/multi-user.target.wants/clamd@scan.service'`

:::



### 重新加载服务并启动docker

```shell
systemctl daemon-reload
systemctl start docker && systemctl enable docker
```



### 补充点

:::tip 说明

二进制安装的dcoker默认是没有命令补全的，需要从yum安装的机器上拷贝 `/usr/share/bash-completion/completions` 下名为 `docker` 的文件并且移动到 `/usr/share/bash-completion/completions`

:::

加载文件生效

```shell
source /usr/share/bash-completion/completions/docker
```

