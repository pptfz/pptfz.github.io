# vncserver安装

# 1.安装包

```shell
yum -y install tigervnc tigervnc-server
```



# 2.配置systemd管理vncserver

安装完包后会生产一个文件 `/usr/lib/systemd/system/vncserver@.service` 

文件中已经说的非常清楚了

```shell
# Quick HowTo:
# 1. Copy this file to /etc/systemd/system/vncserver@.service
# 2. Replace <USER> with the actual user name and edit vncserver
#    parameters in the wrapper script located in /usr/bin/vncserver_wrapper
# 3. Run `systemctl daemon-reload`
# 4. Run `systemctl enable vncserver@:<display>.service`
```



按照说明配置一下就可以

第一步、拷贝文件

```shell
cp /usr/lib/systemd/system/vncserver@.service /etc/systemd/system/
```



第二步、替换文件中的 `<USER>` 为具体的用户

```shell
sed -i 's/<USER>/root/' /etc/systemd/system/vncserver@.service
```



第三步、运行命令 `systemctl daemon-reload`

```shell
systemctl daemon-reload
```



第四步、设置vnc密码

> <span style=color:red>⚠️必须在启动vnc前设置密码，否则启动会失败</span>

```shell
# 输入2次密码
$ vncpasswd 
Password:
Verify:
Would you like to enter a view-only password (y/n)? n
A view-only password is not used
```



第四步、启动vncserver

> 使用命令 `systemctl enable vncserver@:<display>.service` 把想要开启的vnc窗口加入开机自启，其中 `<display>` 为具体的窗口号

```shell
systemctl start vncserver@:1.service
systemctl enable vncserver@:1.service
```



查看启动

> 默认的启动脚本路径 `/root/.vnc/xstartup`
>
> 默认的配置文件路径 `/root/.vnc/config`
>
> 默认的日志文件路径 `/root/.vnc/devops01:1.log` 其中 `devops01` 是主机名0

```shell
$ systemctl status vncserver@:1
● vncserver@:1.service - Remote desktop service (VNC)
   Loaded: loaded (/etc/systemd/system/vncserver@.service; enabled; vendor preset: disabled)
   Active: active (running) since Wed 2021-12-01 10:37:10 CST; 23s ago
  Process: 9480 ExecStartPre=/bin/sh -c /usr/bin/vncserver -kill %i > /dev/null 2>&1 || : (code=exited, status=0/SUCCESS)
 Main PID: 9483 (vncserver_wrapp)
   CGroup: /system.slice/system-vncserver.slice/vncserver@:1.service
           ├─9483 /bin/sh /usr/bin/vncserver_wrapper root :1
           └─9675 sleep 5

Dec 01 10:37:10 devops01 systemd[1]: Starting Remote desktop service (VNC)...
Dec 01 10:37:10 devops01 systemd[1]: Started Remote desktop service (VNC).
Dec 01 10:37:10 devops01 vncserver_wrapper[9483]: xauth:  file /root/.Xauthority does not exist
Dec 01 10:37:13 devops01 vncserver_wrapper[9483]: New 'devops01:1 (root)' desktop is devops01:1
Dec 01 10:37:13 devops01 vncserver_wrapper[9483]: Creating default startup script /root/.vnc/xstartup
Dec 01 10:37:13 devops01 vncserver_wrapper[9483]: Creating default config /root/.vnc/config
Dec 01 10:37:13 devops01 vncserver_wrapper[9483]: Starting applications specified in /root/.vnc/xstartup
Dec 01 10:37:13 devops01 vncserver_wrapper[9483]: Log file is /root/.vnc/devops01:1.log
Dec 01 10:37:19 devops01 vncserver_wrapper[9483]: 'vncserver :1' has PID 9544, waiting until it exits ...
```



查看进程

```shell
$ ps aux|grep [X]vnc
root      9544  0.0  2.3 194016 24140 ?        Sl   10:37   0:00 /usr/bin/Xvnc :1 -auth /root/.Xauthority -desktop devops01:1 (root) -fp catalogue:/etc/X11/fontpath.d -geometry 1024x768 -pn -rfbauth /root/.vnc/passwd -rfbport 5901 -rfbwait 30000
```



# 3.vncserver一些操作说明

## 3.1 启动、关闭

**启动**

方式一： systemd管理

```shell
systemctl start vncserver@:1.service
```



方式二：vncserver命令

> 直接运行 `vncserver :数字` 启动

```shell
$ vncserver :1

New 'devops01:1 (root)' desktop is devops01:1

Starting applications specified in /root/.vnc/xstartup
Log file is /root/.vnc/devops01:1.log
```



**关闭**

方式一：systemd管理

```shell
systemctl stop vncserver@:1.service
```



方式二：vncserver命令

```shell
$ vncserver -kill :1
Killing Xvnc process ID 16654
```



## 3.2 修改vncserver窗口分辨率

通过查看vnc进程可以看到，vncserver默认的窗口分辨率是 `1024x768`

```shell
$ ps aux|grep [X]vnc
root      9544  0.0  2.3 194016 24140 ?        Sl   10:37   0:00 /usr/bin/Xvnc :1 -auth /root/.Xauthority -desktop devops01:1 (root) -fp catalogue:/etc/X11/fontpath.d -geometry 1024x768 -pn -rfbauth /root/.vnc/passwd -rfbport 5901 -rfbwait 30000
```



如果想要修改vncserver启动窗口的默认分辨率，需要修改 `.vnc/config ` 文件中 `geometry=` 参数，默认是注释的

```shell
$ cat ~/.vnc/config 
## Supported server options to pass to vncserver upon invocation can be listed
## in this file. See the following manpages for more: vncserver(1) Xvnc(1).
## Several common ones are shown below. Uncomment and modify to your liking.
##
# securitytypes=vncauth,tlsvnc
# desktop=sandbox
# geometry=2000x1200
# localhost
# alwaysshared
```



修改为想要的分辨率，然后重启进程

<span style=color:red>⚠️重启vncserver进程不能使用system命令，重启会不生效并且报错</span>



使用 `systemctl` 命令重启vncserver

```shell
systemctl restart vncserver@:1
```



然后查看进程

```shell
$ ps aux|grep [X]vnc
root     16693  0.0  2.2 192504 22640 pts/0    Sl   18:44   0:00 /usr/bin/Xvnc :1 -auth /root/.Xauthority -desktop devops01:1 (root) -fp catalogue:/etc/X11/fontpath.d -geometry 1024x768 -pn -rfbauth /root/.vnc/passwd -rfbport 5901 -rfbwait 30000
```



查看进程状态，发现报错 `A VNC server is already running as :1` 并且分辨率没有修改

```shell
$ systemctl status  vncserver@:1
● vncserver@:1.service - Remote desktop service (VNC)
   Loaded: loaded (/etc/systemd/system/vncserver@.service; enabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since Wed 2021-12-01 18:57:41 CST; 12s ago
  Process: 16631 ExecStop=/bin/sh -c /usr/bin/vncserver -kill %i > /dev/null 2>&1 || : (code=exited, status=0/SUCCESS)
  Process: 16765 ExecStart=/usr/bin/vncserver_wrapper root %i (code=exited, status=2)
  Process: 16762 ExecStartPre=/bin/sh -c /usr/bin/vncserver -kill %i > /dev/null 2>&1 || : (code=exited, status=0/SUCCESS)
 Main PID: 16765 (code=exited, status=2)

Dec 01 18:57:41 devops01 systemd[1]: Starting Remote desktop service (VNC)...
Dec 01 18:57:41 devops01 systemd[1]: Started Remote desktop service (VNC).
Dec 01 18:57:41 devops01 vncserver_wrapper[16765]: A VNC server is already running as :1
Dec 01 18:57:41 devops01 vncserver_wrapper[16765]: FATAL: 'runuser -l root' failed!
Dec 01 18:57:41 devops01 systemd[1]: vncserver@:1.service: main process exited, code=exited, status=2/INVALIDARGUMENT
Dec 01 18:57:41 devops01 systemd[1]: Unit vncserver@:1.service entered failed state.
Dec 01 18:57:41 devops01 systemd[1]: vncserver@:1.service failed.
```



使用 `vncserver -kill :1` kill掉进程

```shell
$ vncserver -kill :1
Killing Xvnc process ID 16693
[root@devops01 ~]# vncserver :1

New 'devops01:1 (root)' desktop is devops01:1

Starting applications specified in /root/.vnc/xstartup
Log file is /root/.vnc/devops01:1.log
```



然后再次查看进程，可以看到分辨率已经修改

```shell
$ ps aux|grep [X]vnc
root     16842  0.3  2.8 198808 28936 pts/0    Sl   18:58   0:00 /usr/bin/Xvnc :1 -geometry 2000x1200 -auth /root/.Xauthority -desktop devops01:1 (root) -fp catalogue:/etc/X11/fontpath.d -pn -rfbauth /root/.vnc/passwd -rfbport 5901 -rfbwait 30000
```



![iShot2021-12-01 19.05.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-12-01 19.05.10.png)