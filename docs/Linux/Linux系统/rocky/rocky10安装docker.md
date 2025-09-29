# rocky10安装docker

rocky10按照 [官方文档](https://docs.rockylinux.org/10/zh/gemstones/containers/docker/) 是无法安装docker的，会提示如下，在githubs上有老外提过 [issue](https://github.com/rocky-linux/documentation/issues/2854)

```shell
$ sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
Last metadata expiration check: 0:48:55 ago on Mon 29 Sep 2025 17:55:40 CST.
No match for argument: docker-ce
No match for argument: docker-ce-cli
No match for argument: containerd.io
No match for argument: docker-buildx-plugin
No match for argument: docker-compose-plugin
Error: Unable to find a match: docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```



解决方法可以参考 [rocky10安装docker](https://www.server-world.info/en/note?os=Rocky_Linux_10&p=docker&f=1)

删除 `podman` 、`runc`

```shell
dnf -y remove podman runc
```



添加源

```shell
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```



修改文件

```shell
sed -i -e "s/enabled=1/enabled=0/g" /etc/yum.repos.d/docker-ce.repo
```



安装docker

:::tip 说明

可通过如下安装指定版本docker

```shell
dnf --enablerepo=docker-ce-stable -y install docker-ce-28.3.3
```

:::

```shell
dnf --enablerepo=docker-ce-stable -y install docker-ce
```



启动docker并开机自启

```shell
systemctl enable --now docker
```



查看docker版本

```shell
$ docker version
Client: Docker Engine - Community
 Version:           28.4.0
 API version:       1.51
 Go version:        go1.24.7
 Git commit:        d8eb465
 Built:             Wed Sep  3 21:00:25 2025
 OS/Arch:           linux/arm64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          28.4.0
  API version:      1.51 (minimum version 1.24)
  Go version:       go1.24.7
  Git commit:       249d679
  Built:            Wed Sep  3 20:58:59 2025
  OS/Arch:          linux/arm64
  Experimental:     false
 containerd:
  Version:          v1.7.28
  GitCommit:        b98a3aace656320842a23f4a392a33f46af97866
 runc:
  Version:          1.3.0
  GitCommit:        v1.3.0-0-g4ca628d1
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

