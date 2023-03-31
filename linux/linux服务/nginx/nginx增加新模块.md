[toc]



# nginx增加新模块

**场景：编译安装的nginx后续可能会增加一些第三方模块或者未编译的nginx模块**



## 1.编译安装的nginx增加新模块

### 1.1 查看nginx编译安装参数

```shell
$ nginx -V
nginx version: nginx/1.16.1
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-39) (GCC)
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --user=nginx --group=nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --with-http_gzip_static_module --with-http_stub_status_module --with-http_ssl_module --with-pcre --with-file-aio --with-http_realip_module --without-http_scgi_module --without-http_uwsgi_module --without-http_fastcgi_module
```



### 1.2 下载第三方模块

[echo-nginx-module github地址](https://github.com/openresty/echo-nginx-module)

**ngx_echo 为Nginx配置文件带来"echo"，"sleep"，"time"，"exec"和更多shell样式的东西**

```shell
wget https://github.com/openresty/echo-nginx-module/archive/v0.61.tar.gz
```



解压缩至`/usr/local`

```shell
tar xf v0.61.tar.gz -C /usr/local
```



使用选项`--add-module=/path/to/echo-nginx-module`添加模块



### 1.3 重新编译nginx

:::caution

**<span style={{color: 'red'}}>⚠️make之后不要执行make install   ！！！</span>**

:::

```shell
#进入nginx源码目录
cd nginx-1.16.1

#重新./configure
./configure --prefix=/etc/nginx --user=nginx --group=nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --with-http_gzip_static_module --with-http_stub_status_module --with-http_ssl_module --with-pcre --with-file-aio --with-http_realip_module --without-http_scgi_module --without-http_uwsgi_module --without-http_fastcgi_module --add-module=/usr/local/echo-nginx-module-0.61

#编译，不能执行make install
make
```



**安装完成后查看，最后就是添加的第三方模块**

```shell
$ nginx -V
nginx version: nginx/1.16.1
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-39) (GCC)
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --user=nginx --group=nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --with-http_gzip_static_module --with-http_stub_status_module --with-http_ssl_module --with-pcre --with-file-aio --with-http_realip_module --without-http_scgi_module --without-http_uwsgi_module --without-http_fastcgi_module --add-module=/usr/local/echo-nginx-module-0.61
```



### 1.4 nginx二进制文件操作

**备份原有文件**

```shell
mv /usr/sbin/nginx{,.bak}
```



**拷贝新文件**

```sh
cp nginx-1.16.1/objs/nginx /usr/sbin
```



### 1.5 编译nginx配置文件以测试模块安装是否成功

```nginx
server {
    listen 88;
    server_name _;  
  
    location /test {
        echo "This is default location";
        echo "uri: ${uri}";
    }
}  
```



**检测nginx语法并重载nginx**

这里语法不报错就证明第三方模块echo安装成功了

```shell
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

$ nginx -s reload
```



**本机访问测试**

```shell
$ curl 127.0.0.1:88/test
This is default location
uri: /test
```





## 2.rpm包安装的nginx增加新模块

**nginx是使用rpm包安装的，如果想要安装第三方模块的解决方法**



### 2.1 查看nginx安装的模块

```shell
$ nginx -V
nginx version: nginx/1.16.1
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-36) (GCC)
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -fPIC' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -pie'
```



**安装完成后查看，最后就是添加的第三方模块**

```shell
$ nginx -V
nginx version: nginx/1.16.1
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-39) (GCC)
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -fPIC' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -pie' --add-module=/usr/local/echo-nginx-module-0.61
```





### 2.2 下载一个相同版本的nginx源码包

[nginx官方源码下载地址](https://nginx.org/download/)

```shell
wget https://nginx.org/download/nginx-1.16.1.tar.gz
```



### 2.3 重新编译nginx

**解压缩源码包并进入目录**

```shell
tar xf nginx-1.16.1.tar.gz
cd cd nginx-1.16.1/
```



:::caution

**<span style={{color: 'red'}}>⚠️make之后不要执行make install   ！！！</span>**

:::

```shell
#重新./configure
./configure --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -fPIC' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -pie' --add-module=/usr/local/echo-nginx-module-0.61

#编译
make
```



### 2.4 nginx二进制文件操作

**备份原有文件**

```shell
mv /usr/sbin/nginx{,.bak}
```



**拷贝新文件**

```sh
cp nginx-1.16.1/objs/nginx /usr/sbin
```



### 2.5 编译nginx配置文件以测试模块安装是否成功

```nginx
server {
    listen 88;
    server_name _;  
  
    location /test {
        echo "This is default location";
        echo "uri: ${uri}";
    }
}  
```



:::caution

**<span style={{color: 'red'}}>⚠️因为是rpm包安装的nginx，因此需要使用systemctl命名重启一下nginx</span>**

:::

```shell
systemctl restart nginx
```



**检测nginx语法并重载nginx**

这里语法不报错就证明第三方模块echo安装成功了

```shell
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

$ nginx -s reload
```



**本机访问测试**

```shell
$ curl 127.0.0.1:88/test
This is default location
uri: /test
```



