# CentOS7编译安装git



[git官网](https://git-scm.com/)

[git github地址 ](https://github.com/git/git)

[git官方安装文档](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

[git各版本官方下载地址](https://mirrors.edge.kernel.org/pub/software/scm/git/)

[这个博客写的不错](https://learnku.com/server/t/34671)

## 1.下载源码包

```shell
export GIT_VERSION=2.32.0
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-${GIT_VERSION}.tar.xz
```



## 2.安装依赖包

:::tip

**系统环境为最小化安装CentOS7.9**

:::

```shell
yum -y install curl zlib zlib-devel openssl openssl-devel expat autoconf gcc gcc-c++ asciidoc xmlto util-linux docbook2X libcurl-devel
```



官方文档中提到 `如果你使用 Fedora/RHEL/RHEL衍生版，那么你需要执行以下命令 ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi 以此来解决二进制文件名的不同`，`db2x_docbook2texi` 命令需要安装 `docbook2X` 包

```shell
ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi
ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2texi
```



:::tip

**官方文档中只说明了需要执行 `ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi` 这个命令，但是实际上还需要执行 `ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2texi`，否则后续make的时候会有如下报错**

:::

```
docbook2texi:/book: no description for directory entry
    MAKEINFO git.info
utf8 "\x89" does not map to Unicode at /usr/share/perl5/vendor_perl/XML/SAX/PurePerl/Reader/Stream.pm line 37.
    MAKEINFO gitman.info
make[1]: Leaving directory `/root/git-2.32.0/Documentation'
```



## 3.解压缩包

```shell
tar xf git-${GIT_VERSION}.tar.xz && cd git-${GIT_VERSION}
```



## 4.编译安装

```shell
make configure
./configure --prefix=/usr/local/git
make -j`nproc` all doc info
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

使用 `git clone` 报错 `git: 'remote-https' is not a git command. See 'git --help'.`

```shell
$ git clone https://github.com./garabik/grc.git
Cloning into 'grc'...
git: 'remote-https' is not a git command. See 'git --help'.
```



在 [StackExchange](https://unix.stackexchange.com/questions/694507/git-clone-from-https-url-fails-says-its-remote-https-is-not-a-git-command-an) 中找到了答案

![iShot_2022-10-11_23.09.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-10-11_23.09.03.png)



在 [github](https://github.com/git/git/blob/b896f729e240d250cf56899e6a0073f6aa469f5d/INSTALL#L141-L149) 中官方有相关说明

![iShot_2022-10-11_23.10.48](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-10-11_23.10.48.png)



原因是git使用 `libcurl` 库匹配 `http://` 或 `https://` ，需要的版本是 `7.19.4` 及以上，因此安装这个包重新编译git即可

```shell
yum -y install libcurl-devel
```
