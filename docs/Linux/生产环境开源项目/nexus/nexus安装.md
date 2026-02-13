# nexus安装

[nexus官网](https://www.sonatype.com/)

[nexus github](https://github.com/sonatype/nexus-public)

[nexus3官方文档](https://help.sonatype.com/repomanager3/)

[nexus3最新版官方下载地址](https://help.sonatype.com/repomanager3/product-information/download)

[nexus3历史版本下载地址](https://help.sonatype.com/repomanager3/product-information/download/download-archives---repository-manager-3)

[nexus3安装系统要求](https://help.sonatype.com/repomanager3/product-information/system-requirements)

[nexus3 docker hub](https://hub.docker.com/r/sonatype/nexus3/)



## nexus安装系统要求

[nexus安装系统要求官方文档](https://help.sonatype.com/en/sonatype-nexus-repository-system-requirements.html)



## 二进制包安装

### 下载二进制包

```shell
wget https://download.sonatype.com/nexus/3/nexus-3.79.1-04-linux-x86_64.tar.gz
```



### 解压缩包

:::tip 说明

解压缩后是 `nexus-3.79.1-04`  、 `sonatype-work` 2个目录

:::

```shell
tar xf nexus-3.79.1-04-linux-x86_64.tar.gz
```



### 配置nexus

:::caution 注意

官方不建议使用root作为运行用户，使用普通用户即可

:::

- `etc/nexus.properties` : 配置nexus监听端口与地址，默认为 `8081` 和`0.0.0.0` ，示例文件为 `nexus-default.properties`

- `bin/nexus` : 配置nexus运行用户，`run_as_user` 配置项

- `bin/nexus.vmoptions` : 配置nexus的启动参数，`jvm` 启动参数、数据存放目录、日志存放目录等



### 启动nexus

:::caution 注意

**运行nexus的用户必须能登陆系统，不能是系统用户运行nexus，否则会报错如下**

:::

```shell
$ ./nexus run
This account is currently not available.
```



以普通用户运行nexus

- 方式一    前台运行

  ```shell
  ./nexus run
  ```

  

- 方式二    后台运行

  ```shell
  ./nexus start
  ```

  



## docker安装

### 创建目录

```shell
export NEXUS_DIR_PATH="/data/docker-project/nexus-data"
[ -d ${NEXUS_DIR_PATH} ] ||  mkdir ${NEXUS_DIR_PATH} && chown -R 200 ${NEXUS_DIR_PATH}
```



### 启动容器

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run -d \
 -p 8081:8081 \
 --name nexus \
 -h nexus \
 --restart=always \
 -v ${NEXUS_DIR_PATH}:/nexus-data sonatype/nexus3
```

  </TabItem>
  <TabItem value="compose" label="compose">

```yaml
cat > docker-compose.yaml << EOF
services:
  nexus3:
    ports:
      - 8081:8081
    container_name: nexus
    hostname: nexus
    restart: always
    volumes:
      - /data/docker-project/nexus-data:/nexus-data
    image: sonatype/nexus3:3.89.1
EOF
```

  </TabItem>
</Tabs>





### 登陆nexus

`admin` 用户初始密码在 `sonatype-work/nexus3/admin.password!`

点击 `next` ，接下来就是设置 `admin` 用户密码以及是否允许匿名用户登陆

![iShot2022-01-09_16.58.02](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-09_16.58.02.png)





## helm安装

[nexus3 helm安装github](https://github.com/sonatype/helm3-charts)

[nexus3 helm安装官方文档](https://sonatype.github.io/helm3-charts/)



### 添加仓库

```shell
helm repo add sonatype https://sonatype.github.io/helm3-charts/
```



### 下载包

```shell
helm pull sonatype/nexus-repository-manager
```



### 解压缩

```shell
tar xf nexus-repository-manager-64.2.0.tgz && cd nexus-repository-manager/
```



### 编辑 `values.yaml`



### 安装

```shell
helm upgrade --install nexus3 -n nexus --create-namespace .
```





## 使用systemd管理nexus

编辑配置文件 `/etc/systemd/system/nexus.service`

```shell
export NEXUS_BIN_PATH="/opt/nexus-3.37.3-02/bin/nexus"
cat > /etc/systemd/system/nexus.service << EOF
[Unit]
Description=nexus service
After=network.target
  
[Service]
Type=forking
LimitNOFILE=65536
ExecStart=${NEXUS_BIN_PATH} start
ExecStop=${NEXUS_BIN_PATH} stop
User=nexus
Restart=on-abort
TimeoutSec=600
  
[Install]
WantedBy=multi-user.target
EOF
```



启动nexus

```shell
systemctl daemon-reload
systemctl enable nexus.service && systemctl start nexus.service
```



## 使用supervisor管理nexus

```ini
export NEXUS_BIN_PATH="/opt/nexus-3.37.3-02/bin/nexus"

cat > /etc/supervisor/config.d/nexus.ini << EOF
[program:nexus]
command = ${NEXUS_BIN_PATH} run
stdout_logfile = /var/log/supervisor/nexus.log
redirect_stderr = true
autorestart = true
EOF
```











