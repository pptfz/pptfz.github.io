# supervisor管理gitbook

**supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑gitbook服务配置文件 `/etc/supervisor/config.d/gitbook.ini`**

:::caution 注意

<span style={{color: 'red'}}>gitbook不能单独启动，必须指定gitbook工作目录，添加参数 `directory=/path` 指定</span>

:::

```shell
[program:gitbook]
command=/usr/local/node-v13.8.0-linux-x64/bin/gitbook serve
directory=/gitbook            ; 指定gitbook文件目录(必须！！！)
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
stdout_logfile          = /var/log/supervisord/gitbook.log
```



**将gitbook加入supervisor**

```shell
$ supervisorctl update gitbook
gitbook: added process group
```



**查看状态**

```shell
$ supervisorctl status gitbook
gitbook                          RUNNING   pid 27311, uptime 0:07:53
```

