# Ubuntu26.04安装

## GRUB 引导菜单

:::tip 说明

- Try or Install Ubuntu Server（默认，27 秒后自动进）

  启动安装器，进入 Ubuntu Server 的安装流程（选语言 → 键盘 → 网络 → 磁盘 → 建账号 → 装系统）。**正常装系统就选这个，直接回车或等它倒计时走完。**

  名字里的 "Try" 是从桌面版沿用的说法（桌面版有不安装直接试用的 Live 模式），Server 版没有“试用”模式，选它就是安装。



- Boot from next volume

  **跳过 U 盘，从下一个启动设备引导**——通常是机器硬盘上已装的系统。场景：你只是临时插了个安装 U 盘，但这次不想装系统，想启动机器原有的系统，选它就不用拔 U 盘去 BIOS 改启动顺序。



- UEFI Firmware Settings

  **直接进主板的 UEFI/BIOS 设置界面**（等同于开机按 Del/F2）。场景：需要改启动顺序、开关 Secure Boot、开虚拟化（VT-x/SVM）、调 RAID 模式时，不用记按键时机，从这里进。

  

:::





![iShot_2026-10-21_11.22.20](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_11.22.20.png)





## 选择语言

![iShot_2026-10-21_11.29.04](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_11.29.04.png)



## 键盘布局配置

![iShot_2026-10-21_11.30.06](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_11.30.06.png)



## 选安装基础包

:::tip 说明

- **Ubuntu Server（默认选中）**
  标准版，带一套精心挑选的服务器常用包：完整的工具链、常用排障工具（如 `net-tools`、`man` 文档等）、崩溃报告等。人要登录上去操作的机器选这个。

- **Ubuntu Server (minimized)**
  精简版，专为“没人登录”的场景设计——容器宿主机、云镜像、大规模自动化集群。砍掉了很多交互式工具和文档，体积小、攻击面小。但缺的东西会给你带来意外（很多命令没有、连 man 手册都没有），缺了再 `apt install` 也麻烦。**你这台是要登录操作的，别选。**​

- **Search for third-party drivers（不勾）**
  安装时联网搜索专有驱动（主要是 NVIDIA 显卡驱动、部分 Wi-Fi/网卡闭源驱动）。
  - 这台如果是普通服务器/虚机 → 用不上，不勾
  - 注意提示里那句话：**要 FIPS 合规或实时内核的机器不能装**，公司安全审计场景尤其别勾
  - 以后真有 NVIDIA GPU，装完再单独装驱动更可控

:::

![iShot_2026-10-21_11.31.24](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_11.31.24.png)



## 网络配置

:::tip 说明

- **eno0s5**：virtio 虚拟网卡（KVM 虚拟机标配，说明这是台 KVM 虚机），名字前缀 `eno` 是板载/onboard 设备的命名
- **DHCPv4 `10.0.0.5/24`**：IPv4 已自动分配，能正常联网
- **DHCPv6 `fdb2:...`**：那是个链路本地地址，没有全局 IPv6，不影响
- **Create bond**：多网卡绑定（主备/聚合提高带宽或冗余）

:::

![iShot_2026-10-21_11.41.03](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_11.41.03.png)



手动配置网络 

![iShot_2026-10-21_18.45.14](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_18.45.14.png)



配置代理(可选)

![iShot_2026-10-21_18.47.02](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_18.47.02.png)





## 镜像源配置

:::tip 说明

可用的源

| 源            | 地址                                           |
| :------------ | :--------------------------------------------- |
| 清华 TUNA     | `https://mirrors.tuna.tsinghua.edu.cn/ubuntu/` |
| 阿里云        | `https://mirrors.aliyun.com/ubuntu/`           |
| 中科大        | `https://mirrors.ustc.edu.cn/ubuntu/`          |
| ubuntu国内cdn | `https://cn.archive.ubuntu.com/ubuntu/`        |

:::

![iShot_2026-10-21_18.47.55](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_18.47.55.png)





## 磁盘分区配置

:::tip 说明

- **Use an entire disk**（已选中）
  自动分区整块盘：1 个 EFI 分区（~1G）+ 1 个 boot 分区（~2G）+ 剩余全给 LVM 根分区。虚机里看到的是 `Ubuntu_Linux26.04-0_SSD... 64.000G` 这块虚拟盘，没数据可保留，用整盘没毛病。

- **Set up this disk as an LVM group**（已勾选）
  用 LVM 管理磁盘。**建议保留勾选**——好处是以后磁盘扩容（虚机加盘/扩盘）可以在线扩逻辑卷，不用动分区表。代价仅是多一层抽象。你做运维的应该熟：以后扩容就是 `lvextend` + `resize2fs` 两条命令的事。

- **Encrypt the LVM group with LUKS**（没勾）
  全盘加密。**虚机里不用勾**：

  - 密钥存在 TPM/每次开机要输密码——无头虚机每次重启都卡在输密码，远程没法开机
  - 性能有损耗
  - 真要数据安全，虚机加密宿主机层面做更合适（Parallels 的加密，或云盘加密）

- **Also create a recovery key**
  LUKS 的恢复密钥，跟着加密走，没加密就是灰的。

  

- **Custom storage layout**
  手动分区。除非有特殊需求（比如单独分 /var、/data，或不要 LVM），否则不值得手搓。以后要单独挂数据盘，装完再加盘格式化挂载更灵活。

:::



![iShot_2026-10-21_18.55.50](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_18.55.50.png)





分区方案确认

:::caution 注意 

`ubuntu-vg` 里还有 **30.4726G free space**——安装器默认只给根卷分了一半，剩下 30G 留在卷组里没分配。两个选择：



方案 A：现在就用满（推荐，顺手改掉）

1. 在 **USED DEVICES** 里选中 `ubuntu-lv` 那行（`new ext4, mounted at /`），回车 → **Edit**

2. **Size** 栏改成最大值：`60.9436G`（或直接输 `60.9436`，留几个 G 余量也行，比如 `58G`）

3. Save → 确认根分区 SIZE 变成 ~60G → `Done`

   ![iShot_2026-10-21_19.05.33](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.05.33.png)



方案 B：不管它，装完再扩（也完全没问题）

直接 `Done` → Continue，装完系统后两条命令：

bash

```bash
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv
```

扩展是**在线的**，不用重启、不用卸载。

:::

![iShot_2026-10-21_19.01.17](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.01.17.png)



确认分区

![iShot_2026-10-21_19.06.41](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.06.41.png)





## 用户名密码配置

:::tip 说明

| 字段                  | 含义                                                         | 建议                                                         |
| :-------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **Your name**         | 显示用全名，随便填                                           | 填个代号就行，比如 `houlixi`                                 |
| **Your servers name** | 主机名（hostname），局域网里标识这台机器                     | 建议按用途命名，比如 `ubuntu-vm`、`dev-kvm`，运维一般有命名规范就按规范来 |
| **Pick a username**   | 登录账号名，**小写字母开头，只能小写字母/数字/连字符/下划线** | 别用 `admin`/`root`（root 本来就不能登，admin 容易和系统组混淆），比如 `houlixi` |
| **Choose a password** | 这个账号的密码，**同时就是 sudo 密码**                       | 给个强的，这密码=SSH 密码=sudo 密码，别用弱密码              |

:::

![iShot_2026-10-21_19.07.49](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.07.49.png)



Ubuntu Pro 推销页，跳过即可

![iShot_2026-10-21_19.09.36](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.09.36.png)



## 配置ssh

:::caution 注意

要勾选上 `Install OoenSSH server`

:::

![iShot_2026-10-21_19.10.44](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.10.44.png)



Snaps 推荐页，可以按需选择

![iShot_2026-10-21_19.12.42](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.12.42.png)





## 开始安装

![iShot_2026-10-21_19.14.27](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.14.27.png)



提示 `Installation complete！` 后，选择 `Reboot Now` 重启

![iShot_2026-10-21_19.19.57](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.19.57.png)



重启后出现登录页面就完成安装了

![iShot_2026-10-21_19.21.19](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-21_19.21.19.png)

## 安装报错：An error occurred during installation

:::caution 注意

安装过程中报错 `Sorry, there was a problem completing the installation.`，左侧进度停在 `configuring curtin co...` 阶段。

原因：**之前有安装中断过，磁盘上残留了旧的分区/LVM 结构，curtin 再次安装时写不进去**。选择界面里的 `Restart the installer` 没用（残留还在），直接 `Reboot Now` 重新安装即可。

:::

如果重装还报错，可以从安装器 shell 里手动清掉残留分区结构再装：

```bash
lsblk              # 确认虚拟盘设备名，Parallels 一般是 sda 或 vda
wipefs -a /dev/sda # 清除残留签名，设备名以上一条命令输出为准
```



