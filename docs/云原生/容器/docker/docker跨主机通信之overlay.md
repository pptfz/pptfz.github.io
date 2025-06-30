[toc]



# docker跨主机通信之overlay

## 1.overlay说明

**overlay优点**

- **会自动分配IP地址，需要consul数据库**



**网络类型为overlay的容器默认有两块网卡**

- **eth0		用于跨主机间容器通信**

- **eth1		用于连接外网**



**网关默认为172.18.0.1，是宿主机docker_gwbridge网卡的IP地址**





**overlay网络跨主机通信示意图**

![iShot_2024-08-23_11.04.52](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-23_11.04.52.png)





## 2.overlay跨主机通信示例

### 2.1 实验环境

| 主机名       | IP            |
| ------------ | ------------- |
| **docker01** | **10.0.0.60** |
| **docker02** | **10.0.0.61** |



### 2.2 docker01操作

#### 2.2.1 启动consul容器

```shell
docker run -d -p 8500:8500 -h consul --name consul --restart=always progrium/consul -server -bootstrap
```



#### 2.2.2 查看容器，容器映射了好多端口

```sh
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                                                            NAMES
84c733c42a91        progrium/consul     "/bin/start -server …"   24 seconds ago      Up 23 seconds       53/tcp, 53/udp, 8300-8302/tcp, 8400/tcp, 8301-8302/udp, 0.0.0.0:8500->8500/tcp   consul
```



#### 2.2.3 容器启动后可以访问一个web界面

浏览器访问 `10.0.0.60:8500`

![iShot_2024-08-23_11.06.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-23_11.06.07.png)



#### 2.2.4 修改docker配置文件 `/etc/docker/daemon.json`

修改配置文件 `/etc/docker/daemon.json` ，加入以下三行

```shell
"hosts":["tcp://0.0.0.0:2376","unix:///var/run/docker.sock"],
"cluster-store": "consul://10.0.0.60:8500",
"cluster-advertise": "10.0.0.60:2376"
```



参数说明

| 参数                                                         | 说明                                      |
| ------------------------------------------------------------ | ----------------------------------------- |
| `"hosts":["tcp://0.0.0.0:2376","unix:///var/run/docker.sock"]` | 本地监听tcp2376端口，同时指定sock文件     |
| `"cluster-store": "consul://10.0.0.60:8500"`                 | 集群信息存放位置,这里为docker01 10.0.0.60 |
| `"cluster-advertise": "10.0.0.60:2376"`                      | 客户机自身IP地址,这里为docker01 10.0.0.60 |



修改docker服务启动文件 `/usr/lib/systemd/system/docker.service` ，否则后续重启docker会报错

```shell
修改   ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
修改为 ExecStart=/usr/bin/dockerd 
```



重启docker

```shell
systemctl daemon-reload && systemctl restart docker
```





### 2.3 docker02操作

#### 2.3.1 启动consul容器

```shell
docker run -d -p 8500:8500 -h consul --name consul --restart=always progrium/consul -server -bootstrap
```



#### 2.3.2 查看容器，容器映射了好多端口

```shell
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                                                            NAMES
a793cf0b4aed        progrium/consul     "/bin/start -server …"   37 seconds ago      Up 35 seconds       53/tcp, 53/udp, 8300-8302/tcp, 8400/tcp, 8301-8302/udp, 0.0.0.0:8500->8500/tcp   consul
```



#### 2.3.3 容器启动后可以访问一个web界面

浏览器访问 `10.0.0.61:8500`

![iShot_2024-08-23_11.06.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-23_11.06.07.png)



#### 2.3.4 修改docker配置文件 `/etc/docker/daemon.json`

修改配置文件 `/etc/docker/daemon.json` ，加入以下三行

```shell
"hosts":["tcp://0.0.0.0:2376","unix:///var/run/docker.sock"],
"cluster-store": "consul://10.0.0.60:8500",
"cluster-advertise": "10.0.0.60:2376"
```



参数说明

| 参数                                                         | 说明                                       |
| ------------------------------------------------------------ | ------------------------------------------ |
| `"hosts":["tcp://0.0.0.0:2376","unix:///var/run/docker.sock"]` | 本地监听tcp2376端口，同时指定sock文件      |
| `"cluster-store": "consul://10.0.0.60:8500"`                 | 集群信息存放位置，这里为docker01 10.0.0.60 |
| `"cluster-advertise": "10.0.0.61:2376"`                      | 客户机自身IP地址，这里为docker02 10.0.0.61 |



修改docker服务启动文件 `/usr/lib/systemd/system/docker.service ` ，否则后续重启docker会报错

```shell
修改   ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
修改为 ExecStart=/usr/bin/dockerd 
```





重启docker

```shell
$ systemctl daemon-reload && systemctl restart docker
```



#### 2.3.5 最终效果

**访问docker1 consul的web界面	`KEY/VALUE` --> `docker` --> `nodes`	正确情况为出现两个docker节点**

![iShot_2024-08-23_11.07.07](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-08-23_11.07.07.png)



**到此，基础环境配置完成！！！**



### 2.4 通信测试

#### 2.4.1 docker01创建overlay网络，会自动同步到docker02，因为docker01和docker02都在consul集群中

docker01创建overlay网络

```shell
$ docker network create -d overlay --subnet 172.16.1.0/24 --gateway 172.16.1.254 overlay1
7a836393a60d6f87bd0053b2d75198a60960db8a98a34488d145eef1fef35711
```



查看创建的网络，名称为 `overlay1` ，类型为 `global` ，与其余网络类型不一样

```shell
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
d25efee562f5        bridge              bridge              local
1c11b715a65c        host                host                local
b0ddd6fd07ed        macvlan_1           macvlan             local
74d6b08c35c5        none                null                local
7a836393a60d        overlay1            overlay             global
```



docker02查看网络，可以看到docker01创建的 `overlay` 网络自动同步到了docker02

```shell
docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
59e0e535367b        bridge              bridge              local
c464712c8392        host                host                local
7d9727dd0d2d        macvlan_1           macvlan             local
be782cbc19a4        none                null                local
7a836393a60d        overlay1            overlay             global
```



#### 2.4.2 docker01启动容器overlay1

启动一个容器，指定网络为之前创建的overlay1

```shell
docker run -it --net overlay1 --name overlay1 busybox:latest /bin/sh
```



进入容器查看IP地址，IP地址为 `172.16.1.1` ，因为之前创建overlay网络的时候指定了网段为`172.16.1.0/24`

```shell
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
46: eth0@if47: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1450 qdisc noqueue 
    link/ether 02:42:ac:10:01:01 brd ff:ff:ff:ff:ff:ff
    inet 172.16.1.1/24 brd 172.16.1.255 scope global eth0
       valid_lft forever preferred_lft forever
49: eth1@if50: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth1
       valid_lft forever preferred_lft forever
```



#### 2.4.3 docker02启动容器overlay2

启动一个容器，指定网络为之前创建的overlay1

```shell
docker run -it --net overlay1 --name overlay2 busybox:latest /bin/sh
```



查看IP地址，IP地址为 `172.16.1.2` ，因为之前创建overlay网络的时候指定了网段为`172.16.1.0/24`

```python
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1450 qdisc noqueue 
    link/ether 02:42:ac:10:01:02 brd ff:ff:ff:ff:ff:ff
    inet 172.16.1.2/24 brd 172.16.1.255 scope global eth0
       valid_lft forever preferred_lft forever
15: eth1@if16: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth1
       valid_lft forever preferred_lft forever
```



#### 2.4.4 测试容器互通及连接外网

##### 2.4.4.1 docker01测试

ping docker02启动的容器overlay2

```shell
/ # ping -c 2 172.16.1.2
PING 172.16.1.2 (172.16.1.2): 56 data bytes
64 bytes from 172.16.1.2: seq=0 ttl=64 time=0.831 ms
64 bytes from 172.16.1.2: seq=1 ttl=64 time=0.437 ms

--- 172.16.1.2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.437/0.634/0.831 ms
```



也可以ping容器名称，容器名称存放于consul集群中

```shell
/ # ping -c 2 overlay2
PING overlay2 (172.16.1.2): 56 data bytes
64 bytes from 172.16.1.2: seq=0 ttl=64 time=0.704 ms
64 bytes from 172.16.1.2: seq=1 ttl=64 time=0.453 ms

--- overlay2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.453/0.578/0.704 ms
```



测试连接外网

```shell
/ # ping -c 2 www.baidu.com
PING www.baidu.com (61.135.169.121): 56 data bytes
64 bytes from 61.135.169.121: seq=0 ttl=127 time=4.863 ms
64 bytes from 61.135.169.121: seq=1 ttl=127 time=5.121 ms

--- www.baidu.com ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 4.863/4.992/5.121 ms
```



##### 2.4.4.2 docker02测试

ping docker01启动的容器overlay1

```shell
/ # ping -c 2 172.16.1.1
PING 172.16.1.1 (172.16.1.1): 56 data bytes
64 bytes from 172.16.1.1: seq=0 ttl=64 time=0.755 ms
64 bytes from 172.16.1.1: seq=1 ttl=64 time=0.660 ms

--- 172.16.1.1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.660/0.707/0.755 ms
```



也可以ping容器名称，容器名称存放于consul集群中

```shell
/ # ping -c 2 overlay1
PING overlay1 (172.16.1.1): 56 data bytes
64 bytes from 172.16.1.1: seq=0 ttl=64 time=0.900 ms
64 bytes from 172.16.1.1: seq=1 ttl=64 time=0.561 ms

--- overlay1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.561/0.730/0.900 ms
```



测试连接外网

```shell
/ # ping -c 2 www.baidu.com
PING www.baidu.com (61.135.169.125): 56 data bytes
64 bytes from 61.135.169.125: seq=0 ttl=127 time=5.063 ms
64 bytes from 61.135.169.125: seq=1 ttl=127 time=4.792 ms

--- www.baidu.com ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 4.792/4.927/5.063 ms
```

**到此，跨主机间容器通信完成！！！**



## 3.overlay网络类型的容器网卡问题

### 3.1 启动一个容器后，可以看到网络类型为overlay的容器有两块网卡eth0、eth1

查看容器IP，发现有两块网卡

:::tip 说明

eth0为 `172.16.1.1` ，用于跨主机容器间通信
eth1为 `172.18.0.2` ，用于连接外网

:::

```sh
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
46: eth0@if47: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1450 qdisc noqueue 
    link/ether 02:42:ac:10:01:01 brd ff:ff:ff:ff:ff:ff
    inet 172.16.1.1/24 brd 172.16.1.255 scope global eth0
       valid_lft forever preferred_lft forever
49: eth1@if50: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth1
       valid_lft forever preferred_lft forever
```



查看容器网关，可以看到容器网关为 `172.18.0.1`

```shell
/ # route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.18.0.1      0.0.0.0         UG    0      0        0 eth1
172.16.1.0      0.0.0.0         255.255.255.0   U     0      0        0 eth0
172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth1
```



查看宿主机网卡docker_gwbridge，可以看到docker_gwbridge的IP地址为 `172.18.0.1` ，是网络类型为overlay容器的网关地址

```shell
ifconfig docker_gwbridge
docker_gwbridge: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
        inet6 fe80::42:38ff:fea8:17e  prefixlen 64  scopeid 0x20<link>
        ether 02:42:38:a8:01:7e  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```





## 4.overlay网络类型网络命名空间

:::tip 说明

namespace实现网络环境隔离，网络命令空间有自己的IP地址

:::

查看网络命名空间默认为空

```shell
[root@docker01 ~]# ip netns
[root@docker01 ~]# 
```



创建目录软连接，docker01和docker02相同操作

:::tip 说明

因为ip netns只能查看到 `/var/run/netns` 下面的网络命名空间，而docker默认是放在 `/var/run/docker/netns` ，因此需要做目录软连接

:::

```shell
ln -s /var/run/docker/netns/ /var/run/netns
```



查看网络命名空间，可以看到两个容器间有一个相同的网络命名空间   `1-7a836393a6 (id: 1)`

```shell
# docker01
[root@docker01 ~]# ip netns
7ab4caaffca3 (id: 2)
1-7a836393a6 (id: 1)
7c88a1ff4a27 (id: 0)

# docker02
[root@docker02 ~]# ip netns
b7bfd18ee204 (id: 2)
1-7a836393a6 (id: 1)
5eb2da02b6de (id: 0)
```



进入到这个相同的网络命名空间(如果不进入网络命名空间则无法查看vxlan网卡)

```shell
ip netns exec 1-7a836393a6 /bin/bash
```



查看vxlan网卡，可以看到有 `br0` 、`lo` 、`veth0` 、`vxlan0`

:::tip 说明

如果启动多个网络类型为overlay的容器，则会有多个vethN,N代表数字
且br0的IP地址为 `172.16.1.254` ，即为创建overlay网络指定的网段的网关地址

:::

```shell
$ ifconfig
br0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        inet 172.16.1.254  netmask 255.255.255.0  broadcast 172.16.1.255
        ether 76:aa:f3:f4:77:17  txqueuelen 0  (Ethernet)
        RX packets 1  bytes 28 (28.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

veth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        ether 76:aa:f3:f4:77:17  txqueuelen 0  (Ethernet)
        RX packets 7  bytes 574 (574.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 7  bytes 574 (574.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

vxlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        ether be:5c:12:ff:1d:38  txqueuelen 0  (Ethernet)
        RX packets 5  bytes 420 (420.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 5  bytes 420 (420.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```



查看br0

```shell
$ brctl show
bridge name	bridge id		STP enabled	interfaces
br0		8000.76aaf3f47717	no		veth0
							        vxlan0
```

