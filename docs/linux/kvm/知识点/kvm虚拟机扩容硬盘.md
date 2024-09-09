# kvm虚拟机扩容硬盘

## 1.宿主机查看kvm虚拟机磁盘文件大小

此时文件大小为50G

```sh
$ qemu-img info abc.qcow2 
image: abc.qcow2
file format: qcow2
virtual size: 50G (53687091200 bytes)
disk size: 2.5G
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: true
```



## 2.宿主机扩容kvm磁盘文件大小

:::caution 注意

执行扩容命令前一定要先关闭虚拟机

:::

```shell
$ qemu-img resize abc.qcow2 500G
Image resized.
```



再次查看kvm虚拟机磁盘文件大小，此时已经增加       

```shell
$ qemu-img info abc.qcow2 
image: abc.qcow2
file format: qcow2
virtual size: 500G (536870912000 bytes)
disk size: 2.5G
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: true
```



## 3.查看虚拟机硬盘大小

可以看到当前硬盘 `/dev/sda` 大小为500G

![iShot2021-11-24_21.23.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.23.37.png)





使用命令 `df -h` 查看，此时硬盘还未扩容

![iShot2021-11-24_21.25.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.25.59.png)







## 4.开始扩容硬盘

### 4.1 新建一个分区

![iShot2021-11-24_21.30.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.30.29.png)







### 4.2 修改分区格式

修改分区格式为8e，即lvm格式

![iShot2021-11-24_21.32.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.32.40.png)



保存后执行一下 `partprobe ` 命令



### 4.3 再次查看虚拟机硬盘

可以看到新建的分区 `/dev/sda3` ，并且硬盘Id为8e

![iShot2021-11-24_21.34.36](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.34.36.png)









### 4.4 查看新增的分区

![iShot2021-11-24_21.41.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_21.41.06.png)





### 4.5 使用lvm开始扩容

#### 4.5.1 创建pv

```shell
$ pvcreate /dev/sda3
  Physical volume "/dev/sda3" successfully created.
```



#### 4.5.2 将创建的pv加入vg

执行命令 `vgdisplay ` 查看vg信息

```shell
$ vgdisplay 
  --- Volume group ---
  VG Name               centos
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               <49.00 GiB
  PE Size               4.00 MiB
  Total PE              12543
  Alloc PE / Size       12542 / 48.99 GiB
  Free  PE / Size       1 / 4.00 MiB
  VG UUID               3uV4Hk-GNAr-fIet-W5He-filb-pzd1-1cC4Os
```



将创建的pv加入vg

这里vg名称为 `centos`

```shell
$ vgextend centos /dev/sda3
  Volume group "centos" successfully extended
```



再次查看vg信息，可以看到新增的450G

```shell
$ vgdisplay 
  --- Volume group ---
  VG Name               centos
  System ID             
  Format                lvm2
  Metadata Areas        2
  Metadata Sequence No  4
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                2
  Act PV                2
  VG Size               498.99 GiB
  PE Size               4.00 MiB
  Total PE              127742
  Alloc PE / Size       12542 / 48.99 GiB
  Free  PE / Size       115200 / 450.00 GiB
  VG UUID               3uV4Hk-GNAr-fIet-W5He-filb-pzd1-1cC4Os
```



#### 4.5.3 扩容lv

执行命令 `lvdisplay ` 查看lv信息

```shell
$ lvdisplay 
  --- Logical volume ---
  LV Path                /dev/centos/swap
  LV Name                swap
  VG Name                centos
  LV UUID                K5Vifj-QpYD-MABK-NOAE-K8os-9BqR-8M620U
  LV Write Access        read/write
  LV Creation host, time templet, 2021-11-15 15:59:43 +0800
  LV Status              available
  # open                 2
  LV Size                2.00 GiB
  Current LE             512
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:1
   
  --- Logical volume ---
  LV Path                /dev/centos/root
  LV Name                root
  VG Name                centos
  LV UUID                uMARyx-VRJh-79dj-v15L-yr7M-XzR7-SKRzMW
  LV Write Access        read/write
  LV Creation host, time templet, 2021-11-15 15:59:44 +0800
  LV Status              available
  # open                 1
  LV Size                46.99 GiB
  Current LE             12030
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:0
```



扩容lv

```shell
$ lvextend -L +450G /dev/centos/root 
  Size of logical volume centos/root changed from 46.99 GiB (12030 extents) to 496.99 GiB (127230 extents).
  Logical volume centos/root successfully resized.
```



#### 4.5.4 扩容硬盘

:::tip 说明

如果硬盘分区类型是 `ext4` ，则使用 `resize2fs` 命令

如果硬盘分区类型是 `xfs` ，则使用 `xfs_growfs` 命令

:::

这里硬盘分区类型是xfs

```shell
$ xfs_growfs /dev/mapper/centos-root 
meta-data=/dev/mapper/centos-root isize=512    agcount=4, agsize=3079680 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=12318720, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=6015, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 12318720 to 130283520
```



查看磁盘，扩容完成

![iShot2021-11-24_22.24.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-11-24_22.24.06.png)



