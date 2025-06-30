[toc]



# shell变量综述

## 1.shell变量分类

- **环境变量（全局变量）	可以在当前shell及子shell中使用**

- **本地变量（局部变量）	只能在子shell中使用**



## 2.shell查看变量

- **set	输出所有的变量，包括环境变量和本地变量**

- **env	只显示全局变量**

- **declare	输出所有的变量、函数、整数和已经导出的变量**



## 3.设置环境变量

### 3.1 设置临时性环境变量

- **export 变量名=value**

- **变量名=value;export 变量名**

- **declare -x 变量名=value**



### 3.2 设置永久性环境变量

**写入`/etc/profile`中	然后使用`source`命令生效**



### 3.3 取消变量

- **unset 变量名**



## 4.环境变量生效顺序

**/etc/profile	~/.bashrc_profile	~/.bashrc	/etc/bashrc**



## 5.shell特殊位置环境变量



| **变量**    | **含义**                                         |
| ----------- | ------------------------------------------------ |
| **$0**      | **脚本名称**                                     |
| **$n**      | **位置变量，n代表数字，超过10要用{}括起来**      |
| **$#**      | **参数个数**                                     |
| **\$*、$@** | **列出参数**                                     |
| **$?**      | **上一个命令的执行结果返回值**                   |
| **$()**     | **表示先执行里边的内容**                         |
| **${}**     | **"金庸新著"   和   "金庸新"著    用于区分变量** |
| **$!**      | **获取上一个脚本的PID**                          |
| **$_**      | **获取上一个脚本的最后一个参数**                 |
| **$-**      | **显示shell使用的当前选项，与set命令功能相同**   |



### $0	当前脚本的文件名，如果执行脚本包含了路径，那么就包括脚本路径

```shell
#编辑脚本内容
$ cat >a.sh <<'EOF'
 #!/usr/bin/env bash
 echo "当前脚本名为:$0"
 EOF

#执行脚本
$ sh a.sh
当前脚本名为:a.sh

#执行路径+脚本名
$ sh /root/a.sh
当前脚本名为:/root/a.sh
```



### \$n	位置变量，获取当前执行的脚本的第n个参数，n=1..9,如果n大于9，用大括号括起来${10}

```shell
#编辑脚本内容
$ cat > b.sh <<'EOF'
#!/usr/bin/env bash
echo "脚本的第1个参数为:$1"
echo "脚本的第10个参数为:${10}"
EOF


#执行脚本	
$ sh b.sh 10 9 8 7 6 5 4 3 2 1
脚本的第1个参数为:10
脚本的第10个参数为:1
```



### $#	获取当前执行脚本后接的参数总个数

```shell
#编辑脚本内容
$ cat > c.sh <<'EOF'
#!/usr/lib/env bash
echo "脚本参数总个数为:$#"
EOF

#执行脚本
$ sh c.sh 1 2 3 4 5 6
脚本参数总个数为:6
```



### $*和¥@	列出所有参数

- **$*	以"参数1 参数2 参数3 ..."的形式列出所有参数**

- **$@	以"参数1" "参数2" "参数3"的形式列出所有参数**



**不加引号时，\$*和$@输出一样**

```shell
#$*
$ set -- a b c
$ for i in $*;do echo $i;done
a
b
c


#$@
$ set -- a b c
$ for i in $@;do echo $i;done
a
b
c
```



**加入引号时，\$*和$@输出不一样**

```shell
#$*
$ set -- a b c
$ for i in "$*";do echo $i;done
a b c


#$@
$ set -- a b c
$ for i in "$@";do echo $i;done
a
b
c
```





### $?	上一个命令的执行结果返回值

**常见返回值**

```shell
#命令错误，返回值127
$ lp
-bash: lp: 未找到命令
$ echo $?
127

#参数不正确或者文件目录不存在
$ ls -e
ls：无效选项 -- e
Try 'ls --help' for more information.
$ echo $?
2

#权限拒绝，不是目录或文件等等
$ touch /opt/txt
touch: cannot touch ‘/opt/txt’: Permission denied
$ echo $?
1

#命令正确执行
$ ls
$ echo $?
0
```





### $()	表示先执行里边的内容

**$()等同于``**

```shell
#脚本中想要把一个命令的输出复值给一个变量
$ ip=$(ip a s eth0|awk -F'[ /]'+ 'NR==3{print $3}')
$ echo $ip
10.0.0.10
```





### ${}	**"金庸新著"   和   "金庸新"著    用于区分变量**

```shell
#想要输出你好a，但是因为没有加{}，所以aa就成了最终的变量，但是变量名是a
$ a='你好'
$ echo $aa
输出内容为空

#用{}解决以上问题
$ a='你好'
$ echo ${a}a
你好a
```



### $!	获取最后运行的后台进程的PID

⚠️**必须是后台进程**

```shell
#下载nginx官方的一张图片
$ nohup wget nginx.org/nginx.png &
$ echo $!
1065
```



### $_	获取上一个脚本的最后一个参数

```shell
#编辑脚本内容
$ cat > b.sh <<'EOF'
#!/usr/bin/env bash
echo "脚本的第1个参数为:$1"
echo "脚本的第10个参数为:${10}"
EOF

#执行脚本	
$ sh b.sh 10 9 8 7 6 5 4 3 2 1
脚本的第1个参数为:10
脚本的第10个参数为:1

#获取上一个脚本的最后一个参数
$ echo $_
10
```



### $- 显示shell使用的当前选项，与set命令功能相同

```shell
#shell默认选项是himBH
$ echo $-
himBH

#
$ set -x
++ printf '\033]0;%s@%s:%s\007' root test1 '~'
$ echo $-
+ echo himxBH
himxBH
++ printf '\033]0;%s@%s:%s\007' root test1 '~'
```



**shell默认选项himBH，每个字母都代表了一个 shell 选项**

```shell
h - hashall         
i - interactive-comments	 
m - monitor        	 
B - braceexpand    	 
H-  history      
```



**<span style={{color: 'red'}}>⚠️⚠️⚠️注意这里的 "设置-" 和 "取消+" 是反人类的：设置用 -，关闭反而是用 +</span>**

#### h - hashall

> **bash 的 hash 功能，可以实现让某些 command 和 具体路径 绑定在一起**

**查看默认选项**

```sh
$ echo $-
himBH
```



```sh
$ hash -p /tmp/aaadate date
$ hash -l |grep aaadate
builtin hash -p /tmp/aaadate date

#此时再执行命令date，会发现原先的/usr/bin/date变成了/tmpaaadate
$ date
-bash: /tmp/aaadate: No such file or directory

#执行set +h	+h表示去掉h，也就是imBH 命令不能和具体路径绑定，因此date命令能正确执行
$ set +h
$ echo $-
imBH
$ date
2020年 06月 24日 星期三 00:26:50 CST

#加上h 命令可以和具体路径绑定
$ set -h
$ echo $-
himBH
$ date
-bash: /tmp/aaadate: 没有那个文件或目录

#恢复
$ hash -d date
$ date
2020年 06月 24日 星期三 00:29:14 CST
```



#### i - interactive-comments

> **配置在交互 shell 模式下，是否允许注释**

**恢复默认选项**

```sh
$ echo $-
himBH
```



必须使用`set +o interactive-comments`，set +i不好使，原因未知

```sh
#设置命令行不允许注释
$ set +o interactive-comments
$ echo $-
himBH

#在命令行加上# 此时是不被允许的
$ #testcomment
-bash: #testcomment: 未找到命令


#取消设置
$ set -o interactive-comments
$ echo $-
himBH
$ #testcomment
```



#### m - monitor

> **配置是否打开控制 `Job control` 功能**



恢复默认选项

```sh
$ echo $-
himBH
```



`Job control` 是什么？ 即可以控制进程的停止、继续，后台或者前台执行等。

开启 `job control` 后，如果执行了一个比较耗时的命令，可以按下 `CTRL+Z` 让它在后台运行：

```sh
$ sleep 50
^Z
[1]+  已停止               sleep 50
```

然后， 可以用 `fg` 命令将后台运行的任务恢复到前台执行

```sh
$ fg 1
sleep 50

```

如果关闭这个选项，就会失去控制 Job 的能力

```sh
$ set +m
$ echo $-
hiBH

#此时使用ctrl+z不管用
$ sleep 50
^Z^Z^Z^Z^Z^C

$ fg
-bash: fg: 无任务控制
```



#### B - braceexpand

> **关于大括号使用的flag，打开后可以快捷地实现某些效果**

恢复默认选项

```sh
$ echo $-
himBH
```



利用大括号输出文件

```sh
echo {1..5}.txt
1.txt 2.txt 3.txt 4.txt 5.txt
```



关闭大括号效果

```sh
$ set +B
$ echo $-
himH
```



再次执行命令发现{}不生效了

```sh
echo {1..5}.txt
{1..5}.txt
```





#### H - histexpand

> **是否允許用 "感叹号 ！+ history number" 来执行历史命令**

**!! 	返回并执行最近的一个历史命令**
**!n	返回并执行第 n 个历史命令**

恢复默认选项

```sh
$ echo $-
himBH
```



```sh
#执行命令
$ ls /tmp/
ks-script-2R8Xnq  yum.log

#使用!运行上一次以l开头的命令
$ !l
ls /tmp/
ks-script-2R8Xnq  yum.log

#取消!功能
$ set +H

#再次执行就会报错
$ !l
-bash: !l: 未找到命令
```



问题

> **由于 histexpand 打开的时候，"!" 带特殊含义；**
> **因此 histexpand 打开状态下，"!" 不能出现在双引号中，**
> **否则会报错 `-bash: !": event not found`**

```sh
$ echo $-
himBH

#想要输出hehe!，但是却报错了，原因是命令行下，双引号里面用了!的话，Shell 会以为要执行历史展开，从而导致报错
$ echo "hehe!"
-bash: !": event not found
```



解决方法一	关闭histexpand

```sh
$ echo $-
himBH
$ set +H
$ echo $-
himB
$ echo "hehe!"
hehe!
```



解决方法二	使用单引号

```sh
$ echo $-
himBH
$ echo 'hehe!'
hehe!
```





## 6.环境变量总结

- **变量名通常要大写**

- **变量可以在自身的shell及子shell中使用**

- **常用export来定义环境变量**

- **执行env默认可以显示所有的环境变量名称及对应的值**

- **输出时用"$变量名"，取消时用"unset  变量名"**

- **书写crond定时任务是要注意，脚本要用到的环境变量最好先在所执行的shell脚本中重新定义**

- **如果希望环境变量永久生效，则可以将其放在用户环境变量文件或全局环境变量文件中**
