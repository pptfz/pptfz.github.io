[toc]



# DolphinScheduler 单机部署

# 1.DolphinScheduler简介

**DolphinScheduler说明**

> **Apache DolphinScheduler 是一个分布式去中心化，易扩展的可视化DAG工作流任务调度系统。致力于解决数据处理流程中错综复杂的依赖关系，使调度系统在数据处理流程中开箱即用。**



**使用背景**

> **公司使用的是[EasyScheduler](https://analysys.github.io/easyscheduler_docs_cn/)，不过 EasyScheduler 已经捐献给了 Apache**
>
> **贡献给 Apache 后，改名为 DolphinScheduler，EasyScheduler已经不在维护**



[DolphinScheduler官网](https://dolphinscheduler.apache.org/zh-cn/)

[DolphinScheduler github地址](https://github.com/apache/incubator-dolphinscheduler)



**设计特点：** 

> **一个分布式易扩展的可视化DAG工作流任务调度系统。致力于解决数据处理流程中错综复杂的依赖关系，使调度系统在数据处理流程中`开箱即用`。 其主要目标如下：**

- 以DAG图的方式将Task按照任务的依赖关系关联起来，可实时可视化监控任务的运行状态
- 支持丰富的任务类型：Shell、MR、Spark、SQL(mysql、postgresql、hive、sparksql),Python,Sub_Process、Procedure等
- 支持工作流定时调度、依赖调度、手动调度、手动暂停/停止/恢复，同时支持失败重试/告警、从指定节点恢复失败、Kill任务等操作
- 支持工作流优先级、任务优先级及任务的故障转移及任务超时告警/失败
- 支持工作流全局参数及节点自定义参数设置
- 支持资源文件的在线上传/下载，管理等，支持在线文件创建、编辑
- 支持任务日志在线查看及滚动、在线下载日志等
- 实现集群HA，通过Zookeeper实现Master集群和Worker集群去中心化
- 支持对`Master/Worker` cpu load，memory，cpu在线查看
- 支持工作流运行历史树形/甘特图展示、支持任务状态统计、流程状态统计
- 支持补数
- 支持多租户
- 支持国际化
- 还有更多等待伙伴们探索



**与同类调度系统的对比**

![iShot2020-09-05 16.00.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 16.00.22.png)



# 2.DolphinScheduler标准安装

## 2.1 官方推荐系统配置

**Linux 操作系统版本要求**

| **操作系统**                 |     **版本**     |
| :--------------------------- | :--------------: |
| **Red Hat Enterprise Linux** |  **7.0 及以上**  |
| **CentOS**                   |  **7.0 及以上**  |
| **Oracle Enterprise Linux**  |  **7.0 及以上**  |
| **Ubuntu LTS**               | **16.04 及以上** |

> **注意：** 以上 Linux 操作系统可运行在物理服务器以及 VMware、KVM、XEN 主流虚拟化环境上。



**服务器建议配置**

| **CPU**  | **内存**  | **硬盘类型** | **网络**     | **实例数量** |
| -------- | --------- | ------------ | ------------ | ------------ |
| **4核+** | **8 GB+** | **SAS**      | **千兆网卡** | **1+**       |

> **注意：**
>
> - 以上建议配置为部署 DolphinScheduler 的最低配置，生产环境强烈推荐使用更高的配置。
> - 硬盘大小配置建议 50GB+ ，系统盘和数据盘分开。



**网络要求**

DolphinScheduler正常运行提供如下的网络端口配置：

| **组件**                 | **默认端口** | **说明**                               |
| ------------------------ | ------------ | -------------------------------------- |
| **MasterServer**         | **5678**     | **非通信端口，只需本机端口不冲突即可** |
| **WorkerServer**         | **1234**     | **非通信端口，只需本机端口不冲突即可** |
| **ApiApplicationServer** | **12345**    | **提供后端通信端口**                   |

> **注意：**
>
> - MasterServer 和 WorkerServer 不需要开启网络间通信，只需本机端口不冲突即可
> - 管理员可根据实际环境中 DolphinScheduler 组件部署方案，在网络侧和主机侧开放相关端口



## 2.2 系统环境

**操作系统及配置**

| **系统**      | **配置** | **磁盘** |
| ------------- | -------- | -------- |
| **centos7.8** | **4c8g** | **50g**  |



## 2.3 安装过程

[DolphinScheduler最新版1.3.2官方文档(截止2002.9.5)](https://dolphinscheduler.apache.org/zh-cn/docs/1.3.2/user_doc/standalone-deployment.html)



### 2.3.1 基础软件安装

#### 2.3.1.1 数据库(pg或者mysql)

- PostgreSQL (8.2.15+) or MySQL (5.7系列) :  **必装** 两者任选其一即可



#### 2.3.1.2 JDK8

- JDK (1.8+) : **必装**，请安装好后在`/etc/profile`下配置 `JAVA_HOME` 及 `PATH` 变量

- 自行到[JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html)官网下载安装包



这里选择下载`jdk-8u251-linux-x64.tar.gz`

```shell
# 上传jdk安装包至/opt并解压缩至/usr/local
cd /opt && tar xf jdk-8u251-linux-x64.tar.gz -C /usr/local

# 导出jdk环境变量
cat >/etc/profile.d/jdk8.sh<<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_251
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF

# 使配置生效
source /etc/profile.d/jdk8.sh

# 做java命令软连接
ln -s /usr/local/jdk1.8.0_251/bin/java /usr/bin
```



#### 2.3.1.3 ZooKeeper

- ZooKeeper (3.4.6+) ：**必装**

[ZooKeeper官网](https://zookeeper.apache.org/)

[ZooKeeper官方下载地址](https://zookeeper.apache.org/releases.html)



**下载二进制安装包**

![iShot2020-09-05 16.32.17](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 16.32.17.png)



**选择官方推荐的下载地址**

![iShot2020-09-05 16.41.01](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 16.41.01.png)

**安装过程**

```shell
# 1.下载二进制包
wget https://apache-mirror.rbc.ru/pub/apache/zookeeper/zookeeper-3.6.1/apache-zookeeper-3.6.1-bin.tar.gz

# 2.解压缩
tar xf apache-zookeeper-3.6.1-bin.tar.gz -C /usr/local/

# 3.做软连接
ln -s /usr/local/apache-zookeeper-3.6.1-bin/ /usr/local/zookeeper-3.6.1

# 4.编辑最简zookeeper配置文件
cat > /usr/local/zookeeper-3.6.1/conf/zoo.cfg << EOF
tickTime=2000
initLimit=10   
syncLimit=5
dataDir=/data/zookeeper
clientPort=2181
EOF

# 5.启动zookeeper
$ /usr/local/zookeeper-3.6.1/bin/zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /usr/local/zookeeper-3.6.1/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED

# 6.查看zookeeper启动情况
$ /usr/local/zookeeper-3.6.1/bin/zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /usr/local/zookeeper-3.6.1/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost.
Mode: standalone

# 7.连接zookeeper
/usr/local/zookeeper-3.6.1/bin/zkCli.sh -server 127.0.0.1:2181
```



**zookeeper默认配置文件说明**

```shell
# 通信心跳时间，系统默认是2000毫秒，也就是间隔两秒心跳一次
# 客户端与服务器或者服务器与服务器之间维持心跳，也就是每个tickTime时间就会发送一次心跳。通过心跳不仅能够用来监听机器的工作状态，还可以通过心跳来控制Flower跟Leader的通信时间，默认情况下FL的会话时常是心跳间隔的两倍。
tickTime=2000

# 集群中的follower服务器(F)与leader服务器(L)之间初始连接时能容忍的最多心跳数（tickTime的数量）。
initLimit=10

# 集群中flower服务器（F）跟leader（L）服务器之间的请求和答应最多能容忍的心跳数。   
syncLimit=5

# zookeeper数据目录，默认是/tmp/zookeeper
dataDir=/data/zookeeper

# 客户端连接的接口，客户端连接zookeeper服务器的端口，zookeeper会监听这个端口，接收客户端的请求访问！
clientPort=2181
```





#### 2.3.1.4 Hadoop

- Hadoop (2.6+) or MinIO ：**选装**， 如果需要用到资源上传功能，针对单机可以选择本地文件目录作为上传文件夹(此操作不需要部署Hadoop)；当然也可以选择上传到Hadoop or MinIO集群上

> **注意：DolphinScheduler本身不依赖Hadoop、Hive、Spark，仅是会调用他们的Client，用于对应任务的运行。**



### 2.3.2 下载 DolphinScheduler 二进制tar.gz包

[官方下载地址](https://dolphinscheduler.apache.org/zh-cn/docs/release/download.html)

**选择相应版本的二进制包**

![iShot2020-09-05 17.03.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 17.03.39.png)

**选择官方推荐的下载地址**

![iShot2020-09-05 17.04.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 17.04.21.png)

**下载二进制包并解压缩**

```shell
# 1.创建部署目录，部署目录请不要创建在/root、/home等高权限目录 
mkdir -p /opt/dolphinscheduler && cd /opt/dolphinscheduler

# 2.下载二进制包
wget https://apache-mirror.rbc.ru/pub/apache/incubator/dolphinscheduler/1.3.2/apache-dolphinscheduler-incubating-1.3.2-dolphinscheduler-bin.tar.gz

# 3.解压缩并重命名
tar xf apache-dolphinscheduler-incubating-1.3.2-dolphinscheduler-bin.tar.gz && mv apache-dolphinscheduler-incubating-1.3.2-dolphinscheduler-bin  dolphinscheduler-bin
```



### 2.3.3 创建部署用户并赋予目录操作权限

**创建部署用户，并且一定要配置sudo免密。以创建 `dolphinscheduler` 用户为例**

```shell
# 1.创建用户
useradd dolphinscheduler

# 2.设置密码
echo "dolphinscheduler" | passwd --stdin dolphinscheduler

# 3.配置sudo免密
sed -i '$adolphinscheduler  ALL=(ALL)  NOPASSWD: NOPASSWD: ALL' /etc/sudoers

# 4.修改目录权限，使得部署用户对dolphinscheduler-bin目录有操作权限
chown -R dolphinscheduler:dolphinscheduler dolphinscheduler-bin
```



> **注意：** 
>
> - **因为任务执行服务是以 sudo -u {linux-user} 切换不同linux用户的方式来实现多租户运行作业，所以部署用户需要有 sudo 权限，而且是免密的。初学习者不理解的话，完全可以暂时忽略这一点** 
> -  **如果发现 `/etc/sudoers` 文件中有`"Default requiretty"`这行，也请注释掉** 
>
> - **如果用到资源上传的话，还需要给该部署用户分配操作本地文件系统或者HDFS或者MinIO的权限**



### 2.3.4 ssh免密配置

**切换到部署用户并配置ssh本机免密登录**

```shell
su - dolphinscheduler

ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```



> **注意：正常设置后，`dolphinscheduler`用户在执行命令`ssh localhost` 是不需要再输入密码的**



### 2.3.5 数据库初始化

**以下操作为创建数据库 `dolphinscheduler`，授权用户 `dol ` 对数据库 `dolphinscheduler`有所有权限，密码是 `dol`**

```mysql
# 创建数据库
mysql -uroot -e "CREATE DATABASE dolphinscheduler DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci"

# 授权
mysql -uroot -e "GRANT ALL PRIVILEGES ON dolphinscheduler.* TO 'dol'@'%' IDENTIFIED BY 'dol'"
mysql -uroot -e "GRANT ALL PRIVILEGES ON dolphinscheduler.* TO 'dol'@'localhost' IDENTIFIED BY 'dol'"

# 刷新权限表
mysql -uroot -e "flush privileges"
```



**本文选择的是mysql，因此需要下载mysql驱动，并放于 `dolphinscheduler-bin/lib` 下**

[mysql驱动官方下载地址](https://downloads.mysql.com/archives/c-j/)

![iShot2020-09-05 17.29.56](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 17.29.56.png)

```shell
# 1.下载mysql驱动包
wget https://downloads.mysql.com/archives/get/p/3/file/mysql-connector-java-5.1.47.tar.gz

# 2.解压缩
tar xf mysql-connector-java-5.1.47.tar.gz 

# 3.拷贝驱动包
cp mysql-connector-java-5.1.47/mysql-connector-java-5.1.47.jar dolphinscheduler-bin/lib/
```



**修改 `conf/datasource.properties` 中的配置**

```shell
注释如下内容
# postgresql
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://localhost:5432/dolphinscheduler
spring.datasource.username=test
spring.datasource.password=test

修改为如下
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/dolphinscheduler?useUnicode=true&characterEncoding=UTF-8&allowMultiQueries=true
spring.datasource.username=dol
spring.datasource.password=dol


# 使用如下命令修改

```



**创建表及导入基础数据**

```shell
# 编辑hosts文件，否则执行脚本会报错，这里最少保证能解析ds1
cat >> /etc/hosts << EOF
127.0.0.1 ds1 ds2 ds3 ds4 ds5
EOF

# 执行脚本
sh script/create-dolphinscheduler.sh

最后提示如下既为成功
18:06:46.120 [main] INFO org.apache.dolphinscheduler.dao.upgrade.shell.CreateDolphinScheduler - upgrade DolphinScheduler finished
18:06:46.120 [main] INFO org.apache.dolphinscheduler.dao.upgrade.shell.CreateDolphinScheduler - create DolphinScheduler success
```



### 2.3.6 修改运行参数

**修改 `conf/env/dolphinscheduler_env.sh` 环境变量(以相关用到的软件都安装在`/opt/soft`下为例)，请根据自己的实际情况进行修改**

```shell
export HADOOP_HOME=/opt/soft/hadoop
export HADOOP_CONF_DIR=/opt/soft/hadoop/etc/hadoop
#export SPARK_HOME1=/opt/soft/spark1
export SPARK_HOME2=/opt/soft/spark2
export PYTHON_HOME=/opt/soft/python
export JAVA_HOME=/opt/soft/java
export HIVE_HOME=/opt/soft/hive
export FLINK_HOME=/opt/soft/flink
export DATAX_HOME=/opt/soft/datax/bin/datax.py
export PATH=$HADOOP_HOME/bin:$SPARK_HOME2/bin:$PYTHON_HOME:$JAVA_HOME/bin:$HIVE_HOME/bin:$PATH:$FLINK_HOME/bin:$DATAX_HOME:$PATH
```

> **注: 这一步非常重要,例如 JAVA_HOME 和 PATH 是必须要配置的，没有用到的可以忽略或者注释掉**





**修改一键部署配置文件 `conf/config/install_config.conf`中的各参数，特别注意以下参数的配置，根据自己的实际情况进行修改**

```shell
# 这里填 mysql or postgresql
dbtype="mysql"

# 数据库连接地址
dbhost="localhost:3306"

# 数据库名
dbname="dolphinscheduler"

# 数据库用户名，此处需要修改为上面设置的{user}具体值
username="xxx"    

# 数据库密码, 如果有特殊字符，请使用\转义，需要修改为上面设置的{password}具体值
password="xxx"

# Zookeeper地址，单机本机是localhost:2181，记得把2181端口带上
zkQuorum="localhost:2181"

# 将DS安装到哪个目录，如: /opt/soft/dolphinscheduler，不同于现在的目录
installPath="/opt/soft/dolphinscheduler"

# 使用哪个用户部署，使用第3节创建的用户
deployUser="dolphinscheduler"

# 邮件配置，以qq邮箱为例
# 邮件协议
mailProtocol="SMTP"

# 邮件服务地址
mailServerHost="smtp.qq.com"

# 邮件服务端口
mailServerPort="25"

# mailSender和mailUser配置成一样即可
# 发送者
mailSender="xxx@qq.com"

# 发送用户
mailUser="xxx@qq.com"

# 邮箱密码
mailPassword="xxx"

# TLS协议的邮箱设置为true，否则设置为false
starttlsEnable="true"

# 开启SSL协议的邮箱配置为true，否则为false。注意: starttlsEnable和sslEnable不能同时为true
sslEnable="false"

# 邮件服务地址值，参考上面 mailServerHost
sslTrust="smtp.qq.com"

# 业务用到的比如sql等资源文件上传到哪里，可以设置：HDFS,S3,NONE，单机如果想使用本地文件系统，请配置为HDFS，因为HDFS支持本地文件系统；如果不需要资源上传功能请选择NONE。强调一点：使用本地文件系统不需要部署hadoop
resourceStorageType="HDFS"

# 这里以保存到本地文件系统为例
# 注：但是如果你想上传到HDFS的话，NameNode启用了HA，则需要将hadoop的配置文件core-site.xml和hdfs-site.xml放到conf目录下，本例即是放到/opt/dolphinscheduler/conf下面，并配置namenode cluster名称；如果NameNode不是HA,则修改为具体的ip或者主机名即可
defaultFS="file:///data/dolphinscheduler"    #hdfs://{具体的ip/主机名}:8020

# 如果没有使用到Yarn,保持以下默认值即可；如果ResourceManager是HA，则配置为ResourceManager节点的主备ip或者hostname,比如"192.168.xx.xx,192.168.xx.xx";如果是单ResourceManager请配置yarnHaIps=""即可
yarnHaIps="192.168.xx.xx,192.168.xx.xx"

# 如果ResourceManager是HA或者没有使用到Yarn保持默认值即可；如果是单ResourceManager，请配置真实的ResourceManager主机名或者ip
singleYarnIp="yarnIp1"

# 资源上传根路径,支持HDFS和S3,由于hdfs支持本地文件系统，需要确保本地文件夹存在且有读写权限
resourceUploadPath="/data/dolphinscheduler"

# 具备权限创建resourceUploadPath的用户
hdfsRootUser="hdfs"

# 在哪些机器上部署DS服务，本机选localhost
ips="localhost"

# ssh端口,默认22
sshPort="22"

# master服务部署在哪台机器上
masters="localhost"

# worker服务部署在哪台机器上,并指定此worker属于哪一个worker组,下面示例的default即为组名
workers="localhost:default"

# 报警服务部署在哪台机器上
alertServer="localhost"

# 后端api服务部署在在哪台机器上
apiServers="localhost"
```



> **注：如果打算用到`资源中心`功能，请执行以下命令：**
>
> ```shell
> sudo mkdir /data/dolphinscheduler
> sudo chown -R dolphinscheduler:dolphinscheduler /data/dolphinscheduler
> ```



### 2.3.7 一键部署

**切换到部署用户 `dolphinscheduler  `，执行一键部署脚本**

```shell
su - dolphinscheduler && cd /opt/dolphinscheduler-bin/ && sh install.sh
```



**验证安装，使用命令 `jps` 查看，如显示如下既成功**

```shell
$ jps
20260 Jps
20037 AlertServer			----- alert服务
20085 ApiApplicationServer			----- api服务
19580 MasterServer			----- master服务
19662 WorkerServer			----- worker服务
19710 LoggerServer			----- logger服务
```



**部署成功后，可以进行日志查看，日志统一存放于 `logs` 文件夹内**

```shell
# logs目录是在dolphinscheduler安装目录下生成的，我这里设置的安装目录是/usr/local/dolphinscheduler

$ tree logs/
logs/
├── dolphinscheduler-alert.log
├── dolphinscheduler-alert-server-test1.out
├── dolphinscheduler-api-server.log
├── dolphinscheduler-api-server-test1.out
├── dolphinscheduler-logger-server-test1.out
├── dolphinscheduler-master.log
├── dolphinscheduler-master-server-test1.out
├── dolphinscheduler-worker.log
└── dolphinscheduler-worker-server-test1.out
```



### 2.3.8 访问

浏览器访问 `IP:12345/dolphinscheduler`

用户名：`admin`

密码：`dolphinscheduler123`

![iShot2020-09-05 18.30.57](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 18.30.57.png)





**登陆后首界面**

![iShot2020-09-05 18.33.01](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 18.33.01.png)



**<span style=color:red> 到此，dolphinscheduler单机版部署完成！</span>**



### 2.3.9 启停服务

- 一键停止集群所有服务

```shell
sh bin/stop-all.sh
```

- 一键开启集群所有服务

```sh
sh bin/start-all.sh
```



---



- 启停Master

```shell
sh bin/dolphinscheduler-daemon.sh start master-server
sh bin/dolphinscheduler-daemon.sh stop master-server
```

- 启停Worker

```shell
sh bin/dolphinscheduler-daemon.sh start worker-server
sh bin/dolphinscheduler-daemon.sh stop worker-server
```

- 启停Api

```shell
sh bin/dolphinscheduler-daemon.sh start api-server
sh bin/dolphinscheduler-daemon.sh stop api-server
```

- 启停Logger

```shell
sh bin/dolphinscheduler-daemon.sh start logger-server
sh bin/dolphinscheduler-daemon.sh stop logger-server
```

- 启停Alert

```shell
sh bin/dolphinscheduler-daemon.sh start alert-server
sh bin/dolphinscheduler-daemon.sh stop alert-server
```





[dolphinscheduler使用文档](https://dolphinscheduler.apache.org/zh-cn/docs/1.3.2/user_doc/quick-start.html)





# 3.DolphinScheduler docker安装

[dolphinscheduler源码 清华下载地址](https://mirrors.tuna.tsinghua.edu.cn/apache/incubator/dolphinscheduler)



## 3.1 下载源码 zip 包

```sh
# 创建源码存放目录
mkdir -p /opt/soft/dolphinscheduler;
cd /opt/soft/dolphinscheduler;

# 下载源码包
wget https://mirrors.tuna.tsinghua.edu.cn/apache/incubator/dolphinscheduler/1.3.5/apache-dolphinscheduler-incubating-1.3.5-src.zip

# 解压缩
tar -zxvf apache-dolphinscheduler-incubating-1.3.5-src.zip
mv apache-dolphinscheduler-incubating-1.3.5-src-release  dolphinscheduler-src
```



## 3.2 安装并启动服务

[docker-compose 国内下载源](http://get.daocloud.io/)

```sh
cd dolphinscheduler-src
docker-compose -f ./docker/docker-swarm/docker-compose.yml up -d
```



`docker-compose.yml`文件内容

```yaml
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

version: "3.4"

services:

  dolphinscheduler-postgresql:
    image: bitnami/postgresql:latest
    container_name: dolphinscheduler-postgresql
    ports:
    - 5432:5432
    environment:
      TZ: Asia/Shanghai
      POSTGRESQL_USERNAME: root
      POSTGRESQL_PASSWORD: root
      POSTGRESQL_DATABASE: dolphinscheduler
    volumes:
    - dolphinscheduler-postgresql:/bitnami/postgresql
    - dolphinscheduler-postgresql-initdb:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
    - dolphinscheduler

  dolphinscheduler-zookeeper:
    image: bitnami/zookeeper:latest
    container_name: dolphinscheduler-zookeeper
    ports:
    - 2181:2181
    environment:
      TZ: Asia/Shanghai
      ALLOW_ANONYMOUS_LOGIN: "yes"
      ZOO_4LW_COMMANDS_WHITELIST: srvr,ruok,wchs,cons
    volumes:
    - dolphinscheduler-zookeeper:/bitnami/zookeeper
    restart: unless-stopped
    networks:
    - dolphinscheduler

  dolphinscheduler-api:
    image: apache/dolphinscheduler:latest
    container_name: dolphinscheduler-api
    command: api-server
    ports:
    - 12345:12345
    environment:
      TZ: Asia/Shanghai
      DATABASE_HOST: dolphinscheduler-postgresql
      DATABASE_PORT: 5432
      DATABASE_USERNAME: root
      DATABASE_PASSWORD: root
      DATABASE_DATABASE: dolphinscheduler
      ZOOKEEPER_QUORUM: dolphinscheduler-zookeeper:2181
      RESOURCE_STORAGE_TYPE: HDFS
      RESOURCE_UPLOAD_PATH: /dolphinscheduler
      FS_DEFAULT_FS: file:///
    healthcheck:
      test: ["CMD", "/root/checkpoint.sh", "ApiApplicationServer"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    depends_on:
    - dolphinscheduler-postgresql
    - dolphinscheduler-zookeeper
    volumes:
    - dolphinscheduler-logs:/opt/dolphinscheduler/logs
    - dolphinscheduler-resource-local:/dolphinscheduler
    restart: unless-stopped
    networks:
    - dolphinscheduler

  dolphinscheduler-alert:
    image: apache/dolphinscheduler:latest
    container_name: dolphinscheduler-alert
    command: alert-server
    environment:
      TZ: Asia/Shanghai
      XLS_FILE_PATH: "/tmp/xls"
      MAIL_SERVER_HOST: ""
      MAIL_SERVER_PORT: ""
      MAIL_SENDER: ""
      MAIL_USER: ""
      MAIL_PASSWD: ""
      MAIL_SMTP_STARTTLS_ENABLE: "false"
      MAIL_SMTP_SSL_ENABLE: "false"
      MAIL_SMTP_SSL_TRUST: ""
      ENTERPRISE_WECHAT_ENABLE: "false"
      ENTERPRISE_WECHAT_CORP_ID: ""
      ENTERPRISE_WECHAT_SECRET: ""
      ENTERPRISE_WECHAT_AGENT_ID: ""
      ENTERPRISE_WECHAT_USERS: ""
      DATABASE_HOST: dolphinscheduler-postgresql
      DATABASE_PORT: 5432
      DATABASE_USERNAME: root
      DATABASE_PASSWORD: root
      DATABASE_DATABASE: dolphinscheduler
    healthcheck:
      test: ["CMD", "/root/checkpoint.sh", "AlertServer"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    depends_on:
    - dolphinscheduler-postgresql
    volumes:
    - dolphinscheduler-logs:/opt/dolphinscheduler/logs
    restart: unless-stopped
    networks:
    - dolphinscheduler

  dolphinscheduler-master:
    image: apache/dolphinscheduler:latest
    container_name: dolphinscheduler-master
    command: master-server
    ports:
    - 5678:5678
    environment:
      TZ: Asia/Shanghai
      MASTER_EXEC_THREADS: "100"
      MASTER_EXEC_TASK_NUM: "20"
      MASTER_HEARTBEAT_INTERVAL: "10"
      MASTER_TASK_COMMIT_RETRYTIMES: "5"
      MASTER_TASK_COMMIT_INTERVAL: "1000"
      MASTER_MAX_CPULOAD_AVG: "100"
      MASTER_RESERVED_MEMORY: "0.1"
      DATABASE_HOST: dolphinscheduler-postgresql
      DATABASE_PORT: 5432
      DATABASE_USERNAME: root
      DATABASE_PASSWORD: root
      DATABASE_DATABASE: dolphinscheduler
      ZOOKEEPER_QUORUM: dolphinscheduler-zookeeper:2181
    healthcheck:
      test: ["CMD", "/root/checkpoint.sh", "MasterServer"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    depends_on:
    - dolphinscheduler-postgresql
    - dolphinscheduler-zookeeper
    volumes:
    - dolphinscheduler-logs:/opt/dolphinscheduler/logs
    restart: unless-stopped
    networks:
    - dolphinscheduler

  dolphinscheduler-worker:
    image: apache/dolphinscheduler:latest
    container_name: dolphinscheduler-worker
    command: worker-server
    ports:
    - 1234:1234
    - 50051:50051
    environment:
      TZ: Asia/Shanghai
      WORKER_EXEC_THREADS: "100"
      WORKER_HEARTBEAT_INTERVAL: "10"
      WORKER_MAX_CPULOAD_AVG: "100"
      WORKER_RESERVED_MEMORY: "0.1"
      WORKER_GROUP: "default"
      DOLPHINSCHEDULER_DATA_BASEDIR_PATH: /tmp/dolphinscheduler
      XLS_FILE_PATH: "/tmp/xls"
      MAIL_SERVER_HOST: ""
      MAIL_SERVER_PORT: ""
      MAIL_SENDER: ""
      MAIL_USER: ""
      MAIL_PASSWD: ""
      MAIL_SMTP_STARTTLS_ENABLE: "false"
      MAIL_SMTP_SSL_ENABLE: "false"
      MAIL_SMTP_SSL_TRUST: ""
      DATABASE_HOST: dolphinscheduler-postgresql
      DATABASE_PORT: 5432
      DATABASE_USERNAME: root
      DATABASE_PASSWORD: root
      DATABASE_DATABASE: dolphinscheduler
      ZOOKEEPER_QUORUM: dolphinscheduler-zookeeper:2181
      RESOURCE_STORAGE_TYPE: HDFS
      RESOURCE_UPLOAD_PATH: /dolphinscheduler
      FS_DEFAULT_FS: file:///
    healthcheck:
      test: ["CMD", "/root/checkpoint.sh", "WorkerServer"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    depends_on:
    - dolphinscheduler-postgresql
    - dolphinscheduler-zookeeper
    volumes:
    - ./dolphinscheduler_env.sh:/opt/dolphinscheduler/conf/env/dolphinscheduler_env.sh
    - dolphinscheduler-worker-data:/tmp/dolphinscheduler
    - dolphinscheduler-logs:/opt/dolphinscheduler/logs
    - dolphinscheduler-resource-local:/dolphinscheduler
    restart: unless-stopped
    networks:
    - dolphinscheduler

networks:
  dolphinscheduler:
    driver: bridge

volumes:
  dolphinscheduler-postgresql:
  dolphinscheduler-postgresql-initdb:
  dolphinscheduler-zookeeper:
  dolphinscheduler-worker-data:
  dolphinscheduler-logs:
  dolphinscheduler-resource-local:
```



## 3.3 登陆系统

浏览器访问 `IP:12345/dolphinscheduler`

用户名：`admin`

密码：`dolphinscheduler123`

![iShot2020-09-05 18.30.57](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-05 18.30.57.png)



**nginx反向代理配置**

自己百度谷歌动手查的，但还是官方给的回复比较好

```nginx
server {
  listen 80;
  server_name ds.abc.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name ds.abc.com;
  client_max_body_size 10240m;
  
  location / {
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:12345/dolphinscheduler;
  }

  location ^~ /dolphinscheduler {
    proxy_pass http://127.0.0.1:12345/dolphinscheduler;
  }
 
  access_log /var/log/ds/ds.abc.com.access.log;
  error_log /var/log/ds/ds.abc.com.error.log;
  ssl_certificate ssl_key/1_abc.com_bundle.crt;
  ssl_certificate_key ssl_key/2_abc.com.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
```



dolphinscheduler安装后默认访问方式是 `ip:12345/dolphinscheduler`，现在想要以域名直接访问，需要在nginx中做如下配置

```nginx
location / {
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:12345/dolphinscheduler;
  }

location ^~ /dolphinscheduler {
    proxy_pass http://127.0.0.1:12345/dolphinscheduler;
}
```



官方给的回复

![iShot2021-03-04 15.26.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-04 15.26.15.png)

```nginx
server {
  listen 80;
  server_name ds.abc.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name ds.abc.com;
  client_max_body_size 10240m;

  location / {
    proxy_pass http://127.0.0.1:12345/dolphinscheduler/;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_hide_header Server;
    proxy_redirect off;

    location /dolphinscheduler {
        proxy_pass http://127.0.0.1:12345;
    }
  }

  access_log /var/log/ds/ds.abc.com.access.log;
  error_log /var/log/ds/ds.abc.com.error.log;
  ssl_certificate ssl_key/1_ds.abc.com_bundle.crt;
  ssl_certificate_key ssl_key/2_ds.abc.com.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
```







