# ansible模块-文件模块

## 1 copy拷贝文件模块

### 1.1 拷贝文件

```shell
# 将ansible本机/etc/hosts文件拷贝到目标机/tmp下并命名为test.txt
ansible all -m copy -a "src=/etc/hosts dest=/tmp/test.txt"
```



### 1.2 拷贝文件并备份

```shell
ansible all -m copy -a "src=/etc/hosts dest=/tmp/test.txt backup=yes"
```

⚠️<span style=color:red>只有当ansible本地文件内容变化之后，受控机本地才会有备份文件</span>

```shell
$ ls
test.txt  test.txt.8600.2021-07-01@21:10:49~
```



### 1.3 直接被控端文件内容

```shell
# 直接向远端文件内写入数据信息，并且会覆盖远端文件内原有数据信息，文件不存在会自动创建
ansible all -m copy -a "content='abc' dest=/tmp/abc mode=777"
```



| 参数    | 说明                                   |
| ------- | -------------------------------------- |
| src     | 源文件路径                             |
| dest    | 目标路径                               |
| backup  | 对传输过去的文件进行备份               |
| content | 直接批量在被管理端文件中添加内容       |
| group   | 将本地文件推送到远端，指定文件属组信息 |
| owner   | 将本地文件推送到远端，指定文件属主信息 |
| mode    | 将本地文件推送到远端，指定文件权限信息 |



## 2 file文件配置模块

### 2.1 创建文件

```shell
# path中的远端路径必须存在
ansible all -m file -a "path=/tmp/tt state=touch mode=555 owner=root group=root"
```



### 2.2 创建目录

```shell
ansible all -m file -a "path=/tmp/abc state=directory"
```



### 2.3 创建软连接

```shell
ansible all -m file -a "src=/tmp/tt path=/tmp/tt_link state=link"
```







```python
[root@ansible ~]# ansible all -m file -a "path=/tmp/abc state=diretory"
[root@ansible ~]# ansible all -m file -a "path=/tmp/tt state=touch mode=555 owner=root group=root"
[root@ansible ~]# ansible all -m file -a "src=/tmp/tt path=/tmp/tt_link state=link"

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







<table border=1>
	<tr>
	    <th>参数</th>
	    <th>说明</th>
	</tr >
	<tr >
	    <td>path</td>
      <td>指定远程主机目录或文件信息</td>
	</tr>
	<tr>
	    <td>recurse</td>
      <td>递归授权</td>
	</tr>
  <tr>
	    <td rowspan="7">state</td>
      <td>directory</td>
	</tr>
  <tr>
	    <td>touch</td>
	</tr>
  <tr>
	    <td>link</td>
	</tr>
  <tr>
	    <td>absent</td>
	</tr>
  <tr>
	    <td>mode</td>
	</tr>
  <tr>
	    <td>owner</td>
	</tr>
  <tr>
	    <td>group</td>
	</tr>
</table>  

  















