[toc]



# python基础十三	装饰器

## 1.装饰器初识

### 1.1 开放封闭原则

> 1.对扩展开放  --> 支持增加新功能
>
> 2.对修改源代码是封闭，对调用方式是封闭的



### 1.2 含义

> 装饰：在原来的基础上额外添加功能
>
> 器：工具



### 1.3 示例

```python
//版本1 重复代码多	
要求：写一段代码，统计代码运行的时间
import time
start_time = time.time()
def aaa():
    time.sleep(1)
    print("author is aaa")
aaa()
print(time.time() - start_time)
author is aaa
1.0037147998809814

def bbb():
    time.sleep(1)
    print("author is bbb")
bbb()
print(time.time() - start_time)
author is bbb
2.0039119720458984

//版本2	定义函数 将重复代码放入函数中
import time
def aaa():
    time.sleep(1)
    print("auther is aaa")
    
def bbb():
    time.sleep(1)
    print("auther is bbb")
    
def run_time(f):
    start_time = time.time()
    f()
    print(time.time() - start_time)
run_time(aaa)		#这里括号中写函数aaa或者函数bbb

⚠️run_time()这里虽然能够传参执行，但是之前代码的调用方式为aaa()、bbb()，这样就改变了原先代码的调用方式，不符合开放封闭原则
ff = aaa
aaa = run_time()
aaa(ff)

⚠️以上3行代码为拆分思想，因为调用方式为run_time(aaa)，现在拆分
1.将aaa赋值给一个变量ff
2.将run_time赋值给aaa
3.执行aaa(ff) 因为run_time已经赋值给aaa,所以这里aaa就是run_time，而aaa已经赋值给ff，这里ff就是aaa 

run_time       aaa
   ⬇️          ⬇️
  aaa          ff

aaa(ff) == run_time(aaa)


⚠️以上代码只是求了aaa的执行结果，如果要求bbb的执行结果，还得再写3行，虽然这样符合了开放封闭原则，但是加大了代码量
不推荐这样写，接下来需要使用非常牛逼的装饰器



//版本3	装饰器
装饰器遵循开放封闭原则，即不改变原代码及调用方式
⚠️装饰器的本质就是闭包！！！
⚠️装饰器的本质就是闭包！！！
⚠️装饰器的本质就是闭包！！！

#写法1
import time
def run_time(f):
    def inner():
        start_time = time.time()
        f()
        print(time.time() - start_time)
    return inner	#⚠️这里不能加括号

#原程序功能代码
def aaa():
    print("auther is aaa")
    
aaa = run_time(aaa)
aaa()    
    
#写法1扩展写法
import time
def run_time(f):
    def inner():
        start_time = time.time() #被装饰函数前
        f()
        print(time.time() - start_time) #被装饰函数后
    return inner	#⚠️这里不能加括号

#原程序功能代码
@run_time		#语法糖，aaa = run_time(aaa),语法糖必须放在被装饰的函数正上方，@run_time就相当于aaa = run_time(aaa)
def aaa():
    print("auther is aaa")
    
aaa()
```





### 1.4最简单的装饰器

### 1.4.1不加语法糖的装饰器

```python
import time
def run_time(f):
    def inner():
        start_time = time.time()
        f()
        print(time.time() - start_time)
    return inner    #不能加括号

def index():    #函数原有功能
    print('is index')

index = run_time(index)
index()

结果：
is index
2.574920654296875e-05
```

**来个最简单的装饰器执行步骤分析**

![iShot2020-10-16 11.57.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-16 11.57.21.png)



### 1.4.2加语法糖的装饰器

```python
import time
def run_time(f):
    def inner():
        #这里是被装饰函数之前
        start_time = time.time()
        
        #这个是被装饰的函数。我们看到的f其实是index
        f()
        
        #这里是被装饰函数之后
        print(time.time() - start_time)
    return inner    #不能加括号

#语法糖加在要执行的函数的上边  
@run_time   #index = run_time(index)
def index():    #函数原有功能
    print('is index')

# index = run_time(index)，不加语法糖之前的写法，比较麻烦，如果有多个函数需要调用的话就需要写多遍
index()

结果：
is index
3.409385681152344e-05
```



## 2.标准版装饰器

```python
def wrapper(func):
    def inner(*args,**kwargs):
        func(*args,**kwargs)
    return inner
  
@wrapper
def index():
    print("is index")
index()
```

