[toc]



## 1.git初次使用

### 第一步、初次使用需要进行全局配置

操作命令

```shell
git config --global user.name "你的用户名"
git config --global user.email "邮箱"
```



### 第二步、git本地仓库初始化

:::tip说明

安装完git后，需要进入到存放代码的目录下，进行初始化(如果再次创建了一个目录，则需要重新初始化)

:::





初始化命令

```shell
git init
```

初始化完成后，会在当前路径下生成一个.git目录

```shell
ls -a
.	..	.git	.idea	test.py
```



### 第三步、提交代码至本地仓库

初始化git仓库完成后，需要将代码目录下的内容提交至本地仓库

```shell
git add .	#.表示匹配当前代码路径下所有内容	
```



### 第四步、告知本地仓库提交的内容信息

将代码路径下的内容提交至本地仓库后，需要告知提交至本地仓库的内容信息

```shell
git commit -m "提交的信息内容"
```



### 第五步、与远程仓库建立连接

将代码目录下的文件提交至本地仓库后，需要与远程仓库建立连接从而将本地仓库中的内容提交至远程仓库

```shell
git remote add origin 远程仓库地址
```



### 第六步、将本地代码仓库文件推送至远程仓库

与远程仓库建立连接后，需要将本地仓库中的文件推送至远程仓库

```sh
git push -u origin master			#输入远程仓库的用户名和密码即可
```





## 2.git非初次使用

### 第一步、提交代码至本地仓库

初始化git仓库完成后，需要将代码目录下的内容提交至本地仓库

```shell
# .表示匹配当前代码路径下所有内容		
git add .  					
```



### 第二步、告知本地仓库提交的内容信息

将代码路径下的内容提交至本地仓库后，需要告知提交至本地仓库的内容信息

```shell
git commit -m "提交的信息内容"
```



### 第三步、将本地代码仓库文件推送至远程仓库

与远程仓库建立连接后，需要将本地仓库中的文件推送至远程仓库

```shell
git push -u origin master			#输入远程仓库的用户名和密码即可
```





## 3.关于git拉取代码冲突问题

### 3.1 遵守原则

- **不删除远程仓库的代码**
- 如需删除代码，则只删除本地的





### 3.2 手贱删除远程仓库文件导致代码冲突恢复演示

#### 3.2.1 远程代码仓库中有以下内容，此时远程仓库和本地仓库中的内容相同

![iShot_2024-08-22_14.55.27](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.55.27.png)



![iShot_2024-08-22_14.56.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.56.18.png)



#### 3.2.2 手动删除远程仓库中的test文件，删除后内容为下

![iShot_2024-08-22_14.54.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.54.30.png)



#### 3.2.3 手动删除远程仓库文件后，远程仓库和本地仓库中的内容就不同了，此时再次新建文件提交就会有冲突

本地仓库中新建文件 `test111` ，尝试提交，报错

![iShot_2024-08-22_14.48.44](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.48.44.png)



#### 解决方法

##### 先拉取代码

```shell
git pull origin master
```

输入拉取代码的命令后会提示如下，意思为**请输入一条提交消息来解释为什么需要合并**，这里可以选择不输入

![iShot_2024-08-22_14.51.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.51.50.png)



##### 加选项 `--allow-unrelated-histories` (允许合并不相关的历史记录)再次拉取

```shell
git pull origin master --allow-unrelated-histories
```

![iShot_2024-08-22_14.53.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-22_14.53.30.png)



##### 再次提交代码即可，不会报错

**因为已经删除了远程仓库中的目录，因此本地的目录在提交之后也会被删除**

**因此，不要删除远程仓库中的文件！！！**

```shell
git push origin master
```



