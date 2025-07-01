[toc]



# python基础七	基础数据类型-列表

## 1. 列表

### 1.1 含义

​	``python中数据结构之一 ``



### 1.2 关键字

``list``



### 1.3 定义

``列表名 = [元素1,元素2,元素3,...]	#每个元素以逗号分隔  以逗号分隔称为一个元素`` 



### 1.4 作用

```python
1.存储大量数据
2.存储不同数据类型的数据
```



### 1.5 特点

> 可变、可迭代、有序



### 1.6 列表增加

```python
lst.append()		#追加列表,只能在末尾添加

//代码示例
lst = ["a","b"]
lst.append(c)
print (lst)
['a', 'b', 'c']
```



### 1.7 列表插入	⚠️⚠️⚠️以后尽量少使用列表插入insert，有性能消耗

```python
lst.insert(下标,插入的内容)		#参数1，要插入的位置的下标，参数2，要插入的内容

//代码示例
lst = ["a","b"]
lst.insert(1,"c")				//1表示要插入的位置，即下标，c表示要插入的内容
print (lst)
['a', 'c', 'b']
```



### 1.8 列表扩展	迭代添加

```python
⚠️extend原理是for循环迭代添加
lst.extend()		#extend是迭代添加，例如添加"abc"，会添加"a","b","c"

//代码示例
lst = ["a","b"]
lst.extend("hehe")
print (lst)
['a', 'b', 'h', 'e', 'h', 'e']


//for循环代码示例
lst = ["a","b"]
for i in "hehe":
    lst.append(i)
print (lst)
['a', 'b', 'h', 'e', 'h', 'e']
```



### 1.9 列表删除

```python
#方式一
lst.remove()			//一次只能删除一个

//通过元素名进行删除
lst = ["a","b","c"]
lst.remove("b")
['a', 'c']



#方式二
lst.pop()			//弹出，默认从列表最后弹出内容，并且有返回值，返回的内容是删除的内容

//代码示例,默认删除
lst = ["a","b","c"]
lst.pop()
'c'
print (lst)
['a', 'b']


//代码示例，通过下标删除
lst = ["a","b","c"]
lst.pop(0)
'a'
print (lst)
['b', 'c']


#方式三
del lst			//慎用，删除列表全部

//代码示例,删除列表全部
lst = ["a","b","c"]
del lst
print (lst)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'lst' is not defined
  
//代码示例，根据下标删除
lst = ["a","b","c"]
del lst[0]
print (lst)
['b', 'c']


//代码示例，切片删除
lst = ["a","b","c","d","e","f"]
del lst[1:3]
print (lst)
['a', 'd', 'e', 'f']


#方式四
clear lst			//清除列表

//代码示例
lst = ["a","b","c"]
lst.clear
print (lst)
[]
```



### 1.10 列表修改

```python
lst[下标] = "修改为。。。"

#方式一，修改单个元素
//代码示例
lst = ["a","b","c"]
lst[0] = "hehe"
print (lst)
['hehe', 'b', 'c']


#方式二，修改多个元素
//代码示例1，超出列表范围添加多个元素
lst = ["a","b","c"]
lst[1:4] = 1,2,3
print (lst)
['a', 1, 2, 3]

//代码示例2，超出列表范围添加一个元素
lst = ["a","b","c"]
lst[1:4] = 1,				//⚠️这里后边必须要加一个逗号，否则会变成不可迭代的数字
print (lst)
['a', 1]


⚠️列表修改元素时，修改的内容必须为可迭代的
lst[1:4] = 1
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: can only assign an iterable


  
#方式三，切片修改多个元素
//代码示例1,将a、c、e修改为A、C、E
lst = ["a","b","c","d","e","f"]
lst[0:5:2] = "A","B","C"
print (lst)
['A', 'b', 'B', 'd', 'C', 'f']
  
//代码示例2,修改列表中不连续的元素，修改的内容必须一一对应
lst = ["a","b","c","d","e","f"]
lst[0:5:2] = "A","B"
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: attempt to assign sequence of size 2 to extended slice of size 3
```

#### 1.10.1列表修改总结

**1.使用切片时，获取的内容就是原数据本身，即列表切片后获取的是列表**

**2.切片获取的内容是连续的，修改内容时可多可少**

**3.如果切片获取的内容不是连续的，修改的内容必须一一对应**



### 1.11 列表查看

```python
#方法一 for循环
lst = ["a","b","c"]
for i in lst:
    print (i)
a
b
c
    
    
#方法二	索引查询
lst = ["a","b","c"]
print (lst[0])
a
```



### 1.11 列表嵌套

```python
#列表嵌套就是列表中的元素是列表

//代码示例，要打印8
lst = [1,2,3,[4,5,[6,7,8]]]
lst1 = lst[3]
print (lst1)
[4, 5, [6, 7, 8]]
lst2 = lst1[2]
print (lst2)
[6, 7, 8]
print (lst2[2])
8


//代码示例，要打印8
lst = [1,2,3,[4,5,[6,7,8]]]
print (lst[3][2][2])
8
```



### 1.12 列表方法

#### 1.12.1 列表倒序	reverse()

```python
将列表倒序显示

#方法1	lst[::-1]		//此方式为新开辟内存空间
lst = [1,2,3,4,5,6]
print (lst[::-1])				
[6, 5, 4, 3, 2, 1]

print (id(lst),id(lst[::-1]))
140193101789000 140193101800136


#方法2	lst.reverse()		//此方式为原地修改
lst = [1,2,3,4,5,6]
lst.reverse()				
print (lst)
[6, 5, 4, 3, 2, 1]


//⚠️这样写会返回空
lst = [1,2,3,4,5,6]
lst = lst.reverse()
print (lst)
None
```



#### 1.12.2 列表排序 

```python
#升序	sort()
lst = [1,3,2,7,5,6]
lst.sort()
print (lst)
[1, 2, 3, 5, 6, 7]

#降序	sort(reverse=True)
lst = [1,2,3,7,5,6]
lst.sort(reverse=True)
print (lst)
[7, 6, 5, 3, 2, 1]
```



### 1.13 列表总结

**1.列表是可变数据类型，可迭代数据类型，列表是有序的**

**2.列表的作用存储大量数据，并且可以存储不同数据类型**

**3.列表就是一个容器**



### 1.14 列表面试题

```python
1.列表整合面试题
lst1 = [1,2,3,[4]]
lst2 = [5,6,7]
lst1和lst2整合


#方法1	extend
lst1 = [1,2,3,[4]]
lst2 = [5,6,7]
lst1.extend(lst2)
print (lst1)
[1, 2, 3, [4], 5, 6, 7]


#方法2	列表相加
lst1 = [1,2,3,[4]]
lst2 = [5,6,7]
print (lst1 + lst2)
[1, 2, 3, [4], 5, 6, 7]



2.列表相乘面试题
⚠️列表进行乘法时，元素都是共用的	同样的，元组也适用

lst = [1,2,[]]
lst1 = lst * 2
lst1[-1].append(8)
lst、lst1结果？

⚠️
lst与lst1中元素相同，因为列表进行乘法时，元素都是共用的，因此当lst1最后一个元素追加了一个8之后，所有的元素变成了1,2,[8]

lst = [1,2,[]]
lst1 = lst * 2
lst1[-1].append(8)
print (lst)
[1, 2, [8]]

print (lst1)
[1, 2, [8], 1, 2, [8]]



3.定义列表
lst = []
lst1 = list()	//次方式同样适用于其他数据类型
```

