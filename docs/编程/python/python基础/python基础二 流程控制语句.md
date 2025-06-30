[toc]



# python基础二	流程控制语句

## 1. if流程控制语句

### 1.1 语法

#### 1.1.1 单分支

```python
if 条件:
    执行命令
```



#### 1.1.2 双分支

```python
if 条件:
    执行命令
else:
    执行命令
```



#### 1.1.3 多分支

```python
多选一或零
if 条件:
    执行命令
elif 条件:
    执行命令
elif 条件:
    执行命令
。。。

 
  
多选一 
if 条件:
    执行命令
elif 条件:
    执行命令
else 条件:
    执行命令  
```



## 2. while循环语句

### 2.1 语法

```python
#无限循环
while True:
    循环体
    
   
#有限循环
while 条件:
    循环体
```

### 2.2 关键字

```
break	 		终止当前循环
contiune	跳出本次循环，继续下次循环

⚠️break和continue下方的代码不会执行
```

### 

## 3. for循环语句

### 3.1 语法

```python
for 变量名 in 条件:
    循环体
```

### 3.2 for循环删除的坑

```python
#for循环删除列表中的内容，同样循环删除列表也适用于字典
//错误演示
lst = [1,2,3,4,5]
for i in lst:
    lst.remove(i)
print(lst)
[2, 4]	//结果错误，因为for循环删除一个元素后，后边的元素会往前补，当i是0的时候，删除1，此时2补上，2的下标变为了0，下一次for循环，会删除下标为1的，但是此时原本下标为1的元素2已经补前了，所以会删除3，依次类推，会隔空删除元素


//方法1
lst = [1,2,3,4,5]
for i in range(len(lst)):
    lst.pop(0)	#列表中的元素删除一个，后边的会继续补上，所以只删除第一个
print(lst)
[]


//方法2
lst = [1,2,3,4,5]
lst1 = lst.copy()	  #浅拷贝是两个变量各自占不同的内存空间，但是值还是共用
for i in lst1:	    #因此循环lst1删除值，lst也删除
    lst.remove(i)
print(lst)
[]
```



### 3.3 可迭代对象与不可迭代对象说明

```python
#可迭代对象
str -- 字符串
list -- 列表
tuple -- 元祖
set -- 集合
dict -- 字典
range -- 范围

#不可迭代对象
int -- 数字
bool -- 布尔值
```



### 3.4 代码示例

```python
#代码示例1，for循环会便利可迭代对象中的每一个字符，然后依次执行print，因为可迭代对象为4个字符，因此打印4行123
for i in "hehe"
    print (123)

打印结果
123
123
123
123


#代码示例2
for i in "abced"
    print (i)
  
打印结果
a
b
c
d
e
```



### 3.5 面试题 ⚠️

```python
#for循环面试题1
for i in "abcde":
    pass
print (i)

打印结果
e

⚠️for循环中遇到pass，只会打印可迭代对象中的最后一个字符
```

