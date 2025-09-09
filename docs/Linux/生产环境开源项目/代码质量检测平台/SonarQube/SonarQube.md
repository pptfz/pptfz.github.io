# SonarQube

[sonarqube github地址](https://github.com/SonarSource/sonarqube)

[sonarqube 官网](https://www.sonarqube.org/)

[sonarqube dockerhub地址](https://hub.docker.com/_/sonarqube/)



## 1.标准安装



## 2.docker安装



## 3.dokcer-compose安装

[官方安装文档](https://docs.sonarqube.org/latest/setup/install-server/)

### 3.1 设置系统参数

由于 SonarQube 使用嵌入式 Elasticsearch，请确保您的 Docker 主机配置符合[Elasticsearch 生产模式要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-cli-run-prod-mode)和[文件描述符配置](https://www.elastic.co/guide/en/elasticsearch/reference/current/file-descriptors.html)。



需要执行以下命令

```shell
sysctl -w vm.max_map_count=524288
sysctl -w fs.file-max=131072
ulimit -n 131072
ulimit -u 8192
```



如果系统的文件描述符配置不符合要求就会有如下报错

`docker logs -f sonarqube_sonarqube_1` 报错如下

```
ERROR: [1] bootstrap checks failed. You must address the points described in the following [1] lines before starting Elasticsearch.
bootstrap check failure [1] of [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
ERROR: Elasticsearch did not exit normally - check the logs at /opt/sonarqube/logs/sonarqube.log
```



根据提示查看 `/opt/sonarqube/logs/sonarqube.log` 日志

```
2021.09.06 08:31:11 INFO  app[][o.s.a.AppFileSystem] Cleaning or creating temp directory /opt/sonarqube/temp
2021.09.06 08:31:11 INFO  app[][o.s.a.es.EsSettings] Elasticsearch listening on [HTTP: 127.0.0.1:9001, TCP: 127.0.0.1:37275]
2021.09.06 08:31:11 INFO  app[][o.s.a.ProcessLauncherImpl] Launch process[[key='es', ipcIndex=1, logFilenamePrefix=es]] from [/opt/sonarqube/elasticsearch]: /opt/sonarqube/elasticsearch/bin/elasticsearch
2021.09.06 08:31:11 INFO  app[][o.s.a.SchedulerImpl] Waiting for Elasticsearch to be up and running
2021.09.06 08:31:16 WARN  app[][o.s.a.p.AbstractManagedProcess] Process exited with exit value [es]: 78
2021.09.06 08:31:16 INFO  app[][o.s.a.SchedulerImpl] Process[es] is stopped
2021.09.06 08:31:16 INFO  app[][o.s.a.SchedulerImpl] SonarQube is stopped
```



### 3.2 编辑 docker-compose yml文件

> 这里选择安装7.9LTS版

```yaml
cat > docker-compose.yml <<EOf
version: "3"

services:
  sonarqube:
    image: sonarqube:7.9.6-community
    depends_on:
      - db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    ports:
      - "9000:9000"
  db:
    image: postgres:12
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:
  postgresql_data:
EOF
```



### 3.3 启动

```shell
docker-compose up -d
```



会启动 `sonarqube_sonarqube_1` 和 `sonarqube_db_1` 两个容器

```shell
$ docker ps -a
CONTAINER ID   IMAGE                       COMMAND                  CREATED        STATUS          PORTS                    NAMES
67e5a65c824c   sonarqube:7.9.6-community   "./bin/run.sh"           19 hours ago   Up 52 minutes   0.0.0.0:9000->9000/tcp   sonarqube_sonarqube_1
65a4c46204e5   postgres:12                 "docker-entrypoint.s…"   19 hours ago   Up 52 minutes   5432/tcp                 sonarqube_db_1
```



启动成功后访问 `IP:9000` 



## SonarQube汉化

[SonarQube汉化插件github地址](https://github.com/xuhuisheng/sonar-l10n-zh)

[SonarQube gitlab插件github地址](https://github.com/gabrie-allaigre/sonar-gitlab-plugin)

`Administration` -> `Marketplace` -> `Plugins`  下搜索 `chinese` ，选择 `Chinese Pack LOCALIZATION` 安装，安装显示 `install Pending`后重启服务器即可

![iShot2021-09-06_17.21.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-06_17.21.45.png)



汉化效果

![iShot2021-09-07_17.30.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-07_17.30.54.png)



## SonarQube插件安装

SonarQube插件如果在应用市场中没有，则需要单独下载插件(jar包)放置于 `$SONARQUBE_HOME/extensions/plugins` 目录下，然后重启服务即可
