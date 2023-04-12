# shell循环控制语句之for

**语法**

```shell
for 变量名 in 取值列表;
do
  命令
done
```





**示例**

```sh
#!/bin/bash
data='a b c d'
IFS=,
for i in $data;do
  echo $i
done
```





**for循环高并发执行脚本**

for循环ping脚本，执行效果很慢，因为会一个一个IP去ping

```shell
#!/usr/bin/env bash
#export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin

for i in {1..254}
do
	ping -c1 10.0.0.$i &>/dev/null
	if [ $? -eq 0 ];then
		echo "10.0.0.$i" >> /root/ping.txt
	fi
done
```



**高并发执行**

```shell
#!/usr/bin/env bash
#export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin

for i in {1..254}
do
	{
	ping -c1 10.0.0.$i &>/dev/null
	if [ $? -eq 0 ];then
		echo "10.0.0.$i" >> /root/ping.txt
	fi
	}&
done
wait
echo -e"online ip is: \n`cat /root/ping.txt`"
```

waite	等待并发全部执行完成才往后执行

for循环高并发
在要执行的命令外加上  {命令}&  即在do跟done之间的命令加{}&

