# harbor删除保留策略遇到的问题

harbor版本：v2.10



## 所做操作

在harbor api控制台做了如下操作，本意为针对项目id为66的项目配置镜像删除策略为保留最近拉取的3个

![iShot_2024-12-04_16.21.03](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.21.03.png)

实际 `curl` 命令如下

```shell
curl -X 'PUT' \
  'https://<url>/api/v2.0/retentions/1' \
  -H 'accept: application/json' \
  -H 'authorization: Basic xxx' \
  -H 'Content-Type: application/json' \
  -H 'X-Harbor-CSRF-Token: xxx' \
  -d '{
  "id": 0,
  "algorithm": "or",
  "rules": [
    {
      "id": 0,
      "priority": 1,
      "disabled": false,
      "action": "retain",
      "tag_selectors": [
        {
          "kind": "latestPulled",
          "decoration": "pulled",
          "pattern": "**",
          "extras": "{\"count\": \"3\"}"
        }
      ],
      "scope_selectors": {
        "repository": [
          {
            "kind": "doublestar",
            "pattern": "**"
          }
        ]
      }
    }
  ],
  "trigger": {
    "kind": "Schedule",
    "settings": {
      "cron": "0 0 0 * * *"
    },
    "references": {}
  },
  "scope": {
    "level": "project",
    "ref": 66
  }
}'
```

返回如下

![iShot_2024-12-04_16.22.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.22.06.png)





执行完成后，在harbor控制台查看，发现一直在转圈，误以为是有问题，实际上是因为项目数量很多，有900多个

![iShot_2024-12-04_16.18.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.18.55.png)



## 误操作

误以为配置有问题，想要删除，执行了如下操作

![iShot_2024-12-04_16.27.10](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.27.10.png)

实际curl命令如下

```shell
curl -X 'DELETE' \
  'https://<url>/api/v2.0/retentions/1' \
  -H 'accept: application/json' \
  -H 'authorization: Basic xxx' \
  -H 'X-Harbor-CSRF-Token: xxx'
```



返回如下

![iShot_2024-12-04_16.28.49](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.28.49.png)



## 报错

执行完删除后在项目的 `策略` 选项卡中就报错 `internal server error`

![iShot_2024-12-04_16.19.24](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-04_16.19.24.png)



查看 `harbor-core` 容器日志报错如下

```shell
$ docker logs -f harbor-core
......
2024-12-04T08:04:56Z [ERROR] [/lib/http/error.go:57]: {"errors":[{"code":"UNKNOWN","message":"unknown: no such Retention policy with id 1"}]} 
2024-12-04T08:04:57Z [ERROR] [/lib/http/error.go:57]: {"errors":[{"code":"UNKNOWN","message":"unknown: no such Retention policy with id 1"}]} 
2024-12-04T08:04:57Z [ERROR] [/lib/http/error.go:57]: {"errors":[{"code":"UNKNOWN","message":"unknown: no such Retention policy with id 1"}]} 
......
```



## 解决方法

进入pg数据库

```shell
$ docker exec -it harbor-db psql -U postgres
psql (15.8)
Type "help" for help.

No entry for terminal type "xterm";
using dumb terminal settings.
```



切换到 `registry` 数据库

```postgresql
postgres=# \c registry
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
 public | harbor_user                 | table | postgres
 public | immutable_tag_rule          | table | postgres
 public | job_log                     | table | postgres
 public | job_queue_status            | table | postgres
 public | label_reference             | table | postgres
 public | notification_policy         | table | postgres
 public | oidc_user                   | table | postgres
 public | p2p_preheat_instance        | table | postgres
 public | p2p_preheat_policy          | table | postgres
 public | permission_policy           | table | postgres
 public | project                     | table | postgres
 public | project_blob                | table | postgres
 public | project_member              | table | postgres
 public | project_metadata            | table | postgres
 public | properties                  | table | postgres
 public | quota                       | table | postgres
 public | quota_usage                 | table | postgres
 public | registry                    | table | postgres
 public | replication_policy          | table | postgres
 public | report_vulnerability_record | table | postgres
 public | repository                  | table | postgres
 public | retention_policy            | table | postgres
 public | robot                       | table | postgres
 public | role                        | table | postgres
 public | role_permission             | table | postgres
 public | sbom_report                 | table | postgres
 public | scan_report                 | table | postgres
 public | scanner_registration        | table | postgres
 public | schedule                    | table | postgres
 public | schema_migrations           | table | postgres
 public | system_artifact             | table | postgres
 public | tag                         | table | postgres
 public | task                        | table | postgres
 public | user_group                  | table | postgres
 public | vulnerability_record        | table | postgres
(48 rows)
```



`retention_policy` 表是用于存储保留策略的定义，项目与保留策略的绑定关系存在于 `project_metadata` 表中



查看 `project_metadata` 表并指定有问题的项目id

```postgresql
registry=# SELECT * FROM project_metadata WHERE project_id = 66;
 id | project_id |     name     | value |       creation_time        |        update_time         
----+------------+--------------+-------+----------------------------+----------------------------
 48 |         48 | public       | false | 2024-10-12 06:56:59.045553 | 2024-10-12 06:56:59.045553
 98 |         48 | retention_id | 1     | 2024-12-04 04:17:51.363924 | 2024-12-04 04:17:51.363924
(2 rows)
```



查看 `project_metadata` 表并指定无问题的项目id

```postgresql
registry=# SELECT * FROM project_metadata WHERE project_id = 1; 
 id | project_id |  name  | value |       creation_time        |        update_time         
----+------------+--------+-------+----------------------------+----------------------------
  1 |          1 | public | true  | 2024-09-27 09:48:08.122988 | 2024-09-27 09:48:08.122988
(1 row)
```



对比后发现有问题的项目id条目中多了一条记录

```postgresql
 98 |         66 | retention_id | 1     | 2024-12-04 04:17:51.363924 | 2024-12-04 04:17:51.363924
```



删除这条记录

```postgresql
registry=# DELETE FROM project_metadata WHERE project_id = 66 AND name = 'retention_id';
DELETE 1
```



再次查看，多余的记录已经被删除

```postgresql
registry=# SELECT * FROM project_metadata WHERE project_id = 66;
 id | project_id |  name  | value |       creation_time        |        update_time         
----+------------+--------+-------+----------------------------+----------------------------
 48 |         48 | public | false | 2024-10-12 06:56:59.045553 | 2024-10-12 06:56:59.045553
(1 row)
```



返回harbor控制台刷新即可