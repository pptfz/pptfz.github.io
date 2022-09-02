[toc]



# 测试Linux下删除大量文件的效率



## 创建50万个测试文件

```python
//创建50万个文件
mkdir /test && cd /test
time for i in $(seq 1 500000);do echo text >>$i.txt;done

real	1m9.177s
user	0m9.731s
sys	0m48.238s


//总大小为2G
du -sh /test/
2.0G	/test/
```



## 1.rm删除

```python
time rm -rf *
-bash: /usr/bin/rm: Argument list too long

real	0m1.709s
user	0m1.580s
sys	0m0.123s

文件太多，rm不起作用
```



## 2.find删除

```python
time find ./ -type f -exec rm {} \;

real	10m56.698s
user	2m13.203s
sys	8m35.653s

用时10分钟
```



## 3.find with delete

```python
time find ./ -type f -delete

real	0m26.757s
user	0m1.222s
sys	0m23.112s

用时26秒
```



## 4.rsync删除

```python
//先建立一个空文件夹test-bak
mkdir test-bak
time rsync -a --delete test-bak/ /test/

real	0m25.440s
user	0m1.364s
sys	0m22.082s

用时25秒
```



## 5.python2.7

```python
import os
import timeit
def main():
    for pathname,dirnames,filenames in os.walk('/test'):
        for filename in filenames:
            file=os.path.join(pathname,filename)
            os.remove(file)
            
if __name__=='__main__':
    t=timeit.Timer('main()','from __main__ import main')
    print t.timeit(1)
```

用时35秒



## 6.perl

```python
time perl -e 'for(<*>){((stat)[9]<(unlink))}'

real	0m33.891s
user	0m2.590s
sys	0m28.254s

用时33秒
```





### 系统环境

```python
ucloud 1c2g centos7.7

#使用dd命令测试磁盘读写速度为78.6MB/s
dd if=/dev/zero of=/opt/bigfile bs=1M count=1024
1024+0 records in
1024+0 records out
1073741824 bytes (1.1 GB) copied, 13.668 s, 78.6 MB/s

#使用hdparm测试磁盘读写速度为74.60MB/s
hdparm -t --direct /dev/vda1

/dev/vda1:
 Timing O_DIRECT disk reads: 230 MB in  3.08 seconds =  74.60 MB/sec
```



### 50万个文件删除所用时间

> rm删除：**文件太多，无法删除**
>
> find删除：**用时10分钟**
>
> find with delete删除：**用时26秒**
>
> rsync删除：**用时25秒**
>
> python2.7删除：**用时35秒**
>
> perl删除：**用时33秒**

**<span style={{color: 'red'}}>rsync删除最快</span>**
