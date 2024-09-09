# kvm虚拟机网卡改动无法启动问题

## 1.背景说明

> centos7安装kvm，kvm创建的虚拟机由于无法ping通宿主机，因此选择增加了一块网卡并设置模式为NAT，并且IP段为 `192.168.122.0/24`，这样的话就可以通过这个192的地址去和宿主机的 `virbr0` 通信了，但是实际上这种做法是错误的，因为这个192段完全是虚拟的，外界无法连通这个段，比如连接公司内网vpn后就无法连接，并且在虚拟机中是无法ping通宿主机的



kvm安装完成后会创建一块名为 `virbr0` IP为 `192.168.122.1` 的虚拟网卡

![iShot2022-01-21_12.41.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_12.41.42.png)





这块网卡就是虚拟机中的eth0，模式为桥接

![iShot2022-01-21_12.32.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_12.32.34.png)





这块网卡就是虚拟机中的 `eth1` ，模式为 `NAT`

![iShot2022-01-21_12.32.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_12.32.10.png)







## 2.解决方法

### 2.1 虚拟网桥说明

[参考链接](https://www.linuxidc.com/Linux/2012-05/61445p2.htm)

KVM 客户机网络连接有两种方式：

- 用户网络（User Networking）：让虚拟机访问主机、互联网或本地网络上的资源的简单方法，但是不能从网络或其他的客户机访问客户机，性能上也需要大的调整。NAT方式。
- 虚拟网桥（Virtual Bridge）：这种方式要比用户网络复杂一些，但是设置好后客户机与互联网，客户机与主机之间的通信都很容易。Bridge方式。



设置kvm虚拟机网络连接为虚拟网桥方式，这样就能解决使用一块网卡让kvm虚拟机与宿主机互通以及虚拟机间互通

如图所示，网桥的基本原理就是创建一个桥接接口br0，在屋里网卡和虚拟机网络接口之间传递数据

![iShot2022-01-21_14.36.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_14.36.32.png)





### 2.2 配置虚拟网桥

#### 2.2.1 新增网桥设备br0

```shell
cat > /etc/sysconfig/network-scripts/ifcfg-br0 << EOF
DEVICE="br0"
TYPE="Bridge"
BOOTPROTO="static"
IPADDR=10.0.0.111
PREFIX=24
GATEWAY=10.0.0.1
DNS1=223.5.5.5
DNS2=114.114.114.114
ONBOOT=yes
EOF
```



#### 2.2.2 修改eth0网卡

注释以下内容

```shell
IPADDR=10.0.0.111
PREFIX=24
GATEWAY=10.0.0.1
DNS1=223.5.5.5
DNS2=114.114.114.114
```



新增以下内容

`NM_CONTROLLED=no` 表示关闭服务 `NetworkManager`

```shell
BRIDGE=br0
NM_CONTROLLED=no
```



2.2.3 重启网络服务

```
systemctl restart network
```



### 2.3 配置虚拟机

#### 2.3.1 图形化方式

`Network Source` 选择 `Specify shared device name` ， `Bridge name` 填写新增加的网卡 `br0` ，`Device model` 选择 `virtio` ，最后点击 `Apply`

![iShot2022-01-21_15.46.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_15.46.37.png)





配置完成后如下图所示

![iShot2022-01-21_15.44.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-21_15.44.06.png)





#### 2.3.2 修改配置文件方式

修改虚拟机配置文件 `/etc/libvirt/qemu/xxx.xml`

找到 `interface` 处的配置，因为原先有2块网卡，所以会有2处配置

```xml
<interface type='network'>
    <mac address='52:54:00:de:2c:3f'/>
    <source network='default'/>
    <model type='virtio'/>
    <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
</interface>
<interface type='direct'>
    <mac address='52:54:00:0f:b7:41'/>
    <source dev='em1' mode='bridge'/>
    <model type='rtl8139'/>
    <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
</interface>
```



修改为如下内容

:::tip 说明

需要修改 `type='virtio'` 的mac地址和pci

:::

```xml
<interface type='bridge'>
    <mac address='52:54:00:de:2c:3f'/>
    <source bridge='br0'/>
    <model type='virtio'/>
    <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
</interface>
```



## 3.遇到的问题

修改完宿主机使用br0虚拟桥接网卡后，kvm中的虚拟机是无法启动的，点击启动会报错如下，原因就是没有做2.3步骤中的操作，修改虚拟机的网卡配置使用br0后就可以了

![iShot2022-01-20_12.02.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-20_12.02.16.png)





