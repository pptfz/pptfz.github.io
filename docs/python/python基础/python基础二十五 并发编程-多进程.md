[toc]



# python基础二十五	并发编程-多进程

## 1.多任务处理

**多任务处理就是使计算机同时处理多个任务**



### 1.1 实现方式

- 多进程
- 多线程



### 1.2 串行、并发、并行示意图

**串行**

![iShot2020-10-16 12.54.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2012.54.58.png)

**并发**

![iShot2020-10-16 12.55.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2012.55.27.png)

**并行**

![iShot2020-10-16 12.55.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2012.55.46.png)

## 2.多进程

### 2.1 多进程涉及的概念

程序：是一个指令的集合，例如编写完的代码，还没有运行

进程：正在执行的程序，例如当运行一个程序的时候，就启动了一个进程



### 2.2 python多进程

> 1.程序开始运行时，首先会创建一个主进程
>
> 2.在主进程(父进程)下，可以创建新的进程(子进程)，子进程依赖于主进程，如果主进程结束，程序会退出
>
> 3.python提供了非常好用的进程包multiprocessing，借助这个包，可以轻松完成从单进程到并发执行的转换

#### 2.2.1 multiprocessing模块、类方法创建多进程

**方法一：multiprocessing模块提供了一个Process类来创建一个进程对象**

```python
//代码示例1
from multiprocessing import Process
def run(name):	
    print(f"子进程 '{name}' 运行中")

if __name__ == "__main__":	#windowns中防止递归执行创建子进程导致内存不足，Linux、Mac中可以不写
    print("父进程启动")
    p = Process(target=run,args=('我是传入的参数',))	#创建子进程
    p.start()	#启动进程
    print(p.name)	#打印进程名字，可以自定义
    p.join()	#告知主进程等待子进程结束
    print("子进程结束")
    
结果：
父进程启动
Process-1
子进程 '我是传入的参数' 运行中
子进程结束


//代码示例2	创建多个子进程、自定义进程名字
from multiprocessing import Process
def run1(name,sex):
    print(f"子进程 '{name}' 运行中,我是{sex}的")

def run2(name,sex):
    print(f"子进程 '{name}' 运行中,我是{sex}的")

if __name__ == "__main__":
    print("父进程启动")
    p1 = Process(target=run1,args=('我是子进程1','男',),name='自定义子进程1')
    p2 = Process(target=run2,args=('我是子进程2','女',),name='自定义子进程2')
    p1.start()
    p2.start()
    print(p1.name)
    print(p2.name)
    p1.join()
    p2.join()
    print("子进程结束")
    
结果：
父进程启动
自定义子进程1
自定义子进程2
子进程 '我是子进程1' 运行中,我是男的
子进程 '我是子进程2' 运行中,我是女的
子进程结束
```

**方法二：类方法创建多进程**

> 创建新的进程还可以使用类的方式，可以自定义一个类，继承Process类，每次实例化这个类的时候，就等同于实例化一个进程对象

```python
//multiprocessing模块创建多进程方法
from multiprocessing import Process
def run(name):	
    print(f"我是进程：'{name}'")

if __name__ == "__main__":
    p = Process(target=run,args=('呵呵',))
    p.start()
    p.join()
    print("子进程结束")
 
结果：
我是进程：'呵呵'
子进程结束


//基于以上代码，使用类的方式创建多进程
from multiprocessing import Process
class Custum(Process):
    def __init__(self,name):
        super().__init__()	
        self.name = name

    def run(self):	#重写run方法，只能有一个且必须叫run
        print(f"我是进程：'{self.name}'")

if __name__ == "__main__":
    p = Custum("类创建进程")
    p.start()
    p.join()
    print("子进程结束")
    
结果：
我是进程：'类创建进程'
子进程结束


使用类方法创建多进程
from multiprocessing import Process
class A(Process):
    def __init__(self,name):
        super().__init__()
        self.name = name

    def hehe(self):	#名称必须叫run，否则运行结果会有问题
        print(f"子进程 {self.name} 运行中")

if __name__ == "__main__":
    print("父进程启动")
    p = A("类创建进程")
    p.start()
    p.join()
    print("子进程结束")
    
结果：
父进程启动
子进程结束
```





#### 2.2.2 ``__name == "__main__"``参数

> 1.一个python的文件有两种使用的方法，第一是直接作为程序执行，第二是import到其他的python程序 中被调用(模块重用)执行。
>
> 2.因此``if __name__ == 'main':`` 的作用就是控制这两种情况执行代码的过程，``__name__`` 是内置变量，用于表示当前模块的名字
>
> 3.在``if __name__ == 'main':`` 下的代码只有在文件作为程序直接执行才会被执行，而import到其他程序中是不会被执行的
>
> 4.在``Windows 上，子进程会自动 import 启动它的这个文件``，而在 import 的时候是会执行这些语句的。 如果不加``if __name__ == "__main__":``的话就会无限递归创建子进程
> 所以必须把创建子进程的部分用那个 if 判断保护起来
> import 的时候 ``__name__`` 不是`` __main__`` ，就不会递归运行了

```python
//错误示例
from multiprocessing import Process
def run(name):
    print(f"我是进程： '{name}'")

p = Process(target=run,args=('呵呵',))
p.start()
p.join()
print("子进程结束")

结果：
windows会报一堆错，Linux、Mac没有问题



//正确示例
from multiprocessing import Process
def run(name):
    print(f"我是进程： '{name}'")

if __name__ == "__main__":
    p = Process(target=run,args=('呵呵',))
    p.start()
    p.join()
    print("子进程结束")
    
我是进程： '呵呵'
子进程结束
```

#### 2.2.3 多进程参数

- target

  表示调用对象，即子进程要执行的任务

  > p = Process(target=对象名(函数名))

- args

  表示调用对象的位置参数元组，args=(传入的参数,)

  ⚠️括号中传入的参数后面必须加逗号

  > p = Process(target=xxx,args=('传入的参数',))

- name

  表示进程的名称

  > p = Process(target=xxx,args=('传入的参数',),name='子进程名称')



#### 2.2.4 Process类常用方法

- p.start()

  > 启动进程，并调用该子进程中的p.run()

- p.run()

  > 进程启动时运行的方法，正是它去调用``target指定的函数``，我们自定义类中的一定要实现该方法

- p.terminate()

  > 强制终止进程p，不会进行任何清理操作

- p.is_alive()

  > 如果子进程p仍然运行，返回True，用来判断进程是否还在运行

- p.join([超时时间])

  > 主进程等待p终止，timeout是可选的超时时间



#### 2.2.5 Process类常用属性

- name

  > 当前进程实例别名，默认为Process-N,N为从1开始递增的整数，可以指定进程名称

- pid

  > 当前进程实例的PID

#### 2.2.6 多进程中的全局变量

> 全局变量在多个进程中不共享，进程之间的数据是独立的，默认情况下互不影响

```python
from multiprocessing import Process
num = 10
def f1():
    global num
    num += 1
    print(f"第一个子进程中的num值为:{num}")

def f2():
    global num
    num += 2
    print(f"第二个子进程中的num值为:{num}")

if __name__ == "__main__":
    p1 = Process(target=f1)
    p2 = Process(target=f2)
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    print(f"全局变量中的num值为:{num}")
    
结果：
第一个子进程中的num值为:11
第二个子进程中的num值为:12
全局变量中的num值为:10
```



### 2.3 进程池

> 进程池：用来创建多个进程
>
> 当需要创建多子进程数量不多时，可以直接利用multiprocessing中的Process动态生成多个进程，但如果是大量的进程目标，手动创建进程的工作量巨大，此时就可以利用multiprocessing模块提供的``Pool``
>
> 初始化``Pool``时，可以指定一个``最大进程数``，当有新的请求提交到``Pool``中时，如果池还没有满，那么就会创建一个新的进程用来执行该请求，但是如果池中的进程数已经达到指定的最大值，那么该请求就会等待，直到池中有进程结束，才会创建新的进程来执行

```python
from multiprocessing import Pool
import time

def r1():
    print("123")
    time.sleep(5)
def r2():
    print("abc")
    time.sleep(3)
if __name__ == "__main__":
    po = Pool(5)    #定义一个进程池，最大进程数为5，不写默认为CPU核心数
    for i in range(5):
        po.apply_async(r1)  #apply_async选择要调用的目标，每次循环会用空出来的子进程去调用目标
        po.apply_async(r2)
    po.close()  #进程关闭之后不再接受新的请求
    po.join()   #等待po中所有子进程结束，必须放在close后面
    
    
结果：
第一秒会出现以下结果，但是后续不确定
因为进程池中定义了最大进程数为5
123
abc
123
abc
123
```

#### 2.3.1 进程池常用函数解析

**multiprocessing.Pool常用函数解析**

- apply_async(func[,args[,kwds]]):

  > 使用非阻塞方式调用func(并行执行，堵塞方式必须等待上一个进程退出才能进行下一个进程)，args为传递给func的参数列表，kwds为传递给func的关键字参数列表

- apply(func[,args[,kwds]])

  > 使用阻塞方式调用func

- close()

  > 关闭Pool，使其不再接受新的任务

- join()

  > 主进程阻塞，等待子进程的退出，必须在close或terminate之后使用

## 2.4 进程间通信

### 2.4.1 队列Q实现进程间数据传递

> 多进程之间，默认是不共享数据的
>
> 通过Queue(队列Q)可以实现进程间数据传递
>
> Q本身是一个消息队列

#### Queue方法说明

- Queue.put([num])		

  > 存入消息，num不写或者为负数不限制

- Queue.qsize()	

  > 返回当前队列包含的消息数量

- Queue.empty()	

  > 如果队列为空，返回True，反之返回False

- Queue.full()	

  > 如果队列满了，返回True，反之返回False

- Queue.get([block[,timeout]])	

  > 获取队列中的一条消息，然后将其从队列移除，block默认值为True
  >
  > - 如果block使用默认值，且没有设置timeout(单位秒)，消息队列如果为空，此时程序将被阻塞(停在读取状态)，直到从消息队列读到消息为止
  > - 如果设置了timeout，则会等待timeout秒，若还没有读取到任何消息，则抛出"Queue.Empty"异常
  > - 如果block值为False，消息队列如果为空，则会立刻抛出"Queue.Empty"异常



#### 2.4.1.1 存入消息

**Queue.put([num])		#存入消息，num不写或者为负数不限制**

```python
//存入消息，最多存入3条，此时运行程序不回报错
from multiprocessing import Queue
q = Queue(3)
q.put("存入消息1")
q.put("存入消息2")
q.put("存入消息3")

//存入消息，最多存入3条，如果此时存入4条，程序会卡住，知道能够存入为止
from multiprocessing import Queue
q = Queue(3)
q.put("存入消息1")
q.put("存入消息2")
q.put("存入消息3")
q.put("存入消息4")	#这一条消息不会存入到队列中，知道队列有空闲可以存入为止
```



#### 2.4.1.2 读取消息

**Queue.get([block[,timeout]])	#获取队列中的一条消息，然后将其从队列移除，block默认值为True**

```python
//存入消息
from multiprocessing import Queue
q = Queue(3)				#初始化一个Queue对象，最多可接受3条消息
q.put("存入消息1")		#添加消息，数据类型不限
q.put("存入消息2")
q.put("存入消息3")


//读取消息，默认方式读取
from multiprocessing import Queue
q = Queue(3)				#初始化一个Queue对象，最多可接受3条消息
q.put("存入消息1")		#添加消息，数据类型不限
q.put("存入消息2")
q.put("存入消息3")
print(q.get())
print(q.get())
print(q.get())

结果：
存入消息1
存入消息2

//读取消息，指定block值为False
如果block值为False，消息队列如果为空，则会立刻抛出"Queue.Empty"异常
from multiprocessing import Queue
q = Queue(3)
print(q.get(block=False))

结果：
queue.Empty


⚠️此方法有时会报错队列为空，有时就没有问题，win和mac中一样,linux会始终报错队列为空
from multiprocessing import Queue
q = Queue(3)
q.put("存入消息1")
q.put("存入消息2")
q.put("存入消息3")
print(q.get(block=False))


//读取消息，指定读取空队列超时时间
from multiprocessing import Queue
q = Queue(3)
print(q.get(timeout=3))

结果：
等待3秒后会报错
queue.Empty
```

**Queue.get_nowait()	相当于Queue.get(False)**

```python
from multiprocessing import Queue
q = Queue(3)
print(q.get_nowait())

结果：
queue.Empty
```



#### 2.4.1.3 获取队列信息

**Queue.empty()	#如果队列为空，返回True，反之返回False**

```python
//队列不为空，返回False
from multiprocessing import Queue
import time
q = Queue(3)
q.put("1")
q.put("2")
q.put("3")
time.sleep(0.1)	#如果不加sleep可能会返回队列为空
print(q.empty())

结果：
False

//队列为空，返回True
from multiprocessing import Queue
import time
q = Queue(3)
print(q.empty())

```

**Queue.full()	#如果队列满了，返回True，反之返回False**

```python
//队列满，返回True
from multiprocessing import Queue
q = Queue(3)
q.put(1)
q.put(2)
q.put(3)
print(q.full())

结果：
True

//队列不满，返回False
from multiprocessing import Queue
q = Queue(3)
q.put(1)
q.put(2)
print(q.full())

结果：
False
```



#### 多接受方代码示例

> 同时有2个以上的接收方

```python
from multiprocessing import Process,Queue
import time

def write(q):
    for i in range(6):
        print("子进程1写入了：",i)
        q.put(i)
        time.sleep(1)

def read1(q):
    while True:
        if not q.empty():
            print("子进程2读取了：",q.get())
            time.sleep(1)
        else:
            break
def read2(q):
    while True:
        if not q.empty():
            print("子进程3读取了：",q.get())
            time.sleep(1)
        else:
            break
if __name__ == "__main__":
    q = Queue()
    pw = Process(target=write,args=(q,))
    pr1 = Process(target=read1,args=(q,))
    pr2 = Process(target=read2,args=(q,))
    pw.start()
    pw.join()
    pr1.start()
    pr2.start()
    pr1.join()
    pr2.join()
    print("接受完毕！")
    
结果：
子进程1写入了： 0
子进程1写入了： 1
子进程1写入了： 2
子进程1写入了： 3
子进程1写入了： 4
子进程1写入了： 5
子进程2读取了： 0
子进程3读取了： 1
子进程2读取了： 2
子进程3读取了： 3
子进程3读取了： 4
子进程2读取了： 5
接受完毕！


⚠️上述代码的问题之处，子进程2和子进程3不能同时读取队列中的消息，子进程2读取了0、2、4，子进程3读取了1、3、5，需要做一些代码逻辑修改，让子进程2和子进程3能够同时读取消息队列中的消息


//两个接收方读取消息队列	
思路：
from multiprocessing import Process,Queue
import time

def write(q1):
    for i in range(6):
        print("子进程1写入了：",i)
        q1.put(i)
        time.sleep(1)

def read1(q1,q2):
    while True:
        if not q1.empty():
            a = q1.get()	#如果q1队列不为空则取值并赋值给a
            print("子进程2读取了：",a)
            q2.put(a)	#q2从a中读取并写入消息
            time.sleep(1)
        else:
            break
            
def read2(q2):
    while True:
        if not q2.empty():
            print("子进程3读取了：",q2.get())
            time.sleep(1)
        else:
            break
            
if __name__ == "__main__":
    q1 = Queue()
    q2 = Queue()
    pw = Process(target=write,args=(q1,))
    pr1 = Process(target=read1,args=(q1,q2))
    pr2 = Process(target=read2,args=(q2,))
    pw.start()
    pw.join()
    pr1.start()
    pr2.start()
    pr1.join()
    pr2.join()
    print("接受完毕！")
    
结果：
子进程1写入了： 0
子进程1写入了： 1
子进程1写入了： 2
子进程1写入了： 3
子进程1写入了： 4
子进程1写入了： 5
子进程2读取了： 0
子进程3读取了： 0
子进程2读取了： 1
子进程3读取了： 1
子进程2读取了： 2
子进程3读取了： 2
子进程2读取了： 3
子进程3读取了： 3
子进程2读取了： 4
子进程3读取了： 4
子进程2读取了： 5
子进程3读取了： 5
接受完毕！


⚠️⚠️⚠️mac本中执行结果不正确：
子进程1写入了： 0
子进程1写入了： 1
子进程1写入了： 2
子进程1写入了： 3
子进程1写入了： 4
子进程1写入了： 5
子进程2读取了： 0
子进程2读取了： 1
子进程2读取了： 2
子进程2读取了： 3
子进程2读取了： 4
子进程2读取了： 5
接受完毕！
```



## 进程、线程、协程之间的区别

- **进程	最小的资源单位，内存级别，如果进程中没有线程只是划分了一个空间**

- **线程	最小的运行单位，cpu级别，进程在执行，实际上是线程在执行**

- **协程	微线程	用户级别	操作系统不知道什么是协程，是程序员yy出来的，欺骗操作系统，因为有IO操作，操作系统会回收权限，协程就是在用户级别将多个任务做成一个任务，但凡有一个线程有IO，手动切换，让线程能获得更大占用系统资源的机会，提高单线程效率**

