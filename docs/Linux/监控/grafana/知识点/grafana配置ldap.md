# grafana配置ldap

[grafana配置ldap官方文档](https://grafana.com/docs/grafana/latest/setup-grafana/configure-access/configure-authentication/ldap/)



## 启用ldap

编辑 `grafana.ini` ，在 `[auth.ldap]` 下将 `enabled` 修改为 `true` 

启用 ldap 后，默认行为是在成功进行 ldap 身份验证后自动创建 Grafana 用户，如果希望只有现有 Grafana 用户能够登录，则可以在 `[auth.ldap]` 部分中将 `allow_sign_up` 更改为 `false` ，一般会把 `allow_sign_up` 设置为 `true`

```ini
[auth.ldap]
# Set to `true` to enable LDAP integration (default: `false`)
enabled = true

# Path to the LDAP specific configuration file (default: `/etc/grafana/ldap.toml`)
config_file = /etc/grafana/ldap.toml

# Allow sign-up should be `true` (default) to allow Grafana to create users on successful LDAP authentication.
# If set to `false` only already existing Grafana users will be able to login.
allow_sign_up = true
```



## 禁用组织角色同步

如果使用 ldap 对用户进行身份验证，但不使用角色映射，并且更喜欢手动分配组织和角色，则可以使用 `skip_org_role_sync` 配置选项

编辑 `grafana.ini` ，在 `[auth.ldap]` 下将 `skip_org_role_sync` 修改为 `true` 

```ini
skip_org_role_sync = true
```



## 配置ldap

编辑 `ldap.toml` ，以下为 [官方配置示例](https://grafana.com/docs/grafana/latest/setup-grafana/configure-access/configure-authentication/ldap/#configuration-examples)

:::tip 说明

如果想要从多个组搜索用户，则可以修改 `search_base_dns` ，添加多个

```toml
# 从单个组搜索用户
search_base_dns = ["ou=ou_name1,dc=ops,dc=com"]

# 从多个组搜索用户
search_base_dns = ["ou=ou_name1,dc=ops,dc=com", "ou=ou_name2,dc=ops,dc=com"]
```

:::

```toml
[[servers]]
host = "10.0.0.99"
port = 389
use_ssl = false
start_tls = false
ssl_skip_verify = false
bind_dn = "cn=admin,dc=ops,dc=com"
bind_password = "xxx"
search_filter = "(cn=%s)"
search_base_dns = ["ou=ou_name1,dc=ops,dc=com"]

[servers.attributes]
member_of = "memberOf"
email =  "email"
```



### 配置项说明

#### `[[servers]]`

| 配置项            | 说明                                                         | 是否必须 |
| ----------------- | ------------------------------------------------------------ | -------- |
| `host`            | ldap地址                                                     | ✅        |
| `port`            | ldap端口                                                     | ✅        |
| `use_ssl`         | 使用ldaps协议                                                | ❌        |
| `start_tls`       | 使用带有 `starttls` 的ldap                                   | ❌        |
| `tls_ciphers`     | 允许使用的加密套件                                           | ❌        |
| `min_tls_version` | 允许的最低tls版本                                            | ❌        |
| `ssl_skip_verify` | 跳过ssl证书验证                                              | ❌        |
| `bind_dn`         | ldap完整dn，例如 `cn=admin,dc=ops,dc=com`                    | ✅        |
| `bind_password`   | 完整dn密码                                                   | ✅        |
| `search_filter`   | 用户搜索规则                                                 | ✅        |
| `search_base_dns` | 搜索用户或组的起始位置，可以写一个 `search_base_dns = ["ou=ou_name1,dc=ops,dc=com"]`，也可以写多个 `search_base_dns = ["ou=ou_name1,dc=ops,dc=com", "ou=ou_name2,dc=ops,dc=com"]` | ✅        |



#### `[servers.attributes]`

:::tip 说明

除了 `username` 是必须项外，其余的都是非必须的，但是建议全部填写上，这样登陆的用户映射的属性才会更全

:::

| 配置项      | 说明 | 是否必须 |
| ----------- | ---- | -------- |
| `name`      |      | ❌        |
| `surname`   |      | ❌        |
| `username`  |      | ✅        |
| `member_of` |      | ❌        |
| `email`     |      | ❌        |



#### `[[servers.group_mappings]]`

| 配置项     | 说明                                                         | 是否必须 |
| ---------- | ------------------------------------------------------------ | -------- |
| `group_dn` | LDAP 中的组 DN（Distinguished Name），用来匹配用户属于哪个 LDAP 组。例如：`cn=admins,ou=groups,dc=grafana,dc=org`。也可以用 `*` 通配符匹配所有用户。 | ❌        |
| `org_role` | Grafana 组织中的角色，可选值：`Admin`、`Editor`、`Viewer`，决定用户在组织中的权限 | ❌        |



示例

LDAP 组 `admins` 的用户会成为 Grafana 组织的 **Admin**

如果想让他们成为 Grafana 全局管理员，可以加 `grafana_admin = true`

```toml
[[servers.group_mappings]]
group_dn = "cn=admins,ou=groups,dc=grafana,dc=org"
org_role = "Admin"
```



LDAP 组 `editors` 的用户会成为 Grafana 组织的 **Editor**，只能编辑仪表盘和数据源等

```toml
[[servers.group_mappings]]
group_dn = "cn=editors,ou=groups,dc=grafana,dc=org"
org_role = "Editor"
```



`*` 表示匹配 **所有其他未匹配的 LDAP 用户**，这些用户在组织中只有 **Viewer** 权限，只能查看仪表盘，不能修改

```toml
[[servers.group_mappings]]
group_dn = "*"
org_role = "Viewer"
```

