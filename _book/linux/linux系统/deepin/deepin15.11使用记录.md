# deepin15.11使用记录

[深度官方下载地址](https://www.deepin.org/download/)



[深度系统管理官方文档](https://wiki.deepin.org/wiki/Deepin%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86)



## 1.修改网卡名称为eth0

```python
1.备份文件
cp /etc/default/grub{,.bak}

2.修改/etc/default/grub
修改GRUB_CMDLINE_LINUX=""
修改为GRUB_CMDLINE_LINUX="net.ifnames=0 biosdevname=0"

3.更新grub
update-grub

重启系统
```



## 2.设置IP地址

```python
1.备份网卡配置文件
cp /etc/network/interfaces{,.bak}

#注释这行
#source-directory /etc/network/interfaces.d

#写入以下配置信息
auto eth0
iface eth0 inet static
address 10.0.0.18
netmask 255.255.255.0
gateway 10.0.0.1

2.重启网络服务
systemctl restart networking
```



## 3.安装ssh服务

```python
1.安装
apt -y install openssh-server

2.启动
systemctl start sshd

3.设置开机自启，需要自行创建/etc/rc.local文件，然后把要启动的服务命令写上(此方式适用于systemd管理的服务)
cat >/etc/rc.local <<EOF
#!/bin/bash
# rc.local config file created by use

systemctl start sshd

exit 0
EOF

chmod +x /etc/rc.local
```



检测包是否安装

```python
dpkg --list |grep 包名
```

