[toc]



# linux权限总结

# 一、linux普通权限

## 1.1 文件权限查看

```python
[root@exercise1 ~]# ll
-rw-r--r--. 1 root root  7570 Aug  4 13:15 install.log.syslog
drwxr-xr-x  9 root root  4096 Aug  8 12:07 test
```



## 1.2 用户分组权限概念

| -rw-r--r--   | 权限    | 含义                                       |
| ------------ | ------- | ------------------------------------------ |
| **第1位**    | **-**   | **表示文件类型，-表示普通文件，d表示目录** |
| **第2-4位**  | **rw-** | **表示文件所有者权限**                     |
| **第5-7位**  | **r--** | **表示文件所属组权限**                     |
| **第8-10位** | **r--** | **表示文件其他人权限**                     |



## 1.3 权限位含义

| 权限位 | 含义     |
| ------ | -------- |
| **r**  | **读**   |
| **w**  | **写**   |
| **x**  | **执行** |



## 1.4 权限位数字表示法

> **读+写+执行=4+2+1=7**

| 权限位 | 数字  | 含义     |
| ------ | ----- | -------- |
| **r**  | **4** | **读**   |
| **w**  | **2** | **写**   |
| **x**  | **1** | **执行** |



## 1.5 权限对文件及目录含义

### 1.5.1 文件rwx权限

| 权限位 | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| **r**  | **读取文件内容**                                             |
| **w**  | **修改文件内容 需要r权限配合只有w权限的时候 强制保存退出会导致源文件内容丢失** |
| **x**  | **表示是否执行 需要r权限配合**                               |



### 1.5.2 目录rwx权限

| 权限位 | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| **r**  | **查看目录内容  相当于ls  需要x权限配合**                    |
| **w**  | **是否能删除目录内容 是否能在目录中创建文件 重命名 目录中的文件** |
| **x**  | **是否能进入到目录   是否能查看目录中文件的属性**            |



# 二、linux特殊权限

## 2.1 suid

> **用户在运行命令的时候相当于root用户   **
>
> **设置方法   u+s**

**示例说明**

**1.普通用户 `www` 无法使用 `less` 命令查看系统日志 `/var/log/messages`**

![iShot2020-10-15 19.51.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.51.28.png)

**2.给 `/usr/bin/less` 设置 `suid`**

**设置 `suid` 后文件权限所有者处就变为 `rws` ，多了一个 `s` 权限，并且文件底色变成了红色**

![iShot2020-10-15 19.51.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.51.51.png)

**使用命令 `stat` 查看文件属性，此时文件权限位是 `4755`**

![iShot2020-10-15 19.52.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.52.16.png)

**3.为 `/usr/bin/less` 设置 `suid` 后 `www` 用户就可以查看系统日志了**





## 2.2 sgid

> **用户若对此目录具有r与x的权限时，该用户能够进入此目录**
>
> **用户在此目录下的有效用户组将会变成该目录的用户组**
>
> **若用户在此目录下具有w的权限，则用户创建新文件的用户组与此目录的用户组相同**
>
> **设置方法 g+s**

**示例说明**

**1.普通用户 `www` 对 `/tmp` 目录有 `777` 权限，在没有设置 `/tmp` 的 `sgid` 时，`www` 用户在此创建的文件和目录属组是本身，即 `www`**        

![iShot2020-10-15 19.52.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.52.44.png)

**2.为 `/tmp` 目录设置 `sgid` 后，`www` 用户在 `/tmp` 下创建的文件和目录属组就是 `root`**

![iShot2020-10-15 19.53.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.53.07.png)

## 2.3 sbit	sticky粘滞位

> 当一个用户对某目录是具有用户组或其他人的身份，并具有w权限(即具有写入的权限时)，这表明该用户可以对该目录下任何人新建的目录或文件进行删除、移动、重命名等操作。不过，如果该目录具有SBIT权限时，则仅有文件属主和root才能删除、移动、重命名此文件，普通用户无法删除该目录下不属于自己的文件  
>
> 设置方法 o+t

**示例说明**

**1.在没有设置 `sbit` 时，普通用户 `www` 可以删除 `/tmp` 下属主属组不是自己的文件和目录**

![iShot2020-10-15 19.53.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.53.45.png)



**2.设置 `sbit` 后，`www` 用户只能删除文件所有者是自己的文件**

**设置 `sbit` 后，文件权限其他人处变为了 `rwt`**

![iShot2020-10-15 19.54.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.54.06.png)



**使用命令 `stat` 查看 `/tmp` 权限，此时为 `1777`**

![iShot2020-10-15 19.54.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.54.39.png)

**此时， `www` 用户无法删除文件所有者不是自己的文件**

![iShot2020-10-15 19.55.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.55.00.png)



# 三、linux隐藏权限

## 3.1 权限位

- **a (append)           只能追加和查看，其他操作都无法执行**

- **i (immutable)        不可变，只能查看，其他操作都无法执行**

## 3.2 设置隐藏权限命令    chattr +增加   -取消

**为文件添加隐藏权限 `a` 后,可以看到，文件只能被追加和查看，其他操作无法执行**

![iShot2020-10-15 19.55.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.55.18.png)



**为文件添加隐藏权限 `i` 后，可以看到，文件只能被查看，其他操作无法执行**

![iShot2020-10-15 19.55.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.55.46.png)

## 3.3 查看隐藏权限	lsattr

![iShot2020-10-15 19.56.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.56.09.png)



# 四、FACL	Filesystem Acess

> **FACL是一种权限分配之外的普遍方式，例如，默认情况下你需要确认3个权限组，owner、group、other，而使用FACL，利用文件扩展属性保存额外的访问控制权限，你可以增加权限给其他用户或组，而不单只是简单的other或者是拥有者不存在的组别，可以允许指定的用户拥有写权限而不再是让他们整个组拥有写权限**

## 4.1 FACL格式

> [u|g]：[用户名|组名]：权限 文件
>
> 例如      u:hehe:rwx file	对于文件file，用户hehe有rwx权限

## 4.2 设置FACL	setfacl

| **选项** | **含义**                                          |
| -------- | ------------------------------------------------- |
| **-m**   | **设置FACL权限**                                  |
| **-x**   | **取消FACL权限**                                  |
| **-R**   | **递归设置，-R需要写在-m选项前边**                |
| **-b**   | **删除全部FACL权限**

**设置FACL示例**

**`/test` 目录权限为 `750` ，其他人没有任何权限，但是现在想让用户 `www` 拥有 `rw` 权限**

**1.没有设置FACL之前，`www` 用户无法进入 `/test` 目录，无法查看 `/test` 目录内容**

![iShot2020-10-15 19.56.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.56.27.png)

**2.为 `www` 用户设置 `/test` 的FACL**

`setfacl -m u:www:r-x /test`

![iShot2020-10-15 19.56.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.56.51.png)



**3.验证，设置FACL之后，只有 `www` 这一个用户对 `/test` 目录拥有 `rx` 权限，其他普通用户没有权限**

![iShot2020-10-15 19.57.08](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.57.08.png)



---

**取消FACL示例**

**取消FACL，-x选项，与设置FACL不同，取消的时候格式中不用再加权限**

![iShot2020-10-15 19.57.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.57.34.png)



## 4.3 查看FACL	getfacl

**没有设置FACL前**

![iShot2020-10-15 19.58.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.58.00.png)



**设置FACL后**

![iShot2020-10-15 19.58.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-15 19.58.22.png)

# test

