# prometheus配置文件

## prometheus.yml

`prometheus.yml`  默认如下

```yaml
# 全局配置
global:
  evaluation_interval: 1m    # 规则评估间隔时间
  scrape_interval: 1m        # 默认的数据抓取间隔时间
  scrape_timeout: 10s        # 单次数据抓取的超时时间

# 规则文件
rule_files:                                 # 定义要加载的规则文件列表
- /etc/config/recording_rules.yml           # 记录规则文件，用于预计算和存储复杂查询结果
- /etc/config/alerting_rules.yml            # 告警规则文件，定义触发告警的条件
- /etc/config/rules                         # 可能包含混合规则的文件或目录
- /etc/config/alerts                        # 可能包含额外告警规则的文件或目录

# 监控prometheus本身
scrape_configs:                          # 开始 scrape_configs 部分，定义了所有的抓取配置
- job_name: prometheus                   # 定义一个名为 "prometheus" 的作业
  static_configs:                        # 使用静态配置，而不是动态服务发现
  - targets:                             # 定义目标列表
    - localhost:9090                     # 指定 Prometheus 自身的地址和端口

# 这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes API 服务器
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-apiservers                                         # 定义作业名称为 "kubernetes-apiservers"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: endpoints                                                       # 使用 endpoints 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: keep                                                          # 定义一个保留动作
    regex: default;kubernetes;https                                       # 指定匹配的正则表达式
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_namespace                                         # Kubernetes 命名空间元数据
    - __meta_kubernetes_service_name                                      # Kubernetes 服务名元数据
    - __meta_kubernetes_endpoint_port_name                                # Kubernetes 端点端口名元数据
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）

# 这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes 集群中的所有节点
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-nodes                                              # 定义作业名称为 "kubernetes-nodes"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: node                                                            # 使用 node 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: labelmap                                                      # 将 Kubernetes 标签映射为 Prometheus 标签
    regex: __meta_kubernetes_node_label_(.+)                              # 匹配所有节点标签
  - replacement: kubernetes.default.svc:443                               # 替换为 Kubernetes API 服务器地址
    target_label: __address__                                             # 设置目标地址标签
  - regex: (.+)                                                           # 匹配任何字符串
    replacement: /api/v1/nodes/$1/proxy/metrics                           # 替换为节点指标的 API 路径
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_node_name                                         # 使用节点名称
    target_label: __metrics_path__                                        # 设置指标路径标签
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）

# 这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes 集群中所有节点的 cAdvisor 指标。cAdvisor（Container Advisor）提供了关于容器的详细资源使用信息
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-nodes-cadvisor                                     # 定义作业名称为 "kubernetes-nodes-cadvisor"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: node                                                            # 使用 node 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: labelmap                                                      # 将 Kubernetes 标签映射为 Prometheus 标签
    regex: __meta_kubernetes_node_label_(.+)                              # 匹配所有节点标签
  - replacement: kubernetes.default.svc:443                               # 替换为 Kubernetes API 服务器地址
    target_label: __address__                                             # 设置目标地址标签
  - regex: (.+)                                                           # 匹配任何字符串
    replacement: /api/v1/nodes/$1/proxy/metrics/cadvisor                  # 替换为 cAdvisor 指标的 API 路径
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_node_name                                         # 使用节点名称
    target_label: __metrics_path__                                        # 设置指标路径标签
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）
 
# 这个配置定义了一个名为 kubernetes-services 的任务，用于监控 Kubernetes 服务。它使用 Kubernetes 服务发现机制来查找服务，并通过 blackbox exporter 来探测这些服务 
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-services                      # 定义任务名称为 kubernetes-services
  kubernetes_sd_configs:
  - role: service                                    # 使用 Kubernetes 服务发现，角色为 service
  metrics_path: /probe                               # 指定度量指标的路径为 /probe
  params:
    module:
    - http_2xx                                       # 设置参数 module 为 http_2xx
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_probe  # 保留带有 prometheus.io/probe: "true" 注解的服务
  - source_labels:
    - __address__
    target_label: __param_target                     # 将服务地址作为目标参数
  - replacement: blackbox
    target_label: __address__                        # 将地址替换为 blackbox
  - source_labels:
    - __param_target
    target_label: instance                           # 将目标参数设置为实例标签
  - action: labelmap
    regex: __meta_kubernetes_service_label_(.+)      # 将 Kubernetes 服务标签映射为 Prometheus 标签
  - source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - source_labels:
    - __meta_kubernetes_service_name
    target_label: service                            # 设置服务名称标签

# 个配置定义了一个名为 kubernetes-pods 的任务，用于监控 Kubernetes 中的 Pod。它使用 Kubernetes 服务发现机制来查找 Pod，并通过一系列的重新标记规则来处理和调整标签
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-pods                          # 定义任务名称为 kubernetes-pods
  kubernetes_sd_configs:
  - role: pod                                        # 使用 Kubernetes 服务发现，角色为 pod
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape  # 保留带有 prometheus.io/scrape: "true" 注解的 Pod
  - action: drop
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape_slow  # 排除带有 prometheus.io/scrape-slow: "true" 注解的 Pod
  - action: replace
    regex: (https?)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scheme
    target_label: __scheme__                         # 设置 scheme 标签（http 或 https）
  - action: replace
    regex: (.+)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_path
    target_label: __metrics_path__                   # 设置度量指标路径
  - action: replace
    regex: (\d+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})
    replacement: '[$2]:$1'
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv6 地址和端口
  - action: replace
    regex: (\d+);((([0-9]+?)(\.|$)){4})
    replacement: $2:$1
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv4 地址和端口
  - action: labelmap
    regex: __meta_kubernetes_pod_annotation_prometheus_io_param_(.+)
    replacement: __param_$1                          # 将 Pod 注解中的参数映射为 Prometheus 参数
  - action: labelmap
    regex: __meta_kubernetes_pod_label_(.+)          # 将 Kubernetes Pod 标签映射为 Prometheus 标签
  - action: replace
    source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_name
    target_label: pod                                # 设置 Pod 名称标签
  - action: drop
    regex: Pending|Succeeded|Failed|Completed
    source_labels:
    - __meta_kubernetes_pod_phase                    # 排除非运行状态的 Pod
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node                               # 设置节点名称标签

# 这个配置定义了一个名为 kubernetes-pods-slow 的任务，专门用于监控那些需要较长时间抓取的 Kubernetes Pod。它使用 Kubernetes 服务发现机制来查找 Pod，并通过一系列的重新标记规则来处理和调整标签
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-pods-slow                     # 定义任务名称为 kubernetes-pods-slow
  kubernetes_sd_configs:
  - role: pod                                        # 使用 Kubernetes 服务发现，角色为 pod
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape_slow  # 保留带有 prometheus.io/scrape-slow: "true" 注解的 Pod
  - action: replace
    regex: (https?)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scheme
    target_label: __scheme__                         # 设置 scheme 标签（http 或 https）
  - action: replace
    regex: (.+)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_path
    target_label: __metrics_path__                   # 设置度量指标路径
  - action: replace
    regex: (\d+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})
    replacement: '[$2]:$1'
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv6 地址和端口
  - action: replace
    regex: (\d+);((([0-9]+?)(\.|$)){4})
    replacement: $2:$1
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv4 地址和端口
  - action: labelmap
    regex: __meta_kubernetes_pod_annotation_prometheus_io_param_(.+)
    replacement: __param_$1                          # 将 Pod 注解中的参数映射为 Prometheus 参数
  - action: labelmap
    regex: __meta_kubernetes_pod_label_(.+)          # 将 Kubernetes Pod 标签映射为 Prometheus 标签
  - action: replace
    source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_name
    target_label: pod                                # 设置 Pod 名称标签
  - action: drop
    regex: Pending|Succeeded|Failed|Completed
    source_labels:
    - __meta_kubernetes_pod_phase                    # 排除非运行状态的 Pod
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node                               # 设置节点名称标签
  scrape_interval: 5m                                # 设置抓取间隔为 5 分钟
  scrape_timeout: 30s                                # 设置抓取超时时间为 30 秒
  
# 这段配置是 Prometheus 的 AlertManager 配置，用于在 Kubernetes 环境中动态发现 AlertManager 实例  
alerting:
  alertmanagers:
  - kubernetes_sd_configs:
      - role: pod                                    # 使用 Kubernetes 服务发现，角色为 pod
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt  # 设置 CA 证书文件路径
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 设置 bearer token 文件路径
    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace]
      regex: monitor
      action: keep                                   # 只保留命名空间为 "monitor" 的 Pod
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_instance]
      regex: prometheus
      action: keep                                   # 只保留标签 app.kubernetes.io/instance 为 "prometheus" 的 Pod
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
      regex: alertmanager
      action: keep                                   # 只保留标签 app.kubernetes.io/name 为 "alertmanager" 的 Pod
    - source_labels: [__meta_kubernetes_pod_container_port_number]
      regex: "9093"
      action: keep                                   # 只保留容器端口号为 9093 的 Pod
```



### 全局配置

:::tip 说明

- `evaluation_interval: 1m`
  - 这设置了 Prometheus 评估规则的频率。
  - 每隔 1 分钟，Prometheus 会评估一次所有的记录规则和告警规则。
  - 这意味着新的记录或告警最多会有 1 分钟的延迟才会被创建或触发。

- `scrape_interval: 1m`
  - 这是默认的数据抓取间隔时间。
  - 如果没有在具体的 job 中指定不同的 `scrape_interval`，Prometheus 将每隔 1 分钟从所有目标抓取一次指标数据。
  - 这个设置影响数据的精度和存储需求：更频繁的抓取会提供更精细的数据，但也会增加存储压力。

- `scrape_timeout: 10s`
  - 这定义了单次数据抓取操作的超时时间。
  - 如果某个目标在 10 秒内没有响应，Prometheus 将中断这次抓取操作并标记为失败。
  - 这个设置有助于防止慢速或无响应的目标影响整体的抓取周期。

这些全局设置为整个 Prometheus 配置提供了基础，确保了数据收集的及时性和系统的响应性。每个具体的 job 可以覆盖这些全局设置，以适应特定目标的需求。例如，对于一些重要但变化较慢的指标，可能会在 job 中设置更长的 `scrape_interval`。

:::

```yaml
global:
  evaluation_interval: 1m    # 规则评估间隔时间
  scrape_interval: 1m        # 默认的数据抓取间隔时间
  scrape_timeout: 10s        # 单次数据抓取的超时时间
```



### 规则文件

:::tip 说明

- `/etc/config/recording_rules.yml`
  - 这个文件通常包含记录规则（recording rules）。
  - 记录规则用于预计算经常需要的或计算复杂的表达式，并将结果保存为新的时间序列。
  - 这可以提高查询性能，特别是对于仪表板等频繁查询的场景。

- `/etc/config/alerting_rules.yml`
  - 这个文件通常包含告警规则（alerting rules）。
  - 告警规则定义了什么条件下应该触发告警，例如当某个指标超过阈值时。
  - 这些规则被持续评估，如果条件满足，Prometheus 会生成告警并发送到 AlertManager。

- `/etc/config/rules`
  - 这可能是一个包含额外规则的目录或文件。
  - 它可能包含混合的记录规则和告警规则，或者是特定于某个应用或服务的规则集。

- `/etc/config/alerts`
  - 类似于 `rules`，这也可能是一个包含额外告警规则的目录或文件。
  - 有时候，团队会选择将所有告警相关的规则集中在一个单独的位置，这就是这个文件的用途。

重要说明：

- Prometheus 会按照这里列出的顺序加载和处理这些文件。
- 如果任何一个指定的文件或目录不存在，Prometheus 在启动时会报错。
- 这些路径是相对于 Prometheus 容器内的文件系统。在 Kubernetes 环境中，这些通常通过 ConfigMap 或其他卷挂载机制提供。
- 规则文件的内容必须遵循 Prometheus 的规则语法，通常使用 YAML 格式。

通过这种方式组织规则文件，可以使配置更加模块化和易于管理。例如，可以将不同类型的规则（记录、告警）分开，或者按照服务/应用来组织规则文件。这种灵活性允许在不重启 Prometheus 的情况下动态更新规则，只需要修改相应的 ConfigMap 并等待 Prometheus 重新加载规则即可。

:::

```yaml
rule_files:                                 # 定义要加载的规则文件列表
- /etc/config/recording_rules.yml           # 记录规则文件，用于预计算和存储复杂查询结果
- /etc/config/alerting_rules.yml            # 告警规则文件，定义触发告警的条件
- /etc/config/rules                         # 可能包含混合规则的文件或目录
- /etc/config/alerts                        # 可能包含额外告警规则的文件或目录
```



### 监控prometheus本身

:::tip 说明

- `scrape_configs:`
  - 这是 Prometheus 配置中的一个主要部分，用于定义所有的数据抓取配置。

- `- job_name: prometheus`
  - 定义了一个名为 "prometheus" 的作业。
  - 这个名称会被添加为抓取到的所有指标的 `job` 标签。

- `static_configs:`
  - 表示使用静态配置来定义目标，而不是动态服务发现。
  - 适用于已知且不经常变化的目标。

- `- targets:`
  - 开始定义目标列表。

- `- localhost:9090`
  - 指定 Prometheus 服务器自身的地址和端口。
  - 这允许 Prometheus 监控自己的性能和状态。

这个配置的作用是让 Prometheus 监控自己，这对于了解 Prometheus 自身的性能、资源使用情况和内部状态非常有用。通过这个配置，你可以查询 Prometheus 自己的指标，如抓取持续时间、目标数量、存储性能等。

这是最基本的 scrape 配置之一，通常在所有 Prometheus 设置中都会包含，以确保可以监控 Prometheus 自身的健康状况。

:::

```yaml
scrape_configs:                          # 开始 scrape_configs 部分，定义了所有的抓取配置
- job_name: prometheus                   # 定义一个名为 "prometheus" 的作业
  static_configs:                        # 使用静态配置，而不是动态服务发现
  - targets:                             # 定义目标列表
    - localhost:9090                     # 指定 Prometheus 自身的地址和端口
```



### 监控API Server

:::tip 说明

这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes API 服务器。以下是一些关键点：

- 使用服务账户令牌进行身份验证。

- 利用 Kubernetes 服务发现来动态发现 API 服务器端点。

- 通过重新标记配置，只保留默认命名空间中名为 "kubernetes" 的服务的 HTTPS 端点。

- 使用 HTTPS 进行安全通信，但跳过了证书验证（这在生产环境中通常不推荐）。

这种配置允许 Prometheus 自动发现和监控 Kubernetes API 服务器，即使在集群规模变化或 API 服务器位置改变时也能保持正确的监控。

:::

```yaml
# 这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes API 服务器
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-apiservers                                         # 定义作业名称为 "kubernetes-apiservers"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: endpoints                                                       # 使用 endpoints 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: keep                                                          # 定义一个保留动作
    regex: default;kubernetes;https                                       # 指定匹配的正则表达式
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_namespace                                         # Kubernetes 命名空间元数据
    - __meta_kubernetes_service_name                                      # Kubernetes 服务名元数据
    - __meta_kubernetes_endpoint_port_name                                # Kubernetes 端点端口名元数据
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）
```



### 监控node节点

:::tip 说明

这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes 集群中的所有节点。以下是一些关键点：

- 使用服务账户令牌进行身份验证。

- 使用 Kubernetes 服务发现来动态发现集群中的所有节点。

- 通过 relabel_configs 进行以下操作：
  - 将所有 Kubernetes 节点标签映射为 Prometheus 标签。
  - 将目标地址设置为 Kubernetes API 服务器，因为我们通过 API 服务器来访问节点指标。
  - 构造正确的指标路径，使用节点名称来访问每个节点的指标。

- 使用 HTTPS 进行安全通信，但跳过了证书验证（这在生产环境中通常不推荐）。

这种配置允许 Prometheus 自动发现和监控 Kubernetes 集群中的所有节点，即使在节点数量变化或节点替换时也能保持正确的监控。它通过 Kubernetes API 服务器代理来访问各个节点的指标，这样可以绕过可能的网络限制。

:::

```yaml
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-nodes                                              # 定义作业名称为 "kubernetes-nodes"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: node                                                            # 使用 node 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: labelmap                                                      # 将 Kubernetes 标签映射为 Prometheus 标签
    regex: __meta_kubernetes_node_label_(.+)                              # 匹配所有节点标签
  - replacement: kubernetes.default.svc:443                               # 替换为 Kubernetes API 服务器地址
    target_label: __address__                                             # 设置目标地址标签
  - regex: (.+)                                                           # 匹配任何字符串
    replacement: /api/v1/nodes/$1/proxy/metrics                           # 替换为节点指标的 API 路径
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_node_name                                         # 使用节点名称
    target_label: __metrics_path__                                        # 设置指标路径标签
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）
```



### 监控cAdvisor指标

:::tip 说明

这个配置块的主要目的是设置 Prometheus 来监控 Kubernetes 集群中所有节点的 cAdvisor 指标。cAdvisor（Container Advisor）提供了关于容器的详细资源使用信息。以下是一些关键点：

1. 使用服务账户令牌进行身份验证。
2. 使用 Kubernetes 服务发现来动态发现集群中的所有节点。
3. 通过 relabel_configs 进行以下操作：
   - 将所有 Kubernetes 节点标签映射为 Prometheus 标签。
   - 将目标地址设置为 Kubernetes API 服务器，因为我们通过 API 服务器来访问 cAdvisor 指标。
   - 构造正确的指标路径，使用节点名称来访问每个节点的 cAdvisor 指标。
4. 使用 HTTPS 进行安全通信，但跳过了证书验证（这在生产环境中通常不推荐）。

这种配置允许 Prometheus 自动发现和监控 Kubernetes 集群中所有节点的 cAdvisor 指标，即使在节点数量变化或节点替换时也能保持正确的监控。它通过 Kubernetes API 服务器代理来访问各个节点的 cAdvisor 指标，这样可以绕过可能的网络限制，并提供了丰富的容器级别的资源使用情况数据。

:::

```yaml
- bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 指定用于认证的令牌文件路径
  job_name: kubernetes-nodes-cadvisor                                     # 定义作业名称为 "kubernetes-nodes-cadvisor"
  kubernetes_sd_configs:                                                  # 开始 Kubernetes 服务发现配置
  - role: node                                                            # 使用 node 角色进行服务发现
  relabel_configs:                                                        # 开始重新标记配置
  - action: labelmap                                                      # 将 Kubernetes 标签映射为 Prometheus 标签
    regex: __meta_kubernetes_node_label_(.+)                              # 匹配所有节点标签
  - replacement: kubernetes.default.svc:443                               # 替换为 Kubernetes API 服务器地址
    target_label: __address__                                             # 设置目标地址标签
  - regex: (.+)                                                           # 匹配任何字符串
    replacement: /api/v1/nodes/$1/proxy/metrics/cadvisor                  # 替换为 cAdvisor 指标的 API 路径
    source_labels:                                                        # 指定源标签
    - __meta_kubernetes_node_name                                         # 使用节点名称
    target_label: __metrics_path__                                        # 设置指标路径标签
  scheme: https                                                           # 使用 HTTPS 协议
  tls_config:                                                             # TLS 配置开始
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt         # 指定 CA 证书文件路径
    insecure_skip_verify: true                                            # 跳过证书验证（不安全，仅用于测试）
```



### 监控k8s服务

:::tip 说明

这个配置定义了一个名为 `kubernetes-services` 的任务，用于监控 Kubernetes 服务。它使用 Kubernetes 服务发现机制来查找服务，并通过 blackbox exporter 来探测这些服务。主要特点包括：

- 使用服务发现来查找 Kubernetes 服务。

- 只监控带有 `prometheus.io/probe: "true"` 注解的服务。

- 使用 `/probe` 路径和 `http_2xx` 模块，这表明它在使用 blackbox exporter 进行 HTTP 探测。

- 将原始服务地址保存为目标参数，然后将地址替换为 `blackbox` ，这是典型的 blackbox exporter 配置。

- 保留并映射各种 Kubernetes 元数据作为 Prometheus 标签，包括：
  - 所有 Kubernetes 服务标签
  - 命名空间
  - 服务名称

这种配置允许 Prometheus 自动发现和监控 Kubernetes 集群中的服务，并使用 blackbox exporter 来检查这些服务的可用性和性能。它提供了丰富的元数据标签，有助于更好地组织和查询监控数据。

:::

```yaml
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-services                      # 定义任务名称为 kubernetes-services
  kubernetes_sd_configs:
  - role: service                                    # 使用 Kubernetes 服务发现，角色为 service
  metrics_path: /probe                               # 指定度量指标的路径为 /probe
  params:
    module:
    - http_2xx                                       # 设置参数 module 为 http_2xx
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_probe  # 保留带有 prometheus.io/probe: "true" 注解的服务
  - source_labels:
    - __address__
    target_label: __param_target                     # 将服务地址作为目标参数
  - replacement: blackbox
    target_label: __address__                        # 将地址替换为 blackbox
  - source_labels:
    - __param_target
    target_label: instance                           # 将目标参数设置为实例标签
  - action: labelmap
    regex: __meta_kubernetes_service_label_(.+)      # 将 Kubernetes 服务标签映射为 Prometheus 标签
  - source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - source_labels:
    - __meta_kubernetes_service_name
    target_label: service                            # 设置服务名称标签
```



### 监控k8s pod

:::tip 说明

这个配置定义了一个名为 `kubernetes-pods` 的任务，用于监控 Kubernetes 中的 Pod。它使用 Kubernetes 服务发现机制来查找 Pod，并通过一系列的重新标记规则来处理和调整标签。主要特点包括：

- 使用 Pod 角色的服务发现来查找 Kubernetes Pod。

- 只监控带有 `prometheus.io/scrape: "true"` 注解的 Pod。

- 排除带有 `prometheus.io/scrape-slow: "true"` 注解的 Pod（这些 Pod 可能由另一个专门的任务来处理）。

- 根据 Pod 的注解设置 scheme 和度量指标路径。

- 处理 IPv4 和 IPv6 地址，combining Pod IP 和注解中指定的端口。

- 将 Pod 注解中的参数映射为 Prometheus 参数。

- 将所有 Kubernetes Pod 标签映射为 Prometheus 标签。

- 设置额外的标签，如命名空间、Pod 名称和节点名称。

- 排除非运行状态（Pending、Succeeded、Failed、Completed）的 Pod。

这种配置允许 Prometheus 自动发现和监控 Kubernetes 集群中的 Pod，提供了丰富的元数据标签，有助于更好地组织和查询监控数据。它还通过注解提供了灵活性，允许用户控制哪些 Pod 应该被监控，以及如何监控它们。

:::

```yaml
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-pods                          # 定义任务名称为 kubernetes-pods
  kubernetes_sd_configs:
  - role: pod                                        # 使用 Kubernetes 服务发现，角色为 pod
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape  # 保留带有 prometheus.io/scrape: "true" 注解的 Pod
  - action: drop
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape_slow  # 排除带有 prometheus.io/scrape-slow: "true" 注解的 Pod
  - action: replace
    regex: (https?)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scheme
    target_label: __scheme__                         # 设置 scheme 标签（http 或 https）
  - action: replace
    regex: (.+)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_path
    target_label: __metrics_path__                   # 设置度量指标路径
  - action: replace
    regex: (\d+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})
    replacement: '[$2]:$1'
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv6 地址和端口
  - action: replace
    regex: (\d+);((([0-9]+?)(\.|$)){4})
    replacement: $2:$1
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv4 地址和端口
  - action: labelmap
    regex: __meta_kubernetes_pod_annotation_prometheus_io_param_(.+)
    replacement: __param_$1                          # 将 Pod 注解中的参数映射为 Prometheus 参数
  - action: labelmap
    regex: __meta_kubernetes_pod_label_(.+)          # 将 Kubernetes Pod 标签映射为 Prometheus 标签
  - action: replace
    source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_name
    target_label: pod                                # 设置 Pod 名称标签
  - action: drop
    regex: Pending|Succeeded|Failed|Completed
    source_labels:
    - __meta_kubernetes_pod_phase                    # 排除非运行状态的 Pod
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node                               # 设置节点名称标签
```





### 监控需较长时间抓取的 K8s pod

:::tip 说明

这个配置定义了一个名为 `kubernetes-pods-slow` 的任务，专门用于监控那些需要较长时间抓取的 Kubernetes Pod。它使用 Kubernetes 服务发现机制来查找 Pod，并通过一系列的重新标记规则来处理和调整标签。主要特点包括：

- 使用 Pod 角色的服务发现来查找 Kubernetes Pod。

- 只监控带有 `prometheus.io/scrape-slow: "true"` 注解的 Pod。

- 根据 Pod 的注解设置 scheme 和度量指标路径。

- 处理 IPv4 和 IPv6 地址，combining Pod IP 和注解中指定的端口。

- 将 Pod 注解中的参数映射为 Prometheus 参数。

- 将所有 Kubernetes Pod 标签映射为 Prometheus 标签。

- 设置额外的标签，如命名空间、Pod 名称和节点名称。

- 排除非运行状态（Pending、Succeeded、Failed、Completed）的 Pod。

- 设置较长的抓取间隔（5分钟）和较长的超时时间（30秒）。

这种配置允许 Prometheus 自动发现和监控那些需要更长时间来收集指标的 Kubernetes Pod。它提供了与常规 Pod 监控相同的灵活性和丰富的元数据，但使用了更长的抓取间隔和超时时间，以适应那些可能需要更多时间来响应的 Pod。这对于某些特定的应用或服务可能很有用，它们可能需要更长的时间来生成或收集指标。

:::

```yaml
- honor_labels: true                                 # 保留原始标签，不覆盖已存在的标签
  job_name: kubernetes-pods-slow                     # 定义任务名称为 kubernetes-pods-slow
  kubernetes_sd_configs:
  - role: pod                                        # 使用 Kubernetes 服务发现，角色为 pod
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape_slow  # 保留带有 prometheus.io/scrape-slow: "true" 注解的 Pod
  - action: replace
    regex: (https?)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scheme
    target_label: __scheme__                         # 设置 scheme 标签（http 或 https）
  - action: replace
    regex: (.+)
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_path
    target_label: __metrics_path__                   # 设置度量指标路径
  - action: replace
    regex: (\d+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})
    replacement: '[$2]:$1'
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv6 地址和端口
  - action: replace
    regex: (\d+);((([0-9]+?)(\.|$)){4})
    replacement: $2:$1
    source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_port
    - __meta_kubernetes_pod_ip
    target_label: __address__                        # 处理 IPv4 地址和端口
  - action: labelmap
    regex: __meta_kubernetes_pod_annotation_prometheus_io_param_(.+)
    replacement: __param_$1                          # 将 Pod 注解中的参数映射为 Prometheus 参数
  - action: labelmap
    regex: __meta_kubernetes_pod_label_(.+)          # 将 Kubernetes Pod 标签映射为 Prometheus 标签
  - action: replace
    source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace                          # 设置命名空间标签
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_name
    target_label: pod                                # 设置 Pod 名称标签
  - action: drop
    regex: Pending|Succeeded|Failed|Completed
    source_labels:
    - __meta_kubernetes_pod_phase                    # 排除非运行状态的 Pod
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node                               # 设置节点名称标签
  scrape_interval: 5m                                # 设置抓取间隔为 5 分钟
  scrape_timeout: 30s                                # 设置抓取超时时间为 30 秒
```



### alertmanager配置

:::tip 说明

这段配置是 Prometheus 的 AlertManager 配置，用于在 Kubernetes 环境中动态发现 AlertManager 实例

- 服务发现： 使用 Kubernetes 的服务发现机制，角色设置为 "pod"。

- TLS 配置： 设置了 CA 证书和 bearer token 的文件路径，用于与 Kubernetes API 进行安全通信。

- 重新标记（relabel）配置： 使用多个筛选条件来确定要保留哪些 Pod： 
  - 名空间必须是 `monitor` 
  - Pod 必须有标签 `app.kubernetes.io/instance=prometheus`
  - Pod 必须有标签 `app.kubernetes.io/name=alertmanager` 
  - Pod 必须暴露 9093 端口

这个配置的目的是在 Kubernetes 集群中自动发现并配置符合特定条件的 AlertManager 实例。

需要注意的是，这个配置假设 AlertManager 部署在 `monitor` 命名空间，并且有特定的标签。如果您的实际部署情况不同，可能需要相应调整这些筛选条件。

:::

```yaml
alerting:
  alertmanagers:
  - kubernetes_sd_configs:
      - role: pod                                    # 使用 Kubernetes 服务发现，角色为 pod
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt  # 设置 CA 证书文件路径
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token  # 设置 bearer token 文件路径
    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace]
      regex: monitor
      action: keep                                   # 只保留命名空间为 "monitor" 的 Pod
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_instance]
      regex: prometheus
      action: keep                                   # 只保留标签 app.kubernetes.io/instance 为 "prometheus" 的 Pod
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
      regex: alertmanager
      action: keep                                   # 只保留标签 app.kubernetes.io/name 为 "alertmanager" 的 Pod
    - source_labels: [__meta_kubernetes_pod_container_port_number]
      regex: "9093"
      action: keep                                   # 只保留容器端口号为 9093 的 Pod
```

