# ansible模块-下载模块

## 1 get_url模块

```python
[root@ansible ~]# ansible all -m get_url -a "url=xxx dest=/opt"

url			#指定要下载的url地址
dest		#指定将url下载至哪
```

