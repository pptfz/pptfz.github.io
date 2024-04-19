# nginx解决重定向后https变http问题

## 问题背景

php项目 [baikal](https://github.com/sabre-io/Baikal) 部署在k8s中，采取的方式是通过统一入口的nginx转发至pod中(由于历史原因，只能采取此方式)，pod中部署php和nginx，统一入口的nginx配置文件如下

```nginx
upstream baikal {
  server 10.10.10.10;
}

server {
    listen 80;
    server_name domain;
    rewrite (.*) https://$server_name$request_uri redirect;
}

server {
    listen       443 ssl;
    include      trace.setting;
    server_name  stage-baikal.vipkid-qa.com.cn;
    ssl_certificate      /etc/nginx/ssl-qa/domain.crt;
    ssl_certificate_key  /etc/nginx/ssl-qa/domain.key;
    ssl_session_cache shared:SSL:16m;
    ssl_session_timeout  10m;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass         http://baikal;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header   X-Request-ID $request_trace_id;
        proxy_set_header   X-Request-Seq $request_trace_seq;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_redirect          http:// https://;
        proxy_set_header        X-Forwarded-Proto $scheme; 
    }
}
```



pod中nginx配置如下

```sh
server {
  listen 80;
  server_name domain;

  root   /path/to/html;
  index index.php;

  rewrite ^/.well-known/caldav /dav.php redirect;
  rewrite ^/.well-known/carddav /dav.php redirect;

  charset utf-8;

  location ~ /(\.ht|Core|Specific|config) {
    deny all;
    return 404;
  }

  location ~ ^(.+\.php)(.*)$ {
    try_files $fastcgi_script_name =404;
    include        /etc/nginx/fastcgi_params;
    fastcgi_split_path_info  ^(.+\.php)(.*)$;
    #fastcgi_pass   unix:/var/run/php-fpm.sock;
    fastcgi_pass  127.0.0.1:9000;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    fastcgi_param  PATH_INFO        $fastcgi_path_info;
    fastcgi_param  RUN_ENV 'prod';
  }
}
```





## 问题

因为统一入口nginx中做了443强制跳转，但是后端upstream是http，因此就会出现https访问后样式丢失

前端样式丢失

![iShot_2024-04-11_15.41.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-04-11_15.41.31.png)



正常样式

![iShot_2024-04-11_17.49.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-04-11_17.49.11.png)

## 解决方法

解决nginx重新向后https变http问题的方法就是设置一个 `X-Forwarded-Proto` 请求头

在 Nginx 中，`$scheme` 变量是一个内置变量，用于表示请求的协议部分，即 `http` 或 `https`。这个变量的值由 Nginx 根据请求的实际协议自动设置。如果请求使用的是 HTTPS 协议，则 `$scheme` 的值为 `https`，否则为 `http`。在使用 `proxy_set_header X-Forwarded-Proto $scheme;` 这样的指令时，Nginx 将自动替换 `$scheme` 变量的值为请求的实际协议，然后将 `X-Forwarded-Proto` 头的值设置为这个协议。这样后端服务器就能够根据请求的协议来做出相应的处理。

```nginx
# $scheme会根据请求的协议自动变更
proxy_set_header        X-Forwarded-Proto $scheme; 

# 手动指定协议
proxy_set_header        X-Forwarded-Proto https;
```





在istio中的vs写法如下

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  creationTimestamp: "2024-04-10T10:59:02Z"
  generation: 1
  name: vs名称
  namespace: ratel
  resourceVersion: "269545003"
  uid: 42587454-7f95-4622-8ec3-e6bb0788315b
spec:
  gateways:
  - istio网关名称
  hosts:
  - 域名
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: 服务svc名称
      headers:
        request:
          set:
            X-Forwarded-Proto: "https"
```



标准写法如下

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  creationTimestamp: "2024-04-10T10:59:02Z"
  generation: 1
  name: vs名称
  namespace: ratel
  resourceVersion: "269545003"
  uid: 42587454-7f95-4622-8ec3-e6bb0788315b
spec:
  gateways:
  - istio网关名称
  hosts:
  - 域名
  http:
  - match:
    - name: 服务svc名称
      uri:
        prefix: /
    route:
    - destination:
        host: 服务svc名称
```

