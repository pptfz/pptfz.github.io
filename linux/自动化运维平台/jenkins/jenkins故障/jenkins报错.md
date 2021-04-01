## 一、jenkins报错 `Unable to create the home directory. This is most likely a permission problem`

浏览器中访问 jenkins 报错如下

![iShot2021-03-19 08.59.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-19 08.59.55.png)



> 生产中我们的jenkins是以war包形式放在tomcat的 `webapps`目录下启动的，tomcat设置的端口为8080



浏览器中报错如图后，登陆服务器查看，tomcat进程、监听的8080端口都是存在的，但是还是报错如图所示，尝试重启tomcat问题没有解决，但是有一个很奇怪的问题，当执行 `./bin/shutdown.sh` 停止tomcat后，8080端口进程依然存在

参考[stackoverflow文章](https://stackoverflow.com/questions/54670362/unable-to-create-the-home-directory-this-is-most-likely-a-permission-problem)，文章中也有人提到了需要设置jenkins家目录 `JENKINS_HOME` 变量，并且设置目录所有者为jenkins用户，这里我们的jenkins家目录设置的是 `/root/.jenkins`，是在 `/etc/profile` 中设置为 `export JENKINS_HOME="/root/.jenkins"`，并且 `/root/.jenkins` 目录所有者就是jenkins用户，也没有改动，查看日志也没有找到有用的信息

尝试重启tomcat无效后，最终解决方法是直接kill掉8080端口对应的进程，然后执行 `./bin/startup.sh` 启动tomcat，浏览器刷新等待jenkins重启完毕就可以了









## 二、jenkins报错 `Jenkins detected that you appear to be running more than one instance of Jenkins that share the same home directory`

```
Error
Jenkins detected that you appear to be running more than one instance of Jenkins that share the same home directory '/root/.jenkins’. This greatly confuses Jenkins and you will likely experience strange behaviors, so please correct the situation.

This Jenkins:	158454546 contextPath="" at 1541@localhost
Other Jenkins:	1455232034 contextPath="/jenkins20190612" at 1541@localhost
```

![iShot2021-03-19 11.56.19](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-03-19 11.56.19.png)



jenkins出现 `Unable to create the home directory. This is most likely a permission problem` 问题后，kill掉进程后重启，运行一段时间后报错如图，[参考网上文章](https://my.oschina.net/xueyi28/blog/1541704)是jenkins启动之后会在jenkins home目录(`$JENKINS_HOME`)下生成一个".owner"文件，里面标识了本次jenkins实例的唯一标识，把这个文件删除就可以了

