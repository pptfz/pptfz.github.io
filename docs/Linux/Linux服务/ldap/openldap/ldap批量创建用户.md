# ldap批量创建用户



编辑用户文件

```
cat > users.txt << EOF
zhuzhisheng
libin
lichao
lianglikai
songtingsen
wangjun
wanglin
wangpengfei
yanxin
zhangjintao
zhangxing
zhangzhenbiao
zhaoxiaofei
zhaoyulong
EOF
```



批量增加用户

```shell
cat > add-users.sh << 'AAA'
#!/bin/bash

BASE_DN="cn=后端组,ou=kingclub,dc=zmexing,dc=com"
GROUP_GID=1000
PASSWORD="{SSHA}G7h4TMhnEuc1iR5pR/E7E9WPQ7rW23UJ"
DOMAIN="zmexing.com"

UID_START=1001

while read -r USERNAME
do
  EMAIL="${USERNAME}@${DOMAIN}"
  UID=$UID_START

cat <<EOF | ldapadd -x -H ldap://localhost:1389 -D "cn=admin,dc=zmexing,dc=com" -w 'NgIZnm#b%6PI'
dn: uid=${USERNAME},${BASE_DN}
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: ${USERNAME}
sn: ${USERNAME}
uid: ${USERNAME}
uidNumber: ${UID}
gidNumber: ${GROUP_GID}
homeDirectory: /home/${USERNAME}
loginShell: /bin/bash
mail: ${EMAIL}
userPassword: ${PASSWORD}
EOF

  UID_START=$((UID_START+1))

done < users.txt
AAA
```



批量删除用户

```shell
cat > del-users.sh << 'EOF'
#!/bin/bash

BASE_DN="cn=后端组,ou=kingclub,dc=zmexing,dc=com"

while read -r USERNAME
do
  DN="uid=${USERNAME},${BASE_DN}"

  echo "Deleting ${DN} ..."
  ldapdelete -x -H ldap://localhost:1389 -D "cn=admin,dc=zmexing,dc=com" -w 'NgIZnm#b%6PI' "${DN}"

done < users.txt
EOF
```

