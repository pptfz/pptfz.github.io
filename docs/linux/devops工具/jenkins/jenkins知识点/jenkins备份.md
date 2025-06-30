# jenkins备份

## 1.安装备份插件 

jenkins备份需要安装插件 `thinBackup`，如果没有配置加速或者下载比较慢

[jenkins插件下载地址](http://updates.jenkins-ci.org/download/plugins/)

[thinBackup插件下载地址](http://updates.jenkins-ci.org/download/plugins/thinBackup/)



插件安装完成后会在系统管理中出现如下 `ThinBackup`

![iShot_2024-09-02_19.18.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-02_19.18.01.png)





## 2.备份设置

创建备份目录并设置目录权限为jenkins

```shell
[ -f /backup/jenkins-bak ] || mkdir -p /backup/jenkins-bak && chown jenkins.jenkins /backup/jenkins-bak
```



**手动备份**

jenkins页面中选择 `Manage Jenkins` --> `ThinBackup` --> `Backup Now(手动备份)`

![iShot_2024-09-02_19.19.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-09-02_19.19.07.png)



备份完成后会在设定的备份目录下生成日期格式的目录 `FULL-2020-11-17_14-12`

