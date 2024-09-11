[toc]



# mysql逻辑备份	mysqldump

[mysql5.7官方手册](https://dev.mysql.com/doc/refman/5.7/en/)

[mysql5.7备份和恢复官方文档](https://dev.mysql.com/doc/refman/5.7/en/backup-and-recovery.html)



## 1.mysql备份

### 1.1 为什么要备份

- **防止数据丢失**

- **恢复数据并在出现问题（例如系统崩溃、硬件故障或用户误删除数据）时重新启动并运行**



### 1.2 数据的备份和恢复类型

#### 1.2.1 物理与逻辑备份

:::tip说明

物理备份包括存储数据库内容的目录和文件的原始副本。这种备份适用于发生问题时需要快速恢复的大型、重要的数据库。

逻辑备份保存表示为逻辑数据库结构（[`CREATE DATABASE`](https://dev.mysql.com/doc/refman/5.7/en/create-database.html)、 [`CREATE TABLE`](https://dev.mysql.com/doc/refman/5.7/en/create-table.html)语句）和内容（[`INSERT`](https://dev.mysql.com/doc/refman/5.7/en/insert.html)语句或分隔文本文件）的信息。这种类型的备份适用于您可以编辑数据值或表结构，或在不同机器架构上重新创建数据的少量数据。

:::



**物理备份特点**

- 物理备份方法比逻辑备份方法更快，因为它们只涉及文件复制而不进行转换
- 备份包括数据库目录和文件的精确副本
- 备份比逻辑备份更小
- 备份和恢复粒度范围从整个数据目录级别到单个文件级别
- 除了数据库之外，备份还可以包括任何相关文件，例如日志或配置文件
- 可以在 MySQL 服务器未运行时执行备份
- 备份只能移植到具有相同或相似硬件特征的其他机器
- 用物理备份这种方式备份MEMORY表中的数据比较困难，因为它们的内容并不存储在磁盘上
- 物理备份工具包括MySQL Enterprise backup for InnoDB或任何其他表的mysqlbackup，或MyISAM表的文件系统级命令(如cp、scp、tar、rsync)



**逻辑备份特点**

- 备份是通过查询MySQL服务器获取数据库结构和内容信息来完成的
- 备份比物理方法慢，因为服务器必须访问数据库信息并将其转换为逻辑格式。如果输出是在客户端写的，服务器端也必须将它发送给备份程序
- 备份输出大于物理备份，尤其是在以文本格式保存时
- 备份和还原粒度在服务器级别（所有数据库）、数据库级别（特定数据库中的所有表）或表级别可用。无论存储引擎如何，都是如此
- 备份不包括日志或配置文件，或不属于数据库的其他与数据库相关的文件
- 以逻辑格式存储的备份与机器无关且具有高度可移植性
- 逻辑备份是在 MySQL 服务器运行的情况下执行的
- 逻辑备份工具包括[**mysqldump**](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html) 程序和[`SELECT ... INTO OUTFILE`](https://dev.mysql.com/doc/refman/5.7/en/select.html)语句。这些适用于任何存储引擎，甚至`MEMORY`
- [**要恢复逻辑备份，可以使用mysql**](https://dev.mysql.com/doc/refman/5.7/en/mysql.html)客户端 处理 SQL 格式的转储文件。要加载分隔文本文件，请使用[`LOAD DATA`](https://dev.mysql.com/doc/refman/5.7/en/load-data.html)语句或[**mysqlimport**](https://dev.mysql.com/doc/refman/5.7/en/mysqlimport.html) 客户端





#### 1.2.2 在线与离线备份

:::tip说明

在线备份在 MySQL 服务器运行时进行，以便可以从服务器获取数据库信息。服务器停止时进行离线备份。这种区别也可以描述为 `热` 备份与`冷` 备份；`热` 备份是服务器保持运行但在您从外部访问数据库文件时锁定以防止修改数据的备份。

:::



**在线备份特点**

- 备份对其他客户端的干扰较小，这些客户端可以在备份期间连接到 MySQL 服务器，并且可以根据需要执行的操作访问数据。
- 必须注意施加适当的锁定，以便不会发生会损害备份完整性的数据修改。



**离线备份特点**

- 客户端可能会受到不利影响，因为服务器在备份期间不可用。出于这个原因，此类备份通常取自可以脱机而不会损害可用性的副本服务器。
- 备份过程更简单，因为不可能受到客户端活动的干扰。





#### 1.2.3 本地与远程备份

:::tip说明

本地备份在运行 MySQL 服务器的同一主机上执行，而远程备份则在不同的主机上执行。对于某些类型的备份，即使输出是在服务器本地写入的，也可以从远程主机启动备份。

:::

**本地与远程备份特点**

- [**mysqldump**](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html)可以连接到本地或远程服务器。对于 SQL 输出（`CREATE`和 [`INSERT`](https://dev.mysql.com/doc/refman/5.7/en/insert.html)语句），可以完成本地或远程转储并在客户端生成输出。对于分隔文本输出（使用选项 [`--tab`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_tab)），数据文件在服务器主机上创建。
- [`SELECT ... INTO OUTFILE`](https://dev.mysql.com/doc/refman/5.7/en/select-into.html)可以从本地或远程客户端主机启动，但输出文件是在服务器主机上创建的。
- 物理备份方法通常在 MySQL 服务器主机上本地启动，以便服务器可以脱机，尽管复制文件的目的地可能是远程的。



#### 1.2.4 快照备份

一些文件系统实现允许拍摄 `快照` 。这些在给定的时间点提供文件系统的逻辑副本，而不需要整个文件系统的物理副本。（例如，实现可能使用写时复制技术，以便只需要复制在快照时间之后修改的文件系统部分。）MySQL 本身不提供获取文件系统快照的功能。它可通过 Veritas、LVM 或 ZFS 等第三方解决方案获得。



#### 1.2.5 完全备份与增量备份

完整备份包括在给定时间点由 MySQL 服务器管理的所有数据。增量备份包含在给定时间范围内（从一个时间点到另一个时间点）对数据所做的更改。MySQL 有不同的方法来执行完整备份，例如本节前面描述的方法。通过启用服务器的二进制日志可以实现增量备份，服务器使用二进制日志来记录数据更改。



![iShot_2023-03-29_16.57.04](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-29_16.57.04.png)





### 1.3 备份命令



| 命令        | 方式     | 说明                                    |
| ----------- | -------- | --------------------------------------- |
| mysqldump   | 逻辑备份 | mysql原生自带很好用的逻辑备份工具       |
| mysqlbinlog | 逻辑备份 | 实现binlog备份的原生态命令              |
| xtrabackup  | 物理备份 | precona公司开发的性能很高的物理备份工具 |



#### 1.5 mysql备份方式总结

| **备份方法** | **备份速度** | **恢复速度** | **便捷性**                       | **功能** | **一般用于**       |
| ------------ | ------------ | ------------ | -------------------------------- | -------- | ------------------ |
| cp           | 快           | 快           | 一般、灵活性低                   | 很弱     | 少量数据备份       |
| mysqldump    | 慢           | 慢           | 一般、可无视存储引擎的差异       | 一般     | 中小型数据量的备份 |
| lvm2快照     | 快           | 快           | 一般、支持几乎热备、速度快       | 一般     | 中小型数据量的备份 |
| xtrabackup   | 较快         | 较快         | 实现innodb热备、对存储引擎有要求 | 强大     | 较大规模的备份     |





## 2.mysqldump备份

:::tip说明

**mysqldump的三种语法**

`mysqldump [options] db_name [tbl_name ...]`

`mysqldump [options] --databases db_name ...`

`mysqldump [options] --all-databases`

:::



### 2.1 利用存储过程生成大量数据

#### 2.1.1 创建数据库

```shell
mysql> create database db1;
Query OK, 1 row affected (0.00 sec)
```



#### 2.1.2 创建表

```shell
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
```



#### 2.1.3 创建存储过程

```shell
mysql> delimiter $$ # 声明存储过程的结束符号为$$
mysql> create procedure auto_insert1()
    BEGIN
        declare i int default 1;
        while(i<100001)do	# 插入10万条数据
            insert into db1_t1 values(i,'xboyww','man',concat( 'xboyww',i,'@qq'),concat('a',i),concat('b',i));
            set i=i+1;
        end while;
    END$$ # $$结束
Query OK, 0 rows affected (0.00 sec)

mysql> delimiter ; # 重新声明分号为结束符号，注意有空格
```



#### 2.1.4 查看存储过程

```shell
mysql> show create procedure auto_insert1\G
```



#### 2.1.5 调用存储过程

```shell
mysql> call auto_insert1();
```



#### 2.1.6 查看数据

```shell
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
```



#### 2.1.7 删除存储过程

```shell
mysql> DROP PROCEDURE auto_insert1;
```



**生成的数据库和表**

```shell
db1
  db1_t1	10万条数据
  db1_t2	10万条数据
  
db2
  db2_t1	10万条数据
  db2_t2	10万条数据
```



**mysqldump连接服务端选项**

| 选贤 | 说明           |
| ---- | -------------- |
| `-u` | 指定用户       |
| `-p` | 指定密码       |
| `-S` | 指定套接字文件 |
| `-h` | 指定主机       |
| `-P` | 指定端口       |





### 2.2 全库备份	

`-A,--all-databases`

```shell
mysqldump -uroot -p -A >all.sql
```



### 2.3 单库、多库备份	

`-B,--databases`



**单库备份，可以不加选项 `-B`**

```shell
mysqldump -uroot -p -B db1 > db1.sql
或者
mysqldump -uroot -p db1 > db1.sql
```



**多库备份，必须加参数 `-B`**

```shell
mysqldump -uroot -p -B db1 db2 > db1_db2.sql
```



### 2.4 单表、多表备份	

:::tip说明

单表、多表备份不需要参数

:::



**单表备份**

```shell
mysqldump -uroot -p db1 db1_t1 > db1.db1_t1.sql
```



**多表备份**

```shell
mysqldump -uroot -p db1 db1_t1 db1_t2 > db1.db1_t1_t2.sql
```



### 2.5 备份的一些选项

#### 2.5.1 `--master-data`	

:::tip说明

**备份时加入 `change master` 语句，需要开启binlog日志**

:::



**有3个参数**

| 参数 | 说明   |
| ---- | ------ |
| 0    | 没有   |
| 1    | 不注释 |
| 2    | 注释   |



**当参数为0时，备份的文件中是没有`change master to`语句的**

```shell
mysqldump -uroot -p -B db1 --master-data=0 > db1.sql
```



**当参数为1时，备份的文件中就会有`change master to`语句，并且没有注释**

:::tip说明

备份的sql文件中会有 `change master to` 语句，并且没有注释

```shell
$ grep 'CHANGE MASTER' db1.sql
CHANGE MASTER TO MASTER_LOG_FILE='binlog.000004', MASTER_LOG_POS=154;
```

:::

```shell
mysqldump -uroot -p -B db1 --master-data=1 > db1.sql
```



**当参数为2时，备份的文件中就会有`change master to`语句，并且是注释的**

:::tip说明

备份的sql文件中会有change master to语句，并且是注释的

```shell
$ grep 'CHANGE MASTER' db1.sql
-- CHANGE MASTER TO MASTER_LOG_FILE='binlog.000004', MASTER_LOG_POS=154;
```

:::

```shell
mysqldump -uroot -p -B db1 --master-data=2 > db1.sql
```





#### 2.5.2 `-R, --routines`	备份存储过程和函数数据

```shell
mysqldump -uroot -A -R --master-data=2 > all.sql
```



#### 2.5.3 `--triggers`	备份触发器数据

**默认启用，使用选项 `--skip-triggers` 禁用**

```shell
mysqldump -uroot -A --triggers --master-data=2 > all.sql
```



#### 2.5.4 `--single-transaction`	快照备份，仅对InnoDB引擎生效

**此选项将事务隔离模式设置为， [`REPEATABLE READ`](https://dev.mysql.com/doc/refman/5.7/en/innodb-transaction-isolation-levels.html#isolevel_repeatable-read) 并 [`START TRANSACTION`](https://dev.mysql.com/doc/refman/5.7/en/commit.html)**

```shell
mysqldump -uroot -A --single-transaction --master-data=2 > all.sql
```



#### 2.5.5 `-x,--lock-all-tables`	锁表备份

**锁定所有数据库中的所有表，此选项将自动关闭 [`--single-transaction`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_single-transaction)和 [`--lock-tables`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_lock-tables)**

```shell
mysqldump -uroot -A -x --master-data=2 > all.sql
```



## 3.mysqldump恢复

```shell
# 先不记录二进制日志
mysql> set sql_log_bin=0;

# 库内恢复操作
mysql> source /backup/all.sql

# 库外恢复操作
mysql -uroot -p < /backup/all.sql
```



**mysqldump恢复特点**

- mysqldump在备份和恢复时都需要MySQL实例启动
- mysqldump是以覆盖的形式恢复数据的



