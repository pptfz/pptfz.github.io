# zabbix数据库迁移的一个小问题

**背景：**

- 原先zabbix5.0是部署在1c1g的华为云主机上，但是因为有其他服务运行因此会导致mysql经常被系统干掉，选择把数据库迁移至1c4g的腾讯云主机上

**过程：**

- 导出zabbix库，拷贝至腾讯云主机然后导入
- 修改zabbix-server配置文件`/etc/zabbix/zabbix_server.conf`中的`DBHost`为新主机IP或域名

- 腾讯云主机mysql中重新授权zabbix，即只允许华为云主机连接



**问题：**

- zabbix报错如下

![iShot2020-07-2516.33.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-07-2516.33.42.png)

**排查过程：**

- zabbix服务端日志中没有有用的信息

- 刚导入成功后zabbix是没有问题的，也可以获取数据，但是隔了一段时间报错`Unknown database 'zabbix'`，原因是在华为云机器上执行了删除zabbix数据库的操作，但是配置文件`/etc/zabbix/web/zabbix.conf.php `中的数据库指向还是本机，因此会报错未知的数据库



**解决方法：**

- 修改配置文件`/etc/zabbix/web/zabbix.conf.php`中`$DB['SERVER']`字段中的`localhost`为新mysql主机的IP或域名

