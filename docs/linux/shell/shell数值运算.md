[toc]



# shell数值运算



## 1.算术运算符表

| 算数运算符                              | 含义                                    |
| --------------------------------------- | --------------------------------------- |
| `+` 、`-`                               | 加法、减法                              |
| `*` 、`/` 、`%`                         | 乘法、除法、取模                        |
| `**`                                    | 幂云算                                  |
| `++` 、`--`                             | 增加、减少                              |
| `&&` 、`||` 、`!`                       | 逻辑与、或、非                          |
| `<` 、`<=` 、`>` 、`>=`                 | 小于、小于等于、大于、大于等于          |
| `==` 、`!=` 、`=`                       | 相等、不相等、对于字符串 `=` 表示相当于 |
| `<<` 、`>>`                             | 向左移位、向右移位                      |
| `~` 、`&` 、`｜` 、`^`                  | 按位取反、按位与、按位异或、按位或      |
| `=` 、`+=` 、`-=` 、`*=` 、`/=`  、`%=` | 赋值运算符，例如 `a+=1` 相当于 `a=a+1`  |





## 2.运算操作符与运算命令

| 运算操作符与运算命令 | 含义                                                    |
| -------------------- | ------------------------------------------------------- |
| `(())`               | 用于整数运算的常用运算符，效率最高                      |
| `let`                | 用于整数运算，类似于 `(())`                             |
| `expr`               | 可用于整数运算，但还有其他的额外功能                    |
| `bc`                 | linux下的一个计算器程序                                 |
| `$[]`                | 用于整数运算                                            |
| `awk`                | awk既可以用于整数运算，也可以用于小数运算               |
| `declare`            | 定义变量值和属性，`-i` 参数可以用于定义整型变量，做运算 |



## 3.双小括号"(())"数值运算

**示例**

```python
$ echo $((1+10))
11
$ echo $((1-10))
-9
```



### 示例1	用(())做数值运算

```python
$ echo $((1+2**3-4%3))		#先乘除后加减，先算2**3=8 4%3=1，最后1+8-1=8
8
$ ((a=1+2**3-4%3))
$ echo $a
8
```



### 示例2	在变量前后使用--和++特殊运算符的表达式

```python
$ a=10
$ echo $((a++))		#如果a在运算符++的前面，那么在输出整个表达式时，会输出a的值
10
$ echo $a			#执行上面的表达式后，因为有a++，因此a会增加1
11
      		
  
$ a=10
$ echo $((a--))		#如果a在运算符--的前面，那么在输出整个表达式时，会输出a的值
10
$ echo $a			#执行上面的表达式后，因为有a--，因此a会减少1
9


$ a=10				
$ echo $((++a))		#如果a在运算符++的后面，那么在输出整个表达式时，先进行自增
11
$ echo $a
11


$ a=10
$ echo $((--a))		#如果a在运算符--的后面，那么在输出整个表达式时，先进行自减
9
$ echo $a
9
```



### 示例3	通过(())运算后赋值给变量

```python
$ a=100
$ b=$((a+1))
$ echo $b
101
```





## 4.let运算命令的用法

**let运算命令语法格式**

- **let 赋值表达式  		相当于 ((赋值表达式))**



### 示例1	用let做数值运算

```python
$ a=1
$ let a=a+8
$ echo $a
9
```





## 5.expr命令的用法

**expr命令既可以用于整数运算,也可以用于相关字符串长度、匹配等的运算处理**



### 示例	expr命令用于计算

```python
$ expr 2+2
2+2
$ expr 2 + 2    #注意，运算符左右必须有至少一个空格
4     

$ expr 2 * 2
expr: syntax error          #注意，做乘法运算需要转义*
$ expr 2 \* 2
4
```



### 示例2	利用expr判断一个变量值或字符串是否为整数

**实现原理:利用expr做计算时变量或字符串必须是整数的原则，把一个变量或字符串和一个已知的整数(非0)相加，看命令返回的值是否为0，如果为0，就认为做加法的变量或字符串为整数，否则就不是**

```python
$ i=1
$ expr $i + 1 &>/dev/null
$ echo $?
0           #返回0，证明i的值为整数
  
$ i=hehe
$ expr $i + 1 &>/dev/null
$ echo $?
2           #返回为非0，证明i的值不是整数
```



### 示例3	利用expr判断参数是否为整数

```python
#编辑脚本
cat >expr1.sh <<'EOF'
#!/usr/bin/env bash
while :
do
	read -p "please input: " a
	expr $a + 1 >/dev/null 2>&1
[ $? -eq 0 ] && echo int || echo chars
done
EOF

#执行脚本
$ sh expr1.sh 
please input: 1
int
please input: 2
int
please input: a
chars
please input: /
chars
```



### 示例4	利用expr判断文件扩展名是否符合要求

```python
#编辑脚本
cat > string.sh <<'EOF'
#!/usr/bin/env bash
if expr "$1" : ".*\.pub" &>/dev/null;then
	echo "you are using $1"
else
	echo "please use *.pub file"
fi
EOF

#执行脚本
$ sh string.sh hehe
please use *.pub file

$ sh string.sh hehe.pub
you are using hehe.pub
```





### 示例5	利用expr计算字符串的长度

```python
#当变量有空格时，expr length 后的变量必须加引号
$ char="i am a boy"
$ expr length $char
expr: syntax error				
$ expr length "$char"
10

#当变量没有空格时，expr length 后的变量可以不加引号
$ char="iamboy"
$ expr length $char
6
```



## 5.bc命令的用法

### 示例1	bc交互式用法

```python
$ bc
bc 1.06.95
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006 Free Software Foundation, Inc.
This is free software with ABSOLUTELY NO WARRANTY.
#For details type `warranty'. 
scale=5			#表示小数后保留5位
9/5
1.80000

9/1.3
6.92307

1+1
2

9-3
6
```



### 示例2	bc用在命令行中

```python
$ echo 3+5 | bc
8
$ echo 9-3 | bc
6
$ echo 9*9 | bc
81
$ echo 9.9+6.6 | bc
16.5
```



### 示例3	利用bc通过一条命令计算输出1+2+3+..+10的值

```python
#生成表达式方法一
$ seq -s "+" 10
1+2+3+4+5+6+7+8+9+10
$ seq -s "+" 10 | bc
55

#生成表达式方法二
$ echo {1..10} | tr " " "+"
1+2+3+4+5+6+7+8+9+10
$ echo {1..10} | tr " " "+" | bc
55
```



## 6.$[]符号的运算

**$[]只能做整数运算**

```python
$ echo $[2**3]
8

$ echo $((3%5))
3

$ echo $[1+1]
2

$ echo $[2*2]
4

$ echo $[10/3]
3

$ echo $[10%3]
1

$ echo $[10**3]
1000
```



## 7.用awk实现计算

```python
#方法1
$ echo "9.9 8.8" | awk '{print ($1-$2)}'
1.1

$ echo "358 113" | awk '{print ($1-3)/$2}'
3.14159


#方法2
$ awk 'BEGIN{print (9.9-8.8)}'
1.1

$ awk 'BEGIN{print (358-3)/113}'
3.14159
```





## 8.declare(同typeset)命令用法

**使用typeset定义整数变量，直接进行计算，此方法不常用，因为需要定义才能生效**

```python
$ declare -i A=10 B=20
$ A=A+B
$ echo $A
30

$ typeset -i C=30 D=50
$ C=C+D
$ echo $C
80
```

