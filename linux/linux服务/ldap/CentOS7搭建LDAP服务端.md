# CentOS7搭建LDAP服务端

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
slappasswd -s 123456
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

```sh
systemctl enable slapd && systemctl start slapd
```

