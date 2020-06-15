# date命令

# 1.命令说明

> date命令根据给定格式显示日期或设置系统日期时间，print or set the system date and time



**centos7中date命令所在路径**

```python
[root@aliyun ~]# which date
/usr/bin/date
```



# 2.命令格式

> date [OPTION]…[+FORMAT]
>
> date [选项] [格式]



# 3.常用选项

## 3.1 -d	根据描述显示指定日期

```python
//查看当前系统日期
[root@test1 ~]# date
Mon Aug 20 21:15:32 CST 2018

//设置时间为一天前
[root@test1 ~]# date -d "-1 day"
Sun Aug 19 21:15:34 CST 2018
```



## 3.2 -s	手动设置时间

```python
//手动设置时间
[root@test1 ~]# date -s '2022-2-22 22:22:22'
Tue Feb 22 22:22:22 CST 2022

//查看当前时间
[root@test1 ~]# date
Tue Feb 22 22:22:22 CST 2022
```



# 4.常用输出

## 4.1 +%F	输出日期

```python
[root@test ~]# date +%F
2018-08-29
```

## 4.2 +%T	输出时间

```python
[root@test1 ~]# date +%T
10:08:38
```

## 4.3 +%j	输出当前天是一年中的第几天

```python
[root@test1 ~]# date +%j
251
```

## 4.4 +%w	输出星期

```python
⚠️0表示周日

[root@test1 ~]# date +%w
1
```

## 4.5 +%s	1970-01-01 00:00:00 开始到现在经过的秒数

```python
[root@test1 ~]# date +%s
1535508552
```



# 5.其他输出

## 5.1年份相关

### 5.1.1 +%Y	输出年份(4位数)

```python
[root@test1 ~]# date +%Y
2018
```

### 5.1.2 +%y	输出年份(00-99表示)

```python
[root@test1 ~]# date +%y
18
```



## 5.2月份相关

### 5.2.1 +%m	输出月份(0-12表示)

```python
[root@test1 ~]# date +%m
08
```

### 5.2.2 +%b	月份英文缩写

```python
[root@test1 ~]# date +%b
Aug
```

### 5.2.3 +%B	月份英文全写

```python
[root@test1 ~]# date +%B
August
```



## 5.3日期相关

### 5.3.1 +%w	输出星期(0代表周日)

```python
[root@test1 ~]# date +%w
3
```

### 5.3.2 +%c	输出日期(与date命令输出稍微有差别)

```python
[root@test1 ~]# date +%c
Wed 29 Aug 2018 10:11:12 AM CST

[root@test1 ~]# date
Wed Aug 29 10:11:12 CST 2018
```

### 5.3.3 +%d	输出日期(1-31表示)

```python
[root@test1 ~]# date +%d
29
```

### 5.3.4 +%D	输出日期(月/日/年)

```python
[root@test1 ~]# date +%D
08/29/18
```



## 5.4星期相关

### 5.4.1 +%a	输出星期(英文缩写)

```python
[root@test1 ~]# date +%a
Wed
```

### 5.4.2 +%A	输出星期(英文全称)

```python
[root@test1 ~]# date +%A
Wednesday
```

### 5.4.3 +%W	输出星期(数字表示)

```python
[root@test1 ~]# date +%w
3
```



## 5.5小时相关

### 5.5.1 +%H、+%k	输出小时(00-23表示)

```python
[root@test1 ~]# date +%H
10

[root@test1 ~]# date +%k
10
```

### 5.5.2 +%l	输出小时(01-12表示)

```python
[root@test1 ~]# date +%l
10
```



## 5.6分钟相关

### 5.6.1 +%M	输出分钟(00-59表示)

```python
[root@test1 ~]# date +%M
30
```



## 5.7秒数相关

### 5.7.1 +%S	输出秒数

```python
[root@test1 ~]# date +%S
28
```

### 5.7.2 +%N	输出纳秒

```python
纳秒nanoseconds (000000000..999999999)

[root@test1 ~]# date +%N
121213066
```



## 5.8时区相关

### 5.8.1 +%Z	输出时区

```python
CST表示中部标准时间
[root@test1 ~]# date +%Z
CST
```



## 5.9其他相关

### 5.9.1 +%P、+%p	输出AM或者PM

```python
 [root@test1 ~]# date +%p
 PM
 
 [root@test1 ~]# date +%P
 pm
```

### 5.9.2 +%r、+%X	输出时间(含时分秒，小时以12小时AM/PM来表示)

```python
[root@test1 ~]# date +%r
10:40:15 AM

[root@test1 ~]# date +%X
10:40:25 AM
```

### 5.9.3 +%x	以月/日/年输出日期

```python
[root@test1 ~]# date +%x
08/29/2018
```

### 5.9.4 +%n	输出时显示新的一行

```python
//注意有两行
[root@test1 ~]# date +%n


[root@test1 ~]# 
```

### 5.9.5 +%t	输出时插入tab

```python
//有一个空行
[root@test1 ~]# date +%t	

[root@test1 ~]# 
```





