# 安装phpLDAPadmin管理LDAP



[phpLDAPadmin官网](http://phpldapadmin.sourceforge.net/wiki/index.php/Main_Page)



## 标准安装

### 安装phpldapadmin

:::tip 说明

安装phpldapadmin会同时安装php5.4以及httpd2.4.6

:::

```shell
yum -y install phpldapadmin
```



查看安装

phpldapadmin

```shell
$ rpm -qa | grep phpldapadmin
phpldapadmin-1.2.5-1.el7.noarch
```



php

```shell
$ rpm -qa | grep php
php-ldap-5.4.16-48.el7.x86_64
php-5.4.16-48.el7.x86_64
php-cli-5.4.16-48.el7.x86_64
php-common-5.4.16-48.el7.x86_64
```



httpd

```shell
$ rpm -qa | grep httpd
httpd-tools-2.4.6-99.el7.centos.1.x86_64
lighttpd-1.4.54-1.el7.x86_64
httpd-2.4.6-99.el7.centos.1.x86_64
```



### 配置phpldapadmin

#### 编辑 `/etc/httpd/conf.d/phpldapadmin.conf` 允许从远程访问

```shell
# 备份文件
cp /etc/httpd/conf.d/phpldapadmin.conf{,.old}

# 重新编辑文件
cat > /etc/httpd/conf.d/phpldapadmin.conf << EOF
Alias /phpldapadmin /usr/share/phpldapadmin/htdocs
Alias /ldapadmin /usr/share/phpldapadmin/htdocs

<Directory /usr/share/phpldapadmin/htdocs>
  Order Deny,Allow
  Allow from all
</Directory>
EOF
```



#### 编辑 `/etc/httpd/conf/httpd.conf` 

```shell
# 注释如下内容
<Directory />
    AllowOverride none
    Require all denied
</Directory>

# 新增如下内容
<Directory />
    Options Indexes FollowSymLinks
    AllowOverride None
</Directory>
```



注释内容，新增内容，一条命令搞定

:::tip 说明

- `/\<Directory \/>/,/\<\/Directory\>/`：匹配从 `<Directory />` 到 `</Directory>` 这块内容

- `s/^/#/`：在这块内容的每一行开头加 `#`，实现注释

- `/<\/Directory>/a\`：在匹配 `</Directory>` 行的**后面追加**内容

- `\n` 是换行符（用于格式美观）

:::

```sh
sed -i.bak '/<Directory \/>/,/<\/Directory>/ {
  s/^/#/
  /<\/Directory>/a\
\n# 新增目录权限配置\n<Directory />\n    Options Indexes FollowSymLinks\n    AllowOverride None\n</Directory>
}' /etc/httpd/conf/httpd.conf
```



#### 编辑 `/etc/phpldapadmin/config.php`

:::tip 说明

配置使用dn登陆

:::

```shell
修改
	$servers->setValue('login','attr','uid');
修改为
	$servers->setValue('login','attr','dn');
```



一条命令搞定

```shell
sed -i.bak "s/\$servers->setValue('login','attr','uid');/\$servers->setValue('login','attr','dn');/" /etc/phpldapadmin/config.php 
```



#### 重启httpd

```shell
systemctl restart httpd
```



### 访问phpldapadmin

浏览器访问 `IP/phpldapadmin`

#### 访问首页面

![iShot2021-07-01_14.55.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-07-01_14.55.33.png)



#### 点击登录

:::tip 说明

前搭建openldap服务端中设置的用户名为 `cn=admin,dc=ops,dc=com`

密码为 `admin`

:::

![iShot_2025-06-07_11.56.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-07_11.56.07.png)

















### 解决 phpldapadmin管理页面提示 `This base cannot be created with PLA` 问题

phpldapadmin登陆成功后会报错 `This base cannot be created with PLA`

![iShot_2025-06-07_13.49.00](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-07_13.49.00.png)



**解决方法**

在 `/etc/openldap` 目录下新建一个 `base.ldif` 文件，为初始化根节点做准备工作，这里需要修改dn一行为自己的信息

```shell
cat > /etc/openldap/base.ldif << EOF
dn: dc=ops,dc=com
o: ldap
objectclass: dcObject
objectclass: organization
EOF
```



执行命令，会提示输入密码，这里输入搭建openldap时设置的管理员密码

```shell
$ ldapadd -f /etc/openldap/base.ldif -x -D cn=admin,dc=ops,dc=com -W
Enter LDAP Password: 
adding new entry "dc=ops,dc=com"
```



执行成功后重新登陆 phpldapadmin，可以看到之前的报错已经没有了

![iShot_2025-06-07_13.54.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-07_13.54.07.png)



### 关闭匿名访问

ldap默认是允许匿名访问的

![iShot2021-07-01_18.09.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-07-01_18.09.42.png)



编辑 `/etc/phpldapadmin/config.php`

```php
# 关闭匿名访问
修改
	// $servers->setValue('login','anon_bind',true);
修改为
	$servers->setValue('login','anon_bind',false);
```



```php
# 设置只有管理员能登陆
新增
$servers->setValue('login','allowed_dns',array('cn=admin,dc=ops,dc=com'));
```



一条命令搞定

```shell
sed -i.bak "/\/\/ \$servers->setValue('login','anon_bind',true);/ {
    s|// ||;                         # 去掉行首注释
    s|true|false|;                  # 将 true 改为 false
    a\\
\$servers->setValue('login','allowed_dns',array('cn=admin,dc=ops,dc=com'));
}" /etc/phpldapadmin/config.php
```



无需重启任何服务，配置完成后匿名登陆按钮就取消了

![iShot2021-07-01_18.16.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-07-01_18.16.55.png)



### 解决模版移除属性问题

:::tip 说明

有这些警告的原因如下

- **缺失 schema**
  - `sambaGroupMapping`, `sambaSAMAccount` → 这些属于 Samba 的 schema（如 `samba.schema`）
  - `courierMailAlias`, `courierMailAccount` → 这些属于 Courier Mail 的 schema
  - `mozillaOrgPerson`, `c`, `uidNumber`, `gidNumber`, `homeDirectory` → 来自多种通用 schema，如 `nis.schema`、`inetorgperson.schema` 等

- **phpldapadmin 默认模板中预置了对这些 objectClass/attribute 的支持**，但你当前 OpenLDAP 实例中并未加载这些对应的 schema 文件

:::

![iShot_2025-06-07_14.17.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-07_14.17.39.png)



解决方法是移除相关的文件

```shell
cd /usr/share/phpldapadmin/templates/
mkdir bak
mv samba* bak/
mv courierMailA* bak/
mv mozillaOrgPerson.xml bak/
```



移除相关文件警告就没有了

![iShot_2025-06-07_14.46.02](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-07_14.46.02.png)







## docker安装

[phpldapadmin github地址](https://github.com/osixia/docker-phpLDAPadmin)



启动容器

:::tip 说明

[osixia docker镜像](https://github.com/osixia/docker-phpLDAPadmin) 这个项目已经不维护了，但是还能使用，最新版本的镜像(0.9.0)中phpldapadmin的版本是1.2.5

:::

```shell
docker run \
  -d \
  -p 8081:80 \
  -v phpldapadmin:/container/service/phpldapadmin/assets/config \
  --privileged \
  --name phpldapadmin \
  --hostname phpldapadmin \
  --env PHPLDAPADMIN_HTTPS=false \
  --env PHPLDAPADMIN_LDAP_HOSTS=10.0.8.4 \
  --restart=always \
  --detach \
  osixia/phpldapadmin:0.9.0
```



浏览器访问

`IP:端口`

![iShot_2022-09-09_22.16.56](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-09-09_22.16.56.png)





登录后

![iShot_2022-09-09_22.17.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2022-09-09_22.17.54.png)







[phpLDAPadmin docker镜像](https://github.com/leenooks/phpLDAPadmin/wiki/Docker-Container)







```shell
$ docker run -it --rm phpldapadmin/phpldapadmin:2.1.3 ./artisan key:generate --show
* Started with [./artisan key:generate --show]
* Laravel Setup...
  - /app is an external mount point 1
  + Encryption Key auto created, replace with with "artisan key:generate --force"

   INFO  Application key set successfully.  

  - Caching configuration...

   INFO  Caching framework bootstrap, configuration, and metadata.  

  config ............................................................................................................................... 8.88ms DONE
  events ............................................................................................................................... 1.10ms DONE
  routes .............................................................................................................................. 11.78ms DONE
  views ............................................................................................................................... 71.65ms DONE

base64:IeijsYKXA0Yzs+WZAZCRodb/UIAdTOSeFimwpgHVh3k=
```







| 变量             | 示例值                                  | 默认值   | 说明                                                         |
| ---------------- | --------------------------------------- | -------- | ------------------------------------------------------------ |
| `APP_KEY`        | 通过 `artisan key:generate --show` 生成 | 自动生成 | **内部加密使用的密钥**，建议手动生成后设置为固定值，避免每次容器重启都变 |
| `APP_TIMEZONE`   | `Asia/Shanghai`                         | `UTC`    | 应用使用的时区，主要影响日志的时间显示                       |
| `APP_URL`        | `http[s]://URL`                         | 未定义   | 访问 phpLDAPadmin 的外部地址，例如：`https://demo.phpldapadmin.org` |
| `LDAP_CACHE`     | `true` / `false`                        | `false`  | 是否启用 LDAP 查询缓存，开启后可以减轻 LDAP 服务的压力       |
| `LDAP_HOST (*)`  | `hostname` / `IP address`               | 未定义   | **LDAP 服务器的地址(IP或者域名)**，phpLDAPadmin 会连接这个地址，这是必填项 |
| `CACHE_DRIVER`   | 首选缓存驱动程序                        | 文件     | 缓存使用的后端驱动，默认用文件缓存，也可以用 `memcached`     |
| `MEMCACHED_HOST` | `hostname` / `IP address`               | 未定义   | 如果上面 `CACHE_DRIVER` 设置为 `memcached`，这里就要填写 memcached 的地址 |
| `MEMCACHED_PORT` | `tcp port`                              | `11211`  | memcached 使用的端口，默认是 `11211`                         |
| `SERVER_NAME`    | `ip address/port`                       | `:8080`  | 控制容器内部监听的端口（phpLDAPadmin 对外暴露的端口），一般保持默认，除非你要映射别的端口 |







```
docker run --rm -it \
  --name phpldapadmin \
  --network host \
  -e LDAP_HOST=10.0.16.17 \
  -e LDAP_PORT=389 \
  -e LDAP_BASE_DN="dc=ops,dc=com" \
  -e LDAP_USERNAME="cn=admin,dc=ops,dc=com" \
  -e LDAP_PASSWORD="admin" \
  -e LDAP_LOGIN_ATTR="uid" \
  -e LDAP_LOGIN_OBJECTCLASS="inetOrgPerson" \
  -e LDAP_CACHE=yes \
  -e APP_URL=http://10.0.16.17:8080 \
  -e APP_KEY=base64:IeijsYKXA0Yzs+WZAZCRodb/UIAdTOSeFimwpgHVh3k= \
  -p 8080:80 \
  -v phpldapadmin_sessions:/app/storage/framework/sessions \
  -v phpldapadmin_logs:/app/storage/logs \
  phpldapadmin/phpldapadmin:2.1.3

```

