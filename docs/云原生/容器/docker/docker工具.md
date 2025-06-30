# docker工具

## runlike

[runlike github地址](https://github.com/lavie/runlike)



:::tip 说明

`runlike` 是一个开源的查看docker完整启动参数的工具

适用于原先容器启动参数没有相关文档但是又想要确定容器启动时的参数的场景

:::



### 安装

```shell
pip install runlike
```



### 用法

```shell
runlike <container-name>
```



### 示例

使用如下命令启动了kuboard容器

```shell
sudo docker run -d \
  --restart=unless-stopped \
  --name=kuboard \
  -p 8081:80/tcp \
  -p 10081:10081/tcp \
  -e KUBOARD_ENDPOINT="http://10.0.8.4:8081" \
  -e KUBOARD_AGENT_SERVER_TCP_PORT="10081" \
  -v /data/docker-volume/kuboard:/data \
  eipwork/kuboard:v3.5.0.3
  # 也可以使用镜像 swr.cn-east-2.myhuaweicloud.com/kuboard/kuboard:v3 ，可以更快地完成镜像下载。
  # 请不要使用 127.0.0.1 或者 localhost 作为内网 IP \
  # Kuboard 不需要和 K8S 在同一个网段，Kuboard Agent 甚至可以通过代理访问 Kuboard Server \
```





不加 `-p` 参数输出不换行

```shell
$ runlike kuboard
docker run --name=kuboard --hostname=1a3896d496d4 --env=KUBOARD_ENDPOINT=http://10.0.8.4:8081 --env=KUBOARD_AGENT_SERVER_TCP_PORT=10081 --env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin --env=TZ=Asia/Shanghai --env=KUBOARD_PROXY_COOKIE_TTL=36000 --env=KUBOARD_SERVER_LOGRUS_LEVEL=info --env=KUBOARD_SERVER_PORT=80 --env=KUBOARD_TLS_CACHE=/data/autocert/.cache --env=GIN_MODE=release --env=KUBOARD_ETCD_ENDPOINTS=127.0.0.1:2379 --env=KUBOARD_LOGIN_TYPE=default --env=KUBOARD_ROOT_USER=admin --env=GITLAB_BASE_URL=https://gitlab.com --env=LDAP_SKIP_SSL_VERIFY=true --env=KUBOARD_ENDPOINT_PROTOCOL=http:// --volume=/data/docker-volume/kuboard:/data -p 10081:10081 -p 8081:80 --restart=unless-stopped --label='maintainer=shaohq@foxmail.com' --runtime=runc --detach=true eipwork/kuboard:v3.5.0.3
```



加 `-p` 参数输出换行

```shell
$ runlike -p kuboard
docker run \
	--name=kuboard \
	--hostname=1a3896d496d4 \
	--env=KUBOARD_ENDPOINT=http://10.0.8.4:8081 \
	--env=KUBOARD_AGENT_SERVER_TCP_PORT=10081 \
	--env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
	--env=TZ=Asia/Shanghai \
	--env=KUBOARD_PROXY_COOKIE_TTL=36000 \
	--env=KUBOARD_SERVER_LOGRUS_LEVEL=info \
	--env=KUBOARD_SERVER_PORT=80 \
	--env=KUBOARD_TLS_CACHE=/data/autocert/.cache \
	--env=GIN_MODE=release \
	--env=KUBOARD_ETCD_ENDPOINTS=127.0.0.1:2379 \
	--env=KUBOARD_LOGIN_TYPE=default \
	--env=KUBOARD_ROOT_USER=admin \
	--env=GITLAB_BASE_URL=https://gitlab.com \
	--env=LDAP_SKIP_SSL_VERIFY=true \
	--env=KUBOARD_ENDPOINT_PROTOCOL=http:// \
	--volume=/data/docker-volume/kuboard:/data \
	-p 10081:10081 \
	-p 8081:80 \
	--restart=unless-stopped \
	--label='maintainer=shaohq@foxmail.com' \
	--runtime=runc \
	--detach=true \
	eipwork/kuboard:v3.5.0.3
```



使用runlike查看docker容器启动参数与原先容器启动参数对比，可以看到显示的还是比较详细的

![iShot_2022-10-19_21.32.10](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-10-19_21.32.10.png)

