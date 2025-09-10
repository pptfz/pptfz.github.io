# SonarQube

[sonarqube github地址](https://github.com/SonarSource/sonarqube)

[sonarqube官网](https://www.sonarsource.com/zh/products/sonarqube/)

[sonarqube dockerhub地址](https://hub.docker.com/_/sonarqube/)



## 标准安装



## docker安装

[官方安装文档](https://docs.sonarqube.org/latest/setup/install-server/)

### 设置系统参数

由于 SonarQube 使用嵌入式 Elasticsearch，请确保您的 Docker 主机配置符合[Elasticsearch 生产模式要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-cli-run-prod-mode) 和 [文件描述符配置](https://www.elastic.co/guide/en/elasticsearch/reference/current/file-descriptors.html)。



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



### 编辑 docker-compose yml文件

[官方示例compose文件](https://github.com/SonarSource/docker-sonarqube/tree/master/example-compose-files/sq-with-postgres)



```yaml
export SONARQUBE_VERSION=25.9.0.112764-community
cat > docker-compose.yml <<EOF
services:
  sonarqube:
    image: sonarqube:$SONARQUBE_VERSION
    hostname: sonarqube
    container_name: sonarqube
    read_only: true
    depends_on:
      db:
        condition: service_healthy
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_temp:/opt/sonarqube/temp
    ports:
      - "9000:9000"
    networks:
      - ${NETWORK_TYPE:-ipv4}
  db:
    image: postgres:17
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}" ]
      interval: 10s
      timeout: 5s
      retries: 5
    hostname: postgresql
    container_name: postgresql
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
      POSTGRES_DB: sonar
    volumes:
      - postgresql:/var/lib/postgresql
    networks:
      - ${NETWORK_TYPE:-ipv4}

volumes:
  sonarqube_data:
  sonarqube_temp:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:

networks:
  ipv4:
    driver: bridge
    enable_ipv6: false
  dual:
    driver: bridge
    enable_ipv6: true
    ipam:
      config:
        - subnet: "192.168.2.0/24"
          gateway: "192.168.2.1"
        - subnet: "2001:db8:2::/64"
          gateway: "2001:db8:2::1"
EOF
```



### 启动

```shell
docker-compose up -d
```



会启动 `sonarqube` 和 `postgresql` 两个容器

```shell
$ docker ps
CONTAINER ID   IMAGE                               COMMAND                  CREATED          STATUS                    PORTS                                                                                      NAMES
d126c351ed26   sonarqube:25.9.0.112764-community   "/opt/sonarqube/dock…"   22 seconds ago   Up 11 seconds             0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp                                                sonarqube
e2d2040ec4a2   postgres:17                         "docker-entrypoint.s…"   22 seconds ago   Up 22 seconds (healthy)   5432/tcp                                                                                   postgresql
```



### 访问

访问 `IP:9000` 

用户名密码均为 `admin`

![iShot_2025-09-10_16.05.58](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-10_16.05.58.png)





首次登陆需要更新密码

![iShot_2025-09-10_16.06.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-10_16.06.55.png)



登陆后首页面

![iShot_2025-09-10_16.11.14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-10_16.11.14.png)





## SonarQube汉化

[SonarQube汉化插件github地址](https://github.com/xuhuisheng/sonar-l10n-zh)

[SonarQube gitlab插件github地址](https://github.com/gabrie-allaigre/sonar-gitlab-plugin)



### 旧版本汉化

`Administration` -> `Marketplace` -> `Plugins`  下搜索 `chinese` ，选择 `Chinese Pack LOCALIZATION` 安装，安装显示 `install Pending`后重启服务器即可

![iShot2021-09-06_17.21.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-06_17.21.45.png)



汉化效果

![iShot2021-09-07_17.30.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-09-07_17.30.54.png)



### 新版本汉化

新版本汉化需要单独下载插件，然后将插件放置于 `$SONARQUBE_HOME/extensions/plugins` 目录下，然后重启服务即可，以安装的 `25.9.0.112764-community` 版本为例



```shell
export SONARQUBE_PLUGINS_PATH=/var/lib/docker/volumes/sonarqube_sonarqube_extensions/_data/plugins/
cd $SONARQUBE_PLUGINS_PATH
wget https://github.com/xuhuisheng/sonar-l10n-zh/releases/download/sonar-l10n-zh-plugin-25.9/sonar-l10n-zh-plugin-25.9.jar
```



重启服务即可完成汉化

![iShot_2025-09-10_16.17.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-10_16.17.45.png)

