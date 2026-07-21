[toc]



# supervisor安装

## supervisor简介

[supervisor github地址](https://github.com/Supervisor/Supervisor)

[supervisor官网](http://supervisord.org/)



`supervisor` 是一个 `客户端/服务器` 系统，它能让用户在类 UNIX 操作系统上控制多个进程



### supervisor组件

#### `supervisord`

**Supervisor 的服务端进程名为 `supervisord`。**

它负责：

- 启动其管理的子程序（child programs）；

- 响应客户端发送的命令；

- 在子程序崩溃或退出时自动重启；

- 记录子程序的标准输出（stdout）和标准错误（stderr）；

- 生成和处理与子程序生命周期相关的“事件”。



服务端进程依赖 **配置文件** 来运行。

- 这个配置文件通常位于 `/etc/supervisord.conf`。
- 配置文件采用 **Windows-INI 风格**。
- 因为文件中可能包含明文的用户名和密码，所以必须通过 **正确的文件系统权限** 来保证安全。



#### `supervisorctl`

Supervisor 的命令行客户端叫做 **`supervisorctl`**。它提供了一个类似 **shell** 的交互界面，让用户可以使用 **`supervisord`** 提供的各种功能。

通过 `supervisorctl`，用户可以：

- 连接到不同的 **`supervisord`** 实例（一次连接一个）；
- 查看被管理的子进程的状态；
- 启动或停止子进程；
- 获取当前正在运行的进程列表。

命令行客户端通过 **UNIX 域套接字** 或 **TCP 套接字** 与服务端通信。
 服务端可以要求客户端在执行命令前提供 **身份验证**。
 客户端通常使用与服务端相同的配置文件，但只要配置文件里有 `[supervisorctl]` 段，也可以使用。



#### `Web Server`

如果在配置中启用了 **`[inet_http_server]`** 部分，并让 `supervisord` 监听一个 **HTTP 端口**，那么就可以通过浏览器访问一个 **简单的 Web 管理界面**。这个 Web 界面提供的功能与 `supervisorctl` 命令行工具基本类似，可以用于查看和控制进程状态。



#### `XML-RPC Interface`

与提供 Web 界面的 **HTTP 服务器** 同时，也提供了一个 **XML-RPC 接口**，可以通过它来查询和控制 **Supervisor** 以及它管理的所有程序，详细使用方法请参考 [XML-RPC API Documentation](https://supervisord.org/api.html#xml-rpc)







## 安装supervisor

### 系统python环境

```shell
$ python -V
Python 3.9.18
```



### 安装suprvisor

#### 配置国内pip源

```shell
mkdir ~/.pip
cat > .pip/pip.conf << 'EOF'
[global]
index-url = https://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
EOF
```



#### 安装

安装最新版

```shell
pip install supervisor
```



安装指定版本

```shell
pip install supervisor==3.3.5
```



查看版本

```shell
$ supervisord -v
4.2.5
```



## 配置supervisor

### 生成默认配置文件

:::tip 说明

运行 `echo_supervisord_conf` 命令，会在当前终端的标准输出中打印一个样本supervisor配置文件

:::



```ini
; Sample supervisor config file.
;
; For more information on the config file, please see:
; http://supervisord.org/configuration.html
;
; Notes:
;  - Shell expansion ("~" or "$HOME") is not supported.  Environment
;    variables can be expanded using this syntax: "%(ENV_HOME)s".
;  - Quotes around values are not supported, except in the case of
;    the environment= options as shown below.
;  - Comments must have a leading space: "a=b ;comment" not "a=b;comment".
;  - Command will be truncated if it looks like a config file comment, e.g.
;    "command=bash -c 'foo ; bar'" will truncate to "command=bash -c 'foo ".
;
; Warning:
;  Paths throughout this example file use /tmp because it is available on most
;  systems.  You will likely need to change these to locations more appropriate
;  for your system.  Some systems periodically delete older files in /tmp.
;  Notably, if the socket file defined in the [unix_http_server] section below
;  is deleted, supervisorctl will be unable to connect to supervisord.

[unix_http_server]
file=/tmp/supervisor.sock   ; the path to the socket file
;chmod=0700                 ; socket file mode (default 0700)
;chown=nobody:nogroup       ; socket file uid:gid owner
;username=user              ; default is no username (open server)
;password=123               ; default is no password (open server)

; Security Warning:
;  The inet HTTP server is not enabled by default.  The inet HTTP server is
;  enabled by uncommenting the [inet_http_server] section below.  The inet
;  HTTP server is intended for use within a trusted environment only.  It
;  should only be bound to localhost or only accessible from within an
;  isolated, trusted network.  The inet HTTP server does not support any
;  form of encryption.  The inet HTTP server does not use authentication
;  by default (see the username= and password= options to add authentication).
;  Never expose the inet HTTP server to the public internet.

;[inet_http_server]         ; inet (TCP) server disabled by default
;port=127.0.0.1:9001        ; ip_address:port specifier, *:port for all iface
;username=user              ; default is no username (open server)
;password=123               ; default is no password (open server)

[supervisord]
logfile=/tmp/supervisord.log ; main log file; default $CWD/supervisord.log
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
nodaemon=false               ; start in foreground if true; default false
silent=false                 ; no logs to stdout if true; default false
minfds=1024                  ; min. avail startup file descriptors; default 1024
minprocs=200                 ; min. avail process descriptors;default 200
;umask=022                   ; process file creation umask; default 022
;user=supervisord            ; setuid to this UNIX account at startup; recommended if root
;identifier=supervisor       ; supervisord identifier, default is 'supervisor'
;directory=/tmp              ; default is not to cd during start
;nocleanup=true              ; don't clean up tempfiles at start; default false
;childlogdir=/tmp            ; 'AUTO' child log dir, default $TEMP
;environment=KEY="value"     ; key value pairs to add to environment
;strip_ansi=false            ; strip ansi escape codes in logs; def. false

; The rpcinterface:supervisor section must remain in the config file for
; RPC (supervisorctl/web interface) to work.  Additional interfaces may be
; added by defining them in separate [rpcinterface:x] sections.

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

; The supervisorctl section configures how supervisorctl will connect to
; supervisord.  configure it match the settings in either the unix_http_server
; or inet_http_server section.

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
;serverurl=http://127.0.0.1:9001 ; use an http:// url to specify an inet socket
;username=chris              ; should be same as in [*_http_server] if set
;password=123                ; should be same as in [*_http_server] if set
;prompt=mysupervisor         ; cmd line prompt (default "supervisor")
;history_file=~/.sc_history  ; use readline history if available

; The sample program section below shows all possible program subsection values.
; Create one or more 'real' program: sections to be able to control them under
; supervisor.

;[program:theprogramname]
;command=/bin/cat              ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=999                  ; the relative start priority (default 999)
;autostart=true                ; start at supervisord start (default: true)
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
;startretries=3                ; max # of serial start failures when starting (default 3)
;autorestart=unexpected        ; when to restart if exited after running (def: unexpected)
;exitcodes=0                   ; 'expected' exit codes used with autorestart (default 0)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (0 means none, default 10)
;stdout_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stdout_syslog=false           ; send stdout to syslog with process name (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (0 means none, default 10)
;stderr_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;stderr_syslog=false           ; send stderr to syslog with process name (default false)
;environment=A="1",B="2"       ; process environment additions (def no adds)
;serverurl=AUTO                ; override serverurl computation (childutils)

; The sample eventlistener section below shows all possible eventlistener
; subsection values.  Create one or more 'real' eventlistener: sections to be
; able to handle event notifications sent by supervisord.

;[eventlistener:theeventlistenername]
;command=/bin/eventlistener    ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;events=EVENT                  ; event notif. types to subscribe to (req'd)
;buffer_size=10                ; event buffer queue size (default 10)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=-1                   ; the relative start priority (default -1)
;autostart=true                ; start at supervisord start (default: true)
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
;startretries=3                ; max # of serial start failures when starting (default 3)
;autorestart=unexpected        ; autorestart if exited after running (def: unexpected)
;exitcodes=0                   ; 'expected' exit codes used with autorestart (default 0)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=false         ; redirect_stderr=true is not allowed for eventlisteners
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (0 means none, default 10)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stdout_syslog=false           ; send stdout to syslog with process name (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (0 means none, default 10)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;stderr_syslog=false           ; send stderr to syslog with process name (default false)
;environment=A="1",B="2"       ; process environment additions
;serverurl=AUTO                ; override serverurl computation (childutils)

; The sample group section below shows all possible group values.  Create one
; or more 'real' group: sections to create "heterogeneous" process groups.

;[group:thegroupname]
;programs=progname1,progname2  ; each refers to 'x' in [program:x] definitions
;priority=999                  ; the relative start priority (default 999)

; The [include] section can just contain the "files" setting.  This
; setting can list multiple files (separated by whitespace or
; newlines).  It can also contain wildcards.  The filenames are
; interpreted as relative to this file.  Included files *cannot*
; include files themselves.

;[include]
;files = relative/directory/*.ini
```



**去掉注释后的内容如下**

```shell
$ echo_supervisord_conf  > supervisor.conf
$ egrep -v '^$|^;' supervisor.conf
[unix_http_server]
file=/tmp/supervisor.sock   ; the path to the socket file
[supervisord]
logfile=/tmp/supervisord.log ; main log file; default $CWD/supervisord.log
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
nodaemon=false               ; start in foreground if true; default false
silent=false                 ; no logs to stdout if true; default false
minfds=1024                  ; min. avail startup file descriptors; default 1024
minprocs=200                 ; min. avail process descriptors;default 200
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
```





### supervisor查找配置文件的顺序

**supervisor配置文件通常被命名为 `supervisor.conf` ，supervisor和supervisorctl都使用这个配置文件，如果在没有`-c`选项的情况下启动了任一应用程序（该选项用于显式告知应用程序配置文件名），则该应用程序将在以下位置按指定顺序查找名为`supervisord.conf`的文件。它将使用找到的第一个文件。**

1. `../etc/supervisord.conf` (相对于可执行文件)
2. `../supervisord.conf` (相对于可执行文件)
3. `$CWD/supervisord.conf`
4. `$CWD/etc/supervisord.conf`
5. `/etc/supervisord.conf`
6. `/etc/supervisor/supervisord.conf` (自Supervisor 3.3.0版本开始)





### 手动编辑supervisor配置文件

创建配置文件和日志文件目录

```shell
mkdir -p /etc/supervisor/config.d
mkdir /var/log/supervisor
```



手动编辑supervisor配置文件

:::caution 注意

supervisor默认以root身份运行，如果想要指定用户，需要在标签 `[supervisord]`下添加 `user=xxx`

如果没有以 `-c` 选项指定配置文件，则supervisor会按照以下顺序查找配置文件 ，否则会报错 `Error: No config file found at default paths (/usr/etc/supervisord.conf, /usr/supervisord.conf, supervisord.conf, etc/supervisord.conf, /etc/supervisord.conf, /etc/supervisor/supervisord.conf); use the -c option to specify a config file at a different path`
- 1 `../etc/supervisord.conf（相对于可执行文件）`
- 2 `../supervisord.conf（相对于可执行文件）`
- 3 `$CWD/supervisord.conf`
- 4 `$CWD/etc/supervisord.conf`
- 5 `/etc/supervisord.conf`
- 6 `/etc/supervisor/supervisord.conf` (since Supervisor 3.3.0)

[官方对于配置文件查找顺序的说明](http://supervisord.org/configuration.html)

:::

```ini
cat > /etc/supervisor/supervisord.conf << 'EOF'
[unix_http_server]
file = /var/run/supervisor/supervisor.sock
chmod = 0770
chown = root:root   ; /var/run/supervisor/supervisor.sock所有者为root
 
[supervisord]
logfile = /var/log/supervisor/supervisord.log ; main log file;
logfile_maxbytes = 50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups = 10           ; # of main logfile backups; 0 means none, default 10
loglevel = info                ; log level; default info; others: debug,warn,trace
pidfile = /var/run/supervisor/supervisord.pid ; supervisord pidfile; default supervisord.pid
 
[inet_http_server]
port = 10.0.0.10:9001
username = test
password = test
 
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
 
[supervisorctl]
serverurl = unix:///var/run/supervisor/supervisord.sock ; use a unix:// URL  for a unix socket
 
[include]
files = /etc/supervisor/config.d/*.ini
EOF
```



当有如下配置时，supervisor还提供了一个web界面

```shell
[inet_http_server]
port = 10.0.0.10:9001
username = test
password = test
```



浏览器访问 `IP:9001` ，用户名和密码在 `inet_http_server` 下配置，这里为 `test`

![iShot2020-06-3011.46.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-06-3011.46.06.png)



### 设置supervisor日志滚动

```shell
cat > /etc/logrotate.d/supervisor <<EOF
/var/log/supervisor/*.log {
       missingok # 如果日志文件丢失，不报错继续执行
       weekly # 每周轮转一次日志
       notifempty # 如果日志文件为空，不进行轮转
       nocompress # 不压缩轮转后的日志文件
}
EOF
```



### 设置Tmpfiles防止sock文件被清理

```shell
cat >> /usr/lib/tmpfiles.d/tmp.conf <<EOF
x /var/run/supervisor/supervisord.sock
x /var/run/supervisor/supervisord.pid
EOF
```



### 使用systemd管理supervisor

[对各操作系统提供supervisor脚本的github地址](https://github.com/Supervisor/initscripts)



克隆项目

```shell
$ git clone https://github.com/Supervisor/initscripts.git
$ cd initscripts
$ ll
total 64
-rw-r--r-- 1 root root  367 Jul 16 17:44 centos-systemd-etcs
-rw-r--r-- 1 root root 4501 Jul 16 17:44 debian-norrgard
-rw-r--r-- 1 root root 1453 Jul 16 17:44 fedora-bmbouter
-rw-r--r-- 1 root root 1544 Jul 16 17:44 gentoo-matagus
-rwxr-xr-x 1 root root 1746 Jul 16 17:44 opensuse-garymonson
-rw-r--r-- 1 root root  788 Jul 16 17:44 README.md
-rwxr-xr-x 1 root root 3165 Jul 16 17:44 redhat-init-equeffelec
-rwxr-xr-x 1 root root 3497 Jul 16 17:44 redhat-init-jkoppe
-rwxr-xr-x 1 root root 4112 Jul 16 17:44 redhat-init-mingalevme
-rw-r--r-- 1 root root  723 Jul 16 17:44 redhat-sysconfig-equeffelec
-rw-r--r-- 1 root root  462 Jul 16 17:44 redhat-sysconfig-jkoppe
-rw-r--r-- 1 root root 2068 Jul 16 17:44 slackware
-rw-r--r-- 1 root root 4788 Jul 16 17:44 ubuntu
```



`centos-systemd-etcs` 文件中的内容如下，这里需要修改 `supervisord` 和 `supervisorctl` 命令的绝对路径

```shell
$ cat centos-systemd-etcs 
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=/usr/bin/supervisord
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```



将默认的 `/usr/bin/supervisord` 和 `/usr/bin/supervisorctl` 执行 `which` 命令自动获取并写入到 `/usr/lib/systemd/system/supervisord.service`

```shell
cat > /usr/lib/systemd/system/supervisord.service << EOF
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=`which supervisord`
ExecStop=`which supervisorctl` $OPTIONS shutdown
ExecReload=`which supervisorctl` $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
EOF
```



启动supervisord并加入开机自启

```shell
systemctl daemon-reload
systemctl start supervisord && systemctl enable supervisord
```



查看启动

```shell
$ systemctl status supervisord
● supervisord.service - Supervisor daemon
     Loaded: loaded (/usr/lib/systemd/system/supervisord.service; enabled; preset: disabled)
     Active: active (running) since Thu 2026-03-12 15:36:23 CST; 26min ago
    Process: 33638 ExecStart=/usr/local/bin/supervisord -c /etc/supervisor/supervisord.conf (code=exited, status=0/SUCCESS)
   Main PID: 33639 (supervisord)
      Tasks: 3 (limit: 23562)
     Memory: 14.4M
        CPU: 314ms
     CGroup: /system.slice/supervisord.service
             ├─33639 /usr/bin/python3 /usr/local/bin/supervisord -c /etc/supervisor/supervisord.conf
             ├─33641 "nginx: master process /usr/sbin/nginx -g daemon off;"
             └─33642 "nginx: worker process"

Mar 12 15:36:23 pptfz systemd[1]: Starting Supervisor daemon...
Mar 12 15:36:23 pptfz supervisord[33638]: Unlinking stale socket /var/run/supervisor/supervisor.sock
Mar 12 15:36:23 pptfz systemd[1]: Started Supervisor daemon.
```





## supervisor相关命令

### supervisord命令选项

`supervisord` 命令

| **选项**                             | **说明**                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| `-c FILE, --configuration=FILE`      | 指定supervisor配置文件                                       |
| `-n, --nodaemon`                     | 在前台运行supervisord                                        |
| `-h, --help`                         | 查看帮助                                                     |
| `-u USER, --user=USER`               | UNIX用户名或数字用户标识。如果以root用户身份启动supervisord，请在启动期间尽快setuid给该用户 |
| `-m OCTAL, --umask=OCTAL`            | 表示supervisord启动后应该使用的  [umask](http://supervisord.org/glossary.html#term-umask) 八进制数（例如022） |
| `-d PATH, --directory=PATH`          | 当supervisord作为守护进程运行时，在守护进程之前cd到此目录    |
| `-l FILE, --logfile=FILE`            | 用作supervisord活动日志的文件名路径                          |
| `-y BYTES, --logfile_maxbytes=BYTES` | 旋转发生前，supervisord活动日志文件的最大大小。该值是后缀倍增的，例如“1”是一个字节，“1MB”是1兆字节，“1GB”是1千兆字节 |
| `-z NUM, --logfile_backups=NUM`      | 要保持的supervisord活动日志的备份副本数。每个日志文件的大小为`logfile_maxbytes` |
| `-e LEVEL, --loglevel=LEVEL`         | supervisor应该写入活动日志的日志记录级别。有效级别包括`trace`(追踪), `debug`(调试), `info`(信息), `warn`(警告), `error`(错误),`critical(严重)` |
| `-j FILE, --pidfile=FILE`            | supervisord应该将其pid文件写入的文件名                       |
| `-i STRING, --identifier=STRING`     | 由supervisor实例的各种客户端UI公开的任意字符串标识符         |
| `-q PATH, --childlogdir=PATH`        | 目录的路径（它必须已经存在），其中supervisor将写入其`AUTO` -mode子进程日志 |
| `-k, --nocleanup`                    | 防止supervisord在启动时执行清理（删除旧的`AUTO`进程日志文件） |
| `-a NUM, --minfds=NUM`               | 在成功启动之前，supervisord进程必须可用的最小文件描述符数    |
| `-t, --strip_ansi`                   | 从所有子日志进程中剥离ANSI转义序列                           |
| `-v, --version`                      | 查看版本                                                     |
| `--profile_options=LIST`             | 用于分析的逗号分隔选项列表。导致 supervisord在探查器下运行，并根据选项输出结果，这些选项是以逗号分隔的以下列表：累积，呼叫，呼叫者。例如累计，来电者 |
| `--minprocs=NUM`                     | 在成功启动之前，supervisord进程必须可用的最小OS进程槽数      |



### supervisorctl命令选项及动作

**supervisorctl 命令选项**

| **选项**              | **说明**                                                     |
| --------------------- | ------------------------------------------------------------ |
| `-c, --configuration` | 配置文件路径（默认为 `/etc/supervisord.conf` ）              |
| `-h, --help`          | 查看帮助                                                     |
| `-i, --interactive`   | 执行命令后启动交互式shell                                    |
| `-s, --serverurl URL` | supervisord服务器正在侦听的URL(default `http://localhost:9001`) |
| `-u, --username`      | 用于与服务器进行身份验证的用户名                             |
| `-p, --password`      | 用于与服务器进行身份验证的密码                               |
| `-r, --history-file`  | 保留readline历史记录（如果readline可用）                     |



**supervisorctl命令动作**

![iShot_2024-09-06_15.11.24](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-06_15.11.24.png)





## supervisor信号

supervisor程序可能会被发送信号，使其在运行时执行某些操作。

你可以将这些信号中的任何一个发送到单个supervisord进程id，可以在配置文件的 `[supervisord]` 部分的 `pidfile` 参数表示的文件中找到此进程ID （默认情况下为`$CWD/supervisord.pid`）



| 信号值    | 说明                                                         |
| --------- | ------------------------------------------------------------ |
| `SIGTERM` | **supervisord** 及其所有子进程都将关闭。这可能需要几秒钟。   |
| `SIGINT`  | **supervisord** 及其所有子进程都将关闭。这可能需要几秒钟。   |
| `SIGQUIT` | **supervisord** 的所有子进程都将关闭。这可能需要几秒钟。     |
| `SIGHUP`  | **supervisord** 将停止所有进程，从它找到的第一个配置文件重新加载配置，然后启动所有进程。 |
| `SIGUSR2` | **supervisord** 将关闭并重新打开主活动日志和所有子日志文件。 |



## supervisor一键安装脚本

```shell
#!/usr/bin/env bash
set -e

# 安装supervisor最新版
yum -y install python3-pip && python3 -m pip install --upgrade pip && pip install supervisor

# 创建supervisor相关目录
[ -d /var/log/supervisor ] || mkdir /var/log/supervisor
[ -d /etc/supervisor/config.d ] || mkdir -p /etc/supervisor/config.d
[ -d /var/run/supervisor ] || mkdir /var/run/supervisor

# 设置supervisor相关目录所有者为root
chown -R root:root /etc/supervisor /var/log/supervisor /var/run/supervisor

# 创建supervisor配置文件
cat > /etc/supervisor/supervisord.conf << EOF
[unix_http_server]
file = /var/run/supervisor/supervisor.sock   
chmod = 0770
chown = root:root   ; /var/run/supervisor/supervisord.sock所有者为root

[supervisord]
logfile = /var/log/supervisor/supervisord.log ; main log file;
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups = 10           ; # of main logfile backups; 0 means none, default 10
loglevel = info                ; log level; default info; others: debug,warn,trace
pidfile = /var/run/supervisord.pid ; supervisord pidfile; default supervisord.pid

;[inet_http_server]
;port = 10.0.0.10:9001
;username = test
;password = test

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl = unix:///var/run/supervisor/supervisor.sock  ; use a unix:// URL  for a unix socket

[include]
files = /etc/supervisor/config.d/*.ini
EOF

# 设置supervisor日志滚动
cat > /etc/logrotate.d/supervisor <<EOF
/var/log/supervisor/*.log {
       missingok
       weekly
       notifempty
       nocompress
}
EOF

# 使用systemd管理supervisor
cat > /usr/lib/systemd/system/supervisord.service << EOF
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
User=root
Group=root
Type=forking
ExecStart=`which supervisord` -c /etc/supervisor/supervisord.conf
ExecStop=`which supervisorctl` $OPTIONS shutdown
ExecReload=`which supervisorctl` $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
EOF

# 启动supervisor
systemctl daemon-reload
systemctl start supervisord && systemctl enable supervisord
```

