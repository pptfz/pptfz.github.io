# ingress-nginx配置访问认证



有一些平台是不需要登陆就可以访问的，例如prometheus，安装完成后直接访问就可以了

![iShot_2024-05-30_17.23.40](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-05-30_17.23.40.png)





### ingress配置访问认证

### 创建基本认证密码文件

:::tip 说明

其中 `p8s` 是用户名，回车后会提示输入密码，执行完成后生成的 `auth` 文件内容如下

```bash
$ cat auth
p8s:$apr1$VKAtzj6S$Pl/NTZiMLXUSCI1oOSykv.
```

:::

```bash
$ htpasswd -c auth p8s 
New password: 
Re-type new password: 
Adding password for user p8s
```



### 创建secret

```bash
kubectl create secret generic basic-auth --from-file=auth
```



### 配置ingress-nginx

如下是原先的默认ingress配置文件

:::tip 说明

之需要在ingress配置文件中的 `annotations` 下添加如下内容即可，其中 `basic-auth` 是上一步创建的 `secret` 的名称

```yaml
annotations:
    nginx.ingress.kubernetes.io/auth-type: "basic"
    nginx.ingress.kubernetes.io/auth-secret: "basic-auth"
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
```

:::

```yaml
$ kubectl get ingress prometheus-server -o yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    meta.helm.sh/release-name: prometheus
    meta.helm.sh/release-namespace: monitor
  creationTimestamp: "2024-05-30T06:19:35Z"
  generation: 1
  labels:
    app.kubernetes.io/component: server
    app.kubernetes.io/instance: prometheus
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: prometheus
    app.kubernetes.io/part-of: prometheus
    app.kubernetes.io/version: v2.52.0
    helm.sh/chart: prometheus-25.21.0
  name: prometheus-server
  namespace: monitor
  resourceVersion: "293693"
  uid: 4da70182-6882-4f02-bb29-627aba3e1a2e
spec:
  rules:
  - host: p8s.ops.com
    http:
      paths:
      - backend:
          service:
            name: prometheus-server
            port:
              number: 80
        path: /
        pathType: Prefix
status:
  loadBalancer:
    ingress:
    - hostname: localhost
```



### 访问

配置完成后访问浏览器就提示需要输入用户名密码了

![iShot_2024-05-30_17.43.09](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-05-30_17.43.09.png)
