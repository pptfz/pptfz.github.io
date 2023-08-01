[toc]



# 修改docker镜像、容器默认存放位置

## 1.修改背景说明

**因为Docker默认是存放在系统盘中 `/var/lib/docker` 的，当用的时间比较久后，产生的镜像及容器越来越多之后，可能会导致你的系统盘满了，这时我们需要将Docker的镜像及容器指向另外一个路径**



## 2.修改步骤

### 2.1  docker镜像、容器默认存放于`/var/lib/docker`

```python
$ cd /var/lib/docker
$ ls
builder  buildkit  containers  image  network  overlay2  plugins  runtimes  swarm  tmp  trust  volumes
```



### 2.2 修改docker镜像、容器存放位置

#### 2.2.1 编辑配置文件 `/etc/docker/daemon.json`

加入以下一行

```json
"graph": "/data/docker"
```



#### 2.2.2 新建目录

```shell
mkdir -p /data/docker
```



#### 2.2.3 查看修改后的配置文件

```shell
$ cat /etc/docker/daemon.json
{
  "registry-mirrors": ["https://gqk8w9va.mirror.aliyuncs.com"],
  "graph": "/data/docker"
}
```



### 2.3 重启docker

```shell
systemctl restart docker
```



### 2.4 拷贝原镜像和容器到新目录

#### 2.4.1 修改完docker镜像、容器存放位置后，原先的镜像和容器查看不存在

```shell
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
```



#### 2.4.2 拷贝原镜像和容器到新目录

```shell
\cp -rp /var/lib/docker/* /data/docker/
```



#### 2.4.3 重启docker

```shell
systemctl restart docker
```



#### 2.4.4 查看修改

```shell
$ docker info|grep Docker
Docker Root Dir: /data/docker
```



#### 2.4.5 查看镜像和容器，已恢复

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



#### 2.4.6 测试镜像和容器都无问题后可以删除目录 `/var/lib/docker`

```shell
rm -rf /var/lib/docker
```

