[toc]



# find命令

## 1.命令说明

> **find**命令用来在指定目录下查找文件。
>
> 任何位于参数之前的字符串都将被视为欲查找的目录名。如果使用该命令时，不设置任何参数，则find命令将在当前目录下查找子目录与文件。并且将查找到的子目录和文件全部进行显示



## 2.命令格式

**find 查找范围 选项 操作** 

**查找范围：默认当前目录**

**操作：默认输出到终端**



## 3.命令选项

### 3.1 -name	按照文件名查找

```python
[root@exercise1 ~]# pwd
/root

[root@exercise1 ~]# find -name  *.log
./install.log
```



### 3.2 -size	按照文件大小查找

**符号**

- **``+``	大于**

- **``-``	小于**

- **不加符号是等于**

---

**文件大小单元**

- **b	——>块（512字节）**

- **c    ——>字节**

- **w	——>字（2字节）**

- **k	——> 千字节**

- **M	——>兆字节**

- **G	——> G字节**

---



```python
//查找当前目录大小为110K的文件
[root@exercise1 tmp]# ll -h
total 144K
-rw-r--r-- 1 root root  11K Aug  9 13:35 1.1
-rw-r--r-- 1 root root  15K Aug  9 13:35 2.2
-rw-r--r-- 1 root root 110K Aug  9 13:35 3.3
-rw-r--r-- 1 root root  580 Aug  9 13:39 ip_date.txt
[root@exercise1 tmp]# find . -size 110k
./3.3
 
  
//查找当前目录小于100K的文件
[root@exercise1 tmp]# ll -h
total 144K
-rw-r--r-- 1 root root  11K Aug  9 13:35 1.1
-rw-r--r-- 1 root root  15K Aug  9 13:35 2.2
-rw-r--r-- 1 root root 110K Aug  9 13:35 3.3
-rw-r--r-- 1 root root  812 Aug  9 13:41 ip_date.txt
[root@exercise1 tmp]# find . -size -100k
.
./1.1
./ip_date.txt
./2.2
 

//查找当前目录大于100K的文件
[root@exercise1 tmp]# ll -h
total 144K
-rw-r--r-- 1 root root  11K Aug  9 13:35 1.1
-rw-r--r-- 1 root root  15K Aug  9 13:35 2.2
-rw-r--r-- 1 root root 110K Aug  9 13:35 3.3
-rw-r--r-- 1 root root  928 Aug  9 13:42 ip_date.txt
[root@exercise1 tmp]# find . -size +100k
./3.3
 
  
//查找当前目录大于10k小于100k的文件
[root@exercise1 tmp]# ll -h
total 144K
-rw-r--r-- 1 root root  11K Aug  9 13:35 1.1
-rw-r--r-- 1 root root  15K Aug  9 13:35 2.2
-rw-r--r-- 1 root root 110K Aug  9 13:35 3.3
-rw-r--r-- 1 root root 1.1K Aug  9 13:43 ip_date.txt
[root@exercise1 tmp]# find . -size +10k -size -100k
./1.1
./2.2
```



### 3.3 -user	按照文件所有者查找

```python
//查找文件所有者为gun的文件
[root@exercise1 ~]# find / -user gun
find: `/proc/5507/task/5507/fd/5': No such file or directory
find: `/proc/5507/task/5507/fdinfo/5': No such file or directory
find: `/proc/5507/fd/5': No such file or directory
find: `/proc/5507/fdinfo/5': No such file or directory
/var/spool/mail/gun
/home/gun
/home/gun/.bash_logout
/home/gun/.bash_profile
/home/gun/.bashrc
 
//查找文件的时候会有报错
上面的例子中，5507就是运行find命令时，find命令的PID，只在运行期间出现，等find命令运行完成之后，就会消失，这并不是一个实际错误
 
//解决方法，将错误输出重定向
[root@exercise1 ~]# find / -user gun 2>/dev/null
/var/spool/mail/gun
/home/gun
/home/gun/.bash_logout
/home/gun/.bash_profile
/home/gun/.bashrc
```



### 3.4 -perm	按照文件权限查找

#### 3.4.1 mode	表示精确匹配

```python
//查找权限为755的文件或目录
[root@exercise1 test]# ll
total 12
drwxr-xr-x 2 root root 4096 Aug  9 15:22 dir1
drwxrwxrwx 2 root root 4096 Aug  9 15:22 dir2
drwxr-xrw- 2 root root 4096 Aug  9 15:23 dir3
-rw-r--r-- 1 root root    0 Aug  9 15:38 file
[root@exercise1 test]# find . -perm 755
.
./dir1
```



#### 3.4.2 -mode	表示权限每一位至少匹配

```python
//示例：find . -perm -111 表示所有者，所属组，其他人都至少有执行权限
[root@exercise1 test]# ll
total 12
drwxr-xr-x 2 root root 4096 Aug  9  2018 dir1
drwxrwxrwx 2 root root 4096 Aug  9  2018 dir2
drwxr-xrw- 2 root root 4096 Aug  9  2018 dir3
-rwxr--r-- 1 root root    0 Aug  9  2018 file
[root@exercise1 test]# find . -perm -111
.
./dir1
./dir2
```



#### 3.4.3 +mode	表示权限只要有一位匹配即可

```python
//示例：find . -perm +111 表示所有者，所属组，其他人任意一个有执行权限就可以
[root@exercise1 test]# ll
total 12
drwxr-xr-x 2 root root 4096 Aug  9  2018 dir1
drwxrwxrwx 2 root root 4096 Aug  9  2018 dir2
drwxr-xrw- 2 root root 4096 Aug  9  2018 dir3
-rwxr--r-- 1 root root    0 Aug  9  2018 file
[root@exercise1 test]# find . -perm +111
.
./dir3
./dir1
./file
./dir2
```



### 3.5 -type	按照文件类型查找

**文件类型**

- **f	普通文件**
- **d   目录**
- **l     链接文件**
- **c    字符设备**
- **b    块设备**
- **s     套接字文件**
- **p    管道**

```python
//示例，查找当前目录下的文件
[root@exercise1 test]# ll
total 16
drwxr-xr-x 2 root root 4096 Aug  9  2018 dir1
drwxrwxrwx 2 root root 4096 Aug  9  2018 dir2
drwxr-xrw- 2 root root 4096 Aug  9  2018 dir3
-rwxr--r-- 1 root root    0 Aug  9  2018 file
-rw-r--r-- 1 root root  178 Aug  7 14:19 hehe
[root@exercise1 test]# find . -type f
./hehe
./file
```



### 3.6 按照时间戳查找

> +n	表示最近一次修改是在n天之前(常用，用于删除n天前的日志)
>
> -n	表示最近一次修改是在n天之内

```python
-atime	access   访问时间，指文件被访问的时间
-ctime	change   改变时间，指文件属性被改变
-mtime	modify   修改时间，指文件内容被修改
```



```python
//示例，查找/tmp下文件修改时间是在3天之前的
[root@exercise1 ~]# find /tmp/ -mtime +3
/tmp/systemd-private-81d53e50debf4c9db3563ac49d9d3d6a-php-fpm.service-8iRh7w
/tmp/systemd-private-81d53e50debf4c9db3563ac49d9d3d6a-php-fpm.service-8iRh7w/tmp
/tmp/hsperfdata_root
/tmp/.XIM-unix
/tmp/.font-unix
/tmp/supervisord.pid
/tmp/mysql.sock
/tmp/.X11-unix
/tmp/.ICE-unix
/tmp/supervisor.sock
/tmp/systemd-private-81d53e50debf4c9db3563ac49d9d3d6a-ntpd.service-lCUH17
/tmp/systemd-private-81d53e50debf4c9db3563ac49d9d3d6a-ntpd.service-lCUH17/tmp
/tmp/.Test-unix
```



### 3.7 -name	按照文件名查找

```python
//查找/tmp中以.txt结尾的文件
[root@exercise1 test]# find /tmp -type f -name *.txt
/tmp/test/3.txt
/tmp/test/1.txt
/tmp/test/2.txt
/tmp/test/6/3.txt
/tmp/test/6/1.txt
/tmp/test/6/5.txt
/tmp/test/6/2.txt
/tmp/test/6/4.txt
/tmp/test/6/6.txt
/tmp/ip_date.txt
```



### 3.8 -regex	基于正则表达式匹配文件

```python
[root@exercise1 test]# ls
1.pdf  1.py  1.txt
[root@exercise1 test]# find . -regex ".*\(\.txt\|\.pdf\)$"
./1.pdf
./1.txt

```



### 3.9 -maxdepth	向下最大深度限制为n(n代笔数字)

```python
//当前目录
[root@exercise1 test]# tree .
.
├── a
│   └── aa
│       └── aaa
├── b
│   └── bb
│       └── bbb
└── c
    └── cc

8 directories, 0 files

//指定最大查找深度为2
[root@exercise1 test]# find . -maxdepth 2
.
./b
./b/bb
./c
./c/cc
./a
./a/aa
```



### 3.10 -mindepth	搜索出深度距离当前目录至少n个子目录的所有文件

```python
[root@exercise1 test]# tree .
.
├── a
│   └── aa
│       └── aaa
├── b
│   └── bb
│       └── bbb
└── c
    └── cc

8 directories, 0 files

[root@exercise1 test]# find . -mindepth 2
./b/bb
./b/bb/bbb
./b/bb/bbb/b.txt
./c/cc
./c/cc/c.txt
./a/aa
./a/aa/aaa
./a/aa/aaa/a.txt

[root@exercise1 test]# find . -mindepth 1
./b
./b/bb
./b/bb/bbb
./b/bb/bbb/b.txt
./c
./c/cc
./c/cc/c.txt
./a
./a/aa
./a/aa/aaa
./a/aa/aaa/a.txt
[root@tencent test]#
```

### 3.11 find逻辑运算符

| **符号**      | **作用** |
| :------------ | :------- |
| **-a**        | **与**   |
| **-o**        | **或**   |
| **-not或者!** | **非**   |



## 4.操作

### 4.1 -exec	执行命令	{}表示前边匹配的内容	\;是固定格式

```python
查找/tmp以.txt结尾的文件并删除
[root@exercise1 ~]# ls /opt
1.txt  2.txt  3.txt

[root@exercise1 ~]# find /opt -type f -name *.txt -exec rm -rf {} \;

[root@exercise1 ~]# ls /opt
```



### 4.2 -ok	功能与-exec相同，执行命令前会提示是否执行

```python
查找/tmp以.txt结尾的文件并删除
[root@exercise1 ~]# find /opt -type f -name *.txt -ok rm -rf {} \;
< rm ... /opt/3.txt > ?
```

**find动作处理**

| 动作        | **含义**                                       |
| :---------- | :--------------------------------------------- |
| **-print**  | **打印查找到的内容(默认)**                     |
| **-ls**     | **以长格式显示的方式打印查找到的内容**         |
| **-delete** | **删除查找到的文件(仅能删除空目录)**           |
| **-ok**     | **后面跟自定义 shell 命令(会提示是否操作)**    |
| **-exec**   | **后面跟自定义 shell 命令(标准写法 -exec \;)** |
