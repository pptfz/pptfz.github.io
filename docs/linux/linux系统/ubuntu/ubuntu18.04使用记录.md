[toc]



#  ubuntu18.04使用记录

## 1.设置静态IP

```python
//编辑文件
root@ubuntu18:~# cat /etc/netplan/01-network-manager-all.yaml
# Let NetworkManager manage all devices on this system
network:
    ethernets:
       enp0s5:		#⚠️这里要看一下网卡的名称
           dhcp4: false
           addresses: [10.0.0.15/24]
           gateway4: 10.0.0.1
           nameservers:
                 addresses: [223.5.5.5,114.114.114.114]
    version: 2
    renderer: networkd
      
//使设置生效
netplan apply
```



## 2.开启ssh服务

```python
//ubuntu-18.04desktpo版默认只安装ssh-agent
sudo apt -y install openssh-server

//启动服务
sudo service ssh start
```



## 3.安装python3.6

```python
//ubuntu18.04默认python版本是3.7
root@ubuntu18:~# python3
Python 3.7.5rc1 (default, Oct  8 2019, 16:47:45) 
[GCC 9.2.1 20191008] on linux
Type "help", "copyright", "credits" or "license" for more information.

root@ubuntu18:~# python3.7
Python 3.7.5rc1 (default, Oct  8 2019, 16:47:45) 
[GCC 9.2.1 20191008] on linux
Type "help", "copyright", "credits" or "license" for more information.


//安装依赖包
apt -y install python3-dev libffi-dev libssl-dev zlib*

//源码编译安装python3.6
./configure --enable-optimizations --prefix=/usr/local/python36
make
make altinstall		#防止覆盖原来的版本

//设置环境变量
echo "PATH=/usr/local/python36/bin:$PATH" >/etc/profile.d/python36.sh && source /etc/

//设置pip国内源
mkdir /root/.pip
cat >/root/.pip/pip.conf <<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
EOF
```

[ubuntu安装python3.6问题](https://stackoverflow.com/questions/41489439/pip3-installs-inside-virtual-environment-with-python3-6-failing-due-to-ssl-modul)



## 4.更换国内源(ubuntu18.04)

```python
//备份原有文件
cp /etc/apt/sources.list{,.bak}

//设置为阿里云源
cat >/etc/apt/sources.list<EOF
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
EOF

//更新
apt update
```

