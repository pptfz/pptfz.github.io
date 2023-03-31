# jenkins备份

## 1.安装备份插件 

jenkins备份需要安装插件 `thinBackup`，如果没有配置加速或者下载比较慢

[jenkins插件下载地址](http://updates.jenkins-ci.org/download/plugins/)

[thinBackup插件下载地址](http://updates.jenkins-ci.org/download/plugins/thinBackup/)



插件安装完成后会在系统管理中出现如下 `ThinBackup`

![iShot2020-11-16 11.47.04](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-16%2011.47.04.png)





## 2.备份设置

创建备份目录并设置目录权限为jenkins

```shell
[ -f /backup/jenkins-bak ] || mkdir -p /backup/jenkins-bak && chown jenkins.jenkins /backup/jenkins-bak
```



**手动备份**

jenkins页面中选择 `Manage Jenkins` --> `ThinBackup` --> `Backup Now(手动备份)`

![iShot2020-11-17 10.50.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-17%2010.50.24.png)



 

备份完成后会在设定的备份目录下生成日期格式的目录 `FULL-2020-11-17_14-12`

