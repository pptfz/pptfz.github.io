[toc]



# python基础二十五	并发编程-多协程

## 1.协程

### 1.1 概念

> 协程是比线程更小的执行单元，也叫微线程
>
> 一个线程作为一个容器里面可以放置多个协程



### 1.2 协程作用

> 只切换函数调用即可完成多线程，可以减少CPU的切换
>
> 协程自己主动让出CPU，不需要系统调用



### 1.3 协程实现

#### 1.3.1 greenlet(第三方模块，手动切换函数执行)

```python
#协程间来回切换，不需要CPU的调用
#需要先安装greenlet	
pip install greenlet

from greenlet import greenlet
import time
def t1():
    while True:
        print("AAA")	#第一步先打印AAA
        gr2.switch()	#第二步让协程gr2进来执行，gr1保留此处的执行位置，协程gr2执行的是t2函数
        time.sleep(1)
        
        
def t2():
    while True:
        print("bbb")	#第三步打印bbb
        gr1.switch()	#第四步让协程gr1进来执行，gr2保留此处的执行位置，协程gr1执行的是t1函数
        time.sleep(1)
        
gr1 = greenlet(t1)	#创建一个协程对象
gr2 = greenlet(t2)
gr1.switch()	#此时会执行t1函数


结果：
循环打印
AAA
bbb
```

#### 1.3.2 gevent(第三方模块，自动切换函数执行)

- 概念

  > gevent是一个能够自动切换函数执行的协程模块，比greenlet功能强大

- 原理

  > gevent通过greenlet实现协程，当一个greenlet遇到IO操作时，就自动切换到其他的greenlet，等待IO操作完成，再在适当的时候切换回来继续执行

- 特点

  > gevent只有遇到模块能够识别的IO操作的时候，程序才会进行任务切换，实现并发效果



```python
#需要先安装gevent
pip install gevent


//代码示例1	无限循环切换协程
import gevent
def A():
    while True:
        print(".........A.........")
        gevent.sleep(1)#用来模拟一个耗时操作
        #gevent中：当一个协程遇到耗时操作会自动交出控制权给其他协程
def B():
    while True:
        print(".........B.........")
        gevent.sleep(1)	#每当遇到耗时操作，会自用转到其他协程
g1 = gevent.spawn(A)	#创建一个gevent对象（创建了一个协程），此时就已经开始执行函数A
g2 = gevent.spawn(B)
g1.join()  #等待协程执行结束
g2.join()  #会等待协程运行结束后再退出

结果：
无限循环打印
.........A.........
.........B.........
。。。


//代码示例2	控制协程循环次数
import gevent
def A():
    for i in range(10):
        print("AAA")
        gevent.sleep(1)

def B():
    for i in range(10):
        print("BBB")
        gevent.sleep(1)

g1 = gevent.spawn(A)
g2 = gevent.spawn(B)
g1.join()
g2.join()

结果：
打印10次
AAA
BBB
```

## 进程、线程、协程之间的区别

- **进程	最小的资源单位，内存级别，如果进程中没有线程只是划分了一个空间**
- **线程	最小的运行单位，cpu级别，进程在执行，实际上是线程在执行**
- **协程	微线程	用户级别	操作系统不知道什么是协程，是程序员yy出来的，欺骗操作系统，因为有IO操作，操作系统会回收权限，协程就是在用户级别将多个任务做成一个任务，但凡有一个线程有IO，手动切换，让线程能获得更大占用系统资源的机会，提高单线程效率**

