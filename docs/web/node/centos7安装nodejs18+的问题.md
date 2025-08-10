# centos7安装nodejs18+的问题



## 问题

centos7安装node18后执行命令报错

```sh
$ node -v
node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
node: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
```



centos7yum源安装的glibc版本是2.17，而node18+需要的glibc版本是2.27+，如果想要在centos7上使用node18+，则需要安装高版本的glibc，这又会涉及到安装其他高版本的软件，非常麻烦，因此无法使用官方编译的二进制包在centos7上正常运行

```shell
$ rpm -qa|grep glibc
glibc-headers-2.17-326.el7_9.x86_64
glibc-common-2.17-326.el7_9.x86_64
glibc-2.17-326.el7_9.x86_64
glibc-devel-2.17-326.el7_9.x86_64
```



## 解决方法

这里有一个开源项目提供 [非官方构建](https://github.com/nodejs/unofficial-builds/) 的nodejs二进制包，[项目官网](https://unofficial-builds.nodejs.org/) 有相关说明

官方提供了一个 [下载地址](https://unofficial-builds.nodejs.org/download/) 

下载二进制包

```sh
wget https://unofficial-builds.nodejs.org/download/release/v18.20.2/node-v18.20.2-linux-x64-glibc-217.tar.xz
```



解压缩

```sh
tar xf node-v18.20.2-linux-x64-glibc-217.tar.xz -C /usr/local/
```



导出环境变量

```sh
echo 'export PATH=$PATH:/usr/local/node-v18.20.2-linux-x64-glibc-217/bin/' > /etc/profile.d/node.sh
```



重新加载环境变量

```sh
source /etc/profile
```



再次执行就可以了

```sh
$ node -v
v18.20.2

$ npm -v
10.5.0
```



配置npm加速

```sh
npm config set registry=https://registry.npmmirror.com
```



查看

```sh
$ npm config get registry
https://registry.npmmirror.com
```



