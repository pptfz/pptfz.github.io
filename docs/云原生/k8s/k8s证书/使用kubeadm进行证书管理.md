# 使用 kubeadm 进行证书管理

> 本文以 kubeadm 管理的 Kubernetes 集群为例，说明控制平面证书、kubelet 客户端证书的检查、正常更新、证书过期后的恢复，以及更新后的验证方法。
>
> **重要：控制平面证书和 kubelet 证书是两套不同的机制。**
>
> - `kubeadm certs renew all` 主要负责 kubeadm 管理的控制平面/客户端证书。
> - kubelet 客户端证书位于 `/var/lib/kubelet/pki/`，正常情况下应该依靠 kubelet certificate rotation 自动轮转。
> - kubelet 证书过期时，不能只执行 `kubeadm certs renew all`，需要单独恢复 kubelet 的认证。

## k8s集群证书过期

官方文档：

https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/

如果 Kubernetes 集群证书过期，常见表现是访问 API Server 失败，例如：

```bash
k get no
```

```text
Unable to connect to the server: tls: failed to verify certificate: x509: certificate has expired or is not yet valid: current time 2025-06-23T07:20:14Z is after 2025-01-02T02:18:40Z
```

证书问题不一定只表现为 `kubectl` 无法访问，也可能表现为：

- `kube-controller-manager`、`kube-scheduler` 等控制平面组件持续出现 `Unauthorized`
- kubelet 无法正常向 API Server 认证
- Node 状态异常、NotReady
- kubelet 日志中出现 `system:anonymous`
- Calico 等依赖 kubelet/API Server 的组件出现认证相关错误
- CSR 长时间处于 `Pending`
- static Pod 因证书问题无法正常启动或反复重启

因此遇到证书过期问题时，**不要只更新一个证书然后立即认为故障已经恢复**，应该按照本文最后的检查项逐项确认。

---

## 查看证书过期时间

### 查看控制平面组件证书过期时间

可以使用 kubeadm 查看 kubeadm 管理的证书：

```bash
kubeadm certs check-expiration
```

:::tip 说明

`kubeadm certs check-expiration` 会检查 `/etc/kubernetes/pki` 下的证书，以及 `admin.conf`、`controller-manager.conf`、`scheduler.conf` 中嵌入的客户端证书。

示例：

```text
CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Jan 02, 2025             <invalid>       ca                      no
apiserver                  Jan 02, 2025             <invalid>       ca                      no
apiserver-etcd-client      Jan 02, 2025             <invalid>       etcd-ca                no
apiserver-kubelet-client   Jan 02, 2025             <invalid>       ca                      no
controller-manager.conf    Jan 02, 2025             <invalid>       ca                      no
etcd-healthcheck-client    Jan 02, 2025             <invalid>       etcd-ca                no
etcd-peer                  Jan 02, 2025             <invalid>       etcd-ca                no
etcd-server                Jan 02, 2025             <invalid>       etcd-ca                no
front-proxy-client         Jan 02, 2025             <invalid>       front-proxy-ca          no
scheduler.conf             Jan 02, 2025             <invalid>       ca                      no

CERTIFICATE AUTHORITY      EXPIRES                  RESIDUAL TIME
ca                         Dec 31, 2033             8y
etcd-ca                    Dec 31, 2033             8y
front-proxy-ca             Dec 31, 2033             8y
```

如果看到 `<invalid>`，说明对应证书已经过期。

:::

:::caution 注意

`kubelet.conf` 不会出现在 `kubeadm certs check-expiration` 的控制平面证书列表中。

kubelet 默认启用了客户端证书自动轮转，相关证书通常位于：

```bash
/var/lib/kubelet/pki/
```

官方文档：

https://kubernetes.io/zh-cn/docs/tasks/tls/certificate-rotation/

kubeadm 排障文档：

https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/#kubelet-client-cert

因此，**不要因为 `kubeadm certs check-expiration` 显示控制平面证书正常，就认为 kubelet 证书也一定正常。**

:::

---

### 查看kubelet证书过期时间

查看 kubelet 当前使用的客户端证书：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

例如：

```text
subject=O = system:nodes, CN = system:node:k8s-node01
issuer=CN = kubernetes
notBefore=Aug 15 02:18:40 2025 GMT
notAfter=Aug 15 02:18:40 2026 GMT
serial=3926CE667E904BFE3239CDB014E108C4
```

重点关注：

```text
notAfter
```

如果已经超过当前时间，则 kubelet 客户端证书已经过期。

也可以查看目录：

```bash
ls -lah /var/lib/kubelet/pki/
```

正常情况下可以看到类似：

```text
kubelet-client-2026-09-27-xxxxxx.pem
kubelet-client-current.pem -> kubelet-client-2026-09-27-xxxxxx.pem
kubelet.crt
kubelet.key
```

:::tip 说明

`kubelet-client-current.pem` 是 kubelet 当前使用的客户端证书，通常是一个软链接。

不要只看文件名判断证书是否有效，最终应使用 `openssl x509 -dates` 检查证书实际有效期。

:::

---

## 正常情况下 kubelet 证书应该如何工作

kubeadm 集群通常通过 kubelet certificate rotation 自动轮转客户端证书。

可以检查 kubelet 配置：

```bash
grep -nE 'rotateCertificates|serverTLSBootstrap' /var/lib/kubelet/config.yaml
```

通常应该至少看到：

```yaml
rotateCertificates: true
```

如果配置为：

```yaml
rotateCertificates: true
```

表示 kubelet 客户端证书应该进行自动轮转。

正常流程大致为：

```text
kubelet
   │
   │ 证书接近过期
   ▼
生成新的 CSR
   │
   ▼
CSR 被批准
   │
   ▼
生成新的 kubelet-client-*.pem
   │
   ▼
更新 kubelet-client-current.pem
   │
   ▼
继续使用新证书
```

因此，**正常情况下不应该每年手工给 Node 更新 kubelet 证书。**

如果 kubelet 证书已经过期，应该重点排查：

```bash
kubectl get csr
```

以及 kubelet 日志：

```bash
journalctl -u kubelet --since "1 hour ago" --no-pager
```

---

# 手动更新证书

:::caution 注意

执行证书更新之前，建议先备份 `/etc/kubernetes`，尤其是：

```text
/etc/kubernetes/pki/
/etc/kubernetes/admin.conf
/etc/kubernetes/controller-manager.conf
/etc/kubernetes/scheduler.conf
/etc/kubernetes/kubelet.conf
```

例如：

```bash
BACKUP_DIR="/root/kubernetes-certs-backup-$(date +%Y%m%d-%H%M%S)" && \
mkdir -p "$BACKUP_DIR" && \
cp -a /etc/kubernetes/pki "$BACKUP_DIR/" && \
cp -a /etc/kubernetes/*.conf "$BACKUP_DIR/" 2>/dev/null && \
echo "备份完成: $BACKUP_DIR"
```

不要在没有确认 CA 文件和 CA 私钥存在的情况下直接执行破坏性操作。

:::

## 更新kubelet证书

### 一、先确认 kubelet 证书是否真的过期

在 Node 上执行：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

确认 `notAfter` 已经过期。

同时查看：

```bash
journalctl -u kubelet --since "1 hour ago" --no-pager
```

以及：

```bash
kubectl get csr
```

---

### 二、确认控制平面节点存在 CA 私钥

生成新的 kubelet kubeconfig 需要 Kubernetes CA 私钥，因此应该在**正常工作的 Control Plane 节点**执行。

确认：

```bash
ls -lah /etc/kubernetes/pki/ca.crt
ls -lah /etc/kubernetes/pki/ca.key
```

必须确认：

```text
/etc/kubernetes/pki/ca.crt
/etc/kubernetes/pki/ca.key
```

都存在。

:::caution 注意

不要把：

```text
/etc/kubernetes/pki/ca.key
```

复制到 Node。

CA 私钥属于整个 Kubernetes 集群的核心私钥，应该只保存在受控的 Control Plane 节点。

:::

---

### 三、备份 Node 上原有 kubelet 配置和证书

在发生故障的 Node 上执行：

```bash
BACKUP_DIR="/root/kubelet-backup-$(date +%Y%m%d-%H%M%S)" && \
mkdir -p "$BACKUP_DIR" && \
cp -a /etc/kubernetes/kubelet.conf "$BACKUP_DIR/" 2>/dev/null && \
cp -a /var/lib/kubelet/pki/kubelet-client* "$BACKUP_DIR/" 2>/dev/null && \
echo "备份完成: $BACKUP_DIR" && \
ls -lah "$BACKUP_DIR"
```

---

### 四、删除失效的 kubelet 客户端证书

只删除 kubelet 客户端证书：

```bash
rm -f /var/lib/kubelet/pki/kubelet-client*
```

同时删除旧的 kubelet kubeconfig：

```bash
rm -f /etc/kubernetes/kubelet.conf
```

:::caution 注意

**不要删除：**

```text
/var/lib/kubelet/pki/kubelet.crt
/var/lib/kubelet/pki/kubelet.key
```

这两个文件和 kubelet 客户端证书轮转不是一回事。

也不要执行：

```bash
rm -rf /var/lib/kubelet/pki
```

除非已经明确知道自己正在处理什么，并且有完整备份。

:::

---

### 五、在 Control Plane 生成新的 kubelet.conf

假设故障 Node 为：

```text
k8s-node01
```

在 Control Plane 执行：

```bash
NODE=k8s-node01
```

然后：

```bash
kubeadm kubeconfig user \
  --org system:nodes \
  --client-name system:node:$NODE \
  > /root/${NODE}-kubelet.conf
```

检查：

```bash
ls -lah /root/${NODE}-kubelet.conf
```

确认证书：

```bash
openssl x509 \
  -in <(kubectl config view --raw --kubeconfig /root/${NODE}-kubelet.conf -o jsonpath='{.users[0].user.client-certificate-data}' | base64 -d) \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

应该看到类似：

```text
subject=O = system:nodes, CN = system:node:k8s-node01
issuer=CN = kubernetes
notBefore=Sep 27 00:00:00 2026 GMT
notAfter=Sep 27 00:00:00 2027 GMT
```

:::caution 注意

`$NODE` 必须是**发生故障的 Node 名称**。

例如：

```bash
NODE=k8s-node01
```

不能误写成 Control Plane：

```bash
NODE=k8s-master01
```

否则生成的客户端身份会错误。

:::

---

### 六、将新的 kubelet.conf 复制到 Node

在 Control Plane 执行：

```bash
scp /root/${NODE}-kubelet.conf root@${NODE}:/etc/kubernetes/kubelet.conf
```

然后在 Node 上：

```bash
chmod 600 /etc/kubernetes/kubelet.conf
```

检查：

```bash
ls -lah /etc/kubernetes/kubelet.conf
```

---

### 七、重启 kubelet

在 Node 上执行：

```bash
systemctl restart kubelet
```

检查：

```bash
systemctl status kubelet --no-pager
```

查看最近日志：

```bash
journalctl -u kubelet --since "10 minutes ago" --no-pager
```

---

### 八、确认新的 kubelet 客户端证书已经生成

等待 kubelet 完成认证后：

```bash
ls -lah /var/lib/kubelet/pki/
```

重点查看：

```bash
ls -lah /var/lib/kubelet/pki/kubelet-client-current.pem
```

然后：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

确认：

```text
subject=O = system:nodes, CN = system:node:k8s-node01
```

并确认：

```text
notAfter
```

已经变成未来时间。

:::caution 注意

不要简单认为：

```bash
systemctl restart kubelet
```

执行成功就代表证书已经恢复。

**必须检查 `/var/lib/kubelet/pki/kubelet-client-current.pem` 是否存在，并确认其 `notAfter` 已经更新。**

:::

---

### 九、确认 kubelet.conf 使用的是正确的认证方式

检查：

```bash
grep -nE 'client-certificate|client-key|client-certificate-data|client-key-data' /etc/kubernetes/kubelet.conf
```

如果使用动态轮转证书，应该确认 kubelet 最终使用的是：

```text
/var/lib/kubelet/pki/kubelet-client-current.pem
```

而不是永久嵌入旧证书的：

```text
client-certificate-data
client-key-data
```

必要时可以编辑：

```bash
vi /etc/kubernetes/kubelet.conf
```

将对应用户配置调整为：

```yaml
users:
- name: system:kubelet
  user:
    client-certificate: /var/lib/kubelet/pki/kubelet-client-current.pem
    client-key: /var/lib/kubelet/pki/kubelet-client-current.pem
```

保存后：

```bash
systemctl restart kubelet
```

然后再次检查：

```bash
journalctl -u kubelet --since "10 minutes ago" --no-pager
```

:::tip 说明

这一步非常重要。

恢复 kubelet 时不能只关注“生成了一个新的 kubelet.conf”，还需要确认 kubelet 后续能够使用 `/var/lib/kubelet/pki/kubelet-client-current.pem` 进行正常的证书轮转。

:::

---

## kubelet证书自动轮转失败排查

如果：

```bash
rotateCertificates: true
```

但是证书仍然过期，重点检查下面几项。

### 查看 kubelet 配置

```bash
grep -nE 'rotateCertificates|serverTLSBootstrap' /var/lib/kubelet/config.yaml
```

### 查看 CSR

```bash
kubectl get csr
```

如果出现：

```text
NAME        AGE    SIGNERNAME                                    REQUESTOR                  CONDITION
csr-xxxxx   10m    kubernetes.io/kube-apiserver-client-kubelet   system:node:k8s-node01    Pending
```

说明 kubelet 已经发起 CSR，但没有完成批准。

---

### 检查具体 CSR

不要直接批准所有 Pending CSR。

先：

```bash
kubectl describe csr <CSR_NAME>
```

重点确认：

```text
Requesting User
SignerName
Subject
Conditions
```

确认 CSR 确实来自目标 Node，并且：

```text
CN=system:node:<node-name>
O=system:nodes
```

确认无误后：

```bash
kubectl certificate approve <CSR_NAME>
```

然后：

```bash
kubectl get csr
```

再次检查：

```bash
kubectl describe csr <CSR_NAME>
```

---

### 不建议直接批量批准所有 Pending CSR

不要在生产环境直接执行：

```bash
kubectl get csr | grep Pending | awk '{print $1}' | xargs kubectl certificate approve
```

因为 Pending CSR 不一定全部来自你正在恢复的 kubelet。

正确做法是：

```bash
kubectl get csr
```

找到目标 CSR：

```bash
kubectl describe csr <CSR_NAME>
```

确认身份后：

```bash
kubectl certificate approve <CSR_NAME>
```

---

## 更新控制平面组件证书

如果：

```bash
kubeadm certs check-expiration
```

发现控制平面证书已经过期，可以执行：

```bash
kubeadm certs renew all
```

示例输出：

```text
certificate embedded in kubeconfig file admin.conf renewed
certificate embedded in kubeconfig file controller-manager.conf renewed
certificate embedded in kubeconfig file scheduler.conf renewed
```

执行完成后重新检查：

```bash
kubeadm certs check-expiration
```

确认相关证书的：

```text
EXPIRES
RESIDUAL TIME
```

已经恢复。

:::caution 注意

`kubeadm certs renew all` **不会替代 kubelet 客户端证书自动轮转**。

因此即使：

```bash
kubeadm certs check-expiration
```

全部正常，也应该单独检查：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates
```

:::

---

## 更新 admin.conf

证书更新后，如果当前用户使用的是旧的 `admin.conf`，可以更新：

```bash
mkdir -p $HOME/.kube

cp -i /etc/kubernetes/admin.conf $HOME/.kube/config

chown $(id -u):$(id -g) $HOME/.kube/config
```

然后：

```bash
kubectl get nodes
```

确认可以正常访问集群。

---

## 重启控制平面组件

kubeadm 部署的控制平面组件通常是 static Pod。

manifest 通常位于：

```bash
/etc/kubernetes/manifests/
```

例如：

```bash
ls -lah /etc/kubernetes/manifests/
```

通常可以看到：

```text
etcd.yaml
kube-apiserver.yaml
kube-controller-manager.yaml
kube-scheduler.yaml
```

:::caution 注意

**不要一次性移动或删除 `/etc/kubernetes/manifests/` 下的全部文件。**

例如不建议直接执行：

```bash
mv /etc/kubernetes/manifests/* /tmp/k8s-manifests/
```

因为这样可能同时停止：

- etcd
- kube-apiserver
- kube-controller-manager
- kube-scheduler

如果是单 Control Plane 集群，可能直接导致整个控制平面不可用。

应该一个组件一个组件处理。

:::

### 重启 kube-controller-manager

例如：

```bash
mkdir -p /tmp/k8s-manifests

mv /etc/kubernetes/manifests/kube-controller-manager.yaml \
   /tmp/k8s-manifests/

sleep 20

mv /tmp/k8s-manifests/kube-controller-manager.yaml \
   /etc/kubernetes/manifests/
```

然后检查：

```bash
crictl ps -a | grep kube-controller-manager
```

以及：

```bash
kubectl get pods -n kube-system -o wide | grep kube-controller-manager
```

---

### 重启 kube-scheduler

```bash
mkdir -p /tmp/k8s-manifests

mv /etc/kubernetes/manifests/kube-scheduler.yaml \
   /tmp/k8s-manifests/

sleep 20

mv /tmp/k8s-manifests/kube-scheduler.yaml \
   /etc/kubernetes/manifests/
```

检查：

```bash
crictl ps -a | grep kube-scheduler
```

---

### 重启 kube-apiserver

```bash
mkdir -p /tmp/k8s-manifests

mv /etc/kubernetes/manifests/kube-apiserver.yaml \
   /tmp/k8s-manifests/

sleep 20

mv /tmp/k8s-manifests/kube-apiserver.yaml \
   /etc/kubernetes/manifests/
```

然后：

```bash
kubectl get --raw='/readyz?verbose'
```

---

### 重启 etcd

如果更新了 etcd 相关证书：

```bash
mkdir -p /tmp/k8s-manifests

mv /etc/kubernetes/manifests/etcd.yaml \
   /tmp/k8s-manifests/

sleep 20

mv /tmp/k8s-manifests/etcd.yaml \
   /etc/kubernetes/manifests/
```

检查：

```bash
crictl ps -a | grep etcd
```

:::caution 注意

如果是多 Control Plane 集群，重启控制平面组件时应该结合高可用拓扑进行操作，避免同时影响多个 Control Plane。

如果是单 Control Plane 集群，更应该严格遵守“一个组件一个组件重启”的原则。

:::

---

## static Pod 没有因为删除 Mirror Pod 而真正重启

在实际排障中可能遇到：

```bash
kubectl delete pod kube-controller-manager-xxx -n kube-system
```

执行成功，但是控制平面组件实际运行的 container 并没有按照预期重新创建。

这是因为：

```text
kubectl delete pod
        ↓
删除 API Server 中的 Mirror Pod 对象
        ↓
并不等价于直接停止节点上的 static Pod container
```

static Pod 的真正运行状态由 kubelet 和容器运行时负责。

因此需要结合：

```bash
crictl ps -a
```

检查真实 container。

例如：

```bash
crictl ps -a | grep kube-controller-manager
```

如果确认旧 container 仍然存在，可以结合具体运行时状态进行处理。

在实际故障恢复中，如果确认需要停止旧的 static Pod container，可以使用：

```bash
crictl stop <CONTAINER_ID>
```

然后观察 kubelet 是否重新创建：

```bash
crictl ps -a | grep kube-controller-manager
```

:::tip 说明

处理 static Pod 时，建议优先使用“修改/移出 manifest → kubelet 检测到 manifest 变化 → 重新创建 Pod”的方式。

`crictl stop` 更适合作为故障排查和已经明确需要强制停止旧 container 时的辅助手段。

:::

---

## 控制平面证书更新后出现 Unauthorized

例如：

```text
Unauthorized
```

或者 kube-controller-manager 日志中出现：

```text
x509: certificate has expired or is not yet valid
```

首先确认对应证书：

```bash
kubeadm certs check-expiration
```

然后确认实际配置文件：

```bash
ls -lah /etc/kubernetes/controller-manager.conf
ls -lah /etc/kubernetes/scheduler.conf
ls -lah /etc/kubernetes/admin.conf
```

如果已经执行：

```bash
kubeadm certs renew all
```

需要确保对应 static Pod 已经真正重新加载新的 kubeconfig。

可以检查：

```bash
crictl ps -a | grep kube-controller-manager
```

并查看：

```bash
kubectl logs -n kube-system <controller-manager-pod> --tail=100
```

如果 Mirror Pod 日志获取不到，可以使用容器运行时：

```bash
crictl ps -a | grep kube-controller-manager
```

然后：

```bash
crictl logs <CONTAINER_ID>
```

---

# 证书过期后的完整恢复流程

如果遇到类似：

```text
控制平面证书过期
+
kubelet 客户端证书过期
+
Node NotReady
+
CSR Pending
```

建议按照下面顺序处理。

## 第一步：确认集群状态

```bash
kubectl get nodes -o wide
```

```bash
kubectl get pods -A
```

```bash
kubectl get csr
```

---

## 第二步：检查控制平面证书

```bash
kubeadm certs check-expiration
```

---

## 第三步：检查 kubelet 证书

在每个异常 Node：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

---

## 第四步：先恢复异常 Node 的 kubelet 认证

在正常 Control Plane：

```bash
NODE=k8s-node01

kubeadm kubeconfig user \
  --org system:nodes \
  --client-name system:node:$NODE \
  > /root/${NODE}-kubelet.conf
```

复制：

```bash
scp /root/${NODE}-kubelet.conf root@${NODE}:/etc/kubernetes/kubelet.conf
```

Node 上：

```bash
chmod 600 /etc/kubernetes/kubelet.conf
systemctl restart kubelet
```

然后检查：

```bash
systemctl status kubelet --no-pager
journalctl -u kubelet --since "10 minutes ago" --no-pager
```

---

## 第五步：确认 kubelet 新证书

```bash
ls -lah /var/lib/kubelet/pki/
```

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

---

## 第六步：处理 CSR

```bash
kubectl get csr
```

对于确认属于目标 Node 的 Pending CSR：

```bash
kubectl describe csr <CSR_NAME>
```

确认无误后：

```bash
kubectl certificate approve <CSR_NAME>
```

---

## 第七步：恢复控制平面证书

```bash
kubeadm certs renew all
```

然后：

```bash
kubeadm certs check-expiration
```

---

## 第八步：逐个重启 static Pod

不要一次性移动全部 manifest。

按照实际需要：

```text
etcd
kube-apiserver
kube-controller-manager
kube-scheduler
```

一个一个处理，并在每一步确认组件恢复正常。

---

## 第九步：最终验证

```bash
kubectl get nodes -o wide
```

```bash
kubectl get pods -A
```

```bash
kubectl get pods -n kube-system
```

```bash
kubectl get csr
```

```bash
kubeadm certs check-expiration
```

Node 上：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates
```

---

# 证书更新完成后的检查

## 1. 检查 kubeadm 管理的证书

```bash
kubeadm certs check-expiration
```

确认不存在：

```text
<invalid>
```

---

## 2. 检查 kubelet 证书

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

确认：

```text
subject=O = system:nodes, CN = system:node:<NODE_NAME>
```

并确认 `notAfter` 在未来。

---

## 3. 检查 kubelet 配置

```bash
grep -nE 'rotateCertificates|serverTLSBootstrap' /var/lib/kubelet/config.yaml
```

确认：

```text
rotateCertificates: true
```

---

## 4. 检查 kubelet.conf

```bash
grep -nE 'client-certificate|client-key|client-certificate-data|client-key-data' /etc/kubernetes/kubelet.conf
```

确认 kubelet 可以使用当前轮转证书：

```text
/var/lib/kubelet/pki/kubelet-client-current.pem
```

---

## 5. 检查 Node

```bash
kubectl get nodes -o wide
```

应该全部：

```text
Ready
```

---

## 6. 检查所有 Pod

```bash
kubectl get pods -A
```

重点确认：

```text
STATUS
READY
RESTARTS
```

没有持续异常。

---

## 7. 检查 kube-system

```bash
kubectl get pods -n kube-system -o wide
```

重点关注：

```text
etcd
kube-apiserver
kube-controller-manager
kube-scheduler
coredns
kube-proxy
```

---

## 8. 检查 CSR

```bash
kubectl get csr
```

正常情况下不应该长期存在无法解释的：

```text
Pending
```

---

## 9. 检查 kubelet 日志

```bash
journalctl -u kubelet --since "30 minutes ago" --no-pager
```

重点关注：

```text
x509
certificate
Unauthorized
authentication
system:anonymous
```

如果证书恢复后仍然持续出现这些错误，需要继续排查 kubelet.conf、RBAC、CSR 和 API Server。

---

## 10. 检查 API Server

```bash
kubectl get --raw='/readyz?verbose'
```

确认：

```text
ok
```

---

# 证书更新相关的重要注意事项

## 1. kubeadm certs renew all 不等于更新所有 Kubernetes 证书

错误理解：

```text
kubeadm certs renew all
        ↓
所有 Kubernetes 证书全部更新
```

正确理解：

```text
kubeadm certs renew all
        ↓
更新 kubeadm 管理的控制平面/客户端证书
```

kubelet 客户端证书需要单独关注：

```text
/var/lib/kubelet/pki/kubelet-client-current.pem
```

---

## 2. kubelet 正常情况下应该自动轮转

如果：

```yaml
rotateCertificates: true
```

那么一般不需要每年手动生成 kubelet.conf。

如果出现证书过期，应优先排查：

```bash
kubectl get csr
```

以及：

```bash
journalctl -u kubelet
```

而不是简单地每年人工复制一次 kubelet.conf。

---

## 3. certificateValidityPeriod 不代表 kubelet 每年都需要人工更新

例如 kubeadm 配置：

```yaml
certificateValidityPeriod: 8760h
```

代表 kubeadm 生成的相关证书有效期约为一年。

但是 kubelet 的客户端证书有自动轮转机制。

因此：

```text
证书有效期 1 年
```

不代表：

```text
每年手工更新 kubelet
```

---

## 4. 不要删除 CA 私钥

绝对不要因为证书过期就删除：

```text
/etc/kubernetes/pki/ca.key
```

也不要把它复制到 Node。

---

## 5. 不要直接删除整个 pki 目录

不要执行：

```bash
rm -rf /etc/kubernetes/pki
```

这可能造成严重的集群故障。

---

## 6. 不要一次性停止所有 static Pod

尤其是单 Control Plane 集群。

不要直接：

```bash
mv /etc/kubernetes/manifests/* /tmp/
```

应该：

```text
一个组件
    ↓
确认恢复
    ↓
下一个组件
```

---

## 7. 不要无条件 approve 所有 CSR

不要直接：

```bash
kubectl get csr | grep Pending | awk '{print $1}' | xargs kubectl certificate approve
```

应该：

```bash
kubectl get csr
```

然后：

```bash
kubectl describe csr <CSR_NAME>
```

确认身份后：

```bash
kubectl certificate approve <CSR_NAME>
```

---

# 常用命令汇总

## 查看证书

```bash
kubeadm certs check-expiration
```

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

---

## 查看 kubelet

```bash
systemctl status kubelet --no-pager
```

```bash
journalctl -u kubelet --since "30 minutes ago" --no-pager
```

```bash
grep -nE 'rotateCertificates|serverTLSBootstrap' /var/lib/kubelet/config.yaml
```

---

## 查看 CSR

```bash
kubectl get csr
```

```bash
kubectl describe csr <CSR_NAME>
```

```bash
kubectl certificate approve <CSR_NAME>
```

---

## 查看集群

```bash
kubectl get nodes -o wide
```

```bash
kubectl get pods -A
```

```bash
kubectl get pods -n kube-system -o wide
```

---

## 查看 static Pod

```bash
ls -lah /etc/kubernetes/manifests/
```

```bash
crictl ps -a
```

```bash
crictl ps -a | grep kube-controller-manager
```

```bash
crictl ps -a | grep kube-apiserver
```

```bash
crictl ps -a | grep kube-scheduler
```

```bash
crictl ps -a | grep etcd
```

---

# 实际故障案例：控制平面和 kubelet 证书同时过期

以下是一次实际证书故障的典型恢复过程，用于说明为什么不能只执行 `kubeadm certs renew all`。

## 故障表现

控制平面组件出现：

```text
x509: certificate has expired or is not yet valid
```

例如 kube-controller-manager 使用的客户端证书已经过期。

同时 Node 上：

```text
kubelet-client-current.pem
```

也已经过期。

Node kubelet 日志中可能出现：

```text
system:anonymous
```

或者：

```text
Unauthorized
```

此时可能看到：

```bash
kubectl get nodes
```

部分 Node：

```text
NotReady
```

---

## 第一阶段：恢复 controller-manager

检查：

```bash
kubeadm certs check-expiration
```

执行：

```bash
kubeadm certs renew all
```

然后：

```bash
kubeadm certs check-expiration
```

确认 controller-manager 证书已经更新。

如果 controller-manager 仍然使用旧证书，需要让 static Pod 真正重新加载。

检查：

```bash
crictl ps -a | grep kube-controller-manager
```

必要时停止旧 container：

```bash
crictl stop <CONTAINER_ID>
```

然后等待 kubelet 重建。

检查：

```bash
crictl ps -a | grep kube-controller-manager
```

并观察日志：

```bash
crictl logs <CONTAINER_ID>
```

---

## 第二阶段：恢复 kubelet

发现 Node 上：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -dates \
  -subject \
  -serial
```

显示证书已经过期。

此时不能只执行：

```bash
kubeadm certs renew all
```

而应该在正常 Control Plane 上：

```bash
NODE=k8s-node01

kubeadm kubeconfig user \
  --org system:nodes \
  --client-name system:node:$NODE \
  > /root/${NODE}-kubelet.conf
```

复制：

```bash
scp /root/${NODE}-kubelet.conf root@${NODE}:/etc/kubernetes/kubelet.conf
```

Node 上：

```bash
chmod 600 /etc/kubernetes/kubelet.conf
systemctl restart kubelet
```

然后：

```bash
ls -lah /var/lib/kubelet/pki/
```

确认：

```bash
kubelet-client-current.pem
```

已经生成并指向新的证书。

检查：

```bash
openssl x509 \
  -in /var/lib/kubelet/pki/kubelet-client-current.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -serial
```

确认：

```text
CN=system:node:k8s-node01
O=system:nodes
```

以及新的 `notAfter`。

---

## 第三阶段：确认 Node 恢复

```bash
kubectl get nodes -o wide
```

确认：

```text
k8s-node01   Ready
```

然后：

```bash
kubectl get pods -A
```

确认业务 Pod 和系统 Pod 恢复。

---

# 结论

kubeadm 管理的 Kubernetes 证书需要区分两类：

```text
                 Kubernetes 证书
                       │
          ┌────────────┴────────────┐
          │                         │
    kubeadm 管理的证书          kubelet 客户端证书
          │                         │
    kubeadm certs renew all      自动轮转
          │                         │
    控制平面组件                /var/lib/kubelet/pki/
    admin.conf
    controller-manager.conf
    scheduler.conf
    apiserver
    etcd 等
```

正常情况下：

```text
控制平面证书
    ↓
定期检查
    ↓
kubeadm certs renew all
```

而：

```text
kubelet 客户端证书
    ↓
rotateCertificates: true
    ↓
自动生成 CSR
    ↓
CSR 被批准
    ↓
自动生成新证书
```

因此最重要的不是“每年手工更新一次证书”，而是建立一套完整的证书检查和恢复机制：

```text
检查证书
   ↓
发现即将过期
   ↓
正常更新
   ↓
确认 kubelet 自动轮转
   ↓
检查 CSR
   ↓
检查 static Pod
   ↓
检查 Node
   ↓
检查所有 Pod
   ↓
完成验证
```

如果真的发生证书过期：

```text
先确认故障范围
      ↓
恢复 kubelet 认证
      ↓
恢复控制平面证书
      ↓
逐个重新加载 static Pod
      ↓
检查 CSR
      ↓
检查 Node Ready
      ↓
检查系统 Pod
      ↓
检查业务 Pod
      ↓
最终确认所有证书有效
```

官方文档：

- kubeadm 证书管理  
  https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/

- kubelet 证书自动轮转  
  https://kubernetes.io/docs/tasks/tls/certificate-rotation/

- kubeadm Troubleshooting  
  https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/

- kubelet client certificate troubleshooting  
  https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/#kubelet-client-cert

