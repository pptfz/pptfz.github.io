# mac安装nginx

## 安装

```bash
$ brew install nginx
==> Fetching dependencies for nginx: pcre2
==> Fetching pcre2
==> Downloading https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/pcre2-10.4
######################################################################### 100.0%
==> Fetching nginx
==> Downloading https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/nginx-1.27
######################################################################### 100.0%
==> Installing dependencies for nginx: pcre2
==> Installing nginx dependency: pcre2
==> Pouring pcre2-10.44.arm64_sonoma.bottle.tar.gz
🍺  /opt/homebrew/Cellar/pcre2/10.44: 237 files, 6.3MB
==> Installing nginx
==> Pouring nginx-1.27.0.arm64_sonoma.bottle.tar.gz
==> Caveats
Docroot is: /opt/homebrew/var/www

The default port has been set in /opt/homebrew/etc/nginx/nginx.conf to 8080 so that
nginx can run without sudo.

nginx will load all files in /opt/homebrew/etc/nginx/servers/.

To start nginx now and restart at login:
  brew services start nginx
Or, if you don't want/need a background service you can just run:
  /opt/homebrew/opt/nginx/bin/nginx -g daemon\ off\;
==> Summary
🍺  /opt/homebrew/Cellar/nginx/1.27.0: 27 files, 2.4MB
==> Running `brew cleanup nginx`...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
==> Caveats
==> nginx
Docroot is: /opt/homebrew/var/www

The default port has been set in /opt/homebrew/etc/nginx/nginx.conf to 8080 so that
nginx can run without sudo.

nginx will load all files in /opt/homebrew/etc/nginx/servers/.

To start nginx now and restart at login:
  brew services start nginx
Or, if you don't want/need a background service you can just run:
  /opt/homebrew/opt/nginx/bin/nginx -g daemon\ off\;
```



## 相关命令

### 启动nginx

:::tip 说明

如果不想让Nginx作为后台服务运行，而是手动启动它，可以使用以下命令

```shell
/opt/homebrew/opt/nginx/bin/nginx -g 'daemon off;'
```



使用如下命令可以启动nginx并设置为开机自启

```bash
brew services start nginx
```

:::

```shell
$ brew services start nginx
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
```



### 停止nginx

:::tip 说明

执行如下命令停止nginx的同时并取消开机自启，如果执行了  `nginx -g 'daemon off` 手动启动了nginx，则可以使用如下命令停止nginx

```shell
nginx -s stop
```

:::

```shell
$ brew services stop nginx
Stopping `nginx`... (might take a while)
==> Successfully stopped `nginx` (label: homebrew.mxcl.nginx)
```



### 重启nginx

```shell
$ brew services restart nginx
Stopping `nginx`... (might take a while)
==> Successfully stopped `nginx` (label: homebrew.mxcl.nginx)
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
```



### 查看服务状态

```shell
$ brew services list
Name  Status  User  File
nginx started pptfz ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist
```



## 相关目录

| 相关目录                      | 说明                    |
| ----------------------------- | ----------------------- |
| `/opt/homebrew/etc/nginx`     | nginx安装目录           |
| `/opt/homebrew/opt/nginx/bin` | nginx命令二进制文件目录 |
| `/opt/homebrew/var/www`       | 默认root根目录          |







