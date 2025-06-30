[toc]



# zeppelin安装配置



[zeppelin 官网](http://zeppelin.apache.org/)

[zeppelin github地址](https://github.com/apache/zeppelin)



## 1.zeppelin简介

Apache Zeppelin 

> Apache Zeppelin 是一个让交互式数据分析变得可行的基于网页的开源框架。Zeppelin提供了数据分析、数据可视化等功能。
>
> Zeppelin 是一个提供交互数据分析且基于Web的笔记本。方便你做出可数据驱动的、可交互且可协作的精美文档，并且支持多种语言，包括 Scala(使用 Apache Spark)、Python(Apache Spark)、SparkSQL、 Hive、 Markdown、Shell等等。



## 2.安装

### 2.1 下载二进制安装包

[zeppelin官方下载地址](http://zeppelin.apache.org/download.html)

```sh
# 下载安装包
wget https://ftp.yz.yamagata-u.ac.jp/pub/network/apache/zeppelin/zeppelin-0.9.0/zeppelin-0.9.0-bin-all.tgz

# 解压
tar xf zeppelin-0.9.0-bin-all.tgz -C /usr/local/

# 修改目录权限为hadoop
chown -R hadoop.hadoop /usr/local/zeppelin-0.9.0-bin-all

# 做软连接
ln -s /usr/local/zeppelin-0.9.0-bin-all/ /usr/local/zeppelin
```



### 2.2 修改配置文件

#### 2.2.1 拷贝文件

`zeppelin-site.xml`是主配置文件

`shiro.ini`是用户权限配置文件

```shell
# 进入到zeppelin目录
cd /usr/local/zeppelin/conf

# 拷贝文件
cp zeppelin-site.xml.template zeppelin-site.xml
cp shiro.ini.template shiro.ini
```



#### 2.2.2 修改配置文件

**修改 `zeppelin-site.xml`**

```sh
# 修改监听地址
<property>
  <name>zeppelin.server.addr</name>
  <value>127.0.0.1</value>
  <description>Server binding address</description>
</property>

# 修改监听端口
<property>
  <name>zeppelin.server.port</name>
  <value>8080</value>
  <description>Server port.</description>
</property>

# 关闭匿名用户，zeppelin默认是允许匿名用户的，生产环境需要关闭，注意在0.9.0这个版本中，需要手动添加如下代码(网上的文章都是直接修改这一处，但是0.9.0中未找到以下代码)
<property>
  <name>zeppelin.anonymous.allowed</name>
  <value>false</value>
  <description>Anonymous user allowed by default</description>
</property>
```



**修改 `shiro.ini`，在 `[users]`下添加用户名和密码及权限，格式为 `用户名 = 密码, 权限`**

```sh
[users]
# List of users with their password allowed to access Zeppelin.
# To use a different strategy (LDAP / Database / ...) check the shiro doc at http://shiro.apache.org/configuration.html#Configuration-INISections
# To enable admin user, uncomment the following line and set an appropriate password.
#admin = password1, admin
#user1 = password2, role1, role2
#user2 = password3, role3
#user3 = password4, role2


# 用户名 = 密码, 权限
admin = admin, admin
```



实际上还需要修改 `zeppelin-env.sh` 环境变量文件，但是我们的大数据相关环境变量已经写入到 `/etc/profile` 中了，因此这里不做修改，如有需要可自行修改此文件

`/etc/profile` 中关于大数据相关的环境变量

```sh
export MAVEN_HOME=/usr/local/apache-maven-3.5.2
PATH=$MAVEN_HOME/bin:$PATH
export TEZ_HOME=/usr/local/service/tez
export TEZ_CONF_DIR=$TEZ_HOME/conf
export HADOOP_CLASSPATH=${HADOOP_CLASSPATH}:${TEZ_CONF_DIR}:${TEZ_HOME}/*:${TEZ_HOME}/lib/*
export JAVA_HOME=/usr/local/jdk/
export HADOOP_HOME=/usr/local/service/hadoop
export HIVE_HOME=/usr/local/service/hive
export HBASE_HOME=/usr/local/service/hbase
export SPARK_HOME=/usr/local/service/spark
export STORM_HOME=/usr/local/service/storm
export SQOOP_HOME=/usr/local/service/sqoop
export KYLIN_HOME=/usr/local/service/kylin
export ALLUXIO_HOME=/usr/local/service/alluxio
PATH=$JAVA_HOME/bin:$HADOOP_HOME/bin:$HIVE_HOME/bin:$HBASE_HOME/bin:$SPARK_HOME/bin:$STORM_HOME/bin:$SQOOP_HOME/bin:$KYLIN_HOME/bin:$ALLUXIO_HOME/bin:$PATH
```



### 2.3 启动 zepplin

:::tip

**需要用 `hadoop` 用户的身份启动，否则后续会有权限拒绝问题**

:::

```sh
# 切换到hadoop用户
su - hadoop

# 启动zepplin
$ cd /usr/local/zeppelin
$ bin/zeppelin-daemon.sh start
Please specify HADOOP_CONF_DIR if USE_HADOOP is true
Log dir doesn't exist, create /usr/local/zeppelin/logs
Pid dir doesn't exist, create /usr/local/zeppelin/run
Zeppelin start                                             [  OK  ]

# 查看进程
$ jps|grep ZeppelinServer
9567 ZeppelinServer
```



### 2.4 nginx配置反向代理访问zepplin



```nginx
server {
    listen 80;
    server_name zepplin.abc.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```



浏览器访问会发现提示 `WebSocket Disconnected` ，原因在于nginx的隧道需要把client端的upgrade请求发送给zeppelin，所以upgrade和connection的头信息需要显式设置

![iShot_2024-09-03_11.08.40](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-03_11.08.40.png)



解决方法，修改ngxin配置文件

[问题参考链接](https://blog.csdn.net/rainysia/article/details/88844336)

```nginx
server {
    listen 80;
    server_name zepplin.abc.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
```



重启nginx后刷新即可

![iShot_2024-09-03_11.06.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-03_11.06.42.png)
