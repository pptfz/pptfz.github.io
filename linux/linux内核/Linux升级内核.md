## Linux升级内核

**CentOS7.6默认内核版本是3.10**

```shell
$ uname -r
3.10.0-1062.el7.x86_64
```

[Linux内核官网](https://www.kernel.org/)



**可根据自己实际需求下载对应版本**

![iShot_2022-08-30_14.48.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-08-30_14.48.11.png)



## 1.rpm包安装

[参考官方网站](https://elrepo.org/tiki/HomePage)

[CentOS7内核rpm包下载地址](https://elrepo.org/linux/kernel/el7/x86_64/RPMS/)

### 1.1 安装yum源

#### 1.1.1 导入公钥

```shell
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
```



#### 1.1.2 安装yum源

```shell
yum -y install https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm
```



### 1.2 安装最新版

:::tip说明

- [kernel-lt](https://elrepo.org/tiki/kernel-lt)：长期维护版
- [kernel-ml](https://elrepo.org/tiki/kernel-ml)：最新稳定版

:::

这里安装最新长期维护版

```shell
yum -y install --enablerepo=elrepo-kernel kernel-lt
```



也可以通过下载[CentOS7内核rpm包下载地址](https://elrepo.org/linux/kernel/el7/x86_64/RPMS/)rpm包安装



### 1.3 修改内核顺序

```shell
grub2-set-default 0 && grub2-mkconfig -o /etc/grub2.cfg
```



### 1.4 确认默认启动内核

```shell
grubby --default-kernel
export kernel_version=`grubby --default-kernel|awk -F'-' '{print $2}'`
echo -e "\e[42m安装的内核版本是 $kernel_version\e[0m"
```



### 1.5 重启机器生效

```shell
reboot
```





## 2.源码编译安装



:::tip说明

6.x的内核需要gcc5.1+版本，更多要求可以参考[官方文档](https://docs.kernel.org/process/changes.html#changes)

:::



### 2.1 编译gcc

[gcc官网](https://gcc.gnu.org/)

[gcc官方安装文档](https://gcc.gnu.org/install/)



#### 2.1.1 下载源码包

[gcc源码包下载地址](https://ftp.gnu.org/gnu/gcc/)

```shell
export GCC_VERSION=10.5.0
wget https://ftp.gnu.org/gnu/gcc/gcc-${GCC_VERSION}/gcc-${GCC_VERSION}.tar.xz
```



#### 2.1.2 解压缩

```shell
tar xf gcc-${GCC_VERSION}.tar.xz
```



#### 2.1.3 安装依赖

```shell
yum -y install gmp-devel mpfr-devel libmpc-devel gcc-c++
```



#### 2.1.4 创建构建目录

:::tip说明

在源代码目录外创建一个用于构建GCC的目录。这有助于保持源代码和构建文件分开

:::

```shell
mkdir build-gcc
cd build-gcc
```



#### 2.1.4 配置gcc

:::tip说明

更多配置项可以参考[官方文档](https://gcc.gnu.org/install/configure.html)

:::

```shell
../gcc-${GCC_VERSION}/configure --prefix=/usr/local --disable-multilib
```



#### 2.1.5 编译和安装

```shell
make -j `nproc` && make install
```



#### 2.1.6 验证安装

```shell
$ gcc --version
gcc (GCC) 5.2.0
Copyright (C) 2015 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```





### 2.2 源码编译内核

[CentOS7内核源码包下载地址](https://www.kernel.org/)

[linux内核6.x源码编译安装官方文档](https://docs.kernel.org/admin-guide/README.html)





#### 2.2.1 下载源码包

```shell
export KERNEL_VERSION=6.1.55
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VERSION}.tar.xz
```



#### 2.2.2 解压缩包

```shell
tar xf linux-${KERNEL_VERSION}.tar.xz
```



#### 2.2.3 安装依赖

```shell
yum -y install ncurses-devel flex bison openssl-devel elfutils-libelf-devel dwarves
```



#### 2.2.4 确保没有过时的 `.o` 文件和依赖项

```shell
cd linux-${KERNEL_VERSION}
make mrproper
```



#### 2.2.5 配置内核

**配置命令**

| 命令                       | 说明                                                         |
| -------------------------- | ------------------------------------------------------------ |
| make config                | 纯文本界面                                                   |
| make menuconfig            | 基于文本的彩色菜单、选项列表和对话框                         |
| make nconfig               | 增强的基于文本的彩色菜单                                     |
| make xconfig               | 基于Qt的配置工具                                             |
| make gconfig               | 基于GTK+的配置工具                                           |
| make oldconfig             | 基于现有的 `./.config` 文件选择所有选项，并询问                    新配置选项 |
| make olddefconfig          | 类似 `make oldconfig` ，但不询问直接将新选项设置为默认值     |
| make defconfig             | 根据体系架构，使用 `arch/$arch/defconfig` 或                     `arch/$arch/configs/${PLATFORM}_defconfig` 中的                    默认选项值创建 `./.config` 文件 |
| make ${PLATFORM}_defconfig | 使用 `arch/$arch/configs/${PLATFORM}_defconfig` 中的默认选项值创建一个 `./.config` 文件。                    用 `make help` 来获取您体系架构中所有可用平台的列表 |
| make allyesconfig          | 通过尽可能将选项值设置为 `y`，创建一个 `./.config` 文件      |
| make allmodconfig          | 通过尽可能将选项值设置为 `m`，创建一个 `./.config` 文件      |
| make allnoconfig           | 通过尽可能将选项值设置为 `n`，创建一个 `./.config` 文件      |
| make randconfig            | 通过随机设置选项值来创建 `./.config` 文件                    |
| make localmodconfig        | 基于当前配置和加载的模块（lsmod）创建配置。禁用已加载的模块不需要的任何模块选项<br>要为另一台计算机创建localmodconfig，请将该计算机的lsmod存储到一个文件中，并将其作为lsmod参数传入<br>此外，通过在参数LMC_KEEP中指定模块的路径，可以将模块保留在某些文件夹或kconfig文件中<br>`target$ lsmod > /tmp/mylsmod`<br>`target$ scp /tmp/mylsmod host:/tmp`<br>`host$ make LSMOD=/tmp/mylsmod LMC_KEEP="drivers/usb:drivers/gpu:fs" localmodconfig`<br>上述方法在交叉编译时也适用 |
| make localyesconfig        | 与localmodconfig类似，只是它会将所有模块选项转换为内置（=y）。你可以同时通过LMC_KEEP保留模块 |
| make kvm_guest.config      | 为kvm客户机内核支持启用其他选项                              |
| make xen.config            | 为xen dom0客户机内核支持启用其他选项                         |
| make tinyconfig            | 配置尽可能小的内核                                           |

更多关于使用Linux内核配置工具的信息，见文档 [Kconfig make config](https://docs.kernel.org/kbuild/kconfig.html)



```
make olddefconfig
```



#### 2.2.6 编译内核



```shell
make -j `nproc` 
```



#### 2.2.7 安装内核模块

```shell
make modules_install
```



#### 2.2.8 安装内核

```shell
make install 
```



#### 2.2.9 修改内核顺序

```shell
grub2-set-default 0 && grub2-mkconfig -o /etc/grub2.cfg
```



#### 2.2.10 确认默认启动内核

```shell
grubby --default-kernel
export kernel_version=`grubby --default-kernel|awk -F'-' '{print $2}'`
echo -e "\e[42m安装的内核版本是 $kernel_version\e[0m"
```



#### 2.2.11 重启机器

```shell
reboot
```



#### 2.2.12 重启后验证

```shell
$ uname -a
Linux VM-0-4-centos 6.1.55 #1 SMP PREEMPT_DYNAMIC Sat Oct  7 16:33:51 CST 2023 x86_64 x86_64 x86_64 GNU/Linux
```


