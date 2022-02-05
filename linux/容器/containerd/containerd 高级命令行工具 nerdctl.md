# containerd 高级命令行工具 nerdctl

[nerrdctl github地址](https://github.com/containerd/nerdctl)



# 1.nerdctl简介

安装containerd后是使用 `ctr` 操作管理 containerd 镜像容器，但是大家都习惯了使用 docker cli，`ctr` 使用起来可能还是不太顺手，为了能够让大家更好的转到 containerd 上面来，社区提供了一个新的命令行工具：[nerdctl](https://github.com/containerd/nerdctl)。nerdctl 是一个与 docker cli 风格兼容的 containerd 客户端工具，而且直接兼容 docker compose 的语法的，这就大大提高了直接将 containerd 作为本地开发、测试或者单机容器部署使用的效率。



# 2.nerdctl安装

## 2.1 未安装containerd

<span style=color:red>⚠️如果没有安装 containerd，则可以下载 nerdctl-full-\<VERSION>-linux-amd64.tar.gz 包进行安装</span>

```shell
export NERDCTL_VERSION=0.16.1
wget https://github.com/containerd/nerdctl/releases/download/v${NERDCTL_VERSION}/nerdctl-full-${NERDCTL_VERSION}-linux-amd64.tar.gz
```



## 2.2 已安装containerd

下载包

<span style=color:red>如果已经安装过了containerd，则直接下载 nerdctl-<VERSION\>-linux-amd64.tar.gz</span>

```shell
export NERDCTL_VERSION=0.16.1
wget https://github.com/containerd/nerdctl/releases/download/v${NERDCTL_VERSION}/nerdctl-${NERDCTL_VERSION}-linux-amd64.tar.gz
```



解压缩

```shell
# 查看包内容，解压缩后是2个sh文件和nerdctl二进制命令
$ tar tf nerdctl-${NERDCTL_VERSION}-linux-amd64.tar.gz 
nerdctl
containerd-rootless-setuptool.sh
containerd-rootless.sh

# 解压缩包
tar xf nerdctl-${NERDCTL_VERSION}-linux-amd64.tar.gz

# 移动nerdctl至/usr/local/bin
mv nerdctl /usr/local/bin
```



验证

```shell
$ nerdctl version
Client:
 Version:	v0.16.1
 Git commit:	c4bd56b3aa220db037cc6c0a4e0c8cc062f2cc4c

Server:
 containerd:
  Version:	v1.5.9
  GitCommit:	1407cab509ff0d96baa4f0eb6ff9980270e6e620
```



# 3.nerdctl使用

nerdctl与docker命令几乎一致

## 3.1 构建镜像 `nerdctl build`

编辑dockerfile

```dockerfile
cat > Dockerfile << EOF
FROM nginx
RUN echo 'hehe' > /usr/share/nginx/html/index.html
EOF
```



执行构建，发现有报错，需要我们安装 `buildctl` 并运行 `buildkitd`，这是因为 `nerdctl build` 需要依赖 [buildkit](https://github.com/moby/buildkit) 工具

```shell
$ nerdctl build -t nginx:nerdctl -f Dockerfile .
FATA[0000] `buildctl` needs to be installed and `buildkitd` needs to be running, see https://github.com/moby/buildkit: exec: "buildctl": executable file not found in $PATH 
```



[buildkit](https://github.com/moby/buildkit) 项目也是 Docker 公司开源的一个构建工具包，支持 OCI 标准的镜像构建。它主要包含以下部分:

- 服务端 `buildkitd`：当前支持 runc 和 containerd 作为 worker，默认是 runc，我们这里使用 containerd
- 客户端 `buildctl`：负责解析 Dockerfile，并向服务端 buildkitd 发出构建请求

buildkit 是典型的 C/S 架构，客户端和服务端是可以不在一台服务器上，而 `nerdctl` 在构建镜像的时候也作为 `buildkitd` 的客户端，所以需要我们安装并运行 `buildkitd`



安装 `buildkit`

```shell
export BUILDKIT_VERSION=0.9.3
wget https://github.com/moby/buildkit/releases/download/v${BUILDKIT_VERSION}/buildkit-v${BUILDKIT_VERSION}.linux-amd64.tar.gz
```



解压缩包

```
tar xf buildkit-v${BUILDKIT_VERSION}.linux-amd64.tar.gz
```



解压后是一个 `bin` 目录，

```shell
$ tree bin
bin
├── buildctl
├── buildkitd
├── buildkit-qemu-aarch64
├── buildkit-qemu-arm
├── buildkit-qemu-i386
├── buildkit-qemu-mips64
├── buildkit-qemu-mips64el
├── buildkit-qemu-ppc64le
├── buildkit-qemu-riscv64
├── buildkit-qemu-s390x
└── buildkit-runc

0 directories, 11 files
```



我们需要2个命令 `buildctl` 、`buildkitd` 

```shell
mv bin/{buildctl,buildkitd} /usr/local/bin/
```



验证

```shell
$ buildctl -v
buildctl github.com/moby/buildkit v0.9.3 8d2625494a6a3d413e3d875a2ff7dd9b1ed1b1a9

$ buildkitd -v
buildkitd github.com/moby/buildkit v0.9.3 8d2625494a6a3d413e3d875a2ff7dd9b1ed1b1a9
```



使用 systemd 管理 buildkitd

```shell
cat > /etc/systemd/system/buildkitd.service << EOF
[Unit]
Description=BuildKit
Documentation=https://github.com/moby/buildkit

[Service]
ExecStart=/usr/local/bin/buildkitd --oci-worker=false --containerd-worker=true

[Install]
WantedBy=multi-user.target
EOF
```



启动 buildkitd

```shell
systemctl daemon-reload && systemctl enable buildkitd && systemctl start buildkitd
```



查看启动状态

```shell
$ systemctl status buildkitd
● buildkitd.service - BuildKit
   Loaded: loaded (/etc/systemd/system/buildkitd.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2022-02-05 13:00:41 CST; 4s ago
     Docs: https://github.com/moby/buildkit
 Main PID: 12939 (buildkitd)
    Tasks: 7
   Memory: 9.8M
   CGroup: /system.slice/buildkitd.service
           └─12939 /usr/local/bin/buildkitd --oci-worker=false --containerd-worker=true

Feb 05 13:00:41 k8s-test systemd[1]: Started BuildKit.
Feb 05 13:00:41 k8s-test buildkitd[12939]: time="2022-02-05T13:00:41+08:00" level=warning msg="using host network as the default"
Feb 05 13:00:41 k8s-test buildkitd[12939]: time="2022-02-05T13:00:41+08:00" level=info msg="found worker \"7ny8c7t43qy4j9gkj8ugutt8q\", labels=map[or...
Feb 05 13:00:41 k8s-test buildkitd[12939]: time="2022-02-05T13:00:41+08:00" level=info msg="found 1 workers, default=\"7ny8c7t43qy4j9gkj8ugutt8q\""
Feb 05 13:00:41 k8s-test buildkitd[12939]: time="2022-02-05T13:00:41+08:00" level=warning msg="currently, only the default worker can be used."
Feb 05 13:00:41 k8s-test buildkitd[12939]: time="2022-02-05T13:00:41+08:00" level=info msg="running server on /run/buildkit/buildkitd.sock"
Hint: Some lines were ellipsized, use -l to show in full.
```





再次构建

```shell
$ nerdctl build -t nginx:nerdctl -f Dockerfile .
[+] Building 28.1s (6/6) FINISHED                                                                                                                       
 => [internal] load build definition from Dockerfile                                                                                               1.1s
 => => transferring dockerfile: 99B                                                                                                                0.0s
 => [internal] load .dockerignore                                                                                                                  1.0s
 => => transferring context: 2B                                                                                                                    0.0s
 => [internal] load metadata for docker.io/library/nginx:latest                                                                                    4.9s
 => [1/2] FROM docker.io/library/nginx@sha256:2834dc507516af02784808c5f48b7cbe38b8ed5d0f4837f16e78d00deb7e7767                                     5.9s
 => => resolve docker.io/library/nginx@sha256:2834dc507516af02784808c5f48b7cbe38b8ed5d0f4837f16e78d00deb7e7767                                     0.2s
 => => extracting sha256:5eb5b503b37671af16371272f9c5313a3e82f1d0756e14506704489ad9900803                                                          2.1s
 => => extracting sha256:1ae07ab881bd848493ad54c2ba32017f94d1d8dbfd0ba41b618f17e80f834a0f                                                          2.3s
 => => extracting sha256:78091884b7bea0fa918527207924e9993bcc21bf7f1c9687da40042ceca31ac9                                                          0.3s
 => => extracting sha256:091c283c6a66ad0edd2ab84cb10edacc00a1a7bc5277f5365c0d5c5457a75aff                                                          0.2s
 => => extracting sha256:55de5851019b8f65ed6e28120c6300e35e556689d021e4b3411c7f4e90a9704b                                                          0.2s
 => => extracting sha256:b559bad762bec166fd028483dd2a03f086d363ee827d8c98b7268112c508665a                                                          0.2s
 => [2/2] RUN echo 'hehe' > /usr/share/nginx/html/index.html                                                                                       5.8s
 => exporting to oci image format                                                                                                                  7.3s
 => => exporting layers                                                                                                                            1.7s
 => => exporting manifest sha256:4d1e59bbbfb8ee312290b9e377e6b116f7957ee623e2d38b0e75c99d1ba3ece4                                                  0.2s
 => => exporting config sha256:b3d0a6dd26eb0181ec1cc98d21b580fb61b96d656de91245d1ff342d9963a1e2                                                    0.2s
 => => sending tarball                                                                                                                             4.9s
unpacking docker.io/library/nginx:nerdctl (sha256:4d1e59bbbfb8ee312290b9e377e6b116f7957ee623e2d38b0e75c99d1ba3ece4)...done
```



查看构建

```shell
$ nerdctl images
REPOSITORY     TAG        IMAGE ID        CREATED           PLATFORM       SIZE
nginx          nerdctl    4d1e59bbbfb8    29 seconds ago    linux/amd64    146.2 MiB
```



根据构建的镜像启动一个容器

```shell
$ nerdctl run -d -p 80:80 --name=nginx --restart=always nginx:nerdctl
4476ea62f983e67108ccc1c208a2ac8aaa80af63d439e8d701ab1633d037e1f5
```



查看启动的容器

```shell
$ nerdctl ps -a
CONTAINER ID    IMAGE                              COMMAND                   CREATED          STATUS    PORTS                 NAMES
4476ea62f983    docker.io/library/nginx:nerdctl    "/docker-entrypoint.…"    2 minutes ago    Up        0.0.0.0:80->80/tcp    nginx    
```



访问容器

```shell
$ curl 127.0.0.1:80
hehe
```



这样我们就使用 `nerdctl + buildkitd` 轻松完成了容器镜像的构建。当然如果你还想在单机环境下使用 Docker Compose，在 containerd 模式下，我们也可以使用 `nerdctl` 来兼容该功能。同样我们可以使用 `nerdctl compose`、`nerdctl compose up`、`nerdctl compose logs`、`nerdctl compose build`、`nerdctl compose down` 等命令来管理 Compose 服务。这样使用 containerd、nerdctl 结合 buildkit 等工具就完全可以替代 docker 在镜像构建、镜像容器方面的管理功能了