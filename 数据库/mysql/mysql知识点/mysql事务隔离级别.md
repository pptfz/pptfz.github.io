[toc]



# mysql事务隔离级别

## mysql事务

一般来说，事务是必须满足4个条件（ACID）：：原子性（**A**tomicity，或称不可分割性）、一致性（**C**onsistency）、隔离性（**I**solation，又称独立性）、持久性（**D**urability）。

- **原子性：**一个事务（transaction）中的所有操作，要么全部完成，要么全部不完成，不会结束在中间某个环节。事务在执行过程中发生错误，会被回滚（Rollback）到事务开始前的状态，就像这个事务从来没有执行过一样。
- **一致性：**在事务开始之前和事务结束以后，数据库的完整性没有被破坏。这表示写入的资料必须完全符合所有的预设规则，这包含资料的精确度、串联性以及后续数据库可以自发性地完成预定的工作。
- **隔离性：**数据库允许多个并发事务同时对其数据进行读写和修改的能力，隔离性可以防止多个事务并发执行时由于交叉执行而导致数据的不一致。事务隔离分为不同级别，包括读未提交（Read uncommitted）、读提交（read committed）、可重复读（repeatable read）和串行化（Serializable）。
- **持久性：**事务处理结束后，对数据的修改就是永久的，即便系统故障也不会丢失。



## mysql 4种事务隔离级别



| 级别     | symbol           | 对应值 | 含义                                                   | 存在问题                                                     |
| -------- | ---------------- | ------ | ------------------------------------------------------ | ------------------------------------------------------------ |
| 读未提交 | READ-UNCOMMITTED | 0      | 一个事务可以读到另一个事务未提交的数据                 | 存在脏读、不可重复读、幻读的问题                             |
| 读已提交 | READ-COMMITTED   | 1      | 一个事务能读到另一个事务已提交的数据                   | 解决脏读的问题，存在不可重复读、幻读的问题                   |
| 可重复读 | REPEATABLE-READ  | 2      | 同一事务的多个实例在并发读取数据时，会看到同样的数据行 | mysql默认级别，解决脏读、不可重复读的问题，存在幻读的问题。使用 MMVC机制 实现可重复读 |
| 串行化   | SERIALIZABLE     | 3      | 强制事务排序，使之不可能相互冲突                       | 解决脏读、不可重复读、幻读，可保证事务安全，但完全串行执行，性能最低 |



**关于mysql事务的一些知识点**

- **最开始的时候，5.1.5之前的版本binlog format只支持stament，并没有row模式，在RC一些场景下会造成主从数据不一致，所以选择RR才能最大限度保证主从数据一致性**
- **之后的mysql直接使用RC+row是完全没有问题的**





**mysql5.7表的默认存储引擎是InnoDB**

```python
mysql> show create table t1;
+-------+---------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                          |
+-------+---------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
  `id` int(3) NOT NULL,
  `name` char(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
+-------+---------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.05 sec)
```



**mysql5.7 InnoDB存储引擎默认的事务隔离级别，全局和当前会话都是REPEATABLE-READ(可重复读)**

**<span style={{color: 'red'}}>RR的并发性没有RC好</span>**

```python
#mysql5.7.22
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set (0.02 sec)
```



**设置事务隔离级别**

```python
#配置文件修改，可选参数	READ-UNCOMMITTED、READ-COMMITTED、REPEATABLE-READ、 SERIALIZABLE
[mysqld]
transaction-isolation = REPEATABLE-READ

#设置全局
SET @@global.tx_isolation = 0;
SET @@global.tx_isolation = 'READ-UNCOMMITTED';

SET @@global.tx_isolation = 1;
SET @@global.tx_isolation = 'READ-COMMITTED';

SET @@global.tx_isolation = 2;
SET @@global.tx_isolation = 'REPEATABLE-READ';

SET @@global.tx_isolation = 3;
SET @@global.tx_isolation = 'SERIALIZABLE';

#设置会话
SET @@session.tx_isolation = 0;
SET @@session.tx_isolation = 'READ-UNCOMMITTED';

SET @@session.tx_isolation = 1;
SET @@session.tx_isolation = 'READ-COMMITTED';

SET @@session.tx_isolation = 2;
SET @@session.tx_isolation = 'REPEATABLE-READ';

SET @@session.tx_isolation = 3;
SET @@session.tx_isolation = 'SERIALIZABLE';
```



mysql查看/设置自动提交

```python
//查看自动提交是否开启，默认开启
#方法一
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            1 |
+--------------+
1 row in set (0.07 sec)

#方法二
mysql> show variables like 'autocommit';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | ON    |
+---------------+-------+
1 row in set (0.09 sec)

//关闭自动提交
mysql> set autocommit = 0;
Query OK, 0 rows affected (0.11 sec)
```



---

**以下所有示例都基于mysql5.7.22**

**先创建一张示例表t1**

```python
mysql> select version();
+-----------+
| version() |
+-----------+
| 5.7.22    |
+-----------+
mysql> create table t1(id int(3) primary key,name char(30));
mysql> insert into t1 values(1,'xiaoming');
mysql> select * from t1;
+----+----------+
| id | name     |
+----+----------+
|  1 | xiaoming |
+----+----------+
```



### 1 读未提交	Read Uncommitted

含义：一个事务可以读到另一个事务未提交的数据！

示例：

```python
1.mysql默认的事务隔离级别是RR 可用值2来设置
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)

2.手动修改当前会话为RU
mysql> SET @@session.tx_isolation = 0;
Query OK, 0 rows affected, 1 warning (0.12 sec)

mysql> SELECT @@tx_isolation;
+------------------+
| @@tx_isolation   |
+------------------+
| READ-UNCOMMITTED |
+------------------+
1 row in set, 1 warning (0.04 sec)

3.关闭自动提交
mysql> set autocommit = 0;
Query OK, 0 rows affected (0.08 sec)
```



![iShot2020-05-0917.15.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-0917.15.28.png)

如图所示，一个事务检索的数据被另一个未提交的事务给修改了。

[官网对**脏读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_dirty_read)
其内容为

> **dirty read
> An operation that retrieves unreliable data, data that was updated by another transaction but not yet committed.**

翻译过来就是

> **检索操作出来的数据是不可靠的，是可以被另一个未提交的事务修改的！**

你会发现，我们的演示结果和官网对脏读的定义一致。根据我们最开始的推理，如果存在脏读，那么不可重复读和幻读一定是存在的。



### 2 读提交	Read Committed

含义：一个事务能读到另一个事务已提交的数据

示例：

```python
1.mysql默认的事务隔离级别是RR 可用值2来设置
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)

2.手动修改当前会话为RC
mysql> SET @@session.tx_isolation = 1;
Query OK, 0 rows affected, 1 warning (0.12 sec)

mysql> select @@tx_isolation;
+----------------+
| @@tx_isolation |
+----------------+
| READ-COMMITTED |
+----------------+
1 row in set, 1 warning (0.04 sec)

3.关闭自动提交
mysql> set autocommit = 0;
Query OK, 0 rows affected (0.08 sec)
```

![iShot2020-05-0813.12.21](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-0813.12.21.png)

如图所示，一个事务检索的数据只能被另一个已提交的事务修改。

[官网对**不可重复读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_non_repeatable_read)

其内容为

> **non-repeatable read
> The situation when a query retrieves data, and a later query within the same transaction retrieves what should be the same data, but the queries return different results (changed by another transaction committing in the meantime).
> **

翻译过来就是

> **一个查询语句检索数据，随后又有一个查询语句在同一个事务中检索数据，两个数据应该是一样的，但是实际情况返回了不同的结果。！**

`ps`:作者注，这里的不同结果，指的是在行不变的情况下(专业点说，主键索引没变)，主键索引指向的磁盘上的数据内容变了。如果主键索引变了，比如新增一条数据或者删除一条数据，就不是不可重复读。

显然，我们这个现象符合不可重复读的定义。下面，大家做一个思考:

- 这个不可重复读的定义，放到脏读的现象里是不是也可以说的通。显然脏读的现象，也就是**读未提交(READ_UNCOMMITTED)**的那个例子，是不是也符合在同一个事务中返回了不同结果！
- 但是反过来就不一定通了，一个事务A中查询两次的结果在被另一个事务B改变的情况下，如果事务B未提交就改变了事务A的结果，就属于脏读，也属于不可重复读。如果该事务B提交了才改变事务A的结果，就不属于脏读，但属于不可重复读。



### 3 可重复读	Repeatable Read

[官网对**幻读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_phantom)

> **phantom
> A row that appears in the result set of a query, but not in the result set of an earlier query. For example, if a query is run twice within a transaction, and in the meantime, another transaction commits after inserting a new row or updating a row so that it matches the WHERE clause of the query.**

翻译过来就是

> **在一次查询的结果集里出现了某一行数据，但是该数据并未出现在更早的查询结果集里。例如，在一次事务里进行了两次查询，同时另一个事务插入某一行或更新某一行数据后(该数据符合查询语句里where后的条件)，并提交了！**

幻读(Phantom Read)说明

> **原因：事务A根据相同条件第二次查询，虽然查询不到事务B提交的新增数据，但是会影响事务A之后的一些操作，比如：事务A进行了一次select * from t1表查询，查询出id为1的数据，同时事务B进行了一次insert into t1 values(2,'xx')，也就是此时表中有了id为2的数据，但是在事务A中再次进行查询的时候，根本就查不到id为2的数据，但是当事务A进行insert into t1 values(2,'xx')，也想插入id为2的数据的时候，发现报错了，但是事务A怎么查也查不到有id为2的数据，这就让事务A的使用者出现了幻觉，what happend！。如果不想出现幻读问题，那么自己在查询语句中手动加锁 for update，如果查询的是id为2的数据，即便是现在没有id为2的数据，其他事务也无法对id为2的索引位置进行数据的处理。**



含义：同一事务的多个实例在并发读取数据时，会看到同样的数据行

示例：

```python
1.mysql默认的事务隔离级别是RR 可用值2来设置
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)
```

![iShot2020-05-0917.24.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-0917.24.45.png)



显然，该现象是符合幻读的定义的。即同一事务的两次相同查询出现不同行。

[官网对解决幻读方法的地址](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking.html#innodb-record-locks)

原文内容如下

> **By default, InnoDB operates in REPEATABLE READ transaction isolation level. In this case, InnoDB uses next-key locks for searches and index scans, which prevents phantom rows (see Section 14.7.4, “Phantom Rows”).**

翻译过来就是

> **InnoDB默认用了REPEATABLE READ。在这种情况下，使用next-key locks解决幻读问题！**



*以下两步均在session2中执行，正确结果是id为1的数据name已经改为abc*

不加``next-key locks``是快照读，根本不能解决幻读问题

```python
mysql> select * from t1;
+----+----------+
| id | name     |
+----+----------+
|  1 | xiaoming |
|  2 | hehe     |
+----+----------+
2 rows in set (0.09 sec)
```

加上``next-key locks``就能解决幻读问题

```python
mysql> select * from t1 lock in share mode;
+----+------+
| id | name |
+----+------+
|  1 | abc  |
|  2 | hehe |
+----+------+
2 rows in set (0.05 sec)
```





### 4 串行化	Serializable Read

在该隔离级别下，所有的`select`语句后都自动加上`lock in share mode`。因此，在该隔离级别下，无论你如何进行查询，都会使用`next-key locks`。所有的`select`操作均为当前读!



含义：强制事务排序，使之不可能相互冲突

示例：

```python
1.mysql默认的事务隔离级别是RR 可用值2来设置
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)

2.手动修改当前会话为串行读
mysql> SET @@session.tx_isolation = 3;
Query OK, 0 rows affected, 1 warning (0.12 sec)

mysql> select @@tx_isolation;
+----------------+
| @@tx_isolation |
+----------------+
| READ-COMMITTED |
+----------------+
1 row in set, 1 warning (0.04 sec)

3.关闭自动提交
mysql> set autocommit = 0;
Query OK, 0 rows affected (0.08 sec)
```



![iShot2020-05-0923.08.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-0923.08.09.png)

OK,注意看上表红色部分！就是因为使用了`next-key locks`,innodb将PiD=1这条索引记录，和(1,++∞)这个间隙锁住了。其他事务要在这个间隙上插数据，就会阻塞，从而防止幻读发生!
有的人会说，你这第二次查询的结果，也变了啊，明显和第一次查询结果不一样啊？但是这是被自己的事务改的，不是被其他事物修改的。这不算是幻读，也不是不可重复读。

---



## 脏读、不可重复度、幻读

根据事务的隔离级别不同，会有三种情况发生，即脏读、不可重复度、幻读，这三种情况有如下包含关系

![iShot2020-05-0922.06.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-0922.06.50.png)

对上图解释

- 如果发生了脏读，那么不可重复读和幻读是一定发生的。因为拿脏读的现象，用不可重复读，幻读的定义也能解释的通。但是反过来，拿不可重复读的现象，用脏读的定义就不一定解释的通了！



**mysql事务隔离级别对应的现象**

| 隔离级别                     | 对应值 | 脏读 | 不可重复读 | 幻读 |
| ---------------------------- | ------ | ---- | ---------- | ---- |
| READ-UNCOMMITTED（读未提交） | 0      | √    | √          | √    |
| READ-COMMITTED（读提交）     | 1      | ×    | √          | √    |
| REPEATABLE-READ（可重复读）  | 2      | ×    | ×          | √    |
| SERIALIZABLE （可串行化）    | 3      | ×    | ×          | ×    |



### 脏读

#### 定义

[官网对**脏读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_dirty_read)
其内容为

> **dirty read
> An operation that retrieves unreliable data, data that was updated by another transaction but not yet committed.**

翻译过来就是

> **检索操作出来的数据是不可靠的，是可以被另一个未提交的事务修改的！**

根据我们最开始的推理，如果存在脏读，那么不可重复读和幻读一定是存在的。

#### 示例

新建一张表，并且隔离级别设置为读未提交 READ-UNCOMMITTED

```python
1.新建表t1
mysql> create table t1(id int primary key,name char(30),money double);
Query OK, 0 rows affected (0.01 sec)

2.插入数据
mysql> insert into t1 values(1,'xiaoming',100);
Query OK, 1 row affected (0.00 sec)

3.设置当前会话事务隔离级别为读未提交 READ-UNCOMMITTED
mysql> SET @@session.tx_isolation = 'READ-UNCOMMITTED';
Query OK, 0 rows affected, 1 warning (0.00 sec)

4.查看事务隔离级别 global是全局 session是会话
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+------------------+
| @@global.tx_isolation | @@tx_isolation   |
+-----------------------+------------------+
| REPEATABLE-READ       | READ-UNCOMMITTED |
+-----------------------+------------------+
1 row in set, 2 warnings (0.00 sec)

5.关闭自动提交
mysql> set @@autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

6.查看自动提交是否关闭，1为开启，0为关闭
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            0 |
+--------------+
1 row in set (0.00 sec)
```

![iShot2020-05-1022.39.15](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1022.39.15.png)

脏读定义

> **检索操作出来的数据是不可靠的，是可以被另一个未提交的事务修改的！**

上图中的示例session2中查询的数据是不可靠的，被未提交的事物session1修改了，这就是脏读

举个例子描述一下这个过程，财务(session1)给小明(session2)发了100元工资，然后小明查询自己的账户，果然是多了100元，变成了200元，但是财务发现操作有误，选择了事务回滚，这个时候当小明再查询自己账户的时候，发现账户变成了100元



### 不可重复读

#### 定义

[官网对**不可重复读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_non_repeatable_read)

其内容为

> **non-repeatable read
> The situation when a query retrieves data, and a later query within the same transaction retrieves what should be the same data, but the queries return different results (changed by another transaction committing in the meantime).**

翻译过来就是

> **一个查询语句检索数据，随后又有一个查询语句在同一个事务中检索数据，两个数据应该是一样的，但是实际情况返回了不同的结果。！**

`ps`:作者注，这里的不同结果，指的是在行不变的情况下(专业点说，主键索引没变)，主键索引指向的磁盘上的数据内容变了。如果主键索引变了，比如新增一条数据或者删除一条数据，就不是不可重复读。

显然，我们这个现象符合不可重复读的定义。下面，大家做一个思考:

- 这个不可重复读的定义，放到脏读的现象里是不是也可以说的通。显然脏读的现象，也就是**读未提交(READ_UNCOMMITTED)**的那个例子，是不是也符合在同一个事务中返回了不同结果！
- 但是反过来就不一定通了，一个事务A中查询两次的结果在被另一个事务B改变的情况下，如果事务B未提交就改变了事务A的结果，就属于脏读，也属于不可重复读。如果该事务B提交了才改变事务A的结果，就不属于脏读，但属于不可重复读。

#### 示例-读提交

新建一张表，并且隔离级别设置为读提交 READ-COMMITTED

```python
1.新建表t1
mysql> create table t1(id int primary key,name char(30),money double);
Query OK, 0 rows affected (0.01 sec)

2.插入数据
mysql> insert into t1 values(1,'xiaoming',100);
Query OK, 1 row affected (0.00 sec)

3.设置当前会话事务隔离级别为读提交 READ-COMMITTED
mysql> SET @@session.tx_isolation = 'READ-COMMITTED';
Query OK, 0 rows affected, 1 warning (0.00 sec)

4.查看事务隔离级别 global是全局 session是会话
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+----------------+
| @@global.tx_isolation | @@tx_isolation |
+-----------------------+----------------+
| REPEATABLE-READ       | READ-COMMITTED |
+-----------------------+----------------+
1 row in set, 2 warnings (0.00 sec)

5.关闭自动提交
mysql> set @@autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

6.查看自动提交是否关闭，1为开启，0为关闭
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            0 |
+--------------+
1 row in set (0.00 sec)
```



![iShot2020-05-1023.17.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1023.17.31.png)



- **不可重复读是指在事务1内，读取了一个数据，事务1还没有结束时，事务2也访问了这个数据，修改了这个数据，并提交。紧接着，事务1又读这个数据。由于事务2的修改，那么事务1两次读到的的数据可能是不一样的，因此称为是不可重复读。**



#### 示例-可重复读

新建一张表，并且隔离级别设置为可重复读 REPEATABLE-READ

```python
1.新建表t1
mysql> create table t1(id int primary key,name char(30),money double);
Query OK, 0 rows affected (0.01 sec)

2.插入数据
mysql> insert into t1 values(1,'xiaoming',100);
Query OK, 1 row affected (0.00 sec)

3.设置当前会话事务隔离级别为可重复读 REPEATABLE-READ
mysql> SET @@session.tx_isolation = 'REPEATABLE-READ';
Query OK, 0 rows affected, 1 warning (0.00 sec)

4.查看事务隔离级别 global是全局 session是会话
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)

5.关闭自动提交
mysql> set @@autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

6.查看自动提交是否关闭，1为开启，0为关闭
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            0 |
+--------------+
1 row in set (0.00 sec)
```



![iShot2020-05-1023.04.19](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1023.04.19.png)

- 上述示例说明当我们将当前会话的隔离级别设置为可重复读的时候，当前会话可以重复读，就是每次读取的结果集都相同，而不管其他事务有没有提交。

- 当session1 commit的时候，才能看到最终的正确结果，这会产生幻读



### 幻读

#### 定义

[官网对**幻读**定义的地址](https://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_phantom)

> phantom
> A row that appears in the result set of a query, but not in the result set of an earlier query. For example, if a query is run twice within a transaction, and in the meantime, another transaction commits after inserting a new row or updating a row so that it matches the WHERE clause of the query.



翻译过来就是

> 在一次查询的结果集里出现了某一行数据，但是该数据并未出现在更早的查询结果集里。例如，在一次事务里进行了两次查询，同时另一个事务插入某一行或更新某一行数据后(该数据符合查询语句里where后的条件)，并提交了！



大白话说明一下

> 所谓幻读，指的是当某个事务在读取某个范围内的记录时，另外一个事务又在该范围内插入了新的记录，当之前的事务再次读取该范围的记录时，会产生幻读
>
> 就是事务1查询 `id<10` 的记录时，返回了2条记录，接着事务2插入了一条id为3的记录，并提交。接着事务1查询 `id<10` 的记录时，返回了3条记录，说好的可重复读呢？结果却多了一条数据。



幻读(Phantom Read)原因

> 原因：事务A根据相同条件第二次查询，虽然查询不到事务B提交的新增数据，但是会影响事务A之后的一些操作，比如：事务A进行了一次`select * from t1` 表查询，查询出id为1的数据，同时事务B进行了一次 `insert into t1 values(2,'xx')` ，也就是此时表中有了id为2的数据，但是在事务A中再次进行查询的时候，根本就查不到id为2的数据，但是当事务A进行 `insert into t1 values(2,'xx')` ，也想插入id为2的数据的时候，发现报错了，但是事务A怎么查也查不到有id为2的数据，这就让事务A的使用者出现了幻觉，what happend！。如果不想出现幻读问题，那么自己在查询语句中手动加锁 for update，如果查询的是id为2的数据，即便是现在没有id为2的数据，其他事务也无法对id为2的索引位置进行数据的处理。

[官网对解决幻读方法的地址](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking.html#innodb-record-locks)

原文内容如下

> By default, InnoDB operates in REPEATABLE READ transaction isolation level. In this case, InnoDB uses next-key locks for searches and index scans, which prevents phantom rows (see Section 14.7.4, “Phantom Rows”).

翻译过来就是

> InnoDB默认用了REPEATABLE READ。在这种情况下，使用next-key locks解决幻读问题！





> 

> 

> 



> 





#### 示例

新建一张表，并且隔离级别设置为可重复读 REPEATABLE-READ

```python
1.新建表t1
mysql> create table t1(id int primary key,name char(30),money double);
Query OK, 0 rows affected (0.01 sec)

2.插入数据
mysql> insert into t1 values(1,'xiaoming',100);
Query OK, 1 row affected (0.00 sec)

3.设置当前会话事务隔离级别为可重复读 REPEATABLE-READ
mysql> SET @@session.tx_isolation = 'REPEATABLE-READ';
Query OK, 0 rows affected, 1 warning (0.00 sec)

4.查看事务隔离级别 global是全局 session是会话
mysql> SELECT @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
1 row in set, 2 warnings (0.00 sec)

5.关闭自动提交
mysql> set @@autocommit = 0;
Query OK, 0 rows affected (0.00 sec)

6.查看自动提交是否关闭，1为开启，0为关闭
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            0 |
+--------------+
1 row in set (0.00 sec)
```



![iShot2020-05-1023.48.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1023.48.16.png)

不加``next-key locks``是快照读，根本不能解决幻读问题

```python
mysql> select * from t1;
+----+----------+-------+
| id | name     | money |
+----+----------+-------+
|  1 | xiaoming |   100 |
+----+----------+-------+
1 row in set (0.00 sec)
```

加上``next-key locks``就能解决幻读问题

```python
mysql> select * from t1 lock in share mode;
+----+----------+-------+
| id | name     | money |
+----+----------+-------+
|  1 | xiaoming |   100 |
|  2 | dahong   |   500 |
+----+----------+-------+
2 rows in set (0.00 sec)


mysql> select * from t1 for update;
+----+----------+-------+
| id | name     | money |
+----+----------+-------+
|  1 | xiaoming |   100 |
|  2 | dahong   |   500 |
+----+----------+-------+
2 rows in set (0.00 sec)
```



- **<span style={{color: 'red'}}>很多人容易搞混不可重复读和幻读，确实这两者有些相似。但不可重复读重点在于update和delete，而幻读的重点在于insert。</span>**



- **<span style={{color: 'red'}}>总的来说幻读就是事务A对数据进行操作，事务B还是可以用insert插入数据的，因为使用的是行锁，这样导致的各种奇葩问题就是幻读</span>**

