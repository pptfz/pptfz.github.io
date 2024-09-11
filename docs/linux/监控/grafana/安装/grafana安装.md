[toc]



# grafana安装



[grafana官网](https://grafana.com/)

[grafana官方下载地址](https://grafana.com/grafana/download)

[grafana官方管理配置文档](https://grafcdana.com/docs/grafana/latest/installation/configuration/)





## 1.rpm包安装

### 1.1 下载安装包并安装

```python
wget https://dl.grafana.com/oss/release/grafana-7.0.3-1.x86_64.rpm
yum -y localinstall grafana-7.0.3-1.x86_64.rpm
```



### 1.2 启动服务并设置开机自启

:::tip 说明

grafana默认监听TCP/3000端口

:::

```python
systemctl enable grafana-server && systemctl start grafana-server
```



### 1.3 grafana配置文件路径说明

[官方文档中对于grafana配置文件路径的说明](https://grafana.com/docs/grafana/latest/installation/rpm/)

| **文件**             | **路径**                               |
| -------------------- | -------------------------------------- |
| 安装目录             | `/usr/share/grafana/`                  |
| grafana-cli 路径     | `/usr/share/grafana/bin/grafana-cli`   |
| 全局配置文件         | `/etc/grafana/grafana.ini`             |
| 默认配置文件         | `/usr/share/grafana/conf/defaults.ini` |
| plugins 安装目录     | `/var/lib/grafana/plugins/`            |
| 默认数据存储文件路径 | `/var/lib/grafana/grafana.db`          |
| 日志文件存储路径     | `/var/log/grafana/`                    |
| 邮件默认发送模板路径 | `/usr/share/grafana/public/emails/`    |



## 2.yum安装

[yum安装官方文档](https://grafana.com/docs/grafana/latest/installation/rpm/#install-from-yum-repository)



### 2.1 编辑yum源

```shell
cat > /etc/yum.repos.d/grafana.repo <<EOF
[grafana]
name=grafana
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF
```



### 2.2 安装

```shell
# 默认安装最新版
yum -y install grafana

# 指定版本安装
yum -y install grafana-7.5.0
```



### 2.3 启动

```
systemctl start grafana-server && systemctl enable grafana-server
```





## 3.docker安装

### 3.1 安装并启动容器

[官方安装文档](https://grafana.com/grafana/download?edition=oss&pg=get&platform=docker&plcmt=selfmanaged-box1-cta1)中安装的grafana并没有做持久化

```shell
docker run -d --name=grafana -p 3000:3000 grafana/grafana
```



 grafana数据存储路径为 `/var/lib/grafana/grafana.db`  文件，插件存储路径为 `/var/lib/grafana/plugins` 目录，因此需要持久化 `/var/lib/grafana` 这个目录

[docker安装grafana持久化官方文档](https://grafana.com/docs/grafana/latest/administration/configure-docker/)

:::tip 说明

**以挂载宿主机目录的形式启动grafana的时候必须指定用户为root，否则后续会报权限错误；而以volume形式挂载则没有问题**

:::

```shell
docker run \
  -d \
  --restart=always \
  --name=grafana \
  --user=root \
  -h grafana \
  -p 3000:3000 \
  -v /data/docker-volume/grafana:/var/lib/grafana \
  grafana/grafana:8.0.2  
```



## 4.二进制安装

### 4.1 下载二进制包

```shell
wget https://dl.grafana.com/oss/release/grafana-8.0.2.linux-amd64.tar.gz
```



### 4.2 启动

```shell
# 解压缩二进制包
tar xf grafana-8.0.2.linux-amd64.tar.gz 

# 后台启动
cd grafana-8.0.2/
./bin/grafana-server &
```



## 5.helm安装

### 5.1 添加仓库

```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```



### 5.2 下载包

```shell
helm pull grafana/grafana
tar xf grafana-8.3.6.tgz
```



### 5.3 编辑 `values.yaml`

`values.yaml` 中可以定义启动参数、资源配置、svc、ingress等，自行修改即可

:::caution 注意

关于admin用户名和密码的配置处，可以以明文的方式指定，也可以指定外部secret

在指定外部secret的时候需要注意的是，如果通过手动编辑yaml文件的方式，在生成base64编码的时候，需要注意生成的base64编码不能包含换行符

在linux系统中，可以使用 `-w0` 参数生成没有换行符的base64编码

```shell
echo 'admin' | base64 -w0
```



也可以使用 `echo -n` 在输出字符串时不再末尾添加换行符

```shell
echo -n 'admin' | base64
```



也可以通过命令行来生成secret

```shell
kubectl create secret generic admin-secret \
  --from-literal=admin-user=YWRtaW4= \
  --from-literal=admin-password=YWRtaW4= \
  -n monitor
```

:::

```yaml
# Administrator credentials when not using an existing secret (see below)
adminUser: admin
# adminPassword: strongpassword

# Use an existing secret for the admin user.
admin:
  ## Name of the secret. Can be templated.
  existingSecret: "admin-secret"
  userKey: admin-user
  passwordKey: admin-password
```



### 5.4 安装

```shell
helm upgrade --install grafana -n monitor --create-namespace . 
```



## 6.登陆grafana

**浏览器访问 `IP:3000`**

**初始默认账户和密码都是`admin`**

![iShot2020-06-1110.14.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-06-1110.14.33.png)



**登陆成功后会提示修改密码，也可以选择跳过不修改**

![iShot2020-06-1110.33.24](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-06-1110.15.21.png)



**登陆后首界面**

![iShot2020-06-1110.31.49](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2020-06-1110.16.16.png)





