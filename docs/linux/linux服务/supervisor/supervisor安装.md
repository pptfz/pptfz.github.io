[toc]



# supervisor安装

## 1.supervisor简介

[supervisor github地址](https://github.com/Supervisor/Supervisor)

[supervisor官网](http://supervisord.org/)



### 1.1 官网对于supervisor的介绍

#### 1.1.1 总览

Supervisor是一个客户端/服务器系统，允许其用户控制类似UNIX的操作系统上的许多进程。它受到以下方面的启发



**方便**

:::tip 说明

需要为每个单个流程实例编写 `rc.d` 脚本通常很不方便。 `rc.d` 脚本是进程初始化/自动启动/管理的一个很好的最低公分母形式，但是编写和维护它们可能很麻烦。此外，`rc.d` 脚本无法自动重新启动崩溃的进程，并且许多程序在崩溃时无法正确地自行重启。Supervisord将进程作为其子进程启动，并且可以配置为在崩溃时自动重新启动它们。也可以将其自动配置为自行调用启动进程。

:::



**准确性**

:::tip 说明

在UNIX上，通常很难获得准确的启动/关闭状态信息。Pidfile经常说谎。Supervisord将流程作为子流程启动，因此它始终知道其子级的真实上/下状态，并且可以方便地查询该数据。

:::



**授权**

:::tip 说明

需要控制流程状态的用户通常只需要这样做。他们不希望或不需要完全的Shell访问运行这些进程的计算机。侦听"低" TCP端口的进程通常需要以root用户身份启动和重新启动（UNIX功能不全）。通常情况下，允许"正常"人员停止或重新启动这样的过程是完全可以的，但是为他们提供shell访问通常是不切实际的，并且为他们提供root访问或sudo访问通常是不可能的。（正确）也很难向他们解释为什么存在此问题。如果超级用户以root用户身份启动，则可以允许"普通"用户控制此类过程，而无需向他们解释问题的复杂性。Supervisorctl允许以非常有限的形式访问计算机

:::



**进程组**

:::tip 说明

流程通常需要成组地启动和停止，有时甚至需要按照"优先级顺序"进行。通常很难向人们解释如何执行此操作。Supervisor允许您为进程分配优先级，并允许用户通过Supervisorctl客户端发出命令，如"全部启动"和"全部重新启动"，这将按预先分配的优先级顺序启动它们。此外，可以将进程分为"进程组"，并且可以将一组逻辑相关的进程作为一个单元停止和启动。

:::



#### 1.1.2 特征

**简单**

:::tip 说明

通过简单易懂的INI样式配置文件配置Supervisor。它提供了许多按进程选择的选项，使您的生活更加轻松，例如重新启动失败的进程和自动日志轮换。

:::



**集中**

:::tip 说明

Supervisor为您提供了一个开始，停止和监视过程的地方。可以单独或成组控制过程。您可以配置Supervisor以提供本地或远程命令行和Web界面。

:::



**高效的**

:::tip 说明

Supervisor通过 `fork/exec` 启动其子进程，并且子进程不守护。进程终止时，操作系统会立即向Supervisor发送信号，这与某些依赖麻烦的PID文件和定期轮询以重新启动失败的进程的解决方案不同。

:::





**可扩展的**

:::tip 说明

Supervisor具有一个简单的事件通知协议，该协议可以使用任何语言编写的程序对其进行监视，并且具有用于控制的XML-RPC接口。它还使用扩展点构建，Python开发人员可以利用这些扩展点。

:::



**兼容**

:::tip 说明

除Windows外，Supervisor几乎适用于所有其他方面。它已在Linux，Mac OS X，Solaris和FreeBSD上经过测试和支持。它完全用Python编写，因此安装不需要C编译器。

:::



**久经考验**

:::tip 说明

尽管Supervisor如今非常活跃，但它不是新软件。Supervisor已经存在了很多年，并且已经在许多服务器上使用。

:::



#### 1.1.3 Supervisor组件

**supervisord**

:::tip 说明

服务器Supervisor的名称为**supervisor**。它负责自行调用启动子程序，响应来自客户端的命令，重新启动崩溃或退出的子进程，记录其子进程`stdout` 和 `stderr` 输出以及生成和处理与子进程生存期中的点相对应的"事件"。

服务器进程使用配置文件。它通常位于 `/etc/supervisord.conf中`。此配置文件是"Windows-INI"样式的配置文件。通过适当的文件系统权限来确保此文件的安全很重要，因为它可能包含未加密的用户名和密码。

:::



**supervisorctl**

:::tip 说明

Supervisor的命令行客户端名为 **supervisorctl**。它提供了类似于shell的界面，可与**supervisor**提供的功能结合使用。从 **supervisorctl**，用户可以连接到不同的 **supervisord**进程（一次一个），对，停止控制的子流程获得地位和启动的子进程，并获得运行的进程的列表**supervisord**。

命令行客户端通过UNIX域套接字或Internet（TCP）套接字与服务器对话。服务器可以断言客户端的用户应该在允许客户端执行命令之前出示身份验证凭据。客户端进程通常使用与服务器相同的配置文件，但是任何带有 `[supervisorctl]` 节的配置文件都可以使用。

:::



**Web Server**

:::tip 说明

与功能媲美A（稀疏）的Web用户界面 **supervisorctl**可以通过浏览器，如果你开始访问 **supervisord** 对互联网插座。激活配置文件的`[inet_http_server]`部分后，请访问服务器URL（例如`http://localhost:9001/`）以通过Web界面查看和控制进程状态。

:::



**XML-RPC Interface**

:::tip 说明

服务于Web UI的同一HTTP服务器提供XML-RPC接口，该接口可用于询问和控制管理程序及其运行的程序。请参阅[*XML-RPC API文档*](http://supervisord.org/api.html#xml-rpc)。

:::





## 2.安装supervisor

### 2.1 系统python环境

```shell
$ python -V
Python 3.9.18
```



### 2.2 安装suprvisor

#### 2.2.1 配置国内pip源

```shell
mkdir ~/.pip
cat > .pip/pip.conf << 'EOF'
[global]
index-url = https://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
EOF
```



#### 2.2.2 安装

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



## 3.配置supervisor

### 3.1 生成默认配置文件

:::tip 说明

运行 `echo_supervisord_conf` 命令，会在当前终端的标准输出中打印一个样本supervisor配置文件

:::



```ini
$ echo_supervisord_conf
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





### 3.2 supervisor查找配置文件的顺序

**supervisor配置文件通常被命名为 `supervisor.conf` ，supervisor和supervisorctl都使用这个配置文件，如果在没有`-c`选项的情况下启动了任一应用程序（该选项用于显式告知应用程序配置文件名），则该应用程序将在以下位置按指定顺序查找名为`supervisord.conf`的文件。它将使用找到的第一个文件。**

1. `../etc/supervisord.conf` (相对于可执行文件)
2. `../supervisord.conf` (相对于可执行文件)
3. `$CWD/supervisord.conf`
4. `$CWD/etc/supervisord.conf`
5. `/etc/supervisord.conf`
6. `/etc/supervisor/supervisord.conf` (自Supervisor 3.3.0版本开始)





### 3.3 手动编辑supervisor配置文件

创建配置文件和日志文件目录

```shell
mkdir -p /etc/supervisor/config.d
mkdir /var/log/supervisor
```



创建supervisor运行用户supervisor

:::tip 说明

如果不创建专门的用户也可以使用root用户启动supervisor

:::

```shell
useradd supervisor -s /sbin/nologin -M
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
file = /tmp/supervisor.sock   
chmod = 0770
chown = supervisor:supervisor   ; /tmp/supervisor.sock所有者为supervisor
 
[supervisord]
logfile=/var/log/supervisor/supervisord.log ; main log file;
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
 
[inet_http_server]
port=10.0.0.10:9001
username=test
password=test
 
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
 
[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
 
[include]
files = /etc/supervisor/config.d/*.ini
EOF
```



当有如下配置时，supervisor还提供了一个web界面

```shell
[inet_http_server]
port=10.0.0.10:9001
username=test
password=test
```



浏览器访问 `IP:9001` ，用户名和密码在 `inet_http_server` 下配置，这里为 `test`

![iShot2020-06-3011.46.06](https://github.com/pptfz/picgo-images/blob/master/img/iShot2020-06-3011.46.06.png)



### 3.4 设置supervisor日志滚动

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



### 3.5 设置Tmpfiles防止sock文件被清理

```shell
cat >> /usr/lib/tmpfiles.d/tmp.conf <<EOF
x /tmp/supervisor.sock
x /tmp/supervisord.pid
EOF
```



### 3.6 使用systemd管理supervisor

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
$ systemctl status supervisord.service
● supervisord.service - Supervisor daemon
     Loaded: loaded (/usr/lib/systemd/system/supervisord.service; disabled; preset: disabled)
     Active: active (running) since Tue 2024-07-16 19:37:42 CST; 3s ago
    Process: 8498 ExecStart=/usr/local/bin/supervisord (code=exited, status=0/SUCCESS)
   Main PID: 8500 (supervisord)
      Tasks: 1 (limit: 5883)
     Memory: 15.7M
        CPU: 53ms
     CGroup: /system.slice/supervisord.service
             └─8500 /usr/bin/python3 /usr/local/bin/supervisord

Jul 16 19:37:42 localhost.localdomain systemd[1]: Starting Supervisor daemon...
Jul 16 19:37:42 localhost.localdomain supervisord[8498]: /usr/local/lib/python3.9/site-packages/supervisor/options.py:474: UserWarning: Supervisord is running as root and it>
Jul 16 19:37:42 localhost.localdomain supervisord[8498]:   self.warnings.warn(
Jul 16 19:37:42 localhost.localdomain systemd[1]: Started Supervisor daemon.
```





## 4.supervisor相关命令

### 4.1 supervisord命令选项

**`supervisord` 命令**

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



### 4.2 supervisorctl命令选项及动作

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

![iShot_2024-09-06_15.11.24](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-06_15.11.24.png)





## 5.supervisor信号

supervisor程序可能会被发送信号，使其在运行时执行某些操作。

你可以将这些信号中的任何一个发送到单个supervisord进程id，可以在配置文件的 `[supervisord]` 部分的 `pidfile` 参数表示的文件中找到此进程ID （默认情况下为`$CWD/supervisord.pid`）



- **SIGTERM**
  - **supervisord** 及其所有子进程都将关闭。这可能需要几秒钟。



- **SIGINT**
  - **supervisord** 及其所有子进程都将关闭。这可能需要几秒钟。



- **SIGQUIT**
  - **supervisord** 的所有子进程都将关闭。这可能需要几秒钟。



- **SIGHUP**
  - **supervisord** 将停止所有进程，从它找到的第一个配置文件重新加载配置，然后启动所有进程。



- **SIGUSR2**
  - **supervisord** 将关闭并重新打开主活动日志和所有子日志文件。





## 6.supervisor一键安装脚本



```shell
#!/usr/bin/env bash
set -e

TMP_FILE=/usr/lib/tmpfiles.d/tmp.conf

# 安装supervisor最新版
yum -y install python3-pip && pip3 install supervisor

# 创建目录
[ -d /etc/supervisor ] || mkdir /etc/supervisor

# 创建supervisor配置文件
cat > /etc/supervisor/supervisord.conf << EOF
[unix_http_server]
file=/tmp/supervisor.sock   
chmod=0770
chown=supervisor:supervisor   ; /tmp/supervisor.sock所有者为supervisor


[supervisord]
logfile=/var/log/supervisor/supervisord.log ; main log file;
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid

;[inet_http_server]
;port=10.0.0.10:9001
;username=test
;password=test

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket

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


# 设置Tmpfiles防止sock文件被清理
grep -w 'x /tmp/supervisor.sock' $TMP_FILE && grep -w 'x /tmp/supervisord.pid' $TMP_FILE
if [ $? -ne 0 ];then
   sed -i.bak '/x \/tmp\/supervisord.pid/d' $TMP_FILE && sed -i '/x \/tmp\/supervisor.sock/d' $TMP_FILE
   echo -e "x /tmp/supervisor.sock\nx /tmp/supervisord.pid" >> $TMP_FILE
fi


# 将supervisor加入systemd
cat >/usr/lib/systemd/system/supervisord.service << EOF
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


# 创建supervisor相关目录
[ -d /var/log/supervisor ] || mkdir /var/log/supervisor
[ -d /etc/supervisor/config.d ] || mkdir -p /etc/supervisor/config.d

# 启动supervisor
systemctl daemon-reload
systemctl start supervisord && systemctl enable supervisord
```

