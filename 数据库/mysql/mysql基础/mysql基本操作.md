[toc]



# mysql基础	mysql基本操作

**Mysql 关系型数据库，表跟表之间可以建立关系**

**库-->表：列(字段	faield)**	

​				**行(记录	record)**



# 1.连接mysql

> mysql -u用户名 -p密码

```python
[root@mysql ~]# mysql -u root -p
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32
Server version: 5.6.40 MySQL Community Server (GPL)

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```



# 2.设置root密码

**方法一	命令行设置**

- mysqladmin -uroot password '密码'

**方法二	进入mysql设置**

- set password = password('密码');



# 3.mysql初始安全设置

**mysql_secure_installation**

```python
[root@mysql ~]# mysql_secure_installation
Enter current password for root (enter for none):			#输入root密码
Change the root password? [Y/n] 					            #是否改变root密码
Remove anonymous users? [Y/n]					            #是否移除匿名用户
Disallow root login remotely? [Y/n]					        #是否允许root远程登陆
Remove test database and access to it? [Y/n] 			    #是否移除test库并且不能访问
Reload privilege tables now? [Y/n]					        #是否重新加载权限表

Enter current password for root (enter for none):			#输入root密码
```

# 4.mysql文件(yum安装)

```python
[root@mysql ~]# cd /var/lib/mysql/
[root@mysql mysql]# ls
ibdata1  ib_logfile0  ib_logfile1  mysql  mysql.sock
	
ibdata1							#InnoDB存储引擎的系统表空间，存放InnoDB表的数据、回滚段
ib_logfile0、ib_logfile1			#InnoDB日志文件组
mysql							#数据库 库名字
mysql.sock						#mysql的socket文件，用于本机用户登陆mysql
		
mysql主配置文件		/etc/my.cnf
```

# 5.库的管理

## 5.1创建数据库

**create database 数据库名**

```python
mysql> create database DB1;
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB1                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.05 sec)
```

## 5.2删除数据库

**drop database 数据库名**

```python
mysql> drop database DB1;
Query OK, 0 rows affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.09 sec)
```

## 5.3查询数据库

**show databases**

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
+--------------------+
2 rows in set (0.00 sec)
```

## 5.4使用数据库

**use 数据库名**

```python
mysql> use DB1;
Database changed

mysql> select database();		#查看当前使用哪个数据库
+------------+
| database() |
+------------+
| DB1        |
+------------+
1 row in set (0.00 sec)
```

# 6.表的管理

## 6.1创建表

**create table 表名(列名1 数据类型,列名2 数据类型);**

```python
mysql> create table t1(id int(3),name char(30),sex enum('M','F'),hobby set('a','b','c'));
Query OK, 0 rows affected (0.03 sec)
	
#desc 表名	//描述表
mysql> desc t1;
+-------+------------------+------+-----+---------+-------+
| Field | Type             | Null | Key | Default | Extra |
+-------+------------------+------+-----+---------+-------+
| id    | int(3)           | YES  |     | NULL    |       |
| name  | char(30)         | YES  |     | NULL    |       |
| sex   | enum('M','F')    | YES  |     | NULL    |       |
| hobby | set('a','b','c') | YES  |     | NULL    |       |
+-------+------------------+------+-----+---------+-------+
4 rows in set (0.13 sec)



#insert into 表名 values(......);		//向表中插入数据
mysql> insert into t1 values(1,'xiaoming','M','a,b,c');
Query OK, 1 row affected (0.00 sec)
mysql> select * from t1;
+----+----------+-----+-------+
| id | name     | sex | hobby |
+----+----------+-----+-------+
|  1 | xiaoming | M   | a,b,c |
+----+----------+-----+-------+
1 row in set (0.12 sec)
```



## 6.2删除表

**删除一个表**

- **drop table 表名**

**删除多个表**

- **drop table 表1,表2，。。。表n;**

```python
#删除一个表
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
+---------------+
1 row in set (0.13 sec)
 
mysql> drop table t1;
Query OK, 0 rows affected (0.12 sec)


#删除多个表
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
| t2            |
+---------------+
2 rows in set (0.16 sec)
 
mysql> drop table t1,t2;
Query OK, 0 rows affected (0.20 sec)
```



## 6.3修改表

### 6.3.1增加列

**alter table 表名 add 列名 数据类型;**

```python
#查看t1表，此时表中只有一个列id，现在想增加一个列name
mysql> desc t1;
+-------+--------+------+-----+---------+-------+
| Field | Type   | Null | Key | Default | Extra |
+-------+--------+------+-----+---------+-------+
| id    | int(3) | YES  |     | NULL    |       |
+-------+--------+------+-----+---------+-------+
1 row in set (0.10 sec)

#给t1表增加列name
mysql> alter table t1 add name char(10);
Query OK, 0 rows affected (0.15 sec)
Records: 0  Duplicates: 0  Warnings: 0
 
#查看t1表，已经增加name列 
mysql> desc t1;
+-------+----------+------+-----+---------+-------+
| Field | Type     | Null | Key | Default | Extra |
+-------+----------+------+-----+---------+-------+
| id    | int(3)   | YES  |     | NULL    |       |
| name  | char(10) | YES  |     | NULL    |       |
+-------+----------+------+-----+---------+-------+
2 rows in set (0.10 sec)


add增加列默认是在最后边添加，如果需要指定追到的位置需要做以下操作

#t2表内容如下，现在要追加一个phone列，追加到name列的后边
mysql> desc t2;
+---------+----------+------+-----+---------+-------+
| Field   | Type     | Null | Key | Default | Extra |
+---------+----------+------+-----+---------+-------+
| id      | int(11)  | YES  |     | NULL    |       |
| name    | char(10) | YES  |     | NULL    |       |
| address | char(30) | YES  |     | NULL    |       |
+---------+----------+------+-----+---------+-------+
3 rows in set (0.01 sec)

#需要用到after关键字，此语句表明在name列后追加phone列
mysql> alter table t2 add phone char(11) after name;
Query OK, 0 rows affected (0.04 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc t2;
+---------+----------+------+-----+---------+-------+
| Field   | Type     | Null | Key | Default | Extra |
+---------+----------+------+-----+---------+-------+
| id      | int(11)  | YES  |     | NULL    |       |
| name    | char(10) | YES  |     | NULL    |       |
| phone   | char(11) | YES  |     | NULL    |       |
| address | char(30) | YES  |     | NULL    |       |
+---------+----------+------+-----+---------+-------+
4 rows in set (0.00 sec)


#如果要追加到第一列，需要用到first关键字
mysql> alter table t2 add sex enum('F','M') first;
Query OK, 0 rows affected (0.05 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc t2;
+---------+---------------+------+-----+---------+-------+
| Field   | Type          | Null | Key | Default | Extra |
+---------+---------------+------+-----+---------+-------+
| sex     | enum('F','M') | YES  |     | NULL    |       |
| id      | int(11)       | YES  |     | NULL    |       |
| name    | char(10)      | YES  |     | NULL    |       |
| phone   | char(11)      | YES  |     | NULL    |       |
| address | char(30)      | YES  |     | NULL    |       |
+---------+---------------+------+-----+---------+-------+
5 rows in set (0.00 sec)


⚠️⚠️⚠️ 修改列中不支持before，只有after和first
```



### 6.3.2删除列

**alter table 表名 drop 列名;** 

```python
#查看t1表，表中有两个列id和name,现在要删除name列
mysql> desc t1;
+-------+----------+------+-----+---------+-------+
| Field | Type     | Null | Key | Default | Extra |
+-------+----------+------+-----+---------+-------+
| id    | int(3)   | YES  |     | NULL    |       |
| name  | char(10) | YES  |     | NULL    |       |
+-------+----------+------+-----+---------+-------+
2 rows in set (0.10 sec)


#删除name列
mysql> alter table t1 drop name;
Query OK, 0 rows affected (0.14 sec)
Records: 0  Duplicates: 0  Warnings: 0
 
#查看t1表name列已经删除 
mysql> desc t1;
+-------+--------+------+-----+---------+-------+
| Field | Type   | Null | Key | Default | Extra |
+-------+--------+------+-----+---------+-------+
| id    | int(3) | YES  |     | NULL    |       |
+-------+--------+------+-----+---------+-------+
1 row in set (0.12 sec)
```



### 6.3.3修改列名

**alter table 表名 change 旧列名 新列名 数据类型;**

**<span style={{color: 'red'}}>change既可以修改列名，又可以修改列类型</span>**

```python
#查看t1表，表中有id和name两个列，现在要将name列修改为address列
mysql> desc t1;
+-------+----------+------+-----+---------+-------+
| Field | Type     | Null | Key | Default | Extra |
+-------+----------+------+-----+---------+-------+
| id    | int(3)   | YES  |     | NULL    |       |
| name  | char(10) | YES  |     | NULL    |       |
+-------+----------+------+-----+---------+-------+
2 rows in set (0.10 sec)


#修改name列
mysql> alter table t1 change name address varchar(30);
Query OK, 0 rows affected (0.19 sec)
Records: 0  Duplicates: 0  Warnings: 0
 
#查看t1表，原name列已经修改为address，列类型已由char修改为varchar  
mysql> desc t1;
+---------+-------------+------+-----+---------+-------+
| Field   | Type        | Null | Key | Default | Extra |
+---------+-------------+------+-----+---------+-------+
| id      | int(3)      | YES  |     | NULL    |       |
| address | varchar(30) | YES  |     | NULL    |       |
+---------+-------------+------+-----+---------+-------+
2 rows in set (0.17 sec)
```



### 6.3.4修改列的数据类型

**alter table 表名 modify 列名 新列数据类型;**

```python
#t1表中有id列和address列，现在要把address列的数据类型由varchar改为char
mysql> desc t1;
+---------+-------------+------+-----+---------+-------+
| Field   | Type        | Null | Key | Default | Extra |
+---------+-------------+------+-----+---------+-------+
| id      | int(3)      | YES  |     | NULL    |       |
| address | varchar(30) | YES  |     | NULL    |       |
+---------+-------------+------+-----+---------+-------+
2 rows in set (0.16 sec)


#修改address列数据类型为char
mysql> alter table t1 modify address char(20);
Query OK, 0 rows affected (0.22 sec)
Records: 0  Duplicates: 0  Warnings: 0
 

#查看t1表，address列的数据类型已经修改为char
mysql> desc t1;
+---------+----------+------+-----+---------+-------+
| Field   | Type     | Null | Key | Default | Extra |
+---------+----------+------+-----+---------+-------+
| id      | int(3)   | YES  |     | NULL    |       |
| address | char(20) | YES  |     | NULL    |       |
+---------+----------+------+-----+---------+-------+
2 rows in set (0.19 sec)
```

### 6.3.5修改表名

**rename table 旧表名 to 新表名**

```python
#查看表，现在要将表t1修改为table1
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
+---------------+
1 row in set (0.14 sec)

#修改表t1为table1
mysql> rename table t1 to table1;
Query OK, 0 rows affected (0.16 sec)
 
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| table1        |
+---------------+
1 row in set (0.18 sec)
```



## 6.4查看表

**show tables**

```python
#先进入一个库
mysql> use db1;
Database changed

#查看库中所有的表
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
+---------------+
1 row in set (0.18 sec)
```



# 7.数据管理

## 7.1增加数据

**insert into 表名 values(......);**

**方式一	直接插入值**

```python
#查看表t1，现在是一张空表
mysql> desc t1;
+---------+----------+------+-----+---------+-------+
| Field   | Type     | Null | Key | Default | Extra |
+---------+----------+------+-----+---------+-------+
| id      | int(3)   | YES  |     | NULL    |       |
| address | char(20) | YES  |     | NULL    |       |
+---------+----------+------+-----+---------+-------+
2 rows in set (0.17 sec)

mysql> select * from t1;
Empty set


//向表中插入数据，插入一条
mysql> insert into t1 values(1,'北京');
Query OK, 1 row affected (0.19 sec)

//向表中插入数据，插入多条
mysql> insert into t1 values(2,'上海'),(3,'广州'),(4,'深圳');
Query OK, 3 rows affected (0.15 sec)
Records: 3  Duplicates: 0  Warnings: 0

//查看t1表中的数据
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  2 | 上海  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
4 rows in set (0.16 sec)
```

**方式二	从别的表中选择数据插入**

```python
#创建t1表
mysql> create table t1(id int primary key auto_increment,address char(10));
Query OK, 0 rows affected (0.02 sec)

//向表中插入数据
mysql> insert into t1(address) values('北京'),('杭州'),('深圳');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0
   
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京    |
|  2 | 杭州    |
|  3 | 深圳    |
+----+---------+
3 rows in set (0.00 sec)  
      
#创建t2表
mysql> create table t2(id int primary key auto_increment,address char(10));
Query OK, 0 rows affected (0.02 sec)

//将t1表中的内容插入到t2表中
mysql> insert into t2(select * from t1);
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0
      
mysql> select * from t2;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京    |
|  2 | 杭州    |
|  3 | 深圳    |
+----+---------+
3 rows in set (0.00 sec)  



⚠️如果两个表中的字段不一致，从另一张表中插入数据的时候需要手动指定字段
#创建t3表
mysql> create table t3(id int primary key auto_increment,address char(10),qnum tinyint);
Query OK, 0 rows affected (0.02 sec)

//此时想插入t1表的数据，需要手动指定一下两张表中的共同字段
mysql> insert into t3(id,address) (select * from t1);
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from t3;
+----+---------+------+
| id | address | qnum |
+----+---------+------+
|  1 | 北京    | NULL |
|  2 | 杭州    | NULL |
|  3 | 深圳    | NULL |
+----+---------+------+
3 rows in set (0.00 sec)
```



## 7.2删除数据

**delete from 表名 where 条件;**

```python
#查看t1表中的数据
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  2 | 上海  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
4 rows in set (0.16 sec)

//删除表中地址为上海的数据
mysql> delete from t1 where id=2;
Query OK, 1 row affected (0.16 sec)
 
//查看t1表中内容 
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
3 rows in set (0.16 sec)



#再次新建t1表
ysql> create table t1(id int primary key auto_increment,address char(10));
Query OK, 0 rows affected (0.02 sec)

//向t1表中插入数据
mysql> insert into t1(address) values('北京'),('上海'),('广州');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京    |
|  2 | 上海    |
|  3 | 广州    |
+----+---------+

//delete方式清空t1表
mysql> delete from t1;
Query OK, 3 rows affected (0.00 sec)

mysql> select * from t1;
Empty set (0.00 sec)

//向表中插入数据
mysql> insert into t1(address) values('杭州'),('深圳');
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

//发现并没有清空自增字段，如果需要清空自增字段，需要用到truncate语句
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  4 | 杭州    |
|  5 | 深圳    |
+----+---------+
2 rows in set (0.00 sec)
```

**truncate table 表名	清空表并重置自增字段**

```python
#创建一个t1表
mysql> create table t1(id int,address char(10));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t1 values(1,'北京');
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1;
+------+---------+
| id   | address |
+------+---------+
|    1 | 北京    |
+------+---------+
1 row in set (0.00 sec)

#truncate清空表，两种写法，truncate后边的table可以不加
mysql> truncate t1;
Query OK, 0 rows affected (0.01 sec)

mysql> truncate table t1;
Query OK, 0 rows affected (0.03 sec)

//查看表t1，已经清空
mysql> select * from t1;
Empty set (0.00 sec)




#再创建一个t2表，表中有自增字段
mysql> create table t2(id int primary key auto_increment,address char(10));
Query OK, 0 rows affected (0.02 sec)

//向表中插入数据
mysql> insert into t2(address) values('杭州'),('深圳');
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

mysql> select * from t2;
+----+---------+
| id | address |
+----+---------+
|  1 | 杭州    |
|  2 | 深圳    |
+----+---------+
2 rows in set (0.00 sec)

//truncate清空表
mysql> truncate t2;
Query OK, 0 rows affected (0.02 sec)

//向表中插入数据
mysql> insert into t2(address) values('杭州'),('深圳');
Query OK, 2 rows affected (0.01 sec)
Records: 2  Duplicates: 0  Warnings: 0

//truncate清空表的方式会将表中的自增字段同时删除，而delete from 表名的方式不可以删除自增      
mysql> select * from t2;
+----+---------+
| id | address |
+----+---------+
|  1 | 杭州    |
|  2 | 深圳    |
+----+---------+
2 rows in set (0.00 sec)
```



## 7.3修改数据

**update 表名 set 旧值=新值 where 条件;**

```python
#查看表t1，现在要将表中的上海修改为杭州
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  2 | 上海  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
4 rows in set (0.12 sec)


#修改表t1中地址为上海的列为杭州
mysql> update t1 set address='杭州' where id=2;
Query OK, 1 row affected (0.18 sec)
Rows matched: 1  Changed: 1  Warnings: 0
 
 
#查看表t1，上海已经修改为杭州 
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  2 | 杭州  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
4 rows in set (0.13 sec)
```



## 7.4查询数据

**select 列名 from 表名 where 条件**

```python
#查询表中所有内容
mysql> select * from t1;
+----+---------+
| id | address |
+----+---------+
|  1 | 北京  |
|  2 | 杭州  |
|  3 | 广州  |
|  4 | 深圳  |
+----+---------+
4 rows in set (0.14 sec)


#根据条件查询	查询t1表中id=1的address列
mysql> select address from t1 where id=1;
+---------+
| address |
+---------+
| 北京    |
+---------+
1 row in set (0.18 sec)

```

# 8.mysql常用函数

> 常用函数 
>
> user()                 #查看当前用户 
>
> database()		#查看当前所属库 
>
> version() 		  #查看MySQL版本 
>
> now()                #系统时间 
>
> sum()                #求和 
>
> avg()                 #平均值 
>
> max()                #最大值 
>
> min()                #最小值 
>
> count()             #统计数量

---

## 8.1user()	查看当前用户

```python
mysql> select user();
+----------------+
| user()         |
+----------------+
| root@localhost |
+----------------+
1 row in set (0.00 sec)

当前登陆用户是root，登陆的主机是本机
```



## 8.2database()	查看当前所在库

```python
mysql> select database();
+------------+
| database() |
+------------+
| db1        |
+------------+
1 row in set (0.12 sec)

当前所在数据库是db1
```



## 8.3version()	查看mysql版本

```python
mysql> select version();
+-----------+
| version() |
+-----------+
| 5.7.22    |
+-----------+
1 row in set (0.11 sec)

当前mysql版本是5.7.22
```



## 8.4now()	查看当前系统时间

```python
mysql> select now();
+---------------------+
| now()               |
+---------------------+
| 2018-10-25 21:10:18 |
+---------------------+
1 row in set (0.11 sec)

当前系统时间是2018年10月25日21时10分18秒
```



## 8.5sum()	求和

```python
#查看student表
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 80    |
|    3 | 小丽   | 70    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)

#求学生表中所有人的总成绩
mysql> select sum(score) as total_points from student;
+--------------+
| total_points |
+--------------+
|          374 |
+--------------+

#求学生表中成绩大于70分的总和
mysql> select sum(score) as total_points from student where score>=70;
+--------------+
| total_points |
+--------------+
|          249 |
+--------------+
1 row in set (0.00 sec)
```



## 8.6avg()	平均值

```python
#查看student表
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 80    |
|    3 | 小丽   | 70    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)

#求所有人分数的平均值
mysql> select avg(score) as avg_points from student;
+------------+
| avg_points |
+------------+
|       74.8 |
+------------+
1 row in set (0.00 sec)

#求70分以上的人的分数平均值
mysql> select avg(score) as avg_points from student where score>=70;
+------------+
| avg_points |
+------------+
|         83 |
+------------+
1 row in set (0.00 sec)
```



## 8.7max()	最大值

```python
#查看student表
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 80    |
|    3 | 小丽   | 70    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)


#查询student表中分数最高的
mysql> select max(score) from student;
+------------+
| max(score) |
+------------+
| 99         |
+------------+
1 row in set (0.00 sec)
```



## 8.8min()	最小值

```python
#查看student表
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 80    |
|    3 | 小丽   | 70    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)


#传student表中分数最低的
mysql> select min(score) from student;
+------------+
| min(score) |
+------------+
| 59         |
+------------+
1 row in set (0.00 sec)
```



## 8.9count()	统计数量

```python
#查看student表
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 80    |
|    3 | 小丽   | 70    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)


#查询student表中分数大于60的人数
mysql> select count(*) from student where score>60;
+----------+
| count(*) |
+----------+
|        4 |
+----------+
1 row in set (0.00 sec)
```



# 9.mysql数据查询操作

## 9.1数学运算	

``+   加法``

```python
mysql> select 1+1;
+-----+
| 1+1 |
+-----+
|   2 |
+-----+
1 row in set (0.00 sec)
```

``-   减法``

```python
mysql> select 100-1;
+-------+
| 100-1 |
+-------+
|    99 |
+-------+
1 row in set (0.00 sec)
```

``*   乘法``

```python
mysql> select 100*3;
+-------+
| 100*3 |
+-------+
|   300 |
+-------+
1 row in set (0.00 sec)
```

``/   除法``

```python
mysql> select 100/3;
+---------+
| 100/3   |
+---------+
| 33.3333 |
+---------+
1 row in set (0.00 sec)
```

``%   取余``

```python
mysql> select 7%3;
+------+
| 7%3  |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

``pow   幂运算``

```python
mysql> select pow(3,3);
+----------+
| pow(3,3) |
+----------+
|       27 |
+----------+
1 row in set (0.00 sec)

⚠️mysql中不支持**方式的幂运算，需要用到pow方法
```



## 9.2比较运算

``>   大于 ``

```python
#返回值为0表示结果为假
mysql> select 3>6;
+-----+
| 3>6 |
+-----+
|   0 |
+-----+
1 row in set (0.01 sec)

#返回值为1表示结果为真
mysql> select 6>3;
+-----+
| 6>3 |
+-----+
|   1 |
+-----+
1 row in set (0.00 sec)
```

``<   小于``

```python
#返回值为1表示结果为真
mysql> select 6>3;
+-----+
| 6>3 |
+-----+
|   1 |
+-----+
1 row in set (0.00 sec)

#返回值为0表示结果为假
mysql> select 6<3;
+-----+
| 6<3 |
+-----+
|   0 |
+-----+
1 row in set (0.00 sec)
```

``>=   大于等于``

```python
#返回值为0表示结果为假
mysql> select 6<=3;
+------+
| 6<=3 |
+------+
|    0 |
+------+
1 row in set (0.00 sec)

#返回值为1表示结果为真
mysql> select 6>=3;
+------+
| 6>=3 |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

``<=   小于等于``

```python
#返回值为1表示结果为真
mysql> select 6<=6;
+------+
| 6<=6 |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

#返回值为0表示结果为假
mysql> select 6<=3;
+------+
| 6<=3 |
+------+
|    0 |
+------+
1 row in set (0.00 sec)
```

``=   等于``

```python
#返回值为1表示结果为真
mysql> select 5=5;
+-----+
| 5=5 |
+-----+
|   1 |
+-----+
1 row in set (0.00 sec)

#返回值为0表示结果为假
mysql> select 5=6;
+-----+
| 5=6 |
+-----+
|   0 |
+-----+
1 row in set (0.00 sec)
```

``!=   不等于``

```python
#返回值为1表示结果为真
mysql> select 3!=2;		
+------+
| 3!=2 |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

#返回值为0表示结果为假
mysql> select 3!=3;
+------+
| 3!=3 |
+------+
|    0 |
+------+
1 row in set (0.00 sec)
```



## 9.3逻辑运算

``&&   与``

```python
#返回值为1表示结果为真
mysql> select 3>1 && 5>1;
+------------+
| 3>1 && 5>1 |
+------------+
|          1 |
+------------+
1 row in set (0.00 sec)

#返回值为0表示结果为假
mysql> select 3>1 && 5<1;
+------------+
| 3>1 && 5<1 |
+------------+
|          0 |
+------------+
1 row in set (0.00 sec)
```



``||   或``

```python
#返回值为1表示结果为真	或关系中有一个为真结果就为真
mysql> select 3>1 || 5<1;
+------------+
| 3>1 || 5<1 |
+------------+
|          1 |
+------------+
1 row in set (0.01 sec)

#返回值为0表示结果为假	或关系中都为假结果才为假
mysql> select 3<1 || 5<1;
+------------+
| 3<1 || 5<1 |
+------------+
|          0 |
+------------+
1 row in set (0.00 sec)
```



``not   非``

```python
#此写法不正确
mysql> select 3>6 not 3>5;		
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '3>5' at line 1

#返回值为1表示结果为真
mysql> select not 3>5;
+---------+
| not 3>5 |
+---------+
|       1 |
+---------+
1 row in set (0.00 sec)

#返回值为0表示结果为假
mysql> select not 5>3;
+---------+
| not 5>3 |
+---------+
|       0 |
+---------+
1 row in set (0.00 sec)
```





## 9.4排序	order by

**order by 列名		      #默认升序**

**order by 列名 desc	#降序**

```python
#student表内容如下
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 79    |
|    3 | 小丽   | 88    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)

#按照成绩升序排序
mysql> select * from student order by score;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
|    2 | 小红   | 79    |
|    3 | 小丽   | 88    |
|    1 | 小明   | 99    |
+------+--------+-------+
5 rows in set (0.00 sec)

#按照成绩降序排序
mysql> select * from student order by score desc;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    3 | 小丽   | 88    |
|    2 | 小红   | 79    |
|    5 | 小洲   | 66    |
|    4 | 小强   | 59    |
+------+--------+-------+
5 rows in set (0.00 sec)
```



## 9.5限制	limit

**limit用于限制查询结果的条数**

```python
#student表内容如下
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 79    |
|    3 | 小丽   | 88    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)

#限制查询结果显示3条
mysql> select * from student limit 3;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 79    |
|    3 | 小丽   | 88    |
+------+--------+-------+
3 rows in set (0.00 sec)
```



## 9.6分组	group by

### 9.6.1group by简单使用示例

```python
#t1表内容如下
mysql> select * from t1;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   |  99.9 |
|    2 | 小明   |  60.6 |
|    3 | 小红   |    70 |
|    4 | 小洲   |  88.5 |
|    5 | 小明   |  77.5 |
|    6 | 小洲   |    59 |
+------+--------+-------+
6 rows in set (0.00 sec)

#根据姓名分组，group by会将列中值相同的行合并
mysql> select name from t1 group by name;
+--------+
| name   |
+--------+
| 小明   |
| 小洲   |
| 小红   |
+--------+
3 rows in set (0.00 sec)

#来个错误示例
mysql> select * from t1 group by name;
ERROR 1055 (42000): Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'db1.t1.id' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by

错误原因：
group by语句会将列中值相同的行合并，例如上边的t1表中，有多个名字相同的人小明，group by已经将多个小明的值合并为一个，但是小明是姓名相同的不同的人，成绩也不同，因此查询的时候会报错
```

### 9.6.2group by+having	分组后再过滤

```python
#创建score表
mysql> create table score(sname char(10),
     cname char(10),
     grade int);
Query OK, 0 rows affected (0.03 sec)

//向表中插入数据
mysql> insert into score(sname,cname,grade)
    values  ('张三','数学',80),
            ('张三','语文',90),
            ('张三','英语',70),
            ('张三','物理',60),
            ('李四','数学',66),
            ('李四','语文',60),
            ('李四','英语',80),
            ('李四','物理',90),
            ('刘五','语文',99),
            ('刘五','数学',50),
            ('刘五','英语',50),
            ('刘五','物理',89),
            ('罗六','语文',99),
            ('罗六','数学',80),
            ('罗六','物理',78),
            ('罗六','英语',96),
            ('许七','数学',96),
            ('许七','语文',96),
            ('许七','英语',96),
            ('许七','物理',96);
Query OK, 20 rows affected (0.03 sec)
Records: 20  Duplicates: 0  Warnings: 0
      
//查询平均成绩大于90分并且语文课95分以上的学生名和平均成绩
mysql> select sname,avg(grade) from score where sname in (select sname from score where cname='语文' and grade > 95) group by sname;
+--------+------------+
| sname  | avg(grade) |
+--------+------------+
| 刘五   |    72.0000 |
| 罗六   |    88.2500 |
| 许七   |    96.0000 |
+--------+------------+
3 rows in set (0.00 sec)

mysql> select sname,avg(grade) from score where sname in (select sname from score where cname='语文' and grade > 95) group by sname having avg(grade) > 90;
+--------+------------+
| sname  | avg(grade) |
+--------+------------+
| 许七   |    96.0000 |
+--------+------------+
1 row in set (0.00 sec)
```



### 9.6.3group by+group_concat函数使用示例

```python
#创建book表
mysql> create table book(书名 char(20) not null,
       作者 char(10) not null,
       出版社 char(20) not null,
       价格 int unsigned,
       出版日期 date);
Query OK, 0 rows affected (0.02 sec)


#向book表中插入数据
mysql> insert into book values(
      '那个女孩','小明','工业出版社',80,'2016-07-01'),
      ('阿三传说','小洲','人民出版社',10,'2019-09-09'),
      ('奔跑的草泥马','小明','盗版出版社',60,'2017-07-12'),
      ('上课必备三件套','小颖','人民出版社',250,'2018-11-11'),
      ('童话故事','','工业出版社',50,'2019-09-01');
Query OK, 5 rows affected (0.01 sec)
Records: 5  Duplicates: 0  Warnings: 0
      
mysql> select * from book;
+-----------------------+--------+-----------------+--------+--------------+
| 书名                  | 作者   | 出版社          | 价格   | 出版日期     |
+-----------------------+--------+-----------------+--------+--------------+
| 那个女孩              | 小明   | 工业出版社      |     80 | 2016-07-01   |
| 阿三传说              | 小洲   | 人民出版社      |     10 | 2019-09-09   |
| 奔跑的草泥马          | 小明   | 盗版出版社      |     60 | 2017-07-12   |
| 上课必备三件套        | 小颖   | 人民出版社      |    250 | 2018-11-11   |
| 童话故事              |        | 工业出版社      |     50 | 2019-09-01   |
+-----------------------+--------+-----------------+--------+--------------+
5 rows in set (0.00 sec)



//查询各出版社出版的所有图书，这里需要用到group_concat()函数
mysql> select 出版社,group_concat(书名) from book group by 出版社;
+-----------------+------------------------------------+
| 出版社          | group_concat(书名)                 |
+-----------------+------------------------------------+
| 人民出版社      | 阿三传说,上课必备三件套            |
| 工业出版社      | 那个女孩,童话故事                  |
| 盗版出版社      | 奔跑的草泥马                       |
+-----------------+------------------------------------+
3 rows in set (0.00 sec)
```



## 9.7检索区间	between...and...

```python
#student表内容如下
mysql> select * from student;
+------+--------+-------+
| id   | name   | score |
+------+--------+-------+
|    1 | 小明   | 99    |
|    2 | 小红   | 79    |
|    3 | 小丽   | 88    |
|    4 | 小强   | 59    |
|    5 | 小洲   | 66    |
+------+--------+-------+
5 rows in set (0.00 sec)

#查询成绩在60分到90分之间的学生姓名
mysql> select name,score from student where score between 60 and 90;
+--------+-------+
| name   | score |
+--------+-------+
| 小红   | 79    |
| 小丽   | 88    |
| 小洲   | 66    |
+--------+-------+
3 rows in set (0.00 sec)
```

## 9.8判断是否在范围 in   not in

```python
#in	在一个范围内
//查看t1表
mysql> select * from t1;
+------+---------+------+
| id   | name    | age  |
+------+---------+------+
|    1 | 小明    |   20 |
|    2 | 大B哥   |   30 |
|    3 | 小B哥   |   25 |
|    4 | 龙哥    |   38 |
|    5 | 小颖    |   18 |
|    6 | 小洲    |   19 |
+------+---------+------+
6 rows in set (0.00 sec)


//查询年龄是18、20、30岁之间的人的信息
mysql> select * from t1 where age in(18,19,30);
+------+---------+------+
| id   | name    | age  |
+------+---------+------+
|    2 | 大B哥   |   30 |
|    5 | 小颖    |   18 |
|    6 | 小洲    |   19 |
+------+---------+------+
3 rows in set (0.00 sec)


#not in 不在一个范围内
//查询年龄不在18、20、30岁之间的人的信息
mysql> select * from t1 where age not in(18,19,30);
+------+---------+------+
| id   | name    | age  |
+------+---------+------+
|    1 | 小明    |   20 |
|    3 | 小B哥   |   25 |
|    4 | 龙哥    |   38 |
+------+---------+------+
3 rows in set (0.00 sec)
```



# 10.mysql的API及接口自带命令

**API：应用程序接口**

## 10.1mysql API

**mysql API就是能够不进入mysql而在命令行中执行sql语句，在命令行中使用-e选项**

**mysqlAPI示例1，在命令行中使用SQL语句**

```python
[root@mysql ~]# mysql -uroot -p123 mysql -e "show databases;"
+--------------------+
| Database           |
+--------------------+
| information_schema |
| DB1                |
| mysql              |
| performance_schema |
| test               |
+--------------------+
```

**mysqlAPI示例2，php连接mysql**

```python
<?php
		$a=mysql_connet('主机IP','用户名','密码')
		if($a)
			echo "connection success!"
		else
			echo "connection failed!"
?>
```



## 10.2mysql接口自带命令

**以下命令在mysql中或者命令行执行都可以**

> ``help`` 或``？`` 				           #查看帮助 
>
> ``\G`` 										 #格式化查看数据（key：value）
>
> ``\T`` 或 ``tee`` 							#记录日志 
>
> ``\c``（5.7可以ctrl+c） 		  #结束命令 
>
> ``\s`` 或 ``status``                      #查看状态信息 
>
> ``\.`` 或 ``source``                      #导入SQL数据 
>
> ``\u``或 ``use``                             #使用数据库 
>
> ``\q`` 或 ``exit`` 或 ``quit``           #退出

