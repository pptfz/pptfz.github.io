[toc]



# nginx+django+uwsgi部署项目

# 一、WSGI、uWSGI、uwsgi概念简述

<h3>WSGI</h3>

> WSGI，全称 **``Web Server Gateway Interface``**，或者 **``Python Web Server Gateway Interface``** ，是为 Python 语言定义的 Web 服务器和 Web 应用程序或框架之间的一种简单而通用的``接口``
>
> wsgi server (比如uWSGI） 要和 wsgi application（比如django ）交互，uwsgi需要将过来的请求转给django 处理，那么uWSGI 和 django的交互和调用就需要一个统一的规范，这个规范就是WSGI 
>
> WSGI 的官方定义是，**``the Python Web Server Gateway Interface``**。从名字就可以看出来，这东西是一个Gateway，也就是网关。网关的作用就是在协议之间进行转换。
>
> WSGI 是作为 Web 服务器与 Web 应用程序或应用框架之间的一种低级别的接口，以提升可移植 Web 应用开发的共同点。WSGI 是基于现存的 CGI 标准而设计的。

---

<h3>uWSGI</h3>

> **uWSGI**是一个**``Web服务器``**，它实现了WSGI协议、uwsgi、http等协议。Nginx中HttpUwsgiModule的作用是与uWSGI服务器进行交换。



---

<h3>uwsgi</h3>

> **uwsgi**是服务器和服务端应用程序的**``通信协议``**，规定了怎么把请求转发给应用程序和返回





# 二、处理过程

<h2>nginx+django+uWSGI处理过程</h2>
![iShot2020-10-16 15.21.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 15.21.07.png)

![iShot2020-10-16 15.21.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 15.21.25.png)





**1.客户端(浏览器)准备发送请求**

**2.如果请求的是静态内容则直接返回给客户端，nginx在这里统一收集后端django项目的静态文件**

**3.如果请求的是动态内容, 就把请求转发给`uWSGI` ,`uWSGI`连接`Django`进入我们的`Python`程序进行处理，这期间``uWSGI``会连接数据库获取数据**



# 三、部署过程

## 3.1环境及角色说明

**系统环境**

| 角色       | 版本      |
| ---------- | --------- |
| 系统       | centos7.6 |
| nginx      | 1.16      |
| django     | 2.1       |
| mysql      | 5.7.22    |
| uWSGI      | 2.0.18    |
| supervisor | 4.1.0     |



**角色说明**

- **nginx**	
  - **提供反向解析功能，将80端口请求转发至django端口，同时还负责处理静态资源**

- **uWSGI+django**	
  - **启动后端项目，处理动态请求**

- **mysql**	
  - **数据库，存储数据，django从数据库中获取数据**

- **supervisor**	
  - **进程管理工具，防止uWSGI突然崩溃，supervisor能自动启动uWSGI**



## 3.2部署过程

### 3.2.1安装nginx1.16

```python
1.下载nginx
[root@django ~]# wget http://nginx.org/download/nginx-1.16.1.tar.gz

2.安装依赖
[root@django ~]# yum -y install gcc gcc-c++ zlib zlib-devel openssl openssl-devel pcre-devel

3.添加ngxin用户和组
[root@django ~]# groupadd nginx && useradd nginx -g nginx -s /sbin/nologin -M

4.解压缩并编译安装
[root@django ~]# tar xf nginx-1.16.1.tar.gz
[root@django ~]# cd nginx-1.16.1/
[root@django nginx-1.16.1]# ./configure --user=nginx --group=nginx --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module --with-http_realip_module --with-http_gzip_static_module
[root@django nginx-1.16.1]# make -j 2 && make install

5.设置nginx命令环境变量
[root@django ~]# echo "PATH=/usr/local/nginx/sbin:$PATH" >/etc/profile.d/nginx.sh
[root@django ~]# source /etc/profile

6.启动nginx
[root@django ~]# nginx
[root@django ~]# ps aux|grep nginx
root      6833  0.0  0.2  45968  1132 ?        Ss   15:20   0:00 nginx: master process nginx
nginx     6834  0.0  0.3  48508  1972 ?        S    15:20   0:00 nginx: worker process
root      6920  0.0  0.1 112708   988 pts/0    S+   15:21   0:00 grep --color=auto nginx
```



### 3.2.2安装mysql5.7.22

```python
⚠️⚠️⚠️
二进制安装mysql的启动脚本和   安装目录/mysql/bin/mysqld_safe  这两个文件中都是默认/usr/local/mysql，如果安装目录不在/usr/local/下，需要修改这两个文件中的路径，即把/usr/local替换为mysql安装目录

sed -i 's#/usr/local#/application#g' /etc/init.d/mysql /application/mysql/bin/mysqld_safe


1.下载MySQL-5.7.22二进制包
[root@django ~]# wget https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.22-linux-glibc2.12-x86_64.tar.gz
MD5值	9ef7a05695f8b4ea29f8d077c3b415e2

2.解压缩mysql二进制包到/usr/local
[root@django ~]# tar xf mysql-5.7.22-linux-glibc2.12-x86_64.tar.gz -C /usr/local

3.修改名称、做软连接
[root@django local]# mv /usr/local/mysql-5.7.22-linux-glibc2.12-x86_64 /usr/local/mysql-5.7.22 && \
ln -s /usr/local/mysql-5.7.22 /usr/local/mysql

4.创建mysql用户和组
[root@django local]# groupadd mysql && useradd -g mysql -s /bin/false mysql

5.编辑主配置文件，myql-5.7.22二进制包默认没有mysql配置文件
#备份/etc/my.cnf
[root@django local]# mv /etc/my.cnf /etc/my.cnf.old

#以下配置为最精简版，可根据实际情况进行相应设置
[root@django~]# cat >> /etc/my.cnf <<EOF
[mysqld]
basedir=/usr/local/mysql
datadir=/usr/local/mysql/data
user=mysql
log-error=/usr/local/mysql/data/error.log
EOF

6.拷贝启动脚本
[root@django ~]# cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld

7.初始化mysql
[root@django ~]# /usr/local/mysql/bin/mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data

--user 		                #指定mysql用户
--basedir 		            #指定mysql安装目录
--datadir		            #指定mysql数据目录
--initialize-insecure		#不生成随机密码

⚠️⚠️⚠️mysql-5.7.22初始化没有提示！！！


8.添加mysql命令环境变量
#导出mysql命令环境变量
[root@django ~]# echo "export PATH=/usr/local/mysql/bin:$PATH" > /etc/profile.d/mysql.sh

#使配置生效
[root@django ~]# source /etc/profile


9.配置systemd管理mysql
[root@django ~]# cat >> /etc/systemd/system/mysqld.service <<EOF
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

#重新加载systemd系统服务
[root@django ~]# systemctl daemon-reload

10.启动mysql、检查启动
[root@django ~]# systemctl start mysqld &&  systemctl enable mysqld
[root@django ~]# netstat -ntpl  | grep 3306
tcp6       0      0 :::3306                 :::*                    LISTEN      31349/mysqld  


11.进入mysql并设置密码
#进入mysql
[root@django ~]# mysql

#设置mysql密码
mysql> set password='123';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

### 3.2.3安装python3.6

```python
1.下载python
[root@django ~]# wget https://www.python.org/ftp/python/3.6.9/Python-3.6.9.tar.xz

2.安装依赖包
[root@django ~]# yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel libffi-devel gcc gcc-c++ make

3.解压缩python并编译安装
[root@django ~]# tar xf Python-3.6.9.tar.gz 
[root@django ~]# cd Python-3.6.9/
[root@django Python-3.6.9]# ./configure --prefix=/usr/local/python36
[root@django Python-3.6.9]# make -j 2 && make install

4.导出python命令环境变量
[root@django ~]# echo "PATH=/usr/local/python36/bin:$PATH" >/etc/profile.d/python36.sh
[root@django ~]# source /etc/profile
[root@django ~]# python3 -V
Python 3.6.9

5.配置pip国内源
[root@django ~]# mkdir ~/.pip
[root@django ~]# cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF
```





### 3.2.4部署python虚拟环境virtualenv、virtualenvwrappe、uwsgi及django项目

> **鉴于virtualenv不便于对虚拟环境集中管理,所以推荐直接使用virtualenvwrapper,virtualenvwrapper提供了一系列命令使得和虚拟环境工作变得便利,它把你所有的虚拟环境都放在一个地方**

**virtualenvwrapper整体工作过程**

**1.安装virtualenvwrapper**

**2.在~/.bashrc文件中指定virtualenvwrapper存放虚拟环境总目录,指定virtualenvwrapper.sh存放位置(find查找)**

**3.mkvirtualenv命令创建python虚拟环境,-p选项指定不同python版本命令路径**

**4. workon命令切换不同python虚拟环境**

```python
第一步、安装virtualenv、virtualenvwrapper
[root@django ~]# pip3 install virtualenv virtualenvwrapper


第二步、编辑virtualenvwrapper环境变量
//向~/.bashrc中写入以下内容
[root@django ~]# cat >> ~/.bashrc <<EOF
export WORKON_HOME=/opt/virtualenvwrapper
export VIRTUALENVWRAPPER_PYTHON=/usr/local/python36/bin/python3
export VIRTUALENVWRAPPER_VIRTUALENV=/usr/local/python36/bin/virtualenv
source /usr/local/python36/bin/virtualenvwrapper.sh
EOF

//使配置生效
[root@django ~]# source ~/.bashrc

#说明
a：virtualenvwrapper存放虚拟环境目录,这里自定义在/opt/virtualenvwrapper
b：virtrualenvwrapper会安装到python的bin目录下，所以该路径是python安装目录下bin/virtualenvwrapper.sh,本文python安装在了/usr/local/下


第三步、创建一个新的虚拟环境	#创建后的虚拟环境路径/opt/virtualenvwrapper/django
[root@django ~]# mkvirtualenv -p /usr/local/python36/bin/python3 django


第四步、在虚拟环境中安装uWSGI
(django) [root@django ~]# pip3 install uwsgi


第五步、克隆一个django项目，这是github上一个django写的博客系统(克隆日期2020.2.18，后续作者可能有更改)
百度网盘链接	https://pan.baidu.com/s/1FutOCPkY_c_0T4uULESIxg  密码:oemn
(django) [root@django ~]# mkdir /django && cd /django
(django) [root@django django]# git clone https://github.com/liangliangyy/DjangoBlog


⚠️⚠️⚠️pip3 freeze > requirements.txt导出开发环境中所有安装的模块
第六步、修改项目requirements.txt文件中的django版本为2.1
克隆的django博客项目中的requirements.txt文件django版本是2.2.8，结果出了一堆问题，但是作者在github上介绍却是基于django2.1，修改完后安装requirements.txt中的模块
(django) [root@django DjangoBlog]# pip3 install -Ur requirements.txt
(django) [root@django DjangoBlog]# pip3 install pymysql

第七步、配置mysql字符集
//修改my.cnf，写入以下内容
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

//重启mysql
(django) [root@django DjangoBlog]# systemctl restart mysqld


第八步、建库授权
CREATE USER 'djangoblog'@'localhost' IDENTIFIED BY 'DjAnGoBlOg123!@#';
CREATE DATABASE `djangoblog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
GRANT all ON djangoblog.* TO 'djangoblog'@'localhost';
FLUSH PRIVILEGES;


第九步、修改django项目mysql配置
//修改DjangoBlog/settings.py中的DATABASES配置，如下所示
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'djangoblog',
        'USER': 'djangoblog',
        'PASSWORD': 'DjAnGoBlOg123!@#',
        'HOST': 'localhost',
        'PORT': 3306,
        'OPTIONS': {'charset': 'utf8mb4'},
    }
}


第十步、编辑DjangoBlog/__init__.py，指定pymysql为客户端
cat >DjangoBlog/__init__.py <<EOF
import pymysql
pymysql.install_as_MySQLdb()
EOF


第十一步、执行数据库同步
./manage.py makemigrations
./manage.py migrate
./manage.py createsuperuser #创建超级用户
./manage.py collectstatic --no-input	#收集静态文件
./manage.py compress --force	#压缩静态文件


第十三步、配置uWSGI
在DjangoBlog下创建一个uWSGI.ini,写入以下内容
[uwsgi]
#填入你django项目的第一层绝对路径
chdir = /django/DjangoBlog

#这个wsgi.py文件，在第二层的Django目录下
wsgi-file = Djangoblog/wsgi.py

#填写虚拟环境的绝对路径
home = /opt/virtualenvwrapper/django/

#定义uwsgi的工作进程数，优化公式是 2*cpu_核数+1 
processes = 5

#这个socket参数是把你的django启动在一个基于uwsgi协议的socket链接上，用户无法直接访问了,就只能用nginx通过uwsgi协议反向代理，目的保护后端进程的安全，以及高性能 
socket = 0.0.0.0:8000

#是否需要主进程
master = true

#... with appropriate permissions - may be needed
#chmod-socket    = 664
#clear environment on exit
vacuum  = true


第十四步、使用uwsgi命令，指定uWSGI.ini配置文件，启动django项目
(django) [root@django DjangoBlog]# pwd
/django/DjangoBlog
(django) [root@django DjangoBlog]# uwsgi --ini uWSGI.ini 


第十五步、配置nginx反向代理
//nginx是编译安装的，个人习惯，把nginx的conf文件放到conf.d下，修改nginx.conf，写入include
include /usr/local/nginx/conf/conf.d/*.conf;

//配置反向代理django文件
cat > /usr/local/nginx/conf/conf.d/django.blog.conf<<EOF
server {
	listen 80;
	server_name django.bolg;

	location / {
		uwsgi_pass 0.0.0.0:8000;
		include uwsgi_params;
	}
}
EOF

//平滑重启nginx
(django) [root@django DjangoBlog]# nginx -t
(django) [root@django DjangoBlog]# nginx -s reload
```

配置本机hosts解析后访问django.blog，项目界面如下

![iShot2020-10-16 15.22.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 15.22.09.png)

### 3.2.5安装supervisor管理uWSGI

```python
1.安装supervisor
(django) [root@django DjangoBlog]# pip3 install supervisor
(django) [root@django DjangoBlog]# supervisord -v
4.1.0

2.生成supervisor配置文件，也可以使用命令echo_supervisord_conf >  /etc/supervisord.conf
cat >> /etc/supervisord.conf <<EOF
[unix_http_server]
file=/tmp/supervisor.sock   ; the path to the socket file
chmod = 0770
chown = supervisor:supervisor   ; /tmp/supervisor.sock所有者为test
 
[supervisord]
logfile=/var/log/supervisord/supervisord.log ; main log file;
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
 
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
 
[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
 
[include]
files = /etc/supervisor/config.d/*.ini
EOF

3.创建supervisor相关目录及supervisor用户
mkdir -p /etc/supervisor/config.d
mkdir /var/log/supervisord
useradd supervisor -s /sbin/nologin -M

4.设置supervisor日志滚动
cat >/etc/logrotate.d/supervisor <<EOF
/var/log/supervisord/*.log {
       missingok
       weekly
       notifempty
       nocompress
}
EOF

5.设置Tmpfiles防止sock文件被清理
cat >> /usr/lib/tmpfiles.d/tmp.conf<<EOF
x /tmp/supervisor.sock
x /tmp/supervisord.pid
EOF

6.将supervisor加入systemd管理
cat >> /usr/lib/systemd/system/supervisord.service <<EOF
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=/usr/bin/supervisord
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
EOF

7.启动supervisor
systemctl daemon-reload && systemctl start supervisord && systemctl enable supervisord

⚠️⚠️⚠️虚拟环境中安装的supervisord命令不在/usr/bin下，启动的时候可能会报错Failed at step EXEC spawning /usr/bin/supervisord: No such file or directory，解决方法是在虚拟环境中find查找supervisord命令的路径然后做一个软连接即可
ln -s /opt/virtualenvwrapper/django/bin/supervisord /usr/bin 

8.配置supervisor管理uWSGI
//设置配置文件
cat >/etc/supervisor/config.d/django.ini<<EOF
[program:django]
command=/opt/virtualenvwrapper/django/bin/uwsgi --ini  /django/DjangoBlog/uWSGI.ini    ; 程序启动命令
autostart=true       ; 在supervisord启动的时候也自动启动
startsecs=10         ; 启动10秒后没有异常退出，就表示进程正常启动了，默认为1秒
autorestart=true     ; 程序退出后自动重启,可选值：[unexpected,true,false]，默认为unexpected，表示进程意外杀死后才重启

stopasgroup=true     ;默认为false,进程被杀死时，是否向这个进程组发送stop信号，包括子进程
killasgroup=true     ;默认为false，向进程组发送kill信号，包括子进程
EOF

//执行supervisorctl命令进入交互式终端添加程序
supervisor> update django
django: added process group

supervisor> status
django                           RUNNING   pid 19728, uptime 0:00:17  
```

---

<h3>关于django收集静态文件配置</h3>
uwsig默认不解析静态文件，需要统一收集一下，交给nginx去返回给客户端

```python
//settings.py文件中如下参数是配置统一收集所有静态文件
STATIC_ROOT='xxx'

//这里克隆的项目作者把目录设置为了如下路径
DjangoBlog/collectedstatic

//配置完后需要执行以下命令
./manage.py collectstatic --no-input	#收集静态文件
./manage.py compress --force	#压缩静态文件
```

nginx对于静态资源的配置

```python
nginx+django+uWSGI中还可以配置nginx专门匹配静态资源路径
location /static {
  alias /django/DjangoBlog/collectedstatic;
}


django中配置静态资源别名，这里static是别名，statics是真正的路径
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'statics'),
]
```



> **python manage.py runserver 其实是调用wsgiref这个python内置的wsgi 服务器，性能很低，单线程**
>
> **uWSGI是C写的一个基于uwsgi协议运行的高性能Web服务器，支持多进程、多线程**

