[toc]



# CentOS7编译安装MySQL5.7

[mysql历史版本官方下载地址](https://downloads.mysql.com/archives/community/)

[mysql官网](https://www.mysql.com/)

[mysql github地址](https://github.com/mysql)



# 1.安装依赖包

```python
yum -y install -y gcc gcc-c++ automake autoconf cmake bison-devel ncurses-devel libaio-devel openssl-devel
```



# 2.下载boost

**5.7版本源码编译安装需要下载一个Boost C++ 1.59.0（这是一组扩充C++功能的经过同行评审（Peer-reviewed）且开放源代码程序库。大多数的函数为了能够以开放源代码、封闭项目的方式运作，而授权于Boost软件许可协议（Boost Software License）之下。）**

```python
wget https://sourceforge.net/projects/boost/files/boost/1.59.0/boost_1_59_0.tar.gz
```



# 3.解压缩boost至 `/usr/local` 下

```python
tar xf boost_1_59_0.tar.gz -C /usr/local
```



# 4.下载MySQL5.7源码包

```python
export MYSQL_VERSION=5.7.30
wget https://cdn.mysql.com/archives/mysql-5.7/mysql-${MYSQL_VERSION}.tar.gz
```



# 5.解压缩源码包

```python
tar xf mysql-${MYSQL_VERSION}.tar.gz
```



# 6.进入解压目录，开始编译安装

```python
# 进入到解压目录
cd mysql-${MYSQL_VERSION}

# 进行cmake
cmake -DCMAKE_INSTALL_PREFIX=/usr/local/mysql-${MYSQL_VERSION} \
-DMYSQL_USER=mysql \
-DWITH_MYISAM_STORAGE_ENGINE=1 \
-DWITH_INNOBASE_STORAGE_ENGINE=1 \
-DEXTRA_CHARSETS=all \
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_DEBUG=0 \
-DMYSQL_MAINTAINER_MODE=0 \
-DWITH_ZLIB:STRING=bundled \
-DWITH_SYSTEMD=1 \
-DDOWNLOAD_BOOST=0 \
-DWITH_DEBUG=0 \
-DWITH_BOOST=/usr/local/boost_1_59_0

# 编译并安装
make -j`nproc` && make install
```



# 7.做目录软连接

```shell
ln -s /usr/local/mysql-${MYSQL_VERSION}  /usr/local/mysql
```



# 8.创建mysql用户

```shell
useradd -M -s /bin/nologin mysql
```



# 9.编辑主配置文件

**<span style={{color: 'red'}}>⚠️如果指定了mysql的socket文件位置，则必须添加`[client]`标签并同时指定socket文件位置，否则客户端会从/tmp下找socket文件</span>**

```python
# 备份/etc/my.cnf
mv /etc/my.cnf /etc/my.cnf.old

# 以下配置为最精简版，可根据实际情况进行相应设置
cat > /etc/my.cnf <<'EOF'
[mysqld]
basedir=/usr/local/mysql
datadir=/usr/local/mysql/data
socket=/var/lib/mysql/mysql.sock
user=mysql
log-error=/usr/local/mysql/data/error.log

[client]
socket=/var/lib/mysql/mysql.sock
EOF
```



# 10.创建socket文件目录

```
mkdir -p /var/lib/mysql
```



# 11.相关目录、文件授权

```shell
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql /etc/my.cnf
```



# 12.拷贝启动脚本

```python
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



# 13.初始化mysql

**<span style={{color: 'red'}}>⚠️MySQL 5.7.6之前的版本使用如下方式初始化数据库</span>**

```shell
/usr/local/mysql/bin/mysql_install_db \
--user=mysql \
--basedir=/usr/local/mysql \ 
--datadir=/usr/local/mysql/data
```



**<span style={{color: 'red'}}>⚠️MySQL 5.7.6之后的版本使用如下方式初始化数据库</span>**

```shell
/usr/local/mysql/bin/mysqld \
--user=mysql \
--basedir=/usr/local/mysql \
--datadir=/usr/local/mysql/data \
--initialize-insecure 
```



mysql5.7初始化参数说明

| **参数**                  | **说明**              |
| ------------------------- | --------------------- |
| **--user**                | **指定mysql用户**     |
| **--basedir**             | **指定mysql安装目录** |
| **--datadir**             | **指定mysql数据目录** |
| **--initialize-insecure** | **不生成随机密码**    |

通过 `mysqld --verbose --help|grep initialize` 查看说明





# 14.导出mysql命令环境变量

```python
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



# 15.systemd管理mysql

```python
cat > /usr/lib/systemd/system/mysqld.service <<'EOF'
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 5000
EOF
```





# 16.启动mysql、检查启动

**启动mysql**

```sh
# 重新加载systemd系统服务
systemctl daemon-reload

# 启动mysql并加入开机自启
systemctl start mysqld && systemctl enable mysqld
```



**查看**

```python
# 查看mysql端口
$ netstat -ntpl  | grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      31349/mysqld  
```



# 17.进入mysql并设置密码

```python
# 进入mysql
mysql

# 设置mysql密码
mysql> set password='123';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

**到此，mysql5.7源码安装完成！！！**

