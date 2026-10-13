# RBAC 与 ServiceAccount：Kubernetes 权限体系入门

[toc]

## 引言

当你第一次用 kubectl 连上集群，随手一条 `kubectl get pods` 却返回 `Error from server (Forbidden)` 时，你遇到的就是本文要解决的问题：**Kubernetes 是如何决定"你能不能做这件事"的**。

本文从 API 访问的完整链路讲起，定位 RBAC（基于角色的访问控制）在其中所处的位置，然后逐一拆解 RBAC 的四个 API 对象、规则写法、自测命令，最后落到两个最常用的实战场景：给某个命名空间的开发者授权、为 CI/CD 或运维人员创建最小权限账号。全文面向从 0 开始学 k8s 的读者，所有示例都基于 `rbac.authorization.k8s.io/v1` API，可直接在集群里运行。

> 前置知识：如果你还没有集群，请先阅读 [使用 kubeadm 安装最新版 k8s 集群（v1.37）](../../k8s安装/使用kubeadm安装最新版k8s集群-v1.37.md)。

## 官方文档参考

| 页面名 | 链接 |
| --- | --- |
| 使用 RBAC 鉴权（中文） | https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/ |
| 服务账号 ServiceAccount 概念（中文） | https://kubernetes.io/zh-cn/docs/concepts/security/service-accounts/ |
| 为 Pod 配置服务账号（中文） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-service-account/ |
| API 访问控制总览（中文） | https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/ |
| 控制 Kubernetes API 的访问（中文） | https://kubernetes.io/zh-cn/docs/concepts/security/controlling-access/ |

## 1. 先定位：一个请求到达 API 服务器要过三道关

Kubernetes 集群里所有操作都要经过 API 服务器（kube-apiserver）。API 服务器处理每个请求会依次经过三个阶段：

```
请求 → ① 认证 Authentication → ② 授权 Authorization → ③ 准入控制 Admission → 写入 etcd
```

| 阶段 | 回答的问题 | 不通过的表现 |
| --- | --- | --- |
| 认证 Authentication | 你是谁？（用户名、组、ServiceAccount） | 401 Unauthorized |
| 授权 Authorization | 你能做这件事吗？（RBAC 在这一步） | 403 Forbidden |
| 准入控制 Admission | 这个对象允许被创建/修改吗？（如 ResourceQuota、Pod 安全准入） | 403 / 定制报错 |

几个关键认知：

- **认证解决"你是谁"，授权解决"你能不能"。** 就算认证成功（你是合法用户），没有对应权限依然会被 403 拒绝。
- **RBAC 是授权插件的一种**，此外还有 ABAC、Node（节点）、Webhook 等，现代集群默认使用 RBAC。
- **准入控制在授权之后**，与本系列的另一篇 [Pod 安全标准与 PSA 准入](./Pod安全标准与PSA准入.md) 直接相关。

:::tip RBAC 只有"允许"，没有"拒绝"
RBAC 规则是**纯粹累加的**：你只能写"允许谁做什么"，不存在"拒绝某操作"的规则。默认一切拒绝，权限做加法。这个设计让权限审计非常简单——把某账号的所有绑定翻出来看一遍，它的全部能力就一目了然。
:::

启用 RBAC 有两种方式（新版推荐前者）：

```yaml
# apiserver 配置文件方式（v1.29+ 推荐）：AuthorizationConfiguration
apiVersion: apiserver.config.k8s.io/v1
kind: AuthorizationConfiguration
authorizers:
  - type: RBAC   # 使用基于角色的访问控制
```

或者老式的命令行标志：`kube-apiserver --authorization-mode=Node,RBAC`。kubeadm 搭建的集群默认已启用 RBAC，无需手动配置。

## 2. RBAC 的四个 API 对象

RBAC API 组是 `rbac.authorization.k8s.io`，声明了四种对象，两两一组：

| 对象 | 作用域 | 职责 |
| --- | --- | --- |
| Role | 命名空间 | 定义一组权限规则（能对哪些资源做哪些操作） |
| ClusterRole | 集群 | 同上，但不限于命名空间，还能覆盖集群级资源（Node、PV 等） |
| RoleBinding | 命名空间 | 把角色"授予"若干主体（用户/组/ServiceAccount） |
| ClusterRoleBinding | 集群 | 同上，但授予的权限在所有命名空间生效 |

![RBAC 四对象绑定关系](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/rbac-bindings.png)

记住这个分工：**Role/ClusterRole 管"能做什么"，Binding 管"谁来做"**。角色是权限的集合，本身不与任何用户关联；绑定才把角色和主体（subjects）连起来。

### 2.1 三种合法组合与一种禁止组合

`roleRef` 字段决定了绑定引用哪种角色，合法组合只有 3 种：

| 组合 | 效果 |
| --- | --- |
| Role → RoleBinding | 权限在 RoleBinding 所在命名空间生效 |
| ClusterRole → RoleBinding | 权限被"降级"，仅在 RoleBinding 所在命名空间生效 |
| ClusterRole → ClusterRoleBinding | 权限在集群所有命名空间生效 |

**Role 不能绑定到 ClusterRoleBinding**——Role 是命名空间级对象，把它提升到集群级会造成意外的越权，API 服务器会直接拒绝。

:::caution 最容易被误解的组合：ClusterRole + RoleBinding
这个组合不是错误，反而是一种**推荐的复用手法**：全集群只定义一份 ClusterRole（比如"Pod 只读"），然后在每个命名空间用 RoleBinding 引用它，让不同团队的管理员各自在本命名空间内授权。权限永远只在 RoleBinding 所在的命名空间生效，不会外溢。Kubernetes 内置的 `admin`、`edit`、`view` 角色就是这样设计的。
:::

### 2.2 主体（subjects）的三种类型

RoleBinding/ClusterRoleBinding 的 `subjects` 里可以写三种主体：

```yaml
subjects:
  - kind: User            # 用户：k8s 自身没有 User API，通常来自客户端证书 CN/OIDC 等
    name: jane
    apiGroup: rbac.authorization.k8s.io
  - kind: Group           # 用户组：如证书中的 O 字段、内置的 system:masters
    name: dev-team
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount  # 服务账号：给 Pod 或外部程序用的"机器人账号"
    name: ci-bot
    namespace: dev        # SA 必须写它所在的命名空间
```

## 3. 逐字段拆解 rules：apiGroups / resources / verbs

Role 和 ClusterRole 的核心都是 `rules` 列表，每条规则回答"对哪个 API 组的哪些资源，允许哪些动作"。

```yaml
rules:
  - apiGroups: [""]                # API 组：空字符串 "" 代表核心组（core，即 v1）
    resources: ["pods"]            # 资源名：HTTP 路径里的复数形式，pods、deployments...
    verbs: ["get", "list", "watch"]  # 动词：与 REST 方法对应
```

### 3.1 apiGroups：资源属于哪个 API 组

每个 Kubernetes 资源都归属一个 API 组，写错组名授权不生效。常用对照：

| 资源 | apiGroups 写法 |
| --- | --- |
| Pod、Service、ConfigMap、Secret、Node、PV、Namespace | `""`（核心组） |
| Deployment、StatefulSet、DaemonSet、ReplicaSet | `apps` |
| Job、CronJob | `batch` |
| Role、RoleBinding 等 RBAC 对象自身 | `rbac.authorization.k8s.io` |
| Ingress | `networking.k8s.io` |

:::tip 怎么查某个资源的 API 组？
用 `kubectl api-resources`，输出里的 `APIVERSION` 列第一段就是组名（只有 `v1` 的属于核心组，写 `""`）。例如 Deployment 显示 `apps/v1`，组就是 `apps`。
:::

### 3.2 resources：资源的复数形式 + 子资源写法

`resources` 要写资源在 HTTP URL 路径中的**复数形式**（`pods` 而不是 `pod`）。如果需要控制**子资源**，用斜杠分隔。最典型的例子是 Pod 日志，它的请求路径是：

```http
GET /api/v1/namespaces/{namespace}/pods/{name}/log
```

所以"允许看 Pod 日志"要这样写：

```yaml
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]   # pods/log 是子资源，与 pods 一起列出
    verbs: ["get", "list"]
```

:::warning 只授权 pods 是看不了日志的
`kubectl logs` 访问的是 `pods/log` 子资源。如果规则里只写了 `resources: ["pods"]`，用户可以 `get` Pod 对象本身，但执行 `kubectl logs` 会收到 403。这是新手最常见的"我明明授权了"问题之一，类似的还有 `pods/exec`（进入容器）、`pods/portforward`。
:::

还可以用 `resourceNames` 把权限进一步收窄到**指定名字的对象**：

```yaml
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["my-config"]      # 只能操作这一个 ConfigMap
    verbs: ["get", "update"]
```

注意：`create` 和 `deletecollection` 无法用 `resourceNames` 限制——创建时对象还不存在，无从匹配名字。

### 3.3 verbs：能做什么动作

常用动词与 kubectl 命令的对应关系：

| verb | 对应操作 |
| --- | --- |
| get | 读取单个对象（`kubectl get pod xxx`） |
| list | 列出对象集合（`kubectl get pods`） |
| watch | 监听对象变化（`kubectl get pods -w`） |
| create | 创建（`kubectl create/apply`） |
| update / patch | 更新对象 |
| delete | 删除单个对象 |
| deletecollection | 批量删除集合 |
| exec | `kubectl exec` 进入容器（子资源权限） |

`get` 和 `list` 必须分开授权：`get` 单个对象不需要 `list`，反之亦然。通配符 `*` 代表全部（如 `verbs: ["*"]`），**生产环境慎用**。

## 4. kubectl auth can-i：随时自测权限

不用翻 YAML 猜权限，`kubectl auth can-i` 直接问 API 服务器"我能不能做某事"：

```bash
# 我能在 dev 命名空间创建 Deployment 吗
$ kubectl auth can-i create deployments --namespace dev
yes

# 我能看 default 命名空间的 Pod 日志吗
$ kubectl auth can-i get pods/log --namespace default
no

# 管理员视角：检查别的账号的权限（需要 impersonate 权限）
$ kubectl auth can-i delete nodes --as=jane
no

# 检查 ServiceAccount 的权限
$ kubectl auth can-i list secrets \
    --as=system:serviceaccount:dev:ci-bot --namespace dev
yes

# 列出某账号在某命名空间的全部权限
$ kubectl auth can-i --list --as=jane --namespace dev
```

`can-i` 本质上调用的就是 RBAC 的 `SelfSubjectAccessReview`/`SelfSubjectRulesReview` API，返回结果与真实鉴权完全一致，是验证授权是否生效的最可靠手段。

## 5. 完整实战一：给 dev 命名空间的开发者授权

目标：新建命名空间 `dev`，创建一个开发者用的 ServiceAccount `dev-user`，授予该命名空间内对常用工作负载对象的读写权限，**仅限 dev，碰不到其他命名空间和集群资源**。

下面这份 YAML 完整可运行，逐段都有注释：

```yaml
# dev-rbac.yaml —— 在 dev 命名空间为开发者授权
apiVersion: v1
kind: Namespace          # 1. 先有命名空间
metadata:
  name: dev
---
apiVersion: v1
kind: ServiceAccount     # 2. 开发者的"机器人账号"（人是用证书/OIDC 接入的，
metadata:                #    但给入口程序、CI 任务用 SA 是最常见的做法）
  name: dev-user
  namespace: dev
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role               # 3. 角色只定义"能做什么"，不关心是谁
metadata:
  name: developer
  namespace: dev         # Role 必须属于某个命名空间
rules:
  # 规则 1：核心组资源——Pod 及其子资源、日志、exec
  - apiGroups: [""]
    resources:
      - pods
      - pods/log         # kubectl logs 需要
      - pods/exec        # kubectl exec 需要
      - services
      - configmaps
      - secrets          # 读配置需要；如无必要可去掉
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  # 规则 2：工作负载——apps 组
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  # 规则 3：任务——batch 组
  - apiGroups: ["batch"]
    resources: ["jobs", "cronjobs"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding        # 4. 绑定：把 developer 角色授予 dev-user
metadata:
  name: developer-binding
  namespace: dev         # 绑定在哪个命名空间，权限就只在这个命名空间生效
subjects:
  - kind: ServiceAccount
    name: dev-user
    namespace: dev
roleRef:
  kind: Role             # 引用的是 Role（也可以是 ClusterRole）
  name: developer        # 必须与上面的 Role 名字一致
  apiGroup: rbac.authorization.k8s.io
```

应用并验证：

```bash
# 一次 apply 全部四个对象
kubectl apply -f dev-rbac.yaml

# 自测：dev-user 能在 dev 建 Deployment 吗
kubectl auth can-i create deployments \
  --as=system:serviceaccount:dev:dev-user --namespace dev
# 输出 yes

# 自测：dev-user 能删别的命名空间的 Pod 吗
kubectl auth can-i delete pods \
  --as=system:serviceaccount:dev:dev-user --namespace kube-system
# 输出 no —— 权限没有外溢

# 查看该账号在 dev 的完整权限清单
kubectl auth can-i --list \
  --as=system:serviceaccount:dev:dev-user --namespace dev
```

:::tip 懒人方案：直接用内置角色
如果上面的自定义角色太繁琐，Kubernetes 预置了四个面向用户的 ClusterRole，用 RoleBinding 绑定即可按命名空间授权：`view`（只读，且看不到 Secret）、`edit`（命名空间内读写，不能改角色和配额）、`admin`（edit 的基础上还能管角色和角色绑定）、`cluster-admin`（超级用户，慎用）。例如给 jane 在 dev 授予编辑权限只需一个 RoleBinding 引用 `edit`。
:::

## 6. ServiceAccount：给"程序"用的账号

Kubernetes 里有两类"身份"：

| | 用户账号 User | 服务账号 ServiceAccount |
| --- | --- | --- |
| 给谁用 | 真人（运维、开发） | 程序（Pod 内进程、CI/CD、集群组件） |
| 是否是 API 对象 | 不是，k8s 没有 User API，身份来自证书/OIDC 等 | 是，`ServiceAccount` 对象，存在 etcd 里 |
| 作用域 | 集群级 | 命名空间级 |
| 创建方式 | 由外部认证系统管理 | `kubectl create serviceaccount` 或 YAML |

ServiceAccount 本质上就是**集群内的轻量级身份**：Pod 里跑的程序要调 Kubernetes API（比如读写 ConfigMap、操作 CRD），就得有一个身份来完成认证，这个身份就是 ServiceAccount；至于它能干什么，再由 RBAC 决定——**SA 负责"你是谁"，RBAC 负责"你能干什么"**，两者配合才构成完整权限。

### 6.1 default 服务账号

每个命名空间创建时会自动获得一个名为 `default` 的 ServiceAccount；如果 Pod 没有显式指定 `serviceAccountName`，就会自动使用它。要记住两点：

1. **default SA 默认几乎没有任何权限**——在启用 RBAC 的集群里，它只有 API 发现权限。Pod 挂着它去 `kubectl get pods` 依然 403。
2. 但它的**令牌依然能通过认证**（是谁答上来了，只是没权限做事）。所以安全最佳实践是：不需要访问 API 的 Pod 显式关掉令牌挂载（见 6.3），需要访问的 Pod 用专用的最小权限 SA，**不要让业务 Pod 都挤在 default 上**。

### 6.2 Pod 挂载 SA 与令牌

给 Pod 指定 SA 只需一个字段：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sa
  namespace: dev
spec:
  serviceAccountName: dev-user   # 指定 SA（只能创建时设置，不能改已存在 Pod）
  containers:
    - name: app
      image: nginx:1.27
```

Pod 创建后，kubelet 会通过 **TokenRequest API** 申请一个短期的、**自动轮换**的 JWT 令牌，以投射卷的形式挂进容器，路径固定为：

```bash
# 容器内查看挂载的凭据
$ ls /var/run/secrets/kubernetes.io/serviceaccount/
ca.crt       # API 服务器 CA 证书，用于校验服务端
namespace    # 该 Pod 所在命名空间
token        # JWT 令牌，请求头里带 Authorization: Bearer <token>
```

程序用这个令牌访问 API 就会以 `system:serviceaccount:<命名空间>:<SA名>` 的身份被认证，然后进入 RBAC 授权阶段。

:::warning 令牌泄漏 = 权限泄漏
ServiceAccount 令牌就是 bearer token，拿到就能直接用，与 IP 无关。所以：尽量用短期令牌（TokenRequest / 投射卷，Pod 删除即失效）；避免为外部程序签发长期令牌 Secret（v1.24 起已不再自动创建）；不要把令牌打进镜像或日志。
:::

### 6.3 automountServiceAccountToken：要不要自动挂令牌

绝大多数业务 Pod 根本不调 Kubernetes API，自动挂载令牌纯属白白扩大攻击面。可以在两个层面关闭：

```yaml
# 方式一：在 ServiceAccount 上全局关闭（该 SA 的所有 Pod 都不挂）
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-runner
  namespace: dev
automountServiceAccountToken: false
---
# 方式二：只在单个 Pod 上关闭（优先级高于 SA 的设置）
apiVersion: v1
kind: Pod
metadata:
  name: plain-nginx
spec:
  automountServiceAccountToken: false   # 不挂载任何 API 凭据
  containers:
    - name: nginx
      image: nginx:1.27
```

规则：Pod 的 `.spec.automountServiceAccountToken` **优先于** ServiceAccount 上的同名设置。

## 7. 完整实战二：为 CI/CD 建最小权限账号

场景：GitLab CI / Jenkins 需要往集群部署应用，只允许它操作 `dev` 命名空间里自己项目的 Deployment 和 Service，其他一律不行。原则是**最小权限**：只给必需的资源 + 必需的动作。

```yaml
# ci-rbac.yaml —— CI/CD 部署账号的最小权限
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-deployer
  namespace: dev
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ci-deployer-role
  namespace: dev
rules:
  # 部署 Deployment 必须能：读写 Deployment、读 ReplicaSet（滚动状态）、读 Pod 与事件（排障）
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  - apiGroups: ["apps"]
    resources: ["replicasets"]
    verbs: ["get", "list", "watch"]      # 只读：回滚状态要看 RS
  - apiGroups: [""]
    resources: ["pods", "pods/log", "events", "services"]
    verbs: ["get", "list", "watch"]      # 只读：查看发布结果
  - apiGroups: [""]
    resources: ["services"]
    resourceNames: ["my-app"]            # Service 只允许更新指定名字的
    verbs: ["update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-deployer-binding
  namespace: dev
subjects:
  - kind: ServiceAccount
    name: ci-deployer
    namespace: dev
roleRef:
  kind: Role
  name: ci-deployer-role
  apiGroup: rbac.authorization.k8s.io
```

CI 流水线里使用这个账号（推荐短期令牌，而不是长期 Secret）：

```bash
# 为 CI 任务签发一个有效期 1 小时的短期令牌（每次流水线开始时执行）
TOKEN=$(kubectl create token ci-deployer -n dev --duration=1h)

# 流水线里用它操作集群
kubectl --server=https://<apiserver地址> \
        --token="$TOKEN" \
        -n dev set image deployment/my-app app=myrepo/my-app:v2.3.1

# 验证：CI 账号不能删 Pod、不能碰别的命名空间
kubectl auth can-i delete pods --as=system:serviceaccount:dev:ci-deployer -n dev
# no
kubectl auth can-i create deployments \
  --as=system:serviceaccount:dev:ci-deployer -n kube-system
# no
```

:::tip 运维人员的授权思路
给真人运维授权与 CI 类似，只是主体换成 `kind: User`（来自客户端证书的 CN）或 `kind: Group`（证书的 O 字段）。建议按"角色矩阵"来建：值班运维绑内置 `view` + 少量自定义排障角色（`pods/exec`、`pods/log`）；高级运维绑 `admin`（仅限负责的命名空间）；只有平台组保留 `cluster-admin`。每建一个权限都先问一句：不做这件事，工作会不会受阻？不会就不给。
:::

## 8. 常见问题排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 403 Forbidden 但确信已授权 | RoleBinding 写错命名空间；roleRef 名字不匹配；apiGroups/resources 写错 | `kubectl describe rolebinding -n <ns>` 核对；用 `kubectl auth can-i` 验证 |
| `kubectl logs` 403 | 没授权子资源 `pods/log` | 在 resources 里补 `pods/log` |
| 删除了 Role/Binding 但权限还在 | 对象被同名重建，或权限来自另一个绑定 | `kubectl auth can-i --list` 看权限来源 |
| 用户删除后 SA 的 default 又出现 | default SA 由控制面自动重建，属正常行为 | 无需处理 |
| SA 令牌不轮换 | 使用了旧的基于 Secret 的长期令牌 | 迁移到 TokenRequest / 投射卷 |

## 结语

一张图回顾本文知识主线：**认证确定身份（User 或 ServiceAccount）→ RBAC 授权（Role 定义权限、Binding 把权限交给主体）→ 准入控制做最后一道检查**。动手路线建议：先用 `kubectl auth can-i --list` 看看自己的权限，然后照第 5 节的示例建一个 dev 命名空间练手，再用第 7 节的思路给一个假想的 CI 系统建账号。

下一篇 [Pod 安全标准与 PSA 准入](./Pod安全标准与PSA准入.md) 讲的是三道关里最后一道（准入控制）的典型案例：如何用命名空间标签强制 Pod 满足安全基线。
