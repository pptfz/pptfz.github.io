# centos7安装mongodb

[mongodb官网](https://www.mongodb.com)

[mongodb官方文档](https://docs.mongodb.com/manual/)

[mongodb社区版官方下载地址](https://www.mongodb.com/try/download/community)

[mongodb github地址](https://github.com/mongodb/mongo)

# 一、yum安装

## 1.1 添加清华yum源

```shell
cat > /etc/yum.repos.d/mongodb.repo <<'EOF'
[mongodb-org]
name=MongoDB Repository
baseurl=https://mirrors.tuna.tsinghua.edu.cn/mongodb/yum/el$releasever/
gpgcheck=0
enabled=1
EOF
```



```shell
yum makecache
```



## 1.2 安装社区版mongodb

安装最新版

```shell
yum -y install mongodb-org
```



安装指定版本

```shell
yum -y install mongodb-org-4.2.8 mongodb-org-server-4.2.8 mongodb-org-shell-4.2.8 mongodb-org-mongos-4.2.8 mongodb-org-tools-4.2.8
```



## 1.3 启动mongodb

```
systemctl enable mongod && systemctl start mongod
```



mongodb监听tcp/27017

```shell
$ netstat -ntpl|grep 27017
tcp        0      0 127.0.0.1:27017         0.0.0.0:*               LISTEN      17976/mongod
```



mongodb默认以mongod用运行

```shell
$ ps aux|grep [m]ongo
mongod   17976  0.6  7.8 1552904 78904 ?       Sl   22:04   0:00 /usr/bin/mongod -f /etc/mongod.conf
```



## 1.4 mongodb相关目录文件

mongodb配置文件`/etc/mongod.conf`

mongodb日志文件`/var/log/mongodb/mongod.log`

mongodb PID文件`/run/mongodb/mongod.pid`

mongodb SOCKET文件`/tmp/mongodb-27017.sock`

mongodb数据目录`/var/lib/mongo/`



# 二、二进制安装

[mongodb4.2二进制安装官方文档](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat-tarball/)

## 2.1 安装依赖包

```shell
yum -y install libcurl openssl
```



## 2.2 下载二进制包

```shell
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-4.2.8.tgz
```



## 2.3 解压缩包

```shell
tar xf mongodb-linux-x86_64-rhel70-4.2.8.tgz -C /usr/local/
```



## 2.4 做软连接

```shell
ln -s /usr/local/mongodb-linux-x86_64-rhel70-4.2.8/ /usr/local/mongodb-4.2.8
```



## 2.5 导出PATH环境变量

```shell
echo 'export PATH=/usr/local/mongodb-4.2.8/bin:$PATH' >/etc/profile.d/mongodb.sh && source /etc/profile
```



## 2.6 创建相关目录

```shell
#创建数据、日志、pid、配置文件目录
mkdir -p /data/db/mongodb/{data,log,pid,conf}
```



## 2.7 创建mongod用户

```shell
useradd mongod -s /sbin/nologin -M
```



## 2.8 编辑mongodb配置文件

```shell
cat > /data/db/mongodb/conf/mongod.conf <<'EOF'
bind_ip = 10.0.0.31
logpath = /data/db/mongodb/log/mongod.log
logappend = true
pidfilepath = /data/db/mongodb/pid/mongod.pid
dbpath = /data/db/mongodb/data

#存储引擎，有mmapv1、wiretiger、mongorocks
storageEngine = wiredTiger

#使用追加的方式写日志
directoryperdb = true
#replSet = replset
#rest = true
oplogSize = 61440

#是否以守护进程方式运行，如果用supervisor管理就设置为false
fork = false

#是否启用验证
auth = false
#shardsvr = true
port = 27010

#每次写入会记录一条操作日志（通过journal可以重新构造出写入的数据）。即使宕机，启动时wiredtiger会先将数据恢复到最近一次的checkpoint点，然后重放后续的journal日志来恢复。
journal = true

#maxConns = 30000
#master = true		
#slave = true		
#source = 10.31.133.145:27010
#source = 10.47.125.99:27010
#autoresync=true
EOF
```



## 2.9 设置目录所有者为mongod

```sh
chown -R mongod:mongod /data/db/mongodb
```



## 2.10 使用supervisor管理mongodb

```shell
cat >/etc/supervisor/config.d/mongodb.ini<<'EOF'
[program:mongodb]
command=/usr/local/mongodb-4.2.8/bin/mongod -f /data/db/mongodb/conf/mongod.conf
directory=/usr/local/mongodb-4.2.8
autostart=true
user=mongod
EOF
```



```shell
$ supervisorctl update mongodb
mongodb: added process group
```



## 2.11 查看mongodb运行状态

**查看mongodb进程**

```shell
$ ps aux|grep [m]ongodb
mongod   30352  1.5  2.2 1550840 89140 ?       Sl   20:18   0:00 /usr/local/mongodb-4.2.8/bin/mongod -f /data/db/mongodb/conf/mongod.conf
```



**mongodb监听TCP/27010端口**

```shell
$ netstat -ntpl|grep mongod
tcp        0      0 10.0.0.31:27010         0.0.0.0:*               LISTEN      30352/mongod
```



## 2.12 连接mongodb

```shell
$ mongo 10.0.0.31:27010
MongoDB shell version v4.2.8
connecting to: mongodb://10.0.0.31:27010/test?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("f87cbfff-d5b5-4f72-b378-15547f61fdca") }
MongoDB server version: 4.2.8
Server has startup warnings:
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten]
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/enabled is 'always'.
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten] **        We suggest setting it to 'never'
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten]
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/defrag is 'always'.
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten] **        We suggest setting it to 'never'
2020-07-01T20:18:05.560+0800 I  CONTROL  [initandlisten]
---
Enable MongoDB's free cloud-based monitoring service, which will then receive and display
metrics about your deployment (disk utilization, CPU, operation statistics, etc).

The monitoring data will be available on a MongoDB website with a unique URL accessible to you
and anyone you share the URL with. MongoDB may use this information to make product
improvements and to suggest MongoDB products and deployment options to you.

To enable free monitoring, run the following command: db.enableFreeMonitoring()
To permanently disable this reminder, run the following command: db.disableFreeMonitoring()
---

> show databases
admin   0.000GB
config  0.000GB
local   0.000GB
```



---

生产环境配置

```shell
bind_ip = 172.20.1.40
logpath = /data/db/mongodb/logs/mongod.log
logappend = true
pidfilepath = /data/db/mongodb/pid/mongod.pid
dbpath = /data/db/mongodb/data
storageEngine = wiredTiger
directoryperdb = true
#replSet = replset
#rest = true
oplogSize = 61440
#fork = true
auth = false
shardsvr = true
port = 27010
journal = true
maxConns = 30000
master = true		
#slave = true		
#source = 10.31.133.145:27010
#source = 10.47.125.99:27010
autoresync=true
```

