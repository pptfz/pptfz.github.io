# ubuntu启动zabbix-agent报错

ubuntu16中重新安装zabbix-agent，重新启动后报错如下

```sh
$ systemctl start zabbix-agent
Failed to start zabbix-agent.service: Unit zabbix-agent.service is masked.
```



百度半天没有答案，看了一堆博客基本上都是一样的，[谷歌找到答案](https://serverfault.com/questions/834186/unit-zabbix-agent-service-is-masked)，先执行以下命令，然后再重新启动zabbix-agent就可以了

```sh
$ systemctl unmask zabbix-agent.service
Removed symlink /etc/systemd/system/zabbix-agent.service.
```



