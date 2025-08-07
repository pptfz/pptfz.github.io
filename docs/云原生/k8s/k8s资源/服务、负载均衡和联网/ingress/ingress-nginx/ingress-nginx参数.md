# ingress-nginx参数

[ingress-nginx参数官方文档](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/cli-arguments.md)



## `--publish-status-address`

### 作用

自定义地址（或多个地址，用逗号分隔），用于设置由该控制器处理的 Ingress 对象的 load-balancer 状态。需要同时启用 `update-status` 参数

如果你指定了 `--publish-status-address=...`，控制器会用这些地址来更新 Ingress 的 `status.loadBalancer.ingress` 字段。这个功能必须配合启用 `--update-status` 参数一起使用





### 示例

kind官方提供的ingress-nginx [安装文件](https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml) 中就指定了参数 `--publish-status-address=localhost` ，因此所创建的ingress资源中的 `status.loadBalancer.ingress` 中的ip是 `localhost`



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="kind" label="kind" default>

```yaml
spec:
  containers:
  - args:
    - /nginx-ingress-controller
    - --election-id=ingress-nginx-leader
    - --controller-class=k8s.io/ingress-nginx
    - --ingress-class=nginx
    - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
    - --validating-webhook=:8443
    - --validating-webhook-certificate=/usr/local/certificates/cert
    - --validating-webhook-key=/usr/local/certificates/key
    - --watch-ingress-without-class=true
    - --publish-status-address=localhost
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.namespace
    - name: LD_PRELOAD
      value: /usr/local/lib/libmimalloc.so
```

  </TabItem>
  <TabItem value="ingress-nginx官方" label="ingress-nginx官方">

```yaml
spec:
  containers:
  - args:
    - /nginx-ingress-controller
    - --default-backend-service=$(POD_NAMESPACE)/ingress-nginx-defaultbackend
    - --publish-service=$(POD_NAMESPACE)/ingress-nginx-controller
    - --election-id=ingress-nginx-leader
    - --controller-class=k8s.io/ingress-nginx
    - --ingress-class=nginx
    - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
    - --validating-webhook=:8443
    - --validating-webhook-certificate=/usr/local/certificates/cert
    - --validating-webhook-key=/usr/local/certificates/key
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.namespace
    - name: LD_PRELOAD
      value: /usr/local/lib/libmimalloc.so
```

  </TabItem>
</Tabs>



![iShot_2025-05-12_14.33.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-12_14.33.45.png)

