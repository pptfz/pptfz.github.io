# supervisor管理nginx

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



编辑nginx服务配置文件 `/etc/supervisor/config.d/nginx.ini`

:::caution 注意

需要注意的是 `/usr/sbin/nginx` 表示在后台运行，但是**<span style={{color: 'red'}}>supervisor不能监控后台程序</span>**， 所以supervisor就一直执行这个命令 ，因此会报错

:::

`/usr/sbin/nginx` 后必须加参数  `-g 'daemon off;'`  表示在前台运行

```ini
[program:nginx]
command = `which nginx` -g 'daemon off;'
stdout_logfile = /var/log/supervisor/nginx.log
redirect_stderr = true
autorestart = true
```



将nginx加入supervisor

```shell
$ supervisorctl update nginx
nginx: added process group
```



查看状态

```shell
$ supervisorctl status nginx
nginx           RUNNING   pid 9464, uptime 0:00:03
```



