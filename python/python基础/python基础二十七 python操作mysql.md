[toc]



# python基础二十七	python操作mysql

# 1.安装pymysql

```python
pip3 install pymysql
```



# 2.python连接mysql

## 2.1python连接mysql语法

```python
//导入pymysql模块
import pymysql

//打开数据库连接
⚠️⚠️⚠️指定字符集的时候utf-8在这里的写法为utf8
conn = pymysql.connect("数据库ip","用户","密码","数据库","端口(不写默认为3306)","字符集") 

//使用cursor()方法获取操作游标 
cursor = conn.cursor()

//使用execute()方法执行SQL操作
cursor.execute("SQL语句")  

//使用fetchone()方法获取单条数据
data = cursor.fetchone()                              
print ("Database version : %s " %data)

//关闭游标
cursor.close()

//关闭数据库连接
conn.close()                                            
```



## 2.2python连接mysql简单查询示例

```python
//数据库db1中有一张t1表，表内容如下
mysql> select * from t1;
+------+--------+
| id   | name   |
+------+--------+
|    1 | 小明   |
|    2 | 小颖   |
|    3 | 小丽   |
+------+--------+
3 rows in set (0.00 sec)


//接下来连接数据库进行操作
#导入pymysql模块
import pymysql

#打开数据库连接
conn = pymysql.connect(
        host='xxx', user='xxx', password="xxx",
        database='db1', port=3306, charset='utf8',
)

#创建游标
cursor = conn.cursor()

#定义一个变量，存放sql语句
sql = 'select * from t1'

#使用execute()方法执行sql操作
cursor.execute(sql)

#使用fetchall()方法获取所有数据
data = cursor.fetchall()

#打印查询的内容
print(data)
((1, '小明'), (2, '小颖'), (3, '小丽'))

#关闭游标
cursor.close()
#关闭连接
conn.close()
```



# 3.python操作mysql

## 3.1创建表操作

```python
#导入pymysql模块
import pymysql
 
#打开数据库连接
db = pymysql.connect("localhost","testuser","test123","TESTDB" )
 
#使用cursor()方法创建一个游标对象cursor
cursor = db.cursor()
 
#使用execute()方法执行 SQL，如果表存在则删除
cursor.execute("drop table if exists t2")

#使用预处理语句创建表
sql = """create table t2(
  id int not null,
  age int not null,
  name char(10) not null,
  hobby set('唱','跳','rap','篮球'))"""

#执行sql语句
cursor.execute(sql)
 
#查看结果
mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
| t2            |
+---------------+
2 rows in set (0.00 sec)

mysql> desc t2;
+-------+---------------------------------+------+-----+---------+-------+
| Field | Type                            | Null | Key | Default | Extra |
+-------+---------------------------------+------+-----+---------+-------+
| id    | int(11)                         | NO   |     | NULL    |       |
| age   | int(11)                         | NO   |     | NULL    |       |
| name  | char(10)                        | NO   |     | NULL    |       |
| hobby | set('唱','跳','rap','篮球')     | YES  |     | NULL    |       |
+-------+---------------------------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

#关闭游标
cursor.clos()
  
#关闭数据库连接
conn.close()
```



## 3.2数据操作

### 3.2.1查询操作

```python
python操作mysql时获取数据的方法有3种
	cursor.fetchone()		#查询返回一条结果
	cursor.fetchmany(n)	#查询返回指定的条数，n为数字
	cursor.fetchall()		#查询返回所有的结果
  

//数据库db1中有一张t1表，表内容如下
mysql> select * from t1;
+------+--------+
| id   | name   |
+------+--------+
|    1 | 小明   |
|    2 | 小颖   |
|    3 | 小丽   |
+------+--------+
3 rows in set (0.00 sec)


//使用cursor.fetchone()方法获取一条结果
data = cursor.fetchone()
print(data)
(1, '小明')


//使用cursor.fetchmany(n)方法指定获取的内容个数，n为数字
#fetchmany不指定获取个数时返回的内容
data = cursor.fetchmany()
print(data)
((1, '小明'),)

#fetchmany指定获取个数时返回的内容
data = cursor.fetchmany(2)
print(data)
((1, '小明'), (2, '小颖'))


//使用cursor.fetchall()方法获取全部内容
data = cursor.fetchall()
print(data)
((1, '小明'), (2, '小颖'), (3, '小丽'))
```



**fetch方法返回的结果都是元组，没法看出哪个数据是对应的哪个字段，可以采用字典的方式显示，这样看起来比较明确**

```python
可以在创建游标的时候，加上一个参数让返回的结果是字典格式展示

//创建游标的时候加上一个参数cursor=pymysql.cursors.DictCursor让返回的结果是字典格式
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

data = cursor.fetchall()
print(data)
[{'id': 1, 'name': '小明'}, {'id': 2, 'name': '小颖'}, {'id': 3, 'name': '小丽'}]
```



### 3.2.2增加数据操作

```python
//数据库中t2表内容为空
mysql> desc t2;
+-------+---------------------------------+------+-----+---------+-------+
| Field | Type                            | Null | Key | Default | Extra |
+-------+---------------------------------+------+-----+---------+-------+
| id    | int(11)                         | NO   |     | NULL    |       |
| age   | int(11)                         | NO   |     | NULL    |       |
| name  | char(10)                        | NO   |     | NULL    |       |
| hobby | set('唱','跳','rap','篮球')     | YES  |     | NULL    |       |
+-------+---------------------------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

mysql> select * from t2;
Empty set (0.00 sec)


//现在向t2表中插入数据
import pymysql

conn = pymysql.connect(
        host='xxx', user='pptfz', password="xxx",
        database='db1', port=3306, charset='utf8',
)

cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)
sql = """
    insert into t2 values(1,18,'小明','唱,篮球'),
                        (2,20,'小颖','唱,跳'),
                        (3,28,'小坤','唱,跳,rap,篮球')
"""

cursor.execute(sql)
conn.commit()
conn.close()


//查看结果
sql = 'select * from t2'
cursor.execute(sql)
data = cursor.fetchall()
print(data)
[{'id': 1, 'age': 18, 'name': '小明', 'hobby': '唱,篮球'}, {'id': 2, 'age': 20, 'name': '小颖', 'hobby': '唱,跳'}, {'id': 3, 'age': 28, 'name': '小坤', 'hobby': '唱,跳,rap,篮球'}]
```



### 3.2.3删除数据操作

```python
#创建游标
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

#sql语句
sql = 'delete from t2 where id=3'

#执行sql操作，发生错误回滚
try:
    cursor.execute(sql)
    conn.commit()
except:
    conn.rollback()

#关闭连接
conn.close()
```



### 3.2.4修改数据操作

```python
#创建游标
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

#sql语句
sql = 'update t2 set age=30 where id=2'

#执行sql操作，发生错误回滚
try:
    cursor.execute(sql)
    conn.commit()
except:
    conn.rollback()

#关闭连接
conn.close()
```



# 4.execute()之sql注入

## 4.1先做一个简单的登陆认证

**⚠️这里的示例有sql注入的问题，会在后边的示例中解决**

```python
//userinfo表内容如下
mysql> select * from userinfo;
+-------+-------+
| uname | pwd   |
+-------+-------+
| admin | admin |
+-------+-------+
1 row in set (0.00 sec)

//接下来做一个单一的判断
#导入pymysql
import pymysql

#连接mysql
conn = pymysql.connect(
        host='xxx', user='pptfz', password="xxx",
        database='db1', port=3306, charset='utf8',
)

#创建游标
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

#输入用户民共和密码
uname = input('请输入用户名>>>')
password = input('请输入密码>>>')

#执行sql语句，返回结果大于1说明用户名和密码存在，否则就是不存在
sql = "select * from userinfo where uname='%s' and pwd='%s'"%(uname,password)

#执行sql语句
cursor.execute(sql)

#查询的结果
data = cursor.fetchone()

#做判断
if data:
    print('登陆成功')
else:
    print('用户名或密码错误')
conn.close()



执行结果如下：
当输入的用户名和密码存在于userinfo表中时，这里为固定的用户名amin密码admin返回登陆成功，否则返回用户名或密码错误，这样就做了一个简单的用户登陆认证
```

**登陆成功**

![iShot2020-10-16 13.52.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.52.00.png)



**登陆失败**

![iShot2020-10-16 13.52.21](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.52.21.png)





## 4.2sql注入简单示例

### 4.2.1示例1

**接下来做一个操作，在输入用户名的时候，在用户名后边加一个单引号，然后空格，然后写上--，最后--的后面写上任意字符，这样就能在知道用户名的情况下不需要输入密码就可以登陆成功**

```python
import pymysql

conn = pymysql.connect(
        host='xxx', user='pptfz', password="xxx",
        database='db1', port=3306, charset='utf8',
)

cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

uname = input('请输入用户名>>>')
password = input('请输入密码>>>')
# sql = f'select * from userinfo where uname="{uname}" and pwd="{password}"'

sql = "select * from userinfo where uname='%s' and pwd='%s';"%(uname,password)
cursor.execute(sql)

# data = cursor.fetchall()
data = cursor.fetchone()

if data:
    print('登陆成功')
else:
    print('登陆失败')
conn.close()
```

![iShot2020-10-16 13.52.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.52.45.png)





**分析一下结果**

**此时uname这个变量等于``admin' -- xxx``，sql语句被字符串替换之后会变成如下**

**``select * from userinfo where uname='admin' -- xxx' and pwd='';``**



**其中admin后边的``'``，在进行字符串替换的时候，我们输入的是``admin'``，这个引号和前边的引号组成了一对，也就是``select * from userinfo where uname='admin'' -- xxx and pwd=''``**

**``--``在sql语句中是注释的意思，也就是说后面的语句被注释了，此时的sql语句变成了``select * from usrinfo where uname='admin'``，后边的``' -- xxx and pwd=''``变成了注释**

**这样的话就是知道用户名即可登陆成功，这就是最简单的sql注释**



### 4.2.2示例2

**用户名和密码都不需要输入就能登陆成功**

**or后边跟了一个永真的条件，因此不管输入什么都能登陆成功**

![iShot2020-10-16 13.53.05](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.53.05.png)





---

**有些网站直接在输入内容的时候，就限定了不能输入一些特殊的符号，因为有些特殊符号可以改变sql的执行逻辑，其实不光是--，还有一些其他的符号也能改变sql语句的执行逻辑，这个方案是在客户端给用户输入的地方进行限制，但是别人可不可以模拟你的客户端来发送请求，是可以的，他模拟一个客户端，不按照你的客户端的要求来，就发一些特殊字符，你的客户端是限制不了的。**

**》所以单纯的在客户端进行这个特殊字符的过滤是不能解决根本问题的，那怎么办？我们服务端也需要进行验证，可以通过正则来将客户端发送过来的内容进行特殊字符的匹配，如果有这些特殊字符，我们就让它登陆失败。**

**在服务端来解决sql注入的问题：不要自己来进行sql字符串的拼接了，pymysql能帮我们拼接，他能够防止sql注入，所以以后我们再写sql语句的时候按下面的方式写：**

```python
//之前我们的sql语句是这样写的：
sql = "select * from userinfo where uname='%s' and pwd='%s';"%(uname,passwdor)

//以后再写的时候，sql语句里面的%s左右的引号去掉，并且语句后面的%(uname,pword)这些内容也不要自己写了，按照下面的方式写
sql = "select * from userinfo where username=%s and password=%s;"

//难道我们不传值了吗，不是的，我们通过下面的形式，在excute里面写参数：
其实它本质也是帮你进行了字符串的替换，只不过它会将uname和password里面的特殊字符给过滤掉
cursor.execute(sql,[uname,password]) 
```

**使用cursor.execute方法执行sql语句正确写法**

```python
import pymysql

conn = pymysql.connect(
        host='xxx', user='pptfz', password="xxx",
        database='db1', port=3306, charset='utf8',
)

cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

uname = input('请输入用户名>>>')
password = input('请输入密码>>>')
# sql = f'select * from userinfo where uname="{uname}" and pwd="{password}"'

sql = "select * from userinfo where uname=%s and pwd=%s"
cursor.execute(sql,[uname,password])
# data = cursor.fetchall()
data = cursor.fetchone()

if data:
    print('登陆成功')
else:
    print('登陆失败')
conn.close()
```

**使用4.2.1示例1中的写法登陆，会提示登陆失败**

![iShot2020-10-16 13.53.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.53.23.png)





**使用4.2.2示例2中的写法登陆，会提示登陆失败**

![iShot2020-10-16 13.53.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.53.42.png)



**这样使用cursor.execute方法就解决了简单sql注入的问题，因此以后的任意语句都必须使用此写法来代替我们自己写的字符串替换**

``cursor.execute(sql,[uname,password])``



## 4.3sql注入简单总结

### 4.3.1sql注入的两种方法

```python
两种sql注入方法
1、sql注入之：用户存在，绕过密码
用户名' -- 任意字符

2、sql注入之：用户不存在，绕过用户与密码
用户名' or 1=1 -- 任意字符
```



### 4.3.2通过pymysql提供的excute()方法解决了简单sql注入问题

```python
//原来是我们对sql进行字符串拼接
sql="select * from userinfo where uname='%s' and pwd='%s'" %(uname,password)
print(sql)
data = cursor.execute(sql)

//改写为execute帮我们做字符串拼接，我们无需且一定不能再为%s加引号了
sql="select * from userinfo where uname=%s and pwd=%s" 

//⚠️%s需要去掉引号，因为pymysql会自动为我们加上
data = cursor.execute(sql,[uname,password]) #pymysql模块自动帮我们解决sql注入的问题，只要我们按照pymysql的规矩来。
```



**⚠️⚠️⚠️sql语句不要自己拼接，交给pymysql提供的execute方法解决**

