[toc]



# docker容器网络

**docker容器网络示意图**

![iShot_2024-08-23_11.09.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-08-23_11.09.35.png)





## 1.docker网络相关信息

### 1.1 docker网卡、网关信息

```python
//宿主机查看docker默认网卡信息，安装完docker并启动后，会有docker0网卡，默认IP地址172.17.0.1
[root@docker1 ~]# ifconfig
docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        inet6 fe80::42:61ff:fef9:e707  prefixlen 64  scopeid 0x20<link>
        ether 02:42:61:f9:e7:07  txqueuelen 0  (Ethernet)
        RX packets 50722  bytes 2466382 (2.3 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 82049  bytes 119024354 (113.5 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        
//查看容器网关，网关默认为172.17.0.1
[root@ddc401b2bba8 /]# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
```



### 1.2 启动一个busybox容器

```python
1.宿主机docker1运行busybox容器
[root@docker1 ~]# docker run -it busybox
Unable to find image 'busybox:latest' locally
latest: Pulling from library/busybox
8e674ad76dce: Pull complete 
Digest: sha256:c94cf1b87ccb80f2e6414ef913c748b105060debda482058d2b8d0fce39f11b9
Status: Downloaded newer image for busybox:latest

#查看网卡
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
32: eth0@if33: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue 
    link/ether 02:42:ac:11:00:03 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.3/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
       
#查看网关       
/ # route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
/ # 

2.busybox容器ping宿主机docker2
/ # ping 10.0.0.61


3.宿主机docker2抓包查看
可以看到，涞源的IP是宿主机docker1的eth0网卡，说明宿主机进行了nat地址转换，将dockerIP 172.17.0.2转换为宿主机eth0IP
[root@docker2 ~]# tcpdump -i eth0 icmp -nn
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
23:04:03.121544 IP 10.0.0.60 > 10.0.0.61: ICMP echo request, id 2816, seq 52, length 64
23:04:03.121576 IP 10.0.0.61 > 10.0.0.60: ICMP echo reply, id 2816, seq 52, length 64
```



### 1.3 docker容器用到的内核转发和iptables规则

```python
1.内核转发
#宿主机docker1查看内核转发，内核转发是docker开启的
[root@docker1 ~]# sysctl -a|grep -w net.ipv4.ip_forward
net.ipv4.ip_forward = 1

2.iptables规则
#宿主机docker1查看iptables规则
[root@docker1 ~]# iptables -t nat -L -n
Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
MASQUERADE  all  --  172.17.0.0/16        0.0.0.0/0 
```





## 2.docker端口映射（允许外网访问容器）

**docker指定端口映射，docker会自动添加一条iptables规则来实现端口映射**

- **-p   宿主机端口:容器端口**

- **-p   宿主机IP:宿主机端口:容器端口**

- **-p   宿主机IP::容器端口(随机端口)**

- **-p   宿主机端口:容器端口:udp**

- **-p   81:80 -p 443:443  可以指定多个-p**





### 2.1 方式一	-p   宿主机端口:容器端口

**1.启动一个nginx容器并作端口映射**	

```python
1.启动一个nginx容器，并将宿主机8080端口映射到容器80端口
[root@docker1 ~]# docker run -d -p 8080:80 nginx:latest 
ccef9a059f90886370577063f68bc4cab495f6497d394d16941f936b9fb8468a

2.宿主机查看iptables规则，可以看到iptables将宿主机8080端口映射到了容器的80端口
[root@docker1 ~]# iptables -t nat -L -n
Chain DOCKER (2 references)
target     prot opt source               destination         
RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
DNAT      tcp  -- 0.0.0.0/0           0.0.0.0/0      tcp dpt:8080 to:172.17.0.4:80
```

**2.宿主机80端口访问**

![iShot_2024-08-23_11.12.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-08-23_11.12.33.png)



**3.宿主机8080端口访问**

![iShot_2024-08-23_11.13.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-08-23_11.13.22.png)



### 2.2 方式二	-p   宿主机IP:宿主机端口:容器端口

**1.宿主机eth0网卡添加一个辅助IP**

```python
1.添加一个辅助IP
[root@docker1 ~]# ifconfig eth0:1 10.0.0.66/24 up

2.查看网卡eth0
[root@docker1 ~]# ifconfig |grep -A 2 eth0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.60  netmask 255.255.255.0  broadcast 10.0.0.255
        inet6 fe80::20c:29ff:fe65:ee41  prefixlen 64  scopeid 0x20<link>
--
eth0:1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.66  netmask 255.255.255.0  broadcast 10.0.0.255
        ether 00:0c:29:65:ee:41  txqueuelen 1000  (Ethernet)
```



**2.启动容器**

```python
//添加辅助IP后，宿主机的80端口就可以再次使用
[root@docker1 ~]# docker run -d -p 10.0.0.60:80:80 nginx:latest 
80257a4c036183df9106d38992bf2762007bc5bc1550bed408cf4232eb1ae160

[root@docker1 ~]# docker run -d -p 10.0.0.66:80:80 nginx:latest 
ccabd14eea387c05ce7af46c002c8f9621aa1907642551aff79f7ca7e4bd25aa
```



**3.查看端口监听**

```python
[root@docker1 ~]# netstat -ntpl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 10.0.0.66:80            0.0.0.0:*               LISTEN      18647/docker-proxy  
tcp        0      0 10.0.0.60:80            0.0.0.0:*               LISTEN      2942/docker-proxy  
```



**4.查看iptables转发规则**

```python
//访问宿主机80端口，将请求转发至第一个容器80端口；访问宿主机辅助IP80端口，将请求转发至第二个容器80端口
[root@docker1 ~]# iptables -t nat -L -n
Chain DOCKER (2 references)
target     prot opt source               destination         
RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
DNAT       tcp  --  0.0.0.0/0            10.0.0.60            tcp dpt:80 to:172.17.0.4:80
DNAT       tcp  --  0.0.0.0/0            10.0.0.66            tcp dpt:80 to:172.17.0.5:80
```



### 2.3 方式三	-p   宿主机IP::容器端口(宿主机端口随机)		宿主机端口不写，默认随机启动一个端口

**1.启动一个容器**

```python
1.启动一个容器
[root@docker1 ~]# docker run -d -p 10.0.0.60::80 nginx:latest 
fbf5d8973f9094bf18c0e0b9ad63fa3b350e1bd2afc94083824e081c20fdb0c8

2.查看启动的容器信息，可以看到，随机启动了一个32768端口
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                     NAMES
fbf5d8973f90        nginx:latest        "nginx -g 'daemon of…"   11 seconds ago      Up 10 seconds       10.0.0.60:32768->80/tcp   elastic_ritchie
```

**2.浏览器访问32768端口**

![iShot_2024-08-23_11.16.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-08-23_11.16.02.png)

### 2.4 方式四	-p   宿主机端口:容器端口:udp

**映射默认采用tcp方式，此方式为指定udp方式**

**例如，容器中运行了dns服务，需要指定为udp方式**



### 2.5 方式五	-p   81:80 -p 443:443  可以指定多个-p

**容器中运行了多个服务，此时需要映射多个端口**



## 3.docker端口随机映射

**-P			与-p   宿主机IP::容器端口(宿主机端口随机)方式相同**

**1.启动一个容器**

```python
1.启动一个容器
[root@docker1 ~]# docker run -d -P nginx:latest 
c1ffac8baf576208bbf107a24fd83e832b4811ad270bf8006d636e92b6438c39

2.查看容器信息，可以看到将宿主机32769映射到docker80端口
[root@docker1 ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                     NAMES
c1ffac8baf57        nginx:latest        "nginx -g 'daemon of…"   33 seconds ago      Up 32 seconds       0.0.0.0:32769->80/tcp     clever_lichterman
```



**<span style={{color: 'red'}}>docker端口映射核心</span>**

**<span style={{color: 'red'}}>通过iptables实现端口映射！！！</span>**
