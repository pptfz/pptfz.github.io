[toc]



# expect自动化交互式程序

## 1.expect简介

**什么是expect**

- **expect是一个用来实现自动交互功能的软件套件(expect is a software suite for automating interactive tools)，是基于TCL的脚本编程工具语言，方便学习，功能强大**



**为什么要使用expect**

- **linux中执行系统命令或程序时，系统会以交互式的形式要求输入指定的字符串，之后才能继续执行命令，如果在shell脚本中，这样就不能实现脚本完全自动化执行，因此需要用到expect自动化交互**



**linux交互式操作的场景**

```shell
#修改用户密码
$ passwd 
Changing password for user root.
New password: 

#ssh连接服务器
$ ssh root@10.0.0.10
root@10.0.0.10's password:

#生成ssh密钥
ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa):
```



**expect自动交互工作流程**

- **spawn启动指定进程--->expect获取期待的关键字--->send向指定进程发送指定字符--->进程执行完毕，退出结束**





## 2.expect简单使用示例

**示例：免交互ssh连接服务器**

**先手动交互ssh连接一台服务器**

```shell
$ ssh root@10.0.0.33
The authenticity of host '10.0.0.33 (10.0.0.33)' can't be established.
ECDSA key fingerprint is SHA256:wrYIb1Ou6Yjp70e/3Tz9LSkjNBkW9flmmZjN80wwufU.
ECDSA key fingerprint is MD5:34:61:48:e5:71:3c:11:a0:53:ea:73:e9:4c:cd:e0:ea.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.33' (ECDSA) to the list of known hosts.
root@10.0.0.33's password: 

Last login: Sun May 16 23:13:49 2021 from 10.0.0.2
```



**安装expect**

```shell
yum -y install expect
```



**编辑expect脚本**

脚本开头的`#!/usr/bin/expect`是脚本开头解析器，和shell类似，表示 程序使用expect解析

```shell
#扩展名使用.exp代表是expect脚本
cat >test.exp <<'EOF'
#!/usr/bin/expect

#执行ssh命令 注意开头必须要有spawn，否则无法实现交互
spawn ssh root@10.0.0.31 uptime

#利用expect获取执行上述ssh命令输出的字符串是否为期待的字符串*password，这里的*是通配符
expect "*password"

#当获取到期待的字符串 *password 时，则发送密码 1 给系统，\n是换行
send "1\n"

#处理完毕后结束expect
expect eof
EOF
```



**使用`expect`命令执行脚本，因为之前已经ssh连接过了，所以这里就能不需要输入yes连接了**

```shell
$ expect test.exp
spawn ssh root@10.0.0.31 uptime
root@10.0.0.31's password:
 10:29:02 up 44 min,  1 user,  load average: 0.00, 0.01, 0.03
```



**这里仅仅是一个简单的不需要输入密码的示例，但是如果没有ssh连接过的话还是需要手动输入第一次连接需要的yes**



## 3.expect程序自动交互的重要命令

### 3.1 spawn命令

**在expect自动交互程序执行的过程中，`spawn`命令是一个开始就需要使用的命令，通过`spawn`执行一个命令或程序，之后所有的expect操作都会在这个执行过的命令或程序进程中进行，包括自动交互功能，因此如果没有`spawn`命令，expect程序将会无法实现自动交互**



**语法**

```shell
spawn [选项] [需要自动交互的命令或程序]
```



**示例**

在`spawn`命令的后面，直接挤上要执行的命令或程序

```shell
spawn ssh root@10.0.0.100 uptime
```



**使用`spawn`命令是expect程序实现自动交互工作流程中的第一步，也是最关键的一步**



### 3.2 expect命令

#### 3.2.1 expect命令说明

**在expect自动交互程序的执行过程中，当使用`spawn`命令执行一个命令或者程序之后，会提示某些交互式信息，`expect`命令的作用就是获取`spawn`命令执行后的信息，查看是否和其事先自定的相匹配，一旦匹配上指定的内容就执行expect后面的动作，expect命令也有一些选项，相对用的多的是`-re`，表示使用正则表达式的方式来匹配**



**语法**

```shell
expect 表达式 [动作]
```



**示例**

**⚠️<span style={{color: 'red'}}>以下命令不能在命令行中执行，需要放入expect脚本中执行</span>**

```shell
spawn ssh root@10.0.0.100 uptime
expect "*password" (send 1\r)
```



### 3.2.2 expect命令实践

##### 3.2.2.1 实践示例1

**执行ssh命令远程获取服务器负载值和eth0网卡，并自动输入`yes`及用户名密码**



**编辑expect脚本**

```shell
cat >test.exp << 'EOF'
#!/usr/bin/expect
spawn ssh root@10.0.0.100 uptime && ip a s eth0

#起始大括号前要有空格
expect {
  "yes/no" {exp_send "yes\r";exp_continue}
  "*password" {exp_send "1\r"}
}
expect eof
EOF
```



**说明**

- `exp_send`和`send`类似，后面的`\r(回车)`，和前文的`\n(换行)`类似

- `expect {}`，类似多行`expect`
- 匹配多个字符串，需要在每次匹配并执行动作后，加上`exp_continue`



**执行脚本**

```shell
$ expect test.exp
spawn ssh root@10.0.0.31 uptime && ip a s eth0
The authenticity of host '10.0.0.31 (10.0.0.31)' can't be established.
ECDSA key fingerprint is SHA256:o9tdhhhgM3KPZytcz16k/Wt6gfEkDp1FCD3Q7VmLnoE.
ECDSA key fingerprint is MD5:0e:a2:0c:a6:42:e4:95:b4:77:44:14:36:ba:11:2b:d8.

#可以看到这里expect会自动输入yes
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.31' (ECDSA) to the list of known hosts.

#expect自动输入密码
root@10.0.0.31's password:
 10:32:18 up  8:45,  1 user,  load average: 0.08, 0.03, 0.05
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:1c:42:1b:e4:d7 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.31/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::21c:42ff:fe1b:e4d7/64 scope link
       valid_lft forever preferred_lft forever
```



##### 3.2.2.2 实践示例2

**利用expect相应shell脚本中的多个read读入**



**编辑shell脚本**

```shell
cat > read.sh <<'EOF'
#!/usr/bin/env bash
read -p "please input your username:" name
read -p "please input your password:" pwd
read -p "please input your email:" mail
echo -n "your name is $name,"
echo -n "your password is $pwd,"
echo "your email is $mail."
EOF
```



**编辑expect脚本**

**⚠️<span style={{color: 'red'}}>expect脚本中的`exp_send`也可以改成`send`</span>**

```shell
cat > read.exp <<'EOF'
#!/usr/bin/expect

#这里执行之前写好的需要多个read输入的shell脚本
spawn /bin/sh /root/read.sh

expect {
  #若获取到的是username信息，则自动输入用户名xiaoming
  "username" {exp_send "xiaoming\r";exp_continue}
  
  #若获取到的是*pass*信息，则自动输入密码1
  "*pass" {exp_send "1\r";exp_continue}
  
  #若获取到的是*mail信息，则自动输入邮件地址
  "*mail" {exp_send "1@qq.com\r"}
}
#处理完毕后结束expect
expect eof
EOF
```



**执行脚本**

```shell
$ expect read.exp
spawn /bin/sh /root/read.sh
please input your username:xiaoming
please input your password:1
please input your email:1@qq.com
your name is xiaoming,your password is 1,your email is 1@qq.com.
```



### 3.3 send命令

**`send`命令和`exp_send`命令用法类似，即在expect命令后匹配指定的字符串后，发送指定的字符串给系统，这些命令可以支持一些特殊转义符号，例如`\r(回车)`、`\n(换行)`、`\t(制表符)`**



**send命令使用示例**

**⚠️<span style={{color: 'red'}}>expect脚本中的`send`也可以改成`exp_send`</span>**

```shell
cat > read.exp <<'EOF'
#!/usr/bin/expect

#这里执行之前写好的需要多个read输入的shell脚本
spawn /bin/sh /root/read.sh

expect {
  #若获取到的是username信息，则自动输入用户名xiaoming
  "username" {send "xiaoming\r";exp_continue}
  
  #若获取到的是*pass*信息，则自动输入密码1
  "*pass" {send "1\r";exp_continue}
  
  #若获取到的是*mail信息，则自动输入邮件地址
  "*mail" {send "1@qq.com\r"}
}
#处理完毕后结束expect
expect eof
EOF
```



**send命令参数**

- **-i	指定spawn_id，用来向不同的spawn_id进程发送命令，是进行多程序控制的参数**
- **-s    s代表slpwly，即控制发送的速度，使用的时候要与expect中的变量send_slow相关联**





### 3.4 exp_continue命令

**`exp_continue`命令一般处于`expect`命令中，属于一种动作命令，一般用在匹配多次字符串的动作中，从命令的拼写就可以看出命令的作用，即让expect程序继续匹配的意思**



**`exp_continue`命令使用示例**

```shell
cat > read.exp <<'EOF'
#!/usr/bin/expect

#这里执行之前写好的需要多个read输入的shell脚本
spawn /bin/sh /root/read.sh

expect {
  #若获取到的是username信息，则自动输入用户名xiaoming
  "username" {send "xiaoming\r";exp_continue}
  
  #若获取到的是*pass*信息，则自动输入密码1
  "*pass" {send "1\r";exp_continue}
  
  #若获取到的是*mail信息，则自动输入邮件地址
  "*mail" {send "1@qq.com\r"}
}
#处理完毕后结束expect
expect eof
EOF
```



**如果需要一次性匹配多个字符串，那么不同的匹配之间就要加上`exp_continue`，否则expect将不会自动输入指定的字符串，最后一个结尾就不需要加上`exp_continue`了，因为匹配全部完成了**



### 3.5 send_user命令

**`send_user`命令可以用来打印expect脚本信息，类似shell里的`echo`命令，并且有`echo -e`的功能，而默认的`send`、`exp_send`命令都是将字符串输出到expect程序中去**



**`send_user`命令使用示例**

**编辑expect脚本**

```shell
cat >send_user.exp <<'EOF'
#!/usr/bin/expect
send_user "i am boy.\n"
send_user "i like play basketbal.\n"
EOF
```



**执行脚本**

```shell
$ expect send_user.exp
i am boy.
i like play basketbal.
```





### 3.6 exit命令

**`exit`命令的功能类似于shell中的exit，即直接退出expect脚本，除了最基本的退出脚本功能外，还可以利用这个命令对脚本做一些关闭前的清理和提示等工作**



**`exit`命令使用示例**

```shell
cat > exit.exp <<'EOF'
#!/usr/bin/expect
send_user "i am boy.\n"
send_user "i like play basketbal.\n"
exit -onexit {
  send_user "goog bye.\n"
}
EOF
```



**执行脚本**

```shell
$ expect exit.exp
i am boy.
i like play basketbal.
goog bye.
```





### 3.7 expect常用命令总结



| **expect命令**   | **作用**                                                     |
| ---------------- | ------------------------------------------------------------ |
| **spawn**        | **spawn命令是一个在expect自动交互程序的开始就需要使用的命令，通过spawn执行一个命令或程序，之后所有的expect操作都在这个执行过的命令或程序进程中进行，包括自动交互功能** |
| **expect**       | **在expect自动交互程序的执行过程中，在使用spawn命令执行一个命令或程序之后，会提示某些交互式信息，expect命令的作用就是获取这些信息，查看是否和其事先指定的信息相匹配，一旦匹配上指定的内容，就执行expect后面的动作** |
| **send**         | **expect中的动作命令，当expect匹配了指定的字符串后，发送指定的的字符串给系统，这些命令可以支持一些特殊的转义符号，例如`\r表示回车`、`\n表示换行`、`\t表示制表符`等，还有一个类似的exp_send命令** |
| **exp_continue** | **属于一种动作命令，在一个expect命令中，用于多次匹配字符串并执行不同的动作中，从命令的拼写格式就可以看出该命令的作用，即让expect程序继续匹配** |
| **send_user**    | **用来打印expect脚本信息，类似shell里的echo命令，并且带-e(支持转义)功能** |
| **exit**         | **退出expect脚本，以及在退出脚本前做一些关闭前的清理和提示等工作** |





## 4.expect程序变量

### 4.1 普通变量

**定义语法**

```shell
set 变量名 变量值
```



**定义普通变量示例**

```shell
set pwd 123
```



**打印变量**

```shell
puts $变量名
```



**使用示例**

编辑expect脚本

```shell
cat > var.exp <<'EOF'
set pwd 123
puts $pwd
send_user "password is $pwd\n"
EOF
```



**执行脚本**

```shell
$ expect var.exp
123
password is 123
```



### 4.2 特殊参数变量

**在expect里也有与shell脚本里的`$0`、`$1`、`$#`等类似的特殊参数变量，用于接收及控制expect脚本传参**

**在expect中`$argv`表示参数数组，可以使用`[lindex $argv n]`接收expect脚本传递参，n从0开始，分别表示第一个`[lindex $argv 0]`参数、第二个`[lindex $argv 1]`参数、第三个`[lindex $argv 2]`参数。。。**



**定义及输出特殊参数变量**

```shell
cat >special-var.exp <<'EOF'
#!/usr/bin/expect
#定义变量
#相当于shell脚本中传参的$1
set file [lindex $argv 0]
set ip [lindex $argv 1]
set dir [lindex $argv 2]
send_user "$file\t$ip\t$dir\n"
puts "文件是: $file\t 主机IP是: $ip\t 目录是: $dir\n"
EOF
```



**执行脚本**

```shell
$ expect special-var.exp access.log 10.0.0.100 /tmp
access.log	10.0.0.100	/tmp
文件是: access.log	 主机IP是: 10.0.0.100	 目录是: /tmp
```



**expect接收参数的方式和bash脚本的方式区别**

| **类型**   | **接收传参方式**                    |
| ---------- | ----------------------------------- |
| **bash**   | **$0...\$n**                        |
| **expect** | **set 变量名 [lindex $argv 0...n]** |

---

**除了基本的位置参数外，expect也支持其他的特殊参数，例如`$argc`表示传参的个数，`$argv0`表示脚本的名字**

**使用示例**

**编辑expect脚本**

```shell
cat > special-other.exp <<'EOF'
#!/usr/bin/expect
set file [lindex $argv 0]
set ip [lindex $argv 1]
set dir [lindex $argv 2]
puts "文件是: $file\t 主机IP是: $ip\t 目录是: $dir\n"
puts "传参个数是: $argc"
puts "脚本名是: $argv0"
EOF
```



**执行脚本**

```shell
$ expect special-other.exp access.log 10.0.0.100 /tmp
文件是: access.log	 主机IP是: 10.0.0.100	 目录是: /tmp

传参个数是: 3
脚本名是: special-other.exp
```





## 5.expect程序中的if条件语句

**语法**

:::tip 语法

`if` 关键字后面要有空格，`else` 关键字前后都要有空格，`{条件表达式}` 大括号里边靠近大括号处可以没有空格，将指令括起来的起始大括号  `{` 前要有空格

:::

```shell
if {条件表达式} {
  命令
}
或
if {条件表达式} {
  命令
} else {
  命令
}
```



**使用示例**

**使用if语句判断脚本传参的个数，如果不符合则给予提示**

```shell
cat > if.exp <<'EOF'
#!/usr/bin/expect
if { $argc !=3 } {
  send_user "usage: expect $argv0 file ip dir\n"
  exit
}

set file [lindex $argv 0]
set ip [lindex $argv 1]
set dir [lindex $argv 2]
puts "文件是: $file\t 主机IP是: $ip\t 目录是: $dir\n"
EOF
```



**执行脚本**

未给脚本传参数

```shell
$ expect if.exp
usage: expect if.exp file ip dir
```



给脚本传参

```shell
$ expect if.exp access.log 10.0.0.100 tmp
文件是: access.log	 主机IP是: 10.0.0.100	 目录是: tmp
```





## 6.expect中的关键字

**expect中的特殊关键字用于匹配过程，代表某些特殊的含义或状态，一般只用于`expect`命令中而不能在`expect`命令外面单独使用**

### 6.1 eof关键字

**`eof(end-of-line)`关键字用于匹配结束符，即在expect脚本中的最后声明**



**示例**

```shell
#!/usr/bin/expect
spawn ssh root@10.0.0.100 uptime
expect "*password" {send "1\n"}

#eof关键字用于结束expect脚本
expect eof
```





### 6.2 timeout关键字

**`timeout`是expect中的一个控制时间的关键字变量，它是一个全局性的时间控制开关，可以通过为这个变量赋值来规定整个expect操作的时间，注意这个变量是服务于expect全局的，而不是某一条命令，即使命令没有任何错误，到了时间仍然会激活这个变量，此外，到时间后还会激活一个处理及提示信息开关**



**timeout超时功能使用示例**

```shell
#timeout语法1
cat >timeout.exp <<'EOF'
#!/usr/bin/expect
spawn ssh root@10.0.0.31 uptime

#设置5秒超时
set timeout 5

#当到达5秒之后就超时，打印指定内容并退出
expect "yes/no" {exp_send "yes\r";exp_continue}
expect timeout {puts "request timeout";return}
EOF



#timeout语法2
cat >timeout.exp <<'EOF'
#!/usr/bin/expect
spawn ssh root@10.0.0.31 uptime
expect {
  -timeout 5
  "yes/no" {exp_send "yes\r";exp_continue}
  timeout {puts "request timeout";return}
}
EOF
```



**执行脚本**

执行脚本后提示需要输入密码，这里等待5秒后如果没有输入密码则提示请求超时，并退出脚本

```shell
$ expect timeout.exp
spawn ssh root@10.0.0.31 uptime
root@10.0.0.31's password: request timeout
```





## 7.expect综合示例

**批量分发ssh密钥示例**

**本地生成密钥对**

```shell
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa &>/dev/null
```



**编辑expect脚本**

```shell
cat >ssh.exp <<'EOF'
#!/usr/bin/expect
if { $argc !=2 } {
  send_user "usage: expect ssh.exp file ip\n"
  exit
}

set file [lindex $argv 0]
set ip [lindex $argv 1]
set password "1"

spawn ssh-copy-id -f $file -p 22 root@$ip
expect {
  "yes/no" {send "yes\r";exp_continue}
  "*password" {send "$password\r"}
}
expect eof
EOF
```



**分发单个主机示例**

```shell
$ expect ssh.exp ~/.ssh/id_rsa.pub 10.0.0.31
spawn ssh-copy-id -i /root/.ssh/id_rsa.pub -p 22 root@10.0.0.31
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
The authenticity of host '10.0.0.31 (10.0.0.31)' can't be established.
ECDSA key fingerprint is SHA256:o9tdhhhgM3KPZytcz16k/Wt6gfEkDp1FCD3Q7VmLnoE.
ECDSA key fingerprint is MD5:0e:a2:0c:a6:42:e4:95:b4:77:44:14:36:ba:11:2b:d8.
Are you sure you want to continue connecting (yes/no)? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@10.0.0.31's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh -p '22' 'root@10.0.0.31'"
and check to make sure that only the key(s) you wanted were added.
```



**分发多个主机示例**

编辑shell脚本循环执行expect脚

```shell
cat > ssh.sh <<'EOF'
#!/bin/bash
for i in 31 52
do
  expect ~/ssh.exp ~/.ssh/id_rsa.pub 10.0.0.$i
done
EOF
```



**执行脚本**

```shell
$ sh ssh.sh
spawn ssh-copy-id -i /root/.ssh/id_rsa.pub -p 22 root@10.0.0.31
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
The authenticity of host '10.0.0.31 (10.0.0.31)' can't be established.
ECDSA key fingerprint is SHA256:o9tdhhhgM3KPZytcz16k/Wt6gfEkDp1FCD3Q7VmLnoE.
ECDSA key fingerprint is MD5:0e:a2:0c:a6:42:e4:95:b4:77:44:14:36:ba:11:2b:d8.
Are you sure you want to continue connecting (yes/no)? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@10.0.0.31's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh -p '22' 'root@10.0.0.31'"
and check to make sure that only the key(s) you wanted were added.

spawn ssh-copy-id -i /root/.ssh/id_rsa.pub -p 22 root@10.0.0.52
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
The authenticity of host '10.0.0.52 (10.0.0.52)' can't be established.
ECDSA key fingerprint is SHA256:o9tdhhhgM3KPZytcz16k/Wt6gfEkDp1FCD3Q7VmLnoE.
ECDSA key fingerprint is MD5:0e:a2:0c:a6:42:e4:95:b4:77:44:14:36:ba:11:2b:d8.
Are you sure you want to continue connecting (yes/no)? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@10.0.0.52's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh -p '22' 'root@10.0.0.52'"
and check to make sure that only the key(s) you wanted were added.
```

