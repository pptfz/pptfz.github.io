# harbor安装

[harbor官网](https://goharbor.io/)

[harbor github地址](https://github.com/goharbor/harbor)



## 1.安装先决条件

### 1.1 系统环境说明

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



### 1.2 安装docker

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



### 1.3 安装docker-compose

```shell
export DOCKER_COMPOSE_VERSION=2.17.3
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSIO}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
```





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

可下载相应 `*.asc` 文件以验证包是否为正版

```shell
wget https://github.com/goharbor/harbor/releases/download/v2.8.0/harbor-offline-installer-v2.8.0.tgz.asc
```





### 2.4 解压缩安装包

```shell
tar xf harbor-online-installer-v2.8.0.tgz && cd harbor
```



## 3.配置对harbor的https访问

### 3.1 生成证书颁发机构证书

#### 3.1.1 创建证书存放目录

```shell
# 当前目录为 /data/harbor/cert
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

调整选项中的值 `-subj` 以反映您的组织。如果使用 FQDN 连接 Harbor 主机，则必须将其指定为通用名称 ( `CN`) 属性，并在密钥和 CSR 文件名中使用它。

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

无论您是使用 FQDN 还是 IP 地址连接到您的 Harbor 主机，您都必须创建此文件，以便您可以为您的 Harbor 主机生成符合主题备用名称 (SAN) 和 x509 v3 的证书扩展要求。替换 `DNS` 条目以反映您的域。

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



#### 3.3.1 转换 `.crt` 为 `.cert`

:::tip说明

Docker 守护进程将 `.crt` 文件解释为 CA 证书，`.cert` 将文件解释为客户端证书。

:::

```shell
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

#### 4.1.1 参数说明

##### 4.1.1.1 必要参数

- `hostname` : 指定要部署 Harbor 的目标主机的 IP 地址或完全限定域名 (FQDN)。这是您访问 Harbor Portal 和注册服务的地址。例如，`192.168.1.10`或`reg.yourdomain.com`。注册表服务必须可供外部客户端访问，因此不要将`localhost`、`127.0.0.1`或指定`0.0.0.0`为主机名。
- `http` : 不要在生产环境中使用http，只有在没有连接到外部互联网的测试或开发环境才可以使用http。
  - `port` : 用于 Harbor 门户和 Docker 命令的 HTTP 端口号。默认值为 80。

- `https`  : 使用 HTTPS 访问 Harbor Portal 和令牌/通知服务。

  - `port` : 用于 Harbor 门户和 Docker 命令的 HTTPS 端口号。默认值为 443。

  - `certificate` : SSL 证书的路径。
  - `private_key` : SSL 密钥的路径。

- `internal_tls` : 使用 HTTPS 在 Harbor 组件之间进行通信

  - `enabled` : 将此标志设置为`true`表示已启用内部 tls
  - `dir` : 包含内部证书和密钥的目录的路径

- `harbor_admin_password` : 设置Harbor系统管理员的初始密码。此密码仅在 Harbor 首次启动时使用。在随后的登录中，此设置将被忽略，管理员密码将在 Harbor 门户中设置。默认的用户名和密码是`admin`和`Harbor12345`。
- `database` : 使用本地 PostgreSQL 数据库。您可以选择配置外部数据库，在这种情况下您可以停用此选项。
  - `password` : 设置本地数据库的root密码。
  - `max_idle_conns` : 空闲连接池中的最大连接数。如果它 <=0，则不保留空闲连接。
  - `max_open_conns` : 到数据库的最大打开连接数。如果 <= 0，则打开的连接数没有限制。
  - `conn_max_lifetime` : 可以重用连接的最长时间。如果它 <= 0，则连接不会由于连接的年龄而关闭。
  - `conn_max_idle_time` : 连接空闲的最长时间。如果它 <= 0，则连接不会由于连接的空闲时间而关闭。
- `data_volume` : 目标主机上存储 Harbor 数据的位置。即使删除 和/或 重新创建 Harbor 的容器，此数据也保持不变。您可以选择配置外部存储，在这种情况下停用此选项并启用`storage_service`。默认值为`/data`。

- `trivy` : 配置 Trivy 扫描仪。
  - `ignore_unfixed` : 将标志设置为`true`仅显示已修复的漏洞。默认值为`false`
  - `security_check` : 要检测的安全问题的逗号分隔列表。可能的值为`vuln`,`config`和`secret`。默认为`vuln`.
  - `skip_update` : 您可能希望在测试或 CI/CD 环境中启用此标志以避免 GitHub 速率限制问题。如果启用该标志，您必须`trivy-offline.tar.gz`手动下载存档，提取和`trivy.db`文件`metadata.json`并将它们安装在`/home/scanner/.cache/trivy/db/trivy.db`容器中的路径中。默认值为`false`
  - `insecure` : 将标志设置为`true`跳过验证注册表证书。默认值为`false`
  - `github_token` : 设置 GitHub 访问令牌以下载 Trivy DB。Trivy DB 由 Trivy 从 GitHub 发布页面下载。来自 GitHub 的匿名下载受每小时 60 次请求的限制。通常这样的速率限制足以用于生产操作。如果出于任何原因这还不够，您可以通过指定 GitHub 访问令牌将速率限制提高到每小时 5000 个请求。有关 GitHub 速率限制的更多详细信息，请参阅 https://developer.github.com/v3/#rate-limiting 。您可以按照 https://help.github.com/en/github 中的说明创建 GitHub 令牌/authenticating-to-github/creating-a-personal-access-token-for-the-command-line
- `jobservice` 
  - `max_job_workers` : 作业服务中复制工作者的最大数量。对于每个图像复制作业，工作人员将存储库的所有标签同步到远程目标。增加这个数字允许系统中有更多的并发复制作业。但是，由于每个worker都会消耗一定的网络/CPU/IO资源，所以根据宿主机的硬件资源来设置该属性的值。默认值为 10。
- `notification` 
  - `webhook_job_max_retry` : 设置 Web 挂钩作业的最大重试次数。默认值为 10。

- `log` : 配置日志记录。Harbor 使用 rsyslog 来收集每个容器的日志。
  - `level` : 将日志记录级别设置为`debug`、`info`、`warning`、`error`或`fatal`。默认值为`info`。
  - `local` : 设置日志保留参数
    - `rotate_count``rotate_count` : 日志文件在被删除之前会轮换几次。如果计数为 0，旧版本将被删除而不是轮换。默认值为 50。
    - `rotate_size` : 日志文件只有在大于`rotate_size`字节时才会轮换。用于`k`千字节、`M`兆字节和`G`千兆字节。 `100`、`100k`和`100M`都是`100G`有效值。默认为 200M。
    - `location` : 设置日志存放目录。默认值为`/var/log/harbor`。
  - `external_endpoint` : 启用此选项可将日志转发到系统日志服务器。
    - `protocol` : 系统日志服务器的传输协议。默认为 TCP。
    - `host` : 系统日志服务器的 URL。
    - `port` : syslog服务器监听的端口

- `proxy` : 配置由 trivy-adapter、复制作业服务和 Harbor 使用的代理。如果不需要代理，请留空。有些代理有白名单设置，如果启用了Trivy，你需要将以下url添加到代理服务器白名单中：`github.com`, `github-releases.githubusercontent.com`, 和`*.s3.amazonaws.com.`
  - `http_proxy` : 配置 HTTP 代理，例如 `http://my.proxy.com:3128`
  - `https_proxy` : 配置 HTTPS 代理，例如 `http://my.proxy.com:3128`
  - `no_proxy` : 配置何时不使用代理，例如`127.0.0.1,localhost,core,registry`
- `cache` : 为您的 Harbor 实例配置缓存层。启用后，Harbor 将使用 Redis 缓存一些 Harbor 资源（例如，工件、项目或项目元数据），从而减少重复请求同一 Harbor 资源所花费的时间和资源。强烈建议您在高并发拉取请求率的 Harbor 实例上启用此功能，以提高 Harbor 的整体性能。有关缓存层实现和性能改进的更多详细信息，请参阅[缓存层维基页面](https://github.com/goharbor/perf/wiki/Cache-layer)。
  - `enabled` : 默认为`false`，设置为`true`启用 Harbor 的缓存层。
  - `expire_hours` : 以小时为单位配置缓存过期限制。默认值为 24。



##### 4.1.1.2 可选参数

- `external_url` : 启用此选项以使用外部代理。启用后，不再使用主机名。
- `storage_service` : 默认情况下，Harbor 将图像和图表存储在本地文件系统中。在生产环境中，您可能希望使用另一个存储后端而不是本地文件系统。下面列出的参数是注册表的配置。有关如何配置不同后端的更多信息，请参阅下面 [配置存储后端](https://goharbor.io/docs/2.8.0/install-config/configure-yml-file/#backend)
  - `ca_bundle` : `自定义根 CA 证书的路径，该证书被注入到注册表和图表存储库容器的信任库中。如果内部存储使用自签名证书，通常需要这样做。`
  - `filesystem` : 默认是 `filesystem`，但是你可以设置 `azure` 、`gcs` 、`s3` 、`swift` 和 `oss` 。有关如何配置其他后端的信息，请参阅下面的 [配置存储后端](https://goharbor.io/docs/2.8.0/install-config/configure-yml-file/#backend) 。设置 maxthreads 以限制外部提供程序的线程数。 默认值为 100
  - `redirect` : 设置`deactivate`为`true` 表示停用注册表重定向

- `external_database` : 如果停用本地数据库选项，则配置外部数据库设置。目前，Harbor 仅支持 PostgreSQL 数据库。必须创建 `Harbor core`, `Notary server`, 和`Notary signer` 3个数据库，表是在harobr启动的时候自动生成的。
  - `harbor` : 为 Harbor 数据配置外部数据库。
    - `host`: Harbor 数据库的主机名。
    - `port`：数据库端口。
    - `db_name`： 数据库名称。
    - `username`: 数据库用户名。
    - `password`：数据库密码。
    - `ssl_mode`：启用 SSL 模式。
    - `max_idle_conns`：空闲连接池中的最大连接数。如果 <=0，则不保留空闲连接。默认值为 2。
    - `max_open_conns`: 数据库的最大打开连接数。如果 <= 0，则打开的连接数没有限制。默认值为 0。
  - `notary_signer` : 为 Notary 签名者数据库配置外部数据库
    - `host`：公证签名者数据库的主机名
    - `port`：数据库端口。
    - `db_name`： 数据库名称。
    - `username`：连接到公证签名者数据库的用户名。
    - `password`：连接到公证签名者数据库的用户的密码。
    - `ssl_mode`：启用 SSL 模式。
  - `notary_server` :
    - `host`：公证服务器数据库的主机名。
    - `port`：数据库端口。
    - `db_name`： 数据库名称。
    - `username`：连接到公证服务器数据库的用户名。
    - `password`：连接到公证服务器数据库的用户的密码。
    - `ssl_mode`: 启用 SSL 模式。

- `external_redis` : 配置外部 Redis 实例。
  - `host` : 外部 Redis 主机名。格式是 `redis_host:redis_port` 在1.10版本中 `host` 和 `port` 是单独写的，新版本中可以把主机名和端口写在一起。如果你使用的是哨兵模式，这部分应该是 `host_sentinel1:port_sentinel1` , `host_sentinel2:port_sentinel2` 。
  - `sentinel_master_set` : 仅在使用 Sentinel 模式时设置此项
  - `password` : 外部 Redis 密码。
  - `registry_db_index` : Harbor 注册表的数据库索引。
  - `jobservice_db_index` : 作业服务的数据库索引。
  - `chartmuseum_db_index` : chart museum的数据库索引(中文不知道什么意思)。
  - `trivy_db_index` : Trivy 适配器的数据库索引。
- `metric` : 配置将 Harbor 实例指标公开到指定的端口和路径
  - `enabled` : 通过将其设置为 `true` 在harbor上开启 `metric` 指标，默认是 `false`
  - `port` : `metric` 指标暴露端口，默认是 `9090`
  - `path` : `metric` 指标路径，默认是 `/metrics`
- `trace` : 配置公开分布式跟踪数据
  - `enabled` : 通过将其设置为 `true` 在harbor上开启跟踪，默认是 `false`
  - `sample_rate` : 设置跟踪的采样率。例如，如果您想采样 100% 的跟踪数据，请将 sample_rate 设置为1；设置为 `0.5` 表示采样 50% 的跟踪数据
  - `namespace` : Namespace 用来区分不同的 Harbor 服务，会设置为带有 key 的属性 `service.namespace`
  - `attributes` : 属性是一个键值字典，包含用户定义的自定义属性，用于初始化跟踪提供程序，所有这些属性都将添加到跟踪数据中
  - `jaeger` :
    - `endpoint`：端点的url（例如`http://127.0.0.1:14268/api/traces`）。设置端点意味着通过 http 导出到 jaeger collector。
    - `username:`：用于连接端点的用户名。如果不需要，留空。
    - `password:`：用于连接端点的密码。如果不需要，留空。
    - `agent_host`: jaeger 代理的主机名。设置agent_host表示通过udp将数据导出到jaeger agent。
    - `agent_port:`: jaeger 代理的端口名称。
  - `otel` : 
    - `endpoint`：otel compitable后端的主机名和端口（例如`127.0.0.1:4318`）。
    - `url_path:`：端点的url路径（例如`127.0.0.1:4318`）
    - `compression:`：如果启用数据压缩
    - `insecure`：忽略otel后端的证书验证
    - `timeout:`：数据传输超时



#### 4.1.2 编辑配置文件

```yaml
cat > harbor.yml << EOF
# 指定harbor访问域名
hostname: harbor.ops.com

# 指定http端口
http:
  port: 80

# 指定https端口及证书 
https:
  port: 443
  certificate: /data/harbor/cert/harbor.ops.com.crt
  private_key: /data/harbor/cert/harbor.ops.com.key
 
# 指定admin密码 
harbor_admin_password: Harbor12345 

# 指定数据库相关信息，默认使用本地PostgrsSQL，如果要使用外置数据库则需要修改 external_database 配置项并注释 database 配置项
database:
  password: root123
  
  # 空闲连接池最大连接数，如果设置小于等于0则为不保留空闲连接
  max_idle_conns: 100
  
  # 数据库最大连接数，如果设置小于等于0则为不限制
  max_open_conns: 900
  
  # 可重用连接的最长时间，如果设置小于等于0则不会由于连接的时间而关闭
  conn_max_lifetime: 5m
  
  # 连接空闲最长时间，如果设置小于等于0则连接不会由于连接的空闲时间而关闭
  conn_max_idle_time: 0

# 默认的数据存储路径，如果要使用外置存储，则需要修改 storage_service 配置项
data_volume: /data/harbor-data

# 配置 Trivy 扫描仪，Trivy DB包含来自NVD, Red Hat和许多其他上游漏洞数据库的漏洞信息，它是由Trivy从GitHub发布页面https://github.com/aquasecurity/trivy-db/releases 下载并缓存到本地系统文件
trivy:
  # 设置为 true 仅显示已修复的漏洞
  ignore_unfixed: false
  
  # 是否跳过自动更新
  skip_update: false
  
  # 扫描jar文件和pom.xml在联网的情况下效果会更好，此选项设置为false则阻止Trivy发送API请求来识别依赖项且不执行离线扫描
  offline_scan: false
  
  # 要检测的安全问题的逗号分隔列表，值有 vuln、config、secret
  security_check: vuln
  
  # 是否跳过验证注册表证书
  insecure: false
   
jobservice:
  # 用于harbor镜像复制的最大worker数
  max_job_workers: 10
  
  # jobLogger清理的持续时间，单位是天，如果设置为stdout则忽略
  logger_sweeper_duration: 1

notification:
  # webhook的最大重试次数
  webhook_job_max_retry: 3
  
  # webhook客户端连接超时时间，单位是秒
  webhook_job_http_client_timeout: 3
  
# 日志配置  
log:
  # 指定日志级别，可选的有 debug、info、warning、error、fatal
  level: info
  
  # 设置日志保留参数
  local:
    # 保留切割日志的数量，如果设置为0，旧的日志将被删除
    rotate_count: 50
    
    # 指定日志多大才会被切割
    rotate_size: 200M
    location: /var/log/harbor

# harbor的版本
_version: 2.8.0    

# 相关代理配置
proxy:
  http_proxy:
  https_proxy:
  no_proxy:
  components:
    - core
    - jobservice
    - trivy
    
# 
upload_purging:
  enabled: true
  age: 168h
  interval: 24h
  dryrun: false
 
# 缓存配置 
cache:
  # 默认不开启，如果开启后harbor将使用redis缓存一些资源，如果有高并发拉取的情况应该启用缓存
  enabled: true
  
  # 缓存过期时间，单位是小时
  expire_hours: 24 
EOF
```



### 4.2 执行安装

执行 `install.sh` 会根据 `harbor.yml` 生成 `docker-compose.yml` 然后启动容器

```shell
./install.sh 
```



安装成功后会在最后提示如下信息

```
✔ ----Harbor has been installed and started successfully.----
```



:::tip修改容器内时区

启动的容器默认使用的是 `UTC` 时间，`./install` 执行成功后会生成 `docker-compose.yml` 文件，可以修改 `docker-compose.yml` ，在各个容器的 `volemes` 下增加如下配置，然后重启就可以让容器内的时区变为 `CST`

```yaml
- /usr/share/zoneinfo/Asia/Shanghai:/etc/localtime
```



:::



### 4.3 查看安装

```shell
$ docker ps -a
CONTAINER ID   IMAGE                                COMMAND                  CREATED         STATUS                   PORTS                                                                            NAMES
c397f48df28c   goharbor/harbor-jobservice:v2.8.0    "/harbor/entrypoint.…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    harbor-jobservice
e3d4b41fc52c   goharbor/nginx-photon:v2.8.0         "nginx -g 'daemon of…"   7 minutes ago   Up 7 minutes (healthy)   0.0.0.0:80->8080/tcp, :::80->8080/tcp, 0.0.0.0:443->8443/tcp, :::443->8443/tcp   nginx
6cfa4d7a301d   goharbor/harbor-core:v2.8.0          "/harbor/entrypoint.…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    harbor-core
e5df0889b8f2   goharbor/harbor-portal:v2.8.0        "nginx -g 'daemon of…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    harbor-portal
4501c20b7f3d   goharbor/harbor-registryctl:v2.8.0   "/home/harbor/start.…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    registryctl
5214bef7630a   goharbor/registry-photon:v2.8.0      "/home/harbor/entryp…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    registry
fccf8fc79e15   goharbor/redis-photon:v2.8.0         "redis-server /etc/r…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    redis
1838075510e2   goharbor/harbor-db:v2.8.0            "/docker-entrypoint.…"   7 minutes ago   Up 7 minutes (healthy)                                                                                    harbor-db
2936c15b6a56   goharbor/harbor-log:v2.8.0           "/bin/sh -c /usr/loc…"   7 minutes ago   Up 7 minutes (healthy)   127.0.0.1:1514->10514/tcp 
```





会启动如下容器

```shell
$ docker ps -a --format '{{.Names}}'
nginx
harbor-jobservice
harbor-core
registry
harbor-portal
harbor-db
registryctl
redis
harbor-log
```



启动的容器及作用

| 容器              | 作用                                                         |
| ----------------- | ------------------------------------------------------------ |
| nginx             | 充当了 Harbor 的反向代理和负载均衡器。Nginx 容器会将所有的 HTTPS 流量路由到 Harbor 的 Web 界面和 API 服务上，并将 HTTP 流量重定向到 HTTPS。此外，Nginx 容器还提供了访问 Harbor Docker Registry 的代理，它会将所有的 Docker Registry 流量路由到 Registry 容器上 |
| harbor-jobservice | 运行 Harbor 的任务服务，用于异步处理 Harbor 的一些任务，如 GC（垃圾回收）等 |
| harbor-core       | 运行 Harbor 的核心服务，包括 Web 界面、API、Webhook 等       |
| registry          | 运行 Docker Registry，用于存储和管理 Docker 镜像             |
| harbor-portal     | 容器。该容器运行 Harbor 的 Web 界面，提供用户界面和 API 服务，以便用户可以使用 Harbor 私有仓库管理和存储 Docker 镜像 |
| harbor-db         | 运行PostgreSQL 数据库，用于存储 Harbor 的元数据和配置信息    |
| registryctl       | 运行 Harbor 的控制台，用于管理和监控 Harbor                  |
| redis             | 运行 Redis，用于存储 Harbor 的缓存信息                       |
| harbor-log        | 运行 Harbor 的日志服务，用于收集、存储和查询 Harbor 的日志信息 |







## 5.其他

### 5.1 配置http访问harbor

:::tip说明

如果不想要配置https访问harbor或者访问入口是nginx/云厂商lb等(一般都是在nginx或lb上配置证书)则不需要执行 `3` 步骤中的内容

同时在docker的配置文件 `/etc/docker/daemon.json ` 中还要指定配置使用http推送镜像

```json
{
"insecure-registries" : ["harbor仓库地址", "0.0.0.0"]
}
```

:::



### 5.2 配置存储后端

默认情况下，Harbor 使用本地存储作为注册表，可以通过修改 `harbor.yml`  中的 `storage_service` 来指定使用的外部存储，有关如何为不同存储提供程序配置注册表存储后端的信息，请参阅 Docker 文档中的[注册表配置参考](https://docs.docker.com/registry/configuration/#storage)



以下是使用阿里云oss的配置示例

```yaml
storage:
  oss:
  	# 必需项，指定accesskeyid  
    accesskeyid: 
    
    # 必需项，指定accesskeysecret
    accesskeysecret: 
    
    # 必需项，指定OSS region 名称
    region: 
    
     # 必需项，OSS bucket 名称
    bucket: 
    
    # 非必需项，指定 endpoints 域名地址，有内网和公网
    endpoint: 
    
    # 非必需项，指定内网访问还是外网访问，默认为 false
    internal: 
    
    # 非必需项，是否启动服务端加密，默认为 false
    encrypt: 
    
    # 非必需项，指定用于加密的可选 KMS 密钥 ID
    encryptionkeyid: 
    
    # 非必需项，指定是否通过 ssl 将数据传输到存储桶，默认为 true
    secure: 
    
    # 非必需项，分段上传（由 WriteStream 执行）到 OSS 的默认分段大小，默认值为 10 MB，OSS 的最小部分大小为 5MB
    chunksize: 
    
    # 非必需项，存储所有注册表文件的根目录树，默认是空字符串(即桶的根)
    rootdirectory: 
```



参数说明

| 参数              | 说明                                                         | 是否必须 |
| ----------------- | ------------------------------------------------------------ | -------- |
| `accesskeyid`     | 指定access key ID                                            | ✅        |
| `accesskeysecret` | 指定access key secret                                        | ✅        |
| `region`          | 指定oss的region，可以从[阿里云访问域名和数据中心帮助文档](https://help.aliyun.com/document_detail/31837.html?spm=a2c4g.31815.0.0.561d71bfnILFU2)查看 | ✅        |
| `bucket`          | 指定使用的oss的bucket名称                                    | ✅        |
| `endpoint`        | 默认是 `[bucket].[region].aliyuncs.com` 或`[bucket].[region]-internal.aliyuncs.com` | 否       |
| `internal`        | 指定内网还是外网访问，默认是 `false` ，[阿里云访问域名和数据中心帮助文档](https://help.aliyun.com/document_detail/31837.html?spm=a2c4g.31815.0.0.561d71bfnILFU2)查看 | 否       |
| `encrypt`         | 指定是否在服务器端加密数据，默认为 `false`                   | 否       |
| `secure`          | 指定是否通过 ssl 将数据传输到存储桶，默认为 `true`           | 否       |
| `chunksize`       | 分段上传（由 WriteStream 执行）到 OSS 的默认分段大小，默认值为 10 MB，OSS 的最小部分大小为 5MB | 否       |
| `rootdirectory`   | 存储所有注册表文件的根目录树，默认是空字符串(即桶的根)       | 否       |

