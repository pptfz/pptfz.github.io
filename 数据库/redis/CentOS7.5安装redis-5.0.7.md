[toc]



# CentOS7.5安装redis-5.0.7

[redis官网](https://redis.io/)

[官网下载地址](https://redis.io/download)



## 1.下载redis

```python
wget http://download.redis.io/releases/redis-5.0.7.tar.gz
```



## 2.编译安装redis

```python
//将下载的redis包解压到/usr/local
tar xf redis-5.0.7.tar.gz -C /usr/local

//进入解压后的redis目录进行编译安装
cd /usr/local/redis-5.0.7 
make

//添加环境变量
cat >/etc/profile.d/redis.sh <<'EOF'
export PATH="/usr/local/redis-5.0.7/src:$PATH"
EOF

//使添加的环境变量生效
source /etc/profile
```



## 3.配置redis

```python
//创建redis工作目录
mkdir -p /etc/redis/6379
mkdir -p /var/log/redis/6379
mkdir -p /var/run/redis/6379

//创建redis配置文件
cat >/etc/redis/6379/redis.conf<<EOF
#守护进程模式启动
daemonize yes
port 6379
logfile /var/log/redis/6379/redis.log

#持久化数据文件存储位置
dir /etc/redis/6379
#RDB持久化数据文件名称
dbfilename dump.rdb
EOF
```





## 4.使用systemd管理redis

```python
⚠️#使用redis二进制命令启动redis
/usr/local/redis-5.0.7/src/redis-server &

//编辑文件
cat >/usr/lib/systemd/system/redis.service<<'EOF'
[Unit]
Description=Redis
After=network.target
 
[Service]
#Type=forking
PIDFile=/var/run/redis/redis_6379.pid
ExecStart=/usr/local/redis-5.0.7/src/redis-server /etc/redis/6379/redis.conf 
ExecReload=/bin/kill -s HUP 
ExecStop=/usr/local/redis-5.0.7/src/redis-cli -p 6379 shutdown
PrivateTmp=true
 
[Install]
WantedBy=multi-user.target
EOF

//重载系统服务
systemctl daemon-reload

//启动redis
systemctl enable redis && systemctl start redis
```



**这边并没有使用 `ExecStop=/bin/kill -s QUIT $MAINPID` 这样的命令来停止redis, 因为使用这个语句在运行`systemctl stop redis`后, redis并未执行关闭动作, 而是直接退出. 这时候用 `systemctl status redis` 查看状态是failed. 只有用`ExecStop=/install_path/bin/redis-cli -p 16379 shutdown` 才能正确停止redis**





## 5.使用systemd管理redis遇到的问题

**问题一：重载系统服务后启动redis卡住不动**

**解决方法**

> **注释/usr/lib/systemd/system/redis.service``Type=forking``一项**



**网上解释原因**

> **If set to forking, it is expected that the process configured with ExecStart= will call fork() as part of its start-up. The parent process is expected to exit when start-up is complete and all communication channels are set up. The child continues to run as the main daemon process. This is the behavior of traditional UNIX daemons. If this setting is used, it is recommended to also use the PIDFile= option, so that systemd can identify the main process of the daemon. systemd will proceed with starting follow-up units as soon as the parent process exits.**
>
> **如果设置为fork，则使用ExecStart=配置的进程将调用fork()作为启动的一部分。启动完成并设置好所有通信通道后，父进程将退出。子进程继续作为主守护进程运行。这是传统UNIX守护进程的行为。如果使用了该设置，建议还使用PIDFile=选项，以便systemd能够识别守护进程的主进程。一旦父进程退出，systemd将开始启动后续单元。**





**问题二：pid原先路径为/var/run/redis_6379.pid，报错Failed at step EXEC spawning /usr/local/redis-5.0.7/src: Permission denied**



**解决方法：**

> **将pid路径改为/var/run/redis/redis_6379.pid就可以了，原因未知**



## 6.redis安全配置

**protected-mode	保护模式，是否只允许本地访问，默认是yes**

```shell
protected-mode no
```



**bind	指定IP进行监听**

```shell
bind 127.0.0.1
```



**requirepass	增加密码**

```shell
requirepass 1


#连接方式1
$ redis-cli
127.0.0.1:6379> set name xiaoming
(error) NOAUTH Authentication required.
127.0.0.1:6379> AUTH 1
OK
127.0.0.1:6379> set name xiaoming
OK

#连接方式2
$ redis-cli -a 1
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> set name xiaoliang
OK
```

