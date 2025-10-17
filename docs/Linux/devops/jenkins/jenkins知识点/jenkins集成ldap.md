# jenkins集成ldap

## 安装ldap插件

[jenkins ldap插件官方文档](https://plugins.jenkins.io/ldap/)



在插件中心搜索 `LDAP Plugin`

![iShot_2025-09-29_19.16.28](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-29_19.16.28.png)





## 配置ldap

`系统管理` -> `安全` -> `全局安全配置` -> `安全域`

![iShot_2025-10-13_16.40.20](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-10-13_16.40.20.png)





- `Server`

  ```shell
  10.0.0.99:389
  ```

- `root DN`

  ```shell
  dc=ops,dc=com
  ```

- `User search base`

  :::caution 注意

  jenkins这里的 `User search base` ，也就是用户搜索基准，和其他的平台不太一样，必须填写成 `ou=xxx` 这样，不可以写成完整的 `ou=ou_name1,dc=ops,dc=com`

  :::

  ```shell
  ou=ou_name1
  ```

- `User search filter`

  默认即可

  ```shell
  uid={0}
  ```

- `Manager DN/Manager Password`

  ```shell
  cn=admin,dc=ops,dc=com
  ```



- `Display Name LDAP attribute`

  :::tip 说明

  指定用户的显示名称，支持的属性如下

  - `hasSubordinates`
  - `mail`
  - `gidNumber`
  - `cn`
  - `structuralObjectClass`
  - `modifiersName`
  - `creatorsName`
  - `objectClass`
  - `loginShell`
  - `userPassword`
  - `subschemaSubentry`
  - `uid`
  - `entryUUID`
  - `uidNumber`
  - `homeDirectory`
  - `createTimestamp`
  - `entryCSN`
  - `sn`
  - `modifyTimestamp`
  - `entryDN`

  :::

  ```shell
  sn
  ```

  









