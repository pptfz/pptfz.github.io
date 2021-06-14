# zabbix源码安装

[zabbix github地址](https://github.com/zabbix/zabbix)

[zabbix官网](https://www.zabbix.com/)

[zabbix源码官方下载地址](https://www.zabbix.com/cn/download_sources)

[zabbix源码安装官方文档](https://www.zabbix.com/documentation/current/manual/installation/install)



## 1.下载源码

**从 [zabbix源码官方下载地址](https://www.zabbix.com/cn/download_sources) 下载源码包**

```shell
wget https://cdn.zabbix.com/zabbix/sources/stable/5.4/zabbix-5.4.1.tar.gz
```



**解压缩源码包**

```shell
tar xf zabbix-5.4.1.tar.gz 
```



## 2.创建用户

```shell
groupadd --system zabbix
useradd --system -g zabbix -d /usr/lib/zabbix -s /sbin/nologin -c "Zabbix Monitoring System" zabbix
```



**⚠️<span style=color:red>官方特别说明</span>**

- Zabbix 进程不需要主目录，这就是我们不建议创建它的原因。但是，如果您正在使用某些需要它的功能（例如将 MySQL 凭据存储在 `$HOME/.my.cnf` 中），您可以使用以下命令自由创建它。

  ```
  mkdir -m u=rwx,g=rwx,o= -p /usr/lib/zabbix
  chown zabbix:zabbix /usr/lib/zabbix
  ```

- Zabbix 前端安装不需要单独的用户帐户。

- 如果 Zabbix[服务器](https://www.zabbix.com/documentation/current/manual/concepts/server)和[代理](https://www.zabbix.com/documentation/current/manual/concepts/agent)在同一台机器上运行，建议使用不同的用户来运行服务器而不是运行代理。否则，如果两者都以同一用户身份运行，则代理可以访问服务器配置文件，Zabbix 中的任何管理员级别用户都可以很容易地检索，例如，数据库密码。

**⚠️<span style=color:red>以`root`、`bin`或任何其他具有特殊权限的帐户运行 Zabbix存在安全风险。</span>**



## 3.创建ZABBIX数据库

### 3.1 安装mysql

#### 3.1.1 下载MySQL-5.7.22二进制包

```python
wget https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.22-linux-glibc2.12-x86_64.tar.gz
```

#### 3.1.2 解压缩mysql二进制包到/usr/local

```python
tar xf mysql-5.7.22-linux-glibc2.12-x86_64.tar.gz -C /usr/local
```

#### 3.1.3 修改名称、做软连接

```python
mv /usr/local/mysql-5.7.22-linux-glibc2.12-x86_64 /usr/local/mysql-5.7.22 && 
ln -s /usr/local/mysql-5.7.22 /usr/local/mysql
```

#### 3.1.4 创建mysql用户

```python
useradd -M -s /bin/nologin mysql
```

#### 3.1.5 编辑主配置文件，myql-5.7.22二进制包默认没有mysql配置文件

**<span style=color:red>⚠️如果指定了mysql的socket文件位置，则必须添加`[client]`标签并同时指定socket文件位置，否则客户端会从/tmp下找socket文件</span>**

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



#### 3.1.6 创建socket文件目录

```
mkdir -p /var/lib/mysql
```



#### 3.1.7 相关目录、文件授权

```shell
chown -R mysql.mysql /usr/local/mysql* /var/lib/mysql
chown mysql.mysql /etc/my.cnf
```



#### 3.1.8 拷贝启动脚本

```python
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
```

#### 3.1.9 初始化mysql

```python
/usr/local/mysql/bin/mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```



⚠️**<span style=color:red>mysql5.7初始化没有提示！！！</span>**

| **参数**                  | **说明**              |
| ------------------------- | --------------------- |
| **--user**                | **指定mysql用户**     |
| **--basedir**             | **指定mysql安装目录** |
| **--datadir**             | **指定mysql数据目录** |
| **--initialize-insecure** | **不生成随机密码**    |



如遇初始化报错 `/usr/local/mysql/bin/mysqld: error while loading shared libraries: libnuma.so.1: cannot open shared object file: No such file or directory`，安装 `numactl` 包解决

```shell
yum -y install numactl
```



#### 3.1.10 添加mysql命令环境变量

```python
# 导出mysql命令环境变量
echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

# 使配置生效
source /etc/profile
```



#### 3.1.11 配置systemd管理mysql

```python
cat >> /etc/systemd/system/mysqld.service <<'EOF'
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



#### 3.1.12 启动mysql、检查启动

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



### 3.2 创建zabbix数据库

[官方安装文档](https://www.zabbix.com/documentation/current/manual/appendix/install/db_scripts)

```shell
mysql -uroot -e "create database zabbix character set utf8 collate utf8_bin;"
mysql -uroot -e "create user 'zabbix'@'localhost' identified by 'zabbix';"
mysql -uroot -e "grant all privileges on zabbix.* to 'zabbix'@'localhost';"
```



### 3.3 导入数据

> 如果您是从源安装 Zabbix，请继续将数据导入数据库。对于 Zabbix 代理数据库，只有`schema.sql`应该导入（没有 images.sql 和 data.sql）



zabbix数据库文件在zabbix源码包的 `cd zabbix-5.4.1/database/mysql/` 路径下

```shell
# 注意导入顺序，一次为 schema.sql、images.sql、data.sql，否则会有外键报错
cd zabbix-5.4.1/database/mysql/
mysql -uzabbix -pzabbix zabbix < schema.sql
mysql -uzabbix -pzabbix zabbix < images.sql
mysql -uzabbix -pzabbix zabbix < data.sql
```



## 4.配置源