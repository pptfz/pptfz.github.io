[toc]



# rpm命令

## 1.命令说明

> **rpm命令是RPM软件包的管理工具。**
>
> **rpm原本是Red Hat Linux发行版专门用来管理Linux各项套件的程序，由于它遵循GPL规则且功能强大方便，因而广受欢迎。逐渐受到其他发行版的采用。**
>
> **RPM套件管理方式的出现，让Linux易于安装，升级，间接提升了Linux的适用度。**

## 2.命令格式

**rpm 选项 参数**



## 3.选项 

### 3.1 安装参数

- **-i          安装软件包**
- **-v         显示详细信息**
- **-h         显示安装进度**
- **--nodeps   不验证软件包的依赖性**
- **--force    强制安装，即使覆盖其他包的文件也安装**

### 3.2 卸载参数

- **-e	卸载软件包**

### 3.3 升级参数

- **-U	升级软件包**

### 3.4 查询参数

- **-a		查询所有**
- **-q		查询已安装软件包**
- **-c		仅列出配置文件**
- **-l		列出包中文件信息，需配合-q参数**
- **-f 		查询指定文件属于哪个软件包，需配合-q参数**
- **-p		查询未安装软件包信息**
- **-i		查询软件包详细信息**
- **-R		查询软件包依赖性**

## 4.rpm软件包信息

**rpm 包名字结构：**

**glibc-2.17-196.el7_4.2.x86_64**

**glibc            -2             .17          -196          -el7               x86                    64**

**软件名   主版本号   次版本号   修订号     RHEL7    CPU架构平台  支持系统位数**



## 5.rpm包中文件的提取

**模拟cat命令被删除再到恢复**

```python
1.查找cat命令属于哪个文件
[root@test1 ~]# which cat
/bin/cat
 
2.删除cat命令文件
[root@test1 ~]# rm -rf /bin/cat
 
3.rpm -qf /bin/cat
[root@test1 ~]# rpm -qf /bin/cat
coreutils-8.4-46.el6.x86_64
 
4.挂载光盘
[root@test1 ~]# mount /dev/sr0 /mnt
mount: block device /dev/sr0 is write-protected, mounting read-only
 
5.恢复文件
[root@test1 ~]# rpm2cpio /mnt/Packages/coreutils-8.4-46.el6.x86_64.rpm |cpio -idv ./bin/cat
./bin/cat
25240 blocks
 
rpm2cpio   将rpm包转换为cpio格式
cpio   是一种标准工具，它用于创建软件档案文件和从文件档案中提取文件
       -i：copy-in模式 还原
       -d：还原时自动新建目录
       -v：显示还原过程
 
6.将当前目录恢复的cat文件移动到/bin/即可
[root@test1 ~]# cp bin/cat /bin
```

