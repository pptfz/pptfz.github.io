# dify用户登陆报错

## 说明

| 组件  | 版本   |
| ----- | ------ |
| dify  | 1.11.4 |
| pg    | 15.15  |
| redis | 6.2.21 |



## 登陆报错

![iShot_2026-01-28_19.25.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-28_19.25.45.png)

```shell
Too many incorrect password attempts. Please try again later.
```



## 解决方法

[这里有个issue](https://github.com/langgenius/dify/issues/17939)



进入redis容器并连接redis

```shell
docker exec -it docker-redis-1 redis-cli 
```



查看登陆相关的key

```shell
KEYS "*login*"
```



然后把被锁的用户的key删除即可

```shell
DEL login_error_rate_limit:xxx@xxx.com
```



## 小插曲

从管理后台查看到某个用户是 `等待中` 状态，在数据库中查看是 `pending` 状态，需要先修改用户状态为 `active`

:::tip pg相关命令

查看库

```postgresql
\l
```



切换库

```postgresql
\c dify
```



查看表

```postgresql
\dt
```



查看表结构

```postgresql
\d table_name;
```

:::



查看用户状态，可以看到 `status` 处显示为 `pending`

```postgresql
SELECT id, email, status, initialized_at
FROM accounts 
WHERE email = 'xx@xxx.com';
                  id                  |         email          | status  |       initialized_at       
--------------------------------------+------------------------+---------+----------------------------
 22280a3d-62eb-44ad-84b1-4978ac194f1a | gggggggggg@xxxxxxx.com | pending | 2026-01-28 07:53:55.803903
(1 row)
```



修改用户状态

```shell
UPDATE accounts
SET status = 'active'
WHERE email = 'gggggggggg@xxxxxxx.com';
```



再次查看

```postgresql
SELECT id, email, status, initialized_at
FROM accounts 
WHERE email = 'gggggggggg@xxxxxxx.com';
                  id                  |         email          | status  |       initialized_at       
--------------------------------------+------------------------+---------+----------------------------
 22280a3d-62eb-44ad-84b1-4978ac194f1a | gggggggggg@xxxxxxx.com | pending | 2026-01-28 07:53:55.803903
(1 row)
```

