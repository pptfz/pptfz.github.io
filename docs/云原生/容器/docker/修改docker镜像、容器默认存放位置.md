[toc]



# 修改docker镜像、容器默认存放位置

## 背景说明

因为Docker默认是存放在系统盘中 `/var/lib/docker` 的，当用的时间比较久后，产生的镜像及容器越来越多之后，可能会导致你的系统盘满了，这时我们需要将Docker的镜像及容器指向另外一个路径



## 默认路径

默认存放于 `/var/lib/docker`

```shell
$ cd /var/lib/docker
$ ls
builder  buildkit  containers  image  network  overlay2  plugins  runtimes  swarm  tmp  trust  volumes
```



## 编辑配置文件 `/etc/docker/daemon.json`

加入以下一行

```json
"data-root": "/data/docker"
```



## 新建目录

```shell
mkdir -p /data/docker
```



## 查看修改后的配置文件

```shell
$ cat /etc/docker/daemon.json
{
  "graph": "/data/docker"
}
```



## 重启docker

```shell
systemctl restart docker
```



## 拷贝原镜像和容器到新目录

修改完后，原先的镜像和容器查看不存在

```shell
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
```



## 拷贝原镜像和容器到新目录

```shell
\cp -rp /var/lib/docker/* /data/docker/
```



## 重启docker

```shell
systemctl restart docker
```



## 查看修改

```shell
$ docker info|grep Docker
Docker Root Dir: /data/docker
```



## 查看镜像和容器，已恢复

查看镜像

```shell
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
jumpserver/jms_all   1.4.8               e9274ba449e8        3 months ago        1.31GB
```



查看容器

```shell
docker ps -a
CONTAINER ID        IMAGE                      COMMAND             CREATED             STATUS              PORTS                                        NAMES
2789b0d4a200        jumpserver/jms_all:1.4.8   "entrypoint.sh"     About an hour ago   Up 49 seconds       0.0.0.0:80->80/tcp, 0.0.0.0:2222->2222/tcp   jms_all
```



## 测试镜像和容器都无问题后可以删除目录 `/var/lib/docker`

```shell
rm -rf /var/lib/docker
```

