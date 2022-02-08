# kvm虚拟机基本操作



# 1.创建、删除

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



执行安装命令后提示如下

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







```
#创建虚拟机命令
[root@kvm1 opt]# virt-install --virt-type kvm --os-type=linux --os-variant rhel7 --name \
centos7 --memory 1024 --vcpus 1 --disk /opt/centos2.raw,format=raw,size=10 \
--cdrom /opt/CentOS-7.4-x86_64-DVD-1708.iso --network network=default \
--graphics vnc,listen=0.0.0.0 --noautoconsole
提示如下即表明成功
Starting install...
Allocating 'centos2.raw'                                                                                                              |  10 GB  00:00:00     
Domain installation still in progress. You can reconnect to 
the console to complete the installation process.

distro vartant

#参数说明

--os-type=linux 		                            #系统类型








--graphics vnc,listen=0.0.0.0		                #graphics图像  
--noautoconsole			                            #不要自动控制，属性，不太重要
```

