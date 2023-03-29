[toc]



# mysql日志

## 1.错误日志

### 1.1 yum安装默认路径

**`/var/log/mysqld.log`**

```python
mysql> show variables like "%log_error%";
+---------------+---------------------+
| Variable_name | Value               |
+---------------+---------------------+
| log_error     | /var/log/mysqld.log |
+---------------+---------------------+
1 row in set (0.01 sec)
```



### 1.2 二进制安装、编译安装路径

**`$MYSQL_HOME/data/主机名.err`**

```python
//编辑配置文件
[root@db01 ~]# vim /etc/my.cnf
[mysqld]
log_error=/usr/local/mysql/data/error.log

//查看方式
mysql> show variables like 'log_error';
+---------------+---------------------------------+
| Variable_name | Value                           |
+---------------+---------------------------------+
| log_error     | /usr/local/mysql/data/error.log |
+---------------+---------------------------------+
1 row in set (0.00 sec)
```



## 2.二进制日志

### 2.1 含义

**binlog日志，记录对mysql的所有更新的操作，插入的操作(增删改操作)**



### 2.2 作用

**恢复数据，MySQL AB复制，记录所有对数据库发生修改的操作**



### 2.3 二进制日志模式



![iShot2020-10-14 14.04.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2014.04.42.png)



**statement：语句模式，上图中将update语句进行记录（默认模式）**


- **优点**
  - **简单明了，容易被看懂，就是sql语句，记录时不需要太多的磁盘空间**
- **缺点**
  - **记录不够严谨**



**row：行模式，即数据行的变化过程，上图中Age=19修改成Age=20的过程事件。 mixed：以上两者的混合模式。 企业推荐使用row模式**

- **优点**
  - **记录更加严谨**
- **缺点**
  - **有可能会需要更多的磁盘空间，不太容易被读懂**



### 2.4 开启方式

```python
//开启二进制日志
[root@db01 data]# vim /etc/my.cnf
[mysqld]
log-bin=mysql-bin
binlog_format=row


//注意:在mysql5.7中开启binlog必须要加上server-id。
[root@db01 data]# vim /etc/my.cnf
[mysqld]
log-bin=mysql-bin
binlog_format=row
server_id=1
```



### 2.5 二进制日志的操作

```python
//物理查看
[root@db01 data]# ll /usr/local/mysql/data/
-rw-rw---- 1 mysql mysql      285 Mar  6  2017 mysql-bin.000001

//命令行查看
mysql> show binary logs;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000001 |       120 |
+------------------+-----------+
1 row in set (0.00 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      120 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

//查看binlog事件
mysql> show binlog events in 'mysql-bin.000001';
+------------------+-----+-------------+-----------+-------------+---------------------------------------+
| Log_name         | Pos | Event_type  | Server_id | End_log_pos | Info                                  |
+------------------+-----+-------------+-----------+-------------+---------------------------------------+
| mysql-bin.000001 |   4 | Format_desc |         1 |         120 | Server ver: 5.6.40-log, Binlog ver: 4 |
+------------------+-----+-------------+-----------+-------------+---------------------------------------+
1 row in set (0.01 sec)
```



### 2.6 事件

#### 2.6.1 事件含义

**1.在binlog中最小的记录单元为event**

**2.一个事务会被拆分成多个事件（event）**



#### 2.6.2 事件特性

**1.每个event都有一个开始位置（start position）和结束位置（stop position）**

**2.所谓的位置就是event对整个二进制的文件的相对位置**

**3.对于一个二进制日志中，前120个position是文件格式信息预留空间**

**4.MySQL第一个记录的事件，都是从120开始的**



#### 2.6.3 利用二进制日志恢复数据示例

```python
1.修改mysql二进制日志为row模式
[root@db01 data]# vim /etc/my.cnf
[mysqld]
log-bin=mysql-bin
binlog_format=row

2.查看二进制日志格式
mysql> show variables like 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
1 row in set (0.01 sec)

3.查看binlog信息
mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      120 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.05 sec)

4.先刷新，然后再查看binlog信息，此时位置为120
mysql> flush logs;
Query OK, 0 rows affected (0.01 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000002 |      120 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

5.创建一个binlog库
mysql> create database binlog;
Query OK, 1 row affected (0.01 sec)

6.创建一个表binlog_table
mysql> use binlog;
Database changed
mysql> create table binlog_table(id int);
Query OK, 0 rows affected (0.03 sec)

7.创建库和表后查看binlog信息，此时binlog位置为331
mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000003 |      331 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

8.向表中插入一条数据并查看binlog信息，此时binlog位置为533
mysql> insert into binlog_table values(1);
Query OK, 1 row affected (0.01 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000003 |      533 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

9.向表中插入2条数据并查看binlog信息，此时binlog位置为937
mysql> insert into binlog_table values(2);
Query OK, 1 row affected (0.00 sec)

mysql> insert into binlog_table values(3);
Query OK, 1 row affected (0.01 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000002 |      937 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

10.删除一条数据、然后删除表、库
mysql> select * from binlog_table;
+------+
| id   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

mysql> delete from binlog_table where id=1;
Query OK, 1 row affected (0.02 sec)

mysql> drop table binlog_table;
Query OK, 0 rows affected (0.01 sec)

mysql> drop database binlog;
Query OK, 0 rows affected (0.01 sec)

11.开始查找要截取的段，这里要恢复删除的数据库
mysqlbinlog --base64-output=decode-rows -vvv /usr/local/mysql/data/mysql-bin.000002
[root@db02 data]# mysqlbinlog --base64-output=decode-rows -vvv /usr/local/mysql/data/mysql-bin.000002

12.开始恢复，恢复前一定要临时关闭二进制日志，否则二进制日志会多记录
#临时关闭二进制日志
mysql> set sql_log_bin=0;
Query OK, 0 rows affected (0.01 sec)

#截取并写入到一个文件中
[root@db02 data]# mysqlbinlog --start-position=120 --stop-position=1011 /usr/local/mysql/data/mysql-bin.000002 >/tmp/binlog.sql

#开始恢复
[root@db02 data]# mysql -uroot -p </tmp/binlog.sql

13.验证结果
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| binlog             |
| mysql              |
| performance_schema |
| test               |
+--------------------+
5 rows in set (0.00 sec)
mysql> use binlog;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+------------------+
| Tables_in_binlog |
+------------------+
| binlog_table     |
+------------------+
1 row in set (0.00 sec)

mysql> select * from binlog_table;
+------+
| id   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)
```



## 3.通用查询日志

**`/var/run/mysqld/mysqld.log`** 				

```python
#对MySQL所有增删改查都会记录，默认关闭
mysql> show variables like "%general%";		
+------------------+----------------------------+
| Variable_name    | Value                      |
+------------------+----------------------------+
| general_log      | OFF                        |
| general_log_file | /var/run/mysqld/mysqld.log |
+------------------+----------------------------+
2 rows in set (0.00 sec)


#开启通用查询日志后才会有文件/var/run/mysqld/mysqld.log 
mysql> set global general_log=on;		
Query OK, 0 rows affected (0.00 sec)	
```



## 4.慢查询日志

**`/var/run/mysqld/mysqld-slow.log`**	

```python
#记录查询时间长的语句，用来优化，默认10s为慢查询
mysql> show variables like "%slow%";
+---------------------+---------------------------------+
| Variable_name       | Value                           |
+---------------------+---------------------------------+
| log_slow_queries    | OFF                             |
| slow_launch_time    | 2                               |
| slow_query_log      | OFF                             |
| slow_query_log_file | /var/run/mysqld/mysqld-slow.log |
+---------------------+---------------------------------+
4 rows in set (0.00 sec)
	
#设置慢查询日志存放路径	
mysql>set global slow_query_log_file=路径	
	
#开启慢查询	
mysql> set global slow_query_log=on;		
Query OK, 0 rows affected (0.00 sec)

#设置慢查询超时时间
mysql> set long_query_time=2;				
Query OK, 0 rows affected (0.00 sec)
	
#模拟慢查询时间为5s	
mysql> select sleep(5);						
+----------+
| sleep(5) |
+----------+
|        0 |
+----------+
1 row in set (5.00 sec)
	
#此时查看MySQL慢查询日志就可以看到超时的语句	
[root@mysql ~]# less /var/run/mysqld/mysqld-slow.log			
/usr/libexec/mysqld, Version: 5.1.73 (Source distribution). started with:
Tcp port: 3306  Unix socket: /var/lib/mysql/mysql.sock
Time                 Id Command    Argument
# Time: 171123  9:58:55
# User@Host: root[root] @ mysql []
# Query_time: 5.001586  Lock_time: 0.000000 Rows_sent: 1  Rows_examined: 0
use DB1;
SET timestamp=1511402335;
select sleep(5);
```



