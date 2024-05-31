[toc]



# python基础六	编码

## 1.编码集

```python
ascii			不支持中文，每一个字符占8位，1个字节
gbk				国标，支持中文，一个字符占16位，2个字节
unicode		中文、英文都是4个字节
utf-8			英文1个字节、欧洲2个字节、亚洲3个字节
```



## 2.二次编码

### 2.1 编码作用

> 1.存储 -- 文件操作
> 2.传输 -- 网编



### 2.2 编码

```python
s = "呵呵"
s1 = s.encode("utf8")
print (s1)
b'\xe5\x91\xb5\xe5\x91\xb5'
```



### 2.3 解码

```python
s2 = s1.decode("utf8")
print (s2)
呵呵
```



### 2.4 注意点 ⚠️

```python
1.python3内存中使用的就是unicode（万国码）

2.硬盘中存储时的编码方式
gbk
utf-8

3.用什么编码，就用什么解码
```



## 3.单位转换

```python
bit = 1byte
1024byte = 1KB
1024KB = 1MB
1024MB = 1GB
1024GB = 1TB
1024TB = 1PB
```

