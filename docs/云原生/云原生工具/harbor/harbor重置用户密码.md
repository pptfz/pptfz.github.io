# harbor重置用户密码

先进入到 `harbor-db` 容器中

```shell
docker exec -it harbor-db bash
```



登陆到pg数据库

```shell
postgres [ / ]$ psql -U postgres
```



列出所有数据库

```postgresql
registry=# \l
                                   List of databases
     Name     |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
--------------+----------+----------+-------------+-------------+-----------------------
 notaryserver | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =Tc/postgres         +
              |          |          |             |             | postgres=CTc/postgres+
              |          |          |             |             | server=CTc/postgres
 notarysigner | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =Tc/postgres         +
              |          |          |             |             | postgres=CTc/postgres+
              |          |          |             |             | signer=CTc/postgres
 postgres     | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 registry     | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0    | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
              |          |          |             |             | postgres=CTc/postgres
 template1    | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
              |          |          |             |             | postgres=CTc/postgres
(6 rows)
```



切换数据库为 `registry`

```postgresql
registry=# \c registry
You are now connected to database "registry" as user "postgres".
```



查看表

```postgresql
registry=# \dt
                    List of relations
 Schema |            Name             | Type  |  Owner   
--------+-----------------------------+-------+----------
 public | access                      | table | postgres
 public | alembic_version             | table | postgres
 public | artifact                    | table | postgres
 public | artifact_accessory          | table | postgres
 public | artifact_blob               | table | postgres
 public | artifact_reference          | table | postgres
 public | artifact_trash              | table | postgres
 public | audit_log                   | table | postgres
 public | blob                        | table | postgres
 public | cve_allowlist               | table | postgres
 public | data_migrations             | table | postgres
 public | execution                   | table | postgres
 public | harbor_label                | table | postgres
 public | harbor_resource_label       | table | postgres
 public | harbor_user                 | table | postgres
 ......
```



设置为扩展显示模式，类似于mysql中的 `\G` ，这样会将每一行记录以列对齐的方式显示，要取消再次执行即可

```postgresql
registry=# \x
Expanded display is on.
```



查看 `admin` 用户的信息

```postgresql
registry=# SELECT * FROM harbor_user WHERE username = 'admin';
-[ RECORD 1 ]----+---------------------------------
user_id          | 1
username         | admin
email            | 
password         | ee810f7afad80666ea5d722bbb8a8633
realname         | system admin
comment          | admin user
deleted          | f
reset_uuid       | 
salt             | abcaZBablla9aT1aAAAMKCDcuBZt6vIp
sysadmin_flag    | t
creation_time    | 2024-09-11 05:46:38.458293
update_time      | 2024-09-11 05:46:39.211843
password_version | sha256
```



修改用户密码

可以参考 [github issue](https://github.com/goharbor/harbor/issues/8778)

:::tip 说明

使用如下命令将 `admin` 用户的密码修改为 `Harbor12345`

:::

```postgresql
registry=# update harbor_user set salt='J6Duybf2UcRhKchR06VbJWimv31xrlnN', password='d5942a4407756fee428ec889cb9c4830' where username = 'admin';
```





也可以使用如下方式来修改用户名密码

```shell
curl -X PUT "https://harbor地址//api/v2.0/users/5/password" \
-H "Content-Type: application/json" \
-u "admin用户名:admin用户密码" \
-k \
-d '{"new_password": "要修改的密码"}'
```



