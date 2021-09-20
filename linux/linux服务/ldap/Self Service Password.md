[toc]

# Self Service Password

[Self Service Password github地址](https://github.com/ltb-project/self-service-password)

[Self Service Password 官网](https://self-service-password.readthedocs.io/en/latest/)

[Self Service Password官方安装文档](https://self-service-password.readthedocs.io/en/latest/installation.html)





# 1.Self Service Password简介

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



# 2.安装

## 2.1 标准安装



## 2.2 dokcer安装

[self service password dockerhub地址](https://hub.docker.com/r/ltbproject/self-service-password)



**<span style=color:red>⚠️官方文档docker启动命令有坑，这里稍做了一下修改</span>**

```shell
# /var/www/conf/config.inc.local.php在ssp容器中是一个空目录！！！
-v /home/test/ssp.conf.php:/var/www/conf/config.inc.local.php
```



创建volume

```
docker volume create ssp
```



直接启动容器

```shell
docker run \
    -d \
    --restart=always \
    --name self-service-password \
    -h self-service-password \
    -p 8000:80 \
    -v ssp:/var/www/conf/ \
    -it docker.io/ltbproject/self-service-password:latest
```



# 3.配置ldap连接

修改配置文件 `config.inc.php` 

```php
# LDAP
$ldap_url = "ldap://172.30.100.17:389";	// 修改为ldap服务器地址
$ldap_starttls = false;
$ldap_binddn = "cn=admin,dc=qike,dc=com";	// ldap管理员账号
$ldap_bindpw = '123456';	// ldap管理员密码
// for GSSAPI authentication, comment out ldap_bind* and uncomment ldap_krb5ccname lines
//$ldap_krb5ccname = "/path/to/krb5cc";
$ldap_base = "cn=gitlab,dc=qike,dc=com";	// ldap搜索参数
$ldap_login_attribute = "uid";
$ldap_fullname_attribute = "cn";
$ldap_filter = "(&(objectClass=*)($ldap_login_attribute={login}))";	// 用户搜索规则
$ldap_use_exop_passwd = false;
$ldap_use_ppolicy_control = false;
```



修改完成后重启docker容器

```shell
docker restart self-service-password
```



# 4.访问

浏览器访问 `IP:8000`

![iShot2021-09-20 19.29.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 19.29.51.png)



# 5.配置修改密码策略

修改配置文件 `config.inc.php` 

```php
# 设置密码长度
$pwd_min_length = 4;	# 最少位数
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
$pwd_show_policy = always

# 配置策略是显示在表单上方还是下方
$pwd_show_policy_pos = "above";

# 当密码被拒绝时，您可以显示目录返回的错误信息。消息内容取决于您的 LDAP 服务器软件。
$show_extended_error = true;
```



`$pwd_show_policy` 选项用于向用户显示密码策略，有3个值

- `always`: 策略总是显示

- `never`: 策略从不显示
- `onerror`: 仅当密码因此被拒绝时才显示策略，并且用户正确提供了他的旧密码。



配置完成后重启容器，刷新页面，刚才配置的密码策略就显示出来了

![iShot2021-09-20 20.30.08](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 20.30.08.png)



# 6.配置邮件重置密码

**<span style=color:red>⚠️在self service password中使用邮箱重置密码功能的前提是邮箱必须是ldap中用户绑定的邮箱</span>**

修改配置文件 `config.inc.php` 

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

![iShot2021-09-20 21.11.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 21.11.15.png)



收到的密码重置邮件

> 但是链接是纯文本的，想改成链接的方式，方法没找到

![iShot2021-09-20 21.30.00](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 21.30.00.png)



在密码重置邮件中点击链接访问就可以修改密码了

![iShot2021-09-20 21.13.12](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 21.13.12.png)



重置密码的邮箱必须是ldap中用户绑定的邮箱，输入其他邮箱会报错邮箱与用户不一致

![iShot2021-09-20 21.17.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-20 21.17.37.png)



# 遇到的报错

**报错1**

访问报错 `Token encryption requires a random string in keyphrase setting`

[github issue中有提到这个问题](https://github.com/ltb-project/self-service-password/issues/199)

[问题说明链接](https://ltb-project.org/documentation/self-service-password/latest/config_general#security)

![iShot2021-09-18 15.21.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-18 15.21.21.png)



解决方法

```shell
修改
	$keyphrase = "secret";
修改为任意字符的随机字符串
	$keyphrase = "yaldnfaopewnrganadnfa";
```





**报错2**

无法修改密码，日志报错用户未发现

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







