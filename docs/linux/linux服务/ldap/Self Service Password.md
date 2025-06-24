[toc]

# Self Service Password

[Self Service Password github地址](https://github.com/ltb-project/self-service-password)

[Self Service Password 官网](https://self-service-password.readthedocs.io/en/latest/)

[Self Service Password官方安装文档](https://self-service-password.readthedocs.io/en/latest/installation.html)



## 遇到的报错

### **报错1** 访问报错 `Token encryption requires a random string in keyphrase setting`

[github issue中有提到这个问题](https://github.com/ltb-project/self-service-password/issues/199)

[问题说明链接](https://ltb-project.org/documentation/self-service-password/latest/config_general#security)



![iShot2021-09-18_15.21.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-18_15.21.21.png)



解决方法

```shell
修改
	$keyphrase = "secret";
修改为任意字符的随机字符串
	$keyphrase = "yaldnfaopewnrganadnfa";
```





### **报错2** `无法修改密码，日志报错用户未发现`

```shell
[Sat Sep 18 08:06:20.175684 2021] [php7:notice] [pid 18] [client 10.0.17.251:56444] LDAP - User xiaoming not found, referer: http://172.30.100.4:8000/index.php
10.0.17.251 - - [18/Sep/2021:08:06:20 +0000] "POST /index.php HTTP/1.1" 200 1841 "http://172.30.100.4:8000/index.php" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
```



问题所在，需要修改以下配置，`objectClass=person` 是官方示例的写法，需要把person修改为具体的过滤内容，例如修改为 `*`

```shell
$ldap_filter = "(&(objectClass=person)($ldap_login_attribute={login}))";
```



修改为如下

```shell
$ldap_filter = "(&(objectClass=*)($ldap_login_attribute={login}))";
```



### 报错3 `密码被LDAP服务器拒绝`

![iShot_2022-07-28_17.34.09](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-07-28_17.34.09.png)



日志报错如下

```shell
[Thu Jul 28 09:17:27.537279 2022] [php7:warn] [pid 18] [client 172.20.20.2:54960] PHP Warning:  ldap_mod_replace(): Modify: Insufficient access in /var/www/lib/functions.inc.php on line 499, referer: http://172.20.20.4:8000/
[Thu Jul 28 09:17:27.537321 2022] [php7:notice] [pid 18] [client 172.20.20.2:54960] LDAP - Modify password error 50 (Insufficient access), referer: http://172.20.20.4:8000/
172.20.20.2 - - [28/Jul/2022:09:17:27 +0000] "POST / HTTP/1.1" 200 2016 "http://172.20.20.4:8000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
[Thu Jul 28 09:18:16.669056 2022] [php7:warn] [pid 19] [client 172.20.20.2:54991] PHP Warning:  ldap_mod_replace(): Modify: Insufficient access in /var/www/lib/functions.inc.php on line 499, referer: http://172.20.20.4:8000/
[Thu Jul 28 09:18:16.669104 2022] [php7:notice] [pid 19] [client 172.20.20.2:54991] LDAP - Modify password error 50 (Insufficient access), referer: http://172.20.20.4:8000/
172.20.20.2 - - [28/Jul/2022:09:18:16 +0000] "POST / HTTP/1.1" 200 2012 "http://172.20.20.4:8000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
172.20.20.2 - - [28/Jul/2022:09:19:07 +0000] "-" 408 0 "-" "-"
```

![iShot_2022-07-28_17.42.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-07-28_17.42.50.png)



解决方法

```php
修改 $who_change_password = "user";
修改为 $who_change_password = "manager";
```



## Self Service Password简介

**简介**

- Self Service Password是一个PHP应用程序，允许用户在LDAP目录中更改密码。

- 该应用程序可以用于标准的LDAPv3目录(OpenLDAP、OpenDS、ApacheDS、Sun Oracle DSEE、Novell等)，也可以用于Active Directory。



**特点:**

- Samba模式，修改Samba密码

- 活动目录模式

- 本地密码策略:

  - 最小/最大长度

  - 禁止字符

  - 上、下、数字或特殊字符计数器

  - 重用旧密码检查

  - 密码与登录名相同

  - 复杂性(不同类型的字符)

- 帮助信息

- 重置的问题

- 通过邮件挑战重置(通过邮件发送的令牌)

- 通过短信重置(通过外部Email 2短信服务或短信API)

- 修改LDAP目录下的SSH Key

- 验证码(内置)

- 更改密码后的邮件通知

- 修改密码之前和之后的挂钩脚本



## 安装

### 标准安装

[官方安装文档](https://self-service-password.readthedocs.io/en/latest/installation.html)



#### 安装php

##### 安装 [remi](https://blog.remirepo.net/pages/Config-en) 源

```shell
yum -y install epel-release && \
yum -y install https://rpms.remirepo.net/enterprise/remi-release-9.rpm
```



##### 安装php7.4

:::tip 说明

self-service-password依赖的php>=7.4

:::

```sh
export PHP_VERSION=php74
yum -y install \
  ${PHP_VERSION}-php-fpm \
  ${PHP_VERSION}-php-cli \
  ${PHP_VERSION}-php-bcmath \
  ${PHP_VERSION}-php-gd \
  ${PHP_VERSION}-php-json \
  ${PHP_VERSION}-php-mbstring \
  ${PHP_VERSION}-php-mcrypt \
  ${PHP_VERSION}-php-mysqlnd \
  ${PHP_VERSION}-php-opcache \
  ${PHP_VERSION}-php-pdo \
  ${PHP_VERSION}-php-pecl-crypto \
  ${PHP_VERSION}-php-pecl-mcrypt \
  ${PHP_VERSION}-php-pecl-geoip \
  ${PHP_VERSION}-php-recode \
  ${PHP_VERSION}-php-snmp \
  ${PHP_VERSION}-php-soap \
  ${PHP_VERSION}-php-xml \
  ${PHP_VERSION}-php-ldap \
  ${PHP_VERSION}-php-common
```



##### 安装位置

| 类型               | 路径                                            | 说明                                                         |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| 安装目录           | `/etc/opt/remi/php74`                           | PHP 安装目录                                                 |
| PHP 主程序         | `/opt/remi/php74/root/usr/bin/php`              | 执行 PHP 程序用                                              |
| 主配置文件         | `/etc/opt/remi/php74/php.ini`                   | 主配置文件                                                   |
| 池（Pool）配置文件 | `/etc/opt/remi/php74/php-fpm.d/www.conf`        | 用于配置 php-fpm 接收请求的方式、进程管理、运行用户、监听端口/套接字等参数 |
| socket文件         | `/var/opt/remi/php74/run/php-fpm/www.sock`      | PHP-FPM socket文件                                           |
| php-fpm 配置       | `/etc/opt/remi/php74/php-fpm.conf`              | PHP-FPM 配置文件                                             |
| 扩展模块           | `/opt/remi/php74/root/usr/lib64/php/modules`    | 所有模块 `.so` 文件目录                                      |
| systemd 启动       | `/usr/lib/systemd/system/php74-php-fpm.service` | 使用 `systemctl` 管理 FPM 服务                               |



##### 启动php74

```shell
systemctl enable php74-php-fpm && systemctl start php74-php-fpm
```



##### 修改目录权限

```shell
chown -R www.www /var/opt/remi/php74
chown -R www.www /etc/opt/remi/php74
```



##### 修改php-fpm运行用户

修改 `/etc/opt/remi/php74/php-fpm.d/www.conf` 中的以下几项，默认是 `apache` 用户

```shell
user = www
group = www
listen.acl_users = www
```



##### 修改 `/var/cache/self-service-password` 目录权限

:::caution 注意

必须将 `/var/cache/self-service-password` 目录以及目录下所有文件的权限修改为 php-fpm 的运行用户，否则访问会报错500

:::

```shell
chown -R www.www /var/cache/self-service-password
```



##### 重启php-fpm

```shell
systemctl restart php74-php-fpm
```



#### 添加yum源

```shell
cat > /etc/yum.repos.d/ltb-project.repo << 'EOF'
[ltb-project-noarch]
name=LTB project packages (noarch)
baseurl=https://ltb-project.org/rpm/$releasever/noarch
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-LTB-project
EOF
```



#### 导入存储库密钥

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="el7/el8" label="el7/el8" default>

```shell
rpm --import https://ltb-project.org/documentation/_static/RPM-GPG-KEY-LTB-project
```

  </TabItem>
  <TabItem value="el9" label="el9">

```shell
rpm --import https://ltb-project.org/documentation/_static/RPM-GPG-KEY-LTB-PROJECT-SECURITY
```

  </TabItem>
</Tabs>



#### yum安装

```shell
yum -y install self-service-password
```



##### 查看安装位置

```shell
rpm -ql self-service-password
```



| 文件类型    | 路径示例                                       |
| ----------- | ---------------------------------------------- |
| 源码目录    | `/usr/share/self-service-password/`            |
| 配置文件    | `/etc/self-service-password/config.inc.php`    |
| Apache 配置 | `/etc/httpd/conf.d/self-service-password.conf` |



#### 配置nginx

[webserver配置官方文档](https://self-service-password.readthedocs.io/en/latest/config_webserver.html)



:::tip 说明

这里依据官方的文件进行了一下修改

如果想要在 `access_log` 后添加 `main` 字段，则需要取消 `nginx.conf` 中 `http` 块下的 `log_format  main` 的注释

:::

```nginx
server {
listen 80;

root /usr/share/self-service-password/htdocs;
index index.php index.html index.htm;

# Make site accessible from http://localhost/
server_name ssp.ops.com;

# Disable sendfile as per https://docs.vagrantup.com/v2/synced-folders/virtualbox.html
sendfile off;

    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript text/x-js;
    gzip_vary on;
    gzip_proxied any;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

# Add stdout logging

error_log /var/log/nginx/ssp.ops.com_error.log warn;
access_log /var/log/nginx/ssp.ops.com_access.log main;


# pass the PHP scripts to FastCGI server listening on socket
#
location ~ \.php {
    fastcgi_pass unix:/var/opt/remi/php74/run/php-fpm/www.sock;
    fastcgi_split_path_info       ^(.+\.php)(/.+)$;
    fastcgi_param PATH_INFO       $fastcgi_path_info;
    fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_index index.php;
        try_files $fastcgi_script_name =404;
    fastcgi_read_timeout 600;
    include fastcgi_params;
}

    error_page 404 /404.html;
    location = /404.html {
            root /usr/share/nginx/html;
            internal;
}

# deny access to . files, for security
#
location ~ /\. {
        log_not_found off;
        deny all;
}

location ~ /scripts {
        log_not_found off;
        deny all;
}

}
```



#### 访问

![iShot_2025-06-20_17.10.43](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-20_17.10.43.png)





### dokcer安装

[self service password dockerhub地址](https://hub.docker.com/r/ltbproject/self-service-password)



#### 获取配置文件

创建持久化目录

```shell
[ -d /data/docker-volume/ssp ] || mkdir -p /data/docker-volume/ssp
```



运行临时容器，拷贝配置文件

```shell
docker run --name ssp-temp -d docker.io/ltbproject/self-service-password:1.7.3
docker cp ssp-temp:/var/www/config.inc.php.orig /data/docker-volume/ssp/config.inc.local.php
docker rm -f ssp-temp
```



#### 启动容器

```shell
docker run -d \
  --restart=always \
  --name self-service-password \
  -p 8000:80 \
  -v /data/docker-volume/ssp/config.inc.local.php:/var/www/conf/config.inc.local.php \
  ltbproject/self-service-password:1.7.3
```



#### 修改配置文件

##### 配置ldap连接

修改配置文件 `config.inc.local.php`

```php
# LDAP
$ldap_url = "ldap://10.0.16.17:389";	// 修改为ldap服务器地址
$ldap_starttls = false;
$ldap_binddn = "cn=admin,dc=ops,dc=com";	// ldap管理员账号
$ldap_bindpw = 'admin';	// ldap管理员密码
// for GSSAPI authentication, comment out ldap_bind* and uncomment ldap_krb5ccname lines
//$ldap_krb5ccname = "/path/to/krb5cc";
$ldap_base = "dc=qike,dc=com";	// ldap搜索参数
$ldap_login_attribute = "uid";
$ldap_fullname_attribute = "cn";
$ldap_filter = "(&(objectClass=*)($ldap_login_attribute={login}))";	// 用户搜索规则
$ldap_use_exop_passwd = false;
$ldap_use_ppolicy_control = false;
```



##### 配置 `keyphrase`

[关于配置keyphrase的官方文档说明](https://self-service-password.readthedocs.io/en/latest/config_general.html#security)

:::tip 说明

默认配置是 `$keyphrase = "secret";` ，需要将值 `secret` 修改为随机字符串

如果未在 `$login_forbidden_chars` 中配置字符，则仅允许字母数字字符，默认的配置是

```php
$login_forbidden_chars = "*()&|";
```

:::

```shell
修改为任意字符的随机字符串
$keyphrase = "pfFad4rs5aGn9Q";
```



修改完成后重启docker容器

```shell
docker restart self-service-password
```



## 访问

浏览器访问 `IP:8000`

![iShot_2025-06-13_15.10.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-13_15.10.44.png)







## 配置修改密码策略

修改配置文件 `config.inc.local.php` 

```php
# 设置密码长度
$pwd_min_length = 2;	# 最少位数
$pwd_max_length = 8;	# 最多位数

# 设置大小写、数字、特殊字符最小数量
$pwd_min_lower = 3;	# 小写字母
$pwd_min_upper = 1;	# 大写字母
$pwd_min_digit = 1;	# 数字
$pwd_min_special = 1;	# 特殊字符

# 禁止符号出现
$pwd_forbidden_chars = "@%";	# @和%不能出现在密码中

#	不同类别字符
$pwd_complexity = 2;	# 大小写、数字、特殊字符最少2种

# 禁止使用旧密码作为新密码
$pwd_no_reuse = true;

# 新密码最少包含3种不同的字符
$pwd_diff_last_min_chars = 3;

# 密码中不能出现的单词
$pwd_forbidden_words = array("azerty", "qwerty", "password");

# 总是向用户显示密码策略
$pwd_show_policy = "always";

# 配置策略是显示在表单上方还是下方 above是上方 below是下方
$pwd_show_policy_pos = "above";

# 当密码被拒绝时，您可以显示目录返回的错误信息。消息内容取决于您的 LDAP 服务器软件。
$show_extended_error = true;
```



`$pwd_show_policy` 选项用于向用户显示密码策略，有3个值

- `always`: 策略总是显示

- `never`: 策略从不显示
- `onerror`: 仅当密码因此被拒绝时才显示策略，并且用户正确提供了他的旧密码



配置完成后重启容器，刷新页面，刚才配置的密码策略就显示出来了

![iShot_2025-06-13_15.25.25](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-13_15.25.25.png)







## 配置邮件重置密码

:::caution 注意

在self service password中使用邮箱重置密码功能的前提是邮箱必须是ldap中用户绑定的邮箱

:::

修改配置文件 `config.inc.local.php` 

配置邮件

有关PHPMailer更多信息，请参阅 https://github.com/PHPMailer/PHPMailer

```php
# 配置发件人名称
$mail_from = "admin@example.com";
$mail_from_name = "Self Service Password administrator";
$mail_signature = "";

# 更改密码通知，使用此选项在邮件更改成功后立即向用户发送确认邮件
$notify_on_change = true;

# PHPMailer 配置
$mail_sendmailpath = '/usr/sbin/sendmail';
$mail_protocol = 'smtp';
$mail_smtp_debug = 0;
$mail_debug_format = 'html';
$mail_smtp_host = 'localhost';	# smtp地址
$mail_smtp_auth = true;	# 这里设置为true
$mail_smtp_user = '';	# 发件人邮箱用户名
$mail_smtp_pass = '';	# 发件人邮箱密码
$mail_smtp_port = 25;	# 端口
$mail_smtp_timeout = 30;
$mail_smtp_keepalive = false;
$mail_smtp_secure = 'tls';
$mail_smtp_autotls = true;
$mail_smtp_options = array();
$mail_contenttype = 'text/plain';
$mail_wordwrap = 0;
$mail_charset = 'utf-8';
$mail_priority = 3;
```



配置邮件重置密码

```php
# 开启邮件重置密码功能
$use_tokens = true;

# 配置加密，保护会话标识
$crypt_tokens = true;

# 令牌ttl，以便在未使用时将其删除，单位秒
$token_lifetime = "3600";

# 配置日志路径，默认情况下，生成的 URL 会记录在默认的 Apache 错误日志中。可以更改此行为以登录特定文件。apache用户对此目录必须有写入权限
$reset_request_log = "/var/log/self-service-password";

# 配置重定向url，在ssp前有代理的情况下使用，例如使用了nginx
$reset_url = $_SERVER['HTTP_X_FORWARDED_PROTO'] . "://" . $_SERVER['HTTP_X_FORWARDED_HOST'] . $_SERVER['SCRIPT_NAME'];
```



在邮件选项下输入ldap中绑定的邮箱就可以发出重置邮件了

![iShot2021-09-20_21.11.15](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-20_21.11.15.png)





收到的密码重置邮件

> 使用电脑客户端链接是纯文本的，但是在浏览器中打开是超链接

![iShot2021-09-20_21.30.00](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-20_21.30.00.png)



在密码重置邮件中点击链接访问就可以修改密码了

![iShot2021-09-20_21.13.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-20_21.13.12.png)





重置密码的邮箱必须是ldap中用户绑定的邮箱，输入其他邮箱会报错邮箱与用户不一致

![iShot2021-09-20_21.17.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-20_21.17.37.png)



