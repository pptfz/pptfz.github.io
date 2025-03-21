# flannel udp模式

[flannel github](https://github.com/flannel-io/flannel)

[k8s支持的网络插件](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/addons/#networking-and-network-policy)



## 网络架构图

flannel udp模式网络架构图

![iShot_2025-03-14_15.59.04](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-14_15.59.04.png)

**架构概述**

图中展示了两种应用程序（Application-N和Application-T）通过网络通信的方式：

1.原生Socket API（Native Socket API）- 用红色虚线表示

2. `/dev/net/tun` 设备 - 用蓝色虚线表示

整个架构从上到下分为用户空间（USER SPACE）和内核空间（KERNEL SPACE），还有最底层的物理层（Physical Layer）。



**数据流程详解**

从Application-T发出的数据流（使用TAP/TUN接口）:

1.**应用层初始化**:

- Application-T应用程序准备发送数据
- 应用程序写入数据到打开的/dev/net/tun设备文件（"app write to"）

2.**TAP/TUN处理**:

- 数据通过/dev/net/tun设备进入内核
- 被tap/tun接口接收并处理

3.**内核中的路由**:

- tap/tun接口将数据传递给TCP/IP栈
- TCP/IP栈进行封包和路由决策

4.**数据发送到物理层**:

- 处理后的数据包被发送到物理接口
- 物理接口将数据发送到物理层
- 数据通过物理网络传输到目标设备



从Application-N发出的数据流（使用原生Socket API）:

1.**应用层初始化**:

- Application-N应用程序调用原生Socket API
- 应用程序创建套接字并准备发送数据

2.**用户空间到内核空间的转换**:

- 应用数据通过系统调用从用户空间传递到内核空间
- 内核中的Socket Layer（套接字层）接收数据

3.**内核中的处理**:

- Socket Layer将数据传递给TCP/IP协议栈
- TCP/IP栈进行封包、路由决策等处理

4.**数据发送到物理层**:

- 封装好的数据包被发送到物理接口（physical interface）
- 物理接口将数据发送到物理层（Physical Layer）
- 数据通过物理网络传输到目标设备





接收数据的流程（从外部网络接收）:

1.**数据到达物理层**:

- 数据从物理网络进入物理接口

2.**内核中的处理**:

- 物理接口将数据传递给TCP/IP栈
- TCP/IP栈进行解包、路由决策

3.**数据分发**:

- 根据目标和路由规则，数据可能被发送到: a) Socket Layer，然后传递给Application-N（通过原生Socket API） b) 或者传递给tap/tun接口，然后被Application-T读取（"read from tap/tun"）

  

## Flannel UDP模式的工作原理

Flannel是一个为Kubernetes提供网络服务的工具，而UDP模式是它的一种工作方式:

1.**封装机制**:

- Flannel UDP模式使用UDP协议封装容器之间的通信
- 使用了TAP/TUN设备来实现跨主机的容器网络通信

2.**虚拟网络接口**:

- TAP/TUN设备创建虚拟网络接口，使应用程序可以直接访问第3层网络数据
- TUN设备处理IP层（3层）数据包，TAP设备处理以太网层（2层）数据包

3.**数据包转发**:

- 当容器发送数据时，Flannel将数据包封装在UDP数据包中
- 通过物理网络发送到目标主机
- 目标主机上的Flannel解包并将数据转发给目标容器

4.**网络隔离**:

- 每个容器都有自己的IP地址，位于Flannel管理的子网中
- Flannel通过分配不同的子网来隔离不同主机上的容器网络



**优缺点分析**

**优点**:

- 实现了跨主机的容器通信
- 简单易用，配置相对简单
- 适用于大多数环境，不需要特殊的网络设备支持

**缺点**:

- UDP封装会增加额外的开销
- 性能不如直接路由或VXLAN等其他网络模式
- 在大规模部署时可能存在效率问题

总结来说，这是一个展示Flannel网络插件UDP模式工作原理的图表，它通过TAP/TUN设备和UDP封装技术实现了跨主机的容器网络通信，是Kubernetes等容器编排系统中常用的网络解决方案之一。



## 配置方式

在 [flannel releases](https://github.com/flannel-io/flannel/releases) 中下载的安装文件 `kube-flannel.yml` 中，以cm挂载的 `net-conf.json` 配置文件中的 `Backend` 字段下的 `Type` 字段指定模式

```yaml
apiVersion: v1
data:
  cni-conf.json: |
    {
      "name": "cbr0",
      "cniVersion": "0.3.1",
      "plugins": [
        {
          "type": "flannel",
          "delegate": {
            "hairpinMode": true,
            "isDefaultGateway": true
          }
        },
        {
          "type": "portmap",
          "capabilities": {
            "portMappings": true
          }
        }
      ]
    }
  net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "EnableNFTables": false,
      "Backend": {
        "Type": "udp"
      }
    }
kind: ConfigMap
......
```



## 需要注意的点

### 安装 [CNI Network plugins](https://github.com/containernetworking/plugins)

flannel默认使用 `portmap` 作为CNI网络插件，在部署flannel的时候，需要在宿主机上 `/opt/cni/bin` 目录下安装  [CNI Network plugins](https://github.com/containernetworking/plugins) 

 如果使用kind安装k8s集群，则需要在kind创建k8s集群的配置文件中增加 `extraMounts` ，将宿主机 `/opt/cni/bin` 挂载到kind容器中的 `/opt/cni/bin`

下载的 [CNI Network plugins](https://github.com/containernetworking/plugins) 解压后内容如下

![iShot_2025-03-20_20.02.53](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-20_20.02.53.png)

```yaml
$ cat ops-ingress.yaml 
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ops-ingress 
networking:
  # the default CNI will not be installed
  disableDefaultCNI: true
  podSubnet: "10.244.0.0/16"
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /opt/cni/bin
    containerPath: /opt/cni/bin
- role: worker
  extraMounts:
  - hostPath: /opt/cni/bin
    containerPath: /opt/cni/bin
- role: worker
  extraMounts:
  - hostPath: /opt/cni/bin
    containerPath: /opt/cni/bin
......
```





### 挂载 `/dev/net/tun`

官方的 `kube-flannel.yml` 安装文件中，如果使用了udp模式，则需要挂载 [`/dev/net/tun`](https://www.kernel.org/doc/Documentation/networking/tuntap.txt) 设备，否则flannel pod会无法启动并报错如下

```shell
$ kubectl logs -f kube-flannel-ds-5d97n
Defaulted container "kube-flannel" out of: kube-flannel, install-cni-plugin (init), install-cni (init)
I0319 08:15:20.367044       1 main.go:211] CLI flags config: {etcdEndpoints:http://127.0.0.1:4001,http://127.0.0.1:2379 etcdPrefix:/coreos.com/network etcdKeyfile: etcdCertfile: etcdCAFile: etcdUsername: etcdPassword: version:false kubeSubnetMgr:true kubeApiUrl: kubeAnnotationPrefix:flannel.alpha.coreos.com kubeConfigFile: iface:[] ifaceRegex:[] ipMasq:true ifaceCanReach: subnetFile:/run/flannel/subnet.env publicIP: publicIPv6: subnetLeaseRenewMargin:60 healthzIP:0.0.0.0 healthzPort:0 iptablesResyncSeconds:5 iptablesForwardRules:true netConfPath:/etc/kube-flannel/net-conf.json setNodeNetworkUnavailable:true}
W0319 08:15:20.367149       1 client_config.go:618] Neither --kubeconfig nor --master was specified.  Using the inClusterConfig.  This might not work.
I0319 08:15:20.383155       1 kube.go:139] Waiting 10m0s for node controller to sync
I0319 08:15:20.383293       1 kube.go:469] Starting kube subnet manager
I0319 08:15:20.387595       1 kube.go:490] Creating the node lease for IPv4. This is the n.Spec.PodCIDRs: [10.244.0.0/24]
I0319 08:15:20.387626       1 kube.go:490] Creating the node lease for IPv4. This is the n.Spec.PodCIDRs: [10.244.1.0/24]
I0319 08:15:20.387857       1 kube.go:490] Creating the node lease for IPv4. This is the n.Spec.PodCIDRs: [10.244.2.0/24]
I0319 08:15:21.383319       1 kube.go:146] Node controller sync successful
I0319 08:15:21.383352       1 main.go:231] Created subnet manager: Kubernetes Subnet Manager - ops-ingress-worker2
I0319 08:15:21.383359       1 main.go:234] Installing signal handlers
I0319 08:15:21.383633       1 main.go:468] Found network config - Backend type: udp
I0319 08:15:21.386773       1 kube.go:669] List of node(ops-ingress-worker2) annotations: map[string]string{"flannel.alpha.coreos.com/backend-data":"null", "flannel.alpha.coreos.com/backend-type":"", "flannel.alpha.coreos.com/kube-subnet-manager":"true", "flannel.alpha.coreos.com/public-ip":"172.18.0.3", "kubeadm.alpha.kubernetes.io/cri-socket":"unix:///run/containerd/containerd.sock", "node.alpha.kubernetes.io/ttl":"0", "volumes.kubernetes.io/controller-managed-attach-detach":"true"}
I0319 08:15:21.386822       1 match.go:211] Determining IP address of default interface
I0319 08:15:21.387326       1 match.go:264] Using interface with name eth0 and address 172.18.0.3
I0319 08:15:21.387361       1 match.go:286] Defaulting external address to interface address (172.18.0.3)
E0319 08:15:21.387585       1 main.go:359] Error registering network: failed to open TUN device: open /dev/net/tun: no such file or directory
I0319 08:15:21.387690       1 main.go:448] Stopping shutdownHandler...
```



解决方法

在 `kube-flannel.yml` 文件DaemonSet下

`spec.template.spec.containers.args.volumeMounts` 下新增

```yaml
- mountPath: /dev/net/tun
  name: tun
```



`spec.template.spec.containers.volumes` 下新增

```yaml
- hostPath:
    path: /dev/net/tun
  name: tun
```









