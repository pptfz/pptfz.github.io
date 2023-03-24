# supervisor管理mongodb

**supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑mongodb服务配置文件 `/etc/supervisor/config.d/mongodb.ini`**

mongodb配置文件中要设置这一项 `fork = false` ，即不以守护进程方式运行mongodb

```shell
cat >/etc/supervisor/config.d/mongodb.ini<<'EOF'
[program:mongodb]
command=/usr/local/mongodb-4.2.8/bin/mongod -f /data/db/mongodb/conf/mongod.conf
directory=/usr/local/mongodb-4.2.8
autostart=true
user=mongod
EOF
```



**将mongodb加入supervisor**

```shell
$ supervisorctl update mongodb
mongodb: added process group
```



**查看状态**

```shell
$ supervisorctl status mongodb
mongodb                          RUNNING   pid 30352, uptime 0:10:26
```



---

**详细配置**

```shell
[program:mongodb]
command=/usr/local/mongodb/bin/mongod -f /data/db/mongodb/cfg/mongod.conf
directory=/usr/local/mongodb
autostart=true
user=testinadmin
```



**mongodb配置文件**

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

