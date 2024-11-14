# supervisor管理redis

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



supervisor管理redis有一个很奇怪的问题

:::tip 说明

<span style={{color: 'red'}}>redis配置文件中如果配置了 `daemonize yes` 用supervisor管理的时候是会报错如下 `redis                            FATAL     Exited too quickly (process log may have details)` ，虽然有报错但是redis进程却是正常运行的，进程在端口也能启动！！！</span>

<span style={{color: 'red'}}>如果把 `daemonize` 改成 `no` 则没有问题，但是这样就不能把redis以守护进程的方式运行了</span>

:::



`daemonize` 设置 `yes` 或者 `no` 区别

- yes
  - redis采用的是单进程多线程的模式。当 `redis.conf` 中选项 `daemonize` 设置成yes时，代表开启守护进程模式。在该模式下，redis会在后台运行，并将进程pid号写入至`redis.conf` 选项 `pidfile` 设置的文件中，此时redis将一直运行，除非手动kill该进程。

- no
  - 当 `daemonize` 选项设置成no时，当前界面将进入redis的命令行界面，exit强制退出或者关闭连接工具(putty,xshell等)都会导致redis进程退出。



编辑redis服务配置文件 `/etc/supervisor/config.d/redis.ini`

```ini
[program:redis]
command=/usr/local/redis-5.0.7/src/redis-server /etc/redis/6379/redis.conf
directory=/usr/local/redis-5.0.7/src
autostart=true
stdout_logfile=/var/log/supervisor/redis.log
```



将redis加入supervisor

```shell
$ supervisorctl update redis
redis: added process group
```



查看状态

```shell
$ supervisorctl status redis
redis                            RUNNING   pid 15430, uptime 0:00:06
```



