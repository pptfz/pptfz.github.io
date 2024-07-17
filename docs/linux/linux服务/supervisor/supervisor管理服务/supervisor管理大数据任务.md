# supervisor管理大数据任务

**supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑服务配置文件 `/etc/supervisor/config.d/RealtimeReadKafkaDemo3.ini`**

> 由于机器上有多个大数据任务，命名的时候一定要规范，最好有唯一标识符，比如这里我们以类名命名
>
> 大数据任务分为实时和离线，这个一般以类名或者包名区分

```
[program:RealtimeReadKafkaDemo3]
command=/usr/local/service/spark/bin/spark-submit 
	--class com.xmadx.game.realTime.RealtimeReadKafkaDemo3 
	--master local[*] 
	--driver-memory 2g 
	--executor-memory 6g 
	--num-executors 5 
	--executor-cores 3 
	--conf "spark.streaming.backpressure.enabled=true" 
	--conf spark.default.parallelism=75 
	--conf "spark.streaming.kafka.maxRatePerPartition=5000" 
	--driver-class-path /usr/local/service/hbase/phoenix-client/phoenix-4.11.0-HBase-1.3-client.jar 			      /home/hadoop/mrpora/xmadx-game-0.0.1-SNAPSHOT.jar
autostart=true
autorestart=true
environment=JAVA_HOME="/usr/local/jdk"
stdout_logfile=/home/hadoop/mrpora/ss-xmadx-game.log
redirect_stderr=true
user=hadoop
```



**将服务加入supervisor**

```sh
$ supervisorctl update RealtimeReadKafkaDemo3
RealtimeReadKafkaDemo3: added process group
```



**查看状态**

```sh
$ supervisorctl status
RealtimeReadKafkaDemo3           RUNNING   pid 91417, uptime 0:00:02
```

