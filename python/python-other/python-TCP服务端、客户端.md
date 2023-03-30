## TCP服务端

```python
#导入socket模块
from socket import *

#创建只用来监听的套接字对象
serverSocket = socket(AF_INET,SOCK_STREAM)

#绑定TCP服务端IP和端口
addr = ("192.168.34.90",6666)
serverSocket.bind(addr)

#设置最大排队等待数
serverSocket.listen(3)

#这里要能多次处理客户端连接请求，因此写一个while循环
while True:
    print("主进程等待新客户端连接")

    #创建accept，用来等待客户端socket连接
    newSocket,clientAddr = serverSocket.accept()
    print(newSocket)    #打印结果   <socket.socket fd=4, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('192.168.34.90', 9999), raddr=('192.168.34.90', 55255)>

    print(clientAddr)   #打印结果   ('192.168.34.90', 55255)

    #clientAddr[0]就是客户端的IP地址，clientAddr[1]就是客户端的端口
    print(f"主进程接下来负责处理{clientAddr[0]},端口{clientAddr[1]}的请求")

    #传输过程可能会出错，因此写一个异常处理避免程序崩溃
    try:
        while True:

            #接受数据并解码，编码类型根据实际情况填写
            recvData = newSocket.recv(1024).decode()

            #做一个判断，如果收到的数据内容长度大于0，则说明是在接受数据，并打印接受的数据，都则就提示客户端已关闭
            if len(recvData) > 0:
                print(f"接收到来自{clientAddr[0]}，端口{clientAddr[1]}的数据:",recvData)
            else:
                print(f"{clientAddr[0]}客户端已关闭")
                break
    except Exception:
        print("接收数据出错！")

    #无论接受是否报错最后都执行关闭新建的用于收发数据的套接字
    finally:
        newSocket.close()
    break

#关闭用于监听的套接字
serverSocket.close()

```



## TCP客户端

```python
#导入socket模块
from socket import *

#创建socket套接字对象
tcpSocket = socket(AF_INET,SOCK_STREAM)

#创建connect，用于连接TCP服务器
tcpSocket.connect(("192.168.34.90",6666))


#向TCP服务端发送数据
while True:
    choose = input("请输入要发送的内容>>>")
    tcpSocket.send(choose.encode("utf-8"))
    # recvData = tcpSocket.recv(1024).decode()
    # print(f"--------->接收到服务器传来的数据:{recvData}")
    #如果客户端输入的是Q或者q，则关闭套接字对象并退出程序
    if choose.lower() == "q":
        tcpSocket.close()
        break



#接受数据
# recvData = tcpSocket.recv(1024)         //等待服务端发，服务端等待客户端发，死锁
# print(recvData.decode())
```

