[toc]



# k8s必会知识点梳理

[本文严重抄袭至互联网](https://mp.weixin.qq.com/s/4eiABTTalIaaLAixxbIIXA)



## **kube-apiserver**

对外暴露了Kubernetes API。它是的 Kubernetes 核心控制层。它被设计为水平扩展，即通过部署更多实例来横向扩展。API Server 负责和 etcd 交互（其他组件不会直接操作 etcd，只有 API Server 这么做），是整个 kubernetes 集群的数据中心，所有的交互都是以 API Server 为核心的。API Server 提供了以下的功能：

- 整个集群管理的 API 接口：所有对集群进行的查询和管理都要通过 API 来进行。
- 集群内部各个模块之间通信的枢纽：所有模块之间并不会互相调用，而是通过和 API Server 打交道来完成各自的工作。
- 集群安全控制：API Server 提供的验证和授权保证了整个集群的安全。



## **kube-controller-manager和kube-scheduler的高可用选主机制**

[看这里 csdn博客](https://blog.csdn.net/weixin_39961559/article/details/81877056)

在k8s的组件中，其中有kube-scheduler和kube-controller-manager两个组件是有leader选举的，这个选举机制是k8s对于这两个组件的高可用保障。需要--leader-elect=true启动参数。即正常情况下kube-scheduler或kube-manager-controller组件的多个副本只有一个是处于业务逻辑运行状态，其它副本则不断的尝试去获取锁，去竞争leader，直到自己成为leader。如果正在运行的leader因某种原因导致当前进程退出，或者锁丢失，则由其它副本去竞争新的leader，获取leader继而执行业务逻辑。



![640](https://gitee.com/pptfz/picgo-images/raw/master/img/sadfasdfas.jpg)

在K8s中， 通过创建资源对象（当前的实现中实现了 ConfigMap 和 Endpoint 两种类型的资源）来维护锁的状态。这两种资源对象存在etcd里，也可以说是用etcd来实现的。

分布式锁一般实现原理就是大家先去抢锁，抢到的成为 leader ，然后 leader 会定期更新锁的状态，声明自己的活动状态，不让其他人把锁抢走。K8s 的资源锁也类似，抢到锁的节点会将自己的标记。设为锁的持有者，其他人则需要通过对比锁的更新时间和持有者来判断自己是否能成为新的 leader ，而 leader 则可以通过更新RenewTime来确保持续保有该锁。



**主要调用client-go包中的：**

**k8s.io/client-go/tools/leaderelection**



总共有7个leader选举参数：

- lock-object-namespace和lock-object-name是锁对象的命名空间和名称。
- leader-elect表示该组件运行时是否需要leader选举(如果集群中运行多副本，需要设置该选项为true，否则每个副本都将参与实际工作)。
- leader-elect-lease-duration为资源锁租约观察时间，如果其它竞争者在该时间间隔过后发现leader没更新获取锁时间，则其它副本可以认为leader已经挂掉不参与工作了，将重新选举leader。
- leader-elect-renew-deadline leader在该时间内没有更新则失去leader身份。
- leader-elect-retry-period为其它副本获取锁的时间间隔(竞争leader)和leader更新间隔。
- leader-elect-resource-lock是k8s分布式资源锁的资源对象，目前只支持endpoints和configmaps。

![123x](https://gitee.com/pptfz/picgo-images/raw/master/img/123x.png)



## **etcd**

Etcd使用的是raft一致性算法来实现的，是一款分布式的一致性KV存储，主要用于共享配置和服务发现。用于 Kubernetes 的后端存储。所有集群数据都存储在此处，ETCD在k8s技术栈的地位，就仿佛数据库（Mysql、Postgresql或oracle等）在Web应用中的地位，它存储了k8s集群中所有的元数据（以key-value的方式）。整个kubernetes系统需要用到etcd用来协同和存储配置的有：

- 网络插件flannel、calico等网络插件也需要用到etcd存储网络的配置信息
- kubernetes本身，包括各种对象的状态和元信息配置



**注意：**flannel操作etcd使用的是v2的API，而kubernetes操作etcd使用的v3的API，所以在下面我们执行etcdctl的时候需要设置ETCDCTL_API环境变量，该变量默认值为2。

K8s中所有元数据的增删改查都是由kube-apiserver来执行的。ETCD中key值通过观察可以简单得出下面几个规律：

k8s主要把自己的数据注册在/registry/前缀下面（在ETCD-v3版本后没有了目录的概念，只能一切皆前缀了）。通过观察k8s中deployment、namespace、pod等在ETCD中的表示，可以知道这部分资源的key的格式为/registry/{k8s对象}/{命名空间}/{具体实例名}。

![img](https://gitee.com/pptfz/picgo-images/raw/master/img/1.jpg)

![sadfasdfas](https://gitee.com/pptfz/picgo-images/raw/master/img/640.png)



## **kube-controller-manager**

kube-controller-manager运行控制器，它们是处理集群中常规任务的后台线程。逻辑上，每个控制器是一个单独的协程。用于监视 apiserver 暴露的集群状态，并且不断地尝试把当前状态向集群的目标状态迁移。为了避免频繁查询 apiserver，apiserver 提供了 watch 接口用于监视资源的增加删除和更新，client-go 对此作了抽象，封装一层 informer 来表示本地 apiserver 状态的 cache 。

**参考:**

[看这里](https://blog.csdn.net/huwh_/article/details/75675761)



这些控制器包括:

**节点控制器（node-controller）**: kubelet在启动时会通过API Server注册自身的节点信息，并定时向API Server汇报状态信息，API Server接收到信息后将信息更新到etcd中。Node Controller通过API Server实时获取Node的相关信息，实现管理和监控集群中的各个Node节点的相关控制功能。



**副本控制器（Replication Controller）**: 负责维护系统中每个副本控制器对象正确数量的 Pod。副本控制器的作用即保证集群中一个RC所关联的Pod副本数始终保持预设值。只有当Pod的重启策略是Always的时候（RestartPolicy=Always），副本控制器才会管理该Pod的操作（创建、销毁、重启等）。



**服务帐户和令牌控制器（ServiceAccount Controller ）:** 为新的命名空间创建默认帐户和 API 访问令牌。



**资源配额管理控制器ResourceQuota Controller：**资源配额管理确保指定的资源对象在任何时候都不会超量占用系统物理资源。支持三个层次的资源配置管理：

- 容器级别：对CPU和Memory进行限制;
- Pod级别：对一个Pod内所有容器的可用资源进行限制;
- Namespace级别：包括Pod数量、Replication Controller数量、Service数量、ResourceQuota数量、Secret数量、可持有的PV（Persistent Volume）数量



**Namespace Controller：**用户通过API Server可以创建新的Namespace并保存在etcd中，NamespaceController定时通过API Server读取这些Namespace信息。如果Namespace被API标记为优雅删除（即设置删除期限，DeletionTimestamp）,则将该Namespace状态设置为“Terminating”,并保存到etcd中。同时Namespace Controller删除该Namespace下的ServiceAccount、RC、Pod等资源对象。



**Service Controller：**属于kubernetes集群与外部的云平台之间的一个接口控制器。Service Controller监听Service变化，如果是一个LoadBalancer类型的Service，则确保外部的云平台上对该Service对应的LoadBalancer实例被相应地创建、删除及更新路由转发表。



**deployment controller：**用来替代以前的ReplicationController来方便的管理应用。只需要在 Deployment 中描述您想要的目标状态是什么，Deployment controller 就会帮您将 Pod 和ReplicaSet 的实际状态改变到您的目标状态。您可以定义一个全新的 Deployment 来创建 ReplicaSet 或者删除已有的 Deployment 并创建一个新的来替换。

- 定义Deployment来创建Pod和ReplicaSet
- 滚动升级和回滚应用
- 扩容和缩容
- 暂停和运行Deployment



**statefulset controller：**StatefulSet是为了解决有状态服务的问题（对应Deployments和ReplicaSets是为无状态服务而设计），其应用场景包括：

- 稳定的持久化存储，即Pod重新调度后还是能访问到相同的持久化数据，基于PVC来实现;
- 稳定的网络标志，即Pod重新调度后其PodName和HostName不变，基于Headless Service（即没有Cluster IP的Service）来实现。StatefulSet中每个Pod的DNS格式为：

```
statefulSetPodName-{0..N-1}.serviceName.namespace.svc.cluster.local
```



- 有序部署，有序扩展，即Pod是有顺序的，在部署或者扩展的时候要依据定义的顺序依次依次进行（即从0到N-1，在下一个Pod运行之前所有之前的Pod必须都是Running和Ready状态），基于init containers来实现；
- 有序收缩，有序删除（即从N-1到0）



**daemonset controller：**DaemonSet确保全部（或者一些）Node 上运行一个 Pod 的副本。当有 Node 加入集群时，也会为他们新增一个 Pod 。当有 Node 从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。



**Horizontal Pod Autoscaling：**仅适用于Deployment和ReplicaSet，在V1版本中仅支持根据Pod的CPU利用率扩所容，在v1alpha版本中，支持根据内存和用户自定义的metric扩缩容。



**persistentvolume-binder:** 定期同步磁盘卷挂载信息，负责pv和pvc的绑定。



**Endpoints controller：**表示了一个Service对应的所有Pod副本的访问地址，而EndpointsController负责生成和维护所有Endpoints对象的控制器。它负责监听Service和对应的Pod副本的变化。

- 如果监测到Service被删除，则删除和该Service同名的Endpoints对象；
- 如果监测到新的Service被创建或修改，则根据该Service信息获得相关的Pod列表，然后创建或更新Service对应的Endpoints对象;
- 如果监测到Pod的事件，则更新它对应的Service的Endpoints对象。

kube-proxy进程获取每个Service的Endpoints，实现Service的负载均衡功能。

以上只是部分控制器，都是一个独立的协程，被controller-manager这个进程所管理。



## **Statefulset和Deployment的区别**

Deployment用于部署无状态服务，StatefulSet用来部署有状态服务。

如果部署的应用满足以下一个或多个部署需求，则建议使用StatefulSet。

- 稳定的、唯一的网络标识;

- 稳定的、持久的存储;

- 有序的、优雅的部署和伸缩;

- 有序的、优雅的删除和停止;

- 有序的、自动的滚动更新;

- 实现固定的Pod IP方案, 可以优先考虑基于StatefulSet

  

**稳定的：**主要是针对Pod发生re-schedule后仍然要保持之前的网络标识和持久化存储。这里所说的网络标识包括hostname、集群内DNS中该Pod对应的A Record，并不能保证Pod re-schedule之后IP不变。要想保持Pod IP不变，我们可以借助稳定的Pod hostname定制IPAM获取固定的Pod IP。借助StatefulSet的稳定的唯一的网络标识特性，我们能比较轻松的实现Pod的固定IP需求，然后如果使用Deployment，那么将会复杂的多，你需要考虑滚动更新的过程中的参数控制(maxSurge、maxUnavailable)、每个应用的IP池预留造成的IP浪费等等问题。



**存储：**StatefulSet对应Pod的存储最好通过StorageClass来动态创建：每个Pod都会根据StatefulSet中定义的VolumeClaimTemplate来创建一个对应的PVC，然后PVS通过StorageClass自动创建对应的PV，并挂载给Pod。所以这种方式，需要事先创建好对应的StorageClass。当然，你也可以通过预先由管理员手动创建好对应的PV，只要能保证自动创建的PVC能和这些PV匹配上。



为了数据安全，当删除StatefulSet中Pods或者对StatefulSet进行缩容时，Kubernetes并不会自动删除StatefulSet对应的PV，而且这些PV默认也不能被其他PVC Bound。当你确认数据无用之后再手动去删除PV的时候，数据是否删除取决于PV的ReclaimPolicy配置。Reclaim Policy支持以下三种：

- Retain，意味着需要你手动清理；
- Recycle，等同于rm -rf /thevolume/*
- Delete，默认值，依赖于后端的存储系统自己实现。



**部署和伸缩时与Deployment的区别**

- 当部署有N个副本的StatefulSet应用时，严格按照index从0到N-1的递增顺序创建，下一个Pod创建必须是前一个Pod Ready为前提。
- 当删除有N个副本的StatefulSet应用时，严格按照index从N-1到0的递减顺序删除，下一个Pod删除必须是前一个Pod shutdown并完全删除为前提。
- 当扩容StatefulSet应用时，每新增一个Pod必须是前一个Pod Ready为前提。
- 当缩容StatefulSet应用时，没删除一个Pod必须是前一个Pod shutdown并成功删除为前提。



## **kube-scheduler**

kube-scheduler监视没有分配节点的新创建的 Pod，选择一个节点供他们运行。调度节点分配主要可以分为预选（Predicates）与优选（Priorities）两个环节：

**预选**

根据配置的PredicatesPolicies（默认为DefaultProvider中定义的default predicates policies集合）过滤掉那些不满足这些Policies 的 Node，预选的输出作为优选的输入；

**优选**

根据配置的PrioritiesPolicies（默认为DefaultProvider中定义的default priorities policies集合）给预选后的 Node 进行打分排名，得分最高的 Node 即作为最适合的 Node ，该 Pod 就绑定（Bind）到这个 Node 。

**注：**如果经过优选将 Node 打分排名后，有多个 Node 并列得分最高，那么kube-scheduler将随机从中选择一个 Node 作为目标 Node 。



**预选阶段算法**

**NoDiskConflict:** 评估是否存在volume冲突。如果该 volume 已经 mount 过了，k8s可能会不允许重复mount(取决于volume类型)；

**NoVolumeZoneConflict:** 评估该节点上是否存在 Pod 请求的 volume；

**PodFitsResources:** 检查节点剩余资源(CPU、内存)是否能满足 Pod 的需求。剩余资源=总容量-所有 Pod 请求的资源；

**MatchNodeSelector:** 判断是否满足 Pod 设置的 NodeSelector；

**CheckNodeMemoryPressure:** 检查 Pod 是否可以调度到存在内存压力的节点；

**CheckNodeDiskPressure:** 检查 Pod 是否可以调度到存在硬盘压力的节点；



**优选阶段算法**

依次计算该 Pod 运行在每一个 Node 上的得分。主要算法有：

**LeastRequestedPriority：**最低请求优先级，即 Node 使用率越低，得分越高；

**BalancedResourceAllocation：**资源平衡分配，即CPU/内存配比合适的 Node 得分更高；

**SelectorSpreadPriority:** 尽量将同一 RC/Replica 的多个 Pod 分配到不同的 Node 上；

**CalculateAntiAffinityPriority:** 尽量将同一 Service 下的多个相同 Label 的 Pod 分配到不同的 Node；

**ImageLocalityPriority:** Image本地优先，Node 上如果已经存在 Pod 需要的镜像，并且镜像越大，得分越高，从而减少 Pod 拉取镜像的开销(时间)；

**NodeAffinityPriority:** 根据亲和性标签进行选择；

默认的预选、优选调度算法远不止以上这些。可以通过kube-scheduler的启动参数中加policy-config-file文件、configmaps（过时）、或者--config指定调度器用哪些预选、优选算法。

![1](https://gitee.com/pptfz/picgo-images/raw/master/img/640-5569055.png)



**调度算法的扩展**

如果kube-scheduler提供的调度算法不满足调度要求，也可以自己开发扩展调度器，在kube-scheduler启动参数的policy-config中指定扩展调度器的地址，包括（预选接口、优选接口、优先级抢占，pod和node绑定的Bind接口）。



**扩展调度器示例代码：**

[看这里](https://github.com/liabio/k8s-scheduler-extender-example)

由于默认调度器kube-scheduler需要调用扩展调度程序kube-scheduler-extender，故需要在kube-scheduler的启动参数里配置扩展调度器的地址。需要在master节点主机的/etc/kubernetes目录下的scheduler.yaml中配置如下内容：（static pod方式部署的kube-scheduler不能用configmaps的方式挂载配置文件）

```yaml
apiVersion: kubescheduler.config.k8s.io/v1alpha1
kind: KubeSchedulerConfiguration
algorithmSource:
  policy:
    file:
      path: /etc/kubernetes/scheduler-policy.json
clientConnection:
  kubeconfig: /etc/kubernetes/scheduler.conf
leaderElection:
  leaderElect: true
```



![img](https://gitee.com/pptfz/picgo-images/raw/master/img/640-20200330194246913.jpeg)



主要配置是否启用选举机制，以及与API Server交互时认证用的scheduler.conf文件地址，调度策略选择用的scheduler-policy.json：

```json
{
    "kind":"Policy",
    "apiVersion":"v1",
    "predicates":[
        {
            "name":"NoVolumeZoneConflict"
        },
        {
            "name":"MatchInterPodAffinity"
        },
        {
            "name":"NoDiskConflict"
        },
        {
            "name":"GeneralPredicates"
        },
        {
            "name":"PodToleratesNodeTaints"
        },
        {
            "name":"CheckVolumeBinding"
        }
    ],
    "priorities":[
        {
            "name":"SelectorSpreadPriority",
            "weight":1
        },
        {
            "name":"InterPodAffinityPriority",
            "weight":1
        },
        {
            "name":"LeastRequestedPriority",
            "weight":1
        },
        {
            "name":"NodeAffinityPriority",
            "weight":1
        },
        {
            "name":"BalancedResourceAllocation",
            "weight":1
        },
        {
            "name":"NodePreferAvoidPodsPriority",
            "weight":10000
        },
        {
            "name":"TaintTolerationPriority",
            "weight":1
        }
    ],
    "extenders":[
        {
            "urlPrefix":"http://kube-scheduler-extender:80/scheduler",
            "filterVerb":"predicates/middleware_predicate",
            "prioritizeVerb":"",
            "preemptVerb":"",
            "bindVerb":"bind",
            "weight":1,
            "enableHttps":false,
            "nodeCacheCapable":false
        }
    ],
    "hardPodAffinitySymmetricWeight":10,
    "alwaysCheckAllPredicates":false
}
```



里面指定了默认调度器用到的预选、优选算法，以及调用扩展调度器的service地址，预选和Bind接口URI。

![640123](https://gitee.com/pptfz/picgo-images/raw/master/img/640.jpeg)



在/etc/kubernetes/manifests目录下的kube-scheduler.yaml中启动参数中加--config=/etc/kubernetes/scheduler.yaml，该文件通过hostPath的方式挂载到容器内。

![img](https://gitee.com/pptfz/picgo-images/raw/master/img/640123.jpg)

![6401](https://gitee.com/pptfz/picgo-images/raw/master/img/6401.jpg)



## **DNS**

kube-dns这个插件是官方推荐安装的。通过将 Service 注册到 DNS 中，k8s 可以为我们提供一种简单的服务注册发现与负载均衡方式。

kube-dns内部通过监听services和endpoints的变更事件将域名和IP对应信息同步到本地缓存。比如服务 a 访问服务 b，dns解析依赖a容器内 /etc/resolv.conf 文件的配置

```python
cat/etc/resolv.conf
nameserver 10.233.0.3search default.svc.cluster.local svc.cluster.localcluster.local
```



这个文件中，配置的 DNS Server，一般就是 K8S 中，kubedns 的 Service 的 ClusterIP，这个IP是虚拟IP，无法ping。

```python
[root@node4 user1]#kubectl get svc -n kube-systemNAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGEkube-dns              ClusterIP   10.233.0.3             53/UDP,53/TCP   270dkubernetes-dashboard  ClusterIP   10.233.22.223          443/TCP         124d
```



所有域名的解析，其实都要经过 kubedns 的虚拟IP 10.233.0.3 ，负载到某一个kube-dns pod上去解析。如果不能解析，则会去kube-dns pod所在的主机上的dns服务（/etc/resolv.conf）做解析。Kubernetes 启动的容器自动将 DNS 服务器包含在容器内的/etc/resolv.conf 中。



域名格式如下：

![img](https://gitee.com/pptfz/picgo-images/raw/master/img/640-20200330194246900.png)



statefulset一般使用Headless Service，如statefulset名为test，创建2个pod，则域名为test-0.test.kube-system.svc.cluster.local和test-1.test.kube-system.svc.cluster.local



## **节点组件**

节点组件在每个节点上运行，维护运行的 Pod 并提供Kubernetes 运行时环境。kubelet一般作为二进制运行到每个k8s节点；kube-proxy作为daemonset pod运行到每个k8s节点。



### **kubelet**

在kubernetes集群中，每个Node节点都会启动kubelet进程，用来处理Master节点下发到本节点的任务，管理Pod和其中的容器。kubelet会在API Server上注册节点信息，定期向Master汇报节点资源使用情况，并通过cAdvisor监控容器和节点资源。



**节点管理**

节点通过设置kubelet的启动参数``--register-node``来决定是否向API Server注册自己，默认为true，可以通过``kubelet --help``或者查看k8s源码(直接放弃)

kubelet的配置文件

默认配置文件在``/etc/kubernetes/kubelet``中，其中

- --api-servers: 用来配置master节点的IP和端口
- --kukeconfig:用来配置kubeconfig的路径，kubeconfig文件常用来指定证书
- --hostname-override：用来配置该节点在集群中显示的主机名
- --node-status-update-frequency：配置kubeler向master心跳上报的频率，默认为10s



**pod管理**

kubelet有几种方式获取自身node上所需运行的pod清单，但本文只讨论通过API Server监听etcd目录，同步pod列表的方式

kubelet通过API Server Client使用WatchAndList方式监听etcd中/registry/nodes/$(当前节点名称)和/registry/pods的目录，将获取的信息同步到本地缓存中

kubelet监听etcd，执行对pod的操作，对容器的操作则是通过docker client执行，例如自动删除容器等



kubelet创建和修改pod流程

1.为该pod创建一个数据目录

2.从API Server读取该pod清单

3.为该pod挂载外部卷

4.下载pod到用到的secret

5.检查运行的pod，执行pod中未完成的任务

6.先创建一个pause容器，该容器接管pod的网络，再创建其他容器

7.pod中容器的处理流程

​	7.1比较容器hash值并做相应处理

​	7.2如果容器被终止了且没有指定重启策略，则不做任何处理

​	7.3调用docker client下载容器镜像，调用docker clienr运行容器



- pod被调度到kubelet所在节点时，调用CNI（Docker 运行或通过 rkt)运行 Pod 的容器;
- 周期性的对容器生命周期进行探测。（健康检查readness-隔离、liveness-重启）;
- 检查节点状态，将节点的状态报告给kube-apiserver;
- 容器监控所在节点的资源使用情况，并定时向 kube-apiserver报告。知道整个集群所有节点的资源情况，对于 pod 的调度和正常运行至关重要。kubelet 使用cAdvisor进行资源使用率的监控。



### **kube-proxy**

[看这里](https://blog.csdn.net/qq_21816375/article/details/86310844)

service是一组pod的服务抽象，相当于一组pod的负载均衡器，负责将请求分发给对应的pod。service会提供一个clusterIP。kube-proxy的作用主要是负责service的实现，具体来说，就是实现了内部请求到service和外部的从node port向service的访问，转发到后端某个pod。



举个例子，现在有podA，podB，podC和serviceAB。serviceAB是podA，podB的服务抽象(service)。那么kube-proxy的作用就是可以将某一个发往（如podC发起的请求）向serviceAB的请求，进行转发到service所代表的一个具体pod(podA或者podB)上。请求的分配方法一般分配是采用轮询方法进行分配。



kube-proxy提供了三种负载均衡器（LB）模式: 一种是基于用户态的模式userspace, 一种是iptables模式，一种是ipvs模式。

- userspace：是以socket的方式实现代理的，userspace这种模式最大的问题是，service的请求会先从用户空间进入内核iptables，然后再回到用户空间，由kube-proxy完成后端Endpoints的选择和代理工作，这样流量从用户空间进出内核带来的性能损耗是不可接受的；

- iptables mode：因为使用iptable NAT来完成转发，也存在不可忽视的性能损耗。另外，如果集群中存在上万的Service/Endpoint，那么Node上的iptables rules将会非常庞大，性能还会再打折扣；

- IPVS 模式：工作原理其实跟 iptables 模式类似，当我们创建了前面的Service 之后，kube-proxy首先会在宿主机上创建一个虚拟网卡（kube-ipvs0）并为他分配service VIP作为IP地址，kube-proxy会通过linux的IPVS模块为这个IP设置三个虚拟主机（后端的三个POD IP），使用轮询作为LB策略（ipvsadm命令查看），IPVS模块会负责请求的转发。

  

  以下截图来自于极客时间张磊的课程描述：

  iptables模式和ipvs模式的对比

![img](https://gitee.com/pptfz/picgo-images/raw/master/img/640-20200330194246554.jpeg)



## **服务暴露方式**

[看这里](http://dockone.io/article/4884)

### **NodePort**

NodePort服务是引导外部流量到你的服务的最原始方式。可以通过访问集群内的每个NodeIP:NodePort的方式，访问到对应Service后端的Endpoint。在所有节点（虚拟机）上开放一个特定端口，任何发送到该端口的流量都被转发到对应服务。

![img](https://gitee.com/pptfz/picgo-images/raw/master/img/640-20200330194246589.jpeg)

NodePort 服务的 YAML 文件类似如下：

```yaml
apiVersion: v1
kind: Service
metadata:  
name: my-nodeport-service
selector:    
app: my-app
spec:
type: NodePort
ports:  
- name: http
port: 80
targetPort: 80
nodePort: 30036
protocol: TCP
```

 NodePort 服务主要有两点区别于普通的“ClusterIP”服务。第一，它的类型是“NodePort”。有一个额外的端口，称为 nodePort，它指定节点上开放的端口值。如果你不指定这个端口，系统将选择一个随机端口。



**何时使用这种方式？**

这种方法有许多缺点：

- 每个端口只能是一种服务
- 端口范围只能是 30000-32767
- 如果节点/VM 的 IP 地址发生变化，你需要能处理这种情况。



基于以上原因，我不建议在生产环境上用这种方式暴露服务。如果你运行的服务不要求一直可用，或者对成本比较敏感，你可以使用这种方法。这样的应用的最佳例子是 demo 应用，或者某些临时应用。



### **hostNetwork**

这种方式在创建pod时的yaml中spec.hostNetwork: true指定走主机网络，这种方式pod使用的端口必须是宿主机上没有被占用的端口。外部可以直接通过pod所在宿主机IP:Pod端口访问。



### **LoadBalancer**

这也是用来对集群外暴露服务的，不同的是这需要云服务商的支持，比如亚马逊等。这个方式的最大缺点是每一个用 LoadBalancer 暴露的服务都会有它自己的 IP 地址，每个用到的 LoadBalancer 都需要付费，这是非常昂贵的。



### **Ingress**

ingress配置一种路由转发规则，ingress controller会根据ingress中的规则，生成路由转发配置。如nginx-ingress-controller，控制循环会检测ingress对象的添加，通过其规则和service、pod信息生成nginx的配置，通过nginx实现对外服务和负载均衡。



## **pod创建流程**

1、客户端提交创建请求，通过API Server的Restful API，或者用kubectl命令行工具。支持的数据类型包括JSON和YAML。

2、API Server处理用户请求，存储Pod数据到etcd。

3、kube-scheduler通过API Server查看未绑定的Pod。尝试为Pod分配主机。

4、kube-scheduler通过预选算法过滤掉不符合要求的主机。比如Pod指定了所需要的资源量，那么可用资源比Pod需要的资源量少的主机会被过滤掉，端口被占用的也被过滤掉；

5、kube-scheduler通过优选算法给主机打分，对预选筛选出的符合要求的主机进行打分，在主机打分阶段，调度器会考虑一些整体优化策略，比如把一个deployment类型的pod分布到不同的主机上，使得资源均衡；或者将两个亲和的服务分配到同一个主机上。

6、选择主机：选择打分最高的主机，进行binding（调用apiserver将pod和node绑定）操作，结果存储到etcd中。

7、kubelet监听Api Server，根据调度结果执行Pod创建操作：绑定成功后，scheduler会调用API Server的API在etcd中创建一个bound pod对象，描述在一个工作节点上绑定运行的所有pod信息。运行在每个工作节点上的kubelet也会定期与etcd同步bound pod信息，一旦发现应该在该工作节点上运行的bound pod对象没有更新，则调用Docker API创建并启动pod内的容器。

8、kubelet调用CNI（Docker 运行或通过 rkt)运行 Pod 的容器。并周期性的对容器生命周期进行探测。（健康检查readness-隔离、liveness-重启）



各组件基本都是通过API Server提供的list-watch API进行监听资源对象变化，进行自己的控制循环，这些核心功能都被封装到了client-go包中。我们可以根据自己的需求，通过CRD编写controller、operator进行自己的控制循环逻辑、运维自动化部署，很轻松的扩展k8s能力。

