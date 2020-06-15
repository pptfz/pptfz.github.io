# CentOS8使用记录



centos8的作者应该很喜欢腾讯的[地下城与勇士(dnf)](https://dnf.qq.com/main.shtml)，否则踏🐎怎么会把安装命令yum尼玛改成dnf ？？？



## 1.更换yum源

```python
1.备份
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

2.下载阿里云yum源
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-8.repo
或
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-8.repo

3.生成缓存
dnf clean all
dnf makecache

4.安装epol源
yum install -y https://mirrors.aliyun.com/epel/epel-release-latest-8.noarch.rpm

sed -i 's|^#baseurl=https://download.fedoraproject.org/pub|baseurl=https://mirrors.aliyun.com|' /etc/yum.repos.d/epel*
sed -i 's|^metalink|#metalink|' /etc/yum.repos.d/epel*
```



## 2.同步时间

centos8不支持ntpdate了，改用chrony

```python
1.安装
dnf -y install chrony

2.修改配置文件/etc/chrony.conf，注释pool开头一行，新增阿里云地址
#pool 2.centos.pool.ntp.org iburst
server ntp.aliyun.com iburst

sed -i.bak '3s/^/#&/g' /etc/chrony.conf && sed -i '4cserver ntp.aliyun.com iburst' /etc/chrony.conf


server：指明时间服务器地址；
allow NETADD/NETMASK
allow all：允许所有客户端主机；
deny NETADDR/NETMASK
deny all：拒绝所有客户端；
bindcmdaddress：命令管理接口监听的地址；
local stratum 10：即使自己未能通过网络时间服务器同步到时间，也允许将本地时间作为标准时间授时给其它客户端；

3.启动服务
systemctl enable chronyd && systemctl start chronyd

4.检查端口  chronyd服务监听udp32端口
netstat -nupl|grep chronyd

5.验证同步
chronyc sources
210 Number of sources = 1
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^* 203.107.6.88                  2   6    17    44  -2379us[-3100us] +/-   43ms


个人实际使用，这个chrony不好用，绝对没有ntpdate好用，我手动更改了时间，尼玛5分钟了还没有同步，垃圾
还是直接使用命令来的快
chronyd -q "server ntp.aliyun.com iburst"
```



centos8继续使用ntpdate

```python
1.添加wlnmp源
rpm -ivh http://mirrors.wlnmp.com/centos/wlnmp-release-centos.noarch.rpm
  
2.安装ntp服务
dnf -y install wntp

3.时间同步
ntpdate ntp.aliyun.com
```



## 3.centos8网络服务

centos8使用的是NetworkManager管理网络，不能使用systemctld管理network

```python
systemctl enable NetworkManager

nmcli c reload eth0
```

