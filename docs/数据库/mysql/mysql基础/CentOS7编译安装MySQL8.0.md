[toc]



# CentOS7编译安装MySQL8.0

[mysql历史版本官方下载地址](https://downloads.mysql.com/archives/community/)

[mysql官网](https://www.mysql.com/)

[mysql github地址](https://github.com/mysql)



## 1.安装依赖包

```shell
yum -y install bison-devel ncurses-devel openssl-devel libtirpc-devel
```



## 2.安装cmake

:::tip说明

**<span style={{color: 'red'}}>mysql8源码编译安装需要的cmake版本为3.5.1+，在centos7.9中yum源安装的cmake版本为2.8.12.2，在使用cmake编译配置的时候会报错如下</span>**

![iShot_2023-03-28_11.20.09](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-28_11.20.09.png)

:::

安装 `cmake3`

```shell
yum -y install cmake3
```



## 3.安装gcc

:::tip说明

**<span style={{color: 'red'}}>mysql8源码编译安装需要的gcc版本为5.3+，在centos7.9中yum源安装的gcc版本为4.8.5，在编译配置的时候会报错如下</span>**

![iShot_2023-03-28_11.23.35](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-28_11.23.35.png)



在安装完 `gcc7` 后，需要将安装的 `cc` 、`c++` 命令软链接到 `/usr/bin` 下，否则会报错如下

![iShot_2023-03-28_14.08.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-28_14.08.03.png)

:::



```shell
# 安装epel源
yum install -y epel-release

# 安装gcc7和其他必要的编译工具
yum -y install centos-release-scl
yum -y install devtoolset-7-gcc devtoolset-7-gcc-c++ devtoolset-7-binutils make

# 启用已安装的gcc7版本
scl enable devtoolset-7 bash

# 将安装的 cc c++ 命令软连接到 /usr/bin，使用如上方式安装的命令位于 /opt/rh/devtoolset-7/root/usr/bin
ln -sf `which cc` /usr/bin
ln -sf `which c++` /usr/bin
```





## 4.安装boost

[boost官网](https://www.boost.org/)

### 4.1 boost简介

Boost库被列为MySQL的一个可选依赖项，用于提供额外的功能支持。MySQL中使用Boost库主要是为了提供以下功能支持：

- 安全套接字层（SSL）加密
- 优化锁定、同步和线程池的实现
- 对STL的增强支持

对于MySQL 8.0，官方文档并没有说明需要的具体boost库版本。如果没有安装Boost库，可以使用CMake中的 `-DDOWNLOAD_BOOST=1` 选项自动下载并安装Boost库，也可以手动安装最新的版本。



### 4.2 安装boost

:::tip说明

mysql8.0.22需要的boost版本为1.73.0

![iShot_2023-03-28_11.46.49](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2023-03-28_11.46.49.png)



:::

下载包

```shell
wget https://boostorg.jfrog.io/artifactory/main/release/1.73.0/source/boost_1_73_0.tar.bz2
```



解压缩至 `/usr/local` 下

```python
tar xf boost_1_73_0.tar.bz2 -C /usr/local
```





## 5.下载MySQL8.0源码包

```python
export MYSQL_VERSION=8.0.22
wget https://cdn.mysql.com/archives/mysql-8.0/mysql-${MYSQL_VERSION}.tar.gz
```



## 6.解压缩源码包

```python
tar xf mysql-${MYSQL_VERSION}.tar.gz
```



## 7.进入解压目录，开始编译安装

### 7.1 进入到解压后的目录

```shell
cd mysql-${MYSQL_VERSION}
```



### 7.2 进行cmake编译配置

```shell
cmake3 -DCMAKE_INSTALL_PREFIX=/usr/local/mysql-${MYSQL_VERSION} \
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
-DFORCE_INSOURCE_BUILD=1 \
-DWITH_BOOST=/usr/local/boost_1_73_0
```



### 7.3 编译并安装

```shell
make -j`nproc` && make install
```



## 8.做目录软连接

```shell
ln -s /usr/local/mysql-${MYSQL_VERSION}  /usr/local/mysql
```



## 9.创建mysql用户

```shell
useradd -M -s /bin/nologin mysql
```



## 10.编辑主配置文件

:::caution注意

**<span style={{color: 'red'}}>如果指定了mysql的socket文件位置，则必须添加`[client]`标签并同时指定socket文件位置，否则客户端会从 `/tmp` 下找socket文件</span>**

:::



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



## 11.创建socket文件目录

```
mkdir -p /var/lib/mysql
```



## 12.相关目录、文件授权

```shell
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql /etc/my.cnf
```



## 13.拷贝启动脚本

```python
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



## 14.初始化mysql

:::tip说明

mysql8初始化没有提示

:::

```
/usr/local/mysql/bin/mysqld \
--user=mysql \
--basedir=/usr/local/mysql \
--datadir=/usr/local/mysql/data \
--initialize-insecure 
```



mysql8初始化参数说明

| **参数**                  | **说明**              |
| ------------------------- | --------------------- |
| **--user**                | **指定mysql用户**     |
| **--basedir**             | **指定mysql安装目录** |
| **--datadir**             | **指定mysql数据目录** |
| **--initialize-insecure** | **不生成随机密码**    |

通过 `mysqld --verbose --help|grep initialize` 查看说明



## 15.导出mysql命令环境变量

```python
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



## 16.配置systemd管理mysql

[使用systemd管理mysql官方文档](https://dev.mysql.com/doc/refman/8.0/en/using-systemd.html)

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



## 17.启动mysql、检查启动

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



## 18.连接mysql并设置密码

```python
# 进入mysql
mysql

# 设置mysql密码
mysql> set password='123';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

**到此，mysql8.0编译安装完成！！！**
