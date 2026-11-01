# Kubernetes 对象

在 Kubernetes 系统中，**Kubernetes 对象**是持久化的实体。Kubernetes 使用这些实体来表示整个集群的状态，具体而言，它们描述了如下信息：

- 哪些容器化应用正在运行（以及在哪些节点上运行）
- 可以被应用使用的资源
- 关于应用运行时行为的策略，比如重启策略、升级策略以及容错策略

Kubernetes 对象是一种**意向表达（Record of Intent）**——一旦创建了该对象，Kubernetes 系统将不断工作以确保该对象存在。通过创建对象，你本质上是在告知 Kubernetes 系统你想要的集群工作负载的样子，这就是集群的**期望状态（Desired State）**。

操作 Kubernetes 对象——无论是创建、修改还是删除——都需要使用 Kubernetes API。例如使用 `kubectl` 命令行接口时，CLI 会替你调用必要的 Kubernetes API；也可以在自己的程序中使用客户端库直接调用 Kubernetes API。

## 官方文档参考

| 页面 | 链接 |
| --- | --- |
| Kubernetes 对象（本篇主参考） | https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/ |
| Deployment 示例清单文件 | https://kubernetes.io/examples/application/deployment.yaml |

## 对象规约（Spec）与状态（Status）

几乎每个 Kubernetes 对象都包含两个嵌套的对象字段，它们负责管理对象的配置：

| 字段 | 含义 | 由谁设置 |
| --- | --- | --- |
| `spec`（规约） | **期望状态（Desired State）**：描述你希望对象所具有的特征，创建对象时必须设置 | 用户提供 |
| `status`（状态） | **当前状态（Current State）**：描述对象的实际运行情况 | Kubernetes 系统及其组件设置并更新 |

Kubernetes **控制平面**在任何时刻都在积极地管理每个对象的实际状态，使之与期望状态匹配。

**典型例子**：创建一个 Deployment 时，你可能在 `spec` 中指定应用要运行 3 个副本。Kubernetes 系统读取该 `spec` 并启动 3 个应用实例，同时更新 `status` 使之与 `spec` 匹配。如果其中某个实例失败（发生状态变更），Kubernetes 系统会通过修正操作响应 `spec` 与 `status` 之间的不一致——即启动一个新实例替换它。

:::tip 调和循环的本质
可以把 `spec` 理解为"我要什么"，`status` 理解为"我现在是什么"。控制器持续对比两者并执行修正动作，这就是 Kubernetes 声明式模型的核心——你永远不需要手动"重启"，只需要把期望状态写清楚。
:::

## 描述 Kubernetes 对象

创建 Kubernetes 对象时，必须提供对象的 `spec`（描述期望状态）以及对象的一些基本信息（例如名称）。通过 Kubernetes API 创建对象时（直接调用或经由 `kubectl`），API 请求体中必须包含 JSON 格式的信息。

大多数情况下，你会通过**清单（Manifest）**文件为 `kubectl` 提供这些信息。按照惯例，清单是 YAML 格式的（也可以使用 JSON 格式）；`kubectl` 等工具在通过 HTTP 发起 API 请求时，会将清单中的信息转换为 JSON 或其他受支持的序列化格式。

下面是一个清单示例，展示了 Kubernetes Deployment 的必需字段和对象 `spec`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment          # 对象名称，便于唯一标识
spec:
  selector:
    matchLabels:
      app: nginx                  # 选择器：匹配下面模板中的标签
  replicas: 2                     # 期望状态：运行 2 个匹配模板的 Pod
  template:
    metadata:
      labels:
        app: nginx                # Pod 模板标签，须与 selector 匹配
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2       # 容器镜像
        ports:
        - containerPort: 80       # 容器暴露端口
```

使用 `kubectl apply` 命令并将 `.yaml` 文件作为参数即可创建该 Deployment：

```bash
kubectl apply -f https://k8s.io/examples/application/deployment.yaml
```

输出类似下面这样：

```bash
deployment.apps/nginx-deployment created
```

## 必需字段

在要创建的 Kubernetes 对象对应的清单（YAML 或 JSON 文件）中，需要配置以下字段：

| 必需字段 | 说明 |
| --- | --- |
| `apiVersion` | 创建该对象所使用的 Kubernetes API 的版本 |
| `kind` | 想要创建的对象的类别（如 `Pod`、`Deployment`、`Service`） |
| `metadata` | 帮助唯一标识对象的数据，包括 `name` 字符串、`UID` 和可选的 `namespace` |
| `spec` | 你所期望的该对象的状态 |

每个 Kubernetes 对象的 `spec` 精确格式都不同，包含特定于该对象的嵌套字段。Kubernetes API 参考文档可以帮助你找到各类对象的规约格式，例如：

- **Pod**：`.spec` 字段设置 Pod 及其期望状态（例如 Pod 中每个容器的镜像名称）。
- **StatefulSet**：`.spec` 字段设置 StatefulSet 及其期望状态；其内部还包含一个 Pod 模板，描述 StatefulSet 控制器为了满足规约而要创建的 Pod。
- 不同类型对象的 `.status` 结构也不同，API 参考页面详细列出了各类型对象 `.status` 字段的结构与内容。

## 服务器端字段验证

从 Kubernetes v1.25 开始，API 服务器提供了服务器端**字段验证**功能，可以检测对象中未被识别或重复的字段，相当于把 `kubectl --validate` 的能力搬到了服务器端。

`kubectl` 使用 `--validate` 标志设置字段验证级别，接受值如下（默认为 `--validate=true`，即等同于 `strict`）：

| 验证级别 | 行为 |
| --- | --- |
| `strict` | 严格的字段验证，验证失败时报错 |
| `warn` | 执行字段验证，但错误以警告形式给出而不是拒绝请求 |
| `ignore` | 不执行服务器端字段验证 |
| `true` | 等同于 `strict` |
| `false` | 等同于 `ignore` |

当 `kubectl` 无法连接到支持字段验证的 API 服务器时，将回退为使用客户端验证。Kubernetes 1.27 及更高版本始终提供字段验证；更早的版本可能没有此功能。

:::caution 拼错字段名不会再被静默忽略
早期版本里 YAML 中拼错的字段会被 API 静默丢弃，导致"配置看起来生效了其实没生效"。从 v1.25 起默认 `strict` 模式会直接报错。升级脚本/CI 时注意：如果旧流水线依赖"忽略未知字段"的行为，需要显式传 `--validate=false` 或修正 YAML。
:::

## 我的总结与避坑清单

1. **`spec` 由你写，`status` 由系统写**——不要在清单里手写 `status` 字段，`kubectl apply` 时写了也会被忽略，反而容易误导后来读配置的人。
2. **清单建议统一用 YAML 并纳入 Git 管理**，JSON 虽然也支持，但可读性和 diff 体验都差；kubectl 会自动转换成 JSON 提交 API。
3. **Deployment 的 `selector.matchLabels` 必须与 `template.metadata.labels` 匹配**，否则创建直接报错；而且 selector 创建后不可修改，动手前想清楚标签设计。
4. **写 YAML 时开启默认的字段验证（`--validate=true`）别随手关掉**，它能在提交前拦住大量拼错字段、缩进层级错的问题。
5. **升级前确认集群版本**：v1.25 才有服务器端字段验证，v1.27 之前某些版本可能不支持；对接老集群时不要假设 `strict` 行为一定生效。
6. **用 `kubectl apply` 而不是手写 JSON 调 API**，除非在做二次开发；日常运维里清单文件 + apply 是最可追溯的方式。
