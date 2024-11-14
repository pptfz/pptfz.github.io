# supervisor管理php

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



编辑php服务配置文件`/etc/supervisor/config.d/php72.ini`

```ini
[program:php72]
command=/usr/local/php72/sbin/php-fpm -c /usr/local/php72/etc/php.ini -y /usr/local/php72/etc/php-fpm.conf
autostart=true
user=www
stdout_logfile=/var/log/supervisor/php72.log
stderr_logfile=/var/log/supervisor/php72.error.log
```



将php加入supervisor

```shell
$ supervisorctl update php72
php72: added process group
```



查看状态

```shell
$ supervisorctl status php72
php72                          RUNNING   pid 30352, uptime 0:10:26
```



