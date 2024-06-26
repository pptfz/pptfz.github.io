

[toc]



# python基础七	基础数据类型-元组

## 1.元组

### 1.1 含义

``python中的数据类型之一``



### 1.2 关键字

``tuple``



### 1.3 定义

> tu = ()



### 1.4 作用

``通过元素的名称获取元素的索引``



### 1.5 应用场景

```python
1.不可变：为了防止误操作时修改重要数据
2.配置文件中存储数据
```



### 1.6 特点

**1.元组就是一个不可变的列表**

**2.元组不能增删改**

**3.元组是一个有序，可迭代，不可变的数据类型**

**4.当小括号中没有出现逗号时，数据类型就是括号中数据本身的数据类型**

**5.列表和元组进行乘法时，元素都是共用的**



### 1.7 使用示例

```python
//定义一个元组
tu = (1,2,3)
print (tu)
(1, 2, 3)


//支持索引
tu = (1,2,3)
print (tu[0])
1


//支持切片
tu = (1,2,3)
print (tu[0:1])
(1,)
print (tu[0:2])
(1, 2)


//统计元组中元素个数 tu.count
tu = (1,2,3,1)
print (tu.count(1))
2


//通过元素的名称获取元素的索引  tu.index
tu = (1,2,3)
print (tu.index(1))
0


//for循环打印元组中的内容
tu = (1,2,3)
for i in tu:
    print (i)
1
2
3
```



### 1.8 元组面试题

```python
a = (10)      		# 当小括号中没有出现逗号时,数据类型就是括号中数据类型本身
a = ("abc")      	# 当小括号中没有出现逗号时,数据类型就是括号中数据类型本身
a = ("abc",)     	# 这是一个元组
a = ()            # 这是元组
a = (1,2,3)       # 这是元组


//代码示例
a = (10)
print (type(a))
<class 'int'>

a = ("abc")
print (type(a))
<class 'str'>

a = ("abc",)
print (type(a))
<class 'tuple'>

a = ()
print (type(a))
<class 'tuple'>

a = (1,2,3)
print (type(a))
<class 'tuple'>
```

