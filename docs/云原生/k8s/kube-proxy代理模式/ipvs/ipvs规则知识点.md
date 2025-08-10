# ipvs规则知识点

## 查看当前集群使用的代理模式

```shell
$ k -n kube-system get cm kube-proxy-master -o yaml|grep -w mode
    mode: ipvs
```



## svc与后端pod的ipvs规则

`kube-proxy` 是以ds的方式部署的，因此每个node节点上都有相关的ipvs规则

以一个pod为例，`vpaas-demo` pod调度在了 `cn-beijing.10.245.96.43` 这个节点

```shell
k get pod -A -o wide|grep vpaas-demo
ratel             vpaas-demo.prod.ali.ratel-pod-deploy-295986-656758fc8d-dgzsm      1/1     Running            0          28d      10.245.112.32    cn-beijing.10.245.96.43    <none>           <none>
```



`vpaas-demo` 对应的svc地址是 `172.31.42.227`

```shell
$ k get svc -A -o wide|grep vpaas-demo
ratel           vpaas-demo-prod                      LoadBalancer   172.31.42.227   10.245.11.252   80:32380/TCP,50091:31502/TCP                   505d     app=vpaas-demo,build_id=295986,runenv=prod
```





登录 `vpaas-demo` 所调度的 `cn-beijing.10.245.96.43` node节点查看ipvs规则，这里主要查看8080端口的规则

```sh
$ ipvsadm -Ln | grep -A 5 172.31.42.227
TCP  172.31.42.227:80 rr
  -> 10.245.112.32:8080           Masq    1      0          0      
TCP  172.31.42.227:50091 rr
  -> 10.245.112.32:50091          Masq    1      0          0           
```



| 字段                 | 含义                                                         |
| -------------------- | ------------------------------------------------------------ |
| `TCP`                | 协议类型，表示使用 **TCP** 协议                              |
| `172.31.42.227:80`   | **ClusterIP**（虚拟 IP）和端口（服务的入口），这里是服务的 IP 和端口，表示客户端通过此 IP 和端口访问服务 |
| `rr`                 | **负载均衡算法**，`rr` 表示 **轮询（Round Robin）**，即流量按顺序轮流分配到后端 Pod |
| `->`                 | 表示流量被转发的目标（即后端 Pod）                           |
| `10.245.112.32:8080` | 目标后端 Pod 的 **IP** 和 **端口**，这里表示流量会被转发到该 Pod（10.245.112.32）上的 8080 端口 |
| `Masq`               | **NAT（网络地址转换）**，流量转发时，源 IP 会被修改成目标的外部 IP，通常是为了与外部通信 |
| `1`                  | 目标的 **权重**，表示流量分配的比例，默认情况下每个目标权重为 1 |
| `0`                  | 目标的 **连接数**，当前指向该 Pod 的流量连接数               |
| `0`                  | 目标的 **传输字节数**，表示流量传输的字节数                  |

