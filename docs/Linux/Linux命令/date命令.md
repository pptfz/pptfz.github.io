[toc]



# date命令

## 命令说明

:::tip 说明

date命令根据给定格式显示日期或设置系统日期时间

`date - print or set the system date and time`

:::



## 命令格式

:::tip 命令格式

`date [选项] [格式]`

:::



## 常用选项

### `-d`	根据描述显示指定日期

查看当前系统日期

```shell
$ date
Sat Oct 11 14:38:09 CST 2025
```



设置时间为一天前

```shell
$ date -d "-1 day"
Fri Oct 10 14:38:42 CST 2025
```





### `-s`	手动设置时间

手动设置时间

```shell
$ date -s '2022-2-22 22:22:22'
Tue Feb 22 22:22:22 CST 2022
```



查看当前时间

```shell
$ date
Tue Feb 22 22:22:23 CST 2022
```



## 常用输出

### `+%F`	输出日期

```shell
$ date +%F
2025-10-11
```





### `+%T`	输出时间

```shell
$ date +%T
17:50:13
```



### `+%j`	输出当前天是一年中的第几天

```shell
$ date +%j
285
```



### `+%w`	输出星期

:::tip 说明

`0` 表示周日

:::

```shell
$ date +%w
6
```



### `+%s`	1970-01-01 00:00:00 开始到现在经过的秒数

```shell
$ date +%s
1760176315
```



## 其他输出

### 年份相关

#### `+%Y`	输出年份(4位数)

```shell
$ date +%Y
2025
```



#### `+%y`	输出年份(00-99表示)

```shell
$ date +%y
25
```



### 月份相关

#### `+%m`	输出月份(0-12表示)

```shell
$ date +%m
10
```

#### `+%b`	月份英文缩写

```shell
$ date +%b
Oct
```

#### `+%B`	月份英文全写

```shell
$ date +%B
October
```



### 日期相关

#### `+%w`	输出星期(0代表周日)

```shell
$ date +%w
6
```

#### `+%c`	输出日期(与date命令输出稍微有差别)

```shell
$ date +%c
Sat 11 Oct 2025 06:37:35 PM CST

$ date
Sat Oct 11 18:37:46 CST 2025
```

#### `+%d`	输出日期(1-31表示)

```shell
$ date +%d
11
```

#### `+%D`	输出日期(月/日/年)

```shell
$ date +%D
10/11/25
```



### 星期相关

#### `+%a`	输出星期(英文缩写)

```shell
$ date +%a
Sat
```

#### `+%A`	输出星期(英文全称)

```shell
$ date +%A
Saturday
```

#### `+%W`	输出星期(数字表示)

```shell
$ date +%w
6
```



### 小时相关

#### `+%H`、`+%k`	输出小时(00-23表示)

```shell
$ date +%H
18

$ date +%k
18
```

#### `+%l`	输出小时(01-12表示)

```shell
$ date +%l
 6
```



### 分钟相关

#### `+%M`	输出分钟(00-59表示)

```shell
$ date +%M
43
```



### 秒数相关

#### `+%S`	输出秒数

```shell
$ date +%S
11
```

#### `+%N`	输出纳秒

:::tip 说明

纳秒nanoseconds (000000000..999999999)

:::

```shell
$ date +%N
776133807
```



### 时区相关

#### `+%Z`	输出时区

```shell
$ date +%Z
CST
```



### 其他相关

#### `+%P`、`+%p`	输出AM或者PM

```shell
$ date +%p
PM

$ date +%P
pm
```

#### `+%r`、`+%X`	输出时间(含时分秒，小时以12小时AM/PM来表示)

```shell
$ date +%r
06:49:53 PM

$ date +%X
06:49:58 PM
```

#### `+%x`	以月/日/年输出日期

```shell
$ date +%x
10/11/2025
```

#### `+%n`	输出时显示新的一行

:::tip说明

输出有两行空行

:::

```shell
[root@test1 ~]# date +%n


[root@test1 ~]# 
```

#### `+%t`	输出时插入tab

:::tip 说明

输出有一个空行

:::

```shell
[root@test1 ~]# date +%t	

[root@test1 ~]# 
```


