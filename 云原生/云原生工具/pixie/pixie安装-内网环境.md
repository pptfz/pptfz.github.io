# pixie安装-内网环境

[pixie github地址](https://github.com/pixie-io/pixie)

[pixie官网](https://px.dev/)

[pixie安装官方文档](https://docs.px.dev/installing-pixie/)



官方有多种安装方式，生产环境暴露公网域名按照这个 [安装文档](https://docs.px.dev/installing-pixie/install-guides/production-readiness/) 来进行安装，内网环境按照这个 [安装文档](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/) 来进行安装，本文是内网环境安装

## 1.安装要求

- k8s1.21+

- 内核版本4.14+

- 架构x86-64
- Pixie 与 Linux 内核交互安装 BPF 程序来收集遥测数据。为了安装 BPF 程序，Pixie [`vizier-pem-*`](https://docs.px.dev/about-pixie/what-is-pixie/#architecture)pod 需要[特权访问](https://github.com/pixie-io/pixie/blob/e03434a5e41d82159aa7602638804159830f9949/k8s/vizier/base/pem_daemonset.yaml#L115)。





## 2.部署Pixie Cloud

### 2.1 克隆仓库

```shell
git clone https://github.com/pixie-io/pixie.git
cd pixie
```



### 2.2 从repo上的标签中选择一个云发布版本

执行以下命令可以查看当前git仓库中所有的tag

```shell
$ git tag | grep 'release/cloud' | sort -r
release/cloud/staging/1679419561
release/cloud/prod/1683050579
release/cloud/prod/1681245428
release/cloud/prod/1680807534
release/cloud/prod/1679436203
release/cloud/prod/1678398018
release/cloud/prod/1678386321
release/cloud/prod/1678217044
release/cloud/prod/1677799529
release/cloud/prod/1676669858
release/cloud/prod/1676065759
release/cloud/prod/1674596375
release/cloud/prod/1672961079
release/cloud/prod/1670351615
release/cloud/prod/1668540618
......
```



以下是官方文档中选择最新版的命令，但是这个命令有坑

```shell
export LATEST_CLOUD_RELEASE=$(git tag | grep 'release/cloud'  | sort -r | head -n 1 | awk -F/ '{print $NF}')
```



如果按照官方的命令获取的是第一行，但是正确的应该是第二行

```shell
$ git tag | grep 'release/cloud' | sort -r
release/cloud/staging/1679419561
release/cloud/prod/1683050579
......
```



所以应该使用如下命令，直接过滤 `release/cloud/prod`

```shell
export LATEST_CLOUD_RELEASE=$(git tag | grep 'release/cloud/prod' | sort -r | awk -F/ 'NR==1{print $NF}')
```



### 2.3 检查发布标签

```shell
git checkout "release/cloud/prod/${LATEST_CLOUD_RELEASE}"
```



成功会有如下提示

```shell
Note: switching to 'release/cloud/prod/1683050579'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 7b1ef6aec [perf_tool] Specify experiments in terms of actions. (#1262)
```



### 2.4 更新相应的 kustomization 文件中的版本

```shell
perl -pi -e "s|newTag: latest|newTag: \"${LATEST_CLOUD_RELEASE}\"|g" k8s/cloud/public/kustomization.yaml
```



### 2.5 默认情况下，可以通过访问自托管的 Pixie Cloud `dev.withpixie.dev` ，如果使用自定义域名，需要将以下文件中出现的 `dev.withpixie.dev` 替换为自己的域名

```shell
k8s/cloud/public/base/proxy_envoy.yaml
k8s/cloud/public/base/domain_config.yaml
scripts/create_cloud_secrets.sh
```



使用如下命令修改

```shell
export MY_DOMAIN=pixie.pptfz.cn
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" k8s/cloud/public/base/proxy_envoy.yaml
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" k8s/cloud/public/base/domain_config.yaml
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" scripts/create_cloud_secrets.sh
```



### 2.6 安装 mkcert

:::tip说明

Pixie 使用 SSL 在 Pixie Cloud 和 UI 之间进行安全通信。自我管理的 Pixie Cloud 需要管理您自己的证书。mkcert 是一个简单的工具，用于在系统根存储中创建和安装本地证书颁发机构 (CA)，以生成本地信任的证书

:::

[mkcert官方安装文档](https://github.com/FiloSottile/mkcert#installation)

安装 `certutil`

```shell
yum -y install nss-tools
```



安装 `mkcert`

:::tip说明

可以配置一下go下载加速

```shell
# 启用 Go Modules 功能
go env -w GO111MODULE=on

# 配置 GOPROXY 环境变量，以下三选一
1. 七牛 CDN
go env -w  GOPROXY=https://goproxy.cn,direct

2. 阿里云
go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct

3. 官方
go env -w  GOPROXY=https://goproxy.io,direct

# 确认一下：
$ go env | grep GOPROXY
GOPROXY="https://goproxy.cn"
```


:::

```shell
git clone https://github.com/FiloSottile/mkcert && cd mkcert
go build -ldflags "-X main.Version=$(git describe --tags)"
mv mkcert /usr/local/bin/
```



### 2.7 执行 `mkcert`

:::tip说明

Pixie 使用 SSL 在 Pixie Cloud 和 UI 之间进行安全通信。自我管理的 Pixie Cloud 需要管理您自己的证书。是一个简单的工具，用于在系统根存储中创建和安装本地证书颁发机构 (CA)，以生成本地信任的证书。

:::



```shell
mkcert -install
```



执行成功后会提示如下

```shell
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️
The local CA is now installed in the Firefox and/or Chrome/Chromium trust store (requires browser restart)! 🦊
```



### 2.8 创建 `plc` 命名空间

```shell
kubectl create ns plc
```



### 2.9 创建 Pixie Cloud secrets

```shell
./scripts/create_cloud_secrets.sh
```



创建成功后会提示如下

```shell
secret/cloud-auth-secrets created
secret/pl-hydra-secrets created
secret/pl-db-secrets created
secret/cloud-session-secrets created
/tmp/tmp.DYhXyz34xx ~/pixie
Generating RSA private key, 4096 bit long modulus (2 primes)
.....................................................++++
......................................................................................................................................................................++++
e is 65537 (0x010001)
Generating RSA private key, 4096 bit long modulus (2 primes)
...............................++++
.................................................++++
e is 65537 (0x010001)
Signature ok
subject=O = Pixie, CN = pixie.server
Getting CA Private Key
Generating RSA private key, 4096 bit long modulus (2 primes)
..................................++++
.............................++++
e is 65537 (0x010001)
Signature ok
subject=O = Pixie, CN = pixie.client
Getting CA Private Key
secret/service-tls-certs created
~/pixie

Created a new certificate valid for the following names 📜
 - "pixie.pptfz.com"
 - "*.pixie.pptfz.com"
 - "localhost"
 - "127.0.0.1"
 - "::1"

Reminder: X.509 wildcards only go one level deep, so this won't match a.b.pixie.pptfz.com ℹ️

The certificate is at "/tmp/tmp.8BmHpDq2wD/server.crt" and the key at "/tmp/tmp.8BmHpDq2wD/server.key" ✅

It will expire on 17 August 2025 🗓

secret/cloud-proxy-tls-certs created
```



### 2.10 安装 kustomize

[kustomize官方文档](https://kubectl.docs.kubernetes.io/installation/kustomize/)

```shell
wget https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv5.0.3/kustomize_v5.0.3_linux_amd64.tar.gz

tar xf kustomize_v5.0.3_linux_amd64.tar.gz 

mv kustomize /usr/local/bin
```



### 2.8 部署 Pixie Cloud 依赖项

```shell

```













