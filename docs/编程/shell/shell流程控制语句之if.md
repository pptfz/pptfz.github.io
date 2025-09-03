[toc]



# shell流程控制语句之if

## 1.if单分支

### 1.1 if单分支语法

```shell
#写法一
if 条件表达式;then
 	命令
fi

#写法二
if 条件表达式
then
命令
fi
```



### 1.2 示例

```shell
if [ 1 -eq 1 ];then
	echo "equality"
fi
```





## 2.if双分支

### 2.1 if双分支语法

```shell
#写法一
if 条件表达式;then
	命令
else
	命令
fi

#写法二
if 条件表达式
then
	命令
else
	命令
fi
```





### 2.2 示例

```shell
if [ 1 -eq 1 ];then
	echo "equality"
else
	echo "not equality"
fi
```





## 3.if多分支

### 3.1 if多分支语法

**elif后面还可以加条件，即elif可以有多个**

```shell
写法一
if 条件表达式;then
	命令
elif
	命令
else
	命令
fi

写法二
if 条件表达式
then
	命令
elif
	命令
else
	命令
fi
```



### 3.2 示例

```shell
if [ 1 -eq 1 ];then
	echo "equality"
elif [ 2 -eq 1 ];then
	echo "equality"
else
	echo "not equality"
fi
```



**猜数字脚本示例**

系统产生一个随机数，然后用户输入一个数字，与随机数做比较，输入的数字比随机数大则提示输入数字大了，输入的数字比随机数小则提示输入数字小了，猜对提示你猜对了

```shell
#!/usr/bin/env bash

SJ=`echo $((RANDOM%100+1))`
i=1
for ((;;))
do
read -p "please input a num: " NUM
if [[ $NUM =~ ^[0-9]+$ ]];then
	if [ $NUM -eq $SJ ];then
		echo -e "\033[32myou guess it!!! \033[0m"
		echo -e "\033[34mGuess the total is $i times!!!\033[0m"
		exit 0
	elif [ $NUM -gt $SJ ];then
		echo "Larger than the random number"
	else 
		echo "Smaller than the random number"
	fi
else
	echo "Please enter the correct number: "
fi
let i++
done
```

