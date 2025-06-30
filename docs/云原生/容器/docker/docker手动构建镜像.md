[toc]



# docker手动构建镜像

## 1.手动创建docker镜像步骤

**第一步、手动启动一个容器，在容器中安装自定义服务**

**第二步、docker commit 把容器提交为镜像**

**第三步、测试镜像功能**



## 2.ssh服务镜像制作示例

### 2.1 启动一个镜像

```python
1.启动一个centos6.9
[root@docker1 ~]# docker run -it -p 222:22 centos:6.9 /bin/bash
[root@ab815c87fb9c /]# 

2.修改镜像yum源
[root@ab815c87fb9c /]# curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-6.repo

[root@ab815c87fb9c /]# curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-6.repo

[root@ab815c87fb9c /]# yum clean all && yum makecache
```



### 2.2 镜像中安装ssh服务并启动

```python
1.安装ssh服务
[root@ab815c87fb9c /]# yum -y install openssh-server

2.启动ssh  第一次启动服务，目的是生成密钥对
[root@ab815c87fb9c ~]# service sshd start
Generating SSH2 RSA host key:                              [  OK  ]
Generating SSH1 RSA host key:                              [  OK  ]
Generating SSH2 DSA host key:                              [  OK  ]
Starting sshd:                                             [  OK  ]

3.验证服务启动状况
[root@ab815c87fb9c ~]# service sshd status
openssh-daemon (pid  163) is running...

[root@ab815c87fb9c ~]# netstat -ntpl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name   
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN      163/sshd            
tcp        0      0 :::22                       :::*                        LISTEN      163/sshd    
```



### 2.3 设置容器root密码

```python
[root@ab815c87fb9c /]# echo 1|passwd --stdin root
Changing password for user root.
passwd: all authentication tokens updated successfully.
```



### 2.4 终端访问刚创建的镜像 222端口

![iShot_2024-08-23_11.03.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-23_11.03.07.png)



### 2.5 提交镜像

```python
1.临时退出镜像
ctrl+p  然后  ctrl+q

2.查看容器信息
[root@docker1 ~]# docker ps -al
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                      NAMES
ab815c87fb9c        centos:6.9          "/bin/bash"              24 minutes ago      Up 24 minutes       0.0.0.0:222->22/tcp        priceless_yonath

3.提交镜像  commit后可以加容器名称或容器ID
[root@docker1 ~]# docker commit ab815c87fb9c centos6.9_ssh:v1.1
sha256:0fcaf66caf5a6bd48c18e0172827aa04a2bf9fcb5a8f849b20f58a116deac5b7

4.查看镜像
[root@docker1 ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
centos6.9_ssh       v1.1                0fcaf66caf5a        About a minute ago   504MB
```



### 2.6 测试镜像

**<span style={{color: 'red'}}>注意：启动的容器提供服务的同时必须夯住</span>**

```python
1.启动容器，使用刚才提交的的镜像,这里使用 sshd -D 使容器能夯住
[root@docker1 ~]# docker run -d -p 223:22 centos6.9_ssh:v1.1 /usr/sbin/sshd -D
ead64de773abd3c1d08647575d096789a5a28d64960f225f7a42ec9cf01211ee

2.查看容器
[root@docker1 ~]# docker ps -al
CONTAINER ID        IMAGE                COMMAND               CREATED             STATUS              PORTS                 NAMES
ead64de773ab        centos6.9_ssh:v1.1   "/usr/sbin/sshd -D"   51 seconds ago      Up 50 seconds       0.0.0.0:223->22/tcp   stupefied_liskov
```

