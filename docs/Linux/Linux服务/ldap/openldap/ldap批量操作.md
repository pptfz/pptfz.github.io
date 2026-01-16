# ldap批量操作

## ldap批量操作组

### shell脚本方式

#### 编辑组文件

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="增加ou" label="增加ou" default>

```shell
cat > ous.txt << EOF
ou_name1
ou_name2
ou_name3
EOF
```

  </TabItem>
  <TabItem value="增加cn" label="增加cn">

```bash
cat > cns.txt << EOF
go
java
python
EOF
```

  </TabItem>

  <TabItem value="删除ou或cn" label="删除ou或cn">

每行一个条目

```shell
cat > entries.txt << EOF
cn:devops
ou:People
cn:admins
ou:Groups
EOF
```

  </TabItem>

</Tabs>





#### 批量增加组

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

  | 参数                              | 说明                                            |
  | --------------------------------- | ----------------------------------------------- |
  | `dn: ou=People,dc=example,dc=com` | 完整路径（OU=People 在 dc=example,dc=com 下面） |
  | `objectClass: top`                | 所有结构类（structural objectClass）的 **基类** |
  | `objectClass: organizationalUnit` | 表示这是一个 OU                                 |
  | `ou: People`                      | OU 的名字                                       |

  

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
set -e

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"           # LDAP 根
BIND_DN="cn=admin,dc=ops,dc=com"  # 管理员账号
BIND_PWD="admin"                  # 管理员密码
LDAP_HOST="localhost"             # LDAP 域名/IP
LDAP_HOST_PORT="1389"              # LDAP 端口

OU_FILE="ous.txt"                 # OU 文件，每行一个 OU 名

# ========================
# 检查 LDAP 连接
# ========================
if ! ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${BASE_DN}" dn >/dev/null 2>&1; then
    echo "❌ 无法连接 LDAP 服务器 ldap://${LDAP_HOST}:${LDAP_HOST_PORT}，请检查服务是否启动及网络连通性"
    exit 1
fi

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
# 批量创建 OU（增加统计功能和创建列表）
# ========================
TOTAL=0
SUCCESS=0
FAILURE=0
CREATED_OUS=()  # 保存成功创建的 OU

while read -r OUNAME
do
    # 跳过空行或注释
    [[ -z "$OUNAME" || "$OUNAME" =~ ^# ]] && continue
    TOTAL=$((TOTAL + 1))

    ESCAPED_OUNAME=$(escape_dn "$OUNAME")
    DN="ou=${ESCAPED_OUNAME},${BASE_DN}"

    # 检查是否已存在
    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" ou | grep -q "^ou:"; then
        echo "[$OUNAME] 已存在，跳过."
        FAILURE=$((FAILURE + 1))
    else
        # 创建 OU
        if ldapadd -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" <<EOF
dn: ${DN}
objectClass: top
objectClass: organizationalUnit
ou: ${OUNAME}
EOF
        then
            echo "[$OUNAME] 创建成功."
            SUCCESS=$((SUCCESS + 1))
            CREATED_OUS+=("$OUNAME")  # 记录成功创建的 OU
        else
            echo "[$OUNAME] 创建失败!"
            FAILURE=$((FAILURE + 1))
        fi
    fi

done < "$OU_FILE"

# ========================
# 打印统计和创建列表
# ========================
echo "==============================="
echo "批量创建 OU 统计:"
echo "处理总 OU 数: ${TOTAL}"
echo "创建成功: ${SUCCESS}"
echo "创建失败/已存在: ${FAILURE}"

if [ ${#CREATED_OUS[@]} -gt 0 ]; then
    echo "成功创建的 OU 列表:"
    for ou in "${CREATED_OUS[@]}"; do
        echo "  - $ou"
    done
fi

echo "==============================="
echo "✅ OU 创建完成"
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

  | 参数                                        | 说明                                                   |
  | ------------------------------------------- | ------------------------------------------------------ |
  | `dn: cn=devops,ou=Groups,dc=example,dc=com` | 这条记录在 LDAP 树中的绝对路径                         |
  | `objectClass: top`                          | 所有结构类（structural objectClass）的 **基类**        |
  | `objectClass: posixGroup`                   | 表明这是个 **POSIX 组对象**                            |
  | `cn: devops`                                | **POSIX 组对象**的名字， **POSIX 组** 必须有 `cn` 属性 |
  | `gidNumber: 1001`                           | 组id号                                                 |

  

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
set -e

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"           # LDAP 根
OU="ou_name3"                             # 目标 OU 名（留空表示不使用 OU）
BIND_DN="cn=admin,dc=ops,dc=com"  # 管理员账号
BIND_PWD="admin"                  # 管理员密码
GID_START=1000                    # 起始 GID
LDAP_HOST="localhost"
LDAP_HOST_PORT="1389"

GROUP_FILE="cns.txt"

# ========================
# 检查 LDAP 连接
# ========================
if ! ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${BASE_DN}" dn >/dev/null 2>&1; then
    echo "❌ 无法连接 LDAP 服务器 ldap://${LDAP_HOST}:${LDAP_HOST_PORT}，请检查服务是否启动及网络连通性"
    exit 1
fi

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
# 批量创建 CN（增加提示、统计和成功列表）
# ========================
CURRENT_GID=$GID_START
TOTAL=0
SUCCESS=0
FAILURE=0
CREATED_CNS=()

while read -r GROUPNAME
do
    [[ -z "$GROUPNAME" || "$GROUPNAME" =~ ^# ]] && continue  # 跳过空行/注释
    TOTAL=$((TOTAL+1))

    ESCAPED_GROUPNAME=$(escape_dn "$GROUPNAME")

    if [ -n "$OU" ]; then
        PARENT_DN="ou=${OU},${BASE_DN}"
    else
        PARENT_DN="${BASE_DN}"
    fi

    DN="cn=${ESCAPED_GROUPNAME},${PARENT_DN}"

    # ========================
    # 提前打印提示
    # ========================
    echo "即将创建 CN: ${GROUPNAME}"
    echo "父级 DN: ${PARENT_DN}"

    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} \
        -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" cn | grep -q "^cn:"; then
        echo "[$GROUPNAME] 已存在，跳过."
        FAILURE=$((FAILURE+1))
    else
        if ldapadd -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} \
            -D "${BIND_DN}" -w "${BIND_PWD}" <<EOF
dn: ${DN}
objectClass: top
objectClass: posixGroup
cn: ${GROUPNAME}
gidNumber: ${CURRENT_GID}
EOF
        then
            echo "[$GROUPNAME] 创建成功，GID=${CURRENT_GID}."
            SUCCESS=$((SUCCESS+1))
            CREATED_CNS+=("$GROUPNAME")
        else
            echo "[$GROUPNAME] 创建失败!"
            FAILURE=$((FAILURE+1))
        fi
    fi

    CURRENT_GID=$((CURRENT_GID+1))
    echo "---------------------------"
done < "$GROUP_FILE"

# ========================
# 打印统计和创建列表
# ========================
echo "==============================="
echo "批量创建 CN 统计:"
echo "处理总 CN 数: ${TOTAL}"
echo "创建成功: ${SUCCESS}"
echo "创建失败/已存在: ${FAILURE}"

if [ ${#CREATED_CNS[@]} -gt 0 ]; then
    echo "成功创建的 CN 列表:"
    for cn in "${CREATED_CNS[@]}"; do
        echo "  - $cn"
    done
fi

echo "==============================="
echo "✅ CN 创建完成"
AAA
```

  </TabItem>
</Tabs>



#### 批量删除组

```shell
cat > delete-entries.sh << 'EOF'
#!/bin/bash

# ========================
# 配置部分
# ========================
BASE_DN="dc=ops,dc=com"           # LDAP 根
BIND_DN="cn=admin,dc=ops,dc=com"  # 管理员账号
BIND_PWD="admin"                  # 管理员密码
LDAP_HOST="localhost"
LDAP_HOST_PORT="389"

ENTRY_FILE="entries.txt"           # 待删除条目文件，每行一个 cn:xxx 或 ou:xxx

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
# 批量删除条目
# ========================
while read -r LINE
do
    # 跳过空行或注释
    [[ -z "$LINE" || "$LINE" =~ ^# ]] && continue

    TYPE="${LINE%%:*}"
    NAME="${LINE#*:}"
    NAME="${NAME#"${NAME%%[![:space:]]*}"}"  # 去掉前导空格
    ESCAPED_NAME=$(escape_dn "$NAME")
    DN="${TYPE}=${ESCAPED_NAME},${BASE_DN}"

    # 检查条目是否存在
    if ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" -b "${DN}" "${TYPE}" | grep -q "^${TYPE}:"; then
        ldapdelete -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" "${DN}"
        if [ $? -eq 0 ]; then
            echo "[$TYPE:$NAME] deleted successfully."
        else
            echo "[$TYPE:$NAME] failed to delete!"
        fi
    else
        echo "[$TYPE:$NAME] does not exist, skip."
    fi

done < "$ENTRY_FILE"
EOF
```





## ldap批量操作用户

### shell脚本方式

#### 编辑用户文件

:::tip 说明

- 有 `:` → 用户挂在 CN 下

- 无 `:` → 用户挂在 OU 下

:::

```shell
cat > users.txt << EOF
user1:go
user2
user3:java
EOF
```



#### 批量增加用户

:::tip 说明

此脚本同时支持两种 **用户 DN 格式**

- **模式1：只有 CN**（`uid=xxx,cn=xxx,dc=ops,dc=com`）
- **模式2：OU + CN**（`uid=xxx,ou=xxx,cn=xxx,dc=ops,dc=com`）

:::

```shell
cat > add-users.sh << 'AAA'
#!/bin/bash
set -e

# ======================
# 基础配置
# ======================
BASE_SUFFIX="dc=ops,dc=com"

USER_OU="ou_name1"      # 必填
DEFAULT_GID=1000         # CN 未指定时使用

PASSWORD="{SSHA}uUFY4EJIccmbnIZBPMiq06QK4HG9vO/a"
EMAIL_DOMAIN="ops.com"
LOGIN_SHELL="/bin/bash"

BIND_DN="cn=admin,${BASE_SUFFIX}"
BIND_PWD="admin"

LDAP_HOST="localhost"
LDAP_HOST_PORT="1389"

USER_FILE="users.txt"

# ======================
# 校验 OU
# ======================
if [ -z "$USER_OU" ]; then
  echo "❌ USER_OU 不能为空"
  exit 1
fi

# ======================
# 预览用户列表
# ======================
echo "=== 将要创建的用户列表 ==="
PREVIEW_LIST=()
while read -r LINE
do
  [[ -z "$LINE" || "$LINE" =~ ^# ]] && continue

  if [[ "$LINE" == *:* ]]; then
    USERNAME="${LINE%%:*}"
    USER_CN="${LINE##*:}"
    USER_BASE_DN="cn=${USER_CN},ou=${USER_OU},${BASE_SUFFIX}"
    PREVIEW_LIST+=("${USERNAME} -> ${USER_BASE_DN}")
  else
    USERNAME="$LINE"
    USER_CN=""
    USER_BASE_DN="ou=${USER_OU},${BASE_SUFFIX}"
    PREVIEW_LIST+=("${USERNAME} -> ${USER_BASE_DN}")
  fi
done < "${USER_FILE}"

# 打印列表
for entry in "${PREVIEW_LIST[@]}"; do
  echo "$entry"
done

# 确认提示
read -rp "确认创建以上用户吗？(y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "已取消用户创建"
  exit 0
fi

# ======================
# 批量创建用户（增加统计功能）
# ======================
TOTAL=0
SUCCESS=0
FAILURE=0

while read -r LINE
do
  [[ -z "$LINE" || "$LINE" =~ ^# ]] && continue
  TOTAL=$((TOTAL + 1))

  if [[ "$LINE" == *:* ]]; then
    USERNAME="${LINE%%:*}"
    USER_CN="${LINE##*:}"
    USER_BASE_DN="cn=${USER_CN},ou=${USER_OU},${BASE_SUFFIX}"
    # 查询 CN 的 gidNumber
    GROUP_GID=$(ldapsearch -x \
      -H "ldap://${LDAP_HOST}:${LDAP_HOST_PORT}" \
      -D "${BIND_DN}" \
      -w "${BIND_PWD}" \
      -b "${USER_BASE_DN}" \
      "(objectClass=posixGroup)" gidNumber \
      | awk '/^gidNumber:/ {print $2}')
    if [ -z "$GROUP_GID" ]; then
      echo "❌ cn=${USER_CN} 未找到 gidNumber"
      FAILURE=$((FAILURE + 1))
      continue
    fi
  else
    USERNAME="$LINE"
    USER_CN=""
    USER_BASE_DN="ou=${USER_OU},${BASE_SUFFIX}"
    GROUP_GID=$DEFAULT_GID
  fi

  # 自动获取当前 OU/CN 下最大 uidNumber
  MAX_UID=$(ldapsearch -x \
    -H "ldap://${LDAP_HOST}:${LDAP_HOST_PORT}" \
    -D "${BIND_DN}" \
    -w "${BIND_PWD}" \
    -b "${USER_BASE_DN}" \
    "(objectClass=posixAccount)" uidNumber \
    | awk '/^uidNumber:/ {print $2}' \
    | sort -n \
    | tail -1)
  if [ -z "$MAX_UID" ]; then
    USER_UID=1001
  else
    USER_UID=$((MAX_UID + 1))
  fi

  EMAIL="${USERNAME}@${EMAIL_DOMAIN}"
  USER_DN="uid=${USERNAME},${USER_BASE_DN}"

  echo "==> 创建用户: ${USER_DN} (uidNumber=${USER_UID}, gidNumber=${GROUP_GID})"

  if ldapadd -x \
       -H "ldap://${LDAP_HOST}:${LDAP_HOST_PORT}" \
       -D "${BIND_DN}" \
       -w "${BIND_PWD}" <<EOF
dn: ${USER_DN}
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
  then
    echo "[${USERNAME}] 创建成功"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "[${USERNAME}] 创建失败"
    FAILURE=$((FAILURE + 1))
  fi

done < "${USER_FILE}"

# ======================
# 打印统计结果
# ======================
echo "==============================="
echo "批量创建统计:"
echo "处理总用户数: ${TOTAL}"
echo "创建成功: ${SUCCESS}"
echo "创建失败: ${FAILURE}"
echo "==============================="
echo "✅ 用户创建完成"
AAA
```



#### 批量删除用户

LDAP用户删除场景对比图

![iShot_2026-01-16_19.03.58](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-16_19.03.58.png)





##### 删除多类型路径的指定用户

:::tip 说明

该脚本用于 **安全地批量删除 LDAP 用户**，具备以下能力：

- 从 `users.txt` 读取用户列表
- 自动判断用户是在 **OU 下** 还是 **OU 下的 CN 下**
- 动态拼接出每个用户的 **完整 DN**
- **每删除一个用户前都要求人工确认**
- 使用 LDAP 管理员账号执行删除操作



users.txt 支持的写法

```shell
alice
bob:java
```

含义：

| 行内容     | 用户 DN 位置                        |
| ---------- | ----------------------------------- |
| `alice`    | `ou=ou_name1,dc=ops,dc=com`         |
| `bob:java` | `cn=java,ou=ou_name1,dc=ops,dc=com` |

:::

```shell
cat > del-users.sh << 'EOF'
#!/bin/bash
set -e

# ======================
# 基础配置
# ======================
BASE_SUFFIX="dc=ops,dc=com"
USER_OU="ou_name1"           # 必填
BIND_DN="cn=admin,${BASE_SUFFIX}"
BIND_PWD="admin"
LDAP_HOST="localhost"
LDAP_HOST_PORT="1389"
USER_FILE="users.txt"

# ======================
# 初始化统计变量
# ======================
TOTAL=0
SUCCESS=0
FAILURE=0

# ======================
# 批量删除用户
# ======================
while read -r LINE
do
  # 跳过空行和注释
  [[ -z "$LINE" || "$LINE" =~ ^# ]] && continue

  TOTAL=$((TOTAL + 1))

  # 解析用户名和可选 CN
  if [[ "$LINE" == *:* ]]; then
    USERNAME="${LINE%%:*}"
    USER_CN="${LINE##*:}"
    USER_BASE_DN="cn=${USER_CN},ou=${USER_OU},${BASE_SUFFIX}"
  else
    USERNAME="$LINE"
    USER_CN=""
    USER_BASE_DN="ou=${USER_OU},${BASE_SUFFIX}"
  fi

  USER_DN="uid=${USERNAME},${USER_BASE_DN}"

  # 二次确认（读取终端）
  read -rp "确定要删除 ${USER_DN}? [y/N] " CONFIRM </dev/tty
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      echo "删除 ${USER_DN} ..."
      if ldapdelete -x -H "ldap://${LDAP_HOST}:${LDAP_HOST_PORT}" \
                    -D "${BIND_DN}" \
                    -w "${BIND_PWD}" \
                    "${USER_DN}"; then
          echo "用户 [${USERNAME}] 删除成功"
          SUCCESS=$((SUCCESS + 1))
      else
          echo "用户 [${USERNAME}] 删除失败"
          FAILURE=$((FAILURE + 1))
      fi
  else
      echo "跳过删除 ${USER_DN}."
      FAILURE=$((FAILURE + 1))
  fi

done < "$USER_FILE"

# ======================
# 打印统计结果
# ======================
echo "==============================="
echo "批量删除统计:"
echo "总用户数: ${TOTAL}"
echo "成功删除: ${SUCCESS}"
echo "删除失败或跳过: ${FAILURE}"
echo "✅ 批量删除完成"
echo "==============================="
EOF
```



##### 删除固定 DN（某个 CN 或 OU）下的所有用户

:::tip 说明

**脚本名称**：`del-users-by-base-dn.sh`

**主要功能**：
 批量删除 LDAP 中指定 OU（组织单元）或 OU 下某个 CN（子容器）下的所有用户，并在删除前打印用户列表，保留删除统计信息。

**功能特点**：

1. **灵活选择删除范围**
   - 必填 **OU**：指定要操作的组织单元。
   - 可选 **CN**：如果填写，则删除 OU 下该 CN 下的所有用户；如果不填，只删除 OU 下的直系用户，不影响子 CN 下的用户。
2. **删除前用户列表展示**
   - 脚本会先查询指定 OU/CN 下的用户，并打印完整 DN 列表，让管理员确认待删除用户。
3. **中文提示 & 二次确认**
   - 操作前提示待删除用户，并要求管理员确认执行，防止误删。
4. **批量删除 & 统计**
   - 自动遍历查询到的用户 DN，逐条执行删除。
   - 记录删除总数、成功数和失败数，最后打印统计信息。

**适用场景**：

- LDAP 系统中，需要清理某个 OU 或 CN 下的用户时使用。
- 可用于定期批量删除过期或不再使用的账户。

**核心命令**：

- `ldapsearch`：查询指定 OU/CN 下的用户 DN
- `ldapdelete`：按 DN 删除用户
- `-s one`：确保只查询当前层级的直系用户，不递归删除子 CN 下的用户

:::

```shell
cat > del-users-by-base-dn.sh << 'EOF'
#!/bin/bash
set -e

# ======================
# LDAP 配置
# ======================
BASE_SUFFIX="dc=ops,dc=com"
BIND_DN="cn=admin,${BASE_SUFFIX}"
BIND_PWD="admin"
LDAP_HOST="localhost"
LDAP_HOST_PORT="1389"

# ======================
# 用户输入 OU 和 CN
# ======================
read -p "请输入要删除的 OU (必填): " USER_OU
if [[ -z "$USER_OU" ]]; then
    echo "OU 不能为空，脚本退出."
    exit 1
fi

read -p "请输入 CN (可选，留空表示只删除 OU 下的直系用户，不删除子 CN 下用户): " USER_CN

# 构建 BASE DN
if [[ -n "$USER_CN" ]]; then
    BASE_DN="cn=${USER_CN},ou=${USER_OU},${BASE_SUFFIX}"
    SEARCH_SCOPE="one"  # CN 下直系用户
else
    BASE_DN="ou=${USER_OU},${BASE_SUFFIX}"
    SEARCH_SCOPE="one"  # OU 下直系用户
fi

# ======================
# 查询用户列表
# ======================
USER_DNS=$(ldapsearch -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} \
            -D "${BIND_DN}" -w "${BIND_PWD}" \
            -b "${BASE_DN}" -s ${SEARCH_SCOPE} "(uid=*)" dn | grep "^dn:" | awk '{print $2}')

if [[ -z "$USER_DNS" ]]; then
    echo "没有找到任何用户，脚本退出."
    exit 0
fi

echo "即将删除的用户位于: ${BASE_DN}"
echo "以下用户将被删除:"
for DN in $USER_DNS; do
    echo "  - ${DN}"
done

read -p "确认执行删除吗？[y/N] " CONFIRM </dev/tty
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "已取消删除操作."
    exit 0
fi

# ======================
# 批量删除用户
# ======================
TOTAL=0
SUCCESS=0
FAILURE=0

for DN in $USER_DNS; do
    TOTAL=$((TOTAL + 1))
    echo "正在删除 ${DN} ..."
    if ldapdelete -x -H ldap://${LDAP_HOST}:${LDAP_HOST_PORT} -D "${BIND_DN}" -w "${BIND_PWD}" "${DN}"; then
        echo "[${DN}] 删除成功."
        SUCCESS=$((SUCCESS + 1))
    else
        echo "[${DN}] 删除失败!"
        FAILURE=$((FAILURE + 1))
    fi
done

# ======================
# 打印统计结果
# ======================
echo "==============================="
echo "批量删除统计:"
echo "处理总用户数: ${TOTAL}"
echo "删除成功: ${SUCCESS}"
echo "删除失败: ${FAILURE}"
echo "==============================="
EOF
```



