# Self Service Password报错

## 报错1 访问报错 `Token encryption requires a random string in keyphrase setting`

[github issue中有提到这个问题](https://github.com/ltb-project/self-service-password/issues/199)

[问题说明链接](https://ltb-project.org/documentation/self-service-password/latest/config_general#security)

### 报错信息

![iShot2021-09-18_15.21.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-18_15.21.21.png)



### 解决方法

```shell
修改
	$keyphrase = "secret";
修改为任意字符的随机字符串
	$keyphrase = "yaldnfaopewnrganadnfa";
```





## 报错2 `无法修改密码，日志报错用户未发现`

### 报错信息

```shell
[Sat Sep 18 08:06:20.175684 2021] [php7:notice] [pid 18] [client 10.0.17.251:56444] LDAP - User xiaoming not found, referer: http://172.30.100.4:8000/index.php
10.0.17.251 - - [18/Sep/2021:08:06:20 +0000] "POST /index.php HTTP/1.1" 200 1841 "http://172.30.100.4:8000/index.php" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
```



### 解决方法

问题所在，需要修改以下配置，`objectClass=person` 是官方示例的写法，需要把person修改为具体的过滤内容，例如修改为 `*`

```shell
$ldap_filter = "(&(objectClass=person)($ldap_login_attribute={login}))";
```



修改为如下

```shell
$ldap_filter = "(&(objectClass=*)($ldap_login_attribute={login}))";
```



##  报错3 `密码被LDAP服务器拒绝`

### 报错信息

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



### 解决方法

```php
修改 $who_change_password = "user";
修改为 $who_change_password = "manager";
```



## 报错4 用户无法自行修改密码

### 报错信息

用户修改密码，页面报错 `密码被 LDAP 目录服务拒绝` ，日志报错如下

```php
[Mon Sep 08 06:07:25.578613 2025] [php:notice] [pid 19:tid 19] [client 12.12.13.19:21786] LDAP - Modify password error 50 (Insufficient access), referer: https://ssp.xxx.com/index.php
```

![iShot_2025-09-05_15.04.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-05_15.04.06.png)



### 解决方法

查看acl

```shell
$ ldapsearch -H ldapi:/// -Y EXTERNAL -b "olcDatabase={2}mdb,cn=config" olcAccess

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=1001,cn=peercred,cn=external,cn=auth
SASL SSF: 0
# extended LDIF
#
# LDAPv3
# base <olcDatabase={2}mdb,cn=config> with scope subtree
# filter: (objectclass=*)
# requesting: olcAccess 
#

# {2}mdb, config
dn: olcDatabase={2}mdb,cn=config

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



编辑文件

:::tip 说明

这是 ACL 的具体规则，意思是：

`to attrs=userPassword`

- 规则作用对象是 **`userPassword` 属性**（密码字段）

`by self write`

- **用户本人**可以写（修改）自己的密码

`by anonymous auth`

- **匿名用户**可以做 **认证操作**（比如验证密码登录），但不能查看密码明文

`by * none`

- **其他任何人**都没有权限访问密码字段

:::

```shell
cat > add-acl.ldif << EOF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
add: olcAccess
olcAccess: to attrs=userPassword
  by self write
  by anonymous auth
  by * none
EOF
```



执行

```shell
ldapmodify -H ldapi:/// -Y EXTERNAL -f add-acl.ldif
```

输出

```shell
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=1001,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={2}mdb,cn=config"
```



执行成功后用户就可以自行修改密码了
