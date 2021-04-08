[toc]



# python基础五	运算符

## 1. 比较运算符

```python
>			大于
<			小于
>=		大于等于
<=		小于等于
==		等于
!=		不等于
```



## 2. 赋值运算符

```python
=     等于
+=    加等于
-=    减等于
*=    乘等于
/=    除等于
//=   整除等于
**=   幂等于
%=		模等于
```



## 3. 逻辑运算符

### 3.1 说明

> 与 and
> 或 or
> 非 not

### 3.2 优先级和查找顺序

```python
#优先级
() > not	> and > or

#查找顺序
从左往右
```



### 3.3 True和False进行逻辑运算

```python
and:
一真一假,就是假
同真为真,同假为假

or:
一真一假,就是真
同真为真,同假为假
```



### 3.4 逻辑运算符与数字运算时的规则

```python
逻辑运算符与数字运算时的规则 
# and数字进行逻辑运算时:
# 数字不为 0 时和不为 False
# and运算选择and后边的内容
# and运算都为假时选择and前的内容
# and 运算一真一假选择假


示例
⚠️ 任何时候，0都可以看作是False
⚠️ 任何时候，除0外的其余数字都可以看作是True
print(1 and 3)	结果：3	原因：数字不为0的时候选择and后边的内容
print(3 and 1)	结果：1	原因：数字不为0的时候选择and后边的内容

print(0 and 8)	结果：0	原因：and运算一真一假选择假
print(8 and 0)	结果：0	原因：and运算一真一假选择假

print(False and 5)	结果：False	原因：为False选择False
print(5 and False)	结果：False	原因：and运算符一真一假选择假

print(0 and False)	结果：0	原因：将0看作False，and运算符都为假选择and前边的内容
print(False and 0)	结果：False	原因：and运算符都为假时选择and前的内容



# or 数字进行逻辑运算时:
# 数字不为 0 时和不为 False
# or运算选择or前边的内容
# or运算都为假时选择or后边的内容
# or 运算一真一假选择真

示例
print(1 or 3)	结果：1	原因：数字不为0的时候选择or前边的内容
print(3 or 1)	结果：3	原因：数字不为0的时候选择or前边的内容

print(0 or 8)	结果：8	原因：or运算一真一假选择真，0为假，8为真，选择8
print(8 or 0)	结果：8	原因：or运算一真一假选择真，0为假，8为真，选择8

print(False or 5)	结果：5	原因：or运算一真一假选择真，0位假，5为真，选择5
print(5 or False)	结果：5	原因：or运算一真一假选择真，0位假，5为真，选择5

print(0 or False)	结果：False	原因：0为假，or运算都为假时选择or后边的内容
print(False or 0)	结果：0	原因：0为假，or运算都为假时选择or后边的内容
```



## 4. 成员运算符

### 4.1 说明

> in 在。。。中
> not in 不在。。。中

### 4.2 代码示例

```python
#以下代码，如果用户输入的内容包含hehe即为真
name = "hehe"
msg = input("请输入字符")
if name in msg:
    print(111)
else:
    print(222)
```



## 5. 算术运算符

```python
+   加
-   减
*   乘	
/   除
//  整除|地板除（向下取整） 例如 5//3 = 1
**  幂
%  	取余
```



