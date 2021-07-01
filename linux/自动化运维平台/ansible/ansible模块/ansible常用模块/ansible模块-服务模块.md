# ansible模块-服务模块

## 1 service服务模块



```shell
ansible all -m service -a "name=crond state=stopped enabled=yes"
```





```python
[root@ansible ~]# ansible all -m service -a "name=crond state=stopped enabled=yes"

name		#定义要启动服务的名称
state		#指定服务状态是停止或是运行，停止和运行指令要写成过去时
    started		#启动
    stopped		#停止
    restarted	#重启
    reloaded	#重载
enabled				#是否让服务开启自启动
```

