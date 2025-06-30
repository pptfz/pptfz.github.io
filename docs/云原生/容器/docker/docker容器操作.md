[toc]



# docker容器操作

## 1.docker运行容器

### 1.1 docker后台运行容器

```python
//docker运行一个容器
[root@docker01 ~]# docker run -d -p 80:80 nginx
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
6ae821421a7d: Pull complete 
da4474e5966c: Pull complete 
eb2aec2b9c9f: Pull complete 
Digest: sha256:dd2d0ac3fff2f007d99e033b64854be0941e19a2ad51f174d9240dda20d9f534

#参数说明
run      创建并运行一个容器
-d       后台运行
-p       端口映射  宿主机端口:容器端口  
nginx    docker镜像名称

//访问容器
访问宿主机IP:80端口
```



### 1.2 docker交互式运行容器

```python
//docker交互式运行容器
[root@docker1 ~]# docker run -it --name nginx nginx /bin/bash
root@07c25f8aa98b:/#

#参数shuoming
-it          分配交互式终端
--name       指定容器的名字
/bin/bash    覆盖容器的初始命令
第一个nginx   容器名称
第二个nginx   镜像名称
```



## 2.docker停止容器

> 命令：docker   stop   容器ID或容器名称

```python
//查看容器，此时nginx容器正在运行
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   8 seconds ago       Up 7 seconds        0.0.0.0:80->80/tcp   elated_hermann

//停止容器，停止容器可以加容器的ID或者容器名字
[root@docker1 ~]# docker stop e5008e3abc3c 
e5008e3abc3c

//再次查看，可以看到容器已经停止
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS                     PORTS               NAMES
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   About a minute ago   Exited (0) 2 seconds ago                       elated_hermann
```



## 3.docker进入容器

### 3.1 docker进入容器方法

**目的**

- **docker进入容器（为了调试、排错）**

**方法**

- **docker   exec   -it   容器ID或容器名称   /bin/bash		#会分配一个新的终端tty**
- **docker   attach   					#使用同一个终端**
- **nsenter    用的少					#需要安装util-linux**



### 3.2 示例

**exec进入容器**

```python
//运行一个容器
[root@docker1 ~]# docker run -d nginx
47a36ef42fb743a4c28ac8d3c82cfa1947698c7c0a74a5ccb59815b959cb7a48

//查看容器
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
47a36ef42fb7        nginx               "nginx -g 'daemon of…"   8 seconds ago       Up 7 seconds        80/tcp              zen_spence

//根据容器ID进入容器
[root@docker1 ~]# docker exec -it 47a36ef42fb7 /bin/bash
root@47a36ef42fb7:/# cat /etc/issue
Debian GNU/Linux 9 \n \l


//显示容器详细信息
[root@docker1 ~]# docker ps --no-trunc 
CONTAINER ID                                                       IMAGE               COMMAND                    CREATED             STATUS              PORTS               NAMES
47a36ef42fb743a4c28ac8d3c82cfa1947698c7c0a74a5ccb59815b959cb7a48   nginx               "nginx -g 'daemon off;'"   5 minutes ago       Up 5 minutes        80/tcp              zen_spence
```



## 4.docker退出容器

### 4.1 docker退出容器，容器不运行

**方法**

- **exit**

- **ctrl+d**

```python
//启动一个容器
[root@docker1 ~]# docker run -it --name centos6.9 centos:6.9 /bin/bash

//exit退出容器
[root@7076abed1c74 /]# exit
exit

//查看容器，容器此时已经停止
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                    PORTS               NAMES
7076abed1c74        centos:6.9          "/bin/bash"         11 seconds ago      Exited (0) 1 second ago                       centos6.9
```





### 4.2 临时退出容器,容器依然运行

**方法**

- **ctrl+p	然后	ctrl+q**

  

⚠️⚠️⚠️**<span style={{color: 'red'}}>docker attach进入容器使用的是同一个终端，再次打开一个终端,两个终端的操作是同时进行的</span>**

**最好使用exec进入容器**

```python
//启动一个容器，然后临时退出
[root@docker1 ~]# docker run -it --name centos6.9 centos:6.9 /bin/bash
[root@50492b58763a /]# [root@docker1 ~]# 

//查看容器，容器此时没有退出
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
50492b58763a        centos:6.9          "/bin/bash"         3 minutes ago       Up 3 minutes                            centos6.9

//再次进入刚才临时退出的容器，可以用attach或者exec
[root@docker1 ~]# docker attach 50492b58763a
[root@50492b58763a /]# 

[root@docker1 ~]# docker exec -it 50492b58763a /bin/bash
[root@50492b58763a /]# 
```



## 5.docker夯住容器

**<span style={{color: 'red'}}>docker容器内的第一个进程必须一直处于前台运行的状态，必须夯住，否则这个容器就处于退出状态</span>**

**<span style={{color: 'red'}}>docker容器只能执行一条初始命令</span>**

---

**示例1**

```python
//启动一个nginx容器
[root@docker01 ~]# docker run -d -p 80:80 nginx

//查看nginx容器详细信息
[root@docker1 ~]# docker ps --no-trunc 
CONTAINER ID                                                       IMAGE               COMMAND                    CREATED             STATUS              PORTS               NAMES
47a36ef42fb743a4c28ac8d3c82cfa1947698c7c0a74a5ccb59815b959cb7a48   nginx               "nginx -g 'daemon off;'"   5 minutes ago       Up 5 minutes        80/tcp              zen_spence

可以看到nginx容器启动的命令"nginx -g 'daemon off;'"   表示nginx在前台运行
```





**示例2**

```python
//后台启动centos容器
[root@docker1 ~]# docker run -d centos:6.9
e1fab2c0c3a5df84fa812d475b5f9ed27b31f928aad8874319671cd9ad792e20

//查看容器，可以看到，容器第一个进程没有夯住，已经退出
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
e1fab2c0c3a5        centos:6.9          "/bin/bash"         4 seconds ago       Exited (0) 4 seconds ago                       upbeat_dirac

//要想夯住容器，必须加一个能夯住的命令，例如vi一个不存在的文件，tail -F 一个文件
#方式一
[root@docker1 ~]# docker run -d centos:6.9 vi 123.txt
dcc90f30af539cf2c14748c22cd4815a26283d2cdd5bd8d4a0aece8d9c1a8e84
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
dcc90f30af53        centos:6.9          "vi 123.txt"        2 seconds ago       Up 2 seconds                            frosty_mirzakhani

  
#方式二
[root@docker1 ~]# docker run -d centos:6.9 tail -F /var/log/messages
ddc401b2bba8347b8b257f224e4c6a35798d9b6e08986f71201d3473d82a0ff0
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
ddc401b2bba8        centos:6.9          "tail -F /var/log/me…"   3 seconds ago       Up 2 seconds                            heuristic_gauss

tail
-F   如果文件不存在，也能夯住
-f   如果文件不存在，会退出
```



## 6.docker删除容器

### 6.1 docker温柔删除容器

**命令**

- **docker   rm   容器ID或者容器名称**

```python
//查看docker容器
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                     PORTS               NAMES
9fcda2502aa5        centos:6.9          "/bin/bash"              13 seconds ago      Exited (0) 8 seconds ago                       centos6.9
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   6 minutes ago       Exited (0) 4 minutes ago                       elated_hermann


//删除容器，可以加容器的ID或者名称
[root@docker1 ~]# docker rm centos6.9
centos6.9

//再次查看容器，可以看到名称为centos6.9的容器已经删除
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                     PORTS               NAMES
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   10 minutes ago      Exited (0) 8 minutes ago                       elated_hermann
```





### 6.2 docker强制删除容器

**<span style={{color: 'red'}}>最好不要强制删除容器！！！</span>**

**命令**

- **docker   rm   -f   容器ID或容器名称**

```python
//运行一个容器
[root@docker1 ~]# docker run -d nginx:latest 
e57f21e6917bc109fb13afbe7e9237b13a3741f0fd1b4971afaa31fdfdcaec6a

//查看容器
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
e57f21e6917b        nginx:latest        "nginx -g 'daemon of…"   9 seconds ago       Up 7 seconds                80/tcp              stoic_leakey
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   16 minutes ago      Exited (0) 15 minutes ago                       elated_hermann

//尝试删除正在运行的容器,会报错
[root@docker1 ~]# docker rm e57f21e6917b 
Error response from daemon: You cannot remove a running container e57f21e6917bc109fb13afbe7e9237b13a3741f0fd1b4971afaa31fdfdcaec6a. Stop the container before attempting removal or force remove

//加-f参数强制删除
[root@docker1 ~]# docker rm -f e57f21e6917b 
e57f21e6917b

//再次查看容器，可以看到容器已经被删除
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
e5008e3abc3c        nginx               "nginx -g 'daemon of…"   19 minutes ago      Exited (0) 17 minutes ago                       elated_hermann

```



