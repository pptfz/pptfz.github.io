[toc]



# mysql普通主从复制

## 1.mysql主从复制过程

1.master开启binlog（二进制）日志、授权slave复制用户，slave开启relay-log（中继）日志

2.slave IO线程会通过在master上已经授权的复制用户权限请求连接master服务器，带着change master to信息（user、host、password、binlog、binlog_pos、port）去问master dump线程有没有slave指定的binlog、binlog_pos,有则拉取binlog

2.slave IO线程会通过在master上已经授权的复制用户权限请求连接master服务器，带着change master to信息（user、host、password、binlog、binlog_pos、port）去问master dump线程有没有slave指定的binlog、binlog_pos,有则拉取binlog

4.SQL线程会从relay-log中读取binlog解析成sql语句执行，同时会把上一次读取的relay-log位置记录到relay-log.info，以便于下一次读取的时候知道从什么位置读取，因为SQL线程从relay-log中读取binlog并不是一次全部读完的



![iShot2022-03-27_16.48.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-03-27_16.48.07.png)



**官方示意图**

![iShot2022-03-27_16.49.26](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-03-27_16.49.26.png)



## 2.实验环境

| 角色   | IP         | 主机名 | mysql版本 |
| ------ | ---------- | ------ | --------- |
| master | 10.0.0.100 | db01   | 5.7.22    |
| slave  | 10.0.0.101 | db02   | 5.7.22    |



## 3.实验过程

<h3 style={{color: 'hotpink'}}>master10.0.0.100操作</h3>

### 1.master编辑/etc/my.cnf，指定serverid，并开启binlog和binlog索引

```python
[root@db01 ~]# vim /etc/my.cnf		#在[mysqld]下方写入以下3行
server_id=1						    #指定serverid，越小优先级越大
log_bin=binlog						#开启binlog日志
log_bin_index=binlog.index			#开启binlog日志索引

#重启mysql
[root@db01 ~]# systemctl restart mysqld
```



### 2.创建专用复制用户，允许从slave上连接过来的复制用户

```python
mysql> grant replication slave on *.* to backup@'10.0.0.%' identified by '123';
```



### 3.查看master当前的binlog日志及位置信息

```python
mysql> show master status;
+---------------+----------+--------------+------------------+-------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+---------------+----------+--------------+------------------+-------------------+
| binlog.000001 |      154 |              |                  |                   |
+---------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

---

<h3 style={{color: 'green'}}>slave10.0.0.101操作</h3>

### 1.slave编辑配置文件/etc/my.cnf，指定serverid，并开启中继日志

```python
[root@db02 ~]# vim /etc/my.cnf				    #在[mysqld]下放写入以下3行
server_id=2								        #指定serverid，要比mysql-master大
relay_log=/var/lib/mysql/relay_log      			#开启中继日志
relay_log_index=/var/lib/mysql/relay_log.index	#开启中继日志索引

#重启mysql
[root@db02 ~]# systemctl restart mysqld
```



### 2.设置slave从master拉取binlog，及拉取的位置

```python
mysql> change master to master_host='10.0.0.100', \
                        master_port=3306, \
                        master_user='backup', \
                        master_password='123', \
                        master_log_file='binlog.000001', \
                        master_log_pos=155;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

mysql> show warnings;			#会有警告，但不影响
| Note  | 1759 | Sending passwords in plain text without SSL/TLS is extremely insecure.                                                                                                                                                                                                               
| Note  | 1760 | Storing MySQL user name or password information in the master info repository is not secure and is therefore not recommended. Please consider using the USER and PASSWORD connection options for START SLAVE; see the 'START SLAVE Syntax' in the MySQL Manual for more information. |

没有SSL/TLS的纯文本发送密码是非常不安全的
在主信息存储库中存储MySQL用户名或密码信息是不安全的，因此不建议这样做。请考虑使用用户和密码连接选项启动从;有关更多信息，请参阅MySQL手册中的“开始从属语法”。


语句说明
change master to master_host='10.0.0.100',		#mysql-master主机IP地址
master_port=3306,								#mysql-master端口
master_user='backup',							#slave拉取的用户
master_password='123456',					    #slave拉去的用户的密码
master_log_file='binlog.000001',				#mysql-master的binlog文件，在master中show master status查看
master_log_pos=155;					
```



### 3.启动slave并查看slave状态

```python
//启动slave
mysql> start slave;		

//查看slave状态，IO线程、SQL线程都为yes才算正确			
mysql> show slave status\G				
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```



### 4.验证，在master上创建数据库和表，然后在slave上看是否可以同步

```python
//master操作
mysql> show databases;		#此时mysql-master上有4个库
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.01 sec)

mysql> create database DB1;				#创建一个数据库DB1
Query OK, 1 row affected (0.01 sec)


//slave验证
mysql> show databases;			#可以看到，在master上创建的数据库DB1已经同步至slave
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB1                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.01 sec)
```

---

## 4.延时从库

### 4.1 延时从库优点

**1.误删除时，能更快恢复数据。**

**有时候手抖了，把线上数据给误删除了，或者误删除库、表、其他对象，或不加WHERE条件的更新、删除，都可以让延迟从库在误操作前的时间点停下，然后进行恢复。**

**2.把延迟从库作为专用的备份节点。虽然有一定的延迟，但并不影响利用该节点作为备份角色，也不影响生产节点数据库库。**

**3.还可以把延迟从库当做一些问题、案例研究的对象。个别时候，可能有些binlog event在普通从库上会有问题（例如早期版本中无主键会导致从库更新非常慢的经典问题），这时就有时间在延迟从库上慢慢琢磨研究了。**



:::tip

**普通主从最大的缺点：主库误删除数据后从库上的数据也会被同步删除**

:::



### 4.2 配置延时从库

<h3 style={{color: 'red'}}>从库10.0.0.101操作</h3>

```python
//停止主从
mysql>stop slave;

//设置延时为60秒
mysql>change master to master_delay = 60;

//开启主从
mysql>start slave;

//查看状态
mysql> show slave status \G
SQL_Delay: 60

  
  
#延时从库停止方法
//停止主从
mysql> stop slave;

//设置延时为0
mysql> CHANGE MASTER TO MASTER_DELAY = 0;

//开启主从
mysql> start slave;
```

