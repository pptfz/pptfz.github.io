# ingress-nginx配置tls

## 生成自签名证书

```shell
export DOMAIN=p8s.ops.com
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=$DOMAIN"
```





## 将证书和密钥存储为Kubernetes Secret

```bash
export SECRET_NAME=p8s-tls-secret
kubectl create secret tls $SECRET_NAME --cert=tls.crt --key=tls.key
```





## 编辑ingress配置文件

新增如下配置

```yaml
tls:
  - secretName: gitea-tls-secret
```



查看文件内容

```yaml
$ kubectl get ingress gitea -o yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    meta.helm.sh/release-name: gitea
    meta.helm.sh/release-namespace: ops
  creationTimestamp: "2024-06-05T09:08:17Z"
  generation: 1
  labels:
    app: gitea
    app.kubernetes.io/instance: gitea
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: gitea
    app.kubernetes.io/version: 1.21.1
    helm.sh/chart: gitea-10.1.4
    version: 1.21.1
  name: gitea
  namespace: ops
  resourceVersion: "484217"
  uid: 52f83585-f13c-4c87-9512-d313b0f4ef55
spec:
  rules:
  - host: gitea.ops.com
    http:
      paths:
      - backend:
          service:
            name: gitea-http
            port:
              number: 3000
        path: /
        pathType: Prefix
  tls:
  - secretName: gitea-tls-secret
status:
  loadBalancer: {}
```



