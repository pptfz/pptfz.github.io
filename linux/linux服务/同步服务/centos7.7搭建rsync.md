# centos7.7搭建rsync

# rsync基本概述

**rsync是一款开源的备份工具，可以在不同主机之间进行同步，可实现全量备份与增量备份，保持链接和权限，且采用优化的同步算法，传输前执行压缩，因此非常适合用于架构集中式备份或异地备份等应用。**

> [rsync官网](https://rsync.samba.org/)
>
> rsync监听端口：tcp/873
>
> rsync运行模式：C/S



- **rsync备份方式**
  - **1.完全备份(效率低、占用空间)**
  - **2.增量备份(提高备份效率,节省空间, 适合异地备份)**
  - **3.差异备份**

- **rsync关于数据同步的两种方式**
  - **推：一台主机负责把数据推送至其他主机，服务器开销大(适合推送少量主机)**
  - **拉：所有主机定时去找一主机拉数据。可能会导致数据同步缓慢**

- **rsync传输模式**
  - **本地方式**	
  - **远程方式**
  - **守护进程方式**



**rsync命令选项**

> -a		归档模式传输, 等于-tropgDl 
>
> -v		详细模式输出, 打印速率, 文件数量等 
>
> -z		传输时进行压缩以提高效率 
>
> -r		递归传输目录及子目录，即目录下的所有目录都同样传输 
>
> -t		保持文件时间信息 
>
> -o		保持文件属主信息 
>
> -p		保持文件权限 
>
> -g		保持文件属组信息 
>
> -l		保留软连接 
>
> -P		显示同步的过程及传输时的进度等信息 
>
> -D		保持设备文件信息 
>
> -L		保留软连接指向的目标文件 
>
> -e		使用的信道协议,指定替代rsh的shell程序 
>
> --exclude=PATTERN		指定排除不需要传输的文件模式 
>
> --exclude-from=file		文件名所在的目录文件 
>
> --bwlimit=100				  限速传输 
>
> --partial							断点续传 
>
> --delete							让目标目录和源目录数据保持一致



**rsync传输示例**

- 本地传输

  ```python
  rsync  选项  源文件或目录  目标路径
  
  例：将/etc/passwd文件同步到/opt
  rsync  -avz  /etc/passwd  /opt
  ```

  

- 远程传输

  ```python
  #推传输
  rsync  选项  源文件或目录  远程主机目标路径
  
  例：将本机/etc/passwd同步到另一台主机的/opt
  rsync  -zav  /etc/passwd  root@10.0.0.10:/opt
  
  
  #拉传输
  rsync  选项  远程主机源文件或目录  本地路径
  
  例：将远程主机的/etc/passwd同步到本地/opt
  rsync  -avz  root@10.0.0.10:/etc/passwd  /opt
  
  ```

  



---



**试验环境**

| 角色         | IP        | 主机名       |
| ------------ | --------- | ------------ |
| rsync server | 10.0.0.10 | rsync-server |
| rsync client | 10.0.0.11 | rsync-client |

**实验过程**

# rsync服务端操作  

## 1.安装rsync

```python
yum -y install rsync
```



## 2.编辑rsync配置文件

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
timeout = 600							# 超时时间
ignore errors							# 忽略错误信息
read only = false					# 对备份数据可读写
list = false							# 不允许查看模块信息
hosts allow = 10.0.0.0/24			# 允许某个IP或网段访问，*表示允许所有
hosts deny = 0.0.0.0/32				# 拒绝某个网段或IP访问，*表示拒绝所有
auth users = rsync_backup			# 定义虚拟用户，作为连接认证用户
secrets file = /etc/rsync.password	# 定义rsync服务用户连接认证密码文件路径

##局部模块
[backup]							# 定义模块信息
comment = commit			# 模块注释信息
path = /backup				# 定义接收备份数据目录
```



## 3.建立rsync用户及相关目录

```python
#创建rsync用户
useradd -M -s /sbin/nologin rsync

#创建真正的共享目录并修改目录所有者为rsync
mkdir /backup && chown rsync.rsync /backup

```



## 4.创建用户密码文件

**⚠️<span style=color:red>用户密码文件权限必须为600！！！</span>**

```python
#创建密码文件，密码文件要与/etc/rsyncd.conf中"secrets file = /etc/rsync.passwor"相同
echo "rsync_backup:1" > /etc/rsync.password 

#修改密码文件权限，必须为600！！！
chmod 600 /etc/rsync.password

```



## 5.启动rsync并加入开机自启

```python
systemctl start rsyncd && systemctl enable rsyncd

```



# rsync客户端操作

## 安装rsync、启动

```python
yum -y install rsync
systemctl start rsyncd && systemctl enable rsyncd

```





## 测试一、客户端推送及拉取不需要输入密码

**⚠️<span style=color:red>客户端使用``--password-file=``选项时，密码文件的权限必须为600！！！</span>**

```python
#拉取语法
    rsync -avz 用户@IP::共享名称 本机文件|目录
      
#推送语法
    rsync -avz 本机文件|目录 用户@IP::共享名称

方法一：
在客户端/etc/rsync.password(文件随意)中写入服务端密码文件/etc/rsync.password中的密码
rsync拉取或推送时加选项--password-file=

⚠️这里的密码文件权限必须为600！！！
$ echo 1 > /etc/rsync.password && chmod 600 /etc/rsync.password
$ rsync -avz rsync_backup@10.0.0.10::backup . --password-file=/etc/rsync.password
receiving incremental file list
./
1.txt
2.txt
3.txt
4.txt
5.txt

sent 126 bytes  received 317 bytes  295.33 bytes/sec
total size is 0  speedup is 0.00


###############################################################

方法二：
在客户端中导出变量，变量名必须为RSYNC_PASSWORD
$ export RSYNC_PASSWORD=1
$ rsync -avz rsync_backup@10.0.0.10::backup . 
receiving incremental file list
./
1.txt
2.txt
3.txt
4.txt
5.txt

sent 126 bytes  received 317 bytes  80.55 bytes/sec
total size is 0  speedup is 0.00
```



## 测试二、实现数据无差异同步		--delete选项     此选项非常危险，生产环境不要使用！！！

**⚠️<span style=color:red>生产环境千万不要使用``--delete``选项</span>**

```python
服务端   10.0.0.10
客户端   10.0.0.11


1.查看文件
服务端文件
[root@rsync-server backup]# ls
1.txt  2.txt  3.txt  4.txt  5.txt

客户端文件
[root@rsync-client backup]# ls
1.txt  2.txt  3.txt  4.txt  5.txt

2.删除服务端1.txt
[root@rsync-server backup]# rm -rf 1.txt 
[root@rsync-server backup]# ls
2.txt  3.txt  4.txt  5.txt

3.不加--delete参数再次同步，可以看到客户端文件没有变化，但是服务端没有1.txt
[root@rsync-client backup]# rsync -avz rsync_backup@10.0.0.10::backup . 
receiving incremental file list
./

sent 27 bytes  received 127 bytes  308.00 bytes/sec
total size is 0  speedup is 0.00
[root@rsync-client backup]# ls
1.txt  2.txt  3.txt  4.txt  5.txt

4.加--delete参数再次同步，可以看到，客户端同步服务端全部文件，删除1.txt
[root@rsync-client backup]# rsync -avz --delete rsync_backup@10.0.0.10::backup . 
receiving incremental file list
deleting 1.txt

sent 24 bytes  received 120 bytes  96.00 bytes/sec
total size is 0  speedup is 0.00
[root@test1 backup]# ls
2.txt  3.txt  4.txt  5.txt
```

