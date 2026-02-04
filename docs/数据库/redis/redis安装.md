[toc]



# redis安装

[redis官网](https://redis.io/)

[redis所有版本下载地址](https://download.redis.io/releases/?_gl=1*xrte9y*_gcl_au*OTIxMzUxNDczLjE3MjMyMDMzNjA.)





## docker安装

[redis docker hub](https://hub.docker.com/_/redis)



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v /data/docker-volume/redis/data:/data \
  -v /data/docker-volume/redis/conf/redis.conf:/usr/local/etc/redis/redis.conf \
  redis:8 \
  redis-server /usr/local/etc/redis/redis.conf
```

  </TabItem>
  <TabItem value="compose" label="compose">

```shell
cat > docker-compose.yml << EOF
services:
  redis:
    image: redis:8
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: >
      redis-server /usr/local/etc/redis/redis.conf
EOF
```

  </TabItem>
</Tabs>





## 源码安装

### 下载源码包

```shell
export REDIS_VERSION=8.2.3
wget http://download.redis.io/releases/redis-${REDIS_VERSION}.tar.gz
```



### 解压缩包

```shell
tar xf redis-${REDIS_VERSION}.tar.gz -C /usr/local
```



### 编译安装

```shell
cd /usr/local/redis-${REDIS_VERSION}
make
```



### 添加环境变量

```shell
cat > /etc/profile.d/redis.sh << EOF
export PATH="/usr/local/redis-${REDIS_VERSION}/src:$PATH"
EOF
source /etc/profile
```



### 创建相关目录

```shell
mkdir -p /etc/redis/6379
mkdir -p /var/log/redis/6379
mkdir -p /var/run/redis/6379
```



### 创建redis配置文件

```shell
cat > /etc/redis/6379/redis.conf << EOF
# 是否守护进程模式启动
daemonize no

# 使用 systemd 监管
supervised systemd

# 端口 日志 pid文件
port 6379
logfile /var/log/redis/6379/redis.log
pidfile /var/run/redis/redis_6379.pid

# 持久化数据文件存储位置
dir /etc/redis/6379

# RDB持久化数据文件名称
dbfilename dump.rdb
EOF
```





### 使用systemd管理redis

:::tip 说明

这边并没有使用 `ExecStop=/bin/kill -s QUIT $MAINPID` 这样的命令来停止redis，因为使用这个语句在运行 `systemctl stop redis`后，redis并未执行关闭动作，而是直接退出，这时候用 `systemctl status redis` 查看状态是failed，只有用 `ExecStop=/install_path/bin/redis-cli -p 6379 shutdown` 才能正确停止redis

:::



```shell
cat > /usr/lib/systemd/system/redis.service << EOF
[Unit]
Description=Redis
After=network.target
 
[Service]
# Type=forking
PIDFile=/var/run/redis/redis_6379.pid
ExecStart=/usr/local/redis-${REDIS_VERSION}/src/redis-server /etc/redis/6379/redis.conf 
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/usr/local/redis-${REDIS_VERSION}/src/redis-cli -p 6379 shutdown
PrivateTmp=true
 
[Install]
WantedBy=multi-user.target
EOF
```



### 启动redis

```shell
# 重载系统服务
systemctl daemon-reload

# 启动redis
systemctl enable redis && systemctl start redis
```



### 使用systemd管理redis遇到的问题

#### 重载系统服务后启动redis卡住不动

解决方法

注释 `/usr/lib/systemd/system/redis.service` 文件中 `Type=forking` 一项



网上解释原因

> **If set to forking, it is expected that the process configured with ExecStart= will call fork() as part of its start-up. The parent process is expected to exit when start-up is complete and all communication channels are set up. The child continues to run as the main daemon process. This is the behavior of traditional UNIX daemons. If this setting is used, it is recommended to also use the PIDFile= option, so that systemd can identify the main process of the daemon. systemd will proceed with starting follow-up units as soon as the parent process exits.**
>
> **如果设置为fork，则使用ExecStart=配置的进程将调用fork()作为启动的一部分。启动完成并设置好所有通信通道后，父进程将退出。子进程继续作为主守护进程运行。这是传统UNIX守护进程的行为。如果使用了该设置，建议还使用PIDFile=选项，以便systemd能够识别守护进程的主进程。一旦父进程退出，systemd将开始启动后续单元。**





### redis安全配置

`protected-mode`

:::tip 说明

保护模式，是否只允许本地访问，默认是 `yes`

:::

```shell
protected-mode no
```



`bind`

:::tip 说明

指定IP进行监听

::;

```shell
bind 127.0.0.1
```



`requirepass`

:::tip 说明

增加密码

:::

```shell
requirepass 1

# 连接方式1
$ redis-cli
127.0.0.1:6379> set name xiaoming
(error) NOAUTH Authentication required.
127.0.0.1:6379> AUTH 1
OK
127.0.0.1:6379> set name xiaoming
OK

# 连接方式2
$ redis-cli -a 1
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> set name xiaoliang
OK
```

