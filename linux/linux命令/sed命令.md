# sed命令

# 1.sed命令工作流程

**1、将文件的第一行读入到自己的缓存空间，删除换行符**

**2、匹配，看一下该行是否为要编辑的行，如果是，执行编辑命令，不是，执行1**

**3、执行编辑命令**

**4、加上换行符输出到屏幕**

**5、判断是否为文件尾，如果是，退出，不是，再重复1-4**



**默认情况下，sed缓存空间内的行都会输出到屏幕，除非使用-n选项**

**默认情况下，sed将修改的行输出到屏幕，并没有修改源文件，使用-i选项修改源文件**



# 2.命令格式

- **sed 选项 地址1,地址2 命令 标记 文件名**





# 3.选项

| 选项   | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| **-n** | **拟制输出，不输出未修改的行，强制输出用命令p**              |
| **-i** | **修改源文件，需要强制备份源文件   -i.bak即可**              |
| **-r** | **让sed支持扩展正则表达式，默认支持标准正则表达式**          |
| **-f** | **指定文件，将sed命令写到文件中，然后执行sed -f 文件名 要修改的文件，但是从未成功执行过！！！** |
| **-e** | **允许一条命令执行多个sed子命令 sed -e ‘s#a#b#g’ -e ‘s#A#B#g’** |

## 3.1定位、匹配

### 3.1.1使用行号

#### **定位1-5行	1,5**

![iShot2020-10-15 19.59.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 19.59.09.png)

#### **定位到最后一行	$**

![iShot2020-10-15 19.59.31](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 19.59.31.png)



#### **指定起始匹配行和步长	1~5(从第一行开始，每隔5行匹配)**

![iShot2020-10-15 19.59.48](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 19.59.48.png)



#### **定位奇数行	1～2**

![iShot2020-10-15 20.00.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 20.00.05.png)



#### **定位偶数行	0～2**

![iShot2020-10-15 20.00.25](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 20.00.25.png)



#### **定位某行之后的n行	1,+3**

![iShot2020-10-15 20.00.43](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 20.00.43.png)



### 3.1.2使用正则表达式

#### /正则表达式/

![iShot2020-10-15 20.01.05](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 20.01.05.png)



# 4.命令

| 命令    | 含义                                                         |
| ------- | ------------------------------------------------------------ |
| **a\\** | **在当前行后添加一行或多行**                                 |
| **c\\** | **用新文本修改（替换）当前行中的文本**                       |
| **d**   | **删除行**                                                   |
| **i\\** | **在当前行之前插入文本**                                     |
| **h**   | **把模式空间里的内容复制到暂存缓存区**                       |
| **H**   | **把模式空间里的内容追加到暂存缓存区**                       |
| **g**   | **取出暂存缓冲区里的内容，将其复制到模式空间，覆盖该处原有内容** |
| **G**   | **取出暂存缓冲区里的内容，将其复制到模式空间，追加在原有内容后面** |
| **l**   | **列出非打印字符**                                           |
| **p**   | **打印行**                                                   |
| **n**   | **读入下一输入行，并从下一条命令而不是第一条命令开始处理**   |
| **q**   | **结束或退出sed**                                            |
| **r**   | **从文件中读取输入行**                                       |
| **!**   | **对所选行之外的所有行应用命令**                             |
| **s**   | **用一个字符串替换另一个**                                   |

## 4.1 p	打印

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
 
例：打印第1行
[root@test1 ~]# sed -n '1p' hehe
123456


文件内容
[root@test1 test]# cat hehe.txt
1 101,hehe,CEO
2 102,haha,CTO
3 103,xixi,COO
4 104,yy,CFO
5 105,xx,CIO
6 110,jjxx,COCO
 
例：打印从101开始到105结束的行
[root@test1 test]# sed -n '/101/,/105/p' hehe.txt
1 101,hehe,CEO
2 102,haha,CTO
3 103,xixi,COO
4 104,yy,CFO
5 105,xx,CIO
 
例：打印从101开始到第3行
[root@test1 test]# sed -n '/101/,3p' hehe.txt
1 101,hehe,CEO
2 102,haha,CTO
3 103,xixi,COO
```



## 4.2 d	删除

> **命令d用于删除输入行**
>
> **sed 先将输入行从文件复制到模式缓存区，然后对该行执行sed命令，最后将模式缓存区的内容显示在屏幕上**
>
> **如果发出的是命令d，当前模式缓存区的输入行会被删除，不被显示**

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
 
例：将有1的行删除
[root@test1 ~]# sed '/1/d' hehe
abcdef
(abc)def
2
222222
 
例：将文件的1到3行删除
[root@test1 ~]# sed '1,3d' hehe
(abc)def
2
222222



文件内容
[root@test1 test]# cat 111.txt
101,aaa,CEO
102,bbb,CTO
103,ccc,COO
104,ddd,CFO
105,eee,CIO
110,fff,COCO
 
例：将文件的第1行到第5行删除
[root@test1 test]# sed '1,5d' 111.txt
110,fff,COCO
 
例：将文件从ddd到文件结尾删除
[root@test1 test]# sed '/ddd/,$d' 111.txt
101,aaa,CEO
102,bbb,CTO
103,ccc,COO
 
例：删除不包含fff的行
[root@test1 test]# sed '/fff/!d' 111.txt
110,fff,COCO
```

## 4.3 s	替换

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
 
例：将文件中的1全部替换为?
[root@test1 ~]# sed 's/1/?/g' hehe
?23456
??????
abcdef
(abc)def
2
222222
 
例：将abcdef替换为abchehe, \1表示匹配的abc
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222

[root@test1 ~]# sed -r 's/(abc)def/\1hehe/' hehe      \1表示前边匹配的abc
123456
111111
abchehe
(abc)def
2
222222
```

## 4.4 逗号	指定行的范围

```python
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：匹配111111到222222之间的行
[root@test1 ~]# sed -n '/111111/,/222222/p' hehe      
111111
abcdef
(abc)def
222222

例：匹配从第5行开始，到第一个以2开头之间的行
[root@test1 ~]# sed -n '5,/2/p' hehe      
111111
abcdef
(abc)def
2
 
例：匹配111111所在行到以2开头的行
[root@test1 ~]# sed -n '/111111/,/2/p' hehe
111111
abcdef
(abc)def
2
 
例：匹配从111111开始到第一个以2开头的行，然后将以1开头的行替换为hehe
[root@test1 ~]# sed -n '/111111/,/2/s/^1/hehe/p' hehe     
hehe11111
```



## 4.5 e	多重编辑

> **-e命令是编辑命令，用于sed执行多个编辑任务的情况下**
>
> **在下一行开始编辑前，所有的编辑动作将应用到模式缓存区的行上**

```python
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
 
例：将第一行删除，并且替换abc为ABC
[root@test1 ~]# sed -e '1d' -e 's#abc#ABC#g' hehe
111111
ABCdef
(ABC)def
2
222222
```



## 4.6 a	追加

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：在以2开头的行后追加HEHE
[root@test1 ~]# sed '/^2/aHEHE' hehe
123456
111111
abcdef
(abc)def
2
HEHE
222222
HEHE
111
```

## 4.7 i	插入

> **i命令是插入命令，类似于a命令，但不是在当前行后增加文本，而是在当前行前面插入新的文本，即刚读入缓存区模式的行**

```python
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：在以2开头的行前边插入HEHE
[root@test1 ~]# sed '/^2/iHEHE' hehe
123456
111111
abcdef
(abc)def
HEHE
2
HEHE
222222
111
```

## 4.8 c	修改

> **c命令是修改命令,sed 使用该命令将已有的文本修改成新的文本,旧文本被覆盖**

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：将文件中abcdef替换为ABCDEF
[root@test1 ~]# sed '/abcdef/cABCDEF' hehe
123456
111111
ABCDEF
(abc)def
2
222222
111
```

## 4.9 n	获取下一行

> **n命令表示下一条命令，sed 使用该命令获取输入文件的下一行，并将其读入到模式缓冲区中，任何 sed 命令都将应用到匹配行，即紧接着的下一行上**

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：匹配111111一行，n表示获取下一行，即abcdef,并且替换e为E
[root@test1 ~]# sed '/111111/{n;s/e/E/;}' hehe
123456
111111
abcdEf
(abc)def
2
222222
111
```



## 4.10 y	转换

> **y命令表示转换，该命令与 tr 命令相似，字符按照一对一的方式从左到右进行转换**
>
> **例如 y/abc/ABC/，会把小写字母转换成大写字母，a-->A,b-->B,c-->C，与s不同的是，y会全部替换，而s需要在最后加g**

```python
文件内容
[root@test1 ~]# cat hehe
123456
111111
abcdef
(abc)def
2
222222
111
 
例：将1-3行的1转换为Q
[root@test1 ~]# sed '1,3y/1/Q/' hehe
Q23456
QQQQQQ
abcdef
(abc)def
2
222222
111
```



# 5.实际使用示例

## 5.1示例1

```python
使用sed命令将/etc/passwd文件中红用户名和登陆shell调换位置
思路：将配置文件分组，用户名为第一组，最后的登陆shell分为一组，然后中间的内容分为一组，因此
hehe    是第一组
:x:501:501::/home/hehe:     是第二组
/bin/bash       是第三组
 
[root@test1 ~]# tail -1 /etc/passwd
hehe:x:500:500::/home/hehe:/bin/bash
            
[root@test1 ~]# tail -1 /etc/passwd |sed -r 's#(.*)(:x.*:)(/.*)#\3\2\1#g'
/bin/bash:x:500:500::/home/hehe:hehe
```



## 5.2示例2

```python
用sed命令取出ip地址
[root@test1 ~]# ifconfig eth0|sed -nr '2s#(.*:)(.*)(B.*)#\2#gp'
192.168.1.8
```



## 5.3示例3

```python
将以下文件进行批量需改（用一条命令完成）
修改前1.sh	2.sh		3.sh
修改后1_test.sh	2_test.sh		3_test.sh

ls *.sh|sed -nr 's#((.*)\.sh)#mv \1 \2_test.sh#gp' |bash
```

