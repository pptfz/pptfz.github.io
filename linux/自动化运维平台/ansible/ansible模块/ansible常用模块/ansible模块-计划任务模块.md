# ansible模块-计划任务模块

## 1 cron定时任务模块

```python
//正常使用crond服务
[root@ansible ~]# crontab -l
* * * * *  /bin/sh /server/scripts/yum.sh

//使用ansible添加一条定时任务
[root@ansible ~]# ansible all -m cron -a "minute=* hour=* day=* month=* weekday=*  job='/bin/sh /server/scripts/test.sh'"
[root@ansible ~]# ansible all -m cron -a "job='/bin/sh /server/scripts/test.sh'"

//设置定时任务注释信息，防止重复，name设定
[root@ansible ~]# ansible all -m cron -a "name='cron01' job='/bin/sh /server/scripts/test.sh'"

//删除相应定时任务
[root@ansible ~]# ansible all -m cron -a "name='ansible cron02' minute=0 hour=0 job='/bin/sh /server/scripts/test.sh' state=absent"
 
//注释相应定时任务，使定时任务失效
[root@ansible scripts]# ansible all -m cron -a "name='ansible cron01' minute=0 hour=0 job='/bin/sh /server/scripts/test.sh' disabled=no"

minute			#分钟
hour				#小时
day					#日期
month				#月份
weekday			#星期
job					#要执行的命令或脚本
name				#指定计划任务别名
disabled		#是否注释
state
	absent			#删除
```

