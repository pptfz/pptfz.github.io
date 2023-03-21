# openvpn对接ldap

# 1.安装 openvpn ldap认证插件

```shell
yum -y install openvpn-auth-ldap
```



# 2.修改 openvpn ldap认证文件 

修改 `/etc/openvpn/auth/ldap.conf` 

```shell
<LDAP>
    URL        ldap://xxx:389　　# 指定ldap server地址以及端口
    BindDN    "cn=xxx,dc=xxx,dc=com"　　     # 指定binddn信息即管理员信息
    Password    "xxx"　　　　　　　　　　　     # 指定管理员密码
    Timeout        15　　										# 设置网络超时时间
    TLSEnable    no												# 是否使用TLS
    FollowReferrals yes
</LDAP>
<Authorization>
    BaseDN        "dc=xxx,dc=com"　　        # 指定base dn 域
    SearchFilter    "uid=%u"　　　       # 指定搜索条件，此处若使用cn作为用户名，则不用修改，默认为 (&(uid=%u)(accountStatus=active)) ，但是不好使，原因未知
    RequireGroup    false
</Authorization>
```



`/etc/openvpn/auth/ldap.conf` 默认内容如下

```shell
<LDAP>
	# LDAP server URL
	URL		ldap://ldap1.example.org

	# Bind DN (If your LDAP server doesn't support anonymous binds)
	# BindDN		uid=Manager,ou=People,dc=example,dc=com

	# Bind Password
	# Password	SecretPassword

	# Network timeout (in seconds)
	Timeout		15

	# Enable Start TLS
	TLSEnable	yes

	# Follow LDAP Referrals (anonymously)
	FollowReferrals yes

	# TLS CA Certificate File
	TLSCACertFile	/usr/local/etc/ssl/ca.pem

	# TLS CA Certificate Directory
	TLSCACertDir	/etc/ssl/certs

	# Client Certificate and key
	# If TLS client authentication is required
	TLSCertFile	/usr/local/etc/ssl/client-cert.pem
	TLSKeyFile	/usr/local/etc/ssl/client-key.pem

	# Cipher Suite
	# The defaults are usually fine here
	# TLSCipherSuite	ALL:!ADH:@STRENGTH
</LDAP>

<Authorization>
	# Base DN
	BaseDN		"ou=People,dc=example,dc=com"

	# User Search Filter
	SearchFilter	"(&(uid=%u)(accountStatus=active))"

	# Require Group Membership
	RequireGroup	false

	# Add non-group members to a PF table (disabled)
	#PFTable	ips_vpn_users

	<Group>
		BaseDN		"ou=Groups,dc=example,dc=com"
		SearchFilter	"(|(cn=developers)(cn=artists))"
		MemberAttribute	uniqueMember
		# Add group members to a PF table (disabled)
		#PFTable	ips_vpn_eng
	</Group>
</Authorization>
```



# 3.修改 openvpn 配置文件

修改 `/etc/openvpn/server/server.conf `新增如下两行

```shell
# 指定ldap认证插件地址，此处操作系统为64位。并指定auth ldap认证配置文件位置。
plugin /usr/lib64/openvpn/plugin/lib/openvpn-auth-ldap.so "/etc/openvpn/auth/ldap.conf %u" 

# 设置客户端可以不用通过证书认证，输入ldap中用户名和密码即可实现认证。
client-cert-not-required
```



# 4.修改openvpn客户端文件

修改 `client.ovpn` （此文件为安装openvpn时指定的以 `ovpn` 结尾的文件）

```shell
;cert xxx.crt                                  # 客户端证书，因使用ldap认证，所以注释
;key xxx.key                                   # 客户端密钥，因使用ldap认证，所以注释
auth-user-pass																# 开启用户名密码认证
```

