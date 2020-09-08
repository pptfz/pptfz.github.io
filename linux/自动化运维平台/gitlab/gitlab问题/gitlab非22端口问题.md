# gitlab非22端口问题

**背景说明：**

> **gitlab是docker启动的，ssh端口22映射到了宿主机的222端口，在添加远程仓库地址时写成了这样  `git remote add origin git@10.0.0.13:222/root/jenkins-test1.git`，已经把机器的共钥添加到了gitlab代码仓库中，但是推送代码的时候还是提示需要输入密码**



**原因：**

远程仓库地址不正确

错误地址：`git remote add origin git@10.0.0.13:222/root/jenkins-test1.git`

正确地址： `git remote add origin ssh://git@10.0.0.13:222/root/jenkins-test.git`



**遇到的一个问题**

> **只能先把仓库克隆下来然后再提交代码，直接提交代码会报错，原因未知**

1.删除之前添加的远程地址并重新添加

```shell
git remote rm origin
git remote add origin ssh://git@10.0.0.13:222/root/jenkins-test.git
```



2.提交代码，报错仓库不存在

```shell
#提交代码，报错仓库不存在
$ git push origin master
remote: 
remote: ========================================================================
remote: 
remote: The project you were looking for could not be found.
remote: 
remote: ========================================================================
remote: 
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```



**解决方法**

只能先把远程仓库克隆下来，然后再提交就可以了

```shell
#会提示添加了一个空存储库
$ git clone ssh://git@10.0.0.13:222/root/jenkins-test1.git
Cloning into 'jenkins-test1'...
warning: You appear to have cloned an empty repository.
```

