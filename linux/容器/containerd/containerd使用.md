# containerd使用

# 1.查看帮助

输入 `ctr` 命令即可获得所有相关的操作命令使用方式

```shell
$ ctr
NAME:
   ctr - 
        __
  _____/ /______
 / ___/ __/ ___/
/ /__/ /_/ /
\___/\__/_/

containerd CLI


USAGE:
   ctr [global options] command [command options] [arguments...]

VERSION:
   v1.5.9

DESCRIPTION:
   
ctr is an unsupported debug and administrative client for interacting
with the containerd daemon. Because it is unsupported, the commands,
options, and operations are not guaranteed to be backward compatible or
stable from release to release of the containerd project.

COMMANDS:
   plugins, plugin            provides information about containerd plugins
   version                    print the client and server versions
   containers, c, container   manage containers
   content                    manage content
   events, event              display containerd events
   images, image, i           manage images
   leases                     manage leases
   namespaces, namespace, ns  manage namespaces
   pprof                      provide golang pprof outputs for containerd
   run                        run a container
   snapshots, snapshot        manage snapshots
   tasks, t, task             manage tasks
   install                    install a new package
   oci                        OCI tools
   shim                       interact with a shim directly
   help, h                    Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --debug                      enable debug output in logs
   --address value, -a value    address for containerd's GRPC server (default: "/run/containerd/containerd.sock") [$CONTAINERD_ADDRESS]
   --timeout value              total timeout for ctr commands (default: 0s)
   --connect-timeout value      timeout for connecting to containerd (default: 0s)
   --namespace value, -n value  namespace to use with commands (default: "default") [$CONTAINERD_NAMESPACE]
   --help, -h                   show help
   --version, -v                print the version
```



# 2.镜像操作

## 2.1 拉取镜像 `ctr image pull`

containerd拉取镜像可以使用 `ctr image pull` 来完成，但是需要加上 `docker.io` Host 地址

**示例1**

```shell
# docker方法
docker pull gitea/gitea:1.16.0

# containerd方法
ctr image pull docker.io/gitea/gitea:1.16.0
```



**示例2**

```shell
# 使用docker拉取镜像最后会提示镜像完整地址，containerd拉取镜像的时候必须加上这个路径
$ docker pull nginx:alpine
alpine: Pulling from library/nginx
59bf1c3509f3: Pull complete 
...
40e5d2fe5bcd: Pull complete 
Digest: sha256:eb05700fe7baa6890b74278e39b66b2ed1326831f9ec3ed4bdc6361a4ac2f333
Status: Downloaded newer image for nginx:alpine
docker.io/library/nginx:alpine

# 使用containerd拉取
ctr image pull docker.io/library/nginx:alpine
```



## 2.2 列出本地镜像 `ctr image ls`

```shell
$ ctr image ls
REF                            TYPE                                                      DIGEST                                                                  SIZE     PLATFORMS                                                                                LABELS 
docker.io/gitea/gitea:1.16.0   application/vnd.docker.distribution.manifest.list.v2+json sha256:67ccf27b427ec65fd7378d0999a3d94e9649f1953d2bb115864faa71ce7b9ec2 98.4 MiB linux/amd64,linux/arm64/v8                                                               -      
docker.io/library/nginx:alpine application/vnd.docker.distribution.manifest.list.v2+json sha256:da9c94bec1da829ebd52431a84502ec471c8e548ffb2cedbf36260fd9bd1d4d3 9.7 MiB  linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x -      
```



使用 `-q（--quiet）` 选项可以只打印镜像名称

```shell
$ ctr image ls -q
docker.io/gitea/gitea:1.16.0
docker.io/library/nginx:alpine
```





## 2.3 检测本地镜像 `ctr image check`

主要查看其中的 `STATUS`，`complete` 表示镜像是完整可用的状态。

```shell
$ ctr image check
REF                            TYPE                                                      DIGEST                                                                  STATUS         SIZE              UNPACKED 
docker.io/gitea/gitea:1.16.0   application/vnd.docker.distribution.manifest.list.v2+json sha256:67ccf27b427ec65fd7378d0999a3d94e9649f1953d2bb115864faa71ce7b9ec2 complete (9/9) 98.4 MiB/98.4 MiB true
docker.io/library/nginx:alpine application/vnd.docker.distribution.manifest.list.v2+json sha256:da9c94bec1da829ebd52431a84502ec471c8e548ffb2cedbf36260fd9bd1d4d3 complete (7/7) 9.7 MiB/9.7 MiB   true
```



## 2.4 给镜像重新打标签 `ctr image tag`

```shell
# 打标签
$ ctr image tag docker.io/library/nginx:alpine abc.com/def/nginx:alpine
abc.com/def/nginx:alpine

# 查看
$ ctr image ls -q
abc.com/def/nginx:alpine
docker.io/gitea/gitea:1.16.0
docker.io/library/nginx:alpine
```



## 2.5 删除镜像 `ctr image rm`

:::tip

**<span style={{color: 'red'}}>加上 `--sync` 选项可以同步删除镜像和所有相关的资源</span>**

:::

```shell
# 查看镜像
$ ctr image ls -q
abc.com/def/nginx:alpine
docker.io/gitea/gitea:1.16.0
docker.io/library/nginx:alpine

# 删除镜像
$ ctr image rm abc.com/def/nginx:alpine
abc.com/def/nginx:alpine

# 再次查看镜像
$ ctr image ls -q
docker.io/gitea/gitea:1.16.0
docker.io/library/nginx:alpine
```



## 2.6 将镜像挂载到主机目录 `ctr image mount`

```shell
# 挂载
ctr image mount docker.io/library/nginx:alpine /mnt

$ ls  /mnt
bin  dev  docker-entrypoint.d  docker-entrypoint.sh  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

$ tree -L 1 /mnt
/mnt
├── bin
├── dev
├── docker-entrypoint.d
├── docker-entrypoint.sh
├── etc
├── home
├── lib
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin
├── srv
├── sys
├── tmp
├── usr
└── var

18 directories, 1 file
```



## 2.7 将镜像从主机目录上卸载 `ctr image unmount`

```shell
ctr image unmount /mnt
```



## 2.8 导出镜像 `ctr image export`

```shell
ctr image export --all-platforms nginx.tar.gz docker.io/library/nginx:alpine
```



执行命令报错

```shell
$ ctr image export --all-platforms nginx.tar.gz docker.io/library/nginx:alpine
ctr: content digest sha256:4bb6d6fd8bff453bece3b2dd033897ba8b4023bc686a57c50fae1b0668ae18f1: not found
```



解决方法是在pull镜像的时候加上 `--all-platforms` 选项

```shell
ctr i pull --all-platforms docker.io/library/nginx:alpine
```



## 2.9 导入镜像 `ctr image import`

```shell
# 查看镜像
$ ctr image ls -q
docker.io/gitea/gitea:1.16.0

# 导入镜像
$ ctr image import nginx.tar.gz
unpacking docker.io/library/nginx:alpine (sha256:da9c94bec1da829ebd52431a84502ec471c8e548ffb2cedbf36260fd9bd1d4d3)...done

# 再次查看镜像
$ ctr image ls -q
docker.io/gitea/gitea:1.16.0
docker.io/library/nginx:alpine
```





# 3.容器操作

## 3.1 查看容器操作帮助 `ctr container` 

```shell
$ ctr container
NAME:
   ctr containers - manage containers

USAGE:
   ctr containers command [command options] [arguments...]

COMMANDS:
   create           create container
   delete, del, rm  delete one or more existing containers
   info             get info about a container
   list, ls         list containers
   label            set and clear labels for a container
   checkpoint       checkpoint a container
   restore          restore a container from checkpoint

OPTIONS:
   --help, -h  show help
```



## 3.2 创建容器 `ctr container create`

```shell
ctr container create docker.io/library/nginx:alpine nginx
```



## 3.3 列出容器 `ctr container ls`

```shell
$ ctr container ls
CONTAINER    IMAGE                             RUNTIME                  
nginx        docker.io/library/nginx:alpine    io.containerd.runc.v2   

# 加-q选项精简显示
$ ctr container ls -q
nginx
```



## 3.4 查看容器详细配置 `ctr container info`

```shell
$ ctr container info nginx
{
    "ID": "nginx",
    "Labels": {
        "io.containerd.image.config.stop-signal": "SIGQUIT",
        "maintainer": "NGINX Docker Maintainers \u003cdocker-maint@nginx.com\u003e"
    },
    "Image": "docker.io/library/nginx:alpine",
    "Runtime": {
        "Name": "io.containerd.runc.v2",
        "Options": {
            "type_url": "containerd.runc.v1.Options"
        }
    },
    "SnapshotKey": "nginx",
    "Snapshotter": "overlayfs",
    "CreatedAt": "2022-02-03T14:06:26.311050811Z",
    "UpdatedAt": "2022-02-03T14:06:26.311050811Z",
    "Extensions": null,
    "Spec": {
        "ociVersion": "1.0.2-dev",
        "process": {
            "user": {
                "uid": 0,
                "gid": 0,
    ......
```



## 3.5 删除容器 `ctr container rm`

除了使用 `rm` 子命令之外也可以使用 `delete` 或者 `del` 删除容器

```shell
ctr container rm nginx
```



# 4.任务

上面我们通过 `container create` 命令创建的容器，并没有处于运行状态，只是一个静态的容器。一个 container 对象只是包含了运行一个容器所需的资源及相关配置数据，表示 `namespaces`、`rootfs` 和容器的配置都已经初始化成功了，只是用户进程还没有启动。

一个容器真正运行起来是由 Task 任务实现的，Task 可以为容器设置网卡，还可以配置工具来对容器进行监控等。



## 4.1 查看任务操作帮助 `ctr task`

```shell
$ ctr task
NAME:
   ctr tasks - manage tasks

USAGE:
   ctr tasks command [command options] [arguments...]

COMMANDS:
   attach           attach to the IO of a running container
   checkpoint       checkpoint a container
   delete, rm       delete one or more tasks
   exec             execute additional processes in an existing container
   list, ls         list tasks
   kill             signal a container (default: SIGTERM)
   pause            pause an existing container
   ps               list processes for container
   resume           resume a paused container
   start            start a container that has been created
   metrics, metric  get a single data point of metrics for a task with the built-in Linux runtime

OPTIONS:
   --help, -h  show help
```



## 4.2 启动容器 `ctr task start`

```shell
$ ctr task start -d nginx
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
```



### 4.2.1 启动容器的一个报错

启动容器报错

```shell
$ ctr task start -d nginx
ctr: failed to create shim: OCI runtime create failed: unable to retrieve OCI runtime error (open /run/containerd/io.containerd.runtime.v2.task/default/nginx/log.json: no such file or directory): runc did not terminate successfully: exit status 127: unknown
```



[github中有提到containerd1.5.7版本在centos7中无法运行runc](https://github.com/containerd/containerd/issues/6091)，经过测试，containerd1.5.5版本后会涉及这个问题

通过运行runc命令排查，发现缺少依赖：`seccomp_api_get`

```shell
$ runc
runc: symbol lookup error: runc: undefined symbol: seccomp_api_get
```

但是centos7.9系统已经安装 `libseccomp-devel`了，再次检查发现，`seccomp_api_get` 对 [libseccomp](https://github.com/seccomp/libseccomp) 版本有要求，至少 `libseccomp v2.4` 版本才提供有 `seccomp_api_get`，centos7本身源只有这个包 `libseccomp-devel-2.3.1-4.el7.x86_64` 



[rpmfind.net](https://rpmfind.net/linux/rpm2html/search.php?query=libseccomp) 和 [pkgs.org](https://pkgs.org/download/libseccomp) 这2个网站中 `libseccomp` 版本都是2.3，最终在 [cbs.centos.org](https://cbs.centos.org/koji/buildinfo?buildID=26448) 中找到了2.4版本的 `libseccomp` ，安装2.4版本后问题解决





## 4.3 查看启动的容器 `ctr task ls`

```shell
$ ctr task ls
TASK     PID     STATUS    
nginx    6684    RUNNING
```



## 4.4 进入容器 `ctr task exec`

:::tip

**<span style={{color: 'red'}}>⚠️这里需要注意必须要指定 `--exec-id` 参数，这个 id 可以随便写，只要唯一就行</span>**

:::

```
ctr task exec --exec-id 0 -t nginx /bin/sh
```



## 4.5 暂停容器 `ctr task pause`

```shell
# 暂停容器
ctr task pause nginx

# 容器暂停后状态就变为了PAUSED
$ ctr task ls
TASK     PID     STATUS    
nginx    6684    PAUSED
```



## 4.5 恢复容器 `ctr task resume`

```shell
# 恢复容器
ctr task resume nginx

# 查看
$ ctr task ls
TASK     PID     STATUS    
nginx    6684    RUNNING
```



## 4.6 停止容器 `ctr task kill`

:::tip

**<span style={{color: 'red'}}>⚠️ctr 没有 stop 容器的功能，只能暂停或者杀死容器</span>**

:::

```shell
# kill容器
ctr task kill nginx

# 查看，容器的状态就变为了STOPPED
$ ctr task ls
TASK     PID     STATUS    
nginx    6684    STOPPED
```



## 4.7 删除容器 `ctr task rm`

```shell
ctr task rm nginx
```



## 4.8 获取容器的 cgroup 相关信息 `ctr task metrics`

```shell
$ ctr task ls
TASK     PID     STATUS    
nginx    6961    RUNNING
[root@k8s-test ~]# ctr task metrics nginx
ID       TIMESTAMP                                  
nginx    2022-02-05 11:30:00.893668953 +0000 UTC    

METRIC                   VALUE                  
memory.usage_in_bytes    1388544                
memory.limit_in_bytes    9223372036854771712    
memory.stat.cache        12288                  
cpuacct.usage            49227598               
cpuacct.usage_percpu     [49227598]             
pids.current             2                      
pids.limit               0                      
```



## 4.9 查看容器中所有进程在宿主机中的 PID `ctr task ps`

其中第一个 PID `6961` 就是我们容器中的1号进程

```shell
$ ctr task ps nginx
PID     INFO
6961    -
6991    -
```



# 5.命名空间

## 5.1 查看命名空间 `ctr ns ls`

```shell
$ ctr ns ls
NAME    LABELS 
default        
```



## 5.2 创建命名空间 `ctr ns create`

```shell
# 创建命名空间test
ctr ns create test

# 查看命名空间
$ ctr ns ls
NAME    LABELS 
default        
test           
```



## 5.3 删除命名空间 `ctr ns rm`

```shell
# 删除命名空间
$ctr ns rm test
test

# 查看命名空间
$ ctr ns ls
NAME    LABELS 
default        
```



## 5.4 指定命名空间 `ctr -n`

```shell
# 默认命名空间default下的镜像
$ ctr -n default image ls
REF                            TYPE                                                      DIGEST                                                                  SIZE    PLATFORMS                                                                                LABELS 
docker.io/library/nginx:alpine application/vnd.docker.distribution.manifest.list.v2+json sha256:da9c94bec1da829ebd52431a84502ec471c8e548ffb2cedbf36260fd9bd1d4d3 9.7 MiB linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x -   

# 命名空间test下的镜像，这里在pull镜像的时候没有指定命名空间，因此为空
$ ctr -n test image ls
REF TYPE DIGEST SIZE PLATFORMS LABELS 
```



pull镜像时通过 `-n` 选项指定命名空间

```shell
# pull镜像时指定命名空间
ctr -n test image pull docker.io/library/nginx:alpine 

# 指定命名空间查看镜像
$ ctr -n test image ls
REF                            TYPE                                                      DIGEST                                                                  SIZE    PLATFORMS                                                                                LABELS 
docker.io/library/nginx:alpine application/vnd.docker.distribution.manifest.list.v2+json sha256:da9c94bec1da829ebd52431a84502ec471c8e548ffb2cedbf36260fd9bd1d4d3 9.7 MiB linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x -      
```



我们知道 Docker 其实也是默认调用的 containerd，事实上 Docker 使用的 containerd 下面的命名空间默认是 `moby`，而不是 `default`，所以假如我们有用 docker 启动容器，那么我们也可以通过 `ctr -n moby` 来定位下面的容器

```shell
ctr -n moby container ls
```



同样 Kubernetes 下使用的 containerd 默认命名空间是 `k8s.io`，所以我们可以使用 `ctr -n k8s.io` 来查看 Kubernetes 下面创建的容器
