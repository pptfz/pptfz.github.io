[toc]



# select高级用法

## 1.多表连接查询

**`select 表1.列名,表2.列名 from 表1,表2 where 表1.列1=表2.列1 and 表1.列2=值`**

### 1.1 创建两张表

```python
mysql> create table t1(id int,name char(20));
Query OK, 0 rows affected (0.02 sec)

mysql> create table t2(id int,age tinyint);
Query OK, 0 rows affected (0.02 sec)
```



### 1.2 向表中插入数据

```python
mysql> insert into t1 values(1,'aaa'),(2,'bbb'),(3,'ccc');
Query OK, 3 rows affected (0.01 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> insert into t2 values(1,25),(2,26),(3,27);
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0
```



### 1.3 查询t1、t2表中id为1的人的年龄

```python
mysql> select t1.name,t2.age from t1,t2 where t1.id=t2.id and t1.id=1;
+------+------+
| name | age  |
+------+------+
| aaa  |   25 |
+------+------+
1 row in set (0.00 sec)
```



## 2.sql join连接

### 2.1 sql join连接示意图

**下图展示了 LEFT JOIN、RIGHT JOIN、INNER JOIN、OUTER JOIN 相关的 7 种用法**

![iShot_2024-08-22_12.30.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_12.30.12.png)





### 2.2 sql数据准备

#### 2.2.1 创建一个人名表和地址表

```python
1.创建一个数据库
mysql> create database DB1 charset utf8 collate=utf8_general_ci;
Query OK, 1 row affected (0.01 sec)

2.创建人名表
mysql> create table person(person_id int,name varchar(20));
Query OK, 0 rows affected (0.02 sec)

3.创建地址表
mysql> create table address(address_id int,person_id int,city varchar(20));
Query OK, 0 rows affected (0.02 sec)
```



#### 2.2.2 向表中插入数据

```python
1.向人名表中插入数据
mysql> insert into person values(1,'张三'),(2,'李四'),(3,'王五'),(4,'杨六');
Query OK, 4 rows affected (0.01 sec)
Records: 4  Duplicates: 0  Warnings: 0

2.向地址表中插入数据
mysql> insert into address values(1,1,'北京'),(2,2,'上海'),(3,3,'广州'),(5,5,'杭州');
Query OK, 4 rows affected (0.01 sec)
Records: 4  Duplicates: 0  Warnings: 0
```



#### 2.2.3 查看表信息

```python
//人名表
mysql> select * from person;
+-----------+--------+
| person_id | name   |
+-----------+--------+
|         1 | 张三   |
|         2 | 李四   |
|         3 | 王五   |
|         4 | 杨六   |
+-----------+--------+
4 rows in set (0.01 sec)

//地址表
mysql> select * from address;
+------------+-----------+--------+
| address_id | person_id | city   |
+------------+-----------+--------+
|          1 |         1 | 北京   |
|          2 |         2 | 上海   |
|          3 |         3 | 广州   |
|          5 |         5 | 杭州   |
+------------+-----------+--------+
4 rows in set (0.00 sec)
```



### 2.3 sql join连接查询示例

#### 2.3.1 传统连接与JOIN ON

```python
//使用DB1库
mysql> use DB1;
Database changed

//查询张三的地址	传统连接
mysql> select person.name,address.city from person,address where person.name='张三' and person.person_id=address.person_id;
+--------+--------+
| name   | city   |
+--------+--------+
| 张三   | 北京   |
+--------+--------+
1 row in set (0.01 sec)


//查询张三的地址	JOIN ON连接
mysql> select person.name,address.city from person join address on(person.person_id=address.person_id) where person.name='张三';
+--------+--------+
| name   | city   |
+--------+--------+
| 张三   | 北京   |
+--------+--------+
1 row in set (0.00 sec)


⚠️传统连接与JOIN ON查询的结果是一样的
```



#### 2.3.2 自连接	NATURAL  JOIN

> **自然连接:根据连接的两个表中的公共列为您创建隐式连接子句。公共列是两个表中名称相同的列。自然连接可以是内连接、左外连接或右外连接。默认情况下是内部连接。**

**自连接的表要有共同的列名字，person表和address表中都有列person_id**

```python
//查询张三的地址
mysql> select person.name,address.city from person natural join address where person.name='张三';
+--------+--------+
| name   | city   |
+--------+--------+
| 张三   | 北京   |
+--------+--------+
1 row in set (0.00 sec)
```



#### 2.3.3 内连接	INNER  JOIN

> **INNER JOIN 关键字在表中存在至少一个匹配时返回行。**

![iShot_2024-08-22_12.32.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_12.32.55.png)



```python
//person表中和address表中相同的id列
mysql> select * from person inner join address on person.person_id=address.address_id;
+-----------+--------+------------+-----------+--------+
| person_id | name   | address_id | person_id | city   |
+-----------+--------+------------+-----------+--------+
|         1 | 张三   |          1 |         1 | 北京   |
|         2 | 李四   |          2 |         2 | 上海   |
|         3 | 王五   |          3 |         3 | 广州   |
+-----------+--------+------------+-----------+--------+
3 rows in set (0.00 sec)
```



#### 2.3.4 左外连接	LEFT  JOIN  ON

> **左外连接:从左表返回所有的行(表1),与正确的匹配行(表2)。当没有匹配时，右边的结果为NULL。**

![iShot_2024-08-22_12.33.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_12.33.44.png)



**<span style={{color: 'red'}}>select 查询内容 from 左表 left join 右表 on 左表.列=右表.列</span>**

```python
//人名表person为左表，地址表address为右表	左外连接
mysql> select * from person left join address on person.person_id=address.person_id;
+-----------+--------+------------+-----------+--------+
| person_id | name   | address_id | person_id | city   |
+-----------+--------+------------+-----------+--------+
|         1 | 张三   |          1 |         1 | 北京   |
|         2 | 李四   |          2 |         2 | 上海   |
|         3 | 王五   |          3 |         3 | 广州   |
|         4 | 杨六   |       NULL |      NULL | NULL   |
+-----------+--------+------------+-----------+--------+
4 rows in set (0.01 sec)


//地址表address为左表，人名表person位右表	右外连接
mysql> select * from address right join person on person.person_id=address.person_id;
+------------+-----------+--------+-----------+--------+
| address_id | person_id | city   | person_id | name   |
+------------+-----------+--------+-----------+--------+
|          1 |         1 | 北京   |         1 | 张三   |
|          2 |         2 | 上海   |         2 | 李四   |
|          3 |         3 | 广州   |         3 | 王五   |
|       NULL |      NULL | NULL   |         4 | 杨六   |
+------------+-----------+--------+-----------+--------+
4 rows in set (0.00 sec)
```



#### 2.3.5 右外连接	RIGHT  JOIN  ON

> **右外连接:返回右表(表2)中的所有行，以及左表(表1)中的匹配行。当没有匹配时，左边的结果为NULL。**

![iShot_2024-08-22_12.34.31](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_12.34.31.png)



<span style={{color: 'red'}}>**select 查询内容 from 左表 right join 右表 on 右表.列=左表.列**</span>

```python
//人名表person为左表，地址表address为右表
mysql> select * from person right join address on person.person_id=address.person_id;
+-----------+--------+------------+-----------+--------+
| person_id | name   | address_id | person_id | city   |
+-----------+--------+------------+-----------+--------+
|         1 | 张三   |          1 |         1 | 北京   |
|         2 | 李四   |          2 |         2 | 上海   |
|         3 | 王五   |          3 |         3 | 广州   |
|      NULL | NULL   |          5 |         5 | 杭州   |
+-----------+--------+------------+-----------+--------+
4 rows in set (0.00 sec)


//address表为左表，person表为右表
mysql> select * from address left join person on person.person_id=address.person_id;
+------------+-----------+--------+-----------+--------+
| address_id | person_id | city   | person_id | name   |
+------------+-----------+--------+-----------+--------+
|          1 |         1 | 北京   |         1 | 张三   |
|          2 |         2 | 上海   |         2 | 李四   |
|          3 |         3 | 广州   |         3 | 王五   |
|          5 |         5 | 杭州   |      NULL | NULL   |
+------------+-----------+--------+-----------+--------+
4 rows in set (0.00 sec)
```



#### 2.3.6 合并查询	UNION

> **UNION	去重复并合并**
>
> **UNION ALL	不去重**



> **全交: 返回左表的所有行和右表的所有行，是左交和右交的联合。**
>
> **注意，由于MySql中没有Full Join命令，所以我们通过把Left Join和Right Join的结果Union起来也是可以的：**

```python
//查询城市为北京或上海的所有信息
mysql> select * from address where city='北京' or city='上海';
+------------+-----------+--------+
| address_id | person_id | city   |
+------------+-----------+--------+
|          1 |         1 | 北京   |
|          2 |         2 | 上海   |
+------------+-----------+--------+
2 rows in set (0.00 sec)
或
mysql> select * from address where city in ('北京','上海');
+------------+-----------+--------+
| address_id | person_id | city   |
+------------+-----------+--------+
|          1 |         1 | 北京   |
|          2 |         2 | 上海   |
+------------+-----------+--------+
2 rows in set (0.01 sec)


//union合并查询效率最高
mysql> select * from address where city='北京' union select * from address where city='上海';
+------------+-----------+--------+
| address_id | person_id | city   |
+------------+-----------+--------+
|          1 |         1 | 北京   |
|          2 |         2 | 上海   |
+------------+-----------+--------+
2 rows in set (0.00 sec)
或
mysql> select * from address where city='北京' union all select * from address where city='上海';
+------------+-----------+--------+
| address_id | person_id | city   |
+------------+-----------+--------+
|          1 |         1 | 北京   |
|          2 |         2 | 上海   |
+------------+-----------+--------+
2 rows in set (0.00 sec)
```

