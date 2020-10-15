# gitea安装

# 一、gitea简介

**Gitea是用[Go](https://golang.org/)编写的由社区管理的轻量级代码托管解决方案，类似gitlab，但是比gitlab占用资源小太多了，gitlab起码2G+内存，而gitea挤需要90M就能跑起来！！！**

*挤需体验三翻钟，里造会干我一样，爱上介款软件！！！*

​																						*--- 渣渣灰*

[gitea官网](https://gitea.io/en-us/)

[gitea英文文档](https://docs.gitea.io/en-us/)

[gitea中文文档](https://docs.gitea.io/zh-cn/)

# 二、gitea安装

gitea安装方式有很多种，详情看[官网](https://docs.gitea.io/zh-cn/)，这里选择docker安装，docker安装中的数据库有3种，``sqlite3``、``mysql``、``pg``

## 2.1下载gitea镜像

可以通过[dockerhub](https://hub.docker.com/r/gitea/gitea/tags)下载对应的gitea镜像

```python
docker pull gitea/gitea:1.11.1
```



## 2.2下载dcoker-compose

docker-compose[国内地址](http://get.daocloud.io/#install-compose)

docker-compose[官方地址](https://docs.docker.com/compose/install/)

```python
curl -L https://get.daocloud.io/docker/compose/releases/download/1.12.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
```



## 2.3编辑gitea docker-compose文件

```python
1.创建目录
mkdir /usr/local/gitea && cd /usr/local/gitea

2.编辑gitea文件
cat >docker-compose.yaml <<EOF
version: "2"

networks:
  gitea:
    external: false

services:
  server:
    image: gitea/gitea:1.11.1
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - DB_TYPE=postgres
      - DB_HOST=db:5432
      - DB_NAME=gitea
      - DB_USER=gitea
      - DB_PASSWD=gitea
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
    depends_on:
      - db

  db:
    image: postgres:9.6
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea
      - POSTGRES_DB=gitea
    networks:
      - gitea
    volumes:
      - ./postgres:/var/lib/postgresql/data
EOF

3.启动
docker-compose up -d

4.查看启动的容器
$ docker ps -a
CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS              PORTS                                         NAMES
1278b606ea46        gitea/gitea:1.11.1   "/usr/bin/entrypoint…"   26 seconds ago      Up 25 seconds       0.0.0.0:3000->3000/tcp, 0.0.0.0:222->22/tcp   gitea_server_1
b8f0be18fe78        postgres:9.6         "docker-entrypoint.s…"   27 seconds ago      Up 26 seconds       5432/tcp                                      gitea_db_1
```



## 2.4gitea数据库设置

浏览器访问IP:3000

初始界面如下，第一个注册的用户就是管理员，后续可以设置只有管理员能注册账号，可以修改配置文件，也可以在可选设置中设置

![iShot2020-10-14 16.00.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-14 16.00.59.png)



数据库设置

![iShot2020-03-0719.52.28](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0719.52.28.png)

一般设置

可以自定义``仓库根目录``和``日志目录``

![iShot2020-03-0719.55.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0719.59.01.png)



可选设置

⚠️如果这里勾选了禁止用户自主注册就必须设置管理员信息，否则你不允许注册又没设置管理员信息那企不是**🐔🐔斯密达了**？

![iShot2020-03-0719.59.01](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0719.55.11.png)

登陆后首界面

![iShot2020-03-0720.11.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0720.34.47.png)

剩下的操作就不用多说了，创建仓库、组织、用户，上传代码、拉取代码等等



## 2.5配置文件修改项

关于服务的一些修改，配置文件是``gitea/gitea/conf/app.ini``

例如，手动关闭页面注册按钮，修改``app.ini``文件中的``SHOW_REGISTRATION_BUTTON``一项

![iShot2020-03-0720.34.47](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0720.11.18.png)

[其他的配置上官网看](https://docs.gitea.io/zh-cn/config-cheat-sheet/)



<h3>我喜欢这个软件最重要的一点就是</h3><h2 style=color:red>这个软件支持中文！！！</h2>