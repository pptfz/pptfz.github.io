# Pod 安全标准与 PSA 准入

[toc]

## 引言

上一篇 [RBAC 与 ServiceAccount](./RBAC与ServiceAccount.md) 解决的是"**谁能操作 API**"；本文解决的是"**允许被创建的 Pod 本身有多危险**"。一个带 `privileged: true`、挂载宿主机根目录、以 root 运行的 Pod，一旦被有权限的人创建出来，基本等于把节点交了出去——RBAC 管不住这种事，因为创建 Pod 这个动作本身是合法的。

Kubernetes 的答案是两层设计：**Pod 安全标准（Pod Security Standards，PSS）** 定义了三种安全级别"该长什么样"；**Pod 安全准入（Pod Security Admission，PSA）** 是内置的准入控制器，负责在 Pod 创建时按命名空间上配置的级别做检查。本文讲清楚历史脉络、三种级别与三种模式、命名空间标签配置方法，并给出把一个普通 Deployment 改造到 restricted 级别的完整过程。适合从 0 开始学 k8s、想让集群安全基线落地的读者。

## 官方文档参考

| 页面名 | 链接 |
| --- | --- |
| Pod 安全性准入（中文） | https://kubernetes.io/zh-cn/docs/concepts/security/pod-security-admission/ |
| Pod 安全性标准（中文） | https://kubernetes.io/zh-cn/docs/concepts/security/pod-security-standards/ |
| 用命名空间标签实施 Pod 安全标准（中文） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/enforce-standards-namespace-labels/ |
| 配置内置准入控制器实施 Pod 安全标准（中文） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/enforce-standards-admission-controller/ |
| 从 PodSecurityPolicy 迁移到内置 PodSecurity 准入控制器（英文） | https://kubernetes.io/docs/tasks/configure-pod-container/migrate-from-psp/ |
| Pod 安全性标准（英文，内容更新） | https://kubernetes.io/docs/concepts/security/pod-security-standards/ |

## 1. 历史脉络：从 PSP 到 PSA

理解 PSA 之前要知道它替代了谁。

- **PodSecurityPolicy（PSP）**：Kubernetes 早期的集群级 Pod 安全策略资源，功能强大但配置繁琐（RBAC 与策略耦合）、语义不清（admit 还是 deny 靠一堆字段猜），长期被社区诟病。
- **v1.21 废弃，v1.25 彻底移除** PSP。取而代之的是内置的 **Pod Security Admission（PSA）**，同一版本（v1.25）达到 GA。
- 设计思路大转弯：PSP 是"逐 Pod 配策略"，PSA 是"**逐命名空间配级别**"——策略退化为三种标准档位，配置方式简化为给命名空间打标签。

| | PSP（已移除） | PSA（现行） |
| --- | --- | --- |
| 配置粒度 | 每个 Pod 一份策略 | 每个命名空间一组标签 |
| 策略档位 | 自由组合，语义复杂 | privileged / baseline / restricted 三档 |
| 与 RBAC 的关系 | 必须授权 use PSP，易踩坑 | 无关，纯命名空间标签驱动 |
| 版本 | v1.21 弃用，v1.25 移除 | v1.25 GA |

:::caution 老文档别再照抄
网上大量教程还在教 PSP（`kind: PodSecurityPolicy`），在 v1.25 及以后的集群（包括 v1.37）里这些清单 apply 会直接报错 "the server could not find the requested resource"。新集群请一律使用 PSA。
:::

## 2. 三种安全级别：privileged / baseline / restricted

Pod 安全标准定义了三种**叠加式**策略，从最宽松到最严格：

| 级别 | 定位 | 一句话概括 |
| --- | --- | --- |
| privileged | 系统级/基础设施负载（kube-system 里的组件、CNI、存储驱动） | 完全不限制，允许已知的特权提升 |
| baseline | 常规应用的最小阻力路径 | 禁止已知的特权提升（特权容器、hostNetwork、HostPath……），其余放行 |
| restricted | 安全敏感场景与不受信负载的当前最佳实践 | 在 baseline 之上再强制安全上下文（非 root、drop ALL、seccomp……） |

### 2.1 privileged：不设防

有目的地完全开放，允许绕过常规容器隔离（如直接使用宿主网络）。只应该给集群基础设施组件使用。

### 2.2 baseline 禁止什么（官方控制项搬运 + 解释）

| 控制 | 禁止的内容 | 为什么要禁 |
| --- | --- | --- |
| HostProcess（Windows） | `windowsOptions.hostProcess` 必须为 false/未定义 | HostProcess 容器可直接访问 Windows 宿主 |
| 宿主名字空间 | `hostNetwork`、`hostPID`、`hostIPC` 禁止 | 共享宿主网络/进程/IPC 会看到并干扰宿主与其他 Pod |
| 特权容器 | `securityContext.privileged: true` 禁止 | 特权容器几乎绕过全部隔离机制，等价于半个 root |
| 权能 | `capabilities.add` 只允许白名单（NET_BIND_SERVICE、CHOWN 等 13 项），禁止任意加 SYS_ADMIN 之类的高危权能 | Linux capabilities 决定容器能做哪些内核操作 |
| HostPath 卷 | `volumes[*].hostPath` 禁止 | 直接把宿主目录挂进容器，最容易逃逸的通道 |
| 宿主端口 | `ports[*].hostPort` 禁止或限制已知列表 | 占用宿主端口会与节点服务冲突、被外部直达 |
| 主机探针/生命周期回调（v1.34+） | 探针与 lifecycle 回调里的 `httpGet.host`/`tcpSocket.host` 禁止 | 防止把探测请求指到 Pod 网络之外的任意主机 |
| AppArmor | 只允许未设置 / `RuntimeDefault` / `Localhost` | 防止禁用默认的强制访问控制 |
| SELinux | 只允许容器标准类型（`container_t` 等），禁止自定义 user/role | 防止定制 SELinux 规则绕过隔离 |
| /proc 挂载类型 | `procMount` 只允许未定义或 `Default` | 非默认 /proc 掩码会暴露宿主信息 |
| Seccomp | 禁止显式设为 `Unconfined` | Unconfined = 不启用 seccomp 过滤 |
| sysctls | 只允许安全白名单（`net.ipv4.ip_local_port_range` 等） | 危险的内核参数影响整个节点 |

### 2.3 restricted 额外强制什么

restricted = **baseline 的全部要求** + 以下强制项（Linux Pod 适用，Windows Pod 部分豁免）：

| 控制 | 要求 | 限制的字段 |
| --- | --- | --- |
| 卷类型 | 只允许 8 种"安全"卷：configMap、csi、downwardAPI、emptyDir、ephemeral、persistentVolumeClaim、projected、secret（**HostPath 等一律禁止**） | `spec.volumes[*]` |
| 特权提升 | `allowPrivilegeEscalation` 必须显式为 `false`（禁止 SetUID/SetGID 提权） | `containers[*].securityContext.allowPrivilegeEscalation` |
| 以非 root 运行 | `runAsNonRoot` 必须为 `true`（Pod 级或容器级任一设置即可） | `securityContext.runAsNonRoot` |
| 非 root 用户 | `runAsUser` 不能为 0 | `securityContext.runAsUser` |
| Seccomp | 必须显式设置为 `RuntimeDefault` 或 `Localhost`（Pod 级或全部容器级） | `securityContext.seccompProfile.type` |
| 权能 | 必须 `drop: ["ALL"]`，且最多只允许 `add: ["NET_BIND_SERVICE"]` | `securityContext.capabilities` |

:::tip 版本化差异
上述控制项随版本演进（如 capabilities drop ALL 自 v1.22 起，`spec.os.name` 相关豁免自 v1.25 起）。这引出一个实际问题：升级集群后策略可能变严。解决方案是 PSA 的**版本化标签**，见第 4 节。
:::

## 3. 三种模式：enforce / audit / warn

PSA 对违规 Pod 可以采取三种动作，互相独立、可任意组合：

| 模式 | 动作 | 适用阶段 |
| --- | --- | --- |
| enforce | **拒绝创建/修改**，直接报错 | 策略成熟后的最终形态 |
| audit | 放行，但在**审计日志**里记录违规注解 | 静默观察，不影响用户 |
| warn | 放行，但**给用户回显警告信息** | 明面提醒，常与 audit 搭配 |

:::tip 灰度上线套路
新策略不要一上来就 enforce：先 `warn + audit` 跑一两周（用户看到警告、管理员从审计日志统计违规量），把存量负载改完，最后再把 enforce 打开。这是官方推荐的上线路径。
:::

另一个重要细节：**enforce 只作用于最终创建的 Pod 对象，而 warn/audit 同时作用于工作负载资源**（Deployment、Job 等）。也就是说你 apply 一个违规的 Deployment 时，warn 会立即提示你，但 Pod 真正创建时才被 enforce 拦截。

## 4. 用命名空间标签配置 PSA

PSA 无需安装任何组件（v1.25+ 内置启用），日常配置就是给命名空间打标签。每个模式可以配两条标签：

```yaml
# 模式标签：MODE 取 enforce / audit / warn，LEVEL 取 privileged / baseline / restricted
pod-security.kubernetes.io/<MODE>: <LEVEL>
# 可选的版本标签：VERSION 取某个 k8s 次版本（如 v1.31）或 latest
pod-security.kubernetes.io/<MODE>-version: <VERSION>
```

### 4.1 两种打标签的方式

```bash
# 方式一：kubectl label 直接打（适合存量命名空间）
kubectl label ns dev \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/enforce-version=v1.31 \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/warn-version=v1.31 \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/audit-version=v1.31
```

```yaml
# 方式二：写入清单声明式管理（适合 GitOps；对已存在的命名空间
# 要用 kubectl apply 更新受管字段，而不是 kubectl label）
# dev-ns.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
  labels:
    pod-security.kubernetes.io/enforce: restricted         # 违规 Pod 直接拒绝
    pod-security.kubernetes.io/enforce-version: v1.31      # 锁定策略版本，升级集群不突变
    pod-security.kubernetes.io/warn: restricted            # 违规时给用户警告
    pod-security.kubernetes.io/warn-version: v1.31
    pod-security.kubernetes.io/audit: restricted           # 违规时写审计日志
    pod-security.kubernetes.io/audit-version: v1.31
```

**版本标签的作用**：不写时默认 `latest`，策略随集群版本升级而变——今天能跑的 Pod 升级集群后可能突然被拒。显式锁定 `v1.31` 这样的版本，就能先锁策略、从容改造负载，全部达标后再把版本标签改新。一个命名空间的三个模式可以配不同级别（例如 kube-system 常见 enforce=privileged，业务 ns enforce=restricted）。

:::tip 验证标签生效
`kubectl get ns dev --show-labels` 确认标签；然后 `kubectl auth can-i --list` 无关，直接尝试创建违规 Pod 看是否被拒即可。
:::

### 4.2 集群级配置与豁免（exempt）

全局默认值和豁免清单需要在 kube-apiserver 的准入配置文件里静态设置（kubeadm 集群需修改 `/etc/kubernetes/manifests/kube-apiserver.yaml` 加 `--admission-control-config-file`）：

```yaml
# admission-config.yaml —— PSA 集群级配置
apiVersion: apiserver.config.k8s.io/v1
kind: AdmissionConfiguration
plugins:
  - name: PodSecurity
    configuration:
      apiVersion: pod-security.admission.config.k8s.io/v1
      kind: PodSecurityConfiguration
      defaults:                        # 未打标签的命名空间使用的全局默认
        enforce: "baseline"            # 默认强制 baseline
        enforce-version: "latest"
        audit: "restricted"            # 审计从最严级别观察，提前发现风险
        audit-version: "latest"
        warn: "restricted"
        warn-version: "latest"
      exemptions:                      # 豁免清单：命中即完全跳过检查
        usernames: []                  # 豁免的用户（如某些管理员）
        runtimeClasses: []             # 豁免的运行时类（如 gVisor 沙箱）
        namespaces:                    # 豁免的命名空间
          - kube-system                # 系统组件常需要特权，必须豁免
```

:::warning 豁免是双刃剑
豁免了某用户，只豁免他**直接创建 Pod** 的请求；他若创建 Deployment，真正的 Pod 由控制器（如 replicaset-controller 的 SA）创建，不在豁免内。反过来，**不要豁免控制器 SA**（如 `system:serviceaccount:kube-system:replicaset-controller`），否则任何能创建 Deployment 的用户都借道获得了豁免——这是官方文档明确警告的绕过路径。
:::

## 5. 实战：把一个普通 Deployment 改造到 restricted 级别

先看一个典型的"祖传" Deployment——在 restricted 命名空间里它会被直接拒绝：

```yaml
# before.yaml —— 违规清单：至少 6 处不满足 restricted
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legacy-web
  namespace: dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: legacy-web
  template:
    metadata:
      labels:
        app: legacy-web
    spec:
      hostNetwork: true                      # 违规 1：baseline 就禁止共享宿主网络
      containers:
        - name: web
          image: nginx:1.27
          securityContext:
            privileged: true                 # 违规 2：特权容器
          volumeMounts:
            - name: host-log
              mountPath: /var/log/host
      volumes:
        - name: host-log
          hostPath:                          # 违规 3：HostPath 卷
            path: /var/log
```

被 enforce 拦截时的真实报错（信息会逐条列出违规项）：

```bash
$ kubectl apply -f before.yaml
Error from server (Forbidden): error when creating "before.yaml":
deployments.apps "legacy-web" is forbidden: violates PodSecurity
"restricted:v1.31": hostNamespaces (pod spec.hostNetwork set to true),
privileged (container "web" must not set securityContext.privileged=true),
hostPath volumes (volume "host-log" used by container "web")
```

### 5.1 逐项改造

改造清单（restricted 的完整要求）：

1. 去掉 `hostNetwork`（baseline 要求）
2. 去掉 `privileged: true`（baseline 要求）
3. HostPath 换成 PVC（restricted 卷类型要求）
4. `runAsNonRoot: true` + 非 0 的 `runAsUser`
5. `allowPrivilegeEscalation: false`
6. `seccompProfile: RuntimeDefault`
7. `capabilities.drop: ["ALL"]`
8. 容器内程序不能监听 1024 以下特权端口（非 root 后绑不了；80 端口要换成 8080 之类，或加 `NET_BIND_SERVICE` 权能）

```yaml
# after.yaml —— 改造后：满足 restricted:v1.31
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legacy-web
  namespace: dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: legacy-web
  template:
    metadata:
      labels:
        app: legacy-web
    spec:
      # ---- Pod 级安全上下文：一次设置，对所有容器生效 ----
      securityContext:
        runAsNonRoot: true        # 必须：以非 root 用户运行
        runAsUser: 101            # 101 是 nginx 镜像自带的 nginx 用户（非 0 即可）
        seccompProfile:           # 必须：seccomp 用运行时默认配置
          type: RuntimeDefault
      containers:
        - name: web
          image: nginxinc/nginx-unprivileged:1.27   # 官方非 root 版镜像，默认监听 8080
          securityContext:
            allowPrivilegeEscalation: false   # 必须：禁止 SetUID/SetGID 提权
            capabilities:
              drop: ["ALL"]                   # 必须：丢弃全部 Linux 权能
              # add: ["NET_BIND_SERVICE"]     # 如确需绑 <1024 端口才加这一条
          ports:
            - containerPort: 8080             # 非 root 用户无法绑 80，改用 8080
          volumeMounts:
            - name: app-log
              mountPath: /var/log/nginx
      volumes:
        - name: app-log                       # HostPath 改为 PVC（restricted 允许的卷类型）
          persistentVolumeClaim:
            claimName: web-logs
```

:::caution 镜像本身也要达标
`runAsNonRoot` 只是"要求"，镜像里的程序真以什么用户跑取决于镜像。官方 `nginx` 镜像以 root 启动，`runAsNonRoot: true` 会让 kubelet 直接拒绝启动；要么换 `nginxinc/nginx-unprivileged` 这类非 root 镜像，要么确认应用镜像里用 USER 指令切换了普通用户。这是改造中最常花时间的一步。
:::

应用并验证：

```bash
kubectl apply -f after.yaml
kubectl get pods -n dev -l app=legacy-web   # Running 即改造成功

# 顺手确认容器确实以非 root 运行
kubectl exec -n dev deploy/legacy-web -- id
# uid=101(nginx) gid=101(nginx)
```

## 6. 违规告警排查

**enforce 拦截**：报错直接返回给 kubectl（见上文），信息里带级别与版本、每一条违规的控制项，照着改即可。

**warn/audit 触发后怎么查**：

```bash
# 1. 事件里能看到 Pod 被拒绝/警告的记录
kubectl get events -n dev --sort-by=.lastTimestamp | grep -i podsecurity
# 示例：
# 0s    Warning   FailedCreate   replicaset/legacy-web-xxx
#       Error creating: pods "legacy-web-xxx" is forbidden:
#       violates PodSecurity "restricted:v1.31": allowPrivilegeEscalation != false ...

# 2. describe 命名空间确认标签配置
kubectl describe ns dev | grep -A3 Labels

# 3. audit 模式的注解在审计日志里（需要 API 服务器开启审计），
#    注解键为 pod-security.kubernetes.io/audit-violations

# 4. 找出命名空间里所有还在违规的存量 Pod（audit 数据之外的手动巡检）
kubectl get pods -n dev -o json \
  | jq -r '.items[] | select(.spec.containers[].securityContext.privileged == true)
           | .metadata.name'
```

:::warning 改标签不会动存量 Pod
PSA 只在 Pod **创建/更新**时检查。把命名空间 enforce 从 privileged 改成 restricted，已经在跑的违规 Pod 不会被驱逐；但 Pod 重建（滚动升级、节点漂移）时就会被拒。所以改级别前先用 warn/audit 观察存量负载，正是为此。
:::

## 结语

记住三个"三"：三种级别（privileged / baseline / restricted）、三种模式（enforce / audit / warn）、两条标签（`<MODE>` 与 `<MODE>-version`）。落地路径：全局 defaults 设 baseline 兜底 → 业务命名空间 warn/audit=restricted 观察存量 → 改造镜像与 securityContext → 打开 enforce 并锁定版本标签。给生产集群建安全基线，这套动作足够覆盖绝大多数场景。

安全只是准入控制的一个案例。多租户场景下另一个常见的准入把关者是资源配额——Pod 申请多少 CPU、一个命名空间最多能用多少资源，见下一篇 [LimitRange 与 ResourceQuota](./LimitRange与ResourceQuota.md)。
