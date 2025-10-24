[toc]



# jenkins安装

[jenkins中文官网](https://jenkins.io/zh/)

[jenkins官网](https://jenkins.io)

[jenkins github](https://github.com/jenkinsci/jenkins)



## 标准安装





### 安装jdk

jenkins版本与jdk版本兼容说明 [官方文档](https://www.jenkins.io/doc/book/platform-information/support-policy-java/)

| Supported Java versions      | Long term support (LTS) release | Weekly release        |
| ---------------------------- | ------------------------------- | --------------------- |
| Java 17 or Java 21           | 2.479.1 (October 2024)          | 2.463 (June 2024)     |
| Java 11, Java 17, or Java 21 | 2.426.1 (November 2023)         | 2.419 (August 2023)   |
| Java 11 or Java 17           | 2.361.1 (September 2022)        | 2.357 (June 2022)     |
| Java 8, Java 11, or Java 17  | 2.346.1 (June 2022)             | 2.340 (March 2022)    |
| Java 8 or Java 11            | 2.164.1 (March 2019)            | 2.164 (February 2019) |
| Java 8                       | 2.60.1 (June 2017)              | 2.54 (April 2017)     |
| Java 7                       | 1.625.1 (October 2015)          | 1.612 (May 2015)      |





import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="openjdk" label="openjdk" default>

openjdk安装可参考 [官方文档](https://openjdk.org/install/)

查看可安装版本

```shell
dnf list available | grep openjdk
```



安装

```shell
dnf -y install java-21-openjdk
```

 

 </TabItem>
  <TabItem value="oracle jdk" label="oracle jdk">

可在 [oracle官网](https://www.oracle.com/java/technologies/downloads/) 下载jdk

下载安装包

```shell
wget https://download.oracle.com/java/21/latest/jdk-21_linux-aarch64_bin.tar.gz
```



解压缩包

```shell
tar xf jdk-21_linux-aarch64_bin.tar.gz -C /usr/local
```

 

导出环境变量

```shell
cat > /etc/profile.d/jdk21.sh <<'EOF'
export JAVA_HOME=/usr/local/jdk-21.0.8
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF
```



使配置生效

```shell
source /etc/profile
```



链接命令

```shell
ln -s /usr/local/jdk-21.0.8/bin/java /usr/bin/java
```



查看版本

```shell
$ java -version
java version "21.0.8" 2025-07-15 LTS
Java(TM) SE Runtime Environment (build 21.0.8+12-LTS-250)
Java HotSpot(TM) 64-Bit Server VM (build 21.0.8+12-LTS-250, mixed mode, sharing)
```

 </TabItem>
</Tabs>



### 安装jenkins

#### rpm包安装

[jenkins lts版 rpm包官方下载地址](https://get.jenkins.io/redhat-stable/?utm_source=chatgpt.com)

下载安装包

```shell
wget https://get.jenkins.io/redhat-stable/jenkins-2.516.3-1.1.noarch.rpm
```



安装

```shell
dnf localinstall jenkins-2.516.3-1.1.noarch.rpm
```



#### yum源安装

<Tabs>
  <TabItem value="lts版" label="lts版" default>

```shell
# 下载源
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# 导入key
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# 安装jenkins
yum -y install jenkins
```

  </TabItem>
  <TabItem value="每周发布版" label="每周发布版">

```shell
# 下载源
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo

# 导入key
rpm --import https://pkg.jenkins.io/redhat/jenkins.io-2023.key

# 安装jenkins
yum -y install jenkins
```

  </TabItem>
</Tabs>



### 查看jenkins相关配置

:::tip 说明

高版本的jenkins配置文件目录在 `/var/lib/jenkins`

:::

```shell
$ egrep -v '^$|#' /usr/lib/systemd/system/jenkins.service
[Unit]
Description=Jenkins Continuous Integration Server
Requires=network.target
After=network.target
StartLimitBurst=5
StartLimitIntervalSec=5m
[Service]
Type=notify
NotifyAccess=main
ExecStart=/usr/bin/jenkins
Restart=on-failure
SuccessExitStatus=143
User=jenkins
Group=jenkins
Environment="JENKINS_HOME=/var/lib/jenkins"
WorkingDirectory=/var/lib/jenkins
Environment="JENKINS_WEBROOT=%C/jenkins/war"
Environment="JAVA_OPTS=-Djava.awt.headless=true"
Environment="JENKINS_PORT=8080"
[Install]
WantedBy=multi-user.target
```





### 启动jenkins

```shell
systemctl enable jenkins && systemctl start jenkins
```



### 访问jenkins

jenkins刚启动比较慢，等待启动完成

![iShot_2025-09-28_15.14.46](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.14.46.png)





从 `/var/lib/jenkins/secrets/initialAdminPassword` 文件按中获取密码

![iShot_2025-09-28_15.16.34](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.16.34.png)



### 配置jenkins

#### 安装插件

![iShot_2025-09-28_15.19.32](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.19.32.png)





等待安装完成

![iShot_2025-09-28_15.20.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.20.33.png)



#### 创建管理员用户(可选)

也可以使用admin用户继续

![iShot_2025-09-28_15.24.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.24.21.png)



#### 确认jenkins访问地址

![iShot_2025-09-28_15.26.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.26.30.png)





#### 开始使用

![iShot_2025-09-28_15.30.26](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.30.26.png)





#### jenkins登陆首界面

![iShot_2025-09-28_15.33.13](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-28_15.33.13.png)





## docker安装

[jenkins dockerhub](https://hub.docker.com/r/jenkins/jenkins)

[jenkins docker github](https://github.com/jenkinsci/docker/blob/master/README.md)

[jenkins docker安装官方文档](https://www.jenkins.io/doc/book/installing/docker/)

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run \
  -d \
  -h jenkins \
  --name jenkins \
  --restart=on-failure \
  -p 8080:8080 \
  -p 50000:50000 \
  -e TZ=Asia/Shanghai \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:2.516.3-lts-jdk21
```

  </TabItem>
  <TabItem value="docker compose" label="docker compose">

```yaml
cat > docker-compoe.yaml << EOF
services:
  jenkins:
    hostname: jenkins
    container_name: jenkins
    restart: on-failure
    ports:
      - 8080:8080
      - 50000:50000
    volumes:
      - jenkins_home:/var/jenkins_home
    environment:
      - TZ=Asia/Shanghai
    image: jenkins/jenkins:2.516.3-lts-jdk21
volumes:
  jenkins_home:
    name: jenkins_home
EOF
```

  </TabItem>
</Tabs>



登陆jenkins后如果提示jenkins反向代理配置错误，参考 [官方提供的nginx配置](https://www.jenkins.io/doc/book/system-administration/reverse-proxy-configuration-nginx/) 即可

```nginx
upstream jenkins {
  keepalive 32; # keepalive connections
  server 127.0.0.1:8080; # jenkins ip and port
}

# Required for Jenkins websocket agents
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  listen          80;       # Listen on port 80 for IPv4 requests

  server_name     jenkins.example.com;  # replace 'jenkins.example.com' with your server domain name

  # this is the jenkins web root directory
  # (mentioned in the output of "systemctl cat jenkins")
  root            /var/run/jenkins/war/;

  access_log      /var/log/nginx/jenkins.access.log;
  error_log       /var/log/nginx/jenkins.error.log;

  # pass through headers from Jenkins that Nginx considers invalid
  ignore_invalid_headers off;

  location ~ "^\/static\/[0-9a-fA-F]{8}\/(.*)$" {
    # rewrite all static files into requests to the root
    # E.g /static/12345678/css/something.css will become /css/something.css
    rewrite "^\/static\/[0-9a-fA-F]{8}\/(.*)" /$1 last;
  }

  location /userContent {
    # have nginx handle all the static requests to userContent folder
    # note : This is the $JENKINS_HOME dir
    root /var/lib/jenkins/;
    if (!-f $request_filename){
      # this file does not exist, might be a directory or a /**view** url
      rewrite (.*) /$1 last;
      break;
    }
    sendfile on;
  }

  location / {
      sendfile off;
      proxy_pass         http://jenkins;
      proxy_redirect     default;
      proxy_http_version 1.1;

      # Required for Jenkins websocket agents
      proxy_set_header   Connection        $connection_upgrade;
      proxy_set_header   Upgrade           $http_upgrade;

      proxy_set_header   Host              $http_host;
      proxy_set_header   X-Real-IP         $remote_addr;
      proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header   X-Forwarded-Proto $scheme;
      proxy_max_temp_file_size 0;

      #this is the maximum upload size
      client_max_body_size       10m;
      client_body_buffer_size    128k;

      proxy_connect_timeout      90;
      proxy_send_timeout         90;
      proxy_read_timeout         90;
      proxy_request_buffering    off; # Required for HTTP CLI commands
  }
}
```



