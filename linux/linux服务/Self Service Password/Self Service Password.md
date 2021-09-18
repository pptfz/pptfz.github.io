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
$ldap_url = "ldap://172.30.100.17:389";
$ldap_starttls = false;
$ldap_binddn = "cn=admin,dc=qike,dc=com";
$ldap_bindpw = 'PAPAqike.comls';
// for GSSAPI authentication, comment out ldap_bind* and uncomment ldap_krb5ccname lines
//$ldap_krb5ccname = "/path/to/krb5cc";
$ldap_base = "cn=gitlab,dc=qike,dc=com";
$ldap_login_attribute = "uid";
$ldap_fullname_attribute = "cn";
$ldap_filter = "(&(objectClass=person)($ldap_login_attribute={login}))";
$ldap_use_exop_passwd = false;
$ldap_use_ppolicy_control = false;
```









```sh
gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'
   main: # 'main' is the GitLab 'provider ID' of this LDAP server
     label: 'hehe'
     host: '172.30.100.17'  #ldap服务地址
     port: 389                      #ldap服务端口号
     uid: 'uid'                      #登录名字使用字段
     bind_dn: 'cn=admin,dc=qike,dc=com'   #ldap管理员登录账号
     password: 'PAPAqike.comls'                                   #ldap管理员密码
     encryption: 'plain'                                       #模式
     verify_certificates: true                             #验证证书
     smartcard_auth: false
     active_directory: true   # 如果是 Active Directory LDAP server 则设为true
     allow_username_or_email_login: false # 是否允许email登录
     lowercase_usernames: false  # 是否将用户名转为小写
     block_auto_created_users: false  # 是否自动创建用户
     base: 'cn=gitlab,dc=qike,dc=com' #从哪个位置搜索用户
     user_filter: ''  #添加过滤属性
     attributes:
       username: ['uid']  #用户名
       email:    ['email']
       name:      'uid'
       first_name: 'givenName' #姓名 对应gitlab的name
       last_name:  'sn'
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
EOS
```







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







日志报错用户未发现

```shell
[Sat Sep 18 08:06:20.175684 2021] [php7:notice] [pid 18] [client 10.0.17.251:56444] LDAP - User xiaoming not found, referer: http://172.30.100.4:8000/index.php
10.0.17.251 - - [18/Sep/2021:08:06:20 +0000] "POST /index.php HTTP/1.1" 200 1841 "http://172.30.100.4:8000/index.php" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
```













