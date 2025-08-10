# PromQL常用函数

## `label_replace`

[label_replace 官方文档](https://prometheus.io/docs/prometheus/latest/querying/functions/#label_replace)

### 作用

替换或新增标签的值



### 用法

```shell
label_replace(v instant-vector, dst_label, replacement, src_label, regex)
```

| 字段          | 说明                                                        |
| ------------- | ----------------------------------------------------------- |
| `v`           | 输入的时间序列数据                                          |
| `dst_label`   | 目标标签的名称，如果匹配，则**创建或替换**这个标签          |
| `replacement` | 匹配 `regex` 后的替换字符串，支持 `$1`、`$2` 等**正则分组** |
| `src_label`   | 要匹配的**源标签**                                          |
| `regex`       | 正则表达式，用于匹配 `src_label` 的值                       |





### 使用示例

#### 修改 `instance` 标签

查询内存使用率大于 `20%` 的节点，并且根据 `node(节点)` 、`instance(实例)` 分组

```sql
avg by (node, instance) (100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))) > 20
```

返回结果，可以看到，返回的 `instance` 中带有端口号

```sql
{instance="10.0.0.102:9100", node="k8s-node03"}	
```

![iShot_2025-03-04_19.42.15](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-04_19.42.15.png)



如果想要去掉 `instance` 中的端口号，则需要使用 `label_replace` 函数

:::tip 说明

```shell
label_replace(..., "instance", "$1", "instance", "(.*):.*")
```

作用：**修改 `instance` 标签，去掉端口号**

**正则解释**

- `"(.*):.*"`：
  - `(.*)`：匹配 `:` 之前的部分（即 IP 地址）
  - `:.*`：匹配 `:` 及后面的端口（丢弃）
- `"$1"`：保留第一个捕获组（即 IP 地址）

**结果**

- `10.0.0.101:9100` → `10.0.0.101`

:::

```sql
label_replace(
  avg by (node, instance) (100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))) > 20,
  "instance", "$1", "instance", "(.*):.*"
)
```

返回结果

```sql
{instance="10.0.0.102", node="k8s-node03"}	
```



![iShot_2025-03-04_19.28.46](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-04_19.28.46.png)