# supervisor管理mysql



supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



编辑mysql服务配置文件 `/etc/supervisor/config.d/mysql.ini`

:::tip 说明

示例中的mysql是二进制安装在了 `/usr/local/mysql` ，例如数据目录是 `/usr/local/mysql/data` ，其余插件目录、错误日志目录、pid目录等还需要根据实际情况修改

:::

```ini
[program:mysql]
command=/usr/local/mysql/bin/mysqld --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin --user=mysql --log-error=/usr/local/mysql/data/error.log --pid-file=/usr/local/mysql/data/hwyun.pid --socket=/tmp/mysql.sock
priority=1                    ; 数字越高，优先级越高
numprocs=1                    ; 启动几个进程
autostart=true                ; 随着supervisord的启动而启动
autorestart=true              ; 自动重启
startretries=10               ; 启动失败时的最多重试次数
exitcodes=0                   ; 正常退出代码
stopsignal=KILL               ; 用来杀死进程的信号
stopwaitsecs=10               ; 发送SIGKILL前的等待时间
redirect_stderr=true          ; 重定向stderr到stdout

stdout_logfile_maxbytes = 1024MB
stdout_logfile_backups  = 10
stdout_logfile          = /var/log/supervisor/mysql.log
```



创建存放日志目录

```shell
mkdir -p /var/log/supervisor
```



将mysql加入supervisor

方法一	使用 `supervisorctl update 程序名` 把相应服务加入supervisor

```shell
$ supervisorctl update mysql
mysql: added process group
```



方法二	使用 `supervisorctl` 命令进入交互操作界面，然后再添加服务

```shell
$ supervisorctl
$ update mysql
```



查看服务运行

```shell
$ supervisorctl status mysql
mysql      RUNNING   pid 4415, uptime 0:00:36
```



