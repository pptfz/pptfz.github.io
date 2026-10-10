# docker网络模式

**指定容器网络类型 `--net` 或者 `--network`**

## 1. docker网络模式

**docker网络模式，共4种**

| 模式 | 含义 | 命令参数 |
| ------------- | -------------------- | ------ |
| **bridge** | **桥接模式，默认** | `--net bridge`（可不写） |
| **host** | **与宿主机共享网络** | `--net host` |
| **none** | **无网络** | `--net none` |
| **container** | **与容器共享网络** | `--net container:容器名/ID` |

:::tip 底层实现
Docker 的网络基于 Linux 的 **网络命名空间（network namespace）** + **veth pair** + **Linux 网桥（docker0）** + **iptables NAT** 实现。4 种模式的本质区别就是：**容器要不要独立的网络命名空间、和谁共享**。
:::

## 官方资料

| 资源 | 地址 |
|------|------|
| Docker 网络官方文档（总览） | [docs.docker.com/engine/network](https://docs.docker.com/engine/network/) |
| bridge 驱动详解 | [docs.docker.com/engine/network/drivers/bridge](https://docs.docker.com/engine/network/drivers/bridge/) |
| host 驱动详解 | [docs.docker.com/engine/network/drivers/host](https://docs.docker.com/engine/network/drivers/host/) |
| none 驱动详解 | [docs.docker.com/engine/network/drivers/none](https://docs.docker.com/engine/network/drivers/none/) |
| overlay 驱动（跨主机） | [docs.docker.com/engine/network/drivers/overlay](https://docs.docker.com/engine/network/drivers/overlay/) |
| macvlan 驱动 | [docs.docker.com/engine/network/drivers/macvlan](https://docs.docker.com/engine/network/drivers/macvlan/) |
| 端口发布教程（-p 详解） | [docs.docker.com/engine/network/tutorials/standalone](https://docs.docker.com/engine/network/tutorials/standalone/) |
| Docker 与 iptables | [docs.docker.com/network/iptables](https://docs.docker.com/network/iptables/) |
| 数据包过滤与防火墙 | [docs.docker.com/engine/network/packet-filtering-firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) |
| libnetwork 源码（Docker 网络实现） | [github.com/moby/libnetwork](https://github.com/moby/libnetwork) |
| man 手册：network_namespaces(7) | [manpages.debian.org/network_namespaces.7](https://manpages.debian.org/bookworm/manpages/network_namespaces.7.en.html) |
| man 手册：veth(4) | [manpages.debian.org/veth.4](https://manpages.debian.org/bookworm/manpages/veth.4.en.html) |

:::info container 驱动文档
`container` 模式没有独立的驱动文档页，官方在[网络总览页](https://docs.docker.com/engine/network/)的 drivers 一节里有说明。
:::

## 2. 查看docker网络模式

**查看docker网络，默认有3种**

```bash
[root@docker01 ~]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
752c74d78d18        bridge              bridge              local
970755d8e30b        host                host                local
f144b44069ab        none                null                local
```

## 3. bridge：桥接模式（默认）

### 原理

![bridge 桥接模式](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/docker-network-bridge.png)

Docker 启动时会在宿主机上创建一块 Linux 网桥 `docker0`（默认网段 `172.17.0.0/16`），每个容器的网卡通过 **veth pair** 一端插进容器、一端挂在 `docker0` 上：

1. 容器有**独立的网络命名空间**，自己的 `eth0`、自己的 IP（`172.17.0.x`）
2. 同一网桥上的容器之间**直接二层互通**
3. 访问外网走 **iptables MASQUERADE（NAT）**，源地址伪装成宿主机 IP
4. 外部访问容器服务需要 **`-p` 端口映射**（iptables DNAT）

### 实操

```bash
//启动一个容器test1
[root@docker01 ~]# docker run -d --name test1 busybox:latest vi 1
698a85c6cf33bc6a02903f0e6ac7f96e429247a17bef705467a9879c1d2de8b2

//查看容器网络信息
[root@docker01 ~]# docker inspect test1
 "Networks": {
                "bridge": {             //容器网络模式为bridge
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "NetworkID": "752c74d78d186a14b2c6e1659c54b50d3396a89fec4b34664c7991ddc50fac55",
                    "EndpointID": "",
                    "Gateway": "",
                    "IPAddress": "",
                    "IPPrefixLen": 0,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "",
                    "DriverOpts": null
                }
```

### 端口映射

bridge 模式下外部无法直接访问容器，用 `-p` 做端口映射：

```bash
//宿主机 80 端口映射到容器 80 端口
docker run -d -p 80:80 --name nginx01 nginx:latest

//随机映射（宿主机 32768 起的随机端口）
docker run -d -P --name nginx02 nginx:latest

//验证：iptables 里能看到 DNAT 规则
iptables -t nat -nvL DOCKER
```

## 4. host：与宿主机共享网络

### 原理

![host 模式](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/docker-network-host.png)

容器**没有独立的网络命名空间**，和宿主机共用同一套网络栈：网卡、IP、端口、路由表全部一致。

- ✔ 网络性能最好（没有 veth / NAT 开销），不需要 `-p` 映射，监听端口即宿主机端口
- ✘ 没有网络隔离，容器端口可能与宿主机端口冲突，安全性差

### 实操

```bash
1.查看宿主机网络，eth0 IP为10.0.0.20
[root@docker01 ~]# ip a s eth0 
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:49:fe:8f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.20/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe49:fe8f/64 scope link 
       valid_lft forever preferred_lft forever

2.启动一个容器test2，设置网络模式为host
[root@docker01 ~]# docker run -it --name test2 --net host  busybox:latest 
/ #

3.查看容器网络，可以看到，启动的容器网卡与宿主机一致
/ # ip a s eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:0c:29:49:fe:8f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.20/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe49:fe8f/64 scope link 
       valid_lft forever preferred_lft forever
```

## 5. none：无网络模式

### 原理

![none 模式](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/docker-network-none.png)

容器有独立的网络命名空间，但**只包含 `lo` 网卡**，不接任何网络：没有 `eth0`、没有路由、不能上网也不能被访问。

- ✔ 网络完全隔离，最安全
- 适用：离线批处理、纯计算任务、高安全场景
- 后续想联网可以手动接入自定义网络：`docker network connect <网络> <容器>`

### 实操

```bash
1.启动一个容器test3，网络模式指定为none
[root@docker01 ~]# docker run -it --name test3 --net none busybox:latest

2.查看IP，只有lo网卡
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
 
3.无法上网             
/ # ping baidu.com
ping: bad address 'baidu.com'

4.没有路由信息
/ # route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
```

## 6. container：与容器共享网络

### 原理

![container 模式](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/docker-network-container.png)

新容器**不创建自己的网络命名空间**，直接共享指定容器的：两个容器 `ip a` 结果完全一样，进程相互隔离，但可以通过 `localhost` 互相访问。

- 典型场景：多个协作进程组成的服务组（日志 sidecar 和主服务共享网络）
- **Kubernetes 的 Pod 就是这个模式的原型**：同 Pod 内容器共享同一个网络命名空间

### 实操

```bash
1.先启动一个容器test5，容器IP为172.17.0.4，可以上网
[root@docker01 ~]# docker run -it --name test5 busybox:latest 
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
42: eth0@if43: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:04 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.4/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
/ # ping baidu.com
PING baidu.com (220.181.38.148): 56 data bytes
64 bytes from 220.181.38.148: seq=0 ttl=127 time=9.747 ms
^C
--- baidu.com ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 9.747/9.747/9.747 ms

2.再次启动一个容器test6，指定网络共享容器test5
[root@docker01 ~]# docker run -it --name test6 --net container:test5 busybox:latest

3.查看IP，可以看到IP地址与共享的容器test5一样
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
46: eth0@if47: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:04 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.4/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever

```

## 7. 四种模式对比总结

| 模式 | 独立网络栈 | IP 来源 | 外部访问 | 性能 | 隔离性 | 典型场景 |
|------|-----------|---------|----------|------|--------|----------|
| **bridge** | ✔ | docker0 分配（172.17.0.x） | `-p` 端口映射 | 一般（NAT 开销） | 好 | **默认，大多数场景** |
| **host** | ✘ 共享宿主机 | 宿主机 IP | 直接访问宿主机端口 | **最好** | 差 | 高性能网络应用 |
| **none** | ✔ 但只有 lo | 无 | 不可访问 | - | **最强** | 离线任务、安全隔离 |
| **container** | ✘ 共享指定容器 | 与目标容器一致 | 与目标容器一致 | 一般 | 中 | sidecar 模式（K8s Pod 原型） |

:::tip 补充：自定义网络
生产上推荐不用默认 bridge，而是 `docker network create --driver bridge mynet` 创建自定义网络。自定义网络内的容器**支持通过容器名互相访问**（内置 DNS），默认 bridge 只能用 IP。
:::
