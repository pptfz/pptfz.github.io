[toc]



# python基础二十	正则表达式

## 1.正则表达式说明

**正则就是用一些具有特殊含义的符号组合到一起去匹配相应的内容的方法，在python中，使用正则需要导入re模块正则表达式模式被编译成一系列的字节码，然后用c编写的匹配引擎执行**



**正则表达式元字符**

| 元字符   | 匹配内容                                                     |
| :------- | :----------------------------------------------------------- |
| `\w`     | 匹配字母（包含中文）或数字或下划线                           |
| `\W`     | 匹配非字母（包含中文）或数字或下划线                         |
| `\s`     | 匹配任意的空白符                                             |
| `\S`     | 匹配任意非空白符                                             |
| `\d`     | 匹配数字                                                     |
| `\D`     | 匹配非数字                                                   |
| `\A`     | 从字符串开头匹配                                             |
| `\z`     | 匹配字符串的结束，如果是换行，只匹配到换行前的结果           |
| `\n`     | 匹配一个换行符                                               |
| `\t`     | 匹配一个制表符                                               |
| `^`      | 匹配字符串的开始                                             |
| `$`      | 匹配字符串的结尾                                             |
| `.`      | 匹配任意字符，除了换行符，当re.DOTALL标记被指定时，则可以匹配包括换行符的任意字符。 |
| `[...]`  | 匹配字符组中的字符                                           |
| `[^...]` | 匹配除了字符组中的字符的所有字符                             |
| `*`      | 匹配0个或者多个左边的字符。                                  |
| `+`      | 匹配一个或者多个左边的字符。                                 |
| `?`      | 匹配0个或者1个左边的字符，非贪婪方式。                       |
| `{n}`    | 精准匹配n个前面的表达式。                                    |
| `{n,m}`  | 匹配n到m次由前面的正则表达式定义的片段，贪婪方式             |
| `ab`     | 匹配a或者b                                                   |
| `()`     | 匹配括号内的表达式，也表示一个组                             |



## 2.匹配模式

### 2.1 字符 串常用操作

```python
s1 = 'python正则练习'
print(s1.find('python'))
0

print(s1.find('正则'))
6

print(s1.find('abc'))
-1
```



### 2.2 正则匹配示例

#### `\w`	匹配中文、字母、数字、下划线

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\w',s))

结果：
['p', 'y', 't', 'h', 'o', 'n', '正', '则', '表', '达', '式', '练', '习', '_', '1', '1', '1']
```



#### `\W`	和 `\w` 相反，不匹配中文、字母、数字、下划线

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\W',s))

结果：
['-', ' ', ' ', '.']
```



#### `\s`	匹配任意空白符

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\s',s))

结果，匹配到了练习前边的两个空格：
[' ', ' ']
```



#### `\d`	匹配数字

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\d',s))

结果：
['1', '1', '1']
```



#### `\D`	与 `\d` 相反，匹配非数字

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\D',s))

结果：
['p', 'y', 't', 'h', 'o', 'n', '-', '正', '则', '表', '达', '式', ' ', ' ', '练', '习', '_', '.']
```



#### `\A` 与 `^`	以什么开头

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('\Apython',s))
print(re.findall('^python',s))

结果：
['python']
```



#### `\Z` 与 `$`	以什么结尾

```python
import re

s = 'python-正则表达式  练习_1.11'
print(re.findall('1.11\Z',s))
print(re.findall('1.11$',s))

结果：
['1.11']
```



#### `\n`	匹配换行符

```python
import re

s = 'python-正则表达式  \n\t练习_1.11'
print(re.findall('\n',s))

结果：
['\n']
```



#### `\t`	匹配制表符

```python
import re

s = 'python-正则表达式  \n\t练习_1.11'
print(re.findall('\t',s))

结果：
['\t']
```





## 3.匹配方式

### `.`	匹配除换行符外的任意字符

```python
import re

s = 'python-正则表达式  \n\t练习_1.11'
print(re.findall('.',s))

结果：
['p', 'y', 't', 'h', 'o', 'n', '-', '正', '则', '表', '达', '式', ' ', ' ', '\t', '练', '习', '_', '1', '.', '1', '1']

```



### `.`	如果加了DOTALL标记就可以匹配任意字符

```python
import re

s = 'python-正则表达式  \n\t练习_1.11'
print(re.findall('.',s,re.DOTALL))

结果，可以看到加了DOTALL标志就匹配到了.原本无法匹配的换行符\t
['p', 'y', 't', 'h', 'o', 'n', '-', '正', '则', '表', '达', '式', ' ', ' ', '\n', '\t', '练', '习', '_', '1', '.', '1', '1']
```



### `?`	匹配前边的元素出现0个或者1个

```python
import re

s = 'a-b-ab-abab-ababab-ababc'
print(re.findall('ab?',s))

结果，匹配到了全部的8个连续的ab，还可以匹配到一个a，因为b可以没有
['a', 'ab', 'ab', 'ab', 'ab', 'ab', 'ab', 'ab', 'ab']
```



### `*`	匹配前边的元素出现0个或者多个(贪婪匹配)

```python
import re

s = 'a-b-ab-abab'
print(re.findall('ab*',s))

结果：
['a', 'ab', 'ab', 'ab']
```



### `+`	匹配前边的元素出现1个或者多个(贪婪匹配)

```python
import re

s = 'a-b-ab-abab'
print(re.findall('ab+',s))

结果：
['ab', 'ab', 'ab']
```



### `{n,m}`	匹配前边的元素出现n到m个	

```python
import re

s = 'aa-bb-aaabb-aaaaab'
print(re.findall('aaa{1,3}',s))

结果：
['aaa', 'aaaaa']


#其他匹配
{n}		#前边的字符出现n次
{n,}	#前边的字符最少出现n次
{,m}	#前边的字符最多出现m次
```



### `.*`	匹配任意内容0个或者多个

```python
import re

s = 'aa-bb-aaabb-aaaaab'
print(re.findall('b.*',s))

结果：
['bb-aaabb-aaaaab']
```



### `.?`	匹配任意内容1个或者多个

```python
import re

s = 'ab-bb-aab-aaaaab'
print(re.findall('a.?b',s))

结果：
['ab', 'aab', 'aab']
```



### `[]`	范围匹配

```python
import re

s = 'ab-bb-aab-123'
print(re.findall('[a-z]',s))

结果：
['a', 'b', 'b', 'b', 'a', 'a', 'b']
```



### `[^]`	与范围匹配相反，不匹配中括号中的内容

```python
import re

s = 'ab-bb-aab-123'
print(re.findall('[^a-z]',s))

结果：
['-', '-', '-', '1', '2', '3']
```



## 4.常用方法

### 4.1 findall	全部找到并返回一个列表

```python
import re

s = 'ab-bb-aab-abc-abbc'
print(re.findall('abc',s))

['abc']
```



### 4.2 search	从字符串任意位置进行匹配，查找到一个就停止

**返回的是一个对象，获取匹配内容必须使用 `.group()`**

```python
import re

s = 'ab-bb-abc-abc-abbc'
print(re.search('abc',s))

结果，如果不加.group()获取匹配内容，返回的是一个对象
<_sre.SRE_Match object; span=(6, 9), match='abc'>


#使用.group()方法获取匹配内容
print(re.search('abc',s).group())
abc
```



### 4.3 match	从字符串开始位置进行匹配

```python
import re

s = 'ab-bb-abc-abc-abbc'
print(re.match('ab ',s).group())
ab


#以上示例中必须以a或者ab开始查看，否则会报错
print(re.match('bb ',s).group())
AttributeError: 'NoneType' object has no attribute 'group'
```



### 4.4 split	分隔，可按照任意分隔符进行分隔

```python
import re

s = 'ab-bb-abc-abc-abbc'
print(re.split('bb',s))	#以bb为分隔符

结果：
['ab-', '-abc-abc-a', 'c']
```



### 4.5 sub	替换

```python
import re

s = 'ab-bb-abc-abc-abbc'
print(re.sub('bb','呵呵',s))	#将bb替换为呵呵

结果：
ab-呵呵-abc-abc-a呵呵c
```



### 4.6 compile	定义匹配规则

```python
import re

s = 'ab-123-abc-abc-a123bbc'
obj = re.compile('\d{2}')		#定义匹配规则，数字出现2次
print(obj.findall(s))

结果：
['12', '12']
```



### 4.7 finditer	返回一个迭代器

```python
格式
re.finditer('匹配的内容',操作的对象)

import re

s = 'ab-123-abc-abc-a123bbc'
g = re.finditer('ab',s)	#'ab'为匹配的内容，s为操作的对象
print(next(g).group())

结果：
ab
```



### 4.8 给分组()起名字

```python
格式
(?P<分组名称>)


import re

s = 'ab-123-abc-abc-a123bbc'
ret = re.search('(?P<test_abc>)abc',s)	#给分组起名为test_abc
print(ret.group())

结果：
abc
```

