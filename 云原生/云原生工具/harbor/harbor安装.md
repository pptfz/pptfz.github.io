# harbor安装

[harbor官网](https://goharbor.io/)

[harbor github地址](https://github.com/goharbor/harbor)





## 1.安装先决条件

**硬件**

| 资源 | 最低 | 推荐  |
| ---- | ---- | ----- |
| cpu  | 2c   | 4c    |
| 内存 | 4GB  | 8GB   |
| 硬盘 | 40GB | 160GB |



**软件**

| 软件           | 版本                                                         | 描述                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| docker         | 17.06.0-ce+                                                  | 有关安装说明，请参阅 [Docker 引擎文档](https://docs.docker.com/engine/installation/) |
| docker-compose | docker-compose (v1.18.0+) 或 docker-compose v2 (docker-compose-plugin) | 有关安装说明，请参阅 [Docker Compose 文档](https://docs.docker.com/compose/install/) |
| Openssl        | 最新版优先                                                   | 用于为Harbor生成证书和密钥                                   |



**网络端口**

| 端口 | 协议  | 描述                                                         |
| ---- | ----- | ------------------------------------------------------------ |
| 443  | HTTPS | Harbor 门户和核心 API 在此端口上接受 HTTPS 请求。您可以在配置文件中更改此端口。 |
| 4443 | HTTPS | 连接到 Harbor 的 Docker Content Trust 服务。只有在启用 Notary 时才需要。您可以在配置文件中更改此端口。 |
| 80   | HTTP  | Harbor 门户和核心 API 在此端口上接受 HTTP 请求。您可以在配置文件中更改此端口。 |



## 2.下载安装包

[harbor安装包下载地址](https://github.com/goharbor/harbor/releases)



:::tip说明

harbor有2种安装方式

- **在线安装程序** ：在线安装程序从 Docker hub 下载Harbor镜像，因此安装程序的体积非常小。安装包名称 `harbor-online-installer-v{version}.tgz`
- **离线安装程序** ：如果要部署 Harbor 的主机没有连接到 Internet，请使用离线安装程序。离线安装程序包含预构建的图像，因此它比在线安装程序大。安装包名称 `harbor-offline-installer-v{version}.tgz`

:::



### 2.1 创建目录

```shell
[ -d /data ] || mkdir /data && cd /data
```



### 2.2 下载安装包

```shell
# 下载安装包
wget https://github.com/goharbor/harbor/releases/download/v2.8.0/harbor-online-installer-v2.8.0.tgz
```



### 2.3 验证包(可选)

可选择下载相应 `*.asc` 文件以验证包是否为正版



### 2.4 解压缩安装包

```shell
tar xf harbor-online-installer-v2.8.0.tgz && cd harbor
```



## 3.配置对harbor的https访问

### 3.1 生成证书颁发机构证书

#### 3.1.1 创建证书存放目录

```shell
# 当前目录为 /data/cert
mkdir cert && cd cert
```



#### 3.1.2 生成ca证书私钥

```shell
# 会生成 ca.key
$ openssl genrsa -out ca.key 4096
Generating RSA private key, 4096 bit long modulus
......................................................................................................................................++
..........................................................++
e is 65537 (0x10001)
```



#### 3.1.3 生成ca证书

```shell
# 会生成 ca.crt
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=ops/OU=ops/CN=harbor.ops.com" \
 -key ca.key \
 -out ca.crt
```



### 3.2 生成服务器证书

#### 3.2.1 生成私钥

```shell
# 会生成 harbor.ops.com.key
openssl genrsa -out harbor.ops.com.key 4096
```



#### 3.2.2 生成证书签名请求 (CSR)

:::tip说明

调整选项中的值`-subj`以反映您的组织。如果使用 FQDN 连接 Harbor 主机，则必须将其指定为通用名称 ( `CN`) 属性，并在密钥和 CSR 文件名中使用它。

:::

```shell
# 会生成 harbor.ops.com.csr
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=ops/OU=ops/CN=harbor.ops.com" \
    -key harbor.ops.com.key \
    -out harbor.ops.com.csr
```



#### 3.2.3 生成 x509 v3 扩展文件

:::tip说明

无论您是使用 FQDN 还是 IP 地址连接到您的 Harbor 主机，您都必须创建此文件，以便您可以为您的 Harbor 主机生成符合主题备用名称 (SAN) 和 x509 v3 的证书扩展要求。替换`DNS`条目以反映您的域。

:::

```shell
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=harbor.ops.com
DNS.2=harbor.ops
DNS.3=harbor
EOF
```



#### 3.2.4 使用 `v3.ext` 文件生成证书

```shell
# 会生成 ca.srl 和 harbor.ops.com.crt
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in harbor.ops.com.csr \
    -out harbor.ops.com.crt
```



### 3.3 向harbor和docker提供证书

生成 `ca.crt` 、 `yourdomain.com.crt` 和 `yourdomain.com.key` 文件后，必须将它们提供给 Harbor 和 Docker，并重新配置 Harbor 以使用它们。



#### 3.3.1 将服务器证书和密钥复制到 Harbor 主机上的 certificates 文件夹中

```shell
# 创建目录
[ -d /data/cert ] || mkdir -p /data/cert

# 拷贝文件
cp ca.crt harbor.ops.com.crt harbor.ops.com.key /data/cert/
```



#### 3.3.2 转换 `.crt` 为 `.cert`

:::tip说明

Docker 守护进程将 `.crt` 文件解释为 CA 证书，`.cert` 将文件解释为客户端证书。

:::

```shell
# 切换目录
cd /data/cert

# 转换证书文件
openssl x509 -inform PEM -in harbor.ops.com.crt -out harbor.ops.com.cert
```



#### 3.3.3 将服务器证书、密钥和 CA 文件复制到 Harbor 主机上的 Docker 证书文件夹中

:::tip说明

如果您将默认的nginx端口443映射到其他端口，请创建 `/etc/docker/certs.d/yourdomain.com:por`t或 `/etc/docker/certs.d/harbor_IP:port` 文件夹。

:::

```shell
# 创建目录
[ -d /etc/docker/certs.d/harbor.ops.com ] || mkdir -p /etc/docker/certs.d/harbor.ops.com

# 拷贝证书文件
cp harbor.ops.com.cert /etc/docker/certs.d/harbor.ops.com/
cp harbor.ops.com.key /etc/docker/certs.d/harbor.ops.com/
cp ca.crt /etc/docker/certs.d/harbor.ops.com/
```



#### 3.3.4 重启docker

```shell
systemctl restart docker
```



## 4.部署harbor

### 4.1 配置harbor yml文件

harbor在线安装包解压后会有一个 `harbor.yml.tmpl` 示例配置文件

将此文件重命名为 `harbor.yml` 来设置系统级参数。 这些参数在运行 `install.sh` 脚本以安装或重新配置 Harbor 时生效。

在初始部署和启动 Harbor 之后，可以在 Harbor Web Portal 中执行其他配置。



#### 4.1.1 必要参数

| 参数 | 子参数  |      |
| ---- | ------- | ---- |
|      | a<br /> |      |
|      |         |      |
|      |         |      |





#### 4.1.2 可选参数



