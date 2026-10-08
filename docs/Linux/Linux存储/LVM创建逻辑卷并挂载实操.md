# LVM 创建逻辑卷并挂载实操

:::tip 说明
场景：4 块 5.82T 的 NVMe 盘，不做 Raid，直接用 LVM 合并成一个约 23.3T 的大容量 VG，切出一个 LV 用 XFS 格式化后挂载到 `/mnt/data`。
:::

## LVM 是什么

LVM（Logical Volume Manager，逻辑卷管理器）是 Linux 内核提供的磁盘虚拟化层，在**物理磁盘**和**文件系统**之间加了一层抽象，让分区大小可以动态调整、跨盘合并、在线迁移。

三层架构：

![LVM 三层架构](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/lvm-architecture.png)

### 核心概念

| 概念 | 全称 | 说明 |
|------|------|------|
| **PV** | Physical Volume | 物理卷。磁盘或分区，`pvcreate` 后才能被 LVM 使用 |
| **VG** | Volume Group | 卷组。由一个或多个 PV 组成的存储资源池 |
| **LV** | Logical Volume | 逻辑卷。从 VG 里切出来的"虚拟分区"，供格式化挂载 |
| **PE** | Physical Extent | 物理块。VG 中分配的最小单位，默认 **4 MiB** |
| **LE** | Logical Extent | 逻辑块。LV 与 PE 一一对应（线性模式下） |
| **DM** | Device Mapper | 内核模块，LVM 底层实现，设备在 `/dev/mapper/` 下 |

:::info 设备路径
一个 LV 有两个等价路径：`/dev/vg_data/lv_data`（符号链接）和 `/dev/mapper/vg_data--lv_data`（DM 真实路径）。`blkid`、`lsblk` 看到的通常是后者，fstab 里两者都能写。
:::

## 官方资料

| 资源 | 地址 |
|------|------|
| LVM2 官网（sourceware） | [sourceware.org/lvm2](https://sourceware.org/lvm2/) |
| LVM2 源码（GitHub 官方镜像） | [github.com/lvmteam/lvm2](https://github.com/lvmteam/lvm2) |
| Red Hat 官方 LVM 文档（最系统） | [docs.redhat.com - 配置和管理逻辑卷](https://docs.redhat.com/zh-cn/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index) |
| Arch Wiki - LVM | [wiki.archlinux.org/title/LVM](https://wiki.archlinux.org/title/LVM) |
| man 手册 | `man lvm`、`man lvm.conf`、`man pvcreate` 等 |

```bash
# 本地看手册，lvm(8) 是总入口，里面有全部子命令索引
man lvm
man 7 lvmthin    # thin provisioning 专题
```

## 实操：4 块盘合并成一个大 LV

### 1. 创建 PV（物理卷）

```bash
pvcreate /dev/nvme0n1 /dev/nvme1n1 /dev/nvme2n1 /dev/nvme3n1
  Physical volume "/dev/nvme0n1" successfully created.
  Physical volume "/dev/nvme1n1" successfully created.
  Physical volume "/dev/nvme2n1" successfully created.
  Physical volume "/dev/nvme3n1" successfully created.
```

:::caution 注意
`pvcreate` 会清空盘上数据，执行前用 `lsblk -f` 确认目标盘没有被挂载、没有重要数据。
:::

### 2. 查看 PV

```bash
pvs
  PV           VG Fmt  Attr PSize PFree
  /dev/nvme0n1    lvm2 ---  5.82t 5.82t
  /dev/nvme1n1    lvm2 ---  5.82t 5.82t
  /dev/nvme2n1    lvm2 ---  5.82t 5.82t
  /dev/nvme3n1    lvm2 ---  5.82t 5.82t
```

Attr 的 `---` 表示未加入 VG；加入 VG 后变成 `a--`（a = allocatable，可分配）。

### 3. 创建 VG（卷组）

```bash
vgcreate vg_data \
  /dev/nvme0n1 \
  /dev/nvme1n1 \
  /dev/nvme2n1 \
  /dev/nvme3n1
  Volume group "vg_data" successfully created
```

:::tip PE 大小
默认 PE = 4 MiB，大容量场景可以调大减少元数据开销：`vgcreate -s 64M vg_data ...`。一般保持默认即可。
:::

### 4. 查看 VG

```bash
vgs
  VG      #PV #LV #SN Attr   VSize   VFree
  vg_data   4   0   0 wz--n- <23.29t <23.29t
```

Attr `wz--n-`：w=可写，z=创建时清零，n=普通分配策略。

### 5. 创建 LV（逻辑卷）

`-l 100%FREE` 表示把 VG 剩余空间全部给这个 LV：

```bash
lvcreate -l 100%FREE -n lv_data vg_data
  Logical volume "lv_data" created.
```

### 6. 查看 LV

```bash
lvs
  LV      VG      Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  lv_data vg_data -wi-a----- <23.29t
```

Attr `-wi-a-----` 逐位解读：

| 位 | 值 | 含义 |
|----|----|------|
| 1 | `-` | 卷类型：`-` 线性 / `t` thin / `r` RAID / `m` mirror / `s` snapshot |
| 2 | `w` | 权限：w=可写，r=只读 |
| 3 | `i` | 分配策略：i=inherited（继承） |
| 5 | `a` | 激活状态：a=active（已激活） |
| 6 | `-` | open 状态：挂载后为 `o` |

### 7. 格式化（XFS）

大容量数据盘推荐 XFS：

```bash
mkfs.xfs /dev/vg_data/lv_data
meta-data=/dev/vg_data/lv_data   isize=512    agcount=24, agsize=268435455 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=0 inobtcount=0
data     =                       bsize=4096   blocks=6251220992, imaxpct=5
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=521728, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

### 8. 挂载

```bash
mkdir -p /mnt/data
mount /dev/vg_data/lv_data /mnt/data/
df -h /mnt/data
```

### 9. 开机自动挂载

`mount` 重启后会失效，需要写入 `/etc/fstab`。**LVM 设备路径稳定，可直接写**（也可以用 UUID）：

```bash
echo '/dev/vg_data/lv_data  /mnt/data  xfs  defaults  0 0' >> /etc/fstab

# 写完先验证语法，没错再重启（fstab 写错会导致开机失败）
mount -a && df -h /mnt/data
```

:::caution 注意
`mount -a` 一定要在重启前执行一次验证，`/etc/fstab` 写错可能导致系统无法开机。
:::

fstab 六个字段含义：

```
/dev/vg_data/lv_data  /mnt/data  xfs  defaults  0  0
       ①                 ②       ③      ④      ⑤  ⑥
```

| 字段 | 值 | 含义 |
|------|----|------|
| ① | 设备路径/UUID | 要挂载的设备 |
| ② | `/mnt/data` | 挂载点 |
| ③ | `xfs` | 文件系统类型 |
| ④ | `defaults` | 挂载选项（rw/suid/dev/exec/auto/nouser/async） |
| ⑤ | `0` | dump 备份标志，0=不备份 |
| ⑥ | `0` | fsck 检查顺序，0=不检查（XFS 自带日志，非根分区填 0） |

## lvcreate 的两种尺寸写法

`-L` 按绝对大小，`-l` 按百分比/PE 数，生产上更推荐百分比：

```bash
lvcreate -L 500G  -n lv_a vg_data      # 固定 500G
lvcreate -l 100%FREE -n lv_data vg_data  # 全部剩余空间
lvcreate -l 80%VG    -n lv_b vg_data    # VG 总量的 80%
lvcreate -l 50%PVS   -n lv_c vg_data /dev/nvme0n1  # 指定 PV 空间的 50%
```

## 日常运维操作

### 在线扩容（最常用）

新盘加入 VG 再扩 LV，**全程不停机**：

```bash
pvcreate /dev/nvme4n1
vgextend vg_data /dev/nvme4n1
lvextend -l +100%FREE /dev/vg_data/lv_data
xfs_growfs /mnt/data        # xfs 用这个；ext4 用 resize2fs
```

:::tip XFS 与 ext4 扩缩容对照
- **扩容**：XFS 用 `xfs_growfs 挂载点`，ext4 用 `resize2fs 设备路径`
- **缩容**：XFS **不支持缩容**，只能备份重建；ext4 要先 `umount` 再 `e2fsck` + `resize2fs`
:::

### 缩小 LV（仅 ext4，谨慎操作）

```bash
umount /mnt/data
e2fsck -f /dev/vg_data/lv_data
resize2fs /dev/vg_data/lv_data 800G    # 先缩文件系统
lvreduce -L 800G /dev/vg_data/lv_data  # 再缩 LV（加 -r 可自动同步缩文件系统）
mount /mnt/data
```

### 换盘 / 摘盘（pvmove 在线迁移数据）

```bash
pvcreate /dev/nvme5n1
vgextend vg_data /dev/nvme5n1
pvmove /dev/nvme0n1 /dev/nvme5n1   # 把旧盘上的 PE 数据在线搬到新盘
vgreduce vg_data /dev/nvme0n1      # 旧盘移出 VG
```

### 删除（按 LV → VG → PV 顺序）

```bash
umount /mnt/data
lvremove /dev/vg_data/lv_data
vgremove vg_data
pvremove /dev/nvme0n1 /dev/nvme1n1 /dev/nvme2n1 /dev/nvme3n1
```

## 进阶特性

### Thin Provisioning（瘦供给）

先建"资源池"，LV 可以超分配，写入时才占实际空间。适合虚拟机镜像、容器存储：

```bash
lvcreate -L 1T --thinpool thin_pool vg_data      # 1T 实际池
lvcreate -T vg_data/thin_pool -V 5T -n lv_app    # 虚拟 5T，按需占用
lvs    # Data% 看实际占用率，池快满要及时扩
```

### Snapshot（快照）

记录某一时刻状态，用于备份前打快照或快速回滚：

```bash
# 厚快照：要预留空间（存变化的数据块）
lvcreate -s -n lv_data_snap -L 100G /dev/vg_data/lv_data

# thin 池上的快照不需要额外空间
lvcreate -s -n lv_app_snap vg_data/thin_pool/lv_app

# 回滚
lvconvert --merge /dev/vg_data/lv_data_snap
```

### Striping / RAID

LVM2 原生支持 RAID0/1/5/6/10，不依赖硬件 RAID 卡：

```bash
# RAID1（两块盘互为镜像）
lvcreate --type raid1 -m 1 -L 100G -n lv_raid1 vg_data \
  /dev/nvme0n1 /dev/nvme1n1

# RAID0 条带化（读写性能翻倍，坏一块全丢）
lvcreate --type raid0 -i 4 -I 64 -l 100%FREE -n lv_raid0 vg_data
```

本篇实操用的是默认**线性（linear）**模式：4 块盘顺序叠放，无冗余，坏一块可能丢全部数据，适合纯容量场景。

## LVM 元数据备份与恢复

每次 PV/VG/LV 变更都会自动存档，路径在 `/etc/lvm/archive/`，最新配置在 `/etc/lvm/backup/`：

```bash
vgcfgbackup vg_data                     # 手动备份
vgcfgrestore --list vg_data             # 查看可恢复的存档点
vgcfgrestore -f /etc/lvm/archive/vg_data_00005-xxx.vg vg_data  # 恢复元数据
```

:::tip 救命稻草
误删 LV 后只要**还没被覆盖写入**，用 `vgcfgrestore` 恢复元数据再 `lvchange -ay` 激活，数据大概率能救回来。所以误操作后第一件事：**停止写入**。
:::

## 常见坑

| 坑 | 说明 |
|----|------|
| XFS 不能缩容 | 只能扩不能缩，缩容需求选 ext4，或者备份重建 |
| fstab 写错开不了机 | 改完必跑 `mount -a` 验证；救援模式输入 root 密码后 `mount -o remount,rw /` 修复 |
| 盘只剩一点容量 | VG 默认预留部分空间 + PE 取整，`vgs` 看 VFree，需要可用 `-l 100%FREE` 吃满 |
| thin 池写满 | 池满后写入会报错甚至挂起，要监控 Data% 并及时 `lvextend` 扩池 |
| 挂载点扩容命令 | `xfs_growfs` 后面跟**挂载点**，不是设备路径（ext4 的 `resize2fs` 才跟设备） |
| 直接管分区后新建 | 已有分区的盘要先 `wipefs -a /dev/xxx` 清签名，否则 pvcreate 会提示确认 |
