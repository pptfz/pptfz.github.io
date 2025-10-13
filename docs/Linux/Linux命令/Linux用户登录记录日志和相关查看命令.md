[toc]



# Linux用户登录记录日志和相关查看命令总结

## Linux用户登录信息放在三个文件中

:::tip 说明

- 这三个文件都是二进制数据文件，并且三个文件结构完全相同，是由 `/usr/include/bits/utmp.h` 文件定义了这三个文件的结构体。

- 默认情况下文件的日志信息会通过 `logrotate` 日志管理工具定期清理。`logrotate` 的配置文件是 `/etc/logrotate.conf` ，此处是`logrotate` 的缺省设置，通常不需要对它进行修改。日志文件的轮循压缩等设置存放在独立的配置文件中，放在 `/etc/logrotate.d/` 目录下，它会覆盖缺省设置。

- 如果不想记录相关信息，则可以直接将相关文件删除即可。如果系统不存在该文件，则需要在此路径 `touch` 一个文件就可以继续记录相关信息了。

- 如果想禁用 `who` 命令，则只需要将 `utmp` 的可读权限去掉就行，这样非root用户就不能用此命令了；如果是 `btmp` 文件，手工创建的话注意权限必须为600，否则不能正确写入信息。 

:::

- `/var/run/utmp`
- `/var/log/wtmp`
- `/var/log/btmp`



### `/var/run/utmp`

:::tip 说明

记录当前正在登录系统的用户信息，默认由 `who` 和 `w` 记录当前登录用户的信息，`uptime` 记录系统启动时间

:::



who命令输出

```shell
$ who
root     pts/0        2018-11-08 17:17 (12.66.1.11)
```



w命令输出

```shell
$ w
 21:02:03 up 18 days, 23:04,  1 user,  load average: 0.00, 0.02, 0.07
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    12.66.1.11   17:17    3.00s  0.32s  0.32s -bash
```



uptime命令输出

```shell
$ uptime
 21:02:46 up 18 days, 23:04,  1 user,  load average: 0.00, 0.01, 0.06
```



### `/var/log/wtmp`

:::tip 说明

记录当前正在登录和历史登录系统的用户信息，默认由 `last` 命令查看

:::



last命令输出

```python
$ last|head
root     pts/0        123.66.144.124   Fri Nov  8 17:17   still logged in
root     pts/0        122.1.22.20   Thu Nov  7 20:17 - 22:55  (02:37)
root     pts/0        122.1.22.16   Tue Nov  5 16:31 - 22:02  (05:31)
root     pts/0        122.1.22.16   Tue Nov  5 11:05 - 11:18  (00:12)
root     pts/0        122.1.67.92     Mon Nov  4 17:10 - 22:57  (05:47)
root     pts/0        123.66.18.69    Wed Oct 30 08:04 - 11:58  (03:53)
root     pts/1        12.66.17.23   Tue Oct 29 20:33 - 22:56  (02:22)
root     pts/0        12.66.17.23   Tue Oct 29 19:41 - 22:56  (03:14)
root     pts/1        12.66.16.12   Mon Oct 28 20:19 - 00:54  (04:35)
root     pts/0        12.66.16.12   Mon Oct 28 15:22 - 20:20  (04:57)
```



### `/var/log/btmp`

:::tip 说明

记录失败的登录尝试信息，默认由 `lastb` 命令查看

:::



lastb命令输出

```shell
$ lastb

btmp begins Fri Nov  1 03:49:01 2019
```



## 相关命令

:::tip 说明

如下命令可查看这三个日志文件，分别是

- `lastlog`
- `last`
- `lastb`
- `ac`
- `who`
- `w`
- `users`
- `utmpdump`

其中 `last` 、`lastb` 、`who` 、`utmpdump` 可以通过指定参数而查看三个中的任意一个文件

:::



### lastlog

:::tip 说明

列出所有用户最近登录的信息，或者指定用户的最近登录信息。`lastlog` 引用的是 `/var/log/lastlog` 文件中的信息，包括`login-name` 、`port` 、`last login time`

:::

```shell
$ lastlog
Username         Port     From             Latest
root             pts/1    111.55.66.123   Fri Nov  8 21:17:12 +0800 2018
bin                                        **Never logged in**
daemon                                     **Never logged in**
adm                                        **Never logged in**
lp                                         **Never logged in**
sync                                       **Never logged in**
shutdown                                   **Never logged in**
halt                                       **Never logged in**
mail                                       **Never logged in**
operator                                   **Never logged in**
games                                      **Never logged in**
ftp                                        **Never logged in**
nobody                                     **Never logged in**
```



### last

:::tip 说明

列出当前和曾经登入系统的用户信息，它默认读取的是 `/var/log/wtmp` 文件的信息。

输出的内容包括：用户名、终端位置、登录源信息、开始时间、结束时间、持续时间。注意最后一行输出的是 `wtmp` 文件起始记录的时间。

当然也可以通过 `last -f` 参数指定读取文件，可以是 `/var/log/btmp` 、`/var/run/utmp`

:::

```shell
$ last|head
root     pts/1        12.66.1.12   Fri Nov  8 21:17   still logged in   
root     pts/0        23.6.55.12   Fri Nov  8 17:17   still logged in   
root     pts/0        23.6.55.12   Thu Nov  7 20:17 - 22:55  (02:37)    
root     pts/0        23.6.55.12   Tue Nov  5 16:31 - 22:02  (05:31)    
root     pts/0        23.6.55.12  Tue Nov  5 11:05 - 11:18  (00:12)    
root     pts/0        23.6.55.12     Mon Nov  4 17:10 - 22:57  (05:47)    
root     pts/0        23.6.55.12    Wed Oct 30 08:04 - 11:58  (03:53)    
root     pts/1        23.6.55.124   Tue Oct 29 20:33 - 22:56  (02:22)    
root     pts/0        23.6.55.12   Tue Oct 29 19:41 - 22:56  (03:14)    
root     pts/1        23.6.55.122   Mon Oct 28 20:19 - 00:54  (04:35)
```



### lastb

:::tip 说明

列出失败尝试的登录信息，和last命令功能完全相同，只不过它默认读取的是 `/var/log/btmp` 文件的信息

当然也可以通过 `last -f` 参数指定读取文件，可以是 `/var/log/btmp` 、`/var/run/utmp`

:::

```shell
$ lastb

btmp begins Fri Nov  1 03:49:01 2019
```



### ac

:::tip 说明

输出所有用户总的连接时间，默认单位是小时。由于 `ac` 是基于 `wtmp` 统计的，所以修改或者删除 `wtmp` 文件都会使 `ac` 的结果受影响。(Suse默认没有该命令)

可通过执行 `yum -y install psacct` 安装 `ac` 命令

:::

```shell
$ ac
	total      559.07
```



### who

:::tip 说明

查看当前登入系统的用户信息

语法 `who [OPTION]... [ FILE | ARG1 ARG2 ]`

`who` 命令强大的一点是，它既可以读取 `utmp` 文件也可以读取 `wtmp` 文件，默认没有指定FILE参数时，`who` 查询的是 `utmp` 的内容。当然可以指定FILE参数，比如 `who -aH /var/log/wtmp`，则此时查看的是 `wtmp` 文件

:::

```shell
$ who
root     pts/0        2018-11-08 17:17 (23.66.1.2)
root     pts/1        2018-11-08 21:17 (23.66.1.2)
  
$ who -rH
NAME     LINE         TIME             IDLE          PID COMMENT
         run-level 3  2018-10-20 21:58
```



### w

:::tip 说明

查看当前登入系统的用户信息及用户当前的进程（而who命令只能看用户不能看进程）

该命令能查看的信息包括字系统当前时间，系统运行时间，登陆系统用户总数及系统1、5、10分钟内的平均负载信息。后面的信息是用户，终端，登录源，login time，idle time，JCPU，PCPU，当前执行的进程等

`w` 的信息来自两个文件：用户登录信息来自 `/var/run/utmp` ，进程信息来自 `/proc`

:::

```shell
$ w
 21:35:24 up 18 days, 23:37,  2 users,  load average: 0.02, 0.08, 0.07
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    23.66.1.2   17:17    3:48   0.33s  0.33s -bash
root     pts/1    23.66.1.2   21:17    4.00s  0.04s  0.00s w
```



### users

:::tip 说明

显示当前正在登入系统的用户名

语法是 `users [OPTION]... [FILE]`

如果未指定FILE参数则默认读取的是 `/var/run/utmp` ，当然也可以指定通用相关文件 `/var/log/wtmp` ，此时输出的就不是当前用户了

:::

```shell
$ users
root root
```



### utmpdump

:::tip 说明

`utmpdump` 用于转储二进制日志文件到文本格式的文件以便查看，同时也可以修改二进制文件包括 `/var/run/utmp` 、`/var/log/wtmp` 、`/var/log/btmp`

语法为`utmpdump [options] [filename]`

修改文件实际就可以抹除系统记录，所以一定要设置好权限，防止非法入侵

:::



**例子：修改utmp或wtmp。由于这些都是二进制日志文件，你不能像编辑文件一样来编辑它们。取而代之是，你可以将其内容输出成为文本格式，并修改文本输出内容，然后将修改后的内容导入回二进制日志中。如下：** 



查看文件信息，是一个二进制文件，不能直接查看，因此需要导出文件信息到一个普通文件中

```shell
$ file /var/log/wtmp
/var/log/wtmp: Hitachi SH big-endian COFF object, not stripped
```



导出文件信息到hehe文件中，这样就能查看文件内容了

```shell
$ utmpdump /var/log/wtmp > hehe
Utmp dump of /var/log/wtmp
```



查看文件内容

```shell
$ tail -5 hehe
[8] [31245] [    ] [        ] [pts/0       ] [                    ] [0.0.0.0        ] [二 11月 05 22:02:12 2018  ]
[7] [16733] [ts/0] [root    ] [pts/0       ] [23.66.1.2      ] [23.66.1.20 ] [四 11月 07 20:17:25 2018  ]
[8] [16727] [    ] [        ] [pts/0       ] [                    ] [0.0.0.0        ] [四 11月 07 22:55:15 2018  ]
[7] [32715] [ts/0] [root    ] [pts/0       ] [23.66.1.2      ] [23.66.1.2 ] [五 11月 08 17:17:09 2018  ]
[7] [02148] [ts/1] [root    ] [pts/1       ] [23.66.1.2      ] [23.66.1.24 ] [五 11月 08 21:17:12 2018  ]
```



还可以将导出的二进制文件信息导回源文件

```sh
1.导出二进制文件/var/log/wtmp文件内容到一个文件中
$ utmpdump /var/log/wtmp > hehe

2.备份/var/log/wtmp
$ cp /var/log/wtmp{,.bak}

3.查看两个文件的行数
$ wc -l /var/log/wtmp.bak ./hehe
   35 /var/log/wtmp
   384 ./hehe
    
4.清空备份的/var/log/wtmp
$ > /var/log/wtmp.bak
$ wc -l /var/log/wtmp.bak
0 /var/log/wtmp.bak

5.将导出的文件再导回到/var/log/wtmp.bak
$ utmpdump -r hehe > /var/log/wtmp.bak
Utmp undump of hehe
$ wc -l /var/log/wtmp.bak
5 /var/log/wtmp.bak
```

