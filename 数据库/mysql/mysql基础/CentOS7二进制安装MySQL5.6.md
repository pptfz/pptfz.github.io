[toc]



# CentOS7二进制安装MySQL5.6

[mysql历史版本官方下载地址](https://downloads.mysql.com/archives/community/)

[mysql官网](https://www.mysql.com/)

[mysql github地址](https://github.com/mysql)



## 1.安装依赖包

```shell
yum -y install -y gcc gcc-c++ autoconf bison-devel ncurses-devel libaio-devel numactl
```



## 2.下载MySQL5.6二进制包

```shell
export MYSQL_VERSION=5.6.51
wget https://cdn.mysql.com/archives/mysql-5.6/mysql-${MYSQL_VERSION}-linux-glibc2.12-x86_64.tar.gz
```



## 3.解压缩mysql二进制包到 `/usr/local`

```shell
tar xf mysql-${MYSQL_VERSION}-linux-glibc2.12-x86_64.tar.gz -C /usr/local
```



## 4.修改目录名称、做软连接

```shell
mv /usr/local/mysql-${MYSQL_VERSION}-linux-glibc2.12-x86_64 /usr/local/mysql-${MYSQL_VERSION}
ln -s /usr/local/mysql-${MYSQL_VERSION} /usr/local/mysql
```



## 5.创建mysql用户

```shell
useradd mysql -s /bin/nologin -M
```



## 6.编辑主配置文件

:::caution

mysql5.6二进制包中 `support-files/my-default.cnf`  有示例配置文件，这里选择手动编辑基础配置文件

**<span style={{color: 'red'}}>⚠️如果指定了mysql的socket文件位置，则必须添加 `[client]` 标签并同时指定socket文件位置，否则客户端会从 `/tmp` 下找socket文件</span>**

:::

```shell
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



## 7.创建socket文件目录

```shell
mkdir -p /var/lib/mysql
```



## 8.相关目录、文件授权

```shell
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql /etc/my.cnf
```



## 9.拷贝启动脚本

```shell
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```



## 10.初始化mysql

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



## 11.导出mysql命令环境变量

```shell
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



## 12.配置systemd管理mysql

```shell
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



## 13.启动mysql、检查启动

```shell
# 重新加载systemd系统服务
systemctl daemon-reload

# 启动mysql并加入开机自启
systemctl start mysqld && systemctl enable mysqld
```



**查看**

```shell
# 查看mysql端口
$ netstat -ntpl  | grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      31349/mysqld  
```



## 14.进入mysql并设置密码

```shell
# 进入mysql
mysql

# 设置mysql密码
mysql> set password='123';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

**到此，mysql5.6二进制安装完成！！！**



如果设置mysql密码遇到报错，这是因为mysql要求输入16进制

```shell
mysql> set password='123';
ERROR 1372 (HY000): Password hash should be a 41-digit hexadecimal number
```



先查询16进制

```shell
mysql> select password('123');
+-------------------------------------------+
| password('PAPAqike.com!1')                |
+-------------------------------------------+
| *23AE809DDACAF96AF0FD78ED04B6A265E05AA257 |
+-------------------------------------------+
1 row in set (0.00 sec)
```



再进行设置即可

```shell
mysql> set password='*23AE809DDACAF96AF0FD78ED04B6A265E05AA257';
Query OK, 0 rows affected (0.00 sec)
```





