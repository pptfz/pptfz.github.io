[toc]



# gitea安装

## 简介

**Gitea是用[Go](https://golang.org/)编写的由社区管理的轻量级代码托管解决方案，类似gitlab，但是比gitlab占用资源小太多了，gitlab起码2G+内存，而gitea挤需要90M就能跑起来！！！**

*挤需体验三翻钟，里造会干我一样，爱上介款软件！！！*

​																						*--- 渣渣灰*

[gitea官网](https://gitea.io/en-us/)

[gitea英文文档](https://docs.gitea.io/en-us/)

[gitea中文文档](https://docs.gitea.io/zh-cn/)



**gitea与Gogs**

Gitea其实是Gogs的孪生兄弟，因为这是从Gogs源码的基础上开发的，算是分叉?官方介绍是"[Gitea](https://javajgs.com/go?url=http://www.senra.me/tag/gitea/) 是一个开源社区驱动的 [Gogs](https://javajgs.com/go?url=http://www.senra.me/tag/gogs/) 克隆"，关于原因可以参考官网上的一篇介绍——>[传送门](https://javajgs.com/go?url=https://blog.gitea.io/2016/12/welcome-to-gitea/)

基本上就是有一部分开发者认为Gogs的开发者效率比较慢，而且不接受他人加入开发，所有修改和PR都需要经过他一个人的审核，这对Gogs的发展很不利。因而部分开发者决定基于Gogs重开一个项目，这就是Gitea。



[Gogs docker安装官方文档](https://github.com/gogs/gogs/tree/main/docker)



## 安装

gitea安装方式有很多种，详情看[官网](https://docs.gitea.io/zh-cn/)，这里选择docker安装，docker安装中的数据库有3种，``sqlite3``、``mysql``、``pg``



### docker安装

#### 编辑docker-compose文件

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="mysql" label="mysql" default>

```yaml
cat > docker-compose.yaml << EOF
networks:
  gitea:
    external: false

services:
  server:
    image: gitea/gitea:1.24.6
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=mysql
      - GITEA__database__HOST=db:3306
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea
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
    image: mysql:8
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=gitea
      - MYSQL_USER=gitea
      - MYSQL_PASSWORD=gitea
      - MYSQL_DATABASE=gitea
    networks:
      - gitea
    volumes:
      - ./mysql:/var/lib/mysql
EOF
```

  </TabItem>
  <TabItem value="pg" label="pg">

```yaml
cat > docker-compose.yaml << EOF
networks:
  gitea:
    external: false

services:
  server:
    image: gitea/gitea:1.24.6
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea
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
    image: postgres:14
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
```

  </TabItem>
  <TabItem value="sqlite3" label="sqlite3">

```yaml
cat > docker-compose.yaml << EOF
networks:
  gitea:
    external: false

services:
  server:
    image: gitea/gitea:1.24.6
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
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
EOF
```

  </TabItem>
</Tabs>



#### 启动

```sh
docker-compose up -d
```



#### 查看启动的容器

```shell
$ docker-compose ps -a
NAME         IMAGE                COMMAND                  SERVICE   CREATED              STATUS              PORTS
gitea        gitea/gitea:1.24.6   "/usr/bin/entrypoint…"   server    About a minute ago   Up About a minute   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp, 0.0.0.0:222->22/tcp, [::]:222->22/tcp
gitea-db-1   mysql:8              "docker-entrypoint.s…"   db        About a minute ago   Up About a minute   3306/tcp, 33060/tcp
```



## 初始配置

浏览器访问 `IP:3000`

![iShot_2025-09-17_19.16.36](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.16.36.png)



### 数据库设置

![iShot_2025-09-17_19.21.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.21.42.png)



### 一般设置

![iShot_2025-09-17_19.22.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.22.55.png)



### 可选设置

#### 电子邮箱设置

![iShot_2025-09-17_19.25.58](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.25.58.png)



#### 服务器和第三方服务设置

![iShot_2025-09-17_19.28.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.28.11.png)



#### 管理员账号设置

![iShot_2025-09-17_19.29.47](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.29.47.png)





## 登陆

确认初始配置后点击 `立即安装` 就会自动登陆

![iShot_2025-09-17_19.36.19](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-17_19.36.19.png)





## 配置文件修改项

[更多的配置可参考官方文档](https://docs.gitea.io/zh-cn/config-cheat-sheet/)

gitea配置文件是 `gitea/gitea/conf/app.ini`

例如，手动关闭页面注册按钮，修改 `app.ini` 文件中的`DISABLE_REGISTRATION` 一项

```shell
[service]
DISABLE_REGISTRATION = true
```





默认是允许注册的

![iShot_2025-09-26_11.40.24](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-26_11.40.24.png)



关闭注册后注册按钮就不见了

![iShot_2025-09-26_12.31.00](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-09-26_12.31.00.png)









<h3>我喜欢这个软件最重要的一点就是</h3><h2 style={{color: 'red'}}>这个软件支持中文！！！</h2>

