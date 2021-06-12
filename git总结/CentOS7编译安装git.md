# CentOS7编译安装git



[git官网](https://git-scm.com/)

[git github地址 ](https://github.com/git/git)

[git官方安装文档](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

[git各版本官方下载地址](https://mirrors.edge.kernel.org/pub/software/scm/git/)



## 1.下载源码包

```shell
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.32.0.tar.xz
```



## 2.安装依赖包

> 系统环境为最小化安装CentOS7.9

```shell
yum -y install curl zlib zlib-devel openssl openssl-devel expat libiconv autoconf gcc gcc-c++ asciidoc xmlto util-linux
```



官方文档中提到 `如果你使用 Fedora/RHEL/RHEL衍生版，那么你需要执行以下命令 ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi 以此来解决二进制文件名的不同`，`db2x_docbook2texi` 命令需要安装 `docbook2X` 包

```shell
yum -y install docbook2X
ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi
```



## 3.解压缩包

```shell
tar xf git-2.32.0.tar.xz && cd git-2.32.0
```



## 4.编译安装

```shell
make configure
./configure --prefix=/usr/local/git
make all doc info
make install install-doc install-html install-info
```



## 5.导出git命令环境变量

```shell
echo 'export PATH=$PATH:/usr/local/git/bin' >/etc/profile.d/git.sh
source /etc/profile
```



## 6.验证

```shell
$ git --version
git version 2.32.0
```



**获取git最新版**

```shell
git clone git://git.kernel.org/pub/scm/git/git.git
```



## 7.遇到的问题

**<span style=color:red>⚠️此问题无解，折腾了半天还是无法解决，果断放弃，还是乖乖的 yum 安装吧</span>**

```shell
$ git clone https://github.com/garabik/grc.git
Cloning into 'grc'...
git: 'remote-https' is not a git command. See 'git --help'.
```







