[toc]



# python基础四	格式化

## 1. %占位填位表示法

### 1.1 说明

- 占位

```python
%s	字符串占位 ⚠️字符串可以填充数字，后边的补位可以是整型
%d	与%i相同，整型占位	⚠️后边的补位必须为整型
```

- 补位

```python
变量名%(打印的内容) ⚠️补位必须与占位位数相同
```

### 1.2 代码示例

```python
#msg中的变量名后的%s表示给对应的变量占位，而在最后的print中%表示取位

name = input("name")
age = input("age")
sex = input("sex")
hobby = input("hobby")

msg = """
------info------
name:%s
age:%s
sex:%s
hobby:%s
-------end------
"""
print(msg%(name,int(age),sex,hobby))
```



## 2. f+{}表示法	python3.6以上支持

### 2.1 说明

```python
用f表示格式化
msg =f"myname is {input('name')}"
```



### 2.2 代码示例

```python
msg = f"my name is {input('请输入姓名：')} I'm {input('请输入年龄: ')} years old"
print (msg)
```



## 3. 条件格式化

### 3.1 按照位置

```python
s = "a{}b"
s1 = s.format("你好")
print (s1)
a你好b
```



### 3.2 按照索引

```python
s = "a{1}b"
s1 = s.format("你好","呵呵")
print (s1)
a呵呵b
```



### 3.3 按照关键字

```python
s = "a{A}b"
s = s.format(A="你好")
print (s)
a你好b
```



## 4.其他格式化

#### 4.1 格式化函数使用示例

```python
def func(a,b):
    return a + b

msg = f"运行结果:{func(1,2)}"
print(msg)
运行结果:3
```



#### 4.2 格式化列表、字典使用示例

```python
#f-string支持列表
lst = [1,2,3,4,5,6]
msg = f"运行结果:{lst[0:3]}"
print(msg)
[1,2,3]


#f-string支持字典
dic = {"key":1,"key1":22}
msg = f"运行结果:{dic['key1']}"
print(msg)
运行结果:22
```



#### 4.3 三木运算符使用示例

```python
a = 100
b = 20
msg = f"{a if a < b else b}"
print(msg)
20
```

