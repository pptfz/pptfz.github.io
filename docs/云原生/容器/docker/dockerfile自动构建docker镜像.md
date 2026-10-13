[toc]

# Dockerfile 自动构建 Docker 镜像

> 本文介绍如何使用 Dockerfile 自动构建 Docker 镜像，涵盖 Dockerfile 的定义与组成、常用指令详解、构建步骤、多阶段构建以及两个实战示例。

## 官方文档参考

| 文档 | 链接 |
| --- | --- |
| Dockerfile 指令参考（官方） | https://docs.docker.com/engine/reference/builder/ |
| Dockerfile 编写最佳实践（官方） | https://docs.docker.com/build/building/best-practices |
| `docker build` 命令参考（官方） | https://docs.docker.com/reference/cli/docker/build/ |
| 多阶段构建（官方） | https://docs.docker.com/build/building/multi-stage/ |

## 1. Dockerfile 基础

### 1.1 Dockerfile 说明

**Dockerfile 定义**

- Dockerfile 类似 Ansible 的剧本（playbook），是一个文本文件，包含构建镜像所需的所有命令。

**Dockerfile 特点**

- 更适合传输，文件体积小
- 实现更加定制化

**Dockerfile 主要组成部分**

- 基础镜像信息：`FROM centos:7.8`
- 制作镜像操作指令：`RUN yum -y install httpd`
- 容器启动时执行指令：`CMD ["/bin/bash"]`

### 1.2 常用指令

| 指令 | 含义 | 官方文档 |
| --- | --- | --- |
| FROM | 指定基础镜像，基于哪个镜像 | [dockerfile-reference/#from](https://docs.docker.com/engine/reference/builder/#from) |
| MAINTAINER | 构建者信息（非必须，仅作说明） | [dockerfile-reference/#maintainer](https://docs.docker.com/engine/reference/builder/#maintainer) |
| RUN | 指定运行命令 | [dockerfile-reference/#run](https://docs.docker.com/engine/reference/builder/#run) |
| ADD | 将宿主机/远程文件拷贝到容器中，会自动解压 | [dockerfile-reference/#add](https://docs.docker.com/engine/reference/builder/#add) |
| COPY | 复制文件 | [dockerfile-reference/#copy](https://docs.docker.com/engine/reference/builder/#copy) |
| WORKDIR | 指定工作目录 | [dockerfile-reference/#workdir](https://docs.docker.com/engine/reference/builder/#workdir) |
| VOLUME | 设卷，挂载宿主机目录 | [dockerfile-reference/#volume](https://docs.docker.com/engine/reference/builder/#volume) |
| EXPOSE | 指定对外的端口 | [dockerfile-reference/#expose](https://docs.docker.com/engine/reference/builder/#expose) |
| CMD | 容器启动后要运行的命令，容易被替换 | [dockerfile-reference/#cmd](https://docs.docker.com/engine/reference/builder/#cmd) |
| ENV | 环境变量 | [dockerfile-reference/#env](https://docs.docker.com/engine/reference/builder/#env) |
| ENTRYPOINT | 容器启动后执行的命令（无法被替换） | [dockerfile-reference/#entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint) |

> 提示：Docker 18.09+ 推荐使用 BuildKit 后端，可在 Dockerfile 首行添加解析指令 `# syntax=docker/dockerfile:1` 以使用最新语法特性。详见 [Dockerfile 语法](https://docs.docker.com/build/buildkit/dockerfile-frontend/)。

#### 1.2.1 FROM

> 用来指定基础镜像。

```dockerfile
# 指定基础镜像为 centos7.8
FROM centos:7.8
```

`FROM` 中有一个特殊的镜像 `scratch`，表示一个空白镜像（常用于构建纯静态二进制镜像）：

```dockerfile
FROM scratch
```

#### 1.2.2 RUN

> 指定镜像中运行的命令。

shell 格式：`RUN <命令>`

```dockerfile
RUN echo 'Hello, Docker!' > /usr/share/nginx/html/index.html
```

exec 格式：`RUN ["可执行文件", "参数1", "参数2"]`（不常用）。

:::caution 合并 RUN 指令以减少镜像层
`RUN` 指令应尽量写成一条，以减小镜像体积。每一个 `RUN` 都会生成一层镜像：

```dockerfile
# 不推荐：生成两层
RUN nginx -t
RUN nginx -s reload

# 推荐：合并成一条
RUN nginx -t && nginx -s reload
```
:::

![Dockerfile 镜像分层示意：每个 RUN 一层 vs 合并 RUN](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/dockerfile-layers.png)

#### 1.2.3 ADD

> 将本机或远程文件拷贝到镜像中，如果是压缩文件则会自动解压。

- exec 格式：`ADD ["<src>",... "<dest>"]`，适合路径中带有空格的情况
- shell 格式：`ADD <src>... <dest>`

```dockerfile
# 拷贝远程地址中的文件到镜像中的 /opt 下
ADD http://www.baidu.com/baidu.tar.gz /opt
```

:::caution ADD 不支持远程认证
对于从远程 URL 获取资源的情况，由于 `ADD` 指令**不支持认证**，如果远程资源需要认证，则只能使用 `RUN wget` 或 `RUN curl` 替代。
:::

#### 1.2.4 COPY

> 将本机文件拷贝到镜像中（不会自动解压，也不会拉取远程文件，功能比 `ADD` 更纯粹，推荐优先使用）。

- exec 格式：`COPY ["<src>",... "<dest>"]`
- shell 格式：`COPY <src>... <dest>`

```dockerfile
# 将当前上下文中的 test.file 拷贝到镜像中的 /opt 下
COPY test.file /opt
```

#### 1.2.5 WORKDIR

> 指定容器中 `RUN`、`CMD` 等命令的工作目录（相当于 `cd`，且会创建不存在的目录）。

```dockerfile
# 在镜像中 /opt 下生成文件 file
WORKDIR /opt
RUN echo 'test' > file
```

#### 1.2.6 VOLUME

> `VOLUME` 指令用于暴露数据库存储文件、配置文件或容器创建的文件和目录。强烈建议使用 `VOLUME` 来管理镜像中的可变部分。

```dockerfile
# 对外暴露 /data/mysql/conf 下的所有内容
VOLUME /data/mysql/conf
```

#### 1.2.7 EXPOSE

> 指定镜像对外开放的端口（仅作声明，真正映射端口需在 `docker run -p` 时指定）。

```dockerfile
# 指定镜像对外开放的端口
EXPOSE 80
```

#### 1.2.8 ENV

> 指定环境变量，通过 `ENV` 定义的环境变量可以被后面的所有指令使用。

```dockerfile
# 指定 mysql 数据目录的环境变量
ENV mysql_data_path /data/mysql/data
```

#### 1.2.9 CMD

> 容器启动以后**默认**的执行命令。
>
> 如果执行 `docker run` 没有指定任何执行命令，且 Dockerfile 里也没有指定 `ENTRYPOINT`，那么就会使用 `CMD` 指定的执行命令。这也说明了 `ENTRYPOINT` 才是容器启动以后真正要执行的命令。

:::caution 多个 CMD 仅最后一个生效
一个 Dockerfile 如果有多个 `CMD`，**只有最后一个生效**，官方推荐只保留一个 `CMD`。
:::

`CMD` 总共有三种用法：

```dockerfile
CMD ["executable", "param1", "param2"]  # exec 形式
CMD ["param1", "param2"]                # 作为 ENTRYPOINT 的默认参数
CMD command param1 param2               # shell 形式
```

其中 shell 形式（没有中括号）的 command 默认在 `/bin/sh -c` 下执行，例如：

```dockerfile
FROM busybox
CMD echo "hello cmd shell"
```

**示例 1**：`docker run` 没有指定任何执行命令，会使用 `CMD` 指定的执行命令

```bash
# 编辑 Dockerfile
cat > Dockerfile <<EOF
FROM busybox
CMD echo 'hello cmd shell'
EOF

# 构建镜像
docker build -t cmdshell:v1 .

# 启动容器，可以看到 docker run 后边没有指定任何命令，则会使用 CMD 指定的命令
docker run -it cmdshell:v1
# 输出：hello cmd shell
```

**示例 2**：多个 `CMD` 只有最后一个生效

```bash
cat > Dockerfile <<EOF
FROM busybox
CMD echo 'hello cmd shell'
CMD echo '我是最后一个CMD命令'
EOF

docker build -t cmdshell:v2 .
docker run -it cmdshell:v2
# 输出：我是最后一个CMD命令
```

**示例 3**：`docker run` 指定了执行命令，则所有 `CMD` 都不生效

```bash
docker run -it cmdshell:v2 echo 'docker运行指定了命令'
# 输出：docker运行指定了命令
```

#### 1.2.10 ENTRYPOINT

> **容器启动后执行的命令（无法被替换，启动容器时指定的命令会被当成参数追加）**。

![CMD 与 ENTRYPOINT 关系示意：exec 形式 vs shell 形式](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/dockerfile-cmd-entrypoint.png)

根据官方定义，`ENTRYPOINT` 才是用于定义容器启动以后执行程序的指令，允许将镜像当成命令本身来运行（用 `CMD` 提供默认选项），即容器的**入口**。`ENTRYPOINT` 一共有两种用法：

```dockerfile
ENTRYPOINT ["executable", "param1", "param2"] # exec 形式（推荐）
ENTRYPOINT command param1 param2              # shell 形式
```

对于 exec 模式（`docker run` 后面有执行命令，则全部作为参数传给 `ENTRYPOINT`；如果没有额外命令但定义了 `CMD`，则 `CMD` 的全部内容会作为 `ENTRYPOINT` 的参数）。如果要在 `docker run` 中覆盖 `ENTRYPOINT`，可使用 `--entrypoint` 参数。

**示例 1**：`docker run` 没有指定任何执行命令，`CMD` 作为 `ENTRYPOINT` 的参数

```bash
cat > Dockerfile <<EOF
FROM busybox
CMD ["I am in cmd exec form"]
ENTRYPOINT ["echo"]
EOF

docker build -t entrypointest:v1 .
docker run -it entrypointest:v1
# 输出：I am in cmd exec form
```

**示例 2**：`docker run` 指定执行命令，覆盖 `CMD` 默认参数，但仍执行 `ENTRYPOINT`

```bash
docker run -it entrypointest:v1 'entrypoint指定执行命令'
# 输出：entrypoint指定执行命令
```

:::caution ENTRYPOINT 推荐 exec 形式
对于 **shell 模式**的 `ENTRYPOINT`，任何 `docker run` 和 `CMD` 的参数都**无法**传入到 `ENTRYPOINT` 里。下例中无论是否加参数都不会有任何输出，因此一般情况下 `ENTRYPOINT` 推荐使用中括号的 exec 形式：

```dockerfile
FROM busybox

ENTRYPOINT echo

CMD ["I am in cmd exec form"]
```

```bash
docker build -t entrypoint-shell:v1 .

# 加不加参数都不会有任何输出，hello 也不会作为参数传入
docker run entrypoint-shell:v1
docker run entrypoint-shell:v1 hello
```
:::

> 一般用法：用 `ENTRYPOINT` 的 exec 形式作为容器启动后的默认执行命令（放不变的部分），可变部分（命令参数）用 `CMD` 提供默认版本。`docker run` 不加参数时使用默认参数，加参数时覆盖默认参数。

### 1.3 多阶段构建（推荐）

> 多阶段构建（multi-stage build）可以把「构建环境」和「运行环境」分离，最终镜像只包含运行应用所需的文件，从而显著减小镜像体积、降低攻击面。这是现代 Dockerfile 最重要的优化手段之一。详见 [多阶段构建官方文档](https://docs.docker.com/build/building/multi-stage/)。

![多阶段构建流程示意](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/dockerfile-multistage.png)

典型场景：在第一个阶段用包含编译器的镜像完成编译，再把产物 `COPY --from=` 复制到极简的运行阶段。

```dockerfile
# 阶段一：构建
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go build -o /bin/app

# 阶段二：运行（最终镜像仅含二进制，体积小）
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /bin/app /app/app
ENTRYPOINT ["/app/app"]
```

要点：

- 使用 `FROM <image> AS <stage>` 为阶段命名，`COPY --from=<stage>` 跨阶段复制文件。
- 构建时可用 `--target` 只构建到某个阶段（便于调试）：`docker build --target builder -t myapp:builder .`
- 多个镜像有大量公共部分时，可抽出一个公共阶段复用，避免重复（DRY）。

## 2. Dockerfile 构建镜像步骤

1. **第一步、编写 Dockerfile**
2. **第二步、`docker build` 构建镜像**（构建时 Dockerfile 中有多少条命令就提交多少个临时容器，最后总提交一次，每次提交的临时容器会被删除）
3. **第三步、启动容器测试**

## 3. 实战示例

### 3.1 示例一：基础 Dockerfile —— SSH 服务镜像

#### 3.1.1 新建目录，专门存放 Dockerfile

```bash
mkdir /dockerfile/centos6.9_ssh
```

#### 3.1.2 编辑 Dockerfile

```dockerfile
$ cat > Dockerfile <<EOF
FROM  centos:6.9
RUN   yum -y install openssh-server && \
      /etc/init.d/sshd start && \
      echo 1|passwd --stdin root
CMD   ["/usr/sbin/sshd","-D"]
EOF

# 说明
FROM  centos:6.9                          # 基于 centos6.9 镜像
RUN   yum -y install openssh-server      # 安装 ssh
RUN   /etc/init.d/sshd start             # 启动 ssh
RUN   echo 1|passwd --stdin root         # 设置 root 密码
CMD   ["/usr/sbin/sshd","-D"]            # 容器启动时运行的命令
```

#### 3.1.3 构建镜像

```bash
# 基于 Dockerfile 开始构建镜像
docker build -t centos6.9_ssh:v2.1 .
# ...
# Successfully built 6a6d13135aaa
# Successfully tagged centos6.9_ssh:v2.1

# 说明
# build  构建镜像
# -t     指定镜像名称
# .      指定上下文路径（不是 Dockerfile 文件路径）
```

#### 3.1.4 测试镜像

```bash
# 启动一个容器测试镜像
docker run -d -p 3222:22 centos6.9_ssh:v2.1
# a57c6406e001f4a295ec8c847627326403f83a44d72adf719d44f8f3f4463ebc

# 查看镜像，可以看到容器启动时没有指定默认命令，已从 Dockerfile 中 CMD 读取初始运行命令
docker ps -al
# CONTAINER ID   IMAGE                COMMAND               CREATED         STATUS         PORTS                     NAMES
# a57c6406e001   centos6.9_ssh:v2.1   "/usr/sbin/sshd -D"   29 seconds ago  Up 28 seconds  0.0.0.0:3222->22/tcp      elated_kirch
```

#### 3.1.5 SSH 连接测试

![iShot_2024-08-23_11.22.20](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2024-08-23_11.22.20.png)

### 3.2 示例二：基础 Dockerfile —— 多服务

#### 3.2.1 新建目录，专门存放 Dockerfile

```bash
mkdir -p /dockerfile/centos6.9_ssh_http
```

#### 3.2.2 编辑 Dockerfile

```dockerfile
$ cd /dockerfile/centos6.9_ssh_http
$ cat > Dockerfile <<EOF
FROM  centos:6.9
RUN   yum -y install openssh-server httpd \
      && /etc/init.d/sshd start \
      && echo 1|passwd --stdin root
ADD   init.sh /init.sh
CMD   ["/bin/bash","/init.sh"]
EOF

# 说明
FROM  centos:6.9                          # 基于 centos6.9 镜像
RUN   yum -y install openssh-server httpd # 安装 ssh 与 httpd
RUN   /etc/init.d/sshd start              # 启动 ssh
RUN   echo 1|passwd --stdin root         # 设置 root 密码
ADD   init.sh /init.sh                    # 将宿主机 init.sh 拷贝到容器根目录
CMD   ["/bin/bash","/init.sh"]            # 容器启动时运行的命令
```

#### 3.2.3 编辑脚本

```bash
cat > init.sh <<EOF
#!/bin/bash
#
/etc/init.d/httpd start
/usr/sbin/sshd -D
EOF
```

#### 3.2.4 构建镜像

```bash
# 基于 Dockerfile 构建镜像
docker build -t centos6.9_ssh_http:v2.1 .
# ...
# Successfully built 1f4662cc114d
# Successfully tagged centos6.9_ssh_http:v2.1

# 查看镜像
docker images
# REPOSITORY            TAG     IMAGE ID       CREATED         SIZE
# centos6.9_ssh_http    v2.1    1f4662cc114d   7 minutes ago   310MB
```

#### 3.2.5 启动容器

```bash
# 启动容器
docker run -d -p 5222:22 -p 88:80 centos6.9_ssh_http:v2.1
# 9880dd05d4cdc3849c4e62888d16592e6551ee3fb3fbae314ffd33c2744874c9

# 查看容器
docker ps -al
# CONTAINER ID   IMAGE                     COMMAND                CREATED       STATUS       PORTS                                      NAMES
# fa48d4052ff8   centos6.9_ssh_http:v2.1   "/bin/bash /init.sh"   4 seconds ago Up 3 seconds 0.0.0.0:5222->22/tcp, 0.0.0.0:88->80/tcp   zen_payne
```

#### 3.2.6 测试镜像

**SSH 镜像测试**

![iShot_2024-08-23_11.19.19](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2024-08-23_11.19.19.png)

**Apache 镜像测试**

```bash
curl -I 10.0.0.60:88
# HTTP/1.1 403 Forbidden
# Date: Sun, 30 Jun 2019 15:37:34 GMT
# Server: Apache/2.2.15 (CentOS)
# Accept-Ranges: bytes
# Content-Length: 4961
# Connection: close
# Content-Type: text/html; charset=UTF-8
```

> 补充建议：示例中的 `centos:6.9` 已停止维护（EOL），实际生产建议改用仍在维护的基础镜像（如 `rockylinux`、`almalinux`、`debian`、`ubuntu` 或 `alpine`），并在 `FROM` 处尽量使用具体的版本标签而非 `latest`，以保证构建可复现。
