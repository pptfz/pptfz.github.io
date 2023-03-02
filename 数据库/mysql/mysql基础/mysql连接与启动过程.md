[toc]



# mysql连接与启动过程

# 1.mysql连接管理

## 1.1连接工具

**1)MySQL自带的连接工具**

**mysql**

**常见的特定于客户机的连接选项：**

- **-u：指定用户**

- **-p：指定密码**

- **-h：指定主机**

- **-P：指定端口**

- **-S：指定sock文件**

- **-e：指定SQL(命令行执行sql命令)**

---

**2)第三方的连接工具**

**sqlyog、navicat**

**应用程序连接MySQL**

**注意：需要加载对应语言程序的API**



## 1.2连接方式

### 1.2.1socket连接

**第一种方式**

```python
//mysql -uroot -p
[root@db01 ~]# mysql -uroot -p
mysql> status;
Connection:		Localhost via UNIX socket
```



**第二种方式**

```python
[root@db01 ~]# mysql -uroot -p -S /tmp/mysql.sock
mysql> status;
Connection:		Localhost via UNIX socket
```



### 1.2.2TCP/IP连接

```python
[root@db01 ~]# mysql -uroot -p -h10.0.0.11 -P3306
mysql> status;
Connection:		10.0.0.11 via TCP/IP
```

# 2.mysql启动流程

## 2.1示意图

![iShot2020-10-14 13.59.05](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.59.05.png)

**/etc/init.d/mysqld start ------> mysqld_safe ------> mysqld**

## 2.2mysql启动优先顺序

- **1.命令行选项**

- **2.初始化配置文件**

- **3.预编译选项，预编译选项优先级最低，因此，即使在编译的时候没有指定某些选项，也可以在配置文件中修改**

![iShot2020-10-14 13.59.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.59.25.png)

## 2.3配置文件读取顺序

**⚠️⚠️⚠️此顺序为使用/etc/init.d/mysql.service启动脚本方法生效，使用systemd不生效**

- **1./etc/my.cnf**

- **2./etc/mysql/my.cnf**

- **3.安装目录/my.cnf（前提是在环境变量中定义了 安装目录 变量）**

- **4.defaults-extra-file （类似include）**

- **5.~/.my.cnf**

![iShot2020-10-14 13.59.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2013.59.50.png)

**<span style={{color: 'red'}}>命令行中加上--defaults-file=xxx，以上文件都不读取</span>**

**⚠️⚠️⚠️<span style={{color: 'red'}}>配置文件顺序优先，但是配置优先级最低</span>**



**配置文件优先级最终结论**

- **1、命令行**
- **2、defaults-file**
- **3、配置文件**
- **4、预编译**



**查看mysql默认读取my.cnf的顺序**

```shell
$ mysql --help --verbose | grep 'my.cnf'
                      order of preference, my.cnf, $MYSQL_TCP_PORT,
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf 
```



**查看mysqld默认读取my.cnf的顺序**

```sh
$ mysqld --verbose --help | grep 'my.cnf'
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf 
                      my.cnf, $MYSQL_TCP_PORT, /etc/services, built-in default
```





## 2.4命令行与defaults-file优先级比较示例

**在/tmp/a.txt中指定socket文件位置，然后用mysqld_safe启动，socket文件最终会在/tmp/b.sock**

```python
//编辑一个文件
[root@db01 ~]# cat /tmp/a.txt 
[mysqld]
socket=/tmp/a.sock

//用mysqld_safe启动并指定socket文件位置
[root@db01 ~]# mysqld_safe --defaults-file=/etc/my.cnf --socket=/tmp/b.sock
```

**最终socket文件在/tmp/b.sock，因此说明了在命令行中的优先级最大**

![iShot2020-10-14 14.00.21](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14%2014.00.21.png)
