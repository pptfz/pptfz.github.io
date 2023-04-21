[toc]



# registry私有仓库

**docker私有仓库registry只需要启动一个容器即可**



**试验环境**

> docker01		10.0.0.10
>
> docker02		10.0.0.11



## 1.普通registry

### 1.1 docker01启动私有仓库容器

```python
[root@docker01 ~]# docker run -d -p 5000:5000 --restart=always --name registry -v \
/opt/myregistry:/var/lib/registry  registry

参数解释	
-d					后台运行
-p					映射端口
--restart=always		重启docker服务时拉起容器
--name				名字
-v					挂载卷， /opt/myregistry:/var/lib/registry表示将宿主机的/opt/myregistry挂载到容器的/var/lib/registry
```



### 1.2 docker02给镜像打标签

```python
1.初始镜像
[root@docker02 ~]# docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
centos                  6.9                 adf829198a7f        4 months ago        195MB

2.给镜像打标签
语法
docker tag 镜像名称 标签名称
[root@docker02 ~]# docker tag centos:6.9 10.0.0.10:5000/centos:6.9

3.打完标签后的镜像，id相同，相当于硬链接
[root@docker02 ~]# docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
10.0.0.10:5000/centos   6.9                 adf829198a7f        4 months ago        195MB
centos                  6.9                 adf829198a7f        4 months ago        195MB
```



### 1.3 docker02推送镜像到私有仓库docker01

```python
1.默认推送是采用https协议，因此第一次推送会报错
[root@docker02 ~]# docker push 10.0.0.10:5000/centos:6.9 
The push refers to repository [10.0.0.10:5000/centos] 
Get https://10.0.0.10:5000/v2/: http: server gave HTTP response to HTTPS client

2.修改配置文件，使推送使用http协议
[root@docker02 ~]# vim /etc/docker/daemon.json
{
"insecure-registries": ["10.0.0.10:5000"]
}

3.重启docker
[root@docker02 ~]# systemctl restart docker

4.再次推送即可成功
[root@docker02 ~]# docker push 10.0.0.10:5000/centos:6.9
The push refers to repository [10.0.0.20:5000/centos]
aaa5621d7c01: Pushed 
6.9: digest: sha256:7e172600dff1903f186061ce5f5295664ec9942ca120e4e5b427ddf01bb2b35b size: 529
```



### 1.4 docker 普通registry缺点

**<span style={{color: 'red'}}>没有认证，任何人都可以推送镜像到私有仓库，不安全！！！</span>**

```python
1.docker02导入镜像或者下载镜像
[root@docker02 ~]# docker load -i nginx.tar.gz

2.给镜像打标签
[root@docker02 ~]# docker tag nginx:latest 10.0.0.10:5000/nginx:latest

3.推送任意一个镜像到私有仓库
[root@docker02 ~]# docker push 10.0.0.10:5000/nginx:latest

4.推送镜像存放路径
创建私有镜像仓库时指定的宿主机目录/opt/myregistry		
-v /opt/myregistry:/var/lib/registry  registry
[root@docker01 ~]# ls /opt/myregistry/docker/registry/v2/repositories/
centos/        centos6.9_ssh/ nginx/   
```



## 2.带basic认证的registry

### 2.1 docker01初始环境准备

```python
1.安装httpd-tools
[root@docker01 ~]# yum -y install httpd-tools

2.创建存放密码的目录并设置密码
[root@docker01 ~]# mkdir -p /opt/registry-var/auth
[root@docker01 ~]# htpasswd  -Bbn test 123456  >> /opt/registry-var/auth/htpasswd
```



### 2.2 docker01启动容器

```python
[root@docker01 ~]# docker run -d -p 5000:5000 --name registry --restart=always -v /opt/registry-var/auth/:/auth/ -v \
/opt/myregistry:/var/lib/registry -e "REGISTRY_AUTH=htpasswd" -e \
"REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd\
 registry 
```



### 2.3 docker02直接拉取镜像

```python
1.直接拉取镜像会报错，因为没有认证
[root@docker02 ~]# docker pull 10.0.0.10:5000/nginx
Using default tag: latest
Error response from daemon: Get http://10.0.0.10:5000/v2/nginx/manifests/latest: no basic auth credentials
```



### 2.4 登陆私有仓库，然后拉取镜像

```python
1.登陆私有仓库
[root@docker02 ~]# docker login 10.0.0.10:5000
Username: test
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded

2.拉取镜像
[root@docker02 ~]# docker pull 10.0.0.10:5000/nginx
Using default tag: latest
latest: Pulling from nginx
Digest: sha256:278fefc722ffe1c36f6dd64052758258d441dcdb5e1bbbed0670485af2413c9f
Status: Image is up to date for 10.0.0.10:5000/nginx:latest

3.上传镜像，先打标签，再上传
[root@docker02 ~]# docker tag centos:6.9 10.0.0.10:5000/my-centos
[root@docker02 ~]# docker push 10.0.0.10:5000/my-centos
```



**registry镜像存储位置**

```python
registry镜像存储位置为
挂载目录/docker/registry/v2/repositories/镜像名称


目录挂载
/opt/myregistry:/var/lib/registry
  
镜像存储位置  
/opt/myregistry/docker/registry/v2/repositories
```

