[toc]



# gitlab配置文件修改记录

## gitlab修改时区

修改gitlab配置文件 `gitlab.rb`

```shell
修改
	gitlab_rails['time_zone'] = 'UTC'
	
修改为
	gitlab_rails['time_zone'] = 'Asia/Shanghai'
```



## gitlab修改默认80端口

修改 `/var/opt/gitlab/nginx/conf/gitlab-http.conf` 文件中 `listen` 配置项

:::说明

依次执行完命令  `gitlab-ctl restart` 和  `gitlab-ctl reconfigure` 后才会生成文件 `/var/opt/gitlab/nginx/conf/gitlab-http.conf`

:::

```nginx
server {
  listen *:80;
...
```



:::caution 注意

修改完后执行 `gitlab-ctl restart` 重启即可，不能执行 `gitlab-ctl reconfigure` 重载配置文件，否则会覆盖修改

:::



## gitlab修改密码策略（最小密码长度）

[官方文档：密码要求与弱密码拦截](https://docs.gitlab.com/user/profile/user_passwords/)

[官方文档：管理端密码策略配置](https://docs.gitlab.com/administration/settings/sign_up_restrictions/)

### 可配置项位置

管理端入口：`Admin Area` -> `Settings` -> `General` -> `Sign-up restrictions`（新版本改名为 `New user account restrictions`）

| 设置项 | 版本要求 | 说明 |
| ------ | -------- | ---- |
| `Minimum password length` | CE 可用 | 最小密码长度，取值 8~128，默认 8 |
| `Require numbers` | Premium/Ultimate | 要求包含数字 0-9 |
| `Require uppercase letters` | Premium/Ultimate | 要求包含大写字母 |
| `Require lowercase letters` | Premium/Ultimate | 要求包含小写字母 |
| `Require symbols` | Premium/Ultimate | 要求包含符号 |

:::caution 注意

- 复杂度要求（数字/大小写/符号）是 **Premium/Ultimate 付费功能**，CE 版没有，CE 只能改最小密码长度
- 策略修改只对 **新注册用户** 和 **重置密码** 生效，不影响已有用户的密码

:::

### 内置弱密码拦截（不可关闭）

GitLab 15.7 起默认强制启用弱密码拦截，报错如下

```shell
Password must not contain commonly used combinations of words and letters
```

判定为弱密码的条件

- 命中 4500+ 已知泄露密码列表
- 包含姓名、用户名或邮箱的一部分
- 包含可预测的常见词（如 `gitlab`、`devops`）

:::tip 说明

该检查没有管理端开关，也不能自定义黑名单，更换更长更随机的密码即可通过

:::
