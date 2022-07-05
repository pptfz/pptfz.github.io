[toc]



# k8s安装神器-sealos 

[sealos官网](https://sealyun.com/)

[sealos github](https://github.com/fanux/sealos)

[sealos常见问题](https://sealyun.com/faq/)

# 一、sealos简介

**官方对sealos的说明**

- 一个二进制工具加一个资源包，不依赖haproxy keepalived ansible等重量级工具，一条命令就可实现kubernetes高可用集群构建，无论是单节点还是集群，单master还是多master，生产还是测试都能很好支持！简单不意味着阉割功能，照样能全量支持kubeadm所有配置。



**<span style=color:red>sealos就是一条命令部署 Kubernetes 高可用集群，基于kubeadm</span>**



**sealos架构示意图**

![iShot2020-07-1013.41.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1013.55.59.png)



# 二、一条命令快速开始

[以下全部复制于sealos github](https://github.com/fanux/sealos)



> 环境信息

| 主机名  | IP地址      |
| ------- | ----------- |
| master0 | 192.168.0.2 |
| master1 | 192.168.0.3 |
| master2 | 192.168.0.4 |
| node0   | 192.168.0.5 |

服务器密码：123456

> 只需要准备好服务器，在任意一台服务器上执行下面命令即可

```shell
# 下载并安装sealos, sealos是个golang的二进制工具，直接下载拷贝到bin目录即可, release页面也可下载
$ wget -c https://sealyun.oss-cn-beijing.aliyuncs.com/latest/sealos && \
    chmod +x sealos && mv sealos /usr/bin 

# 下载离线资源包
$ wget -c https://sealyun.oss-cn-beijing.aliyuncs.com/7b6af025d4884fdd5cd51a674994359c-1.18.0/kube1.18.0.tar.gz

# 安装一个三master的kubernetes集群
$ sealos init --passwd 123456 \
	--master 192.168.0.2  --master 192.168.0.3  --master 192.168.0.4  \
	--node 192.168.0.5 \
	--pkg-url /root/kube1.18.0.tar.gz \
	--version v1.18.0
```

> 参数含义

| 参数名  | 含义                                             | 示例                    |
| ------- | ------------------------------------------------ | ----------------------- |
| passwd  | 服务器密码                                       | 123456                  |
| master  | k8s master节点IP地址                             | 192.168.0.2             |
| node    | k8s node节点IP地址                               | 192.168.0.3             |
| pkg-url | 离线资源包地址，支持下载到本地，或者一个远程地址 | /root/kube1.16.0.tar.gz |
| version | [资源包](http://store.lameleg.com/)对应的版本    | v1.16.0                 |

> 增加master

```
🐳 → sealos join --master 192.168.0.6 --master 192.168.0.7
🐳 → sealos join --master 192.168.0.6-192.168.0.9  # 或者多个连续IP
```

> 增加node

```
🐳 → sealos join --node 192.168.0.6 --node 192.168.0.7
🐳 → sealos join --node 192.168.0.6-192.168.0.9  # 或者多个连续IP
```

> 删除指定master节点

```
🐳 → sealos clean --master 192.168.0.6 --master 192.168.0.7
🐳 → sealos clean --master 192.168.0.6-192.168.0.9  # 或者多个连续IP
```

> 删除指定node节点

```
🐳 → sealos clean --node 192.168.0.6 --node 192.168.0.7
🐳 → sealos clean --node 192.168.0.6-192.168.0.9  # 或者多个连续IP
```

> 清理集群

```
🐳 → sealos clean
```

# ✅ 特性

-  99年证书
-  不依赖ansible haproxy keepalived, 一个二进制工具，0依赖
-  离线安装，不同kubernetes版本下载对应不同版本的[资源包](http://store.lameleg.com/)即可,离线包包含所有二进制文件配置文件和镜像
-  高可用通过ipvs实现的localLB，占用资源少，稳定可靠，类似kube-proxy的实现
-  几乎可兼容所有支持systemd的x86_64架构的环境
-  轻松实现集群节点的增加/删除
-  上千用户在线上环境使用sealos，稳定可靠
-  资源包放在阿里云oss上，再也不用担心网速
-  dashboard ingress prometheus等APP 同样离线打包，一键安装



# 三、sealos离线包

**下载官方提供的离线包并解压**

```python
#下载离线包
wget -c https://sealyun.oss-cn-beijing.aliyuncs.com/d551b0b9e67e0416d0f9dce870a16665-1.18.0/kube1.18.0.tar.gz 

#解压后就是一个kube目录
kube  kube1.18.0.tar.gz
```



**进入`kube`这个目录查看**

```shell
ll
total 24
drwxr-xr-x 2 root root 4096 May 27 11:22 bin
drwxr-xr-x 3 root root 4096 May 27 11:20 conf
drwxr-xr-x 2 root root 4096 May 27 11:20 docker
drwxr-xr-x 2 root root 4096 May 27 11:29 images
-rw-r--r-- 1 root root  377 May 27 11:19 README.md
drwxr-xr-x 2 root root 4096 May 27 11:22 shell
```



**`kube/bin`目录内容如下**

![iShot2020-07-1013.55.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1013.41.57.png)

- `conntrack`是跟踪并且记录连接状态的一个工具
- `crictl`是一个命令行接口，用于与CRI兼容的容器运行时
- `kubelet-pre-start.sh`是一个关闭防火墙和调整内核参数的脚本，比较简单
- `sealos`就是一健安装k8s集群用到的命令(go语言编写)
- `kubeadm`、`kubectl`、`kubelet`就是k8s所需要用到的命令，后续如果想自己替换安装的版本，就需要替换这3个命令





**`kube/conf`目录内容如下**

![iShot2020-07-1014.16.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.16.56.png)





**`kube/docker`目录内容如下**

![iShot2020-07-1014.18.30](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.18.30.png)

- 就是docker二进制包，[docker官方二进制下载地址](https://download.docker.com/linux/static/stable/x86_64/)





**`kube/images`目录内容如下**

![iShot2020-07-1014.21.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.25.02.png)

- 这里一共12个 `随机字符串.json文件`，其实就是kubeadm安装所需要的12个容器，分别是

  `kube-proxy`、

  `kube-controller-manager`、

  `kube-scheduler `、

  `kube-apiserver`、

  `pause`、

  `coredns`、

  `etcd`、

  `metrics-server-amd64`、

  `calico/node`、

  `calico/cni`、

  `calico/kube-controllers`、

  `calico/pod2daemon-flexvol`



**docker查看镜像如下**

- ```shell
  docker images|awk '{print $1,$2}'|column -t
  REPOSITORY                                                                TAG
  fanux/lvscare                                                             latest
  k8s.gcr.io/kube-proxy                                                     v1.18.0
  k8s.gcr.io/kube-controller-manager                                        v1.18.0
  k8s.gcr.io/kube-scheduler                                                 v1.18.0
  k8s.gcr.io/kube-apiserver                                                 v1.18.0
  k8s.gcr.io/pause                                                          3.2
  k8s.gcr.io/coredns                                                        1.6.7
  k8s.gcr.io/etcd                                                           3.4.3-0
  registry.cn-hangzhou.aliyuncs.com/google_containers/metrics-server-amd64  v0.3.6
  calico/node                                                               v3.8.2
  calico/cni                                                                v3.8.2
  calico/kube-controllers                                                   v3.8.2
  calico/pod2daemon-flexvol                                                 v3.8.2
  ```

- ![iShot2020-07-1014.25.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.31.18.png)



**`kube/shell`目录内容如下**

![iShot2020-07-1014.31.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.38.18.png)



# 四、修改官方离线包，安装自定义版本

## 4.1 扯淡之处 下载包还特么要花钱？

官方默认只提供一个版本的离线包，比如1.18版本

```
wget -c https://sealyun.oss-cn-beijing.aliyuncs.com/d551b0b9e67e0416d0f9dce870a16665-1.18.0/kube1.18.0.tar.gz 
```



然而当你想要安装别的版本时发现下载包还特么要花钱？还特么花50块钱？这不纯属扯淡呢吗？？？

![iShot2020-07-1014.38.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1015.31.05.png)



<marquee style=color:red>对于重度白嫖用户来讲，花钱下载包是不可能的，这辈子都不可能花钱下载包</marquee>





## 4.2 手动修改版本 这里演示替换官方版本1.18.0为1.18.5

### 4.2.0 下载k8s-v1.18.5二进制包

从github的[v1.18 CHANGELOG](https://github.com/kubernetes/kubernetes/raw/branch/branch/master/CHANGELOG/CHANGELOG-1.18.md#downloads-for-v1185)页面找到1.18.5版本的二进制包下载地址，这里下载一个server包即可，需要科学上网

```shell
wget https://dl.k8s.io/v1.18.5/kubernetes-server-linux-amd64.tar.gz
tar xf kubernetes-server-linux-amd64.tar.gz
```



下载完成后解压，进入`kubernetes`目录，我们所需要的k8s相关命令、镜像都在`kubernetes/server/bin`这个目录下

其中`kube-apiserver.tar`、`kube-controller-manager.tar`、`kube-proxy.tar`、`kube-scheduler.tar`就是kubeadm安装所需要的组件镜像

![iShot2020-07-1015.31.05](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1015.57.35.png)





### 4.2.1 替换`kube/bin`目录下的`kubeadm`、`kubectl `、`kubelet`



```shell
\cp kubernetes/server/bin/{kubeadm,kubectl,kubelet} kube/bin/
```





### 4.2.2 修改`kube/conf/kubeadm.yaml`中的k8s版本



```
kubernetesVersion: v1.18.5
```



### 4.2.3 替换镜像

`kube/images/images.tar`解压后就是kubeadm安装所需的docker镜像

解压后就是这些内容，可以从`目录/json`文件中查看是哪个镜像，但是没有找到一种很好的区分方法，所以选择重新生成这个`images.tar`文件

![iShot2020-07-1015.57.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-1014.21.17.png)





**1.18.0下载的docker镜像**

k8s插件镜像	可以选择现有的版本，也可以下载新的版本

```shell
k8s.gcr.io/pause:3.2                                       
k8s.gcr.io/coredns:1.6.7                                         
k8s.gcr.io/etcd:3.4.3-0                                                          
registry.cn-hangzhou.aliyuncs.com/google_containers/metrics-server-amd64:v0.3.6
calico/node:v3.8.2                                                       
calico/cni:v3.8.2                                                     
calico/kube-controllers:v3.8.2                                                 
calico/pod2daemon-flexvol:v3.8.2                                      
```

 

k8s组件镜像	

```shell
k8s.gcr.io/kube-proxy:v1.18.0
k8s.gcr.io/kube-controller-manager:v1.18.0
k8s.gcr.io/kube-scheduler:v1.18.0
k8s.gcr.io/kube-apiserver:v1.18.0
```

​     



k8s组件镜像从下载的k8s-v1.18.5二进制包复制出来`kubernetes/server/bin/{kube-apiserver.tar,kube-controller-manager.tar,kube-proxy.tar,kube-scheduler.tar}`

k8s插件镜像使用命令`docker save -o 镜像`根据原有版本导出或者下载新版本



全部下载完成后把所有的压缩包解压到一个目录并打包成`images.tar`，替换`kube/images`下的`images.tar`



### 4.2.4 替换docker、cailco（可选）

`kube/docker/docker.tgz`就是docker二进制包，可以从这里下载[docker官方二进制下载地址](https://download.docker.com/linux/static/stable/x86_64/)

`kube/conf/calico.yaml`，`kube/conf/net/calico.yaml`可以替换为指定版本的calico，可以从这里下载[calico github](https://github.com/projectcalico/calico)

