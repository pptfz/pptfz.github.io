# jenkins使用nginx反向代理报错



[jenkins官方说明文档](https://www.jenkins.io/doc/book/system-administration/reverse-proxy-configuration-troubleshooting/)



jenkins使用nginx做反向代理，jenkins中提示如下

![iShot2021-10-19 15.07.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-19 15.07.27.png)



原先nginx配置如下

```nginx
server {
  listen 80;
  server_name jenkins.xxx.com;
  rewrite ^(.*) https://$server_name$1 permanent;
}

server {
  listen 443 ssl;
  server_name jenkins.xxx.com;
  ssl_certificate ssl/xxx.com.pem;
  ssl_certificate_key ssl/xxx.com.key;
  ssl_session_timeout 5m;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_hide_header Server;
    proxy_redirect off;
  }  
}
```



修改nginx配置为如下

> 注意 `root /var/lib/jenkins/;` 配置，如果修改了jenkins主目录地址则需要修改为相应地址

```nginx
upstream jenkins {
  keepalive 32; # keepalive connections
  server 127.0.0.1:8080; # jenkins ip and port
}

# Required for Jenkins websocket agents
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  listen 80;
  server_name jenkins.xxx.com;
  return 302 https://$server_name$request_uri;
}

server {
  listen 443 ssl;    
  server_name jenkins.xxx.com;  
  # this is the jenkins web root directory
  # (mentioned in the /etc/default/jenkins file)
  root /var/run/jenkins/war/;
  access_log /var/log/jenkins/jenkins.xxx.com.access.log;
  error_log /var/log/jenkins/jenkins.xxx.com.error.log;
  ssl_certificate ssl/xxx.com.pem;
  ssl_certificate_key ssl/xxx.com.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

  # pass through headers from Jenkins that Nginx considers invalid
  ignore_invalid_headers off;

  location ~ "^/static/[0-9a-fA-F]{8}\/(.*)$" {
    # rewrite all static files into requests to the root
    # E.g /static/12345678/css/something.css will become /css/something.css
    rewrite "^/static/[0-9a-fA-F]{8}\/(.*)" /$1 last;
  }

  location /userContent {
    # have nginx handle all the static requests to userContent folder
    # note : This is the $JENKINS_HOME dir
    root /var/lib/jenkins/;
    if (!-f $request_filename){
      # this file does not exist, might be a directory or a /**view** url
      rewrite (.*) /$1 last;
      break;
    }
    sendfile on;
  }

  location / {
      sendfile off;
      proxy_pass         http://jenkins;
      proxy_redirect     default;
      proxy_http_version 1.1;

      # Required for Jenkins websocket agents
      proxy_set_header   Connection        $connection_upgrade;
      proxy_set_header   Upgrade           $http_upgrade;

      proxy_set_header   Host              $host;
      proxy_set_header   X-Real-IP         $remote_addr;
      proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header   X-Forwarded-Proto $scheme;
      proxy_max_temp_file_size 0;

      #this is the maximum upload size
      client_max_body_size       10m;
      client_body_buffer_size    128k;

      proxy_connect_timeout      90;
      proxy_send_timeout         90;
      proxy_read_timeout         90;
      proxy_buffering            off;
      proxy_request_buffering    off; # Required for HTTP CLI commands
      proxy_set_header Connection ""; # Clear for keepalive
  }
}
```

