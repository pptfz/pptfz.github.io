[toc]



# shell打印字符长度

**编写shell脚本以打印下面语句中字符数小于6的单词。** 

> **The hard part isn’t making the decision. It’s living with it.**

思路：首先取出所有单词，计算每个单词的长度，然后依次进行判断



## 计算变量内容的长度，常见的方法有四种：

### **1.变量自带的获取长度的方法 echo ${#str}**

```python
$ str=abc
$ echo ${#str}
3
```



### **2.管道加wc -L方法**

```python
$ str=abc

#-L 打印行长度
$ echo $str|wc -L		
3
```



### **3.利用expr自带的length方法**

```python
$ str=abc
$ expr length $str
3
```



### **4.利用awk自带的length函数方法**

```python
$ str=abc
$ echo $str|awk '{print length ($0)}'
3
```





## 结合for循环截取字符串

**结合for循环截取字符串，例如截取给定字符串中长度大于某一个值或小于某一个值**

**例句：The hard part isn't making the decision. It's living with it.**

**截取例句中单词长度大于5的单词**



### 方法一	 $\{#str}

```python
#编辑脚本
cat >test.sh<<'EOF'
#!/usr/bin/env bash
#
str="The hard part isn't making the decision. It's living with it"
for i in $str
do
   if [ ${#i} -gt 5 ];then
      echo $i
   fi
done
EOF

#执行脚本
$ sh test.sh
making
decision.
living   
```



### 方法二	wc -L

```python
#编辑脚本
cat >test.sh<<'EOF'
#!/usr/bin/env bash
str="The hard part isn't making the decision. It's living with it"

for i in $str
do
   if [ `echo $i|wc -L` -gt 5 ];then
      echo $i
   fi
done
EOF

#执行脚本
$ sh test.sh
making
decision.
living
```



### 方法三	利用expr自带的length方法

```python
#编辑脚本
cat >test.sh<<'EOF'
#!/usr/bin/env bash
str="The hard part isn't making the decision. It's living with it"

for i in $str
do
   if [ `expr length $i` -gt 5 ];then
      echo $i
   fi
done
EOF

#执行脚本
$ sh test.sh
making
decision.
living
```



### 方法四	利用awk自带的length函数方法

```python
#编辑脚本
cat >test.sh<<'EOF'
#!/usr/bin/env bash
str="The hard part isn't making the decision. It's living with it"

for i in $str
do
   if [ `echo $i|awk '{print length ($0)}'` -gt 5 ];then
      echo $i
   fi
done
EOF

#执行脚本
$ sh test.sh
making
decision.
living
```

