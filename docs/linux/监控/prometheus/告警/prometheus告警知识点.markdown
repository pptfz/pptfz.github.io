# prometheus告警知识点

AlertManager的通知模板基于GO模板系统，可以参考 [go语言模版支持的函数](https://prometheus.io/docs/alerting/latest/notifications/#functions)



## 使用 `reReplaceAll` 函数对输出内容进行替换

`alerting_rules.yml` 文件内容

```yaml
groups:
  - name: node-memory-alerts
    rules:
      - alert: 内存使用率过高
        expr: avg by (node, instance) (100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))) > 30
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "节点 {{ $labels.node }} 内存使用率过高"
          #description: "节点 {{ $labels.node }}（实例 {{ $labels.instance }}）的内存使用率当前为 {{ printf \"%.2f\" $value }}%，已超过 80%，持续时间超过 2 分钟。"
          description: "节点 {{ $labels.node }}（实例 {{ $labels.instance | reReplaceAll \":.*\" \"\" }}）的内存使用率当前为 {{ printf \"%.2f\" $value }}%，已超过 20%，持续时间超过 2 分钟。"
```



使用如下语句输出的 `instance` 包含端口，在alertmanager组件中，不支持使用promql语句的 `label_replace` 函数进行替换

:::tip 说明

在promql中，使用 `label_replace` 函数对目标进行更改，但是不支持在告警规则中的 `expr` 块使用

```sql
label_replace(
  avg by (node, instance) (100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))) > 20,
  "instance", "$1", "instance", "(.*):.*"
)
```

:::

```yaml
description: "节点 {{ $labels.node }}（实例 {{ $labels.instance }}）的内存使用率当前为 {{ printf \"%.2f\" $value }}%，已超过 80%，持续时间超过 2 分钟。"
```

如下图所示，prometheus中告警的 `description` 中 `instance` 是带有端口号的

![iShot_2025-03-05_19.41.25](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-05_19.41.25.png)





因此需要使用go语言模版支持的函数 `reReplaceAll`

:::tip 说明

解析 `":.*"`

- `:` —— 匹配 **冒号**（`: `）
- `.*` —— 匹配 **任意字符（`.`）**，且 `*` 号表示 **匹配 0 次或多次**，即匹配冒号后面的所有内容

替换 `""`（空字符串）

- 这表示 **将匹配到的内容替换为空**，即 **删除** 这部分内容



效果就是把 `10.0.0.10:9100` 替换为 `10.0.0.10`

:::

```yaml
description: "节点 {{ $labels.node }}（实例 {{ $labels.instance | reReplaceAll \":.*\" \"\" }}）的内存使用率当前为 {{ printf \"%.2f\" $value }}%，已超过 20%，持续时间超过 2 分钟。"
```

使用替换函数后，prometheus中告警的 `description` 中 `instance` 的端口号就被替换为空了

![iShot_2025-03-05_19.38.16](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-03-05_19.38.16.png)

