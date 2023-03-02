# nginx解决非80端口https问题

解决思路：
监听80端口，80重定向到https443端口，443端口代理别的端口
```nginx
server {
  listen 80;
  server_name pan.pptfz.top;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;

  server_name pan.pptfz.top;
  if ($host != 'pan.pptfz.top') {
    rewrite ^(.*)$ https://pan.pptfz.top/$1 permanent;
  }

  if ($request_uri ~ "^[^?]*//") {
    rewrite "(.*)" $scheme://$host$1 permanent;
  }

  location / {
    try_files /_not_exists_ @backend;
  }

  location @backend {
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_pass http://127.0.0.1:5212;
  }

  access_log /var/log/nginx/pan.pptfz.top.access.log main;
  error_log /var/log/nginx/pan.pptfz.top.error.log;
  ssl_certificate /etc/nginx/ssl_key/pan/3356127_pan.pptfz.top.pem;
  ssl_certificate_key /etc/nginx/ssl_key/pan/3356127_pan.pptfz.top.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

}
```
