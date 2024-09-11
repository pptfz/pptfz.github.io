[toc]



# echo命令

## 1.命令说明

> **echo命令**用于在shell中打印shell变量的值，或者直接输出指定的字符串



## 2.命令格式

**echo [选项] [参数]**



## 3.常用选项

### 3.1 `-n`	不输出换行

```python
[root@aliyun ~]# echo -n hehe
hehe[root@aliyun ~]# 
```



### 3.2 `-e`	使转移字符生效

| 字符 | 含义                                 |
| ---- | ------------------------------------ |
| `\n` | 换行且光标移至行首                   |
| `\c` | 最后不加上换行符号                   |
| `\t` | 插入tab                              |
| `\e` | 转义                                 |
| `\b` | 删除前一个字符                       |
| `\v` | 输出垂直制表符，与 `\f` 输出结果相同 |
| `\a` | 发出警告声                           |
| `\r` | 光标移至行首，但不换行               |





#### 3.2.1 `\n`	换行

```shell
[root@exercise1 ~]# echo -e 'hehe\nhehe'
hehe
hehe
```



#### 3.2.2 `\t`	输出制表符

```shell
[root@exercise1 ~]# echo -e 'hehe\thehe'
hehe    hehe
```



#### 3.2.3 `\c`	不换行

```shell
[root@exercise1 ~]# echo -e 'hehehehe\c'
hehehehe[root@exercise1 ~]#
```



#### 3.2.4 `\v`	垂直制表符

```shell
[root@exercise1 ~]# echo -e 'hehe\vhehe'
hehe
    hehe
```



#### 3.2.5 `\e`	

:::tip

`\e` 表示转义，等同于 `\033`

:::

**`\e` 写法**

![iShot_2024-08-23_19.14.01](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_19.14.01.png)





**`\033` 写法**

![iShot_2024-08-23_19.15.43](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_19.15.43.png)







## 4.bash里面的颜色

### 4.1 设置前景颜色

![iShot_2022-08-30_15.07.30](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-08-30_15.07.30.png)



### 4.2 设置背景颜色

![iShot_2022-08-30_15.38.59](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-08-30_15.38.59.png)



**windows终端下的效果**

![iShot_2024-08-23_19.17.03](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_19.17.03.png)





**mac终端下的效果**

![iShot_2024-08-23_19.18.31](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-23_19.18.31.png)





### 4.3 其他设置

| 编码 | 颜色/动作                            |
| ---- | ------------------------------------ |
| 0    | 重新设置属性到缺省设置               |
| 1    | 设置粗体                             |
| 2    | 设置一半亮度（模拟彩色显示器的颜色） |
| 4    | 设置下划线（模拟彩色显示器的颜色）   |
| 5    | 设置闪烁                             |
| 7    | 设置反向图象                         |
| 22   | 设置一般密度                         |
| 24   | 关闭下划线                           |
| 25   | 关闭闪烁                             |
| 27   | 关闭反向图象                         |

**写法示例**

:::info

`5;31m`

`5` 表示设置闪烁

`31m` 表示设置字体颜色为红色

:::

```shell
echo -e "\033[5;31m呵呵\033[0m"
```



**使用多个颜色设置的时候，使用分号分隔即可**

```shell
\033[31;47;1mhello world\033[0m
```



