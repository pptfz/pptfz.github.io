[toc]



# echo命令

# 1.命令说明

> **echo命令**用于在shell中打印shell变量的值，或者直接输出指定的字符串



# 2.命令格式

**echo [选项] [参数]**



# 3.常用选项

## 3.1 `-n`	不输出换行

```python
[root@aliyun ~]# echo -n hehe
hehe[root@aliyun ~]# 
```



## 3.2 `-e`	使转移字符生效

| 字符 | 含义                                 |
| ---- | ------------------------------------ |
| \n   | 换行且光标移至行首                   |
| \c   | 最后不加上换行符号                   |
| \t   | 插入tab                              |
| \e   | 转义                                 |
| \b   | 删除前一个字符                       |
| \v   | 输出垂直制表符，与 `\f` 输出结果相同 |
| \a   | 发出警告声                           |
| \r   | 光标移至行首，但不换行               |





### 3.2.1 `\n`	换行

```shell
[root@exercise1 ~]# echo -e 'hehe\nhehe'
hehe
hehe
```



### 3.2.2 `\t`	输出制表符

```shell
[root@exercise1 ~]# echo -e 'hehe\thehe'
hehe    hehe
```



### 3.2.3 `\c`	不换行

```shell
[root@exercise1 ~]# echo -e 'hehehehe\c'
hehehehe[root@exercise1 ~]#
```



### 3.2.4 `\v`	垂直制表符

```shell
[root@exercise1 ~]# echo -e 'hehe\vhehe'
hehe
    hehe
```



### 3.2.5 `\e`	转义	等同于 `\033`

**`\e` 写法**

![iShot2020-10-15 17.35.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15%2017.35.18.png)



**`\033` 写法**

![iShot2020-10-15 17.35.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15%2017.35.35.png)



# 4.`bash `里面的颜色



```shell
\033[31;47;1mhello world\033[0m
```
