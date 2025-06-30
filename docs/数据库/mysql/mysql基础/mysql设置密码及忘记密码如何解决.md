[toc]



# mysql设置密码及忘记密码如何解决



## mysql5.6

### 方法一	mysqladmin

**修改指定用户密码**

```mysql
mysqladmin -u用户名 -p旧密码 password 新密码
```



**示例：使用`mysqladmin`命令给root设置密码**

**<span style={{color: 'red'}}>mysql5.7和mysql8中在命令行使用命令`mysqladmin`会有警告信息，mysql5.6没有</span>**

```python
$ mysqladmin -uroot -p password
Enter password: 
New password: 
Confirm new password: 
Warning: Since password will be sent to server in plain text, use ssl connection to ensure password safety.
```



### 方法二	set password

**修改指定用户密码**

```mysql
set password for 用户名@localhost = password('新密码');
```



**默认修改root密码**

```mysql
set password='新密码'	或		set password=password('新密码');
```



### 方法三	update更新user表

**<span style={{color: 'red'}}>⚠️mysql5.6中user表中密码的字段是`password`</span>**

**<span style={{color: 'red'}}>⚠️mysql5.7和8中user表中密码的字段是`authentication_string`</span>**

**<span style={{color: 'red'}}>⚠️mysql8中user表中密码的字段`authentication_string`后边直接跟字符串即可，不能写password</span>**

**mysql5.6**

```python
update mysql.user set password=password('新密码') where user='root' and host='localhost'; 
```



**mysql5.7**

```python
update mysql.user set authentication_string=password('新密码') where user='root' and host='localhost'; 
```



**mysql8**

```python
update mysql.user set authentication_string='新密码' where user='root' and host='localhost'; 
```





## mysql5.7

### 方法一	mysqladmin

**修改指定用户密码**

```mysql
mysqladmin -u用户名 -p旧密码 password 新密码
```



**示例：使用`mysqladmin`命令给root设置密码**

**<span style={{color: 'red'}}>mysql5.7和mysql8中在命令行使用命令`mysqladmin`会有警告信息，mysql5.6没有</span>**

```python
$ mysqladmin -uroot -p password
Enter password: 
New password: 
Confirm new password: 
Warning: Since password will be sent to server in plain text, use ssl connection to ensure password safety.
```





### 方法二	set password

**修改指定用户密码**

```mysql
set password for 用户名@localhost = password('新密码');
```



**默认修改root密码**

```mysql
set password='新密码'	或		set password=password('新密码');
```





### 方法三	update更新user表

**<span style={{color: 'red'}}>⚠️mysql5.6中user表中密码的字段是`password`</span>**

**<span style={{color: 'red'}}>⚠️mysql5.7和8中user表中密码的字段是`authentication_string`</span>**

**<span style={{color: 'red'}}>⚠️mysql8中user表中密码的字段`authentication_string`后边直接跟字符串即可，不能写password</span>**

**mysql5.6**

```python
update mysql.user set password=password('新密码') where user='root' and host='localhost'; 
```



**mysql5.7**

```python
update mysql.user set authentication_string=password('新密码') where user='root' and host='localhost'; 
```



**mysql8**

```python
update mysql.user set authentication_string='新密码' where user='root' and host='localhost'; 
```



## mysql8.0

### 方法一	mysqladmin

**修改指定用户密码**

```mysql
mysqladmin -u用户名 -p旧密码 password 新密码
```



**示例：使用`mysqladmin`命令给root设置密码**

**<span style={{color: 'red'}}>mysql5.7和mysql8中在命令行使用命令`mysqladmin`会有警告信息，mysql5.6没有</span>**

```mysql
$ mysqladmin -uroot -p password
Enter password: 
New password: 
Confirm new password: 
Warning: Since password will be sent to server in plain text, use ssl connection to ensure password safety.
```





### 方法二	set password

**<span style={{color: 'red'}}>⚠️mysql8中以下两种方式不可用</span>**

```mysql
set password=password('新密码');

set password for root@localhost = password('新密码');
```



**只能用如下方法**

```python
set password='新密码'
```



### 方法三	update更新user表

**<span style={{color: 'red'}}>⚠️mysql5.6中user表中密码的字段是`password`</span>**

**<span style={{color: 'red'}}>⚠️mysql5.7和8中user表中密码的字段是`authentication_string`</span>**

**<span style={{color: 'red'}}>⚠️mysql8中user表中密码的字段`authentication_string`后边直接跟字符串即可，不能写password</span>**

**mysql5.6**

```python
update mysql.user set password=password('新密码') where user='root' and host='localhost'; 
```



**mysql5.7**

```python
update mysql.user set authentication_string=password('新密码') where user='root' and host='localhost'; 
```



**mysql8**

```python
update mysql.user set authentication_string='新密码' where user='root' and host='localhost'; 
```





## mysql忘记密码

**第一步、停止mysql数据库**



**第二步、编辑mysql配置文件`my.cnf`，在`[mysqld]`下加参数`skip-grant-tables`**



**第三步、启动mysql数据库，进入数据库修改密码，修改完成之后把配置文件中的参数`skip-grant-tables`注释或者删除**

