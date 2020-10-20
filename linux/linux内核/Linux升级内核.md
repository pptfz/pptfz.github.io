## Linux升级内核

**CentOS7.6默认内核版本是3.10**

```shell
$ uname -r
3.10.0-1062.el7.x86_64
```



[CentOS7内核下载地址](https://elrepo.org/linux/kernel/el7/x86_64/RPMS/)

**可根据自己实际需求下载对应版本**

![iShot2020-09-21 14.29.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-09-21 14.29.15.png)



**现在升级到最新版，编辑安装最新内核脚本**

```shell
cat > /opt/kernel_update.sh <<EOF
#1.下载包
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org && 
rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm

#2.默认安装为最新内核
yum -y install --enablerepo=elrepo-kernel kernel-ml

#3.修改内核顺序
grub2-set-default 0 && grub2-mkconfig -o /etc/grub2.cfg

#4.使用下面命令看看确认下是否启动默认内核指向上面安装的内核
grubby --default-kernel
export kernel_version=`grubby --default-kernel|awk -F'-' '{print $2}'`
echo -e "\e[42m安装的内核版本是 $kernel_version\e[0m"

#5.重启机器生效
reboot
EOF
```

