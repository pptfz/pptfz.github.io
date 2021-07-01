# ansible模块-挂载模块

## 1 mount模块

```python
[root@ansible ~]# ansible all -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=present"
[root@ansible ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=mounted"
[root@ansible ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=unmounted"
[root@ansible ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=absent"


src			#指定要挂载的内容
path		#本地挂载点
fstype	#挂载类型
opts		#挂载权限

state
	present			#开机挂载，仅将挂载配置写入/etc/fstab
	mounted			#挂载设备，并将配置写入/etc/fstab
	unmounted		#卸载设备，不会清除/etc/fstab写入的配置
	absent			#卸载设备，会清理/etc/fstab写入的配置
```

