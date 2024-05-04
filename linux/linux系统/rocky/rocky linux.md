# rocky linux

[rocky linux 官网](https://rockylinux.org/)

[rocky linux github](https://github.com/rocky-linux/rocky)



## 操作系统信息

系统版本

```sh
$ cat /etc/redhat-release 
Rocky Linux release 9.3 (Blue Onyx)
```



内核版本（这里是在mac m芯片下的虚拟机实验，因此是arm架构）

```sh
$ uname -a
Linux localhost.localdomain 5.14.0-362.8.1.el9_3.aarch64 #1 SMP PREEMPT_DYNAMIC Thu Nov 9 05:21:32 UTC 2023 aarch64 aarch64 aarch64 GNU/Linux
```



## yum源

修改yum源为 [阿里云](https://developer.aliyun.com/mirror/rockylinux?spm=a2c6h.13651102.0.0.5a511b11685jQw)

```shell
sed -e 's|^mirrorlist=|#mirrorlist=|g' \
    -e 's|^#baseurl=http://dl.rockylinux.org/$contentdir|baseurl=https://mirrors.aliyun.com/rockylinux|g' \
    -i.bak \
    /etc/yum.repos.d/rocky-*.repo

dnf makecache
```



## 网络

rocky linux 9 的网卡配置文件在 `/etc/NetworkManager/system-connections` 

```sh
$ ls /etc/NetworkManager/system-connections
enp0s5.nmconnection
```



网卡配置文件 `enp0s5.nmconnection` 内容如下

```sh
[connection]
id=enp0s5
uuid=7a0f760a-1618-3036-8d84-fda65a273071
type=ethernet
autoconnect-priority=-999
interface-name=enp0s5
timestamp=1714748743

[ethernet]

[ipv4]
address1=10.0.0.222/24,10.0.0.254
dns=223.5.5.5;180.76.76.76;114.114.114.114;
method=manual

[ipv6]
addr-gen-mode=eui64
method=auto

[proxy]
```

### networkManager

rocky linux 使用 [networkManager](https://github.com/BornToBeRoot/NETworkManager) 管理网络

[networkManager官网](https://borntoberoot.net/NETworkManager/)

#### 重启网络

```sh
systemctl restart NetworkManager
```



## ssh

### 允许root远程登陆

```shell
修改
	PermitRootLogin prohibit-password
修改为
	PermitRootLogin yes
```

