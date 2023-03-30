[toc]



# python基础二十六	网络编程-udp编程

## 1.Socket编程简介

### 1.1 含义

**socket：套接字，通过网路完成进程间通信的方式(区别于一台计算机之间进程通信)**

![iShot2020-10-16 13.00.30](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.00.30.png)



### 1.2 说明

- **socket本质是``编程接口(API)`` :socket是对TCP/IP协议的封装，socket只是个编程接口不是协议，通过socket我们才能使用TCP/IP协议簇**

- **TCP/IP也要提供可供程序员做网络开发所用的接口，这就是socket编程接口，socket提供了网络通信的能力**

- **套接字之间的连接过程可分为3个步骤：**
  - **1.服务器监听**
  - **2.客户端请求**
  - **3.连接确认**



## 2.创建socket

**语法**

```python
#导入套接字模块
from socket import *

#创建套接字对象
s = socket(socket.AF_NENT,SOCK_DGRAM)


参数说明
AF_NENT		#指明IPV4
SOCKET_DGRAM		#套接字类型，SOCKET_DGRAM是tcp协议		
SOCKET_STREAM		#套接字类型，SOCKET_STREAM是udp协议
```

## 3.socket编程-udp

### 3.1 udp说明

#### 3.1.1 概念

UDP：User Data Protocol，用户数据报协议，是一个**无连接**的简单的面向数据报的传输层协议，udp**不提供可靠性**，它只是把应用层传给IP层的数据报发出去，但是并不能保证它们能到达目的地，由于udp在传输数据报前不用在客户端和服务器之间建立一个连接，且**没有超时重发等机制**，故而**传输速度很快**

#### 3.1.2 udp用处

udp一般用于多点通信和实时的数据业务，比如

- 语音广播
- 视频
- QQ
- TFTP(简单文件传输)



### 3.2 使用udp发送数据

**第一步**

**发送数据，为看到效果先安装网络调试助手NetAssist(windows安装)**

**NetAssist初始配置，协议选择UDP，IP地址会自动识别本机地址，端口号任意选择一个可使用的，配置完成后点击``连接``按钮**

![iShot2020-10-16 13.00.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.00.52.png)

```python
from socket import *

#AF_INET表示IPV4	SOCK_DGRAM表示udp协议
s = socket(AF_INET,SOCK_DGRAM)

#NetAssist中的默认编码是gb2312，这里需要指定一下，否则显示的信息会是乱码
s.sendto("你好".encode("gb2312"),("192.168.34.90",8080))
```

**第二步**

**运行以上代码，会在NetAssist中看到效果**

**这里可以看到发送的你好已经在NetAssist中收到**

![iShot2020-10-16 13.01.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.01.14.png)





### 3.3 使用udp接收数据

#### **3.3.1 udp接收数据**

```python
from socket import *
s = socket(AF_INET, SOCK_DGRAM)	#创建套接字
addr = ('127.0.0.1', 8888)	#准备接收方地址
data = input("请输入：")
s.sendto(data.encode(),addr)	#等待接收数据
redata = s.recvfrom(1024)	#1024表示本次接收的最大字节数
print(redata)
s.close()

mac和linux中运行程序，输入内容后程序会卡住，原因未知⚠️⚠️⚠️

windows中运行程序，输入内容后会返回如下结果
(b'abc', ('127.0.0.1', 8888))
```

#### 3.2.2 udp绑定信息	bind

**如果信息(IP地址、端口号)没有绑定，每发送一次信息，系统会随机分配一个端口，还要避免同一台计算机上的不同进程端口号相同的问题**

![iShot2020-10-16 13.01.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.01.34.png)



```python
绑定信息：让一个进程可以使用固定的端口
一般情况下，发送方不绑定端口，接收方会绑定

from socket import *
s = socket(AF_INET, SOCK_DGRAM) #创建套接字
s.bind(('', 8788))   #绑定本机一个端口，ip地址和端⼝号，ip⼀般不⽤写
addr = ('192.168.1.17', 8080)   #准备接收方地址和端口
data = input("请输入：")
s.sendto(data.encode(),addr)
redata = s.recvfrom(1024)		#1024表示本次接收的最⼤字节数
print(redata)
s.close()
```

#### 3.3.3 echo服务器

> echo服务器就是发送什么，返回什么

**udp接收使用recvfrom方法**

```python
from socket import *
s = socket(AF_INET,SOCK_DGRAM)
port = 8888
s.bind(("",port))
rdata = s.recvfrom(1024)
print(rdata)
执行以上代码，程序会等待接受消息


NetAssist端发送消息，程序会接收到如下结果，是一个元组
(b'hehe', ('192.168.34.11', 8080))

结果说明：
b'hehe'	#接收到的是一个字节码
192.168.34.11	#发送方IP地址
8080	#发送方端口
```



![iShot2020-10-16 13.01.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.01.57.png)



**以下代码为udp无限接收消息**

```python
from socket import *
s = socket(AF_INET,SOCK_DGRAM)
port = 8888
s.bind(("",port))	#绑定8888端口，注意这里是一个元组⚠️

while True:
    rdata = s.recvfrom(1024)	#s.recvfrom表示接收的消息，1024表示本次接收的最大字节数
    s.sendto(rdata[0],rdata[1])	#发送数据，rdata[0]是接受的信息，rdata[1]是接收的IP地址和端口
```





## 4.使用socket进行网络通信的过程

**1.导入socket模块**

**2.创建套接字对象**

**3.绑定IP地址和端口号(接收数据时要绑定端口，发送时可以不绑定)**

**4.发送消息，需要写明接收方的IP和端口号**

**5.接受消息(接受消息前如果没有进行过通信，需要先发送一次)**

---

以下代码为模拟全双工，python程序发送信息给NetAssist,NetASssist发送信息给python程序，如果发送的信息中包含886、在见、再见等就退出程序

```python
from socket import *
import time
#1创建套接字
udpSocket = socket(AF_INET, SOCK_DGRAM)
bindAddr = ("",7088)
udpSocket.bind(bindAddr)#绑定
while True:
    lst = ['886','在见','再见']
    #接收对方发送的数据
    recvData = udpSocket.recvfrom(1024)
    print(recvData)
    print(type(recvData[0].strip()))    #类型是字节
    print(str(recvData[0].strip(), encoding='gb2312'))   #类型是字符串
    if str(recvData[0].strip(),encoding='gb2312') in lst:
        break

    print('[%s] %s.%s' %(time.ctime(),recvData[1],recvData[0].decode("gb2312")))
    a = input("请输入：")
    udpSocket.sendto(a.encode('gb2312'),('192.168.34.11',8080))
    if a in lst:
        break

udpSocket.close()
```



## 5.udp广播

### 5.1 概念、分类、示意图

**概念**

- **udp广播：当前网络上所有电脑的某个进程都收到同一个数据(⚠️tcp没有广播)**

---

**分类**

- **单播：点对点**
- **多播：一对多**
- **广播：一对所有**

---

**示意图**

![iShot2020-10-16 13.02.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.02.25.png)





### 5.2 配置udp广播

**发送方**

```python
from socket import *

#创建udp套接字
s = socket(AF_INET,SOCK_DGRAM)

#对这个需要发送广播数据的套接字进行修改设置，固定格式，否则不能发送广播数据
s.setsockopt(SOL_SOCKET,SO_BROADCAST,1)

#<broadcast>代表当前网段的广播地址，编码如果不写就是utf-8
s.sendto("udp广播信息测试".encode(),("<broadcast>",8080))
s.close()

```

**接收方**

```python
from socket import *
s = socket(AF_INET,SOCK_DGRAM)
addr = s.bind(("",8080))
recv = s.recvfrom(1024)
print(recv[0].decode())
s.close()
```

**运行过程**

**1.先运行接收方程序等待接受，程序会卡住直到接收到信息**

**2.发送方运行程序，向当前网络中发送udp广播，接收程序就会收到发送方的信息**



## 6.基于udp实现的TFTP

### 6.1 TFTP介绍

**概念**

- **TFTP(Trivial File Transfer Protocol，简单文件传输协议)是TCP/IP协议簇中一个用来在客户端和服务器之间进行简单文件传输的协议**

**作用**

- **使用TFTP协议，就可以实现简单文件的下载**

**特点**

- **简单**
- **占用资源小**
- **适合传递小文件**
- **适合在局域网进行传递**
- **端口号为69**
- **基于udp实现**





### 6.2 TFTP传输过程

![iShot2020-10-16 13.02.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.02.46.png)



**第一步、客户端向服务端发送读写请求，服务端默认端口udp69**

**第二步、服务端响应数据包发送给客户端，TFTP数据包有固定的格式**

**第三步、客户端收到数据包后向服务端返回确认信息ACK**

---

**传输过程中涉及的一些问题**

- **服务端向客户端传数据的时候发生丢包怎么办？**
  - 如果服务端发送给客户端的数据包发生丢失情况，则服务端会重新发送数据给客户端
- **客户端向服务端返回的确认信息丢失怎么办？**
  - 客户端会重发ACK给服务端，这样服务端才能继续传输数据
- **客户端如何确定服务端已经全部传输完毕？**
  - TFTP协议中，服务端每次会**固定向客户端返回516字节的数据(2字节操作码+2字节块编号+512字节真实数据)**，当客户端接收到的数据小于516字节时，就意味着服务端已经发送完毕了
  - 如果恰好最后一次数据长度为516字节，服务端会再发一个长度为0的数据包
- **TFTP能否保证数据不丢包？**
  - TFTP是可以保证数据不丢包的，因为客户端如果没有收到数据服务端会重发数据，服务端没有收到客户端发送的ACK就不会继续发送数据
  - TFTP不能保证数据不丢失，例如，客户端收到的数据小于服务端发送的516字节，这种情况无法做校验



### 6.3 TFTP格式要求

![iShot2020-10-16 13.03.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.03.10.png)



**TFTP格式要求**

![iShot2020-10-16 13.03.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.03.27.png)



### 6.4 TFTP构造下载请求数据

**TFTP构造下载请求数据需要根据TFTP读写请求格式来编写**

![iShot2020-10-16 13.03.43](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.03.43.png)



**以下代码为构造TFTP请求数据示例**

```python
#需要导入struct模块
import struct

#构造下载请求
filename = "abc.jpg"	//将文件名赋值给变量，方便修改

requestData = struct.pack("!H%dsb5sb" %len(filename.encode("gb2312")),1,filename.encode("gb2312"),0,"octet".encode("gb2312"),0)
```

``struct.pack("!H%dsb5sb" %len(filename.encode("gb2312")),1,filename.encode("gb2312"),0,"octet".encode("gb2312"),0)``

**struct.pack是一种打包的方法，打包格式中分为6个部分，第1部分是对后5部分进行的统一说明，后5部分是TFTP读写请求固定格式**

- **!H%dsb5sb" %len(filename.encode("gb2312"))**
- **1**
- **filename.encode("gb2312"）#编码方式根据实际情况修改**
- **0**
- **"octet".encode("gb2312")  #编码方式根据实际情况修改**
- **0**

---

**第一部分   "!H%dsb5sb" %len(filename.encode("gb2312"))**

!表示**按照网络传输数据要求的形式**来组织数据

H表示将第二部分的1替换成占2个字节

%d是数字占位符，因为后面写了 %len(filename.encode("gb2312"))，因此这里的%s就是存放文件名的变量filename中的文件的**字节**长度，%d后边的b表示字节

5sb是指后边的 ``octet``,sb表示的是字节，octet是5个字节，因此是5sb，这里是固定的格式

---

**第二部分   1**

这里的1已经由前边的H替换成2个字节，表示的是上传还是下载，1是下载，2是上传

---

**第三部分   filename.encode("gb2312")**

这里表示将文件名编码成二进制，⚠️注意，这里的编码方式要根据实际情况做相应的修改

---

**第四部分   0**

这里的0是固定格式

---

**第五部分   "octet".encode("gb2312")**

这里的octet是固定格式

---

**第六部分   0**

这里的0是固定格式

---

### 6.5 实现TFTP下载

#### 6.5.1 struct模块说明

**作用**

- **struct模块可以按照指定格式将python数据转换为字符串，该字符串为字节流**

**struct中的三个重要函数**

- **pack**	按照给定的格式(fmt)，把数据封装成字符串(实际上是类似于c结构的字节流)

  > pack(fmt,v1,v2,...)
  >
  > struct.pack("!H8sb5sb",1,"test.jpg",0,"octet",0)

- **unpack**   按照给的格式(fmt)解析字节流string，返回解析出来的元组

  > unpact(fat,string)
  >
  > struct.unpack("!HH",4,p_num)
  >
  > cmdTuple = struct.unpack("!HH",recvData[:4])

- **calcsize**   计算给定的格式(fmt)占用多少字节



---

**struct模块使用说明图**

![iShot2020-10-16 13.04.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.04.10.png)



#### 6.5.2 TFTP下载程序

**第一步、设置TFTP服务端**

**实现TFTP需要用到一个软件Tftpd32，选择共享的目录用来提供下载，选择本机网卡127.0.0.1**

![iShot2020-10-16 13.04.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.04.31.png)



---

**第二步、编写下载器(客户端)**

**实现TFTP下载器**

- **下载：从服务器上将一个文件复制到本地**

- **下载过程**
  - **在本地创建一个空文件，文件名一定要与下载的文件名相同**
  - **向空文件中写入接收到的数据，接收一点写入一点**
  - **接收完所有数据后关闭文件**

---

**编写一个TFTP下载程序**

```python
#导入struct模块、socket模块、time模块
import struct
from socket import *
import time

#TFTP中共享的文件及TFTP服务端IP地址分别写入变量中
filename = "xiaohua.jpg"
serverIP = "192.168.34.112"

#利用struck模块的pack方法封装请求数据，代码具体含义在6.4TFTP构造下载请求数据
requestData = struct.pack("!H%dsb5sb" %len(filename.encode("gb2312")),1,filename.encode("gb2312"),0,"octet".encode("gb2312"),0)

#创建套接字对象
s = socket(AF_INET,SOCK_DGRAM)

#发送请求数据
s.sendto(requestData,(serverIP,69))

#设置文件句柄，将后续接收的数据写入到文件中，⚠️写入的文件必须与TFTP中共享的文件名相同
f = open(filename,"ab")

#因为不知道要接受的数据有多大，因此写一个while循环循环接收，知道接收完成
while True:
    #接收数据，打印一下看看接收到的内容是什么 
    recvData = s.recvfrom(1024)
    print(recvData)
    

收到的数据内容如下，是一个元组，分为两个部分
第一部分是 操作码+块编号+真实数据	一共516字节
	操作码：前2个字节
  块编号：前2个字节
  真实数据：512字节
第二部分是	TFTP服务端IP及TFTP向客户端响应数据时用到的随机端口
⚠️TFTP向客户端返回数据时不会使用默认的69端口，会使用一个随机端口，因为69端口还需要向其他客户端响应请求，而后续客户端向服务端返回ACK确认信息时，也需要用到这个随机端口⚠️


(b'\x00\x03\x00\x01FLV\x01\此处省略一万字\x00!modified by youku.com in 20111202\x00\x0chasKeyframes\\x00\x00Aj\xb0\xa6@\x00', ('192.168.34.112', 49373))


\x00\x03\x00\x01FLV
这一部分其实就能看到操作码和块编号，操作码是3(\x03),块编号是1(\x01)，文件名是(FLv)
```

**上述代码中已经收到了TFTP响应的数据，接下来获取一下操作码和块编号**

```python
#因为不知道要接收的数据有多大，因此写一个while循环循环接收，知道接收完成
while True:
    #接收数据，打印一下看看接收到的内容是什么 
    recvData = s.recvfrom(1024)
    print(recvData)
    
    #获取操作码和块编号，这里用到了struct模块中的unpack(解包)方法
    caozuoma,kuaibianhao = struct.unpack("!HH",recvData[0][:4])

//获取操作码和块编号代码说明
收到的数据如下
(b'\x00\x03\x00\x01FLV\x01\此处省略一万字\x00!modified by youku.com in 20111202\x00\x0chasKeyframes\\x00\x00Aj\xb0\xa6@\x00', ('192.168.34.112', 49373))

要获取操作码和代码块，需要截取收到的数据的第一部分中的前4个字节
返回的数据的是一个元组
	第一部分是 操作码+块编号+真实数据	一共516字节
		操作码：前2个字节
  	块编号：前2个字节
  	真实数据：512字节
  第二部分是	服务器IP地址和随机端口
    
    
获取到的结果如下，因为还没有向服务器发送ACK确认信息，因此块编号会一直收到1
3 1
3 1
。。。
```

**现在已经获取到了操作码和块编号，接下来就可以写入本地文件以及向服务器发送ACK确认信息了**

```python
#先判断一下操作码是否是5，如果是5则就是错误信息
  if caozuoma == 5:
        print("文件不存在！！！")
        break

#将收到的数据写入本地文件，收到的数据的第一部分第4个字节后的512字节就是真实数据
    f.write(recvData[0][4:])

#TFTP协议中每次传输的数据是512字节，这里做一个判断，如果数据小于512字节则说明客户端接收完毕
⚠️这里需要注意一下的是，如果最后一次传输的数据恰好等于512字节，则服务端会再次发送一个数据长度为0的包
    if len(recvData[0]) < 512:
        break

#每次接收512字节数据后，客户端需要向服务端发送一个ACK确认信息，确认信息需要按照固定格式打包      
    ackData = struct.pack("!HH",4,kuaibianhao)
   
#将打包好的ACK和收到的数据的第二部分(服务器IP及随机端口)返回给服务器
    s.sendto(ackData,recvData[1])

代码说明    
!HH,4,kuaibianhao
!表示按照网络传输数据要求的形式来组织数据，因为TFTP中ACK确认信息是有固定格式的
HH表示将4和块编号替换成4个字节，4表示ACK
```



![iShot2020-10-16 13.04.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2013.04.50.png)

---

**完整代码**

```python
import struct
from socket import *
import time
filename = "xiaohua.jpg"
serverIP = "192.168.34.112"
requestData = struct.pack("!H%dsb5sb" %len(filename.encode("gb2312")),1,filename.encode("gb2312"),0,"octet".encode("gb2312"),0)
s = socket(AF_INET,SOCK_DGRAM)
s.sendto(requestData,(serverIP,69))
f = open(filename,"ab")

while True:
    recvData = s.recvfrom(1024)
    print(recvData)
    caozuoma,kuaibianhao = struct.unpack("!HH",recvData[0][:4])
    serverPort = recvData[1][1]
    print(caozuoma,kuaibianhao)

    if caozuoma == 5:
        print("文件不存在！！！")
        break

    f.write(recvData[0][4:])

    if len(recvData[0]) < 512:
        break

    ackData = struct.pack("!HH",4,kuaibianhao)
    s.sendto(ackData,recvData[1])
```



### 6.6 实现TFTP上传

