**场景描述**

> 有开发需要连接一台机器，通过jumpserver授权后提示认证失败，无法连接



**环境说明**

> 生产中我们是通过jumpserver进行所有机器管理的，这个是我推动的，这里需要说明一下，之前的权限管理比(非)较(常)混乱，公司的腾讯云机器150+，也没有做VPC，每个机器都有公网IP，都是通过个人密钥连接机器的，所以后来我把jumpserver给落地生产了，一方面是方便权限管理，另一方面是jumpserver支(防)持(止)命(运)令(维)记(背)录(锅)



**问题描述**

> 开发需要连接的这个机器，我给授权后，开发说无法连接，报错认证失败
>
> 我在jumpserver中各种方法都尝试了还不行



连接提示认证失败，在jumpserver群中提问，果然没有失望，还是熟悉的味道，没人回答

![iShot_2024-09-04_14.24.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-04_14.24.33.png)



**诡异的问题**

> 1、在jumpserver中连接提示认证失败，相同的系统用户(jumpserver中的系统用户就是用于登陆jumpserver后连接机器的用户)，登陆其余机器没有问题
>
> 2、通过跳板机(我们有一台可以免密连接其他机器的跳板机)ssh连接机器，root用户连接特别慢(需要等待10秒左右，但是可以连接)，ubuntu用户无法连接，报错权限拒绝，但是密钥是正确并且存在的！
>
> 3、使用root用户登陆这个机器后，执行 `su - ubuntu` 报错 `Cannot execute /bin/bash: Too many open files in system`



**排查问题的过程**

> 1、切换用户报错 `Cannot execute /bin/bash: Too many open files in system` ，百度后得到的答案大部分是系统文件句柄数打开过多，超出了系统的限制，因此会出现这个问题，不过实际上也确实是服务器上某些程序打开文件句柄书过多了
>
> 2、既然是程序打开文件句柄数过多，那就需要排查一下是哪些程序打开的文件句柄数过多， [关于查看进程打开的文件句柄数和修复方法的文章](https://www.jb51.net/article/97706.htm)，参考文章之后，使用命令 `lsof -n |awk '{print $2}'|sort|uniq -c |sort -nr|more  `查看之后进程打开的句柄数总数和系统设置的对应不上，这里还不太明白





**解决问题的步骤**

切换用户报错 

```sh
$ su - ubuntu
Cannot execute /bin/bash: Too many open files in system
```



查看系统最大文件打开数设置

```sh
$ ulimit -n
102400
```



查看 `/etc/sysctl.conf` 中的 `file-max` 参数值

```sh
$ grep file-max /etc/sysctl.conf 
fs.file-max = 65535
```



修改 `file-max` 值

```sh
fs.file-max = 999999
```



使配置生效

```sh
sysctl -p
```



修改完成后，切换用户可以了，jumpserver中连接用户也可以了



**查看文件句柄数的方法**

```sh
# 第一列是打开文件句柄数量，第二列是进程PID
lsof -n |awk '{print $2}'|sort|uniq -c |sort -nr|more
```



这是当时有问题的这台机器上的输出，但是总数和系统限制对应不上，这一块还不太理解，后续在补充

```sh
lsof -n |awk '{print $2}'|sort|uniq -c |sort -nr|more  
 882820 11323
 462017 11517
   1296 24126
    504 24175
    420 32156
    324 30589
    319 12733
    300 19706
    247 10068
    234 9661
    234 10364
    221 4349
    216 7588
    210 24233
    177 25600
    156 26224
    143 984
    132 20667
    130 31959
    117 1260
    116 988
    105 949
     98 1063
     84 23176
     77 1
     58 25599
     57 15215
     56 5354
     56 25227
     56 24065
     54 25598
     53 11146
     47 386
     38 927
     38 924
     38 6432
     38 424
     38 25099
     38 25096
     38 19422
     38 19416
     37 992
     36 3156
     36 1159
```

