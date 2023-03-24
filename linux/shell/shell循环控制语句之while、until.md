# shell循环控制语句之while、until

# 一、while

**语法**

```shell
while 条件表达式
do
	命令
done
```



**说明**

while循环语句会对紧跟在while命令后的条件表达式进行判断，如果该条件表达式成立，则执行while循环体里的命令，每一次执行到done时就会重新判断while条件表达式是否成立，直到条件表达式不成立时才会跳出while循环体，如果一开始条件表达式就不成立，那么程序就不会进入循环体中执行命令了



**示例1**

while true表示条件永远为真，因此会一直执行

```shell
#!/bin/bash
while true
do
	uptime
	sleep 2
done	
```

执行结果如下

```shell
22:15:04 up 11:00,  2 users,  load average: 0.00, 0.01, 0.05
22:15:06 up 11:00,  2 users,  load average: 0.00, 0.01, 0.05
22:15:08 up 11:00,  2 users,  load average: 0.00, 0.01, 0.05
。。。
ctrl+c停止 
```



**示例2**

while循环竖向打印54321

```shell
#!/bin/bash
i=5
while ((i>0))
do
    echo "$i"
    ((i--))
done
```





# 二、until

**语法**

```shell
until 条件表达式
do
	命令
done	
```



当条件表达式不成立时，进入循环执行命令，条件表达式成立时，终止循环，until应用较少

