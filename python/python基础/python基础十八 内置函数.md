[toc]



# python基础十八	内置函数

## 1. 含义

> python帮助我们写了很多的功能供使用



## 2. 了解函数

```python
all() any() bytes() callable() chr() complex() divmod() eval() exec() frozenset() globals() hash() help() id() input() int() iter() locals() next() oct() ord() pow() repr() round()
```

### 2.1 all

``判断元素是否都为True，全部为True才返回True``

```python
print(all(['a','b','c']))
True

print(all(['a','b','c',0]))
False
```

### 2.2 any

``判断元素中是否含有True，有一个True即为True``

```python
print(any(['a','b','c',0]))
True
```

### 2.3 bytes

``字节串``

```python
print(bytes('呵呵',encoding='utf-8'))
b'\xe5\x91\xb5\xe5\x91\xb5'
```

### 2.4 callable

``判断是否可调用，返回布尔值``

```python
print(callable([1,1]))
False

def func():
    pass
print(callable(func))
True
```

### 2.5 chr

``根据当前编码（unicode，兼容所有）查对应的内容``

```python
print (chr(15678))
摎
```

### 2.6 ord

``查看内容对应的编码``

```python
print (ord('摎'))
15678
```

### 2.7 complex

``复数``

```python
print(complex(10))
(10+0j)
```

### 2.8 divmod

``获取的是元组，第一个是商，第二个是余数``

```python
print(divmod(10,3))
(3, 1)
```

### 2.9 hash

``查看内容是否可哈希``

```python
print(hash(111))			#结果111
print(hash([1,1,3]))	#结果报错TypeError: unhashable type: 'list'
```

### 2.10 help

``查看帮助``

```python
print (help(str))
```

### 2.11bin

``十进制转换成二进制``

```python
print(bin(10)) 
0b1010
```

### 2.12 oct

``十进制转换成八进制``

```python
print(oct(10))
0o11
```

### 2.13 hex

``十进制转换成十六进制``

```python
print(hex(10))
0xa
```

### 2.14 int

``其他进制转换为十进制``

```python
int("xxx",16)	十六进制转换为10进制
int("xxx",8)	八进制转换为10进制
```

### 2.15 pow

``幂``

```python
print(pow(3,1))
9
```

### 2.16 repr

``显示数据类型	原形必漏``

```python
s = "113"
s1 = 113
print(repr(s))  #原形必漏	'113'	
print(s1)       #113 	         

```

### 2.17 round

``保留小数位，默认取值``

```python
print(round(1.431341314,3))
```

### 2.18 frozenset

``冻结集合``

```python
//创建可变集合
s={'a','b'}
print(s)
{'a', 'b'}

修改集合
s.add('c')
print(s)
{'a', 'b', 'c'}


//创建不可变集合
s=frozenset('abc')
print(s)
frozenset({'b', 'c', 'a'})
print(type(s))
<class 'frozenset'>

尝试修改不可变集合
s.add('d')
print(s)
结果报错
	AttributeError: 'frozenset' object has no attribute 'add'

```

### 2.19 eval	⚠️禁用

```python
eval会将字符串转成表达式并执行，比较危险
这样就可以利用执行系统命令，执行删除文件等操作，因此禁用


//代码示例1 eval函数会将字符串转换成表达式执行
msg = "1+2+3"
print(eval(msg))
6

//代码示例2	危险用法，可以执行用户输入的任何内容
如果用在了用户评论中，则用户评论输入的内容就会执行，例如输入死循环、删除等操作，非常危险
msg = "input('>>>')"
print(eval(msg))
```

### 2.20 exec	⚠️禁用

```python
比较危险，msg中的任何代码都会执行

//代码示例
msg = """
def func():
    print("这么牛逼")
func()
"""
print(exec(msg))
这么牛逼
None
```





## 3. 重点函数

```python
enumerate() open() range() len() str() list() tuple() dict() set() print() sum() abs() dir() zip() format() reversed() filter() map() sorted() max() min() reduce()
```

### 3.1 abs

``绝对值``

```python
不管是正数还是负数都是正数
print(abs(-6))
print(abs(6))
6
6
```

### 3.2 format

``格式转换``	

```python
1.对齐方式
s = "你好"
s1 =  format(s,">10")
s1 =  format(s,"<10")
s3 =  format(s,"^10")
print(s1)
print(s1)
print(s3)             
                  你好
你好                  
         你好
  
2.进制转换
//将十进制转换成二进制
print(format(12,"b"))
print(format(12,"08b"))

//将十进制转换成八进制
print(format(12,"o"))
print(format(12,"08o"))

//将二进制转换成十进制
print(format(0b11001,"d"))

//将十进制转换成十六进制
print(format(17,"x"))
print(format(17,"08x"))
```

### 3.3 enumerate

``枚举``

```python
enumerate() 函数用于将一个可遍历的数据对象(如列表、元组或字符串)组合为一个索引序列，同时列出数据和数据下标，一般用在 for 循环当中。


s = ['a','b','c']
lst = list(enumerate(s))
print (lst)
[(0, 'a'), (1, 'b'), (1, 'c')]

lst = list(enumerate(s,start=1))
print (lst)
[(1, 'a'), (3, 'b'), (4, 'c')]
```

### 3.4 sum

``求和``

```python
print(sum([1,1,3,4]))
10
```

### 3.5 print

``打印``

```python
1.文件流
f = open('a','a',encoding="utf-8")
print ('hehe',file=f)
会在当前py文件目录下创建文件a，文件a中的内容为hehe

2.修改print默认换行
//print默认有换行符
print ('a')
print ('b')
a
b

//修改print默认换行符
print ('a',end="|")
print ('b')
a|b


//修改print默认分隔符 print默认以空格分隔
print ('a','b')
a b

print ('a','b',sep='?')
a?b

```

### 3.6 zip

``拉链``

```python
lst1 = [1,2,3,4,5]
lst2 = [5,4,3,2,1]

将lst1和lst2中下标相同的元素组成一个新的结构
//lambda+map写法
print (list(map(lambda x,y:(x,y),lst1,lst2)))
[(1, 5), (2, 4), (3, 3), (4, 2), (5, 1)]

//list+zip写法
lst1 = [1,2,3,4,5]
lst2 = [5,4,3,2,1]
print (list(zip(lst1,lst2)))
[(1, 5), (2, 4), (3, 3), (4, 2), (5, 1)]

//卧槽
lst1 = [1,2,3,4,5]
lst2 = [5,4,3,2,1]
print (dict(zip(lst1,lst2)))
{1: 5, 2: 4, 3: 3, 4: 2, 5: 1}
```





## 4.高阶函数

```python
filter() map() reduce()     
以上3个函数必须有条件和参数！！！


max() min() sorted()  
```

### 4.1 filter	🌟🌟🌟

``过滤``

```python
筛选列表中数字大于5的
lst = [1,2,3,5,66,7,8,9]

原先代码
new_lst = []
for i in lst:
    if i > 5:
        new_lst.append(i)
print (new_lst)
[66, 7, 8, 9]


filter高阶函数写法
//写法1
lst = [1,2,3,5,66,7,8,9]
def func(x):
    return x > 5
print (list(filter(func,lst)))
[66, 7, 8, 9]

//写法2
lst = [1,2,3,5,66,7,8,9]
print (list(filter(lambda x:x>5,lst)))
[66, 7, 8, 9]
```

### 4.2 map	🌟🌟🌟

``映射``

```python
映射，将可迭代对象中每个元素执行函数功能

//示例1
将列表中的元素转换成字符串
lst = [1,2,3,4,5]
new_lst = []
for i in lst:
    new_lst.append(str(i))
print (new_lst)
['1', '2', '3', '4', '5']


高阶函数写法
lst = [1,2,3,4,5]
print (list(map(str,lst)))
['1', '2', '3', '4', '5']


//示例2
将两个列表中下标相同的元素相加
原先代码
lst1 = [1,2,3]
lst2 = [3,2,1]
for i in range(len(lst1)):
    print (lst1[i] + lst2[i])
4
4
4

高阶函数写法
//写法1
lst1 = [1,2,3]
lst2 = [3,2,1]
def func(x,y):
    return x+y
print (list(map(func,lst1,lst2)))
[4, 4, 4]

//写法2
lst1 = [1,2,3]
lst2 = [3,2,1]
print (list(map(lambda x,y:x+y,lst1,lst2)))
[4, 4, 4]

//写法3	当两个列表中的元素个数不同时
lst1 = [1,2,3,4]
lst2 = [3,2,1]
lst3 = [9,8,7,6,5]
print (list(map(lambda x,y,z:x+y+z,lst1,lst2,lst3)))
[13, 12, 11]
⚠️只相加最短的
```

### 4.3 reduce		🌟🌟🌟

``累计算``

```python
lst = [1,2,3,4,5]
from functools import reduce
def func(x,y):
    return x+y
print(reduce(func,lst))
15
累计算过程
1.将1和2同时赋予x和y，此时x为3，将3赋予y,此时x为6，将4赋予y,此时x为10，将5赋予y，最后x和y相加

//lambda写法
lst = [1,2,3,4,5]
from functools import reduce
print (reduce(lambda x,y:x+y,lst))
15
```



### 4.4 sorted

``排序``

```python
用于排序
对以下列表排序
lst = [1,2,9,5,7,8,-6]

//写法1	
lst = [1,2,9,5,7,8,-6]
lst.sort()			#⚠️原地修改
print (lst)
[-6, 1, 2, 5, 7, 8, 9]

//写法2
lst = [1,2,9,5,7,8,-6]
print (sorted(lst))		#⚠️新开内存空间
[-6, 1, 2, 5, 7, 8, 9]


对字符串进行排序
print (sorted('hehe,ggsimida'))	#升序
[',', 'a', 'd', 'e', 'e', 'g', 'g', 'h', 'h', 'i', 'i', 'm', 's']

print (sorted('hehe,ggsimida',reverse=True))  #降序
['s', 'm', 'i', 'i', 'h', 'h', 'g', 'g', 'e', 'e', 'd', 'a', ',']


高阶函数写法
按照长度进行排序
//写法1
lst = ['你好啊','呵呵','不好理解','啊']
print (sorted(lst,key=len))
['啊', '呵呵', '你好啊', '不好理解']
⚠️sorted这里要先写操作对象名，然后指定key，根据什么进行排序

//写法2
lst = ['你好啊','呵呵','不好理解','啊']
print (sorted(lst,key=lambda x:len(x)))
['啊', '呵呵', '你好啊', '不好理解']
```

### 4.5 max() 最大	min()最小

```python
print (max([1,2,3,5,6,-8]))
6
print (max([1,2,3,5,6,-8],key=abs))	#不管正负数，选择最大

dic = {'a':3,'b':2,'c':1}
print (max(dic,key=lambda x:dic[x]))	#按值排序拿到键
a


print (min([1,2,3,5,6,-8]))
8
print (min([1,2,3,5,6,-8],key=abs))	#不管正负数，选择最小
```

