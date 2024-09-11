[toc]



# python基础十一	函数

## 1.函数的作用

``封装代码,大量的减少重复代码,重用性高``



## 2.函数的定义

```
def 函数名():
    函数体
    
 
def 是一个关键字，申明要定义一个函数
():是固定写法
函数体中写的是需要用到的重复代码
```



## 3.函数的调用

``函数名()``



## 4.函数的返回值

```python
#函数返回值总结
函数体中不写return默认返回None,或者写了return不写值返回的也是None    
return 能够返回任意数据类型(python中所有对象)                 
return 能够返回多个数据类型,以元组的形式接收                     
return 能够终止函数,return下方的代码不执行                   
return 将返回值返回给调用者


//return示例
def func():
    a = 10
    return a
a = func()
print(a)
```



## 5.函数的参数

### 5.1位置参数

```python
//函数参数示例
def hehe(app):							//形参数
    print ("打开:",app)			//注意必须用逗号隔开

hehe("微信")								//实参
执行结果返回如下：
打开: 微信
  

//位置参数示例
def ball(web, players, age, addr):  	#形参
    print("登陆NBA官网")
    print(f"打开{web}")
    print(f"找一位{players},要求年龄:{age},地区:{addr}的人")
    print("看看视频")
    print("学学球技")


ball("视频专区", "球员", 28, "洛杉矶")  	#实参  按照位置传参
登陆NBA官网
打开视频专区
找一位球员,要求年龄:28,地区:洛杉矶的人
看看视频
学学球技
```



### 5.2 默认参数

```python
//默认参数示例
def ball(web, players, age, addr="洛杉矶"):  #addr="洛杉矶"表示默认参数
    print("登陆NBA官网")
    print(f"打开{web}")
    print(f"找一位{players},要求年龄:{age},地区:{addr}的人")
    print("看看视频")
    print("学学球技")


ball("视频专区", "球员", 28)  #实参这里可不写形参中定义的默认值
ball("视频专区","球员",30,"波士顿")	#实参写内容会覆盖形参中定义的默认参数


登陆NBA官网
打开视频专区
找一位球员,要求年龄:28,地区:洛杉矶的人
看看视频
学学球技
登陆NBA官网
打开视频专区
找一位球员,要求年龄:30,地区:波士顿的人
看看视频
学学球技

```



### 5.3 关键字传参

```python
//关键字传参示例
def fun(a,b,c=1,d=2):
    print (a,b,c,d)

fun(1,2,3,4)               //结果是1 2 3 4
fun(a="呵呵",b="哈哈")      //结果是呵呵 哈哈 1 2
fun(1,2,d="呵呵")          //结果是1 2 1 呵呵  
```



### 5.4 动态参数 *args

#### 5.4.1 动态参数作用

``1.能够接受不固定长度的参数``

``2.位置参数过多时可以使用动态参数``



#### 5.4.2 动态参数使用方法

```python
def func(*c):  #形参位置上的*是聚合
    print(*c)  #函数体中的*就是打散

func(1,2,3,4,5,6,7,8,9,0)
结果如下：
1 2 3 4 5 6 7 8 9 0



def func(a,b,*c):		# *c就表示动态参数
    print (a,b,*c)

func(1,2,3,4,5,6,7,8)
1 2 3 4 5 6 7 8
```



### 5.5 动态关键字参数 **kwages

#### 5.5.1 动态关键字参数作用

``只接收多余的动态位置参数  注意是只接收``



#### 5.5.2 动态关键字参数使用方法

```python
//动态关键字使用方法示例1
def func(a,b,**kwargs):
    print (kwargs)

func(a=1,b=2,c=3,d=4,e=5)
结果如下：
{'c': 3, 'd': 4, 'e': 5}


//动态关键字参数使用方法示例2
dic = {"key": 1, "key2": 2}

def func(**kwargs):   #聚合
    print(kwargs)     #打散

func(**dic)  				  #打散 func(key=1,key2=2)
结果如下：
{'key': 1, 'key2': 2}
```



### 5.6 函数参数面试题

```python
#万能传参
def func(*args, **kwargs):  
    print(args, kwargs)

func(12, 2, 121, 12, 321, 3, a=1, b=2)
结果如下
(12, 2, 121, 12, 321, 3) {'a': 1, 'b': 2}

*xargs获取的是一个元组
**kwargs获取的是一个字典


#*args和**kwargs
def func(*args, a1=8,**kwargs):  #万能传参
    print(args, kwargs)  #函数体中的*args是将元组打散,*kwargs是将字典的键获取到

func(12, 2, a1=1, b1=2)
结果如下：
(12, 2) {'b1': 2}
```



### 5.7 函数参数总结

```python
#参数的总结:    
1.形参
在定义函数的阶段就是形参                                         
    可以单独使用位置参数,也可以单独使用默认参数,也可以混合使用                   
    位置传参:必须一一对应                                      
    默认参数:可以不传参,可以传参,传参就是把默认的值给覆盖                     
    混合使用:位置参数,默认参数                                   

2.实参
在调用函数的阶段就是实参                                         
    可以单独使用位置参数,也可以单独使用关键字参数,也可以混合使用                  
    位置传参:必须一一对应                                      
    关键字参数:指名道姓的方式进行传参                                
    混合使用:位置参数,默认参数          

3.参数总结
位置参数,动态位置,默认参数,动态关键字参数                                      
*args 程序员之间约定俗称(可以更换但是不建议更换)                                
**kwargs 程序员之间约定俗称(可以更换但是不建议更换)                             
*args 获取的是一个元组                                              
**kwargs 获取的是一个字典                                           
                                                            
*args 只接受多余的位置参数                                            
**kwargs 只接受多余的关键字参数                                        
 

4.函数参数优先级  
数参数优先级: 位置参数 > 动态位置参数(可变位置参数) > 默认参数 > 动态关键字参数(可变关键字参数)     
```



## 6.函数的注释

```python
#注释方法1
def a(a,b):
    """
    数字加法运算
    :param a: int
    :param b: int
    :return: int
    """
    return a + b

print (a(1,2))


#注释方法2
def func(a:int,b:int):      #这里的a:int只是做到一个约束，并没有实际作用
    """
    加法运算
    :param a:
    :param b:
    :return:
    """
    return a + b

print (func(1,2))



//查看函数的注释	func.__doc__
print (func.__doc__)
    加法运算
    :param a:
    :param b:
    :return:
      
      
//查看函数的名字	a.__name__
代码在编写过程中会设计到函数名赋值，例如
def func(a,b):
    return a + b
a = func
print (a(1,2))
print (a.__name__)
func
```

## 7.函数的名称空间

### 7.1函数名称空间分类

```python
1.内置空间 -- 存放pyhton自带一些函数            
2.全局空间 -- 当前py文件顶格编写的代码开辟的空间        
3.局部空间 -- 函数开辟的空间         

程序加载顺序: 内置空间 > 全局空间 > 局部空间 
程序取值顺序: 局部空间 > 全局空间 > 内置空间 
  
//代码示例
a = 10						#这里的10是全局变量
def func():
    a = 5					#这里的5是局部变量
    print (a)

print (func())
5
None
```

### 7.2函数的作用域

```python
1.全局作用域: 内置 + 全局   globals() #查看全局作用域          
2.局部作用域: 局部         locals()  #查看当前作用域(建议查看局部) 
 

//代码示例	查看全局
a = 10
b = 20
print (globals())
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <_frozen_importlib_external.SourceFileLoader object at 0x7ffe70016710>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>, '__file__': '/jetBrains/pycharm/python-works/python基础/test.py', '__cached__': None, 'a': 10, 'b': 20}


//代码示例	查看局部
def func():
    a = 10
    print (locals())
func()
{'a': 10}
```



## 8.函数的第一类对象

### 8.1总概

```python
1.函数名可以当做值,赋值给一个变量    
2.函数名可以当做另一个函数的参数来使用  
3.函数名可以当做另一个函数的返回值    
4.函数名可以当做元素存储在容器中     
```

### 8.2 函数名可以当作值，赋值给一个变量

```python
//代码示例
def func():
    print(1)

a = func			#函数名是func，然后赋值给了a，打印a与func的函数内存空间地址一样，并且执行a()相当于执行func()
print(func)  	#函数的内存地址 <function func at 0x7fb2b00d0e18>
print(a)			#函数的内存地址 <function func at 0x7fb2b00d0e18>
a()    				#结果 1
```

### 8.3 函数名可以当作另一个函数的参数来使用

```python
//代码示例
def func():
    print(1)


def foo(a):     #a = func  <function func at 0x7fb2b00d0e18>
    print(a)    #func这个函数的内存地址 <function func at 0x7fb2b00d0e18>

foo(func)

func函数当作了foo函数的参数
```

### 8.4 函数名可以当作另一个函数的返回值

```python
//代码示例
def func():
    return 1  	#print


def foo(a):     #a = func函数的内存地址
    return a    #return func函数的内存地址


cc = foo(func)
print(cc)       #func函数的内存地址 <function func at 0x7fe160020e18>
```

### 8.5 函数名可以当作元素存储在容器中

```python
容器：字典、元组、列表、集合

//代码示例	
def func():        
    print(1)       
                   
def foo():         
    print(2)       
                   
def f():           
    print(3)       
    
lst = [func,foo,f] 

⚠️将函数放在容器中的好处，可以使用for循环批量执行函数，而不是一个一个执行
for i in lst:      
    i()         
1
2
3


//代码示例	购物平台
⚠️整体思路
1.定义5个函数，模拟购物平台注册、登陆
2.将这5个步骤的函数存入字典中
3.让用户选择要执行的操作，然后执行函数完成功能实现

def register():
    print("注册")
    
def login():
    print("登录")

def shopping():
    print("浏览商品")

def add_shopping_car():
    print("加入购物车")

def buy_goods():
    print("购买")


msg = """                                                                           
1.注册                                                                               
2.登录                                                                               
3.浏览商品                                                                                
4.加入购物车                                                                            
5.购买                                                                                
请输入您要选择的序号:                                                                        
"""
func_dic = {"1": register, "2": login, "3": shopping, "4": add_shopping_car, "5": buy_goods}
while True:
    choose = input(msg)                                                     
    if choose in func_dic:
        func_dic[choose]()
    else:
        print("退出商城")                                                                 
```



## 9.函数的嵌套

### 9.1 分类

> 1.交叉嵌套
>
> 2.嵌套



### 9.2 交叉嵌套

#### 9.2.1 交叉嵌套示例1

```python
def func(foo):
    print (1)
    foo()
    print (3)

def a():
    print (1)

func(a)
1
1
3

上述代码进一步说明
def func(foo):                                       
    print(1)                                         
    v = foo()  #第一个功能是调用函数,第二个功能是接收返回值              
    #v = None                                       
    #print(v) #None                                
    print(3)                                         
1
1
None
3

```

![iShot_2024-08-29_14.32.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-29_14.32.42.png)



#### 9.2.2 交叉嵌套示例2

```python
//代码示例
def func():
    print(1)
    print("太难")
    print(2)

def foo(b):
    print(3)
    b()
    print(4)

def f(a,b):
    a(b)

f(foo,func)

最终结果
3
1
太难
2
4

```



#### 9.2.3 交叉嵌套示例3

```python
def func(a,b):
    def foo(b,a):
        print(b,a)
    return foo(a,b)
a = func(4,7)
print(a)

结果
4 7
None

```



#### 9.2.4 交叉嵌套示例4

```python
//代码示例1
def func(a,b):
    a = a + b
    b = a + 10
    def foo(a,d):
        def f(e,f):
            print(f,e)
            return "呵呵"
        f(d,a)
    foo(b,a)
print(func(2,3))

结果
15 5
None

⚠️return "呵呵"返回给了f，f是foo函数的最后一行，默认返回None，foo又是func函数的最后一行，默认返回None


//代码示例2
def func(a,b):
    a = a + b
    b = a + 10
    def foo(a,d):
        def f(e,f):
            print(f,e)
            return "呵呵"
        return f(d,a)
    return foo(b,a)
print(func(2,3))

结果
15 5
呵呵

```

## 10. 函数关键字global与nonlocal

#### 10.1 global

**global**

> 1.global只修改全局空间中的变量
>
> 2.在局部空间中可以使用全局中的变量,但是不能修改,如果要强制修改需要添加global
>
> 3.当变量在全局存在时global就是申明我要修改全局的变量,并且会在局部开辟这个变量
>
> 4.当变量在全局中不存在时global就是申明要在全局创建一个变量,并且会在局部开辟这个变量



1.函数中加关键字global对全局变量进行修改

```python
//不加global关键字
a = 10
def func():
    a += 1

func()
print(a)

结果报错
UnboundLocalError: local variable 'a' referenced before assignment
  

当全局变量a存在时
//使用glboal关键字，global关键字申明变量a是全局变量
a = 10
def func():
    global a		#申明要修改全局的变量a
    a += 1

func()
print(a)

结果：
11


当全局变量a不存在时
//使用global关键字申明并创建全局变量a
def func():
    global a
    a = 10

func()
print(a)

结果：
10
```

**当变量在全局存在时globla就是申明我要修改全局变量，并且会在局部开辟同名变量**

**当变量在全局不存在时global就是申明要在全局创建一个变量**



#### 10.2 nonlocal

**nonlocal**

> 1.nonlocal只修改局部空间中的变量,最外层的一个函数
>
> 2.只修改离nonlocal最近的一层,如果这一层没有就往上一层查找,只能在局部
>
> 3.nonlocal 不能进行创建



nonlocal只修改局部空间中的变量，最外层的一个函数

只修改离nonlocal最近的一层函数，如果这一层没有就往上一层查找，只能在``局部``

```python
//代码示例1
def func():
    a = 10
    def foo():
        a = 20
        def f():
            nonlocal a
            a += 1
            print(a)
        f()
    foo()
func()

结果：
21


//代码示例2
a = 15
def func():
    a = 10
    def foo():
        def f():
            nonlocal a
            a += 1
            print(a)    #11
        print(a)    #10
        f()
    foo()
    print(a)    #11
func()
print(a)    #15

结果：
10
11
11
15


```



global与nonlocal结合示例

```python
a = 10
def func():
    a = 5
    def foo():
        a = 3
        def f():
            nonlocal a
            a += 1
            def aa():
                a = 1
                def bb():
                    global a
                    a += 1
                    print(a)    #11
                bb()
                print(a)    #1
            aa()
            print(a)    #4
        f()
        print(a)    #4
    foo()
    print(a)    #5
func()
print(a)    #11

结果：
11
1
4
4
5
11
```

