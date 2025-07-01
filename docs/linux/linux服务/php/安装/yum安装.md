[toc]



# yum安装

## 方式一

### 1.安装epel-release

```shell
yum -y install epel-release
```



### 2.安装第三方yum源

**这个yum只有php7.2**

```shell
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm
```



### 3.安装php7.2

```shell
yum -y install php72w php72w-cli php72w-common php72w-curl php72w-gd \
php72w-mbstring php72w-mysqlnd php72w-process php72w-xml php72w-zip \
php72w-opcache php72w-pecl-apcu php72w-intl php72w-pecl-redis php72w-fpm
```



### 4.启动php并设置开机自启

```shell
systemctl start php-fpm && systemctl enable php-fpm
```



## 方式二

### 1.添加第三方yum源

通过这种方式安装的php的目录在`/etc/opt`  配置文件是 `/etc/opt/remi/php73/php-fpm.d/www.conf`

**安装epel源并添加第三方yum源**

```shell
yum -y install epel-release && \
yum -y install https://rpms.remirepo.net/enterprise/remi-release-7.rpm 
```



### 2.选择要安装的php版本

```shell
export phpversion=php73
```



```shell
yum -y install $phpversion-php-fpm $phpversion-php-cli $phpversion-php-bcmath $phpversion-php-gd $phpversion-php-json $phpversion-php-mbstring $phpversion-php-mcrypt $phpversion-php-mysqlnd $phpversion-php-opcache $phpversion-php-pdo $phpversion-php-pecl-crypto $phpversion-php-pecl-mcrypt $phpversion-php-pecl-geoip $phpversion-php-recode $phpversion-php-snmp $phpversion-php-soap $phpversion-php-xml
```



**通过以下命令来获取更多安装信息**

```shell
yum search php73
```



**安装后的php配置文件路径**

```shell
/etc/opt/remi/php73
```



### 3.启动php并设置开机自启

```shell
systemctl enable php73-php-fpm && systemctl start php73-php-fpm
```



