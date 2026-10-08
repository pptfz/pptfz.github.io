# Rocky10 二进制部署 Kubernetes v1.37

> 参考文档：[kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
>
> Kubernetes 官方文档**不提供**二进制安装指南（官方只认可 kubeadm/kind/minikube 等方式），本文遵循 the-hard-way 的思路：逐个组件手工部署，把 apiserver、etcd、证书、kubelet 的关系彻底搞清楚。**生产环境请使用 kubeadm。**

## 全局变量（唯一需要修改的地方）

**所有版本号、IP、网段都集中定义在下面的 `env.sh` 里，换版本/换 IP 只改这一处**。在 master-1 上创建，之后分发给所有节点：

```bash
mkdir -p ~/k8s-hard-way
cat > ~/k8s-hard-way/env.sh <<'EOF'
# ============ 软件版本（换版本只改这里） ============
export K8S_VERSION=v1.37.1
export ETCD_VERSION=v3.7.2
export CONTAINERD_VERSION=v2.4.1
export RUNC_VERSION=v1.5.2
export CNI_VERSION=v1.9.1
export CFSSL_VERSION=1.6.5
export COREDNS_VERSION=v1.12.1

# ============ 节点 IP（换机器只改这里） ============
export MASTER_NAME=master-1
export MASTER_IP=192.168.100.11
export WORKER1_NAME=worker-1
export WORKER1_IP=192.168.100.12
export WORKER2_NAME=worker-2
export WORKER2_IP=192.168.100.13

# ============ 网段规划 ============
export SERVICE_CIDR=10.32.0.0/24
export CLUSTER_DNS=10.32.0.10
export POD_CIDR_BASE=10.200           # Pod 网段前缀
# 每个 worker 的 Pod CIDR 自动算：worker-1=10.200.1.0/24, worker-2=10.200.2.0/24
export POD_CIDR_BASE_16="${POD_CIDR_BASE}.0.0/16"

# ============ 路径 ============
export HW_DIR=~/k8s-hard-way

# ============ 架构自适应（ARM / x86_64 都不用动） ============
case "$(uname -m)" in
  x86_64)  export PKG_ARCH="amd64" ;;
  aarch64) export PKG_ARCH="arm64" ;;
  *) echo "不支持的架构: $(uname -m)"; exit 1 ;;
esac
EOF
```

:::tip 说明
每个节点都需要一份 `env.sh`（后续 `scp` 分发）。**每次新开终端先 `source ~/k8s-hard-way/env.sh`**，否则变量为空。核心变量对照表：

| 变量 | 含义 | 默认值 |
|------|------|--------|
| `K8S_VERSION` | Kubernetes 版本 | v1.37.1 |
| `ETCD_VERSION` | etcd 版本 | v3.7.2 |
| `CONTAINERD_VERSION` | containerd 版本 | v2.4.1 |
| `POD_CIDR_BASE` | Pod 网段前缀 | 10.200 |
| `MASTER_IP` / `WORKER1_IP` / `WORKER2_IP` | 三台节点 IP | 192.168.100.11-13 |
| `SERVICE_CIDR` | Service 网段 | 10.32.0.0/24 |
| `CLUSTER_DNS` | 集群 DNS 固定 IP | 10.32.0.10 |
:::

> 组件版本为 2026-09 实测最新稳定版。集群拓扑：1 控制平面（master-1，含 etcd）+ 2 工作节点，worker-1/2 的 Pod 网段分别为 `10.200.1.0/24`、`10.200.2.0/24`（由 `POD_CIDR_BASE` 推导）。

## 00. 前置准备（所有节点执行）

```bash
source ~/k8s-hard-way/env.sh
```

Rocky Linux 10 的基础配置（主机名按节点分别设置）：

```bash
hostnamectl set-hostname master-1   # worker-1 / worker-2

# 写 hosts（所有节点）
cat >> /etc/hosts <<EOF
${MASTER_IP} ${MASTER_NAME}
${WORKER1_IP} ${WORKER1_NAME}
${WORKER2_IP} ${WORKER2_NAME}
EOF
```

```bash
# 关闭 swap（kubelet 默认拒绝 swap）
swapoff -a
sed -ri 's/^([^#].*\sswap\s)/#\1/' /etc/fstab

# 关闭 firewalld（二进制部署自己管端口，学习环境直接关）
systemctl disable --now firewalld

# SELinux 设为 permissive（Rocky10 默认 enforcing）
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

# 时间同步
dnf install -y chrony
systemctl enable --now chronyd

# 内核模块与网络参数
cat > /etc/modules-load.d/k8s.conf <<EOF
overlay
br_netfilter
EOF
modprobe overlay && modprobe br_netfilter

cat > /etc/sysctl.d/k8s.conf <<EOF
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system
```

## 01. 安装客户端工具（Mac 或跳板机）

kubectl 与 cfssl 在 Mac 上装一份，后续所有证书、kubeconfig 都在这一步生成后分发到虚机。

```bash
# kubectl（Apple Silicon 用 darwin/arm64，Intel Mac 换 darwin/amd64）
curl -LO "https://dl.k8s.io/release/${K8S_VERSION}/bin/darwin/arm64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# cfssl：Mac 上也可以 brew install cfssl
brew install cfssl
```

:::tip 说明
国内下载 `dl.k8s.io` 慢或不通时，可用镜像：`https://mirrors.aliyun.com/kubernetes-release/release/${K8S_VERSION}/bin/...`（路径结构相同）。GitHub 上的 etcd/containerd/CNI 包同理可加 ghproxy 类加速前缀。镜像可用性会变化，以实际测试为准。
:::

## 02. 生成证书（在 master-1 上执行）

二进制部署的核心难点之一：**组件之间全靠 mTLS 互信**，证书体系要自己搭。用 CFSSL 生成。

在 master-1 上装 cfssl：

```bash
source ~/k8s-hard-way/env.sh
curl -LO "https://github.com/cloudflare/cfssl/releases/download/v${CFSSL_VERSION}/cfssl_${CFSSL_VERSION}_linux_${PKG_ARCH}"
curl -LO "https://github.com/cloudflare/cfssl/releases/download/v${CFSSL_VERSION}/cfssljson_${CFSSL_VERSION}_linux_${PKG_ARCH}"
chmod +x cfssl_${CFSSL_VERSION}_linux_${PKG_ARCH} cfssljson_${CFSSL_VERSION}_linux_${PKG_ARCH}
mv cfssl_${CFSSL_VERSION}_linux_${PKG_ARCH} /usr/local/bin/cfssl
mv cfssljson_${CFSSL_VERSION}_linux_${PKG_ARCH} /usr/local/bin/cfssljson
```

### CA 根证书

```bash
mkdir -p ${HW_DIR}/certs && cd ${HW_DIR}/certs

cat > ca-config.json <<EOF
{
  "signing": {
    "default": { "expiry": "8760h" },
    "profiles": {
      "kubernetes": {
        "usages": ["signing", "key encipherment", "server auth", "client auth"],
        "expiry": "8760h"
      }
    }
  }
}
EOF

cat > ca-csr.json <<EOF
{
  "CN": "Kubernetes",
  "key": { "algo": "rsa", "size": 2048 },
  "names": [{ "C": "CN", "L": "Beijing", "O": "Kubernetes", "OU": "CA" }]
}
EOF

cfssl gencert -initca ca-csr.json | cfssljson -bare ca
# 产出：ca.pem / ca-key.pem
```

### 各组件证书

```bash
# admin（kubectl 用）
cat > admin-csr.json <<EOF
{
  "CN": "admin",
  "key": { "algo": "rsa", "size": 2048 },
  "names": [{ "O": "system:masters", "OU": "Kubernetes" }]
}
EOF
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes admin-csr.json | cfssljson -bare admin

# controller-manager / scheduler / kube-proxy
for comp in kube-controller-manager kube-scheduler kube-proxy; do
  cat > ${comp}-csr.json <<EOF
{
  "CN": "system:${comp}",
  "key": { "algo": "rsa", "size": 2048 },
  "names": [{ "O": "system:kube-${comp}", "OU": "Kubernetes" }]
}
EOF
  cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes ${comp}-csr.json | cfssljson -bare ${comp}
done

# service account 签名密钥对
openssl genrsa -out service-account.key 2048
openssl rsa -in service-account.key -pubout -out service-account.pem
```

**kube-apiserver 服务端证书**（SAN 里必须包含所有访问方式：IP、域名、Service 网段首 IP）：

```bash
SERVICE_CIDR_FIRST=$(echo ${SERVICE_CIDR} | cut -d. -f1-3).1

cat > kube-apiserver-csr.json <<EOF
{
  "CN": "kube-apiserver",
  "key": { "algo": "rsa", "size": 2048 },
  "hosts": [
    "${MASTER_IP}",
    "${SERVICE_CIDR_FIRST}",
    "kubernetes",
    "kubernetes.default",
    "kubernetes.default.svc",
    "kubernetes.default.svc.cluster",
    "kubernetes.default.svc.cluster.local",
    "127.0.0.1"
  ],
  "names": [{ "O": "Kubernetes", "OU": "Kubernetes" }]
}
EOF
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-apiserver-csr.json | cfssljson -bare kube-apiserver
```

:::caution 注意
`${SERVICE_CIDR_FIRST}`（Service 网段第一个 IP，如 `10.32.0.1`）会被 kubernetes 服务的 ClusterIP 占用；漏掉它，pod 内访问 kubernetes service 会报证书错误。
:::

**kubelet 客户端证书**（每个 worker 一张，CN 必须是 `system:node:<节点名>`）：

```bash
for instance in ${WORKER1_NAME} ${WORKER2_NAME}; do
  IP=$(grep ${instance} /etc/hosts | awk '{print $1}')
  cat > ${instance}-csr.json <<EOF
{
  "CN": "system:node:${instance}",
  "key": { "algo": "rsa", "size": 2048 },
  "names": [{ "O": "system:nodes", "OU": "Kubernetes" }]
}
EOF
  cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json \
    -hostname=${instance},${IP} -profile=kubernetes ${instance}-csr.json | cfssljson -bare ${instance}
done
```

**etcd 服务端证书**：

```bash
cat > etcd-csr.json <<EOF
{
  "CN": "etcd",
  "key": { "algo": "rsa", "size": 2048 },
  "hosts": ["${MASTER_NAME}", "${MASTER_IP}", "127.0.0.1"],
  "names": [{ "O": "Kubernetes", "OU": "Kubernetes" }]
}
EOF
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes etcd-csr.json | cfssljson -bare etcd
```

## 03. 生成 kubeconfig

kubeconfig = 客户端连接 apiserver 的"通讯录 + 身份证"（集群地址 + CA + 用户证书）。

```bash
KUBECONFIG_DIR=${HW_DIR}/kubeconfigs && mkdir -p $KUBECONFIG_DIR

# 通用生成函数
gen_kubeconfig() {
  local name=$1 user=$2
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=${HW_DIR}/certs/ca.pem \
    --embed-certs=true \
    --server=https://${CLUSTER_DNS}:6443 \
    --kubeconfig=$KUBECONFIG_DIR/${name}.kubeconfig
  kubectl config set-credentials ${user} \
    --client-certificate=${HW_DIR}/certs/${name}.pem \
    --client-key=${HW_DIR}/certs/${name}-key.pem \
    --embed-certs=true \
    --kubeconfig=$KUBECONFIG_DIR/${name}.kubeconfig
  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=${user} \
    --kubeconfig=$KUBECONFIG_DIR/${name}.kubeconfig
  kubectl config use-context default --kubeconfig=$KUBECONFIG_DIR/${name}.kubeconfig
}

gen_kubeconfig kube-controller-manager system:kube-controller-manager
gen_kubeconfig kube-scheduler system:kube-scheduler
gen_kubeconfig kube-proxy system:kube-proxy
gen_kubeconfig admin admin
```

**kubelet 的 bootstrap kubeconfig**（TLS Bootstrapping：kubelet 先用 token 引导，再自动换正式证书）：

```bash
BOOTSTRAP_TOKEN=$(head -c 16 /dev/urandom | od -An -t x | tr -d ' \n')
echo "Bootstrap Token: ${BOOTSTRAP_TOKEN}"
# 记下来，05 节 token.csv 要用
echo ${BOOTSTRAP_TOKEN} > ${HW_DIR}/bootstrap-token

kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=${HW_DIR}/certs/ca.pem --embed-certs=true \
  --server=https://${CLUSTER_DNS}:6443 \
  --kubeconfig=$KUBECONFIG_DIR/bootstrap.kubeconfig
kubectl config set-credentials kubelet-bootstrap \
  --token=${BOOTSTRAP_TOKEN} \
  --kubeconfig=$KUBECONFIG_DIR/bootstrap.kubeconfig
kubectl config set-context default \
  --cluster=kubernetes-the-hard-way --user=kubelet-bootstrap \
  --kubeconfig=$KUBECONFIG_DIR/bootstrap.kubeconfig
kubectl config use-context default --kubeconfig=$KUBECONFIG_DIR/bootstrap.kubeconfig
```

:::tip 说明
token 要在后面 apiserver 的 `token.csv` 里登记，kubelet 才有权限发起 CSR 请求。这也是为什么二进制部署必须理解 RBAC：**每一步"谁有权干什么"都是自己配出来的**。
:::

## 04. 数据加密配置

etcd 里的 Secret 默认明文存储，生成加密配置让 apiserver 加密写入：

```bash
ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64)

cat > ${HW_DIR}/encryption-config.yaml <<EOF
kind: EncryptionConfig
apiVersion: v1
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: ${ENCRYPTION_KEY}
      - identity: {}
EOF
```

## 05. 部署 etcd（master-1）

```bash
source ~/k8s-hard-way/env.sh
cd /tmp
curl -LO "https://github.com/etcd-io/etcd/releases/download/${ETCD_VERSION}/etcd-${ETCD_VERSION}-linux-${PKG_ARCH}.tar.gz"
tar -xzf etcd-${ETCD_VERSION}-linux-${PKG_ARCH}.tar.gz
mv etcd-${ETCD_VERSION}-linux-${PKG_ARCH}/etcd* /usr/local/bin/

mkdir -p /etc/etcd /var/lib/etcd
cp ${HW_DIR}/certs/{ca,kube-apiserver,etcd}*.pem /etc/etcd/
```

```bash
cat > /etc/etcd/etcd.service <<EOF
[Unit]
Description=etcd key-value store
Documentation=https://etcd.io/docs
After=network.target

[Service]
User=root
ExecStart=/usr/local/bin/etcd \\
  --name ${MASTER_NAME} \\
  --cert-file=/etc/etcd/etcd.pem \\
  --key-file=/etc/etcd/etcd-key.pem \\
  --peer-cert-file=/etc/etcd/etcd.pem \\
  --peer-key-file=/etc/etcd/etcd-key.pem \\
  --trusted-ca-file=/etc/etcd/ca.pem \\
  --peer-trusted-ca-file=/etc/etcd/ca.pem \\
  --peer-client-cert-auth \\
  --client-cert-auth \\
  --initial-advertise-peer-urls https://${MASTER_IP}:2380 \\
  --listen-peer-urls https://${MASTER_IP}:2380 \\
  --listen-client-urls https://${MASTER_IP}:2379,https://127.0.0.1:2379 \\
  --advertise-client-urls https://${MASTER_IP}:2379 \\
  --initial-cluster-token etcd-cluster-0 \\
  --initial-cluster ${MASTER_NAME}=https://${MASTER_IP}:2380 \\
  --initial-cluster-state new \\
  --data-dir /var/lib/etcd
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now etcd
```

验证：

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/etcd/ca.pem \
  --cert=/etc/etcd/etcd.pem \
  --key=/etc/etcd/etcd-key.pem \
  endpoint health
```

:::tip 说明
生产环境 etcd 至少 3 节点（raft 多数派）。单节点仅供学习，扩成 3 节点只需把 `--initial-cluster` 写成三个成员再重启。
:::

## 06. 部署控制平面（master-1）

```bash
source ~/k8s-hard-way/env.sh
cd /tmp
# 下载 kubernetes server 二进制包（内含 apiserver/controller-manager/scheduler/kubectl）
curl -LO "https://dl.k8s.io/release/${K8S_VERSION}/kubernetes-server-linux-${PKG_ARCH}.tar.gz"
tar -xzf kubernetes-server-linux-${PKG_ARCH}.tar.gz
mv kubernetes/server/bin/{kube-apiserver,kube-controller-manager,kube-scheduler,kubectl} /usr/local/bin/

mkdir -p /var/lib/kubernetes /etc/kubernetes
cp ${HW_DIR}/certs/{ca.pem,ca-key.pem,kube-apiserver-key.pem,kube-apiserver.pem,service-account.key,service-account.pem} /var/lib/kubernetes/
cp ${HW_DIR}/encryption-config.yaml /var/lib/kubernetes/
# 把 bootstrap token 写入 token.csv（第一列 token，第二列用户名）
echo "$(cat ${HW_DIR}/bootstrap-token),kubelet-bootstrap,10001,system:kubelet-bootstrap" > /var/lib/kubernetes/token.csv
cp ${HW_DIR}/kubeconfigs/{kube-controller-manager,kube-scheduler}.kubeconfig /var/lib/kubernetes/
```

**kube-apiserver systemd**（v1.37 参数已比老教程精简很多，注意 `--service-account-issuer` 是必填）：

```bash
cat > /etc/systemd/system/kube-apiserver.service <<EOF
[Unit]
Description=Kubernetes API Server
After=etcd.service

[Service]
ExecStart=/usr/local/bin/kube-apiserver \\
  --advertise-address=${MASTER_IP} \\
  --allow-privileged=true \\
  --authorization-mode=Node,RBAC \\
  --bind-address=0.0.0.0 \\
  --client-ca-file=/var/lib/kubernetes/ca.pem \\
  --enable-admission-plugins=NodeRestriction \\
  --encryption-provider-config=/var/lib/kubernetes/encryption-config.yaml \\
  --etcd-cafile=/var/lib/kubernetes/ca.pem \\
  --etcd-certfile=/var/lib/kubernetes/kube-apiserver.pem \\
  --etcd-keyfile=/var/lib/kubernetes/kube-apiserver-key.pem \\
  --etcd-servers=https://${MASTER_IP}:2379 \\
  --kubelet-certificate-authority=/var/lib/kubernetes/ca.pem \\
  --kubelet-client-certificate=/var/lib/kubernetes/kube-apiserver.pem \\
  --kubelet-client-key=/var/lib/kubernetes/kube-apiserver-key.pem \\
  --service-account-issuer=https://kubernetes.default.svc.cluster.local \\
  --service-account-key-file=/var/lib/kubernetes/service-account.pem \\
  --service-account-signing-key-file=/var/lib/kubernetes/service-account.key \\
  --service-cluster-ip-range=${SERVICE_CIDR} \\
  --service-node-port-range=30000-32767 \\
  --tls-cert-file=/var/lib/kubernetes/kube-apiserver.pem \\
  --tls-private-key-file=/var/lib/kubernetes/kube-apiserver-key.pem \\
  --token-auth-file=/var/lib/kubernetes/token.csv \\
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

**kube-controller-manager**：

```bash
cat > /etc/systemd/system/kube-controller-manager.service <<'EOF'
[Unit]
Description=Kubernetes Controller Manager
After=kube-apiserver.service

[Service]
ExecStart=/usr/local/bin/kube-controller-manager \
  --cluster-name=kubernetes-the-hard-way \
  --kubeconfig=/var/lib/kubernetes/kube-controller-manager.kubeconfig \
  --leader-elect=true \
  --root-ca-file=/var/lib/kubernetes/ca.pem \
  --service-account-private-key-file=/var/lib/kubernetes/service-account.key \
  --use-service-account-credentials=true \
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

**kube-scheduler**：

```bash
cat > /etc/systemd/system/kube-scheduler.service <<'EOF'
[Unit]
Description=Kubernetes Scheduler
After=kube-apiserver.service

[Service]
ExecStart=/usr/local/bin/kube-scheduler \
  --kubeconfig=/var/lib/kubernetes/kube-scheduler.kubeconfig \
  --leader-elect=true \
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

启动三件套并配置 kubectl（master-1 上直接连）：

```bash
systemctl daemon-reload
systemctl enable --now kube-apiserver kube-controller-manager kube-scheduler

mkdir -p ~/.kube
cp ${HW_DIR}/kubeconfigs/admin.kubeconfig ~/.kube/config
kubectl version
```

:::caution 注意
controller-manager 用了 `--use-service-account-credentials=true`，需要给它下面各 system:controller 账号配 RBAC，见 07 节，不配的话 controller 会一直报 forbidden。
:::

## 07. RBAC 授权

apiserver 访问 kubelet（`kubectl logs`/`exec` 需要）：

```bash
cat > apiserver-to-kubelet-rbac.yaml <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: system:kube-apiserver-to-kubelet
rules:
  - apiGroups: [""]
    resources: ["nodes", "nodes/proxy", "nodes/stats", "nodes/log", "pods", "pods/log"]
    verbs: ["create", "get", "list", "watch", "delete", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: system:kube-apiserver
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:kube-apiserver-to-kubelet
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: kube-apiserver
EOF
kubectl apply -f apiserver-to-kubelet-rbac.yaml
```

controller-manager / scheduler / kubelet bootstrap 的授权（the-hard-way 的标准做法）：

```bash
cat > cm-scheduler-rbac.yaml <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: system:kube-controller-manager
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: system:kube-controller-manager
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: system:kube-scheduler
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: system:kube-scheduler
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubelet-bootstrap
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:node-bootstrapper
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: Group
    name: system:bootstrappers
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-autoapprove-bootstrap
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:certificates.k8s.io:certificatesigningrequests:nodeclient
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: Group
    name: system:bootstrappers
EOF
kubectl apply -f cm-scheduler-rbac.yaml
```

:::tip 说明
`node-autoapprove-bootstrap` 这条绑定让 kubelet 的证书签名请求（CSR）自动被批准——TLS Bootstrapping 能全自动的关键就在这一条 RBAC。
:::

## 08. 部署工作节点（worker-1、worker-2 都执行）

先把 master-1 上的 env.sh 和二进制分发过去（master-1 上执行）：

```bash
for instance in ${WORKER1_NAME} ${WORKER2_NAME}; do
  WIP=$(grep ${instance} /etc/hosts | awk '{print $1}')
  ssh root@${WIP} "mkdir -p ~/k8s-hard-way /usr/local/bin /var/lib/kubelet /var/lib/kube-proxy"
  scp ~/k8s-hard-way/env.sh root@${WIP}:~/k8s-hard-way/
  scp /tmp/kubernetes/server/bin/{kubelet,kube-proxy} root@${WIP}:/usr/local/bin/
  scp ${HW_DIR}/certs/ca.pem root@${WIP}:/var/lib/kubelet/
done
```

:::tip 说明
worker-1 / worker-2 上先 `source ~/k8s-hard-way/env.sh`。以下每个命令块都默认已 source。
:::

### 8.1 containerd + runc + CNI 插件

```bash
cd /tmp
# runc
curl -LO "https://github.com/opencontainers/runc/releases/download/${RUNC_VERSION}/runc.${PKG_ARCH}"
install -m 755 runc.${PKG_ARCH} /usr/local/sbin/runc

# containerd 静态包
curl -LO "https://github.com/containerd/containerd/releases/download/${CONTAINERD_VERSION}/containerd-${CONTAINERD_VERSION}-linux-${PKG_ARCH}.tar.gz"
tar -xzf containerd-${CONTAINERD_VERSION}-linux-${PKG_ARCH}.tar.gz -C /usr/local/

# CNI 插件
mkdir -p /opt/cni/bin
curl -LO "https://github.com/containernetworking/plugins/releases/download/${CNI_VERSION}/cni-plugins-linux-${PKG_ARCH}-${CNI_VERSION}.tgz"
tar -xzf cni-plugins-linux-${PKG_ARCH}-${CNI_VERSION}.tgz -C /opt/cni/bin/

# containerd systemd 服务（从官方仓库取）
curl -LO "https://raw.githubusercontent.com/containerd/containerd/${CONTAINERD_VERSION}/containerd.service"
mv containerd.service /etc/systemd/system/
```

```bash
# 生成默认配置并开启 systemd cgroup（关键！不改 pod 一律起不来）
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

systemctl daemon-reload
systemctl enable --now containerd
```

:::caution 注意
`SystemdCgroup = true` 是新手必踩的坑。kubelet 与 containerd 的 cgroup driver 不一致时，kubelet 会报 `failed to start container ... cgroup` 错误。kubeadm 部署时这一步是自动的，二进制部署必须手动改。
:::

### 8.2 证书与 kubeconfig 分发（master-1 上执行）

```bash
for instance in ${WORKER1_NAME} ${WORKER2_NAME}; do
  WIP=$(grep ${instance} /etc/hosts | awk '{print $1}')
  ssh root@${WIP} "mkdir -p /var/lib/kubelet /var/lib/kube-proxy"
  scp ${HW_DIR}/certs/${instance}-key.pem ${HW_DIR}/certs/${instance}.pem root@${WIP}:/var/lib/kubelet/
  scp ${HW_DIR}/kubeconfigs/bootstrap.kubeconfig root@${WIP}:/var/lib/kubelet/bootstrap.kubeconfig
  scp ${HW_DIR}/kubeconfigs/kube-proxy.kubeconfig root@${WIP}:/var/lib/kube-proxy/kubeconfig
done
```

:::caution 注意
worker 的 kubelet 引用的是 **bootstrap.kubeconfig**（TLS Bootstrapping 流程：先用 token 引导，CSR 自动批准后 kubelet 自动生成自己的正式证书 kubeconfig），这就是 03 节 token 和 07 节 RBAC 的意义。
:::

### 8.3 kubelet

```bash
source ~/k8s-hard-way/env.sh

# 按本机主机名自动确定 node-ip 和 podCIDR（worker-1 → .1.0/24，worker-2 → .2.0/24）
NODE_NAME=$(hostname)
NODE_IP=$(grep ${NODE_NAME} /etc/hosts | awk '{print $1}')
NODE_SEQ=$(hostname | grep -o '[0-9]*$')
POD_CIDR_NODE="${POD_CIDR_BASE}.${NODE_SEQ}.0/24"

mkdir -p /var/lib/kubelet /var/run/kubernetes

cat > /var/lib/kubelet/kubelet-config.yaml <<EOF
kind: KubeletConfiguration
apiVersion: kubelet.config.k8s.io/v1beta1
authentication:
  x509:
    clientCAFile: /var/lib/kubelet/ca.pem
  webhook:
    enabled: true
authorization:
  mode: Webhook
clusterDomain: cluster.local
clusterDNS:
  - ${CLUSTER_DNS}
podCIDR: ${POD_CIDR_NODE}
containerRuntimeEndpoint: unix:///run/containerd/containerd.sock
resolveConflicts: preferKubeletConfig
EOF

cat > /etc/systemd/system/kubelet.service <<EOF
[Unit]
Description=Kubernetes Kubelet
After=containerd.service
Requires=containerd.service

[Service]
ExecStart=/usr/local/bin/kubelet \\
  --config=/var/lib/kubelet/kubelet-config.yaml \\
  --bootstrap-kubeconfig=/var/lib/kubelet/bootstrap.kubeconfig \\
  --kubeconfig=/var/lib/kubelet/kubeconfig \\
  --node-ip=${NODE_IP} \\
  --register-node=true \\
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now kubelet
```

:::tip 说明
`NODE_SEQ` 从主机名尾号取（worker-**1** → 1），所以 Pod CIDR 自动为 `10.200.1.0/24`。如果你的主机名尾号不是 1/2，手动指定 `POD_CIDR_NODE`。kubelet 起来后用 `kubectl get csr` 观察，CSR 自动批准后节点 Ready。
:::

### 8.4 kube-proxy

```bash
cat > /var/lib/kube-proxy/kube-proxy-config.yaml <<EOF
kind: KubeProxyConfiguration
apiVersion: kubeproxy.config.k8s.io/v1alpha1
clientConnection:
  kubeconfig: /var/lib/kube-proxy/kubeconfig
mode: iptables
clusterCIDR: ${POD_CIDR_BASE_16}
EOF

cat > /etc/systemd/system/kube-proxy.service <<'EOF'
[Unit]
Description=Kubernetes Kube Proxy
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-proxy \
  --config=/var/lib/kube-proxy/kube-proxy-config.yaml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now kube-proxy
```

## 09. Pod 网络路由（the-hard-way 特色：不用 CNI，手工配路由）

the-hard-way 的精髓是让你看见 Pod 网络的本质：**每台 worker 的 Pod 网段不同，只需要让节点间知道"哪个网段在哪台机器"**。

```bash
source ~/k8s-hard-way/env.sh
W1_POD_CIDR="${POD_CIDR_BASE}.1.0/24"
W2_POD_CIDR="${POD_CIDR_BASE}.2.0/24"
```

在 **master-1** 上：

```bash
ip route add ${W1_POD_CIDR} via ${WORKER1_IP}
ip route add ${W2_POD_CIDR} via ${WORKER2_IP}
```

在 **worker-1** 上：

```bash
ip route add ${W2_POD_CIDR} via ${WORKER2_IP}
```

在 **worker-2** 上：

```bash
ip route add ${W1_POD_CIDR} via ${WORKER1_IP}
```

:::caution 注意
手动路由只适合所有虚机在同一二层网络（Parallels 共享网络满足）。跨网段/云上环境需要 overlay 网络，这就是 Calico/Flannel 等 CNI 要解决的问题——体会完原理后建议直接装 CNI 接管。
:::

## 10. 验证集群

回到 master-1（或任何有 admin.kubeconfig 的机器）：

```bash
# 1. 节点就绪（kubelet CSR 自动批准后 NotReady → Ready）
kubectl get nodes

# 2. 部署测试应用
kubectl create deployment nginx --image=nginx:alpine --replicas=2
kubectl get pods -o wide

# 3. 跨节点访问 pod（验证路由）
POD_IP=$(kubectl get pods -o wide | awk '/nginx/{print $6; exit}')
curl -s --max-time 3 http://$POD_IP | head -5

# 4. 验证 Service / kube-proxy
kubectl expose deployment nginx --port=80
CLUSTER_IP=$(kubectl get svc nginx -o jsonpath='{.spec.clusterIP}')
curl -s --max-time 3 http://$CLUSTER_IP | head -5

# 5. 验证 DNS（需要先装 CoreDNS，见 11 节）
kubectl run dnstest --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default
```

:::tip 说明
如果 `kubectl get nodes` 一直是 NotReady：大概率是 CNI/路由没通或 kubelet CSR 没批准。排障顺序：`kubectl get csr` → `kubectl get pods -A` → 节点上 `journalctl -u kubelet -f`。
:::

## 11. 安装 CoreDNS（可选 addon）

```bash
cat > coredns.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: coredns
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: system:coredns
rules:
  - apiGroups: [""]
    resources: ["endpoints", "services", "pods", "namespaces"]
    verbs: ["list", "watch"]
  - apiGroups: ["discovery.k8s.io"]
    resources: ["endpointslices"]
    verbs: ["list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: coredns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:coredns
subjects:
  - kind: ServiceAccount
    name: coredns
    namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           fallthrough in-addr.arpa ip6.arpa
        }
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels: { k8s-app: kube-dns }
  template:
    metadata:
      labels: { k8s-app: kube-dns }
    spec:
      serviceAccountName: coredns
      containers:
        - name: coredns
          image: registry.k8s.io/coredns/coredns:${COREDNS_VERSION}
          ports:
            - containerPort: 53
              name: dns
              protocol: UDP
          args: ["-conf", "/etc/coredns/Corefile"]
---
apiVersion: v1
kind: Service
metadata:
  name: kube-dns
  namespace: kube-system
spec:
  clusterIP: ${CLUSTER_DNS}
  ports:
    - name: dns
      port: 53
      protocol: UDP
    - name: dns-tcp
      port: 53
      protocol: TCP
  selector:
    k8s-app: kube-dns
EOF
kubectl apply -f coredns.yaml
```

:::caution 注意
国内拉取 `registry.k8s.io` 镜像经常超时，可换 `registry.aliyuncs.com/google_containers/coredns:1.12.1` 等国内镜像仓库地址。
:::

## 12. 常见问题（Rocky10 + ARM 实战）

| 现象 | 原因 | 处理 |
|------|------|------|
| kubelet 起不来，报 cgroup driver 不一致 | containerd 默认 cgroupfs | 8.1 节 `SystemdCgroup = true` |
| `kubectl get nodes` 无输出 | apiserver 连不上 etcd | 查 etcd 证书 SAN、`journalctl -u etcd` |
| pod 一直 ContainerCreating | CNI 插件缺失或 CSR 未批准 | 检查 `/opt/cni/bin`、`kubectl get csr` |
| 跨节点 pod 不通 | 手动路由没配或网段写错 | `ip route` 核对 09 节 |
| pod 内解析域名失败 | CoreDNS 未装或 clusterDNS 不符 | 核对 kubelet-config 的 clusterDNS 与 kube-dns ClusterIP |
| 证书报 x509 错误 | SAN 缺 IP/域名 | 重签对应证书，注意 Service 网段首 IP |
| ARM 上镜像拉不到 | 镜像仓库无 arm64 版 | 换 multi-arch 镜像（官方镜像基本都支持） |
| 新终端命令报变量为空 | 忘了 source env.sh | `source ~/k8s-hard-way/env.sh` |

## 13. 清理集群

```bash
# 各节点
systemctl disable --now kubelet kube-proxy kube-apiserver kube-controller-manager kube-scheduler etcd containerd
rm -rf /var/lib/{kubelet,kube-proxy,etcd} /etc/{kubernetes,etcd,containerd} /opt/cni /var/run/kubernetes
ip link del cni0 2>/dev/null; ip link del flannel.1 2>/dev/null
```

## 14. 延伸：云厂商的 K8s 是怎么装的？

理解了二进制部署再看云厂商，会发现它们就是把这套东西**产品化**了：

- **托管控制平面（ACK/TKE/EKS/GKE）**：你点控制台/Terraform 创建集群时，云厂商在自己管理面用内部自动化（本质还是 kubeadm/自研 provisioner + etcd 集群）拉起多可用区 HA 控制平面，**用户看不到也管不到** master，只付控制平面费用
- **节点池**：用户指定机型/规格，云厂商用节点镜像（内预装 containerd + kubelet + 云厂商 CNI 驱动）+ bootstrap 机制（同你上面玩的 TLS Bootstrapping，只是 token 换成了云凭证）把节点自动注册进集群
- **网络**：传统 kubeadm 是 CNI（calico/flannel），云上多走 **VPC-CNI**（Pod 直接用 VPC 弹性网卡，无 overlay，性能好）
- **存储/负载均衡**：云盘对应 PV，SLB/CLB 对应 LoadBalancer Service，都是云厂商的 cloud-controller-manager 在背后调云 API 实现

也就是说：本文手动做的每一件事（证书、etcd、组件 systemd、bootstrap），云厂商都在背后自动化了一遍——这就是"学二进制部署的价值"。

## 15. 参考

- [kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way)（本文骨架来源，注意其版本较旧）
- [Kubernetes 官方 release 二进制](https://dl.k8s.io/) · [GitHub Releases](https://github.com/kubernetes/kubernetes/releases)
- [Kubernetes 组件参考](https://kubernetes.io/zh-cn/docs/concepts/overview/components/)
- [kubeadm 官方安装文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)
