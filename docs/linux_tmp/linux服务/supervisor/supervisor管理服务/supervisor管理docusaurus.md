# supervisor管理docusaurus

supervisor配置文件 `/etc/supervisor/supervisord.conf` 中定义了include，因此如果想要管理服务，就需要编辑 `/etc/supervisor/config.d/*.ini` 文件

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



:::tip 说明

[docusaurus](https://github.com/facebook/docusaurus) 是facebook开源的网站构建工具

:::



编辑docusaurus服务配置文件 `/etc/supervisor/config.d/docusaurus.ini`

```ini
cat > /etc/supervisor/config.d/php72.ini <<'EOF'
[program:docusaurus]
command=yarn run start
directory=/docusaurus
environment=PATH=/root/.nvm/versions/node/v16.17.0/bin:%(ENV_PATH)s
user=root
stdout_logfile=/var/log/supervisor/docusaurus.log
redirect_stderr=true
autostart=true
autorestart=true
EOF
```



:::tip 说明

docusaurus需要 [node.js](https://nodejs.org/en/download/) v16.14 或以上版本，机器上的node是通过 [nvm](https://github.com/nvm-sh/nvm) (node多版本管理工具) 安装的，安装的node路径为 `root/.nvm/versions/node/v16.17.0` ，因此需要在 `ini` 文件中通过 `environment` 来指定环境变量

```shell
environment=PATH=/root/.nvm/versions/node/v16.17.0/bin:%(ENV_PATH)s
```

:::





将docusaurus加入supervisor

```shell
$ supervisorctl update docusaurus
docusaurus: added process group
```



查看状态

```shell
$ supervisorctl status docusaurus
docusaurus                       RUNNING   pid 11037, uptime 0:00:16
```



