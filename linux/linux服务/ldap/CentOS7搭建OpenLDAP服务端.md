[toc]



# CentOS7搭建OpenLDAP服务端

[openldap官网](https://www.openldap.org/)

[openldap官方下载地址](https://www.openldap.org/software/download/)



**ldap相关术语**

`Entry (or object) 条目(或对象)`：LDAP中的每个单元都认为是条目。

`dn`：条目名称。

`ou`：组织名称。

`dc`：域组件。例如，baidu.com是这样写的:dc=baidu,dc=com。

`cn`：通用名称，如原文链接：https://www.baidu.com 名或某个对象的名字



## 一、安装openldap

### 1.1 安装包

```sh
yum -y install openldap compat-openldap openldap-clients openldap-servers openldap-servers-sql openldap-devel migrationtools
```



### 1.2 查看版本

```sh
$ slapd -VV
@(#) $OpenLDAP: slapd 2.4.44 (Sep 30 2020 17:16:39) $
	mockbuild@x86-02.bsys.centos.org:/builddir/build/BUILD/openldap-2.4.44/openldap-2.4.44/servers/slapd
```



## 二、配置openldap

### 2.1 设置管理员密码

会生成一堆加密后的字符，记录好，之后配置文件里会需要的

```sh
$ slappasswd -s 123456
{SSHA}KDATg8AaahEG0R3SIWz52JQQOviDsTLP
```



### 2.2 修改相关配置文件

#### 2.2.1 修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif`

```sh
vim /etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif

修改如下两行
	olcSuffix: dc=my-domain,dc=com
  olcRootDN: cn=Manager,dc=my-domain,dc=com

修改为
	olcSuffix: dc=pptfz,dc=com
	olcRootDN: cn=ldap,dc=pptfz,dc=com

添加如下一行，冒号后边是2.1中生成的管理员密码随机字符串
	olcRootPW: {SSHA}KDATg8AaahEG0R3SIWz52JQQOviDsTLP
```



#### 2.2.2 修改 `/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif` 

```sh
vim /etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif

修改如下两行
	olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth" read by dn.base="cn=Manager,dc=my-domain,dc=com" read by * none
 
修改为
	olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=extern
 al,cn=auth" read by dn.base="cn=ldap,dc=pptfz,dc=com" read by * none
```



#### 2.2.3 验证配置文件

忽略报错

```sh
$ slaptest -u
6087d0e7 ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif"
6087d0e7 ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif"
config file testing succeeded
```



## 三、启动openldap

### 3.1 启动openldap并设置开机自启

```sh
systemctl enable slapd && systemctl start slapd
```



### 3.2 查看运行状态

```shell
$ systemctl status slapd
● slapd.service - OpenLDAP Server Daemon
   Loaded: loaded (/usr/lib/systemd/system/slapd.service; enabled; vendor preset: disabled)
   Active: active (running) since Wed 2021-06-30 17:35:52 CST; 7s ago
     Docs: man:slapd
           man:slapd-config
           man:slapd-hdb
           man:slapd-mdb
           file:///usr/share/doc/openldap-servers/guide.html
  Process: 21432 ExecStart=/usr/sbin/slapd -u ldap -h ${SLAPD_URLS} $SLAPD_OPTIONS (code=exited, status=0/SUCCESS)
  Process: 21417 ExecStartPre=/usr/libexec/openldap/check-config.sh (code=exited, status=0/SUCCESS)
 Main PID: 21434 (slapd)
   CGroup: /system.slice/slapd.service
           └─21434 /usr/sbin/slapd -u ldap -h ldapi:/// ldap:///

Jun 30 17:35:52 VM-0-29-centos systemd[1]: Starting OpenLDAP Server Daemon...
Jun 30 17:35:52 VM-0-29-centos runuser[21420]: pam_unix(runuser:session): session opened for user ldap by (uid=0)
Jun 30 17:35:52 VM-0-29-centos slapd[21432]: @(#) $OpenLDAP: slapd 2.4.44 (Apr 28 2021 13:32:00) $
                                                     mockbuild@x86-02.bsys.centos.org:/builddir/build/BUILD/openldap-2.4.44/openldap-2.4.44/servers/slapd
Jun 30 17:35:52 VM-0-29-centos slapd[21432]: ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={1}monitor.ldif"
Jun 30 17:35:52 VM-0-29-centos slapd[21432]: ldif_read_file: checksum error on "/etc/openldap/slapd.d/cn=config/olcDatabase={2}hdb.ldif"
Jun 30 17:35:52 VM-0-29-centos slapd[21432]: tlsmc_get_pin: INFO: Please note the extracted key file will not be protected with a PIN any more, however it will b...rmissions.
Jun 30 17:35:52 VM-0-29-centos slapd[21434]: hdb_db_open: warning - no DB_CONFIG file found in directory /var/lib/ldap: (2).
                                             Expect poor performance for suffix "dc=qike366,dc=com".
Jun 30 17:35:52 VM-0-29-centos slapd[21434]: slapd starting
Jun 30 17:35:52 VM-0-29-centos systemd[1]: Started OpenLDAP Server Daemon.
Hint: Some lines were ellipsized, use -l to show in full.
```



### 3.3 查看端口

> **openldap默认监听tcp/389端口**

```shell
$ netstat -antup | grep 389
tcp        0      0 0.0.0.0:389             0.0.0.0:*               LISTEN      21434/slapd         
tcp6       0      0 :::389                  :::*                    LISTEN      21434/slapd     
```



## 四、配置openldap数据库

**拷贝文件，修改权限**

```shell
cp /usr/share/openldap-servers/DB_CONFIG.example /var/lib/ldap/DB_CONFIG
chown ldap:ldap -R /var/lib/ldap && chmod 700 -R /var/lib/ldap
```



**查看**

```shell
$ ll /var/lib/ldap/
total 348
-rwx------ 1 ldap ldap     2048 Jun 30 17:35 alock
-rwx------ 1 ldap ldap   286720 Jun 30 17:35 __db.001
-rwx------ 1 ldap ldap    32768 Jun 30 17:35 __db.002
-rwx------ 1 ldap ldap    49152 Jun 30 17:35 __db.003
-rwx------ 1 ldap ldap      845 Jun 30 17:42 DB_CONFIG
-rwx------ 1 ldap ldap     8192 Jun 30 17:35 dn2id.bdb
-rwx------ 1 ldap ldap    32768 Jun 30 17:35 id2entry.bdb
-rwx------ 1 ldap ldap 10485760 Jun 30 17:35 log.0000000001
```



## 五、导入基本Schema

导入 `cosine.ldif`

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/cosine.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=cosine,cn=schema,cn=config"
```



导入 `nis.ldif`

```sh
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/nis.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=nis,cn=schema,cn=config"
```



导入 `inetorgperson.ldif`

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/inetorgperson.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=inetorgperson,cn=schema,cn=config"
```



## 六、修改 `migrate_common.ph` 文件

> **`/usr/share/migrationtools/migrate_common.ph` 文件主要是用于生成ldif文件使用**

```shell
vim /usr/share/migrationtools/migrate_common.ph +71

修改如下三行
	$DEFAULT_MAIL_DOMAIN = "padl.com";
	$DEFAULT_BASE = "dc=padl,dc=com";
	$EXTENDED_SCHEMA = 0;

修改为
	$DEFAULT_MAIL_DOMAIN = "pptfz.com";
	$DEFAULT_BASE = "dc=pptfz,dc=com";
	$EXTENDED_SCHEMA = 1;
```



修改完成后重启服务

```shell
systemctl restart slapd
```

