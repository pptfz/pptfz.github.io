# gitlab配置文件修改记录

### gitlab修改时区

修改gitlab配置文件 `gitlab.rb`

```shell
修改
	gitlab_rails['time_zone'] = 'UTC'
	
修改为
	gitlab_rails['time_zone'] = 'Asia/Shanghai'
```



### gitlab修改默认80端口

**修改 `/var/opt/gitlab/nginx/conf/gitlab-http.conf` 文件中 `listen` 处**

⚠️ 依次执行完命令  `gitlab-ctl restart` 和  `gitlab-ctl reconfigure` 才会有文件 `/var/opt/gitlab/nginx/conf/gitlab-http.conf`

```shell
server {
  listen *:80;
...
```

⚠️ 修改完后执行 `gitlab-ctl restart`	重启即可，不能执行 `gitlab-ctl reconfigure` 重载配置文件，否则会覆盖修改