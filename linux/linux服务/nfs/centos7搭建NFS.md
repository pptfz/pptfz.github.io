[toc]



# centos7搭建NFS

## 1.NFS基本概述

- **基本概念**
  
  NFS是 `Network File System` 的缩写，即网络文件系统
  
  
  
- **主要功能**
  
  通过局域网络让不同的主机系统之间可以共享文件或目录
  
  
  
- **用处**

  - **NFS系统和Windows网络共享、网络驱动器类似, 只不过windows用于局域网,** 

  - **NFS用于企业集群架构中, 如果是大型网站, 会用到更复杂的分布式文件系统**

    > **小文件存储系统：(Moosefs,FastDFS)**
    >
    > **大文件存储系统：(glusterfs,HDFS)**



- **为什么要用NFS服务进行数据存储**
  - **1.实现数据信息共享**
  - **2.实现数据信息一致**



## 2.NFS实现原理

![iShot2020-04-0412.57.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-04-0412.57.42.png)



- **相关进程**

  | 进程名称  | 说明                                                         |
  | --------- | ------------------------------------------------------------ |
  | rpc.nfsd  | 基本的nfs守护进程，主要功能是管理客户端是否能够登陆服务器    |
  | rpc.mount | 管理nfs的文件系统，当客户端顺利通过nfsd登陆nfs服务器后，在使用nfs服务所提供的文件前，还必须通过文件使用权限的验证，它会读取nfs的配置文件 `/etc/exports` 来对比客户端权限 |
  | portmap   | 进行端口映射                                                 |

  

- **本地文件操作方式**
  
  - **当用户进程发起本地文件访问或修改，该用户请求传递至内核，由内核驱动硬件完成操作**



- **NFS访问方式**

  - 1.用户进程访问NFS客户端，使用不同的函数对数据进行处理
  - 2.请求会通过TCP/IP的方式传递给NFS服务端
  - 3.NFS服务端接收到请求后，会调用portmap进程进行端口映射
  - 4.nfsd进程用于判断NFS客户端是否拥有权限连接NFS服务端
  - 5.Rpc.mount用于判断客户端是否有对应的权限进行验证
  - 6.idmap进程实现用户映射和压缩
  - 7.最后NFS服务端会将对应请求的函数转换为本地能识别的命令，传递至内核，由内核驱动硬件
  
  

## 3.NFS服务搭建过程

**实验环境**

| 角色      | IP        | 主机名     |
| --------- | --------- | ---------- |
| nfs服务端 | 10.0.0.10 | nfs-server |
| nfs客户端 | 10.0.0.11 | nfs-client |



### 3.1 nfs服务端操作

#### 3.1.1 安装nfs-utils

```shell
yum -y install nfs-utils
```



#### 3.1.2 编辑nfs配置文件 `/etc/exports`，文件默认没有内容

**nfs配置文件格式**

> NFS共享目录    NFS客户端地址1(参数1,参数2,...)    客户端地址2(参数1,参数2,...)
>
> NFS共享目录    NFS客户端地址(参数1,参数2,...)



执行 `man exports` 命令可以查看帮助，如下为nfs参数

| nfs共享参数    | 参数作用                                                     |
| -------------- | ------------------------------------------------------------ |
| rw             | 读写权限                                                     |
| ro             | 只读权限                                                     |
| root_squash    | 当NFS客户端以root管理员访问时，映射为NFS服务器的匿名用户     |
| no_root_squash | 当NFS客户端以root管理员访问时，映射为NFS服务器的root管理员   |
| all_squash     | 无论NFS客户端使用什么账户访问，均映射为NFS服务器的匿名用户（默认选项）   |
| no_all_squash  | 无论NFS客户端使用什么账户访问，不映射为NFS服务器的匿名用户                 |
| sync           | 同时将数据写入到内存与硬盘中，保证不丢失数据                 |
| async          | 优先将数据保存到内存，然后再写入硬盘；这样效率更高，但可能会丢失数据 |
| anonuid        | 配置all_squash使用,指定NFS的用户UID,必须存在于系统中             |
| anongid        | 配置all_squash使用,指定NFS的用户UID,必须存在于系统中             |



**编辑nfs配置文件**

```shell
cat > /etc/exports <<EOF
/data 10.0.0.0/24(rw,sync,all_squash)
EOF
```



**参数说明**

| 参数        | 说明                                                       |
| ----------- | ---------------------------------------------------------- |
| /date       | nfs服务端共享目录                                          |
| 10.0.0.0/24 | 允许挂载的客户端网段                                       |
| rw          | 挂载权限                                                   |
| sync        | 同时将数据写入到内存与硬盘中，保证不丢失数据               |
| all_squash  | 无论NFS客户端使用什么账户访问，均映射为NFS服务器的匿名用户 |



#### 3.1.3 创建共享目录并修改目录所有者为 `nfsnobody`

```shell
[ -d /data ] || mkdir /data
chown -R nfsnobody.nfsnobody /data
```



#### 3.1.4 启动nfs并设置开机自启

```shell
systemctl start rpcbind nfs-server && systemctl enable rpcbind nfs-server
```



#### 3.1.5 验证配置是否生效

```shell
$ exportfs
/data         	10.0.0.0/24
```



#### 3.1.6 检查nfs共享记录

**nfs启动后会在 `/var/lib/nfs/etab` 文件中记录共享内容**

```shell
$ cat /var/lib/nfs/etab 
/data	10.0.0.0/24(rw,sync,wdelay,hide,nocrossmnt,secure,root_squash,all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,root_squash,all_squash)
```



### 3.2 nfs客户端操作

#### 3.2.1 安装nfs-utils

```shell
yum -y install nfs-utils
```



#### 3.2.2 启动rpcbind并设置开机自启

```shell
systemctl start rpcbind && systemctl enable rpcbind
```



#### 3.2.3 创建挂载点并修改挂载点所有者为 `nfsnobody`

```shell
[ -d /data ] || mkdir /data
chown -R nfsnobody.nfsnobody /data
```



#### 3.2.4 查询nfs服务端共享信息

```shell
$ showmount -e 10.0.0.10
Export list for 10.0.0.10:
/data 10.0.0.0/24
```

**showmount命令**

| 参数 | 作用                                      |
| ---- | ----------------------------------------- |
| -e   | 显示NFS服务器的共享列表                   |
| -a   | 显示本机挂载的文件资源的情况NFS资源的情况 |
| -v   | 显示版本号                                |



#### 3.2.5 客户端挂载nfs

> mount  -t  文件系统  服务器IP:共享目录  客户端本机挂载点

```shell
mount -t nfs 10.0.0.10:/data /data
```

⚠️在企业工作场景，通常情况NFS服务器共享的只是普通静态数据（图片、附件、视频），不需要执行suid、exec等权限，挂载的这个文件系统只能作为数据存取之用，无法执行程序，对于客户端来讲增加了安全性。例如: 很多木马篡改站点文件都是由上传入口上传的程序到存储目录然后执行的

**通过 `mount -o` 指定挂载参数，禁止使用 `suid` 、 `exec` ，增加安全性能**

```shell
mount -t nfs -o nosuid,noexec,nodev 10.0.0.10:/data  /mnt
```



#### 3.2.6 查看挂载信息

```shell
$ df -h
10.0.0.10:/data          17G  4.4G   13G  26% /data
```



#### 3.2.7 设置开机自动挂载

```python
cat >> /etc/fstab << EOF
10.0.0.10:/data  /data  nfs  defaults  0  0
EOF
```



#### 3.2.8 如果不需要使用nfs共享，可以卸载

```python
umount  /data
```

