# elasticsearch安装



[elasticsearch官网](https://www.elastic.co/)



[elasticsearch官方下载地址](https://www.elastic.co/cn/downloads/elasticsearch)



[elasticsearch各版本官方下载地址](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)





elasticsearch依赖java环境，安装前需要配置好jdk环境



### 下载安装包

```sh
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-linux-x86_64.tar.gz
```



### 解压缩包

```sh
tar xf elasticsearch-7.12.1-linux-x86_64.tar.gz -C /usr/local/
```





### 新建es用户

```sh
useradd es
```



### 修改elasticsearch目录所有者

```sh
chown -R es.es /usr/local/elasticsearch-7.12.1/
```



### 启动elasticsearch

```sh
cd /usr/local/elasticsearch-7.12.1
su es -c './bin/elasticsearch'
```



**⚠️<span style=color:red>使用root用户启动会报错 `java.lang.RuntimeException: can not run elasticsearch as root`</span>**

```sh
Future versions of Elasticsearch will require Java 11; your Java version from [/usr/local/jdk1.8.0_251/jre] does not meet this requirement. Consider switching to a distribution of Elasticsearch with a bundled JDK. If you are already using a distribution with a bundled JDK, ensure the JAVA_HOME environment variable is not set.
[2021-05-23T23:25:34,933][ERROR][o.e.b.ElasticsearchUncaughtExceptionHandler] [test1] uncaught exception in thread [main]
org.elasticsearch.bootstrap.StartupException: java.lang.RuntimeException: can not run elasticsearch as root
	at org.elasticsearch.bootstrap.Elasticsearch.init(Elasticsearch.java:163) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Elasticsearch.execute(Elasticsearch.java:150) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:75) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.cli.Command.mainWithoutErrorHandling(Command.java:116) ~[elasticsearch-cli-7.12.1.jar:7.12.1]
	at org.elasticsearch.cli.Command.main(Command.java:79) ~[elasticsearch-cli-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:115) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:81) ~[elasticsearch-7.12.1.jar:7.12.1]
Caused by: java.lang.RuntimeException: can not run elasticsearch as root
	at org.elasticsearch.bootstrap.Bootstrap.initializeNatives(Bootstrap.java:101) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Bootstrap.setup(Bootstrap.java:168) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Bootstrap.init(Bootstrap.java:397) ~[elasticsearch-7.12.1.jar:7.12.1]
	at org.elasticsearch.bootstrap.Elasticsearch.init(Elasticsearch.java:159) ~[elasticsearch-7.12.1.jar:7.12.1]
	... 6 more
uncaught exception in thread [main]
java.lang.RuntimeException: can not run elasticsearch as root
	at org.elasticsearch.bootstrap.Bootstrap.initializeNatives(Bootstrap.java:101)
	at org.elasticsearch.bootstrap.Bootstrap.setup(Bootstrap.java:168)
	at org.elasticsearch.bootstrap.Bootstrap.init(Bootstrap.java:397)
	at org.elasticsearch.bootstrap.Elasticsearch.init(Elasticsearch.java:159)
	at org.elasticsearch.bootstrap.Elasticsearch.execute(Elasticsearch.java:150)
	at org.elasticsearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:75)
	at org.elasticsearch.cli.Command.mainWithoutErrorHandling(Command.java:116)
	at org.elasticsearch.cli.Command.main(Command.java:79)
	at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:115)
	at org.elasticsearch.bootstrap.Elasticsearch.main(Elasticsearch.java:81)
For complete error details, refer to the log at /usr/local/elasticsearch-7.12.1/logs/elasticsearch.log
```



### 查看启动

elasticsearch监听tcp 9200和9300，其中9300为集群内节点通信接口，9200为elasticsearch开放的REST接口

jps查看

```sh
$ jps|grep Elasticsearch
2407 Elasticsearch
```



```sh
$ ps aux|grep 2407
es        2407 31.3 32.6 3691292 1320184 ?     Ssl  23:37   0:25 /usr/local/jdk1.8.0_251/bin/java -Xshare:auto -Des.networkaddress.cache.ttl=60 -Des.networkaddress.cache.negative.ttl=10 -XX:+AlwaysPreTouch -Xss1m -Djava.awt.headless=true -Dfile.encoding=UTF-8 -Djna.nosys=true -XX:-OmitStackTraceInFastThrow -Dio.netty.noUnsafe=true -Dio.netty.noKeySetOptimization=true -Dio.netty.recycler.maxCapacityPerThread=0 -Dio.netty.allocator.numDirectArenas=0 -Dlog4j.shutdownHookEnabled=false -Dlog4j2.disable.jmx=true -Djava.locale.providers=SPI,JRE -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly -Djava.io.tmpdir=/tmp/elasticsearch-4825559070521700706 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=data -XX:ErrorFile=logs/hs_err_pid%p.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintTenuringDistribution -XX:+PrintGCApplicationStoppedTime -Xloggc:logs/gc.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=32 -XX:GCLogFileSize=64m -Xms1024m -Xmx1024m -XX:MaxDirectMemorySize=536870912 -Des.path.home=/usr/local/elasticsearch-7.12.1 -Des.path.conf=/usr/local/elasticsearch-7.12.1/config -Des.distribution.flavor=default -Des.distribution.type=tar -Des.bundled_jdk=true -cp /usr/local/elasticsearch-7.12.1/lib/* org.elasticsearch.bootstrap.Elasticsearch
```



### 开启elasticsearch远程访问

elasticsearch默认监听127.0.0.1，如果想要开启远程访问，需要修改 `config/elasticsearch.yml`，将 `network.host` 一行修改为如下

```sh
network.host: 0.0.0.0
```



### 验证elsticsearch启动

浏览器访问 `IP:9200`，返回如下结果即为成功

```json
{
  "name" : "test1",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "bnOFYR5fRFmF7pPaXxLuDA",
  "version" : {
    "number" : "7.12.1",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "3186837139b9c6b6d23c3200870651f10d3343b7",
    "build_date" : "2021-04-20T20:56:39.040728659Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

或者使用curl命令

```json
curl 127.0.0.1:9200
{
  "name" : "test1",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "bnOFYR5fRFmF7pPaXxLuDA",
  "version" : {
    "number" : "7.12.1",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "3186837139b9c6b6d23c3200870651f10d3343b7",
    "build_date" : "2021-04-20T20:56:39.040728659Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```



检查elasticsearch健康状态

```sh
$ curl 127.0.0.1:9200/_cat/health
1621785784 16:03:04 elasticsearch green 1 1 0 0 0 0 0 0 - 100.0%
```



elasticsearch启动报错

```sh
ERROR: [2] bootstrap checks failed. You must address the points described in the following [2] lines before starting Elasticsearch.
bootstrap check failure [1] of [2]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
bootstrap check failure [2] of [2]: the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
ERROR: Elasticsearch did not exit normally - check the logs at /usr/local/elasticsearch-7.12.1/logs/elasticsearch.log
```





### elasticsearch启动时错误解决方案

#### 错误1 

```
**ERROR: bootstrap checks failed[1]: max file descriptors [4096] for elasticsearch process is too low, increase to at least [65536]**
```



解决方法

```sh
# 切换到root用户修改 /etc/security/limits.conf 文件，在最后面追加下面内容
*               soft    nofile          65536
*               hard    nofile          65536
*               soft    nproc           4096
*               hard    nproc           4096
   
# 退出重新登录检测配置是否生效:
ulimit -Hn
ulimit -Sn
ulimit -Hu
ulimit -Su
```



#### 错误2

```sh
**ERROR: max number of threads [3802] for user [chenyn] is too low,increase to at least [4096]**
```



解决方法

```sh
# 进入limits.d目录下修改 /etc/security/limits.d/20-nproc.conf 配置文件

启动ES用户名 soft nproc 4096
```



#### 错误3

```sh
**ERROR: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]**
```



解决方法

```sh
# 编辑文件 /etc/sysctl.conf 增加下一行
vm.max_map_count=655360

# 执行以下命令生效
sysctl -p
```



#### 错误4

```sh
ERROR: [1] bootstrap checks failed. You must address the points described in the following [1] lines before starting Elasticsearch.
bootstrap check failure [1] of [1]: the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
```



解决方法

```sh
# 编辑elasticsearch配置文件 config/elasticsearch.yml 编辑如下内容，单节点就协议主机名，多节点写多个主机名
cluster.initial_master_nodes: ["test1"]
```







