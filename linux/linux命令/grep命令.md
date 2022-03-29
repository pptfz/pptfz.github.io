[toc]



# grep命令

# 1.正则表达式

## 1.1基本正则表达式

![iShot2020-05-1113.32.19](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1113.32.19.png)



## 1.2扩展正则表达式

![iShot2020-05-1113.32.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-05-1113.32.42.png)

## 1.3特殊字字符类

### [:alnum:]		[a-zA-Z0-9]匹配人一个字母或数字字符

![iShot2020-10-15 19.35.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.35.35.png)



### [:alpha:]		匹配任意一个字母（包括大小写）

![iShot2020-10-15 19.36.01](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.36.01.png)



### [:digit:]		匹配任意一个数字

![iShot2020-10-15 19.36.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.36.24.png)



### [:lower:]		匹配小写字母

![iShot2020-10-15 19.36.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.36.44.png)



### [:upper:]		匹配大写字母

![iShot2020-10-15 19.37.04](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.37.04.png)



### [:punct:]		匹配标点符号

![iShot2020-10-15 19.37.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.37.29.png)



### [:blank:]		匹配空格与制表符

![iShot2020-10-15 19.37.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.37.51.png)



### [:space:]		匹配一个包括换行符、回车等在内的所有空白字符

![iShot2020-10-15 19.42.04](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.42.04.png)



### [:graph:]		匹配任意可看的见的且可打印的字符

![iShot2020-10-15 19.42.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.42.27.png)



### [:print:]		匹配任何一个可以打印的字符

![iShot2020-10-15 19.42.49](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.42.49.png)



### [:xdigit:]		匹配任意一个16进制数（0-9，a-f，A-F）

![iShot2020-10-15 19.43.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.43.11.png)





# 2.grep命令

## 2.1命令说明

- **Linux系统中grep命令是一种强大的文本搜索工具，它能使用正则表达式搜索文本，并把匹配的行打印出来。grep全称是Global Regular Expression Print，表示全局正则表达式版本，它的使用权限是所有用户**



## 2.2命令格式

- **grep [options] file**



## 2.3选项

### **-E	如果加这个选项，那么后面的匹配模式就是扩展的正则表达式，也就是 grep -E = egrep**

![iShot2020-10-15 19.43.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.43.33.png)



### -i	比较字符时忽略大小写区别

![iShot2020-10-15 19.43.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.43.51.png)



### -l	过滤的时候只显示文件名

**找出包含sshd的文件**

![iShot2020-10-15 19.44.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.44.14.png)



### -w	把表达式作为词来查找，相当于正则中的"\\<...\\>"(...表示你自定义的规则)

![iShot2020-10-15 19.44.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.44.34.png)



### -x	被匹配到的内容，正好是整个行，相当于正则"^...$"

![iShot2020-10-15 19.44.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.44.57.png)



### **-v**	取反

![iShot2020-10-15 19.45.19](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.45.19.png)

### **-c**	count，统计，统计匹配结果的行数，不是匹配结果的次数，是行数

![iShot2020-10-15 19.45.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.45.40.png)



### **-m**	只匹配规定的行数，之后的内容就不再匹配了

![iShot2020-10-15 19.45.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.45.58.png)



### **-n**	在输出的结果里显示行号，这里的行号是该行内容在原文件中的行号，而不是在输出结果中行号

![iShot2020-10-15 19.46.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.46.33.png)



### **-o**	只显示匹配内容，grep 默认是显示满足匹配条件的一行，加上这个参数就只显示匹配结果，比如我们要匹配一个 ip 地址，就只需要结果，而不需要该行的内容

![iShot2020-10-15 19.46.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.46.57.png)



### **-R**	递归匹配。如果要在一个目录中多个文件或目录匹配内容，则需要这个参数

### **-B**	输出满足条件行的前几行，比如 grep -B 3 "aa" file 表示在 file 中输出有 aa 的行，同时还要输出 aa 的前 3 行

### **-A**	这个与-B 类似，输出满足条件行的后几行

### **-C**	这个相当于同时用-B -A，也就是前后都输出

### **-P**	支持perl正则





## 2.4grep扩展用法

### 2.4.1扩展用法1	grep后向引用

**示例：将文本中连续相同的数字打印出来**

**()表示匹配的内容,当前为匹配数字,\1为后向引用,**

```python
echo '1222233333222444455556666669999'|egrep -o '([0-9])\1+'
```

**命令后边如果写+就会无法截取1,因为1只有一个**

![iShot2020-10-15 19.48.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.48.44.png)

---

**此时就需要在后边再单独匹配数字1**

```python
echo '1222233333222444455556666669999'|egrep -o '([0-9])\1+|[0-9]'
```

![iShot2020-10-15 19.49.05](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.49.05.png)

**另外两种写法**

```python
echo '1222233333222444455556666669999'|egrep -o '([0-9])\1*'

echo '1222233333222444455556666669999'|egrep -o '(.)\1*'
```

![iShot2020-10-15 19.49.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.49.29.png)

![iShot2020-10-15 19.49.49](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.49.49.png)



### 2.4.2扩展用法2	grep -P与零宽断言匹配

**零宽断言:perl语言正则匹配**

**核心:截取特定字符串左边或右边的内容**

> **截取string右边的内容**
>
> **lookahead   (?=string)**
>
> 
>
> **截取string左边的内容**
>
> **lookbehind  (?<=string)**

**零宽断言截取字符串**

**示例1:取出文件中:右边的内容**

```python
//文件内容如下,现在要截取出:右边的数字
[root@exercise2 ~]# cat a.txt 
id:01 id:02 id:03 id:04 id:05 id:06 id:07 id:08 id:09 id:10 666 test666

方法:
grep -Po "(?<=:)[0-9]+" a.txt		

命令解析
(?<=:)为固定格式,等号右边的冒号表示要截取冒号右边的内容,[0-9]+表示冒号右边为数字
```

![iShot2020-10-15 19.50.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.50.17.png)



**示例2:截取IP地址**

```python
[root@7-test1 ~]# ip a s eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:93:32:b9 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.200/24 brd 10.0.0.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::19ee:50ab:53fc:55f9/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever


()中有小于号,表明要截取字符串右边的内容
[root@7-test1 ~]# ip a s eth0 | grep -Po '(?<=inet )[0-9.]+'
10.0.0.200

()中没有小于号,表明要截取字符串左边的内容
[root@7-test1 ~]# ip a s eth0 | grep -Po '[0-9.]+(?=/24)'
10.0.0.200
```

