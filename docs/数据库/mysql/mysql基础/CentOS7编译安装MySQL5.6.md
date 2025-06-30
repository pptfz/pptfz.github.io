[toc]



# CentOS7编译安装MySQL5.6

[mysql历史版本官方下载地址](https://downloads.mysql.com/archives/community/)

[mysql官网](https://www.mysql.com/)

[mysql github地址](https://github.com/mysql)



## 1.安装依赖包

```python
yum -y install gcc gcc-c++ automake autoconf cmake bison-devel ncurses-devel libaio-devel openssl-devel
```



## 2.下载MySQL5.6源码包

```python
export MYSQL_VERSION=5.6.51
wget https://cdn.mysql.com/archives/mysql-5.6/mysql-${MYSQL_VERSION}.tar.gz
```



## 3.解压缩源码包

```python
tar xf mysql-${MYSQL_VERSION}.tar.gz
```



## 4.进入解压缩目录，进行编译安装

```python
# 进入到解压目录
cd mysql-${MYSQL_VERSION}

# 进行cmake
cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql-${MYSQL_VERSION} \
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_INNOBASE_STORAGE_ENGINE=1 \
-DWITH_FEDERATED_STORAGE_ENGINE=1 \
-DWITH_BLACKHOLE_STORAGE_ENGINE=1 \
-DWITHOUT_EXAMPLE_STORAGE_ENGINE=1 \
-DWITH_ZLIB=bundled \
-DENABLED_LOCAL_INFILE=1 \
-DWITH_EMBEDDED_SERVER=1 \
-DENABLE_DOWNLOADS=1 \
-DWITH_DEBUG=0

# 编译并安装
make -j`nproc` && make install
```



## 5.做目录软连接

```shell
ln -s /usr/local/mysql-${MYSQL_VERSION}  /usr/local/mysql
```



## 6.创建mysql用户

```shell
useradd -M -s /bin/nologin mysql
```



## 7.初始化数据库

```shell
/usr/local/mysql/scripts/mysql_install_db \
--user=mysql \
--basedir=/usr/local/mysql \
--datadir=/usr/local/mysql/data
```



mysql5.6初始化参数说明

| **参数**      | **说明**              |
| ------------- | --------------------- |
| **--user**    | **指定mysql用户**     |
| **--basedir** | **指定mysql安装目录** |
| **--datadir** | **指定mysql数据目录** |



## 8.编辑主配置文件

```shell
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



## 9.创建socket文件目录

```
mkdir -p /var/lib/mysql
```



## 10.相关目录、文件授权

```shell
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql /etc/my.cnf
```



## 11.拷贝mysql启动文件

```python
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



## 12.导出mysql命令环境变量

```python
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



## 13.用systemd管理mysql

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



## 14.启动mysql、检查启动

```python
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



## 15.进入mysql并设置密码

```python
# 进入mysql
mysql

# 设置mysql密码
mysql> set password='123';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

**到此，mysql5.6二进制安装完成！！！**



## **扩展：一台主机mysql已经编译好，通过拷贝相关目录和文件的方式快速部署其他mysql**实例

:::tip步骤

1.几台机器的环境要一致，操作系统、硬件环境

2.拷贝mysql编译安装路径目录，本文为 `/usr/local/mysql-5.6.51`

3.拷贝mysql配置文件、启动文件、mysql命令环境变量文件 `/etc/profile.d/mysql.sh `(建议在另外的mysql主机手动填写，避免覆盖原先的PATH环境变量)

4.拷贝systemd管理文件 `/usr/lib/systemd/system/mysqld.service`

5.创建mysql用户和组

:::

### 1.已经编译安装好的mysql主机拷贝相关包

```python
# 打包mysql编译安装目录然后将压缩包拷贝至另一台mysql主机下的/usr/local
tar cf mysql.tar /usr/local/mysql-5.6.51

# 拷贝配置文件
/etc/my.cnf

# 拷贝启动文件
/etc/init.d/mysqld

# 拷贝systemd管理文件
/usr/lib/systemd/system/mysqld.service
```

### 2.另外一台mysql主机操作

```python
# 创建mysql用户
useradd -M -s /bin/nologin mysql

# 解压缩拷贝过来的mysql包，包位置放到/usr/local
tar xf mysql.tar

# 修改权限
chown -R mysql.mysql mysql-5.6.40

# 做软连接
ln -s mysql-5.6.40/ mysql

# 使mysql命令环境变量配置生效
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh
source /etc/profile

# 移动拷贝过来的mysql配置文件my.cnf到/etc
mv my.cnf /etc
 
# 启动mysql并设置开机自启
systemctl start mysqld && systemctl enable mysqld
或者
/etc/init.d/mysqld start

# 验证端口
$ netstat -ntpl|grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      1799/mysqld 
```

**到此，快速部署mysql完成**

