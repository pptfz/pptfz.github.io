# kvm安装

## 1.安装软件包

```shell
yum -y install libvirt* virt-* qemu-kvm* 
```

   

| 软件包名                               | 作用                 |
| -------------------------------------- | -------------------- |
| `libvirt`                              | 虚拟机的管理软件     |
| `virt` 、`virt-install` 、`virt-clone` | 虚拟机的安装和克隆   |
| `qemu-kvm` 、`qemu-img`                | 复制管理虚拟机的磁盘 |



## 2.启动服务并设置开机自启

```shell
systemctl start libvirtd && systemctl enable libvirtd
```



## 3.安装图形化管理工具 `virt-manager`

```shell
yum -y install virt-manager
```



安装完成后在 `Applications` ->  `System Tools` -> `Virtual Machine Manager(kvm图形化管理工具)`



![iShot2021-11-27_21.47.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-11-27_21.47.45.png)







打开后是这样的

![iShot2021-11-27_22.06.03](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-11-27_22.06.03.png)











