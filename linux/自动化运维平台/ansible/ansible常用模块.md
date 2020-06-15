# Ansible常用模块

**模块在ansible中是指需要快速执行一条命令， 并且不需要保存的命令，对于复杂的命令则为playbook**



**Ansible注意事项->提示颜色信息说明**

- <span style=color:#FFE351>翔黄色：对远程节点进行相应修改</span>

- <span style=color:green>帽子绿：对远程节点不进行相应修改，或者只是对远程节点信息进行查看</span>

- <span style=color:red>深红色：操作执行命令有异常</span>

- <span style=color:#803D7E>浅紫色：表示对命令执行发出警告信息（可能存在的问题，给你一下建议）</span>



**ansible查看帮助方法**

```python
[root@m01 ~]# ansible-doc -l    #查看所有模块说明信息 
[root@m01 ~]# ansible-doc copy  #表示指定查看某个模块参数用法信息
```



# 一、命令模块

## 1.1command模块 不支持管道 不支持通配符

```python
//默认模块, 执行命令 
[root@m01 ~]# ansible all -m command -a "hostname"
[root@m01 ~]# ansible all -a hostname 
```



## 1.2shell模块 支持管道 支持通配符

```python
[root@m01 ~]# ansible all -m shell -a "ifconfig|grep eth0" -f 50

-f =forks   /etc/ansible/ansible.cfg #结果返回的数量
```



## 1.3raw模块 支持管道 支持通配符

```python
[root@m01 ~]# ansible all -m raw -a "ifconfig" 
```



# 二、脚本模块

## 2.1script执行脚本模块

```python
//编写脚本
[root@m01 ~]# mkdir -p /server/scripts
[root@m01 ~]# cat /server/scripts/yum.sh
#!/usr/bin/bash
yum -y install iftop

//在本地运行模块，等同于在远程执行，不需要将脚本文件进行推送目标主机执行
[root@m01 ~]# ansible web01 -m script -a "/server/scripts/yum.sh"
```



# 三、安装模块

## 3.1yum安装软件模块

```python
[root@m01 ~]# ansible all -m yum -a "name=httpd state=installed"
name								#指定要安装的软件包名称
state   						#指定使用yum的方法
installed，present  #安装软件包
removed，absent     #移除软件包
latest              #安装最新软件包 
```



# 四、文件模块

## 4.1copy拷贝文件模块

```python
//推送文件模块
[root@m01 ~]# ansible all -m copy -a "src=/etc/hosts dest=/tmp/test.txt"

//在推送覆盖远程端文件前，对远端已有文件进行备份，按照时间信息备份
[root@m01 ~]# ansible all -m copy -a "src=/etc/hosts dest=/tmp/test.txt backup=yes"


注意：当ansible本地/etc/hosts文件内容变化之后，受控机本地才会有备份文件
[root@web01 tmp]# ls
hehe  test.txt  test.txt.2772.2017-09-15@09:43:26~

//直接向远端文件内写入数据信息，并且会覆盖远端文件内原有数据信息
[root@m01 ~]# ansible all -m copy -a "content='abc' dest=/tmp/abc"

src				#推送数据的源文件信息
dest			#推送数据的目标路径
backup  	#对推送传输过去的文件，进行备份
content		#直接批量在被管理端文件中添加内容
group			#将本地文件推送到远端，指定文件属组信息
owner			#将本地文件推送到远端，指定文件属主信息
mode			#将本地文件推送到远端，指定文件权限信息
```



## 4.2file文件配置模块

```python
[root@m01 ~]# ansible all -m file -a "path=/tmp/abc state=diretory"
[root@m01 ~]# ansible all -m file -a "path=/tmp/tt state=touch mode=555 owner=root group=root"
[root@m01 ~]# ansible all -m file -a "src=/tmp/tt path=/tmp/tt_link state=link"

path			#指定远程主机目录或文件信息
recurse		#递归授权
state	
    	directory		#在远端创建目录
    	touch				#在远端创建文件
    	link				#link或hard表示创建链接文件
    	absent			#表示删除文件或目录
    	mode				#设置文件或目录权限
    	owner				#设置文件或目录属主信息
    	group				#设置文件或目录属组信息
```



# 五、服务模块

## 5.1service服务模块

```python
[root@m01 ~]# ansible all -m service -a "name=crond state=stopped enabled=yes"

name		#定义要启动服务的名称
state		#指定服务状态是停止或是运行，停止和运行指令要写成过去时
    started		#启动
    stopped		#停止
    restarted	#重启
    reloaded	#重载
enabled				#是否让服务开启自启动
```



# 六、用户和组模块

## 6.1group组模块

```python
[root@m01 ~]# ansible all -m group -a "name=hehe gid=888"

name		#指定创建的组名
gid			#指定组的gid
state
    absent		#移除远端主机的组
    present		#创建远端主机的组（默认）
```



## 6.2user用户模块

```python
//-123使用MD5进行加密 -stdin 非交互式 -salt 加密参数
[root@m01 ~]# echo "bgx" | openssl passwd -123 -stdin -salt 'salt'

[root@m01 ~]# ansible all -m user -a "name=hehe uid=888 group=888 shell=/sbin/nologin create_home=no"
[root@m01 ~]# ansible all -m user -a "name=hehe password='$1$765yDGau$diDKPRoCIPMU6KEVEaPTZ0' "

uid						#指定用户的uid
group					#指定用户组名称
groups				#指定附加组名称
password			#给用户添加密码
shell					#指定用户登录shell
create_home		#是否创建家目录
```



# 七、计划任务模块

## 7.1cron定时任务模块

```python
//正常使用crond服务
[root@m01 ~]# crontab -l
* * * * *  /bin/sh /server/scripts/yum.sh

//使用ansible添加一条定时任务
[root@m01 ~]# ansible all -m cron -a "minute=* hour=* day=* month=* weekday=*  job='/bin/sh /server/scripts/test.sh'"
[root@m01 ~]# ansible all -m cron -a "job='/bin/sh /server/scripts/test.sh'"

//设置定时任务注释信息，防止重复，name设定
[root@m01 ~]# ansible all -m cron -a "name='cron01' job='/bin/sh /server/scripts/test.sh'"

//删除相应定时任务
[root@m01 ~]# ansible all -m cron -a "name='ansible cron02' minute=0 hour=0 job='/bin/sh /server/scripts/test.sh' state=absent"
 
//注释相应定时任务，使定时任务失效
[root@m01 scripts]# ansible all -m cron -a "name='ansible cron01' minute=0 hour=0 job='/bin/sh /server/scripts/test.sh' disabled=no"

minute			#分钟
hour				#小时
day					#日期
month				#月份
weekday			#星期
job					#要执行的命令或脚本
name				#指定计划任务别名
disabled		#是否注释
state
	absent			#删除
```



# 八、挂载模块

## 8.1mount模块

```python
[root@m01 ~]# ansible all -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=present"
[root@m01 ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=mounted"
[root@m01 ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=unmounted"
[root@m01 ~]# ansible web -m mount -a "src=172.16.1.31:/data path=/data fstype=nfs opts=defaults state=absent"


src			#指定要挂载的内容
path		#本地挂载点
fstype	#挂载类型
opts		#挂载权限

state
	present			#开机挂载，仅将挂载配置写入/etc/fstab
	mounted			#挂载设备，并将配置写入/etc/fstab
	unmounted		#卸载设备，不会清除/etc/fstab写入的配置
	absent			#卸载设备，会清理/etc/fstab写入的配置
```



# 九、解压缩模块

## 9.1unarchive模块

```python
[root@m01 ~]# ansible all -m unarchive -a "src=/tmp/hehe.tar.gz dest=/tmp"
[root@m01 ~]# ansible all -m unarchive -a "src=/tmp/hehe.tar.gz dest=/tmp copy=no"

copy					#默认为yes，即先在本地解压然后再传输到受控机，等于no，解压缩受控机压缩包
creates				#当文件存在时，不再进行解压
mode					#指定解压缩文件权限
list_files		#是否列出文件列表，默认no
remote_src		#表示文件已经在受控机上，相当于copy =no
```





# 十、下载模块

## 10.1get_url模块

```python
[root@m01 ~]# ansible all -m get_url -a "url=xxx dest=/opt"

url			#指定要下载的url地址
dest		#指定将url下载至哪
```



# 十一、替换模块

## 11.1 lineinfile模块

```python
[root@m01 ~]# ansible all -m lineinfile -a "path=/root/hehe regexp='^user admin' line='user hehe'"


path			#文件路径
regexp		#匹配的规则，即要替换的内容
line			#替换为什么
state
	adsent		#删除
```



## 11.2 replace模块

```python
[root@m01 ~]# ansible all -m replace -a "path=/root/hehe regexp='^user admin' replace='hehe'"

path			#文件路径
regexp		#匹配的规则，即要替换的内容
replace		#替换为什么
```





# 十二、mysql模块

## 12.1mysql_user管理用户模块

```python
[root@m01 ~]# ansible mysql -m mysql_user -a 'login_host=localhost login_password=abc123 login_user=root name=abc password=abc123 priv=zabbix.*:ALL state=present'

login_host				#登陆主机
login_password		#登陆密码
login_user				#登陆用户
name							#要创建的用户
password					#创建的用户的密码
priv							#授权
state	
	present					#创建
```



## 12.2mysql_db管理数据库模块

```python
[root@m01 ~]# ansible mysql -m mysql_db -a 'login_host=localhost login_password=abc123 login_user=root name=hehe state=present'

login_host				#登陆主机
login_password		#登陆密码
login_user				#登陆用户
name							#要创建的数据库
state
	present					#创建
```

