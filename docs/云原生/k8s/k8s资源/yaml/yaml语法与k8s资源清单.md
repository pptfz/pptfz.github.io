[toc]

# YAML 语法与 k8s 资源清单

> YAML（YAML Ain't Markup Language）是一种**人性化的数据序列化语言**，Kubernetes 的资源清单（Manifest）约定使用 YAML 编写。本文从 YAML 语法基础讲起，再到 k8s 资源清单的结构与实战，帮助你彻底看懂并手写 k8s 的各种 YAML 文件。

## 官方文档参考

| 文档 | 链接 |
| --- | --- |
| 理解 Kubernetes 对象（Objects In Kubernetes，四大必需字段出处） | https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/ |
| Kubernetes API 参考（各资源 spec 字段权威定义） | https://kubernetes.io/docs/reference/kubernetes-api/ |
| YAML 官网（当前规范为 YAML 1.2.2） | https://yaml.org/ |
| yamllint 在线校验（检查 YAML 合法性） | http://www.yamllint.com/ |

## 1. YAML 语法规则

YAML 的基本语法规则：

- 大小写敏感
- 使用**缩进**表示层级关系
- 缩进时**不允许使用 Tab 键，只允许使用空格**
- 缩进的空格数目不重要，只要**相同层级的元素左侧对齐**即可
- `#` 表示注释，从这个字符一直到行尾，都会被解析器忽略

![YAML 缩进层级示意](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/yaml-indentation.png)

:::caution 在 YAML 文件中绝对不要使用 Tab 键
Tab 字符是 YAML 解析错误最常见的来源，编辑器请配置「Tab 键自动转换为空格」。
:::

### 1.1 文档结构与多文档分隔

第一行的 `---` 是**文档分隔符**（可选），在单一文件中可用连续三个连字号 `---` 区分多个文档。k8s 中经常在一个 yaml 文件里写多个资源：

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: my-svc
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deploy
```

`kubectl apply -f` 处理这种多文档文件时会把**每个资源都创建出来**，这是 k8s 管理 ConfigMap + Deployment + Service 组合的常见做法。

### 1.2 Maps（映射）

Map 是字典，就是一个 `key: value` 的键值对（注意冒号后面必须有一个空格），Maps 可以多层嵌套：

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: kube100-site
  labels:
    app: web
```

上面的 YAML 文件转换成 JSON 格式的话，就非常容易理解了——`metadata` 这个 KEY 对应的值是一个 Map，嵌套的 `labels` 的值又是一个 Map：

```json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "kube100-site",
    "labels": { "app": "web" }
  }
}
```

YAML 处理器根据**行缩进**判断内容之间的关联性：`name` 和 `labels` 缩进相同，属于同一个 Map；`app` 缩进更深，所以是 `labels` 的值。空格数量不重要（1 个或 2 个都行），但**同一层级必须一致**。

### 1.3 Lists（列表）

List 就是数组，每个项以破折号（`-`）开头：

```yaml
args:
  - Cat
  - Dog
  - Fish
```

对应的 JSON 格式：

```json
{ "args": ["Cat", "Dog", "Fish"] }
```

:::caution 注意 `-` 与键名之间要有冒号
列表必须挂在某个键下面，写成 `args:`（有冒号）再换行缩进写 `- Cat`；直接写 `args` 换行是**错误语法**。
:::

### 1.4 Maps 与 Lists 嵌套

List 的子项可以是 Maps，Map 的值也可以是 Lists——k8s 资源清单就是这两种结构无限嵌套出来的：

![Maps 与 Lists 结构图](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/yaml-maps-lists.png)

一个典型的 Pod 清单，`containers` 是一个 List，每个子项是由 `name`、`image`、`ports` 组成的 Map，`ports` 的值又是一个 List：

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: kube100-site
  labels:
    app: web
spec:
  containers:
    - name: front-end
      image: nginx
      ports:
        - containerPort: 80
    - name: flaskapp-demo
      image: jcdemo/flaskapp
      ports:
        - containerPort: 5000
```

:::tip 语义化对比
转换成 JSON 后结构完全等价，但明显比 YAML 冗长——这正是 k8s 选择 YAML 的原因：语义清晰、便于手写和 review。
:::

### 1.5 标量类型与隐式转换

`key: value` 中的 value 不写引号时，YAML 会**自动推断类型**，这是 k8s YAML 的经典坑来源：

| 写法 | 解析结果 | 说明 |
| --- | --- | --- |
| `name: web` | 字符串 `web` | 普通文本直接写 |
| `version: 1.37` | **浮点数 1.37** | 数字会被转成 number！ |
| `version: "1.37"` | 字符串 `"1.37"` | 想要字符串必须加引号 |
| `enabled: true` | 布尔 `true` | `true/false` 是保留字 |
| `value: null` | 空值 | `null`/`~`/留空都是空值 |
| `replicas: 2` | 整数 2 | k8s 中副本数就该是数字 |

:::caution 需要加引号的典型场景
- 值以数字开头但语义是字符串：`version: "1.37"`（不加引号会被解析成浮点数）
- 值包含特殊字符（冒号、`#`、`{}` 等）：`command: "sh -c 'echo hi'"`
- YAML 1.1 解析器中 `yes/no/on/off` 也会被转成布尔，写布尔时统一用 `true/false` 最安全
:::

**多行字符串**在写 ConfigMap 内嵌脚本时非常常用：

```yaml
# | 保留换行（每一行原样保留，最常用）
entrypoint.sh: |
  #!/bin/sh
  echo "hello"
  nginx -g "daemon off;"

# > 折叠换行（所有行折叠成一行，用空格连接）
description: >
  这是一段很长的描述文字
  会被折叠成一行
```

### 1.6 锚点与引用（复用配置）

YAML 支持 `&` 定义锚点、`*` 引用锚点，避免重复配置：

```yaml
resources: &default-resources
  requests:
    cpu: 100m
    memory: 128Mi

sidecar:
  <<: *default-resources   # << 合并键：把锚点内容合并进来
  limits:
    cpu: 200m
```

`sidecar` 最终会拥有 `requests`（来自锚点合并）和自己的 `limits`。这在 Helm values、CI 配置里很常见；k8s 官方清单中较少用，但**看懂别人写的 YAML 需要掌握它**。

## 2. Kubernetes 资源清单（Manifest）

### 2.1 四个必需字段

官方文档 [Objects In Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/) 规定：创建 k8s 对象的清单（manifest）中**必须设置以下字段**：

| 字段 | 说明 |
| --- | --- |
| `apiVersion` | 创建该对象所使用的 Kubernetes API 的组/版本 |
| `kind` | 要创建的对象类型（Pod、Deployment、Service……） |
| `metadata` | 唯一标识对象的数据：`name`（必需）、`namespace`、`labels`、`annotations` 等 |
| `spec` | 对象的**期望状态**（你要什么），格式因 kind 而异 |

![k8s 资源清单结构](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/k8s-yaml-structure.png)

**spec 与 status 的区别**（官方核心概念）：几乎每个 k8s 对象都有两个嵌套字段——`spec` 是你提供的**期望状态**；`status` 是集群控制面维护的**实际状态**。控制器持续调和两者的差异（比如 Pod 挂掉后自动补起新 Pod），所以**你写 YAML 时只需要写 spec，不需要写 status**。

### 2.2 常用 kind 与 apiVersion 对应表

`apiVersion` 不是写死的，由**资源类型 + 集群版本**决定，常用资源如下：

| kind | apiVersion | 说明 |
| --- | --- | --- |
| Pod | `v1` | 最小部署单元 |
| ConfigMap / Secret | `v1` | 配置与敏感信息 |
| Service | `v1` | 服务暴露 |
| PersistentVolume / PVC | `v1` | 存储 |
| Deployment / StatefulSet / DaemonSet | `apps/v1` | 工作负载控制器 |
| Job / CronJob | `batch/v1` | 任务 |
| Ingress | `networking.k8s.io/v1` | 七层入口 |
| HorizontalPodAutoscaler | `autoscaling/v2` | 自动扩缩容 |

:::caution 旧版 apiVersion 已废弃
网上老教程里常见的 `extensions/v1beta1`、`apps/v1beta1`（Deployment 等）**从 k8s 1.16 起已移除**，一律改用 `apps/v1`。`apps/v1` 的 Deployment/StatefulSet **必须写 `spec.selector`**，老示例照抄会报错。
:::

### 2.3 怎么查某个字段怎么写

- **官方 API 参考**：[Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)，每个资源的 spec 逐字段说明（最权威）
- **kubectl explain**：离线查询任意字段，支持逐级深入：

```bash
kubectl explain pod.spec.containers          # 查看容器的字段列表
kubectl explain deployment.spec.selector     # 查看 selector 的结构
```

### 2.4 用 YAML 创建 Pod

对 1.4 的 Pod 清单加深理解：`apiVersion` 的值需要根据集群版本和资源类型变化（查 [API 参考](https://kubernetes.io/docs/reference/kubernetes-api/)）；`spec.containers` 里常用的字段有 `name`、`image`、`command`、`args`、`ports`、`env`、`resources`、`volumeMounts`、`livenessProbe`、`readinessProbe`、`imagePullPolicy`、`securityContext` 等。

创建与查看（官方推荐声明式的 `kubectl apply`，可重复执行）：

```bash
kubectl apply -f pod.yaml

# 输出：pod/kube100-site created
```

```bash
kubectl get pods

# NAME           READY   STATUS    RESTARTS   AGE
# kube100-site   2/2     Running   0          1m
```

排查问题时用 `kubectl describe pod kube100-site` 查看事件详情；删除用 `kubectl delete -f pod.yaml`。

### 2.5 用 YAML 创建 Deployment

单纯创建 Pod 的问题：Pod 挂了服务就挂了。生产环境用 **Deployment** 管理一组 Pod 副本，保证期望数量的副本始终可用。下面是[官方文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/)给出的标准示例（`apps/v1` + `selector`）：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:        # 必须与 template 中的 labels 匹配
      app: nginx
  replicas: 2           # 运行 2 个匹配 template 的 Pod
  template:             # 这里就是 Pod 对象的定义（Pod 模板）
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

注意 `template` 就是一个 Pod 对象的定义（metadata + spec），与 2.4 的 Pod 清单写法完全一样。

```bash
kubectl apply -f deployment.yaml

# 输出：deployment.apps/nginx-deployment created

kubectl get deployments

# NAME               READY   UP-TO-DATE   AVAILABLE   AGE
# nginx-deployment   2/2     2            2           2m
```

:::caution apps/v1 必须写 selector
`spec.selector.matchLabels` 用于 Deployment 识别它管理的 Pod，**必须与 `spec.template.metadata.labels` 匹配**，缺失会直接报错 `Deployment.apps "nginx-deployment" is invalid`。
:::

### 2.6 服务端字段校验（--validate）

从 k8s v1.25 起，API 服务器支持**服务端字段校验**，能识别清单里未知的或重复的字段（拼错字段名能立刻发现）：

```bash
# strict：未知字段直接报错（kubectl 默认 --validate=true 即 strict）
kubectl apply -f deployment.yaml --validate=strict

# warn：校验但只给警告不拒绝
kubectl apply -f deployment.yaml --validate=warn
```

## 3. 常见坑速查

| 坑 | 现象 | 规避 |
| --- | --- | --- |
| 用 Tab 缩进 | `yaml: line X: found character that cannot start any token` | 编辑器配置 Tab→空格 |
| 数字/布尔隐式转换 | `version: 1.37` 变浮点数、`on/off` 变布尔 | 语义为字符串的值加引号 |
| 冒号后没空格 | `apiVersion:v1` 解析失败或变成一个字符串 | `key: value` 冒号后必须空格 |
| apps/v1 缺 selector | Deployment 创建报 invalid | `selector.matchLabels` 与模板 labels 一致 |
| 抄旧教程的 apiVersion | `extensions/v1beta1` 报错 no matches for kind | 对照本文 2.2 的对应表 |
| 缩进不对齐 | 嵌套关系错乱、字段挂错位置 | 同级必须左对齐，写完用 yamllint 检查 |

写完的 YAML 可以到 [yamllint.com](http://www.yamllint.com/) 在线校验合法性；更进一步可以用 `kubeconform`/`kubectl --validate=strict` 结合 k8s 的 schema 校验。
