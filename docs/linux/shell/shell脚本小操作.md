[toc]



# shell脚本小操作



## 1.获取本机公网IP

**场景：**

- **云主机使用ip或者ifconfig命令是看不到本机公网IP的，想要获取本机公网IP**
- **获取本地网络公网IP**



**curl ifconfig.me**

```python
$ curl ifconfig.me
8.8.8.8
```



**curl icanhazip.com**

```python
$ curl icanhazip.com
8.8.8.8
```



**curl ident.me**

```python
$ curl ident.me
8.8.8.8
```



**curl ipecho.net/plain**

```python
$ curl ipecho.net/plain
8.8.8.8
```



**curl whatismyip.akamai.com**

```python
$ curl whatismyip.akamai.com
8.8.8.8
```



**curl myip.dnsomatic.com**

```python
$ curl myip.dnsomatic.com
8.8.8.8
```



**curl myip.dnsomatic.com**

```python
$ curl myip.dnsomatic.com
8.8.8.8
```





## 2.获取脚本绝对路径

```python
#编辑脚本
$ cat >/usr/src/test.sh <<'EOF'
base_dir=`dirname $(readlink -f $0)`
echo "脚本绝对路径是$base_dir"
EOF

#执行脚本
$ sh /usr/src/test.sh
脚本绝对路径是/usr/src
```



## 3.获取脚本执行时间

```python
#编辑脚本
$ cat >/opt/test.sh <<'EOF'
#!/bin/bash
BEGIN_TIME=`date +%s`
sleep 3
END_TIME=`date +%s`
TOTAL_TIME_S=$((END_TIME-BEGIN_TIME))
TOTAL_TIME_M=`echo "scale=3;$TOTAL_TIME_S/60" |bc -l`
echo -e "The execution time of this script is \e[32m${TOTAL_TIME_S}s\e[0m \e[35m${TOTAL_TIME_M}min\e[0m"
EOF

#执行脚本
$ sh /opt/test.sh
The execution time of this script is 3s .050min
```



## 4.shell脚本中精准过滤进程

**示例：过滤crond进程，会把grep命令同样显示出来**

```python
$ ps aux|grep crond
root       771  0.0  0.0 126388  1616 ?        Ss   08:57   0:00 /usr/sbin/crond -n
root     20996  0.0  0.0 112828   980 pts/0    S+   21:11   0:00 grep --color=auto crond
```



**精准过滤**

```python
$ ps aux|grep '[c]rond'
root       771  0.0  0.0 126388  1616 ?        Ss   08:57   0:00 /usr/sbin/crond -n
    
$ ps aux|grep crond |grep -v grep
root       771  0.0  0.0 126388  1616 ?        Ss   08:57   0:00 /usr/sbin/crond -n    
```



## 5.shell显示ok或者faild

```python
#编辑脚本
$ cat >test.sh <<'EOF'
#!/bin/bash
. /etc/init.d/functions
#true可以省略不屑
action hehe true		
action hehe false
EOF

#执行脚本
$ sh test.sh 
hehe                                                       [  OK  ]
hehe                                                       [FAILED]
```



