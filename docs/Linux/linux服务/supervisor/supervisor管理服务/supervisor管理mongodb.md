# supervisor管理mongodb

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



编辑mongodb服务配置文件 `/etc/supervisor/config.d/mongodb.ini`

:::tip 说明

mongodb配置文件中要设置这一项 `fork = false` ，即不以守护进程方式运行mongodb

:::

```ini
[program:mongodb]
command=/usr/local/mongodb-4.2.8/bin/mongod -f /data/db/mongodb/conf/mongod.conf
directory=/usr/local/mongodb-4.2.8
autostart=true
user=mongod
```



将mongodb加入supervisor

```shell
$ supervisorctl update mongodb
mongodb: added process group
```



查看状态

```shell
$ supervisorctl status mongodb
mongodb                          RUNNING   pid 30352, uptime 0:10:26
```





