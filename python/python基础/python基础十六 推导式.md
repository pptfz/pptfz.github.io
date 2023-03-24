[toc]



# python基础十六	推导式

## 1.推导式

### 1.1 作用

> 做一些有规律的数据结构
>

### 1.2 列表推导式

> 普通循环	[加工后的变量 for循环]
>
> 筛选模式	[加工后的变量 for循环 条件]

#### 1.2.1 普通循环

```python
[变量 for循环]

//代码示例1	要循环输出1-10
原先的代码
lst = []
for i in range(1,11):
    lst.append(i)
print(lst)
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]


使用列表推导式
lst = [ i for i in range(1,11)]
print (lst)
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]


//代码示例2	将1-10内的数的平方追加到列表中
原先代码
l1 = []
for i in range(1,11):
    i *= i
    l1.append(i)
print (l1)
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

使用列表推导式
l1 = [i*i for i in range(1,11)]
print(l1)
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

#### 1.2.2 筛选模式

```python
[加工后的变量 for循环 条件]
//代码示例1 找出30以内可以被3整除的数
原先的代码
lst = []
for i in range(1,31):
    if i % 3 == 0:
        lst.append(i)
print (lst)
[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]

列表推导式
f = [i for i in range(1,31) if i % 3 == 0]
print (f)

⚠️推导式外边加括号就是返回生成器的内存空间地址
f = (i for i in range(1,31) if i % 3 == 0)
print (f)
<generator object <genexpr> at 0x7fa7281a7d00>
```



### 1.3 字典推导式

> 普通循环

> 筛选模式

#### 1.3.1 普通循环

```python
print({i:i+1 for i in range(3)})
{0: 1, 1: 2, 2: 3}
```

#### 1.3.2 筛选模式

```python
print({i:i+1 for i in range(3) if i > 1})  
{加工后的变量:加工的后的变量 for循环 加工条件}  

{2: 3}
```



### 1.4 集合推导式

> 普通循环

> 筛选模式

#### 1.4.1 普通循环

```python
print({i for i in range(3)})
{0, 1, 2}
```



#### 1.4.2 筛选模式

```python
print({i for i in range(3) if i > 1})
{2}
```



### 1.5 生成器推导式

> 普通循环

> 筛选模式

#### 1.5.1 普通模式

```python
g = (i for i in range(3))
print(next(g))
print(next(g))
0
1
```



#### 1.5.2 筛选模式

```python
g = (i for i in range(3) if i+1 == 2)
print (next(g))
1
```

