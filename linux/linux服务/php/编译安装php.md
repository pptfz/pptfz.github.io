

[php官网](https://www.php.net/)



[php国内下载地址](http://php.p2hp.com/downloads.php)



## 一、编译安装php

### 1.1 下载源码包

```sh
wget https://mirrors.sohu.com/php/php-7.2.32.tar.bz2
```



### 1.2 解压缩

```sh
tar xf php-7.2.32.tar.bz2 && cd php-7.2.32
```



### 1.3 创建 `www` 用户

> 这里创建 `www` 用户是php运行用户

```sh
useradd -M www -s /sbin/nologin
```



### 1.4 安装依赖包

- centos

```shell
yum -y install gcc gcc-c++ libxml2-devel openssl-devel curl-devel libjpeg-devel libpng-devel freetype-devel libicu-devel libxslt-devel autoconf
```

- ubuntu

```shell
apt -y install libxml2-dev libssl-dev libcurl3-openssl-dev libjpeg-dev libpng-dev libxslt-dev autoconf
```



### 1.5 编译安装

> **可以使用 `/php -i | grep config ` 查看php编译参数**

```sh
./configure  --prefix=/usr/local/php72 \
--with-config-file-path=/usr/local/php72/etc  \
--with-config-file-scan-dir=/usr/local/php72/conf.d  \
--enable-fpm  \
--with-fpm-user=www  \
-with-fpm-group=www  \
--enable-mysqlnd  \
--with-mysqli=mysqlnd  \
--with-pdo-mysql=mysqlnd  \
--with-iconv-dir  \
--with-jpeg-dir  \
--with-png-dir  \
--with-zlib  \
--with-libxml-dir=/usr  \
--enable-xml  \
--disable-rpath  \
--enable-bcmath  \
--enable-shmop  \
--enable-sysvsem  \
--enable-inline-optimization  \
--with-curl  \
--enable-mbregex  \
--enable-mbstring  \
--enable-intl  \
--enable-ftp  \
--with-gd  \
--with-openssl  \
--with-mhash  \
--enable-pcntl  \
--enable-sockets  \
--with-xmlrpc  \
--enable-zip  \
--enable-soap  \
--with-gettext  \
--enable-opcache  \
--with-mysqli=mysqlnd \
--with-pdo-mysql=mysqlnd \
--enable-mysqlnd \
--with-xsl

make -j8 && make install
```



ubuntu16 `./configure` 可能遇到的报错 `configure: error: Cannot find OpenSSL's libraries`，先使用命令 `find / -name libssl.so` 找到文件 `libssl.so`，然后做一下软连接即可

```
ln -s /usr/lib/x86_64-linux-gnu/libssl.so /usr/lib
```



### 1.6 配置php-fpm

#### 1.6.1 编辑 `php-fpm.conf`

> 这里贴一下生产中php的配置文件 `php-fpm.conf`
>
> ⚠️这里php启动是监听的sock文件，放在了 `/tmp` 下，如果指定其他目录，则这个目录权限需要设置为php运行用户所有

```sh
[global]
pid = /usr/local/php72/var/run/php-fpm.pid
error_log = /usr/local/php72/var/log/php-fpm.error.log
log_level = notice

[www]
listen = /tmp/php72-cgi.sock
listen.backlog = -1
listen.allowed_clients = 127.0.0.1
listen.owner = www
listen.group = www
listen.mode = 0666
user = www
group = www
pm = dynamic
pm.max_children = 60
pm.start_servers = 30
pm.min_spare_servers = 30
pm.max_spare_servers = 60
pm.max_requests = 1024
pm.process_idle_timeout = 10s
request_terminate_timeout = 100
request_slowlog_timeout = 0
slowlog = var/log/slow.log
```



#### 1.6.2 拷贝 `php.ini`

```sh
cp php-7.2.32/php.ini-production /usr/local/php72/etc/php.ini
```



### 1.7 安装php相关扩展

> **php扩展就是php核心并不支持的功能，然后可以通过扩展的方式进行扩展PHP的功能，常见的扩展如redis、MySQL，gb2等等，这个还需要根据实际情况安装**

#### 1.7.1 安装 redis 扩展

[php redis扩展github地址](https://github.com/phpredis/phpredis)

[php官方下载地址](https://pecl.php.net/package/redis)

##### 1.7.1.1 下载源码包

```sh
wget https://pecl.php.net/get/redis-5.3.2.tgz
```



##### 1.7.1.2 解压缩并进入目录

```sh
tar xf redis-5.3.2.tgz && cd redis-5.3.2
```



##### 1.7.1.3 用phpize生成configure配置文件

```sh
/usr/local/php72/bin/phpize 
```



##### 1.7.1.4 编译安装

```sh
./configure --with-php-config=/usr/local/php72/bin/php-config
make -j8 && make install
```



##### 1.7.1.5 在php配置文件中配置redis扩展

修改 `php.ini`

```sh
# php-7.2.32版本扩展配置大概在889行左右
extension=redis.so
```



##### 1.7.1.5 验证redis扩展是否安装成功

可以使用 `/usr/local/php72/bin/php -m |grep redis` 查看redis扩展是否安装



往`index.php` 中写入以下内容

```php
<?php 
  phpinfo(); 
?>
```



启动php web

```sh
# -t后边必须是一个目录，并且index.php就在这个目录下
/usr/local/php72/bin/php  -S 0.0.0.0:8080 -t ./
```



浏览器访问 IP:8080

![iShot2021-01-30 10.53.06](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-01-30 10.53.06.png)





![iShot2021-01-30 10.53.47](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-01-30 10.53.47.png)



### 1.8 启动php-fpm

```sh
/usr/local/php72/sbin/php-fpm -c /usr/local/php72/etc/php.ini -y /usr/local/php72/etc/php-fpm.conf -D
```



### 1.9 使用supervisor管理php-fpm

#### 1.9.1 编辑supervisor php文件

```ini
cat >/etc/supervisor/config.d/php72.ini<<'EOF'
[program:php72]
command=/usr/local/php72/sbin/php-fpm -c /usr/local/php72/etc/php.ini -y /usr/local/php72/etc/php-fpm.conf
autostart=true
user=www
stdout_logfile=/var/log/supervisor/php72.log
stderr_logfile=/var/log/supervisor/php72.error.log
EOF
```



#### 1.9.2 将php加入supervisor

```shell
$ supervisorctl update php72
php72: added process group
```



**⚠️<span style=color:red>始终报错，无法解决</span>**



### 1.10 启动php报错

> 机器上安装了多个版本的php，在启动其中一个的时候遇到了如下报错

```
/usr/local/php72/sbin/php-fpm -c /usr/local/php72/etc/php.ini -y /usr/local/php72/etc/php-fpm.conf  -D
[04-Jan-2021 16:52:50] NOTICE: PHP message: PHP Warning:  PHP Startup: Unable to load dynamic library 'redis.so' (tried: /usr/local/php72/lib/php/extensions/no-debug-non-zts-20170718/redis.so (/usr/local/php72/lib/php/extensions/no-debug-non-zts-20170718/redis.so: undefined symbol: zend_string_init_interned), /usr/local/php72/lib/php/extensions/no-debug-non-zts-20170718/redis.so.so (/usr/local/php72/lib/php/extensions/no-debug-non-zts-20170718/redis.so.so: cannot open shared object file: No such file or directory)) in Unknown on line 0
```

解决方法

注释 `php.ini` 中的 `extension=redis.so`

在 `php-fpm.d` ⽂件夹下创建新⽂件 `redis.ini`，在 `redis.ini` ⾥加⼊ `extension=redis.so` 一⾏，然后重启php即可





