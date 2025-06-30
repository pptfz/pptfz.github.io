

[toc]

# CentOS7手动安装OpenVPN

[参考链接](http://www.zhangblog.com/2020/05/09/openvpn01/)

## 1.前期环境准备

### 1.1 实验环境

> OpenVPN软件版本 2.4.9

| 系统      | IP          | 公网IP  | 配置 | 内核                        |
| --------- | ----------- | ------- | ---- | --------------------------- |
| CentOS7.9 | 172.16.0.71 | 8.8.8.8 | 1c1g | 3.10.0-1160.11.1.el7.x86_64 |
| mac本机   | 10.0.18.249 | 9.9.9.9 | -    | -                           |



### 1.2 OpenVPN机器配置必要修改

#### 1.2.1 开启路由转发

```shell
# 不存在则配置路由转发
grep 'net.ipv4.ip_forward = 1' /etc/sysctl.conf || echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf

# 使配置生效
sysctl -p
```



#### 1.2.2 iptables配置

设置iptables规则

```shell
# 客户端连接vpn后，默认分配 10.8.0.0/24网段，需要进行nat设置
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

# 配置开机启动
echo 'iptables -t nat -A POSTROUTING -s 10.7.0.0/24 -o eth0 -j MASQUERADE' >> /etc/rc.d/rc.local 

# 给rc.local文件增加可执行权限，否则开机不会执行
chmod u+x /etc/rc.d/rc.local 
```



验证

```shell
# 验证
$ iptables -L -n -t nat
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
MASQUERADE  all  --  10.8.0.0/24          0.0.0.0/0        
```



删除上述iptables配置信息使用如下命令，可以对比正常和异常访问

```shell
iptables -t nat -D POSTROUTING 1
```



#### 1.2.3 系统时间与硬件时间同步

```shell
# 配置时间同步
$ crontab -l
*/10 * * * * /usr/sbin/ntpdate ntp1.aliyun.com >/dev/null 2>&1

# 系统使用上海时间
$ ll /etc/localtime
lrwxrwxrwx. 1 root root 35 Mar  7  2019 /etc/localtime -> ../usr/share/zoneinfo/Asia/Shanghai

# 查看硬件时间
$ hwclock --show 
Thu 27 May 2021 02:49:25 PM CST  -0.109431 seconds

# 系统时间同步到硬件时间
hwclock --systohc
```





## 2.安装过程

### 2.1 安装依赖包

```shell
yum -y install lz4-devel lzo-devel pam-devel openssl-devel systemd-devel sqlite-devel autoconf automake libtool libtool-ltdl
```



### 2.2 编译安装openvpn

[openvpn github地址](https://github.com/OpenVPN/openvpn)

[openvpn官网](https://openvpn.net/)

[openvpn官网源码包下载地址](https://openvpn.net/community-downloads/)

#### 2.2.1 下载源码包

```shell
wget https://github.com/OpenVPN/openvpn/archive/v2.4.9.tar.gz
```



#### 2.2.2 解压缩并进入源码目录

```shell
tar xf v2.4.9.tar.gz && cd openvpn-2.4.9
```



#### 2.2.3 开始编译安装

> `nproc` 命令可以直接获取系统核心数

```shell
# 生成configure文件
autoreconf -i -v -f

# 编译安装
./configure --prefix=/usr/local/openvpn --enable-lzo --enable-lz4 --enable-crypto --enable-server --enable-plugins --enable-port-share --enable-iproute2 --enable-pf --enable-plugin-auth-pam --enable-pam-dlopen --enable-systemd

make -j${nproc} && make install
```



#### 2.2.4 做一下openvpn命令的软连接

```shell
ln -s /usr/local/openvpn/sbin/openvpn /usr/local/sbin/openvpn
```



#### 2.2.5 查看openvpn版本

```shell
$ openvpn --version
OpenVPN 2.4.9 x86_64-unknown-linux-gnu [SSL (OpenSSL)] [LZO] [LZ4] [EPOLL] [MH/PKTINFO] [AEAD] built on Jul 20 2021
library versions: OpenSSL 1.0.2k-fips  26 Jan 2017, LZO 2.06
Originally developed by James Yonan
Copyright (C) 2002-2018 OpenVPN Inc <sales@openvpn.net>
Compile time defines: enable_async_push=no enable_comp_stub=no enable_crypto=yes enable_crypto_ofb_cfb=yes enable_debug=yes enable_def_auth=yes enable_dlopen=unknown enable_dlopen_self=unknown enable_dlopen_self_static=unknown enable_fast_install=yes enable_fragment=yes enable_iproute2=yes enable_libtool_lock=yes enable_lz4=yes enable_lzo=yes enable_management=yes enable_multihome=yes enable_pam_dlopen=yes enable_pedantic=no enable_pf=yes enable_pkcs11=no enable_plugin_auth_pam=yes enable_plugin_down_root=yes enable_plugins=yes enable_port_share=yes enable_selinux=no enable_server=yes enable_shared=yes enable_shared_with_static_runtimes=no enable_small=no enable_static=yes enable_strict=no enable_strict_options=no enable_systemd=yes enable_werror=no enable_win32_dll=yes enable_x509_alt_username=no with_crypto_library=openssl with_gnu_ld=yes with_mem_check=no with_sysroot=no
```



#### 2.2.6 修改启动配置文件

:::tip

**`/usr/local/openvpn/lib/systemd/system/` 在此目录下存放着openvpn的客户服务启动文件和openvpn的启动服务文件**

:::

```shell
编辑文件 /usr/local/openvpn/lib/systemd/system/openvpn-server@.service

修改
ExecStart=/usr/local/openvpn/sbin/openvpn --status %t/openvpn-server/status-%i.log --status-version 2 --suppress-timestamps --config %i.conf

修改为
ExecStart=/usr/local/openvpn/sbin/openvpn --config server.conf
```



使用如下命令修改

```shell
sed -i.bak '/^ExecStart/cExecStart=\/usr\/local\/openvpn\/sbin\/openvpn --config server.conf' /usr/local/openvpn/lib/systemd/system/openvpn-server@.service
```



#### 2.2.7 拷贝openvpn systemd文件

```shell
cp -a /usr/local/openvpn/lib/systemd/system/openvpn-server@.service /usr/lib/systemd/system/openvpn.service
```



### 2.3 生成证书

[easy-rsa github地址](https://github.com/OpenVPN/easy-rsa)

#### 2.3.1 下载 `easy-rsa` 工具

下载包

```shell
wget https://github.com/OpenVPN/easy-rsa/releases/download/v3.0.8/EasyRSA-3.0.8.tgz
```



解压缩

```shell
tar xf EasyRSA-3.0.8.tgz && cd EasyRSA-3.0.8/
```



#### 2.3.2 生成全局配置文件 `vars`

根据 `EasyRSA-3.0.8/vars.example` 文件生成全局配置文件 `vars`

```shell
# 新建一个专门存放easy-rsa相关文件的目录，以后所有生成证书等操作在这个目录下执行
mkdir -p /etc/openvpn/easy-rsa

# 拷贝EasyRSA-3.0.8下的部分文件到/etc/openvpn/easy-rsa/
cp -r easyrsa openssl-easyrsa.cnf x509-types /etc/openvpn/easy-rsa/

# 拷贝全局配置文件 vars
cp vars.example /etc/openvpn/easy-rsa/vars
```



向 `vars` 文件追加以下内容

```shell
cat >> /etc/openvpn/easy-rsa/vars << EOF
# 国家
set_var EASYRSA_REQ_COUNTRY     "CN"

# 省
set_var EASYRSA_REQ_PROVINCE    "BJ"

# 城市
set_var EASYRSA_REQ_CITY        "BeiJing"

# 组织
set_var EASYRSA_REQ_ORG         "test"

# 邮箱
set_var EASYRSA_REQ_EMAIL       "test@test.com"

# 拥有者
set_var EASYRSA_REQ_OU          "ZJ"

# 长度
set_var EASYRSA_KEY_SIZE        2048

# 算法
set_var EASYRSA_ALGO            rsa

# CA证书过期时间，单位天
set_var EASYRSA_CA_EXPIRE      36500

# 签发证书的有效期是多少天，单位天
set_var EASYRSA_CERT_EXPIRE    36500
EOF
```





#### 2.3.3 生成服务端证书和CA证书

:::tip

**`./easyrsa` 命令生成各类证书的时候，如果不想设置密码，只需要在最后添加参数 `nopass` 即可**

:::

##### 2.3.3.1 初始化

:::tip

**执行命令 `./easyrsa init-pki` 会生成 `pki` 目录，用于存储一些中间变量及最终生成的证书**

:::

```shell
# 切换目录
cd /etc/openvpn/easy-rsa

# 生成pki目录
$ ./easyrsa init-pki

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars

init-pki complete; you may now create a CA or requests.
Your newly created PKI dir is: /etc/openvpn/easy-rsa/pki
```



`pki` 目录内容如下

```shell
-rw------- 1 root root 4616 May 27 17:03 openssl-easyrsa.cnf
drwx------ 2 root root 4096 May 27 17:03 private
drwx------ 2 root root 4096 May 27 17:03 reqs
-rw------- 1 root root 4648 May 27 17:03 safessl-easyrsa.cnf
```



##### 2.3.3.2 创建CA根证书

:::tip

**如果不想给CA根证书设置密码，可以执行命令  `./easyrsa build-ca nopass`**

:::

```shell
$ ./easyrsa build-ca

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017

Enter New CA Key Passphrase: # 这里输入ca根证书的密码
Re-Enter New CA Key Passphrase: # 确认密码
Generating RSA private key, 2048 bit long modulus
.............+++
......................................................................................................+++
e is 65537 (0x10001)
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
# 这里输入common name通用名，我这里就直接输入openvpn
Common Name (eg: your user, host, or server name) [Easy-RSA CA]:openvpn

CA creation complete and you may now import and sign cert requests.
Your new CA certificate file for publishing is at:
/etc/openvpn/easy-rsa/pki/ca.crt
```



##### 2.3.3.3 生成服务端证书

:::tip

**为服务端生成证书对并在本地签名。nopass参数生成一个无密码的证书；在此过程中会让你确认ca密码**

:::

```shell
$ ./easyrsa build-server-full server nopass

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating a 2048 bit RSA private key
..+++
.......+++
writing new private key to '/etc/openvpn/easy-rsa/pki/easy-rsa-10492.BY7Hgo/tmp.W1d5Ju'
-----
Using configuration from /etc/openvpn/easy-rsa/pki/easy-rsa-10492.BY7Hgo/tmp.wO6HgM
Enter pass phrase for /etc/openvpn/easy-rsa/pki/private/ca.key: # 这里输入上一步创建ca根证书时设置的密码
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'server'
Certificate is to be certified until Jun 28 10:00:33 2121 GMT (36500 days)

Write out database with 1 new entries
Data Base Updated
```



##### 2.3.3.4 创建 `Diffie-Hellman`

:::tip

**确保key穿越不安全网络的操作，需要执行 `./easyrsa gen-dh`**

:::

```shell
$ ./easyrsa gen-dh

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating DH parameters, 2048 bit long safe prime, generator 2
This is going to take a long time
......................................................................................................+...................................................................+....................................++*++*
DH parameters of size 2048 created at /etc/openvpn/easy-rsa/pki/dh.pem
```



#### 2.3.4 生成客户端证书

##### 2.3.4.1 生成客户端证书

:::tip

**这里客户端证书名称为test**

:::

为客户端生成证书对并在本地签名。nopass参数生成一个无密码的证书；在此过程中都会让你确认ca密码

```shell
$ ./easyrsa build-client-full test

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Generating a 2048 bit RSA private key
...............................................................................+++
...........+++
writing new private key to '/etc/openvpn/easy-rsa/pki/easy-rsa-10608.RMC1Ry/tmp.0C7VzI'
Enter PEM pass phrase: # 输入客户端证书密码
Verifying - Enter PEM pass phrase: # 确认密码
-----
Using configuration from /etc/openvpn/easy-rsa/pki/easy-rsa-10608.RMC1Ry/tmp.vzknm6
Enter pass phrase for /etc/openvpn/easy-rsa/pki/private/ca.key: # 这里输入ca根证书的密码
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'test'
Certificate is to be certified until Jun 28 10:04:48 2121 GMT (36500 days)

Write out database with 1 new entries
Data Base Updated
```





##### 2.3.4.2 为了提高安全性，生成ta.key

:::tip

加强认证方式，防攻击。如果配置文件中启用此项(默认是启用的)，就需要执行以下命令，并把ta.key放到 `/etc/openvpn/server` 目录。配置文件中服务端第二个参数为0，同时客户端也要有此文件，且 `client.conf` 中此指令的第二个参数需要为1。服务端有该配置，那么客户端也必须要有

:::

```shell
openvpn --genkey --secret ta.key
```



#### 2.3.5 整理服务端证书

```shell
mkdir -p /etc/openvpn/server
cp pki/ca.crt /etc/openvpn/server
cp pki/private/server.key /etc/openvpn/server
cp pki/issued/server.crt /etc/openvpn/server
cp pki/dh.pem /etc/openvpn/server
cp ta.key /etc/openvpn/server
```



### 2.4 创建服务端配置文件

`server.conf` 示例文件在 openvon源码目录下的 `openvpn-2.4.9/sample/sample-config-files/server.conf` 



直接创建 `server.conf` 文件

:::tip

**一定要添加openvpn服务器私有地址，注意掩码 `push "route 10.0.10.0 255.255.255.0"`**

**要在配置文件中添加 `crl-verify /etc/openvpn/easy-rsa/pki/crl.pem` 参数，`/etc/openvpn/easy-rsa/pki/crl.pem` 是在进行删除vpn用户时执行命令 `./easyrsa gen-crl` 所产生的文件，这个 `crl.pem` 文件是用于管控被删除用户无法连接vpn**

:::

```shell
cat > /etc/openvpn/server/server.conf <<EOF
local 0.0.0.0
port 1194
proto tcp
dev tun
ca /etc/openvpn/server/ca.crt
cert /etc/openvpn/server/server.crt
key /etc/openvpn/server/server.key
dh /etc/openvpn/server/dh.pem
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt
push "route 172.16.0.0 255.255.255.0"
push "dhcp-option DNS 223.5.5.5"
client-to-client
;duplicate-cn
keepalive 10 120
tls-auth /etc/openvpn/server/ta.key 0
cipher AES-256-CBC
compress lz4-v2
push "compress lz4-v2"
;comp-lzo
max-clients 1000
user nobody
group nobody
persist-key
persist-tun
status openvpn-status.log
log  /var/log/openvpn.log
verb 3
;explicit-exit-notify 1
crl-verify /etc/openvpn/easy-rsa/pki/crl.pem
EOF
```



执行删除vpn账户的步骤记录，在执行 `./easyrsa revoke 用户名` 删除用户后会提示 `Revocation was successful. You must run gen-crl and upload a CRL to your infrastructure in order to prevent the revoked cert from being accepted.` 这样一段话，按照提示执行 `./easyrsa gen-crl` 后会提示 `crl.pem` 文件所在位置 `CRL file: /etc/openvpn/easy-rsa/pki/crl.pem` ，因此需要在 `server.conf` 中添加 `crl-verify /etc/openvpn/easy-rsa/pki/crl.pem` 一行参数，避免在服务端删除用户后用户还能登陆的情况

```shell
./easyrsa revoke nima

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017


Please confirm you wish to revoke the certificate with the following subject:

subject= 
    commonName                = nima


Type the word 'yes' to continue, or any other input to abort.
  Continue with revocation: yes
Using configuration from /etc/openvpn/easy-rsa/pki/easy-rsa-28838.yiflJs/tmp.lFsJfm
Enter pass phrase for /etc/openvpn/easy-rsa/pki/private/ca.key:
Revoking Certificate 8AB483C2DC76BC3D0E016323D4BF86A9.
Data Base Updated

IMPORTANT!!!

Revocation was successful. You must run gen-crl and upload a CRL to your
infrastructure in order to prevent the revoked cert from being accepted.


$ ./easyrsa gen-crl

Note: using Easy-RSA configuration from: /etc/openvpn/easy-rsa/vars
Using SSL: openssl OpenSSL 1.0.2k-fips  26 Jan 2017
Using configuration from /etc/openvpn/easy-rsa/pki/easy-rsa-28926.C3C2l3/tmp.A4N3ul
Enter pass phrase for /etc/openvpn/easy-rsa/pki/private/ca.key:

An updated CRL has been created.
CRL file: /etc/openvpn/easy-rsa/pki/crl.pem
```



`server.conf` 详细配置说明

```shell
# 表示openvpn服务端的监听地址
local 0.0.0.0

# 监听的端口，默认是1194
port 1194

# 使用的协议，有udp和tcp。建议选择tcp
proto tcp

# 使用三层路由IP隧道(tun)还是二层以太网隧道(tap)。一般都使用tun
dev tun

# ca证书、服务端证书、服务端密钥和密钥交换文件。如果它们和server.conf在同一个目录下则可以不写绝对路径，否则需要写绝对路径调用
ca ca.crt
cert server.crt
key server.key
dh dh2048.pem

# vpn服务端为自己和客户端分配IP的地址池。
# 服务端自己获取网段的第一个地址(此处为10.8.0.1)，后为客户端分配其他的可用地址。以后客户端就可以和10.8.0.1进行通信。
# 注意：该网段地址池不要和已有网段冲突或重复。其实一般来说是不用改的。除非当前内网使用了10.8.0.0/24的网段。
server 10.8.0.0 255.255.255.0

# 使用一个文件记录已分配虚拟IP的客户端和虚拟IP的对应关系，以后openvpn重启时，将可以按照此文件继续为对应的客户端分配此前相同的IP。也就是自动续借IP的意思。
ifconfig-pool-persist ipp.txt

# 使用tap模式的时候考虑此选项。
server-bridge XXXXXX

# vpn服务端向客户端推送vpn服务端内网网段的路由配置，以便让客户端能够找到服务端内网。多条路由就写多个push指令
push "route 10.0.10.0 255.255.255.0"
push "route 192.168.10.0 255.255.255.0"
push "route 10.206.0.0 255.255.240.0"

# 配置客户端获取的dns
push "dhcp-option DNS 223.5.5.5"

# 让vpn客户端之间可以互相看见对方，即能互相通信。默认情况客户端只能看到服务端一个人；默认是注释的，不能客户端之间相互看见
client-to-client

# 允许多个客户端使用同一个VPN帐号连接服务端，默认是注释的，不支持多个客户登录一个账号
duplicate-cn

# 每10秒ping一次，120秒后没收到ping就说明对方挂了
keepalive 10 120

# 加强认证方式，防攻击。如果配置文件中启用此项(默认是启用的)需要执行openvpn --genkey --secret ta.key，并把ta.key放到/etc/openvpn/server录，服务端第二个参数为0；同时客户端也要有此文件，且client.conf中此指令的第二个参数需要为1
tls-auth ta.key 0

# 选择一个密码。如果在服务器上使用了cipher选项，那么您也必须在这里指定它。注意，v2.4客户端/服务器将在TLS模式下自动协商AES-256-GCM。
cipher AES-256-CBC

# openvpn 2.4版本的vpn才能设置此选项。表示服务端启用lz4的压缩功能，传输数据给客户端时会压缩数据包。Push后在客户端也配置启用lz4的压缩功能，向服务端发数据时也会压缩。如果是2.4版本以下的老版本，则使用用comp-lzo指令
compress lz4-v2
push "compress lz4-v2"

# 启用lzo数据压缩格式。此指令用于低于2.4版本的老版本。且如果服务端配置了该指令，客户端也必须要配置
comp-lzo

# 并发客户端的连接数
max-clients 100

# 通过ping得知超时时，当重启vpn后将使用同一个密钥文件以及保持tun连接状态
persist-key
persist-tun

# 在文件中输出当前的连接信息，每分钟截断并重写一次该文件
status openvpn-status.log

# 默认vpn的日志会记录到rsyslog中，使用这两个选项可以改变。log指令表示每次启动vpn时覆盖式记录到指定日志文件中，log-append则表示每次启动vpn时追加式的记录到指定日志中。但两者只能选其一，或者不选时记录到rsyslog中
;log openvpn.log
;log-append openvpn.log

# 日志记录的详细级别。
verb 3

# 沉默的重复信息。最多20条相同消息类别的连续消息将输出到日志。
;mute 20

# 当服务器重新启动时，通知客户端，以便它可以自动重新连接。仅在UDP协议是可用
explicit-exit-notify 1
EOF
```



### 2.5 创建客户端配置文件

编辑 `/etc/openvpn/client/client.ovpn`

```shell
mkdir /etc/openvpn/client
cat > /etc/openvpn/client/client.ovpn <<EOF
client
dev tun   
proto tcp                                       #和server端一致(可以使用udp比tcp快)
remote 8.8.8.8 1194                      #指定服务端IP和端口
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
ca ca.crt                                        #ca证书
cert client.crt                                  #客户端证书
key client.key                                   #客户端密钥
tls-auth ta.key 1                                #ta密钥
cipher AES-256-CBC
verb 3  
EOF
```



`client.ovpn` 配置文件详细说明

```shell
# 标识这是个客户端
client

# 使用三层路由IP隧道(tun)还是二层以太网隧道(tap)。服务端是什么客户端就是什么
dev tun

# 使用的协议，有udp和tcp。服务端是什么客户端就是什么
proto tcp

# 服务端的地址和端口
remote 8.8.8.8 1194

# 一直尝试解析OpenVPN服务器的主机名。在机器上非常有用，不是永久连接到互联网，如笔记本电脑。
resolv-retry infinite

# 大多数客户机不需要绑定到特定的本地端口号。
nobind

# 初始化后的降级特权(仅非windows)
;user nobody
;group nobody

# 尝试在重新启动时保留某些状态。
persist-key
persist-tun

# ca证书、客户端证书、客户端密钥，如果它们和client.conf或client.ovpn在同一个目录下则可以不写绝对路径，否则需要写绝对路径调用
ca ca.crt
cert client.crt
key client.key

# 通过检查certicate是否具有正确的密钥使用设置来验证服务器证书。
remote-cert-tls server

# 加强认证方式，防攻击。服务端有配置，则客户端必须有
tls-auth ta.key 1

# 选择一个密码。如果在服务器上使用了cipher选项，那么您也必须在这里指定它。注意，v2.4客户端/服务器将在TLS模式下自动协商AES-256-GCM。
cipher AES-256-CBC

# 服务端用的什么，客户端就用的什么，表示客户端启用lz4的压缩功能，传输数据给客户端时会压缩数据包。
compress lz4-v2

# 日志级别
verb 3

# 沉默的重复信息。最多20条相同消息类别的连续消息将输出到日志。
;mute 20
```



### 2.6 启动openvpn

```shell
systemctl enable openvpn && systemctl start openvpn
```



### 2.7 下载配置文件

有3个文件是固定的，其中 `ca.crt`、`ta.key` 是服务端根证书，`client.ovpn(文件名可任意修改)` 是客户端文件，这3个文件是固定的

再加上执行命令 `./easyrsa build-client-full 用户名` 生成的 `用户名.crt` 和 `用户名.key` 一共5个文件 ，把这5个文件+密码给到用户即可

> `ca.crt`、`ta.key`、`client.ovpn`

```shell
# 服务端根证书
/etc/openvpn/server/ca.crt
/etc/openvpn/server/ta.key

# 客户端文件
/etc/openvpn/client/client.ovpn
```



在 `client.ovpn` 文件中，注意修改客户端证书和密钥的名称

```shell
cert xxx.crt                                  # 客户端证书
key xxx.key                                   # 客户端密钥
```





### 2.8 连接测试



连接成功后，就会在本机生成一个 `utun1` 的虚拟网卡，并获取openvpn `server.conf` 中设置的  `server 10.8.0.0 255.255.255.0` 给客户端分配的网段，IP地址从 10.8.0.2 开始分配

```
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1500
	inet 10.8.0.2 --> 10.8.0.2 netmask 0xffffff00 
```



此时mac本机是能与服务器内网相互ping通的

> mac本机ping服务器内网

```shell
$ ping -c2 172.16.0.71
PING 172.16.0.71 (172.16.0.71): 56 data bytes
64 bytes from 172.16.0.71: icmp_seq=0 ttl=64 time=10.523 ms
64 bytes from 172.16.0.71: icmp_seq=1 ttl=64 time=6.925 ms

--- 172.16.0.71 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 6.925/8.724/10.523/1.799 ms

```



> 服务器ping mac本机

```shell
$ ping -c2 10.8.0.6
PING 10.8.0.6 (10.8.0.6) 56(84) bytes of data.
64 bytes from 10.8.0.6: icmp_seq=1 ttl=64 time=59.1 ms
64 bytes from 10.8.0.6: icmp_seq=2 ttl=64 time=47.0 ms

--- 10.8.0.6 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 47.014/53.081/59.148/6.067 ms
```



### 2.9 开通、删除vpn步骤

#### 2.9.1 开通vpn账户

> 这里以给小明开通vpn为例

执行这个步骤会提示输入3次密码，前2次是用户个人密码，最后一次是ca根证书密码

```shell
./easyrsa build-client-full xiaoming
```



下载用户个人证书文件

```shell
# 只需要下载 crt 和 key 文件即可
find / -name "xiaoming*"
```



#### 2.9.2 删除vpn账户

执行这个步骤需要输入ca根证书密码

```shell
./easyrsa revoke xiaoming
```



执行 `gen-crl` 命令

```shell
./easyrsa gen-crl
```



重启openvpn

```shell
systemctl restart openvpn
```



#### 2.10 扩展：openvpn配置用户获取固定IP地址

编辑openvpn配置文件 `server.conf` ，增加 `ifconfig-pool-persist` 参数

```shell
ifconfig-pool-persist /etc/openvpn/server/fixed_ip
```



编辑 `/etc/openvpn/server/fixed_ip` 文件，用户名和IP以逗号分隔

```shell
test,10.8.0.250
```



编辑完成后重启openvpn

```shell
systemctl restart openvpn
```



验证

```shell
$ ifconfig
utun2: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1500
	inet 10.8.0.250 --> 10.8.0.249 netmask 0xffffffff 
```

