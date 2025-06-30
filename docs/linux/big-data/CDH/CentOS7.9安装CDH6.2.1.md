

# CentOS7.9安装CDH6.2.1

[toc]



[CDH官网](https://cn.cloudera.com/)

[CDH6.x下载页面](https://docs.cloudera.com/documentation/enterprise/6/release-notes/topics/rg_cdh_6_download.html)

[CDH6.2.1下载信息](https://docs.cloudera.com/documentation/enterprise/6/release-notes/topics/rg_cdh_62_download.html#concept_mqv_mtz_bjb)



[CDH6.x文档总览](https://www.cloudera.com/documentation/enterprise/6/6.2.html)



[本文参考连接](https://blog.csdn.net/summer089089/article/details/107605831)



## 1.CDH简介

Cloudera Manager，简称CM

> Cloudera Manager是一个拥有集群自动化安装、中心化管理、集群监控、报警功能的一个工具



CM架构

![iShot2021-05-30_21.38.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-05-30_21.38.39.png)





| 组件                | 说明                                               |
| ------------------- | -------------------------------------------------- |
| Cloudera Repository | 软件由Cloudera管理分布存储库                       |
| Server              | 负责软件安装、配置、启动、停止，管理服务运行的集群 |
| Management Service  | 由一组执行各种监控、告警、报告功能角色的服务       |
| Database            | 储存配置和监控信息                                 |
| Agent               | 安装在每台机器上，负责启动和停止、配置、监控主机   |
| Clients             | 用于与服务器进行交互的接口                         |







## 2.环境准备

### 2.0 安装纯净系统后执行的脚本

```shell
#!/usr/bin/env bash
#

# 修改系统yum源为aliyun并添加epel源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
[ ! -e /etc/yum.repos.d/CentOS-Base.repo ] && curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo && sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

[ ! -e /etc/yum.repos.d/epel.repo ] && curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
yum makecache
yum -y install tar wget net-tools git vim tree lrzsz htop iftop iotop psmisc python36 python3-devel zlib zlib-devel gcc gcc-c++ conntrack-tools jq socat bash-completion telnet nload strace tcpdump lsof sysstat

# 关闭防火墙、selinux、NetworkManager
systemctl disable firewalld NetworkManager
sed -i '7s/enforcing/disabled/' /etc/selinux/config

# 同步时间计划任务 由于后续要用到ntpserver，因此ntpdate选择不执行
#sed -i '/*\/10 \* \* \* \* \/usr\/sbin\/ntpdate ntp2\.aliyun\.com &>\/dev\/null/d' /var/spool/cron/root
#echo "*/10 * * * * /usr/sbin/ntpdate ntp2.aliyun.com &>/dev/null" >>/var/spool/cron/root

# 历史命令显示时间
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

# 修改系统最大文件描述符
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

# 设置pip国内源
mkdir ~/.pip
cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF

# 个人习惯执行命令 netstat -ntpl，所以做一个别名
sed -i.bak "8c alias n='netstat -ntpl'" ~/.bashrc && source ~/.bashrc

reboot
```



### 2.1 实验环境

| **角色**   | **IP地址**    | **主机名**       | **CDH版本** | **硬件配置** | 节点角色                                      | **系统**      | **内核**                   |
| ---------- | ------------- | ---------------- | ----------- | ------------ | --------------------------------------------- | ------------- | -------------------------- |
| **master** | **10.0.0.50** | **cdh-master01** | **6.2.1**   | **4c8g+50G** | **Hadoop Master，CM Server，数据节点，Mysql** | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |
| **slave**  | **10.0.0.51** | **cdh-slave01**  | **6.2.1**   | **4c8g+50G** | **数据节点，CMAgent**                         | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |
| **slave**  | **10.0.0.52** | **cdh-slave02**  | **6.2.1**   | **4c8g+50G** | **数据节点，CM Agent**                        | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |



### 2.2 配置ssh免密

:::tip 说明

如无特殊说明，以下操作均在 cdh-master01 节点

CDH服务开启与关闭是通过server和agent来完成的，所以这里不需要配置ssh免密登录，但是为了我们分发文件方便，在这里我们也配置ssh免密

:::

#### 2.2.1 编辑环境变量文件

**环境变量文件中IP、主机名、子网网段可自行修改**

```shell
[ -d /opt/cdh6.2.1/script ] || mkdir -p /opt/cdh6.2.1/script && cd /opt/cdh6.2.1/script
cat > env.sh <<EOF
export NODE_IPS=(10.0.0.50 10.0.0.51 10.0.0.52)
export NODE_NAMES=(cdh-master01 cdh-slave01 cdh-slave02)
export NODE_SUBNET='10.0.0.0/24'
EOF
```



#### 2.2.2 生成密钥对

```shell
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa &>/dev/null
```



#### 2.2.3 编辑expect自动化交互脚本

- **这里机器用户名是`root`，密码是国际标准通用密码`1`，ssh端口`22`**

- **执行路径在 `/opt/cdh6.2.1/script`**

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



#### 2.2.4 编辑shell脚本循环执行expect脚本

```shell
# 编辑脚本
source env.sh
cat > ssh.sh <<'EOF'
#!/bin/bash
for i in ${NODE_IPS[@]}
do
  expect ./ssh.exp ~/.ssh/id_rsa.pub $i
done
EOF

# 安装expect
yum -y install expect

# 执行脚本
source ssh.sh
```



### 2.3 每个节点配置hosts信息

```shell
source /opt/cdh6.2.1/script/env.sh 
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



### 2.4 禁用防火墙和selinux

**这一步已在2.0安装纯净系统后执行的脚本中执行过了**

```shell
# 禁用防火墙
systemctl stop firewalld && systemctl disable firewalld

# 禁用selinux	临时修改
setenforce 0

# 禁用selinux	永久修改，重启服务器后生效
sed -i '7s/enforcing/disabled/' /etc/selinux/config
```



### 2.5 安装JDK8	

#### 2.5.1 安装说明

:::tip 说明

- 集群中每一个节点都需要安装jdk

- jdk需要登陆到 [oracle](https://www.oracle.com/) 官网才可以下载，这里下载的是版本是 `jdk-8u251`

- jdk安装包下载至 `/opt/cdh6.2.1/pkg`

[jdk官方下载地址](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

:::

```shell
[ -d /opt/cdh6.2.1/{pkg,script} ] || mkdir -p /opt/cdh6.2.1/{pkg,script}
```



#### 2.5.2 编写jdk安装脚本

```shell
cat >/opt/cdh6.2.1/script/jdk8_install.sh <<'ABC'
#!/usr/bin/env bash
PWD=/opt/cdh6.2.1/pkg
JDK_PKG=jdk-8u251-linux-x64.tar.gz

# 安装jdk1.8.0_251
tar xf $PWD/$JDK_PKG -C /usr/local
cat >/etc/profile.d/jdk8.sh<<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_251
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF

# 使jdk命令环境变量生效
source /etc/profile.d/jdk8.sh

# 做一个软连接
ln -sf $JAVA_HOME/bin/java /usr/bin/java
ABC
```



#### 2.5.3 chd slave节点创建相关目录

```shell
source /opt/cdh6.2.1/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} "mkdir -p /opt/cdh6.2.1/{pkg,script}"
  done
```



#### 2.5.4 拷贝jdk安装包和jdk安装脚本到其余节点

```shell
source /opt/cdh6.2.1/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    scp ${NODE_NAMES}:/opt/cdh6.2.1/script/jdk8_install.sh ${node_ip}:/opt/cdh6.2.1/script
    scp ${NODE_NAMES}:/opt/cdh6.2.1/pkg/jdk-8u251-linux-x64.tar.gz ${node_ip}:/opt/cdh6.2.1/pkg 
  done
```



#### 2.5.5 执行jdk安装脚本

```shell
source /opt/cdh6.2.1/script/env.sh
#export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"  
    ssh root@${node_ip} 'source /opt/cdh6.2.1/script/jdk8_install.sh'
  done
```





### 2.6 配置时间同步

**时间同步可选 ntp 和 chrony，这里选择 chrony**

[ntp官网](http://www.ntp.org)

[chrony官网](https://chrony.tuxfamily.org/)



:::tip 说明

sed中有变量替换，需要使用双引号

:::

这里有问未解决！！！

#### 2.6.1 各节点安装chrony

```shell
source /opt/cdh6.2.1/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} yum -y install chrony
  done
```



#### 2.6.2 cdh master节点修改服务器地址为阿里云

```shell
source /opt/cdh6.2.1/script/env.sh
sed -i.bak '3,6d' /etc/chrony.conf && sed -i -e '3cserver ntp1.aliyun.com iburst' -e "/^#allow/callow ${NODE_SUBNET}" /etc/chrony.conf
```



#### 2.6.3 node节点修改同步服务器为master节点

```shell
# 这里选择另外两个节点执行
source /opt/cdh6.2.1/script/env.sh
export NODE_IPS=(${NODE_IPS[1]} ${NODE_IPS[2]})
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} sed -i.bak '3,6d' /etc/chrony.conf && sed -i "3cserver ${NODE_NAMES[0]} iburst" /etc/chrony.conf
  done
```



#### 2.6.4 启动chronyd服务并设置开机自启

```shell
source /opt/cdh6.2.1/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} 'systemctl enable chronyd && systemctl start chronyd'
  done
```



#### 2.6.5 检查端口，chronyd监听udp323端口

```shell
source /opt/cdh6.2.1/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} netstat -nupl|grep chronyd
  done
```





#### 2.6.6 检查同步

```shell
source /opt/cdh6.2.1/script/env.sh
for node_ip in ${NODE_IPS[@]}
  do
    echo ">>> ${node_ip}"
    ssh root@${node_ip} chronyc sources
  done
```



### 2.7 安装mysql

:::tip 说明

二进制安装的mysql启动脚本 `/etc/init.d/mysql` 和  `安装目录/mysql/bin/mysqld_safe`  这两个文件中都是默认在 `/usr/local/mysql`，如果安装目录不在 `/usr/local/` 下，需要修改这两个文件中的路径，即把 `/usr/local` 替换为mysql安装目录，用以下命令修改

```shell
sed -i 's#/usr/local#你的mysql安装目录#g' /etc/init.d/mysql /你的mysql安装目录/mysql/bin/mysqld_safe
```

:::



#### 2.7.1 下载二进制包

[mysql官方下载地址](https://downloads.mysql.com/archives/community/)

> **mysql5.7.30 md5值  `611be3b18a30498b705db773293ad341`** 

```shell
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.30-linux-glibc2.12-x86_64.tar.gz
```



#### 2.7.2 解压缩mysql二进制包到/usr/local

```shell
tar xf mysql-5.7.30-linux-glibc2.12-x86_64.tar.gz -C /usr/local
```



#### 2.7.3 修改名称、做软连接

```shell
mv /usr/local/mysql-5.7.30-linux-glibc2.12-x86_64 /usr/local/mysql-5.7.30 && 
ln -s /usr/local/mysql-5.7.30 /usr/local/mysql
```



#### 2.7.4 创建mysql用户

```shell
useradd -M -s /bin/nologin mysql 
```



#### 2.7.5 编辑主配置文件，myql-5.7.30二进制包默认没有mysql配置文件

:::tip 说明

如果指定了mysql的socket文件位置，则必须添加`[client]`标签并同时指定socket文件位置，否则客户端会默认从  `/tmp` 下找socket文件

:::

```shell
# 备份/etc/my.cnf
mv /etc/my.cnf /etc/my.cnf.old

# 以下配置为最精简版，可根据实际情况进行相应设置
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



#### 2.7.6 创建socker文件目录、目录文件授权

:::tip 说明

如果mysql配置文件中指定了socket文件目录，则这个目录的权限必须是mysql，否则mysql会启动失败

:::

```shell
mkdir -p /var/lib/mysql
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql
chown mysql.mysql /etc/my.cnf
```



#### 2.7.7 拷贝启动脚本

```shell
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



#### 2.7.8 初始化mysql

:::tip 说明

mysql-5.7.22初始化没有提示！！！

:::

```shell
/usr/local/mysql/bin/mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```



**参数说明**

| **参数**              | **说明**          |
| --------------------- | ----------------- |
| --user                | 指定mysql用户     |
| --basedir             | 指定mysql安装目录 |
| --datadir             | 指定mysql数据目录 |
| --initialize-insecure | 不生成随机密码    |





#### 2.7.9 添加mysql命令环境变量

```shell
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



#### 2.7.10 配置systemd管理mysql

```shell
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



#### 2.7.11 启动mysql、检查启动

```python
# 重新加载systemd系统服务
systemctl daemon-reload

# 启动mysql并加入开机自启
systemctl start mysqld && systemctl enable mysqld

# 查看mysql端口
$ netstat -ntpl  | grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      31349/mysqld  
```







```

```





```shell
wget https://archive.cloudera.com/cdh6/6.2.1-patch4069/redhat7/yum/ -P /etc/yum.repos.d/
```

