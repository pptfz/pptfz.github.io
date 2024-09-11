[toc]



# showdoc安装

[showdoc github](https://github.com/star7th/showdoc)

[showdoc官网](https://www.showdoc.com.cn/)



## 1.使用docker安装

```sh
docker run -d --name showdoc --user=root --privileged=true -p 4999:80 \
-v /showdoc_data/html:/var/www/html/ star7th/showdoc
```



## 2.修改持久化目录权限

showdoc持久化目录直接777...，确定是php开发无疑了，虽然是docker运行的，有隔离环境，但是为什么要777呢？个人表示非常不习惯

![iShot_2024-09-04_14.35.15](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-04_14.35.15.png)



进入docker容器中，修改 `/var/www/html` 目录，修改目录权限为755，文件权限为644

```sh
find . -type d |xargs chmod 755
find . -type f|xargs chmod 644
```



## 3.访问

浏览器访问 `IP:4999`

选择语言

![iShot_2024-09-04_14.36.13](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-04_14.36.13.png)



管理员默认账户/密码是 `showdoc/123456`

![iShot_2024-09-04_14.37.38](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-04_14.37.38.png)



访问后提示如下，这是因为showdoc容器中php是以 `application` 用户运行的，而nginx是以`nginx`用户运行的

![iShot_2024-09-04_14.34.02](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-04_14.34.02.png)





![iShot_2024-09-04_14.38.34](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-04_14.38.34.png)



不知道作者为什么要这么设置，也可能是我工作经验太少，反正是个人遇到的生产中nginx+php项目，nginx和php都是以同一个用户运行的，挨个设置目录文件权限太麻烦，在容器中尝试修改php运行用户，但是始终提示不生效，于是就修改了nginx的运行用户，showdoc容器中nginx的配置文件是 `/opt/docker/etc/nginx/nginx.conf` ，修改完成后使用 `supervisorctl restart nginx:nginxd` 重启nginx(showdoc中各个服务使用supervisor进行管理)

:::tip

**如果宿主机没有 applicaiton 用户，则持久化目录的所有者可能会变成一个宿主机存在的用户，我这里就变成了 mysql 用户所有**

:::
