# supervisor管理nginx

**supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑nginx服务配置文件 `/etc/supervisor/config.d/nginx.ini`**

:::caution

⚠️需要注意的是 `/usr/sbin/nginx` 表示在后台运行，但是**<span style={{color: 'red'}}>supervisor不能监控后台程序</span>**， 所以supervisor就一直执行这个命令 ，因此会报错

:::

`/usr/sbin/nginx `后必须加参数  `-g 'daemon off;'`  表示在前台运行

```shell
cat > /etc/supervisor/config.d/nginx.ini <<EOF
[program:nginx]
# use default nginx config file and dir
command = `which nginx` -g 'daemon off;'
stdout_logfile = /var/log/supervisor/nginx.log
redirect_stderr = true
autorestart = true
EOF
```





**将nginx加入supervisor**

```shell
$ supervisorctl update nginx
nginx: added process group
```



**查看状态**

```shell
$ supervisorctl status nginx
nginx           RUNNING   pid 9464, uptime 0:00:03
```



---

**详细配置**

```shell
[program:nginx]
# use default nginx config file and dir
command = /usr/local/nginx/sbin/nginx -g 'daemon off;'
stdout_logfile = /var/log/supervisord/nginx.log
redirect_stderr = true
autorestart = true
```



**nginx配置文件**

```nginx
#user  www www;
worker_processes auto;
# worker_cpu_affinity auto;	# openresty-1.9.15
worker_rlimit_nofile 65535;

error_log  logs/error.log;
pid        /var/run/nginx.pid;

events {
    use epoll;
    worker_connections  65565;
}

http {

    server_tokens off;
    sendfile on;
    tcp_nodelay on;
    tcp_nopush on;
    keepalive_timeout  0;
    charset utf-8;

    include mime.types;
    default_type application/json;

    log_format  main  ' $http_X_Forwarded_Proto - $http_SLB_IP - $upstream_addr - $http_X_Forwarded_For - '
                      '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status [$upstream_response_time]  '
                      '[$request_time] $body_bytes_sent "$http_referer" '
                      '"$http_user_agent"';
    client_header_buffer_size 16k;
    large_client_header_buffers 8 16k;
    server_names_hash_bucket_size 128;
    client_max_body_size 4096m;

    client_header_timeout 30s;
    client_body_timeout 30s;
    send_timeout 30s;
    lingering_close off;

    gzip on;
    gzip_vary on;
    gzip_min_length  1000;
    gzip_comp_level  6;
    gzip_types text/plain text/xml text/css application/javascript application/json;
    gzip_http_version 1.0;

    #index index.html index.shtml index.php;


	include upstream.conf;
	include default.conf;
	include vhosts/*.conf;
        include vhosts/jr/*.conf;
        include vhosts/yg/*.conf;
        include vhosts/yjk/*.conf;
        include vhosts/ys/*.conf;
        include vhosts/sec/*.conf;
        include vhosts/saas/*.conf;
        include vhosts/bd/*.conf;
        include vhosts/autom/*.conf;


    lua_code_cache on;
    lua_package_path "../?.lua;../lib/?.lua;../lib/lua-resty-core/lib/?.lua;;";
    lua_need_request_body on;

}
```

