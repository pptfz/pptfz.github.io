[toc]



# OpenVPN

[openVPN github地址](https://github.com/Nyr/openvpn-install)



**需求及使用场景**

> **公司的一些资源不想对外开放访问，例如gitlab、jenkins等等，现在想要的效果是部分资源只允许公司公网IP以及特定IP访问，这个时候就需要用到VPN了，但是公司花钱买VPN是不可能的，那么就需要一款免费好用的VPN，OpenVPN免费开源又好用，配置完OpenVPN后再加上云主机的安全组就完美解决问题了。**



# 一、安装OpenVPN

## 1.1 克隆项目

```sh
git clone https://github.com.cnpmjs.org/Nyr/openvpn-install.git
```



## 1.2 执行安装脚本

```shell
cd openvpn-install && sh openvpn-install.sh
```



**⚠️安装完成后再次执行脚本会提示如下**

```shell
OpenVPN is already installed.

Select an option:
	 # 添加新的客户端
   1) Add a new client
   
   # 移除已存在的客户端
   2) Revoke an existing client
   
   # 移除OpenVPN
   3) Remove OpenVPN
   
   # 退出
   4) Exit
Option: 
```



### 第一步、输入本机私网IP地址

```shell
Welcome to this OpenVPN road warrior installer!

Which IPv4 address should be used?
     1) 10.9.95.147
     2) 172.17.0.1
     3) 172.20.0.1
IPv4 address [1]: 1
```



### 第二步、输入本机公网IP

```shell
This server is behind NAT. What is the public IPv4 address or hostname?
Public IPv4 address / hostname [8.8.8.8]: 8.8.8.8
```



### 第三步、选择OpenVPN协议，推荐使用UDP

```shell
Which protocol should OpenVPN use?
   1) UDP (recommended)
   2) TCP
Protocol [1]: 1
```



### 第四步、输入OpenVPN监听的端口

```shell
What port should OpenVPN listen to?
Port [1194]:
```



### 第五步、为客户端选择一个DNS服务器

```shell
Select a DNS server for the clients:
   1) Current system resolvers
   2) Google
   3) 1.1.1.1
   4) OpenDNS
   5) Quad9
   6) AdGuard
DNS server [1]: 1
```



### 第六步、为第一个客户端输入一个名称

```shell
Enter a name for the first client:
Name [client]:
```



### 第七步、按任意键开始安装

```shell
OpenVPN installation is ready to begin.
Press any key to continue...
```



完整输出

```shell
OpenVPN installation is ready to begin.
Press any key to continue...
Loaded plugins: fastestmirror
Determining fastest mirrors
10gen                                                                                                                            | 1.2 kB  00:00:00     
base                                                                                                                             | 3.6 kB  00:00:00     
centosplus                                                                                                                       | 2.9 kB  00:00:00     
docker-ce-stable                                                                                                                 | 3.5 kB  00:00:00     
epel                                                                                                                             | 4.7 kB  00:00:00     
extras                                                                                                                           | 2.9 kB  00:00:00     
nginx-stable                                                                                                                     | 2.9 kB  00:00:00     
updates                                                                                                                          | 2.9 kB  00:00:00     
zabbix                                                                                                                           | 2.9 kB  00:00:00     
zabbix-non-supported                                                                                                             |  951 B  00:00:00     
(1/7): 10gen/primary                                                                                                             |  32 kB  00:00:00     
(2/7): extras/7/x86_64/primary_db                                                                                                | 222 kB  00:00:00     
(3/7): epel/x86_64/updateinfo                                                                                                    | 1.0 MB  00:00:00     
(4/7): centosplus/7/x86_64/primary_db                                                                                            | 1.6 MB  00:00:01     
(5/7): base/7/x86_64/primary_db                                                                                                  | 6.1 MB  00:00:01     
(6/7): updates/7/x86_64/primary_db                                                                                               | 3.7 MB  00:00:01     
(7/7): epel/x86_64/primary_db                                                                                                    | 6.9 MB  00:00:01     
10gen                                                                                                                                           279/279
Resolving Dependencies
--> Running transaction check
---> Package epel-release.noarch 0:7-13 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

========================================================================================================================================================
 Package                                  Arch                               Version                             Repository                        Size
========================================================================================================================================================
Installing:
 epel-release                             noarch                             7-13                                epel                              15 k

Transaction Summary
========================================================================================================================================================
Install  1 Package

Total download size: 15 k
Installed size: 25 k
Downloading packages:
epel-release-7-13.noarch.rpm                                                                                                     |  15 kB  00:00:00     
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : epel-release-7-13.noarch                                                                                                             1/1 
warning: /etc/yum.repos.d/epel.repo created as /etc/yum.repos.d/epel.repo.rpmnew
  Verifying  : epel-release-7-13.noarch                                                                                                             1/1 

Installed:
  epel-release.noarch 0:7-13                                                                                                                            

Complete!
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
Package 1:openssl-1.0.2k-19.el7.x86_64 already installed and latest version
Package 2:tar-1.26-35.el7.x86_64 already installed and latest version
Resolving Dependencies
--> Running transaction check
---> Package ca-certificates.noarch 0:2019.2.32-76.el7_7 will be updated
---> Package ca-certificates.noarch 0:2020.2.41-70.0.el7_8 will be an update
---> Package openvpn.x86_64 0:2.4.9-1.el7 will be installed
--> Processing Dependency: libpkcs11-helper.so.1()(64bit) for package: openvpn-2.4.9-1.el7.x86_64
--> Running transaction check
---> Package pkcs11-helper.x86_64 0:1.11-3.el7 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

========================================================================================================================================================
 Package                                 Arch                           Version                                      Repository                    Size
========================================================================================================================================================
Installing:
 openvpn                                 x86_64                         2.4.9-1.el7                                  epel                         524 k
Updating:
 ca-certificates                         noarch                         2020.2.41-70.0.el7_8                         base                         382 k
Installing for dependencies:
 pkcs11-helper                           x86_64                         1.11-3.el7                                   epel                          56 k

Transaction Summary
========================================================================================================================================================
Install  1 Package (+1 Dependent package)
Upgrade  1 Package

Total download size: 962 k
Downloading packages:
Delta RPMs disabled because /usr/bin/applydeltarpm not installed.
(1/3): ca-certificates-2020.2.41-70.0.el7_8.noarch.rpm                                                                           | 382 kB  00:00:00     
(2/3): pkcs11-helper-1.11-3.el7.x86_64.rpm                                                                                       |  56 kB  00:00:00     
(3/3): openvpn-2.4.9-1.el7.x86_64.rpm                                                                                            | 524 kB  00:00:00     
--------------------------------------------------------------------------------------------------------------------------------------------------------
Total                                                                                                                   3.4 MB/s | 962 kB  00:00:00     
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : pkcs11-helper-1.11-3.el7.x86_64                                                                                                      1/4 
  Installing : openvpn-2.4.9-1.el7.x86_64                                                                                                           2/4 
  Updating   : ca-certificates-2020.2.41-70.0.el7_8.noarch                                                                                          3/4 
  Cleanup    : ca-certificates-2019.2.32-76.el7_7.noarch                                                                                            4/4 
  Verifying  : ca-certificates-2020.2.41-70.0.el7_8.noarch                                                                                          1/4 
  Verifying  : openvpn-2.4.9-1.el7.x86_64                                                                                                           2/4 
  Verifying  : pkcs11-helper-1.11-3.el7.x86_64                                                                                                      3/4 
  Verifying  : ca-certificates-2019.2.32-76.el7_7.noarch                                                                                            4/4 

Installed:
  openvpn.x86_64 0:2.4.9-1.el7                                                                                                                          

Dependency Installed:
  pkcs11-helper.x86_64 0:1.11-3.el7                                                                                                                     

Updated:
  ca-certificates.noarch 0:2020.2.41-70.0.el7_8                                                                                                         

Complete!

init-pki complete; you may now create a CA or requests.
Your newly created PKI dir is: /etc/openvpn/server/easy-rsa/pki


Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating RSA private key, 2048 bit long modulus
....+++
...................................+++
e is 65537 (0x10001)

Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating a 2048 bit RSA private key
.................................................................+++
....+++
writing new private key to '/etc/openvpn/server/easy-rsa/pki/easy-rsa-2726385.U7ScUb/tmp.FTK8rI'
-----
Using configuration from /etc/openvpn/server/easy-rsa/pki/easy-rsa-2726385.U7ScUb/tmp.9FN60w
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'server'
Certificate is to be certified until Nov 28 02:24:33 2030 GMT (3650 days)

Write out database with 1 new entries
Data Base Updated

Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating a 2048 bit RSA private key
.....+++
........................................................................................+++
writing new private key to '/etc/openvpn/server/easy-rsa/pki/easy-rsa-2726473.aJtBJi/tmp.bmyQVL'
-----
Using configuration from /etc/openvpn/server/easy-rsa/pki/easy-rsa-2726473.aJtBJi/tmp.zwz1tQ
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'pptfz'
Certificate is to be certified until Nov 28 02:24:34 2030 GMT (3650 days)

Write out database with 1 new entries
Data Base Updated

Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Using configuration from /etc/openvpn/server/easy-rsa/pki/easy-rsa-2726540.Fvyapy/tmp.eJmfVQ

An updated CRL has been created.
CRL file: /etc/openvpn/server/easy-rsa/pki/crl.pem


Created symlink from /etc/systemd/system/multi-user.target.wants/openvpn-iptables.service to /etc/systemd/system/openvpn-iptables.service.
Created symlink from /etc/systemd/system/multi-user.target.wants/openvpn-server@server.service to /usr/lib/systemd/system/openvpn-server@.service.

Finished!

The client configuration is available in: /root/pptfz.ovpn
New clients can be added by running this script again.
```

**<span style=color:red>客户端文件是 `/root/pptfz.ovpn` ，在最后的输出中有提示，这里的客户端文件名称是自定义的，然后把这个文件下载到本地，后续配置VPN认证的时候需要用到这个客户端文件</span>**



## 1.3 查看OpenVPN相关信息

### 1.3.1 查看OpenVPN进程

**默认是以 `nobody` 用户运行，在 `/etc/openvpn/server/server.conf ` 中可以自定义**

```shell
$ ps aux|grep [o]penvpn
nobody   2726623  0.0  0.2  77168  4040 ?        Ss   10:24   0:00 /usr/sbin/openvpn --status /run/openvpn-server/status-server.log --status-version 2 --suppress-timestamps --config server.conf
```



### 1.3.2 OpenVPN默认监听 `udp 1194` 端口

```shell
$ netstat -nupl|grep 1194
udp        0      0 10.9.95.147:1194        0.0.0.0:*                           2726623/openvpn     
```



### 1.3.3 查看版本

```shell
$ openvpn --version
OpenVPN 2.4.9 x86_64-redhat-linux-gnu [Fedora EPEL patched] [SSL (OpenSSL)] [LZO] [LZ4] [EPOLL] [PKCS11] [MH/PKTINFO] [AEAD] built on Apr 24 2020
library versions: OpenSSL 1.0.2k-fips  26 Jan 2017, LZO 2.06
Originally developed by James Yonan
Copyright (C) 2002-2018 OpenVPN Inc <sales@openvpn.net>
Compile time defines: enable_async_push=no enable_comp_stub=no enable_crypto=yes enable_crypto_ofb_cfb=yes enable_debug=yes enable_def_auth=yes enable_dependency_tracking=no enable_dlopen=unknown enable_dlopen_self=unknown enable_dlopen_self_static=unknown enable_fast_install=yes enable_fragment=yes enable_iproute2=yes enable_libtool_lock=yes enable_lz4=yes enable_lzo=yes enable_management=yes enable_multihome=yes enable_pam_dlopen=no enable_pedantic=no enable_pf=yes enable_pkcs11=yes enable_plugin_auth_pam=yes enable_plugin_down_root=yes enable_plugins=yes enable_port_share=yes enable_selinux=yes enable_server=yes enable_shared=yes enable_shared_with_static_runtimes=no enable_small=no enable_static=yes enable_strict=no enable_strict_options=no enable_systemd=yes enable_werror=no enable_win32_dll=yes enable_x509_alt_username=yes with_aix_soname=aix with_crypto_library=openssl with_gnu_ld=yes with_mem_check=no with_sysroot=no
```



# 二、配置OnenVPN使用账号密码认证

## 2.1 编辑脚本

> **这个是现在公司线上用到的文件，目前没有找到出处，不知道为什么，总之就是利用一个存放用户名密码的自定义文件 `/etc/openvpn/psw-file` 来作为认证文件**

**编辑如下脚本，后续openvpn的配置文件 `/etc/openvpn/server/server.conf` 中会引用这个脚本**

**<span style=color:red>⚠️openvpn运行用户对于这个脚本至少有rx权限，否则认证会失败</span>**

```shell
cat >> /etc/openvpn/checkpsw.sh <<'EOF'
#!/bin/sh
###########################################################
# checkpsw.sh (C) 2004 Mathias Sundman <mathias@openvpn.se>
#
# This script will authenticate OpenVPN users against
# a plain text file. The passfile should simply contain
# one row per user with the username first followed by
# one or more space(s) or tab(s) and then the password.

PASSFILE="/etc/openvpn/psw-file"
LOG_FILE="/etc/openvpn/openvpn-password.log"
TIME_STAMP=`date "+%Y-%m-%d %T"`

###########################################################

if [ ! -r "${PASSFILE}" ]; then
  echo "${TIME_STAMP}: Could not open password file \"${PASSFILE}\" for reading." >> ${LOG_FILE}
  exit 1
fi

CORRECT_PASSWORD=`awk '!/^;/&&!/^#/&&$1=="'${username}'"{print $2;exit}' ${PASSFILE}`

if [ "${CORRECT_PASSWORD}" = "" ]; then 
  echo "${TIME_STAMP}: User does not exist: username=\"${username}\", password=\"${password}\"." >> ${LOG_FILE}
  exit 1
fi

if [ "${password}" = "${CORRECT_PASSWORD}" ]; then 
  echo "${TIME_STAMP}: Successful authentication: username=\"${username}\"." >> ${LOG_FILE}
  exit 0
fi

echo "${TIME_STAMP}: Incorrect password: username=\"${username}\", password=\"${password}\"." >> ${LOG_FILE}
exit 1
EOF
```



**赋予脚本执行权限**

```shell
chmod +x /etc/openvpn/checkpsw.sh
```



## 2.2 修改openvpn配置文件 `/etc/openvpn/server/server.conf`

### 2.2.1 追加以下内容

**其中 auth-user-pass-verify 对应的文件一定要与上一步创建的脚本名相同**

```shell
cat >> /etc/openvpn/server/server.conf <<EOF
auth-user-pass-verify /etc/openvpn/checkpsw.sh via-env
verify-client-cert
username-as-common-name
script-security 3
EOF
```



### 2.2.2 修改 server.conf

**删除开头的 local locao_ip**

```shell
local 10.9.95.147
```



## 2.3 重启服务

```shell
systemctl enable openvpn@server.service
systemctl restart openvpn-server@server
```



## 2.4 添加账号

**后续的账号都在这个文件 `/etc/openvpn/psw-file` 中添加，用户名和密码以空格隔开，每行一个**

```shell
# 用户名密码文件
cat > /etc/openvpn/psw-file << EOF
test test123
EOF

# 文件所有者一定要是openvpn运行的用户，这里openvpn默认运行用户为nobody
chown nobody.nobody /etc/openvpn/psw-file && chmod 600 /etc/openvpn/psw-file
```



## 2.5 修改客户端文件

**执行完一键安装脚本后会提示客户端文件位置**

```shell
The client configuration is available in: /root/pptfz.ovpn
New clients can be added by running this script again.
```



**客户端文件需要追加如下内容，开启用户名密码认证，然后下载到本地**

```shell
auth-user-pass
```



# 三、客户端安装配置

## 3.1 mac连接示例

这里以mac为例，我下载的是 `Tunnelblick` [Tunnelblick github地址](https://github.com/Tunnelblick/Tunnelblick)

安装完成后把客户端文件 `pptfz.ovpn(文件名是自定义的)` 拖入到 `Tunnelblick`



选择安装的用户

![iShot2020-11-30 20.20.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-11-30 20.20.36.png)



输入本机密码

![iShot2020-11-30 20.21.56](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-11-30 20.21.56.png)



输入完成后会提示如下

![iShot2020-11-30 20.22.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-11-30 20.22.21.png)





找到相应图标，点击要连接的VPN

![iShot2020-12-01 11.43.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 11.43.18.png)





输入用户名和密码

![iShot2020-12-01 11.44.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 11.44.37.png)



连接成功

![iShot2020-12-01 14.16.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 14.16.11.png)



## 3.2 windows连接示例

[下载windows版安装包](https://openvpn.net/downloads/openvpn-connect-v3-windows.msi)

windows安装就是一路下一步



导入客户端文件

![iShot2020-12-01 15.00.29](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 15.00.29.png)



输入用户名和密码

![iShot2020-12-01 15.11.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 15.11.36.png)



连接成功

![iShot2020-12-01 15.12.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-12-01 15.12.14.png)



# 四、云主机安全组配置说明

**使用示例**

**假设公司代码库gitlab部署在云主机中，现在只允许公司IP和openvpn IP访问**

**则只需要在安全组中加入以下两条规则即可**

> **1.允许公司IP访问**
>
> **2.允许OpenVPN所在机器公网IP访问**

