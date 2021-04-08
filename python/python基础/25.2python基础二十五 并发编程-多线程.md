[toc]



# python基础二十五	并发编程-多线程

# 1.线程概念

> 线程：实现多任务的另一种方式，一个进程中同时运行的多个子任务就成为线程
>
> 轻量级进程：线程又被称为轻量级进程，是更小的执行单元
>
> - 一个进程可拥有多个并行的线程，当中每一个线程，共享当前进程的资源
> - 一个进程中的线程共享相同的内存单元/内存地址空间，这样就可以访问相同的变量和对象，而且他们从同一堆中分配对象，进行通信、数据交换、同步操作
> - 线程间的通信是在同一个地址上进行的，所以不需要额外的通信机制，这就使得通信更简单而且信息传递速度也更快



#### 线程的5种状态

- **多线程程序的执行顺序是不确定的(操作系统决定)。当执行到sleep语句时，线 程将被阻塞(Blocked) ， 到sleep结束后， 线程进入就绪(Runnable) 状态， 等待调度。 而线程调度将自行选择一个线程执行。 代码中只能保证每个线程都运行 完整个run函数， 但是线程的启动顺序、run函数中每次循环的执行顺序都不能确定**



![iShot2020-10-16 12.56.27](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-16 12.56.27.png)



**1、``新状态``:线程对象已经创建，还没有在其上调用start()方法。**

**2、``可运行状态``:当线程有资格运行，但调度程序还没有把它选定为运行线程时线程所处的状态。当start()方法调用时，线程首先进入可运行状态。在线程运行之后或者从阻塞、等待或睡眠状态回来后，也返回到可运行状态。**

**3、``运行状态``:线程调度程序从可运行池中选择一个线程作为当前线程时线程所处的状态。这也是线程进入运行状态的唯一一种方式。**

**4、``等待/阻塞/睡眠状态``:这是线程有资格运行时它所处的状态。实际上这个三状态组合为一种，其共同点是:线程仍旧是活的(可运行的)，但是当前没有条件运行。 但是如果某件事件出现，他可能返回到可运行状态。**

**5、``死亡态``:当线程的run()方法完成时就认为它死去。这个线程对象也许是活的，但是，它已经不是一个单独执行的线程，线程一旦死亡，就不能再次执行，如果在一个死去的线程上调用start()方法，会抛出异常**





# 2.线程和进程的区别

| 区别     | 进程                                                         | 线程                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 根本区别 | 作为资源分配的单位                                           | 调度和执行的单位                                             |
| 开销     | 每个进程都有独立的代码和数据空间(进程上下文)，进程间的切换会有较大的开销 | 线程可以看成是轻量级的进程，同一个类线程共享代码和数据空间，每个线程有独立的运行栈和程序计数器(PC)，线程切换的开销小 |
| 所处环境 | 在操作系统中能同时运行多个任务                               | 在同一个应用程序中有多个顺序流同时执行                       |
| 分配内存 | 系统在运行的时候会为每个进程分配不同的内存区域               | 除了CPU之外，不会为线程分配内存，线程使用的资源是它所属的进程的资源，线程只能共享资源 |
| 包含关系 | 没有线程的进程是可以被看作单线程的，如果一个进程内拥有多个线程，则执行过程不是一个线程，而是多个线程完成的 | 线程是进程的一部分，所以线程有的时候被称为是轻权进程或者轻量进程 |



# 3.多线程实现

## 3.1 通过threading.Thread直接在线程中运行函数

```python
//创建单线程
import threading	#导入threading模块
def thread():
    print("线程启动")
    
t = threading.Thread(target=thread)	#创建线程
t.start()	#启动线程


//利用for循环创建多线程
import threading
def thread():
    print("子线程启动")

for i in range(5):
    t = threading.Thread(target=thread)
    t.start()
结果：
子线程启动
子线程启动
子线程启动
子线程启动
子线程启动
```



## 3.2 通过类继承threading.Thread类来创建线程

```python
import threading
class MyThread(threading.Thread):
    def run(self):
        for i in range(5):
            print(i)

t1 = MyThread()
t2 = MyThread()
t1.start()
t2.start()

结果：
0
1
2
3
4
0
1
2
3
4

```



## 3.3 查看当前线程数量

**len(threading.enumerate()**

```python
import threading
import time
import random

def func():
    time.sleep(random.randint(1, 3))
    print(threading.current_thread().name,f"当前活跃线程数量{len(threading.enumerate())}")


lst = [threading.Thread(target=func,name=f"线程{i}") for i in range(10)]
for i in lst:
    i.start()
    
结果：	线程名称不固定
线程2 当前活跃线程数量11
线程8 当前活跃线程数量10
线程7 当前活跃线程数量9
线程4 当前活跃线程数量8
线程3 当前活跃线程数量7
线程1 当前活跃线程数量6
线程0 当前活跃线程数量5
线程9 当前活跃线程数量4
线程6 当前活跃线程数量3
线程5 当前活跃线程数量2
```



# 4.线程同步

## 4.1互斥锁

> 创建锁
>
> - lock = threading.Lock()
>
> 锁定
>
> - lock.acquire()
>
> 释放锁
>
> - lock.release()

**未加锁之前循环100万次出现的结果不准确BUG**

```python
from multiprocessing import Queue,Process,Lock
import threading
num = 0

def f1():
    global num
    for i in range(1000000):
        num += 1
    print(num)

def f2():
    global num
    for i in range(1000000):
        num += 1
    print(num)


t1 = threading.Thread(target=f1)
t2 = threading.Thread(target=f2)
t1.start()
t2.start()
print("主线程的num是",num)

结果1:
主线程的num是 299428
1226857
1536106

结果2:
主线程的num是 263111
1173618
1499331


每一次执行的结果都不一样
```



**加锁解决循环100万次出现结果不准确的BUG**

```python
from multiprocessing import Queue,Process,Lock
import threading
num = 0

def f1():
    global num
    lock.acquire()
    for i in range(1000000):
        num += 1
    print(num)
    lock.release()

def f2():
    global num
    lock.acquire()
    for i in range(1000000):
        num += 1
    print(num)
    lock.release()

lock = threading.Lock()	#创建锁
t1 = threading.Thread(target=f1)
t2 = threading.Thread(target=f2)
t1.start()
t2.start()
print("主线程的num是",num)

结果1:
主线程的num是 235674
1000000
2000000

结果2:
主线程的num是 227114
1000000
2000000

主线程的num还是不一致，因为线程间数据是共享的，锁只能保证f1、f2两个函数中完整执行
```



## 4.2互斥锁实现线程同步

```python
代码整体思路
1.创建3个线程，分别执行3个函数f1、f2、f3
2.创建3个锁，只有在锁1创建后不上锁，锁2、锁3都上锁
3.由于锁1没有上锁，因此可以先执行，锁1中执行后释放锁2，锁2执行，执行后释放锁3，锁3执行，执行完后释放锁1，锁1执行，这样就可以无限循环顺序执行锁1、锁2、锁3

import threading
from multiprocessing import Lock

def f1():
    while True:
        lock1.acquire()	#抢锁1
        print(1)
        lock2.release()	#释放锁2，这样就能执行函数f2

def f2():
    while True:
        lock2.acquire()	#抢锁2
        print(2)
        lock3.release()	#释放锁3，这样就能执行函数f3

def f3():
    while True:
        lock3.acquire()	#抢锁3
        print(3)
        lock1.release()	#释放锁1，这样就能执行函数f1

        
#创建3个线程，并分别执行函数f1、f2、f3        
t1 = threading.Thread(target=f1)	
t2 = threading.Thread(target=f2)
t3 = threading.Thread(target=f3)

#创建3个锁，并且锁2、锁3创建后就上锁
lock1 = threading.Lock()
lock2 = threading.Lock()
lock2.acquire()
lock3 = threading.Lock()
lock3.acquire()

#启动线程
t1.start()
t2.start()
t3.start()

结果：
1
2
3
1
2
3
。。。
```

## 4.3消息队列Queue实现线程同步

### 4.3.1线程中的Queue与进程中的Queue区别

- 进程中的Queue

  > 进程中的Queue是从multriprocessing模块中导入的， from multiprocessing import Queue，作用是作为消息队列接收消息

- 线程中的Queue

  > 线程中的Queue是从queue模块中导入的，from queue import Queue，作用是实现线程同步



### 4.3.2线程中的Queue

Python中Queue模块，实现了3种类型的队列来实现线程同步，包括

- FIFO(先入先出) 队列Queue，按照先进先出的顺序检索条目
- LIFO(后入先出) 栈LifoQueue，最后添加的条目最先检索到
- 优先级队列 PriorityQueue，条目被保存为有序的(使用heapq模块)并且最小值的条目最先被剪锁



**class queue.Queue(maxsize=0)**

FIFO队列的构造器，maxsize为一个整数，表示队列的最大条目数，可用来限制内存的使用

一旦队列满，插入将被阻塞直到队列中存在空闲时间，如果maxsize小于等于0，队列大小为无限制，maxsize默认为0

```python
import queue
import threading

def write():
    while True:
    if q1.qsize() <= 1000:
        for i in range(1,51):
            q1.put(f"新数据{i}")
  
def read():
    while True:
    if q1.qsize() >= 100:
        for i in range(20):
          a = q1.get()
          print(a)
          
q1 = queue.Queue()	#通过Queue隔离开了存放数据的线程与读取数据的线程
for i in range(1,501):
    q1.put(f"初始数据f{i}")
    
for i in range(500):
    print(q1.get())
    

t1 = threading.Thread(target=write)
t2 = threading.Thread(target=read)
t1.start()
t2.start()

结果：
循环打印新数据1-50


```

### 4.3.3生产者消费者模式

> 生产者就是生产数据的线程，消费者就是消费数据的线程
>
> 生产者消费者模式是通过一个容器(缓冲区)来解决生产者和消费者的强耦合问题
>
> 生产者和消费者之间不直接通讯，通过阻塞队列来进行通讯



## 4.4死锁(错误情况)

> 死锁属于错误情况，在线程共享多个资源的时候，如果两个线程分别占有一部分资源并同时等待对方的资源，就会造成死锁

```python
#以下代码，锁1再等待锁2，锁2再等待锁1，因此造成了死锁


import threading
import time

def f1():
    if lock1.acquire():	#f1抢到了锁1
        print("lock1抢到了锁")
        time.sleep(1)
        if lock2.acquire():	#再等待锁2，但是锁2已经被f2抢到，还未释放，因此无法继续执行后续代码
            print("lock2")
            lock2.release()
        lock1.release()

def f2():
    if lock2.acquire():	#f2抢到了锁2
        print("lock2抢到了锁")
        time.sleep(1)
        if lock1.acquire():	#再等待锁1，但是锁1已经被f1抢到，还未释放，因此无法继续执行后续代码
            print("lock1")
            lock1.release()
        lock2.release()

lock1 = threading.Lock()
lock2 = threading.Lock()
t1 = threading.Thread(target=f1)
t2 = threading.Thread(target=f2)
t1.start()
t2.start()

结果：
lock1抢到了锁
lock2抢到了锁

程序会卡住不动
```

## 4.5信号量 semaphone

### 4.5.1概念

> 1.信号量semaphone用于控制一个时间点内线程进入数量的锁，信号量是用来控制线程并发数的
>
> 2.信号量只控制同一时间能并发执行的线程，其余不管

### 4.5.2使用场景

- 读写文件

  > 读写文件的时候，一般只有一个线程再写，而读可以有多个线程同时进行，如果需要限制同时读取文件的线程个数，这时候就需要用到信号量
  >
  > 如果使用互斥锁，就是限制同一时间只能有一个线程读取文件

- 提供访问的web服务

  > web服务都是跑在服务器中的，而服务器的资源是有限的，如果访问请求数量特别多，不加限制就会导致服务器宕机，此时使用信号量限制同一时间web服务能处理的请求就不会造成因访问量巨大而造成服务器宕机

### 4.5.3信号量代码示例

```python
//无法控制同时执行的线程数
import time
import threading

def f1():
    time.sleep(1)
    print(111)

for i in range(100):
    t1 = threading.Thread(target=f1)
    t1.start()
    
结果：
100个111


//使用信号量控制同时执行的线程数
import time
import threading

s = threading.Semaphore(5)	#开启信号量
def f1():
    s.acquire()	#信号量加锁
    time.sleep(2)
    print(111)
    s.release()	#信号量解锁

for i in range(100):
    t1 = threading.Thread(target=f1)
    t1.start()
    
结果：
一次打印5个111，直到循环完成
```

## 4.6GIL全局解释器锁

### 4.6.1概念

> Cpython独有的锁，牺牲效率保证数据安全，同一时间只能有一个线程来修改共享的数据

### 4.6.2GIL锁说明

- 首先，执行python文件是什么过程？谁把进程运行起来的？

  > 操作系统将你的应用程序从硬盘加载到内存然后运行python文件，在内存中开辟一个进程空间，将你的python解释器以及p y文件加载进去，解释器运行py文件

- python解释器分为两部分，先将你的代码通过编译器编译成c的字节码，然后你的虚拟机拿到你的c字节码，输出机器码，再配合操作系统把你的这个机器仍给CPU处理

- py文件有一个主线程，主线程做的就是这个过程，如果开多线程，每个线程都要进行这个过程

- Cpython为什么用不了多核？

  > cpython在所有的线程进入解释器之前加了一个全局解释器锁即GIL锁，这个锁是互斥锁，是加在解释器上的，导致同一时间只有一个线程在执行，所以用不了多核

- 为什么这么设计？

  > 因为写python的人只有一个CPU
  >
  > 所以加了一个锁，保证了数据的安全，而且再写python解释器时，更加好写

- 为什么不取消这个锁？

  > 解释器内部的管理全部是针对单线程写的，如果要取消锁，需要重构python解释器

- 能不能不用Cpython？

  > 官方推荐使用Cpython，处理速度快，相对其他解释器比较完善

- 多线程无法使用多核，怎么办？

  > 虽然多线程无法使用多核，但是多进程可以应用多核，但是开销大

- GIL全局解释器锁和互斥锁的区别

  > 锁的目的就是为了保护共享的数据，同一时间只能有一个线程来修改共享数据
  >
  > 保护不同的数据就应该加不同的锁
  >
  > GIL和lock是两种锁，保护的数据不一样，GIL是解释器级别的，保护的是解释器级别的数据，比如垃圾回收的数据，lock互斥锁是保护用户自己开发的应用程序的数据，GIL是不管这样的数据的

**示意图**

![iShot2020-10-16 12.56.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-16 12.56.54.png)



**1⃣️xx.py文件中有多个线程，由于GIL锁的存在导致同时只能执行一个线程，因为多个线程操作一个资源会出问题，所以在解释器级别加了GIL锁** 

**2⃣️cpython解释器不支持同时解释多个python线程，原因是为了保证解释器的安全，因此不支持多线程同时并发**

**3⃣️GIL锁是解释器级别的锁，只能保证解释器的安全，但是无法保证数据安全，我们自己加互斥锁能解决这个问题**



# 5.线程异步

**线程异步有多种方式**

1.无需等待线程执行(正常写的线程执行代码就是异步，因为操作系统自动调用线程执行，多个线程执行顺序不固定)

2.通过循环控制(方法low)

3.通过回调机制实现线程异步



**通过回调机制实现线程异步**

```python
from multiprocessing import Pool
import random
import time
def download(name):
    for i in range(1,6):
        print(f"{name}下载文件{i}")
        time.sleep(random.randint(1,3))
    return "下载完成"

def alterUser(msg):
    print(msg)


if __name__ == "__main__":
    p = Pool(3)

    #当func执行完成后，return的东西会给到回调函数callback
    p.apply_async(func=download,args=("线程1",),callback=alterUser)
    p.apply_async(func=download,args=("线程2",),callback=alterUser)
    p.apply_async(func=download,args=("线程3",),callback=alterUser)
    p.close()	#关闭进程池
    p.join()
    
结果：	结果顺序每一次执行都会不同，最终结果为显示3次下载完成
线程1下载文件1
线程2下载文件1
线程3下载文件1
线程1下载文件2
线程2下载文件2
线程3下载文件2
线程3下载文件3
线程1下载文件3
线程3下载文件4
线程2下载文件3
线程3下载文件5
线程1下载文件4
下载完成
线程2下载文件4
线程1下载文件5
线程2下载文件5
下载完成
下载完成
```



# 进程、线程、协程之间的区别

- **进程	最小的资源单位，内存级别，如果进程中没有线程只是划分了一个空间**
- **线程	最小的运行单位，cpu级别，进程在执行，实际上是线程在执行**
- **协程	微线程	用户级别	操作系统不知道什么是协程，是程序员yy出来的，欺骗操作系统，因为有IO操作，操作系统会回收权限，协程就是在用户级别将多个任务做成一个任务，但凡有一个线程有IO，手动切换，让线程能获得更大占用系统资源的机会，提高单线程效率**

