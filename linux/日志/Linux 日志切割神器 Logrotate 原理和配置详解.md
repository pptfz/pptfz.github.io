[toc]



# Linux 日志切割神器 Logrotate 原理和配置详解

[本文严重抄袭至互联网并稍作修改](https://www.cnblogs.com/kevingrace/p/6307298.html)



**写在开头**

:::tip

对于 Linux 系统安全来说，日志文件是极其重要的工具。不知为何，我发现很多运维同学的服务器上都运行着一些诸如每天切分 Nginx日志之类的 CRON 脚本，大家似乎遗忘了 Logrotate，争相发明自己的轮子，这真是让人沮丧啊！就好比明明身边躺着现成的性感美女，大家却忙着自娱自乐，罪过！

logrotate 程序是一个日志文件管理工具。用于分割日志文件，删除旧的日志文件，并创建新的日志文件，起到“转储”作用。可以节省磁盘空间。下面就对 logrotate 日志轮转操作做一梳理记录。

:::



**本文以centos7.6为例**



## 一、logrotate介绍

## 1.1 logrotate配置文件

Linux系统默认安装 `logrotate` 工具，它默认的配置文件在：

```sh
/etc/logrotate.conf
/etc/logrotate.d/
```



`logrotate.conf` 才是主要的配置文件，`logrotate.d` 是一个目录，该目录里的所有文件都会被主动的读入 `/etc/logrotate.conf` 中执行。

另外，如果 `/etc/logrotate.d/` 里面的文件中没有设定一些细节，则会以 `/etc/logrotate.conf` 这个文件的设定来作为默认值。

Logrotate是基于CRON来运行的，其脚本是 `/etc/cron.daily/logrotate`，日志轮转是系统自动完成的。实际运行时，Logrotate会调用配置文件 `/etc/logrotate.conf`。可以在 `/etc/logrotate.d` 目录里放置自定义好的配置文件，用来覆盖Logrotate的缺省值。

`/etc/cron.daily/logrotate` 文件内容如下

```sh
$ cat /etc/cron.daily/logrotate
#!/bin/sh

/usr/sbin/logrotate -s /var/lib/logrotate/logrotate.status /etc/logrotate.conf
EXITVALUE=$?
if [ $EXITVALUE != 0 ]; then
    /usr/bin/logger -t logrotate "ALERT exited abnormally with [$EXITVALUE]"
fi
exit 0
```



如果等不及cron自动执行日志轮转，想手动强制切割日志，需要加-f参数；不过正式执行前最好通过Debug选项来验证一下（-d参数），这对调试也很重要：

```sh
/usr/sbin/logrotate -f /etc/logrotate.d/nginx

/usr/sbin/logrotate -d -f /etc/logrotate.d/nginx
```


