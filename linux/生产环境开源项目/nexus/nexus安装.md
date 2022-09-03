# nexus安装

[nexus官网](https://www.sonatype.com/)

[nexus3官方文档](https://help.sonatype.com/repomanager3/)

[nexus3最新版官方下载地址](https://help.sonatype.com/repomanager3/product-information/download)

[nexus3历史版本下载地址](https://help.sonatype.com/repomanager3/product-information/download/download-archives---repository-manager-3)

[nexus3安装系统要求](https://help.sonatype.com/repomanager3/product-information/system-requirements)

[nexus3 docker hub](https://hub.docker.com/r/sonatype/nexus3/)



# 1.系统环境

| 系统                                 | 配置  | 硬盘 | java版本                 |
| ------------------------------------ | ----- | ---- | ------------------------ |
| CentOS Linux release 7.6.1810 (Core) | 8c16g | 100g | java version "1.8.0_261" |



# 2.安装

## 2.1 二进制包安装

### 2.1.1 下载二进制包

```shell
wget https://download.sonatype.com/nexus/3/nexus-3.37.3-02-unix.tar.gz
```



### 2.1.2 解压缩包

```shell
# 解压缩后是 nexus-3.37.3-02 sonatype-work 2个目录
tar xf nexus-3.37.3-02-unix.tar.gz
```



### 2.1.3 配置nexus

```shell
etc/nexus-default.properties	# 配置nexus监听端口与地址，默认为8081和0.0.0.0
bin/nexus.rc	# 配置nexus运行用户
```



### 2.1.4 启动nexus

:::tip

**运行nexus的用户必须能登陆系统，不能是系统用户运行nexus，否则会报错如下**

:::

```shell
$ ./nexus run
This account is currently not available.
```



以普通用户运行nexus

- 方式一	前台运行

  ```shell
  ./nexus run
  ```

  

- 方式二    后台运行

  ```shell
  ./nexus start
  ```

  

### 2.1.5 登陆nexus

`admin` 用户初始密码在 `sonatype-work/nexus3/admin.password!`

点击 `next` ，接下里就是设置 `admin` 用户密码以及是否允许匿名用户登陆

![iShot2022-01-09 16.58.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-01-09%2016.58.02.png)

### 使用systemd管理nexus

编辑配置文件 `/etc/systemd/system/nexus.service`

```shell
export NEXUS_BIN_PATH="/opt/nexus-3.37.3-02/bin/nexus"
cat > /etc/systemd/system/nexus.service << EOF
[Unit]
Description=nexus service
After=network.target
  
[Service]
Type=forking
LimitNOFILE=65536
ExecStart=${NEXUS_BIN_PATH} start
ExecStop=${NEXUS_BIN_PATH} stop
User=nexus
Restart=on-abort
TimeoutSec=600
  
[Install]
WantedBy=multi-user.target
EOF
```



启动nexus

```shell
systemctl daemon-reload
systemctl enable nexus.service && systemctl start nexus.service
```



### 使用supervisor管理nexus

```ini
export NEXUS_BIN_PATH="/opt/nexus-3.37.3-02/bin/nexus"

cat > /etc/supervisor/config.d/nexus.ini << EOF
[program:nexus]
command = ${NEXUS_BIN_PATH} run
stdout_logfile = /var/log/supervisor/nexus.log
redirect_stderr = true
autorestart = true
EOF
```





## 2.2 docker安装

创建目录

```shell
export NEXUS_DIR_PATH="/some/dir/nexus-data"
[ -d ${NEXUS_DIR_PATH} ] ||  mkdir ${NEXUS_DIR_PATH} && chown -R 200 ${NEXUS_DIR_PATH}
```



启动容器

```shell
docker run -d \
 -p 8081:8081 \
 --name nexus \
 -h nexus \
 --restart=always \
 -v ${NEXUS_DIR_PATH}:/nexus-data sonatype/nexus3
```





