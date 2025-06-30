[toc]



# python基础七	基础数据类型-字符串

## 1.字符串

## 1. 字符串的方法

```python
upper					#全部大写
lower					#全部小写
startswith		#以什么开头  支持切片
endswith			#以什么结尾  支持切片
count					#统计
strip					#去除头尾两端的空格,换行符,制表符,还可指定去除内容
split					#分割, 默认以空格,换行符,制表符进行分割,可以指定分割内容, 返回是列表
replace				#替换 参数1(旧值),参数2(新值),参数3(次数)  默认全换
capitalize 		#首字母大写
title					#每个单词首字母大写
index					#根据元素查找索引 查找不到报错
find					#根据元素查找索引 查找不到返回-1
join				 	#将列表转换为字符串 
split					#将字符串转换为列表
center				#居中
format				#格式化
swapcase			#大小写转换



# is系列
str.isalnum				#判断数字,中文,字母
str.isalpha				#判断中文,字母
str.isdigit				#判断阿拉伯数字
str.isdecimal			#判断十进制
```

### 1.1 upper

``全部大写``

```python
name = "abc"
print (name.upper())
ABC
```



### 1.2 lower

``全部小写``

```python
name = "ABC"
print (name.lower())
abc
```



### 1.3 startswith

``以。。。开头，支持切片，返回布尔值``

```python
//无切片示例
name = "abcdefg"
print (name.startswith("a"))
True

print (name.startswith("b"))
False


//有切片示例1
name = "abcdefg"
print (name[1:3])
bc

print (name.startswith("a",1,3))		# 切片结果为bc，不是以a开头，因此结果为False
False


//有切片示例2
name = "abcdefg"
print (name[-1:3:-1])
gfe

//反向取值无法正确匹配
print (name.startswith("g",-1,3))
False


//startswith最多3个参数，第一个参数：匹配内容，第二、三个参数：切片范围
print (name.startswith("g",-1,3,-1))
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: startswith() takes at most 3 arguments (1 given)
```



### 1.4 endswith

``以。。。结尾，支持切片，返回布尔值``

```python
//无切片示例
name = "abcdefg"
print (name.endswith("g"))
True

print (name.endswith("f"))
False


//有切片示例1
name = "abcdefg"
print (name[1:3])
bc

print (name.endswith("a",1,3))		# 切片结果为bc,不是以a结尾，因此结果为False
False

print (name.endswith("c",1,3))		# 切片结果为bc,以c结尾,因此结果为True
True



//有切片示例2
name = "abcdefg"
print (name[-1:3:-1])
gfe

//反向取值无法正确匹配
print (name.endswith("e",-1,3))
False
```



### 1.5 strip  					

``去除头尾两端的空格,换行符,制表符,还可指定去除内容``

```python
//去除头尾两端的空格、换行符、制表符
name = " ab c\td a "
print (name.strip())
ab c	d a				//strip只会去除头尾两端的空格、换行符、制表符，中间的空格、换行符、制表符不会去除


//指定去除内容
name = "ab c\td a"
print (name.strip("a"))
b c	d						//指定去除的内容"a",strip只会去除开头和结尾的a
```



### 1.6 split  					

``作用1:分割, 默认以空格,换行符,制表符进行分割,可以指定分割内容, 返回是列表``

``作用2:将字符串转换为列表``

```python
1.分割
//默认以空格、换行符、制表符进行分割，返回列表
name = "hehe haha"				//中间的空格会销毁
print (name.split())
['hehe', 'haha']


//指定分割内容，返回列表
name = "hehe:haha"
print (name.split(":"))
['hehe', 'haha']

print (name.split("h"))
['', 'e', 'e:', 'a', 'a']


2.将字符串转换为列表
s = "hehe"
print (s.split())
['hehe']

print (type(s.split()))
<class 'list'>
```



### 1.7 replace 				

``替换 参数1(旧值),参数2(新值),参数3(次数)  默认全换``

```python
name = "hehe hehe hehe"

//默认全部替换示例，替换hehe为haha
print (name.replace("e","a"))
haha haha haha

//只替换第一个hehe为haha
print (name.replace("e","a",2))
haha hehe hehe
```



### 1.8 count

``计算字符出现次数``

```python
//统计变量name中a出现的次数
name = "abcdeabcde"
print (name.count("a"))
2
```



### 1.9 capitalize 

``首字母大写``

```python
s = "hehe"
print (s.capitalize())
Hehe
```



### 1.10 title

``每个单词首字母大写``

```python
s = "hehe,haha"
print (s.title())
Hehe,Haha
```



### 1.11 index

``根据元素查找索引 查找不到报错``

```python
#通过元素查找索引
s = [1,2,3,"b"]
s = s.index("b")
print (s)
3

查找不到报错
s = [1,2,3,"b"]
s = s.index("c")
print (s)
ValueError: 'c' is not in list
```



### 1.12 find

``根据元素查找索引 查找不到返回-1``

```python
#列表不支持find
s = [1,2,3,"b"]
s = s.find("c")
print (s)
AttributeError: 'list' object has no attribute 'find'
  
  
#查找不到返回-1  
s = "abc"
s = s.find("d")
print (s)
-1
```



### 1.13 join 

``将列表转换为字符串`` 

```python
//join()	将列表转换为字符串
lst = ['a','b','c']
s = "_".join(lst)
print (s)
a_b_c

print (type(s))
<class 'str'>
```



### 1.14 center	

``居中``

```python
//示例1
s = "abc"
s = s.center(20)
print (s)
        abc         		//总长度20


//示例2
s = "abc"
s.center(20,"_")	//总长度20 左右两边为_
s = "abc"
s = s.center(20,"_")
print (s)
________abc_________
```



### 1.15 format

``格式化``

```python
1.按照位置格式化
s = "a{}b"
s1 = s.format("你好")
print (s1)
a你好b

2.按照索引格式化
s = "a{1}b"
s1 = s.format("你好","呵呵")
print (s1)
a呵呵b

3.按照关键字格式化
s = "a{A}b"
s = s.format(A="你好")
print (s)
a你好b
```



### 1.16 swapcase

``大小写转换``

```python
s = "abc"
print (s.swapcase())
ABC

s = "abcD"
print (s.swapcase())
ABCd
```



## is系列

### 1.17 str.isalnum   	

``判断是否只包含数字,中文,字母，返回布尔值``

```python
//只包含数字、中文、字母，返回结果True
name = "123呵呵haha"
print (name.isalnum())
True

//包含数字、中文、字母，同时包含特殊符号*，返回结果False
name = "123呵呵haha*"
print (name.isalnum())
False
```



### 1.18 str.isalpha   

``判断中文,字母,返回布尔值``

```python
//只包含中文、字母，返回结果为True
name = "呵呵hehe"
print (name.isalpha())
True

//包含中文、字母，同时包含数字，返回结果为False
name = "呵呵hehe123"
print (name.isalpha())
False
```



### 1.19 str.isdigit   	

``判断阿拉伯数字,返回布尔值``

```python
//isdigit有bug，圆圈5也算作是阿拉伯数字，因此用isdecimal做判断更好
name = "1231⑤"
print (name.isdigit())
True


name = "12315"
print (name.isdigit())
True


//赋值方式错误
name = 12315
print (name.isdigit())
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'int' object has no attribute 'isdigit'
```



### 1.20 str.isdecimal 	

``判断十进制，返回布尔值``

```python
//判断十进制数字
name = "10"
print (name.isdecimal())
True

//用isdecimal判断圆圈数字更准确
name = "1231⑤"
print (name.isdecimal())
False
```

