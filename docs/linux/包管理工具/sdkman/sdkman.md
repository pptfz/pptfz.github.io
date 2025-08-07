# sdkman

## 简介

[sdkman github](https://github.com/sdkman/sdkman-cli)

[sdkman官网](https://sdkman.io/)

SDKMAN是一款用于在大多数基于Unix的系统上管理多版本JVM（Java虚拟机）相关软件开发工具包的并行工具。该工具提供了便捷的命令行界面（CLI）和应用程序接口（API），支持安装、切换、删除及列出各版本候选包的操作





## 安装

### 安装

:::tip 说明

sdkman安装位置在 `$HOME/.sdkman`

并且会在你的shell文件 (`~/.zshrc` 或 `~/.bashrc`) 中写入以下内容

```shell
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
```

:::

```sh
curl -s https://get.sdkman.io | bash
```



查看版本

```shell
$ sdk version
SDKMAN!
script: 5.19.0
native: 0.7.4 (macos aarch64)
```



### 更新

```shell
sdk selfupdate force
```



### 卸载

```shell
tar zcvf ~/sdkman-backup_$(date +%F-%kh%M).tar.gz -C ~/ $HOME/.sdkman
rm -rf ~/.sdkman
```



在shell文件 (`~/.zshrc` 或 `~/.bashrc`) 中删除以下配置

```shell
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
```



## 使用

查看可用版本

```sh
$ sdk list java
================================================================================
Available Java Versions for macOS ARM 64bit
================================================================================
 Vendor        | Use | Version      | Dist    | Status     | Identifier
--------------------------------------------------------------------------------
 Corretto      |     | 24           | amzn    |            | 24-amzn            
 
               |     | 23.0.2       | amzn    |            | 23.0.2-amzn        
 
               |     | 21.0.6       | amzn    |            | 21.0.6-amzn        
 
               |     | 17.0.14      | amzn    |            | 17.0.14-amzn       
 
               |     | 11.0.26      | amzn    |            | 11.0.26-amzn       
 
               |     | 8.0.442      | amzn    |            | 8.0.442-amzn       
 
 Gluon         |     | 22.1.0.1.r17 | gln     |            | 22.1.0.1.r17-gln   
 
               |     | 22.1.0.1.r11 | gln     |            | 22.1.0.1.r11-gln   
 
 GraalVM CE    |     | 24           | graalce |            | 24-graalce         
 
               |     | 23.0.2       | graalce |            | 23.0.2-graalce  
......               
```



安装jdk

```sh
export JAVA_VERSION='23.0.2-oracle'
sdk install java $JAVA_VERSION
```



查看当前系统安装的jdk

```shell
$ ls ~/.sdkman/candidates/java/
11.0.11-oracle
17.0.11-oracle
21.0.3-oracle
22.0.1-oracle
current
```



设置默认jdk

```shell
export JAVA_VERSION='23.0.2-oracle'
sdk java default $JAVA_VERSION
```





## 使用sdkman管理手动安装的jdk

mac上通过dmg安装文件安装了一个jdk

```shell
$ java -version
java version "17.0.11" 2024-04-16 LTS
Java(TM) SE Runtime Environment (build 17.0.11+7-LTS-207)
Java HotSpot(TM) 64-Bit Server VM (build 17.0.11+7-LTS-207, mixed mode, sharing)
```



安装位置在 `/Library/Java/JavaVirtualMachines/`

```shell
$ ls /Library/Java/JavaVirtualMachines/                             
jdk-11.0.11.jdk
```



创建软链接

:::tip 说明

创建目录软链接后就可以使用sdkman命令管理手动安装的jdk了

:::

```shell
ln -s /Library/Java/JavaVirtualMachines/jdk-11.0.11.jdk/Contents/Home ~/.sdkman/candidates/java/jdk-11.0.11-oracle
```



手动切换

```sh
$ sdk use java 11.0.11-oracle 

Using java version 11.0.11-oracle in this shell.
```



查看版本

```sh
$ java -version
java version "11.0.11" 2021-04-20 LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.11+9-LTS-194)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.11+9-LTS-194, mixed mode)
```

