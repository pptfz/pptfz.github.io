# 安装gitlab最新版

# 一、docker安装gitlab最新版

[docker安装gitlab官方文档](https://docs.gitlab.com/omnibus/docker/)



# 1.安装docker-compose

```python
1.下载安装包
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

2.给二进制文件添加可执行权限
chmod +x /usr/local/bin/docker-compose

3.完成安装，查看版本
docker-compose -v
docker-compose version 1.24.1, build 4667896b
```



# 2.创建存放docker-compose文件目录

```python
mkdir /usr/local/gitlab
cd /usr/local/gitlab
```



# 3.编辑docker-compose.yml文件

```python
#需要修改相对应的域名及映射的端口
cat >docker-compose.yml<<EOF
web:
  image: 'gitlab/gitlab-ce:latest'
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
    - '/srv/gitlab/config:/etc/gitlab'
    - '/srv/gitlab/logs:/var/log/gitlab'
    - '/srv/gitlab/data:/var/opt/gitlab'
EOf
```



# 4.启动容器

```python
docker-compose up -d
```



# 5.查看启动的容器

```python
[root@docker1 gitlab]# docker ps -a
CONTAINER ID        IMAGE                     COMMAND             CREATED             STATUS                            PORTS                                                           NAMES
146a96210725        gitlab/gitlab-ce:latest   "/assets/wrapper"   2 minutes ago       Up 2 minutes (health: starting)   0.0.0.0:443->443/tcp, 0.0.0.0:22->22/tcp, 0.0.0.0:80->80/tcp   gitlab_web_1
```

---

# 二、yum安装gitlab最新版

```python
curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash

yum -y install gitlab-ce
```

