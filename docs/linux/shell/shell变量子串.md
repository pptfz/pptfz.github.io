[toc]



# shell变量子串

## 1.返回变量

**`${var}`	返回变量var的内容**

```sh
$ a=10
$ echo ${a}
10
```



## 2.返回字符长度

**`${#var}`	返回变量var的长度，按照字符**

```sh
a=10
$ echo ${#a}
2
```



## 3.截取子串

**`${var:n}`	在变量var中，从位置n(n为数字)之后开始提取子串到结尾**

```sh
$ a="i am boy"
$ echo ${a:3}
m boy
```



**`${var:n:length}`	在变量var中，从位置n之后开始提取长度为length的子串**

```sh
$ a="i am boy"
$ echo ${a:3:3}
m b
```





## 4.删除子串

### 4.1 从开头删除

#### 4.1.1 最短匹配

**`${var#word}`	从变量var开头开始删除最短匹配的word子串**

```sh
$ a=abc123ABCabc123ABC
$ echo ${a#a*b}
c123ABCabc123ABC		#匹配了ab，最短匹配
$ echo ${a#a*C}
abc123ABC				#匹配了abc123ABC
```



#### 4.1.2 最长匹配

**`${var##word}`	从变量var开头开始删除最长匹配的word子串**

```sh
$ a=abc123ABCabc123ABC
$ echo ${a##a*b}
c123ABC			#匹配了abc123ABCab，最长匹配
$ echo ${a##a*C}
						#全部匹配，全部删除
```



### 4.2 从结尾删除

#### 4.2.1 最短匹配

**`${var%word}`	从变量var结尾开始删除最短匹配的word子串**

```sh
$ a=abc123ABCabc123ABC
$ echo ${a%1*C}
abc123ABCabc			#从结尾开始匹配了123ABC
```





#### 4.2.2 最长匹配

**`${var%%word}`	从变量var结尾开始删除最长匹配的word子串**

```sh
$ a=abc123ABCabc123ABC
$ echo ${a%%1*C}
abc						#从结尾匹配了123ABCabc123ABC
```



## 5.替换子串

**`${var/A/B}`	用B代替第一个匹配的A**

```sh
$ a=abc111
$ echo ${a/1/9}
abc911		
```



**`${var//A/B}`	用B代替所有匹配的A**

```sh
$ a=abc111
$ echo ${a//1/9}
abc999
```



## 6.特殊扩展变量

### 6.1 `${var:-word}`

**`${var:-word}` ，冒号可以忽略	如果var的变量值为空或为未赋值，则会返回word字符串并替代变量的值**

```sh
$ echo $C
							#变量C没有赋值，所以为空
$ B=${C:-hehe}			#如果C没有赋值，则将hehe赋值给B
$ echo $B
hehe						

$ A=abc		
$ B=${A:-haha}			#因为变量A有值，所以将变量A的值赋予B
$ echo $B
abc

#冒号可以不写
$ echo $D

$ E=${D-hehe}
$ echo $E
hehe
```



### 6.2 `${var:=word}`

**`${var:=word}`，冒号可以忽略	如果var的变量值为空或未赋值，则设置这个变量值为word,并返回其值**		

```sh
$ echo $A
							#变量A没有赋值
$ B=${A=hehe}			#如果变量A为空或未赋值，则设置变量A的值为hehe
$ echo $A
hehe							#与var-word不同，变量A也会有值
$ echo $B
hehe
```



### 6.3 `${var:?word}`

**`${var:?word}` ，冒号可以忽略	如果var的变量值为空或未赋值，那么word字符串将被作为标准错误输出，否则输出变量的值**

```sh
$ echo $A		
							#变量A为空或未赋值
$ echo ${A?hehe}
-bash: A: hehe			#将hehe作为标准错误输出

$ A=abc
$ echo ${A?hehe}
abc							#因为变量A有值，所以输出变量A的值
```



### 6.4 `${var:+word}`

**`${vrt:+word}` ，冒号可以忽略	如果var变量值为空或未赋值，则什么都不做，否则word字符串将替代变量的值**

```sh
$ echo $A
							#变量A为空或未赋值
$ echo ${A+hehe}
							#不做任何操作
										
$ A=abc
$ echo ${A+hehe}	
hehe							#因为变量A有值，所以用hehe替代变量A的值
```

