[toc]



# docker企业级私有仓库harbor

## 1.harbor介绍

**Habor是由VMWare公司开源的容器镜像仓库。事实上，Habor是在Docker Registry上进行了相应的企业级扩展，从而获得了更加广泛的应用，这些新的企业级特性包括：管理用户界面，基于角色的访问控制 ，AD/LDAP集成以及审计日志等，足以满足基本企业需求。**

[官方地址](https://vmware.github.io)

[github地址](https://github.com/goharbor/harbor)



## 2.harbor主要功能

- **基于角色访问控制（RBAC）**
  - **在企业中，通常有不同的开发团队负责不同的项目，镜像像代码一样，每个人角色不同需求也不同，因此就需要访问权限控制，根据角色分配相应的权限。** 
  - **例如，开发人员需要对项目构建这就用到读写权限（push/pull），测试人员只需要读权限（pull），运维一般管理镜像仓库，具备权限分配能力，项目经理具有所有权限。** 

- **镜像复制**
  - **可以将仓库中的镜像同步到远程的Harbor，类似于MySQL主从同步功能。**

- **LDAP**
  - **Harbor支持LDAP认证，可以很轻易接入已有的LDAP。**

- **镜像删除和空间回收**
  - **Harbor支持在Web删除镜像，回收无用的镜像，释放磁盘空间。**

- **图形页面管理**
  - **用户很方面搜索镜像及项目管理。**

- **审计**
  - **对仓库的所有操作都有记录。**

- **REST API**
  - **完整的API，方便与外部集成。**





## 3.harbor组件

![iShot_2024-08-22_22.03.32](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-22_22.03.32.png)



| 组件                   | 功能                                          |
| ---------------------- | --------------------------------------------- |
| **harbor-adminserver** | **配置管理中心**                              |
| **harbor-db**          | **Mysql数据库**                               |
| **harbor-jobservice**  | **负责镜像复制**                              |
| **harbor-log**         | **记录操作日志**                              |
| **harbor-ui**          | **Web管理页面和API**                          |
| **nginx**              | **前端代理，负责前端页面和镜像上传/下载转发** |
| **redis**              | **会话**                                      |
| **registry**           | **镜像存储**                                  |



## 4.harbor部署环境要求

**2核4G+40G硬盘**

**docker 17.06+**

**docker compose 1.18+**

**openssl	最新版**

---

**Hardware**

| Resource | Capacity         | Description            |
| -------- | ---------------- | ---------------------- |
| **CPU**  | **minimal 2CPU** | **4 CPU is preferred** |
| **Mem**  | **minimal 4GB**  | **8GB is preferred**   |
| **Disk** | **minimal 40GB** | **160GB is preferred** |



**Software**

| Software           | Version                           | Description                                                  |
| ------------------ | --------------------------------- | ------------------------------------------------------------ |
| **Docker engine**  | **version 17.06.0-ce+ or higher** | **For installation instructions, please refer to: [docker engine doc](https://docs.docker.com/engine/installation/)** |
| **Docker Compose** | **version 1.18.0 or higher**      | **For installation instructions, please refer to: [docker compose doc](https://docs.docker.com/compose/install/)** |
| **Openssl**        | **latest is preferred**           | **Generate certificate and keys for Harbor**                 |



**Network ports**

| Port     | Protocol  | Description                                                  |
| -------- | --------- | ------------------------------------------------------------ |
| **443**  | **HTTPS** | **Harbor portal and core API will accept requests on this port for https protocol, this port can change in config file(harbor入口和核心API将接受请求在此端口上的https协议，该端口可以在配置文件中更改)** |
| **4443** | **HTTPS** | **Connections to the Docker Content Trust service for Harbor, only needed when Notary is enabled, This port can change in config file(连接到Docker内容信任服务的端口，只有在启用公证员时才需要，该端口可以在配置文件中更改)** |
| **80**   | **HTTP**  | **Harbor portal and core API will accept requests on this port for http protocol(Harbor portal和core API将在这个端口上接受http协议请求)** |



## 5.安装docker compose

**harbor需要docker compose1.18+版本**

[docker compose安装地址](https://docs.docker.com/compose/install/)

```python
1.下载docker compose安装包
[root@docker02 ~]# curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

2.给docker compose赋予执行命令
[root@docker02 ~]# chmod +x /usr/local/bin/docker-compose

3.验证安装
[root@docker02 ~]# docker-compose -v
docker-compose version 1.24.1, build 4667896b
```



## 6.安装harbor

**Harbor安装有3种方式：**

- **在线安装：从Docker Hub下载Harbor相关镜像，因此安装软件包非常小**
- **离线安装：安装包包含部署的相关镜像，因此安装包比较大**
- **OVA安装程序：当用户具有vCenter环境时，使用此安装程序，在部署OVA后启动Harbor**



```python
1.下载安装包
[root@docker02 ~]# wget https://storage.googleapis.com/harbor-releases/release-1.8.0/harbor-offline-installer-v1.8.1.tgz

2.解压缩包到/usr/local
[root@docker02 ~]# tar xf harbor-offline-installer-v1.8.1.tgz -C /usr/local/

3.进入harbor目录，修改配置文件harbor.yml
[root@docker02 harbor]# ls
harbor.v1.8.1.tar.gz  harbor.yml  install.sh  LICENSE  prepare
[root@docker02 harbor]# pwd
/usr/local/harbor

[root@docker02 harbor]# vim harbor.yml 
5行
hostname: reg.mydomain.com     //修改为IP地址或者域名

27行
harbor_admin_password: Harbor12345    //修改密码

4.准备配置文件，执行完成后会多出目录common  文件docker-compose.yml
[root@docker02 harbor]# ./prepare
[root@docker02 harbor]# ls
common  docker-compose.yml  harbor.v1.8.1.tar.gz  harbor.yml  install.sh  LICENSE  prepare

5.安装并启动harbor
[root@docker02 harbor]# ./install.sh

6.查看运行状态
[root@docker02 harbor]# docker ps -a
CONTAINER ID        IMAGE                                               COMMAND                  CREATED             STATUS                       PORTS                       NAMES
d0d76fee6c95        goharbor/nginx-photon:v1.8.1                        "nginx -g 'daemon of…"   4 minutes ago       Up 4 minutes (healthy)       0.0.0.0:80->80/tcp          nginx
6b40878a29a0        goharbor/harbor-jobservice:v1.8.1                   "/harbor/start.sh"       4 minutes ago       Up 4 minutes                                             harbor-jobservice
ad03c4b60343        goharbor/harbor-portal:v1.8.1                       "nginx -g 'daemon of…"   4 minutes ago       Up 4 minutes (healthy)       80/tcp                      harbor-portal
2fa3bbc7c1fb        goharbor/harbor-core:v1.8.1                         "/harbor/start.sh"       4 minutes ago       Up 4 minutes (healthy)                                   harbor-core
cd9e038ab419        goharbor/harbor-registryctl:v1.8.1                  "/harbor/start.sh"       4 minutes ago       Up 4 minutes (healthy)                                   registryctl
2738dc4ca7ab        goharbor/redis-photon:v1.8.1                        "docker-entrypoint.s…"   4 minutes ago       Up 4 minutes                 6379/tcp                    redis
457e7efc19c9        goharbor/registry-photon:v2.7.1-patch-2819-v1.8.1   "/entrypoint.sh /etc…"   4 minutes ago       Up 4 minutes (healthy)       5000/tcp                    registry
37403c4806b4        goharbor/harbor-db:v1.8.1                           "/entrypoint.sh post…"   4 minutes ago       Up 4 minutes (healthy)       5432/tcp                    harbor-db
90ca1cc8b794        goharbor/harbor-log:v1.8.1               
```



## 7.访问harbor

> **用户名	admin**
>
> **密码		123456**

**宿主机80端口**

![iShot_2024-08-22_22.04.36](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-22_22.04.36.png)





**登陆后首界面**

![iShot_2024-08-22_22.05.23](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-22_22.05.23.png)



**<span style={{color: 'red'}}>到此，harbor http方式安装完成！！！</span>**



## 8.https访问harbor

**如果需要https访问harbor，需要做以下操作**

[harbor https官方文档](https://github.com/goharbor/harbor/raw/branch/branch/master/docs/configure_https.md)



**编辑harbor.yml，打开https项的注释，并且写上https证书的位置**

```python
https:
#   # https port for harbor, default is 443
  port: 443
#   # The path of cert and key files for nginx
  certificate: /etc/nginx/ssl_key/harbor/xxx.pem
  private_key: /etc/nginx/ssl_key/harbor/xxx.key
```



## 9.harbor使用

将镜像推送到harbor，需要注意的是，推送的格式如下

![iShot_2024-08-23_10.56.15](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_10.56.15.png)

因此，需要先给镜像打标签

```python
//查看centos镜像
docker images|grep centos
centos                                            latest                          67fa590cfc1c        4 months ago        202MB
centos                                            6.9                             2199b8eb8390        9 months ago        195MB

//给镜像按照格式打标签
docker image tag centos:latest harbor.pptfz.top/pptfz/pptfz-centos:latest
                    镜像名称       harbor地址     项目名       镜像标签名
```







