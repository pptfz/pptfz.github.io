[toc]

# nginx locaiton匹配实际应用场景



有这么一种场景，一些服务安装启动后，访问的的url是这样的 `IP:端口/xxx`，例如 [zabbix](https://github.com/zabbix/zabbix)，访问的url是 `IP:端口/zabbix`，还有 [dolphinscheduler](https://github.com/apache/incubator-dolphinscheduler)，访问的url是 `IP:12345/dolphinscheduler`，这个是服务源码路由写死的，不可以更改，zabbix还好，单词可以记住，但是 dolphinscheduler 实在是记不住，那现在就想配置直接以域名的形式访问，然后自动匹配后边的uir，例如访问zabbix，直接输入设置的域名 `zabbix.ac.com` ，然后跳转到 `zabbix.abc.com/zabbix` ，在nginx中需要做如下配置



zabbix配置示例

```nginx
server {
  listen 80;
  server_name zabbix.abc.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name zabbix.abc.com;
  client_max_body_size 10240m;

  location / {
    proxy_pass http://127.0.0.1:81/zabbix;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_hide_header Server;
    proxy_redirect off;

    location /zabbix {
        proxy_pass http://127.0.0.1:81;
    }
  }

  access_log /var/log/zabbix/zabbix.abc.com.access.log;
  error_log /var/log/zabbix/zabbix.abc.com.error.log;
  ssl_certificate ssl_key/zabbix/1_zabbix.abc.com.pem;
  ssl_certificate_key ssl_key/zabbix/2_zabbix.abc.com.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
```





dolphinscheduler配置示例

```nginx
server {
  listen 80;
  server_name ds.abc.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name ds.abc.com;
  client_max_body_size 10240m;

  location / {
    proxy_pass http://127.0.0.1:12345/dolphinscheduler/;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_hide_header Server;
    proxy_redirect off;

    location /dolphinscheduler {
        proxy_pass http://127.0.0.1:12345;
    }
  }

  access_log /var/log/ds/ds.abc.com.access.log;
  error_log /var/log/ds/ds.abc.com.error.log;
  ssl_certificate ssl_key/1_ds.abc.com_bundle.crt;
  ssl_certificate_key ssl_key/2_ds.abc.com.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
```





配置模版，配置为location中套location，注意两个location中的 `proxy_pass` 后的IP和端口要一致

```nginx
location / {
    proxy_pass http://127.0.0.1:12345/xxx/;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_hide_header Server;
    proxy_redirect off;

    location /xxx {
        proxy_pass http://127.0.0.1:12345;
    }
  }
```

