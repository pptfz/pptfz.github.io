# `ldap://` 和 `ldapi://` 协议区别

## `ldap://`



```shell
ldapsearch -H ldap://localhost:1389 -D "cn=admin,cn=config" -W -b "olcDatabase={2}mdb,cn=config" olcAccess
```

- **协议**：TCP (`ldap://localhost:1389`)
- **认证方式**：简单绑定（Simple Bind）
- **用户**：`cn=admin,cn=config`
- **需要密码**：是（通过 `-W` 输入）
- **场景**：远程访问、普通用户或配置管理员账号登录



## `ldapi://`

```shell
ldapsearch -H ldapi:/// -Y EXTERNAL -b "olcDatabase={2}mdb,cn=config" olcAccess
```

- **协议**：`ldapi:///` → 使用本地 **UNIX 域套接字**（不走 TCP/IP，直接在文件系统里通信）
- **认证方式**：SASL EXTERNAL → 用当前系统进程的 **操作系统身份** 来认证
- **用户**：一般是运行 `slapd` 的系统用户（如 `root` 或 `openldap`）
- **需要密码**：否，因为是本地 root/特权用户认证
- **场景**：本地运维时直接用 root 权限操作配置（不需要知道 `cn=config` 的密码）



## 为什么 `ldapi://` 不需要密码？

- 因为 **ldapi:/// + SASL/EXTERNAL** 会让 OpenLDAP 根据调用者的系统 UID/GID 进行认证。
- 如果你是 root（或 slapd 进程运行的用户），LDAP 服务器直接信任，不再要求输入密码。
- 类似于 Linux 上的 `sudo` 或 MySQL 的 `auth_socket` 插件。





## 总结对比

| 命令                                   | 协议        | 认证方式      | 是否需要密码 | 适用场景               |
| -------------------------------------- | ----------- | ------------- | ------------ | ---------------------- |
| `ldap:// + -D "cn=admin,cn=config" -W` | TCP/IP      | Simple Bind   | ✅ 需要       | 远程/标准账号登录      |
| `ldapi:/// -Y EXTERNAL`                | UNIX Socket | SASL EXTERNAL | ❌ 不需要     | 本地 root 直接管理配置 |

所以，**远程改配置用第一个，服务器本地改配置推荐用第二个（更安全、方便、不泄漏密码）**。











