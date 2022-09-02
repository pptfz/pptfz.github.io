[toc]



# shell产生随机数方法

# 方法1：通过系统环境变量（$RANDOM）实现

**示例**

```sh
$ echo $RANDOM
9010
$ echo $RANDOM
21762
$ echo $RANDOM
10826
```



**RANDOM的随机数范围为`0-32767`，因此，加密性不好，可以通过在输出的随机数后增加加密字符串（就是和密码生成有关的一个字符串）的方式解决，最后再一起执行md5sum操作并截取结果的后n位，这样安全性就提高了**

```sh
$ echo hehe$RANDOM|md5sum
a0c30ca1ee50e4ad15a103d18b59bd16  -
```





# 方法2：通过openssl产生随机数

-base64	使用-base64位编码格式	

后边的数字不知道是什么

```sh
$ openssl rand -base64 1
Og==
$ openssl rand -base64 2
49U=
$ openssl rand -base64 3
ii94

$ openssl rand -base64 4
ZdFgGQ==
$ openssl rand -base64 5
g+6lQaw=
$ openssl rand -base64 6
6TL7NHBd

$ openssl rand -base64 7
vI3vCFMJzA==
$ openssl rand -base64 8
dE+LENuXc3Y=
$ openssl rand -base64 9
ciL/KwjUQnR5

$ openssl rand -base64 10
nAFsTVLvVBtREw==
```



# 方法3：通过date获得随机数

**示例**

```sh
$ date +%N		N表示纳秒
519916150
$ date +%N
660161239
$ date +%N
352563239
$ date +%N
198867394
$ date +%N
872287833
$ date +%N
698481118
$ date +%N
988858815
```





# 方法4：通过/dev/urandom配合chksum生成随机数

**/dev/random设备存储着系统当前运行环境的实时数据，它可以看作系统在某个时候的唯一值，因此可以用作随机数元数据，可以通过文件读取的方式读到里面的数据，/dev/urandom这个设备的数据与random里的一样，只是它是非阻塞的随机数发生器，读取操作不会不会产生阻塞**

**示例**

```sh
$ head /dev/urandom | cksum
185767657 2818
$ head /dev/urandom | cksum
2888724895 3156
$ head /dev/urandom | cksum
1734919599 1634
$ head /dev/urandom | cksum
3186002271 2797
$ head /dev/urandom | cksum
3511808856 1282
```



# 方法5：通过UUID生成随机数

**UUID码全称是通用唯一标识码（Universally Unique Identifier,UUID）,它是一个软件建库的标准，亦为自由软件基金会（Open Software Foundation,OSF）的组织在分布式计算环境（Distributed Computing Enviroment,DCE）领域的一部分，UUID的目的是让分布式系统中的所有元素都能有唯一的的辨识信息，而不需要通过中央控制端来做辨识信息的指定**



**示例**

```sh
$ cat /proc/sys/kernel/random/uuid
f541c0ee-bbe7-4257-8733-2f58cc0ef27f

$ cat /proc/sys/kernel/random/uuid
9a136a5c-5397-40df-bea4-d6cf60db5d78

$ cat /proc/sys/kernel/random/uuid
6548c058-7d40-4013-9ce2-a6503c3010a4
```





# 方法6：使用expect附带的mkpasswd生成随机数

**mkpasswd依赖于包expect，因此需要先安装expect包**

```sh
mkpasswd
-l	指定密码长度
-d	指定密码中数字的数量
-c	指定密码中小写字母的数量
-C	指定密码中大写字母的数量
-s	指定密码中特殊字符的数量
```



**示例**

```sh
$ mkpasswd -l 10 -d 2 -c 2 -C 2 -s 2
Ly6Jl7|kq{

$ mkpasswd -l 10 -d 2 -c 2 -C 2 -s 2
raBT2x?4c)

$ mkpasswd -l 10 -d 2 -c 2 -C 2 -s 2
Ata$"P03op
```

