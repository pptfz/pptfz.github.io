# supervisor管理需要指定环境变量及目录的服务

:::tip 说明

对于部分服务来讲，除了指定启动命令外，还需要额外指定环境变量和目录，例如 gitbook 服务就需要指定文件目录，否则无法正确启动

:::



例如 [helm-dashboard](https://github.com/komodorio/helm-dashboard) 服务，执行安装命令 `helm plugin install https://github.com/komodorio/helm-dashboard.git` 会将插件安装在用户家目录下，同时执行命令 `helm dashboard` 可以启动服务，但是默认监听的是 `127.0.0.1:8080` ，如果想要监听 `0.0.0.0` ，需要指定环境变量 `HD_BIND=0.0.0.0` 



:::tip 说明

因此，对于例如上述 [helm-dashboard](https://github.com/komodorio/helm-dashboard) 服务来讲，就需要使用 `environment` 和 `directory` 指定环境变量和目录

:::



```ini
[program:helm-dashboard]
command=/usr/local/bin/helm dashboard -b -p 8888
environment=HD_BIND=0.0.0.0
directory=/root
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
stdout_logfile          = /var/log/supervisor/helm-dashboard.log
```

