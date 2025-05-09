# cert-manager使用

集群入口是 `nginx-ingress` 参考这个[官方文档](https://cert-manager.io/docs/tutorials/acme/nginx-ingress/)



## 域名有公网解析

 



## 域名无公网解析

:::tip 说明

使用kind安装的k8s集群，并且使用 `nginx-ingress` 作为入口控制器，所有的域名解析都是 `127.0.0.1` ，因域名无公网解析导致CA机构(Let's Encrypt、HashiCorp Vault等)无法验证域名，此时就需要使用 [SelfSigned](https://cert-manager.io/docs/configuration/selfsigned/) 作为本地CA了

:::



### 创建issuer

在安装完 cert-manager 之后，第一件需要配置的就是 `Issuer` 或 `ClusterIssuer`。这些资源代表了能够对证书签名请求进行签发的证书颁发机构(CA)

:::tip 说明

- `Issuer` 是作用于特定命名空间， `ClusterIssuer` 是作用于全局
- `SelfSigned` 不依赖于任何资源，因此只需要在资源清单中 `spec` 下填写 `selfSigned` 即可

:::

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-cluster-issuer
  namespace: devops
spec:
  selfSigned: {}
```

这个 Issuer 将用于签发自签名证书



### 创建certificate

:::tip 说明

这个 `Certificate` 资源将使用 `selfsigned-cluster-issuer` 签发一个自签名的根证书,并将其存储在 `root-secret` Secret 中

:::

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-selfsigned-ca
  namespace: devops
spec:
  isCA: true
  commonName: my-selfsigned-ca
  secretName: root-secret
  privateKey:
    algorithm: ECDSA
    size: 256
  issuerRef:
    name: selfsigned-cluster-issuer
    kind: Issuer
    group: cert-manager.io
```



### 创建CA issuer

:::tip 说明

这个 `Issuer` 将使用之前创建的根证书 `root-secret` 作为 CA 来签发其他证书

:::

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: my-ca-cluster-issuer
  namespace: devops
spec:
  ca:
    secretName: root-secret
```













没有部署cert-manager

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    meta.helm.sh/release-name: gitea
    meta.helm.sh/release-namespace: devops
  creationTimestamp: "2025-04-28T09:01:45Z"
  generation: 1
  labels:
    app: gitea
    app.kubernetes.io/instance: gitea
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: gitea
    app.kubernetes.io/version: "1.23"
    helm.sh/chart: gitea-11.0.1
    version: "1.23"
  name: gitea
  namespace: devops
  resourceVersion: "637205"
  uid: 6222cb73-3ac9-4498-a759-672361d9f2a0
spec:
  ingressClassName: nginx
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
status:
  loadBalancer: {}
```



