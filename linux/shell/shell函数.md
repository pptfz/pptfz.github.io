[toc]



# shell函数

# 一、shell函数简介

**函数概念**

- **类似于alias别名**



**函数作用**

- **将程序里多次被调用的相同代码组合起来(函数体)，并为其取一个名字，即函数名，其他所有想重复调用这部分代码的地方都只需要调用这个名字就可以了**



**函数优势**

- **把相同程序段定义为函数,可以减少整个程序的代码量,提升开发效率**
- **增加程序的可读性,易读性,提升管理效率**
- **可以实现程序功能模块化,使得程序具备通用性**



# 二、shell函数的定义

## 2.1 标准写法

**语法**

```shell
function 函数名 () {
	命令
}
```





## 2.2 简化写法

**简化写法一**

```shell
函数名 () {
	命令
}
```



**简化写法二**

```shell
function 函数名 {
	命令
}
```



# 三、shell函数参数

**参数列表**

| **参数** | **说明**                         |
| -------- | -------------------------------- |
| **$n**   | **位置参数，第n个参数，n是整数** |
| **$#**   | **脚本参数总数**                 |
| **$***   | **参数列表**                     |
| **$@**   | **参数列表**                     |



# 四、shell函数的调用

**直接在脚本中写函数名即可**

```shell
#!/usr/bin/env bash
#test为函数名称
test (){							
	echo "function test"
}

#调用函数
test			
```



# 五、shell函数的执行

**1.执行shell函数时，函数名前的function和函数后的小括号都不要带**

**2.函数的定义必须在要执行的程序前面定义或加载**

**3.shell执行系统中各种程序的执行顺序为: 系统别名-->函数-->系统命令-->可执行文件**

**4.在shell函数里面，return命令的功能于exit类似，return的作用是退出函数，而exit是退出脚本文件**

**5.return语句会返回一个退出值(即返回值)给调用函数的当前程序，而exit会返回一个退出值(即返回值)给执行程序的当前shell**

**6.如果函数存放在独立的文件中，被脚本加载使用时，需要使用source或"."来加载**

**7.在函数内一般使用local定义局部变量,这些变量离开函数后就会消失**   





# 六、shell函数使用示例

## 6.1 基本使用示例

**编辑脚本**

```shell
#!/usr/bin/env bash
test1 (){
	echo test1
}
test2 (){
	echo test2
}
test1
test2
```



**执行结果如下**

```shell
test1
test2
```



## 6.2 分离函数体和执行函数的脚本示例

**<span style={{color: 'red'}}>⚠️这个方法在centOS7中不能用，原因未知!!!</span>**



**建立函数库脚本，往`/etc/init.d/functions`文件中追加一个函数**

```shell
cat >>/etc/init.d/functions<< 'EOF'
test (){
	echo "functions test"
}
EOF
```



**编写脚本，调用刚才往`/etc/init.d/functions`文件中追加的函数**

```shell
cat > test-functions.sh <<'EOF'
#!/bin/bash
. /etc/init.d/functions
test
EOF
```



**执行结果如下**

```shell
$ sh test-functions.sh
test functions
```



## 6.3 函数传参示例

### 6.3.1 通过脚本传参

**编辑脚本**

```shell
cat > test-functions.sh <<'EOF'
#!/usr/bin/env bash
test (){
	echo "you input $1"
}

#$1就是给函数传第一个参数，也可以传多个参数
test $1			
EOF
```



**执行结果如下**

```shell
$ sh test-functions.sh 123
you input 123
```





### 6.3.2 通过/etc/init.d/functions文件实现

**<span style={{color: 'red'}}>⚠️这个方法在centOS7中不能用，原因未知!!!</span>**

**建立函数库脚本，往`/etc/init.d/functions`文件中追加一个函数**

```shell
cat >>/etc/init.d/functions<< 'EOF'
test (){
	echo "functions test"
}
EOF
```



**编写脚本，调用刚才往`/etc/init.d/functions`文件中追加的函数**

```shell
cat >test-functions.sh <<'EOF'
#!/usr/bin/env bash
. /etc/init.d/functions
test $1
EOF
```



**执行结果如下**

```shell
$ sh test-functions.sh 123
you input 123
```



# 七、shell函数脚本使用示例

**url检测脚本示例**

```shell
cat >check_url.sh <<'EOF'
#!/usr/bin/env bash
. /etc/init.d/functions
usage (){
if [ $# -ne 1 ];then
	echo $"Usage:$0 url"
	exit 1
fi
}

check_url (){
wget --spider -q -o /dev/null --tries=1 -T 5 $1

if [ $? -eq 0 ];then
	action "$1 is yes" true
else
	action "$1 is no" false
fi
}

main (){
	if [ $# -ne 1 ];then
		usage
	fi
#接收函数的传参，即把下文main结尾的$*传到这里	
check_url $1		
}

#这里的$*就是把命令行接收的所有参数作为函数参数传给函数内部，是一种常用手法
main $*		
EOF
```



**执行结果如下**

```shell
$ sh check_url.sh www.baidu.com
www.baidu.com is yes
```

