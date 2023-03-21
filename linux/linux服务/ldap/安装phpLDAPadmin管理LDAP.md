# 安装phpLDAPadmin管理LDAP



[phpLDAPadmin官网](http://phpldapadmin.sourceforge.net/wiki/index.php/Main_Page)



# 标准安装

## 1.安装phpldapadmin

> **安装phpldapadmin会同时安装php5.4以及httpd2.4**

```shell
yum -y install phpldapadmin
```



**查看安装**

```shell
$ rpm -qa | grep  phpldapadmin
phpldapadmin-1.2.5-1.el7.noarch
```



## 2.配置phpldapadmin

### 2.1 编辑 `/etc/httpd/conf.d/phpldapadmin.conf` 允许从远程访问

```shell
# 备份文件
cp /etc/httpd/conf.d/phpldapadmin.conf{,.old}

# 重新编辑文件
cat > /etc/httpd/conf.d/phpldapadmin.conf <<EOF
Alias /phpldapadmin /usr/share/phpldapadmin/htdocs
Alias /ldapadmin /usr/share/phpldapadmin/htdocs

<Directory /usr/share/phpldapadmin/htdocs>
  Order Deny,Allow
  Allow from all
</Directory>
EOF
```



### 2.2 编辑 `/etc/httpd/conf/httpd.conf` 

```shell
# 注释102行到105行
<Directory />
    AllowOverride none
    Require all denied
</Directory>

# 106行新增如下
<Directory />
    Options Indexes FollowSymLinks
    AllowOverride None
</Directory>
```



### 2.3 编辑 `/etc/phpldapadmin/config.php`

> **配置使用dn登陆**

```shell
修改
	$servers->setValue('login','attr','uid');
修改为
	$servers->setValue('login','attr','dn');
```



### 2.4 重启httpd

```shell
systemctl restart httpd
```



## 3.访问phpldapadmin

浏览器访问 `IP/phpldapadmin`

访问首页面

![iShot2021-07-01 14.55.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2014.55.33.png)



> **之前搭建openldap服务端中设置的用户名为 `cn=ldap,dc=pptfz,dc=com`，密码为 `123456`**

用户名为 `cn=ldap,dc=pptfz,dc=com`

密码为 `123456`

![iShot2021-07-01 14.56.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2014.56.57.png)





## 4.解决 phpldapadmin管理页面提示 `This base cannot be created with PLA` 问题

phpldapadmin登陆成功后会报错 `This base cannot be created with PLA`

![iShot2021-07-01 14.57.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2014.57.52.png)





**解决方法**

在 `/etc/openldap` 目录下新建一个 `base.ldif` 文件，为初始化根节点做准备工作，这里需要修改dn一行为自己的信息

```shell
cat > /etc/openldap/base.ldif <<EOF
dn: dc=pptfz,dc=com
o: ldap
objectclass: dcObject
objectclass: organization
EOF
```



执行命令，会提示输入密码，这里输入搭建openldap时设置的管理员密码

```shell
$ ldapadd -f /etc/openldap/base.ldif -x -D cn=admin,dc=pptfz,dc=com -W
Enter LDAP Password: 
adding new entry "dc=pptfz,dc=com"
```



执行成功后重新登陆 phpldapadmin，可以看到之前的报错已经没有了

![iShot2021-07-01 15.16.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2015.16.16.png)



## 5.关闭匿名访问

ldap默认是允许匿名访问的

![iShot2021-07-01 18.09.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2018.09.42.png)



编辑 `/etc/phpldapadmin/config.php`

```shell
# 关闭匿名访问
修改
	// $servers->setValue('login','anon_bind',true);
修改为
	$servers->setValue('login','anon_bind',false);
	
# 设置只有管理员能登陆
在上边那行下新增一行
	$servers->setValue('login','allowed_dns',array('cn=admin,dc=pptfz,dc=com'));
```



重启服务

```shell
systemctl restart slapd
```



配置完成后匿名登陆按钮就取消了

![iShot2021-07-01 18.16.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2018.16.55.png)







## 5.解决模版不能使用问题

有些模版提示不能使用

![iShot2021-07-01 15.23.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2015.23.17.png)



### 5.1 导入基本schema

导入 `cosine.ldif`

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/cosine.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=cosine,cn=schema,cn=config"
```



导入 `nis.ldif`

```sh
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/nis.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=nis,cn=schema,cn=config"
```



导入 `inetorgperson.ldif`

```shell
$ ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/inetorgperson.ldif

SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
adding new entry "cn=inetorgperson,cn=schema,cn=config"
```



### 5.2 编辑 `/etc/phpldapadmin/config.php`

```shell
# 备份文件
cp /etc/phpldapadmin/config.php{,.old}

# 530行左右插入以下内容
$servers->newServer('ldap_pla');
$servers->setValue('server','name','LDAP Server');
$servers->setValue('server','host','127.0.0.1');
$servers->setValue('server','port',389);
$servers->setValue('server','base',array('dc=pptfz,dc=com'));   // 需要修改
$servers->setValue('login','auth_type','cookie');
$servers->setValue('login','bind_id','cn=admin,dc=pptfz,dc=com'); // 需要修改
$servers->setValue('login','bind_pass','123456'); // 需要修改管理员密码
$servers->setValue('server','tls',false);
```



**重启服务**

```
systemctl restart slapd httpd
```



模板不能使用提示没了

![iShot2021-07-01 15.39.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-01%2015.39.58.png)



# docker安装

[phpldapadmin github地址](https://github.com/osixia/docker-phpLDAPadmin)



启动容器

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

![iShot_2022-09-09_22.16.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-09-09_22.16.56.png)





登录后

![iShot_2022-09-09_22.17.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-09-09_22.17.54.png)

