[toc]



# docker网络模式

**指定容器网络类型	--net或者--network**



# 1.docker网络模式

**docker网络模式，共4种**

| 模式          | 含义                 |
| ------------- | -------------------- |
| **bridge**    | **桥接模式，默认**   |
| **host**      | **与宿主机共享网络** |
| **none**      | **无网络**           |
| **container** | **与容器共享网络**   |



# 2.查看docker网络模式

## 2.1查看docker网络

**查看docker网络，默认有3种**

```python
[root@docker01 ~]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
752c74d78d18        bridge              bridge              local
970755d8e30b        host                host                local
f144b44069ab        none                null                local
```



## 2.2第一种	bridge，桥接，默认模式

```python
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



## 2.3第二种	host，与宿主机共享网络

```python
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



## 2.4第三种	none，无网络模式

```python
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



## 2.5第四种	container，共享容器网络	container:要共享的容器ID或名称

```python
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

