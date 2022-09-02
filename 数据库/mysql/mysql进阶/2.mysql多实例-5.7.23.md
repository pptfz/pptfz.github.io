[toc]



# mysql多实例-5.7.23

# 1.mysql多实例介绍

## 1.1 什么是MySQL多实例

**MySQL多实例就是在一台机器上开启多个不同的服务端口（如：3306,3307），运行多个MySQL服务进程，通过不同的socket监听不同的服务端口来提供各自的服务**



## 1.2 MySQL多实例的特点有以下几点

**1：有效利用服务器资源，当单个服务器资源有剩余时，可以充分利用剩余的资源提供更多的服务**

**2：节约服务器资源**

**3：资源互相抢占问题，当某个服务实例服务并发很高时或者开启慢查询时，会消耗更多的内存、CPU、磁盘IO资源，导致服务器上的其他实例提供服务的质量下降**



## 1.3 部署mysql多实例的两种方式

**第一种是使用多个配置文件启动不同的进程来实现多实例，这种方式的优势逻辑简单，配置简单，缺点是管理起来不太方便**

**第二种是通过官方自带的mysqld_multi使用单独的配置文件来实现多实例，这种方式定制每个实例的配置不太方面，优点是管理起来很方便，集中管理**



## 1.4 同一开发环境下安装两个数据库，必须处理以下问题

- **配置文件安装路径不能相同**
- **数据库目录不能相同**
- **启动脚本不能同名**
- **端口不能相同**
- **socket文件的生成路径不能相同**



# 2.mysql多实例安装路径说明

**mysql安装路径**

**第一个实例：/data/mysql3306**

**第二个实例：/data/mysql3307**

**第三个实例：/data/mysql3308**



# 3.安装部署过程

## 3.1 安装依赖包

```python
yum -y install gcc gcc-c++ autoconf bison-devel ncurses-devel libaio-devel
```



## 3.2 创建mysql用户和组

```python
groupadd mysql && useradd -g mysql -s /sbin/nologin mysql
```



## 3.3 下载mysql-5.7.23二进制包

```python
wget https://downloads.mysql.com/archives/get/file/mysql-5.7.23-linux-glibc2.12-x86_64.tar.gz
```



## 3.4 解压缩并修改目录名称

```python
tar xf mysql-5.7.23-linux-glibc2.12-x86_64.tar.gz && \
mv mysql-5.7.23-linux-glibc2.12-x86_64/ mysql-5.7.23
```



## 3.5 修改目录所有者为mysql

```python
chown -R mysql.mysql mysql-5.7.23
```



## 3.6 创建3个mysql安装目录

```python
mkdir -p /data/mysql330{6..8}
```



## 3.7 将mysql包分别拷贝到3个安装目录

```python
for i in {6..8};do cp -rp mysql-5.7.23  /data/mysql330$i ;done
```



## 3.8 做软连接

```python
for i in {6..8};do ln -s /data/mysql330$i/mysql-5.7.23 /data/mysql330$i/mysql;done
```



## 3.9 编辑配置文件

**basedir、datadir、log-error、port、socket文件位置不同，如果要做主从，serverid要不同**

```python
//备份原有/etc/my.cnf
mv /etc/my.cnf /etc/my.cnf.old

//编辑第一个实例配置文件
cat >/etc/my-3306.cnf<<EOF
[mysqld]
user=mysql 
basedir=/data/mysql3306/mysql
datadir=/data/mysql3306/mysql/data
log-error=/data/mysql3306/mysql/data/error.log
port=3306
socket=/data/mysql3306/mysql/mysql.sock
server_id=3306
EOF

//编辑第二个实例配置文件
cat >/etc/my-3307.cnf<<EOF
[mysqld]
user=mysql 
basedir=/data/mysql3307/mysql
datadir=/data/mysql3307/mysql/data
log-error=/data/mysql3307/mysql/data/error.log
port=3307
socket=/data/mysql3307/mysql/mysql.sock
server_id=3307
EOF


//编辑第三个实例配置文件
cat >/etc/my-3308.cnf<<EOF
[mysqld]
user=mysql 
basedir=/data/mysql3308/mysql
datadir=/data/mysql3308/mysql/data
log-error=/data/mysql3308/mysql/data/error.log
port=3308
socket=/data/mysql3308/mysql/mysql.sock
server_id=3308
EOF
```



## 3.10 拷贝启动脚本

```python
//分别拷贝3个实例启动脚本
for i in {6..8};do cp mysql-5.7.23/support-files/mysql.server /etc/init.d/mysqld330$i ;done

//修改文件
sed -i.bak 's#/usr/local#/data/mysql3306#g' /etc/init.d/mysqld3306 /data/mysql3306/mysql/bin/mysqld_safe

sed -i.bak 's#/usr/local#/data/mysql3307#g' /etc/init.d/mysqld3307 /data/mysql3307/mysql/bin/mysqld_safe

sed -i.bak 's#/usr/local#/data/mysql3308#g' /etc/init.d/mysqld3308 /data/mysql3308/mysql/bin/mysqld_safe
```



## 3.11 初始化mysql

```python
//初始化第一个实例
/data/mysql3306/bin/mysqld --initialize-insecure --user=mysql --basedir=/data/mysql3306 --datadir=/data/mysql3306/data

//初始化第二个实例
/data/mysql3306/bin/mysqld --initialize-insecure --user=mysql --basedir=/data/mysql3306 --datadir=/data/mysql3306/data

//初始化第三个实例
/data/mysql3306/bin/mysqld --initialize-insecure --user=mysql --basedir=/data/mysql3306 --datadir=/data/mysql3306/data
```



## 3.12 添加mysql命令环境变量

```python
//这里只需要导出一个即可
echo "export PATH=/data/mysql3306/mysql/bin:$PATH" > /etc/profile.d/mysql.sh
source /etc/profile
```



## 3.13 配置systemd管理mysql

```python
//配置第一个实例
cat >/etc/systemd/system/mysqld3306.service<<EOF
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/data/mysql3306/mysql/bin/mysqld --defaults-file=/etc/my-3306.cnf
LimitNOFILE = 5000
EOF



//配置第二个实例
cat >/etc/systemd/system/mysqld3307.service<<EOF
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/data/mysql3307/mysql/bin/mysqld --defaults-file=/etc/my-3307.cnf
LimitNOFILE = 5000
EOF


//配置第三个实例
cat >/etc/systemd/system/mysqld3308.service<<EOF
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/data/mysql3308/mysql/bin/mysqld --defaults-file=/etc/my-3308.cnf
LimitNOFILE = 5000e
EOF
```



## 3.14 启动mysql、检查启动

```python
//启动mysql
systemctl start mysqld3306 ; systemctl enable mysqld3306
systemctl start mysqld3307 ; systemctl enable mysqld3307
systemctl start mysqld3308 ; systemctl enable mysqld3308

//检查启动
netstat -ntpl|grep 330*
tcp6       0      0 :::3306                 :::*                    LISTEN      16413/mysqld        
tcp6       0      0 :::3307                 :::*                    LISTEN      16422/mysqld        
tcp6       0      0 :::3308                 :::*                    LISTEN      16463/mysqld 
```



## 3.15 进入mysql，设置密码

```python
//设置第一个实例密码
mysql -S /data/mysql3306/mysql/mysql.sock
mysql> set password=password('3306');
mysql> flush privileges;

//设置第二个实例密码
mysql -S /data/mysql3307/mysql/mysql.sock
mysql> set password=password('3307');
mysql> flush privileges;

//设置第三个实例密码
mysql -S /data/mysql3308/mysql/mysql.sock
mysql> set password=password('3308');
mysql> flush privileges;
```



## 3.16 设置快捷登陆

```python
//原有登陆方式，需要指定mysql用户名密码和套接字文件
mysql -uroot -p3306 -S /data/mysql3306/mysql/mysql.sock

设置快捷登陆
//设置第一个实例
cat >/usr/bin/mysql3306<<EOF
mysql -uroot -p3306 -S /data/mysql3306/mysql/mysql.sock
EOF

//设置第二个实例
cat >/usr/bin/mysql3307<<EOF
mysql -uroot -p3307 -S /data/mysql3307/mysql/mysql.sock
EOF

//设置第三个实例
cat >/usr/bin/mysql3308<<EOF
mysql -uroot -p3308 -S /data/mysql3308/mysql/mysql.sock
EOF


//赋予执行权限
chmod +x /usr/bin/mysql330*

//快捷登陆
输入mysql3306即可登陆
```



<h3 style={{color: 'red'}}>到此，mysql多实例配置完成！！！</h3>





# 扩展：基于以上多实例实现mysql主从复制

**3306为主**

**3307、3308为从**

# 1.编辑主库3306（master）配置文件/etc/my-3306.cnf

```python
vim /etc/my-3306.cnf		#[mysqld]下方增加以下3行
server_id=3306
log_bin=binlog                                          
log_bin_index=binlog.index

//重启mysql
systemctl restart mysqld3306
```



# 2.创建专用复制用户

```python
mysql3306
mysql> grant replication slave on *.* to 'backup'@'10.0.0.%' identified by '3306';
Query OK, 0 rows affected (0.01 sec)
```



# 3.查看master状态

```python
mysql> show master status;
+---------------+----------+--------------+------------------+-------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+---------------+----------+--------------+------------------+-------------------+
| binlog.000001 |      327 |              |                  |                   |
+---------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```



# 4.编辑从库配置文件

```python
//编辑3307配置文件
[root@mysql ~]# vim /etc/my-3307.cnf			#[mysqld]下方增加以下3行
server_id=3307
relay_log=/data/mysql3307/mysql/relay_log			
relay_log_index=/data/mysql3307/mysql/relay_log.index

//编辑3308配置文件
[root@mysql ~]# vim /etc/my-3308.cnf			#[mysqld]下方增加以下3行
server_id=3308
relay_log=/data/mysql3308/mysql/relay_log
relay_log_index=/data/mysql3308/mysql/relay_log.index

//重启mysql
[root@mysql ~]# systemctl restart mysqld3307 && systemctl restart mysqld3308
```



# 5.设置slave从master拉取binlog及拉取的位置

```python
//3307
mysql> change master to master_host='10.0.0.55',master_port=3306,master_user='backup',master_password='123',master_log_file='binlog.000001',master_log_pos=327;
Query OK, 0 rows affected, 2 warnings (0.06 sec)

//启动slave
mysql> start slave;
Query OK, 0 rows affected (0.01 sec)

//查看slave状态
mysql> show slave status\G			#IO线程和SQL线程都必须为YES
Slave_IO_Running: Yes
Slave_SQL_Running: Yes

------------------------------------------------------------------------------  

//3308
mysql> change master to master_host='10.0.0.55',master_port=3306,master_user='backup',master_password='123',master_log_file='binlog.000001',master_log_pos=327;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

//启动slave
mysql> start slave;
Query OK, 0 rows affected (0.00 sec)

//查看slave状态
mysql> show slave status\G			#IO线程和SQL线程都必须为YES
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```



# 6.验证，在3306中创建一个数据库，看3307和3308是否会同步

```python
//3306中创建一个数据库
mysql> create database bxb;
Query OK, 1 row affected (0.00 sec)
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB3306             |
| bxb                |
| mysql              |
| performance_schema |
| test               |
+--------------------+
6 rows in set (0.00 sec)

//3307中查看数据库
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB3307             |
| bxb                |
| mysql              |
| performance_schema |
| test               |
+--------------------+
6 rows in set (0.00 sec)

//3308中查看数据库
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB3308             |
| bxb                |
| mysql              |
| performance_schema |
| test               |
+--------------------+
6 rows in set (0.01 sec)
```



<h3 style={{color: 'red'}}>到此，mysql基于多实例实现主从复制完成！！！</h3>



**实验过程中遇到的错误**

**在3308（第二个实例）上启动slave报错**

```python
//启动slave报错，从存储库初始化中继日志信息结构失败
mysql> start slave;
ERROR 1872 (HY000): Slave failed to initialize relay log info structure from the repository

解决方法：先重置slave,然后停止slvae再重新change master
mysql> reset slave all;
Query OK, 0 rows affected (0.02 sec)
mysql> stop slave;
```

