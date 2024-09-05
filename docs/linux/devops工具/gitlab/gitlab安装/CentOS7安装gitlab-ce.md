[toc]



# CentOS7安装gitlab-ce

[gitlab官网](https://about.gitlab.com/)

[gitlab github地址](https://github.com/gitlabhq/gitlabhq)

[gitlab官方安装文档](https://about.gitlab.com/install/)

[gitlab官方下载地址](https://packages.gitlab.com/gitlab/gitlab-ce)



## 1.rpm包安装

### 1.1 安装依赖包

[不使用postfix使用其他方式发送邮件参考官方文档](https://docs.gitlab.com/omnibus/settings/smtp.html)

```shell
# 安装依赖包
yum -y install curl openssh-server openssh-clients postfix cronie policycoreutils-python

# 启动postfix
systemctl start postfix && systemctl enable postfix
```



### 1.2 下载安装包

[gitlab官方rpm包下载地址](https://packages.gitlab.com/gitlab/gitlab-ce)

也可以从 [清华源](https://mirrors4.tuna.tsinghua.edu.cn/gitlab-ce/) 下载

```shell
wget --content-disposition https://packages.gitlab.com/gitlab/gitlab-ce/packages/el/7/gitlab-ce-13.12.3-ce.0.el7.x86_64.rpm/download.rpm
```



### 1.3 安装

```shell
yum -y localinstall gitlab-ce-13.12.3-ce.0.el7.x86_64.rpm 
```



### 1.4 修改配置文件

> **修改 `/etc/gitlab/gitlab.rb` 中 `xternal_url` 一行，修改为自己的域名或IP**

```shell
export IP=10.0.0.100
sed -i.bak "/^external_url/c external_url 'http://$IP'" /etc/gitlab/gitlab.rb
```





### 1.5 启动gitlab

```shell
# 启动gitlab
gitlab-ctl start

# 重载gitlab配置文件
gitlab-ctl reconfigure

# 设置gitlab开机自启
systemctl enable gitlab-runsvdir.service
```

**重载配置文件成功提示如下**

![iShot2021-06-20_01.20.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.20.14.png)





**gitlab启动的端口**

```shell
$ netstat -ntpl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 127.0.0.1:8082          0.0.0.0:*               LISTEN      3276/sidekiq 5.2.9  
tcp        0      0 127.0.0.1:9236          0.0.0.0:*               LISTEN      3770/gitaly         
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      969/sshd            
tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN      3926/grafana-server 
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN      1194/master         
tcp        0      0 0.0.0.0:8060            0.0.0.0:*               LISTEN      3330/nginx: master  
tcp        0      0 127.0.0.1:9121          0.0.0.0:*               LISTEN      3815/redis_exporter 
tcp        0      0 127.0.0.1:9090          0.0.0.0:*               LISTEN      3897/prometheus     
tcp        0      0 127.0.0.1:9187          0.0.0.0:*               LISTEN      3919/postgres_expor 
tcp        0      0 127.0.0.1:9093          0.0.0.0:*               LISTEN      3911/alertmanager   
tcp        0      0 127.0.0.1:9100          0.0.0.0:*               LISTEN      3791/node_exporter  
tcp        0      0 127.0.0.1:9229          0.0.0.0:*               LISTEN      3778/gitlab-workhor 
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      701/rpcbind         
tcp        0      0 127.0.0.1:9168          0.0.0.0:*               LISTEN      3802/ruby           
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      3253/puma 5.1.1 (un 
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3330/nginx: master  
tcp6       0      0 :::22                   :::*                    LISTEN      969/sshd            
tcp6       0      0 ::1:25                  :::*                    LISTEN      1194/master         
tcp6       0      0 :::9094                 :::*                    LISTEN      3911/alertmanager   
tcp6       0      0 :::111                  :::*                    LISTEN      701/rpcbind         
tcp6       0      0 ::1:9168                :::*                    LISTEN      3802/ruby    
```







## 2.yum安装

### 2.1 添加官方yum源

:::tip

**这个源需要科学上网**

:::

```shell
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
```



### 2.2 安装

> **需要修改为自己的url，安装完成后会自动启动gitlab-ce**

```shell
# 默认安装最新版
sudo EXTERNAL_URL="https://gitlab.example.com" yum -y install gitlab-ce

# 安装指定版本
sudo EXTERNAL_URL="https://gitlab.example.com" yum -y install -y gitlab-ce-13.12.3
```



**gitlab启动的端口**

```shell
$ netstat -ntpl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 127.0.0.1:9236          0.0.0.0:*               LISTEN      3581/gitaly         
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1254/sshd           
tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN      3671/grafana-server 
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN      1181/master         
tcp        0      0 0.0.0.0:5050            0.0.0.0:*               LISTEN      3098/nginx: master  
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      3098/nginx: master  
tcp        0      0 0.0.0.0:8060            0.0.0.0:*               LISTEN      3098/nginx: master  
tcp        0      0 127.0.0.1:9121          0.0.0.0:*               LISTEN      3636/redis_exporter 
tcp        0      0 127.0.0.1:9090          0.0.0.0:*               LISTEN      3641/prometheus     
tcp        0      0 127.0.0.1:9187          0.0.0.0:*               LISTEN      3665/postgres_expor 
tcp        0      0 127.0.0.1:9093          0.0.0.0:*               LISTEN      3658/alertmanager   
tcp        0      0 127.0.0.1:5000          0.0.0.0:*               LISTEN      3599/registry       
tcp        0      0 127.0.0.1:9100          0.0.0.0:*               LISTEN      3629/node_exporter  
tcp        0      0 127.0.0.1:9229          0.0.0.0:*               LISTEN      3587/gitlab-workhor 
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      588/rpcbind         
tcp        0      0 127.0.0.1:9168          0.0.0.0:*               LISTEN      3634/ruby           
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      2922/puma 5.1.1 (un 
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3098/nginx: master  
tcp        0      0 127.0.0.1:8082          0.0.0.0:*               LISTEN      2943/sidekiq 5.2.9  
tcp6       0      0 :::22                   :::*                    LISTEN      1254/sshd           
tcp6       0      0 ::1:25                  :::*                    LISTEN      1181/master         
tcp6       0      0 :::9094                 :::*                    LISTEN      3658/alertmanager   
tcp6       0      0 :::111                  :::*                    LISTEN      588/rpcbind         
tcp6       0      0 ::1:9168                :::*                    LISTEN      3634/ruby   
```



### 2.3 关闭https自动重定向

> 使用gitlab-ce官方提供的脚本安装后，gitlab-ce会默认开启 `http->https` 重定向，如果使用nginx做代理则关闭https自动重定向

编辑 `/etc/gitlab/gitlab.rb` 文件，取消以下行的注释

```shell
nginx['redirect_http_to_https'] = false
```



重载配置文件

```shell
gitlab-ctl reconfigure
```



## 3.docker安装

[gitlab docker安装官方文档](https://docs.gitlab.com/omnibus/docker/)

### 3.1 编辑docker-compose.yml文件

默认 `https` 和 `ssh` 端口

```yaml
# 自行修改相对应的域名、映射的端口、挂载的卷
cat > docker-compose.yml <<EOF
version: '3.6'
services:
  web:
    image: 'gitlab/gitlab-ee:latest'
    restart: always
    hostname: 'gitlab.example.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://gitlab.example.com'
        # Add any other gitlab.rb configuration here, each on its own line
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - '$GITLAB_HOME/config:/etc/gitlab'
      - '$GITLAB_HOME/logs:/var/log/gitlab'
      - '$GITLAB_HOME/data:/var/opt/gitlab'
    shm_size: '256m'
EOF
```



自定义 `http` 和 `ssh` 端口

```yaml
# 自行修改相对应的域名、映射的端口、挂载的卷
cat > docker-compose.yml <<EOF
version: '3.6'
services:
  web:
    image: 'gitlab/gitlab-ee:latest'
    restart: always
    hostname: 'gitlab.example.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://gitlab.example.com:8929'
        gitlab_rails['gitlab_shell_ssh_port'] = 2224
    ports:
      - '8929:8929'
      - '2224:22'
    volumes:
      - '$GITLAB_HOME/config:/etc/gitlab'
      - '$GITLAB_HOME/logs:/var/log/gitlab'
      - '$GITLAB_HOME/data:/var/opt/gitlab'
    shm_size: '256m'
EOF
```



### 3.2 启动

```shell
docker-compose up -d
```



**查看启动的容器**

```shell
$ docker ps -a
CONTAINER ID   IMAGE                     COMMAND             CREATED         STATUS                   PORTS                                                                                                           NAMES
a9ed8420da5d   gitlab/gitlab-ce:latest   "/assets/wrapper"   3 minutes ago   Up 3 minutes (healthy)   0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp, 0.0.0.0:222->22/tcp, :::222->22/tcp   gitlab
```





## 4.访问gitlab

**gitlab默认端口为80，第一次访问需要设置root密码，最少8位**

![iShot2021-06-20_01.22.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.22.44.png)



**初始页面**

![iShot2021-06-20_01.24.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.24.18.png)





**这里的警告为gitlab默认开启了开放注册，点击 `learn more` 查看关闭方法**

![iShot2021-06-20_01.26.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.26.03.png)







点击 `Admin Area`  -> `Settings` -> `General` -> `Sign-up restrictions` 

![iShot2021-06-20_01.32.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.32.23.png)





取消勾选 `Sign-up enabled` ，保存即可

![iShot2021-06-20_01.35.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_01.35.58.png)







gitlab默认开启注册

![iShot2021-06-20_14.54.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_14.54.27.png)







关闭后

![iShot2021-06-20_14.57.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-06-20_14.57.52.png)





## 5.gitlab相关文件、命令、服务

### 5.1 gitlab相关文件



**gitlab相关文件路径说明**

| 路径                                        | 说明                 |
| ------------------------------------------- | -------------------- |
| /opt/gitlab                                 | gitlab的程序安装目录 |
| /var/opt/gitlab                             | gitlab目录数据目录   |
| /var/opt/gitlab/git-data/repositories       | 存放仓库数据         |
| /etc/gitlab/gitlab.rb                       | 主配置文件           |
| /var/opt/gitlab/nginx/conf/gitlab-http.conf | nginx配置文件        |
| /var/opt/gitlab/postgresql/data             | Postgresql数据目录   |





### 5.2 gitlab相关命令



**运维管理命令**

| 命令                                                  | 说明     |
| ----------------------------------------------------- | -------- |
| cat /opt/gitlab/embedded/service/gitlab-rails/VERSION | 查看版本 |
|                                                       |          |
|                                                       |          |
|                                                       |          |





**服务控制命令**

| **命令**                          | **说明**                           |
| --------------------------------- | ---------------------------------- |
| **gitlab-ctl status**             | **查看目前gitlab所有服务运维状态** |
| **gitlab-ctl start/stop/restart** | **启动/停止/重启所有 gitlab 组件** |
| **gitlab-ctl start/stop nginx**   | **单独启动/停止某个服务**          |
| **gitlab-ctl reconfigure**        | **重载配置文件**                   |



**日志相关命令**

| **命令**                                                     | **说明**               |
| ------------------------------------------------------------ | ---------------------- |
| **gitlab-ctl tail**                                          | **实时查看所有日志**   |
| **gitlab-ctl tail redis/postgresql/gitlab-workhorse/logrotate/nginx/sidekiq/unicorn** | **实时查看各服务日志** |





### 5.3 gitlab相关服务

**运行命令 `gitlab-ctl status` 查看gitlab所有服务**

```shell
$ gitlab-ctl status
run: alertmanager: (pid 3911) 54193s; run: log: (pid 3614) 54248s
run: gitaly: (pid 3804) 54195s; run: log: (pid 3031) 54349s
run: gitlab-exporter: (pid 3802) 54195s; run: log: (pid 3393) 54268s
run: gitlab-workhorse: (pid 3778) 54196s; run: log: (pid 3307) 54286s
run: grafana: (pid 3926) 54192s; run: log: (pid 3735) 54210s
run: logrotate: (pid 16507) 1784s; run: log: (pid 2874) 54363s
run: nginx: (pid 3330) 54281s; run: log: (pid 3348) 54279s
run: node-exporter: (pid 3791) 54196s; run: log: (pid 3377) 54274s
run: postgres-exporter: (pid 3919) 54192s; run: log: (pid 3644) 54243s
run: postgresql: (pid 3067) 54346s; run: log: (pid 3099) 54343s
run: prometheus: (pid 3897) 54194s; run: log: (pid 3446) 54256s
run: puma: (pid 3253) 54300s; run: log: (pid 3266) 54297s
run: redis: (pid 2896) 54358s; run: log: (pid 2913) 54355s
run: redis-exporter: (pid 3815) 54194s; run: log: (pid 3412) 54262s
run: sidekiq: (pid 3271) 54294s; run: log: (pid 3286) 54291s
```





[官方文档对于各服务指标的说明](https://docs.gitlab.com/ce/administration/monitoring/)

| **服务名**            | **默认监听端口** | **说明**                                              |
| --------------------- | ---------------- | ----------------------------------------------------- |
| **alertmanager**      | **TCP:9093**     | **告警工具**                                          |
| **gitaly**            | **TCP:9236**     | **提供集群功能**                                      |
| **gitlab-exporter**   | **---**          | **监控gitlab指标**                                    |
| **gitlab-workhorse**  | **TCP:9229**     | **gitlab反向代理，处理文件上传、下载，git推拉等操作** |
| **grafana**           | **TCP:3000**     | **出图工具**                                          |
| **logrotate**         | **---**          | **日志切割**                                          |
| **nginx**             | **TCP:80**       | **静态web服务器**                                     |
| **node-exporter**     | **TCP:9100**     | **Prometheus用来监控服务器指标**                      |
| **postgres-exporter** | **TCP:9187**     | **导出PostgreSQL指标**                                |
| **postgresql**        | **UDP:60387**    | **默认数据库**                                        |
| **prometheus**        | **TCP:9090**     | **监控**                                              |
| **puma**              | **TCP:8080**     | **默认的web服务器**                                   |
| **redis**             | **---**          | **缓存服务**                                          |
| **redis-exporter**    | **TCP:9121**     | **监控redis**                                         |
| **sidekiq**           | **TCP:8082**     | **依赖redis的消息队列**                               |















