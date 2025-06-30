[toc]



#python基础十	文件操作

## 1.文件操作

### 1.1 作用

``持久化存储``



### 1.2 文件操作总结

```python
f = open(file="文件名字或文件路径",mode="操作模式",encoding="编码")  

r 	只读    
w 	清空写   
a 	追加写   
rb 	只读字节 
wb 	清空写字节
ab 	追加写字节
r+ 	读写   
w+ 	清空写读 
a+ 	追加写读 
```



### 1.3 文件操作

#### 1.3.1 只读文件 --> r

```python
r: 读文本                                              
f = open("test.txt",mode="r",encoding="utf-8") 

#参数说明
f					变量名，句柄
open			表示打开文件，通过python向操作系统发送指令
test.txt	表示要操作的文件
mode			指定对文件的操作方式，r表示读取
r					表示读取文件
encoding	指定字符集

⚠️文件读取时只能读一遍     

在py同级目录下创建一个文件txt.txt，并写入以下内容
一只奔跑的草泥马
abc
123


1.全部读取		print(f.read())
f = open("txt.txt",mode="r",encoding="utf-8")
print(f.read())
一只奔跑的草泥马
abc
123

2.r模式下按照字符读取	print(f.read(3))
f = open("txt.txt",mode="r",encoding="utf-8")
print(f.read(5))
一只奔跑的

3.读取一行	print(f.readline().strip()) 读取一行默认最后有换行符，需要去掉
f = open("txt.txt",mode="r",encoding="utf-8")
print (f.readline().strip())
一只奔跑的草泥马


4.读取多行，以列表的形式存储	print(f.readlines())
f = open("txt.txt",mode="r",encoding="utf-8")
print (f.readlines())
['一只奔跑的草泥马\n', 'abc\n', '123']


//读取总结
print(f.read())   						#全部读取                            
print(f.read(3))    					#模式的r的情况下按照字符读取                
print(f.readline().strip())   #读取一行                
print(f.readlines())   				#读取多行,以列表的形式存储              
```



#### 1.3.2 清空写 --> w

```python
w: 清空写文本                                              
f = open("txt.txt",mode="w",encoding="utf-8")

清空写会把要操作的文件先清空，然后再写入

//w模式打开文件后会清空文件内容
f = open("txt.txt",mode="w",encoding="utf-8")
print (f)
txt.txt文件中的内容会被清空

//写入内容
f = open("txt.txt",mode="w",encoding="utf-8")
print (f.write("呵呵\n哈哈"))
5
txt.txt文件中的内容为如下，并且光标在最开头
呵呵
哈哈

//连续写会从文件最后开始写
f = open("txt.txt",mode="w",encoding="utf-8")
print (f.write("呵呵\n哈哈"))
print (f.write("嘻嘻\n嘿嘿"))
5
5
txt.txt文件中的内容如下，并且光标在最开头
呵呵
哈哈嘻嘻
嘿嘿


//对文件写操作后，需要刷新和关闭文件
f = open("txt.txt",mode="w",encoding="utf-8")
print (f.write("呵呵\n哈哈"))
print (f.write("嘻嘻\n嘿嘿"))
print (f.write("啦啦\n吼吼"))
f.flush()
f.close()
5
5
5
txt.txt文件中的内容如下，并且光标在最开头
呵呵
哈哈嘻嘻
嘿嘿啦啦
吼吼
```



#### 1.3.3 追加写 --> a

```python
a: 追加写文本                                              
f = open("txt.txt",mode="a",encoding="utf-8")


//追加写文本	只会在同一行追加
f = open("txt.txt",mode="a",encoding="utf-8")
print (f.write("呵呵"))
print (f.write("哈哈"))
print (f.write("嘿嘿"))

txt.txt文件内容如下，并且光标在最开头
呵呵哈哈嘿嘿

```



#### 1.3.4 只读字节 --> rb

```python
⚠️二进制方式读取文件不能指定字符集
f = open("txt.txt",mode="rb",encoding="utf-8")
print (f.read())
ValueError: binary mode doesn't take an encoding argument
  
//txt.txt文件中的内容为 呵呵哈哈嘿嘿
f = open("txt.txt",mode="rb")
print (f.read())
b'\xe5\x91\xb5\xe5\x91\xb5\xe5\x93\x88\xe5\x93\x88\xe5\x98\xbf\xe5\x98\xbf'

以上的字节的内容就是 呵呵哈哈嘿嘿
```



#### 1.3.5 清空写字节 --> wb

```python
1. 字节内容说明b'\xe5\x91\xb5\xe5\x91\xb5\xe5\x93\x88\xe5\x93\x88\xe5\x98\xbf\xe5\x98\xbf' txt.txt的内容是 呵呵哈哈嘿嘿

2. 清空txt.txt文件

3. f.write()括号中只能写字节 b'\xxx'⚠️
f = open("txt.txt",mode="wb")
f.write(b'\xe5\x91\xb5\xe5\x91\xb5\xe5\x93\x88\xe5\x93\x88\xe5\x98\xbf\xe5\x98\xbf')

4.此时txt.txt文件内容如下
呵呵哈哈嘿嘿
```



#### 1.3.6 追加写字节 --> ab

```python
1. 字节内容说明b'\xe5\x91\xb5\xe5\x91\xb5\xe5\x93\x88\xe5\x93\x88\xe5\x98\xbf\xe5\x98\xbf' 的内容是 呵呵哈哈嘿嘿

2. txt.txt文件内容是 呵呵哈哈嘿嘿

3. f.write()括号中只能写字节 b'\xxx'⚠️
f = open("txt.txt",mode="ab")
f.write(b'\xe5\x91\xb5\xe5\x91\xb5\xe5\x93\x88\xe5\x93\x88\xe5\x98\xbf\xe5\x98\xbf')

4.此时txt.txt文件内容如下,已成功追加
呵呵哈哈嘿嘿呵呵哈哈嘿嘿
```



#### 1.3.7 读写 --> r+

```python
txt.txt文件内容为 呵呵哈哈嘿嘿

f = open("txt.txt","r+",encoding="utf-8")
a = f.read()                                                        
f.write("这是读写")                       
呵呵哈哈嘿嘿

此时txt.txt文件内容为
呵呵哈哈嘿嘿这是读写
```



#### 1.3.8 清空写读 --> w+

```python
txt.txt文件内容为 呵呵哈哈嘿嘿

f = open("txt.txt","w+",encoding="utf-8")
print (f.write("清空写读"))
print (f.read())
4


此时txt.txt文件内容如下，并且光标在最后边
清空写读
```



#### 1.3.9 追加写读 --> a+

```python
txt.txt文件内容为 呵呵哈哈嘿嘿

f = open("txt.txt","a+",encoding="utf-8")
print (f.write("追加写读"))
print (f.read())

此时txt.txt文件内容如下，并且光标在追字前边
呵呵哈哈嘿嘿追加写读
```



### 1.4 光标操作

```python
txt.txt内容为 呵呵哈哈嘿嘿

光标操作总结                                                                 
f = open("txt.txt","r",encoding="utf-8")      
f.seek(0,0)   		#移动到文件头部                     
f.seek(0,1)   		#移动到光标当前位置                  
f.seek(0,2)   		#移动到文件末尾                    
f.seek(3)     		#移动3个字节,根据编码不同决定移动的字节大小     
print(f.read())                            
print(f.tell())  	#查看光标 返回的是字节    

```



### 1.5 with open

```python
with open     
1.自动关闭文件      
2.可以同时操作多个文件  
3.as 起别名        

现在有两个文件 t1 t2，t1内容为t1，t2内容为t2
with open("t1","r",encoding="utf-8") as f1, \
     open("t2","r",encoding="utf-8") as f2:

    print (f1.read())
    print (f2.read())
    
    t1
    t2
    
⚠️两个open之间必须以逗号分隔，print必须在with的下一级
```



### 1.6 修改文件名及文件内容

#### 1.6.1 修改文件名

```python
现在有两个文件 t1 t2，t1内容为t1，t2内容为t2
现在想把两个文件名互换 即t1 --> t2   t2 --> t1

转换思路，将t1改名为临时文件t3，然后把t2改名为t1，最后把t3改名为t1，即
t1 --> t3
t2 --> t1
t3 --> t2



import os  # 与操作系统做交互
os.rename("t1","t3")
os.rename("t2","t1")
os.rename("t3","t2")

此时t1内容为t2，t2内容为t1
```



#### 1.6.2 修改文件内容

```python
t1的内容如下
abc
okm
tgb
  
现在要把t1中的b替换成“呵呵”

替换思路，拷贝t1为t2，⚠️尽量不在原文件修改


⚠️文本中存储的都是字符串                                     
with open("t1","r",encoding="utf-8")as f,\    
     open("t2","w",encoding="utf-8")as f1:    
     for i in f:                                 
         f1.write(i.replace("b","呵呵"))          
         f1.flush()                              

此时t2内容如下，已经将t1中的b替换成了呵呵
a呵呵c
okm
tg呵呵


因为t1是读的，t2才是写的文件，现在的需求是t1中修改，因此还需要转换一下文件名
即把t1与t2的文件名相互替换，这样才能达到需求，同时改名后的源文件t2不要删除

import os  # 与操作系统做交互
os.rename("t1","t3")
os.rename("t2","t1")
os.rename("t3","t2")

此时t1文件内容如下
a呵呵c
okm
tg呵呵

t2文件内容如下
abc
okm
tgb


#文件替换内容步骤总结
1.不要在原文件操作，需要拷贝一个文件
2.读原文件，改拷贝的文件
3.改完拷贝的文件后再替换文件名
4.保留替换文件名后的原文件
```

