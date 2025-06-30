## Linux升级内核

**CentOS7.6默认内核版本是3.10**

```shell
$ uname -r
3.10.0-1062.el7.x86_64
```

[Linux内核官网](https://www.kernel.org/)



**可根据自己实际需求下载对应版本**

![iShot_2022-08-30_14.48.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-08-30_14.48.11.png)



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

:::tip 说明

- [kernel-lt](https://elrepo.org/tiki/kernel-lt)：长期维护版
- [kernel-ml](https://elrepo.org/tiki/kernel-ml)：最新稳定版



可以通过 `yum --disablerepo=* --enablerepo=elrepo-kernel list available` 查看yum源中可用的rpm包版本

```sh
$ yum --disablerepo=* --enablerepo=elrepo-kernel list available
Loaded plugins: fastestmirror, langpacks
Loading mirror speeds from cached hostfile
 * elrepo-kernel: hkg.mirror.rackspace.com
elrepo-kernel                                                                                                                                          | 3.0 kB  00:00:00     
elrepo-kernel/primary_db                                                                                                                               | 2.1 MB  00:00:01     
Available Packages
kernel-lt.x86_64                                                                       5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-devel.x86_64                                                                 5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-doc.noarch                                                                   5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-headers.x86_64                                                               5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-tools.x86_64                                                                 5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-tools-libs.x86_64                                                            5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-lt-tools-libs-devel.x86_64                                                      5.4.264-1.el7.elrepo                                                      elrepo-kernel
kernel-ml.x86_64                                                                       6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-devel.x86_64                                                                 6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-doc.noarch                                                                   6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-headers.x86_64                                                               6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-tools.x86_64                                                                 6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-tools-libs.x86_64                                                            6.6.7-1.el7.elrepo                                                        elrepo-kernel
kernel-ml-tools-libs-devel.x86_64                                                      6.6.7-1.el7.elrepo                                                        elrepo-kernel
perf.x86_64                                                                            5.4.264-1.el7.elrepo                                                      elrepo-kernel
python-perf.x86_64                                                                     5.4.264-1.el7.elrepo                                                      elrepo-kernel
```

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



:::tip 说明

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

:::tip 说明

在源代码目录外创建一个用于构建GCC的目录。这有助于保持源代码和构建文件分开

:::

```shell
mkdir build-gcc
cd build-gcc
```



#### 2.1.4 配置gcc

:::tip 说明

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

| 命令                  | 功能描述                                         |
| --------------------- | ------------------------------------------------ |
| `make menuconfig`     | 基于终端的 ncurses 菜单界面配置（推荐）          |
| `make nconfig`        | 新版终端界面，功能更强（也推荐）                 |
| `make xconfig`        | Qt 图形化界面，需要 Qt 环境                      |
| `make gconfig`        | GTK 图形化界面，需要 GTK 环境                    |
| `make config`         | 一问一答式逐个配置（交互式）                     |
| `make oldconfig`      | 基于已有 `.config` 更新新选项                    |
| `make defconfig`      | 根据当前架构的默认配置生成 `.config`             |
| `make localmodconfig` | 仅启用当前系统加载的内核模块（自动裁剪）         |
| `make allyesconfig`   | 启用所有支持的配置为 yes                         |
| `make allnoconfig`    | 禁用所有配置（最小配置）                         |
| `make allmodconfig`   | 所有支持项都编译为模块（=m）                     |
| `make randconfig`     | 随机生成配置（用于测试）                         |
| `make savedefconfig`  | 把当前 `.config` 保存为 `defconfig` 格式（精简） |



更多关于使用Linux内核配置工具的信息，见文档 [Kconfig make config](https://docs.kernel.org/kbuild/kconfig.html)

```shell
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

