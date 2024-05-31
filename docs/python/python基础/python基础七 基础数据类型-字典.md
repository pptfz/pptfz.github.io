[toc]



# python基础七	基础数据类型-字典

## 1.字典

### 1.1 含义

``python中的一种数据类型	``

``唯一的一种{} 键值对的数据``



### 1.2 关键字

``dict``



### 1.3 定义

``dic = {key:value}``



### 1.4 哈希说明

``可变数据类型就不可哈希``

``不可变数据类型就可哈希``



### 1.5 字典说明

- **字典的键是不可变数据类型，可哈希**
- **字典的键是唯一的，不可重复**
- **字典的值可以是任意的**
- **字典是一个可变数据类型**



### 1.6 字典的增

#### 1.6.1 方式一	dic[键] = 值

```python
dic = {"key1":1,"key2":2,"key3":3}		//定义一个字典
print (dic)
{'key1': 1, 'key2': 2, 'key3': 3}

dic["key4"] = 4				//增加一个键
print (dic)
{'key1': 1, 'key2': 2, 'key3': 3, 'key4': 4}
```



#### 1.6.2 方式二	dic.setdefault("键",值)	参数1是键，参数2是值

```python
dic = {"key1":1,"key2":2,"key3":3}		//定义一个字典
dic.setdefault("key4",4)							//增加一个键
print (dic)
{'key1': 1, 'key2': 2, 'key3': 3, 'key4': 4}


#特殊说明1	使用setdefault增加字典值时，如果键值存在就不增加
dic = {"key1":1,"key2":2,"key3":3}			//定义一个字典
dic.setdefault("key1",5)								//向已有的键key1中插入值
print (dic)
{'key1': 1, 'key2': 2, 'key3': 3}				//已存在的键不会改变

#特殊说明2	如果键不存在，则返回None
dic = {"key1":1}
print (dic.setdefault("key5"))
None

#特殊说明3	键和值添加成功后返回的是添加的值
dic = {"key1":1}
print (dic.setdefault("key5",5))
5

#特殊说明4	如果键存在，返回的是键的值
dic = {"key1":1}
print (dic.setdefault("key1"))
1


#setdefault工作流程说明
1.setdefault在字典中先根据键值查找，如果返回的结果为None，在进行第二步
2.将键和值添加到字典中
```



### 1.7 字典的删

#### 1.7.1 clear()	清空

```python
dic = {"key1":1,"key2":2,"key3":3}
dic.clear()
print (dic)
{}
```



#### 1.7.2 pop

```python
dic = {"key1":1,"key2":2,"key3":3}
dic.pop("key1")
print (dic)
{'key2': 2, 'key3': 3}
```



#### 1.7.3 popitem()	随机删除(官方名称，py3.6版本后默认删除最后一个)

```python
#随机删除（官方名称）python3.6版本后默认删除最后一个
dic = {"key1":1,"key2":2,"key3":3}
dic.popitem()
print (dic)
{'key1': 1, 'key2': 2}
```



#### 1.7.4 del	删除字典

```python
#直接删除字典
dic = {"key1":1,"key2":2,"key3":3}
del dic
sprint (dic)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'dic' is not defined
  

#根据键删除,del删除，键只能有一个
dic = {"key1":1,"key2":2,"key3":3}
del dic["key1"]
print (dic)
{'key2': 2, 'key3': 3}
```



### 1.8 字典的改

#### 1.8.1 dic["key"] = "value"

```python
dic = {"key1":1,"key2":2,"key3":3}
#修改方式	暴力增加，当键在字典中存在时就修改，不存在就是增加
dic["key1"] = "5"				//键key1存在，此时为修改
print (dic)
{'key1': '5', 'key2': 2, 'key3': 3}


dic["key6"] = "6"				//键key6不存在，此时为增加
print (dic)
{'key1': 1, 'key2': 2, 'key3': 3, 'key6': '6'}
```



#### 1.8.2 update

```python
dic = {"key1":1,"key2":2,"key3":3}
dic.update({"key1":"hehe"})					//修改单个值
print (dic)
{'key1': 'hehe', 'key2': 2, 'key3': 3}


dic = {"key1":1,"key2":2,"key3":3}
dic.update({"key1":"hehe","key2":"haha"})			//修改多个值
print (dic)
{'key1': 'hehe', 'key2': 'haha', 'key3': 3}
```



### 1.9 字典的查

```python
#查找方式1	有键返回值，没有键报错
dic = {"key1":1,"key2":2,"key3":3}
print (dic["key1"])				//有键返回值
1

print (dic["key1"])				//没有键报错
KeyError: 'key10'

  
#查找方式2	dic.get("key")
dic = {"key1":1,"key2":2,"key3":3}
print (dic.get("key1"))		//有键返回值
1

print (dic.get("key10"))	//没有键返回None
None

print (dic.get("key10","呵呵"))	//没有键还可以返回自定义值
呵呵


#查找方式3	获取字典所有的键、值、键和值
dic = {"key1":1,"key2":2,"key3":3}
print (dic.keys())			//返回字典所有的键，高仿列表
dict_keys(['key1', 'key2', 'key3'])

for i in dic.keys():
    print (i)
key1
key2
key3


print (dic.values())		//返回字典所有的值
dict_values([1, 2, 3])


for i in dic.values():
    print (i)
1
2
3


print (dic.items())			//返回字典所有的键和值
dict_items([('key1', 1), ('key2', 2), ('key3', 3)])			

for i in dic.items():
    print (i)
('key1', 1)
('key2', 2)
('key3', 3)    
```



## 2.解构

### 2.1 解构示例1 两个变量互换值

```python
a,b = 10,20
print (a,b)

#a与b的值互换
a = 10
b = 20
a,b = b,a
print (a,b)
20 10

#解构说明1	
a,b = "你好"			//将字符串分别赋值给a和b
print (a)
print (b)
你
好

a,b = "你好啊"			//后边的值必须与变量的数量相同
print (a)
print (b)

```



### 2.2 解构示例2 字典示例

```python
字典本身是无序的，所以不支持索引，python3.6以上版本按照定义的顺序显示

#将字典转换为列表从而可以以索引查询字典的键和值
dic = {"key1":1,"key2":2,"key3":3}

lst = list(dic.items())			//将字典所有键和值显示并转换为列表，从而可以取键和值
print (lst[0])
('key1', 1)

print (lst[0][0])						//打印出字典的键和值后再根据索引取键或者值
key1



#进阶，字典中的值比较少的时候可以用转换为列表的方式然后根据索引获取键或者值解决，如果字典中的值比较多，可以用for循环解决
dic = {"key1":1,"key2":2,"key3":3,"key4":4,"key5":5,"key6":6,"key7":7,"key8":8,"key9":9}

//获取字典中的键和值
for i in dic.items():
    print (i)
('key1', 1)
('key2', 2)
('key3', 3)
('key4', 4)
('key5', 5)
('key6', 6)
('key7', 7)
('key8', 8)
('key9', 9)    

//分别获取字典中的键和值
for i in dic.items():
    print (i[0],i[1])
key1 1
key2 2
key3 3
key4 4
key5 5
key6 6
key7 7
key8 8
key9 9    
```



## 3.字典的嵌套

```python
字典的嵌套就是字典中还有字典

#示例1
dic = {"dic1":1,"dic2":2,"dic3":3,"dic4":4,"dic5":{"dic6":6,"dic7":{"dic8":8,"dic9":9,"dic10":{"dic11":11,"dic12":12}}}}

//要获取dic12的值
print (dic["dic5"]["dic7"]["dic10"]["dic12"])
12


#示例2
dic = {"dic1":1,"dic2":2,"dic3":3,"dic4":4,"dic5":{"dic6":6,"dic7":{"dic8":8,"dic9":9,"dic10":{"dic11":"么么哒","dic12":"呵哈嘻"}}}}

//要获取哈
print (dic["dic5"]["dic7"]["dic10"]["dic12"][1])		#获取到字典的键dic12后，值是字符串，因此可以根据索引取值
哈
```



## 4.字典骚操作

### 4.1 字典批量创建键值对 fromkeys

``fromkeys(参数1，参数2)	 参数1:键（可迭代） 参数2:值（共用）批量创建键值对``

```python
dic = {}
dic = dic.fromkeys("abc",'hehe')
print (dic)
{'a': 'hehe', 'b': 'hehe', 'c': 'hehe'}


字典批量创建键值对，值必须可迭代！！！

//字典批量创建键值对，值是可变数据类型的坑
dic = {}
dic = dic.fromkeys("abc",[])
dic["c"].append(6)
print (dic)
{'a': [6], 'b': [6], 'c': [6]}

本意是想修改c的值，但是结果却全变了

正确做法
dic = {}
dic = dic.fromkeys("abc",[])
dic["c"] = 6
print (dic)
{'a': [], 'b': [], 'c': 6}
```



### 4.2 字典另类定义方式

```python
//字典另类定义方式1
print (dict(k1=1,k2=2))
{'k1': 1, 'k2': 2}

//字典另类定义方式2
print (dict([(1,2),(3,4),(5,6)]))
{1: 2, 3: 4, 5: 6}
```

