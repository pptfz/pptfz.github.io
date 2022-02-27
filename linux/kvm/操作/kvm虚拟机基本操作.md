# kvm虚拟机基本操作



# 1.创建、删除、修改名称

## 1.1 创建虚拟机

### 1.1.1 图形化安装

```shell
virt-install \
--virt-type kvm \
--os-variant centos7.0 \
--name abc \
--memory 1024 \
--vcpus 1 \
--disk /data/KVM_imgs/abc.qcow2,format=qcow2,size=10 \
--cdrom /data/ISO/CentOS-7-x86_64-DVD-2009.iso \
--network bridge=br0 \
--graphics vnc,listen=0.0.0.0,password=1,port=10086 \
--noautoconsole
```



以下为命令输出

```shell
Starting install...
Allocating 'abc.qcow2'                                                                                                                                                                                            |  10 GB  00:00:00     
Domain installation still in progress. You can reconnect to 
the console to complete the installation process.
```



参数说明

| 参数         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| --virt-type  | 虚拟机类型，可选有 `kvm` 、`qemu` 、`xen`                    |
| --os-variant | 发型版本，例如 `CentOS` 、 `Ubuntu`，可执行 `osinfo-query os` 查看支持的版本 |
| --name       | 虚拟机名称                                                   |
| --memory     | 虚拟机内存，单位 MB                                          |
| --vcpus      | 虚拟机cpu                                                    |
| --disk       | 虚拟机磁盘文件信息，包括大小(单位GB)、路径、格式             |
| --cdrom      | 镜像文件                                                     |
| --network    | 虚拟机网络类型                                               |
| --graphics   | 指定图形界面，可选有vnc、spice                               |



### 1.1.2 命令行安装

```shell

```





## 1.2 删除虚拟机

<span style=color:red>⚠️删除虚拟机之前虚拟机必须为关闭状态</span>

`virsh undefine 虚拟机名称`

```shell
virsh undefine linux-templet-mini-clone
```



### 1.3 修改名称

`virsh domrename 源虚拟机名称 新虚拟名称`

```shell
virsh domrename linux-new linux-new-xxx
```





# 2.查看、启动、停止、重启

## 2.1 查看

```shell
virsh list --all
```



## 2.2 启动

`virsh start 虚拟机名称`

```shell
virsh start linux-templet-mini-clone 
```



## 2.3 停止

### 2.3.1 正常停止

`virsh shutdown 虚拟机名称`

```shell
virsh shutdown linux-templet-mini-clone
```



### 2.3.2 强制停止(相当于拔电源)

`virsh destroy 虚拟机名称`

```shell
virsh destroy linux-templet-mini-clone
```



## 2.4 重启

`virsh reboot 虚拟机名称`

```shell
virsh reboot linux-templet-mini-clone 
```





# 3.备份、恢复

## 3.1 备份

<span style=color:red>⚠️备份虚拟机主要就是备份虚拟机磁盘文件和配置文件</span>

`virsh dumpxml 虚拟机名称`

```shell
# 备份配置文件
virsh dumpxml linux-templet-mini-clone > /opt/bak/linux-templet-mini-clone.xml

# 备份磁盘文件
cp /data/KVM_imgs/linux-templet-mini-clone.qcow2 /opt/bak
```



## 3.2 恢复

<span style=color:red>⚠️                恢复虚拟机，磁盘文件和配置文件必须在相同目录              </span>

`virsh define 虚拟机备份文件`

```shell
virsh define linux-templet-mini-clone.xml
```



# 4.克隆

## 4.1 完整克隆

<span style=color:red>⚠️克隆虚拟机之前虚拟机必须为关闭状态</span>

`virt-clone --auto-clone -o 源虚拟机名称 -n 新虚拟机名称`

```shell
virt-clone \
--auto-clone \
-o linux-templet-mini \
-n linux-templet-mini-clone
```



以下为命令输出

```shell
WARNING  Setting the graphics device port to autoport, in order to avoid conflicting.
Allocating 'linux-templet-mini-clone.qcow2'                                                                                      |  10 GB  00:00:02     

Clone 'linux-templet-mini-clone' created successfully.
```





## 4.2 链接克隆

### 4.2.1 需要修改配置文件

创建链接克隆磁盘文件

`qemu-img create -f qcow2 -b 原磁盘文件名 克隆后磁盘文件名`

```shell
qemu-img create -f qcow2 -b linux-templet-mini.qcow2 linux-new.qcow2
```



查看链接克隆

```shell
$ qemu-img info linux-new.qcow2
image: linux-new.qcow2
file format: qcow2
virtual size: 10G (10737418240 bytes)
disk size: 196K
cluster_size: 65536
backing file: linux-templet-mini.qcow2
Format specific information:
    compat: 1.1
    lazy refcounts: false
```



拷贝配置文件

```shell
cd /etc/libvirt/qemu/
cp linux-templet-mini.xml linux-new.xml
```



修改配置文件

```shell
第一处修改：修改name
  <name>linux-templet-mini</name>

第二处修改：删除UUID
  <uuid>bee80325-5cf8-4824-ab74-125640b8ab73</uuid>

第三处修改：磁盘文件名，搜索disk找到
  <source file='/data/KVM_imgs/linux-templet-mini.qcow2'/>
 
第四处修改：删除mac地址，搜索mac addr找到
  <mac address='52:54:00:6f:9e:82'/> 
```



依据文件，恢复虚拟机

```shell
virsh define linux-new.xml 
```



启动虚拟机

```shell
virsh start linux-new 
```



查看克隆

```shell
$ virsh list --all |grep linux-new
 73    linux-new                      running
```



### 4.2.2 不需要修改配置文件

创建链接克隆磁盘文件

```shell
qemu-img create -f qcow2 -b linux-templet-mini.qcow2 linux-new.qcow2
```



依据链接磁盘文件创建链接克隆虚拟机

 `--boot hd` 表示从硬盘启动 

  `--disk` 直接指定上边创建的链接磁盘文件，而不需要指定ISO镜像

```shell
virt-install \
--virt-type kvm \
--os-variant centos7.0 \
--name linux-new \
--memory 1024 \
--vcpus 1 \
--disk /data/KVM_imgs/linux-new.qcow2,format=qcow2,size=10 \
--boot hd \
--network bridge=br0 \
--graphics vnc,listen=0.0.0.0,password=1,port=10086 \
--noautoconsole
```



# 5.挂起、恢复挂起

查看虚拟机

```shell
$ virsh list --all |grep linux-new
 74    linux-new                      running
```



挂起虚拟机

```shell
virsh suspend linux-new
```



再次查看，可以看到虚拟机状态变为了 `paused`

<span style=color:red>挂起状态的虚拟机并不是出于关机状态，同时不能做任何操作</span>

```shell
$ virsh list --all |grep linux-new
 74    linux-new                      paused
```



恢复挂起

```shell
virsh resume linux-new 
```





# 6.查看虚拟机vnc端口号

`virsh vncdisplay 虚拟机名称`

```shell
$ virsh vncdisplay --domain linux-new-xxx 
:4186
```

