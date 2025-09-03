
# ldap常用命令

LDAP（轻量级目录访问协议）常用命令可分为**查询类、添加类、修改类、删除类、导入导出类、测试连接类**几类



## 查询类

###  `ldapsearch`  

[ldapsearch命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapsearch)



#### 作用

用于查询 LDAP 数据



#### 基本格式

```bash
ldapsearch -x -H ldap://<host>:<port> -D "<bind_dn>" -w <password> -b "<base_dn>" "<filter>" <attributes>
```



#### 示例

:::tip 说明

使用 admin 身份登录到本地的 LDAP 服务器，从目录根 `dc=example,dc=com` 向下搜索所有条目，筛选出每条数据的 `cn` 和 `mail` 属性并显示出来

如果不加属性则显示所有

:::

```bash
ldapsearch -x -H ldap://localhost -D "cn=admin,dc=example,dc=com" -w admin -b "dc=example,dc=com" "(objectClass=*)" cn mail
```

| 选项/参数                         | 作用                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `ldapsearch`                      | LDAP 查询工具，用于从 LDAP 目录中检索条目。                  |
| `-x`                              | 使用 **简单认证（simple bind）**，不用 SASL。                |
| `-H ldap://localhost`             | 指定 LDAP 服务器地址（这里是本机 localhost，默认端口是 389）。 |
| `-D "cn=admin,dc=example,dc=com"` | 绑定（登录）用户 DN，这里是管理员。                          |
| `-w admin`                        | 绑定用户的密码（明文提供）。                                 |
| `-b "dc=example,dc=com"`          | 设置**搜索的起始节点（Base DN）**，表示从整个目录树的根节点 `dc=example,dc=com` 开始搜索。 |
| `"(objectClass=*)"`               | **过滤条件**，表示“所有对象”，即查询所有条目。               |
| `cn mail`                         | 表示：只显示每个结果中的 `cn`（Common Name） 和 `mail`（邮箱） 这两个字段。 |



#### 常见参数

| 参数   | 说明                                     |
| ------ | ---------------------------------------- |
| `-x`   | 使用简单认证（simple bind）              |
| `-H`   | LDAP URI                                 |
| `-D`   | 绑定 DN                                  |
| `-w`   | 绑定密码                                 |
| `-b`   | 搜索的 Base DN                           |
| `-s`   | 搜索范围（base、one、sub）               |
| `-LLL` | 去掉 LDAP 属性描述前的标签，常用于脚本中 |





## 添加类

###  `ldapadd`  

[ldapadd命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapadd)



#### 作用

用于添加条目到 LDAP



#### 格式

```bash
ldapadd -x -D "<bind_dn>" -w <password> -H ldap://<host> -f <ldif_file>
```



#### 示例

:::tip 说明

用管理员身份连接到本地的 LDAP 服务器，把 `user.ldif` 文件中定义的条目（如用户信息）添加到目录树中

:::

```bash
ldapadd -x -D "cn=admin,dc=example,dc=com" -w admin -H ldap://localhost -f user.ldif
```

| 参数/选项                         | 说明                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `ldapadd`                         | 命令名，表示向 LDAP 添加新条目（与 `ldapmodify` 类似，但只能用于新增）。 |
| `-x`                              | 使用简单认证（simple bind），而不是 SASL。                   |
| `-D "cn=admin,dc=example,dc=com"` | 要绑定（登录）的用户 DN，通常是管理员账号。                  |
| `-w admin`                        | 管理员的密码（明文）。                                       |
| `-H ldap://localhost`             | LDAP 服务器地址和协议（这里是本机）。                        |
| `-f user.ldif`                    | 指定要添加的数据文件，LDIF 是一种 LDAP 数据交换格式。        |



示例 LDIF 文件（`user.ldif`）

:::tip 说明

添加一个用户 `john` 到 `ou=users,dc=example,dc=com` 下，包含名字、邮箱、密码等字段

:::

```c
dn: uid=john,ou=users,dc=example,dc=com
objectClass: inetOrgPerson
cn: John Doe
sn: Doe
uid: john
mail: john@example.com
userPassword: secret
```





## 修改类

###  `ldapmodify`  

[ldapmodify命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapmodify)



#### 作用

用于修改已有条目



#### 格式

```bash
ldapmodify -x -D "<bind_dn>" -w <password> -H ldap://<host> -f <ldif_file>
```



#### 示例

:::tip 说明

修改 LDAP 中现有条目的属性

:::

```bash
ldapmodify -x -D "cn=admin,dc=example,dc=com" -w admin -H ldap://localhost -f modify.ldif
```

| 参数/选项                         | 说明                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `ldapmodify`                      | 用于对 LDAP 条目执行添加、修改、删除操作（基于 LDIF 格式）。 |
| `-x`                              | 使用简单认证（simple bind）。                                |
| `-D "cn=admin,dc=example,dc=com"` | 登录使用的管理员 DN。                                        |
| `-w admin`                        | 管理员密码（明文）。                                         |
| `-H ldap://localhost`             | 连接的 LDAP 服务器地址。                                     |
| `-f modify.ldif`                  | 修改操作的描述文件，格式是 LDIF（LDAP Data Interchange Format）。 |



示例 LDIF 修改文件（`modify.ldif`）

:::tip 说明

修改用户 john 的邮箱地址

`dn`: 指定要修改的条目

`changetype: modify`: 表示本次操作是修改

`replace`: 将原来的 `mail` 属性值替换为新的

`mail`: 新的值

:::

```c
dn: uid=john,ou=users,dc=example,dc=com
changetype: modify
replace: mail
mail: newjohn@example.com
```



可用操作类型

- `add`
- `delete`
- `replace`





## 删除类

###  `ldapdelete`  

[ldapdelete命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapdelete)



#### 作用

删除条目



#### 格式

```bash
ldapdelete -x -D "<bind_dn>" -w <password> -H ldap://<host> "<dn>"
```



#### 示例

:::tip 说明

从 LDAP 中删除一个条目，该命令会尝试以管理员身份连接到本地 LDAP 服务器，然后删除 DN 为 `uid=john,ou=users,dc=example,dc=com` 的条目

:::

```bash
ldapdelete -x -D "cn=admin,dc=example,dc=com" -w admin -H ldap://localhost "uid=john,ou=users,dc=example,dc=com"
```

| 参数/选项                               | 说明                                        |
| --------------------------------------- | ------------------------------------------- |
| `ldapdelete`                            | LDAP 删除工具，用于删除一个或多个目录条目。 |
| `-x`                                    | 使用简单认证（simple bind），而非 SASL。    |
| `-D "cn=admin,dc=example,dc=com"`       | 登录使用的管理员 DN。                       |
| `-w admin`                              | 管理员的密码（明文）。                      |
| `-H ldap://localhost`                   | 连接的 LDAP 服务器（本地）。                |
| `"uid=john,ou=users,dc=example,dc=com"` | 要删除的条目的 DN。                         |



#### 注意事项

父子条目关系：

- 如果该条目下还有子条目（如 `uid=john,...` 下有 `cn=group,...`），删除会失败，返回：

  :::tip 解决方法

  必须先删除所有子条目，才能删除父条目

  :::

  ```shell
  ldap_delete: Constraint violation (66)
  additional info: not allowed to delete a non-leaf entry
  ```

权限问题：

- 当前绑定用户需要有删除权限，否则返回：

  ```shell
  ldap_delete: Insufficient access (50)
  ```



#### 批量删除

```shell
ldapdelete -x -D "cn=admin,dc=example,dc=com" -w admin -H ldap://localhost -f delete-list.txt
```



`delete-list.txt` 文件内容

```shell
uid=alice,ou=users,dc=example,dc=com
uid=bob,ou=users,dc=example,dc=com
```



## 导入导出类

### 导出数据：`slapcat`

[slapcat命令官方文档](https://www.openldap.org/software/man.cgi?query=slapcat)



#### 作用

从 LDAP 数据库中导出数据（不需认证，直接读取数据库）



#### 格式

```bash
slapcat -n <database_number> -l <output.ldif>
```



#### 示例

:::tip 说明

从 OpenLDAP 的数据库中导出数据到一个 LDIF 文件，主要用于备份或迁移

从 `slapd` 配置中编号为 `1` 的数据库中导出所有条目，并保存为 `backup.ldif` 文件

:::

```bash
slapcat -n 1 -l backup.ldif
```

| 参数/选项        | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `slapcat`        | OpenLDAP 提供的工具，用于**导出整个 LDAP 数据库内容**。不通过 LDAP 协议，直接读数据库文件。 |
| `-n 1`           | 指定要导出的数据库编号（通常 `1` 是你的主目录数据库）。      |
| `-l backup.ldif` | 将导出的数据保存为 `backup.ldif` 文件。                      |



#### 注意事项

在执行导出数据钱要先确认一下主数据库的编号，一般是 `olcDatabase={X}hdb`、`mdb` 或 `bdb` 类型，这里的主数据库编号是2，类型是hdb

```shell
$ slapcat -F /etc/openldap/slapd.d -n 0 | grep "^dn:"
dn: cn=config
dn: cn=schema,cn=config
dn: cn={0}core,cn=schema,cn=config
dn: cn={1}cosine,cn=schema,cn=config
dn: cn={2}inetorgperson,cn=schema,cn=config
dn: cn={3}nis,cn=schema,cn=config
dn: cn={4}ppolicy,cn=schema,cn=config
dn: cn={5}openldap,cn=schema,cn=config
dn: cn={6}collective,cn=schema,cn=config
dn: olcDatabase={-1}frontend,cn=config
dn: olcDatabase={0}config,cn=config
dn: olcDatabase={1}monitor,cn=config
dn: olcDatabase={2}hdb,cn=config
```





#### 特殊说明

:::caution 注意

如果是使用的 [bitnami](https://hub.docker.com/r/bitnami/openldap) 镜像，则无法使用 `slapcat` 命令进行数据导出，需要使用如下命令进行数据导出

:::

```shell
ldapsearch -x -D "cn=admin,dc=ops,dc=com" -w admin -H ldap://localhost:1389 -b "dc=ops,dc=com" "(objectClass=*)" > /tmp/backup
```



### 导入数据：`slapadd`

[slapadd命令官方文档](https://www.openldap.org/software/man.cgi?query=slapadd)



#### 作用

将 LDIF 文件导入数据库（通常用于初始化或恢复，需关闭 slapd 服务）



#### 格式

```bash
slapadd -n <database_number> -l <input.ldif>
```



#### 示例

```bash
slapadd -n 1 -l backup.ldif
```





## 测试连接类

###  `ldapwhoami`

[ldapwhoami命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapwhoami)



#### 作用

测试身份绑定，确认认证是否成功



#### 格式

```bash
ldapwhoami -x -D "<bind_dn>" -w <password> -H ldap://<host>
```



#### 示例

```bash
ldapwhoami -x -D "cn=admin,dc=example,dc=com" -w admin -H ldap://localhost
```



### `ldapcompare`

[ldapcompare命令官方文档](https://www.openldap.org/software/man.cgi?query=ldapcompare)



#### 作用

用于比较某个属性的值



#### 示例

```bash
ldapcompare -x -D "cn=admin,dc=example,dc=com" -w admin "uid=john,ou=users,dc=example,dc=com" "mail:john@example.com"
```



## 常见辅助命令

### `ldappasswd`

[ldappasswd命令官方文档](https://www.openldap.org/software/man.cgi?query=ldappasswd)

#### 作用

修改用户密码



#### 示例

```bash
ldappasswd -x -D "cn=admin,dc=example,dc=com" -w admin   -s newpassword "uid=john,ou=users,dc=example,dc=com"
```



### `slaptest`

验证文件格式





### `ldapurl`：解析 LDAP URL









