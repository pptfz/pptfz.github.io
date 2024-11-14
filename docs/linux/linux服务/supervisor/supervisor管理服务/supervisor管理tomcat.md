# supervisor管理tomcat

:::caution 注意

在生产环境中是不允许以root用户运行tomcat的，我们是以一个有root权限的运维专用用户来运行supervisor和tomcat的

:::



supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



编辑tomcat服务配置文件 `/etc/supervisor/config.d/tomcat.ini`

- tomcat安装目录 `/usr/local/tomcat-8.5.56/`
- jdk1.8安装目录 `/usr/local/jdk1.8.0_251/`

```ini
[program:tomcat] 
command=/usr/local/tomcat-8.5.56/bin/startup.sh 
environment=JAVA_HOME="/usr/local/jdk1.8.0_251",JAVA_BIN="/usr/local/jdk1.8.0_251/bin"
autostart = true 
autorestart=true 
redirect_stderr=true 
stdout_logfile=/var/log/supervisor/tomcat.log
```



修改tomcat启动脚本文件 `startup.sh`

本文示例是 `/usr/local/tomcat-8.5.56/bin/startup.sh`

```shell
最后一行，将start修改为run
#exec "$PRGDIR"/"$EXECUTABLE" start "$@"
exec "$PRGDIR"/"$EXECUTABLE" run "$@"
```



用以下命令修改

```shell
sed -i.bak '$s/start/run/' startup.sh
```



将tomcat加入supervisor

```shell
$ supervisorctl update tomcat
tomcat: added process group
```



查看状态

```shell
$ supervisorctl status tomcat
nginx           RUNNING   pid 9464, uptime 0:00:03
```



