[toc]



# docker跨主机通信之macvlan

# 1.macvlan说明

**macvlan可以虚拟多个mac地址，相当于虚拟多个网卡**



**macvlan优点**

- **与局域网其他主机处于同一个网段**



**macvlan缺点**

- **每次启动容器都需要手动指定IP地址**



# 2.macvlan跨主机通信示例

## 2.1实验环境

| 主机名       | IP            |
| ------------ | ------------- |
| **docker01** | **10.0.0.60** |
| **docker02** | **10.0.0.61** |



## 2.2docker01和docker02都创建macvlan网络

```python
//在docker01和docker02上相同操作
[root@docker01 ~]# docker network create --driver macvlan --subnet 10.0.0.0/24 --gateway 10.0.0.254 -o parent=eth0 macvlan_1


#参数说明
--driver			//指定网络类型
--subnet			//指定网段
---gateway		//指定网关
-o parent=eth0	//指定基于哪块物理网卡
macvlan_1		    //网络名称，可任意
```



## 2.3查看创建的网络

```python
//可以看到创建的名称为macvlan_1的网络
[root@docker01 ~]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
f2228fe9ebe8        bridge              bridge              local
1c11b715a65c        host                host                local
b0ddd6fd07ed        macvlan_1           macvlan             local
74d6b08c35c5        none                null  
```



## 2.4创建使用macvlan网络的容器

```python
1.docker01启动一个容器，IP指定为10.0.0.3
[root@docker01 ~]# docker run -it --network macvlan_1 --ip=10.0.0.3 centos:latest /bin/bash

2.docker01启动的容器ping docker02宿主机10.0.0.61和docker02启动的容器10.0.0.4
[root@33da263729a4 /]# ping -c 3 10.0.0.61
PING 10.0.0.61 (10.0.0.61) 56(84) bytes of data.
64 bytes from 10.0.0.61: icmp_seq=1 ttl=64 time=0.960 ms
64 bytes from 10.0.0.61: icmp_seq=2 ttl=64 time=0.358 ms
64 bytes from 10.0.0.61: icmp_seq=3 ttl=64 time=0.242 ms

--- 10.0.0.61 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2001ms
rtt min/avg/max/mdev = 0.242/0.520/0.960/0.314 ms
[root@33da263729a4 /]# ping -c 3 10.0.0.4 
PING 10.0.0.4 (10.0.0.4) 56(84) bytes of data.
64 bytes from 10.0.0.4: icmp_seq=1 ttl=64 time=0.714 ms
64 bytes from 10.0.0.4: icmp_seq=2 ttl=64 time=0.457 ms
64 bytes from 10.0.0.4: icmp_seq=3 ttl=64 time=0.275 ms

--- 10.0.0.4 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 0.275/0.482/0.714/0.180 ms


3.docker02启动一个容器，IP指定为10.0.0.4
[root@docker02 ~]# docker run -it --network macvlan_1 --ip=10.0.0.4 centos:latest /bin/bash


4.docker02启动的容器ping docker01宿主机10.0.0.60和docker02启动的容器10.0.0.3
[root@93ecb0bf3aa9 /]# ping -c 3 10.0.0.60
PING 10.0.0.60 (10.0.0.60) 56(84) bytes of data.
64 bytes from 10.0.0.60: icmp_seq=1 ttl=64 time=0.687 ms
64 bytes from 10.0.0.60: icmp_seq=2 ttl=64 time=0.390 ms
64 bytes from 10.0.0.60: icmp_seq=3 ttl=64 time=0.242 ms

--- 10.0.0.60 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = 0.242/0.439/0.687/0.186 ms
[root@93ecb0bf3aa9 /]# ping -c 3 10.0.0.3 
PING 10.0.0.3 (10.0.0.3) 56(84) bytes of data.
64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=0.542 ms
64 bytes from 10.0.0.3: icmp_seq=2 ttl=64 time=0.486 ms
64 bytes from 10.0.0.3: icmp_seq=3 ttl=64 time=0.345 ms

--- 10.0.0.3 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 0.345/0.457/0.542/0.086 ms
```

⚠️⚠️⚠️<span style={{color: 'red'}}>**如果ping不通，需要将网卡设置为混杂模式**</span>

```shell
ip link set eth0 promisc on
```


