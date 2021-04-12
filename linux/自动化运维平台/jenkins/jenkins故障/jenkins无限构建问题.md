# jenkins无限构建问题

[参考链接](https://blog.csdn.net/u010264186/article/details/114358316)

**问题说明**

> **jenkins在配置完任务后点击build之后，发现任务列表中自动添加了第二个任务，然后就是第三个、第四个、第五个。。。无限循环**

![iShot2021-04-08 14.30.33](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-04-08 14.30.33.png)



**问题**

> 在 console 输出中，可以看到有2个 `git rev-parse`，jenkins在pull代码的时候，发现了两个符合要求的分支，因此自动创建了另一个任务来pull另一个符合要求的任务



在项目git地址配置中我写的是 `*/test`，而git仓库中有`test`和`origin/test`两个分支

![iShot2021-04-08 14.36.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-04-08 14.36.18.png)





![iShot2021-04-08 14.34.08](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-04-08 14.34.08.png)



至此，可以确认原因，就是我们在配置项目时，指定的分支，jenkins在git地址中找到了符合要求的多个分支，多余的分支，会自动创建一个新的任务去运行，运行的时候，又识别到了2个分支，又创建了新的分支，进入死循环

