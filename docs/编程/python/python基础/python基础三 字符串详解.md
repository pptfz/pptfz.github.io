[toc]



# python基础三	字符串

## 1. 索引(下标)

### 1.1 定义

``方便查找字符串``



### 1.2 格式说明

> 变量名[下标]

### 1.3 代码说明

```python
name = "abcd"	计算机从0开始数数
0123			#从左向右
-1-2-3-4	#从右向左

#正向取值
print (name[2])
c

#反向取值
print (name[-3])
b
```



## 2. 切片

### 2.1 定义

``截取从一个位置到另一个位置``



### 2.2 格式说明

> 变量名[起始位置:终止位置]	⚠️顾头不顾尾，就是python中的切片从起始位置开始截取，到终止位置结束，不包含终止位置

### 2.3 代码说明

```python
name = "hehe_haha_xixi"

#正向打印	要打印hehe
print (name[0:4])		#0表示起始位置，4表示结束位置，但是不包含结束位置

#反向	要打印xixi
print (name[-4:])		#默认到结束位置

#正向全部打印
print (name[:])
hehe_haha_xixi

#反向全部打印
需要用到步长！！！


⚠️默认从头开始，到结尾
```



## 3. 步长

### 3.1 定义

``配合切片使用，表示切片时的规则，例如步长为2，切割完第一个位置后开始截取第3个位置``



### 3.2 格式说明

```python
变量名[切片起始位置:切片终止位置:步长]

name[1:5:2]		#name为变量名，1表示从字符下标1开始，下标5结束，步长为2
```



### 3.3 代码说明

```python
#例如要截取ace
name = "abcde"
print (name[0::2])
ace


#例如要截取hgfed
name = "abcdefghi"
print (name[-2:2:-1])
hgfed


⚠️步长默认为1
⚠️正向取结尾要加1，反向取结尾要减1
#例如要截取bcd
name = "abcde"

#正向取bcd，d的下标为3，正向取，要加1，因此为4
name = "abcde"
print (name[1:4])

#反向取bcd即dcb，b的下标为1，反向取，要减1，因此为0
name = "abcde"
print (name[-2:0:-1])
```



**⚠️⚠️⚠️索引超出最大范围会报错**

**⚠️⚠️⚠️切片超出最大范围不会报错**



## 4. 字符串的方法

```python
upper					#全部大写
lower					#全部小写
startswith		#以什么开头  支持切片
endswith			#以什么结尾  支持切片
count					#统计
strip					#去除头尾两端的空格,换行符,制表符,还可指定去除内容
split					#分割, 默认以空格,换行符,制表符进行分割,可以指定分割内容, 返回是列表
replace				#替换 参数1(旧值),参数2(新值),参数3(次数)  默认全换

# is系列
str.isalnum				#判断数字,中文,字母
str.isalpha				#判断中文,字母
str.isdigit				#判断阿拉伯数字
str.isdecimal			#判断十进制
```

### 4.1 upper

- 说明

​	``全部大写``

- 代码示例

```python
name = "abc"
print (name.upper())
ABC
```



### 4.2 lower

- 说明

​	``全部小写``

- 代码示例

```python
name = "ABC"
print (name.lower())
abc
```



### 4.3 startswith

- 说明

​	``以。。。开头，支持切片，返回布尔值``

- 代码示例

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
TypeError: startswith() takes at most 3 arguments (4 given)
```



### 4.4 endswith

- 说明

​	``以。。。结尾，支持切片，返回布尔值``

- 代码示例

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



### 4.5 strip  					

- 说明

​	``去除头尾两端的空格,换行符,制表符,还可指定去除内容``

- 代码示例

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



### 4.6 split  					

- 说明

​	``分割, 默认以空格,换行符,制表符进行分割,可以指定分割内容, 返回是列表``

- 代码示例

```python
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
```



### 4.7 replace 				

- 说明

​	``替换 参数1(旧值),参数2(新值),参数3(次数)  默认全换``

- 代码示例

```python
name = "hehe hehe hehe"

//默认全部替换示例，替换hehe为haha
print (name.replace("e","a"))
haha haha haha

//只替换第一个hehe为haha
print (name.replace("e","a",2))
haha hehe hehe
```



### 4.8 count

- 说明

​	``计算字符出现次数``

- 代码示例

```python
//统计变量name中a出现的次数
name = "abcdeabcde"
print (name.count("a"))
2
```



### 4.9 str.isalnum   	

- 说明

​	``判断是否只包含数字,中文,字母，返回布尔值``

- 代码示例

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



### 4.10 str.isalpha   

- 说明

​	``判断中文,字母,返回布尔值``

- 代码示例

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



### 4.11 str.isdigit   	

- 说明

​	``判断阿拉伯数字,返回布尔值``

- 代码示例

```python
//isdigit有bug，圆圈5也算作是阿拉伯数字，因此用isdecimal做判断更好
name = "1234⑤"
print (name.isdigit())
True


name = "12345"
print (name.isdigit())
True


//赋值方式错误
name = 12345
print (name.isdigit())
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'int' object has no attribute 'isdigit'
```



### 4.12 str.isdecimal 	

- 说明

​	``判断十进制，返回布尔值``

- 代码示例

```python
//判断十进制数字
name = "10"
print (name.isdecimal())
True

//用isdecimal判断圆圈数字更准确
name = "1234⑤"
print (name.isdecimal())
False
```

