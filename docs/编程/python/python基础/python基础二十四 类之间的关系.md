[toc]



# python基础二十四	类之间的关系

**类与类之间有3种关系**

- **依赖关系(将一个类或对象传递给另一个类的方法中)**
- **组合关系(将一个类的对象传递到另一个类的对象属性中)**
- **继承关系(子类继承父类，是类的三大特性之一)**



## 1.依赖关系

### 1.1 概念

> **将一个类名或对象当做参数传递给另一个函数被使用就是依赖关系，即将一个类或者对象传递给另一个类的方法中**

### 1.2 代码示例

**1.定义一个人类，类中有方法玩，需要传递一个参数，至于玩什么，由这个人类决定，这个人类就是主**

**2.定义两个游戏类，游戏类中有方法玩游戏，游戏类被人类操作**

**3.游戏类的功能非常简单，就是执行自己的方法游戏，但是人类就没这么简单，因为人类需要指定玩的游戏，然后再玩这个游戏，因此需要从定义的两个游戏类中选择一个游戏来玩，人类有更换游戏的权利，想玩哪个游戏就玩哪个游戏，这时人类和游戏类的关系没有那么紧密，此时的关系是最轻的**



接下来是代码示例

```python
#定一个人类Person，两个游戏类CS和LOL，这个人类需要打游戏，但是游戏需要传参进来，至于传哪个游戏，由人类决定
class Person:
    def play(self,args):
        print("我要打游戏了")
        args.run()

class CS:
    def run(self):
        print("CS1.6已运行")

class LOL:
    def run(self):
        print("LOL已经运行")

xiaoming = Person()
play1 = CS()
play2 = LOL()
xiaoming.play(play1)	#将CS类传递到人类Person中，这就是依赖关系

结果：
我要打游戏了
CS1.6已运行
```

**以上代码中说明了将一个类或对象传递给另一个类的方法中就是依赖**



## 2.组合关系

### 2.1 概念

> **将一个类的对象封装到另一个类的对象的属性中，就叫组合**
>
> **组合分为一对一关系和一对多关系**

### 2.2 代码示例

**组合关系是最常用的一种关系，比如男女朋友，男朋友关联着女朋友，女朋友关联着男朋友**

**方式一：一对一关系**

定义一个男生类和一个女生类，男生关联女朋友，这里假设这个男生只有一个女朋友

```python
//代码示例1	男生没有女朋友
class Boy:
    def __init__(self,name,girlFriend=None):
        self.name = name
        self.girlFriend = girlFriend

    def play(self):
        if self.girlFriend:
            print(f"{self.name}和{self.girlFriend}玩")
        else:
            print("单身狗，玩个毛线？")

class Girl:
    def __init__(self,name):
        self.name = name

xiaoming = Boy('小明')
xiaoming.play()
结果：
单身狗，玩个毛线？


//代码示例2	男生有一个女朋友，此时是一对一关系，如果男生有多个女朋友那就是一对多关系
class Boy:
    def __init__(self,name,girlFriend=None):
        self.name = name
        self.girlFriend = girlFriend

    def play(self):
        if self.girlFriend:
            print(f"{self.name}和{self.girlFriend.name}玩")
        else:
            print("单身狗，玩个毛线？")

class Girl:
    def __init__(self,name):
        self.name = name

xiaoming = Boy('小明')
gf = Girl('小丽')
xiaoming.girlFriend = gf	#这里将女朋友类传递到了男生类的属性中
xiaoming.play()
结果：
小明和小丽玩
```

**以上代码说明了将一个类或对象传递到另一个类的属性中就是组合**



**方式二	一对多关系**

老师类和学校类，老师和学校是一对一关系，一个老师只能归属一个学校

学校和老师是一对多关系，一个学校有多个老师

```python
class School:
    def __init__(self,name,address):
        self.name = name
        self.address = address
        self.teacher_list = []

    def append_teacher(self,teacher):
        self.teacher_list.append(teacher)


class Teacher:
    def __init__(self,name,school):
        self.name = name
        self.school = school

#实例化学校
s1 = School('北京校区','海淀区')
s2 = School('北京校区','朝阳区')

#实例化老师
t1 = Teacher('王老师',s1)
t2 = Teacher('李老师',s2)

#将老师追加到学校类中定义的列表中
s1.append_teacher(t1)
s1.append_teacher(t2)

#查看老师姓名
for i in s1.teacher_list:
    print(i.name)
    
结果：
王老师
李老师
```



## 3.继承关系

**python3中都是新式类，如果一个类谁都不继承，那这个类会默认继承object类**

**子类在继承父类的时候是包含类父类**

### 3.1 概念

> **继承**（英语：inheritance）是面向对象软件技术当中的一个概念。如果一个类别A“继承自”另一个类别B，就把这个A称为“B的子类别”，而把B称为“A的父类别”也可以称“B是A的超类”。继承可以使得子类别具有父类别的各种属性和方法，而不需要再次编写相同的代码。在令子类别继承父类别的同时，可以重新定义某些属性，并重写某些方法，即覆盖父类别的原有属性和方法，使其获得与父类别不同的功能。另外，为子类别追加新的属性和方法也是常见的做法。 一般静态的面向对象编程语言，继承属于静态的，意即在子类别的行为在编译期就已经决定，无法在执行期扩充。

### 3.2 分类

#### 方法重写	super关键字

> 子类可以重写父类中的方法
>
> super()关键字在当前类中调用父类方法

**super()关键字**

``super([当前类名,self]).__init__()``

``super括号中的当前类名和self可以不写，并且init后边的括号中的self不写``

- 子类如果编写了自己的构造方法，但没有显式调用父类的构造方法，而父类构造函数初始化了一些属性，就会出现问题
- 如果子类和父类都有构造函数，子类其实是重写了父类的构造函数，如果不显式调用父类构造函数，父类的构造函数就不会执行

---

**这个例子说明了以上两个问题**

```python
#定义一个父亲类和一个儿子类，儿子类继承父亲类
class Father:
    def __init__(self,name,age):
        self.name = name
        self.age = age

    def play(self):
        print("这是一个父类")

class Son(Father):
    #儿子类继承父亲类，这里的构造方法其实是子类重写，因为没有显式调用，因此只能传一个sex参数，如果传name、age参数会报错
    def __init__(self,sex):
        self.sex = sex

    def play(self):
        print("这是一个子类")

xiaoming = Son('男')	#这里只传一个sex参数
xiaoming.play()
结果：
这是一个子类


xiaoming = Son('父亲','50','男')	#子类没有显式调用父类构造方法，因此是重写了父类的构造方法，只能传一个值
xiaoming.play()
结果：
TypeError: __init__() takes 2 positional arguments but 4 were given

```

**如果想要使用父类的初始构造方法，需要在子类中显式调用**

```python
//显式调用，使用父类名写法
class Father:
    def __init__(self,name,age):
        self.name = name
        self.age = age

    def play(self):
        print("这是一个父类")

#子类中修改如下        
"""
//原先写法
class Son(Father):
    def __init__(self,sex):
        self.sex = sex
"""

class Son(Father):
    def __init__(self,name,age,sex):
        Father.__init__(self,name,age)	#显式调用父类的构造方法
        self.name = name
        self.age = age
        self.sex = sex


    def play(self):
        print("这是一个子类")

xiaoming = Son('父亲','50','男')
xiaoming.play()
结果：
这是一个子类


//显示调用，super写法
class Father:
    def __init__(self,name,age):
        self.name = name
        self.age = age

    def play(self):
        print("这是一个父类")

class Son(Father):
    def __init__(self,name,age,sex):
        # Father.__init__(self,name,age)	#父类名写法
        super().__init__(name,age)	#super写法1
        super(Son,self).__init__(name,age)	#super写法2
        self.name = name
        self.age = age
        self.sex = sex


    def play(self):
        print("这是一个子类")

xiaoming = Son('父亲','50','男')
xiaoming.play()
```





#### 3.2.1 单继承

**子类可以继承父类的属性和方法，修改父类，所有子类都会受影响**

**继承关系中，子类会拥有父类所有的方法和属性**

```python
//单继承最简单代码示例
class A():	#父类A继承object类，object是所有类的父类
    def play(self):
        print("有玩的方法")

class B(A):
    pass

a = B()	#实例化子类B
a.play()	#子类调用自己没有的play方法，因为子类B继承了父类A，因此子类拥有父类所有的方法
结果：
有玩的方法
```

**继承可以减少代码量，提高复用性**

有3个类，分别是猫类、狗类、猪类，它们都有相同的属性，名字、年龄、颜色，如果每一个类中都重复写的话会造成代码重复，这时就可以把相同的属性放到一个类中，然后这3个类继承这个类，以此来减少代码量

```python
//原先重复代码
以下代码中，每个类中都有相同的__init__方法，因此可以写一个父类存放这些相同的代码，然后其他3个子类继承这个父类
class Cat:
    def __init__(self,name,age,color):
        self.name = name
        self.age = age
        self.color = color

    def jump(self):
        print("猫可以跳的很高")

    def eat(self):
        print("猫吃小鱼干")


class Dog:
    def __init__(self, name, age, color):
        self.name = name
        self.age = age
        self.color = color

    def wangwang(self):
        prnt("狗狗喜欢汪汪汪")

    def kanmen(self):
        print("狗能看门")

class Pig:
    def __init__(self,name,age,color):
        self.name = name
        self.age = age
        self.color = color

    def sleep(self):
        print("猪喜欢睡觉")
        
        
//改用继承的方法重写上述代码,让猫类、狗类、猪类都继承父类Animal，因为都有相同的__init__方法
class Animal:
    def __init__(self, name, age, color):
        self.name = name
        self.age = age
        self.color = color


class Cat(Animal):
  
    def jump(self):
        print("猫可以跳的很高")

    def eat(self):
        print("猫吃小鱼干")


class Dog(Animal):
   
    def wangwang(self):
        prnt("狗狗喜欢汪汪汪")

    def kanmen(self):
        print("狗能看门")

class Pig(Animal):

    def sleep(self):
        print("猪喜欢睡觉")
```



#### 3.2.2 多重继承

**多重继承就是包含多个间接父类**



![iShot_2024-08-29_14.54.09](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-29_14.54.09.png)





#### 3.2.3 多继承

**有多个直接父类就是多继承**

- 大部分面向对象编程语言(除了c++)都只支持单继承，而不支持多继承，因为多继承不仅增加了编程的复杂度，而且很容易导致一些莫名的错误
- 如果多个直接父类中包含了同名的方法，此时排在前面的父类中的方法会覆盖排在后面的父类中的同名方法





### 3.3 判断继承

#### 3.3.1 isinstance	检查实例类型

- **isinstance(对象,类型)**



#### 3.3.2 issubclass	检查类继承

- **issubclass(子类,父类)**