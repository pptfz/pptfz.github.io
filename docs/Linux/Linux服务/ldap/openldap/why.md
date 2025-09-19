









![iShot_2025-09-19_19.41.59](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-19_19.41.59.png)









osi

```
# 创建ldap只读账号

export LDAP_READONLY_USER_PWD="123456"
export LDAP_BASE_DN="dc=zmexing,dc=com"

cat > ./readonly.ldif << EOF
dn: cn=readonly,${LDAP_BASE_DN}
cn: readonly
objectClass: simpleSecurityObject
objectClass: organizationalRole
description: LDAP read only user
userPassword: ${LDAP_READONLY_USER_PWD}
EOF



# 需要管理员密码
ldapadd -x -H ldap://localhost:1389 -D cn=admin,dc=zmexing,dc=com -w NgIZnm#b%6PI -f ./readonly.ldif




# 配置只读账号权限
export LDAP_BASE_DN="dc=zmexing,dc=com"


cat > readonly-user-acl.ldif << EOF
dn: olcDatabase={1}mdb,cn=config
changetype: modify
delete: olcAccess
-
add: olcAccess
olcAccess: {0}to attrs=userPassword,shadowLastChange 
 by dn="$LDAP_BASE_DN" write 
 by anonymous auth 
 by self write 
 by dn="cn=readonly,${LDAP_BASE_DN}" read 
 by * none
olcAccess: {1}to dn.base="" by * read
olcAccess: {2}to * by dn="$LDAP_BASE_DN" write by * read
EOF


ldapmodify -Y EXTERNAL -H ldapi:/// -f readonly-user-acl.ldif



使用只读账号查询
ldapsearch -x -H ldap://localhost:1389 -D "cn=readonly,dc=zmexing,dc=com" -w 123456 -b "dc=zmexing,dc=com"
```







bitnami

```
# 创建只读用户
cat > ./readonly-user.ldif << EOF
dn: cn=readonly,dc=zmexing,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: readonly
description: LDAP read-only user
userPassword: {SSHA}lQjfoaM6m3sAkbG7T9WJ7zyQz2N3iQ7k   # 密码=readonly123
EOF

ldapadd -x -H ldap://localhost:1389 -D "cn=admin,dc=zmexing,dc=com" -w NgIZnm#b%6PI -f ./readonly-user.ldif



# 创建acl
cat > readonly-acl.ldif << EOF
dn: olcDatabase={1}mdb,cn=config
changetype: modify
replace: olcAccess
olcAccess: {0}to attrs=userPassword,shadowLastChange
  by dn.exact="cn=admin,dc=zmexing,dc=com" write
  by dn.exact="cn=readonly,dc=zmexing,dc=com" read
  by anonymous auth
  by self write
  by * none
olcAccess: {1}to dn.base="" by * read
olcAccess: {2}to * by dn.exact="cn=admin,dc=zmexing,dc=com" write by * read
EOF

ldapmodify -Y EXTERNAL -H ldapi:/// -f readonly-acl.ldif
```













```
cat > readonly-user.ldif << EOF
dn: cn=readonly,dc=zmexing,dc=com
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: readonly
description: LDAP readonly user
userPassword: mXeTZg%N%NkJ0
EOF



ldapadd -x -H ldap://localhost:1389 -D "cn=admin,dc=zmexing,dc=com" -w NgIZnm#b%6PI -f readonly-user.ldif

# 测试只读账号
ldapsearch -x -H ldap://localhost:1389 -D "cn=readonly,dc=zmexing,dc=com" -w mXeTZg%N%NkJ0 -b "dc=zmexing,dc=com"
```





```
ldapsearch -x -H ldap://localhost:1389 -D "cn=admin,dc=zmexing,dc=com" -w NgIZnm#b%6PI -b "dc=zmexing,dc=com"
```



查看所有acl

```
ldapsearch -H ldapi:// -LLL -Q -Y EXTERNAL -b "cn=config" "(objectClass=*)" dn olcDatabase olcSuffix olcAccess
```







```
ldapdelete -x -r 'dc=zmexing,dc=com' -H 'ldap://localhost:1389' -D 'cn=admin,dc=zmexing,dc=com' -w NgIZnm#b%6PI


slapadd -F /bitnami/openldap/slapd.d -b "dc=zmexing,dc=com" -l backup.ldif
```



















查看all

有了 `olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none` 报错 `This base cannot be created with PLA.`

```
cat > delete-userpassword-acl.ldif << EOF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
delete: olcAccess
olcAccess: {0}to attrs=userPassword by self write by anonymous auth by * none
EOF
```



```
ldapmodify -Y EXTERNAL -H ldapi:/// -f delete-userpassword-acl.ldif
```

```
ldapsearch -Y EXTERNAL -H ldapi:/// -b "olcDatabase={2}mdb,cn=config" -LLL olcAccess
```







```
cat > delete-userpassword-acl.ldif << EOF
dn: olcDatabase={2}mdb,cn=config
changetype: modify
delete: olcAccess
olcAccess: {1}to attrs=userPassword by self write by anonymous auth by * none
EOF

by dn="cn=readonly,dc=ldap,dc=test,dc=com" read
```





单独增加这个就可以readonly查询了

```
cat add-userpassword-acl.ldif 
dn: olcDatabase={2}mdb,cn=config
changetype: modify
add: olcAccess
olcAccess: {1}to * by dn.exact="cn=readonly,dc=zmexing,dc=com" read by * none
```



有问题报错这个

```
ldapsearch -x -H ldap://localhost:1389 -D "cn=readonly,dc=zmexing,dc=com" -w mXeTZg%N%NkJ0 -b "dc=zmexing,dc=com"
# extended LDIF
#
# LDAPv3
# base <dc=zmexing,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# search result
search: 2
result: 32 No such object
```

