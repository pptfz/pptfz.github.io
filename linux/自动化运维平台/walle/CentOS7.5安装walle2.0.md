# CentOS7.5安装walle2.0

# 标准安装

**walle2.0是基于python开发的，需要python2.7+，mysql5.6.5以上版本**

[官方文档](http://www.walle-web.io/docs/dependency.html)



**瓦力上线流程**

![QQ20191202-170743@2x](CentOS7.5安装walle2.0.assets/QQ20191202-170743@2x.png)





# 一、系统环境

## 1.1Linux系统版本

```python
[root@walle ~]# cat /etc/redhat-release 
CentOS Linux release 7.5.1804 (Core) 
```



## 1.2python版本

```python
[root@walle ~]# python --version
Python 2.7.5
```



# 二、安装步骤

## 2.1更换阿里云yum源及添加epel源

```python
#备份原有base源
[root@walle ~]# mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

#下载阿里云yum源
[root@walle ~]# wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

#下载epel源
[root@walle ~]# wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo

#清空缓存、生成yum缓存
[root@walle ~]# yum clean all && yum makecache
```



## 2.2安装依赖包

```python
[root@walle ~]# yum -y install python2-pip python-virtualenv
```



## 2.3安装mysql-5.7.22

[gitbook链接-安装msql-5.7.22](https://gitbook.pptfz.top/db/mysql/mysql%E5%9F%BA%E7%A1%80/4.CentOS7.5%E4%BA%8C%E8%BF%9B%E5%88%B6%E5%AE%89%E8%A3%85MySQL-5.7.22.html)

[有道云链接-安装mysql-5.7.22](http://note.youdao.com/noteshare?id=797a38d0cd414fbd93dc6f4ab6f74ce3&sub=A4D89AF1BA6142F6B4A10620F4BB788D)



## 2.4安装nginx1.14并配置

```python
#添加nginx官方yum源
[root@walle ~]# cat >/etc/yum.repos.d/nginx.repo <<'EOF'
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
EOF

#安装nginx1.14
[root@walle ~]# yum -y install nginx

#移除nginx默认文件并创建walle日志目录
[root@walle ~]# mv /etc/nginx/conf.d/default.conf \
/etc/nginx/conf.d/default.conf.old
[root@walle ~]# mkdir /var/log/walle

#编辑瓦力配置文件
[root@walle ~]# cat >/etc/nginx/conf.d/my.walle.com.conf<<'EOF'
upstream webservers {
    server 0.0.0.0:5000 weight=1; # 负载设置
}

server {
    listen       80;
    server_name  my.walle2.com; # 域名设置
    access_log   /var/log/walle/walle.log main;
    index index.html index.htm; # 日志目录

    location / {
        try_files $uri $uri/ /index.html;
        add_header access-control-allow-origin *;
        root /walle-web/fe; # 前端代码已集成到walle-web，即walle-web/fe的绝对路径
    }

    location ^~ /api/ {
        add_header access-control-allow-origin *;
        proxy_pass      http://webservers;
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header  X-Real-IP  $remote_addr;
        proxy_set_header    Origin        $host:$server_port;
        proxy_set_header    Referer       $host:$server_port;
    }

    location ^~ /socket.io/ {
        add_header access-control-allow-origin *;
        proxy_pass      http://webservers;
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header  X-Real-IP  $remote_addr;
        proxy_set_header    Origin        $host:$server_port;
        proxy_set_header    Referer       $host:$server_port;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        # WebScoket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

#检测语法
[root@walle ~]# nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

#启动nginx并设置开机自启
[root@walle ~]# systemctl start nginx && systemctl enable nginx
```



## 2.5克隆瓦力

```python
#克隆瓦力项目
[root@walle ~]# git clone https://github.com/meolu/walle-web.git

#将瓦利项目移至根下
[root@walle ~]# mv walle-web /
```



## 2.6编辑hosts文件

```python
#域名要与nginx配置文件中一样
[root@walle ~]# echo "127.0.0.1  my.walle2.com" >>/etc/hosts 
```



## 2.7安装python2.7+pip

```python
[root@walle ~]# cd /walle-web
[root@walle walle-web]# sh admin.sh init

安装后提示如下即为成功
init walle success 
welcome to walle 2.0

# 注意：安装mysqlclient失败，需要先安装libmysqlclient-dev(ubuntu)
# 注意：安装失败请指定python路径. mac 可能会有用anaconda的python，找到自己系统的python 2.7追加参数指定 -p /usr/bin/python2.7 即可
vim admin.sh +20
virtualenv --no-site-packages -p /usr/local/bin/python2.7 venv
```



## 2.8编辑python配置文件/walle-web/walle/config/settings_prod.py

```python
#编辑配置文件
[root@walle walle-web]# pwd
/walle-web
[root@walle walle-web]# vim walle/config/settings_prod.py
修改以下几项
25行，域名设置，要与nginx配置文件中的域名相同
    HOST = 'my.walle2.com'

31行，数据库设置，修改user和password，这里为root用户，密码123456，端口为3306
    SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost:3306/walle?charset=utf8'

34行，指定本地代码检出路径（用户查询分支, 编译, 打包）
	CODE_BASE = '/data/walle/codebase/'

45行以下为邮箱设置
    MAIL_SERVER = 'smtp.163.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_DEFAULT_SENDER = 'xxx@163.com'
    MAIL_USERNAME = 'xxx'
    MAIL_PASSWORD = '123456'

#创建本地代码检出路径
[root@walle walle-web]# mkdir -p /data/walle/codebase
```



## 2.9创建walle数据库并进行数据迁移

```python
#创建walle数据库
[root@walle walle-web]# mysql -uroot -p -e "create database walle"

#创建软连接，否则后续执行迁移脚本会出错
先找到libmysqlclient.so.20位置，这里为/usr/local/mysql-5.7.22/lib/libmysqlclient.so.20，
因为做了/usr/local/mysql软连接，所以可以直接使用/usr/local/mysql/lib/路径
[root@walle walle-web]# find / -name "libmysqlclient.so.20"
/usr/local/mysql-5.7.22/lib/libmysqlclient.so.20

[root@walle walle-web]# ln -s /usr/local/mysql/lib/libmysqlclient.so.20 /usr/lib64/libmysqlclient.so.20

[root@walle walle-web]# sh admin.sh migration
最后提示OK即为成功
```



## 2.10启动瓦力并加入开机自启

```python
[root@walle walle-web]# sh admin.sh start
[root@walle walle-web]# echo "cd /walle-web/ && sh admin.sh start" >>/etc/rc.local
[root@walle ~]# chmod +x /etc/rc.d/rc.local 
```



## 2.11绑定hosts文件

```python
//windows
C:\Windows\System32\drivers\etc
10.0.0.11  my.walle2.com

//mac
/etc/hosts
```



## 2.12登陆瓦力

```python
初始登陆账号
超管：super@walle-web.io \ Walle123
所有者：owner@walle-web.io \ Walle123
负责人：master@walle-web.io \ Walle123
开发者：developer@walle-web.io \ Walle123
访客：reporter@walle-web.io \ Walle123
```



**瓦力重启、升级、数据迁移**

```python
sh admin.sh restart # 重启
sh admin.sh upgrade # 升级walle，升级完需要重启walle服务。
升级前最好 git stash 暂存本地修改，升级后git stash pop弹出暂存，
然后重启服务。
sh admin.sh migration # Migration，数据迁移
```



**登陆界面**

![c111](CentOS7.5安装walle2.0.assets/c111.png)





**登陆后首界面**

![c222](CentOS7.5安装walle2.0.assets/c222.png)



**<span style=color:red>到此，瓦力2.0标准安装完成！！！</span>**

---

# docker安装

# 一、安装docker

## 1.1下载官方yum源

```python
#添加yum源
[root@docker01 ~]# curl -o /etc/yum.repos.d/docker-ce.repo \
https://mirrors.ustc.edu.cn/docker-ce/linux/centos/docker-ce.repo

#添加官方yum源
[root@docker01 ~]# yum-config-manager --add-repo  https://download.docker.com/linux/centos/docker-ce.repo
```



## 1.2.修改docker官方yum源地址为清华源

```python
[root@docker01 ~]# sed -i 's#download.docker.com#mirrors.tuna.tsinghua.edu.cn/docker-ce#g' \
/etc/yum.repos.d/docker-ce.repo
```



## 1.3安装docker     docker-ce  社区版

```python
[root@docker01 ~]# yum -y install docker-ce
```



## 1.4.启动docker

```python
[root@docker01 ~]# systemctl start docker && systemctl enable docker
```



## 1.5查看docker版本

```python
[root@docker01 ~]# docker version
Client:
 Version:           18.09.1
 API version:       1.39
 Go version:        go1.10.6
 Git commit:        4c52b90
 Built:             Wed Jan  9 19:35:01 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          18.09.1
  API version:      1.39 (minimum version 1.12)
  Go version:       go1.10.6
  Git commit:       4c52b90
  Built:            Wed Jan  9 19:06:30 2019
  OS/Arch:          linux/amd64
  Experimental:     false
```



## 1.6配置docker镜像加速

```python
#配置docker官方镜像加速地址
[root@docker01 ~]# cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
EOF

#配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

#配置完成后重启docker
[root@docker01 ~]# systemctl restart docker
```



# 二、安装docker-compose

## 2.1下载安装包

```python
[root@docker01 ~]# curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```



## 2.2给二进制文件添加可执行权限

```python
[root@docker01 ~]# chmod +x /usr/local/bin/docker-compose
```



## 2.3完成安装，查看版本

```python
[root@docker01 ~]# docker-compose -v
docker-compose version 1.24.1, build 4667896b
```





# 三、编辑walle2.0 docker-compose文件并启动walle2.0容器

## 3.1创建存放文件目录

```python
[root@docker01 ~]# mkdir /usr/local/walle2.0 && cd /usr/local/walle2.0
```



## 3.2新建walle.env，连接数据库MYSQL_USER默认使用root,如需使用其他用户，需自建用户更改walle.env文件

```python
cat >walle.env <<EOF
# Set MySQL/Rails environment
MYSQL_USER=root
MYSQL_PASSWORD=walle
MYSQL_DATABASE=walle
MYSQL_ROOT_PASSWORD=walle
MYSQL_HOST=db
MYSQL_PORT=3306
EOF
```



## 3.3创建docker-compose文件

```python
cat >docker-compose.yml <<EOF
# docker version:  18.06.0+
# docker-compose version: 1.23.2+
# OpenSSL version: OpenSSL 1.1.0h
version: "3.7"
services:
  web:
    image: alenx/walle-web:2.1
    container_name: walle-nginx
    hostname: nginx-web
    ports:
      # 如果宿主机80端口被占用，可自行修改为其他port(>=1024)
      # 0.0.0.0:要绑定的宿主机端口:docker容器内端口80
      - "80:80"
    depends_on:
      - python
    networks:
      - walle-net
    restart: always

  python:
    image: alenx/walle-python:2.1
    container_name: walle-python
    hostname: walle-python
    env_file:
      # walle.env需和docker-compose在同级目录
      - ./walle.env
    command: bash -c "cd /opt/walle_home/ && /bin/bash admin.sh migration &&  python waller.py"
    expose:
      - "5000"
    volumes:
      - /opt/walle_home/plugins/:/opt/walle_home/plugins/
      - /opt/walle_home/codebase/:/opt/walle_home/codebase/
      - /opt/walle_home/logs/:/opt/walle_home/logs/
      - /root/.ssh:/root/.ssh/
    depends_on:
      - db
    networks:
      - walle-net
    restart: always

  db:
    image: mysql
    container_name: walle-mysql
    hostname: walle-mysql
    env_file:
      - ./walle.env
    command: [ '--default-authentication-plugin=mysql_native_password', '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci']
    ports:
      - "3306:3306"
    expose:
      - "3306"
    volumes:
      - /data/walle/mysql:/var/lib/mysql
    networks:
      - walle-net
    restart: always

networks:
  walle-net:
    driver: bridge
EOF
```



## 3.4启动容器

```python
docker-compose up -d
```

**启动完成后浏览器访问宿主机IP地址80端口完成登陆**





## 3.5初始账号及常用操作

```python
//初始账号
超管：super@walle-web.io \ Walle123
所有者：owner@walle-web.io \ Walle123
负责人：master@walle-web.io \ Walle123
开发者：developer@walle-web.io \ Walle123
访客：reporter@walle-web.io \ Walle123



//常用操作
# 构建服务
docker-compose build

# 启动服务,启动过程中可以直接查看终端日志，观察启动是否成功
docker-compose up

# 启动服务在后台，如果确认部署成功，则可以使用此命令，将应用跑在后台，作用类似 nohup python waller.py &
docker-compose up -d

# 查看日志,效果类似 tail -f waller.log
docker-compose logs -f

# 停止服务,会停止服务的运行，但是不会删除服务所所依附的网络，以及存储等
docker-compose stop

# 删除服务，并删除服务产生的网络，存储等，并且会关闭服务的守护
docker-compose down
```

