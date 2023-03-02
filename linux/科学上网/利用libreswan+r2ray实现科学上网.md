# 利用libreswan+V2Ray实现科学上网

# 实验背景

在云主机中(阿里云、腾讯云等)，大陆地区的机器是无法科学上网的，并且好多优秀的网站、工具等无法访问或者下载速度很慢，例如下载github上的一些资源，我们可以购买VPS(例如[Vultr](https://www.itblogcn.com/vultr))或者香港等地区的主机，再配合一些软件就可以实现科学上网了

我们可以使用 [libreswan](https://github.com/libreswan/libreswan/) 搭建 `ipssec` 隧道实现不通地域主机内网互通，然后使用 `V2Ray` 作为代理工具实现科学上网



[libreswan官网](https://libreswan.org/)

[libreswan github](https://github.com/libreswan/libreswan/)

[libreswan官方文档](https://libreswan.org/wiki)



# 实验环境

| 区域 | 公网IP         | 内网IP段      | 内网IP     | 系统      | 内核版本                    |
| ---- | -------------- | ------------- | ---------- | --------- | --------------------------- |
| 北京 | 81.70.22.232   | 172.31.0.0/24 | 172.31.0.3 | CentOS7.9 | 3.10.0-1160.45.1.el7.x86_64 |
| 香港 | 129.226.167.89 | 10.0.0.0/24   | 10.0.0.17  | CentOS7.9 | 3.10.0-1160.45.1.el7.x86_64 |

 

# 1.安装配置libreswan

## 1.0 编辑环境变量文件

北京、香港区服务器操做

```shell
# 编辑文件
cat > /opt/wall_env << EOF
BJ_PUBLIC_IP=81.70.22.232
BJ_PRIVATE_IP=172.31.0.3
BJ_IP_SUBNET=172.31.0.0/24
HK_PUBLIC_IP=129.226.167.89
HK_PRIVATE_IP=10.0.0.17
HK_IP_SUBNET=10.0.0.0/24
EOF

# 加载环境变量
source /opt/wall_env
```



## 1.1 安装依赖包

北京、香港区服务器操做

```shell
yum -y install audit-libs-devel bison curl-devel fipscheck-devel flex gcc ldns-devel libcap-ng-devel libevent-devel libseccomp-devel libselinux-devel make nspr-devel nss-devel pam-devel pkgconfig systemd-devel unbound-devel xmlto
```



## 1.2 安装libreswan

北京、香港区服务器操做

```shell
yum -y install libreswan
```



## 1.3 配置内核参数

北京、香港区服务器操做

```shell
# 开启路由转发
sed -i '/^net.ipv4.ip_forward/d' /etc/sysctl.conf 
cat >> /etc/sysctl.conf << EOF
net.ipv4.ip_forward = 1
EOF

# 使配置生效
sysctl -p
```



## 1.4 启动ipsec

```shell
systemctl start ipsec && systemctl enable ipsec
```



查看状态

```shell
$ systemctl status ipsec
● ipsec.service - Internet Key Exchange (IKE) Protocol Daemon for IPsec
   Loaded: loaded (/usr/lib/systemd/system/ipsec.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2022-03-29 10:38:39 CST; 14s ago
     Docs: man:ipsec(8)
           man:pluto(8)
           man:ipsec.conf(5)
 Main PID: 6483 (pluto)
   Status: "Startup completed."
   CGroup: /system.slice/ipsec.service
           └─6483 /usr/libexec/ipsec/pluto --leak-detective --config /etc/ipsec.conf --nofork

Mar 29 10:38:39 hk pluto[6483]: adding interface lo/lo 127.0.0.1:500
Mar 29 10:38:39 hk pluto[6483]: adding interface lo/lo 127.0.0.1:4500
Mar 29 10:38:39 hk pluto[6483]: adding interface lo/lo ::1:500
Mar 29 10:38:39 hk pluto[6483]: | setup callback for interface lo:500 fd 19
Mar 29 10:38:39 hk pluto[6483]: | setup callback for interface lo:4500 fd 18
Mar 29 10:38:39 hk pluto[6483]: | setup callback for interface lo:500 fd 17
Mar 29 10:38:39 hk pluto[6483]: | setup callback for interface eth0:4500 fd 16
Mar 29 10:38:39 hk pluto[6483]: | setup callback for interface eth0:500 fd 15
Mar 29 10:38:39 hk pluto[6483]: loading secrets from "/etc/ipsec.secrets"
Mar 29 10:38:39 hk pluto[6483]: no secrets filename matched "/etc/ipsec.d/*.secrets"
```



## 1.5 防火墙配置

香港区服务器操作

防火墙策略开放 udp 500 和 udp 4500 端口，允许北京区主机公网IP访问



## 1.6 验证端口连通性

北京区服务器操作

```sh
$ nmap -sU 2.2.2.2 -p 500,4500 -Pn

Starting Nmap 6.40 ( http://nmap.org ) at 2022-03-20 21:32 CST
Nmap scan report for 2.2.2.2
Host is up.
PORT     STATE         SERVICE
500/udp  open|filtered isakmp
4500/udp open|filtered nat-t-ike

Nmap done: 1 IP address (1 host up) scanned in 3.17 seconds
```



## 1.7 配置预共享密钥

北京、香港区服务器操做

`/etc/ipsec.secrets` 配置文件中有 `include /etc/ipsec.d/*.secrets` ，因此我们在 `/etc/ipsec.d` 目录下新建 `*.secrets` 文件 

```shell
$ cat /etc/ipsec.secrets
include /etc/ipsec.d/*.secrets
```



新建 `/etc/ipsec.d/vm.secrets`

```shell
cat > /etc/ipsec.d/vm.secrets << EOF
# 源ip 目的ip : PSK "key"
0.0.0.0 0.0.0.0 : PSK "baidu666com"
EOF
```



## 1.8 配置ipsec连接

`/etc/ipsec.conf` 配置文件中有 `include /etc/ipsec.d/*.conf` ，因此我们在 `/etc/ipsec.d` 目录下新建 `*.conf` 文件，同时 `/etc/ipsec.conf` 文件中有详细的示例说明

### 1.8.1 配置香港区服务器

Libreswan 不使用术语 `source` 或 `destination`。相反，它用术语  `left` 和 `right`来代指终端（主机）。虽然大多数管理员用 `left` 表示本地主机，`right` 表示远程主机，但是这样可以在大多数情况下在两个终端上使用相同的配置。
由于我们的服务器使用的是vpc网络，采用静态nat的形式，在配置 `left` 和 `right` 时，本端的ip需要使用内网ip或 `%defaultroute`。`left` 和 `right` 是两端的ip地址，而 `leftid` 和 `rightid` 为代号id。
这里我们指定北京区为 `left`  、香港区为 `right`

```shell
cat > /etc/ipsec.d/vm.conf << EOF
conn bj-vm-hk
        authby=secret # 指定认证类型预共享秘钥
        ike=3des-sha1 # 指定ike算法为3des-sha1
        keyexchange=ike # 指定ike
        phase2=esp
        phase2alg=3des-sha1
        compress=no # 指定是否压缩
        pfs=yes # 指定是否加密
        auto=start # 指定连接添加类型。start为开机自启，add为添加不主动连接
        type=tunnel # 指定模式类型为隧道模式|传输模式
        
        left=%any # 允许哪些IP可以访问！！！
        leftsubnets={$BJ_IP_SUBNET} # 北京区主机内网IP段
        leftid=%any
        leftnexthop=%defaultroute
        
        right=$HK_PRIVATE_IP # 这里要指定香港区主机内网IP
        rightsubnets={$HK_IP_SUBNET} # 这里要指定香港区主机内网IP段
        rightid=%any # 经验证，这里只能写%any、公网IP、@east或@west
        rightnexthop=%defaultroute
EOF
```



### 1.8.2 配置北京区服务器

Libreswan 不使用术语 `source` 或 `destination`。相反，它用术语  `left` 和 `right`来代指终端（主机）。虽然大多数管理员用 `left` 表示本地主机，`right` 表示远程主机，但是这样可以在大多数情况下在两个终端上使用相同的配置。
由于我们的服务器使用的是vpc网络，采用静态nat的形式，在配置 `left` 和 `right` 时，本端的ip需要使用内网ip或 `%defaultroute`。`left` 和 `right` 是两端的ip地址，而 `leftid` 和 `rightid` 为代号id。
这里我们指定香港区为本端机器，北京区为对端机器，即香港区为 `left`  、 北京区为 `right`

```shell
cat > /etc/ipsec.d/vm.conf << EOF
conn bj-vm-hk
        authby=secret # 指定认证类型预共享秘钥
        ike=3des-sha1 # 指定ike算法为3des-sha1
        keyexchange=ike # 指定ike
        phase2=esp
        phase2alg=3des-sha1
        compress=no # 指定是否压缩
        pfs=yes # 指定是否加密
        auto=start # 指定连接添加类型。start为开机自启，add为添加不主动连接
        type=tunnel # 指定模式类型为隧道模式|传输模式
        
        left=$BJ_PRIVATE_IP # 这里必须是北京区主机本机内网IP！！！
        leftsubnets={$BJ_IP_SUBNET} # 北京区主机内网IP段
        leftid=%any
        leftnexthop=%defaultroute
        
        right=$HK_PUBLIC_IP # 这里要指定香港区主机公网IP
        rightsubnets={$HK_IP_SUBNET} # 这里要指定香港区主机内网IP段
        rightid=%any # 经验证，这里只能写%any、公网IP、@east或@west
        rightnexthop=%defaultroute
EOF
```



### 1.8.3 开启ipsec日志

北京、香港区服务器操做

> 这里需要编辑 `/etc/ipsec.conf` 把日志打开，默认日志路径为 `/var/log/pluto.log`

```shell
sed -i 's/#logfile=/logfile=/' /etc/ipsec.conf
```



### 1.8.4 重启ipsec

北京、香港区服务器操做

```sh
systemctl restart ipsec
```



### 1.8.5 验证

#### 1.8.5.1 两端互ping

北京区服务器ping香港区服务器

```shell
$ ping -c2 $HK_PRIVATE_IP
PING 10.0.0.3 (10.0.0.3) 56(84) bytes of data.
64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=46.6 ms
64 bytes from 10.0.0.3: icmp_seq=2 ttl=64 time=46.6 ms

--- 10.0.0.3 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 46.648/46.666/46.685/0.216 ms
```



香港区服务器ping北京区服务器

```shell
$ ping -c2 $BJ_PRIVATE_IP
PING 172.31.0.14 (172.31.0.14) 56(84) bytes of data.
64 bytes from 172.31.0.14: icmp_seq=1 ttl=64 time=46.5 ms
64 bytes from 172.31.0.14: icmp_seq=2 ttl=64 time=46.6 ms

--- 172.31.0.14 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1000ms
rtt min/avg/max/mdev = 46.586/46.618/46.650/0.032 ms
```



#### 1.8.5.2 查看ipsec状态

提示如下即为成功

```shell
$ systemctl status ipsec
● ipsec.service - Internet Key Exchange (IKE) Protocol Daemon for IPsec
   Loaded: loaded (/usr/lib/systemd/system/ipsec.service; enabled; vendor preset: disabled)
   Active: active (running) since Wed 2022-03-23 21:00:37 CST; 4s ago
     Docs: man:ipsec(8)
           man:pluto(8)
           man:ipsec.conf(5)
  Process: 6246 ExecStopPost=/usr/sbin/ipsec --stopnflog (code=exited, status=0/SUCCESS)
  Process: 6243 ExecStopPost=/sbin/ip xfrm state flush (code=exited, status=0/SUCCESS)
  Process: 6240 ExecStopPost=/sbin/ip xfrm policy flush (code=exited, status=0/SUCCESS)
  Process: 6227 ExecStop=/usr/libexec/ipsec/whack --shutdown (code=exited, status=0/SUCCESS)
  Process: 6521 ExecStartPre=/usr/sbin/ipsec --checknflog (code=exited, status=0/SUCCESS)
  Process: 6518 ExecStartPre=/usr/sbin/ipsec --checknss (code=exited, status=0/SUCCESS)
  Process: 6256 ExecStartPre=/usr/libexec/ipsec/_stackmanager start (code=exited, status=0/SUCCESS)
  Process: 6254 ExecStartPre=/usr/libexec/ipsec/addconn --config /etc/ipsec.conf --checkconfig (code=exited, status=0/SUCCESS)
 Main PID: 6534 (pluto)
   Status: "Startup completed."
   CGroup: /system.slice/ipsec.service
           └─6534 /usr/libexec/ipsec/pluto --leak-detective --config /etc/ipsec.conf --nofork

Mar 23 21:00:37 hk systemd[1]: Starting Internet Key Exchange (IKE) Protocol Daemon for IPsec...
Mar 23 21:00:37 hk ipsec[6521]: nflog ipsec capture disabled
Mar 23 21:00:37 hk systemd[1]: Started Internet Key Exchange (IKE) Protocol Daemon for IPsec.
```



#### 1.8.5.3 查看日志

查看日志 `/var/log/pluto.log` ，有包的发送以及返回即为正确

```shell
Mar 23 21:00:37.774360: "bj-vm-hk/1x1"[1] 42.193.112.127 #1: STATE_MAIN_R1: sent MR1, expecting MI2
Mar 23 21:00:37.825502: "bj-vm-hk/1x1"[1] 42.193.112.127 #1: STATE_MAIN_R2: sent MR2, expecting MI3
Mar 23 21:00:37.875013: "bj-vm-hk/1x1"[1] 42.193.112.127 #1: Peer ID is ID_IPV4_ADDR: '172.31.0.14'
Mar 23 21:00:37.875269: "bj-vm-hk/1x1"[1] 42.193.112.127 #1: STATE_MAIN_R3: sent MR3, ISAKMP SA established {auth=PRESHARED_KEY cipher=3des_cbc_192 integ=sha group=MODP2048}
Mar 23 21:00:37.923920: "bj-vm-hk/1x1"[1] 42.193.112.127 #1: the peer proposed: 10.0.0.0/24:0/0 -> 172.31.0.0/24:0/0
Mar 23 21:00:37.926134: "bj-vm-hk/1x1"[1] 42.193.112.127 #2: responding to Quick Mode proposal {msgid:4323d821}
Mar 23 21:00:37.926162: "bj-vm-hk/1x1"[1] 42.193.112.127 #2:     us: 10.0.0.0/24===10.0.0.3<10.0.0.3>[43.154.53.42]
Mar 23 21:00:37.926169: "bj-vm-hk/1x1"[1] 42.193.112.127 #2:   them: 42.193.112.127===172.31.0.0/24
Mar 23 21:00:37.926600: "bj-vm-hk/1x1"[1] 42.193.112.127 #2: STATE_QUICK_R1: sent QR1, inbound IPsec SA installed, expecting QI2 tunnel mode {ESP/NAT=>0x33ba4428 <0xf89429e6 xfrm=3DES_CBC_0-HMAC_SHA1_96 NATOA=none NATD=42.193.112.127:4500 DPD=passive}
Mar 23 21:00:38.020561: "bj-vm-hk/1x1"[1] 42.193.112.127 #2: STATE_QUICK_R2: IPsec SA established tunnel mode {ESP/NAT=>0x33ba4428 <0xf89429e6 xfrm=3DES_CBC_0-HMAC_SHA1_96 NATOA=none NATD=42.193.112.127:4500 DPD=passive}
```



#### 1.8.5.4 查看连接情况

可以执行命令 `ipsec auto --status` 查看连接情况

```shell
000 "bj-vm-hk/1x1"[1]:   IKE algorithms: 3DES_CBC-HMAC_SHA1-MODP2048, 3DES_CBC-HMAC_SHA1-MODP1536
000 "bj-vm-hk/1x1"[1]:   IKE algorithm newest: 3DES_CBC_192-HMAC_SHA1-MODP2048
000 "bj-vm-hk/1x1"[1]:   ESP algorithms: 3DES_CBC-HMAC_SHA1_96
000 "bj-vm-hk/1x1"[1]:   ESP algorithm newest: 3DES_CBC_000-HMAC_SHA1_96; pfsgroup=<Phase1>
000  
000 Total IPsec connections: loaded 2, active 1
000  
000 State Information: DDoS cookies not required, Accepting new IKE connections
000 IKE SAs: total(1), half-open(0), open(0), authenticated(1), anonymous(0)
000 IPsec SAs: total(1), authenticated(1), anonymous(0)
000  
000 #1: "bj-vm-hk/1x1"[1] 42.193.112.127:4500 STATE_MAIN_R3 (sent MR3, ISAKMP SA established); EVENT_SA_REPLACE in 3143s; newest ISAKMP; lastdpd=-1s(seq in:0 out:0); idle; import:not set
000 #2: "bj-vm-hk/1x1"[1] 42.193.112.127:4500 STATE_QUICK_R2 (IPsec SA established); EVENT_SA_REPLACE in 28343s; newest IPSEC; eroute owner; isakmp#1; idle; import:not set
000 #2: "bj-vm-hk/1x1"[1] 42.193.112.127 esp.33ba4428@42.193.112.127 esp.f89429e6@10.0.0.3 tun.0@42.193.112.127 tun.0@10.0.0.3 ref=0 refhim=0 Traffic: ESPin=0B ESPout=0B! ESPmax=4194303B 
000  
000 Bare Shunt list:
000  
```



## 2.安装配置V2Ray

[v2ray官网](https://v2ray.com/)

[v2ray github](https://github.com/v2ray/v2ray-core)

[v2ray脚本安装github](https://github.com/v2fly/fhs-install-v2ray)

[v2ray github下载地址](https://github.com/v2fly/v2ray-core/releases)



### 2.1 香港区服务器操作

截止2022.3.23，v2ray最新稳定版本为4.44

香港区服务器可以直接执行脚本安装即可

```shell
bash <(curl -L https://raw/branch.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
```



以下为具体输出

```shell
bash <(curl -L https://raw/branch.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 21647  100 21647    0     0   124k      0 --:--:-- --:--:-- --:--:--  125k
info: Installing V2Ray v4.44.0 for x86_64
Downloading V2Ray archive: https://github.com/v2fly/v2ray-core/releases/download/v4.44.0/v2ray-linux-64.zip
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   657  100   657    0     0   2634      0 --:--:-- --:--:-- --:--:--  2638
100 13.2M  100 13.2M    0     0  16.1M      0 --:--:-- --:--:-- --:--:-- 16.1M
Downloading verification file for V2Ray archive: https://github.com/v2fly/v2ray-core/releases/download/v4.44.0/v2ray-linux-64.zip.dgst
info: Extract the V2Ray package to /tmp/tmp.nDCxE147dh and prepare it for installation.
info: Systemd service files have been installed successfully!
warning: The following are the actual parameters for the v2ray service startup.
warning: Please make sure the configuration file path is correctly set.
~~~~~~~~~~~~~~~~
[Unit]
Description=V2Ray Service
Documentation=https://www.v2fly.org/
After=network.target nss-lookup.target

[Service]
User=nobody
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/v2ray -config /usr/local/etc/v2ray/config.json
Restart=on-failure
RestartPreventExitStatus=23

[Install]
WantedBy=multi-user.target
# In case you have a good reason to do so, duplicate this file in the same directory and make your customizes there.
# Or all changes you made will be lost!  # Refer: https://www.freedesktop.org/software/systemd/man/systemd.unit.html
[Service]
ExecStart=
ExecStart=/usr/local/bin/v2ray -config /usr/local/etc/v2ray/config.json
~~~~~~~~~~~~~~~~
warning: The systemd version on the current operating system is too low.
warning: Please consider to upgrade the systemd or the operating system.

installed: /usr/local/bin/v2ray
installed: /usr/local/bin/v2ctl
installed: /usr/local/share/v2ray/geoip.dat
installed: /usr/local/share/v2ray/geosite.dat
installed: /usr/local/etc/v2ray/config.json
installed: /var/log/v2ray/
installed: /var/log/v2ray/access.log
installed: /var/log/v2ray/error.log
installed: /etc/systemd/system/v2ray.service
installed: /etc/systemd/system/v2ray@.service
removed: /tmp/tmp.nDCxE147dh
info: V2Ray v4.44.0 is installed.
You may need to execute a command to remove dependent software: yum remove curl unzip
Please execute the command: systemctl enable v2ray; systemctl start v2ray
```



### 2.2 北京区服务器操作

北京区服务器由于执行一键安装脚本太太太🐔8⃣️慢了，因此需要先下载安装脚本，然后通过加速地址下载v2ray安装包，最后执行本地安装

#### 2.2.1 下载一键安装脚本

```shell
wget https://raw/branch.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh
```



#### 2.2.2 下载安装包

截止2022.3.23，v2ray最新稳定版本为4.44

由于 `https://github.com/v2fly/v2ray-core/releases/download/v4.44.0/v2ray-linux-64.zip` 下载太慢了，可以使用如下加速地址

```shell
wget https://download.fastgit.org/v2fly/v2ray-core/releases/download/v4.44.0/v2ray-linux-64.zip
或
wget https://ghproxy.com/https://github.com/v2fly/v2ray-core/releases/download/v4.44.0/v2ray-linux-64.zip
```



#### 2.2.3 安装v2ray

赋予脚本可执行权限

```shell
chmod +x install-release.sh 
```



执行安装

```shell
./install-release.sh -l v2ray-linux-64.zip 
```



以下为具体输出

```shell
warn: Install V2Ray from a local file, but still need to make sure the network is available.
warn: Please make sure the file is valid because we cannot confirm it. (Press any key) ...
info: Extract the V2Ray package to /tmp/tmp.nXaK0Gt7ur and prepare it for installation.
info: Systemd service files have been installed successfully!
warning: The following are the actual parameters for the v2ray service startup.
warning: Please make sure the configuration file path is correctly set.
~~~~~~~~~~~~~~~~
[Unit]
Description=V2Ray Service
Documentation=https://www.v2fly.org/
After=network.target nss-lookup.target

[Service]
User=nobody
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/v2ray -config /usr/local/etc/v2ray/config.json
Restart=on-failure
RestartPreventExitStatus=23

[Install]
WantedBy=multi-user.target
# In case you have a good reason to do so, duplicate this file in the same directory and make your customizes there.
# Or all changes you made will be lost!  # Refer: https://www.freedesktop.org/software/systemd/man/systemd.unit.html
[Service]
ExecStart=
ExecStart=/usr/local/bin/v2ray -config /usr/local/etc/v2ray/config.json
~~~~~~~~~~~~~~~~
warning: The systemd version on the current operating system is too low.
warning: Please consider to upgrade the systemd or the operating system.

installed: /usr/local/bin/v2ray
installed: /usr/local/bin/v2ctl
installed: /usr/local/share/v2ray/geoip.dat
installed: /usr/local/share/v2ray/geosite.dat
installed: /usr/local/etc/v2ray/config.json
installed: /var/log/v2ray/
installed: /var/log/v2ray/access.log
installed: /var/log/v2ray/error.log
installed: /etc/systemd/system/v2ray.service
installed: /etc/systemd/system/v2ray@.service
removed: /tmp/tmp.nXaK0Gt7ur
info: V2Ray v4.44.0 is installed.
You may need to execute a command to remove dependent software: yum remove curl unzip
Please execute the command: systemctl enable v2ray; systemctl start v2ray
```



### 2.3 启动v2ray

北京、香港区服务器操做

```shell
systemctl enable v2ray && systemctl start v2ray
```



查看v2ray运行状态

```shell
$ systemctl status v2ray
● v2ray.service - V2Ray Service
   Loaded: loaded (/etc/systemd/system/v2ray.service; enabled; vendor preset: disabled)
  Drop-In: /etc/systemd/system/v2ray.service.d
           └─10-donot_touch_single_conf.conf
   Active: active (running) since Wed 2022-03-23 21:36:38 CST; 27s ago
     Docs: https://www.v2fly.org/
 Main PID: 13273 (v2ray)
   CGroup: /system.slice/v2ray.service
           └─13273 /usr/local/bin/v2ray -config /usr/local/etc/v2ray/config.json

Mar 23 21:36:38 bj systemd[1]: Started V2Ray Service.
Mar 23 21:36:38 bj v2ray[13273]: V2Ray 4.44.0 (V2Fly, a community-driven edition of V2Ray.) Custom (go1.17.3 linux/amd64)
Mar 23 21:36:38 bj v2ray[13273]: A unified platform for anti-censorship.
Mar 23 21:36:38 bj v2ray[13273]: 2022/03/23 21:36:38 [Info] main/jsonem: Reading config: /usr/local/etc/v2ray/config.json
Mar 23 21:36:38 bj v2ray[13273]: 2022/03/23 21:36:38 [Warning] V2Ray 4.44.0 started
```



### 2.4 编辑配置文件

[v2ray配置文件官方模板](https://github.com/v2fly/v2ray-examples)

香港区服务器操做

```json
cat > /usr/local/etc/v2ray/config.json << EOF
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
 {
      "protocol": "socks",
      "settings": {
        "udp": false,
        "auth": "noauth"
      },
      "port": "1080"
    },
    {
      "protocol": "http",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "timeout": 360
      },
      "port": "1087"
    },
    {
    "port": 2008,
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "6cd17a99-1f70-4f41-9d85-1d151e3ffb7c",
          "level": 1,
          "alterId": 0
        }
      ]
    }
  }],
  "outbounds": [{
    "protocol": "freedom",
    "settings": {}
  },{
    "protocol": "blackhole",
    "settings": {},
    "tag": "blocked"
  }],
  "routing": {
    "rules": [
      {
        "type": "field",
        "ip": ["geoip:private"],
        "outboundTag": "blocked"
      }
    ]
  }
}
EOF
```



北京区服务器操做

> 配置文件中的 `address` 要写香港区服务器的内网IP
>
> `accounts` 下的 `user` 和 `pass` 是用户名和密码，用于电脑本机配置认证所用

```json
cat > /usr/local/etc/v2ray/config.json << EOF
{
  "log": {
    "loglevel": "info",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [

    {
      "protocol": "http",
      "settings": {
        "timeout": 360
      },
      "port": "1087"
    },
    {
      "protocol": "http",
      "settings": {
        "timeout": 360,
        "accounts": [
            {
              "user": "admin",
              "pass": "admin"
            }
          ]
      },
      "port": "1088"
    }
  ],
  "outbounds": [
    {
      "mux": {
        "enabled": false,
        "concurrency": 8
      },
      "protocol": "vmess",
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": {
            "type": "none"
          }
        },
        "security": "none"
      },
      "tag": "proxy",
      "settings": {
        "vnext": [
          {
            "address": "10.0.0.3",
            "users": [
              {
                "id": "6cd17a99-1f70-4f41-9d85-1d151e3ffb7c",
                "alterId": 0,
                "level": 1,
                "security": "auto"
              }
            ],
            "port": 2008
          }
        ]
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP",
        "redirect": "",
        "userLevel": 0
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "none"
        }
      }
    }
  ],
  "dns": {},
  "routing": {
    "settings": {
      "domainStrategy": "AsIs",
      "rules": []
    }
  },
  "transport": {}
}
EOF
```



### 2.5 重启v2ray

北京、香港区服务器操做

编辑完配置文件重启生效

```shell
systemctl restart v2ray
```



### 2.6 查看启动

香港区服务器操做

```shell
$ netstat -ntpl|grep v2ray
tcp6       0      0 :::1080                 :::*                    LISTEN      12808/v2ray         
tcp6       0      0 :::2008                 :::*                    LISTEN      12808/v2ray         
tcp6       0      0 :::1087                 :::*                    LISTEN      12808/v2ray 
```



北京区服务器操做

```shell
$ netstat -ntpl|grep v2ray
tcp6       0      0 :::1087                 :::*                    LISTEN      14445/v2ray         
tcp6       0      0 :::1088                 :::*                    LISTEN      14445/v2ray        
```



### 2.7 配置代理

```sh
export http_proxy=http://10.0.0.3:1087
export https_proxy=http://10.0.0.3:1087
```



### 2.8 验证

```shell
$ curl -I google.com
HTTP/1.1 301 Moved Permanently
Content-Length: 219
Cache-Control: public, max-age=2592000
Connection: keep-alive
Content-Type: text/html; charset=UTF-8
Date: Wed, 23 Mar 2022 13:50:28 GMT
Expires: Fri, 22 Apr 2022 13:50:28 GMT
Keep-Alive: timeout=4
Location: http://www.google.com/
Proxy-Connection: keep-alive
Server: gws
X-Frame-Options: SAMEORIGIN
X-Xss-Protection: 0
```



