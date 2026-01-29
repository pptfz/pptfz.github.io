# postgres常用命令

高频使用命令

```postgresql
psql -U postgres       -- 连接
\l                     -- 看库
\c dbname              -- 切库
\dt                    -- 看表
\d table               -- 看表结构
SELECT * FROM table;   -- 看数据
\q                     -- 退出
```



## 连接与基础信息

### 连接 PostgreSQL

```bash
psql -h <host> -p <port> -U <user> -d <db>
```



常见示例：

```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
```



环境变量方式（推荐用于脚本）：

```bash
export PGHOST=127.0.0.1
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=xxxx
psql -d mydb
```



### 查看当前连接信息

```sql
SELECT current_database();
SELECT current_user;
SELECT inet_server_addr(), inet_server_port();
```



## psql 交互命令（元命令）

:::tip 说明

以下命令 **只在 psql 里有效**，不是 SQL

:::

### 帮助与退出

```sql
\?      -- 查看所有 psql 命令
\h      -- 查看 SQL 语法帮助
\q      -- 退出 psql
```



### 数据库级别

```sql
\l            -- 列出所有数据库
\l+           -- 带大小、权限
\c dbname     -- 切换数据库
```



### Schema（模式）

```sql
\dn           -- 查看 schema
\dn+          -- 查看 schema 详细信息
```



### 表 / 视图 / 序列

```sql
\dt           -- 当前 schema 下的表
\dt *.*       -- 所有 schema 下的表
\dt+          -- 表大小等信息

\dv           -- 视图
\ds           -- 序列
```



### 表结构

```sql
\d table_name
\d+ table_name   -- 包含表大小、存储方式
```



### 索引、函数、触发器

```sql
\di           -- 索引
\df           -- 函数
\dtg          -- 触发器
```



## 用户与权限管理

### 查看用户 / 角色

```sql
\du
\du+
```

等价 SQL：

```sql
SELECT * FROM pg_roles;
```



### 创建 / 删除用户

```sql
CREATE USER app_user WITH PASSWORD 'xxx';
DROP USER app_user;
```

创建可登录用户（推荐）：

```sql
CREATE ROLE app_user LOGIN PASSWORD 'xxx';
```



### 授权

```sql
GRANT CONNECT ON DATABASE mydb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

对未来表生效：

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO app_user;
```



## 数据库与表操作

### 数据库

```sql
CREATE DATABASE mydb;
DROP DATABASE mydb;
```



### 表

```sql
CREATE TABLE demo (
  id SERIAL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

DROP TABLE demo;
TRUNCATE TABLE demo;
```



### 表大小

```sql
\dt+ demo

SELECT
  pg_size_pretty(pg_total_relation_size('demo'));
```



## 数据查询与调试

### 基础查询

```sql
SELECT * FROM table;
SELECT count(*) FROM table;
```



### 查看执行计划

```sql
EXPLAIN SELECT * FROM table;
EXPLAIN ANALYZE SELECT * FROM table;
```



### 慢 SQL 定位

```sql
SELECT pid, query, state, now() - query_start AS duration
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```



## 连接与会话管理（非常重要）

### 查看当前连接

```sql
SELECT * FROM pg_stat_activity;
```

常用字段：

- pid
- usename
- datname
- state
- query



### 杀连接

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid();
```



### 最大连接数

```sql
SHOW max_connections;
```



## 事务与锁

### 事务

```sql
BEGIN;
COMMIT;
ROLLBACK;
```



### 查看锁

```sql
SELECT * FROM pg_locks;
```



常用锁分析：

```sql
SELECT
  a.pid,
  a.query,
  l.mode,
  l.granted
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid;
```



## 备份与恢复（生产必会）

### 逻辑备份

```bash
pg_dump -h host -U user dbname > db.sql
```



只备份结构：

```bash
pg_dump -s dbname > schema.sql
```



### 恢复

```bash
psql -d dbname < db.sql
```



### 整库备份

```bash
pg_dumpall > all.sql
```



## 系统视图（排障利器）

### 表统计

```sql
SELECT * FROM pg_stat_user_tables;
```



### 索引使用率

```sql
SELECT
  relname,
  idx_scan,
  seq_scan
FROM pg_stat_user_tables
ORDER BY idx_scan ASC;
```



### 表膨胀判断

```sql
SELECT
  relname,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```



## 维护命令

```sql
VACUUM;                -- 清理死元组，回收表内部空间，防止表膨胀（不更新统计）
VACUUM ANALYZE;        -- 清理死元组 + 更新统计信息，日常维护首选
ANALYZE;               -- 仅更新统计信息，帮助优化器生成更优执行计划
REINDEX TABLE table_name; -- 重建表的所有索引，解决索引膨胀或损坏（会锁表，慎用）
```



| 命令           | 清垃圾 | 更新统计 | 重建索引 | 是否锁表 | 常用程度 |
| -------------- | ------ | -------- | -------- | -------- | -------- |
| VACUUM         | ✅      | ⚠️ 少量   | ❌        | ❌        | ⭐⭐⭐      |
| ANALYZE        | ❌      | ✅        | ❌        | ❌        | ⭐⭐⭐      |
| VACUUM ANALYZE | ✅      | ✅        | ❌        | ❌        | ⭐⭐⭐⭐⭐    |
| REINDEX        | ❌      | ❌        | ✅        | ⚠️ 是     | ⭐⭐       |

