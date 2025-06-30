[toc]



# gitlab备份

[gitlab备份恢复官方文档](https://docs.gitlab.com/ee/raketasks/backup_restore.html)

官方文档中写的很详细了，这里示例的版本是 10.6 ，只列出了几个比较常用的命令

:::caution 注意

gitlab备份的时候gitlab必须处于运行状态

:::

## 1.gitlab的备份目录路径设置

:::tip 说明

修改以下配置需要执行命令 `gitlab-ctl reconfigure` 生效

rpm包安装的gitlab配置文件是 `/etc/gitlab/gitlab.rb`，docker安装的gitlab配置文件是 `volume path/config/gitlab.rb`

:::



```shell
# 自定义备份路径
gitlab_rails['manage_backup_path'] = true

# gitlab备份目录
gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"  

# 生成的备份文件权限
gitlab_rails['backup_archive_permissions'] = 0644  

# 备份保留天数为3个月（即90天，这里是7776000秒，单位是秒）
gitlab_rails['backup_keep_time'] = 7776000              
```



## 2.设置gitlab备份

[helm安装备份官方文档](https://docs.gitlab.com/charts/backup-restore/)

[operator安装备份官方文档](https://docs.gitlab.com/operator/backup_and_restore.html)



### 2.1 备份应用程序数据

#### 2.1.1 linux包安装

[linux包安装备份官方文档](https://docs.gitlab.com/omnibus/settings/backups.html#backup-and-restore-configuration-on-a-linux-package-installation)

gitLab 12.2或更高版本除了可以运行 `gitlab-rake gitlab:backup:create CRON=1` 进行备份外还可以执行以下命令进行备份

:::tip 说明

也可以直接执行 `gitlab-backup` 不加 `create`

:::

```shell
gitlab-backup create
```



gitLab 12.1和更早版本执行以下命令进行备份

:::tip 说明

环境变量 `CRON=1` 的作用是如果没有任何错误发生时， 隐藏备份脚本的所有进度输出

:::

```shell
gitlab-rake gitlab:backup:create CRON=1
```



执行后会在 `/var/opt/gitlab/backups` 目录下生成 `1727089051_2024_09_23_17.4.0_gitlab_backup.tar` 格式的备份文件，其中 ``1727089051` 是时间戳，可以在 [时间戳换算网站](https://www.unixtimestamp.com/) 进行换算，或者通过命令进行换算

```shell
$ date -d @1727089051
Mon Sep 23 18:57:31 CST 2024
```



可以配合计划任务每天定时备份

```shell
00 1 * * * gitlab-backup create
```



#### 2.1.2 docker安装

[docker安装备份官方文档](https://docs.gitlab.com/omnibus/settings/backups.html#creating-backups-for-gitlab-instances-in-docker-containers)



```shell
docker exec -t gitlab gitlab-backup
```



```shell
docker exec -t gitlab /bin/sh -c 'gitlab-rake gitlab:backup:create'
```



![iShot_2024-09-02_19.12.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-02_19.12.06.png)



可以配合计划任务每天定时备份

```shell
00 1 * * * docker exec -t gitlab /bin/bash -c 'gitlab-rake gitlab:backup:create CRON=1'
```





### 2.2 备份配置文件和密钥

#### 2.2.1 linux包安装

gitlab12.3以前的版本需要手动备配置文件和密钥文件

```shell
# gitlab密钥文件
/etc/gitlab/gitlab-secrets.json

# gitlab配置文件
/etc/gitlab/gitlab.rb
```



gitlab12.3或更高版本可以使用 `gitlab-ctl backup-etc` 命令备份配置文件和密钥

```shell
$ gitlab-ctl backup-etc
Could not find '/etc/gitlab/config_backup' directory. Creating.
Running configuration backup
Creating configuration backup archive: gitlab_config_1726817500_2024_09_20.tar
/etc/gitlab/
/etc/gitlab/ssh_host_ecdsa_key
/etc/gitlab/ssh_host_rsa_key
/etc/gitlab/gitlab.rb
/etc/gitlab/ssh_host_rsa_key.pub
/etc/gitlab/ssh_host_ed25519_key.pub
/etc/gitlab/gitlab-secrets.json
/etc/gitlab/trusted-certs/
/etc/gitlab/ssh_host_ecdsa_key.pub
/etc/gitlab/initial_root_password
/etc/gitlab/ssh_host_ed25519_key
Configuration backup archive complete: /etc/gitlab/config_backup/gitlab_config_1726817500_2024_09_20.tar
Keeping all older configuration backups
```



#### 2.2.2 docker安装

:::tip 说明

执行 `gitlab-ctl backup-etc` 命令会把 `/etc/gitlab`  目录进行备份并命令为类似 `gitlab_config_1727250039_2024_09_25.tar` 的格式，其中 `1727250039` 是时间戳

```shell
$ date -d @1727250039
Wed Sep 25 07:40:39 UTC 2024
```

:::



```shell
docker exec -t gitlab /bin/sh -c 'gitlab-ctl backup-etc && cd /etc/gitlab/config_backup && cp $(ls -t | head -n1) /var/opt/gitlab/backups/'
```



## 3.gitlab恢复

[gitlab恢复官方文档](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html)

### 3.1 恢复先决条件

[gitlab恢复必要条件官方文档](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html#restore-prerequisites)

- 目标gitlab必须处于运行状态
- 目标gitlab必须与原备份gitlab具有相同的版本
- 必须恢复gitlab密钥
- gitlab配置必须与原始备份环境匹配
- 如果要还原到作为挂载点的目录中，则必须确保这些目录为空，然后再尝试还原



### 3.2 恢复gitlab备份

#### 3.2.1 恢复应用程序数据

#####  3.2.1.1 linux包安装

[linux包安装恢复官方文档](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html#restore-for-linux-package-installations)

:::tip 说明

- 确保备份文件位于 `/etc/gitlab/gitlab.rb` 中指定的 `gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"` 目录中，如果自定义了其他目录，则需要进入到这个目录中进行恢复

- 备份文件全选需要由 `git` 用户所有

:::



先停止相关数据连接服务

:::tip 说明

不同版本的gitlab服务可能有变动，具体请查看 [官方文档](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html)

:::

```shell
gitlab-ctl stop puma
gitlab-ctl stop sidekiq
```



确认数据连接服务已经停止

```shell
$ gitlab-ctl status
run: alertmanager: (pid 35069) 101513s; run: log: (pid 34770) 101554s
run: gitaly: (pid 35032) 101515s; run: log: (pid 33522) 101706s
run: gitlab-exporter: (pid 35041) 101515s; run: log: (pid 34484) 101572s
run: gitlab-kas: (pid 33940) 101686s; run: log: (pid 33966) 101683s
run: gitlab-workhorse: (pid 35001) 101516s; run: log: (pid 34379) 101589s
run: logrotate: (pid 524391) 921s; run: log: (pid 33436) 101720s
run: nginx: (pid 35015) 101516s; run: log: (pid 34417) 101582s
run: node-exporter: (pid 35026) 101515s; run: log: (pid 34463) 101576s
run: postgres-exporter: (pid 35081) 101512s; run: log: (pid 34796) 101548s
run: postgresql: (pid 33569) 101693s; run: log: (pid 33580) 101690s
run: prometheus: (pid 35053) 101514s; run: log: (pid 34741) 101560s
down: puma: 15s, normally up; run: log: (pid 34303) 101601s
run: redis: (pid 33464) 101715s; run: log: (pid 33474) 101714s
run: redis-exporter: (pid 35044) 101514s; run: log: (pid 34714) 101565s
down: sidekiq: 3s, normally up; run: log: (pid 34339) 101595s
```



恢复gitlab数据，中间需要输入两次 yes，BACKUP后面就是要恢复的备份压缩文件时间名称部分

:::caution 注意

gitlab的恢复操作会先将当前所有的数据清空，然后再根据备份数据进行恢复

:::

低版本

```shell
gitlab-rake gitlab:backup:restore BACKUP=1605454369_2020_11_15_10.6.1
```



高版本

```shell
gitlab-backup restore BACKUP=1727089051_2024_09_23_17.4.0
```



恢复完成后启动gitlab

```shell
gitlab-ctl restart
```



恢复命令完成后，可以check检查一下恢复情况

```shell
gitlab-rake gitlab:check SANITIZE=true
```



验证数据库值是否可以解密，可以查看 [官方文档](https://docs.gitlab.com/ee/administration/raketasks/check.html#verify-database-values-can-be-decrypted-using-the-current-secrets)

```shell
gitlab-rake gitlab:doctor:secrets
```



为了增加保证，还可以对上传的文件进行 [完整性检查](https://docs.gitlab.com/ee/administration/raketasks/check.html#uploaded-files-integrity)

```shell
gitlab-rake gitlab:artifacts:check
gitlab-rake gitlab:lfs:check
gitlab-rake gitlab:uploads:check
```



还原完成后，建议生成数据库统计信息，以提高数据库性能并避免 UI 不一致

进入 [database console](https://docs.gitlab.com/omnibus/settings/database.html#connecting-to-the-postgresql-database)

```shell
$ gitlab-rails dbconsole --database main
psql (14.11)
Type "help" for help.

gitlabhq_production=> 
```



运行以下命令

```sql
SET STATEMENT_TIMEOUT=0 ; ANALYZE VERBOSE;
```



##### 3.2.1.2 docker安装

[docker安装恢复](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html#restore-for-docker-image-installations)

停止与数据库连接的进程

```shell
docker exec -it gitlab gitlab-ctl stop puma
docker exec -it gitlab gitlab-ctl stop sidekiq
```



查看进程状态

```shell
docker exec -it gitlab gitlab-ctl status
```



进行恢复

```shell
docker exec -it gitlab gitlab-backup restore BACKUP=1727252667_2024_09_25_16.1.7
```



重启容器

```sh
docker restart gitlab
```



进行一下恢复后的检查

```shell
docker exec -it gitlab gitlab-rake gitlab:check SANITIZE=true
```



#### 3.2.2 恢复配置文件和密钥

主要是恢复以下2个文件

```shell
# gitlab密钥文件
/etc/gitlab/gitlab-secrets.json

# gitlab配置文件
/etc/gitlab/gitlab.rb
```



执行 `gitlab-ctl backup-etc` 命令会把 `/etc/gitlab`  目录进行备份并命令为类似 `gitlab_config_1727250039_2024_09_25.tar` 的格式，其中 `1727250039` 是时间戳，直接恢复整个目录也可以



