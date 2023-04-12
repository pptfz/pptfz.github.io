# mysql批量修改字段内容

## 1.数据准备

先创建一张表

```mysql
create table t1(address char(30));
```



插入数据

```mysql
insert into t1 values('aaa.bbb.ccc'),('111.aaa.eee'),('666.ooo.aaa');
```



查看

```mysql
mysql> select * from t1;
+-------------+
| address     |
+-------------+
| aaa.bbb.ccc |
| 111.aaa.eee |
| 666.ooo.aaa |
+-------------+
```



## 2.批量替换

语句

```mysql
SELECT 字段名, REPLACE(字段名, '要替换的内容', '替换为什么') from 表名;
UPDATE 表名 set 字段名 = REPLACE(字段名, '要替换的内容', '替换为什么');
```



示例

将 `aaa` 批量替换为 `hehe`

可以先使用 `SELECT 字段名, REPLACE(字段名, '要替换的内容', '替换为什么') from 表名;` 查询一下

```mysql
mysql> SELECT address, REPLACE(address, 'aaa', 'hehe') from t1;
+-------------+---------------------------------+
| address     | REPLACE(address, 'aaa', 'hehe') |
+-------------+---------------------------------+
| aaa.bbb.ccc | hehe.bbb.ccc                    |
| 111.aaa.eee | 111.hehe.eee                    |
| 666.ooo.aaa | 666.ooo.hehe                    |
+-------------+---------------------------------+
```



此时数据是没有正真修改的，类似于 `sed` 命令不加 `-i` 选项

```mysql
mysql> select * from t1;
+-------------+
| address     |
+-------------+
| aaa.bbb.ccc |
| 111.aaa.eee |
| 666.ooo.aaa |
+-------------+
```



接下来使用语句 `UPDATE 表名 set 字段名 = REPLACE(字段名, '要替换的内容', '替换为什么');`

```mysql
UPDATE t1 set address = REPLACE(address, 'aaa', 'hehe');
```



再次查看，此时数据已经修改

```mysql
mysql> select * from t1;
+--------------+
| address      |
+--------------+
| hehe.bbb.ccc |
| 111.hehe.eee |
| 666.ooo.hehe |
+--------------+
```



