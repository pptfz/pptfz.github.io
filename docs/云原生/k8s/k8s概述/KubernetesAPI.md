# KubernetesAPI

## 官方文档参考

| 文档 | 链接 | 说明 |
| --- | --- | --- |
| Kubernetes API（中文页） | https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/ | 官方中文页，抓取成功，链接有效 |

## 概述

Kubernetes API 使你可以查询和操纵 Kubernetes 中对象的状态。Kubernetes 控制平面的核心是 **API 服务器（kube-apiserver）** 和它暴露的 HTTP API。用户、集群的不同部分以及外部组件都通过 API 服务器相互通信。

| 访问方式 | 说明 |
| --- | --- |
| kubectl 等命令行工具 | 大部分操作通过 kubectl 或 kubeadm 等工具执行，它们背后也是调用 API |
| REST 调用 | 直接使用 HTTP 请求访问 API 服务器 |
| 客户端库 | Kubernetes 为开发者提供多种语言的客户端库（如 client-go） |

每个 Kubernetes 集群都会发布集群所使用的 API 规范，kubectl 会获取并缓存这些规范以实现命令行补全等特性。发布规范有两种机制：

| 机制 | 作用 | 特点 |
| --- | --- | --- |
| Discovery API（发现 API） | 提供 API 名称、资源、版本和支持操作的简要总结 | 轻量，不详细说明资源的具体模式（schema） |
| OpenAPI 文档 | 为所有 API 端点提供完整的 OpenAPI v2.0 和 v3.0 模式 | 全面准确，包含所有路径、资源及可扩展组件；v3 是首选方式 |

## Discovery API

Kubernetes 通过 Discovery API 发布集群所支持的所有组版本和资源列表。对于每个资源，Discovery API 包括以下内容：

- 名称
- 集群作用域还是名字空间作用域
- 端点 URL 和所支持的动词（verbs）
- 别名
- 组、版本、类别（kind）

API 以**聚合**和**非聚合**两种形式提供：

| 形式 | 端点 | 特点 |
| --- | --- | --- |
| 聚合的发现 | `/api` 和 `/apis` | 自 v1.30 起稳定；一次请求返回所有资源，大大减少请求数量；需通过 `Accept` 头声明格式 |
| 非聚合的发现 | `/api`、`/apis` 及 `/apis/<group>/<version>` | 根端点只返回组版本列表，需对每个组版本额外请求发现文档 |

聚合发现需要携带 `Accept` 头来指明资源类型：

```bash
# 通过 Accept 头请求聚合发现文档（APIGroupDiscoveryList）
curl -H 'Accept: application/json;v=v2beta1;g=apidiscovery.k8s.io;as=APIGroupDiscoveryList' \
  https://kubernetes.example.com/apis
```

如果未使用 `Accept` 头指示资源类型，`/api` 和 `/apis` 端点的默认响应是非聚合的发现文档。非聚合发现中，`/apis` 返回的组版本列表形如：

```json
{
  "kind": "APIGroupList",
  "apiVersion": "v1",
  "groups": [
    {
      "name": "apiregistration.k8s.io",
      "versions": [
        { "groupVersion": "apiregistration.k8s.io/v1", "version": "v1" }
      ],
      "preferredVersion": {
        "groupVersion": "apiregistration.k8s.io/v1",
        "version": "v1"
      }
    },
    {
      "name": "apps",
      "versions": [
        { "groupVersion": "apps/v1", "version": "v1" }
      ],
      "preferredVersion": {
        "groupVersion": "apps/v1",
        "version": "v1"
      }
    }
  ]
}
```

用户需要额外请求 `/apis/<group>/<version>`（例如 `/apis/rbac.authorization.k8s.io/v1alpha1`）才能获得该组版本下的资源列表。kubectl 就是使用这些端点来获取集群支持的资源列表的。

:::tip 没有集群也能查资源清单
内置资源的聚合发现文档可以在 Kubernetes GitHub 代码仓库（`api/discovery/aggregated_v2.json`）中找到。手头没有集群可查询时，它可用作可用资源基础集合的参考。聚合发现端点还支持 ETag 和 protobuf 编码。
:::

## OpenAPI 接口定义

Kubernetes 同时提供 OpenAPI v2.0 和 v3.0 规范。**OpenAPI v3 是首选方法**，因为它提供了对 Kubernetes 资源更全面（无损）的表示——受 OpenAPI v2 的限制，v2 规范中会丢弃一些字段，包括但不限于 `default`、`nullable`、`oneOf`。

| 版本 | 端点 | 稳定版本 | 响应格式控制 |
| --- | --- | --- | --- |
| OpenAPI v2 | `/openapi/v2` | 早期即有 | 通过 `Accept` 头指定：默认 `application/json`；集群内部可用 protobuf |
| OpenAPI v3 | `/openapi/v3`（列出组版本）及 `/openapi/v3/apis/<group>/<version>?hash=<hash>` | 自 v1.27 起稳定 | 同上；Kubernetes 1.37 发布 v2.0 和 v3.0，近期没有支持 v3.1 的计划 |

OpenAPI v3 的发现端点 `/openapi/v3` 用来查看所有可用的组、版本列表（仅返回 JSON），示例响应：

```yaml
{"paths": {...,"api/v1": {"serverRelativeURL": "/openapi/v3/api/v1?hash=CC0E9BFD992D..."},"apis/admissionregistration.k8s.io/v1": {"serverRelativeURL": "/openapi/v3/apis/admissionregistration.k8s.io/v1?hash=E19CC93A1169..."},....}}
```

:::tip OpenAPI v3 的缓存设计
为了改进客户端缓存，`serverRelativeURL` 会指向**不可变的** OpenAPI 描述：API 服务器设置了 HTTP 缓存标头（`Expires` 为未来 1 年、`Cache-Control` 为 `immutable`）。使用过时 URL 时，API 服务器会返回指向最新 URL 的重定向。获取 OpenAPI v3 的 Golang 实现位于 `k8s.io/client-go/openapi3` 包。
:::

:::caution OpenAPI 校验规则并不完整
作为 OpenAPI 模式一部分发布的校验规则可能不完整（通常也确实不完整），API 服务器内部会做额外校验。如果你希望进行精确且完整的验证，请使用 `kubectl apply --dry-run=server`，它会运行所有适用的校验（同时也会触发准入时检查）。
:::

## Protobuf 序列化

Kubernetes 为 API 实现了一种基于 Protobuf 的序列化格式，主要用于**集群内部通信**。每种模式对应的接口描述语言（IDL）位于定义 API 对象的 Go 包中，设计细节见 Kubernetes Protobuf 序列化设计提案。

## 持久化

Kubernetes 通过将序列化状态的对象写入 **etcd** 中完成存储操作。

## API 组和版本控制

为了更容易消除字段或重组资源的呈现方式，Kubernetes 支持多个 API 版本，每个版本位于不同的 API 路径，例如 `/api/v1` 或 `/apis/rbac.authorization.k8s.io/v1alpha1`。

| 要点 | 说明 |
| --- | --- |
| 版本控制级别 | 在 API 级别（而非资源或字段级别）进行版本控制，保证 API 呈现清晰、一致的资源与行为视图 |
| API 组 | 为了演进和扩展 API，Kubernetes 实现了 API 组，API 组可以被启用或禁用 |
| 资源标识 | API 资源通过 API 组、资源类型、名字空间（名字空间作用域的资源）和名称来区分 |
| 版本转换 | API 服务器透明地处理 API 版本之间的转换：所有不同版本实际上都是**相同持久化数据**的不同呈现 |

例如：针对同一资源有 `v1` 和 `v1beta1` 两个 API 版本，最初用 `v1beta1` 创建的对象，之后可以用 `v1beta1` 或 `v1` 读取、更新、删除，直到 `v1beta1` 被废弃移除；此后用 `v1` 继续访问即可。

### API 变更与兼容性

Kubernetes API 的设计目标是**持续变更和成长，但不给现有客户端带来兼容性问题**。

| 变更类型 | 兼容性策略 |
| --- | --- |
| 新增 API 资源 / 字段 | 一般可以频繁添加 |
| 删除资源或字段 | 必须遵从 API 废弃策略 |
| GA（`v1`）API | 兼容性承诺很强 |
| Beta API | 保持持久化数据兼容；API 进阶后需转换到后续版本，最佳迁移时机是弃用期（此时两个版本可同时访问） |
| Alpha API | 尽力维持兼容但无法保证；升级集群前需查看发布说明，如发生不兼容变更须先删除现有 Alpha 对象 |

:::caution 用了 Alpha API 就要盯紧发布说明
Alpha 版本的功能随时可能以不兼容方式变更或被直接移除。如果集群里存在 Alpha 对象，升级前必须确认对应 API 的去向，否则升级后这些对象可能无法访问甚至导致组件异常。
:::

## API 扩展

有两种途径扩展 Kubernetes API：

1. 使用**自定义资源**（CustomResourceDefinition）以声明式方式定义 API 服务器如何提供你所选择的资源 API。
2. 实现**聚合层**（Aggregated API Server）来扩展 Kubernetes API。

:::tip 什么时候用 CRD、什么时候用聚合层
大多数场景下 CRD 就够用了：只需写 yaml 定义，无需自己运行服务。聚合层适合需要高度自定义逻辑（如自己的认证、校验、存储后端）的场景，代价是要自己开发并运维一个 apiserver。
:::

## 我的总结与避坑清单

1. **优先用 OpenAPI v3**：v2 规范会丢失 `default`、`nullable`、`oneOf` 等字段，代码生成和校验工具应尽量走 v3 端点。
2. **不要相信 OpenAPI 能做完整校验**：本地工具校验通过不等于集群会接受，最终以 `kubectl apply --dry-run=server` 为准，它能触发服务端全量校验和准入检查。
3. **生产环境慎用 Beta/Alpha API**：Beta API 进阶到 GA 后要迁移，Alpha API 可能有破坏性变更；新写的清单尽量用 GA 版本（如 `apps/v1` 而不是历史遗留的 `apps/v1beta1`）。
4. **集群升级前先盘点 CRD 与 API 版本**：检查清单里是否引用了即将被移除的 API 版本（用 `kubectl-convert` 或 grep 老版本号），避免升级后资源清单直接失效。
5. **客户端库比自己封装 REST 调用更省心**：client-go 等官方客户端库内置了发现、序列化（含 protobuf）、重试和鉴权逻辑，手写 HTTP 调用容易踩鉴权和 Content-Type 的坑。
6. **etcd 是唯一持久化层**：API 多个版本读到的都是同一份底层数据，直接改 etcd 不会触发任何版本转换和校验，禁止在生产集群这样做。
7. **多版本读取是过渡期的正常现象**：GA 替代 Beta 后，旧对象无需重建即可通过新版本 API 访问，迁移时先在弃用期完成切换，不要拖到 Beta API 被移除之后。
8. **利用聚合发现减少请求**：工具类程序获取集群资源列表时优先请求聚合发现端点（v1.30+ 稳定），比逐个组版本请求快得多。
