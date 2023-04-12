# kvm虚拟机开机自启

为了防止宿主机因某些原因重启后而导致kvm虚拟机不可用，我们需要对kvm虚拟机设置开机自启



## 设置虚拟机开机自启

**设置开机自启**

`virsh autostart 虚拟机名称`

```shell
virsh autostart test
```



**查看虚拟机状态，此时为关闭状态**              

```shell
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     test                           shut off
```



**重启libvirtd服务**

```shell
systemctl restart libvirtd
```



**重启 `libvirtd` 服务后查看虚拟机状态，已经启动**       

```shell
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
 1     test                           running
```





## kvm虚拟机开机自启原理

`/etc/libvirt/qemu` 多了一个  `autostart`  目录，并且会有一个虚拟机名称的软连接存在

```shell
$ ll /etc/libvirt/qemu/autostart
total 0
lrwxrwxrwx 1 root root 26 Feb 27 17:19 test.xml -> /etc/libvirt/qemu/test.xml
```



删除 `/etc/libvirt/qemu/autostart` 目录

```shell
rm -rf /etc/libvirt/qemu/autostart
```



关闭虚拟机

```shell
virsh shutdown test
```



此时虚拟机为关闭状态

```shell
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     test                           shut off
```



重启 `libvirtd`

```shell
systemctl restart libvirtd
```



再次查看虚拟机状态，开机自启失败

```shell
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     test                           shut off
```



创建 `autostart` 目录并修改权限为700

```shell
mkdir /etc/libvirt/qemu/autostart && chmod 700 /etc/libvirt/qemu/autostart
```



创建软连接，想要让哪些虚拟机开机启动就做软连接即可

```shell
ln -s /etc/libvirt/qemu/test.xml /etc/libvirt/qemu/autostart/
```



重启 `libvirtd` ，验证开机自启

```
systemctl restart libvirtd
```



再次查看虚拟机状态，已经开机自启

```shell
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
 1     test                           running
```

