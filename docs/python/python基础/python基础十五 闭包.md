[toc]



# python基础十五	闭包

## 1.闭包

### 1.1作用

> 保护数据安全，保护数据干净性

### 1.2 定义

> 1.在嵌套函数内，使用非全局变量(且不使用本层变量)
>
> 2.将嵌套函数返回 ⚠️不能加函数的()

### 1.3 闭包注意点⚠️

> 1.⚠️⚠️⚠️ 没有将嵌套的函数返回也是一个闭包，但是这个闭包不能使用！！！
>
> 2.闭包不能传可变类型数据

### 1.4 示例

```python
//闭包示例1
def func():
    a = 10   						#自由变量
    def foo():
        print(a)
    return foo
f = func()
print(f.__closure__)  	#验证是否是闭包       
(<cell at 0x7fe15808a3d8: int object at 0x10fe06950>,)
⚠️在嵌套函数内，使用非全局变量(且不使用本层变量)



//示例2	未返回嵌套函数值，虽然是一个闭包，但是不能使用
def func():
    a = 10
    def foo():
        print (a)
    print (foo.__closure__)	#(<cell at 0x7fc7f819a3d8: int object at 0x103132950>,)
func()


//示例3
def func():
    a = 10
    def foo():
        print (a)
    return foo
func()()  #⚠️此时func() == foo  == foo()

func()()	
f = func()
f()


//示例4  ⚠️⚠️⚠️函数在接受参数的时候会在下边定义参数的变量
因此，这是一个闭包
def wrapper(a,b):
    #a = 2	⚠️函数接受参数就相当于在函数中再次定义这个变量
    #b = 3	⚠️函数接受参数就相当于在函数中再次定义这个变量
    def inner():
        print (a)
        print (b)
    return inner
a = 2
b = 3
ret = wrapper(a,b)
print(ret.__closure__) #(<cell at 0x7fce8804a3d8: int object at 0x107220850>, <cell at 0x7fce981a8f78: int object at 0x107220870>)


> 说明，虽然变量a和b是在wrapper同级定义的，但是wrapper中是接受ab两个参数的，会在wrapper下级定义ab两个变量
```

### 1.5 应用场景

```python
1.装饰器
2.防止数据被误改动
```

