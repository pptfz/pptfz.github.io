# centos7.7搭建lsyncd

[lsyncd官网](https://axkibe.github.io/lsyncd/)

[lsyncd github地址](https://github.com/axkibe/lsyncd)



**lsyncd简介**

> Lsyncd使用文件系统事件接口（inotify或fsevents）来监视本地文件和目录的更改。Lsyncd整理这些事件几秒钟，然后生成一个或多个进程以将更改同步到远程文件系统。默认的同步方法是[rsync](http://rsync.samba.org/)。因此，Lsyncd是一种轻型的实时镜像解决方案。Lsyncd相对易于安装，并且不需要新的文件系统或块设备。Lysncd不会妨碍本地文件系统的性能。
>
> 作为rsync的替代方法，Lsyncd还可以通过rsync + ssh推送更改。当文件或目录被重命名或移动到本地树中的新位置时，Rsync + ssh允许更高效的同步。（相反，普通rsync通过删除旧文件然后重新传输整个文件来执行移动。）
>
> 细粒度的定制可以通过配置文件来实现。自定义操作配置甚至可以从头开始写在层叠的层次上，从外壳脚本到用[Lua语言](http://www.lua.org/)编写的代码。因此，简单，强大和灵活的配置是可能的。
>
> Lsyncd 2.2.1在所有源计算机和目标计算机上都要求rsync> = 3.1。



**lsyncd同步流程**

- **服务器A中部署rsync客户端+lsyncd，lsyncd通过内核的inotify触发机制监控文件的动向，并将改动发送给rsync，由rsync同步到服务器B；服务器B以守护进程的方式部署rsync服务端，接收A发来的文件同步请求，并将文件同步！**

- **部署lsyncd端的服务器的角色为客户端**



**试验环境**

| 角色          | IP        | 主机名        | 安装服务      |
| ------------- | --------- | ------------- | ------------- |
| lsyncd server | 10.0.0.10 | lsyncd-server | rsync         |
| lsyncd client | 10.0.0.11 | lsyncd-client | rsync、lsyncd |





## 服务端操作

### 1.安装rsync

```python
yum -y install rsync
```



### 2.编辑rsync配置文件

```python
#备份原有文件
cp /etc/rsyncd.conf{,.bak}

#编辑rsync配置文件
cat  >/etc/rsyncd.conf <<EOF
uid = rsync
gid = rsync
port = 873
fake super = yes
use chroot = no
max connections = 200
timeout = 600
ignore errors
read only = false
list = false
hosts allow = 10.0.0.0/24
hosts deny = 0.0.0.0/32
auth users = rsync_backup
secrets file = /etc/rsync.password
log file = /var/log/rsyncd.log
#####################################
[backup]
comment = welcome to edu backup!
path = /backup
EOF


#rsync配置文件参数说明
# 全局模块
uid = rsync						    # 运行进程的用户
gid = rsync						    # 运行进程的用户组
port = 873						    # 监听端口
use chroot = no					  # 关闭假根功能
max connections = 200			# 最大连接数
timeout = 600						  # 超时时间
ignore errors						  # 忽略错误信息
read only = false					# 对备份数据可读写
list = false						  # 不允许查看模块信息
hosts allow = 10.0.0.0/24			# 允许某个IP或网段访问，*表示允许所有
hosts deny = 0.0.0.0/32				# 拒绝某个网段或IP访问，*表示拒绝所有
auth users = rsync_backup			# 定义虚拟用户，作为连接认证用户
secrets file = /etc/rsync.password	# 定义rsync服务用户连接认证密码文件路径

# 局部模块
[backup]							# 定义模块信息
comment = commit			# 模块注释信息
path = /backup				# 定义接收备份数据目录
```



### 3.建立rsync用户及共享目录

```python
#创建rsync用户
useradd -M -s /sbin/nologin rsync

#创建真正的共享目录并修改目录所有者为rsync
mkdir /backup && chown rsync.rsync /backup

```



### 4.创建用户密码文件

⚠️**<span style=color:red>用户密码文件权限必须为600！！！</span>**

```python
#创建密码文件，密码文件要与/etc/rsyncd.conf中"secrets file = /etc/rsync.password"相同
echo "rsync_backup:1" > /etc/rsync.password 

#修改密码文件权限，必须为600！！！
chmod 600 /etc/rsync.password

```



## 5.启动rsync并加入开机自启

```python
systemctl start rsyncd && systemctl enable rsyncd

```





## 客户端操作

### 1.安装lsyncd、rsync

```python
#安装lsyncd需要epel仓库
yum install -y epel-release

#安装lsyncd、rsync
yum -y install lsyncd rsync

#查看版本
$ rpm -qa lsyncd
lsyncd-2.2.2-1.el7.x86_64

$ rpm -qa rsync
rsync-3.1.2-6.el7_6.1.x86_64
```



### 2.配置lsyncd

**lsyncd配置文件``/etc/lsyncd.conf``原先内容如下，``--``标示注释**

```python
----
-- User configuration file for lsyncd.
--
-- Simple example for default rsync, but executing moves through on the target.
--
-- For more examples, see /usr/share/doc/lsyncd*/examples/
-- 
sync{default.rsyncssh, source="/var/www/html", host="localhost", targetdir="/tmp/htmlcopy/"}
```



<h3 style=color:red>同步一台机器(密码文件方式)</h3>

**编辑``/etc/lsyncd.conf``**

**⚠️<span style=color:red>``--delete = true``这个选项千万不要在生产环境中使用！！！</span>**

```python
#备份文件
cp /etc/lsyncd.conf{,.bak}

#编辑文件
cat >/etc/lsyncd.conf <<EOF
settings {
    logfile = "/var/log/lsyncd/lsyncd.log",
    statusFile = "/var/log/lsyncd/lsyncd.status",
    inotifyMode = "CloseWrite",
    maxProcesses = 8,
    maxDelays = 1,
    nodaemon = false,
}
sync {
    default.rsync,
    source = "/backup", --监控目录
    target = "rsync_backup@10.0.0.10::backup", --rsync的认证用户名、IP、模块
    --delete = true,
    exclude = {
        '.**',
        '.git/**',
        '*.bak',
        '*.tmp',
        'runtime/**',
        'cache/**'
    },
    rsync = {
        binary = "/usr/bin/rsync", --rsync可执行文件路径， 必须为绝对路径
        password_file = "/etc/rsync.password", --密码认证文件
        archive = true,
        compress = false,
        verbose = false,
        _extra = {
            "--bwlimit=200",
            "--omit-link-times"
        }
    }
}
EOF



#参数说明
settings为全局配置，部分参数如下：
	logfile：日志文件路径
	statusFile：进程路径
	insist：继续运行，即使有失败的目标。
	statusInterval：多少秒写入文件，默认是10s
	
  
sync为同步配置，部分参数如下：
	source：本地文件目录
	host：远程服务器地址
	targetdir：远程目标目录
	port：目前主机SSH端口号，默认为22
```





<h3 style=color:red>同步多台机器(密码文件方式)</h3>

**以上为仅同步一台机器，如果需要同步到多台机器，只需要在加几个``sync{xxx}``配置即可，同时需要注意的是如果采用密码文件的方式，则每一个sync标签中都必须包含rsync标签，用来指定密码文件**

官方说明

![iShot2020-04-0516.36.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0516.36.55.png)

```python
#在/etc/lsyncd.conf配置文件中多加几个sync标签即为同步到多台机器，需要注意的是，如果采用密码文件的方式，则每一个sync标签中都必须包含一个rsync标签，用来指定密码文件


sync {
    default.rsync,
    source = "/backup", --监控目录
    target = "rsync_backup@10.0.0.134::backup",
    rsync = {
        binary = "/usr/bin/rsync", --rsync可执行文件路径， 必须为绝对路径
        password_file = "/etc/rsync.password",--密码认证文件
        archive = true,
        compress = false,
        verbose = false,
        _extra = {
            "--bwlimit=200",
            "--omit-link-times"
        }
    }
}

sync {
    default.rsync,
    source = "/backup", --监控目录
    target = "rsync_backup@10.0.0.130::backup", --rsync的认证用户名、IP、模块
    --delete = true,
    exclude = {
        '.**',
        '.git/**',
        '*.bak',
        '*.tmp',
        'runtime/**',
        'cache/**'
    },
    rsync = {
        binary = "/usr/bin/rsync", --rsync可执行文件路径， 必须为绝对路径
        password_file = "/etc/rsync.password",--密码认证文件
        archive = true,
        compress = false,
        verbose = false,
        _extra = {
            "--bwlimit=200",
            "--omit-link-times"
        }
    }
}
```

[官方说明文档(同步到多台机器)](https://axkibe.github.io/lsyncd/manual/config/layer4/)



<h3 style=color:red>使用ssh免密方式同步(非密码文件方式)</h3>

官方配置文件示意图

![iShot2020-04-0522.18.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-04-0522.18.09.png)



**主机之间先做ssh免密登陆**

```python
#生成密钥，默认rsa加密类型，长度2048  -b指定长度  -t指定加密类型
$ ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:hV+uhg4hRTGHy3U3891ANGojAeAYmu2rA9E316XaBkc root@k8s-node1
The key's randomart image is:
+---[RSA 2048]----+
|    . =+o..  o+  |
|   + =.oE.o.+... |
| .o o.o=.+o.=+ o.|
|. ..o.= +o = .. o|
| . .oo.=S . .    |
|.    o..o. .     |
| .  . ... o      |
|  ..   o .       |
|  ..    .        |
+----[SHA256]-----+


#拷贝公钥到其他需要同步到主机
ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.0.0.11
```



**使用ssh免密方式的lsyncd配置文件如下，如需同步到多台主机，则和之前使用密码文件同步方式都相同，都是增加多个sync标签**

```python
settings {
    logfile = "/var/log/lsyncd/lsyncd.log",
    statusFile = "/var/log/lsyncd/lsyncd.status",
    inotifyMode = "CloseWrite",
    maxProcesses = 1,
    maxDelays = 1,
    nodaemon = false,
}

sync {
    default.rsyncssh,
    source = "/backup", --监控目录
    host = "10.0.0.130", --同步远程主机IP
    targetdir = "/backup", --同步远程主机目录
    rsync = {
        archive = true,
        compress = false,
        verbose = false,
        _extra = {
            "--bwlimit=200",
            "--omit-link-times"
        }
    },
    ssh = {
        port = 22
    }
}

sync {
    default.rsyncssh,
    source = "/backup", --监控目录
    host = "10.0.0.134", --同步远程主机IP
    targetdir = "/backup", --同步远程主机目录
    --delete = true,
    exclude = {
        '.**',
        '.git/**',
        '*.bak',
        '*.tmp',
        'runtime/**',
        'cache/**'
    },
    rsync = {
        archive = true,
        compress = false,
        verbose = false,
        _extra = {
            "--bwlimit=200",
            "--omit-link-times"
        }
    },
    ssh = {
        port = 22
    }
}
```

**还是使用``lsyncd --nodaemon /etc/lsyncd.conf``启动查看是否报错，如果不报错则使用systemctl启动lsyncd即可**



### 3.创建用户认证密码文件及共享目录

⚠️**<span style=color:red>密码文件权限必须为600！！！</span>**

```python
#创建用户认证密码文件
echo 1 > /etc/rsync.password

#修改文件权限，必须为600！！！
chmod 600 /etc/rsync.password

#创建rsync用户，与rsync服务端共享目录权限相同
useradd -M -s /sbin/nologin rsync

#创建共享目录
mkdir /backup && chown rsync.rsync /backup

```



### 4.启动lsyncd

```python
#先使用如下命令启动看是否报错，如果不报错则ctrl+c停止然后用systemctl启动lsyncd
$ lsyncd -nodaemon /etc/lsyncd.conf
16:31:18 Normal: --- Startup ---
16:31:18 Normal: recursive startup rsync: /backup/ -> rsync_backup@10.0.0.10::backup/ excluding
.git/**
runtime/**
.**
*.tmp
cache/**
*.bak
16:31:18 Normal: Startup of /backup/ -> rsync_backup@10.0.0.10::backup/ finished.


#systemctl启动
systemcl start lsyncd && systemctl enable lsyncd

```



### 5.验证

> 启动lsyncd服务后，在lsyncd本地创建文件，然后到另外同步的机器目录查看是否同步文件即可





## lsyncd密码文件方式与ssh免密方式配置文件需要注意的地方

**密码文件方式**

```python
sync {
    default.rsync,
    source = "/backup", --监控目录
    target = "rsync_backup@10.0.0.10::backup", --rsync的认证用户名、IP、模块
    rsync = {
        binary = "/usr/bin/rsync", --rsync可执行文件路径， 必须为绝对路径
        password_file = "/etc/rsync.password", --密码认证文件
    }
}
```



**ssh免密方式**

```python
sync {
    default.rsyncssh,
    source = "/backup", --监控目录
    host = "10.0.0.134", --同步远程主机IP
    targetdir = "/backup", --同步远程主机目录
    rsync = {
        archive = true,
        compress = false,
        verbose = false
    },
    ssh = {
        port = 22
    }
}
```



- **不同点一**
  - **密码文件方式中``sync``标签中是``default.rsync``**
  - **ssh免密方式中``sync``标签中是``default.rsyncssh``**

- **不同点二**
  - **密码文件方式中``sync``标签中的``target``用于指定rsync的认证用户名、IP、模块**
  - **ssh免密方式中``sync``标签中则用到了``host(指定同步远程主机IP)``和``targetdir(指定同步远程主机目录)``**

- **不同点三**
  - **密码文件方式中``sync``标签中的``rsync``标签下用到了``binary(指定rsync命令绝对路径)``和``password_file(密码认证文件)``**
  - **ssh免密方式中``sync``标签中的``rsync``标签下不需要指定其他标注信息**



[详细配置看官网吧，写的非常清楚](https://axkibe.github.io/lsyncd/)