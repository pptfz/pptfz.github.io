# ldap配置acl

## 背景说明

### 普通用户默认能查看所有信息

使用普通用户 `uid=go_user1,cn=go,ou=ou_name1,dc=ops,dc=com` 登陆，默认是可以看到所有信息的

![iShot_2025-09-23_15.37.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-23_15.37.50.png)



使用普通用户进行  `ldapsearch` 是可以搜索到ldap中全部内容的

```shell
ldapsearch -x -H ldap://localhost:1389 -D "uid=go_user1,cn=go,ou=ou_name1,dc=ops,dc=com" -w admin -b "dc=ops,dc=com"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# ops.com
dn: dc=ops,dc=com
objectClass: dcObject
objectClass: organization
dc: ops
o: example

# go, ops.com
dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1000

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1001

# python, ops.com
dn: cn=python,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: python
gidNumber: 1002

# groups, ops.com
dn: ou=groups,dc=ops,dc=com
objectClass: organizationalUnit
ou: groups

# ou_name1, ops.com
dn: ou=ou_name1,dc=ops,dc=com
objectClass: top
objectClass: organizationalUnit
ou: ou_name1

# ou_name2, ops.com
dn: ou=ou_name2,dc=ops,dc=com
objectClass: top
objectClass: organizationalUnit
ou: ou_name2

# ou_name3, ops.com
dn: ou=ou_name3,dc=ops,dc=com
objectClass: top
objectClass: organizationalUnit
ou: ou_name3

# java_user1, java, ops.com
dn: uid=java_user1,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: java_user1
sn: java_user1
uid: java_user1
uidNumber: 1001
gidNumber: 1000
homeDirectory: /home/java_user1
loginShell: /bin/bash
mail: java_user1@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# java_user2, java, ops.com
dn: uid=java_user2,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: java_user2
sn: java_user2
uid: java_user2
uidNumber: 1002
gidNumber: 1000
homeDirectory: /home/java_user2
loginShell: /bin/bash
mail: java_user2@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# java_user3, java, ops.com
dn: uid=java_user3,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: java_user3
sn: java_user3
uid: java_user3
uidNumber: 1003
gidNumber: 1000
homeDirectory: /home/java_user3
loginShell: /bin/bash
mail: java_user3@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# readers, groups, ops.com
dn: cn=readers,ou=groups,dc=ops,dc=com
cn: readers
objectClass: groupOfNames
member: cn=user01,ou=users,dc=ops,dc=com
member: cn=user02,ou=users,dc=ops,dc=com

# go, ou_name1, ops.com
dn: cn=go,ou=ou_name1,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1000

# java, ou_name1, ops.com
dn: cn=java,ou=ou_name1,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1001

# python, ou_name1, ops.com
dn: cn=python,ou=ou_name1,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: python
gidNumber: 1002

# go_user1, go, ou_name1, ops.com
dn: uid=go_user1,cn=go,ou=ou_name1,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: go_user1
sn: go_user1
uid: go_user1
uidNumber: 1001
gidNumber: 1000
homeDirectory: /home/go_user1
loginShell: /bin/bash
mail: go_user1@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# go_user2, go, ou_name1, ops.com
dn: uid=go_user2,cn=go,ou=ou_name1,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: go_user2
sn: go_user2
uid: go_user2
uidNumber: 1002
gidNumber: 1000
homeDirectory: /home/go_user2
loginShell: /bin/bash
mail: go_user2@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# go_user3, go, ou_name1, ops.com
dn: uid=go_user3,cn=go,ou=ou_name1,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: go_user3
sn: go_user3
uid: go_user3
uidNumber: 1003
gidNumber: 1000
homeDirectory: /home/go_user3
loginShell: /bin/bash
mail: go_user3@ops.com
userPassword:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=

# search result
search: 2
result: 0 Success

# numResponses: 19
# numEntries: 18
```



这样是不规范的，更加规范的操作是设置acl，只有admin和设置的用户能登陆phpldapadmin和进行 `ldapsearch` 操作



## 查看acl

:::caution 注意

如果是以非容器默认用户（例如root）登陆容器，进行 `ldapsearch` 的时候就会报错

```shell
$ docker exec -it -u root openldap-bitnami bash
$ ldapsearch -H ldapi:// -LLL -Q -Y EXTERNAL -b "cn=config" "(objectClass=*)" dn olcDatabase olcSuffix olcAccess
No such object (32)
```

:::

查看当前ldap所有acl

```shell
ldapsearch -H ldapi:// -LLL -Q -Y EXTERNAL -b "cn=config" "(objectClass=*)" dn olcDatabase olcSuffix olcAccess
```

输出

```shell
dn: cn=config

dn: cn=module{0},cn=config

dn: cn=schema,cn=config

dn: cn={0}core,cn=schema,cn=config

dn: cn={1}cosine,cn=schema,cn=config

dn: cn={2}inetorgperson,cn=schema,cn=config

dn: cn={3}nis,cn=schema,cn=config

dn: olcDatabase={-1}frontend,cn=config
olcDatabase: {-1}frontend

dn: olcDatabase={0}config,cn=config
olcDatabase: {0}config
olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=1001,cn=peercred,cn=exter
 nal,cn=auth" manage by * none

dn: olcDatabase={1}monitor,cn=config
olcDatabase: {1}monitor
olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external
 , cn=auth" read by dn.base="cn=admin,dc=ops,dc=com" read by * none

dn: olcDatabase={2}mdb,cn=config
olcDatabase: {2}mdb
olcSuffix: dc=ops,dc=com
```





## 新增acl

编辑文件

```shell
cat > add-acl.ldif << EOF
dn: olcDatabase={0}config,cn=config
changetype: modify
add: olcAccess
olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none
EOF
```



应用

```shell
ldapmodify -Y EXTERNAL -H ldapi:/// -f add-acl.ldif
```

输出

```sh
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=1001,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={2}mdb,cn=config"
```



## 新增acl后验证

新增acl后再次执行，可以看到普通用户已经无法进行查询了

```shell
ldapsearch -x -H ldap://localhost:1389 -D "uid=go_user1,cn=go,ou=ou_name1,dc=ops,dc=com" -w admin -b "dc=ops,dc=com"
```



报错如下

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# search result
search: 2
result: 32 No such object

# numResponses: 1
```



使用普通用户登陆phpldapadmin也报错 `This base cannot be created with PLA.`

![iShot_2025-09-24_17.03.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-24_17.03.55.png)





## 创建只读账号

### 创建只读用户

编辑文件

```shell
cat > readonly-user.ldif << EOF
dn: cn=readonly,dc=ops,dc=com
changetype: add
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: readonly
description: LDAP readonly user
# 用户密码为readnly
userPassword: {SSHA}gjjR32woo7vY5Ag72toSMTdqSEj3xVI0
EOF
```



应用

```shell
ldapmodify -x -D "cn=admin,dc=ops,dc=com" -w admin -H ldap://localhost:1389 -f readonly-user.ldif
```

输出

```shell
adding new entry "cn=readonly,dc=ops,dc=com"
```





### 创建只读acl

编辑文件

```shell
cat > add-readonly-acl.ldif << EOF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
add: olcAccess
olcAccess: {1}to * by dn.exact="cn=readonly,dc=ops,dc=com" read by * none
EOF
```



应用

```shell
ldapmodify -Y EXTERNAL -H ldapi:/// -f add-readonly-acl.ldif
```

输出

```shell
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=1001,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={2}mdb,cn=config"
```



## 查询登陆验证

此时在使用 `readonly` 用户进行查询就可以了

```shell
ldapsearch -x -H ldap://localhost:1389 -D "cn=readonly,dc=ops,dc=com" -w readonly -b "dc=ops,dc=com"
```





使用 `readonly` 用户登陆phpldapadmin也可以了

![iShot_2025-09-24_19.27.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-24_19.27.37.png)







## 总结

查看acl

:::tip 说明

有了 `olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none` 报错 `This base cannot be created with PLA.`

:::

```shell
$ ldapsearch -H ldapi:// -LLL -Q -Y EXTERNAL -b "cn=config" "(objectClass=*)" dn olcDatabase olcSuffix olcAccess|grep anonymous
olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none
```



删除acl

```shell
cat > delete-acl.ldif << EOF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
delete: olcAccess
olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none
EOF
```

应用

```shell
ldapmodify -Y EXTERNAL -H ldapi:/// -f delete-acl.ldif
```



有问题报错这个

```shell
$ ldapsearch -x -H ldap://localhost:1389 -D "cn=readonly,dc=ops,dc=com" -w readonly -b "dc=ops,dc=com"
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# search result
search: 2
result: 32 No such object
```



