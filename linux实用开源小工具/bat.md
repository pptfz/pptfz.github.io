# bat



[bat github地址](https://github.com/sharkdp/bat)

[bat github中文介绍地址](https://github.com/chinanf-boy/bat-zh)



# 1.简介

官方对于 bat 的解释

> 一个 `cat` 克隆，搭配语法高亮和Git集成



**语法高亮显示**

`bat`支持大量编程和`mark**`语言的语法高亮显示:

![iShot2021-06-21 20.07.50](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-21 20.07.50.png)



**Git集成**

`bat`与`git`沟通,显示关于修改的索引 (参见左侧栏) :

![iShot2021-06-21 20.09.12](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-21 20.09.12.png)







# 2.安装

## 2.1 下载安装包

在 [官方releases](https://github.com/sharkdp/bat/releases)  中下载安装包

[安装参考链接](https://github.com/sharkdp/bat/issues/325)

> **CentOS7需要下载 `bat-v0.18.1-x86_64-unknown-linux-musl.tar.gz` 格式的包**

```shell
wget https://github.com/sharkdp/bat/releases/download/v0.18.1/bat-v0.18.1-x86_64-unknown-linux-musl.tar.gz
```



## 2.2 解压缩、修改文件名称

```shell
tar xf bat-v0.18.1-x86_64-unknown-linux-musl.tar.gz -C /usr/local/
 mv /usr/local/bat-v0.18.1-x86_64-unknown-linux-musl/ /usr/local/bat-v0.18.1
```



## 2.3 导出命令

```shell
ln -s /usr/local/bat-v0.18.1/bat /usr/bin
```



## 2.4 查看版本

```shell
$ bat --version
bat 0.18.1
```



# 3.使用

## 3.1 查看主题

使用 `bat --list-themes` 获取语法高亮显示的所有可用主题的列表



![iShot2021-06-21 20.25.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-21 20.25.05.png)



## 3.2 使用主题

**使用命令 `bat --theme=主题名` 指定主题**

```shell
# 使用 Monokai Extended Origin 主题
bat --theme="Monokai Extended Origin" test

或者

export BAT_THEME="Monokai Extended Origin"
bat test
```



**未使用主题前**

```
cat /etc/profile
```

![iShot2021-06-21 20.54.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-21 20.54.02.png)



**使用主题后**

```shell
export BAT_THEME="Monokai Extended Origin"
bat /etc/profile
```

![iShot2021-06-21 20.54.40](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-21 20.54.40.png)



[更多操作(下载主题等)看官方文档即可](https://github.com/chinanf-boy/bat-zh)

