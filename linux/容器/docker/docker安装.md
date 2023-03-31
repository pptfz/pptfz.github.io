[toc]

快速安装

```shell
# 阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum -y install docker-ce

systemctl start docker && systemctl enable docker  

# 配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```





# CentOS7安装docker

## 1.安装docker最新版

### 1.1 下载yum源

```python
# 阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```



### 1.2 安装docker最新版

```python
yum -y install docker-ce
```



### 1.3 启动docker

```python
systemctl start docker && systemctl enable docker  
```



### 1.4 查看docker版本

```python
$ docker version
Client:
 Version:           18.09.1
 API version:       1.39
 Go version:        go1.10.6
 Git commit:        4c52b90
 Built:             Wed Jan  9 19:35:01 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          18.09.1
  API version:      1.39 (minimum version 1.12)
  Go version:       go1.10.6
  Git commit:       4c52b90
  Built:            Wed Jan  9 19:06:30 2019
  OS/Arch:          linux/amd64
  Experimental:     false
```



### 1.5 配置docker镜像加速

```python
# 配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```



### 1.6 创建并运行第一个容器

```python
$ docker run -d -p 80:80 nginx
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
6ae821421a7d: Pull complete 
da4474e5966c: Pull complete 
eb2aec2b9c9f: Pull complete 
Digest: sha256:dd2d0ac3fff2f007d99e033b64854be0941e19a2ad51f174d9240dda20d9f534
Status: Downloaded newer image for nginx:latest
6cd3a11bda37336b8d6f0ba3e266e697945f72d520bbd0225a6e93818c8d581d
```





## 2.安装docker指定版本

### 2.1 下载yum源

```python
# 阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```



### 2.2 查看可用版本

```python
$ yum list docker-ce --showduplicates | sort -r
已加载插件：fastestmirror, langpacks
可安装的软件包
 * webtatic: uk.repo.webtatic.com
 * updates: mirrors.aliyun.com
Loading mirror speeds from cached hostfile
 * extras: mirrors.aliyun.com
docker-ce.x86_64            3:19.03.3-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.2-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.1-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.0-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.9-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.8-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.7-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.6-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.5-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.4-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.3-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.2-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.1-3.el7                     docker-ce-stable
docker-ce.x86_64            3:18.09.0-3.el7                     docker-ce-stable
docker-ce.x86_64            18.06.3.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.06.2.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.06.1.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.06.0.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.03.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            18.03.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.12.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.12.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.09.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.09.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.2.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.3.ce-1.el7                    docker-ce-stable
docker-ce.x86_64            17.03.2.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.0.ce-1.el7.centos             docker-ce-stable
```



### 2.3 安装docker指定版本

```python
yum -y install docker-ce-18.03.1.ce docker-ce-cli-18.01.1.ce
```



### 2.4 查看版本

```python
$ docker -v
Docker version 18.03.1-ce, build 9ee9f40
```



### 2.5 配置docker镜像加速

```python
# 配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```



## 3.二进制安装docker

**系统环境**

| 内核版本               | 内存 | docker版本 |
| ---------------------- | ---- | ---------- |
| 3.10.0-1062.el7.x86_64 | 1c2G | 18.09.9    |

[docker二进制包下载地址](https://download.docker.com/linux/static/stable/x86_64/)

### 3.1 下载docker二进制包

```python
export DOCKER_VERSION=18.09.9
wget https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz
```



### 3.2 解压缩包

```python
tar xf docker-DOCKER_VERSION.tgz -C /usr/local/
```



### 3.3 导出环境变量

⚠️如果后续想要使用systemd管理docker，最好把docker二进制包中的所有文件拷贝到``/usr/bin``，否则会管理失败

```python
cp /usr/local/docker/* /usr/bin
```



### 3.4 使用systemd管理docker

[Control Docker with systemd 官方文档关于使用systemd管理docker的说明](https://docs.docker.com/config/daemon/systemd/)



如果你是使用二进制方式安装的 docker，那么你也许需要整合 docker 到 systemd 中去。为了完成这个任务，你需要安装两个单元文件（service 和 socket）到 /etc/systemd/system 中去

> Manually create the systemd unit files
>
> When installing the binary without a package, you may want to integrate Docker with systemd. For this, install the two unit files (`service` and `socket`) from [the github repository](https://github.com/moby/moby/tree/master/contrib/init/systemd) to `/etc/systemd/system`.



⚠️需要下载的是``docker.service.rpm``和``docker.socket``这两个文件，需要把``docker.service.rpm``重命名为``docker.service``，然后再移动到``/etc/systemd/system``下

```python
wget https://github.com/moby/moby/raw/branch/branch/master/contrib/init/systemd/docker.service.rpm
wget https://github.com/moby/moby/raw/branch/branch/master/contrib/init/systemd/docker.socket  
```



**这里我们直接向文件写入内容**

**docker.service**

```python
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



**docker.socket**

```python
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



[linux 中 /etc/systemd/system和/usr/lib/systemd/system 的区别](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)



每一个 Unit（服务等） 都有一个配置文件，告诉 Systemd 怎么启动这个 Unit 。
Systemd 默认从目录`/etc/systemd/system/`读取配置文件。
但是，里面存放的大部分文件都是符号链接，指向目录`/usr/lib/systemd/system/`，真正的配置文件存放在那个目录。 `systemctl enable `命令用于在上面两个目录之间，建立符号链接关系。

```sh
sudo systemctl enable clamd@scan.service

# 等同于

sudo ln -s '/usr/lib/systemd/system/clamd@scan.service' '/etc/systemd/system/multi-user.target.wants/clamd@scan.service'
```



### 3.5 重新加载服务并启动docker

```python
systemctl daemon-reload
systemctl start docker && systemctl enable docker
```



### 3.6 验证docker版本

```python
$ docker version
Client: Docker Engine - Community
 Version:           18.09.9
 API version:       1.39
 Go version:        go1.11.13
 Git commit:        039a7df9ba
 Built:             Wed Sep  4 16:50:02 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          18.09.9
  API version:      1.39 (minimum version 1.12)
  Go version:       go1.11.13
  Git commit:       039a7df9ba
  Built:            Wed Sep  4 16:55:50 2019
  OS/Arch:          linux/amd64
  Experimental:     false
```



**⚠️<span style={{color: 'red'}}>二进制安装的dcoker默认是没有命令补全的，需要从yum安装的机器上拷贝 `/usr/share/bash-completion/completions`下名为docker的文件</span>**

加载文件生效

```sh
source /usr/share/bash-completion/docker
```

