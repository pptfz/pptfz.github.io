# supervisor管理mysql



**supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑mysql服务配置文件 `/etc/supervisor/config.d/mysql.ini`**

⚠️示例中的mysql是二进制安装在了 `/usr/local/mysql` ，例如数据目录是 `/usr/local/mysql/data` ，其余插件目录、错误日志目录、pid目录等还需要根据实际情况修改

```shell
cat > /etc/supervisor/config.d/mysql.ini<<'EOF'
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
EOF
```



**创建存放日志目录**

```shell
mkdir -p /var/log/supervisor
```



**将mysql加入supervisor**

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



**查看服务运行**

```shell
$ supervisorctl status mysql
mysql      RUNNING   pid 4415, uptime 0:00:36
```



---

**详细配置**

```shell
[program:mysql]
command=/usr/local/mysql/bin/mysqld --basedir=/usr/local/mysql --datadir=/data/db/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin --user=mysql --log-error=/data/db/mysql/logs/mysqld.log --pid-file=/data/db/mysql/mysqld/mysqld.pid --socket=/data/db/mysql/sock/mysqld.sock
priority=1                    
numprocs=1                   
autostart=true                
autorestart=true             
startretries=10              
exitcodes=0                  
stopsignal=KILL               
stopwaitsecs=10               
redirect_stderr=true          

stdout_logfile_maxbytes = 1024MB
stdout_logfile_backups  = 10
stdout_logfile          = /var/log/supervisord/mysql.log
```



**mysql配置文件**

```shell
[client]
port = 3306
socket = /data/db/mysql/sock/mysql.sock
[mysqld]
port = 3306
socket = /data/db/mysql/sock/mysql.sock
pid-file = /data/db/mysql/sock/mysqld.pid
log-error = /data/db/mysql/logs/mysql-err.log
log = /data/db/mysql/logs/mysqld.log
tmpdir = /data/db/mysql/tmp/
slow_query_log = ON
long_query_time = 5
slow_query_log_file = /data/db/mysql/logs/slow_query.log
log_queries_not_using_indexes = ON
skip-external-locking
key_buffer_size = 256M
max_allowed_packet = 64M
table_open_cache = 256
sort_buffer_size = 1M
read_buffer_size = 1M
read_rnd_buffer_size = 4M
myisam_sort_buffer_size = 64M
thread_cache_size = 8
query_cache_size= 16M
thread_concurrency = 8
max_connections = 20000
max_connect_errors = 20000
log-bin=/data/db/mysql/log-bin/mysql-bin
expire_logs_days=4
relay-log =/data/db/mysql/relay-log
log_slave_updates =1
relay_log_purge =1
relay_log_space_limit = 10G
binlog_format=mixed
server-id	= 21
innodb_data_home_dir = /data/db/mysql/data
innodb_data_file_path = ibdata1:20G;ibdata2:20G;ibdata3:20G;ibdataext:10M:autoextend
innodb_log_group_home_dir = /data/db/mysql/data
innodb_buffer_pool_size = 4800M
innodb_additional_mem_pool_size = 20M
innodb_log_file_size = 64M
innodb_log_buffer_size = 8M
innodb_lock_wait_timeout = 50
[mysqldump]
quick
max_allowed_packet = 16M
[mysql]
no-auto-rehash
[myisamchk]
key_buffer_size = 128M
sort_buffer_size = 128M
read_buffer = 2M
write_buffer = 2M
[mysqlhotcopy]
interactive-timeout
```

