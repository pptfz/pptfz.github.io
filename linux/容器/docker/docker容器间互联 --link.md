[toc]



# docker容器间互联	--link(单方向)

### 1.先启动一个容器

```python
1.启动一个nginx容器
[root@docker01 ~]# docker run -d --name nginx nginx
656aa889b827eaef68d99538c691a4872139f0c82ae72a7810fed64dbe2d6bac

2.查看启动的容器
[root@docker01 ~]# docker ps -al
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
656aa889b827        nginx               "nginx -g 'daemon of…"   3 seconds ago       Up 2 seconds        80/tcp              nginx
```



### 2.再次启动一个容器，添加--link参数

```python
1.再次启动一个busybox容器，--link后面为  要连接的容器名称:连接的容器的别名
[root@docker01 ~]# docker run -it --link nginx:nginx busybox:latest 

2.因为要连接的容器的名称为nginx，因此ping nginx，可以ping通
/ # ping nginx
PING nginx (172.17.0.5): 56 data bytes
64 bytes from 172.17.0.5: seq=0 ttl=64 time=0.814 ms
64 bytes from 172.17.0.5: seq=1 ttl=64 time=0.212 ms
^C
--- nginx ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.212/0.513/0.814 ms

3.查看hosts文件，可以看到有nginx的hosts解析
/ # cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.5	nginx 656aa889b827
172.17.0.6	4d6a7fb490e8
```



### 3.再次启动一个容器

```python
1.再次启动一个容器，--link后边为 要连接的容器:容器别名
[root@docker01 ~]# docker run -it --link nginx:web01 busybox:latest 

2.ping容器名称或者容器别名都可以ping通
/ # ping nginx
PING nginx (172.17.0.5): 56 data bytes
64 bytes from 172.17.0.5: seq=0 ttl=64 time=0.474 ms
^C
--- nginx ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.474/0.474/0.474 ms
/ # ping web01
PING web01 (172.17.0.5): 56 data bytes
64 bytes from 172.17.0.5: seq=0 ttl=64 time=0.137 ms
^C
--- web01 ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.137/0.137/0.137 ms

3.查看hosts文件，可以看到会把要连接的容器的别名、容器ID、容器名称都添加
/ # cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.5	web01 656aa889b827 nginx
172.17.0.6	c94f83726145
```

