[toc]



# python基础十九	序列化

## 1. 含义

> 将一个数据类型转换成另一个数据类型



## 2. 分类

### 2.1 json	转换成字符串

> dump load	用于文件写入存储
>
> dumps(序列) loads(反序列)	用于网络传输

```python
//dumps、loads用法
🌟列表
import json
lst = [1,2,3]
a = json.dumps(lst)		#将列表转换为字符串
print(a)							#[1, 2, 3]
print(type(a))				#<class 'str'>

b = json.loads(a)			#将字符串转换为列表
print(b)							#[1, 2, 3]
print(type(b))				#<class 'list'>


⚠️列表中有中文
lst = ['呵呵','哈哈']
a = json.dumps(a)
print(a)						#["\u5475\u5475", "\u54c8\u54c8"]，直接转中文有问题

加参数ensure_ascii=False解决
lst = ['呵呵','哈哈']
a = json.dumps(lst,ensure_ascii=False)		
print(a)			#["呵呵", "哈哈"]


🌟字典
import json
dic = {"key":1,"key2":3}
a = json.dumps(dic)				#将字典转换成字符串
print(a)
print(type(a))
{"key": 1, "key2": 3}
<class 'str'>

b = json.loads(a)					#将字符串转换为字典
print(b)
print(type(b))
{'key': 1, 'key2': 3}
<class 'dict'>

print(json.loads(a)['key'])		#字典取值
1
```



### 2.2 pickle	几乎支持python中所有的对象(不支持lambda)	转换成字节

>  pickle写入多行时自动带有换行
>
>  dump load	用于文件写入存储
>
>  dumps loads	用于网络传输

```python
//将函数转换为字节
import pickle
def func():
    print(111)

a = pickle.dumps(func)			#将函数转换为字节
print(a)
print(type(a))
b'\x80\x03c__main__\nfunc\nq\x00.'
<class 'bytes'>

b = pickle.loads(a)					#将字节转换为函数
b()
print(type(b))
111
<class 'function'>


//将元组转换为字节
tu = (1,2,3,4,5)
import pickle
a = pickle.dumps(tu)				#将元组转换为字节
print(a)
b'\x80\x03(K\x01K\x02K\x03K\x04K\x05tq\x00.'

b = pickle.loads(a)					#将字节转换为元组
print(b)
(1, 2, 3, 4, 5)
```

