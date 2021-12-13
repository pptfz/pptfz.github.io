[toc]



# CentOS7安装zabbix5.2

# 二、docker-compose安装

[zabbix官方安装文档](https://www.zabbix.com/documentation/current/manual/installation/containers)

[zabbix github docker地址](https://github.com/zabbix/zabbix-docker)



## 2.1 下载代码

```sh
git clone https://github.com.cnpmjs.org/zabbix/zabbix-docker.git
```



## 2.2 检出分支，这里选择最新版5.2

```sh
cd zabbix-docker/
git checkout 5.2
```



### 2.2.1 yaml文件说明

一共有12个yaml文件，每个yaml文件官方都有[说明](https://www.zabbix.com/documentation/current/manual/installation/containers)

- 文件中带 `_latest` 的是从dockerhub拉取镜像

- 文件中带 `_local` 的是在本地构建镜像

| **File name**                                | **Description**                                              | Translation                                                  |
| -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `docker-compose_v3_alpine_mysql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on Alpine Linux with MySQL database support. | compose文件在支持MySQL数据库的Alpine Linux上运行最新版本的Zabbix 5.2组件。 |
| `docker-compose_v3_alpine_mysql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on Alpine Linux with MySQL database support. | compose文件在本地构建最新版本的Zabbix 5.2，并在支持MySQL数据库的Alpine Linux上运行Zabbix组件。 |
| `docker-compose_v3_alpine_pgsql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on Alpine Linux with PostgreSQL database support. | compose文件在支持PostgreSQL数据库的Alpine Linux上运行最新版本的Zabbix 5.2组件。 |
| `docker-compose_v3_alpine_pgsql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on Alpine Linux with PostgreSQL database support. | compose文件在本地构建最新版本的Zabbix 5.2，并在支持PostgreSQL数据库的Alpine Linux上运行Zabbix组件。 |
| `docker-compose_v3_centos_mysql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on CentOS 8 with MySQL database support. | compose文件在CentOS 8上运行最新版本的Zabbix 5.2组件，支持MySQL数据库。 |
| `docker-compose_v3_centos_mysql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on CentOS 8 with MySQL database support. | compose文件在本地构建Zabbix 5.2的最新版本，并在CentOS 8上运行Zabbix组件，支持MySQL数据库。 |
| `docker-compose_v3_centos_pgsql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on CentOS 8 with PostgreSQL database support. | compose文件在CentOS 8上运行最新版本的Zabbix 5.2组件，支持PostgreSQL数据库。 |
| `docker-compose_v3_centos_pgsql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on CentOS 8 with PostgreSQL database support. | compose文件在本地构建最新版本的Zabbix 5.2，并在CentOS 8上运行带有PostgreSQL数据库支持的Zabbix组件。 |
| `docker-compose_v3_ubuntu_mysql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on Ubuntu 20.04 with MySQL database support. | compose文件在支持MySQL数据库的Ubuntu 20.04上运行Zabbix 5.2组件的最新版本。 |
| `docker-compose_v3_ubuntu_mysql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on Ubuntu 20.04 with MySQL database support. | compose文件在本地构建Zabbix 5.2的最新版本，并在支持MySQL数据库的Ubuntu 20.04上运行Zabbix组件。 |
| `docker-compose_v3_ubuntu_pgsql_latest.yaml` | The compose file runs the latest version of Zabbix 5.2 components on Ubuntu 20.04 with PostgreSQL database support. | compose文件在支持PostgreSQL数据库的Ubuntu 20.04上运行Zabbix 5.2组件的最新版本。 |
| `docker-compose_v3_ubuntu_pgsql_local.yaml`  | The compose file locally builds the latest version of Zabbix 5.2 and runs Zabbix components on Ubuntu 20.04 with PostgreSQL database support. | compose文件在本地构建Zabbix 5.2的最新版本，并在支持PostgreSQL数据库的Ubuntu 20.04上运行Zabbix组件。 |





选择任意一个都可以，这里以 `docker-compose_v3_alpine_mysql_latest.yaml`为例，包含的镜像一共有11个，实际只需要7个

| 服务名                  | 镜像                                             | 作用                                                         | 是否必须                   |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------ | -------------------------- |
| zabbix-server           | zabbix/zabbix-server-mysql:alpine-5.2-latest     | Zabbix软件的核心进程，执行监控操作，与Zabbix proxies和Agents进行交互、触发器计算、发送告警通知；也是数据的中央存储库 | 必须                       |
| zabbix-proxy-sqlite3    | zabbix/zabbix-proxy-sqlite3:alpine-5.2-latest    | 代替Zabbix Server采集数据，从而分担Zabbix Server负载的进程   | 2个zabbix-proxy选择其中1个 |
| zabbix-proxy-mysql      | zabbix/zabbix-proxy-mysql:alpine-5.2-latest      | 代替Zabbix Server采集数据，从而分担Zabbix Server负载的进程   | 2个zabbix-proxy选择其中1个 |
| zabbix-web-apache-mysql | zabbix/zabbix-web-apache-mysql:alpine-5.2-latest | web界面                                                      | 2个zabbix-web选择其中1个   |
| zabbix-web-nginx-mysql  | zabbix/zabbix-web-nginx-mysql:alpine-5.2-latest  | web界面                                                      | 2个zabbix-web选择其中1个   |
| zabbix-agent            | zabbix/zabbix-agent:alpine-5.2-latest            | 部署在被监控目标上，用于主动监控本地资源和应用程序，并将收集的数据发送给 Zabbix server | 必须                       |
| zabbix-java-gateway     | zabbix/zabbix-java-gateway:alpine-5.2-latest     | 以 Zabbix 守护进程方式原生支持监控 JMX 应用程序              | 必须                       |
| zabbix-snmptraps        | zabbix/zabbix-snmptraps:alpine-5.2-latest        | 用于设备发生故障时的主动通知的监控                           | 必须                       |
| mysql-server            | mysql:8.0                                        | 数据库                                                       | 必须                       |
| db_data_mysql           | busybox                                          | 不太清楚                                                     | 非必须，启动后停止         |
| elasticsearch           | elasticsearch                                    | 没有用到                                                     | 非必须，默认注释           |





`docker-compose_v3_alpine_mysql_latest.yaml`文件中的镜像

![iShot2021-03-04 19.41.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-04 19.41.11.png)



## 2.3 启动

### 2.3.1 修改yaml文件

- **任意选择一个yaml文件，需要做一些修改，zabbix-proxy、zabbix-web选择一个即可，修改后的`docker-compose_v3_alpine_mysql_latest.yaml`如下**

- **在文件中zabbix-server的持久化配置处添加了 `- ./zbx_env/etc/conf:/etc/zabbix:rw`，目的是把zabbix-server的主配置文件映射到宿主机**

- **文件中的镜像，官方默认最新版都是latest结尾的，这里修改为具体的版本，可在 [dockerhub官网](https://hub.docker.com/search?q=zabbix&type=image)查看**

  

| 官方默认镜像                                     | 修改为                                     |
| ------------------------------------------------ | ------------------------------------------ |
| zabbix/zabbix-server-mysql:alpine-5.2-latest     | zabbix/zabbix-server-mysql:alpine-5.2.5    |
| zabbix/zabbix-proxy-sqlite3:alpine-5.2-latest    | -                                          |
| zabbix/zabbix-proxy-mysql:alpine-5.2-latest      | zabbix/zabbix-proxy-mysql:alpine-5.2.5     |
| zabbix/zabbix-web-apache-mysql:alpine-5.2-latest | -                                          |
| zabbix/zabbix-web-nginx-mysql:alpine-5.2-latest  | zabbix/zabbix-web-nginx-mysql:alpine-5.2.5 |
| zabbix/zabbix-agent:alpine-5.2-latest            | zabbix/zabbix-agent:alpine-5.2.5           |
| zabbix/zabbix-java-gateway:alpine-5.2-latest     | zabbix/zabbix-java-gateway:alpine-5.2.5    |
| zabbix/zabbix-snmptraps:alpine-5.2-latest        | zabbix/zabbix-snmptraps:alpine-5.2.5       |
| mysql:8.0                                        | -                                          |
| busybox                                          | -                                          |
| elasticsearch                                    | -                                          |





**这里遇到一个问题，就是zabbix-server处增加了 `- ./zbx_env/etc/conf:/etc/zabbix:rw`，是想把zabbix_server容器中 `/etc/zabbix/zabbix_server.conf`主配置文件映射到本地，但是始终报错 `zabbix_server [7]: cannot open config file "/etc/zabbix/zabbix_server.conf": [2] No such file or directory`，原因未知，无法解决**

```yaml
version: '3.5'
services:
 zabbix-server:
  image: zabbix/zabbix-server-mysql:alpine-5.2-latest
  ports:
   - "10051:10051"
  volumes:
   - /etc/localtime:/etc/localtime:ro
   - /etc/timezone:/etc/timezone:ro 
   - ./zbx_env/usr/lib/zabbix/alertscripts:/usr/lib/zabbix/alertscripts:ro
   - ./zbx_env/usr/lib/zabbix/externalscripts:/usr/lib/zabbix/externalscripts:ro
   - ./zbx_env/var/lib/zabbix/export:/var/lib/zabbix/export:rw
   - ./zbx_env/var/lib/zabbix/modules:/var/lib/zabbix/modules:ro
   - ./zbx_env/var/lib/zabbix/enc:/var/lib/zabbix/enc:ro
   - ./zbx_env/var/lib/zabbix/ssh_keys:/var/lib/zabbix/ssh_keys:ro
   - ./zbx_env/var/lib/zabbix/mibs:/var/lib/zabbix/mibs:ro
   # 这里添加后会有问题，无法持久化zabbix-server主配置文件
   # - ./zbx_env/etc/conf:/etc/zabbix:rw
   - snmptraps:/var/lib/zabbix/snmptraps:rw
  links:
   - mysql-server:mysql-server
   - zabbix-java-gateway:zabbix-java-gateway
  ulimits:
   nproc: 65535
   nofile:
    soft: 20000
    hard: 40000
  deploy:
   resources:
    limits:
      cpus: '0.70'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
  env_file:
   - .env_db_mysql
   - .env_srv
  secrets:
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_ROOT_PASSWORD
#   - client-key.pem
#   - client-cert.pem
#   - root-ca.pem
  depends_on:
   - mysql-server
   - zabbix-java-gateway
   - zabbix-snmptraps
  networks:
   zbx_net_backend:
     aliases:
      - zabbix-server
      - zabbix-server-mysql
      - zabbix-server-alpine-mysql
      - zabbix-server-mysql-alpine
   zbx_net_frontend:
#  devices:
#   - "/dev/ttyUSB0:/dev/ttyUSB0"
  stop_grace_period: 30s
  sysctls:
   - net.ipv4.ip_local_port_range=1024 65000
   - net.ipv4.conf.all.accept_redirects=0
   - net.ipv4.conf.all.secure_redirects=0
   - net.ipv4.conf.all.send_redirects=0
  labels:
   com.zabbix.description: "Zabbix server with MySQL database support"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "zabbix-server"
   com.zabbix.dbtype: "mysql"
   com.zabbix.os: "alpine"

 #zabbix-proxy-sqlite3:
 # image: zabbix/zabbix-proxy-sqlite3:alpine-5.2-latest
 # ports:
 #  - "10061:10051"
 # volumes:
 #  - /etc/localtime:/etc/localtime:ro
 #  - /etc/timezone:/etc/timezone:ro 
 #  - ./zbx_env/usr/lib/zabbix/externalscripts:/usr/lib/zabbix/externalscripts:ro
 #  - ./zbx_env/var/lib/zabbix/modules:/var/lib/zabbix/modules:ro
 #  - ./zbx_env/var/lib/zabbix/enc:/var/lib/zabbix/enc:ro
 #  - ./zbx_env/var/lib/zabbix/ssh_keys:/var/lib/zabbix/ssh_keys:ro
 #  - ./zbx_env/var/lib/zabbix/mibs:/var/lib/zabbix/mibs:ro
 #  - snmptraps:/var/lib/zabbix/snmptraps:rw
 # links:
 #  - zabbix-server:zabbix-server
 #  - zabbix-java-gateway:zabbix-java-gateway
 # ulimits:
 #  nproc: 65535
 #  nofile:
 #   soft: 20000
 #   hard: 40000
 # deploy:
 #  resources:
 #   limits:
 #     cpus: '0.70'
 #     memory: 512M
 #   reservations:
 #     cpus: '0.3'
 #     memory: 256M
 # env_file:
 #  - .env_prx
 #  - .env_prx_sqlite3
 # depends_on:
 #  - zabbix-java-gateway
 #  - zabbix-snmptraps
 # networks:
 #  zbx_net_backend:
 #   aliases:
 #    - zabbix-proxy-sqlite3
 #    - zabbix-proxy-alpine-sqlite3
 #    - zabbix-proxy-sqlite3-alpine
 #  zbx_net_frontend:
 # stop_grace_period: 30s
 # labels:
 #  com.zabbix.description: "Zabbix proxy with SQLite3 database support"
 #  com.zabbix.company: "Zabbix LLC"
 #  com.zabbix.component: "zabbix-proxy"
 #  com.zabbix.dbtype: "sqlite3"
 #  com.zabbix.os: "alpine"

 zabbix-proxy-mysql:
  image: zabbix/zabbix-proxy-mysql:alpine-5.2-latest
  ports:
   - "10071:10051"
  volumes:
   - /etc/localtime:/etc/localtime:ro
   - /etc/timezone:/etc/timezone:ro
   - ./zbx_env/usr/lib/zabbix/externalscripts:/usr/lib/zabbix/externalscripts:ro
   - ./zbx_env/var/lib/zabbix/modules:/var/lib/zabbix/modules:ro
   - ./zbx_env/var/lib/zabbix/enc:/var/lib/zabbix/enc:ro
   - ./zbx_env/var/lib/zabbix/ssh_keys:/var/lib/zabbix/ssh_keys:ro
   - ./zbx_env/var/lib/zabbix/mibs:/var/lib/zabbix/mibs:ro
   - snmptraps:/var/lib/zabbix/snmptraps:rw
  links:
   - zabbix-server:zabbix-server
   - zabbix-java-gateway:zabbix-java-gateway
  ulimits:
   nproc: 65535
   nofile:
    soft: 20000
    hard: 40000
  deploy:
   resources:
    limits:
      cpus: '0.70'
      memory: 512M
    reservations:
      cpus: '0.3'
      memory: 256M
  env_file:
   - .env_db_mysql_proxy
   - .env_prx
   - .env_prx_mysql
  depends_on:
   - mysql-server
   - zabbix-java-gateway
   - zabbix-snmptraps
  secrets:
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_ROOT_PASSWORD
#   - client-key.pem
#   - client-cert.pem
#   - root-ca.pem
  networks:
   zbx_net_backend:
    aliases:
     - zabbix-proxy-mysql
     - zabbix-proxy-alpine-mysql
     - zabbix-proxy-mysql-alpine
   zbx_net_frontend:
  stop_grace_period: 30s
  labels:
   com.zabbix.description: "Zabbix proxy with MySQL database support"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "zabbix-proxy"
   com.zabbix.dbtype: "mysql"
   com.zabbix.os: "alpine"

# zabbix-web-apache-mysql:
#  image: zabbix/zabbix-web-apache-mysql:alpine-5.2-latest
#  ports:
#   - "80:8080"
#   - "443:8443"
#  links:
#   - mysql-server:mysql-server
#   - zabbix-server:zabbix-server
#  volumes:
#   - /etc/localtime:/etc/localtime:ro
#   - /etc/timezone:/etc/timezone:ro
#   - ./zbx_env/etc/ssl/apache2:/etc/ssl/apache2:ro
#   - ./zbx_env/usr/share/zabbix/modules/:/usr/share/zabbix/modules/:ro
#  deploy:
#   resources:
#    limits:
#      cpus: '0.70'
#      memory: 512M
#    reservations:
#      cpus: '0.5'
#      memory: 256M
#  env_file:
#   - .env_db_mysql
#   - .env_web
#  secrets:
#   - MYSQL_USER
#   - MYSQL_PASSWORD
##   - client-key.pem
##   - client-cert.pem
##   - root-ca.pem
#  depends_on:
#   - mysql-server
#   - zabbix-server
#  healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:8080/"]
#   interval: 10s
#   timeout: 5s
#   retries: 3
#   start_period: 30s
#  networks:
#   zbx_net_backend:
#    aliases:
#     - zabbix-web-apache-mysql
#     - zabbix-web-apache-alpine-mysql
#     - zabbix-web-apache-mysql-alpine
#   zbx_net_frontend:
#  stop_grace_period: 10s
#  sysctls:
#   - net.core.somaxconn=65535
#  labels:
#   com.zabbix.description: "Zabbix frontend on Apache web-server with MySQL database support"
#   com.zabbix.company: "Zabbix LLC"
#   com.zabbix.component: "zabbix-frontend"
#   com.zabbix.webserver: "apache2"
#   com.zabbix.dbtype: "mysql"
#   com.zabbix.os: "alpine"

 zabbix-web-nginx-mysql:
  image: zabbix/zabbix-web-nginx-mysql:alpine-5.2-latest
  ports:
   - "8081:8080"
   - "8443:8443"
  links:
   - mysql-server:mysql-server
   - zabbix-server:zabbix-server
  volumes:
   - /etc/localtime:/etc/localtime:ro
   - /etc/timezone:/etc/timezone:ro
   - ./zbx_env/etc/ssl/nginx:/etc/ssl/nginx:ro
   - ./zbx_env/usr/share/zabbix/modules/:/usr/share/zabbix/modules/:ro
  deploy:
   resources:
    limits:
      cpus: '0.70'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
  env_file:
   - .env_db_mysql
   - .env_web
  secrets:
   - MYSQL_USER
   - MYSQL_PASSWORD
#   - client-key.pem
#   - client-cert.pem
#   - root-ca.pem
  depends_on:
   - mysql-server
   - zabbix-server
  healthcheck:
   test: ["CMD", "curl", "-f", "http://localhost:8080/"]
   interval: 10s
   timeout: 5s
   retries: 3
   start_period: 30s
  networks:
   zbx_net_backend:
    aliases:
     - zabbix-web-nginx-mysql
     - zabbix-web-nginx-alpine-mysql
     - zabbix-web-nginx-mysql-alpine
   zbx_net_frontend:
  stop_grace_period: 10s
  sysctls:
   - net.core.somaxconn=65535
  labels:
   com.zabbix.description: "Zabbix frontend on Nginx web-server with MySQL database support"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "zabbix-frontend"
   com.zabbix.webserver: "nginx"
   com.zabbix.dbtype: "mysql"
   com.zabbix.os: "alpine"

 zabbix-agent:
  image: zabbix/zabbix-agent:alpine-5.2-latest
  ports:
   - "10050:10050"
  volumes:
   - /etc/localtime:/etc/localtime:ro
   - /etc/timezone:/etc/timezone:ro
   - ./zbx_env/etc/zabbix/zabbix_agentd.d:/etc/zabbix/zabbix_agentd.d:ro
   - ./zbx_env/var/lib/zabbix/modules:/var/lib/zabbix/modules:ro
   - ./zbx_env/var/lib/zabbix/enc:/var/lib/zabbix/enc:ro
   - ./zbx_env/var/lib/zabbix/ssh_keys:/var/lib/zabbix/ssh_keys:ro
  links:
   - zabbix-server:zabbix-server
  deploy:
   resources:
    limits:
      cpus: '0.2'
      memory: 128M
    reservations:
      cpus: '0.1'
      memory: 64M
   mode: global
  env_file:
   - .env_agent
  privileged: true
  pid: "host"
  networks:
   zbx_net_backend:
    aliases:
     - zabbix-agent
     - zabbix-agent-passive
     - zabbix-agent-alpine
  stop_grace_period: 5s
  labels:
   com.zabbix.description: "Zabbix agent"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "zabbix-agentd"
   com.zabbix.os: "alpine"

 zabbix-java-gateway:
  image: zabbix/zabbix-java-gateway:alpine-5.2-latest
  ports:
   - "10052:10052"
  deploy:
   resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
  env_file:
   - .env_java
  networks:
   zbx_net_backend:
    aliases:
     - zabbix-java-gateway
     - zabbix-java-gateway-alpine
  stop_grace_period: 5s
  labels:
   com.zabbix.description: "Zabbix Java Gateway"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "java-gateway"
   com.zabbix.os: "alpine"

 zabbix-snmptraps:
  image: zabbix/zabbix-snmptraps:alpine-5.2-latest
  ports:
   - "162:1162/udp"
  volumes:
   - snmptraps:/var/lib/zabbix/snmptraps
  deploy:
   resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.25'
      memory: 128M
  networks:
   zbx_net_frontend:
    aliases:
     - zabbix-snmptraps
   zbx_net_backend:
  stop_grace_period: 5s
  labels:
   com.zabbix.description: "Zabbix snmptraps"
   com.zabbix.company: "Zabbix LLC"
   com.zabbix.component: "snmptraps"
   com.zabbix.os: "alpine"

 mysql-server:
  image: mysql:8.0
  command:
   - mysqld
   - --character-set-server=utf8
   - --collation-server=utf8_bin
   - --default-authentication-plugin=mysql_native_password
#   - --require-secure-transport
#   - --ssl-ca=/run/secrets/root-ca.pem
#   - --ssl-cert=/run/secrets/server-cert.pem
#   - --ssl-key=/run/secrets/server-key.pem
  volumes:
   - ./zbx_env/var/lib/mysql:/var/lib/mysql:rw
  env_file:
   - .env_db_mysql
  secrets:
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_ROOT_PASSWORD
#   - server-key.pem
#   - server-cert.pem
#   - root-ca.pem
  stop_grace_period: 1m
  networks:
   zbx_net_backend:
    aliases:
     - mysql-server
     - zabbix-database
     - mysql-database

 db_data_mysql:
  image: busybox
  volumes:
   - ./zbx_env/var/lib/mysql:/var/lib/mysql:rw

# elasticsearch:
#  image: elasticsearch
#  environment:
#   - transport.host=0.0.0.0
#   - discovery.zen.minimum_master_nodes=1
#  networks:
#   zbx_net_backend:
#    aliases:
#     - elasticsearch

networks:
  zbx_net_frontend:
    driver: bridge
    driver_opts:
      com.docker.network.enable_ipv6: "false"
    ipam:
      driver: default
      config:
      - subnet: 172.16.238.0/24
  zbx_net_backend:
    driver: bridge
    driver_opts:
      com.docker.network.enable_ipv6: "false"
    internal: true
    ipam:
      driver: default
      config:
      - subnet: 172.16.239.0/24

volumes:
  snmptraps:

secrets:
  MYSQL_USER:
    file: ./.MYSQL_USER
  MYSQL_PASSWORD:
    file: ./.MYSQL_PASSWORD
  MYSQL_ROOT_PASSWORD:
    file: ./.MYSQL_ROOT_PASSWORD
#  client-key.pem:
#    file: ./.ZBX_DB_KEY_FILE
#  client-cert.pem:
#    file: ./.ZBX_DB_CERT_FILE
#  root-ca.pem:
#    file: ./.ZBX_DB_CA_FILE
#  server-cert.pem:
#    file: ./.DB_CERT_FILE
#  server-key.pem:
#    file: ./.DB_KEY_FILE
```



### 2.3.2 拷贝相关目录、文件

> 下载的官方代码中不是所有文件都是必须的



以下隐藏文件是 docker-compose.yaml 文件中各服务需要用到的环境变量文件

```sh
.env_agent                                      
.env_db_mysql                               
.env_db_mysql_proxy                         
.env_db_pgsql                               
.env_java                                       
.env_prx                                        
.env_prx_mysql                                  
.env_prx_sqlite3                            
.env_srv                                                     
.MYSQL_PASSWORD            
.MYSQL_ROOT_PASSWORD       
.MYSQL_USER                
.POSTGRES_PASSWORD
.POSTGRES_USER
.gitignore
```



**现在把这些文件(包括环境变量文件和yaml文件)拷贝到一个目录，这里拷贝到 `/data/docker-project/zabbix`**

```sh
# 创建目录
[ -d /data/docker-project/zabbix ] || mkdir -p /data/docker-project/zabbix

# 拷贝环境变量文件
cp -p .env_web .env_agent .env_db_mysql .env_db_mysql_proxy .env_db_pgsql .env_java .env_prx .env_prx_mysql .env_prx_sqlite3 .env_srv .gitignore .MYSQL_PASSWORD .MYSQL_ROOT_PASSWORD .MYSQL_USER .POSTGRES_PASSWORD .POSTGRES_USER /data/docker-project/zabbix

# 拷贝yaml文件
cp docker-compose_v3_alpine_mysql_latest.yaml /data/docker-project/zabbix/docker-compose.yaml
```



### 2.3.3 启动

```sh
cd /data/docker-project/zabbix
docker-compose up -d
```



docker-compose安装遇到如下问题

- 官方默认的yaml文件中没有把zabbix-server的主配置文件持久化，在yaml文件中 `zabbix-server`服务下配置持久化 `- ./zbx_env/etc/conf:/etc/zabbix:rw`会导致 `zabbix_zabbix-server_1`容器退出，并报错 `**** Configuration file '/etc/zabbix/zabbix_server.conf' does not exist` ，`zabbix_server [7]: cannot open config file "/etc/zabbix/zabbix_server.conf": [2] No such file or directory`，无法解决

