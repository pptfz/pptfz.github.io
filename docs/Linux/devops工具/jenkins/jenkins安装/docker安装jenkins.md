# docker安装jenkins

**docker jenkins 中国定制版说明**

> **jenkins安装插件的时候由于源在国外，因此安装会非常慢甚至失败，当然也有国内源可以使用，但是需要自行修改文件，[jenkins中文社区](http://jenkins-zh.cn/)推出了中国定制版的jenkins docker镜像，只需要下载相应的docker镜像并启动容器即可，不需要做任何修改操作，并且安装后jenkins插件下载速度有明显的提升**



[docker jenkins中国定制版 dockerhub地址](https://hub.docker.com/r/jenkinszh/jenkins-zh)

[docker jenkins中国定制版 github地址](https://github.com/jenkins-zh/jenkins-formulas)

[jenkins中文社区维护的中文简体插件](https://github.com/jenkinsci/localization-zh-cn-plugin)

[jenkins插件下载地址](http://updates.jenkins-ci.org/download/plugins/)

---



**直接使用jenkins中国定制版镜像启动容器**

```sh
docker run \
  -u root \
  -d \
  -h jenkins \
  --name jenkins \
  -p 8081:8080 \
  -p 50000:50000 \
  -v /usr/local/jenkins:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkinszh/jenkins-zh:2.239
```



登陆jenkins后会提示jenkins反向代理配置错误，参考 [官方提供的nginx配置](https://www.jenkins.io/doc/book/system-administration/reverse-proxy-configuration-nginx/) 即可

```nginx
upstream jenkins {
  keepalive 32; # keepalive connections
  server 127.0.0.1:8081; # jenkins ip and port
}

# Required for Jenkins websocket agents
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  listen 80;
  server_name jenkins.abc.com;
  return 302 https://$server_name$request_uri;
}

server {
  listen 443 ssl;    

  server_name jenkins.abc.com;  

  # this is the jenkins web root directory
  # (mentioned in the /etc/default/jenkins file)
  root            /var/run/jenkins/war/;

  access_log /var/log/jenkins/jenkins.abc.com.access.log;
  error_log /var/log/jenkins/jenkins.abc.com.error.log;
  ssl_certificate ssl_key/aldwx/1_abc.com_bundle.crt;
  ssl_certificate_key ssl_key/aldwx/2_abc.com.key;
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




