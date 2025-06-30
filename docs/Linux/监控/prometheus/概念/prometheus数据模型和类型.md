# prometheus数据模型和类型



## 数据模型

promtheus从根本上将所有数据存储为 [时间序列](https://zh.wikipedia.org/wiki/%E6%99%82%E9%96%93%E5%BA%8F%E5%88%97) ，属于同一指标和同一组标记维度的带时间戳的值流





### 指标名称和标签

#### 指标名称

##### 定义

- 指定所测量系统的一般特征，例如 `http_requests_total` 表示收到的 `http` 请求总数



##### 命名规则

- 指标名称可以包含  [ASCII字母](https://zh.wikipedia.org/wiki/ASCII)、数字、下划线和冒号。它必须匹配正则表达式 `[a-zA-Z_:][a-zA-Z0-9_:]*`



#### 指标标签

- Prometheus 的维度数据模型可以通过**标签组合**来唯一标识同一指标名称的不同维度实例。例如，通过指定标签，可以标识某个具体的指标实例，比如：所有使用 `POST` 方法访问 `/api/tracks` 路径的 HTTP 请求。Prometheus 的查询语言（PromQL）支持基于这些标签维度进行**过滤**和**聚合**操作，从而灵活地分析和处理监控数据
- 任何标签值的更改（包括添加或删除标签）都会创建新的时间序列，在 Prometheus 中，每个时间序列是通过指标名称和标签组合唯一标识的。如果某个标签的值发生变化，或者增加/删除了某个标签，Prometheus 会将其视为一个新的时间序列，从而独立存储和处理该数据
- 标签可以包含 ASCII 字母、数字和下划线。它们必须匹配正则表达式 `[a-zA-Z_][a-zA-Z0-9_]*`
- 以 `__`（两个`_`）开头的标签名称保留供内部使用
- 标签值可以包含任何 Unicode 字符
- 标签的值如果为空，相当于该标签不存在，在 Prometheus 中，如果某个标签的值是空字符串 (`""`)，它会被视为与没有这个标签的情况等价。也就是说，`label=""` 和完全没有 `label` 是一样的，不会创建新的时间序列



### 样本

样本（Samples）构成了实际的时间序列数据。每个样本包含以下内容：

- **时间戳（Timestamp）**
  表示该样本的具体时间，通常以毫秒为单位的 Unix 时间戳存储

- **值（Value）**
  样本的实际数值，通常是一个浮点数，表示在特定时间点上的指标数据

这两个组成部分共同定义了时间序列中的一个数据点，用于描述某个时间点上某个指标的具体数值





### 表示方法

给定一个指标名称和一组标签，时间序列通常使用以下表示法来标识：

```shell
<metric_name>{<label_name1>="<label_value1>", <label_name2>="<label_value2>", ...}
```

- **`<metric_name>`**：指标的名称，例如 `http_requests_total`

- **`{}`**：大括号包含一组标签

- **`<label_name>` 和 `<label_value>`**：标签名称和对应的标签值，例如 `method="POST"`，`handler="/api/tracks"`





一个描述 POST 方法访问 `/api/tracks` 路径的 HTTP 请求总数的时间序列，可以表示为如下

```shell
http_requests_total{method="POST", handler="/api/tracks"}
```



## 数据类型

### Counter

**计数器（Counter）** 是一种累积型指标，表示一个单调递增的计数器，其值只会增加，或者在重启时被重置为零

示例：

- **请求数（Requests served）**：用计数器表示已处理的请求总数
- **任务完成数（Tasks completed）**：记录已完成的任务总数
- **错误数（Errors）**：记录发生的错误总数

特点：

- **单调递增**：计数器的值只会增长，不能减少

- **重置为零**：当系统或服务重启时，计数器的值会被重置为零

使用场景：

- 用于监控和统计只会累加的数据，比如总请求数、总错误数或某项操作的累计次数

Prometheus 中常用计数器的场景包括 HTTP 请求总数 (`http_requests_total`)、任务完成总数 (`tasks_completed_total`) 等



### Gauge

**仪表盘（Gauge）** 是一种指标，表示一个单一的数值，这个数值可以任意增加或减少。

特点：

1. **值的变化**：Gauge 的值可以上升、下降，也可以保持不变。
2. **当前状态**：Gauge 通常用于表示某个瞬时状态的值，而不是累积的历史数据。

使用场景：

- **CPU 使用率**：表示当前 CPU 的使用百分比，比如 `cpu_usage`。
- **内存占用**：记录当前的内存使用量，比如 `memory_usage_bytes`。
- **温度**：显示当前温度，比如 `temperature_celsius`。
- **队列长度**：反映当前队列中等待处理的任务数量，比如 `queue_length`。

示例：

假设监控当前内存使用情况：

```shell
memory_usage_bytes{instance="server1"} = 524288000
```

表示服务器 `server1` 当前的内存使用为 500MB。

Gauge 适用于表示**当前状态数据**，与只能累积增长的计数器（Counter）不同，它能灵活反映实时的变化





### Histogram

**直方图（Histogram）** 会对观测值（例如请求持续时间或响应大小等）进行采样，并根据配置的区间（桶）进行计数。此外，它还提供所有观测值的总和。直方图暴露的时间序列

当 Prometheus 拉取直方图的指标数据时，基于其基础指标名称 `<basename>`，会暴露以下多个时间序列：

- **观测桶的累积计数器**
  - 格式：`<basename>_bucket{le="<上限>"}`
  - 每个桶的累积计数器表示值落入该桶范围内的总数量
  - 例如，`http_request_duration_seconds_bucket{le="0.5"}` 表示所有请求中持续时间 ≤ 0.5 秒的数量

- **所有观测值的总和**
  - 格式：`<basename>_sum`
  - 表示所有观测值的总和，用于计算平均值等指标

- **观测事件的总计数**
  - 格式：`<basename>_count`
  - 表示总观测事件的数量，与 `le="+Inf"`（无穷大桶）的计数值相同

计算方法

- `histogram_quantile()` 函数

  ：用于根据直方图计算分位值（quantile），可以直接在单个直方图或聚合后的直方图上使用

  - 示例：计算 95% 分位的请求持续时间：

    ```shell
    histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
    ```

- Apdex 分数计算

  ：直方图也适用于计算 Apdex（用户满意度指标）

  - Apdex 是根据设定的响应时间阈值计算满意请求与总请求的比率

注意事项

- **累积性**：直方图的桶是累积的，`le="0.5"` 包括了 ≤ 0.5 秒的所有值，而不是单独的 0.1 秒到 0.5 秒的值
- **对比摘要（Summary）**：与摘要类似，但直方图更适合全局聚合和计算分位数，因为它提供了明确的桶边界和计数

示例：

假设有一个名为 `http_request_duration_seconds` 的直方图，以下是可能暴露的时间序列：

```shell
http_request_duration_seconds_bucket{le="0.1"} 100
http_request_duration_seconds_bucket{le="0.5"} 200
http_request_duration_seconds_bucket{le="1"} 300
http_request_duration_seconds_bucket{le="+Inf"} 400
http_request_duration_seconds_sum 450.5
http_request_duration_seconds_count 400
```



总结：

直方图适合分析分布情况、计算分位数以及评估性能指标（如 Apdex 分数）。使用时需注意其累积特性和适用场景



### Summary

**摘要（Summary）** 和直方图类似，主要用于对观测值（例如请求持续时间或响应大小）进行采样。它提供以下功能：

- 记录所有观测值的总数和总和
- 在可配置的滑动时间窗口内计算分位数（Quantiles）

摘要暴露的时间序列

基于其基础指标名称 `<basename>`，摘要在每次抓取（scrape）时会暴露以下时间序列：

- **流式 φ-分位数（Quantiles）**
  - 格式：`<basename>{quantile="<φ>"}`
  - 表示观测事件的 φ 分位数（0 ≤ φ ≤ 1），例如 `quantile="0.95"` 表示第 95 百分位
  - 示例：

```shell
# 第 95 分位请求耗时 0.45 秒
http_request_duration_seconds{quantile="0.95"} 0.45  
```

- **所有观测值的总和**
  - 格式：`<basename>_sum`
  - 表示所有观测值的累积和，例如请求持续时间的总和

- **观测事件的总计数**
  - 格式：`<basename>_count`
  - 表示所有观测事件的总数

与直方图的对比

- 分位数计算方式
  - **摘要**：实时计算分位数，但只能基于单个实例，无法聚合
  - **直方图**：基于桶分布计算分位数，适合跨实例聚合
- **存储和性能**：摘要计算精确的分位数，但消耗更多资源；直方图使用固定的桶定义，计算更高效
- 用途
  - **摘要**适合在局部实例中监控分位数，例如 95% 请求耗时
  - **直方图**更适合全局分布分析和聚合

示例：

假设一个摘要指标名称为 `http_request_duration_seconds`，可能暴露以下时间序列：

```shell
http_request_duration_seconds{quantile="0.5"} 0.3
http_request_duration_seconds{quantile="0.9"} 0.6
http_request_duration_seconds{quantile="0.99"} 1.2
http_request_duration_seconds_sum 45.0
http_request_duration_seconds_count 100
```

解释：

- 第 50%（中位数）的请求持续时间为 0.3 秒
- 第 90% 的请求持续时间为 0.6 秒
- 第 99% 的请求持续时间为 1.2 秒
- 总请求数为 100，总持续时间为 45 秒

总结：

摘要适合对单个实例的实时分位数监控，但无法跨实例聚合。如果需要分布分析和全局聚合，建议使用直方图代替摘要

 