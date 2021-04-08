[toc]



# redis命令

[redis命令官方文档](https://redis.io/commands)



<h3 style=color:red>⚠️ keys * 命令不要在生产环境中使用！！！ 这里仅仅是为了实验使用这个命令</h3>

# redis-cli	

**语法**

``redis-cli``



**选项**

- -h   指定连接的redis服务端IP地址，不写默认本机
- -p   指定端口
- -a   指定密码

**示例**

redis没有配置密码

```python
$ redis-cli
127.0.0.1:6379>
```



redis配置了密码

```python
redis-cli -h 127.0.0.1 -p 6379 -a "mypass"
```

redis设置密码

```python
#方法一	配置文件
在redis的配置文件中写入以下一行即为设置redis密码
requirepass password

#方法二	命令行设置密码，如果需要取消密码则设置为空即可
CONFIG set requirepass "password"

命令行设置redis密码后通过redis-cli命令进入redis就需要输入auth命令进行验证
```





# redis-server	

示例：指定配置文件启动redis

```python
redis-server /etc/redis/6379/redis.conf
```







# keys命令

## del key

含义：该命令用于在key存在时删除 key

示例：

```python
127.0.0.1:6379> get str
"6abc"
127.0.0.1:6379> DEL str
(integer) 1
127.0.0.1:6379> get str
(nil)
```



## dump key

含义：序列化key，并返回被序列化的值
示例：

```python
127.0.0.1:6379> GET str
"abc"
127.0.0.1:6379> DUMP str
"\x00\x03abc\a\x00&\x9e\xe5\xceI\xb8w\xf8"
```



## exists key

含义：检查指定key是否存在，存在返回1，不存在返回0
示例：

```python
127.0.0.1:6379> EXISTS str
(integer) 1
127.0.0.1:6379> EXISTS str1
(integer) 0
```



## expire key seconds

含义：为给定key设置过期时间，以秒为单位
示例：

```python
127.0.0.1:6379> GET str
"abc"
127.0.0.1:6379> EXPIRE str 5
(integer) 1
127.0.0.1:6379> GET str
"abc"
127.0.0.1:6379> GET str
"abc"
127.0.0.1:6379> GET str
(nil)
```



## expireat key timestamp

含义：EXPIREAT 的作用和 EXPIRE 类似，都用于为key设置过期时间。 不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)
示例：

```python
127.0.0.1:6379> EXPIREAT str 1688666880
(integer) 0

1688666880是unix时间戳秒，对应的时间是 2023/7/7 2:8:0
```



## pexpire  key milliseconds

含义：设置key的过期时间以毫秒计
示例：

```python
127.0.0.1:6379> PEXPIRE str 3000
(integer) 1
127.0.0.1:6379> GET str
"abc"
127.0.0.1:6379> GET str
(nil)
```



## pexpireat key milliseconds-timestamp

含义：设置key过期时间的时间戳(unix timestamp) 以毫秒计
示例：

```python
127.0.0.1:6379> PEXPIREAT str 1655555555005
(integer) 1

1655555555005是unix时间戳毫秒，对应的时间是 2022/6/18 20:32:35
```



## keys pattern

含义：查找所有符合给定模式( pattern)的 key
示例：

```python
127.0.0.1:6379> SET str1 aaa
OK
127.0.0.1:6379> SET str2 bbb
OK
127.0.0.1:6379> SET str3 ccc
OK

#查找以str开头的key
127.0.0.1:6379> KEYS str*
1) "str1"
2) "str3"
3) "str2"
```



## move key db

含义：将当前数据库的key移动到给定的数据库db当中
示例：

⚠️当从一个数据库移动一个不存在的key到另一个数据库时会失败

⚠️当两个数据库存在相同的key时，则无法移动

```python
#redis默认使用数据库0，这里再显示指定一次
127.0.0.1:6379> SELECT 0
OK
127.0.0.1:6379> SET str aaa
OK

#把str移动到数据库1
127.0.0.1:6379> MOVE str 1
(integer) 1

#在数据库0检查str是否存在，返回0表示不存在
127.0.0.1:6379> EXISTS str
(integer) 0


#切换到库1，然后检查str是否存在
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> EXISTS str
(integer) 1
```



## persist key

含义：移除key的过期时间，key将持久保持
示例：

```python
#设置过期时间为10秒
127.0.0.1:6379> EXPIRE str 10
(integer) 1

#取消过期时间，返回值为1表示取消成功
127.0.0.1:6379> PERSIST str
(integer) 1
```



## pttl key

含义：以毫秒为单位返回key的剩余的过期时间
示例：

```python
#设置过期时间
127.0.0.1:6379> EXPIRE str 10
(integer) 1

#返回结果为还有7109毫秒过期
127.0.0.1:6379> PTTL str
(integer) 7109
```



## ttl key

含义：以秒为单位，返回给定 key 的剩余生存时间(TTL, time to live)
示例：

```python
127.0.0.1:6379> EXPIRE str 10
(integer) 1
127.0.0.1:6379> TTL str
(integer) 8
```



## randomkey

含义：从当前数据库中随机返回一个 key
示例：

```python
127.0.0.1:6379> MSET str1 a str2 b str3 c
OK
127.0.0.1:6379> RANDOMKEY
"str1"
127.0.0.1:6379> RANDOMKEY
"str2"
127.0.0.1:6379> RANDOMKEY
"str1"
127.0.0.1:6379> RANDOMKEY
"str2"
127.0.0.1:6379> RANDOMKEY
"str1"
127.0.0.1:6379> RANDOMKEY
"str1"
127.0.0.1:6379> RANDOMKEY
"str3"
```



## pename key newkey

含义：修改key的名称
示例：

```python
127.0.0.1:6379> GET str
"aaa"
127.0.0.1:6379> RENAME str str1
OK
127.0.0.1:6379> KEYS *
1) "str1"
```



## renamenx key newkey

含义：仅当newkey不存在时，将key改名为newkey
示例：

```python
127.0.0.1:6379> KEYS *
1) "str2"
127.0.0.1:6379> RENAMENX str2 str3
(integer) 1
127.0.0.1:6379> KEYS *
1) "str3"
```



## type key

含义：返回key所存储值的类型
示例：

```python
127.0.0.1:6379> type str3
string
```

