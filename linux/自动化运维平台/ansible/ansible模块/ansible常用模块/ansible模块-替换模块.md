# ansible模块-替换模块

## 1 lineinfile模块

```python
[root@ansible ~]# ansible all -m lineinfile -a "path=/root/hehe regexp='^user admin' line='user hehe'"


path			#文件路径
regexp		#匹配的规则，即要替换的内容
line			#替换为什么
state
	adsent		#删除
```



## 2 replace模块

```python
[root@ansible ~]# ansible all -m replace -a "path=/root/hehe regexp='^user admin' replace='hehe'"

path			#文件路径
regexp		#匹配的规则，即要替换的内容
replace		#替换为什么
```



