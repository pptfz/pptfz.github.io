# ansible模块-解压缩模块

## 1 unarchive模块

```python
[root@ansible ~]# ansible all -m unarchive -a "src=/tmp/hehe.tar.gz dest=/tmp"
[root@ansible ~]# ansible all -m unarchive -a "src=/tmp/hehe.tar.gz dest=/tmp copy=no"

copy					#默认为yes，即先在本地解压然后再传输到受控机，等于no，解压缩受控机压缩包
creates				#当文件存在时，不再进行解压
mode					#指定解压缩文件权限
list_files		#是否列出文件列表，默认no
remote_src		#表示文件已经在受控机上，相当于copy =no
```

