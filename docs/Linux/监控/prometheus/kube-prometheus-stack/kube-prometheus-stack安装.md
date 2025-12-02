# kube-prometheus-stack安装

[kube-prometheus-stack artifacthub](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack)

[Prometheus Community github](https://github.com/prometheus-community/helm-charts)



## 简介

`kube-prometheus-stack` 是一个 **完整的 Kubernetes 监控解决方案的 Helm Chart**，它打包了 Prometheus Operator 和相关的监控组件。

主要包含的组件：

核心监控组件：

- **Prometheus** - 监控系统和时间序列数据库
- **Alertmanager** - 告警管理组件
- **Grafana** - 数据可视化和仪表板
- **Prometheus Operator** - 简化 Prometheus 在 K8s 中的部署和管理

数据采集组件：

- **Node Exporter** - 节点级指标采集
- **kube-state-metrics** - Kubernetes 集群状态指标
- **各种 Exporters** - 应用和中间件指标采集





## 安装

### 添加仓库

```shell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```



### 下载包

```shell
helm pull prometheus-community/kube-prometheus-stack
```



### 解压缩

```shell
tar xf  kube-prometheus-stack-79.7.1.tgz      
```



### 编辑 `values.yaml`



## 安装

```shell
helm upgrade --install kube-prometheus-stack -n kube-prometheus-stack --create-namespace .
```











