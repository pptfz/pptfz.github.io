# supervisor管理go进程

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/\*.ini` 文件

```ini
[include] 
files = /etc/supervisor/config.d/*.ini
```



这是一个go进程的示例配置文件

```ini
[program:my_go_program]             ; 定义一个 Supervisor 管理的程序块，名称为 my_go_program
command=/path/to/my_go_program       ; 指定可执行的 Go 程序的路径
directory=/path/to/program_dir       ; 程序的工作目录（可选），通常是程序所在目录
autostart=true                       ; Supervisor 启动时自动启动该程序
autorestart=true                     ; 程序异常退出时自动重启
startsecs=5                          ; 程序启动后正常运行至少 5 秒才被视为成功启动

user=my_user                         ; 指定运行程序的用户，确保该用户有权限访问相关文件
stdout_logfile=/var/log/supervisor/my_go_program.stdout.log  ; 标准输出日志文件路径
stderr_logfile=/var/log/supervisor/my_go_program.stderr.log  ; 标准错误日志文件路径
stdout_logfile_maxbytes=10MB         ; 限制标准输出日志的文件大小（可选），达到大小后会轮转
stderr_logfile_maxbytes=10MB         ; 限制标准错误日志的文件大小（可选），达到大小后会轮转
stdout_logfile_backups=5             ; 日志文件的最大备份数，超过数量后删除旧的日志文件
stderr_logfile_backups=5             ; 错误日志文件的最大备份数

stopasgroup=true                     ; 发送停止信号时，停止进程组，确保子进程也会被停止
killasgroup=true                     ; 发送 kill 信号时，终止进程组，确保清理所有子进程

environment=GOPATH="/path/to/gopath", GIN_MODE="release" ; 设定环境变量，可添加多个

exitcodes=0,2                        ; 将这些退出码视为正常退出，不触发自动重启
stopsignal=TERM                      ; 使用 TERM 信号终止进程，可选为 KILL、QUIT 等
```



如下为管理 [goscheduler](https://github.com/gaggad/goscheduler) 的示例配置文件

```ini
[program:goscheduler]             ; 定义一个 Supervisor 管理的程序块，名称为 my_go_program
command=/usr/local/bin/goscheduler web       ; 指定可执行的 Go 程序的路径
autostart=true                       ; Supervisor 启动时自动启动该程序
autorestart=true                     ; 程序异常退出时自动重启
startsecs=5                          ; 程序启动后正常运行至少 5 秒才被视为成功启动

user=root                         ; 指定运行程序的用户，确保该用户有权限访问相关文件
stdout_logfile=/var/log/supervisor/goscheduler.stdout.log  ; 标准输出日志文件路径
stderr_logfile=/var/log/supervisor/goscheduler.stderr.log  ; 标准错误日志文件路径
stdout_logfile_maxbytes=10MB         ; 限制标准输出日志的文件大小（可选），达到大小后会轮转
stderr_logfile_maxbytes=10MB         ; 限制标准错误日志的文件大小（可选），达到大小后会轮转
stdout_logfile_backups=5             ; 日志文件的最大备份数，超过数量后删除旧的日志文件
stderr_logfile_backups=5             ; 错误日志文件的最大备份数

stopasgroup=true                     ; 发送停止信号时，停止进程组，确保子进程也会被停止
killasgroup=true                     ; 发送 kill 信号时，终止进程组，确保清理所有子进程

;environment=GOPATH="/path/to/gopath", GIN_MODE="release" ; 设定环境变量，可添加多个
;
;exitcodes=0,2                        ; 将这些退出码视为正常退出，不触发自动重启
;stopsignal=TERM                      ; 使用 TERM 信号终止进程，可选为 KILL、QUIT 等
```



保存配置文件后，运行以下命令让supervisor加载新的配置

```shell
# 重新读取配置
supervisorctl reread   

# 更新Supervisor管理的服务
supervisorctl update

# 启动服务
supervisorctl start my_go_program
```

