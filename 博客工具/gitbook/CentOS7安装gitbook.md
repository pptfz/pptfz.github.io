# CentOS7安装gitbook



[gitbook官网](https://www.gitbook.com/)

[gitbook github地址](https://github.com/GitbookIO/gitbook)





## 1.安装nodejs

[nodejs官网](https://nodejs.org/en/)

[nodejs官方下载地址](https://nodejs.org/en/download/)

[nodejs历史版本官方下载地址](https://nodejs.org/en/download/releases/)

### 1.1 下载二进制包

```shell
wget https://nodejs.org/dist/latest-v12.x/node-v12.22.1-linux-x64.tar.xz
```



### 1.2 解压缩包、修改名称

```shell
tar xf node-v12.22.1-linux-x64.tar.xz -C /usr/local/ && mv /usr/local/node-v12.22.1-linux-x64/ /usr/local/node-v12.22.1
```



### 1.3 导出环境变量

```shell
echo 'export PATH=$PATH:/usr/local/node-v12.22.1/bin' > /etc/profile.d/node.sh  && source /etc/profile
```



### 1.4 验证

```shell
$ node -v
v12.22.1

$ npm -v
6.14.12
```



### 1.5 配置npm加速

```shell
npm config set registry https://registry.npm.taobao.org
```



**验证加速**

```shell
$ npm config get registry
https://registry.npm.taobao.org/
```





## 2.安装gitbook

### 2.1 安装 gitbook-cli

`gitbook-cli` 是在同一系统上安装和使用多个版本的 GitBook 的实用程序。它将自动安装所需版本的 GitBook 以构建一本书。

```shell
npm install gitbook-cli -g
```



### 2.2 安装gitbook

第一次执行 `gitbook -V` 开始安装gitbook

```shell
$ gitbook -V
CLI version: 2.3.2
Installing GitBook 3.2.3
/usr/local/node-v14.17.0/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js:287
      if (cb) cb.apply(this, arguments)
                 ^

TypeError: cb.apply is not a function
    at /usr/local/node-v14.17.0/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js:287:18
    at FSReqCallback.oncomplete (fs.js:193:5)
```



遇到报错，按照提示编辑文件 `/usr/local/node-v14.17.0/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js` ，注释以下3行，重新执行 `gitbook -V` 即可

```js
//fs.stat = statFix(fs.stat)
//fs.fstat = statFix(fs.fstat)
//fs.lstat = statFix(fs.lstat)
```



验证

```sh
$ gitbook -V
CLI version: 2.3.2
GitBook version: 3.2.3
```



## 3.gitbook使用

### 3.1 创建gitbook目录

```shell
mkdir /gitbook 
```



### 3.2 初始化gitbook

```sh
cd /gitbook && gitbook init
```



**初始化完成后会生成两个文件**

```shell
README.md			#项目介绍文件
SUMMARY.md		#gitbook目录结构
```



### 3.3 配置gitbook生成书籍

> **编辑 SUMMARY.md ，写入以下内容(这里仅做示例)**
>
> **⚠️vim命令.md的路径是/gitbook/linux/linux命令**

```markdown
# Summary
* [Linux](README.md)
  * [Linux基础](README.md)
    * [Linux命令](README.md)
      * [vim命令](README.md)
        * [vim命令](linux/linux命令/vim命令.md)
```



### 3.4 构建书籍

> **⚠️构建命令必须在SUMMARY.md同路径下执行**

```
gitbook build
```



### 3.5 启动gitbook

> **gitbook默认监听tcp 4000端口**

```shell
gitbook serve &
```



浏览器访问 `IP:4000`

![iShot2021-06-12 18.07.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-12 18.07.22.png)





## 4.gitbook设置

### 4.1 修改gitbook代码框字体大小

```shell
prismnode_modules/themes/themes/prism-base16-ateliersulphurpool.light.css

13、14行
font-size: 18px;
line-height: 1.6;
```



