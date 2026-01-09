# pg配置文件

## 主配置文件

[postgresql.conf ](https://www.postgresql.org/docs/current/config-setting.html)

作用：

- 监听地址 / 端口
- 内存、并发
- 日志、WAL
- autovacuum 等

示例参数：

```ini
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
```





## 客户端认证与访问控制配置文件

[pg-hba-conf](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)



控制：

- 谁能连
- 从哪连
- 用什么认证方式

示例：

```ini
host all all 0.0.0.0/0 scram-sha-256
```













#### 配置远程连接

默认配置文件内容如下

```shell
$ egrep -v '^$|#' /var/lib/pgsql/18/data/postgresql.conf 
max_wal_size = 1GB
min_wal_size = 80MB
log_timezone = 'Asia/Shanghai'
datestyle = 'iso, dmy'
timezone = 'Asia/Shanghai'
default_text_search_config = 'pg_catalog.english'
```

