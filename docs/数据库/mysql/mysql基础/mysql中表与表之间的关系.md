[toc]



# mysql中表与表之间的关系

## 1.如何分析表与表之间的关系

```python
分析步骤：
#1、先站在左表的角度去找
是否左表的多条记录可以对应右表的一条记录，如果是，则证明左表的一个字段foreign key 右表一个字段（通常是id）

#2、再站在右表的角度去找
是否右表的多条记录可以对应左表的一条记录，如果是，则证明右表的一个字段foreign key 左表一个字段（通常是id）

#3、总结：
#多对一：
如果只有步骤1成立，则是左表多对一右表
如果只有步骤2成立，则是右表多对一左表

#多对多
如果步骤1和2同时成立，则证明这两张表时一个双向的多对一，即多对多,需要定义一个这两张表的关系表来专门存放二者的关系

#一对一:
如果1和2都不成立，而是左表的一条记录唯一对应右表的一条记录，反之亦然。这种情况很简单，就是在左表foreign key右表的基础上，将左表的外键字段设置成unique即可
```



## 2.mysql中表与表之间的关系

### 2.1 一对多

**关联方式**

- **外键	foreign key**

> 表与表之间的关系为一对多
>
> 例如，出版社与书之间的关系就是一对多，一个出版社可以出版多个书
>
> 例如，班级表和学生表，一个班级可以有多个学生，但是一个学生只能属于一个班级
>
> 例如，服务器和机房，一个机房可以有多台服务器，但是一个服务器只能属于一个机房

#### **2.1.1 示例1，出版社表与图书表**

**一个出版社可以出版多个书**

```python
#创建出版社表
mysql> create table chubanshe(id int primary key auto_increment,name char(10));
Query OK, 0 rows affected (0.02 sec)

#创建图书表
mysql> create table book(
  id int primary key auto_increment,
  name char(20),
  chubanshe_id int not null,
  foreign key(chubanshe_id) references chubanshe(id) on delete cascade on update cascade);
Query OK, 0 rows affected (0.04 sec)

//向出版社表中插入数据
mysql> insert into chubanshe(name) values
       ('人民出版社'),
       ('邮电出版社'),
       ('机械出版社');
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from chubanshe;
+----+-----------------+
| id | name            |
+----+-----------------+
|  1 | 人民出版社      |
|  2 | 邮电出版社      |
|  3 | 机械出版社      |
+----+-----------------+
3 rows in set (0.00 sec)


//向图书表中插入数据
mysql> insert into book(name,chubanshe_id) values
       ('童话故事',1),
       ('阿童木',2),
       ('老人与海',1),
       ('会飞的鸟',3),
       ('葵花宝典',2);
Query OK, 5 rows affected (0.00 sec)
Records: 5  Duplicates: 0  Warnings: 0

mysql> select * from book;
+----+--------------+--------------+
| id | name         | chubanshe_id |
+----+--------------+--------------+
|  1 | 童话故事     |            1 |
|  2 | 阿童木       |            2 |
|  3 | 老人与海     |            1 |
|  4 | 会飞的鸟     |            3 |
|  5 | 葵花宝典     |            2 |
+----+--------------+--------------+
5 rows in set (0.00 sec)


现在出版社表与图书表就是一对多关系，图书表中的chubanshe_id对应出版社表中的出版社id，一个出版社可以出版多个书
```



#### **2.1.2 示例2，学生表和班级表**

**一个班级可以有多个学生，但是一个学生只能属于一个班级**

```python
#创建学生表
mysql> create table student(
       sid int primary key auto_increment,
       sname char(10) not null,
       class_id int not null,
       foreign key(class_id) references class(cid));
Query OK, 0 rows affected (0.02 sec)

#创建班级表
mysql> create table class(cid int auto_increment primary key);
Query OK, 0 rows affected (0.04 sec)


//向学生表中插入数据
mysql> insert into student(sname,class_id) values('小明',1),('小红',1),('小洲',2),('小肖',3),('小丽',3);
Query OK, 5 rows affected (0.00 sec)
Records: 5  Duplicates: 0  Warnings: 0
      

mysql> select * from student;
+-----+--------+----------+
| sid | sname  | class_id |
+-----+--------+----------+
|   1 | 小明   |        1 |
|   2 | 小红   |        1 |
|   3 | 小洲   |        2 |
|   4 | 小肖   |        3 |
|   5 | 小丽   |        3 |
+-----+--------+----------+
5 rows in set (0.00 sec)   
      
//向班级表中插入数据，因为只有一个cid，自动增长
mysql> insert into class values();
Query OK, 1 row affected (0.01 sec)

mysql> select * from class;
+-----+
| cid |
+-----+
|   1 |
|   2 |
|   3 |
+-----+
3 rows in set (0.00 sec)



//错误示例，向学生表中插入一条数据，班级id指定一个不存在的，会报错
mysql> insert into student(sname,class_id) values('小黑',4);
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`ppp`.`student`, CONSTRAINT `student_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `class` (`cid`))
    
//错误示例，尝试删除班级表中的一个记录，报错，不可以删除，因为学生表中有对应的班级，这个无法删除
mysql> delete from class where cid=1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`ppp`.`student`, CONSTRAINT `student_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `class` (`cid`))
```



#### 2.1.3 示例3，机房表与服务器表

**一个机房可以有多个服务器，但是一个服务器只能归属一个机房**

```python
#创建机房表
mysql> create table server_room(
       rid int primary key auto_increment,
       rname char(10) not null);
Query OK, 0 rows affected (0.03 sec)

#创建服务器表
mysql> create table server(
       sid int primary key auto_increment,
       sname char(10) not null,room_id int not null,
       foreign key(room_id) references server_room(rid));
Query OK, 0 rows affected (0.02 sec)


//向机房表中插入数据
mysql> insert into server_room(rname) values('房山机房'),('石景山机房'),('丰台 机房');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from server_room;
+-----+-----------------+
| rid | rname           |
+-----+-----------------+
|   1 | 房山机房        |
|   2 | 石景山机房      |
|   3 | 丰台机房        |
+-----+-----------------+
3 rows in set (0.00 sec)

//向服务器表中插入数据
mysql> insert into server(sname,room_id) values('HP',1),('DELL',1),('联想',2),('IBM',3),('华为',3);
Query OK, 5 rows affected (0.00 sec)
Records: 5  Duplicates: 0  Warnings: 0

mysql> select * from server;
+-----+--------+---------+
| sid | sname  | room_id |
+-----+--------+---------+
|   1 | HP     |       1 |
|   2 | DELL   |       1 |
|   3 | 联想   |       2 |
|   4 | IBM    |       3 |
|   5 | 华为   |       3 |
+-----+--------+---------+
5 rows in set (0.00 sec)


//错误示例，尝试修改机房表中的机房编号，结果报错，因为服务器表中有对应编号为3的丰台机房的服务器
mysql> select * from server_room;
+-----+-----------------+
| rid | rname           |
+-----+-----------------+
|   1 | 房山机房        |
|   2 | 石景山机房      |
|   3 | 丰台机房        |
+-----+-----------------+
3 rows in set (0.00 sec)

mysql> update server_room set rid=5 where rid=3;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`ppp`.`server`, CONSTRAINT `server_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `server_room` (`rid`))
```



### 2.2 一对一

**关联方式**

- **foreign	key+unique**

> 表与表之间的关系是一对一
>
> 例如，公司中员工与员工的企业邮箱就是一对一关系

#### 2.2.1 示例1，员工表与企业邮箱表

```python
#创建员工表
mysql> create table employee(
  eid int primary key auto_increment,	#员工id，主键，自增
  ename char(20) not null,	#员工姓名
  sex enum('F','M'),	#员工性别
  enterprise_mail_id int unique);	#企业邮箱id，不能重复
Query OK, 0 rows affected (0.03 sec)

#创建企业邮箱表
mysql> create table enterprise_mail(
  mid int primary key,	#企业邮箱id，主键
  email char(50),				#邮箱信息
  employee_id int unique not null,	#员工id，不能重复
  foreign key(employee_id) references employee(eid));	#企业邮箱表中的员工id是外键，关联员工表中的员工id
Query OK, 0 rows affected (0.03 sec)


//向员工表中插入数据
mysql> insert into employee(ename,sex,enterprise_mail_id) values
    -> ('小明','M',101),
    -> ('小洲','M',102),
    -> ('小颖','F',103);
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from employee;
+-----+--------+------+--------------------+
| eid | ename  | sex  | enterprise_mail_id |
+-----+--------+------+--------------------+
|   1 | 小明   | M    |                101 |
|   2 | 小洲   | M    |                102 |
|   3 | 小颖   | F    |                103 |
+-----+--------+------+--------------------+
3 rows in set (0.00 sec)


//向企业邮箱表中插入数据
mysql> insert into enterprise_mail values
     (101,'xiaoming@testin.cn',1),
     (102,'xiaozhou@testin.cn',2),
     (103,'xiaoying@testin.cn',3);
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from enterprise_mail;
+-----+--------------------+-------------+
| mid | email              | employee_id |
+-----+--------------------+-------------+
| 101 | xiaoming@testin.cn |           1 |
| 102 | xiaozhou@testin.cn |           2 |
| 103 | xiaoying@testin.cn |           3 |
+-----+--------------------+-------------+
3 rows in set (0.00 sec)


//尝试删除员工表中的任意一条数据，因为有外键约束，因此无法删除
mysql> delete from employee where eid=1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`db1`.`enterprise_mail`, CONSTRAINT `enterprise_mail_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`eid`))
    
//尝试删除企业邮箱表中的任意一条数据
mysql> delete from enterprise_mail where mid=101;
Query OK, 1 row affected (0.01 sec)
```



### 2.3 多对多

**关联方式**

- **外键foreign key+一张新的表**

> 表与表之间的关系是多对多
>
> 例如，一本书可以有多个作者，一个作者可以写多本书

![iShot_2024-08-22_14.43.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.43.12.png)





#### 2.3.1 示例1，书籍表、作者表、关联书籍表与作者表的第3张表

```python
#创建书籍表
mysql> create table book(
       bid int primary key auto_increment,
       bname char(20) not null);
Query OK, 0 rows affected (0.02 sec)

#创建作者表
mysql> create table author(
       aid int primary key auto_increment,
       aname char(20) not null);
Query OK, 0 rows affected (0.03 sec)

#创建关联书籍与作者表，表中有书籍id和作者id，分别作为书籍表中bid和作者表中aid的外键
mysql> create table book_and_author(
       book_id int not null,
       author_id int not null,
       foreign key(book_id) references book(bid),
       foreign key(author_id) references author(aid));
Query OK, 0 rows affected (0.03 sec)


//向书籍表中插入数据
mysql> insert into book(bname) values('童话故事'),('那个女孩'),('上课必备三件套');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0
      
mysql> select * from book;
+-----+-----------------------+
| bid | bname                 |
+-----+-----------------------+
|   1 | 童话故事              |
|   2 | 那个女孩              |
|   3 | 上课必备三件套        |
+-----+-----------------------+
3 rows in set (0.00 sec)      


//向作者表中插入数据
mysql> insert into author(aname) values('作者小明'),('作者小丽'),('作者小洲');
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> select * from author;
+-----+--------------+
| aid | aname        |
+-----+--------------+
|   1 | 作者小明     |
|   2 | 作者小丽     |
|   3 | 作者小洲     |
+-----+--------------+
3 rows in set (0.00 sec)


//向关联表中插入数据
mysql> insert into book_and_author values(1,1),(1,2),(2,2),(2,3),(3,1),(3,3);
Query OK, 6 rows affected (0.00 sec)
Records: 6  Duplicates: 0  Warnings: 0

mysql> select * from book_and_author;
+---------+-----------+
| book_id | author_id |
+---------+-----------+
|       1 |         1 |	#童话故事的作者是小明
|       1 |         2 |	#童话故事的作者是小丽
|       2 |         2 |	#那个女孩的作者是小丽
|       2 |         3 |	#那个女孩的作者是小洲
|       3 |         1 |	#上课必备三件套的作者是小明	
|       3 |         3 |	#上课必备三件套的作者是小洲
+---------+-----------+
6 rows in set (0.00 sec)
这个关联书籍表与作者表的关联表中就是一个作者写了多本书，一本书有多个作者


//错误示范，尝试删除书籍表与作者表中的任意一条数据
mysql> delete from book where bid=1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`db1`.`book_and_author`, CONSTRAINT `book_and_author_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `book` (`bid`))
    
mysql> delete from author where aid=3;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`db1`.`book_and_author`, CONSTRAINT `book_and_author_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `author` (`aid`))
    
    
//删除关联表中的数据，是可以删除的，因为这只是一个关联表，删除了关联id，只是把原来两张表的关联关系删除了
这里删除了关联表中的图书id，这样就是原来的图书表中为1的书找不到对应的作者了
mysql> delete from book_and_author where book_id=1;
Query OK, 2 rows affected (0.01 sec)

mysql> select * from book_and_author;
+---------+-----------+
| book_id | author_id |
+---------+-----------+
|       2 |         2 |
|       2 |         3 |
|       3 |         1 |
|       3 |         3 |
+---------+-----------+
4 rows in set (0.00 sec)

//删除关联id后就可以删除原先不能删除的图书或者作者id了
mysql> delete from book where bid=1;
Query OK, 1 row affected (0.00 sec)

//关联id为2的没有删除，因此不能删除图书表中bid为2的
mysql> delete from book where bid=2;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`db1`.`book_and_author`, CONSTRAINT `book_and_author_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `book` (`bid`))
```

