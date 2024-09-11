# 使用 virt-manager 安装虚拟机

## 1.安装图形化管理工具 `virt-manager`

```shell
yum -y install virt-manager
```



安装完成后在 `Applications` -> `System Tools` -> `Virtual Machine Manager(kvm图形化管理工具)`





![iShot2021-11-27_21.47.45](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_21.47.45.png)



打开后是这样的

![iShot2021-11-27_22.06.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.06.03.png)





**关于 `virt-manager` 的配套工具**

- **virt-install**
  - 是一个命令行工具，它提供了一种将操作系统配置到虚拟机中的简单方法。

- **virt-viewer**
  - 是一个轻量级的 UI 界面，用于与虚拟化来宾操作系统的图形显示进行交互。它可以显示 VNC 或 SPICE，并使用 libvirt 查找图形连接详细信息。

- **virt-clone**
  - 是一个命令行工具，用于克隆现有的非活动来宾。它复制磁盘映像，并使用指向复制磁盘的新名称、UUID 和 MAC 地址定义配置。

- **virt-xml**
  - 是一个命令行工具，用于使用 virt-install 的命令行选项轻松编辑 libvirt 域 XML。

- **virt-bootstrap**
  - 是一个命令行工具，提供了一种简单的方法来为基于 libvirt 的容器设置根文件系统。



## 2.安装虚拟机

### 2.1 配置 `storage pool`

:::tip 说明

`storage pool` 是宿主机上的一块存储空间，可以是一个目录(文件系统)或者vg

默认虚拟机磁盘文件存储路径为 `/var/lib/libvirt/images` ，是由 `/etc/libvirt/storage/default.xml` 文件中决定的

:::

![iShot2021-11-28_13.55.28](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_13.55.28.png)







创建一个名为 `kvm_storage` 的存储池

![iShot2021-11-28_18.44.18](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_18.44.18.png)







路径设置为 `/data/kvm/iso`

![iShot2021-11-28_18.44.39](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_18.44.39.png)





创建完成后的存储池

![iShot2021-11-28_18.43.19](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_18.43.19.png)







### 2.2 点击电脑图标然后选择 `Local install media (ISO image or CDROM)`

![iShot2021-11-27_22.21.57](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.21.57.png)





### 2.3 选择 `Use ISO image`

![iShot2021-11-27_22.25.38](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.25.38.png)





### 2.4 选择本地镜像

![iShot2021-11-28_19.25.14](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_19.25.14.png)



![iShot2021-11-28_19.24.21](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-28_19.24.21.png)





### 2.5 设置虚拟机的cpu和内存

![iShot2021-11-27_22.38.30](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.38.30.png)





### 2.6 设置虚拟机的硬盘大小

![iShot2021-11-27_22.41.27](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.41.27.png)





### 2.7 设置虚拟机名称

![iShot2021-11-27_22.43.58](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.43.58.png)



### 2.8 开始安装

![iShot2021-11-27_22.46.27](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.46.27.png)



安装界面，后续就是系统安装了 

![iShot2021-11-27_22.46.37](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-27_22.46.37.png)