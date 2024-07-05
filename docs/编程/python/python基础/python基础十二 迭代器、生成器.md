[toc]



# python基础十二	迭代器、生成器

## 1.迭代器

### 1.1 含义

``一个一个取值``



### 1.2 可迭代对象

```python
#Python中规定,只要是具有__iter__()方法就是可迭代对象       
str.__iter__()                           
list.__iter__()                          
tuple.__iter__()                         
dict.__iter__()                          
set.__iter__()    

⚠️可迭代对象能够重复取值
```



### 1.3 迭代器使用示例

```python
//使用示例1   将迭代器赋值给一个变量，这样就能重复取值了
可迭代对象能够重复取值                   
lst = [1,1,2]             
                              
将可迭代对象转换成迭代器        
l = lst.__iter__()            
print(l)          		
	#结果：<list_iterator object at 0x7fc49811a0f0>，迭代器的内存空间地址        
print(l.__next__())  	#结果：1
print(l.__next__())  	#结果：1   
print(l.__next__())  	#结果：2
print(1.__next__())		#结果：StopIteration 停止迭代，不能超过元素个数
⚠️有多少个元素就只能next多少次


//使用示例1		单独执行迭代器，这样每次只能取第一个值
lst = [1,1,2,4,5]				

⚠️以下两个lst.__iter__()迭代器内存地址，mac中显示的是一样，win本有的一样，有的不一样！！！
print(lst.__iter__())		#<list_iterator object at 0x7fd0a80110f0>
print(lst.__iter__())		#<list_iterator object at 0x7fd0a80110f0>
print(lst.__iter__().__next__())  #结果：1  #lst.__iter__() 是一个迭代器1
print(lst.__iter__().__next__())  #结果：1  #lst.__iter__() 是一个迭代器1
⚠️这里迭代器是多个
```



### 1.4 for循环本质

```python
⚠️⚠️⚠️for循环就是一个迭代器
s = "hehe"
for i in s:
    print (i)
h
e
h
e 



s = "hehe"
s1 = s.__iter__()
while True:
    print (s1.__next__())
         
结果会报错如下：停止迭代         
StopIteration         
  
  
  
s = "hehe"
s1 = s.__iter__()
while True:
    try:     #尝试着运行一下缩进体中的内容，如果运行有问题用except接收一下
        print (s1.__next__())
    except StopIteration:
        break           
结果如下：
h
e
h
e
```



### 1.5 python3中迭代器用法

```python
//python1和python2中迭代器共同用法
lst = ['a',1,2,4,5]
print (iter(lst))
print (iter(lst))
print (iter(lst).__next__())
print (iter(lst).__next__())

结果如下：
<list_iterator object at 0x7fe4e8071668>
<list_iterator object at 0x7fe4e8071668>
a
a


//python1中支持__iter__()方法
//python1中不支持 __next__()方法
```



## 2.生成器

### 2.1 生成器含义

> 控制循环迭代行为，一边循环一边计算的特殊程序
>
> 例如，创建一个包含100万元素的列表，不仅占空间。而且如果只访问前边几个元素，后续的元素空间就白白浪费了，生成器可以根据规则生成后续元素



### 2.2 生成器定义

> 1.基于函数实现的生成器
> 2.表达式实现生成器



### 2.3 生成器本质

> 生成器的本质就是一个迭代器

> 迭代器：文件句柄，通过数据转换，python自带提供
>
> 生成器：程序员自己实现



### 2.4 生成器使用示例

#### 2.4.1 定义及创建生成器

```python
#定义一个函数
def func():
    print (1)
    return 5
print (func())  
1
5

⚠️函数题中存在关键字yield就是定义一个生成器
#定义一个生成器
def func():
    print (1)
    yield 5
print (func()) 		#⚠️这一步才算是创建一个生成器对象
<generator object func at 0x7f8df8127d00>

```

#### 2.4.2 语法及词法

```python
⚠️代码执行的时候有多个对象在工作
语法检查
词法检查


//示例1
def func():
    print (foo)
返回结果为空

原因：
	函数没有被调用，因此不报错

//示例1
def func():
    if 2 > 1
结果：
	SyntaxError: invalid syntax

原因：
	首先进行语法检查，语法错误

  
//示例2
def func():
    foo()
func()
结果：
	报错,语法检查没有问题，但是词法检查有问题

```

#### 2.4.3 生成器使用

##### 2.4.3.1 生成器使用示例1

```python
⚠️⚠️⚠️生成器最大特点：惰性机制
//示例1
def func():
    yield 1		#记录执行位置，当第一次next的时候记录，第二次next的时候就开始从下边取值
    yield 1
    yield 2
    
g = func()			#获取的是生成器的内存地址
print (next(g))	#取值 1
print (next(g))	#取值	1
print (next(g))	#取值	2
print (next(g))	#取值	会报错 StopIteration

```

##### 2.4.3.2 生成器使用示例2

```python
//示例1
def func():
    yield 1		#记录执行位置，当第一次next的时候记录，第二次next的时候就开始从下边取值
    yield 1
    yield 2
    
g = func()
g1 = func()
g1 = func()
print (g)
print (g1)
print (g1)
<generator object func at 0x7faa180b7d00>
<generator object func at 0x7faa180b7db0>
<generator object func at 0x7faa180b7e08>

print (next(func()))		#这是一个生成器1
print (next(func()))		#这是一个生成器1
print (next(func()))		#这是一个生成器2
1
1
1


⚠️⚠️⚠️yield和return部分功能很像
def func():
    yield
print(next(func()))
None								#yeild后边不写内容返回的是None

```

##### 2.4.3.3 生成器使用示例3

```python
//示例2
def func():										#1
    def foo():								#1
        print (1)							#2
    yield foo									#4
g = func().__next__()					#5
print (g)					#结果 <function func.<locals>.foo at 0x7fdb08082400>
print (g())				#结果 1 None
print (type(g))		#结果 <class 'function'>

🐷示例2执行过程
第一步，定义一个函数func()：  第1行
第二步，执行第5行的func()，创建一个生成器
第三步，执行第5行func().__next__()，进行去值，获取的是生成器的内存空间地址
第四步，执行第1、2行的foo函数，只是定义一个foo函数，没有实际调用
第五步，执行第4行的yield foo，yield foo获取的是foo函数的内存空间地址，并且返回给变量g  此时g就是foo函数的内存地址
第六步，print (g)，返回的是foo的函数内存地址
第七步，print (g())，g() == foo()，返回1，函数体中默认返回None
第八步，print (type(g))，返回的是foo函数的类型

```

##### 2.4.3.4 生成器使用示例4

```python
//示例4
def func():
    yield 1,1,2,4,5
    print (112)
    yield 1111
    yield 666
g = func()
print (next(g))		#结果 (1, 1, 2, 4, 5)
print (next(g))		#结果 112 1111

```

### 2.5 时间 空间

#### 2.5.1 空间换时间

```python
//概念
例如，一个列表要产生50000个元素，一次性创建，这样就是用了空间换了时间
用一次性生成占用大量空间的元素换取快速读取时间




```

#### 2.5.2 时间换空间

```python
//概念
例如，还是一个列表创建50000个元素，这次不一次性创建，而是创建一个监控者，用一个元素由监控者取一个，这样就节省了大量内存空间，但是需要读取的时间变长

//代码示例
def func():
    for i in range(1,50001):
        yield i
g = func()
print (next(g))		#结果1
print (next(g))		#结果1

这样就是需要一个然后读取一个，节省了内存空间地址，但是需要消耗大量时间

```

### 2.6 yield from

```python
yield from 逐个返回对象

//示例1 将元素整体返回
def func():
    yield [1,1,2,4,5]		#将元素整体返回
g = func()
print (next(g))
[1, 1, 2, 4, 5]

//示例1 将元素逐个返回
def func():
    yield from [1,1,2,4,5]
g = func()
print (next(g))
print (next(g))
print (next(g))
1
1
2


//示例2	多个yield，逐个返回一个yield的元素再返回下一个yield的
def func():
    yield from [1,1,2]
    yield from ['a','b','c','d','e']
g = func()
print (next(g))
print (next(g))
print (next(g))
print (next(g))
1
1
2
a

#yield总结
yield 能返回多个,以元组的形式存储       
yield 能返回各种数据类型(Python的对象) 
yield 能够写多个并且都执行           
yield 能够记录执行位置             
yield 后边不写内容 默认返回None      
yield 都是将数据一次性返回           

```



## 3.区分迭代器和生成器及迭代对象说明

```python
#方法1
具有send()方法的就是一个生成器


#方法1
查看内存地址

//示例
lst = [1,1,2]
print (lst.__iter__())		#结果 <list_iterator object at 0x7fc568161668>

def func():
     yield 1
print (func())	#结果 <generator object func at 0x7fc55804fd00>


⚠️⚠️⚠️
生成器一定是一个迭代器，但是迭代器不一定是一个生成器


//迭代对象
具有__iter__()方法的就是一个可迭代对象

//迭代器:                              
具有__iter__() 和 __next__()方法就是一个迭代器

//生成器:                              
基于函数创建的生成器,函数体中必须存在yield          

```

## 4.迭代器和生成器优缺点总结

```python
#优点
节省空间

#缺点
1.不能直接使用元素
1.不能直观查看元素的个数
2.使用不灵活
4.稍微消耗时间
5.一次性执行，不能逆行执行

```

