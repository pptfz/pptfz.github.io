[toc]



# shell数组

## 1.shell数组概念

**概念**

- **shell数组就是一个元素集合，它把有限个元素(变量或字符组合)用一个名字来命名，然后用编号对他们进行区分，这个名字就称为数组名**

**数组下标**

- **用于区分不同内容的编号**

**数组元素**

- **组成数组的各个元素,也称为变量**





## 2.shell数组定义

### 2.1 shell数组分类

**普通数组：数组下标只能是数字**

**关联数组：数组下标可以是字符，通过 `declare -A 数组名` 定义**





### 2.2 普通数组

#### 方法一	用小括号将变量值括起来赋值给数组变量，每个变量之间要用空格进行分隔,常用定义方法

**语法**

```shell
array=(value1 value2 value3 ... )
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${array[*]}
1 2 3
```



#### 方法二	用小括号将变量值括起来，同时采用键值对的形式复制，不常用

**语法**

```shell
array=( [1]=one [2]=two [3]=three )
```



**使用示例**

```shell
$ array=( [1]=one [2]=two [3]=three )
$ echo ${array[*]}
one two three
$ echo ${array[1]}
one
$ echo ${array[2]}
two
$ echo ${array[3]}
three
```



#### 方法三	通过分别定义数组变量的方法来定义，不常用

**语法**

```shell
array[0]=a;array[1]=b;array[2]=c
```



**使用示例**

```shell
$ array[0]=a;array[1]=b;array[2]=c
$ echo ${array[0]}
a
$ echo ${array[1]}
b
$ echo ${array[2]}
c
```



#### 方法四	动态的定义数组变量，并使用命令的输出结果作为数组的内容

**语法**

```shell
array=($(命令))
或
array=(`命令`)
```



**使用示例**

```shell
$ mkdir /array
$ touch /array/{1..3}.txt
$ ll /array/
total 0
-rw-r--r-- 1 root root 0 Nov 12 08:37 1.txt
-rw-r--r-- 1 root root 0 Nov 12 08:37 2.txt
-rw-r--r-- 1 root root 0 Nov 12 08:37 3.txt


$ array=($(ls /array))
$ echo ${array[*]}
1.txt 2.txt 3.txt


array=(`ls /array`)
$ echo ${array[*]}
1.txt 2.txt 3.txt
```





### 2.3 关联数组

#### 2.3.1 定义关联数组

**普通数组的下标不能为字符**

```shell
$ array=([a]=hehe [b]=haha [c]=xixi)

#输出不正确
$ echo ${array[*]}
xixi
```



**定义关联数组，需要提前用`declear -A 数组名`定义**

```shell
$ declare -A array
$ array=([a]=hehe [b]=haha [c]=xixi)
$ echo ${array[*]}
hehe haha xixi
```



**关联数组使用示例**

```shell
#定义了一个关联数组array
$ declare -A array		

#让下标为m的数组元素自增1，此时m为1
$ let array[m]++		

#让下标为m的数组元素自增1，此时m为2
$ let array[m]++		

#让下标为f的数组元素自增1，此时f为1
$ let array[f]++	

#打印下标为m出现的次数
$ echo ${array[m]}	
2

#打印下标为f出现的次数
$ echo ${array[f]}		
1
```



#### 2.3.2 关联数组脚本示例

**统计 `/etc/passwd` 中每个bash出现的次数**

思路:

1.将/etc/passwd的最后一列取出来,因为最后一列是bash类型

2.定义关联数组，将取出来的bash类型存放到数组中

3.for循环遍历数组，输出相同下标的数组元素



**编辑脚本**

```shell
#!/usr/bin/env bash

#定义一个关联数组
declare -A array

#使用while循环从/etc/passwd文件中读取每一行
while read line			
do
  #把/etc/passwd中bash类型取出来
	PASSWD=`echo $line|awk -F: '{print $NF}'`		
	
	#让每一行bash自增1,这样最后就会把相同bash相加
	let array[$PASSWD]++			
done </etc/passwd

#for循环遍历数组下标
for i in ${!array[*]}			
do
  #打印数组下标并打印数组下标出现个数
	echo $i ${array[$i]}		
done
```



**执行结果如下**

```shell
/sbin/nologin 21
/bin/sync 1
/bin/bash 2
/sbin/shutdown 1
/sbin/halt 1
```



#### 2.3.3 关于关联数组的问题

##### 2.3.3.1 关联数组赋值时必须指定下标

```shell
#先定义一个关联数组
$ declare -A array

#在给数组赋值的时候提示为关联数组赋值时必须使用下标
$ array=(1 2 3)
bash: array: 1: must use subscript when assigning associative array
bash: array: 2: must use subscript when assigning associative array
bash: array: 3: must use subscript when assigning associative array

#此时必须给数组元素指定下标
$ array=([1]=1 [2]=2 [3]=3)

//查看元素显示
$ echo ${array[*]}
1 2 3

//查看数组下标
$ echo ${!array[*]}
1 2 3

//依据数组下标查看数组元素正确
$ echo ${array[1]}
1
$ echo ${array[2]}
2
$ echo ${array[3]}
3
```





##### 2.2.3.2 普通数组在只有一个元素的情况下，下标可以是字符串，但是超过2个元素就不可以

**第一种情况，指定普通数组的下标是字符串，但是只给数组赋值一个元素**

```shell
#定义一个普通数组
$ array=([a]=aa)
//数组内容可以正常显示
$ echo ${array[*]}
aa

#依据数组下标查看数组元素正确
$ echo ${array[a]}
aa

#数组下标也显示正确
$ echo ${!array[*]}
0
```



**第二种情况，指定普通数组的下标是字符串，并给数组赋值2个元素**

```shell
#定义一个普通数组
$ array=([a]=aa [b]=bb)

#此时数组内容显示不正确
$ echo ${array[*]}
bb

#依据数组下标查看数组元素也不正确
$ echo ${array[a]}
bb
$ echo ${array[b]}
bb

#同时数组下标显示也不正确
$ echo ${!array[*]}
0
```



## 3.shell数组的打印及输出

### 3.1 打印数组元素

**语法**

```shell
${数组名 [下标]}		数组下标从0开始
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${array[0]}
1
$ echo ${array[1]}
2
$ echo ${array[2]}
3

#使用*或@打印整个数组内容
$ echo ${array[*]}      
1 2 3

#使用*或@打印整个数组内容
$ echo ${array[@]}    
1 2 3
```





### 3.2 打印数组元素个数

**语法**

```shell
${#数组名 [*]}
或
${#数组名 [@]}
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${array[*]}
1 2 3
$ echo ${array[@]}
1 2 3

$ echo ${#array[@]}
3
$ echo ${#array[*]}
3
```





### 3.3 查看数组下标

**语法**

```shell
${!数组名[*]}
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${!array[*]}
0 1 2
```





### 3.4 数组赋值

**语法**

```shell
#如果下标不存在，则会自动添加一个新的数组元素
数组名[下标]=值
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${array[*]}
1 2 3

#增加下标为3的数组元素，即增加数组第4个元素
$ array[3]=4    
$ echo ${array[*]}
1 2 3 4

$ array[0]=hehe
$ echo ${array[*]}
hehe 2 3 4
```



**查看数组赋值**

```shell
命令:
declare -a			#查看普通数组
declare -A			#查看关联数组

使用示例:
#创建一个普通数组
$ array=(1 2 3 4 5)
$ declare -a | tail -1
declare -a array='([0]="1" [1]="2" [2]="3" [3]="4" [4]="5")'


#创建一个关联数组
$ declare -A array
$ array=([a]=hehe [b]=haha [c]=xixi)
$ declare -A | tail -1
declare -A array='([a]="hehe" [b]="haha" [c]="xixi" )'
```





### 3.5 数组及数组元素的删除

**语法**

```shell
#删除相应下标的数组元素
unset 数组[下标]	

#删除整个数组
unset 数组			
```



**使用示例**

```shell
$ array=(1 2 3)
$ echo ${array[*]}
1 2 3

#删除下标为0的数组元素
$ unset array[0]			
$ echo ${array[*]}
2 3

#删除整个数组
$ unset array				
$ echo ${array[*]}		
							#数组已经删除，返回为空
```



**数组元素删除扩展示例**

```shell
$ array=(one one one one one)
$ echo ${array[*]}
one one one one one

#从左边开始匹配最短的数组元素并删除
$ echo ${array[*]#o*}   
ne ne ne ne ne

#从左边开始匹配最长的数组元素并删除
$ echo ${array[*]##o*}    
									#全部匹配并删除
#从右边开始匹配最短的数组元素并删除
$ echo ${array[*]%%e*}  
on on on on on

#从右边开始匹配最长的数组元素并删除
$ echo ${array[*]%e*}   
on on on on on
```





### 3.6 数组内容截取

**语法**

```shell
#数字1:数字2表示截取下标1到下标2的元素
$[array[*]:数字1:数字2]		
```



**使用示例**

```shell
$ array=(1 2 3 4 5 6)
$ echo ${array[*]}
1 2 3 4 5 6

#截取下标1到下标3的元素
$ echo ${array[*]:1:3}		
2 3 4

$ array=(1 2 3 4 5 6)		
#这里理解为从下标0开始,截取3个元素
$ echo ${array[*]:0:3}		
1 2 3

$ array=(`echo {a..z}`)
$ echo ${array[*]}
a b c d e f g h i j k l m n o p q r s t u v w x y z
```



### 3.7 数组内容替换

**语法**

```shell
$[数组名[*]/要替换掉数组元素/替换为什么]
```



**使用示例**

```shell
$ array=(1 2 3 4 5 6)

#将数组中的1替换为hehe，但不改变原数组内容
$ echo ${array[*]/1/hehe}		
hehe 2 3 4 5 6

#数组内容并没有改变
$ echo ${array[*]}				
1 2 3 4 5 6
```



