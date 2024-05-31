[toc]



# Linux用户组管理

## 1.Linux用户管理

### 1.1 useradd命令创建用户过程

> **1、不带任何参数使用添加用户时，首先读取/etc/login.defs  /etc/default/useradd 预先定义的规则**
>
> **2、根据设置的规则添加用户，同时会向/etc/passwd  /etc/group文件添加新建的用户和组，但/etc/shadow   /etc/gshadow也会同步生成记录**
>
> **3、同时系统会根据/etc/login.defs    /etc/default/useradd文件中配置的信息建立用户的家目录，并复制/etc/skel中所有隐藏的环境配置文件到新用户的家目录中，以完成对用户环境的初始化设置**



### 1.2 用户配置文件

#### 1.2.1 /etc/passwd

- **作用**

  > **存储用户信息文件，每一行表示一个用户信息，有多少行就表示有多少个用户**



- **格式**

  > **root : x : 0 : 0 : root : /root : /bin/bash**



- **格式含义(此文件由7个字段的数据组成，字段之间用“：”分隔)**

  > **1用户名：2密码：3用户标识号UID：4组标识号GID：5个人资料：6主目录：7命令解释器**

#### 1.2.2 /etc/shadow

- **作用**

  > **存储用户密码信息文件**

- **格式**

  > **u1 : !! : 17749 : 0 : 99999 : 7 : : :**

- **格式含义(此文件由9个字段的数据组成，字段之间用“：”分隔)**

  > 1用户名 2 密码 ！！表示没有密码 3 最近改动密码的日期 4 密码不可被更动的天数 5 密码需要重新变更的天数 6 密码需要变更期限前的警告期限 7 密码过期的宽限时间 8帐号失效日期 9 保留

#### 1.2.3 /etc/skel(目录)

- **作用**

  > **创建用户相关的目录，此目录用来存放新用户需要的所有基础环境变量文件**

  ```python
  [root@exercise1 skel]# pwd
  /etc/skel
  
  [root@exercise1 skel]# ls -a
  
  .  ..  .bash_logout  .bash_profile  .bashrc
  
  [root@exercise1 skel]# ll -a
  total 28
  drwxr-xr-x.   2 root root  4096 Aug  4 13:09 .
  drwxr-xr-x. 103 root root 12288 Aug  8 06:29 ..
  -rw-r--r--.   1 root root    18 Mar 23  2017 .bash_logout
  -rw-r--r--.   1 root root   176 Mar 23  2017 .bash_profile
  -rw-r--r--.   1 root root   124 Mar 23  2017 .bashrc
  ```

  

**与/etc/skel有关的问题**

```python
1.用户u1登陆系统后提示符如下
-bash-4.1$

2. 原因
用户家目录下的相关环境配置文件被删除

3.解决方法
复制/etc/skel下的.bash*到用户家目录
cp /etc/skel/.bash* ~
```



### 1.3 组配置文件

#### 1.3.1 /etc/group

- **作用**

  > **存储组相关信息**

- **格式**

  > **g1: x : 500 :**

- **格式含义(此文件由4个字段的数据组成，字段之间用“：”分隔)**

  > **1组名 2组密码 3组管理员 4用户组成员**

#### 1.3.2 /etc/gshadow

- **作用**

  > **存储组密码信息**

- **格式**

  > **hehe : ! : :**

- **格式含义(此文件由4个字段的数据组成，字段之间用“：”分隔)**

  > **1组名 2组密码 3组管理员 4用户组成员**



### 1.4 Linux用户分类

#### 1.4.1 管理员用户

- **默认是root用户，它的UID 和GID均为0，系统安装完成后自动生成的，默认通过它就可以登录系统，拥有最高的管理权限**

#### 1.4.2 普通用户

- **由系统管理员root创建的，创建完成后可以登录系统，但默认无法创建、修改和删除任何管理员下的文件；UID从500-65535**

#### 1.4.3 系统用户(或虚拟用户)

- **安装系统后默认生成的用户，大多数不能登录系统，但它们是系统正常运行不可缺少的，它们的存在主要是为了方便系统管理，满足相应的系统进程对文件所属用户的要求；UID从 1-499**



### 1.5 用户相关命令

#### 1.5.1 useradd	创建用户

**语法格式**

- **useradd 选项 用户名**

**选项**

- **-n	不创建以用户名为名的组**

- **-c    创建用户时，添加个人信息**

- **-u    用户ID值，这个值必须是唯一的**

- **-s    用户登录后使用的shell**

- **-g    指定用户对应的组，对应的组必须在系统中存在**

- **-M   不创建用户家目录**



#### 1.5.2 usermod	修改用户

**语法格式**

- **usermod 选项 用户名**

**选项(usermod只有-l选项与useradd不同)**

- **-c   修改用户的个人信息，同useradd 的-c功能**

- **-g   修改用户对应的用户组，同 useradd的-d功能**

- **-s   修改用户登录后使用的shell名称，同useradd的-s功能**

- **-u   修改用户的uid ，同useradd 的-u功能**

- **-l   修改用户的名称**
  - **-usermod -l  新用户名称  旧用户名称**



#### 1.5.3 userdel	删除用户

**语法格式**

- **userdel 选项 用户名**

**选项**

- **-f   强制删除用户**
- **-r   删除用户的同时，删除与用户相关的所有文件(包含邮箱信息/var/spool/mail/)**

⚠️

**当使用-r 也无法彻底清空用户内容时，把这两个配置文件中与要删除的用户相关的信息，注释或删除掉。**

**/etc/passwd** 

**/etc/group**



#### 1.5.4 passwd	修改用户密码

**命令格式**

- **passwd 选项 用户名**

**选项**

- **--stdin 非交互式设置密码**

  ```python
  [root@exercise2 local]# echo 123abc|passwd --stdin caonima
  Changing password for user caonima.
  passwd: all authentication tokens updated successfully.
  ```

- **-d 删除密码**

  ```python
  [root@exercise2 ~]# passwd -d hehe
  Removing password for user hehe.
  passwd: Success
  ```

- **-l 锁定密码**

  ```python
  [root@exercise2 ~]# passwd -l hehe
  Locking password for user hehe.
  passwd: Success
   
  锁定用户hehe的密码后，其他用户就无法登陆hehe用户，会提示错误的密码
  [haha@exercise2 ~]$ su - hehe
  Password:
  su: incorrect password
  ```

- **-u 解锁密码**

  ```python
  [root@exercise2 ~]# passwd -u hehe
  Unlocking password for user hehe.
  passwd: Success
  ```

- **-S 显示账户状态信息**

  > **账户信息包含7个字段**
  > **第1个字段是用户的登录名**
  > **第2个字段指示用户账号口令是锁定(L)、无口令(NP)还是有可用口令(P)**
  > **第3个字段给出最后一次口令修改的 日期**
  > **接下来4个字段是最小有效期，最大有效期，警告字段和口令的休止期，这些时期用天标志**
  >
  > **[root@exercise2 ~]# passwd -S hehe**
  > **hehe PS 2018-08-06 0 1 1 -1 (Password set, SHA512 crypt.)**

- **-w,--warndays WARN_DAYS(长格式) 设置口令需要修改前发出警告的天数**

  > **WARN_DAYS选项是口令过期前的天数。据到期日这些天数时， 用户将被警告其口令即将过期**

- **-x, --maxdays MAX_DAYS 设置口令有效的最大天数**

  > **MAX_DAYS天数后，口令需要修改**

- **-i, --inactive INACTIVE 此选项用于在口令过期几天后禁用该账户**

  > **用户账号的口令过期INACTIVE指定的天数后，该用户将无法再登录此账号**

- **-n, --mindays MIN_DAYS 设置口令修改的最小天数间隔为MIN_DAYS**

  > **此字段设为0表示用于可以随时修改其口令**

- **-e, --expire 使一个账户的口令立即过期。这实际上强迫用户在下次登录时修改密码**

  > **WARNING: Your password has expired.**
  > **You must change your password now and login again!**
  > **Changing password for user hehe.**
  > **Changing password for hehe.**
  > **(current) UNIX password:**



#### 1.5.5 su	切换用户

⚠️**不加-     直接切换到root家目录，环境变量没有改变,此方式不安全**

```python
[root@exercise1 ~]# su hehe
[hehe@exercise1 root]$ pwd
/root
 
[hehe@exercise1 root]$ ls
ls: cannot open directory .: Permission denied
[hehe@exercise1 root]$ cd /
[hehe@exercise1 /]$ ls
app     bin   caonima  dev  hehe  lib    lost+found  misc  net     opt      proc  sbin     server  sys   tmp  var
backup  boot  cgroup   etc  home  lib64  media       mnt   oldboy  package  root  selinux  srv     test  usr
[hehe@exercise1 /]$
```



**⚠️加- 	切换到自己的家目录，环境变量改变**

```python
[root@exercise1 ~]# su - hehe
[hehe@exercise1 ~]$ pwd
/home/hehe
```



#### 1.5.6 sudo	用户授权

- **作用**

  > **通过配置文件来限制用户的权限 ，可以让普通用户在执行指定的命令或程序时，拥有超级用户的权限**

- **sudo工作过程**

  > **1.当用户执行sudo时，系统会主动寻找/etc/sudoers文件，判断该用户是否有执行sudo的权限**
  >
  > **2.确认用户具有可执行sudo的权限后，让用户输入用户自己的密码确认**
  >
  > **3.若密码输入成功，则开始执行sudo后续的命令**
  >
  > **4.root执行sudo时不需要输入密码(因为sudoers文件中有配置root ALL=(ALL) ALL这样一条规则)**

- **选项**
  - **-l     显示用户拥有的sudo权限**
  - **-k    清空密码，密码有效时间默认5分钟**

- **授权示例**

  ```python
  示例1：给普通用户u1提权,让普通用户可以查看root用户的家目录；普通用户可以使用useradd命令，创建新用户
  范例分析步骤：
  1） useradd u1
  
  2） visudo=vi打开/etc/sudoers文件 或 vim /etc/sudoers
  注：visudo会检查内部语法，避免用户输入错误信息，所以我们一般使用visudo，编辑此文件要用root权限
  
  3) 编辑文件的第98行，编辑完成后，wq! 强制保存退出(vim 编辑/etc/sudoers 文件权限默认440)
  root ALL=(ALL) ALL
  u1 ALL=(ALL) /bin/ls,/usr/sbin/useradd
  u1 ALL=(ALL) /bin/*,!/bin/ls,!/usr/sbin/useradd        排除/bin/ls
  u1 ALL=(ALL) NOPASSWD:/bin/ls                    执行sudo命令不需要输入密码
    
  4）使用u1 用户登录测试
  sudo useradd u11 //可成功创建用户，证明提权成功
  sudo ls /root //可查看root的家，证明提权成功
  
  5） sudo -l //-l 参数是列出当前用户可执行的命令，但只有在sudoers文件里的用户才能使用该选项
  ```

  

#### 1.5.7 用户查询命令

##### 1.5.7.1 w	显示目前登入系统的用户信息

**执行这项指令可得知目前登入系统的用户有哪些人，以及他们正在执行的程序**

```python
[root@exercise1 ~]# w
09:09:47 up  6:31,  7 users,  load average: 0.07, 0.06, 0.01
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    192.168.1.6    05:33    2:35m  0.37s  0.37s -bash
root     pts/1    192.168.1.6    05:43    3:07m  0.04s  0.02s bash
root     pts/2    192.168.1.6    05:53    3:07m  0.06s  0.05s bash
root     pts/3    192.168.1.6    05:55    3:13m  0.02s  0.01s bash
root     pts/4    192.168.1.6    06:01    3:07m  0.01s  0.01s -bash
root     pts/5    192.168.1.6    07:46    0.00s  0.14s  0.01s w
root     pts/6    192.168.1.6    08:04    1:04m  0.04s  0.03s -bash
```

##### 1.5.7.2 id	查看用户UID、GID

```python
[root@exercise1 ~]# id root
uid=0(root) gid=0(root) groups=0(root)
```

##### 1.5.7.3 last	显示用户登录情况

```python
[root@exercise1 ~]# last
u1       pts/7        192.168.1.6    Wed Aug  8 08:05 - 08:35  (00:29)   
root     pts/7        192.168.1.6    Wed Aug  8 08:05 - 08:05  (00:00)   
root     pts/6        192.168.1.6    Wed Aug  8 08:04   still logged in  
root     pts/5        192.168.1.6    Wed Aug  8 07:46   still logged in  
root     pts/4        192.168.1.6    Wed Aug  8 06:01   still logged in  
root     pts/3        192.168.1.6    Wed Aug  8 05:55   still logged in  
root     pts/2        192.168.1.6    Wed Aug  8 05:53   still logged in  
root     pts/1        192.168.1.6    Wed Aug  8 05:43   still logged in  
root     pts/0        192.168.1.6    Wed Aug  8 05:33   still logged in  
user     pts/3        192.168.1.6    Wed Aug  8 03:34 - 05:00  (01:26)   
user     pts/2        192.168.1.6    Wed Aug  8 03:33 - 05:00  (01:27)    
u1       pts/6        192.168.1.6    Wed Aug  8 03:25 - 03:25  (00:00)
```

##### 1.5.7.4 lastlog	显示linux中所有用户最近一次远程登录的信息

```python
[root@exercise1 ~]# lastlog
Username         Port     From             Latest
root             pts/7    192.168.1.6    Wed Aug  8 08:05:24 +0800 2018
bin                                        **Never logged in**
daemon                                     **Never logged in**
adm                                        **Never logged in**
lp                                         **Never logged in**
sync                                       **Never logged in**
```



### 1.6 组相关命令

#### 1.6.1 groupadd	创建组

**语法格式**

- **groupadd 选项 用户组**

**选项**

- **-g gid 指定用户组的GID，GID唯一不能为负数，如果不指定GID从500开始**
- **-f 新增一个组，强制覆盖一个已存在的组，GID、组成员不会改变**



#### 1.6.2 gpasswd	将已存在的用户加入到组中

**语法格式**

- **gpasswd 选项 用户名 组名**



**选项**

- **-a：添加一个用户到组,可以追加到组**
- **-M：添加多个用户到组，覆盖之前的组成员**
- **-d：从组删除用户**



⚠️

**1. -a只能添加一个用户到组中，批量添加用户到组用-M选项**

**2. -M选项再次执行添加用户到组会覆盖之前的用户**



#### 1.6.3 groupmod	修改组信息

**语法格式**

- **groupmod 选项 组名**

**选项**

- **-n 修改组名**
- **-g 修改GID**



#### 1.6.4 groupdel	删除组

**语法格式**

- **groupdel 组名**



#### 1.6.5 groups	查看用户属于哪些组

**语法格式**

- **groups 用户名**

  ```python
  [root@exercise1 ~]# groups root
  root : root
  ```

  
