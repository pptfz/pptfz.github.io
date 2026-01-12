# postgres安装

[pg官网](https://www.postgresql.org/)

[pg github](https://github.com/postgres/postgres)

[pg官方文档](https://www.postgresql.org/docs/)





## docker安装

[docker安装官方文档](https://github.com/docker-library/docs/blob/master/postgres/README.md)



### 支持的环境变量

| 变量名                      | 说明                                                         | 是否必须 |
| --------------------------- | ------------------------------------------------------------ | -------- |
| `POSTGRES_PASSWORD`         | 设置 PostgreSQL **超级用户的密码**                           | ✅        |
| `POSTGRES_USER`             | 如果未指定则使用默认超级用户 `postgres`                      | ❌        |
| `POSTGRES_DB`               | 指定 **初始化时创建的默认数据库名**，如果未指定，则使用`POSTGRES_USER`的值 | ❌        |
| `POSTGRES_INITDB_ARGS`      | 给 `postgres initdb` 传额外参数，开启数据页校验（提高数据安全） | ❌        |
| `POSTGRES_INITDB_WALDIR`    | 定义Postgres事务日志存放路径，默认情况下，事务日志存储在主 Postgres 数据文件夹的子目录中，⚠️PostgreSQL 9.x 里变量名叫 `POSTGRES_INITDB_XLOGDIR` | ❌        |
| `POSTGRES_HOST_AUTH_METHOD` | 用于控制`auth-method`，用于`host`连接，适用于`all`数据库、`all`用户和`all`地址。如果未指定，则使用 `scram-sha-256` 密码认证（14+ 版本;旧版本为 `md5`） | ❌        |
| `PGDATA`                    | pg的数据持久化目录为 `/var/lib/postgresql/data` ，从 **PostgreSQL 18 起** ，变成了 `/var/lib/postgresql/<version>/docker` | ❌        |





import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="docker" label="docker" default>

```shell
docker run -d \
  --name postgres \
  --hostname pg-db-01 \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=123456 \
  -v /data/docker-volume/pg:/var/lib/postgresql/data \
  --restart always \
  postgres:17.1
```

  </TabItem>
  <TabItem value="docker compose" label="docker compose">

:::caution 注意

pg18之前的版本，容器内数据目录为 `/var/lib/postgresql/data` ，从18版本以后，数据目录变成了 `/var/lib/postgresql/<version>/docker` ，例如18是 `/var/lib/postgresql/18/docker` ，19是 `/var/lib/postgresql/19/docker`

:::

```yaml
services:
  postgres:
    image: postgres:18.1
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: 123456
    volumes:
      - /data/docker-volume/pg:/var/lib/postgresql/18/docker
    restart: always
```

  </TabItem>
</Tabs>



## 包管理器安装

[包管理器安装官方文档](https://www.postgresql.org/download/linux/)



可以在这里选择操作系统，架构以及软件版本

![iShot_2026-01-08_10.38.24](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-08_10.38.24.png)



### rpm

安装软件源

```shell
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-10-aarch64/pgdg-redhat-repo-latest.noarch.rpm
```



安装

```sh
dnf install -y postgresql18-server
```



初始化

```shell
/usr/pgsql-18/bin/postgresql-18-setup initdb
```



启动服务并加入开机自启

```shell
systemctl enable postgresql-18
systemctl start postgresql-18
```



#### 连接pg

切换用户

```sh
su - postgres 
```



连接pg

```shell
$ psql
psql (18.1)
Type "help" for help.

postgres=# 
```







## 二进制安装

[二进制安装官方文档](https://www.postgresql.org/docs/current/install-binaries.html)







## 源码安装