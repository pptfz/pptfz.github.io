# ldap条目管理

## ldap相关命令连接ldap不同方式说明

:::tip 说明

`-H ldap://` 与 `-H ldapi:///` 的对比说明

| 形式                  | 协议类型      | 说明                                             | 用途场景                       |
| --------------------- | ------------- | ------------------------------------------------ | ------------------------------ |
| `-H ldap://localhost` | TCP 明文协议  | 使用标准 TCP/IP 连接，默认端口是 389             | 本地或远程连接，适合大多数情况 |
| `-H ldapi:///`        | UNIX 域套接字 | 使用本地 Unix Socket 文件（如 `/var/run/ldapi`） | 本机内部通信，权限更精细更安全 |

:::

### `-H ldap://localhost`

- 使用标准 **LDAP 协议**，通过 TCP 端口（通常是 389）。
- 可以连接到本机或远程服务器。
- 明文传输（不加密），如需加密应使用 `ldaps://` 或 StartTLS。
- 通常需要用户名/密码进行身份验证。

示例

```shell
ldapsearch -H ldap://localhost -D "cn=admin,dc=ops,dc=com" -w admin ...
```



### `-H ldapi:///`

- 使用 **本地 UNIX socket**（LDAP over IPC）。
- 不需要走网络，连接速度更快、更安全。
- 可以使用本地用户凭据自动认证（如 `EXTERNAL` 机制）。
- 通常只允许 `root` 或 `ldap` 用户访问 socket 文件。
- 

示例（使用 EXTERNAL 本地认证）

```shell
ldapsearch -H ldapi:/// -Y EXTERNAL -b cn=config
```



### 附加说明 `ldaps://`

如果希望使用 **加密的 TCP 连接**，可以使用如下方式，这是使用 SSL 加密的 LDAP 连接，默认端口是 `636`

```shell
-H ldaps://localhost
```





## 组管理

### 创建组

#### 创建单个组

```shell
cat > add-group.ldif <<EOF
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1000
EOF
```

字段说明

| 字段                      | 含义                                        |
| ------------------------- | ------------------------------------------- |
| `dn:`                     | 条目的完整识别名（Distinguished Name）      |
| `cn: java`                | Common Name，是组的名称                     |
| `gidnumber: 1000`         | 这个组的 Linux GID（组 ID），应在系统中唯一 |
| `objectclass: posixGroup` | 说明这是一个 POSIX 兼容的组                 |
| `objectclass: top`        | 所有条目的基类，必须有                      |



执行命令

:::tip 说明

可以使用 `-W` 选项采用命令行交互式输入密码，更安全

:::

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-group.ldif
```

输出

```shell
adding new entry "cn=java,dc=ops,dc=com"
```



导入后查询

::tip 说明

`"(cn=java)"` 表示查询过滤器（查找 cn=java 的条目），不写默认查找所有

`-b "cn=java,dc=ops,dc=com"` 如果写成这样则表示精确查找

:::

```c
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(cn=java)"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (cn=java)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1000

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



在phpldapadmin中查看创建的组

![iShot_2025-06-24_19.18.26](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-24_19.18.26.png)



#### 创建多个组

```shell
cat > add-multiple-groups.ldif <<EOF
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1001

dn: cn=php,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: php
gidNumber: 1002

dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1003
EOF
```



执行命令

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-multiple-groups.ldif
```

输出

```shell
adding new entry "cn=java,dc=ops,dc=com"

adding new entry "cn=php,dc=ops,dc=com"

adding new entry "cn=go,dc=ops,dc=com"
```



创建后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(objectClass=posixGroup)"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectClass=posixGroup)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 1001

# php, ops.com
dn: cn=php,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: php
gidNumber: 1002

# go, ops.com
dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1003

# search result
search: 2
result: 0 Success

# numResponses: 4
# numEntries: 3
```





### 查询组

#### 查询整个目录下所有条目

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(objectClass=*)"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectClass=*)
# requesting: ALL
#

# ops.com
dn: dc=ops,dc=com
o: ldap
objectClass: dcObject
objectClass: organization
dc: ops

# devops, ops.com
dn: ou=devops,dc=ops,dc=com
objectClass: organizationalUnit
ou: devops

# admin, devops, ops.com
dn: uid=admin,ou=devops,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
uid: admin
cn: Administrator
sn: Admin
userPassword:: e1NTSEF9R2cyZitOdXlCc2RuVlhob2VBa3VQK3JDU0gyMzI1aUI=

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# go, ops.com
dn: cn=go,dc=ops,dc=com
cn: go
gidNumber: 500
objectClass: posixGroup
objectClass: top

# php, ops.com
dn: cn=php,dc=ops,dc=com
cn: php
gidNumber: 501
objectClass: posixGroup
objectClass: top

# search result
search: 2
result: 0 Success

# numResponses: 7
# numEntries: 6
```



#### 查询指定类型的组

查询 `posixGroup` 组

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(objectClass=posixGroup)"
```



输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (objectClass=posixGroup)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# go, ops.com
dn: cn=go,dc=ops,dc=com
cn: go
gidNumber: 500
objectClass: posixGroup
objectClass: top

# php, ops.com
dn: cn=php,dc=ops,dc=com
cn: php
gidNumber: 501
objectClass: posixGroup
objectClass: top

# search result
search: 2
result: 0 Success

# numResponses: 4
# numEntries: 3
```



##### 查询指定类型组下的特定组

:::tip 说明

查询对象类是 `posixGroup` 并且组名（cn）是 go 的组

:::

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(&(objectClass=posixGroup)(cn=go))"
```



#### 查询单个 `cn` 条目

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "cn=java,dc=ops,dc=com"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <cn=java,dc=ops,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```





#### 查询多个 `cn` 条目

这里指定cn `java` 和 `go`

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(| (cn=java)(cn=go) )"
```



输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (| (cn=java)(cn=go) )
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# go, ops.com
dn: cn=go,dc=ops,dc=com
cn: go
gidNumber: 500
objectClass: posixGroup
objectClass: top

# search result
search: 2
result: 0 Success

# numResponses: 3
# numEntries: 2
```



### 修改组

#### 修改属性值

##### 修改单个属性值

修改属性  `gidNumber`

```shell
cat > modify-group-attribute.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: modify
replace: gidNumber
gidNumber: 2000
EOF
```



执行命令

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f modify-group-attribute.ldif
```

输出

```shell
modifying entry "cn=java,dc=ops,dc=com"
```



修改完成后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(cn=java)"
```

输出

可以看到 `gidNumber` 已经修改

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (cn=java)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 修改多个属性值

```shell
cat > modify-group-multiple-attributes.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: modify
replace: description
description: Java 项目研发组
-
replace: gidNumber
gidNumber: 2005
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f modify-group-multiple-attributes.ldif
```

输出

```shell
modifying entry "cn=java,dc=ops,dc=com"
```



修改完成后查看

:::tip 说明

可以看到，属性 `description` 、`gidNumber` 的值已经修改完成

```shell
$ echo SmF2YSDpobnnm67noJTlj5Hnu4Q=|base64 -d
Java 项目研发组
```

:::

```shell
# extended LDIF
#
# LDAPv3
# base <cn=java,dc=ops,dc=com> with scope subtree
# filter: (objectClass=posixGroup)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
description:: SmF2YSDpobnnm67noJTlj5Hnu4Q=
gidNumber: 2005

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```





#### 增加属性

##### 增加单个属性

增加属性  `description` 

```shell
cat > add-group-attribute.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: modify
add: description
description: java开发组
EOF
```



执行命令

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-group-attribute.ldif
```

输出

```shell
modifying entry "cn=java,dc=ops,dc=com"
```



增加后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(cn=java)"
```

输出

:::tip 说明

这里输出的 `description` 因为 **含有非 ASCII 字符（中文）**，LDIF 格式会自动把它编码成 Base64，解码之后内容如下

```shell
$ echo amF2YeW8gOWPkee7hA==|base64 -d
java开发组
```

注意这里的 `description::` 是 **两个冒号（::）**，代表这个属性的值是 **Base64 编码的**，**一个冒号（:）** 是普通值

:::

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (cn=java)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000
description:: amF2YeW8gOWPkee7hA==

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 增加多个属性

```shell
cat > add-group-multiple-attribute.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: modify
add: description
description: java 项目开发组
-
add: memberUid
memberUid: xiaoming
memberUid: zhangsan
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-group-multiple-attribute.ldif
```

输出

```shell
modifying entry "cn=java,dc=ops,dc=com"
```



增加完成后查看

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "cn=java,dc=ops,dc=com" \
  "(objectClass=posixGroup)"
```

输出

:::tip 说明

可以看到新增了 `description` 、`memberUid` 2个属性

```shell
$ echo amF2YSDpobnnm67lvIDlj5Hnu4Q=|base64 -d
java 项目开发组
```

:::

```shell
# extended LDIF
#
# LDAPv3
# base <cn=java,dc=ops,dc=com> with scope subtree
# filter: (objectClass=posixGroup)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2005
description:: amF2YSDpobnnm67lvIDlj5Hnu4Q=
memberUid: xiaoming
memberUid: zhangsan

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



#### 增加组成员

##### 增加单个成员

:::tip 说明

用户 `xiaoming` 已经归属于主组 `java` ，现在要加入到附加组 `go`

:::

```shell
cat > add-user-to-group.ldif << EOF
dn: cn=go,dc=ops,dc=com
changetype: modify
add: memberUid
memberUid: xiaoming
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-user-to-group.ldif
```

输出

```shell
modifying entry "cn=go,dc=ops,dc=com"
```



增加完成后查看

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "cn=go,dc=ops,dc=com" \
  "(objectClass=posixGroup)"
```

输出

:::tip 说明

`memberUid: xiaoming` 表示附加组成员列表中有一个用户：`xiaoming`

:::

```shell
# extended LDIF
#
# LDAPv3
# base <cn=go,dc=ops,dc=com> with scope subtree
# filter: (objectClass=posixGroup)
# requesting: ALL
#

# go, ops.com
dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1003
memberUid: xiaoming

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



查询 `xiaoming` 这个用户对应的附加组

查询附加组

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" "(&(objectClass=posixGroup)(memberUid=xiaoming))" cn
```

输出

:::tip 说明

可以看到 `xiaoming` 用户目前的附加组是 `go`

:::

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (&(objectClass=posixGroup)(memberUid=xiaoming))
# requesting: cn 
#

# go, ops.com
dn: cn=go,dc=ops,dc=com
cn: go

# search result
search: 2
result: 0 Success

# numResponses: 2
```



查看

:::tip 说明

查看某个组（附加组）中有哪些成员，可以查询这个组条目中的 `memberUid` 属性

:::

```shell
ldapsearch -x -D "cn=admin,dc=ops,dc=com" -w admin \
  -H ldap://localhost \
  -b "cn=go,dc=ops,dc=com" \
  -s base memberUid
```



##### 增加多个成员

:::tip 说明

增加多个成员时，`memberUid` 可以写多行，每行一个成员

:::

```shell
cat > add-users-to-group.ldif << EOF
dn: cn=go,dc=ops,dc=com
changetype: modify
add: memberUid
memberUid: xiaoqiang
memberUid: xiaoyu
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-users-to-group.ldif
```

输出

```sh
modifying entry "cn=go,dc=ops,dc=com"
```





增加完成后查看

:::tip 说明

查看某个组（附加组）中有哪些成员，可以查询这个组条目中的 `memberUid` 属性

:::

```shell
ldapsearch -x -D "cn=admin,dc=ops,dc=com" -w admin \
  -H ldap://localhost \
  -b "cn=go,dc=ops,dc=com" \
  -s base memberUid
```



输出

```shell
# extended LDIF
#
# LDAPv3
# base <cn=go,dc=ops,dc=com> with scope baseObject
# filter: (objectclass=*)
# requesting: memberUid 
#

# go, ops.com
dn: cn=go,dc=ops,dc=com
memberUid: xiaoming
memberUid: xiaoqiang
memberUid: xiaoyu

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



#### 删除属性

##### 删除单个属性

删除属性 `description`

```sh
cat > delete-group-attribute.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: modify
delete: description
EOF
```



执行命令

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f delete-group-attribute.ldif
```

输出

```sh
modifying entry "cn=java,dc=ops,dc=com"
```



删除完成后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(cn=java)"
```

输出，可以看到 `description` 属性已经被删除了

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (cn=java)
# requesting: ALL
#

# java, ops.com
dn: cn=java,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: java
gidNumber: 2000

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 删除多个属性

```shell
cat > delete-group-multiple-attribute.ldif <<EOF
dn: cn=go,dc=ops,dc=com
changetype: modify
delete: description
-
delete: memberUid
-
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f delete-group-multiple-attribute.ldif
```

输出

```shell
modifying entry "cn=go,dc=ops,dc=com"
```



删除完成后查看

```
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(&(objectClass=posixGroup)(cn=go))"
```

输出

可以看到 `description` 、`memberUid` 属性已经删除

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (&(objectClass=posixGroup)(cn=go))
# requesting: ALL
#

# go, ops.com
dn: cn=go,dc=ops,dc=com
objectClass: top
objectClass: posixGroup
cn: go
gidNumber: 1003

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



### 删除组

#### 删除单个组

:::tip 说明

删除组命令执行完成后没有输出

:::

```shell
ldapdelete -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  "cn=php,dc=ops,dc=com"
```





#### 删除多个组

这里指定删除 `java` 和 `go` 2个组

```shell
cat > delete-multiple-groups.ldif <<EOF
dn: cn=java,dc=ops,dc=com
changetype: delete

dn: cn=go,dc=ops,dc=com
changetype: delete
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f delete-multiple-group.ldif
```

输出

```shell
deleting entry "cn=java,dc=ops,dc=com"

deleting entry "cn=go,dc=ops,dc=com"
```





## 用户管理

### 创建用户

#### 创建单个用户

```shell
cat > add-user.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
mail: xiaoming@163.com
userPassword: {SSHA}JMtRsF+XoBYZXBtHbRV4ugI6+H8lcVIj
EOF
```



字段说明

| 字段                         | 说明                                                         | 例子中的值                           |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `dn`                         | `Distinguished Name`：该用户在 LDAP 中的唯一标识路径，必须唯一，类似于主键。格式是 `uid=xxx,<base DN>`。 | `uid=xiaoming,cn=java,dc=ops,dc=com` |
| `objectClass: inetOrgPerson` | 表示该条目是一个互联网组织用户，支持 `cn`、`sn`、`mail` 等属性（推荐）。 | 必选                                 |
| `objectClass: posixAccount`  | 表示该用户可以作为 Linux 系统账号使用，支持 `uidNumber`、`gidNumber`、`homeDirectory` 等字段。 | 必选                                 |
| `objectClass: top`           | 所有条目的顶层类，必须包含。                                 | 必选                                 |
| `cn`                         | `Common Name`：用户的显示名，通常是完整的人名，在界面中会展示这个。 | `xiaoming`                           |
| `sn`                         | `Surname`：姓氏。即使和 `cn` 一样，也必须存在。              | `xiaoming`                           |
| `uid`                        | 用户名：必须唯一，是系统或登录名。例如：Linux 登录用户、LDAP 登录用户。 | `xiaoming`                           |
| `uidNumber`                  | 用户的唯一 ID（在系统中对应 `/etc/passwd` 中的 UID），必须是数字且唯一。 | `2002`                               |
| `gidNumber`                  | 所属主组的 GID（对应某个组的 `gidNumber`），用于指定这个用户归属哪个组。 | `1001`（比如 java 组）               |
| `homeDirectory`              | 用户的家目录路径，一般格式为 `/home/用户名`。                | `/home/alice`                        |
| `loginShell`                 | 用户登录系统时默认的 shell，比如 `/bin/bash`。               | `/bin/bash`                          |
| `mail`                       | 用户邮箱（可选但常用），界面展示、邮件通知会使用。           | `alice@example.com`                  |
| `userPassword`               | 用户密码（哈希后的密文，不能明文），建议使用 `slappasswd` 工具生成。 | `{SSHA}...`（加密后的 `123456`）     |



执行命令

```sh
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-user.ldif
```

输出

```shell
adding new entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



增加后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)"
```

输出

```shell
# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
mail: xiaoming@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



在 `phpldapadmin` 中查看，可以看到 `xiaoming` 用户已经创建在了 `java` 组下

![iShot_2025-06-25_16.52.14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-25_16.52.14.png)





#### 创建多个用户

:::tip 说明

这里在创建用户的时候指定加入到了 `java` 组

:::

```shell
cat > add-multiple-users.ldif <<EOF
dn: uid=xiaoyu,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoyu
sn: xiaoyu
uid: xiaoyu
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoyu
loginShell: /bin/bash
mail: xiaoyu@163.com
userPassword: {SSHA}JMtRsF+XoBYZXBtHbRV4ugI6+H8lcVIj

dn: uid=xiaoqiang,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoqiang
sn: xiaoqiang
uid: xiaoqiang
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoqiang
loginShell: /bin/bash
mail: xiaoqiang@163.com
userPassword: {SSHA}JMtRsF+XoBYZXBtHbRV4ugI6+H8lcVIj
EOF
```



执行命令

```shell
ldapadd -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-multiple-users.ldif
```

输出

```sh
adding new entry "uid=xiaoyu,cn=java,dc=ops,dc=com"

adding new entry "uid=xiaoqiang,cn=java,dc=ops,dc=com"
```



增加后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  '(|(uid=xiaoqiang)(uid=xiaoyu))'
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (|(uid=xiaoqiang)(uid=xiaoyu))
# requesting: ALL
#

# xiaoyu, java, ops.com
dn: uid=xiaoyu,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoyu
sn: xiaoyu
uid: xiaoyu
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoyu
loginShell: /bin/bash
mail: xiaoyu@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# xiaoqiang, java, ops.com
dn: uid=xiaoqiang,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoqiang
sn: xiaoqiang
uid: xiaoqiang
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoqiang
loginShell: /bin/bash
mail: xiaoqiang@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# search result
search: 2
result: 0 Success

# numResponses: 3
# numEntries: 2
```



### 查询用户

#### 查询单个用户

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)"
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: ALL
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
mail: xiaoming@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



#### 查询多个用户

```sh
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  '(|(uid=xiaoqiang)(uid=xiaoyu))'
```

输出

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (|(uid=xiaoqiang)(uid=xiaoyu))
# requesting: ALL
#

# xiaoyu, java, ops.com
dn: uid=xiaoyu,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoyu
sn: xiaoyu
uid: xiaoyu
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoyu
loginShell: /bin/bash
mail: xiaoyu@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# xiaoqiang, java, ops.com
dn: uid=xiaoqiang,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoqiang
sn: xiaoqiang
uid: xiaoqiang
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoqiang
loginShell: /bin/bash
mail: xiaoqiang@163.com
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=

# search result
search: 2
result: 0 Success

# numResponses: 3
# numEntries: 2
```





### 修改用户

#### 修改属性值

##### 修改单个属性值

修改属性值 `mail`

```shell
cat > modify-user-attribute.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
replace: mail
mail: xiaoming@qq.com
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f modify-user-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



修改完成后查询

:::tip 说明

如果不加最后的 `mail` 属性，则查询全部属性

:::

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)" \
  mail
```

输出

:::tip 说明

可以看到，原先的mail已经由 `xiaoming@163.com` 变成了 `xiaoming@qq.com` 

:::

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: mail 
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
mail: xiaoming@qq.com

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 修改多个属性值

```shell
cat > modify-user-multiple-attributes.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
replace: mail
mail: xiaoming@newdomain.com
-
replace: title
title: Lead Developer
-
replace: description
description: java开发组负责人
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f modify-user-multiple-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



修改完成后查看

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)"
```

输出

:::tip 说明

可以看到，属性 `mail` 、`title`  、`description` 已经修改

```shell
$ echo amF2YeW8gOWPkee7hOi0n+i0o+S6ug==|base64 -d
java开发组负责人
```

:::

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: ALL
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=
telephoneNumber: 123456789
mail: xiaoming@newdomain.com
title: Lead Developer
description:: amF2YeW8gOWPkee7hOi0n+i0o+S6ug==

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



#### 增加属性

##### 增加单个属性

增加属性 `telephoneNumber`

```shell
cat > add-user-attribute.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
add: telephoneNumber
telephoneNumber: 8888888
EOF
```



执行命令

```sh
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-user-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```





修改完成后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)" \
  telephoneNumber 
```

输出

可以看到已经新增了属性 `telephoneNumber`

```sh
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: telephoneNumber 
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
telephoneNumber: 8888888

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 增加多个属性

```shell
cat > add-multiple-users-attributes.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
add: telephoneNumber
telephoneNumber: 123456789
-
add: description
description: java 开发工程师
-
add: title
title: Senior Developer
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f add-multiple-users-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



增加完成后查看

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)"
```

输出

:::tip 说明

可以看到，新增了3个属性 `telephoneNumber` 、`description` 、`title`

其中 `description` 的值是经过了base64编码，因为有中文

:::

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: ALL
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=
mail: xiaoming@qq.com
telephoneNumber: 123456789
description:: amF2YSDlvIDlj5Hlt6XnqIvluIg=
title: Senior Developer

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```





#### 删除属性

##### 删除单个属性

删除属性 `telephoneNumber`

```shell
cat > del-user-attribute.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
delete: telephoneNumber
EOF
```



执行命令

```sh
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f del-user-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



删除完成后查询

```shell
ldapsearch -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -b "dc=ops,dc=com" \
  "(uid=xiaoming)"
```

输出

可以看到，属性 `telephoneNumber` 已经被删除

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: ALL
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=
mail: xiaoming@qq.com

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



##### 删除多个属性

```shell
cat > del-user-multiple-attributes.ldif <<EOF
dn: uid=xiaoming,cn=java,dc=ops,dc=com
changetype: modify
delete: telephoneNumber
-
delete: description
-
delete: title
EOF
```



执行命令

```shell
ldapmodify -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  -f del-user-multiple-attribute.ldif
```

输出

```shell
modifying entry "uid=xiaoming,cn=java,dc=ops,dc=com"
```



删除完成后查看

可以看到，属性 `telephoneNumber` 、`description` 、`title` 已经被删除成功

```shell
# extended LDIF
#
# LDAPv3
# base <dc=ops,dc=com> with scope subtree
# filter: (uid=xiaoming)
# requesting: ALL
#

# xiaoming, java, ops.com
dn: uid=xiaoming,cn=java,dc=ops,dc=com
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: xiaoming
sn: xiaoming
uid: xiaoming
uidNumber: 2004
gidNumber: 1001
homeDirectory: /home/xiaoming
loginShell: /bin/bash
userPassword:: e1NTSEF9Sk10UnNGK1hvQllaWEJ0SGJSVjR1Z0k2K0g4bGNWSWo=
mail: xiaoming@qq.com

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```



### 删除用户

#### 删除单个用户

:::tip 说明

删除用户命令执行后没有输出

:::

```shell
ldapdelete -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  "uid=xiaoming,cn=java,dc=ops,dc=com"
```





#### 删除多个用户

:::tip 说明

删除用户命令执行后没有输出

:::

```shell
ldapdelete -x \
  -D "cn=admin,dc=ops,dc=com" \
  -w admin \
  -H ldap://localhost \
  "uid=xiaoyu,cn=java,dc=ops,dc=com" \
  "uid=xiaoqiang,cn=java,dc=ops,dc=com"
```





## 操作总结

增加属性值

```shell
dn: dn名称，例如cn=java,dc=ops,dc=com
changetype: modify
add: 要增加的属性名称，例如description
要增加的属性名称: 属性值
```



修改属性值

```shell
dn: dn名称，例如cn=java,dc=ops,dc=com
changetype: modify
replace: 要修改的属性名称，例如gidNumber
要修改的属性名称: 属性值
```



删除属性

```shell
dn: dn名称，例如cn=java,dc=ops,dc=com
changetype: modify
delete: 要删除的属性名称，例如description
```

