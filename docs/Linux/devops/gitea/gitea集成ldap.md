# gitea集成ldap

[gitea集成ldap官方文档](https://docs.gitea.cn/usage/authentication?_highlight=ldap#ldapsimple-auth)



## 添加认证源

管理员右上角 `个人信息和配置` -> `管理后台` -> `身份及认证` -> `认证源` -> `添加认证源`

![iShot_2025-09-18_10.07.00](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-18_10.07.00.png)



ldap认证类型有 [LDAP (via BindDN)](https://docs.gitea.cn/usage/authentication#ldapvia-binddn) 和 [LDAP (simple auth)](https://docs.gitea.cn/usage/authentication#ldapsimple-auth) ，区别是 `via BindDN` 比 `simple auth` 多了用户搜索基准这一个必选项，例如 `ou=Users,dc=mydomain,dc=com`



ldap via BindDN 配置页面

![iShot_2025-09-18_10.15.34](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-18_10.15.34.png)

