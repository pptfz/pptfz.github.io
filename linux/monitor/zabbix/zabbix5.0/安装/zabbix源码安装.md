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



## 4.编译安装

### 4.1 安装依赖

```shell
yum -y install libxml2-devel net-snmp-devel libevent-devel curl-devel
```



### 4.2 编译安装

> 使用命令 `./configure --help` 查看所有支持的选项

**解决依赖关系**

```shell
./configure --enable-server --enable-agent --with-mysql --enable-ipv6 --with-net-snmp --with-libcurl --with-libxml2 --prefix=/usr/local/zabbix
```

**<span style=color:red>⚠️运行`make install`将默认在 `/usr/local/sbin` 中安装守护程序二进制文件（zabbix_server、zabbix_agentd、zabbix_proxy），在 `/usr/local/bin` 中安装客户端二进制文件（zabbix_get、zabbix_sender）。如果要指定与 `/usr/local` 不同的位置，需要添加参数 `--prefix` 来指定安装目录，例如 `--prefix=/usr/local/zabbix`。在这种情况下，守护程序二进制文件将安装在 <prefix>/sbin 下，而实用程序将安装在 <prefix>/bin 下。手册页将安装在 <prefix>/share 下。</span>**



关于编译选项的说明：

- 如果使用 --enable-agent 选项，则编译命令行实用程序 zabbix_get 和 zabbix_sender。
- 虚拟机监控需要--with-libcurl 和--with-libxml2 配置选项；SMTP 身份验证和`web.page.*`Zabbix 代理[项](https://www.zabbix.com/documentation/current/manual/config/items/itemtypes/zabbix_agent)也需要 --with-libcurl 。请注意，使用 --with-libcurl 配置选项[需要](https://www.zabbix.com/documentation/current/manual/installation/requirements)cURL 7.20.0 或更高版本。
- Zabbix 总是使用 PCRE 库进行编译（从 3.4.0 版本开始）；安装它不是可选的。--with-libpcre=[DIR] 只允许指向特定的基本安装目录，而不是搜索 libpcre 文件的许多常见位置。
- 您可以使用 --enable-static 标志来静态链接库。如果您计划在不同的服务器之间分发已编译的二进制文件，则必须使用此标志使这些二进制文件无需所需的库即可工作。请注意， --enable-static 在[Solaris 中](http://blogs.sun.com/rie/entry/static_linking_where_did_it)不起作用。
- 构建服务器时不建议使用 --enable-static 选项。为了静态构建服务器，您必须拥有所需的每个外部库的静态版本。在配置脚本中没有严格检查。
- 在 MySQL 配置文件中添加可选路径 --with-mysql=/<path_to_the_file>/mysql_config 以在需要使用不在默认位置的 MySQL 客户端库时选择所需的 MySQL 客户端库。当在同一系统上安装了多个版本的 MySQL 或与 MySQL 一起安装了 MariaDB 时，它很有用。
- 使用 --with-oracle 标志指定 OCI API 的位置。



**开始编译安装**

- ⚠️<span style=color:red>zabbix只需要运行 `make install`即可，不需要运行 `make`</span>

```shell
make install 
```



## 5.查看、编辑配置文件

### 5.1 配置文件说明

**使用 `tree` 命令查看目录结构**

```sh
$ pwd
/usr/local/zabbix

$ tree
.
├── bin
│   ├── zabbix_get
│   ├── zabbix_js
│   └── zabbix_sender
├── etc
│   ├── zabbix_agentd.conf
│   ├── zabbix_agentd.conf.d
│   ├── zabbix_server.conf
│   └── zabbix_server.conf.d
├── lib
│   └── modules
├── sbin
│   ├── zabbix_agentd
│   └── zabbix_server
└── share
    ├── man
    │   ├── man1
    │   │   ├── zabbix_get.1
    │   │   └── zabbix_sender.1
    │   └── man8
    │       ├── zabbix_agentd.8
    │       └── zabbix_server.8
    └── zabbix
        ├── alertscripts
        └── externalscripts
```



- zabbix_server配置文件路径为 `/usr/local/zabbix/etc/zabbix_server.conf`

- zabbix_agent配置文件路径为 `/usr/local/zabbix/etc/zabbix_agentd.conf`

- zabbix_server命令路径为 `/usr/local/zabbix/sbin/zabbix_server`
- zabbix_agentd命令路径为 `/usr/local/zabbix/sbin/zabbix_agentd`





### 5.2 编辑配置文件

#### 5.2.1 编辑 zabbix_server 配置文件

**编辑 zabbix_server 配置文件   `/usr/local/zabbix/etc/zabbix_server.conf` ，指定zabbix数据库用户名和密码，修改 `# DBPassword=` 一行，可以使用如下命令修改(DBName和DBUser默认均为zabbix)**

```shell
# 修改zabbix数据库密码
sed -i '/# DBPassword=/c DBPassword=zabbix' /usr/local/zabbix/etc/zabbix_server.conf

# 修改日志文件位置，默认为 /tmp/zabbix_server.log，这里修改为 /var/log/zabbix/zabbix_server.log
sed -i '/^LogFile/cLogFile=/var/log/zabbix/zabbix_server.log' /usr/local/zabbix/etc/zabbix_server.conf

# 创建日志目录并设置目录所有者为zabbix
mkdir /var/log/zabbix && chown zabbix.zabbix /var/log/zabbix

# 如果使用的是mysql，zabbix会默认去/tmp下找mysql.sock，本文的mysql.sock在/var/lib/mysql/mysql.sock，因此需要指定mysql.sock的路径
sed -i '/# DBSocket=/c DBSocket=\/var\/lib\/mysql\/mysql.sock' /usr/local/zabbix/etc/zabbix_server.conf
```

- 如果想要优化zabbix相关性能，可以参考 [zabbix5.4官方性能调优文档](https://www.zabbix.com/documentation/current/manual/appendix/performance_tuning)



**zabbix_server 配置文件内容如下**

```shell
egrep -v '^$|#' /usr/local/zabbix/etc/zabbix_server.conf
LogFile=/var/log/zabbix/zabbix_server.log
DBName=zabbix
DBUser=zabbix
DBPassword=zabbix
DBSocket=/var/lib/mysql/mysql.sock
Timeout=4
LogSlowQueries=3000
StatsAllowedIP=127.0.0.1
```



#### 5.2.2 编辑 zabbix_agent 配置文件

**编辑 zabbix_agent 配置文件 `/usr/local/zabbix/etc/zabbix_agentd.conf` ，指定 zabbix_server 服务器地址，修改 `Server=127.0.0.1` 一行，默认为127.0.0.1，可以使用如下命令修改**

```shell
# 修改zabbix_server地址
sed -i '/Server=127.0.0.1/cServer=10.0.0.12' /usr/local/zabbix/etc/zabbix_agentd.conf

# 修改日志文件位置，默认为 /tmp/zabbix_agentd.log，这里修改为 /var/log/zabbix/zabbix_agentd.log
sed -i '/^LogFile/cLogFile=/var/log/zabbix/zabbix_agentd.log' /usr/local/zabbix/etc/zabbix_agentd.conf
```



**zabbix_agentd 配置文件内容如下**

```shell
$ egrep -v '^$|#' /usr/local/zabbix/etc/zabbix_agentd.conf
LogFile=/var/log/zabbix/zabbix_agentd.log
Server=10.0.0.12
ServerActive=127.0.0.1
Hostname=Zabbix server
```



## 6.启动zabbix

**启动 zabbix_server**

```shell
/usr/local/zabbix/sbin/zabbix_server -c /usr/local/zabbix/etc/zabbix_server.conf
```



**启动 zabbix_agentd**

```shell
/usr/local/zabbix/sbin/zabbix_agentd -c /usr/local/zabbix/etc/zabbix_agentd.conf
```



**验证zabbix启动**

```shell
# 查看zabbix_server
$ netstat -ntpl|grep 10051 
tcp        0      0 0.0.0.0:10051           0.0.0.0:*               LISTEN      9748/zabbix_server  
tcp6       0      0 :::10051                :::*                    LISTEN      9748/zabbix_server  

# 查看zabbix_agentd
$netstat -ntpl|grep 10050
tcp        0      0 0.0.0.0:10050           0.0.0.0:*               LISTEN      9902/zabbix_agentd  
tcp6       0      0 :::10050                :::*                    LISTEN      9902/zabbix_agent
```







