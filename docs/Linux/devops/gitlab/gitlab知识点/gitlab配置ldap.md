[toc]

# gitlab配置ldap

[gitlab官方文档总地址](https://docs.gitlab.com/)

[gitlab配置ldap官方文档](https://docs.gitlab.com/ee/administration/auth/ldap/#general-ldap-setup)



官方文档配置示例

```shell
gitlab_rails['ldap_enabled'] = true
gitlab_rails['prevent_ldap_sign_in'] = false
gitlab_rails['ldap_servers'] = {
'main' => {
  'label' => 'LDAP',
  'host' =>  'ldap.mydomain.com',
  'port' => 389,
  'uid' => 'sAMAccountName',
  'encryption' => 'simple_tls',
  'verify_certificates' => true,
  'bind_dn' => '_the_full_dn_of_the_user_you_will_bind_with',
  'password' => '_the_password_of_the_bind_user',
  'verify_certificates' => true,
  'tls_options' => {
    'ca_file' => '',
    'ssl_version' => '',
    'ciphers' => '',
    'cert' => '',
    'key' => ''
  },
  'timeout' => 10,
  'active_directory' => true,
  'allow_username_or_email_login' => false,
  'block_auto_created_users' => false,
  'base' => 'dc=example,dc=com',
  'user_filter' => '',
  'attributes' => {
    'username' => ['uid', 'userid', 'sAMAccountName'],
    'email' => ['mail', 'email', 'userPrincipalName'],
    'name' => 'cn',
    'first_name' => 'givenName',
    'last_name' => 'sn'
  },
  'lowercase_usernames' => false,

  # EE Only
  'group_base' => '',
  'admin_group' => '',
  'external_groups' => [],
  'sync_ssh_keys' => false
  }
}
```



`gitlab.rb` 配置文件默认配置，默认是有主从配置的

```shell
###! **remember to close this block with 'EOS' below**
# gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'
#   main: # 'main' is the GitLab 'provider ID' of this LDAP server
#     label: 'LDAP'
#     host: '_your_ldap_server'
#     port: 389
#     uid: 'sAMAccountName'
#     bind_dn: '_the_full_dn_of_the_user_you_will_bind_with'
#     password: '_the_password_of_the_bind_user'
#     encryption: 'plain' # "start_tls" or "simple_tls" or "plain"
#     verify_certificates: true
#     smartcard_auth: false
#     active_directory: true
#     allow_username_or_email_login: false
#     lowercase_usernames: false
#     block_auto_created_users: false
#     base: ''
#     user_filter: ''
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
#
#   secondary: # 'secondary' is the GitLab 'provider ID' of second LDAP server
#     label: 'LDAP'
#     host: '_your_ldap_server'
#     port: 389
#     uid: 'sAMAccountName'
#     bind_dn: '_the_full_dn_of_the_user_you_will_bind_with'
#     password: '_the_password_of_the_bind_user'
#     encryption: 'plain' # "start_tls" or "simple_tls" or "plain"
#     verify_certificates: true
#     smartcard_auth: false
#     active_directory: true
#     allow_username_or_email_login: false
#     lowercase_usernames: false
#     block_auto_created_users: false
#     base: ''
#     user_filter: ''
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
# EOS
```



如果ldap是单点，则只需要修改为如下内容即可

```shell
gitlab_rails['ldap_enabled'] = true	# 允许ldap，true为开启
gitlab_rails['prevent_ldap_sign_in'] = false	# 拒绝ldap登陆，false为关闭
gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'
  main: # 'main' is the GitLab 'provider ID' of this LDAP server
    label: 'LDAP'	# gitlab登陆页面显示的内容，名称任意，最好设置为LDAP
    host: '10.0.0.10'	# ldap服务地址
    port: 389	# ldap服务端口
    uid: 'uid'	# 登陆名字使用字段
    bind_dn: 'cn=admin.dc=xxx.dc=com'	# ldap管理员账号
    password: 'xxx'	# ldap管理员密码
    encryption: 'plain' # "start_tls" or "simple_tls" or "plain" 加密方法
    verify_certificates: true	# 启用ssl证书验证
    smartcard_auth: false
    active_directory: true	# 此设置指定LDAP服务器是否为Active Directory LDAP服务器。对于非AD服务器，它会跳过特定于AD的查询。如果您的LDAP服务器不是AD，请将此设置为false。
    allow_username_or_email_login: false	# 如果启用，GitLab将忽略用户在登录时提交的LDAP用户名中第一个@之后的所有内容。如果您在ActiveDirectory上使用uid: 'userPrincipalName'，您必须禁用此设置，因为userPrincipalName包含@。
    lowercase_usernames: false	# 如果启用，GitLab会将名称转换为小写。
    block_auto_created_users: false	# 为了严格控制GitLab安装中计费用户的数量，可以启用此设置来阻止新用户，直到管理员清除他们(默认值:false)。
    base: 'cn=gitlab,dc=xxx,dc=com'	# 用户搜索规则
    user_filter: ''	# ldap用户过滤规则
    ## EE only
    group_base: ''
    admin_group: ''
    sync_ssh_keys: false
EOS
```



配置完成后需要执行 `gitlab-ctl reconfigure` 使配置生效



**基本配置项说明**

| 配置项                        | 说明                                                         | 是否必须 | 示例                                                         |
| ----------------------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| label                         | ldap服务名称                                                 | ✅ 是     | `'Paris'`  or `'Acme, Ltd.'`                                 |
| host                          | ldap服务器地址                                               | ✅ 是     | `'ldap.mydomain.com'`                                        |
| port                          | ldap服务器端口                                               | ✅ 是     | `389` or `636` (for SSL)                                     |
| uid                           | 用户名的LDAP属性。应该是属性，而不是映射到uid的值。          | ✅ 是     | `'sAMAccountName'` or `'uid'` or `'userPrincipalName'`       |
| bind_dn                       | 绑定的用户的完整DN。                                         | ⭕️ 否     | `'america\momo'` or `'CN=Gitlab,OU=Users,DC=domain,DC=com'`  |
| password                      | 绑定用户的密码。                                             | ⭕️ 否     | `'your_great_password'`                                      |
| encryption                    | 加密方法                                                     | ✅ 是     | `'start_tls'` or `'simple_tls'` or `'plain'`                 |
| verify_certificates           | 当加密方法为start_tls或simple_tls时，启用SSL证书验证。默认值为true。 | ⭕️ 否     | boolean                                                      |
| timeout                       | 设置LDAP查询的超时时间，单位为秒。这有助于避免在LDAP服务器失去响应时阻塞请求。值为0表示没有超时。(默认值:10) | ⭕️ 否     | `10` or `30`                                                 |
| active_directory              | 此设置指定LDAP服务器是否为Active Directory LDAP服务器。对于非AD服务器，它会跳过特定于AD的查询。如果您的LDAP服务器不是AD，请将此设置为false。 | ⭕️ 否     | boolean                                                      |
| allow_username_or_email_login | 如果启用，GitLab将忽略用户在登录时提交的LDAP用户名中第一个@之后的所有内容。如果您在ActiveDirectory上使用uid: 'userPrincipalName'，您必须禁用此设置，因为userPrincipalName包含@。 | ⭕️ 否     | boolean                                                      |
| block_auto_created_users      | 为了严格控制GitLab安装中计费用户的数量，可以启用此设置来阻止新用户，直到管理员清除他们(默认值:false)。 | ⭕️ 否     | boolean                                                      |
| base                          | 搜索用户规则                                                 | ✅ 是     | `'ou=people,dc=gitlab,dc=example'` or `'DC=mydomain,DC=com'` |
| user_filter                   | LDAP用户进行过滤。注意:GitLab不支持omniauth-ldap的自定义过滤器语法。 | ⭕️ 否     | For examples, read [Examples of user filters](https://docs.gitlab.com/ee/administration/auth/ldap/#examples-of-user-filters) |
| lowercase_usernames           | 如果启用，GitLab会将名称转换为小写。                         | ⭕️ 否     | boolean                                                      |
| retry_empty_result_with_codes | 如果结果/内容为空，则尝试重试操作的LDAP查询响应代码数组。对于谷歌安全LDAP，将该值设置为[80]。 | ⭕️ 否     | `[80]`                                                       |



**SSL配置项说明**

| 配置项      | 说明                                                         | 是否必须 | 示例                                                         |
| ----------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| ca_file     | 指定包含pem格式CA证书的文件的路径，例如，如果您需要一个内部CA。 | ⭕️ 否     | `'/etc/ca.pem'`                                              |
| ssl_version | 如果OpenSSL的默认版本不合适，则指定OpenSSL使用的SSL版本。    | ⭕️ 否     | `'TLSv1_1'`                                                  |
| ciphers     | 与LDAP服务器通信时使用的特定SSL密码。                        | ⭕️ 否     | `'ALL:!EXPORT:!LOW:!aNULL:!eNULL:!SSLv2'`                    |
| cert        | 客户端证书。                                                 | ⭕️ 否     | `'-----BEGIN CERTIFICATE----- <REDACTED> -----END CERTIFICATE -----'` |
| key         | 客户端私钥。                                                 | ⭕️ 否     | `'-----BEGIN PRIVATE KEY----- <REDACTED> -----END PRIVATE KEY -----'` |



**属性配置项说明**

> GitLab用于为LDAP用户创建帐户的LDAP属性。指定的属性可以是字符串形式的属性名(例如，`'mail'`)，也可以是要按顺序尝试的属性名数组(例如，[`'mail'`，`'email'`])。用户的LDAP登录是上面作为uid指定的属性。



| 配置项     | 说明                                                         | 是否必须 | 示例                                                         |
| ---------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| username   | 用户名用于用户自己的项目的路径(如 `gitlab.example.com/username/project` )，当在问题中提到它们时，合并请求和评论(如 `@username` )。如果为 `username` 指定的属性包含电子邮件地址，则GitLab用户名是 `@` 之前的电子邮件地址的一部分。 | ⭕️ 否     | `['uid', 'userid', 'sAMAccountName']`                        |
| email      | 用户邮箱的LDAP属性。                                         | ⭕️ 否     | `['mail', 'email', 'userPrincipalName']`                     |
| name       | 用户显示名的LDAP属性。如果 `name` 为空，则全名取自 `first_name` 和`last_name`。 | ⭕️ 否     | 属性`'cn'`或`'displayName'`通常带有全名。或者，您可以通过指定一个不存在的属性(如`'somethingNonExistent'`)来强制使用`first_name`和`last_name`。 |
| first_name | 用户名的LDAP属性。当为`name`配置的属性不存在时使用。         | ⭕️ 否     | `'givenName'`                                                |
| last_name  | 用户姓的LDAP属性。当为`name`配置的属性不存在时使用。         | ⭕️ 否     | `'sn'`                                                       |



**LDAP同步配置项说明**

| 配置项          | 说明                                                         | 是否必须 | 示例                                    |
| --------------- | ------------------------------------------------------------ | -------- | --------------------------------------- |
| group_base      | 用于搜索组的基数。                                           | ⭕️ 否     | `'ou=groups,dc=gitlab,dc=example'`      |
| admin_group     | 包含GitLab管理员的组的CN。注意:不是`cn=administrators`或完整DN。 | ⭕️ 否     | `'administrators'`                      |
| external_groups | 包含应被视为外部用户的组的CNs数组。注意:不是`cn=interns`或完整的DN。 | ⭕️ 否     | `['interns', 'contractors']`            |
| sync_ssh_keys   | The LDAP attribute containing a user’s public SSH key.       | ⭕️ 否     | `'sshPublicKey'`，如果没有设置则为false |

