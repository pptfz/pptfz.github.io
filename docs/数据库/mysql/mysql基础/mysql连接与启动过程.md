[toc]



# mysql连接与启动过程

## 1.mysql连接管理

### 1.1 连接工具

#### 1.1.1 mysql自带的连接工具 `mysql`

**常见选项**

| 选项 | 说明                       |
| ---- | -------------------------- |
| `-u` | 指定用户                   |
| `-p` | 指定密码                   |
| `-h` | 指定主机                   |
| `-P` | 指定端口                   |
| `-S` | 指定socket文件             |
| `-e` | 指定SQL(命令行执行sql命令) |



#### 1.1.2 开源工具

##### mycli

[mycli](https://github.com/dbcli/mycli) 是一款具有自动完成和语法突出显示功能的mysql终端客户端



#### 1.1.3 桌面客户端工具

##### SQLyog

[SQLyog](https://github.com/webyog/sqlyog-community) 是一款开源的图形化管理工具



##### Navicat

[navicat](https://www.navicat.com.cn/) 是一款商业版本的图形化管理工具



### 1.2 连接方式

:::tip说明

在mysql命令行中执行命令 `status` 可以查看当前连接方式

返回 `Connection:		Localhost via UNIX socket` 这种的是socket连接

返回 `Connection:		10.0.0.11 via TCP/IP` 这种的是TCP/IP连接

:::



#### 1.2.1 socket连接

**第一种方式**

```shell
$ mysql -uroot -p
mysql> status;
Connection:		Localhost via UNIX socket
```



**第二种方式**

```shell
$ mysql -uroot -p -S /tmp/mysql.sock
mysql> status;
Connection:		Localhost via UNIX socket
```



#### 1.2.2 TCP/IP连接

```shell
$ mysql -uroot -p -h10.0.0.11 -P3306
mysql> status;
Connection:		10.0.0.11 via TCP/IP
```



## 2.mysql启动流程

### 2.1 启动流程



### 2.2 配置文件读取顺序

:::tip说明

**此顺序为使用 `/etc/init.d/mysql.service` 启动脚本方法生效，使用systemd不生效**

1.`/etc/my.cnf`

2.`/etc/mysql/my.cnf`

3.`安装目录/my.cnf`（前提是在环境变量中定义了安装目录变量）

4.`defaults-extra-file` （类似include）

5.`~/.my.cnf`

:::



![iShot_2023-03-29_15.15.11](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-29_15.15.11.png)





:::tip说明

**<span style={{color: 'red'}}>命令行中加上--defaults-file=xxx，以上文件都不读取</span>**

**⚠️⚠️⚠️<span style={{color: 'red'}}>配置文件顺序优先，但是配置优先级最低</span>**

:::



**配置文件优先级最终结论**

**1、命令行**

**2、defaults-file**

**3、配置文件**

**4、预编译**



**查看mysql默认读取my.cnf的顺序**

```shell
$ mysql --help --verbose | grep 'my.cnf'
                      order of preference, my.cnf, $MYSQL_TCP_PORT,
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf 
```



**查看mysqld默认读取my.cnf的顺序**

```sh
$ mysqld --help --verbose | grep 'my.cnf'
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf
                      my.cnf, $MYSQL_TCP_PORT, /etc/services, built-in default
```





### 2.3 命令行与defaults-file优先级比较示例

**在 `/tmp/a.txt` 中指定socket文件位置，然后用 `mysqld_safe` 启动，socket文件最终会在 `/tmp/b.sock`**

```shell
# 编辑一个配置文件
$ cat /tmp/a.txt 
[mysqld]
socket=/tmp/a.sock

# 用mysqld_safe启动并指定socket文件位置
$ mysqld_safe --defaults-file=/etc/my.cnf --socket=/tmp/b.sock
```

**最终socket文件在 `/tmp/b.sock` ，因此说明了在命令行中的优先级最大**

![iShot_2024-08-22_11.36.04](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-22_11.36.04.png)

