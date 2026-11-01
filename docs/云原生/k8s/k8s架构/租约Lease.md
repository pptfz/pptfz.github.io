# 租约 Lease

分布式系统通常需要**租约（Lease）**；租约提供了一种机制来锁定共享资源并协调集合成员之间的活动。在 Kubernetes 中，租约概念表示为 `coordination.k8s.io` API 组中的 **Lease** 对象，常用于类似节点心跳和组件级领导者选举等系统核心能力。

## 官方文档参考

| 项目 | 链接 |
| --- | --- |
| 租约（Lease）（官方中文文档） | [kubernetes.io/zh-cn/docs/concepts/architecture/leases](https://kubernetes.io/zh-cn/docs/concepts/architecture/leases/) |
| Lease v1 API 参考（官方英文文档） | [kubernetes.io/docs/reference/kubernetes-api/cluster-resources/lease-v1](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/lease-v1/) |

## Lease 对象与 API 组

| 项目 | 说明 |
| --- | --- |
| API 组 | `coordination.k8s.io` |
| 资源对象 | `Lease` |
| 稳定版本 | `v1` |
| 核心用途 | 节点心跳、组件领导者选举、API 服务器身份通告等 |

一个典型的 Lease 对象示例如下：

```yaml
apiVersion: coordination.k8s.io/v1
kind: Lease
metadata:
  name: example-lease            # 租约名称，如节点心跳租约与 Node 同名
  namespace: kube-node-lease     # 节点心跳租约固定在此命名空间
spec:
  holderIdentity: node-1         # 当前持有者的身份标识
  leaseDurationSeconds: 40       # 租约有效期（秒），过期后其他成员可尝试接手
  acquireTime: "2024-01-01T10:00:00.000000Z"   # 首次获得租约的时间
  renewTime: "2024-01-01T10:00:30.000000Z"     # 最近一次续租的时间
  leaseTransitions: 2            # 租约在持有者之间交接的次数
```

### Lease 对象核心字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `holderIdentity` | string | 当前租约持有者的身份标识（如节点名或组件实例 ID） |
| `leaseDurationSeconds` | int | 租约时长（秒）；对领导者选举而言，候选人据此判断持有者是否已失效 |
| `acquireTime` | time | 当前持有者首次获得租约的时间 |
| `renewTime` | time | 当前持有者最近一次续租（更新）租约的时间，是判断存活的关键字段 |
| `leaseTransitions` | int | 租约在持有者之间切换的次数，可用于观察选举是否频繁发生 |

查看节点心跳租约：

```bash
# kube-node-lease 命名空间中，每个 Node 都有一个与节点同名的 Lease
kubectl get lease -n kube-node-lease

# 输出示例：
# NAME       HOLDER      AGE
# node-1     node-1      30d
# node-2     node-2      30d
```

## 节点心跳

Kubernetes 使用 Lease API 将 kubelet 节点心跳传递到 Kubernetes API 服务器：

| 要点 | 说明 |
| --- | --- |
| 租约命名空间 | `kube-node-lease` |
| 租约命名规则 | 对于每个 `Node`，在该命名空间中都有一个**与节点同名的** `Lease` 对象 |
| 心跳方式 | 每个 kubelet 心跳都是对该 `Lease` 对象的 **update** 请求 |
| 更新字段 | 更新 Lease 的 `spec.renewTime` 字段 |
| 可用性判定 | Kubernetes 控制平面使用 `renewTime` 的时间戳来确定此 `Node` 的可用性 |

节点 Lease 心跳与故障判定的时序如下：kubelet 周期性更新 `renewTime`，控制平面发现超过时限未续租即判定节点 NotReady：

![节点 Lease 心跳与故障判定时序](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/lease_heartbeat.png)

:::tip 心跳为什么改用 Lease
相比早期直接更新 Node 对象的 `status` 字段，Lease 对象非常轻量：每次心跳只更新一个小对象的一个时间戳字段，显著降低了大规模集群下对 etcd 和 API 服务器的压力，也减小了对象版本冲突的概率。
:::

## 组件领导者选举

除了节点心跳，Lease 还广泛用于高可用组件的**领导者选举（Leader Election）**：

| 场景 | 说明 |
| --- | --- |
| 组件领导者选举 | kube-controller-manager、kube-scheduler 等控制面组件以多副本（或双机热备）部署时，通过竞争/续约 Lease 来保证同一时刻只有一个活跃（领导者）实例在工作，其余实例待命 |
| API 服务器身份租约 | 每个 kube-apiserver 在 `kube-system` 命名空间中创建并维护一个以自身地址命名的 Lease（形如 `apiserver-<ip>`），用于向集群通告"我活着"的身份信息 |
| Kamada 选举等 | 社区还有其他基于 Lease 的用途，例如历史上 kubelet 的 KAMADA 重启检测（Kubelet Admission Manager / 相关方案）等也借助 Lease 机制协调成员状态 |

:::caution 领导者选举的关键参数
组件领导者选举的续约间隔（`--leader-elect-renew-deadline` 等）与 Lease 的 `leaseDurationSeconds`、`renewTime` 密切相关：如果网络抖动导致续约不及时，可能出现短暂的双主或选主切换，排查控制面"重复执行/抖动"问题时，先看 Lease 的 `leaseTransitions` 是否频繁增长。
:::

## 我的总结与避坑清单

1. Lease 属于 `coordination.k8s.io/v1` API 组，本质是一个"带时间戳的轻量锁"，核心字段是 `renewTime`。
2. 节点心跳 = kubelet 定期 update `kube-node-lease` 命名空间下同名 Lease 的 `renewTime`；控制平面据此判定节点可用性。
3. 排查节点 NotReady 时，除了看 Node 对象本身，可以用 `kubectl get lease -n kube-node-lease` 看 `renewTime` 是否停滞，判断是 kubelet 没发心跳还是网络问题。
4. 高可用控制面组件（kube-scheduler、kube-controller-manager 等）靠 Lease 选主，多副本部署时只应有一个实例活跃。
5. `leaseTransitions` 频繁增长说明选主不稳定，优先排查控制面网络抖动和续约超时配置。
6. 不要手动删除或修改 kube-node-lease / kube-system 下的系统 Lease，否则会导致节点误判下线或组件重新选主。
7. 自己开发高可用控制器/Operator 时，直接复用 Lease 机制做领导者选举（controller-runtime 已内置），不要重复造轮子。
