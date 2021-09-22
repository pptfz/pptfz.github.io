

[codo官网](https://docs.opendevops.cn/)

[codo github](https://github.com/opendevops-cn/opendevops)

[codo官方文档](https://docs.opendevops.cn/zh/guide/)



[toc]



# 1.codo简介

**简介**

- CODO是一款为用户提供企业多混合云、自动化运维、完全开源的云管理平台。

- CODO前端基于Vue iview开发、为用户提供友好的操作界面，增强用户体验。

- CODO后端基于Python Tornado开发，其优势为轻量、简洁清晰、异步非阻塞。

- CODO开源多云管理平台为用户提供多功能：ITSM、基于RBAC权限系统、Web Terminnal登陆日志审计、录像回放、强大的作业调度系统、CMDB、监控报警系统等



```
codo_tools:latest                                               0.0.0.0:8040->80/tcp
gateway_image                                                   0.0.0.0:8888->80/tcp
kerrigan_image                                                  0.0.0.0:8030->80/tcp
codo_cron_image                                                 0.0.0.0:9900->9900/tcp
codo_cmdb:latest                                                0.0.0.0:8050->80/tcp
do_mg_image                                                     0.0.0.0:8010->80/tcp
codo_dns_image                                                  0.0.0.0:8060->80/tcp
codo_task_image                                                 0.0.0.0:8020->80/tcp
webterminal/webterminallte                                      0.0.0.0:8081->80/tcp
codo_image                                                      0.0.0.0:444->443/tcp
registry.cn-shanghai.aliyuncs.com/ss1917/rabbitmq:3-management  0.0.0.0:15673->15672/tcp
registry.cn-shanghai.aliyuncs.com/ss1917/redis:4                0.0.0.0:6380->6379/tcp
registry.cn-shanghai.aliyuncs.com/ss1917/mysql:5.7              0.0.0.0:3307->3306/tcp
```



**codo相关组件**

- **codo-web**
  - 功能：项目前端
  - 端口：80/443(根据实际情况设置)
  - 安装：必须
  - 检测：`openresty -t`
- **codo-admin**
  - 功能：管理后端
  - 端口：8010
  - 安装：必须
  - 检测： `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://mg.opendevops.cn:8010/are_you_ok/`
- **codo-cmdb**
  - 功能：资产管理
  - 端口：8050
  - 安装：必须
  - 检测： `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://cmdb2.opendevops.cn:8050/are_you_ok/`
- **codo-task**
  - 功能：任务系统
  - 端口：8020
  - 安装：必须
  - 检测:  `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://task.opendevops.cn:8020/are_you_ok/`
- **codo-cron**
  - 功能：定时任务
  - 端口：9900
  - 安装：必须
  - 备注:  单进程，可使用本机IP
  - 检测:  `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://cron.opendevops.cn:9900/are_you_ok/`
- **kerrigan**
  - 功能：配置中心
  - 端口：8030
  - 安装：必须
  - 检测:  `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://kerrigan.opendevops.cn:8030/are_you_ok/`
- **codo-tools**
  - 功能：运维工具
  - 端口：8040
  - 安装：必须
  - 检测:  `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://tools.opendevops.cn:8040/are_you_ok/`
- **codo-dns**
  - 功能：域名管理
  - 端口：8060
  - 安装：必须
  - 检测:  `curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://dns.opendevops.cn:8060/are_you_ok/`



- **api-gateway**
  - 功能：API网关服务
  - 端口：8888
  - 安装：必须
  - 检测：`curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://gw.opendevops.cn:8888/api/accounts/are_you_ok/`



**codo架构示意图**

- Apigateway代理前端文件
- ApigateWay依赖DNS服务，需要安装Dnsmasq
- 微服务部署完成后，需在Apigateway进行注册
- 一台MySQL Master示例，不同的微服务使用单独的库

![iShot2021-03-02 14.47.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-02 14.47.02.png)



# 2.安装部署

codo部署方式有[单机部署](https://docs.opendevops.cn/zh/guide/install/local/#%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87)和[分布式部署](https://docs.opendevops.cn/zh/guide/install/distribute/)，这里采用分布式部署(伪分布式)

## 2.0 部署步骤

### 2.0.1 基础环境

- 优化系统
- 设置环境变量脚本
- 防火墙、SELINUX设置
- 安装docker
- 安装python3
- 安装mysql
- 安装redis
- 安装RabbitMQ
- 安装DNS

### 2.0.2 部署项目前端 codo-web

### 2.0.3 部署项目后端 codo-admin

### 2.0.4 部署资产管理 codo-cmdb

### 2.0.5 部署定时任务 codo-cron

### 2.0.6 部署任务系统 codo-task

### 2.0.7 部署运维工具 codo-tools

### 2.0.8 部署配置中心 kerrigan

### 2.0.9 部署域名管理 codo-dns

### 2.0.10 部署API网关api-gateway



## 2.1 环境准备

### 2.1.1 建议配置

- 系统： CentOS7+
- CPU： 4Core+
- 内存： 8G+
- 磁盘： 50G+

本文机器配置为 

| 操作系统  | 配置  | 硬盘     |
| --------- | ----- | -------- |
| CentOS7.8 | 4c16g | 50g+100g |



### 2.1.2 基础环境

版本约束

- Python3.6
- Redis3.2
- MySQl5.7
- RabbitMQ
- Docker
- Docker-compose



### 2.1.3 优化系统

[官方提供的优化脚本，请根据实际情况操作](https://github.com/opendevops-cn/opendevops/blob/master/scripts/system_init_v1.sh)



```sh
#usage() {
#    echo "请按如下格式执行"
#    echo "USAGE: bash $0 函数名1#函数名2"
#    echo "USAGE: bash $0 epel#ulimits#ssh"
#    exit 1
#}
#

function epel(){
	yum install epel-release -y >/dev/null 2>&1
	sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/epel.repo
	sed -i 's/#baseurl/baseurl/g' /etc/yum.repos.d/epel.repo
	sed -i '6s/enabled=0/enabled=1/g' /etc/yum.repos.d/epel.repo
	sed -i '7s/gpgcheck=1/gpgcheck=0/g' /etc/yum.repos.d/epel.repo
	yum clean all >/dev/null 2>&1
	#阿里云机器用aliyun epel
	#echo "[EPEL 配置] ==> OK"
}

function ulimits(){
cat > /etc/security/limits.conf <<EOF
* soft noproc 65536
* hard noproc 65536
* soft nofile 65536
* hard nofile 65536
EOF
# centos 7.3 还是 7.4开始， 这个文件有一部分soft 和 nproc 内容，登陆后会被覆盖，/etc/security/limits.conf 不会生效
echo > /etc/security/limits.d/20-nproc.conf 

ulimit -n 65536
ulimit -u 65536


#echo "[ulimits 配置] ==> OK"


}


# 系统默认没有 /etc/init.d/sshd 需要使用 systemctl restart  sshd
function ssh(){
	[ -f /etc/ssh/sshd_config ]  && sed -ir '13 iUseDNS no\nGSSAPIAuthentication no' /etc/ssh/sshd_config && systemctl restart  sshd >/dev/null 2>&1
#echo "[SSH 优化] ==> OK"
}

# 修改内核参数，增加缓存区，减少等待时间
# 可以接收更大的包，增加对轻量ddos抗性
function kernel(){
cat > /etc/sysctl.conf <<EOF
fs.file-max = 65536
net.core.netdev_max_backlog = 32768
net.core.rmem_default = 8388608
net.core.rmem_max = 16777216
net.core.somaxconn = 32768
net.core.wmem_default = 8388608
net.core.wmem_max = 16777216
net.ipv4.conf.all.arp_ignore = 0
net.ipv4.conf.lo.arp_announce = 0
net.ipv4.conf.lo.arp_ignore = 0
net.ipv4.ip_local_port_range = 5000 65000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_max_orphans = 3276800
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_max_tw_buckets = 5000
net.ipv4.tcp_mem = 94500000 915000000 927000000
net.ipv4.tcp_syn_retries = 2
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_timestamps = 0
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_tw_reuse = 1
EOF
sysctl -p >/dev/null 2>&1
#echo "[内核 优化] ==> OK"
}

# 增加操作系统记录数量
function history(){
	if ! grep "HISTTIMEFORMAT" /etc/profile >/dev/null 2>&1
	then echo '
	UserIP=$(who -u am i | cut -d"("  -f 2 | sed -e "s/[()]//g")
	export HISTTIMEFORMAT="[%F %T] [`whoami`] [${UserIP}] " ' >> /etc/profile;
	fi
	sed -i "s/HISTSIZE=1000/HISTSIZE=999999999/" /etc/profile
#echo "[history 优化] ==> OK"
}

# 这个稍后我再试一试，我是倾向不要关闭selinux，而是使用系统权限完善来控制软件运行。
# 稍后测试一下看看
function security(){
	> /etc/issue
	sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
	sed -i 's/SELINUX=permissive/SELINUX=disabled/g' /etc/selinux/config
	setenforce 0 >/dev/null 2>&1
	#systemctl stop firewalld.service
	#systemctl disable firewalld.service
	yum install -y openssl openssh bash >/dev/null 2>&1
	#echo "[安全配置] ==> OK"
}

function other(){
	yum groupinstall Development tools -y >/dev/null 2>&1
	yum install -y vim wget lrzsz telnet traceroute iotop tree >/dev/null 2>&1
	yum install -y ncftp axel git zlib-devel openssl-devel unzip xz libxslt-devel libxml2-devel libcurl-devel >/dev/null 2>&1
	#echo "[安装常用工具] ==> OK"
	echo "export HOME=/root" >> /etc/profile
	source /etc/profile
	useradd -M -s /sbin/nologin nginx >/dev/null 2>&1
	mkdir -p /root/ops_scripts /data1/www
	mkdir -p /opt/codo/
}

export -f epel
export -f ulimits
export -f ssh
export -f kernel
export -f history
export -f security
export -f other

##格式必须是: bash script 函数名1#函数2
## 例如: bash system_init_v1.sh epel#ulimits#ssh
#echo $1 | awk -F "#" '{for(i=1;i<=NF;++i) system($i)}'
epel
ulimits
ssh
kernel
history
security
other
#echo '[Success]System Init OK'
```



### 2.1.4 环境变量

> 创建项目目录

```sh
mkdir -p /opt/codo/ && cd /opt/codo/
```



> 以下内容贴入到 `/opt/codo/env.sh` 文件，⚠️主要修改配置地址和密码信息

```sh
cat > /opt/codo/env.sh <<'EOF'
echo -e "\033[31m 注意：token_secret一定要做修改，防止网站被攻击!!!!!!! \033[0m"
echo -e "\033[32m 注意：token_secret一定要做修改，防止网站被攻击!!!!!!! \033[0m"
echo -e "\033[33m 注意：token_secret一定要做修改，防止网站被攻击!!!!!!! \033[0m"

# 部署的IP地址
export LOCALHOST_IP="10.10.10.12"

# 设置你的MYSQL密码
export MYSQL_PASSWORD="m9uSFL7duAVXfeAwGUSG"

### 设置你的redis密码
export REDIS_PASSWORD="cWCVKJ7ZHUK12mVbivUf"

### RabbitMQ用户密码信息
export MQ_USER="ss"
export MQ_PASSWORD="5Q2ajBHRT2lFJjnvaU0g"


# codo-admin用到的cookie和token
export cookie_secret="nJ2oZis0V/xlArY2rzpIE6ioC9/KlqR2fd59sD=UXZJ=3OeROB"
# 这里codo-admin和gw网关都会用到，一定要修改。可生成随意字符
export token_secret="pXFb4i%*834gfdh963df718iodGq4dsafsdadg7yI6ImF1999aaG7"


## 如果要进行读写分离，Master-slave主从请自行建立，一般情况下都是只用一个数据库就可以了
# 写数据库
export DEFAULT_DB_DBHOST="10.10.10.12"
export DEFAULT_DB_DBPORT='3307'
export DEFAULT_DB_DBUSER='root'
export DEFAULT_DB_DBPWD=${MYSQL_PASSWORD}
# export DEFAULT_DB_DBNAME=${mysql_database}

# 读数据库
export READONLY_DB_DBHOST='10.10.10.12'
export READONLY_DB_DBPORT='3307'
export READONLY_DB_DBUSER='root'
export READONLY_DB_DBPWD=${MYSQL_PASSWORD}
# export READONLY_DB_DBNAME=${mysql_database}

# 消息队列
export DEFAULT_MQ_ADDR='10.10.10.12'
export DEFAULT_MQ_USER=${MQ_USER}
export DEFAULT_MQ_PWD=${MQ_PASSWORD}

# 缓存
export DEFAULT_REDIS_HOST='10.10.10.12'
export DEFAULT_REDIS_PORT=6379
export DEFAULT_REDIS_PASSWORD=${REDIS_PASSWORD}
EOF
```



> 使配置文件生效

```sh
source /opt/codo/env.sh
```



### 2.1.5 防火墙、SELINUX

**关闭SELINUX**

```sh
# 临时关闭
$ setenforce 0

# 或修改配置文件关闭,需要重启
$ vim /etc/selinux/config  
将SELINUX=enforcing改为SELINUX=disabled 
设置后需要重启才能生效  
```



**清空防火墙规则**

> 注意，不要关闭防火墙，Docker需要用到NAT

```sh
# 只清空filter链即可
$ iptables -F
```



### 2.1.6 安装python3

> 建议使用Python36,若你的系统里面已经存在Python36可以跳过此步骤。

```sh
# 安装依赖包
yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel libffi-devel gcc gcc-c++ make

# 下载python源码包
wget https://www.python.org/ftp/python/3.6.9/Python-3.6.9.tar.xz

# 编译安装
tar xf Python-3.6.9.tar.xz && cd Python-3.6.9
./configure --prefix=/usr/local/python36 --with-ssl
make && make install

# 导出python命令环境变量
echo 'PATH=/usr/local/python36/bin:$PATH' >/etc/profile.d/python36.sh && source /etc/profile

# 配置pip国内源
mkdir ~/.pip
cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF
```



### 2.1.7 安装docker

**安装docker**

```sh
# 添加阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo 

# 安装最新版
yum -y install docker-ce

# 安装指定版本
# yum list docker-ce --showduplicates | sort -r
# yum -y install docker-ce-18.03.1.ce docker-ce-cli-18.01.1.ce

# 启动docker
systemctl start docker && systemctl enable docker

# 配置docker镜像加速
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```



**安装docker-compose**

```sh
curl -L https://get.daocloud.io/docker/compose/releases/download/1.28.5/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```



### 2.1.8 安装mysql

> 一般来说一个MySQL实例即可，如果有需求可以自行搭建主从，微服务每个服务都可以有自己的数据库
>
> 我们这里示例是用Docker部署的MySQL，如果你要用已有的数据库请修改`/opt/codo/env.sh`



**创建 docker-compose.yml**

```sh
source /opt/codo/env.sh
mkdir -p /opt/codo/codo-mysql && cd /opt/codo/codo-mysql
cat > docker-compose.yml <<EOF
mysql:
  restart: unless-stopped
  image: registry.cn-shanghai.aliyuncs.com/ss1917/mysql:5.7
  volumes:
    - /data/docker-volume/codo/mysql/data:/var/lib/mysql
    - /data/docker-volume/codo/mysql/conf:/etc/mysql/conf.d
  ports:
    - "3307:3306"
  environment:
    - MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
EOF
```



**启动**

```
docker-compose up -d
```



**安装MySQL客户端**

```sh
yum install mysql -y 
if [ $? == 0 ];then
    echo -e "\033[32m [INFO]: mysql install success. \033[0m"
    echo -e "\033[32m [INFO]: 最好提高下MySQL的最大链接数. \033[0m"
    echo -e "\033[32m [INFO]: mysql -h127.0.0.1 -uroot -p${MYSQL_PASSWORD} \033[0m"
else
    echo -e "\033[31m [ERROR]: mysql57 install faild \033[0m"
    exit -3
fi
```



**测试连接**

```sh
mysql -h127.0.0.1 -uroot -P3307 -p${MYSQL_PASSWORD}
```



### 2.1.9 安装redis

**创建 docker-compose.yml**

```sh
source /opt/codo/env.sh
mkdir -p /opt/codo/codo-redis && cd /opt/codo/codo-redis
cat >docker-compose.yml <<EOF
redis:
    image: registry.cn-shanghai.aliyuncs.com/ss1917/redis:4
    ports:
      - 6380:6379
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
EOF
```



**启动**

```
docker-compose up -d
```



**安装redis客户端**

```
yum install redis -y
```



**测试连接**

```sh
redis-cli -h 127.0.0.1 -p 6380 -a ${REDIS_PASSWORD}
```



### 2.1.10 安装RabbitMQ

**创建 docker-compose.yml**

```sh
source /opt/codo/env.sh
mkdir -p /opt/codo/codo-mq && cd /opt/codo/codo-mq 
cat >docker-compose.yml <<EOF
rabbitmq:
    restart: unless-stopped
    image: registry.cn-shanghai.aliyuncs.com/ss1917/rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=${MQ_USER}
      - RABBITMQ_DEFAULT_PASS=${MQ_PASSWORD}
    ports:
      - "15673:15672"
      - "5673:5672"
EOF
```



**启动**

```
docker-compose up -d
```



### 2.1.11 安装DNS

> 部署内部DNS dnsmasq 用于服务间内部通信，API网关需要配置，切记

**安装dnsmasq**

```sh
echo -e "\033[32m [INFO]: Start install dnsmasq \033[0m"
yum install dnsmasq -y
```



**设置上游DNS**

```sh
# 设置上游DNS，毕竟你的Dns只是个代理
cat >/etc/resolv.dnsmasq <<EOF
nameserver 114.114.114.114
nameserver 8.8.8.8
EOF
```



**设置host解析 **

```sh
echo -e "\033[32m [INFO]: 如果你是单机部署，那么你就将你的本机IP+模块域名解析即可，如果你是分布式部署的，那么每个模块对应的机器IP一定不要搞错，这个很重要，后面网关也要依赖此DNS去解析你的域名，帮你做服务转发的，切记！！！！
 \033[0m"
cat >/etc/dnsmasqhosts <<EOF
$LOCALHOST_IP demo-init.opendevops.cn 
$LOCALHOST_IP mg.opendevops.cn
$LOCALHOST_IP task.opendevops.cn
$LOCALHOST_IP gw.opendevops.cn
$LOCALHOST_IP cmdb2.opendevops.cn
$LOCALHOST_IP kerrigan.opendevops.cn
$LOCALHOST_IP tools.opendevops.cn
$LOCALHOST_IP cron.opendevops.cn
$LOCALHOST_IP dns.opendevops.cn
EOF
```



**添加配置**

```sh
echo -e "\033[32m [INFO]: 刚装完DNS可以先不用改本机的DNS，有一部分人反应Docker Build时候会报连不上mirrors，装不了依赖。部署到API网关的时候，需要将本机DNS改成自己，不然没办法访问以上mg，cron，cmdb等内网域名
\033[0m"

# 注意下一步是覆盖你本机的DNS，建议把你的DNS地址加在/etc/resolv.dnsmasq 里面 
cp -rp /etc/resolv.conf /etc/resolv.conf-`date +%F`

# echo "nameserver $LOCALHOST_IP" > /etc/resolv.conf  
sed "1i\nameserver ${LOCALHOST_IP}" /etc/resolv.conf -i.bak
###注意注意， 这里修改完后，请你一定要确定你nameserver ${LOCALHOST_IP} 内部DNS在第一条、第一条、第一条，放在下面是不能正常解析的.

echo "resolv-file=/etc/resolv.dnsmasq" >> /etc/dnsmasq.conf
echo "addn-hosts=/etc/dnsmasqhosts" >> /etc/dnsmasq.conf
```



**启动服务**

```sh
systemctl start dnsmasq.service && systemctl enable dnsmasq.service
systemctl status dnsmasq
if [ $? == 0 ];then
    echo -e "\033[32m [INFO]: dnsmasq install success. \033[0m"
else
    echo -e "\033[31m [ERROR]: dnsmasq install faild \033[0m"
    exit -6
fi
```



<h3 style=color:red>到此，基础依赖部署完成！</h3>



## 2.2 项目前端 codo-web

> 更新后的项目前端将不再让用户下载静态资源包，使用自动构建的方式，默认保持最新前端

```sh
[ ! -d /opt/codo/codo-web/ ] && mkdir -p /opt/codo/codo-web/ && cd /opt/codo/codo-web/
```



### 2.2.1 修改域名

> 下列为默认域名，如果要修改访问入口地址请修改 `server_name` 对应的 `demo-init.opendevops.cn` ，确保能DNS解析到此域名，或者自己绑定hosts来测试一下

#### 2.2.1.1 创建配置文件

```nginx
cat >codo_frontend.conf <<\EOF
server {
  listen 80;
  server_name demo-init.opendevops.cn;
  access_log /var/log/nginx/codo-access.log;
  error_log /var/log/nginx/codo-error.log;

  location / {
    root /var/www/codo;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    add_header 'Access-Control-Allow-Origin' '*';
    proxy_pass http://gw.opendevops.cn:8888;
  }

  location ~ /(.svn|.git|admin|manage|.sh|.bash)$ {
    return 403;
  }
}
EOF
```



#### 2.2.1.2 创建Dockerfile

```dockerfile
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo

#修改nginx配置
#ADD nginx.conf /etc/nginx/nginx.conf
ADD codo_frontend.conf /etc/nginx/conf.d/codo_frontend.conf

EXPOSE 80
EXPOSE 443

STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
EOF
```



#### 2.2.1.3 创建 docker-compose.yml

**⚠️<span style=color:red>这里的端口就是后续访问codo的端口</span>**

```sh
cat >docker-compose.yml <<EOF
codo:
  restart: unless-stopped
  image: codo_image
  volumes:
    - /var/log/nginx/:/var/log/nginx/
    - /sys/fs/cgroup:/sys/fs/cgroup
  ports:
    - "81:80"
    - "444:443"
EOF
```



### 2.2.2 构建镜像、启动

```sh
docker build . -t codo_image
docker-compose up -d
```



### 2.2.3 验证服务启动

**日志没有报错即为正确**

```sh
curl  0.0.0.0:81
tailf  /var/log/nginx/codo-access.log
```



<h3 style=color:red>到此，项目前端 codo-web 部署完成！</h3>



## 2.3 项目后端 codo-admin

> `codo-admin`是基于tornado框架 restful风格的API 实现后台管理,[codo详细参考](https://github.com/opendevops-cn/codo-admin),搭配使用`codo`前端(iView+ vue)组成的一套后台用户 权限以及系统管理的解决方案（提供登录，注册 密码修改 鉴权 用户管理 角色管理 权限管理 前端组件管理 前端路由管理 通知服务API 系统基础信息接口）



### 2.3.1 获取代码

```sh
if ! which wget &>/dev/null; then yum install -y wget >/dev/null 2>&1;fi
if ! which git &>/dev/null; then yum install -y git >/dev/null 2>&1;fi
[ ! -d /opt/codo/ ] && mkdir -p /opt/codo
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-admin.git && cd codo-admin
```



### 2.3.2 修改相关配置

#### 2.3.2.1 修改 `settings.py` 配置

> 注意：这里的 `cookie_secret` 和 `token_secret` 必须和你的 `env.sh` 里面的保持一致，后续网关也要用到这个。若不保持一直登陆后校验不通过回被自动踢回，会导致页面一直不停的刷新
>
> 注意：这里的 `token_secret` 必须要和你的网关保持一致，这个值是从 `env.sh` 拿来的，一定要做修改，防止网站被攻击，如果secret包含正则符号会导致sed失败，请仔细检查

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py  
sed -i "s#token_secret = .*#token_secret = '${token_secret}'#g" settings.py     


# mysql配置信息
##我们项目支持取env环境变量，但是还是建议修改下。
DEFAULT_DB_DBNAME='codo_admin'
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${DEFAULT_DB_DBNAME}')#g" settings.py

# 只读MySQL配置，若是单台也直接写成Master地址即可
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${DEFAULT_DB_DBNAME}')#g" settings.py


# redis配置
sed -i "s#DEFAULT_REDIS_HOST = .*#DEFAULT_REDIS_HOST = os.getenv('DEFAULT_REDIS_HOST', '${DEFAULT_REDIS_HOST}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PORT = .*#DEFAULT_REDIS_PORT = os.getenv('DEFAULT_REDIS_PORT', '${DEFAULT_REDIS_PORT}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PASSWORD = .*#DEFAULT_REDIS_PASSWORD = os.getenv('DEFAULT_REDIS_PASSWORD', '${DEFAULT_REDIS_PASSWORD}')#g" settings.py
```





#### 2.3.2.2 修改Dockerfile

使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-admin

ADD settings.py /var/www/codo-admin/

# COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
# COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.3.2.3 构建镜像、启动

```sh
docker build . -t do_mg_image
docker-compose up -d
```



#### 2.3.2.4 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database codo_admin default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.3.2.5 初始化表结构

```sh
 docker exec -ti codo-admin_do_mg_1  /usr/local/bin/python3 /var/www/codo-admin/db_sync.py
```



#### 2.3.2.6 导入数据

主要是菜单，组件，权限列表，内置的用户等

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} codo_admin < ./doc/codo_admin_beta0.3.sql
```



#### 2.3.2.7 重启

```sh
docker-compose  restart 
```



#### 2.3.2.8 验证服务启动

**日志没有报错即为正确**

```sh
tailf  /var/log/supervisor/mg.log
```



<h3 style=color:red>到此，项目后端 codo-admin 部署完成！</h3>



## 2.4 资产管理 codo-cmdb

### 2.4.1 获取代码

```sh
echo -e "\033[32m [INFO]: codo_cmdb(资产管理) Start install. \033[0m"
if ! which wget &>/dev/null; then yum install -y wget >/dev/null 2>&1;fi
if ! which git &>/dev/null; then yum install -y git >/dev/null 2>&1;fi
[ ! -d /opt/codo/ ] && mkdir -p /opt/codo
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-cmdb.git
cd codo-cmdb
```



### 2.4.2 修改相关配置

#### 2.4.2.1 修改 `settings.py` 配置

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

# 修改配置
#后端数据库名称,建议不要修改，初始化data.sql已经指定了数据库名字，若需改请一块修改
CMDB_DB_DBNAME='codo_cmdb' 

# 任务系统的域名
sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py

# mysql配置
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${CMDB_DB_DBNAME}')#g" settings.py

# 只读MySQL配置
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${CMDB_DB_DBNAME}')#g" settings.py

# redis配置
sed -i "s#DEFAULT_REDIS_HOST = .*#DEFAULT_REDIS_HOST = os.getenv('DEFAULT_REDIS_HOST', '${DEFAULT_REDIS_HOST}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PORT = .*#DEFAULT_REDIS_PORT = os.getenv('DEFAULT_REDIS_PORT', '${DEFAULT_REDIS_PORT}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PASSWORD = .*#DEFAULT_REDIS_PASSWORD = os.getenv('DEFAULT_REDIS_PASSWORD', '${DEFAULT_REDIS_PASSWORD}')#g" settings.py

# 这里如果配置codo-task的数据库地址，则将数据同步到作业配置

TASK_DB_DBNAME='codo_task' 
sed -i "s#CODO_TASK_DB_HOST = .*#CODO_TASK_DB_HOST = os.getenv('CODO_TASK_DB_HOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#CODO_TASK_DB_PORT = .*#CODO_TASK_DB_PORT = os.getenv('CODO_TASK_DB_PORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#CODO_TASK_DB_USER = .*#CODO_TASK_DB_USER = os.getenv('CODO_TASK_DB_USER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#CODO_TASK_DB_PWD = .*#CODO_TASK_DB_PWD = os.getenv('CODO_TASK_DB_PWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#CODO_TASK_DB_DBNAME = .*#CODO_TASK_DB_DBNAME = os.getenv('CODO_TASK_DB_DBNAME', '${TASK_DB_DBNAME}')#g" settings.py
```



#### 2.4.2.2 AWS事件和WebTerminnal配置

> 首先将webterminal部署上去

```
docker run -itd -p 8081:80 webterminal/webterminallte
```



> 修改settings.py文件

```sh
# Aws Events 事件邮件通知人
AWS_EVENT_TO_EMAIL = '1111@qq.com,2222@gmail.com'

# Web Terminal 地址，请填写你部署的webterminal地址
# 注意这里是填写你上面docker run的机器外网IP
WEB_TERMINAL = 'http://1.1.1.1:8081'
```



#### 2.4.2.3 修改Dockerfile

>  使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-cmdb

# 修改应用配置
ADD settings.py /var/www/codo-cmdb/

# 修改nginx配置和守护配置
#COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
#COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.4.2.4 构建镜像、启动

```sh
docker build . -t codo_cmdb  
docker-compose up -d
```



#### 2.4.2.5 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_cmdb` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.4.2.6 初始化表结构

```sh
docker exec -ti codo-cmdb_codo_cmdb_1 /usr/local/bin/python3 /var/www/codo-cmdb/db_sync.py
```



#### 2.4.2.7 重启

```sh
docker-compose  restart 
```



#### 2.4.2.8 验证服务启动

- 服务日志：`/var/log/supervisor/cmdb.log` #主程序日志
- 定时日志：`/var/log/supervisor/cmdb_cron.log` #一些后端守护自动运行的日志

**日志没有报错即为正确**

```
tailf /var/log/supervisor/cmdb.log
tailf /var/log/supervisor/cmdb_cron.log
```



<h3 style=color:red>到此，资产管理 codo-cmdb 部署完成！</h3>



## 2.5 定时任务 codo-cron

> CODO项目定时任务模块，定时任务完全兼容crontab，支持到秒级

备注：

Docker部署需要将你的脚本目录单独挂载出来，若不理解的同学参考：[codo-cron本地部署方式](https://bbs.opendevops.cn/topic/65/codo-cron-本地部署方式)



### 2.5.1 获取代码

```sh
echo -e "\033[32m [INFO]: codo_cron(定时任务) Start install. \033[0m"
if ! which wget &>/dev/null; then yum install -y wget >/dev/null 2>&1;fi
if ! which git &>/dev/null; then yum install -y git >/dev/null 2>&1;fi
[ ! -d /opt/codo/ ] && mkdir -p /opt/codo
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-cron.git
cd codo-cron
```



### 2.5.2 修改相关配置

#### 2.5.2.1 修改 `settings.py` 配置

> 同样，这里codo-cron也支持取env环境变量，建议还是修改下默认配置

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

# 后端数据库名称,建议不要修改，初始化data.sql已经指定了数据库名字，若需改请一块修改
CRON_DB_DBNAME='codo_cron' 

sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py

# mysql配置
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${CRON_DB_DBNAME}')#g" settings.py

# 只读MySQL配置
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${CRON_DB_DBNAME}')#g" settings.py
```



#### 2.5.2.2 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-cron

# 修改应用配置
ADD settings.py /var/www/codo-cron/

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.5.2.3 构建镜像、启动

```sh
docker build . -t codo_cron_image
docker-compose up -d
```



#### 2.5.2.4 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_cron` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.5.2.5 初始化表结构

```sh
docker exec -ti codo-cron_codo_cron_1  /usr/local/bin/python3 /var/www/codo-cron/db_sync.py
```



#### 2.5.2.6 重启

```sh
docker-compose  restart 
```



#### 2.5.2.7 验证服务启动

**日志没有报错即为正确**

```sh
tailf /var/log/supervisor/cron.log
```



<h3 style=color:red>到此，定时任务系统部署完成！</h3>



## 2.6 任务系统 codo-task

> CODO任务系统，负责整个系统中任务调度，此功能是必须要安装的



### 2.6.1 获取代码

```sh
echo -e "\033[32m [INFO]: codo-task(任务系统) Start install. \033[0m"
if ! which wget &>/dev/null; then yum install -y wget >/dev/null 2>&1;fi
if ! which git &>/dev/null; then yum install -y git >/dev/null 2>&1;fi
[ ! -d /opt/codo/ ] && mkdir -p /opt/codo
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-task.git
cd codo-task
```



### 2.6.2 修改相关配置

#### 2.6.2.1 修改 `settings.py` 配置

**⚠️ <span style=color:red>如果mq默认端口不是 5672 ，需要修改 `DEFAULT_MQ_PORT`</span>**

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

# 修改配置
TASK_DB_DBNAME='codo_task' 

# 任务系统的域名
sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py

# mysql配置
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${TASK_DB_DBNAME}')#g" settings.py

# 只读MySQL配置
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${TASK_DB_DBNAME}')#g" settings.py

# redis配置
sed -i "s#DEFAULT_REDIS_HOST = .*#DEFAULT_REDIS_HOST = os.getenv('DEFAULT_REDIS_HOST', '${DEFAULT_REDIS_HOST}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PORT = .*#DEFAULT_REDIS_PORT = os.getenv('DEFAULT_REDIS_PORT', '${DEFAULT_REDIS_PORT}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PASSWORD = .*#DEFAULT_REDIS_PASSWORD = os.getenv('DEFAULT_REDIS_PASSWORD', '${DEFAULT_REDIS_PASSWORD}')#g" settings.py

# MQ配置
sed -i "s#DEFAULT_MQ_ADDR = .*#DEFAULT_MQ_ADDR = os.getenv('DEFAULT_MQ_ADDR', '${DEFAULT_MQ_ADDR}')#g" settings.py
sed -i "s#DEFAULT_MQ_USER = .*#DEFAULT_MQ_USER = os.getenv('DEFAULT_MQ_USER', '${DEFAULT_MQ_USER}')#g" settings.py
sed -i "s#DEFAULT_MQ_PWD = .*#DEFAULT_MQ_PWD = os.getenv('DEFAULT_MQ_PWD', '${DEFAULT_MQ_PWD}')#g" settings.py
```



#### 2.6.2.2 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-task

# 修改应用配置
ADD settings.py /var/www/codo-task/

# 修改nginx配置和守护配置
#COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
#COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.6.2.3 构建镜像、启动

```sh
docker build . -t codo_task_image
docker-compose up -d
```



#### 2.6.2.4 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_task` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.6.2.5 初始化表结构

```shell
docker exec -ti codo-task_codo_task_1  /usr/local/bin/python3 /var/www/codo-task/db_sync.py
```



#### 2.6.2.6 重启

```sh
docker-compose  restart 
```



#### 2.6.2.7 验证服务启动

**日志没有报错即为正确**

```sh
tailf /var/log/supervisor/task_scheduler.log 
tailf /var/log/supervisor/exec_task.log
```



<h3 style=color:red>到此，任务系统 codo-task 部署完成！</h3>



## 2.7 运维工具 codo-tools

> CODO运维工具支持：告警管理、项目管理、事件管理、加密解密、随机密码、提醒管理等



### 2.7.1 获取代码

```sh
if ! which wget &>/dev/null; then yum install -y wget >/dev/null 2>&1;fi
if ! which git &>/dev/null; then yum install -y git >/dev/null 2>&1;fi
[ ! -d /opt/codo/ ] && mkdir -p /opt/codo
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-tools.git && cd codo-tools
```



### 2.7.2 修改相关配置

#### 2.7.2.1 修改`settings.py` 配置

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py 

# mysql配置信息
##我们项目支持取env环境变量，但是还是建议修改下。
DEFAULT_DB_DBNAME='codo_tools'
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${DEFAULT_DB_DBNAME}')#g" settings.py

# redis配置
sed -i "s#DEFAULT_REDIS_HOST = .*#DEFAULT_REDIS_HOST = os.getenv('DEFAULT_REDIS_HOST', '${DEFAULT_REDIS_HOST}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PORT = .*#DEFAULT_REDIS_PORT = os.getenv('DEFAULT_REDIS_PORT', '${DEFAULT_REDIS_PORT}')#g" settings.py
sed -i "s#DEFAULT_REDIS_PASSWORD = .*#DEFAULT_REDIS_PASSWORD = os.getenv('DEFAULT_REDIS_PASSWORD', '${DEFAULT_REDIS_PASSWORD}')#g" settings.py
```



#### 2.7.2.2 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-tools

# 修改应用配置
ADD settings.py /var/www/codo-tools/

# 修改nginx配置和守护配置
#COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
#COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.7.2.3 构建镜像、启动

```sh
docker build . -t codo_tools
docker-compose up -d
```



#### 2.7.2.4 创建数据库

```shell
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_tools` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.7.2.5 初始化表结构

```sh
docker exec -ti  codo-tools_codo_tools_1  /usr/local/bin/python3 /var/www/codo-tools/db_sync.py 
```



#### 2.7.2.6 重启

```sh
docker-compose  restart 
```

 

#### 2.7.2.7 测试

- 服务日志 `/var/log/supervisor/tools.log`
- 定时提醒日志 `/var/log/supervisor/cron_jobs.log `

**日志没有报错即为正确**

```sh
tailf /var/log/supervisor/tools.log  
tailf /var/log/supervisor/cron_jobs.log  
```



<h3 style=color:red>到此，运维工具系统 codo-tools 部署完成！</h3> 



## 2.7 配置中心 kerrigan

### 2.7.1 获取代码

```sh
cd /opt/codo && git clone https://github.com/opendevops-cn/kerrigan.git && cd kerrigan
```



### 2.7.2 修改相关配置

#### 2.7.2.1 修改 `settings.py` 配置

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh

# 修改管理后端域名
sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py 

# mysql配置信息
##我们项目支持取env环境变量，但是还是建议修改下。
DEFAULT_DB_DBNAME='codo_kerrigan'
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${DEFAULT_DB_DBNAME}')#g" settings.py

# 只读MySQL配置，若是单台也直接写成Master地址即可
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${DEFAULT_DB_DBNAME}')#g" settings.py
```



#### 2.7.2.2 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-kerrigan

# 修改应用配置
ADD settings.py /var/www/kerrigan/

# 修改nginx配置和守护配置
#COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
#COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.7.2.3 构建镜像、启动

```sh
docker build . -t kerrigan_image
docker-compose up -d
```



#### 2.7.2.4 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_kerrigan` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.7.2.5 初始化表结构

```sh
docker exec -ti  kerrigan_codo-kerrigan_1  /usr/local/bin/python3 /var/www/kerrigan/db_sync.py 
```



#### 2.7.2.6 重启

```sh
docker-compose  restart 
```



#### 2.7.2.7 验证服务启动

**日志没有报错即为正确**

```sh
tailf /var/log/supervisor/kerrigan.log
```



<h3 style=color:red>到此，配置中心 kerrigan 部署完成！</h3>



## 2.8 域名管理 codo-dns

> CODO域名管理模块，管理BIND 支持智能解析，多域名，多主。



### 2.8.1 获取代码

```sh
cd /opt/codo && git clone https://github.com/opendevops-cn/codo-dns.git
cd codo-dns
```



### 2.8.2 修改相关配置

#### 2.8.2.1 修改 `settings.py` 配置

```sh
# 导入环境变量文件，最开始准备的环境变量文件
source /opt/codo/env.sh
# 后端数据库名称
CRON_DB_DBNAME='codo_dns' 

sed -i.bak "s#cookie_secret = .*#cookie_secret = '${cookie_secret}'#g" settings.py

# mysql配置
sed -i "s#DEFAULT_DB_DBHOST = .*#DEFAULT_DB_DBHOST = os.getenv('DEFAULT_DB_DBHOST', '${DEFAULT_DB_DBHOST}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPORT = .*#DEFAULT_DB_DBPORT = os.getenv('DEFAULT_DB_DBPORT', '${DEFAULT_DB_DBPORT}')#g" settings.py
sed -i "s#DEFAULT_DB_DBUSER = .*#DEFAULT_DB_DBUSER = os.getenv('DEFAULT_DB_DBUSER', '${DEFAULT_DB_DBUSER}')#g" settings.py
sed -i "s#DEFAULT_DB_DBPWD = .*#DEFAULT_DB_DBPWD = os.getenv('DEFAULT_DB_DBPWD', '${DEFAULT_DB_DBPWD}')#g" settings.py
sed -i "s#DEFAULT_DB_DBNAME = .*#DEFAULT_DB_DBNAME = os.getenv('DEFAULT_DB_DBNAME', '${CRON_DB_DBNAME}')#g" settings.py

# 只读MySQL配置
sed -i "s#READONLY_DB_DBHOST = .*#READONLY_DB_DBHOST = os.getenv('READONLY_DB_DBHOST', '${READONLY_DB_DBHOST}')#g" settings.py
sed -i "s#READONLY_DB_DBPORT = .*#READONLY_DB_DBPORT = os.getenv('READONLY_DB_DBPORT', '${READONLY_DB_DBPORT}')#g" settings.py
sed -i "s#READONLY_DB_DBUSER = .*#READONLY_DB_DBUSER = os.getenv('READONLY_DB_DBUSER', '${READONLY_DB_DBUSER}')#g" settings.py
sed -i "s#READONLY_DB_DBPWD = .*#READONLY_DB_DBPWD = os.getenv('READONLY_DB_DBPWD', '${READONLY_DB_DBPWD}')#g" settings.py
sed -i "s#READONLY_DB_DBNAME = .*#READONLY_DB_DBNAME = os.getenv('READONLY_DB_DBNAME', '${CRON_DB_DBNAME}')#g" settings.py
```



#### 2.8.2.2 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/codo-dns

# 修改应用配置
ADD settings.py /var/www/codo-dns/

# 修改nginx配置和守护配置
#COPY doc/nginx_ops.conf /etc/nginx/conf.d/default.conf
#COPY doc/supervisor_ops.conf  /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord"]
EOF
```



#### 2.8.2.3 构建镜像、启动

```sh
docker build . -t codo_dns_image
docker-compose up -d
```



#### 2.8.2.4 创建数据库

```sh
mysql -h127.0.0.1 -P3307 -uroot -p${MYSQL_PASSWORD} -e 'create database `codo_dns` default character set utf8mb4 collate utf8mb4_unicode_ci;'
```



#### 2.8.2.5 初始化表结构

```sh
docker exec -ti codo-dns_codo-dns_1  /usr/local/bin/python3 /var/www/codo-dns/db_sync.py
```



#### 2.8.2.6 重启

```sh
docker-compose  restart 
```



#### 2.8.2.7 验证服务启动

**日志没有报错即为正确**

```sh
tailf /var/log/supervisor/codo_dns.log
```



<h3 style=color:red>到此，域名管理 codo-dns 部署完成！</h3>



## 2.9 API网关 api-gateway（部署容易出问题的地方)

**⚠️⚠️⚠️<span style=color:red>重点部分，请仔细阅读 由于此项目是模块化、微服务化，因此需要在借助API网关，需要在API网关注册，此步骤是必须的。</span>**

**注意事项**

开始之前，你需要确认以下2个事情

- DNS服务是否正常，域名能否正常解析
- 微服务的模块部署是否正常，进行检测

**检查DNS思路**

```sh
1. 确保你的dnsmasql服务是启动的，服务没有报错
2. 确保/etc/dnsmasqhosts文件有解析的IP
3. 确保你网关的这台机器/etc/resolv.conf DNS执行你刚部署的dnsmasq服务IP
4. 确保你网关所在的机器都能正常ping通所有的服务，比如：ping cmdb2.opendevops.cn
5. 确保你的防火墙规则是清空的`iptables -F`
6. 确保你的SELINUX是关闭的`setenforce 0`
```



**服务健康检测**

```sh
# 进行所有服务进行检测，返回200则正常
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://mg.opendevops.cn:8010/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://task.opendevops.cn:8020/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://cmdb2.opendevops.cn:8050/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://kerrigan.opendevops.cn:8030/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://cron.opendevops.cn:9900/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://tools.opendevops.cn:8040/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://dns.opendevops.cn:8060/are_you_ok/ && echo
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://0.0.0.0:80 && echo
```



### 2.9.1 获取代码

```sh
cd /opt/codo/ && git clone https://github.com/ss1917/api-gateway.git && cd /opt/codo/api-gateway
```



### 2.9.2 修改相关配置

> 主要修改`nginx.conf`配置信息和`config.lua`配置，具体参考API网关块：[API网关修改配置](https://github.com/ss1917/api-gateway/blob/master/README.md#二-修改配置)



#### 2.9.2.1 全局nginx配置

> 这里主要修改resolver 内部DNS服务器地址 `conf/nginx.conf` ==一定要修改==

```nginx
user root;
worker_processes auto;
worker_rlimit_nofile 51200;
error_log logs/error.log;
events {
    use epoll;
    worker_connections 51024;
}
http {
    # 设置默认lua搜索路径
    lua_package_path '$prefix/lua/?.lua;/blah/?.lua;;';
    lua_code_cache on;      # 线上环境设置为on, off时可以热加载lua文件
    lua_shared_dict user_info 1m;
    lua_shared_dict my_limit_conn_store 100m;   # 100M可以放1.6M个键值对
    include             mime.types;    # 代理静态文件

    client_header_buffer_size 64k;
    large_client_header_buffers 4 64k;

    init_by_lua_file lua/init_by_lua.lua;       # nginx启动时就会执行
    include ./conf.d/*.conf;                    # lua生成upstream
    resolver 10.10.10.12;                       # 内部DNS服务器地址 一定要修改 对应起来
}
```



#### 2.9.2.2 网关配置

> 修改 `conf/conf.d/gw.conf`

```nginx
server {
  listen 80;
  server_name gw.opendevops.cn;
  lua_need_request_body on; # 开启获取body数据记录日志

  location / {
    ### ws 支持
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ###
    proxy_redirect off;
    proxy_read_timeout 600;

    ### 获取真实IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    access_by_lua_file lua/access_check.lua;
    set $my_upstream $my_upstream;
    proxy_pass http://$my_upstream;

    ### 跨域
    add_header Access-Control-Allow-Methods *;
    add_header Access-Control-Max-Age 3600;
    add_header Access-Control-Allow-Credentials true;
    add_header Access-Control-Allow-Origin $http_origin;
    add_header Access-Control-Allow-Headers $http_access_control_request_headers;
    if ($request_method = OPTIONS) {
      return 204;
    }
  }
  location ~ .*\.(sh|bash|py|sql)$ {
    return 403;
  }

  location ~* ^/(image.*|admin.*|manage.*)/ {
    return 403;
  }
}
```



#### 2.9.2.3 注册API网关

> 请仔细阅读下面需要修改配置的地方 `lua/configs.lua` ==这个配置基本上都要修改，请务必仔细==

```json
json = require("cjson")


-- redis配置，一定要修改，并且和codo-admin保持一致，admin会把权限写进去提供网关使用
redis_config = {
    host = '10.10.10.12',
    port = 6379,
    auth_pwd = 'cWCVKJ7ZHUK12mVbivUf',
    db = 8,
    alive_time = 3600 * 24 * 7,
    channel = 'gw'
}


-- 注意：这里的token_secret必须要和codo-admin里面的token_secret保持一致
token_secret = "pXFb4i%*834gfdh96(3df&%18iodGq4ODQyMzc4lz7yI6ImF1dG"
logs_file = '/var/log/gw.log'

--刷新权限到redis接口
rewrite_cache_url = 'http://mg.opendevops.cn:8010/v2/accounts/verify/'

-- 注意：rewrite_cache_token要和codo-admin里面的secret_key = '8b888a62-3edb-4920-b446-697a472b4001'保持一致
rewrite_cache_token = '8b888a62-3edb-4920-b446-697a472b4001'  


--并发限流配置
limit_conf = {
    rate = 10, --限制ip每分钟只能调用n*60次接口
    burst = 10, --桶容量,用于平滑处理,最大接收请求次数
}
--upstream匹配规则,API网关域名
gw_domain_name = 'gw.opendevops.cn' 

--下面的转发一定要修改，根据自己实际数据修改
rewrite_conf = {
    [gw_domain_name] = {
        rewrite_urls = {
            {
                uri = "/dns",
                rewrite_upstream = "dns.opendevops.cn:8060"
            },
{
                uri = "/cmdb2",
                rewrite_upstream = "cmdb2.opendevops.cn:8050"
            },
            {
                uri = "/tools",
                rewrite_upstream = "tools.opendevops.cn:8040"
            },
            {
                uri = "/kerrigan",
                rewrite_upstream = "kerrigan.opendevops.cn:8030"
            },
            {
                uri = "/cmdb",
                rewrite_upstream = "cmdb.opendevops.cn:8002"
            },
            {
                uri = "/k8s",
                rewrite_upstream = "k8s.opendevops.cn:8001"
            },
            {
                uri = "/task",
                rewrite_upstream = "task.opendevops.cn:8020"
            },
            {
                uri = "/cron",
                rewrite_upstream = "cron.opendevops.cn:9900"
            },
            {
            uri = "/mg",
                rewrite_upstream = "mg.opendevops.cn:8010"
            },
            {
                uri = "/accounts",
                rewrite_upstream = "mg.opendevops.cn:8010"
            },
        }
    }
}
```



#### 2.9.2.4 修改Dockerfile

> 使用自动构建的镜像，默认使用最新版本，这一步的目的是把修改后的配置覆盖进去 

```sh
cat >Dockerfile <<EOF
FROM registry.cn-shanghai.aliyuncs.com/ss1917/api-gateway

# 修改配置
ADD . /usr/local/openresty/nginx/

EXPOSE 80
CMD ["/usr/bin/openresty", "-g", "daemon off;"]
EOF
```



#### 2.9.2.5 构建镜像、启动

```sh
docker build . -t gateway_image
docker-compose up -d
```



#### 2.9.2.6 测试

状态码返回200即为正确

```sh
curl -I -X GET -m 10 -o /dev/null -s -w %{http_code} http://gw.opendevops.cn:8888/api/accounts/are_you_ok/ && echo
```

> 提醒:openresty服务器DNS必须指向--->最起初部署的DNS服务器地址,另外若你本机ping以上随便一个域名都不通的话，那你要确认下你本机DNS指向你最初部署了DNS服务器了？ 修改vim /etc/resolv.conf



<h3 style=color:red>到此，API网关 部署完成！</h3>



## 3.0 访问codo

这里访问的地址就是在2.2.1.3步骤中 compose 文件中对外暴露的端口，这里设置为81端口，然后利用nginx做反向代理

用户名 `admin`

密码 `admin@opendevops`



![iShot2021-03-13 15.20.00](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-13 15.20.00.png)



登陆后页面

![iShot2021-03-03 16.48.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-03 16.48.05.png)

