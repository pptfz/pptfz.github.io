[toc]



# mysql物理备份	xtrabackup

[xtrabackup github地址](https://github.com/percona/percona-xtrabackup)



[xtrabackup2.4官方文档](https://www.percona.com/doc/percona-xtrabackup/2.4/index.html)

[xtrabackup8.0官方文档](https://www.percona.com/doc/percona-xtrabackup/8.0/index.html)



[xtrabackup2.4官方下载地址](https://www.percona.com/downloads/Percona-XtraBackup-2.4/LATEST/)

[xtrabackup8.0官方下载地址](https://www.percona.com/downloads/Percona-XtraBackup-LATEST/)



**xtrabackup备份方式（物理备份）**

- 对于非innodb表（比如myisam）是直接锁表cp数据文件，属于一种温备

- 对于innodb的表（支持事务），不锁表，cp数据页最终以数据文件方式保存下来，并且把redo和undo一并备走，属于热备方式

- 备份时读取配置文件/etc/my.cnf



# 1.安装xtrabackup

## 1.1 下载软件包并安装

```shell
wget https://www.percona.com/downloads/Percona-XtraBackup-2.4/Percona-XtraBackup-2.4.20/binary/redhat/7/x86_64/percona-xtrabackup-24-2.4.20-1.el7.x86_64.rpm

yum -y localinstall percona-xtrabackup-24-2.4.20-1.el7.x86_64.rpm
```



## 1.2 查看版本

```shell
$ xtrabackup -v
xtrabackup: recognized server arguments: --datadir=/usr/local/mysql/data --server-id=1 --log_bin=binlog
xtrabackup version 2.4.20 based on MySQL server 5.7.26 Linux (x86_64) (revision id: c8b4056)
```





# 2.xtrabackup全备



xtrabackup

- xtrabackup可以在不加锁的情况下备份innodb数据表，不过此工具不能操作myisam。

  

innobackupex

- innobackupex是一个封装了xtrabackup的脚本，能同时处理innodb和myisam，但在处理myisam时需要加一个读锁。



**利用存储过程生成大量数据**

**db1、db2每个库中有两张表，每张表10万条数据**

```shell
#1.创建数据库
mysql> create database db1;
Query OK, 1 row affected (0.00 sec)

#2.创建表
mysql> use db1;
Database changed

mysql> create table db1_t1(
    id int,
    name varchar(20),
    gender char(6),
    email varchar(50),
    first_name char(10),
    last_name char(10)
    );
Query OK, 0 rows affected (0.01 sec)

#3.创建存储过程
mysql> delimiter $$ #声明存储过程的结束符号为$$
mysql> create procedure auto_insert1()
    BEGIN
        declare i int default 1;
        while(i<100001)do	#插入10万条数据
            insert into db1_t1 values(i,'xboyww','man',concat( 'xboyww',i,'@qq'),concat('a',i),concat('b',i));
            set i=i+1;
        end while;
    END$$ #$$结束
Query OK, 0 rows affected (0.00 sec)

mysql> delimiter ; #重新声明分号为结束符号，注意有空格


#4.查看存储过程
show create procedure auto_insert1\G

#5.调用存储过程
call auto_insert1();

#6.查看数据
mysql> select count(*) from s1;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)

mysql> select * from s1 limit 10;
+------+--------+--------+-------------+------------+-----------+
| id   | name   | gender | email       | first_name | last_name |
+------+--------+--------+-------------+------------+-----------+
|    1 | xboyww | man    | xboyww1@qq  | a1         | b1        |
|    2 | xboyww | man    | xboyww2@qq  | a2         | b2        |
|    3 | xboyww | man    | xboyww3@qq  | a3         | b3        |
|    4 | xboyww | man    | xboyww4@qq  | a4         | b4        |
|    5 | xboyww | man    | xboyww5@qq  | a5         | b5        |
|    6 | xboyww | man    | xboyww6@qq  | a6         | b6        |
|    7 | xboyww | man    | xboyww7@qq  | a7         | b7        |
|    8 | xboyww | man    | xboyww8@qq  | a8         | b8        |
|    9 | xboyww | man    | xboyww9@qq  | a9         | b9        |
|   10 | xboyww | man    | xboyww10@qq | a10        | b10       |
+------+--------+--------+-------------+------------+-----------+
10 rows in set (0.00 sec)


#删除存储过程
DROP PROCEDURE auto_insert1;
```



**db3，一张表，两条数据**

```mysql
mysql> create database db3;
Query OK, 1 row affected (0.00 sec)

mysql> create table t3(id int,name char(10)) engine=myisam;
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t3 values(1,'xiaoming'),(2,'xiaohong');
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

mysql> select * from t3;
+------+----------+
| id   | name     |
+------+----------+
|    1 | xiaoming |
|    2 | xiaohong |
+------+----------+
2 rows in set (0.00 sec)
```



## 2.1 全备

### 2.1.1 备份方法一	`xtrabackup --backup`

[xtrabackup2.4 xtrabackup选项](https://www.percona.com/doc/percona-xtrabackup/2.4/xtrabackup_bin/xbk_option_reference.html)



**执行备份命令**

```shell
xtrabackup -uroot -p --backup --target-dir=/data/backups/
```



**`/data/backups`备份目录下的内容**

```shell
$ ll
总用量 12340
-rw-r----- 1 root root      487 7月   2 22:43 backup-my.cnf
drwxr-x--- 2 root root       92 7月   2 22:43 db1
drwxr-x--- 2 root root       92 7月   2 22:43 db2
drwxr-x--- 2 root root       62 7月   2 22:43 db3
-rw-r----- 1 root root      646 7月   2 22:43 ib_buffer_pool
-rw-r----- 1 root root 12582912 7月   2 22:43 ibdata1
drwxr-x--- 2 root root     4096 7月   2 22:43 mysql
drwxr-x--- 2 root root     8192 7月   2 22:43 performance_schema
drwxr-x--- 2 root root     8192 7月   2 22:43 sys
-rw-r----- 1 root root       19 7月   2 22:43 xtrabackup_binlog_info
-rw-r----- 1 root root      141 7月   2 22:43 xtrabackup_checkpoints
-rw-r----- 1 root root      474 7月   2 22:43 xtrabackup_info
-rw-r----- 1 root root     2560 7月   2 22:43 xtrabackup_logfile
```



### 2.1.2 备份方法二	`innobackupex`

[xtrabackup2.4 innobackupex选项](https://www.percona.com/doc/percona-xtrabackup/2.4/innobackupex/innobackupex_option_reference.html)



**执行备份命令**

`-S /var/lib/mysql/mysql.sock`

-S选项可以不加，会从mysql配置文件`/etc/my.cnf`中读取sock文件位置

```shell
innobackupex -uroot -p1 /backup
```



**备份完成后会在`/backup`目录下生成一个以时间命令并精确到秒的目录**

```shell
$ ls
2020-07-02_22-57-09

$ cd 2020-07-02_22-57-09/
$ ll
总用量 12340
-rw-r----- 1 root root      487 7月   2 22:57 backup-my.cnf
drwxr-x--- 2 root root       92 7月   2 22:57 db1
drwxr-x--- 2 root root       92 7月   2 22:57 db2
drwxr-x--- 2 root root       62 7月   2 22:57 db3
-rw-r----- 1 root root      646 7月   2 22:57 ib_buffer_pool
-rw-r----- 1 root root 12582912 7月   2 22:57 ibdata1
drwxr-x--- 2 root root     4096 7月   2 22:57 mysql
drwxr-x--- 2 root root     8192 7月   2 22:57 performance_schema
drwxr-x--- 2 root root     8192 7月   2 22:57 sys
-rw-r----- 1 root root       19 7月   2 22:57 xtrabackup_binlog_info
-rw-r----- 1 root root      141 7月   2 22:57 xtrabackup_checkpoints
-rw-r----- 1 root root      494 7月   2 22:57 xtrabackup_info
-rw-r----- 1 root root     2560 7月   2 22:57 xtrabackup_logfile
```



**如果想要自主命名备份目录的话，需要加参数`--no-timestamp`**

```shell
innobackupex -uroot -p1 --no-timestamp /backup/bak
```



**在备份目录下会有一个文件`xtrabackup_binlog_info`，这个文件记录了binlog文件名和binlog的位置点**

```shell
$ cat xtrabackup_binlog_info 
binlog.000009	1061
```



**在备份目录会有一个文件`xtrabackup_info `，这个文件记录了备份信息汇总**

```shell
$ cat xtrabackup_info 
uuid = c47c158f-bc74-11ea-82fa-001c42f33c78
name = 
tool_name = innobackupex
tool_command = --user=root --password=... --no-timestamp /backup/bak
tool_version = 2.4.20
ibbackup_version = 2.4.20
server_version = 5.7.28-log
start_time = 2020-07-02 23:00:27
end_time = 2020-07-02 23:00:28
lock_time = 0
binlog_pos = filename 'binlog.000009', position '1061'
innodb_from_lsn = 0
innodb_to_lsn = 332706000
partial = N
incremental = N
format = file
compact = N
compressed = N
encrypted = N
```



**在备份目录下会有一个文件`xtrabackup_logfile`，这个文件是备份的redo_log文件**

```shell
$ ll xtrabackup_logfile 
-rw-r----- 1 root root 2560 7月   2 23:00 xtrabackup_logfile
```



## 2.2 全备恢复

### 2.2.1 查看原有数据库

有3个库(db1，db2，db3)，

```mysql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| db1                |
| db2                |
| db3                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
7 rows in set (0.00 sec)
```



### 2.2.2 原有数据库中的表

```shell
#db1，有两张表，每张表中有10万条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| db1_t1        |
| db1_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db1_t1;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db1_t2;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)


#db2，有两张表，每张表中有10万条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db2 |
+---------------+
| db2_t1        |
| db2_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db2_t1;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db2_t2;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.03 sec)


#db3，有1张表，表中2行数据
mysql> use db3;
mysql> show tables;
+---------------+
| Tables_in_db3 |
+---------------+
| t3            |
+---------------+
1 row in set (0.00 sec)

mysql> select count(*) from t3;
+----------+
| count(*) |
+----------+
|        2 |
+----------+
1 row in set (0.00 sec)
```



### 2.2.3 进行全库备份

```shell
innobackupex -uroot -p1 --no-timestamp /backup/bak
```



### 2.2.4 删除db1-3数据库

```mysql
mysql> drop database db1;
Query OK, 2 rows affected (0.00 sec)

mysql> drop database db2;
Query OK, 2 rows affected (0.01 sec)

mysql> drop database db3;
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.00 sec)
```



### 2.2.5 将redo进行重做，已提交的写到数据文件，未提交的使用undo回滚，模拟CSR的过程

`--apply-log`参数的作用是应用 BACKUP-DIR 中的 `xtrabackup_logfile` 事务日志文件。一般情况下，在备份完成后，数据尚且不能用于恢复操作，因为备份的数据中可能会包含尚未提交的事务或已经提交但尚未同步至数据文件中的事务。因此，此时数据文件仍处于不一致状态。"准备"的主要作用正是通过回滚未提交的事务及同步已经提交的事务至数据文件使得数据文件处于一致性状态。

```shell
innobackupex -uroot -p1 --apply-log /backup/bak
```



### 2.2.6 停止mysql，删除原先数据目录

**停止mysql**

```shell
$ /etc/init.d/mysqld stop
Shutting down MySQL.... SUCCESS! 
```



### 2.2.7 删除原先数据目录或者修改名称

**<span style=color:red>⚠️恢复数据之前需要保证数据目录是空的状态</span>**

mysql安装的数据目录为`/usr/local/mysql/data`

```shell
#如果做删除操作，最好先备份然后再删除，虽然数据已经丢失一部分，这里选择修改目录名称
mv /usr/local/mysql/data{,-bak}
```



### 2.2.8 进行数据恢复

**这里要注意，恢复的时候mysql配置文件`[mysqld]`下一定要指定mysql data目录**

```shell
innobackupex -uroot -p1 --copy-back /backup/bak
或
xtrabackup -uroot p1 --copy-back --target-dir=/backup/bak
```



### 2.2.9 给恢复的目录重新授权所有者为mysql

```shell
chown -R mysql.mysql /usr/local/mysql/data
```



### 2.2.10 启动mysql

```shell
$ /etc/init.d/mysqld start
Starting MySQL.Logging to '/usr/local/mysql/data/error.log'.
. SUCCESS! 
```



### 2.2.11 验证数据恢复

**验证数据库是否还原**

```shell
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| db1                |
| db2                |
| db3                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
7 rows in set (0.00 sec)
```



**验证表中的数据是否还原**

```shell
#db1，有两张表，每张表中有10万条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| db1_t1        |
| db1_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db1_t1;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db1_t2;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)


#db2，有两张表，每张表中有10万条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db2 |
+---------------+
| db2_t1        |
| db2_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db2_t1;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db2_t2;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
1 row in set (0.03 sec)


#db3，有1张表，表中2行数据
mysql> use db3;
mysql> show tables;
+---------------+
| Tables_in_db3 |
+---------------+
| t3            |
+---------------+
1 row in set (0.00 sec)

mysql> select count(*) from t3;
+----------+
| count(*) |
+----------+
|        2 |
+----------+
1 row in set (0.00 sec)
```





# 三、xtrabackup增量备份

[xtrabackup2.4 增量备份官方文档](https://www.percona.com/doc/percona-xtrabackup/2.4/backup_scenarios/incremental_backup.html)



## 3.1 做全备

**db1、db2、db3数据库及表数据说明**

```shell
$ tree db1 db2 db3
db1	#两张表，每张表中10万条数据
├── db1_t1.frm
├── db1_t1.ibd
├── db1_t2.frm
├── db1_t2.ibd
└── db.opt
db2	#两张表，每张表中10万条数据
├── db2_t1.frm
├── db2_t1.ibd
├── db2_t2.frm
├── db2_t2.ibd
└── db.opt
db3	#一张表，2条数据
├── db.opt
├── t3.frm
├── t3.MYD
└── t3.MYI
```



**删除之前的全备，重新做全备**

```shell
innobackupex -uroot -p1 --no-timestamp /backup/bak
或
xtrabackup -uroot -p --backup --target-dir=/backup/bak
```



**在备份目录`/backup/bak`中有一个文件`xtrabackup_checkpoints`，这个文件记录了备份类型、lsn(日志序列号)**

```shell
$ cat xtrabackup_checkpoints 
backup_type = full-backuped
from_lsn = 0
to_lsn = 332706875
last_lsn = 332706884
compact = 0
recover_binlog_info = 0
flushed_lsn = 332706884
```



## 3.2 开始增量备份

### 3.2.1 基于全备的的增备

开始第一次增备，只要全备和多个增备的LSN号连续，那么就可以逐个进行恢复。可以在备份目录`xtrabackup_checkpoints`文件中看到，**其中全备的`from_lsn=0`,增备的`from_lsn`应该等于上一个增备或者全备的`to_lsn`**

```shell
$ cat xtrabackup_checkpoints 
backup_type = full-backuped
from_lsn = 0
to_lsn = 332706875
last_lsn = 332706884
compact = 0
recover_binlog_info = 0
flushed_lsn = 332706884
```



#### 3.2.1.1 插入数据

**db1、db2、db3每个数据库中的表都插入一条数据**

```mysql
#db1
mysql> insert into db1_t1 values(100001,'xboyww','man',concat( 'xboyww',100001,'@qq'),concat('a',100001),concat('b',100001));
Query OK, 1 row affected (0.00 sec)

mysql> insert into db1_t2 values(100001,'xboyww','man',concat( 'xboyww',100001,'@qq'),concat('a',100001),concat('b',100001));
Query OK, 1 row affected (0.00 sec)


#db2
mysql> insert into db2_t1 values(100001,'xboyww','man',concat( 'xboyww',100001,'@qq'),concat('a',100001),concat('b',100001));
Query OK, 1 row affected (0.01 sec)

mysql> insert into db2_t2 values(100001,'xboyww','man',concat( 'xboyww',100001,'@qq'),concat('a',100001),concat('b',100001));
Query OK, 1 row affected (0.00 sec)


#db3
mysql> insert into t3 values(3,'dabai');
Query OK, 1 row affected (0.00 sec)
```



**查看每张表的数据**

每张表都在原先的基础上增加了一行数据

```shell
#db1的两张表
mysql> select count(*) from db1_t1;
+----------+
| count(*) |
+----------+
|   100001 |
+----------+
1 row in set (0.03 sec)

mysql> select count(*) from db1_t2;
+----------+
| count(*) |
+----------+
|   100001 |
+----------+
1 row in set (0.04 sec)

#db2的两张表
mysql> select count(*) from db2_t1;
+----------+
| count(*) |
+----------+
|   100001 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db2_t2;
+----------+
| count(*) |
+----------+
|   100001 |
+----------+
1 row in set (0.04 sec)

#db3的一张表
mysql> select count(*) from t3;
+----------+
| count(*) |
+----------+
|        3 |
+----------+
1 row in set (0.00 sec)
```



#### 3.2.1.2 执行增备命令

增备就是在全备的命令基础上加一个参数`--incremental-basedir=`指定增备的目录

```shell
innobackupex -uroot -p1 --no-timestamp --incremental /backup/bak_incr1 --incremental-basedir=/backup/bak
或
xtrabackup -uroot -p1 --backup --target-dir=/backup/bak_incr1 --incremental-basedir=/backup/bak
```



说明：

`--incremental-basedir`是上次全备或者增备出来的文件夹。当第一次增备的时候，一般填上次全备，第二次增备的时候，如果`--incremental-basedir`填上次全备，那么本次增备就会包含上次全备到现在变化的内容，相当于oracle依次做1级，2级，3级。。。增备如果`--incremental-basedir`填第一次增备的目录，那么该次增备只包含第一次增备到现在的变化，文件会更小，相当于oracle rman里面每次都做1级增备。



#### 3.2.1.3 增备完成查看备份的数据目录大小

```shell
$ pwd
/backup
$ du -sh *
90M	bak
3.2M	bak_incr1


#全备的数据大小
$ du -sh *
4.0K	backup-my.cnf
33M	db1
33M	db2
24K	db3
4.0K	ib_buffer_pool
12M	ibdata1
12M	mysql
1.1M	performance_schema
680K	sys
4.0K	xtrabackup_binlog_info
4.0K	xtrabackup_checkpoints
4.0K	xtrabackup_info
4.0K	xtrabackup_logfile

#增备的数据大小
$ du -sh *
4.0K	backup-my.cnf
100K	db1
100K	db2
24K	db3
4.0K	ib_buffer_pool
176K	ibdata1.delta
4.0K	ibdata1.meta
1.2M	mysql
1.1M	performance_schema
604K	sys
4.0K	xtrabackup_binlog_info
4.0K	xtrabackup_checkpoints
4.0K	xtrabackup_info
4.0K	xtrabackup_logfile
```



#### 3.2.1.4 全备的`xtrabackup_checkpoints`与增备的`xtrabackup_checkpoints`文件对比

**<span style=color:red>可以看到增备中的`from_lsn = 332706875`与全备中的`to_lsn = 332706875`是相同的</span>**

```shell
#全备
$ cat xtrabackup_checkpoints 
backup_type = full-backuped
from_lsn = 0
to_lsn = 332706875
last_lsn = 332706884
compact = 0
recover_binlog_info = 0
flushed_lsn = 332706884


#增备
$ cat xtrabackup_checkpoints 
backup_type = incremental
from_lsn = 332706875
to_lsn = 332708551
last_lsn = 332708560
compact = 0
recover_binlog_info = 0
flushed_lsn = 332708560
```



### 3.2.2 基于增备的增备

#### 3.2.2.1 插入数据

**db1、db2、db3每个数据库中的表都插入一条数据**

```mysql
#db1
mysql> insert into db1_t1 values(100002,'xboyww','man',concat( 'xboyww',100002,'@qq'),concat('a',100002),concat('b',100002));
Query OK, 1 row affected (0.00 sec)

mysql> insert into db1_t2 values(100002,'xboyww','man',concat( 'xboyww',100002,'@qq'),concat('a',100002),concat('b',100002));
Query OK, 1 row affected (0.00 sec)


#db2
mysql> insert into db2_t1 values(100002,'xboyww','man',concat( 'xboyww',100002,'@qq'),concat('a',100002),concat('b',100002));
Query OK, 1 row affected (0.01 sec)

mysql> insert into db2_t2 values(100002,'xboyww','man',concat( 'xboyww',100002,'@qq'),concat('a',100002),concat('b',100002));
Query OK, 1 row affected (0.00 sec)


#db3
mysql> insert into t3 values(4,'xixixi');
Query OK, 1 row affected (0.00 sec)
```



**查看每张表的数据**

每张表都在原先的基础上增加了一行数据

```shell
#db1的两张表
mysql> select count(*) from db1_t1;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.03 sec)

mysql> select count(*) from db1_t2;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)

#db2的两张表
mysql> select count(*) from db2_t1;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db2_t2;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)

#db3的一张表
mysql> select count(*) from t3;
+----------+
| count(*) |
+----------+
|        4 |
+----------+
1 row in set (0.00 sec)
```



#### 3.2.2.2 执行增备命令

```shell
innobackupex -uroot -p1  --no-timestamp --incremental /backup/bak_incr2 --incremental-basedir=/backup/bak_incr1
或
xtrabackup -uroot -p1 --backup --target-dir=/backup/bak_incr2 --incremental-basedir=/backup/bak_incr1
```



#### 3.2.2.3 增备完成查看备份的数据目录大小

```shell
$ pwd
/backup
$ du -sh *
90M	bak
3.2M	bak_incr1
3.2M	bak_incr2

#第一次增备的数据大小
$ du -sh *
4.0K	backup-my.cnf
100K	db1
100K	db2
24K	db3
4.0K	ib_buffer_pool
176K	ibdata1.delta
4.0K	ibdata1.meta
1.2M	mysql
1.1M	performance_schema
604K	sys
4.0K	xtrabackup_binlog_info
4.0K	xtrabackup_checkpoints
4.0K	xtrabackup_info
4.0K	xtrabackup_logfile


#基于增备的数据大小
du -sh *
4.0K	backup-my.cnf
100K	db1
100K	db2
24K	db3
4.0K	ib_buffer_pool
144K	ibdata1.delta
4.0K	ibdata1.meta
1.2M	mysql
1.1M	performance_schema
604K	sys
4.0K	xtrabackup_binlog_info
4.0K	xtrabackup_checkpoints
4.0K	xtrabackup_info
4.0K	xtrabackup_logfile
```



#### 3.2.2.4 基于增备的`xtrabackup_checkpoints`与增备的`xtrabackup_checkpoints`文件对比

**<span style=color:red>之前增备中的`from_lsn = 332706875`与全备中的`to_lsn = 332706875`是相同的</span>**



**<span style=color:red>基于增备的增备`from_lsn = 332708551`与基于全备的增备中的`to_lsn = 332708551`是相同的</span>**

```shell
#基于全备的增备
$ cat xtrabackup_checkpoints 
backup_type = incremental
from_lsn = 332706875
to_lsn = 332708551
last_lsn = 332708560
compact = 0
recover_binlog_info = 0
flushed_lsn = 332708560


#基于增备的增备份
$ cat xtrabackup_checkpoints 
backup_type = incremental
from_lsn = 332708551
to_lsn = 332710179
last_lsn = 332710188
compact = 0
recover_binlog_info = 0
flushed_lsn = 332710188
```



## 3.3 增备恢复

### 3.3.1 先准备一个全备

```shell
innobackupex -uroot -p1 --apply-log --redo-only /backup/bak
或
xtrabackup -uroot -p --backup --target-dir=/backup/bak
```



### 3.3.2 将增备1应用到全备份

**增备1就是基于全备的增备，也就是第一次增备<span style=color:red>⚠️这里要加`--redo-only`参数</span>**

这次要加入`--redo-only`参数，因为在每个备份过程中，都会碰到一些事务进来执行，而备份结束时可能有些事务并没有执行完毕，所以在默认prepare中这些事务就会被回滚（rollback），而加入了`--redo-only`就不会回滚这些事务，而是等待prepare下次增备。

```shell
innobackupex -uroot -p1 --apply-log --redo-only /backup/bak --incremental-dir=/backup/bak_incr1
或
xtrabackup -uroot -p1 --prepare --apply-log-only --target-dir=/backup/bak --incremental-dir=/backup/bak_incr1
```



### 3.3.3 将增备2应用到全备

**增备2就是基于增备的增备，<span style=color:red>⚠️这里不要加`--redo-only`参数</span>**

```shell
innobackupex -uroot -p1 --apply-log /backup/bak --incremental-dir=/backup/bak_incr2
或
xtrabackup -uroot -p1 --prepare --target-dir=/backup/bak --incremental-dir=/backup/bak_incr2
```



### 3.3.4 把所有合在一起的完全备份整体进行一次apply操作，回滚未提交的数据

```shell
innobackupex -uroot -p1 --apply-log /backup/bak
或
xtrabackup --prepare --apply-log --target-dir=/backup/bak
```



### 3.3.5 删除db1-3数据库

```mysql
mysql> drop database db1;
Query OK, 2 rows affected (0.00 sec)

mysql> drop database db2;
Query OK, 2 rows affected (0.01 sec)

mysql> drop database db3;
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.00 sec)
```



### 3.3.6 停止mysql，删除原先数据目录

**停止mysql**

```shell
$ /etc/init.d/mysqld stop
Shutting down MySQL.... SUCCESS! 
```



### 3.3.7 删除原先数据目录或者修改名称

**<span style=color:red>⚠️恢复数据之前需要保证数据目录是空的状态</span>**

mysql安装的数据目录为`/usr/local/mysql/data`

```shell
#如果做删除操作，最好先备份然后再删除，虽然数据已经丢失一部分，这里选择修改目录名称
mv /usr/local/mysql/data{,-bak}
```



### 3.3.8 进行数据恢复

**这里要注意，恢复的时候mysql配置文件`[mysqld]`下一定要指定mysql data目录**

```shell
innobackupex -uroot -p1 --copy-back /backup/bak
或
xtrabackup -uroot p1 --copy-back --target-dir=/backup/bak
```



### 3.3.9 给恢复的目录重新授权所有者为mysql

```shell
chown -R mysql.mysql /usr/local/mysql/data
```



### 3.3.10 启动mysql

```shell
$ /etc/init.d/mysqld start
Starting MySQL.Logging to '/usr/local/mysql/data/error.log'.
. SUCCESS! 
```



### 3.3.11 验证数据恢复

**验证数据库是否还原**

```shell
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| db1                |
| db2                |
| db3                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
7 rows in set (0.00 sec)
```



**验证表中的数据是否还原**

```shell
#db1，有两张表，每张表中有10万零2条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| db1_t1        |
| db1_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db1_t1;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db1_t2;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)


#db2，有两张表，每张表中有10万零2条数据
mysql> use db1;
mysql> show tables;
+---------------+
| Tables_in_db2 |
+---------------+
| db2_t1        |
| db2_t2        |
+---------------+
2 rows in set (0.00 sec)

mysql> select count(*) from db2_t1;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.04 sec)

mysql> select count(*) from db2_t2;
+----------+
| count(*) |
+----------+
|   100002 |
+----------+
1 row in set (0.03 sec)


#db3，有1张表，表中4行数据
mysql> use db3;
mysql> show tables;
+---------------+
| Tables_in_db3 |
+---------------+
| t3            |
+---------------+
1 row in set (0.00 sec)

mysql> select count(*) from t3;
+----------+
| count(*) |
+----------+
|        4 |
+----------+
1 row in set (0.00 sec)
```



**`innobackupex`命令与`xtrabackup`命令的区别**

```shell
#全备
innobackupex --user=root --password=1 backup

xtrabackup -uroot -p --backup --target-dir=/data/backups/



#增备
innobackupex -uroot -p1  --no-timestamp --incremental /backup/bak_incr2 --incremental-basedir=/backup/bak_incr1

xtrabackup -uroot -p1 --backup --target-dir=/backup/bak_incr2 --incremental-basedir=/backup/bak_incr1
```



**需要注意的点**

- [`xtrabackup --apply-log-only`](https://www.percona.com/doc/percona-xtrabackup/2.4/xtrabackup_bin/xbk_option_reference.html#cmdoption-xtrabackup-apply-log-only)合并除最后一个以外的所有增量时使用

- 增量备份的步骤与完全备份的步骤不同。在完全备份中，执行两种类型的操作以使数据库保持一致：已提交的事务相对于数据文件从日志文件中重放，未提交的事务被回滚。准备增量备份时，必须跳过未提交事务的回滚，因为在备份时未提交的事务可能正在进行中，并且很有可能将在下一次增量备份中提交。您应该使用该 选项来防止回滚阶段。[`xtrabackup --apply-log-only`](https://www.percona.com/doc/percona-xtrabackup/2.4/xtrabackup_bin/xbk_option_reference.html#cmdoption-xtrabackup-apply-log-only)

  ⚠️**如果不使用该选项[`xtrabackup --apply-log-only`](https://www.percona.com/doc/percona-xtrabackup/2.4/xtrabackup_bin/xbk_option_reference.html#cmdoption-xtrabackup-apply-log-only)阻止回滚阶段，则增量备份将无用**。事务回滚后，不能再应用增量备份





# 4.备份脚本

**授权**

```mysql
CREATE USER 'bkpuser'@'localhost' IDENTIFIED BY 'bkpuser@1234';
GRANT RELOAD, LOCK TABLES, PROCESS, REPLICATION CLIENT,super ON *.* TO 'bkpuser'@'localhost';
FLUSH PRIVILEGES;
```



**全备脚本**

```shell
#!/bin/bash  
local_ip="$(/sbin/ifconfig ens160|grep 'inet'|grep -v '::'| awk  '{print $2}')" 
user='bkpuser' 
passwd='bkpuser@1234' 
config='/etc/my.cnf' 
backup_path='/tmsdata/xtrabackup_full' 
backup_date=`date  +"%Y%m%d_%H%M%S"` 
backup_dir="$backup_path/$backup_date/"
backup_log="$backup_path/log"


#邮件设置
title1='percona xtrabackup information(success)'  
title2='percona xtrabackup information(failed)'  
content1='Server_name:'$(hostname)' \n Server_ip:'$local_ip' \n '$(date +"%y-%m-%d %H:%M:%S")' \n mysql full backup Success!'
content2='Server_name:'$(hostname)' \n Server_ip:'$local_ip' \n '$(date +"%y-%m-%d %H:%M:%S")' \n mysql full backup Faild!'

#判断备份目录是否存在
if [ ! -d "$backup_dir" ] && [ ! -d "$backup_log" ];then  
    mkdir -p $backup_dir  && mkdir -p $backup_log
fi  
#[[ -d $backup_dir ]] || mkdir -p $backup_dir
#[[ -d $backup_log ]] || mkdir -p $backup_log

echo "=========================================Start to backup at $(date +%Y%m%d-%H:%M:%S)=========================================" >> $backup_log/$backup_date.log

#开始备份
xtrabackup --defaults-file=$config --user=$user --password="$passwd"  --backup --target-dir=$backup_dir &>> $backup_log/$backup_date.log

if [ $? -eq 0 ];then  
    echo "Backup is success! at $(date +%Y%m%d%H%M)"  
    echo "Server_name:$(hostname) Server_ip:$local_ip $(date +"%y-%m-%d %H:%M:%S") mysql full backup Success!" >> $backup_log/$backup_date.log
    echo "$content1" | mail -s "$title1"  huangwb@fslgz.com
else  
    echo "Backup is Fail! at $(date +%Y%m%d%H%M)"  
    echo "Server_name:$(hostname) Server_ip:$local_ip $(date +"%y-%m-%d %H:%M:%S") mysql full backup Fail!" >> $backup_log/$backup_date.log
    echo "$content2" | mail -s "$title2"  huangwb@fslgz.com  
fi  

sleep 3
#xtrabackup从该文件读取最近一次的全备路径
egrep ".* Backup created in directory .*" $backup_log/$backup_date.log >> $backup_path/complete.info



#清除超过14天的备份
find $backup_path -mtime +14 -type d  -exec rm -rf {} \;

echo "Backup Process Done"  
```





**增备脚本**

```shell
#!/bin/bash  
local_ip="$(/sbin/ifconfig ens160|grep 'inet'|grep -v '::'| awk  '{print $2}')" 
user='bkpuser' 
passwd='bkpuser@1234' 
config='/etc/my.cnf' 
backup_full='/tmsdata/xtrabackup_full' 
backup_path='/tmsdata/xtrabackup_incr'
backup_date=`date  +"%Y%m%d_%H%M%S"` 
backup_dir="$backup_path/$backup_date/"
backup_log="$backup_path/log"
FULL_BASE_DIR=$(tail -1 $backup_full/complete.info | cut -d\' -f2)

#判断备份目录是否存在
if [ ! -d "$backup_dir" ] && [ ! -d "$backup_log" ];then  
    mkdir -p $backup_dir  && mkdir -p $backup_log
fi  
#[[ -d $backup_dir ]] || mkdir -p $backup_dir
#[[ -d $backup_log ]] || mkdir -p $backup_log

echo "========================================xtrabackup根据$FULL_BASE_DIR目录开始增备=========================================" >> $backup_log/$backup_date.log
#邮件设置
title1='percona xtrabackup information(success)'  
title2='percona xtrabackup information(failed)'  
content1='Server_name:'$(hostname)' <br> Server_ip:'$local_ip' <br> '$(date +"%y-%m-%d %H:%M:%S")' <br> mysql increment backup Success!'
content2='Server_name:'$(hostname)' <br> Server_ip:'$local_ip' <br> '$(date +"%y-%m-%d %H:%M:%S")' <br> mysql increment backup Faild!'

echo "=========================================Start to backup at $(date +%Y%m%d-%H:%M:%S)=========================================" >> $backup_log/$backup_date.log



#开始备份
xtrabackup --defaults-file=$config --user=$user --password="$passwd"  --backup --target-dir=$backup_dir --incremental-basedir=$FULL_BASE_DIR &>> $backup_log/$backup_date.log

if [ $? -eq 0 ];then  
    echo "Backup is success! at $(date +%Y%m%d%H%M)"  
    echo "Server_name:$(hostname) Server_ip:$local_ip $(date +"%y-%m-%d %H:%M:%S") mysql full backup Success!" >> $backup_log/$backup_date.log
    echo "$content1" | mail -s "$title1"  huangwb@fslgz.com
else  
    echo "Backup is Fail! at $(date +%Y%m%d%H%M)"  
    echo "Server_name:$(hostname) Server_ip:$local_ip $(date +"%y-%m-%d %H:%M:%S") mysql full backup Fail!" >> $backup_log/$backup_date.log
    echo "$content2" | mail -s "$title2"  huangwb@fslgz.com  
fi  


#清除超过14天的备份
find $backup_path -mtime +14 -type d  -exec rm -rf {} \;

echo "Backup Process Done"  
```



