[toc]



# registry私有仓库

[registry github](https://github.com/distribution/distribution-library-image)

[registry docker hub](https://hub.docker.com/_/registry)



## 启动私有仓库容器

启动容器

```shell
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  -v /opt/myregistry:/var/lib/registry \
  registry:2.8
```



查看

```shell
$ docker ps -a
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                                         NAMES
c6432d2c503c   registry:2.8           "/entrypoint.sh /etc…"   4 seconds ago    Up 4 seconds    0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp   registry
```



## pull镜像并给镜像打标签

pull一个镜像

```shell
docker pull busybox:1.37.0
```



给镜像打tag

```shell
docker tag busybox:1.37.0 10.0.16.17:5000/busybox:1.37.0
```



## push镜像到私有registry

:::tip 说明

默认情况直接push镜像会有如下报错，原因是docker客户端默认是用https

```shell
$ docker push 10.0.16.17:5000/busybox:1.37.0
The push refers to repository [10.0.16.17:5000/busybox]
Get "https://10.0.16.17:5000/v2/": http: server gave HTTP response to HTTPS client
```



最简单的解决方法是添加不安全仓库信任，编辑 `/etc/docker/daemon.json` ，添加如下内容（如果 `daemon.json` 已有内容，只添加 `insecure-registries` 部分）

```shell
{
  "insecure-registries": ["10.0.16.17:5000"]
}
```

:::

```shell
$ docker push 10.0.16.17:5000/busybox:1.37.0
The push refers to repository [10.0.16.17:5000/busybox]
068f50152bbc: Pushed 
1.37.0: digest: sha256:f2e98ad37e4970f48e85946972ac4acb5574c39f27c624efbd9b17a3a402bfe4 size: 527
```



## 查看私有registry仓库镜像

查看所有镜像名称

```shell
$ curl -X GET http://10.0.16.17:5000/v2/_catalog
{"repositories":["alpine","busybox"]}
```



还可以通过进入容器查看

```shell
$ docker exec -it registry ls /var/lib/registry/docker/registry/v2/repositories/
alpine   busybox
```



查看某个镜像的tag

```shell
$ export IMAGE_NAME=busybox
$ curl -X GET http://10.0.16.17:5000/v2/$IMAGE_NAME/tags/list
{"name":"busybox","tags":["1.37.0","1.36.1"]}
```



还可以通过进入容器查看

```shell
$ export IMAGE_NAME=busybox
$ docker exec -it registry ls /var/lib/registry/docker/registry/v2/repositories/$IMAGE_NAME/_manifests/tags
1.36.1  1.37.0
```





## 配置basic认证

:::tip 说明

registry默认是没有认证的，即推送和拉取是不需要用户名密码的

:::

### 配置认证信息

安装 `httpd-tools`

```shell
yum -y install httpd-tools
```



创建存放密码的目录并设置密码

```shell
$ mkdir -p /opt/registry/auth
$ htpasswd -Bbn test 123456 > /opt/registry/auth/htpasswd
```



启动容器

```shell
docker run -d \
  -p 5000:5000 \
  --name registry \
  --restart=always \
  -v /opt/registry/auth:/auth/ \
  -v /opt/myregistry:/var/lib/registry \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2.8
```



## 验证认证

查看镜像报错

```shell
$ curl -X GET http://10.0.16.17:5000/v2/_catalog
{"errors":[{"code":"UNAUTHORIZED","message":"authentication required","detail":[{"Type":"registry","Class":"","Name":"catalog","Action":"*"}]}]}
```



push镜像报错

```shell
$ docker push 10.0.16.17:5000/nginx:stable-alpine
The push refers to repository [10.0.16.17:5000/nginx]
3e8cf4ce5939: Preparing 
f17463b2e0eb: Preparing 
d9eb3928f113: Preparing 
c0ada042e981: Preparing 
b886da31f806: Preparing 
8027b117c757: Waiting 
6a9b6a160986: Waiting 
994456c4fd7b: Waiting 
no basic auth credentials
```



登录registry

:::tip 说明

这里有一些安全认证相关的提示，生产环境可以按照提示进行相关配置

:::

```shell
$ docker login 10.0.16.17:5000
Username: test

i Info → A Personal Access Token (PAT) can be used instead.
         To create a PAT, visit https://app.docker.com/settings
         
         
Password: 

WARNING! Your credentials are stored unencrypted in '/root/.docker/config.json'.
Configure a credential helper to remove this warning. See
https://docs.docker.com/go/credential-store/

Login Succeeded
```



登录成功后就可以正常推送镜像了

```shell
$ docker push 10.0.16.17:5000/nginx:stable-alpine
The push refers to repository [10.0.16.17:5000/nginx]
3e8cf4ce5939: Pushed 
f17463b2e0eb: Pushed 
d9eb3928f113: Pushed 
c0ada042e981: Pushed 
b886da31f806: Pushed 
8027b117c757: Pushed 
6a9b6a160986: Pushed 
994456c4fd7b: Pushed 
stable-alpine: digest: sha256:5e9ca7391b32e6d56da7edb1c55699d83d536a52fdcde13294fc71ec2556f06b size: 1989
```



