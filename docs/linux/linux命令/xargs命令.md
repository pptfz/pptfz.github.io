[toc]



# xargs命令

## 1.命令说明

xargs命令是给其他命令传递参数的一个过滤器，也是组合多个命令的一个工具。它擅长将标准输入数据转换成命令行参数，xargs能够处理管道或者stdin并将其转换成特定命令的命令参数。xargs也可以将单行或多行文本输入转换为其他格式，例如多行变单行，单行变多行。

xargs的默认命令是echo，空格是默认定界符。这意味着通过管道传递给xargs的输入将会包含换行和空白，不过通过xargs的处理，换行和空白将被空格取代。xargs是构建单行命令的重要组件之一



## 2.命令选项

### 2.1 `-d`	指定分隔符

```shell
$ echo 123@123@123|xargs
123@123@123

$ echo 123@123@123|xargs -d@
123 123 123
```



### 2.2 `-n`	指定参数输出列数

```shell
$ echo 123 123 123 |xargs -n1
123
123
123

$ echo 123 123 123 |xargs -n2
123 123
123

$ echo 123 123 123 |xargs -n3
123 123 123
```



### 2.3 `-p`	询问是否执行命令

:::tip 说明

使用该选项之后xargs并不会马上执行其后面的命令，而是输出即将要执行的完整的命令(包括命令以及传递给命令的命令行参数)，询问是否执行，输入 `y` 才继续执行，否则不执行

`-I {}` 用于告诉 `xargs` 替换 `{}` 为输入的内容

:::

```shell
$ echo 123 | xargs -I {} -p sh -c 'echo {} | sed "s#1#9#"'
sh -c echo 123 | sed "s#1#9#" ?...y
923
```



### 2.4 `-E`	指定一个字符串

:::tip 说明

当xargs解析出多个命令行参数的时候，如果搜索到 `-E` 指定的命令行参数，则只会将 `-E` 指定的命令行参数之前的参数(不包括 `-E` 指定的这个参数)传递给xargs后面的命令

`-E`只有在xargs不指定 `-d` 的时候有效，如果指定了 `-d` 则不起作用，而不管 `-d` 指定的是什么字符，空格也不行

:::

```shell
# 有-E参数，则只会把-E指定的参数，这里为33，之前的参数，也就是11 22传递给xargs后面的命令，这里是echo，因此输出为11 22
$ echo '11 22 33' | xargs -E '33' echo
11 22
 
# 指定-d选项，-E选项就失效了
$ echo '11 22 33' | xargs -d ' ' -E '33' echo
11 22 33
```



### 2.5 `-I`	指定一个替换字符串，该字符串在命令中作为占位符，将被 `xargs` 从输入中读取的每一行数据替换

:::tip 说明

在这个例子中，`{}` 是占位符，`xargs` 会将 `*.jpg` 文件替换到 `{}` 的位置，`{}` 就代表了 `*.jpg`

:::

```shell
$ ls
1.jpg  2.jpg  3.jpg

$ ls *.jpg | xargs -I {} cp {} /tmp

$ ls /tmp/*.jpg
/tmp/1.jpg  /tmp/2.jpg  /tmp/3.jpg
```





### 2.6 `-0`	识别find结束标记

当前路径下的文件，文件名中包含空格

```shell
$ ls
abc 1.txt  abc 2.txt  abc 3.txt
```



find命令查找当前路径下这三个文件，会报错，因为find会认为含有空格的文件为两个文件

```shell
$ find . -type f -name "*.txt" | xargs ls -l
ls: cannot access ./abc: No such file or directory
ls: cannot access 3.txt: No such file or directory
ls: cannot access ./abc: No such file or directory
ls: cannot access 1.txt: No such file or directory
ls: cannot access ./abc: No such file or directory
ls: cannot access 2.txt: No such file or directory
```



解决方法

- 方式一	让find命令给每个文件名的结束处加上一个结束标记

  :::tip 说明

  `-print0` 表示加上结束标记

  `xargs -0` 表示识别find结束标记

  :::

  ```shell
  $ find . -type f -name "*.jpg" -print0|xargs -0 ls -l
  total 0
  -rw-r--r-- 1 root root 0 Aug 21 15:38 abc 1.txt
  -rw-r--r-- 1 root root 0 Aug 21 15:38 abc 2.txt
  -rw-r--r-- 1 root root 0 Aug 21 15:38 abc 3.txt
  ```

  

- 方式二

  ```shell
  $ find . -type f -name "*.txt" |xargs -i ls -l {}
  -rw-r--r-- 1 root root 0 Aug 21 15:38 ./abc 3.txt
  -rw-r--r-- 1 root root 0 Aug 21 15:38 ./abc 1.txt
  -rw-r--r-- 1 root root 0 Aug 21 15:38 ./abc 2.txt
  ```

  
