# Pod 主机名与 DNS

## 引言

Pod 的 IP 每次重建都会变，但很多应用（数据库主从、消息队列集群、StatefulSet 成员）需要一个**稳定的网络身份**来互相发现。Kubernetes 通过 `hostname`、`subdomain` 两个 Pod 字段配合无头 Service，给 Pod 提供了可控的 DNS 身份；`setHostnameAsFQDN`、`dnsPolicy`、`dnsConfig` 则进一步控制容器内看到的域名解析行为。这篇笔记把这些分散在官方"Service 与 Pod 的 DNS"页面里的机制集中讲清。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| Service 与 Pod 的 DNS（概念） | https://kubernetes.io/zh-cn/docs/concepts/services-networking/dns-pod-service/ |
| Pod 与 Service 的 DNS 规范（dns 规范仓库） | https://github.com/kubernetes/dns/blob/master/docs/specification.md |

## 1. Pod 默认的 DNS 记录

默认情况下 Pod 只有两条记录：

- **A/AAAA 记录**：`<pod-IP-横线格式>.<namespace>.pod.<集群域>`，例如 IP 为 `172.17.0.3` 的 Pod 在 default 命名空间下是 `172-17-0-3.default.pod.cluster.local`
- **主机名**：容器内看到的 hostname 就是 `metadata.name`（Pod 名），没有独立的 FQDN

这种"以 IP 命名"的记录在 Pod 重建后就失效了，所以默认记录不适合做服务发现。

## 2. hostname 与 subdomain：给 Pod 起稳定的域名

两个字段的组合规则：

- `spec.hostname`：覆盖默认主机名（不设则用 Pod 名）
- `spec.subdomain`：声明 Pod 属于同命名空间下的某个"子组"，必须有**同名的无头 Service** 才能生成 DNS 记录

`hostname: "foo"` + `subdomain: "bar"` 时，Pod 的 FQDN 为 `foo.bar.<namespace>.svc.<集群域>`。

```bash
cat > hostname-subdomain.yaml <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: busybox-subdomain        # 【关键】Service 名必须与 subdomain 一致
spec:
  clusterIP: None                # 【关键】必须是无头 Service
  selector:
    app: busybox
---
apiVersion: v1
kind: Pod
metadata:
  name: busybox-1
  labels:
    app: busybox
spec:
  hostname: busybox-1            # 稳定主机名（StatefulSet 会自动生成等价配置）
  subdomain: busybox-subdomain   # 配合上面的无头 Service 生成 FQDN
  containers:
  - name: busybox
    image: busybox:1.36
    command: ["sleep", "3600"]
EOF
kubectl apply -f hostname-subdomain.yaml
```

此 Pod 的 FQDN 是 `busybox-1.busybox-subdomain.<ns>.svc.<cluster-domain>`，集群 DNS 会为它返回 A 记录指向 Pod IP。

:::caution 只有 Ready 的 Pod 才有记录
无头 Service 默认只为**就绪**的 Pod 发布 A 记录；想让未就绪的 Pod 也能被解析（如数据库选主场景），要给 Service 设置 `publishNotReadyAddresses: true`。另外，只设置 `subdomain` 不设置 `hostname` 时，只为无头 Service 本身创建记录，不会为 Pod 名创建记录。
:::

StatefulSet 正是这套机制的自动化版本：它自动给每个 Pod 配好 `hostname`（有序名称）与 `subdomain`（`serviceName` 指定的无头 Service），从而获得 `pod-0.svc-name.ns.svc.cluster-domain` 这样的稳定身份。

## 3. setHostnameAsFQDN：让 hostname 直接返回完整域名

**特性状态：** Kubernetes v1.22 [stable]

默认 `hostname` 命令返回短名（如 `busybox-1`），`hostname --fqdn` 才返回完整域名。设置 `spec.setHostnameAsFQDN: true` 后，kubelet 把 FQDN 直接记录为 Pod 主机名，两者返回相同值。

:::caution FQDN 超 64 字符会导致 Pod 起不来
Linux 内核 `struct utsname` 的 `nodename` 字段上限 64 字符。hostname + subdomain + 命名空间 + 集群域拼出的 FQDN 超长时，Pod 会卡在 `Pending`（kubectl 显示 `ContainerCreating`），事件报错 `FQDN ... is too long (64 characters is the max, ...)`。长命名空间 + 长集群域的环境要提前校验长度。
:::

## 4. dnsPolicy：Pod 的 DNS 策略

`spec.dnsPolicy` 决定 `/etc/resolv.conf` 怎么生成：

| 策略 | 行为 |
| --- | --- |
| `ClusterFirst`（**默认**） | 集群域内的查询走集群 DNS，不匹配的转发到上游 DNS |
| `Default` | Pod 从**节点**继承域名解析配置，完全忽略集群 DNS |
| `ClusterFirstWithHostNet` | `hostNetwork: true` 的 Pod 想用集群 DNS 必须显式设这个；否则回退为 `Default` 行为（Windows 不支持） |
| `None` | 忽略 Kubernetes 的 DNS 设置，只用 `dnsConfig` 的内容（此时 `dnsConfig` 必填） |

:::tip "Default" 不是默认值
`dnsPolicy: Default` 的含义是"用节点的 DNS 配置"，而 Pod 的默认策略其实是 `ClusterFirst`——这是官方文档特别强调的易混淆点。hostNetwork Pod 拿不到集群 DNS 是排障高频问题，原因就是忘了改策略。
:::

## 5. dnsConfig：追加自定义 DNS 配置

**特性状态：** Kubernetes v1.14 [stable]

`dnsConfig` 可以与任何 `dnsPolicy` 叠加（`None` 时必填）：

- `nameservers`：最多 3 个 IP（`None` 策略下至少 1 个）
- `searches`：搜索域，最多 32 个
- `options`：如 `ndots`、`edns0`，与已有配置合并去重

```yaml
spec:
  dnsPolicy: None
  dnsConfig:
    nameservers:
    - 192.0.2.1
    searches:
    - ns1.svc.cluster-domain.example
    - my.dns.search.suffix
    options:
    - name: ndots
      value: "2"
    - name: edns0
```

搜索域限制（v1.28 GA）：最多 32 个搜索域，总长度不超过 2048。老版本运行时（containerd ≤ 1.5.5、CRI-O ≤ 1.21）遇到大量搜索域可能让 Pod 卡 `Pending`。

## 6. 命名空间与搜索域的工作方式

kubelet 为 Pod 生成的 `/etc/resolv.conf` 大致如下：

```text
nameserver 10.32.0.10
search <namespace>.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

- 不带点的短名查询被搜索域扩展：`data` → `data.<ns>.svc.cluster.local` → `data.svc.cluster.local` → ...
- 跨命名空间访问要写全 `data.prod` 或 FQDN `data.prod.svc.cluster.local`

## 7. 我的总结与避坑清单

1. **给 Pod 稳定 DNS 身份的三件套**：`hostname` + `subdomain` + 同名无头 Service，缺一不可；StatefulSet 只是帮你自动配好了这三件
2. **`publishNotReadyAddresses: true`** 是选主/注册中心类应用（etcd、Kafka、ZooKeeper）的标配，否则未就绪成员解析不到
3. **`setHostnameAsFQDN: true` 有 64 字符硬限制**，命名空间和集群域名都很长时先算一算 FQDN 长度再启用
4. **hostNetwork Pod 记得 `dnsPolicy: ClusterFirstWithHostNet`**，否则它们用的是节点 DNS，解析不了集群内服务
5. **`dnsPolicy: None` 必须配 `dnsConfig`**，缺了会被 API 校验拒绝
6. **Windows 节点解析行为不同**：含点的名称一律当 FQDN、只支持一个 DNS 后缀，`kubernetes.default.svc` 这种部分限定名解析不了
7. **ndots:5 会让外网域名查询变慢**（最多先拼 5 轮搜索域），需要外网高频访问的 Sidecar 场景可用 dnsConfig 调小 ndots 或直接写 FQDN
