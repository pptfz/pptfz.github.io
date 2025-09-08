# Self Service Password修改密码报错

## 报错信息

用户修改密码，页面报错 `密码被 LDAP 目录服务拒绝` ，日志报错如下

```php
[Mon Sep 08 06:07:25.578613 2025] [php:notice] [pid 19:tid 19] [client 12.12.13.19:21786] LDAP - Modify password error 50 (Insufficient access), referer: https://ssp.xxx.com/index.php
```

![iShot_2025-09-05_15.04.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-05_15.04.06.png)





## 解决方法

### 查看acl

:::tip 说明

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

```
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

