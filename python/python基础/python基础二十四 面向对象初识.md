[toc]



# python基础二十四	面向对象初识

# 1.面向过程与面向对象

## 1.1什么是面向过程？

### 1.1.1面向过程概念

**在未学习面向对象之前写的代码都算是面向过程**

**例如，想要实现一个功能，分析出解决问题所需要的步骤，然后用代码或者函数逐一实现，并按照代码顺序调用，这就是面向过程**



### 1.1.2面过程优缺点

**优点**

- **性能比面向对象高，因为类调用时需要实例化，开销比较大，比较消耗资源;比如单片机、嵌入式开发、Linux/Unix等一般采用面向过程开发，性能是最重要的因素**

**缺点**

- **维护性、复用行、扩展性较差**



## 1.2什么是面向对象？

### 1.2.1面向对象概念

- **面向对象的程序设计的核心是对象（上帝式思维），要理解对象为何物，必须把自己当成上帝，上帝眼里世间存在的万物皆为对象，不存在的也可以创造出来**

- **⾯向对象思维, 要⾃⼰建立对象. ⾃⼰建立场景. 你是就是⾯向对象世界中的上帝. 你想让⻋⼲嘛就⼲嘛. 你想让⼈⼲嘛⼈就能⼲嘛**

### 1.2.2面向对象优缺点

**优点**

- **是一类相似功能函数的集合,使你的代码更清晰化，更合理化**

- **易维护、易复用、易扩展，由于面向对象有封装、继承、多态性的特性，可以设计出低耦合的系统，使系统更加灵活、更加易于维护** 



**缺点**

- **性能比面向过程低**



### 1.2.3面向对象特点

**特点**

> 1.程序设计的重点在于数据而不是过程； 
>
> 2.程序被划分为所谓的对象； 
>
> 3.数据结构为表现对象的特性而设计； 
>
> 4.函数作为对某个对象数据的操作，与数据结构紧密的结合在一起； 
>
> 5.数据被隐藏起来，不能为外部函数访问； 
>
> 6.对象之间可以通过函数沟通； 
>
> 7.新的数据和函数可以在需要的时候轻而易举的添加进来； 
>
> 8.在程序设计过程中遵循由下至上（bottom-up）的设计方法。 





# 2.类与对象

## 2.1什么是类？

### 2.1.1类的概念

> 对象的抽象，一类事物的总称
>
> 具有相同属性和功能的一类事物



### 2.1.2类的说明

>  类：就是具有相同属性和功能的一类事物，比如，狗类、猫类、人类
>
> 狗类中的金毛、猫类中的橘猫、人类中的男人、女人就是具体的对象

> 汽车，车有轮胎、发动机、方向盘等等，车就是类
>
> 人，人有思想、名字、年龄、爱好、性别，人就是类





## 2.2什么是对象？

### 2.2.1对象的概念

> 类的具象，即对象为类的具体实现，通过类可以创建对象



### 2.2.2对象的说明

> 对象：就是类的具体表现形式，例如狗类中的金毛、猫类中的橘猫、人类中的男人、女人就是具体的对象



# 3.类操作

## 3.1创建类

> 语法
>
> class 类名():
>     属性
>     方法

**代码示例**

```python
//创建一个人类，人类有属性姓名、年龄、爱好，人类有方法玩
class Person():
    name = "呵呵"
    age = 20
    hobby = "玩"
    
    def play(self):		#这里的self是固定写法
      print("人喜欢玩")
```

### 3.1.1类属性

> 上述代码中的name、age、hobby就是类属性，属于类中的全局属性，后续还有传参方式的私有属性



### 3.1.2类方法

> 将函数写在类中加上默认参数self就是类中的方法，self不是固定叫self，只不过大家约定俗称叫self
>
> 上述代码中的函数play就是类方法，self代表类实例对象本身，⚠️不是类本身



## 3.2类名的操作

### 3.2.1类名操作静态属性

**方式一	``类名.__dict__()`` 查看类中所有内容**

```python
类名.__dict__()只能做查看操作，不能修改、删除


class Person():
    name = "呵呵"
    age = 20
    hobby = "玩"

    def play(self):
        print("人喜欢玩")

#查看类中所有的内容        
print(Person.__dict__)
结果：
{'__module__': '__main__', 'name': '呵呵', 'age': 20, 'hobby': '玩', 'play': <function Person.play at 0x7f9370062400>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None}

```



**方式二	万能的点 .	操作单个属性(增删改查)	**

```python
万能的点可以做增、删、改、查操作

class Person():
    name = "呵呵"
    age = 20
    hobby = "玩"

    def play(self):
        print("人喜欢玩")
        

#增操作	增加类属性
Person.weight = 100
print(Person.weight)
结果：
100

#删操作	删除类属性
del Person.name
print(Person.name)
结果：
AttributeError: type object 'Person' has no attribute 'name'
  
#改操作	修改类属性
Person.name = "哈哈"
print(Person.name)
结果：
哈哈

#查操作	查看类属性
print(Person.name)
结果：
呵呵
```



### 3.2.2类名操作动态方法

**⚠️除了类中的属性和类方法之外，一般都是通过对象名操作**

```python
class Person():
    name = "呵呵"
    age = 20
    hobby = "玩"

    def play(self):
        print("人喜欢玩")
        
Person.play(1)	#1是随便传的一个参数，因为类中方法必须有一个参数
结果：
人喜欢玩
```

### 3.2.3增加类的静态属性

```python
//类外增加
class Person:
    def __init__(self,name):
        self.name = name

    def func(self,sex):
        self.sex = sex

    def func1(self):
        Person.bbb = 'ccc'

Person.aaa = '小明'
print(Person.__dict__)
结果：
{'__module__': '__main__', '__init__': <function Person.__init__ at 0x7fbe48022400>, 'func': <function Person.func at 0x7fbe480221e0>, 'func1': <function Person.func1 at 0x7fbe48022378>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None, 'aaa': '小明'}


```



# 4.对象操作

## 4.1创建对象

**对象是从类中出来的，只要是类名加上（），这就是一个实例化过程，这个就会实例化一个对象。**

```python
class Person():
    name = "呵呵"
    age = 20
    hobby = "玩"

    def play(self):
        print("人喜欢玩")

man = Person()	#实例化对象
print(man)
<__main__.Person object at 0x7f92c80402b0>
```

**实例化对象发生的事情**

**1.在内存中开辟了一个对象空间。**

**2.自动执行类中的``__init__``方法，并将这个对象空间（内存地址）传给了``__init__``方法的第一个位置参数self。**

**3.在``__init__`` 方法中通过self给对象空间添加属性。**

**以下为代码示例**

```python
class Person():
    #self和man指向的是同一个内存地址同一个空间，下面就是通过self给这个对象空间封装四个属性
    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

man = Person("小明",20,'男')	#实例化对象，man现在就是Person类的实例化对象
man.a()	#调用类中的方法
结果：
我叫小明,我今年20了,我是男的

```

## 4.2对象的操作

### 4.2.1对象名操作对象空间属性

**方式一	对象名查看对象中所有属性**	``对象名.__dict__``

```python
class Person():
    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

man = Person("小明",20,'男')
print(man.__dict__)
结果：
{'name': '小明', 'age': 20, 'sex': '男'}
```



**方式二	万能的点 .**

```python
万能的点可以做增、删、改、查操作


class Person():
    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

man = Person("小明",20,'男')


#增操作	增加类属性
man.job = "python开发"
print(man.job)
结果：
python开发

#删操作	删除类属性
del man.name
print(man.name)
结果：
AttributeError: 'Person' object has no attribute 'name'
  
#改操作	修改类属性
man.name = "小红"
print(man.name)
结果：
小红

#查操作	查看类属性
print(man.name)
结果：
小明
```

### 4.2.2对象名查看类中属性

```python
class Person():
    size = 36
    weight = 100
    
    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

man = Person("小明",20,'男')

#通过对象名查看类中属性
print(man.size,man.weight)
36	100
```

### 4.2.3对象名操作类中方法

**类中的方法一般都是通过对象执行的（除去类方法，静态方法外），并且对象执行这些方法都会自动将对象空间传给方法中的第一个参数self**

```python
class Person():
    size = 36
    weight = 100

    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

    def f1(self):
        print("我是类中的方法f1")

man = Person("小明",20,'男')
man.f1()

结果：
我是类中的方法f1
```

### 4.2.4增加对象属性

```python
//类外添加
class Person:
    def __init__(self,name):
        self.name = name

    def func(self,sex):
        self.sex = sex
#类外面可以：
obj = Person('小明')
obj.age = 20
print(obj.__dict__)  
结果：
{'name': 'meet', 'age': 18}


//类内添加
class Person:
    def __init__(self,name):
        self.name = name

    def func(self,sex):
        self.sex = sex

#类内部也可以：
obj = Person('小明')      # __init__方法可以。
obj.func("男")           #func方法可以
print(obj.__dict__)
结果：
{'name': '小明', 'sex': '男'}
```



# 5.补充说明

## 5.1self是什么

> self其实就是类中方法（函数）的第一个位置参数，只不过解释器会自动将调用这个函数的对象传给self。所以把类中方法的第一个参数约定俗成设置成self, 代表这个就是对象.这个self可以进行改变但是不建议大家进行修
>
> 传参分为隐式传参和显示传参,self这种方式就是隐式传参

```python
class Person():
    size = 36
    weight = 100

    def __init__(self,name,age,sex):
        self.name = name
        self.age = age
        self.sex = sex

    def a(self):	#这里的self就是对象man
        print(f"我叫{self.name},我今年{self.age}了,我是{self.sex}的")

man = Person("小明",20,'男')
man.a()
结果：
我叫小明,我今年20了,我是男的

```

## 5.2 类中``__init__()``方法

**构造方法：类中的``__init__()``方法（主要用作初始化）**

```python
在obj = 类名()	执行后做了两件事
  	#1.创建对象，对象名叫obj
    #2.通过对象执行类中的一个特殊方法 __init__
    
class Bar:
    def __init__(self):		#这里的self就是对象名obj
        print('123')
obj = Bar()
```

**类中``__init__()``方法示例**

```python
//第一版代码
class Man:
    def __init__(self, name, age):
        self.n = name
        self.a = age
        print(f"我叫{self.n},我今年{self.a}岁")

b = Man("小明", 20)

#打印结果
我叫小明,我今年20岁

#内存中发生的事
内存中有一个空间存放类Man，__init__()方法在类Man中，对象b指向类Man
类中的__init__()方法会自动执行

#代码说明
类Man中的self就是对象b，self.n就是b.n
__init__()就叫构造方法，构造方法会在类名()的时候自动执行，即在b = Man()的时候自动执行 


//第二版代码
class Man:
    def __init__(self, name, age):
        """
        构造方法，会在类名()的时候自动执行，即在b = Man()的时候自动执行 
        :param name:
        :param age:
        """
        self.n = name
        self.a = age
    def show(self):
      print(f"我叫{self.n},我今年{self.a}岁")

b = Man("小明", 20)
b.show()

#打印结果
我叫小明,我今年20岁
```

## 5.3对象、类查找属性的顺序

**对象查找属性的顺序**

对象空间 ------> 类空间 ------> 父类空间



**类查找属性的顺序**

本类空间 ------> 父类空间



**⚠️⚠️⚠️类名不可能找到对象的属性**