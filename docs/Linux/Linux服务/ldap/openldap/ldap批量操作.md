# ldap批量操作

## ldap批量操作组

### shell脚本方式

#### 编辑组文件

```shell
cat > groups.txt << EOF
go
java
python
php
c
c++
c#
EOF
```





#### 批量增加组

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="ou" label="ou" default>

:::tip 说明

- **全称**：`Organizational Unit`

- **用途**：表示一个组织单元（相当于文件夹 / 部门目录），主要用来分组

- **例子**：

  ```shell
  ou=People,dc=example,dc=com
  ou=Groups,dc=example,dc=com
  ```

  - `People` 可以存放用户对象
  - `Groups` 可以存放组对象

- 基本配置文件

  :::tip 说明

  | 参数                              | 说明                                            |
  | --------------------------------- | ----------------------------------------------- |
  | `dn: ou=People,dc=example,dc=com` | 完整路径（OU=People 在 dc=example,dc=com 下面） |
  | `objectClass: top`                | 所有结构类（structural objectClass）的 **基类** |
  | `objectClass: organizationalUnit` | 表示这是一个 OU                                 |
  | `ou: People`                      | OU 的名字                                       |

  :::

  ```shell
  dn: ou=People,dc=example,dc=com
  objectClass: top
  objectClass: organizationalUnit
  ou: People
  ```

:::

```shell
cat > add-ous.sh << 'AAA'
#!/bin/bash

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"       # LDAP 根
BIND_DN="cn=admin,dc=ops,dc=com"  # 管理员账号
BIND_PWD="admin"              # 管理员密码
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"

OU_FILE="ous.txt"             # OU 文件，每行一个 OU 名

# ========================
# DN 转义函数（RFC4514）
# ========================
escape_dn() {
    local dn="$1"
    dn="${dn//\\/\\\\}"   # \ 转义
    dn="${dn//+/\\+}"     # + 转义
    dn="${dn//#/\\#}"     # # 转义
    dn="${dn//,/\\,}"     # , 转义
    dn="${dn//=/\\=}"     # = 转义
    dn="${dn//;/\\;}"     # ; 转义
    dn="${dn//</\\<}"     # < 转义
    dn="${dn//>/\\>}"     # > 转义
    dn="${dn//\"/\\\"}"   # " 转义
    echo "$dn"
}

# ========================
# 批量创建 OU
# ========================
while read -r OUNAME
do
    # 跳过空行或注释
    [[ -z "$OUNAME" || "$OUNAME" =~ ^# ]] && continue

    ESCAPED_OUNAME=$(escape_dn "$OUNAME")
    DN="ou=${ESCAPED_OUNAME},${BASE_DN}"

    # 检查是否已存在
    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" ou | grep -q "^ou:"; then
        echo "[$OUNAME] already exists, skip."
    else
        # 创建 OU
        ldapadd -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" <<EOF
dn: ${DN}
objectClass: top
objectClass: organizationalUnit
ou: ${OUNAME}
EOF
        if [ $? -eq 0 ]; then
            echo "[$OUNAME] created successfully."
        else
            echo "[$OUNAME] failed to create!"
        fi
    fi

done < "$OU_FILE"
AAA

```

  </TabItem>
  <TabItem value="cn" label="cn">

:::tip 说明

- **全称**：`Common Name`

- **用途**：表示某个具体条目的名字（相当于文件名 / 实体对象名）

- **例子**：

  ```shell
  cn=John Doe,ou=People,dc=example,dc=com
  cn=admins,ou=Groups,dc=example,dc=com
  ```

  - `cn=John Doe` 就是某个用户对象
  - `cn=admins` 就是某个组对象

- 基本配置文件

  :::tip 说明

  | 参数                                        | 说明                                                   |
  | ------------------------------------------- | ------------------------------------------------------ |
  | `dn: cn=devops,ou=Groups,dc=example,dc=com` | 这条记录在 LDAP 树中的绝对路径                         |
  | `objectClass: top`                          | 所有结构类（structural objectClass）的 **基类**        |
  | `objectClass: posixGroup`                   | 表明这是个 **POSIX 组对象**                            |
  | `cn: devops`                                | **POSIX 组对象**的名字， **POSIX 组** 必须有 `cn` 属性 |
  | `gidNumber: 1001`                           | 组id号                                                 |

  :::

  ```shell
  dn: cn=devops,ou=Groups,dc=example,dc=com
  objectClass: top
  objectClass: posixGroup
  cn: devops
  gidNumber: 1001
  ```

  

:::

```shell
cat > add-cns.sh << 'AAA'
#!/bin/bash

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"	# LDAP 根
BIND_DN="cn=admin,dc=ops,dc=com"	# 管理员账号
BIND_PWD="admin"	# 管理员密码
GID_START=1000	# 起始 GID
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"

GROUP_FILE="groups.txt"	# 组名文件，每行一个组

# ========================
# DN 转义函数（RFC4514）
# ========================
escape_dn() {
    local dn="$1"
    dn="${dn//\\/\\\\}"   # \ 转义
    dn="${dn//+/\\+}"     # + 转义
    dn="${dn//#/\\#}"     # # 转义
    dn="${dn//,/\\,}"     # , 转义
    dn="${dn//=/\\=}"     # = 转义
    dn="${dn//;/\\;}"     # ; 转义
    dn="${dn//</\\<}"     # < 转义
    dn="${dn//>/\\>}"     # > 转义
    dn="${dn//\"/\\\"}"   # " 转义
    echo "$dn"
}

# ========================
# 批量创建组
# ========================
CURRENT_GID=$GID_START

while read -r GROUPNAME
do
    # 跳过空行或注释
    [[ -z "$GROUPNAME" || "$GROUPNAME" =~ ^# ]] && continue

    ESCAPED_GROUPNAME=$(escape_dn "$GROUPNAME")
    DN="cn=${ESCAPED_GROUPNAME},${BASE_DN}"

    # 检查是否已存在
    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" cn | grep -q "^cn:"; then
        echo "[$GROUPNAME] already exists, skip."
    else
        # 创建组
        ldapadd -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" <<EOF
dn: ${DN}
objectClass: top
objectClass: posixGroup
cn: ${GROUPNAME}
gidNumber: ${CURRENT_GID}
EOF
        if [ $? -eq 0 ]; then
            echo "[$GROUPNAME] created successfully with GID ${CURRENT_GID}."
        else
            echo "[$GROUPNAME] failed to create!"
        fi
    fi

    CURRENT_GID=$((CURRENT_GID+1))
done < "$GROUP_FILE"
AAA
```

  </TabItem>
</Tabs>



#### 批量删除组

```shell
cat > delete-groups.sh << 'EOF'
#!/bin/bash

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"                   # LDAP 根
BIND_DN="cn=admin,dc=ops,dc=com"         # 管理员账号
BIND_PWD="admin"                          # 管理员密码
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"

GROUP_FILE="groups.txt"                   # 待删除的组名文件，每行一个组

# ========================
# DN 转义函数（RFC4514）
# ========================
escape_dn() {
    local dn="$1"
    dn="${dn//\\/\\\\}"   # \ 转义
    dn="${dn//+/\\+}"     # + 转义
    dn="${dn//#/\\#}"     # # 转义
    dn="${dn//,/\\,}"     # , 转义
    dn="${dn//=/\\=}"     # = 转义
    dn="${dn//;/\\;}"     # ; 转义
    dn="${dn//</\\<}"     # < 转义
    dn="${dn//>/\\>}"     # > 转义
    dn="${dn//\"/\\\"}"   # " 转义
    echo "$dn"
}

# ========================
# 批量删除组
# ========================
while read -r GROUPNAME
do
    # 跳过空行或注释
    if [[ -z "$GROUPNAME" || "$GROUPNAME" =~ ^# ]]; then
        continue
    fi

    ESCAPED_GROUPNAME=$(escape_dn "$GROUPNAME")
    DN="cn=${ESCAPED_GROUPNAME},${BASE_DN}"

    # 检查组是否存在
    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" cn | grep -q "^cn:"; then
        ldapdelete -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" "${DN}"
        if [ $? -eq 0 ]; then
            echo "[$GROUPNAME] deleted successfully."
        else
            echo "[$GROUPNAME] failed to delete!"
        fi
    else
        echo "[$GROUPNAME] does not exist, skip."
    fi

done < "$GROUP_FILE"
EOF
```







## ldap批量操作用户

### shell脚本方式

#### 编辑用户文件

```shell
cat > users.txt << EOF
user1
user2
user3
EOF
```



#### 批量增加用户

```shell
cat > add-users.sh << 'AAA'
#!/bin/bash

BASE_DN="dc=ops,dc=com"
BIND_DN="cn=admin,dc=ops,dc=com"
BIND_PWD="admin"

LDAP_HOST="localhost"
LDAP_HOST_PORT="389"

GROUP_DN="cn=go,${BASE_DN}"
GROUP_GID=1000
PASSWORD="{SSHA}uUFY4EJIccmbnIZBPMiq06QK4HG9vO/a" # 创建的用户密码为admin
DOMAIN="ops.com"
LOGIN_SHELL=/bin/bash

UID_START=1001
USER_FILE="users.txt" 

while read -r USERNAME
do
  EMAIL="${USERNAME}@${DOMAIN}"
  USER_UID=$UID_START

  # 注意这里 EOF 不加单引号，保证变量会展开
  ldapadd -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" <<EOF
dn: uid=${USERNAME},${GROUP_DN}
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
cn: ${USERNAME}
sn: ${USERNAME}
uid: ${USERNAME}
uidNumber: ${USER_UID}
gidNumber: ${GROUP_GID}
homeDirectory: /home/${USERNAME}
loginShell: ${LOGIN_SHELL}
mail: ${EMAIL}
userPassword: ${PASSWORD}
EOF

  UID_START=$((UID_START+1))

done < "$USER_FILE"
AAA

```



#### 批量删除用户

删除每一个用户前有确认提示

```shell
cat > del-users.sh << EOF
#!/bin/bash

BASE_DN="cn=go,dc=ops,dc=com"
BIND_DN="cn=admin,dc=ops,dc=com"
BIND_PWD="admin"
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"
USER_FILE="users.txt"

while read -r USERNAME
do
  DN="uid=\${USERNAME},\${BASE_DN}"

  # 二次确认提示，保证读取终端
  read -p "Are you sure you want to delete \${DN}? [y/N] " CONFIRM </dev/tty
  if [[ "\$CONFIRM" =~ ^[Yy]\$ ]]; then
      echo "Deleting \${DN} ..."
      ldapdelete -x -H ldap://\${LDAP_HOST}:\${LDAP_HOST_PORT} -D "\${BIND_DN}" -w "\${BIND_PWD}" "\${DN}"
      if [ \$? -eq 0 ]; then
          echo "[\${USERNAME}] deleted successfully."
      else
          echo "[\${USERNAME}] failed to delete!"
      fi
  else
      echo "Skipping \${DN}."
  fi

done < "\$USER_FILE"
EOF
```



删除一个组前有确认提示

```shell
cat > del-go-users.sh << 'EOF'
#!/bin/bash

# LDAP 配置
BASE_DN="cn=go,dc=ops,dc=com"
BIND_DN="cn=admin,dc=ops,dc=com"
BIND_PWD="admin"
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"
USER_FILE="users.txt"

# 提示即将删除的组
echo "You are about to delete all users under the group: ${BASE_DN}"
read -p "Are you sure? [y/N] " CONFIRM </dev/tty

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    while read -r USERNAME
    do
        DN="uid=${USERNAME},${BASE_DN}"
        echo "Deleting ${DN} ..."
        ldapdelete -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" "${DN}"
        if [ $? -eq 0 ]; then
            echo "[${USERNAME}] deleted successfully."
        else
            echo "[${USERNAME}] failed to delete!"
        fi
    done < "$USER_FILE"
else
    echo "Deletion cancelled."
fi
EOF
```



