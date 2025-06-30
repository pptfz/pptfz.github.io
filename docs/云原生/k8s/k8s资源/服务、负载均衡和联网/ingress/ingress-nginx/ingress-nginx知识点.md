# ingress-nginx知识点

## ingress-nginx和ingress资源对象配置文件

安装完 `ingress-nginx` 后pod  `ingress-nginx-controller` 中 `nginx.conf` 默认内容如下

:::tip 说明

版本信息

```shell
nginx version: 1.25.5
ingress-nginx version: 1.12.1
```

:::

```nginx
# Configuration checksum: 5614408776675212693

# setup custom paths that do not require root access
pid /tmp/nginx/nginx.pid;

daemon off;

worker_processes 12;

worker_rlimit_nofile 1047552;

worker_shutdown_timeout 240s ;

events {
	multi_accept        on;
	worker_connections  16384;
	use                 epoll;
	
}

http {
	
	lua_package_path "/etc/nginx/lua/?.lua;;";
	
	lua_shared_dict balancer_ewma 10M;
	lua_shared_dict balancer_ewma_last_touched_at 10M;
	lua_shared_dict balancer_ewma_locks 1M;
	lua_shared_dict certificate_data 20M;
	lua_shared_dict certificate_servers 5M;
	lua_shared_dict configuration_data 20M;
	lua_shared_dict ocsp_response_cache 5M;
	
	lua_shared_dict luaconfig 5m;
	
	init_by_lua_file /etc/nginx/lua/ngx_conf_init.lua;
	
	init_worker_by_lua_file /etc/nginx/lua/ngx_conf_init_worker.lua;
	
	aio                 threads;
	
	aio_write           on;
	
	tcp_nopush          on;
	tcp_nodelay         on;
	
	log_subrequest      on;
	
	reset_timedout_connection on;
	
	keepalive_timeout  75s;
	keepalive_requests 1000;
	
	client_body_temp_path           /tmp/nginx/client-body;
	fastcgi_temp_path               /tmp/nginx/fastcgi-temp;
	proxy_temp_path                 /tmp/nginx/proxy-temp;
	
	client_header_buffer_size       1k;
	client_header_timeout           60s;
	large_client_header_buffers     4 8k;
	client_body_buffer_size         8k;
	client_body_timeout             60s;
	
	http2_max_concurrent_streams    128;
	
	types_hash_max_size             2048;
	server_names_hash_max_size      1024;
	server_names_hash_bucket_size   32;
	map_hash_bucket_size            64;
	
	proxy_headers_hash_max_size     512;
	proxy_headers_hash_bucket_size  64;
	
	variables_hash_bucket_size      256;
	variables_hash_max_size         2048;
	
	underscores_in_headers          off;
	ignore_invalid_headers          on;
	
	limit_req_status                503;
	limit_conn_status               503;
	
	include /etc/nginx/mime.types;
	default_type text/html;
	
	# Custom headers for response
	
	server_tokens off;
	
	more_clear_headers Server;
	
	# disable warnings
	uninitialized_variable_warn off;
	
	# Additional available variables:
	# $namespace
	# $ingress_name
	# $service_name
	# $service_port
	log_format upstreaminfo '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id';
	
	map $request_uri $loggable {
		
		default 1;
	}
	
	access_log /var/log/nginx/access.log upstreaminfo  if=$loggable;
	
	error_log  /var/log/nginx/error.log notice;
	
	resolver 10.96.0.10 valid=30s;
	
	# See https://www.nginx.com/blog/websocket-nginx
	map $http_upgrade $connection_upgrade {
		default          upgrade;
		
		# See http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive
		''               '';
		
	}
	
	# Reverse proxies can detect if a client provides a X-Request-ID header, and pass it on to the backend server.
	# If no such header is provided, it can provide a random value.
	map $http_x_request_id $req_id {
		default   $http_x_request_id;
		
		""        $request_id;
		
	}
	
	# Create a variable that contains the literal $ character.
	# This works because the geo module will not resolve variables.
	geo $literal_dollar {
		default "$";
	}
	
	server_name_in_redirect off;
	port_in_redirect        off;
	
	ssl_protocols TLSv1.2 TLSv1.3;
	
	ssl_early_data off;
	
	# turn on session caching to drastically improve performance
	
	ssl_session_cache shared:SSL:10m;
	ssl_session_timeout 10m;
	
	# allow configuring ssl session tickets
	ssl_session_tickets off;
	
	# slightly reduce the time-to-first-byte
	ssl_buffer_size 4k;
	
	# allow configuring custom ssl ciphers
	ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
	ssl_prefer_server_ciphers on;
	
	ssl_ecdh_curve auto;
	
	# PEM sha: 4ccec0835e32e4833e59ab78d7836a764dd6db16
	ssl_certificate     /etc/ingress-controller/ssl/default-fake-certificate.pem;
	ssl_certificate_key /etc/ingress-controller/ssl/default-fake-certificate.pem;
	
	proxy_ssl_session_reuse on;
	
	upstream upstream_balancer {
		### Attention!!!
		#
		# We no longer create "upstream" section for every backend.
		# Backends are handled dynamically using Lua. If you would like to debug
		# and see what backends ingress-nginx has in its memory you can
		# install our kubectl plugin https://kubernetes.github.io/ingress-nginx/kubectl-plugin.
		# Once you have the plugin you can use "kubectl ingress-nginx backends" command to
		# inspect current backends.
		#
		###
		
		server 0.0.0.1; # placeholder
		
		balancer_by_lua_file /etc/nginx/lua/nginx/ngx_conf_balancer.lua;
		
		keepalive 320;
		keepalive_time 1h;
		keepalive_timeout  60s;
		keepalive_requests 10000;
		
	}
	
	# Cache for internal auth checks
	proxy_cache_path /tmp/nginx/nginx-cache-auth levels=1:2 keys_zone=auth_cache:10m max_size=128m inactive=30m use_temp_path=off;
	
	# Global filters
	
	## start server _
	server {
		server_name _ ;
		
		http2 on;
		
		listen 80 default_server reuseport backlog=4096 ;
		listen [::]:80 default_server reuseport backlog=4096 ;
		listen 443 default_server reuseport backlog=4096 ssl;
		listen [::]:443 default_server reuseport backlog=4096 ssl;
		
		set $proxy_upstream_name "-";
		
		ssl_reject_handshake off;
		
		ssl_certificate_by_lua_file /etc/nginx/lua/nginx/ngx_conf_certificate.lua;
		
		location / {
			
			set $namespace      "";
			set $ingress_name   "";
			set $service_name   "";
			set $service_port   "";
			set $location_path  "";
			
			set $force_ssl_redirect "false";
			set $ssl_redirect "false";
			set $force_no_ssl_redirect "false";
			set $preserve_trailing_slash "false";
			set $use_port_in_redirects "false";
			
			rewrite_by_lua_file /etc/nginx/lua/nginx/ngx_rewrite.lua;
			
			header_filter_by_lua_file /etc/nginx/lua/nginx/ngx_conf_srv_hdr_filter.lua;
			
			log_by_lua_file /etc/nginx/lua/nginx/ngx_conf_log_block.lua;
			
			access_log off;
			
			port_in_redirect off;
			
			set $balancer_ewma_score -1;
			set $proxy_upstream_name "upstream-default-backend";
			set $proxy_host          $proxy_upstream_name;
			set $pass_access_scheme  $scheme;
			
			set $pass_server_port    $server_port;
			
			set $best_http_host      $http_host;
			set $pass_port           $pass_server_port;
			
			set $proxy_alternative_upstream_name "";
			
			client_max_body_size                    1m;
			
			proxy_set_header Host                   $best_http_host;
			
			# Pass the extracted client certificate to the backend
			
			# Allow websocket connections
			proxy_set_header                        Upgrade           $http_upgrade;
			
			proxy_set_header                        Connection        $connection_upgrade;
			
			proxy_set_header X-Request-ID           $req_id;
			proxy_set_header X-Real-IP              $remote_addr;
			
			proxy_set_header X-Forwarded-For        $remote_addr;
			
			proxy_set_header X-Forwarded-Host       $best_http_host;
			proxy_set_header X-Forwarded-Port       $pass_port;
			proxy_set_header X-Forwarded-Proto      $pass_access_scheme;
			proxy_set_header X-Forwarded-Scheme     $pass_access_scheme;
			
			proxy_set_header X-Scheme               $pass_access_scheme;
			
			# Pass the original X-Forwarded-For
			proxy_set_header X-Original-Forwarded-For $http_x_forwarded_for;
			
			# mitigate HTTPoxy Vulnerability
			# https://www.nginx.com/blog/mitigating-the-httpoxy-vulnerability-with-nginx/
			proxy_set_header Proxy                  "";
			
			# Custom headers to proxied server
			
			proxy_connect_timeout                   5s;
			proxy_send_timeout                      60s;
			proxy_read_timeout                      60s;
			
			proxy_buffering                         off;
			proxy_buffer_size                       4k;
			proxy_buffers                           4 4k;
			
			proxy_max_temp_file_size                1024m;
			
			proxy_request_buffering                 on;
			proxy_http_version                      1.1;
			
			proxy_cookie_domain                     off;
			proxy_cookie_path                       off;
			
			# In case of errors try the next upstream server before returning an error
			proxy_next_upstream                     error timeout;
			proxy_next_upstream_timeout             0;
			proxy_next_upstream_tries               3;
			
			# Custom Response Headers
			
			proxy_pass http://upstream_balancer;
			
			proxy_redirect                          off;
			
		}
		
		# health checks in cloud providers require the use of port 80
		location /healthz {
			
			access_log off;
			return 200;
		}
		
		# this is required to avoid error if nginx is being monitored
		# with an external software (like sysdig)
		location /nginx_status {
			
			allow 127.0.0.1;
			
			allow ::1;
			
			deny all;
			
			access_log off;
			stub_status on;
		}
		
	}
	## end server _
	
	# backend for when default-backend-service is not configured or it does not have endpoints
	server {
		listen 8181 default_server reuseport backlog=4096;
		listen [::]:8181 default_server reuseport backlog=4096;
		set $proxy_upstream_name "internal";
		
		access_log off;
		
		location / {
			return 404;
		}
	}
	
	# default server, used for NGINX healthcheck and access to nginx stats
	server {
		# Ensure that modsecurity will not run on an internal location as this is not accessible from outside
		
		listen 127.0.0.1:10246;
		set $proxy_upstream_name "internal";
		
		keepalive_timeout 0;
		gzip off;
		
		access_log off;
		
		location /healthz {
			return 200;
		}
		
		location /is-dynamic-lb-initialized {
			content_by_lua_file /etc/nginx/lua/nginx/ngx_conf_is_dynamic_lb_initialized.lua;
		}
		
		location /nginx_status {
			stub_status on;
		}
		
		location /configuration {
			client_max_body_size                    21M;
			client_body_buffer_size                 21M;
			proxy_buffering                         off;
			
			content_by_lua_file /etc/nginx/lua/nginx/ngx_conf_configuration.lua;
		}
		
		location / {
			return 404;
		}
	}
}

stream {
	lua_package_path "/etc/nginx/lua/?.lua;/etc/nginx/lua/vendor/?.lua;;";
	
	lua_shared_dict tcp_udp_configuration_data 5M;
	
	resolver 10.96.0.10 valid=30s;
	
	init_by_lua_file /etc/nginx/lua/ngx_conf_init_stream.lua;
	
	init_worker_by_lua_file /etc/nginx/lua/nginx/ngx_conf_init_tcp_udp.lua;
	
	lua_add_variable $proxy_upstream_name;
	
	log_format log_stream '[$remote_addr] [$time_local] $protocol $status $bytes_sent $bytes_received $session_time';
	
	access_log /var/log/nginx/access.log log_stream ;
	
	error_log  /var/log/nginx/error.log notice;
	
	upstream upstream_balancer {
		server 0.0.0.1:1234; # placeholder
		balancer_by_lua_file /etc/nginx/lua/nginx/ngx_conf_balancer_tcp_udp.lua;
	}
	
	server {
		listen 127.0.0.1:10247;
		
		access_log off;
		
		content_by_lua_file /etc/nginx/lua/nginx/ngx_conf_content_tcp_udp.lua;
	}
	
	# TCP services
	
	# UDP services
	
	# Stream Snippets
	
}
```



ingress资源yaml文件

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    meta.helm.sh/release-name: grafana
    meta.helm.sh/release-namespace: monitor
  creationTimestamp: "2025-04-30T10:58:51Z"
  generation: 2
  labels:
    app.kubernetes.io/instance: grafana
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: grafana
    app.kubernetes.io/version: 11.6.1
    helm.sh/chart: grafana-8.14.0
  name: grafana
  namespace: monitor
  resourceVersion: "21153"
  uid: b7473919-481d-4d4c-bb38-5d474350e699
spec:
  ingressClassName: nginx
  rules:
  - host: grafana.ops.com
    http:
      paths:
      - backend:
          service:
            name: grafana
            port:
              number: 80
        path: /
        pathType: Prefix
status:
  loadBalancer:
    ingress:
    - hostname: localhost
```





创建ingress资源对象后，会在pod `ingress-nginx-controller` 中 `nginx.conf` 中新增如下内容

```nginx
## start server grafana.ops.com
server {
	server_name grafana.ops.com ;
	
	http2 on;
	
	listen 80  ;
	listen [::]:80  ;
	listen 443  ssl;
	listen [::]:443  ssl;
	
	set $proxy_upstream_name "-";
	
	ssl_certificate_by_lua_file /etc/nginx/lua/nginx/ngx_conf_certificate.lua;
	
	location / {
		
		set $namespace      "monitor";
		set $ingress_name   "grafana";
		set $service_name   "grafana";
		set $service_port   "80";
		set $location_path  "/";
		
		set $force_ssl_redirect "false";
		set $ssl_redirect "true";
		set $force_no_ssl_redirect "false";
		set $preserve_trailing_slash "false";
		set $use_port_in_redirects "false";
		
		rewrite_by_lua_file /etc/nginx/lua/nginx/ngx_rewrite.lua;
		
		header_filter_by_lua_file /etc/nginx/lua/nginx/ngx_conf_srv_hdr_filter.lua;
		
		log_by_lua_file /etc/nginx/lua/nginx/ngx_conf_log_block.lua;
		
		port_in_redirect off;
		
		set $balancer_ewma_score -1;
		set $proxy_upstream_name "monitor-grafana-80";
		set $proxy_host          $proxy_upstream_name;
		set $pass_access_scheme  $scheme;
		
		set $pass_server_port    $server_port;
		
		set $best_http_host      $http_host;
		set $pass_port           $pass_server_port;
		
		set $proxy_alternative_upstream_name "";
		
		client_max_body_size                    1m;
		
		proxy_set_header Host                   $best_http_host;
		
		# Pass the extracted client certificate to the backend
		
		# Allow websocket connections
		proxy_set_header                        Upgrade           $http_upgrade;
		
		proxy_set_header                        Connection        $connection_upgrade;
		
		proxy_set_header X-Request-ID           $req_id;
		proxy_set_header X-Real-IP              $remote_addr;
		
		proxy_set_header X-Forwarded-For        $remote_addr;
		
		proxy_set_header X-Forwarded-Host       $best_http_host;
		proxy_set_header X-Forwarded-Port       $pass_port;
		proxy_set_header X-Forwarded-Proto      $pass_access_scheme;
		proxy_set_header X-Forwarded-Scheme     $pass_access_scheme;
		
		proxy_set_header X-Scheme               $pass_access_scheme;
		
		# Pass the original X-Forwarded-For
		proxy_set_header X-Original-Forwarded-For $http_x_forwarded_for;
		
		# mitigate HTTPoxy Vulnerability
		# https://www.nginx.com/blog/mitigating-the-httpoxy-vulnerability-with-nginx/
		proxy_set_header Proxy                  "";
		
		# Custom headers to proxied server
		
		proxy_connect_timeout                   5s;
		proxy_send_timeout                      60s;
		proxy_read_timeout                      60s;
		
		proxy_buffering                         off;
		proxy_buffer_size                       4k;
		proxy_buffers                           4 4k;
		
		proxy_max_temp_file_size                1024m;
		
		proxy_request_buffering                 on;
		proxy_http_version                      1.1;
		
		proxy_cookie_domain                     off;
		proxy_cookie_path                       off;
		
		# In case of errors try the next upstream server before returning an error
		proxy_next_upstream                     error timeout;
		proxy_next_upstream_timeout             0;
		proxy_next_upstream_tries               3;
		
		# Custom Response Headers
		
		proxy_pass http://upstream_balancer;
		
		proxy_redirect                          off;
		
	}
	
}
## end server grafana.ops.com
```







