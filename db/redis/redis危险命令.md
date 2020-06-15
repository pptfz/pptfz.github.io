# redis危险命令



# keys *

> **虽然其模糊匹配功能使用非常方便也很强大，在小数据量情况下使用没什么问题，数据量大会导致 Redis 锁住及 CPU 飙升，在生产环境建议禁用或者重命名！**



# flushdb

> **删除Redis中当前所在数据库中的所有记录，并且该命令是原子性的，不会终止执行，一旦执行，将不会执行失败。**



# flushall

> **删除Redis中所有数据库中的所有记录，并且该命令是原子性的，不会终止执行，一旦执行，将不会执行失败。**



# config

> 修改redis配置命令，一般在redis配置文件中做配置





# 禁用redis危险命令

**编辑redis配置文件，引号中内容为空则为禁用命令，有内容则为给命令起别名**

```python
rename-command KEYS     ""
rename-command FLUSHALL ""
rename-command FLUSHDB  ""
rename-command CONFIG   ""
```



**示例**

```python
#禁用keys *
127.0.0.1:6379> KEYS *
(error) ERR unknown command 'KEYS'

#使用命令别名，keys命令别名设置为了hehe
127.0.0.1:6379> hehe *
1) "str2"
2) "str1"
3) "str3"
```

