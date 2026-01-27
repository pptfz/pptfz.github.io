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



### 更新仓库

```shell
helm repo update
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









安装完成后发现没有 `prometheus` pod

```shell
$ k get pod
NAME                                                        READY   STATUS    RESTARTS   AGE
alertmanager-kube-prometheus-stack-alertmanager-0           2/2     Running   0          2m51s
kube-prometheus-stack-grafana-0                             3/3     Running   0          2m52s
kube-prometheus-stack-kube-state-metrics-787d55fc86-fzs4l   1/1     Running   0          2m52s
kube-prometheus-stack-operator-d58f748bb-qnmzl              1/1     Running   0          2m52s
kube-prometheus-stack-prometheus-node-exporter-5rpdx        1/1     Running   0          2m52s
kube-prometheus-stack-prometheus-node-exporter-qxxbj        1/1     Running   0          2m52s
kube-prometheus-stack-prometheus-node-exporter-zm9st        1/1     Running   0          2m52s
```





查看日志报错发现是sc的问题

```shell
$ kubectl logs -n kube-prometheus-stack deploy/kube-prometheus-stack-operator
ts=2025-12-03T02:04:33.627620701Z level=info caller=/go/pkg/mod/k8s.io/client-go@v0.34.1/tools/cache/shared_informer.go:356 msg="Caches are synced" controller=prometheus
ts=2025-12-03T02:04:33.627623701Z level=info caller=/workspace/pkg/prometheus/server/operator.go:446 msg="successfully synced all caches" component=prometheus-controller
ts=2025-12-03T02:04:33.63089128Z level=error caller=/workspace/pkg/operator/resource_reconciler.go:680 msg="Unhandled Error" logger=UnhandledError err="sync \"kube-prometheus-stack/kube-prometheus-stack-prometheus\" failed: storage class \"gluster\" does not exist"
ts=2025-12-03T02:04:33.634116901Z level=error caller=/workspace/pkg/operator/resource_reconciler.go:680 msg="Unhandled Error" logger=UnhandledError err="sync \"kube-prometheus-stack/kube-prometheus-stack-prometheus\" failed: storage class \"gluster\" does not exist"
ts=2025-12-03T02:04:33.64053081Z level=error caller=/workspace/pkg/operator/resource_reconciler.go:680 msg="Unhandled Error" logger=UnhandledError err="sync \"kube-prometheus-stack/kube-prometheus-stack-prometheus\" failed: storage class \"gluster\" does not exist"
ts=2025-12-03T02:04:33.644490472Z level=error caller=/workspace/pkg/operator/resource_reconciler.go:680 msg="Unhandled Error" logger=UnhandledError err="sync \"kube-prometheus-stack/kube-prometheus-stack-prometheus\" failed: storage class \"gluster\" does not exist"
ts=2025-12-03T02:04:33.649291967Z level=error caller=/workspace/pkg/operator/resource_reconciler.go:680 msg="Unhandled Error" logger=UnhandledError err="sync \"kube-prometheus-stack/kube-prometheus-stack-prometheus\" failed: storage class \"gluster\" does not exist"
```



在 `values.yaml` 中，sc默认是 `gluster` 

```yaml
prometheus:
  prometheusSpec:
  ......
    storageSpec: 
    ## Using PersistentVolumeClaim
    ##
     volumeClaimTemplate:
       spec:
         storageClassName: gluster
         accessModes: ["ReadWriteOnce"]
         resources:
           requests:
             storage: 50Gi
```



![iShot_2025-12-03_10.06.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-12-03_10.06.12.png)



