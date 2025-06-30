



# PrometheusAlert

[PrometheusAlert github](https://github.com/feiyu563/PrometheusAlert)

[PrometheusAlert官网](https://feiyu563.gitbook.io/)



## 简介

Prometheus Alert是开源的运维告警中心消息转发系统,支持主流的监控系统Prometheus,Zabbix,日志系统Graylog和数据可视化系统Grafana发出的预警消息,支持钉钉,微信,华为云短信,腾讯云短信,腾讯云电话,阿里云短信,阿里云电话等



## 安装

更多安装方式可参考 [官方文档](https://feiyu563.gitbook.io/prometheusalert/base-install) ，这里我们选择使用yaml文件安装



### 克隆代码

```shell
git clone https://github.com/feiyu563/PrometheusAlert.git
```



### 修改配置

```shell
cd example/kubernetes
```



#### 新增持久化配置

编辑 `example/kubernetes` 目录下的 `PrometheusAlert-Deployment.yaml` ，新增pvc配置

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-alert-center-pvc
  namespace: monitor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: your-storage-class-name  # 你需要替换为你自己的 StorageClass 名
```



在 `Deployment` 中新增了一个 volumeMount，挂载到容器内 `/app/db` 路径

```yaml
        volumeMounts:
        ...
        - name: prometheus-alert-center-db     # 新增挂载 db 的 volume
          mountPath: /app/db                   # PrometheusAlertDB.db 在这里
```



在 `Deployment` 的 volumes 中新增了 PVC 引用

```yaml
      volumes:
      ...
      - name: prometheus-alert-center-db       # 对应 volumeMount
        persistentVolumeClaim:
          claimName: prometheus-alert-center-pvc
```



### 新增ingress配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  generation: 1
  name: prometheusalert
  namespace: monitor
spec:
  rules:
  - host: prometheus-alert.ops.com
    http:
      paths:
      - backend:
          service:
            name: prometheus-alert-center
            port:
              number: 8080
        path: /
        pathType: Prefix
```



### 安装

```shell
kubectl apply -f PrometheusAlert-Deployment.yaml
```





## 访问

登录PrometheusAlert

用户名密码是在 [app.config](https://github.com/feiyu563/PrometheusAlert/blob/master/conf/app-example.conf) 中配置的，默认是 `prometheusalert`

![iShot_2025-04-09_17.21.17](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-09_17.21.17.png)





登录后的web页面

![iShot_2025-04-09_17.18.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-09_17.18.37.png)



