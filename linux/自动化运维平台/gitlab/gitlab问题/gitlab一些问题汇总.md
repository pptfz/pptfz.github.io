[toc]



# gitlab一些问题汇总

## 1.关于gitlab7.12.0初始密码的问题

**背景：公司用的gitlab版本是7.12.0，自己在虚拟机中安装的时候发现找不到初始密码，各种百度总结出以下两点**

```python
1.必须执行以下授权命令，否则会报502，原因未知
chmod -R o+x /var/opt/gitlab/gitlab-rails

2.gitlab7.12.0初始密码
root
5iveL!fe
```



## 2.gitlab官网注册时遇到的问题

**注册gitlab时提示如下**

![iShot2020-10-14 15.36.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-14 15.36.33.png)



**原因**

- **上面的错误是因为注册时有一个google的验证码需要输入。但是中国无法访问google,因此无法访问并输入该验证码导致**



**解决方法**

- **翻墙或者通过下方的Github登陆**



## 3.yum安装gitlab最新版

```python
curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash

yum -y install gitlab-ce
```



## 4.修改gitlab默认80端口

⚠️**修改完gitlab默认的80端口后只需重启，不能重载配置文件，否则会还原**

```python
//修改gitlab默认80端口
vim /var/opt/gitlab/nginx/conf/gitlab-http.conf     

//重启即可，不能重载配置文件，否则会覆盖修改
gitlab-ctl restart	
```

