# kooder

[kooder gitee地址](https://gitee.com/koode/kooder)

[kooder github地址](https://github.com/oschina/kooder)

[kooder api官方文档](https://gitee.com/koode/kooder/blob/master/docs/API.md)

# 1.kooder是什么

Kooder 是一个开源的代码搜索工具，目标是为包括 Gitee/GitLab/Gitea 在内的代码托管系统提供自动的源码、仓库和 Issue 的搜索服务。



# 2.kooder架构

Kooder 服务包含两个模块，分别是 gateway 和 indexer（默认配置下 indexer 被集成到 gateway 中）。 其中 gateway 用来接受来自 HTTP 的索引任务， 对任务进行检查后存放到队列中； 同时 gateway 还接受搜索的请求，并返回搜索结果给客户端。而 indexer 进程负责监控队列中的索引任务， 并将这些要新增、删除和修改索引的任务更新到索引库中。



**模块说明**

- `core` 核心对象和公共类
- `gateway` 用来接收来自 HTTP 的索引和搜索的请求
- `indexer` 构建、更新和删除索引的服务



**数据流图**

![iShot_2022-07-03_19.04.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_19.04.45.png)



# 3.安装

官方支持 `源码安装` 、`docker` 安装，这里选择docker安装



## 3.1 安装docker和docker-compose

安装docker

```shell
# 阿里云yum源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum -y install docker-ce

systemctl start docker && systemctl enable docker  

# 配置阿里云镜像加速地址
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"]
}
EOF

# 配置完成后重启docker
systemctl restart docker
```



安装docker-compose

 [docker-compose github](https://github.com/docker/compose) 安装太慢 [可以通过国内源加速安装](http://get.daocloud.io/#install-compose)

```shell
export COMPOSE_VERSION=2.6.1
curl -L https://get.daocloud.io/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```





## 3.2 安装kooder

克隆仓库

```shell
git clone https://gitee.com/koode/kooder.git
```



安装

> ⚠️docker-compose不指定配置文件默认是 `docker-compose.yaml`，如果指定可以通过 `-f` 选项，但是不能写成 `docker-compose up -d -f docker-compose.yaml` ，否则会报错 `unknown shorthand flag: 'f' in -f`

```shell
docker-compose -f docker-compose.yaml up -d
```



# 4.浏览器访问

浏览器访问 `ip:8080`，初始界面如下

![iShot_2022-07-03_19.32.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_19.32.23.png)



# 5.配置kooder

配置文件就是克隆下的仓库中的 `kooder.properties`



文件默认内容如下

```properties
# Gitee Search

# Gitee Search Gateway configurations
http.url = http://192.168.1.25:8080
http.bind =
http.port = 8080
http.log = on
http.webroot = gateway/src/main/webapp
http.startup.tasks = indexer,gitlab

file.index.path = d://file.txt
file.index.vender =

# gitlab setting
gitlab.url = http://192.168.1.25:10080/
gitlab.personal_access_token = Z66e7sxoH18twrkyYzoG
gitlab.secret_token = gsearch
gitlab.connect_timeout = 2000
gitlab.read_timeout = 10000

# gitee setting
gitee.url = http://giteehost/
gitee.personal_access_token = bb319595dc98bb8fbdcf3fc442c25893

# Git
git.username = admin@test.com
git.password = bb319595dc98bb8fbdcf3fc442c25893
# git.ssh.key = ./data/ssh_key
# git.ssh.keypass =

#
queue.provider = embed
queue.redis.host = 127.0.0.1
queue.redis.port = 6379
queue.redis.database = 1
queue.redis.key = gsearch-queue

# queue.embed.url = http://127.0.0.1:8080/queue/fetch
queue.embed.path = ./data/queue
queue.embed.batch_size = 10000

#
storage.type = disk
storage.disk.path = ./data/lucene
storage.disk.use_compound_file = false
storage.disk.max_buffered_docs = -1
storage.disk.ram_buffer_size_mb = 16

#
storage.repositories.path = ./data/repositories
storage.repositories.max_size_in_gigabyte = 200


indexer.no_task_interval = 1000
indexer.batch_fetch_count = 10
indexer.tasks_per_thread = 2
```



现在我们要对接gitlab，因此需要修改如下内容

```properties
# gitlab setting
gitlab.url = http://10.0.0.100
gitlab.personal_access_token = Z66e7sxoH18twrkyYzoG
gitlab.secret_token = gsearch
gitlab.connect_timeout = 2000
gitlab.read_timeout = 10000

# 配置root或者管理员权限的用户名和密码
# Git
git.username = root
git.password = bb319595dc98bb8fbdcf3fc442c25893
```



`gitlab.personal_access_token` 中的token在gitlab中新建一个token即可，给到的权限为 `api` 、`read_user` 、`read_api` 、`read_repository`

![iShot_2022-07-03_19.42.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_19.42.03.png)



配置完成后重启

```shell
docker-compose -f docker-compose.yaml restart
```



# 6.搜索效果

仓库搜索效果

![iShot_2022-07-03_22.15.47](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_22.15.47.png)



代码搜索效果

![iShot_2022-07-03_22.18.15](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_22.18.15.png)

