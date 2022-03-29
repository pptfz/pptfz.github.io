[toc]



# xargs命令

# 1.命令说明

**xargs命令是给其他命令传递参数的一个过滤器，也是组合多个命令的一个工具。它擅长将标准输入数据转换成命令行参数，xargs能够处理管道或者stdin并将其转换成特定命令的命令参数。xargs也可以将单行或多行文本输入转换为其他格式，例如多行变单行，单行变多行。xargs的默认命令是echo，空格是默认定界符。这意味着通过管道传递给xargs的输入将会包含换行和空白，不过通过xargs的处理，换行和空白将被空格取代。xargs是构建单行命令的重要组件之一**



# 2.命令选项

## 2.1 -d	指定分隔符

```python
[root@test1 test]# echo 123@123@123|xargs
123@123@123
[root@test1 test]# echo 123@123@123|xargs -d@
123 123 123
```

## 2.2 -n	指定参数输出列数

```python
[root@test1 test]# echo 123 123 123 |xargs -n1
123
123
123
[root@test1 test]# echo 123 123 123 |xargs -n2
123 123
123
[root@test1 test]# echo 123 123 123 |xargs -n3
123 123 123
```

## 2.3 -p	询问是否执行命令

> **使用该选项之后xargs并不会马上执行其后面的命令，而是输出即将要执行的完整的命令(包括命令以及传递给命令的命令行参数)，询问是否执行，输入 y 才继续执行，否则不执行**

```python
[root@test1 test]# echo 123 | xargs -p sed 's#1#9#'
sed s#1#9# 123 ?...
```

## 2.4 -E	指定一个字符串

> **当xargs解析出多个命令行参数的时候，如果搜索到-E指定的命令行参数，则只会将-E指定的命令行参数之前的参数(不包括-E指定的这个参数)传递给xargs后面的命令**

⚠️**注意：-E只有在xargs不指定-d的时候有效，如果指定了-d则不起作用，而不管-d指定的是什么字符，空格也不行**

```python
[root@test1 test]# echo '11 22 33' | xargs -E '33' echo
11 22
 
指定-d选项，-E选项就失效了
[root@test1 test]# echo '11 22 33' | xargs -d ' ' -E '33' echo
11 22 33
```

## 2.5 -i	使管道前命令结果成为后续操作命令的参数

![iShot2020-10-15 21.11.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 21.11.37.png)

## 2.6 -0(数字0)	识别find结束标记

### 1.当前路径下的文件，文件名中包含空格

```python
[root@test1 test]# ll
total 0
-rw-r--r-- 1 root root 0 Aug 21 05:16 abc  01.jpg
-rw-r--r-- 1 root root 0 Aug 21 05:16 abc  02.jpg
-rw-r--r-- 1 root root 0 Aug 21 05:16 abc  03.jpg
```

### 2.find命令查找当前路径下这三个文件，会报错，因为find会认为含有空格的文件为两个文件

![iShot2020-10-15 21.11.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 21.11.54.png)

### 3.解决方法

#### 方式一	让find命令给每个文件名的结束处加上一个结束标记

```python
find . -type f -name "*.jpg" -print0|xargs -0 ls -l
-print0 加上结束标记
xargs0 识别结束标记
```

![iShot2020-10-15 21.12.12](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 21.12.12.png)

#### 方式二	find . -type f -name "*.jpg" |xargs -i ls -l {}

