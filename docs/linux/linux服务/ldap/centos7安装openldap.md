[toc]



# centos7安装openldap

[openldap官网](https://www.openldap.org/)

[openldap github地址](https://github.com/openldap/openldap)

[openldap官方下载地址](https://www.openldap.org/software/download/)



**ldap相关术语**

`Entry (or object) 条目(或对象)`：LDAP中的每个单元都认为是条目

`dn`：条目名称

`ou`：组织名称

`dc`：域组件，例如，`baidu.com` 是这样写的 `dc=baidu,dc=com`

`cn`：通用名称，如原文链接：https://www.baidu.com 名或某个对象的名字



## 安装openldap

### 系统环境

系统版本

```shell
$ cat /etc/redhat-release 
CentOS Linux release 7.9.2009 (Core)
```



内核版本

```shell
$ uname -a
Linux pptfz 3.10.0-1160.119.1.el7.x86_64 #1 SMP Tue Jun 4 14:43:51 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
```



### 安装包

```sh
yum -y install openldap openldap-clients openldap-servers
```



### 查看版本

```sh
$ slapd -V
@(#) $OpenLDAP: slapd 2.4.44 (Feb 23 2022 17:11:27) $
	mockbuild@x86-01.bsys.centos.org:/builddir/build/BUILD/openldap-2.4.44/openldap-2.4.44/servers/slapd
```



## 启动ldap

### 修改目录权限

:::tip 说明

`/var/lib/ldap/` 目录以及目录下的所有文件所有者默认为 `root` ，需要设置为ldap用户所有

```shell
$ ll /var/lib/ldap/
total 372
-rw-r--r-- 1 root root     2048 Jun  6 13:21 alock
-rw------- 1 root root   303104 Jun  6 13:21 __db.001
-rw------- 1 root root    40960 Jun  6 13:21 __db.002
-rw------- 1 root root    49152 Jun  6 13:21 __db.003
-rw------- 1 root root     8192 Jun  6 13:21 dn2id.bdb
-rw------- 1 root root    32768 Jun  6 13:21 id2entry.bdb
-rw------- 1 root root 10485760 Jun  6 13:21 log.0000000001
```



否则在启动ldap服务的时候会报错如下

```
Jun 06 14:20:13 pptfz runuser[11314]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:20:13 pptfz runuser[11314]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:20:13 pptfz check-config.sh[11293]: Read/write permissions for DB file '/var/lib/ldap/__db.003' are required.
Jun 06 14:20:13 pptfz runuser[11316]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:20:13 pptfz runuser[11316]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:20:13 pptfz check-config.sh[11293]: Read/write permissions for DB file '/var/lib/ldap/__db.002' are required.
Jun 06 14:20:13 pptfz runuser[11318]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:20:13 pptfz runuser[11318]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:20:13 pptfz check-config.sh[11293]: Read/write permissions for DB file '/var/lib/ldap/__db.001' are required.
Jun 06 14:20:13 pptfz runuser[11320]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:20:13 pptfz runuser[11320]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:20:13 pptfz check-config.sh[11293]: Read/write permissions for DB file '/var/lib/ldap/dn2id.bdb' are required.
Jun 06 14:20:13 pptfz systemd[1]: slapd.service: control process exited, code=exited status=1
Jun 06 14:20:13 pptfz systemd[1]: Failed to start OpenLDAP Server Daemon.
```

:::

```shell
chown -R ldap.ldap /var/lib/ldap/
```



### 启动并设置开机自启

```shell
systemctl enable slapd && systemctl start slapd
```



### 查看端口

:::tip 说明

ldap默认监听 tcp 389端口

:::

```shell
$ netstat -ntpl|grep slapd
tcp        0      0 0.0.0.0:389             0.0.0.0:*               LISTEN      16930/slapd         
tcp6       0      0 :::389                  :::*                    LISTEN      16930/slapd         
```



### 查看进程

:::tip 说明

ldap默认以ldap用户启动

:::

```shell
$ ps aux|grep slapd
ldap     16930  0.0  0.3 139712 12488 ?        Ssl  14:38   0:00 /usr/sbin/slapd -u ldap -h ldapi:/// ldap:///
```



### 查看启动

```shell
$ systemctl status slapd
● slapd.service - OpenLDAP Server Daemon
   Loaded: loaded (/usr/lib/systemd/system/slapd.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2025-06-06 14:38:17 CST; 8min ago
     Docs: man:slapd
           man:slapd-config
           man:slapd-hdb
           man:slapd-mdb
           file:///usr/share/doc/openldap-servers/guide.html
 Main PID: 16930 (slapd)
   CGroup: /system.slice/slapd.service
           └─16930 /usr/sbin/slapd -u ldap -h ldapi:/// ldap:///

Jun 06 14:38:17 pptfz runuser[16919]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:38:17 pptfz runuser[16919]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:38:17 pptfz runuser[16921]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:38:17 pptfz runuser[16921]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:38:17 pptfz runuser[16923]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 06 14:38:17 pptfz runuser[16923]: pam_unix(runuser:session): session closed for user ldap
Jun 06 14:38:17 pptfz slapd[16927]: @(#) $OpenLDAP: slapd 2.4.44 (Feb 23 2022 17:11:27) $
                                            mockbuild@x86-01.bsys.centos.org:/builddir/build/BUILD/openldap-2.4.44/openldap-2.4.44/servers/slapd
Jun 06 14:38:17 pptfz slapd[16930]: hdb_db_open: warning - no DB_CONFIG file found in directory /var/lib/ldap: (2).
                                    Expect poor performance for suffix "dc=my-domain,dc=com".
Jun 06 14:38:17 pptfz slapd[16930]: slapd starting
Jun 06 14:38:17 pptfz systemd[1]: Started OpenLDAP Server Daemon.
```







## 配置openldap

### 设置管理员密码

这里我们设置管理员密码为 `admin` ，执行命令后会生成一堆加密后的字符，记录好，之后配置文件里会需要的

```sh
$ slappasswd -s admin
{SSHA}uUFY4EJIccmbnIZBPMiq06QK4HG9vO/a
```



### 修改相关配置文件

#### 修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif`

`/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif` 文件默认内容如下

```shell
# AUTO-GENERATED FILE - DO NOT EDIT!! Use ldapmodify.
# CRC32 2d0f9516
dn: olcDatabase={2}hdb
objectClass: olcDatabaseConfig
objectClass: olcHdbConfig
olcDatabase: {2}hdb
olcDbDirectory: /var/lib/ldap
olcSuffix: dc=my-domain,dc=com
olcRootDN: cn=Manager,dc=my-domain,dc=com
olcDbIndex: objectClass eq,pres
olcDbIndex: ou,cn,mail,surname,givenname eq,pres,sub
structuralObjectClass: olcHdbConfig
entryUUID: aac2ae46-d6e1-103f-960a-2797f63ca3bd
creatorsName: cn=config
createTimestamp: 20250606052012Z
entryCSN: 20250606052012.864229Z#000000#000#000000
modifiersName: cn=config
```



需要修改的是 `olcSuffix` 、`olcRootDN` 这2个字段

```sh
修改如下两行
	olcSuffix: dc=my-domain,dc=com
  olcRootDN: cn=Manager,dc=my-domain,dc=com

修改为
	olcSuffix: dc=ops,dc=com
	olcRootDN: cn=admin,dc=ops,dc=com	
```



还需要新增一行配置，是在执行 `slappasswd -s admin` 后生成的字符串

```shell
olcRootPW: {SSHA}uUFY4EJIccmbnIZBPMiq06QK4HG9vO/a
```



:::caution 注意

修改ldap的相关文件不要使用命令手动编辑，在开头也会有 `# AUTO-GENERATED FILE - DO NOT EDIT!! Use ldapmodify.` 的相关提示，正确的方式是先创建 `*ldif` 文件，然后使用 `ldapmodify` 命令进行修改

:::



创建 `modify-olcDatabase={2}hdb.ldif` 文件，用来修改 `/etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif` 文件中的  `olcSuffix` 、`olcRootDN` 字段

```shell
cat >> modify-olcDatabase={2}hdb.ldif << EOF
dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcSuffix
olcSuffix: dc=ops,dc=com
-
replace: olcRootDN
olcRootDN: cn=admin,dc=ops,dc=com
EOF
```



创建 `add-rootpw.ldif` 文件，用来新增  `/etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif`  文件中的 `olcRootPW` 字段

:::caution 注意

如果该字段已经存在，请将 `add:` 改为 `replace:`，否则会报错 `type or value exists`

:::

```shell
cat >> add-rootpw.ldif << EOF
dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcRootPW
olcRootPW: {SSHA}uUFY4EJIccmbnIZBPMiq06QK4HG9vO/a
EOF
```



执行修改命令，修改 `/etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif` 文件中的  `olcSuffix` 、`olcRootDN` 字段

```shell
$ ldapmodify -Y EXTERNAL -H ldapi:/// -f modify-olcDatabase\=\{2\}hdb.ldif 
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={2}hdb,cn=config"
```



执行修改命令，新增 `/etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif` 文件中的  `olcRootPW` 字段

```shell
$ ldapmodify -Y EXTERNAL -H ldapi:/// -f add-rootpw.ldif
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={2}hdb,cn=config"
```



修改完成后查看 `/etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif` 文件，可以看到   `olcSuffix` 、`olcRootDN`  2个字段的内容已经修改完成，并且增加了 `olcRootPW` 字段

```shell
$ cat /etc/openldap/slapd.d/cn\=config/olcDatabase={2}hdb.ldif    
# AUTO-GENERATED FILE - DO NOT EDIT!! Use ldapmodify.
# CRC32 ed206214
dn: olcDatabase={2}hdb
objectClass: olcDatabaseConfig
objectClass: olcHdbConfig
olcDatabase: {2}hdb
olcDbDirectory: /var/lib/ldap
olcDbIndex: objectClass eq,pres
olcDbIndex: ou,cn,mail,surname,givenname eq,pres,sub
structuralObjectClass: olcHdbConfig
entryUUID: aac2ae46-d6e1-103f-960a-2797f63ca3bd
creatorsName: cn=config
createTimestamp: 20250606052012Z
olcSuffix: dc=ops,dc=com
olcRootDN: cn=admin,dc=ops,dc=com
olcRootPW:: e1NTSEF9dVVGWTRFSkljY21ibklaQlBNaXEwNlFLNEhHOXZPL2E=
entryCSN: 20250606074044.181696Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250606074044Z
```



#### 修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif` 

```sh
修改如下两行
	olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth" read by dn.base="cn=Manager,dc=my-domain,dc=com" read by * none
 
修改为
	olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth" read by dn.base="cn=admin,dc=pptfz,dc=com" read by * none
```



创建 `modify-olcDatabase={1}monitor.ldif` 文件，用来修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif` 中的 `olcAccess` 字段

```shell
cat >> modify-olcDatabase={1}monitor.ldif << EOF
dn: olcDatabase={1}monitor,cn=config
changetype: modify
replace: olcAccess
olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" read by dn.base="cn=admin,dc=ops,dc=com" read by * none
EOF
```

 

执行修改命令，用来修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif` 中的 `olcAccess` 字段

```shell
$ ldapmodify -Y EXTERNAL -H ldapi:/// -f modify-olcDatabase={1}monitor.ldif
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={1}monitor,cn=config"
```



修改完成后查看 `/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif` 文件，可以看到 `olcAccess` 字段已经修改完成

```shell
$ cat /etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif
# AUTO-GENERATED FILE - DO NOT EDIT!! Use ldapmodify.
# CRC32 1b0d56c2
dn: olcDatabase={1}monitor
objectClass: olcDatabaseConfig
olcDatabase: {1}monitor
structuralObjectClass: olcDatabaseConfig
entryUUID: aac2aad6-d6e1-103f-9609-2797f63ca3bd
creatorsName: cn=config
createTimestamp: 20250606052012Z
olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth" read by dn.base="cn=admin,dc=ops,dc=com" read by * none
entryCSN: 20250606084306.464998Z#000000#000#000000
modifiersName: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
modifyTimestamp: 20250606084306Z
```



### 验证配置文件

:::tip 说明

如果没有通过 `xx` 命令修改文件，而是以vim的方式手动编辑，则会有如下警告

```shell
$ slaptest -u
6087d0e7 ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif"
6087d0e7 ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif"
config file testing succeeded
```

:::

```shell
$ slaptest -u
config file testing succeeded
```





### 配置openldap数据库

拷贝文件，修改权限

:::tip 说明

`/usr/share/openldap-servers/DB_CONFIG.example` 文件默认内容如下

```shell
# $OpenLDAP$
# Example DB_CONFIG file for use with slapd(8) BDB/HDB databases.
#
# See the Oracle Berkeley DB documentation
#   <http://www.oracle.com/technology/documentation/berkeley-db/db/ref/env/db_config.html>
# for detail description of DB_CONFIG syntax and semantics.
#
# Hints can also be found in the OpenLDAP Software FAQ
#	<http://www.openldap.org/faq/index.cgi?file=2>
# in particular:
#   <http://www.openldap.org/faq/index.cgi?file=1075>

# Note: most DB_CONFIG settings will take effect only upon rebuilding
# the DB environment.

# one 0.25 GB cache
set_cachesize 0 268435456 1

# Data Directory
#set_data_dir db

# Transaction Log settings
set_lg_regionmax 262144
set_lg_bsize 2097152
#set_lg_dir logs

# Note: special DB_CONFIG flags are no longer needed for "quick"
# slapadd(8) or slapindex(8) access (see their -q option). 
```

:::

```shell
cp /usr/share/openldap-servers/DB_CONFIG.example /var/lib/ldap/DB_CONFIG && chown ldap.ldap /var/lib/ldap/DB_CONFIG && chmod 600 /var/lib/ldap/DB_CONFIG
```



查看

```shell
$ ll /var/lib/ldap/
total 376
-rw-r--r-- 1 ldap ldap     2048 Jun  6 14:38 alock
-rw------- 1 ldap ldap   303104 Jun  6 14:38 __db.001
-rw------- 1 ldap ldap    40960 Jun  6 14:38 __db.002
-rw------- 1 ldap ldap    49152 Jun  6 14:38 __db.003
-rw------- 1 ldap ldap      845 Jun  6 16:48 DB_CONFIG
-rw------- 1 ldap ldap     8192 Jun  6 13:21 dn2id.bdb
-rw------- 1 ldap ldap    32768 Jun  6 13:21 id2entry.bdb
-rw------- 1 ldap ldap 10485760 Jun  6 14:19 log.0000000001
```



### 导入基本Schema



#### `schema` 文件路径

```shell
$ ls /etc/openldap/schema/*.ldif
/etc/openldap/schema/collective.ldif  /etc/openldap/schema/duaconf.ldif        /etc/openldap/schema/misc.ldif      /etc/openldap/schema/ppolicy.ldif
/etc/openldap/schema/corba.ldif       /etc/openldap/schema/dyngroup.ldif       /etc/openldap/schema/nis.ldif
/etc/openldap/schema/core.ldif        /etc/openldap/schema/inetorgperson.ldif  /etc/openldap/schema/openldap.ldif
/etc/openldap/schema/cosine.ldif      /etc/openldap/schema/java.ldif           /etc/openldap/schema/pmi.ldif
```



#### `schema` 作用说明

| 文件名               | 作用说明                                                     |
| -------------------- | ------------------------------------------------------------ |
| `core.ldif`          | 必需基础 schema，定义了最基本的 objectClass（如 `top`、`organization` 等） |
| `cosine.ldif`        | 提供用户和联系人类（如 `person`, `organizationalPerson`），常用于电子邮件目录 |
| `inetorgperson.ldif` | 扩展 `organizationalPerson`，添加了更多用于实际组织的用户信息（比如 `mail`, `uid`），大多数 LDAP 项目都需要 |
| `nis.ldif`           | 提供 NIS（旧式 UNIX 账号）支持，定义了 `posixAccount`, `shadowAccount` 等，适用于用 LDAP 做 Unix/Linux 账号认证的情况 |
| `ppolicy.ldif`       | 提供密码策略支持，比如设置密码过期时间、失败次数、锁定等     |
| `dyngroup.ldif`      | 支持动态组（Group membership 是自动根据查询规则生成的）      |
| `duaconf.ldif`       | DUACONF = Directory User Applications Configuration Schema，支持一些额外管理特性 |
| `collective.ldif`    | 支持 **集体属性（Collective attributes）**，用于在多个条目中共享属性 |
| `corba.ldif`         | 支持 CORBA 对象目录结构（现在很少用了）                      |
| `java.ldif`          | 定义了与 Java 对象相关的 schema，用于 Java Directory API     |
| `misc.ldif`          | 杂项 schema，包含一些额外 objectClass，比如 Samba 支持可能用到 |
| `pmi.ldif`           | Policy Management Infrastructure，极少使用，主要用于访问控制和策略管理 |
| `openldap.ldif`      | OpenLDAP 本身扩展定义，用于某些内部功能（如 monitor、config） |



#### 导入 `schema`

```shell
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/cosine.ldif
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/inetorgperson.ldif
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/nis.ldif
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/ppolicy.ldif
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/openldap.ldif
ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/collective.ldif
```



导入完基本的 `schema` 安装就结束了



#### 导入 `schema` 的结果说明

##### 正确导入

:::tip 说明

导入后提示如下则为导入正确

:::

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/cosine.ldif
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=cosine,cn=schema,cn=config"
```



##### 重复导入

:::tip 说明

`ldap_add: Other (e.g., implementation specific) error (80)` 表示操作不允许，通常是因为条目已经存在或冲突

`Duplicate attributeType: "2.5.4.2"` 同一个 `attributeType` 已经由别的 schema 提前定义了

:::

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/core.ldif
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=core,cn=schema,cn=config"
ldap_add: Other (e.g., implementation specific) error (80)
	additional info: olcAttributeTypes: Duplicate attributeType: "2.5.4.2"
```


