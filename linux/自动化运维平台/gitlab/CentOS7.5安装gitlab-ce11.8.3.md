# CentOS7.5安装gitlab-ce11.8.3

[gitlab官方安装文档](https://about.gitlab.com/install/)

[gitlab官方下载地址](https://packages.gitlab.com/gitlab/gitlab-ce)



# 一、系统环境

## 1.1系统版本

```python
[root@gitlab ~]# cat /etc/redhat-release 
CentOS Linux release 7.5.1804 (Core) 
```



## 1.2内存

```python
[root@gitlab ~]# free -m
              total        used        free      shared  buff/cache   available
Mem:           3934         107        3696          11         130        3625
Swap:          1023           0        1023
```



## 1.3IP

```python
[root@gitlab ~]# ip a s eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:60:5b:13 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.70/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe60:5b13/64 scope link 
       valid_lft forever preferred_lft forever
```



# 二、安装步骤

## 2.1安装依赖包

```python
//安装依赖包
[root@gitlab ~]# yum -y install curl openssh-server openssh-clients postfix cronie policycoreutils-python

//启动postfix
[root@gitlab ~]# systemctl start postfix && systemctl enable postfix 
```



## 2.2下载gitlab安装包并安装

```python
//从清华大学镜像源下载
[root@gitlab ~]# wget https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7/gitlab-ce-11.8.3-ce.0.el7.x86_64.rpm

//安装bitlab
[root@gitlab ~]# yum -y localinstall gitlab-ce-11.8.3-ce.0.el7.x86_64.rpm
```



## 2.3下载git

```python
[root@gitlab ~]# yum -y install git
```



## 2.4修改gitlab配置文件

```python
[root@gitlab ~]# vim /etc/gitlab/gitlab.rb
修改13行		xternal_url 'http://gitlab.example.com'
修改为本机IP地址
external_url 'http://10.0.0.70'

//说明
/opt/gitlab				        #gitlab的程序安装目录
/var/opt/gitlab				    #gitlab目录数据目录
/var/opt/gitlab/git-dfata		#存放仓库数据
```



## 2.5启动gitlab

```python
//启动gitlab
[root@gitlab ~]# gitlab-ctl start

//重载gitlab配置文件
[root@gitlab ~]# gitlab-ctl reconfigure

重载完成后会提示如下
Running handlers:
Running handlers complete
Chef Client finished, 473/1265 resources updated in 03 minutes 25 seconds
gitlab Reconfigured!

//gitlab启动的端口
[root@gitlab ~]# netstat -ntpl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:8060            0.0.0.0:*               LISTEN      3456/nginx: master  
tcp        0      0 127.0.0.1:9121          0.0.0.0:*               LISTEN      3901/redis_exporter 
tcp        0      0 127.0.0.1:9090          0.0.0.0:*               LISTEN      3913/prometheus     
tcp        0      0 127.0.0.1:9187          0.0.0.0:*               LISTEN      3960/postgres_expor 
tcp        0      0 127.0.0.1:9093          0.0.0.0:*               LISTEN      3946/alertmanager   
tcp        0      0 127.0.0.1:9100          0.0.0.0:*               LISTEN      3881/node_exporter  
tcp        0      0 127.0.0.1:9229          0.0.0.0:*               LISTEN      3858/gitlab-workhor         
tcp        0      0 127.0.0.1:9168          0.0.0.0:*               LISTEN      3891/puma 3.12.0 (t 
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      3360/unicorn master 
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3456/nginx: master  
tcp        0      0 127.0.0.1:8082          0.0.0.0:*               LISTEN      3397/sidekiq 5.2.5  
tcp        0      0 127.0.0.1:9236          0.0.0.0:*               LISTEN      3841/gitaly                      
tcp6       0      0 :::9094                 :::*                    LISTEN      3946/alertmanager   
tcp6       0      0 ::1:9168                :::*                    LISTEN      3891/puma 3.12.0 (t 

//gitlab相关命令
gitlab-ctl status		    #查看目前gitlab所有服务运维状态
gitlab-ctl stop			    #停止gitlab服务
gitlab-ctl stop nginx		#单独停止某个服务
gitlab-ctl tail			    #查看所有服务的日志
```



## 2.6gitlab汉化

```python
//下载最新汉化包
[root@gitlab ~]# git clone https://gitlab.com/xhang/gitlab.git

//下载gitlab对应版本汉化包，下载后是一个gitlab名称的目录
[root@gitlab ~]# git clone https://gitlab.com/xhang/gitlab.git -b v11.8.3-zh
[root@gitlab ~]# ls

//切换到汉化包目录，比较汉化标签和原标签，导出patch用的diff文件到/root下
[root@gitlab ~]# cd gitlab
[root@gitlab gitlab]# git diff v11.8.3 v11.8.3-zh > ../11.8.3-zh.diff 
[root@gitlab ~]# ls
11.8.3-zh.diff

//将11.8.3-zh.diff作为补丁更新到gitlab中
[root@gitlab ~]# yum -y install patch
[root@gitlab ~]# patch -d /opt/gitlab/embedded/service/gitlab-rails -p1 < 11.8.3-zh.diff

patch -d这一步可能会提示如下，这是因为补丁中有一些较新的文件，但是我们
安装的gitlab并没有这个文件存在，所以出现这个错误时，回车并且输入y跳过
就可以了
can't find file to patch at input line 5
Perhaps you used the wrong -p or --strip option?
The text leading up to this was:
--------------------------
|diff --git a/app/assets/javascripts/awards_handler.js b/app/assets/javascripts/awards_handler.js
|index 73ce3e7..132bd64 100644
|--- a/app/assets/javascripts/awards_handler.js
--------------------------

//重启gitlab并重载gitlab配置文件
[root@gitlab ~]# gitlab-ctl restart && gitlab-ctl reconfigure
```



## 2.7浏览器访问gitlab

**如果浏览器访问出现502  需要稍等一会  gitlab还没有完全启动**

**设置密码，最少8位数**

![cl111](CentOS7.5安装gitlab-ce11.8.3.assets/cl111.png)



**登陆gitlab，用户名为root，密码为自己设置的密码**

![cl222](CentOS7.5安装gitlab-ce11.8.3.assets/cl222.png)





**登陆后首界面，有一部分没有汉化，汉化包的原因**

![cl333](CentOS7.5安装gitlab-ce11.8.3.assets/cl333.png)



