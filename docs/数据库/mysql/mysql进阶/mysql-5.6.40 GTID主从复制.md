[toc]



# mysql-5.6.40 GTID主从复制

## 1.GTID主从复制简介

### 1.1 GTID主从复制概念

**基于GTID的复制是从Mysql5.6开始支持的一种新的复制方式，此方式与传统基于日志的方式存在很大的差异，在原来的基于日志的复制中，从服务器连接到主服务器并告诉主服务器要从哪个二进制日志的偏移量开始执行增量同步，这时我们如果指定的日志偏移量不对，这可能造成主从数据的不一致，而基于GTID的复制会避免这种情况**



### 1.2 GTID工作过程

**①首先从服务器会告诉主服务器已经在从服务器执行完了哪些事务的GTID值**

**②主库会把所有没有在从库上执行的事务，发送到从库上进行执行，并且使用GTID的复制可以保证同一个事务只在指定的从库上执行一次，这样可以避免由于偏移量的问题造成数据不一致**



### 1.3 GTID含义

**全局事务ID，其保证为每一个在主服务器上提交的事务在复制集群中可以生成一个唯一的ID**



### 1.4 GTID组成

**UUID+TID**

**UUID：是在mysql服务首次启动生成的，保存在数据库的数据目录中，在数据目录中有一个auto.conf文件，这个文件保存了UUDI值**

**TID：事务ID则是从1开始自增的序列，表示这个事务是在主库上执行的第几个事务，Mysql会保证这个事务和GTID是一比一的关系**



## 2.实验环境

| 服务器角色 | ip        | 主机名 |
| ---------- | --------- | ------ |
| master     | 10.0.0.10 | db01   |
| slave1     | 10.0.0.11 | db02   |
| slave2     | 10.0.0.12 | db03   |





## 3.基于GTID主从前提条件

**先决条件**

**1.主库和从库都要开启binlog**

**2.主库和从库server-id不同**

**3.要有主从复制用户**



## 4.实验过程

<h3 style={{color: 'hotpink'}}>主库10.0.0.10操作</h3>

### 1.修改配置文件

```python
//编辑主库配置文件/etc/my.cnf，在[mysqld]下添加以下几行
[root@db01 ~]# vim /etc/my.cnf
server_id=1
log_bin=mysql-bin
gtid_mode=ON
enforce_gtid_consistency
log-slave-updates
skip_name_resolve

//重启mysql
[root@db01 ~]# systemctl restart mysqld

//主库查看git开启情况，enforce_gtid_consistency与gtid_mode都为on即为正确
mysql> show global variables like '%gtid%';
+---------------------------------+----------------------------------------+
| Variable_name                   | Value                                  |
+---------------------------------+----------------------------------------+
| binlog_gtid_simple_recovery     | OFF                                    |
| enforce_gtid_consistency        | ON                                     |
| gtid_executed                   | e257d15f-ed9f-11e8-ab08-000c29b62ed9:1 |
| gtid_mode                       | ON                                     |
| gtid_owned                      |                                        |
| gtid_purged                     |                                        |
| simplified_binlog_gtid_recovery | OFF                                    |
+---------------------------------+----------------------------------------+
7 rows in set (0.01 sec)

#参数说明
server_id=1                    #server id主库和从库要不一样
log_bin=mysql-bin              #开启binlog
gtid_mode=ON                   #开启gtid
enforce_gtid_consistency       #执行GTID一致
log-slave-updates              #通常情况，从服务器从主服务器接收到的更新不记入它的二进制日志。
该选项告诉从服务器将其SQL线程执行的更新记入到从服务器自己的二进制日志，mysql-5.6必须加这个参数，
5.7可以不加
skip_name_resolve              #跳过mysql域名解析
```



### 2.主库创建主从复制用户

```python
mysql> grant replication slave on *.* to backup@'10.0.0.%' identified by '123';
Query OK, 0 rows affected (0.02 sec)
```



<h3 style={{color: 'green'}}>从库10.0.0.11、10.0.0.12操作</h3>

### 1.修改配置文件

```python
//从库10.0.0.11修改配置文件/etc/my.cnf，server id要与主库不同
[mysqld]
server_id=2
log-bin=mysql-bin
gtid_mode=ON
enforce_gtid_consistency
log-slave-updates
skip_name_resolve

//重启mysql
[root@db02 ~]# systemctl restart mysqld

//查看gtid开启状态
mysql> show variables like '%gtid%';
+---------------------------------+-----------+
| Variable_name                   | Value     |
+---------------------------------+-----------+
| binlog_gtid_simple_recovery     | OFF       |
| enforce_gtid_consistency        | ON        |
| gtid_executed                   |           |
| gtid_mode                       | ON        |
| gtid_next                       | AUTOMATIC |
| gtid_owned                      |           |
| gtid_purged                     |           |
| simplified_binlog_gtid_recovery | OFF       |
+---------------------------------+-----------+
8 rows in set (0.00 sec)

-------------------------------------------------------

//从库10.0.0.12修改配置文件/etc/my.cnf，server id要与主库不同
[mysqld]
server_id=3
log-bin=mysql-bin
gtid_mode=ON
enforce_gtid_consistency
log-slave-updates
skip_name_resolve

//重启mysql
[root@db03 ~]# systemctl restart mysqld

//查看gtid开启状态
mysql> show variables like '%gtid%';
+---------------------------------+-----------+
| Variable_name                   | Value     |
+---------------------------------+-----------+
| binlog_gtid_simple_recovery     | OFF       |
| enforce_gtid_consistency        | ON        |
| gtid_executed                   |           |
| gtid_mode                       | ON        |
| gtid_next                       | AUTOMATIC |
| gtid_owned                      |           |
| gtid_purged                     |           |
| simplified_binlog_gtid_recovery | OFF       |
+---------------------------------+-----------+
8 rows in set (0.00 sec)
```



### 2.从库拉取

```python
//从库10.0.0.11执行拉取语句
mysql> change master to 
    master_host='10.0.0.10',
    master_user='backup',
    master_password='123',
    master_auto_position=1;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

//启动IO、SQL线程
mysql> start slave;

//查看slave状态，IO、SQL线程都为yes，auto_position为yes即为成功
mysql> show slave status\G
Slave_IO_Running: Yes
Slave_SQL_Running: Yes


#以下为事务ID，1-3表明从库从主库同步了3次
Retrieved_Gtid_Set: e257d15f-ed9f-11e8-ab08-000c29b62ed9:1-3
Executed_Gtid_Set: e257d15f-ed9f-11e8-ab08-000c29b62ed9:1-3

------------------------------------------------------------    
    
//从库10.0.0.12执行拉取语句
mysql> change master to 
    master_host='10.0.0.10',
    master_user='backup',
    master_password='123',
    master_auto_position=1;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

//启动IO、SQL线程
mysql> start slave;

//查看slave状态，IO、SQL线程都为yes，auto_position为yes即为成功
mysql> show slave status\G
Slave_IO_Running: YesSlave_SQL_Running: Yes
Auto_Position: 1

#以下为事务ID，1-3表明从库从主库同步了3次
Retrieved_Gtid_Set: e257d15f-ed9f-11e8-ab08-000c29b62ed9:1-3
Executed_Gtid_Set: e257d15f-ed9f-11e8-ab08-000c29b62ed9:1-3
```



### 3.验证主从同步

```python
//主库创建数据库
mysql> create database GTID;
Query OK, 1 row affected (0.00 sec)

//从库查看是否同步，可以看到GTID库已经同步过来
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| GTID               |
| mysql              |
| performance_schema |
| test               |
+--------------------+
5 rows in set (0.00 sec)
```



<h4 style={{color: 'red'}}>以上过程同样适用于mysql-5.7</h4>