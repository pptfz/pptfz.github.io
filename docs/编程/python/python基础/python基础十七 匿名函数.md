[toc]



# python基础十七	匿名函数

## 1. 定义

> 示例：给函数传两个参数并计算和
>
> f = lambda a,b:a+b
>
> 其中 a,b表示形参，可以传多个，冒号后边的表示函数体中要执行的代码



## 2. lambda函数简单示例说明

```python
//代码示例	给函数传两个参数并计算和
普通函数写法
def func(a,b):
    c = a + b
    return c
print(func(1,2))
3

匿名函数写法1
f = lambda a,b:a+b
print(f(1,2))
3

匿名函数写法2
print((lambda a,b:a+b)(1,2))
3
```

   

## 3. lambda函数与普通函数对比说明

```python
普通函数写法
def func(a,b):
    c = a + b
    return c
print(func(1,2))

匿名函数写法
print((lambda a,b:a+b)(1,2))


1.lambda和def是一样的
2.lambda中的 a,b 和def中的（a,b）是一样的
3.lambda中的 a+b 和def中的 return a + b 是一样的
4.lambda中a,b是形参，a+b是返回值，即冒号前边的是形参，冒号后边的返回值
	形参：可以接受位置参数、动态位置参数、默认参数、动态关键字参数
  返回值：只能返回一个数据，如果想返回多个数据，需要用()括起来
```





## 4. 匿名函数风骚走位

### 4.1 lambda+列表

#### 示例1

```python 
//示例1	这种写法结果是3个函数地址
print([lambda i:i+1 for i in range(3)])
[<function <listcomp>.<lambda> at 0x7f9bf0068620>, <function <listcomp>.<lambda> at 0x7f9bf00681e0>, <function <listcomp>.<lambda> at 0x7f9bf0068048>]

拆分写法
lst = []
for i in range(3):
    def func(i):
        return i+1
    lst.append(func)
print(lst)
[<function func at 0x7fab400d0e18>, <function func at 0x7fab300a8620>, <function func at 0x7fab300a81e0>]


示例1进阶版
//错误写法示例
g = [lambda i:i+1 for i in range(3)]	#lambda后边的i与for循环中的i没有关系
print([em() for em in g])
结果报错，因为lambda后的i是形参，em()没有传参，因此报错

拆分写法
lst = []
for i in range(3):
    def func(i):
        return i+1
    lst.append(func)

new_lst = []
for em in lst:
    new_lst.append(em())			#这里的em()就是func()
结果报错，因为em()没有传参


//正确写法示例
g = [lambda i:i+1 for i in range(3)]	#lambda后边的i与for循环中的i没有关系
print([em(3) for em in g])
[4, 4, 4]

拆分写法
lst = []
for i in range(3):
    def func(i):
        return i+1
    lst.append(func)

new_lst = []
for em in lst:			#此时lst = [func,func,func]
    new_lst.append(em(3))			#这里的em()就是func()
print(new_lst)
[4, 4, 4]

```

#### 示例2	

🦙🦙🦙**这个题一般人能想到？？？**

```python
g = [lambda x:x*i for i in range(3)]
for j in [2,10]:
    g1 = (em(3) for em in g)
print([e+j for e in g1])
[16, 16, 16]


代码拆分
#g = [lambda x:x*i for i in range(3)]拆分如下
lst = []		#循环完后这里是3个函数 [func,func,func]
for i in range(3):
    def func(x):
        return x*i
    lst.append(func)

for j in [2,10]:	#这里执行完后j就是10
    def g1():		#生成器存放于g1中,先循环2，然后循环10，会覆盖
        for em in lst:
            yield em(3)

new_lst = []            
for e in g1():	#g1()产生了一个生成器，一执行就触发for em in lst，lst是3个func，这里就是yield em(3)，执行3次func(3),就是执行3次return 3*2，因为i的for循环已经执行完成，最后的值i是2
    new_lst.append(e+j)		#6+10，循环3次
print(new_lst)
[16, 16, 16]
```



### 4.2 lambda+生成器

```python
//示例1
g = (lambda i:i+1 for i in range(3))	#lambda后边的i与for循环中的i没有关系
print([em(3) for em in g])
[4, 4, 4]

#代码解析
lambda i:i+1与for i in range(3)没有任何关系！！！
只是借助for循环执行了3次 return i+1
em(3)就是给i传递了参数，因此执行3次 i+1


拆分写法
def foo():
    for j in range(3):
        def func(i):
            return i+1
        yield func

g = foo()
lst = []
for i in g:            #这里的i就是func
    lst.append(i(3))
print(lst)
[4, 4, 4]



//示例2
g = [lambda :i+1 for i in range(3)]
print([em() for em in g])
[3, 3, 3]

#g = [lambda :i+1 for i in range(3)]拆分后如下
g = []		#循环3次后，列表中是3个func [func,func,func]
for i in range(3):
    def func():
        return i+1
    g.append(func)

#print([em() for em in g])拆分后如下
new_lst = []
for em in g:	#这里的g是[func,func,func]
    new_lst.append(em())	#em()就是调用函数func()，因为上边的for循环已经执行完成了，因此return i+1就是2+1=3,所以这里追加3次func()，func()就是执行return 2+1，所以结果是3次3
print(new_lst)
```

### 4.3 lambda+列表与lambda+生成器对比

```python
//不传参示例
g = [lambda :i+1 for i in range(3)]
print([em() for em in g])
[3, 3, 3]

g = (lambda :i+1 for i in range(3))
print([em() for em in g])
[1, 2, 3]


//传参示例
g = [lambda x:x*i for i in range(3)]
print([em(3) for em in g])
[6, 6, 6]

g = (lambda x:x*i for i in range(3))
print([em(3) for em in g])
[0, 3, 6]
```

