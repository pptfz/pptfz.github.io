# ansible模块-用户和组模块

## 1 group组模块

```python
[root@ansible ~]# ansible all -m group -a "name=hehe gid=888"

name		#指定创建的组名
gid			#指定组的gid
state
    absent		#移除远端主机的组
    present		#创建远端主机的组（默认）
```



## 2 user用户模块

```python
//-123使用MD5进行加密 -stdin 非交互式 -salt 加密参数
[root@ansible ~]# echo "bgx" | openssl passwd -123 -stdin -salt 'salt'

[root@ansible ~]# ansible all -m user -a "name=hehe uid=888 group=888 shell=/sbin/nologin create_home=no"
[root@ansible ~]# ansible all -m user -a "name=hehe password='$1$765yDGau$diDKPRoCIPMU6KEVEaPTZ0' "

uid						#指定用户的uid
group					#指定用户组名称
groups				#指定附加组名称
password			#给用户添加密码
shell					#指定用户登录shell
create_home		#是否创建家目录
```

