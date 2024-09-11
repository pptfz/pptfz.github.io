[toc]



# mysql数据类型和SQL语句分类

## 1.SQL语句分类

![iShot_2024-08-22_12.25.48](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-22_12.25.48.png)



**DDL(Data Definition Language)数据定义语言**	

- **create、alter、drop**

**DML(Data Manipulation Language)数据操纵语言**

- **insert、update、delete**

**DCL(Data Control Language)数据控制语言**

- **grant、revoke**

**DQL(Data Query Language)数据查询语言**

- **select、show**

---

## 2.mysql数据类型

### 2.1 数值类型

#### 2.1.1 整型

| 类型             | 大小       | 范围（有符号）                                              | 范围（无符号）unsigned约束          | 用途           |
| ---------------- | ---------- | ----------------------------------------------------------- | ----------------------------------- | -------------- |
| **TINYINT**      | **1 字节** | **(-128，127)**                                             | **(0，255)**                        | **小整数值**   |
| **SMALLINT**     | **2 字节** | **(-32 768，32 767)**                                       | **(0，65 535)**                     | **大整数值**   |
| **MEDIUMINT**    | **3 字节** | **(-8 388 608，8 388 607)**                                 | **(0，16 777 215)**                 | **大整数值**   |
| **INT或INTEGER** | **4 字节** | **(-2 147 483 648，2 147 483 647)**                         | **(0，4 294 967 295)**              | **大整数值**   |
| **BIGINT**       | **8 字节** | **(-9 233 372 036 854 775 808，9 223 372 036 854 775 807)** | **(0，18 446 744 073 709 551 615)** | **极大整数值** |

##### 2.1.1.1 int和tinyint使用示例

**常用的数据类型是tinyint和int**

```python
#创建表t1
mysql> create table t1(t tinyint,i int);
Query OK, 0 rows affected (0.02 sec)

//向表中插入数据，有符号的tinyint下限是-128，因此插入-129报错
mysql> insert into t1 values(-129,-129);
ERROR 1264 (22003): Out of range value for column 't' at row 1
mysql> insert into t1 values(-128,-129);
Query OK, 1 row affected (0.01 sec)


#创建表t2
mysql> create table t2(t tinyint(3),i int(3));
Query OK, 0 rows affected (0.08 sec)

//向表t2中插入数据
mysql> insert into t2 values(1000,1000);
ERROR 1264 (22003): Out of range value for column 't' at row 1
mysql> insert into t2 values(999,1000);
ERROR 1264 (22003): Out of range value for column 't' at row 1
mysql> insert into t2 values(128,999);
ERROR 1264 (22003): Out of range value for column 't' at row 1
mysql> insert into t2 values(127,999);
Query OK, 1 row affected (0.01 sec)
```



#### 2.1.2 浮点型

| 类型        | 大小                                                      | 范围(有符号)                                                 | 范围(无符号)                                                 | 用途                |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------- |
| **FLOAT**   | **4 字节float(255,30)**                                   | **(-3.402 823 466 E+38，-1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38)** | **0，(1.175 494 351 E-38，3.402 823 466 E+38)**              | **单精度 浮点数值** |
| **DOUBLE**  | **8 字节double(255,30)**                                  | **(-1.797 693 134 862 315 7 E+308，-2.225 073 858 507 201 4 E-308)，0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308)** | **0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308)** | **双精度 浮点数值** |
| **DECIMAL** | **对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2double(65,30)** | **依赖于M和D的值**                                           | **依赖于M和D的值**                                           | **小数值**          |

**float、double、decimal的格式相同**

**float(m,n)**

**double(m,n)**

**decimal(m,n)**

**其中m表示一共有m位，有n位小数**

```python
#创建t1表，三个字段分别为float，double和decimal参数表示一共显示5位，小数部分占2位
mysql> create table t1(id1 float(5,2),id2 double(5,2),id3 decimal(5,2));
Query OK, 0 rows affected (0.01 sec)

mysql> desc t1;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id1   | float(5,2)   | YES  |     | NULL    |       |
| id2   | double(5,2)  | YES  |     | NULL    |       |
| id3   | decimal(5,2) | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
3 rows in set (0.00 sec)

//向表中插入1.11，结果正常
mysql> insert into t1 values(1.11,1.11,1.11);
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1;
+------+------+------+
| id1  | id2  | id3  |
+------+------+------+
| 1.11 | 1.11 | 1.11 |
+------+------+------+
1 row in set (0.00 sec)

//向表中插入1.234发现只能保留2位小数
mysql> insert into t1 values(1.234,1.234,1.234);
Query OK, 1 row affected, 1 warning (0.01 sec)

mysql> select * from t1;
+------+------+------+
| id1  | id2  | id3  |
+------+------+------+
| 1.11 | 1.11 | 1.11 |
| 1.23 | 1.23 | 1.23 |
+------+------+------+
2 rows in set (0.00 sec)

//mysql> insert into t1 values(1.236,1.236,1.236);
Query OK, 1 row affected, 1 warning (0.02 sec)

mysql> select * from t1;
+------+------+------+
| id1  | id2  | id3  |
+------+------+------+
| 1.11 | 1.11 | 1.11 |
| 1.23 | 1.23 | 1.23 |
| 1.24 | 1.24 | 1.24 |
+------+------+------+
3 rows in set (0.00 sec).236，虽然只能保留2位小数，但是有四舍五入的规则




#新建t2表
mysql> create table t2(f float,do double,de decimal);
Query OK, 0 rows affected (0.08 sec)

mysql> desc t2;
+-------+---------------+------+-----+---------+-------+
| Field | Type          | Null | Key | Default | Extra |
+-------+---------------+------+-----+---------+-------+
| f     | float         | YES  |     | NULL    |       |
| do    | double        | YES  |     | NULL    |       |
| de    | decimal(10,0) | YES  |     | NULL    |       |
+-------+---------------+------+-----+---------+-------+
3 rows in set (0.00 sec)


//分别插入1.2345，查看表可以看到decimal默认是整型
mysql> insert into t2 values(1.2345,1.2345,1.2345);
Query OK, 1 row affected, 1 warning (0.00 sec)

mysql> select * from t2;
+--------+--------+------+
| f      | do     | de   |
+--------+--------+------+
| 1.2345 | 1.2345 |    1 |
+--------+--------+------+
1 row in set (0.00 sec)

//分别插入超长的数，查看3者的区别，可以看到double的精度更高
mysql> insert into t2 values(1.234567890123456789,1.234567890123456789,1.234567890123456789);
Query OK, 1 row affected, 1 warning (0.02 sec)

mysql> select * from t2;
+---------+--------------------+------+
| f       | do                 | de   |
+---------+--------------------+------+
|  1.2345 |             1.2345 |    1 |
| 1.23457 | 1.2345678901234567 |    1 |
+---------+--------------------+------+
2 rows in set (0.00 sec)

结论：
在不指定长度的情况下，decimal默认是整型存储
double的精度要比float高
```



### 2.2 字符串类型

| 类型           | 大小                    | 用途                                |
| -------------- | ----------------------- | ----------------------------------- |
| **CHAR**       | **0-255字节**           | **定长字符串**                      |
| **VARCHAR**    | **0-65535 字节**        | **变长字符串**                      |
| **TINYBLOB**   | **0-255字节**           | **不超过 255 个字符的二进制字符串** |
| **TINYTEXT**   | **0-255字节**           | **短文本字符串**                    |
| **BLOB**       | **0-65 535字节**        | **二进制形式的长文本数据**          |
| **TEXT**       | **0-65 535字节**        | **长文本数据**                      |
| **MEDIUMBLOB** | **0-16 777 215字节**    | **二进制形式的中等长度文本数据**    |
| **MEDIUMTEXT** | **0-16 777 215字节**    | **中等长度文本数据**                |
| **LONGBLOB**   | **0-4 294 967 295字节** | **二进制形式的极大文本数据**        |
| **LONGTEXT**   | **0-4 294 967 295字节** | **极大文本数据**                    |

#### 2.2.1 char与varchar使用示例

**CHAR 和 VARCHAR 类型类似，但它们保存和检索的方式不同。它们的最大长度和是否尾部空格被保留等方面也不同。在存储或检索过程中不进行大小写转换。**

**CHAR列的长度固定为创建表是声明的长度,范围(0-255);而VARCHAR的值是可变长字符串范围(0-65535)。**

```python
#创建表t1
mysql> create table t1(c char(4),v varchar(4));
Query OK, 0 rows affected (0.09 sec)

//向t1表中插入数据
mysql> insert into t1 values('ab  ','ab  ');
Query OK, 1 row affected (0.01 sec)

mysql> select * from t1;
+------+------+
| c    | v    |
+------+------+
| ab   | ab   |
+------+------+
1 row in set (0.00 sec)

//检索的时候char会去掉空格
mysql> select length(c),length(v) from t1;
+-----------+-----------+
| length(c) | length(v) |
+-----------+-----------+
|         2 |         4 |
+-----------+-----------+
1 row in set (0.00 sec)

//给查询结果加上一个符号会看的更清晰，char在检索的时候会去掉空格
mysql> select concat(c,'+'),concat(v,'+') from t1;
+---------------+---------------+
| concat(c,'+') | concat(v,'+') |
+---------------+---------------+
| ab+           | ab  +         |
+---------------+---------------+
1 row in set (0.01 sec)
```

**char存储的时候是定长，例如，char(5)，但是只插入了一个字符a，则会在字符a后边补全4个空格**

**varchar存储的时候是变长，例如，varchar(5)，但是只插入了一个字符a，则存储a后还会在a的位置后边加一个a的位置编号**





### 2.3 日期和时间类型

| 类型          | 大小 (字节) | 范围                                                         | 格式                    | 用途                         |
| ------------- | ----------- | ------------------------------------------------------------ | ----------------------- | ---------------------------- |
| **DATE**      | **3**       | **1000-01-01/9999-12-31**                                    | **YYYY-MM-DD**          | **年月日**                   |
| **TIME**      | **3**       | **'-838:59:59'/'838:59:59'**                                 | **HH:MM:SS**            | **时分秒**                   |
| **YEAR**      | **1**       | **1901/2155**                                                | **YYYY**                | **年份值**                   |
| **DATETIME**  | **8**       | **1000-01-01 00:00:00/9999-12-31 23:59:59**                  | **YYYY-MM-DD HH:MM:SS** | **年月日时分秒**             |
| **TIMESTAMP** | **4**       | **1970-01-01 00:00:00/2038结束时间是第 2147483647 秒，北京时间 2038-1-19 11:14:07，格林尼治时间 2038年1月19日 凌晨 03:14:07** | **YYYYMMDD HHMMSS**     | **混合日期和时间值，时间戳** |

⚠️⚠️⚠️**IMESTAM只支持到2038年的时间，因此用的比较少**

#### 2.3.1 DATE、TIME、DATETIME使用示例

```python
#创建表t2，3个列数据类型依次为date、time、datetime
mysql> create table t2(d date,t time,dt datetime);
Query OK, 0 rows affected (0.02 sec)

//向t2表中插入数据，这里使用now()函数
mysql> insert into t2 values(now(),now(),now());
Query OK, 1 row affected, 1 warning (0.00 sec)

//查看t2表中的数据
列d的数据类型是date	年月日
列t的数据类型是time	时分秒
列dt的数据类型是datetime	年月日时分秒
mysql> select * from t2;
+------------+----------+---------------------+
| d          | t        | dt                  |
+------------+----------+---------------------+
| 2018-10-28 | 17:32:33 | 2018-10-28 17:32:33 |
+------------+----------+---------------------+
1 row in set (0.00 sec)


//向t2表中插入数据，这里手动指定，有两种方法
方法一
mysql> insert into t2 values('2018-08-08','08:08:08','2016-06-06 06:06:06');
Query OK, 1 row affected (0.01 sec)

方法二
mysql> insert into t2 values('20180808','080808','20160606060606');
Query OK, 1 row affected (0.00 sec)

mysql> select * from t2;
+------------+----------+---------------------+
| d          | t        | dt                  |
+------------+----------+---------------------+
| 2018-08-08 | 08:08:08 | 2016-06-06 06:06:06 |
| 2018-08-08 | 08:08:08 | 2016-06-06 06:06:06 |
+------------+----------+---------------------+
2 rows in set (0.00 sec)


⚠️只有TIMESTAMP类型插入数据为空时会自动添加当前时间，其余数据类型插入为空就是空
mysql> insert into t2 values(null,null,null);
Query OK, 1 row affected (0.04 sec)

mysql> select * from t2;
+------------+----------+---------------------+
| d          | t        | dt                  |
+------------+----------+---------------------+
| 2018-10-28 | 17:32:33 | 2018-10-28 17:32:33 |
| NULL       | NULL     | NULL                |
+------------+----------+---------------------+
2 rows in set (0.00 sec)
```



#### 2.3.2 YEAR使用示例

```python
#创建t3表，列y的类型为year
mysql> create table t3(y year);
Query OK, 0 rows affected (0.02 sec)

//插入数据，这里使用now()方法
mysql> insert into t3 values(now());
Query OK, 1 row affected (0.01 sec)

//插入数据，这里手动指定
mysql> insert into t3 values('2020');
Query OK, 1 row affected (0.00 sec)

mysql> select * from t3;
+------+
| y    |
+------+
| 2019 |
| 2020 |
+------+
2 rows in set (0.00 sec)
```

#### 2.3.3 TIMESTAMP使用示例

```python
#创建t1表
mysql> create table t1(t timestamp);
Query OK, 0 rows affected (0.03 sec)

#描述t1表，可以看到timestamp有默认的CURRENT_TIMESTAMP和on update CURRENT_TIMESTAMP，即更新当前的时间
mysql> desc t1;
+-------+-----------+------+-----+-------------------+-----------------------------+
| Field | Type      | Null | Key | Default           | Extra                       |
+-------+-----------+------+-----+-------------------+-----------------------------+
| t     | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
+-------+-----------+------+-----+-------------------+-----------------------------+
1 row in set (0.00 sec)

//向t1表中插入数据,使用now()函数
mysql> insert into t1 values(now());
Query OK, 1 row affected (0.01 sec)

//向t1表中插入空，timestamp会自动补全当前时间
mysql> insert into t1 values(null);
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1;
+---------------------+
| t                   |
+---------------------+
| 2018-10-28 17:54:32 |
| 2018-10-28 17:56:07 |
+---------------------+
2 rows in set (0.00 sec)



timestamp时间上限及下限
mysql> desc t1;
+-------+-----------+------+-----+-------------------+-----------------------------+
| Field | Type      | Null | Key | Default           | Extra                       |
+-------+-----------+------+-----+-------------------+-----------------------------+
| t     | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
+-------+-----------+------+-----+-------------------+-----------------------------+
1 row in set (0.00 sec)


//timestamp时间上限是2038-01-19 11:14:07
mysql> insert into t1 values('2038-01-19 11:14:08');
ERROR 1292 (22007): Incorrect datetime value: '2038-01-19 11:14:08' for column 't' at row 1
    
mysql> insert into t1 values('2038-01-19 11:14:07');
Query OK, 1 row affected (0.01 sec)


//timestamp时间下限是1970-01-01 08:00:01
mysql> insert into t1 values('1970-01-01 08:00:00');
ERROR 1292 (22007): Incorrect datetime value: '1970-01-01 08:00:00' for column 't' at row 1
    
mysql> insert into t1 values('1970-01-01 08:00:01');
Query OK, 1 row affected (0.00 sec)
```



### 2.4 ENUM和SET类型

| 类型     | 大小                                                         | 用途               |
| -------- | ------------------------------------------------------------ | ------------------ |
| **ENUM** | **对1-255个成员的枚举需要1个字节存储;对于255-65535个成员，需要2个字节存储;最多允许65535个成员。** | **单选：选择性别** |
| **SET**  | **1-8个成员的集合，占1个字节9-16个成员的集合，占2个字节17-24个成员的集合，占3个字节25-32个成员的集合，占4个字节33-64个成员的集合，占8个字节** | **多选：兴趣爱好** |

#### 2.4.1 ENUM(枚举)使用示例

**ENUM中文名称叫枚举类型，它的值范围需要在创建表时通过枚举方式显示。ENUM只允许从值集合中选取单个值，而不能一次取多个值**

```python
//创建t1表，性别设置为ENUM类型
mysql> create table t1(id int,name char(10),sex enum('F','M'));
Query OK, 0 rows affected (0.02 sec)

//向t1表中插入数据，性别是在ENUM中定义的就可插入成功
mysql> insert into t1 values(1,'小明','M');
Query OK, 1 row affected (0.00 sec)

mysql> insert into t1 values(1,'小红','F');
Query OK, 1 row affected (0.01 sec)

//性别插入ENUM中没有定义的就会报错
mysql> insert into t1 values(1,'小红','A');
ERROR 1265 (01000): Data truncated for column 'sex' at row 1
```



#### 2.4.2 SET(集合)使用示例

**SET和ENUM非常相似，也是一个字符串对象，里面可以包含0-64个成员。根据成员的不同，存储上也有所不同。set类型可以允许值集合中任意选择1或多个元素进行组合。对超出范围的内容将不允许注入，而对重复的值将进行自动去重。**

```python
//创建表t1，爱好列设置为SET类型
mysql> create table t1(id int,name char(10),hobby set('篮球','足球','看电影'));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t1 values(1,'小明','篮球');
Query OK, 1 row affected (0.01 sec)

mysql> insert into t1 values(2,'小洲','篮球,足球');
Query OK, 1 row affected (0.00 sec)

mysql> insert into t1 values(3,'小丽','篮球,足球,篮球,看电影,足球');
Query OK, 1 row affected (0.00 sec)

//查询结果可以看到SET可以只选择一个爱好，选择多个爱好，并且可以去重
mysql> select * from t1;
+------+--------+-------------------------+
| id   | name   | hobby                   |
+------+--------+-------------------------+
|    1 | 小明   | 篮球                    |
|    2 | 小洲   | 篮球,足球               |
|    3 | 小丽   | 篮球,足球,看电影        |
+------+--------+-------------------------+
3 rows in set (0.00 sec)
```

