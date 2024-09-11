# zabbix5.0修改磁盘告警阈值

背景说明

> zabbix5.0磁盘告警阈值默认为大于80%就告警



在 `配置` -> `模板` -> 找到对应模板，这里以  `Template OS Linux by Zabbix agent active` 为例

点击模板中的 `自动发现`

![iShot2021-11-22_21.17.19](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.17.19.png)



选择 `Template Module Linux filesystems by Zabbix agent active: Mounted filesystem discovery` 中的 `触发器类型`

![iShot2021-11-22_21.18.34](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.18.34.png)





点击 `Template Module Linux filesystems by Zabbix agent active: {#FSNAME}: Disk space is critically low (used > {$VFS.FS.PUSED.MAX.CRIT:"{#FSNAME}"}%)` 中的 `Template Module Linux filesystems by Zabbix agent active:`



![iShot2021-11-22_21.19.54](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.19.54.png)





点击 `{#FSNAME}: Disk space is critically low (used > {$VFS.FS.PUSED.MAX.CRIT:"{#FSNAME}"}%)`

![iShot2021-11-22_21.21.11](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.21.11.png)





修改表达式

> 默认表达式如下

```perl
{Template Module Linux filesystems by Zabbix agent active:vfs.fs.size[{#FSNAME},pused].last()}>{$VFS.FS.PUSED.MAX.CRIT:"{#FSNAME}"} and
(({Template Module Linux filesystems by Zabbix agent active:vfs.fs.size[{#FSNAME},total].last()}-{Template Module Linux filesystems by Zabbix agent active:vfs.fs.size[{#FSNAME},used].last()})<10G or {Template Module Linux filesystems by Zabbix agent active:vfs.fs.size[{#FSNAME},pused].timeleft(1h,,100)}<1d)
```

![iShot2021-11-22_21.22.33](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.22.33.png)







删除原先的表达式，然后点击 `添加`

![iShot2021-11-22_21.26.59](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.26.59.png)





点击 `选择原型`

![iShot2021-11-22_21.28.44](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.28.44.png)





设置阈值

![iShot2021-11-22_21.31.48](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.31.48.png)







设置完成

![iShot2021-11-22_21.32.47](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-11-22_21.32.47.png)

