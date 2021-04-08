[toc]



# CentOS7中用Ambari快速搭建大数据平台

公司的产品是基于大数据平台的，近期要做公司产品私有化部署，因此学习一下 [Ambari](http://ambari.apache.org/)

本文参考地址 [原文链接](https://blog.csdn.net/jiaowoshouzi/article/details/80675007?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.edu_weight&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.edu_weight)



# 一、Ambari简介

[Ambari官网](http://ambari.apache.org/)

[Ambari github地址](https://github.com/apache/ambari)



**Ambari是什么**

[Ambari](http://ambari.apache.org/) 是创建、管理、监视 [Hadoop](http://hadoop.apache.org/) 的集群的软件。这里的 Hadoop 是广义，指的是 Hadoop 整个生态圈（例如 [Hive](https://hive.apache.org/)，[Hbase](https://hbase.apache.org/)，[Sqoop](https://sqoop.apache.org/)，[Zookeeper](https://zookeeper.apache.org/) ，[Spark](https://spark.apache.org/) ，[Flink](https://flink.apache.org/) ，[Flume](https://flume.apache.org/) ，[Oozie](https://oozie.apache.org/) 等），而并不仅是特指 Hadoop。用一句话来说，Ambari 就是为了让 Hadoop 以及相关的大数据软件更容易使用的一个工具。 Ambari 现在所支持的平台组件也越来越多，例如流行的 Spark，Storm 等计算框架，以及资源调度平台 YARN 等，我们都能轻松地通过 Ambari 来进行部署，为想构建大数据平台的初学者提供了很大的便捷。 

Ambari 自身也是一个分布式架构的软件，主要由两部分组成：Ambari Server 和 Ambari Agent。简单来说，用户通过 Ambari Server 通知 Ambari Agent 安装对应的软件；Agent 会定时地发送各个机器每个软件模块的状态给 Ambari Server，最终这些状态信息会呈现在 Ambari 的 GUI，方便用户了解到集群的各种状态，并进行相应的维护。



**Ambari**

> 基于Web的工具，支持Apache Hadoop集群的创建、管理和监控。



**HDP**

> 包含了hadoop生态系统的所有软件项目，比如HBase、Zookeeper、Hive
>
> 、Pig等等。



**HDP-UTILS**

> 工具类库。



**HDP-GPL**

> LZO压缩库软件包存储在单独的HDP-GPL存储库中。



**Ambari安装说明**

> **Ambari类似于Ansible，并没有明确的 master/slave 之分**



# 二、环境准备

## 2.0 安装纯净系统后执行的脚本

```shell
#!/usr/bin/env bash
#

#修改系统yum源为aliyun并添加epel源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
[ ! -e /etc/yum.repos.d/CentOS-Base.repo ] && curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo && sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

[ ! -e /etc/yum.repos.d/epel.repo ] && curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
yum makecache
yum -y install tar wget net-tools git vim tree lrzsz htop iftop iotop psmisc python36 python3-devel zlib zlib-devel gcc gcc-c++ conntrack-tools jq socat bash-completion telnet nload strace tcpdump lsof sysstat

#关闭防火墙、selinux、NetworkManager
systemctl disable firewalld NetworkManager
sed -i '7s/enforcing/disabled/' /etc/selinux/config

#同步时间计划任务 由于后续要用到ntpserver，因此ntpdate选择不执行
#sed -i '/*\/10 \* \* \* \* \/usr\/sbin\/ntpdate ntp2\.aliyun\.com &>\/dev\/null/d' /var/spool/cron/root
#echo "*/10 * * * * /usr/sbin/ntpdate ntp2.aliyun.com &>/dev/null" >>/var/spool/cron/root

#历史命令显示时间
sed -i '/HISTFILESIZE=2000/d' /etc/bashrc
sed -i '/HISTSIZE=2000/d' /etc/bashrc
sed -i '/HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "/d' /etc/bashrc
sed -i '/export HISTTIMEFORMAT/d' /etc/bashrc
cat >>/etc/bashrc<<'EOF'
HISTFILESIZE=2000
HISTSIZE=2000
HISTTIMEFORMAT="%Y-%m-%d %H:%M:%S "
export HISTTIMEFORMAT
EOF
source /etc/bashrc

#修改系统最大文件描述符
sed -i '/root soft nofile 65535/d' /etc/security/limits.conf
sed -i '/root hard nofile 65535/d' /etc/security/limits.conf
sed -i '/* soft nofile 65535/d' /etc/security/limits.conf
sed -i '/* hard nofile 65535/d' /etc/security/limits.conf
cat >>/etc/security/limits.conf<<'EOF'
root soft nofile 65535
root hard nofile 65535
* soft nofile 65535
* hard nofile 65535
EOF

#设置pip国内源
mkdir ~/.pip
cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF

#个人习惯执行命令 netstat -ntpl，所以做一个别名
sed -i.bak "8c alias n='netstat -ntpl'" ~/.bashrc && source ~/.bashrc

reboot
```



## 2.1 实验环境

| **角色**   | **IP地址**     | **主机名**                   | **ambari版本** | **硬件配置** | **系统**      | **内核**                   |
| ---------- | -------------- | ---------------------------- | -------------- | ------------ | ------------- | -------------------------- |
| **master** | **10.0.0.136** | **ambari-server01.test.com** | **2.6.2.2**    | **2c8g**     | **CentOS7.8** | **3.10.0-1127.el7.x86_64** |
| **slave**  | **10.0.0.137** | **ambari-agent01.test.com**  | **2.6.2.2**    | **2c8g**     | **CentOS7.8** | **3.10.0-1127.el7.x86_64** |
| **slave**  | **10.0.0.138** | **ambari-agent02.test.com**  | **2.6.2.2**    | **2c8g**     | **CentOS7.8** | **3.10.0-1127.el7.x86_64** |



## 2.2 配置ssh免密

**⚠️<span style=color:red>如无特殊说明，以下操作均在 ambari-server01 节点</span>**

### 2.2.1 编辑环境变量文件

**环境变量文件中IP、主机名、子网网段可自行修改**

```shell
[ -d /opt/ambari/script ] || mkdir -p /opt/ambari/script && cd /opt/ambari/script
cat > env.sh <<EOF
export NODE_IPS=(10.0.0.136 10.0.0.137 10.0.0.138)
export NODE_NAMES=(ambari-server01.test.com ambari-agent01.test.com ambari-agent02.test.com)
export NODE_SUBNET='10.0.0.0/24'
EOF
```



### 2.2.2 生成密钥对

```shell
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa &>/dev/null
```



### 2.2.3 编辑expect自动化交互脚本

- **这里机器用户名是`root`，密码是国际标准通用密码`1`，ssh端口`22`**

- **⚠️执行路径在 `/opt/ambari/script`**

```shell
cat > ssh.exp <<'EOF'
#!/usr/bin/expect
if { $argc !=2 } {
  send_user "usage: expect ssh.exp file ip\n"
  exit
}

set file [lindex $argv 0]
set ip [lindex $argv 1]
set password "1"

spawn ssh-copy-id -i $file -p 22 root@$ip
expect {
  "yes/no" {send "yes\r";exp_continue}
  "*password" {send "$password\r"}
}
expect eof
EOF
```



### 2.2.4 编辑shell脚本循环执行expect脚本

```shell
#编辑脚本
source env.sh
cat > ssh.sh <<'EOF'
#!/bin/bash
for i in ${NODE_IPS[@]}
do
  expect ./ssh.exp ~/.ssh/id_rsa.pub $i
done
EOF

#安装expect
yum -y install expect

#执行脚本
source ssh.sh
```



## 2.3 每个节点配置hosts信息

```shell
source /opt/ambari/script/env.sh 
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "cat >> /etc/hosts <<EOF
${NODE_IPS[0]} ${NODE_NAMES[0]}
${NODE_IPS[1]} ${NODE_NAMES[1]}
${NODE_IPS[2]} ${NODE_NAMES[2]}
	EOF"
  done
```



## 2.4 禁用防火墙和selinux

**这一步已在2.0安装纯净系统后执行的脚本中执行过了**

```shell
#禁用防火墙
systemctl stop firewalld && systemctl disable firewalld

#禁用selinux	临时修改
setenforce 0

#禁用selinux	永久修改，重启服务器后生效
sed -i '7s/enforcing/disabled/' /etc/selinux/config
```



## 2.5 安装JDK8	

### 2.5.1 安装说明

- **<span style=color:red>⚠️⚠️⚠️集群中每一个节点都需要安装jdk</span>**

- **⚠️jdk需要登陆到 [oracle](https://www.oracle.com/) 官网才可以下载，这里下载的是版本是 `jdk-8u251`**

- **jdk安装包下载至 `/opt/ambari/pkg`**

- [jdk官方下载地址](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

```shell
mkdir -p /opt/ambari/pkg
```



### 2.5.2 编写jdk安装脚本

```shell
cat >/opt/ambari/script/jdk8_install.sh <<'ABC'
#!/usr/bin/env bash
PWD=`pwd`
JDK_PKG=jdk-8u251-linux-x64.tar.gz

#安装jdk1.8.0_251
tar xf $PWD/$JDK_PKG -C /usr/local
cat >/etc/profile.d/jdk8.sh<<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_251
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF

#使jdk命令环境变量生效
source /etc/profile.d/jdk8.sh

#做一个软连接
ln -sf $JAVA_HOME/bin/java /usr/bin/java
ABC
```



### 2.5.3 拷贝jdk安装包和jdk安装脚本到其余节点

```shell
source /opt/ambari/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp ${NODE_NAMES}:/opt/ambari/script/jdk8_install.sh /opt/ambari/pkg/jdk-8u251-linux-x64.tar.gz ${node_ip}:/tmp
  done
```



### 2.5.4 执行jdk安装脚本

⚠️这个有问题！！！

```shell
source /opt/ambari/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"  
    ssh root@${node_ip} 'source /tmp/jdk8_install.sh'
  done
```





## 2.6 配置时间同步

**时间同步可选 ntp 和 chrony，这里选择 chrony**

[ntp官网](http://www.ntp.org)

[chrony官网](https://chrony.tuxfamily.org/)



**⚠️sed中有变量替换，需要使用双引号**





这里有问未解决！！！

```shell
#各节点安装chrony
source /opt/ambari/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} yum -y install chrony
  done


#修改服务器地址为阿里云
source /opt/ambari/script/env.sh
sed -i.bak '3,6d' /etc/chrony.conf && sed -i -e '3cserver ntp1.aliyun.com iburst' -e "/^#allow/callow ${NODE_SUBNET}" /etc/chrony.conf


#node节点修改同步服务器为master节点
#这里选择另外两个节点执行
source /opt/ambari/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} sed -i.bak '3,6d' /etc/chrony.conf && sed -i "3cserver ${NODE_NAMES[0]} iburst" /etc/chrony.conf
  done


#启动chronyd服务并设置开机自启
source /opt/ambari/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} 'systemctl enable chronyd && systemctl start chronyd'
  done


#检查端口，chronyd监听udp323端口
source /opt/ambari/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} netstat -nupl|grep chronyd
  done
  
#检查同步
source /opt/ambari/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} chronyc sources
  done
```



## 2.7 安装HTTP服务器

[httpd官网](http://httpd.apache.org/)



**说明**

> **这里安装 HTTP 主要作用在为后期安装 ambari 制作本地源时候用的**
>
> **CentOS7.8默认的httpd版本是2.4.6**



```shell
yum -y install httpd
systemctl enable httpd && systemctl start httpd
```



## 2.8 安装mysql

⚠️⚠️⚠️

> **二进制安装的mysql启动脚本 `/etc/init.d/mysql` 和  `安装目录/mysql/bin/mysqld_safe`  这两个文件中都是默认在 `/usr/local/mysql`，如果安装目录不在 `/usr/local/` 下，需要修改这两个文件中的路径，即把 `/usr/local` 替换为mysql安装目录**
>
> **sed -i 's#/usr/local#你的mysql安装目录#g' /etc/init.d/mysql /你的mysql安装目录/mysql/bin/mysqld_safe**



### 2.8.1 下载二进制包

[mysql官方下载地址](https://downloads.mysql.com/archives/community/)

> **mysql5.7.30 md5值  `611be3b18a30498b705db773293ad341`** 

```shell
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.30-linux-glibc2.12-x86_64.tar.gz
```



### 2.8.2 解压缩mysql二进制包到/usr/local

```shell
tar xf mysql-5.7.30-linux-glibc2.12-x86_64.tar.gz -C /usr/local
```



### 2.8.3 修改名称、做软连接

```shell
mv /usr/local/mysql-5.7.30-linux-glibc2.12-x86_64 /usr/local/mysql-5.7.30 && 
ln -s /usr/local/mysql-5.7.30 /usr/local/mysql
```



### 2.8.4 创建mysql用户

```python
useradd -M -s /bin/nologin mysql 
```



### 2.8.5 编辑主配置文件，myql-5.7.30二进制包默认没有mysql配置文件

**<span style=color:red>⚠️如果指定了mysql的socket文件位置，则必须添加`[client]`标签并同时指定socket文件位置，否则客户端会默认从 /tmp下找socket文件</span>**

```python
#备份/etc/my.cnf
mv /etc/my.cnf /etc/my.cnf.old

#以下配置为最精简版，可根据实际情况进行相应设置
cat >> /etc/my.cnf <<'EOF'
[mysqld]
basedir=/usr/local/mysql
datadir=/usr/local/mysql/data
socket=/var/lib/mysql/mysql.sock
user=mysql
log-error=/usr/local/mysql/data/error.log

[client]
socket=/var/lib/mysql/mysql.sock
EOF
```



### 2.8.6 创建socker文件目录、目录文件授权

**⚠️⚠️⚠️<span style=color:red>如果mysql配置文件中指定了socket文件目录，则这个目录的权限必须是mysql，否则mysql会启动失败</span>**

```shell
mkdir -p /var/lib/mysql
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql
chown mysql.mysql /etc/my.cnf
```



### 2.8.7 拷贝启动脚本

```python
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



### 2.8.8 初始化mysql

**<span style=color:red>⚠️⚠️⚠️mysql-5.7.22初始化没有提示！！！</span>**

```python
/usr/local/mysql/bin/mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```



**参数说明**

| **参数**                  | **说明**              |
| ------------------------- | --------------------- |
| **--user**                | **指定mysql用户**     |
| **--basedir**             | **指定mysql安装目录** |
| **--datadir**             | **指定mysql数据目录** |
| **--initialize-insecure** | **不生成随机密码**    |





### 2.8.9 添加mysql命令环境变量

```python
#导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

#使配置生效
source /etc/profile
```



### 2.8.10 配置systemd管理mysql

```python
cat >> /etc/systemd/system/mysqld.service <<'EOF'
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 5000
EOF
```



### 2.8.11 启动mysql、检查启动

```python
#重新加载systemd系统服务
systemctl daemon-reload

#启动mysql并加入开机自启
systemctl start mysqld && systemctl enable mysqld

#查看mysql端口
$ netstat -ntpl  | grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      31349/mysqld  
```



### 2.8.12 创建ambari数据库及授权

```shell
mysql -uroot -e "create database ambari character set utf8mb4"
mysql -uroot -e "grant all on ambari.* to ambari@'localhost' identified by 'ambari'"
mysql -uroot -e "grant all on ambari.* to ambari@'%' identified by 'ambari'"
mysql -uroot -e "flush privileges"
```





# 三、安装ambari

## 3.1 制作ambari本地源

**各包大小**

> `HDP-2.6.5.0-centos7-rpm.tar.gz` 6.8G 
>
> `ambari-2.6.2.2-centos7.tar.gz` 1.7G
>
> `HDP-UTILS-1.1.0.22-centos7.tar.gz` 87M



**下载 ambari 、HDP-UTILS、 HDP 包**

> [官方下载地址](https://supportmatrix.hortonworks.com/)，可以从这里下载不同版本的包

```shell
mkdir /opt/ambari/yum && cd /opt/ambari/yum

wget http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.6.2.2/ambari-2.6.2.2-centos7.tar.gz

wget http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0/HDP-2.6.5.0-centos7-rpm.tar.gz

wget http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7/HDP-UTILS-1.1.0.22-centos7.tar.gz
```



**将3个压缩包解压至 `/var/www/html/ambari`**

```shell
mkdir /var/www/html/ambari
tar xf ambari-2.6.2.2-centos7.tar.gz -C /var/www/html/ambari
tar xf HDP-UTILS-1.1.0.22-centos7.tar.gz -C /var/www/html/ambari
tar xf HDP-2.6.5.0-centos7-rpm.tar.gz -C /var/www/html/ambari
```



## 3.2 安装制作本地yum源工具

```shell
yum -y install yum-utils createrepo
```



## 3.3 创建ambari、HDP、HDP-UTILS的repo仓库

**⚠️<span style=color:red>如果下载的版本不同，则需要修改 `baseurl`和`gpgcheck`中的url路径</span>**

### 3.3.1 创建ambari的repo仓库

```shell
source /opt/ambari/script/env.sh
cat > /etc/yum.repos.d/ambari.repo <<EOF
[ambari-2.6.2.2]
name=ambari-2.6.2.2-1
baseurl=http://${NODE_IPS}/ambari/ambari/centos7/2.6.2.2-1/
gpgcheck=1
gpgkey=http://${NODE_IPS}/ambari/ambari/centos7/2.6.2.2-1/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
EOF
```



### 3.3.2 创建HDP、HDP-UTILS的repo仓库

```shell
cat > /etc/yum.repos.d/hdp.repo <<EOF
[HDP-2.6.5.0]
name=HDP-2.6.5.0
baseurl=http://${NODE_IPS}/ambari/HDP/centos7/2.6.5.0-292/
gpgcheck=1
gpgkey=http://${NODE_IPS}/ambari/HDP/centos7/2.6.5.0-292/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
 
[HDP-UTILS-1.1.0.22]
name=HDP-UTILS-1.1.0.22
baseurl=http://${NODE_IPS}/ambari/HDP-UTILS/centos7/1.1.0.22/
gpgcheck=1
gpgkey=http://${NODE_IPS}/ambari/HDP-UTILS/centos7/1.1.0.22/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
EOF
```



### 3.3.3 生成本地缓存

```shell
yum clean all && yum makecache
```



### 3.3.4 通过本地源安装ambari

**⚠️<span style=color:red>执行此命令会安装 ambari2.6.2.2 和 pg9.2.24 </span>**

```shell
yum -y install ambari-server
```



# 四、配置ambari

## 4.1 下载mysql驱动

[mysql驱动官方下载地址](https://downloads.mysql.com/archives/c-j/)

**由于使用的是mysql5.7，因此必须下载mysql5.7驱动，<span style=color:red>且必须放于 `/usr/share/java` 下</span>**

否则后续会有如下报错，原因是 ambari 默认的 mysql jdbc 驱动不支持 5.6 以上版本

```shell
Configuring ambari database...
WARNING: Before starting Ambari Server, you must copy the MySQL JDBC driver JAR file to /usr/share/java and set property "server.jdbc.driver.path=[path/to/custom_jdbc_driver]" in ambari.properties.
Press <enter> to continue.
ERROR: Before starting Ambari Server, you must copy the MySQL JDBC driver JAR file to /usr/share/java and set property "server.jdbc.driver.path=[path/to/custom_jdbc_driver]" in ambari.properties.
ERROR: Exiting with exit code -1. 
REASON: Before starting Ambari Server, you must copy the MySQL JDBC driver JAR file to /usr/share/java and set property "server.jdbc.driver.path=[path/to/custom_jdbc_driver]" in ambari.properties.
```





```shell
#创建/usr/share/java目录
[ -d /usr/share/java ] || mkdir /usr/share/java && cd /usr/share/java

#下载mysql驱动
wget https://downloads.mysql.com/archives/get/p/3/file/mysql-connector-java-5.1.46.tar.gz

#解压缩包
tar xf mysql-connector-java-5.1.46.tar.gz 

#移动mysql驱动到/usr/share/java，且名称必须为 mysql-connector-java.jar
mv mysql-connector-java-5.1.46/mysql-connector-java-5.1.46.jar /usr/share/java/mysql-connector-java.jar
```





## 4.2 启动配置程序

```shell
ambari-server setup
```



### 4.2.1 提示是否自定义设置	输入：y

```shell
Customize user account for ambari-server daemon [y/n] (n)?
```



### 4.2.2 设置ambari-server 账号	输入：ambari

```shell
Enter user account for ambari-server daemon (root):
```



### 4.2.3 设置JDK	输入：3

```shell
Checking JDK...
[1] Oracle JDK 1.8 + Java Cryptography Extension (JCE) Policy Files 8
[2] Oracle JDK 1.7 + Java Cryptography Extension (JCE) Policy Files 7
[3] Custom JDK
==============================================================================
Enter choice (1): 
```



### 4.2.4 设置JDK家目录	输入：/usr/local/jdk1.8.0_251

**jdk的家目录路径是 /usr/local/jdk1.8.0_251**

```shell
WARNING: JDK must be installed on all hosts and JAVA_HOME must be valid on all hosts.
WARNING: JCE Policy files are required for configuring Kerberos security. If you plan to use Kerberos,please make sure JCE Unlimited Strength Jurisdiction Policy Files are valid on all hosts.
Path to JAVA_HOME:
```





### 4.2.5 是否允许Ambari服务器下载和安装GPL许可的LZO包	输入：y

```shell
Enable Ambari Server to download and install GPL Licensed LZO packages [y/n] (n)?
```



### 4.2.6 数据库配置	输入：y

```shell
Enter advanced database configuration [y/n] (n)? 
```



### 4.2.7 选择数据库类型	输入：3

**输入3选择mysql**

```shell
Configuring database...
==============================================================================
Choose one of the following options:
[1] - PostgreSQL (Embedded)
[2] - Oracle
[3] - MySQL / MariaDB
[4] - PostgreSQL
[5] - Microsoft SQL Server (Tech Preview)
[6] - SQL Anywhere
[7] - BDB
==============================================================================
Enter choice (1): 
```



### 4.2.8 数据库信息填写

```shell
Enter choice (1): 3
Hostname (localhost): 		#默认即可
Port (3306): 		#默认3306
Database name (ambari): 	#这里数据库名称为ambari
Username (ambari): 		#数据库用户名是ambari
Enter Database Password (bigdata): 		#用户ambari的密码是ambari
Re-enter password: 		#确认密码
Configuring ambari database...
```



### 4.2.9 继续配置远程数据库连接属性	输入：y

**⚠️<span style=color:red>需要导入 `/var/lib/ambari-server/resources/Ambari-DDL-MySQL-CREATE.sql`到ambari数据库中</span>**

```shell
WARNING: Before starting Ambari Server, you must run the following DDL against the database to create the schema: /var/lib/ambari-server/resources/Ambari-DDL-MySQL-CREATE.sql
Proceed with configuring remote database connection properties [y/n] (y)?
```



**提示如下即为成功**

```shell
Extracting system views...
ambari-admin-2.6.2.2.1.jar
...........
Adjusting ambari-server permissions and ownership...
Ambari Server 'setup' completed successfully.
```



### 4.2.10 导入数据库

```shell
mysql -uroot -D ambari -e "source /var/lib/ambari-server/resources/Ambari-DDL-MySQL-CREATE.sql"
```





## 4.3 启动ambari

```shell
ambari-server start
```



**提示如下即为成功**

```shell
Using python  /usr/bin/python
Starting ambari-server
Ambari Server running with administrator privileges.
Organizing resource files at /var/lib/ambari-server/resources...
Ambari database consistency check started...
Server PID at: /var/run/ambari-server/ambari-server.pid
Server out at: /var/log/ambari-server/ambari-server.out
Server log at: /var/log/ambari-server/ambari-server.log
Waiting for server start........................
Server started listening on 8080

DB configs consistency check: no errors and warnings were found.
Ambari Server 'start' completed successfully.
```



## 4.4 登陆ambari

**浏览器访问 `http://IP:8080`**

![iShot2020-09-15 10.12.43](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.12.43.png)



**登陆后首界面**

![iShot2020-09-15 10.13.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.13.09.png)



**<span style=color:red>到此，ambari安装成功！！！</span>**





# 五、使用Ambari界面安装大数据组件

## 5.1 启动安装向导

**选择 `Launch Install Wizard`**

![iShot2020-09-15 10.17.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.17.22.png)



**输入集群名称**

![iShot2020-09-15 10.20.01](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.20.01.png)



## 5.2 选择集群版本、配置集群本地源

这里选择 HDP-2.6.5.0 版本

![iShot2020-09-15 10.22.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.22.13.png)



**保留 redhat7 一处，删除其他**

![iShot2020-09-15 10.24.07](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.24.07.png)



**设置HDP安装源，修改为本地源**

**原先默认源**

```shell
HDP-2.6	http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0

HDP-2.6-GPL	http://public-repo-1.hortonworks.com/HDP-GPL/centos7/2.x/updates/2.6.5.0

HDP-UTILS-1.1.0.22	http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7
```



**HDP-2.6、HDP-2.6-GPL、HDP-UTILS-1.1.0.22 依次修改为如下**

```shell
http://10.0.0.136/ambari/ambari/centos7/2.6.2.2-1
http://10.0.0.136/ambari/HDP/centos7/2.6.5.0-292
http://10.0.0.136/ambari/HDP-UTILS/centos7/1.1.0.22
```



**修改完成后点击下一步**

![iShot2020-09-15 10.28.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.28.55.png)



## 5.3 配置安装选项

### 5.3.1 修改配置文件

需要修改配置文件中https为http，否则后续会有类似如下报错

```shell
ERROR 2020-09-15 01:34:45,716 NetUtil.py:96-EOF occurred in vic lation of protocol (_ssl.c:618)

ERROR 2020-09-15 01:34:45,716 NetUtil.py:97-SSLError:Failed to connect. Please check openssl Library versions.
Refer to:https://bugzilla.redhat.com/show_bug.cgi?id=1022468 for more details.
```



**1.修改 `/etc/python/cert-verification.cfg` 中 `verify=platform_default`  为 `verify=disable`**

```shell
sed -i.bak '/^verify/cverify=disable' /etc/python/cert-verification.cfg
```



**2.修改 `/etc/ambari-agent/conf/ambari-agent.ini` 中 `[security]` 标签后加入以下两行内容**

**⚠️<span style=color:red>这一步必须在 `Confirm Hosts` 进行安装后才会有相应的文件，也就是说进入到 `Confirm Hosts` 这一步中注册主机稍等一会才可以进行修改文件操作(目前了解是这样，不知道有没有更好的方法)</span>**

![iShot2020-09-17 18.38.49](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-17 18.38.49.png)



**上图界面稍等几十秒然后再进行以下操作**

**`ssl_verify_cert=0`**
**`force_https_protocol=PROTOCOL_TLSv1_2`**

```shell
sed -i.bak -e '/^credential_shell_cmd/assl_verify_cert=0\nforce_https_protocol=PROTOCOL_TLSv1_2' /etc/ambari-agent/conf/ambari-agent.ini
```



**以上两步修改完成后需要重启 ambari-agent**

```shell
ambari-agent restart
```





### 5.3.2 配置集群节点信息

**输入集群节点FQDN式主机名、ambari-server的私钥、ambari-server的用户名和ssh端口**



**各节点 hosts 信息**

```shell
10.0.0.136 ambari-server01.test.com
10.0.0.137 ambari-agent01.test.com
10.0.0.138 ambari-agent02.test.com
```



**⚠️⚠️⚠️<span style=color:red>`Target Hosts` 处一定不要写IP地址，一定要写成FQDN式的主机名</span>**

**集群节点 `Target Hosts` 处要写成如下**

```shell
ambari-server01.test.com
ambari-agent01.test.com
ambari-agent02.test.com
```



![iShot2020-09-15 10.45.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 10.45.51.png)



**否则就会报错如下，非常坑**

```shell
ERROR 2020-09-14 17:07:52,075 main.py:246 - Ambari agent machine hostname (ambari01.hadoop) does not match expected ambari server hostname (10.0.0.136). Aborting registration. Please check hostname, hostname -f and /etc/hosts file to confirm your hostname is setup correctly
```



**注册成功后显示如下**

![iShot2020-09-15 14.07.53](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 14.07.53.png)



**⚠️<span style=color:red>5.3.3为遇到的问及记录</span>**

### 5.3.3 ambari安装到 `Confirm Hosts`遇到的报错

#### 5.3.3.1 报错1	找不到 ambari server

![iShot2020-09-14 17.00.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-14 17.00.15.png)



**重要日志**

![iShot2020-09-14 17.01.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-14 17.01.54.png)



**解决方法**

**集群节点 `Target Hosts` 处主机信息要写成如下FQDN式**

```shell
ambari-server01.test.com
ambari-agent01.test.com
ambari-agent02.test.com
```





#### 5.3.3.2 报错2 SSLError

![iShot2020-09-15 11.08.04](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 11.08.04.png)



**5.2步骤中修改了HDP源为本地**

**HDP-2.6、HDP-2.6-GPL、HDP-UTILS-1.1.0.22 依次修改为如下**

```shell
http://10.0.0.136/ambari/ambari/centos7/2.6.2.2-1
http://10.0.0.136/ambari/HDP/centos7/2.6.5.0-292
http://10.0.0.136/ambari/HDP-UTILS/centos7/1.1.0.22
```



**解决方法**

**⚠️<span style=color:red>以下操作需要在所有节点修改</span>**

1.修改 `/etc/python/cert-verification.cfg` 中 `verify=platform_default`  为 `verify=disable`

```shell
sed -i.bak '/^verify/cverify=disable' /etc/python/cert-verification.cfg
```



2.修改 `/etc/ambari-agent/conf/ambari-agent.ini` 中 `[security]` 标签后加入以下两行内容

`ssl_verify_cert=0`
`force_https_protocol=PROTOCOL_TLSv1_2`

```shell
sed -i.bak -e '/^credential_shell_cmd/assl_verify_cert=0\nforce_https_protocol=PROTOCOL_TLSv1_2' /etc/ambari-agent/conf/ambari-agent.ini
```



重启 ambari-agent

```shell
ambari-agent restart
```





## 5.4 选择需要安装的组件

**根据实际情况选择要安装的组件**

![iShot2020-09-15 14.18.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 14.18.23.png)



## 5.5 分配管理端服务

**根据实际情况选择各组件安装的节点**

![iShot2020-09-15 14.35.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 14.35.15.png)





## 5.6 定制服务

### 5.6.1 HDFS



![iShot2020-09-15 16.00.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.00.36.png)





只保留一个路径

![iShot2020-09-15 16.01.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.01.23.png)



### 5.6.2 YARN

![iShot2020-09-15 16.05.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.05.09.png)



只保留一个路径

![iShot2020-09-15 16.14.29](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.14.29.png)



### 5.6.3 HIVE

![iShot2020-09-15 16.27.42](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.27.42.png)





**指定mysql驱动位置，否则hive连接数据库会失败**

```shell
ambari-server setup --jdbc-db=mysql --jdbc-driver=/usr/share/java/mysql-connector-java.jar
```



**输出如下即为成功**

```shell
Using python  /usr/bin/python
Setup ambari-server
Copying /usr/share/java/mysql-connector-java.jar to /var/lib/ambari-server/resources
If you are updating existing jdbc driver jar for mysql with mysql-connector-java.jar. Please remove the old driver jar, from all hosts. Restarting services that need the driver, will automatically copy the new jar to the hosts.
JDBC driver was successfully initialized.
Ambari Server 'setup' completed successfully.
```





**创建hive数据库及授权**

```shell
mysql -uroot -e "create database hive character set utf8mb4"
mysql -uroot -e "grant all on hive.* to hivei@'localhost' identified by 'hive'"
mysql -uroot -e "grant all on hive.* to hive@'%' identified by 'hive'"
mysql -uroot -e "flush privileges"
```



**选择 `Existing MySQL / MariaDB Database` ，输入hive数据库密码，修改 `Database URL` 连接地址，测试连接成功即可**

![iShot2020-09-15 16.37.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.37.23.png)



### 5.6.4 Ambari Metrics

**需要设置grafana管理员用户的密码**

![iShot2020-09-15 16.41.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.41.09.png)



![iShot2020-09-15 16.43.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.43.35.png)



### 5.6.5 Atlas

**<span style=color:red>⚠️⚠️⚠️最好不要选择这个Atlas，网上查了半天也不知道标红的这两处该怎么写以及怎么查找</span>**

![iShot2020-09-15 17.08.42](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 17.08.42.png)





### 5.6.6 SmartSense

**需要输入密码，默认admin即可**

![iShot2020-09-15 16.48.25](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 16.48.25.png)



![iShot2020-09-15 17.12.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 17.12.39.png)



## 5.7 确认集群信息并部署

![iShot2020-09-15 17.14.28](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 17.14.28.png)



![iShot2020-09-15 17.15.07](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 17.15.07-0161347.png)





![iShot2020-09-15 17.16.19](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 17.16.19.png)



![iShot2020-09-15 18.45.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 18.45.14.png)



## 5.8 完成安装



![iShot2020-09-15 18.45.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 18.45.58.png)



完成安装

![iShot2020-09-15 18.46.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-15 18.46.54.png)


