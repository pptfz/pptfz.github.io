[toc]



# dockerfile自动构建docker镜像

# 1.dockerfile

## 1.1 dockerfile说明

**dockerfile定义**

- **dockerfile类似ansible的剧本**



**dockerfile特点**

- **1.更适合传输，文件体积小**

- **2.实现更加定制化**



**dockerfile主要组成部分**

- **基础镜像信息			FROM centos:6.9**

- **制作镜像操作指令		RUN	yum -y install httpd**

- **容器启动时执行指令	CMD	["/bin/bash"]**



## 1.2 dockerfile常用指令

| 指令           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| **FROM**       | **指定基础镜像，基于哪个镜像**                               |
| **MAINTAINER** | **构建者信息(不是必须，只是对构建的镜像做一个说明)**         |
| **RUN**        | **指定运行命令**                                             |
| **ADD**        | **将宿主机文件拷贝到容器中，会自动解压；可以拷贝远程主机文件** |
| **COPY**       | **复制文件**                                                 |
| **WORKDIR**    | **指定工作目录**                                             |
| **VOLUME**     | **设卷，挂载宿主机目录**                                     |
| **EXPOSE**     | **指定对外的端口**                                           |
| **CMD**        | **容器启动后要运行的命令，容易被替换**                       |
| **ENV**        | **环境变量**                                                 |
| **ENTRYPOINT** | **容器启动后执行的命令（无法被替换，启动容器的时候指定的命令，会被当成参数）** |



### 1.2.1 dockerfile常用指令	FROM

> 用来指定基础镜像

```dockerfile
# 指定基础镜像为centos7.8
FROM centos:7.8
.....
```



⚠️FROM中有一个特殊的镜像 `scratch` 表明这是一个空白镜像

```dockerfile
FROM scratch
......
```



### 1.2.2 dockerfile常用指令	RUN

> 指定镜像中运行的命令



shell 格式：`RUN <命令>`

```dockerfile
RUN echo 'Hello, Docker!' > /usr/share/nginx/html/index.html
```



exec 格式：`RUN ["可执行文件", "参数1", "参数2"]`，不常用



⚠️RUN指令应该尽量写成一条，以减少镜像提及

```dockerfile
# 每一个RUN都会生成一层镜像
RUN nginx -t
RUN nginx -s reload

# 应该写成一条
RUN nginx -t && nginx -s reload
```



### 1.2.3 dockerfile常用指令	ADD

> 将本机或远程文件拷贝到镜像中，如果是压缩文件则会自动解压

- exec 格式用法：`ADD ["<src>",... "<dest>"]`，特别适合路径中带有空格的情况。
- shell 格式用法：`ADD <src>... <dest>`

```dockerfile
# 拷贝远程地址中的文件到镜像中的/opt下
ADD http://www.baidu.com/baidu.tar.gz /opt
```

**<span style={{color: 'red'}}>⚠️需要注意的是对于从远程 URL 获取资源的情况，由于 ADD 指令不支持认证，如果从远程获取资源需要认证，则只能使用`RUN wget` 或 `RUN curl` 替代了</span>**

### 1.2.4 dockerfile常用指令	COPY

> 将本机文件拷贝到镜像中

- exec 格式用法：`COPY ["<src>",... "<dest>"]`，特别适合路径中带有空格的情况。
- shell 格式用法：`COPY <src>... <dest>`

```dockerfile
# 将当前上下文中的test.file拷贝到镜像中的/opt下
COPY test.file /opt
```



### 1.2.5 dockerfile常用指令	WORKDIR

> 指定容器中RUN、CMD等命令的工作目录

```dockerfile
# 在镜像中/opt下生成文件file
WORKDIR /opt
RUN echo 'test' > file
```



### 1.2.6 dockerfile常用指令	VOLUME

> `VOLUME` 指令用于暴露任何数据库存储文件，配置文件，或容器创建的文件和目录。强烈建议使用 `VOLUME` 来管理镜像中的可变部分和用户可以改变的部分。

```dockerfile
# 对外暴露/data/mysql/conf下的所有内容
VOLUME /data/mysql/conf
```



### 1.2.7 dockerfile常用指令	EXPOSE

> 指定镜像对外开放的端口

```dockerfile
# 指定镜像对外开放的端口
EXPOSE 80
```



### 1.2.8 dockerfile常用指令	ENV

> 指定环境变量，通过ENV定义的环境变量，可以被后面的所有指令中使用

```dockerfile
# 指定myslq数据目录的环境变量 
ENV mysql_data_path /data/mysql/data
```



### 1.2.9 dockerfile常用指令	CMD

> 容器启动以后，`默认`的执行命令
>
> 如果我们执行 `docker run` 没有指定任何的执行命令或者 Dockerfile 里面也没有指定 ENTRYPOINT，那么就会使用 CMD 指定的执行命令执行了。这也说明了 ENTRYPOINT 才是容器启动以后真正要执行的命令。



**⚠️<span style={{color: 'red'}}>一个 Dockerfile 如果有多个 CMD，只有最后一个生效，官网推荐采用这种方式。</span>**



CMD 总共有三种用法：

```dockerfile
CMD ["executable", "param1", "param2"]  # exec 形式
CMD ["param1", "param2"] # 作为 ENTRYPOINT 的默认参数
CMD command param1 param2  # shell 形式
```



其中 shell 形式，就是没有中括号的形式，命令 command 默认是在`/bin/sh -c`下执行的，比如：

```Dockerfile
FROM busybox
CMD echo "hello cmd shell"
```



CMD 示例1 `docker run`没有指定任何执行命令，会使用CMD指定的执行命令

```shell
# 编辑dockerfile
cat > Dockerfile <<EOF
FROM busybox
CMD echo 'hello cmd shell'
EOF

# 构建镜像
docker build -t cmdshell:v1 .

# 启动容器，可以看到，docker run 后边没有指定任何命令，则会使用CMD指定的命令
$ docker run -it cmdshell:v1
hello cmd shell
```



CMD 示例2 `docker run`没有指定任何执行命令，会使用CMD指定的执行命令，并且只有最后一个CMD命令生效

```shell
# 编辑dockerfile
cat > Dockerfile <<EOF
FROM busybox
CMD echo 'hello cmd shell'
CMD echo '我是最后一个CMD命令'
EOF

# 构建镜像
docker build -t cmdshell:v2 .

# 启动容器，可以看到，docker run 后边没有指定任何命令，则会使用CMD指定的命令
$ docker run -it cmdshell:v2
我是最后一个CMD命令
```



CMD 示例3 `docker run` 指定了执行命令，则所有的CMD命令都不生效

```shell
# 编辑dockerfile
cat > Dockerfile <<EOF
FROM busybox
CMD echo 'hello cmd shell'
CMD echo '我是最后一个CMD命令'
EOF

# 构建镜像
docker build -t cmdshell:v2 .

# 启动容器，可以看到，docker run 后边没有指定任何命令，则会使用CMD指定的命令
$ docker run -it cmdshell:v2 echo 'docker运行指定了命令'
docker运行指定了命令
```



### 1.2.10 dockerfile常用指令	ENTRYPOINT

> **容器启动后执行的命令（无法被替换，启动容器的时候指定的命令，会被当成参数）**

根据官方定义来说 `ENTRYPOINT` 才是用于定义容器启动以后的执行程序的，允许将镜像当成命令本身来运行（用 CMD 提供默认选项），从名字也可以理解，是容器的**入口**。ENTRYPOINT 一共有两种用法：

```dockerfile
ENTRYPOINT ["executable", "param1", "param2"] (exec 形式)
ENTRYPOINT command param1 param2 (shell 形式)
```



对应命令行 exec 模式，也就是带中括号的。和 CMD 的中括号形式是一致的，但是这里貌似是在shell的环境下执行的，与cmd有区别。如果 run 命令后面有执行命令，那么后面的全部都会作为 ENTRYPOINT 的参数。如果 run 后面没有额外的命令，但是定义了 CMD，那么 CMD 的全部内容就会作为 ENTRYPOINT 的参数，这同时是上面我们提到的 CMD 的第二种用法。**所以说 ENTRYPOINT 不会被覆盖**。当然如果要在 run 里面覆盖，也是有办法的，使用`--entrypoint`参数即可。



ENTRYPOINT 示例1 `docker run`没有指定任何执行命令

```shell
# 编辑dockerfile
cat > Dockerfile << EOF
FROM busybox
CMD ["I am in cmd exec form"]
ENTRYPOINT ["echo"]
EOF

# 构建镜像
$ docker build -t entrypointest:v1 .

# 启动容器，可以看到，打印的结果是 CMD 里面指定的内容，也就是默认情况将 CMD 部分作为 ENTRYPOINT 的参数了
$ docker run -it entrypointest:v1
I am in cmd exec form
```



ENTRYPOINT 示例2 `docker run` 指定执行命令

```shell
# 编辑dockerfile
cat > Dockerfile << EOF
FROM busybox
CMD ["I am in cmd exec form"]
ENTRYPOINT ["echo"]
EOF

# 构建镜像
$ docker build -t entrypointest:v1 .

# 启动容器，可以看到，打印的结果是entrypoin后执行的命令，会覆盖掉 CMD 提供的默认参数，但是默认都是执行的 ENTRYPOINT 里面的命令。
$ docker run -it entrypointest:v1 'entrypoint指定执行命令'
entrypoint指定执行命令
```



**<span style={{color: 'red'}}>⚠️对于 shell 模式的，任何 docker run 和 CMD 的参数都无法被传入到 ENTRYPOINT 里</span>**

示例如下，我们可以发现entrypoint后加不加执行的命令都不会有任何输出。所以一般情况下对于 **ENTRYPOINT 来说使用中括号的 exec 形式更好**。

```shell
# 编辑Dockerfile
cat > Dockerfile << EOF
FROM busybox
CMD ["I am in cmd exec form and entrypoint shell form"]
ENTRYPOINT echo
EOF

# 构建镜像
docker build -t entrypoint-shell:v1 .

# 启动容器，entrypoint后加不加执行的命令都不会有任何输出
$ docker run entrypoint-shell:v1

$ docker run entrypoint-shell:v1 enfrypoint

```





一般会用 ENTRYPOINT 的中括号形式作为 Docker 容器启动以后的默认执行命令，里面放的是不变的部分，可变部分比如命令参数可以使用 CMD 的形式提供默认版本，也就是 run 里面没有任何参数时使用的默认参数。如果我们想用默认参数，就直接 run，否则想用其他参数，就 run 里面加上参数。



# 2.dockerfile构建镜像步骤

**第一步、编写dockerfile**

**第二步、docker build构建镜像(构建镜像的时候，dockerfile中有多少个命令就提交多少个临时容器，最后再总提交一次并且每次提交的临时容器会被删除)**

**第三步、启动容器测试**





# 3.dockerfile简单示例

## 3.1示例一：基础dockerfile---ssh服务镜像

### 3.1.1 新建目录，专门存放dockerfile

```python
mkdir /dockerfile/centos6.9_ssh
```



### 3.1.2  编辑Dockerfile 

```dockerfile
$ cat > Dockerfile <<EOF
FROM  centos:6.9
RUN   yum -y install openssh-server && \
      /etc/init.d/sshd start && \
      echo 1|passwd --stdin root
CMD   ["/usr/sbin/sshd","-D"]
EOF

#说明
FROM  centos:6.9                         基于centos6.9镜像
RUN   yum -y install openssh-server      docker容器运行的命令，安装ssh
RUN   /etc/init.d/sshd start             docker容器运行的命令，启动ssh
RUN   echo 1|passwd --stdin root         docker容器运行的命令，设置root密码
CMD   ["/usr/sbin/sshd","-D"]            容器启动时运行的命令
```



### 3.1.3 构建镜像

```dockerfile
# 基于dockerfile开始构建镜像
$ docker build -t centos6.9_ssh:v2.1 .
。。。
Successfully built 6a6d13135aaa
Successfully tagged centos6.9_ssh:v2.1

# 说明
build      构建镜像
-t         指定镜像名称
.          指定上下文路径，而不是Dockerfile文件路径
```



### 3.1.4 测试镜像

```python
# 启动一个容器测试镜像
$ docker run -d -p 3222:22 centos6.9_ssh:v2.1 
a57c6406e001f4a295ec8c847627326403f83a44d72adf719d44f8f3f4463ebc

# 查看镜像,可以看到，容器启动时没有指定默认命令，已从dockerfile中CMD读取初始运行名令
$ docker ps -al
CONTAINER ID        IMAGE                     COMMAND                CREATED             STATUS              PORTS                     NAMES
a57c6406e001        centos6.9_ssh:v2.1        "/usr/sbin/sshd -D"    29 seconds ago      Up 28 seconds       0.0.0.0:3222->22/tcp      elated_kirch
```



### 3.1.5 ssh连接测试

![iShot2020-10-15 14.42.53](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15%2014.42.53.png)





## 3.2 示例二：基础Dockerfile--多服务

### 3.2.1 新建目录，专门存放Dockerfile

```python
mkdir -p /dockerfile/centos6.9_ssh_http
```



## 3.2.2 编辑Dockerfile

```dockerfile
$ cd /dockerfile/centos6.9_ssh_http
$ cat > Dockerfile<<EOF
FROM  centos:6.9
RUN   yum -y install openssh-server httpd \
      && /etc/init.d/sshd start \
      && echo 1|passwd --stdin root
ADD   init.sh /init.sh
CMD   ["/bin/bash","/init.sh"]
EOF

#说明
FROM  centos:6.9                              基于centos6.9镜像
RUN   yum -y install openssh-server httpd     docker容器运行的命令，安装ssh
RUN   /etc/init.d/sshd start                  docker容器运行的命令，启动ssh
RUN   echo 1|passwd --stdin root              docker容器运行的命令，设置root密码
ADD   init.sh /init.sh                        将宿主机init.sh拷贝到容器的根目录   
CMD   ["/bin/bash","init.sh"]                 容器启动时运行的命令 
```



### 3.2.3 编辑脚本

```python
cat >init.sh <<EOF 
#!/bin/bash
#
/etc/init.d/httpd start
/usr/sbin/sshd -D
EOF
```



### 3.2.4 构建镜像

```python
# 基于Dockerfile构建镜像
$ docker build -t centos6.9_ssh_http:v2.1 .
。。。
Successfully built 1f4662cc114d
Successfully tagged centos6.9_ssh_http:v2.1

# 查看镜像
$ docker images 
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
centos6.9_ssh_http   v2.1                1f4662cc114d        7 minutes ago       310MB
```



### 3.2.5 启动容器

```python
# 启动容器
$ docker run -d -p 5222:22 -p 88:80 centos6.9_ssh_http:v2.1 
9880dd05d4cdc3849c4e62888d16592e6551ee3fb3fbae314ffd33c2744874c9

# 查看容器
$ docker ps -al
CONTAINER ID        IMAGE                     COMMAND                CREATED             STATUS              PORTS                                      NAMES
fa48d4052ff8        centos6.9_ssh_http:v2.1   "/bin/bash /init.sh"   4 seconds ago       Up 3 seconds        0.0.0.0:5222->22/tcp, 0.0.0.0:88->80/tcp   zen_payne
```



### 3.2.6 测试镜像

**ssh镜像测试**

![iShot2020-10-15 14.42.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15%2014.42.34.png)





**apache镜像测试**

```python
$ curl -I 10.0.0.60:88
HTTP/1.1 403 Forbidden
Date: Sun, 30 Jun 2019 15:37:34 GMT
Server: Apache/2.2.15 (CentOS)
Accept-Ranges: bytes
Content-Length: 4961
Connection: close
Content-Type: text/html; charset=UTF-8
```

