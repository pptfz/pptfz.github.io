# Envoy Gateway使用

## 创建GatewayClass

[GatewayClass](https://gateway-api.sigs.k8s.io/api-types/gatewayclass/)

:::tip 说明

`GatewayClass` 是 `Envoy Gateway` 的入口控制器，类似于 ingressclass



官方示例 `GatewayClass` 配置

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: eg
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
```

:::



创建GatewayClass

```yaml
cat > GatewayClass.yaml << EOF
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: pptfz
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
EOF
```





## 创建Gateway

[Gateway](https://gateway-api.sigs.k8s.io/api-types/gateway/)

:::tip 说明

Gateway 是 **Gateway API 中的 "入口网关实例"**，相当于 **Ingress Controller + LoadBalancer Service 的组合体**

官方示例 `Gateway` 配置

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: eg
spec:
  gatewayClassName: eg
  listeners:
    - name: http
      protocol: HTTP
      port: 80
```

:::



创建Gateway

```yaml
cat << 'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: pptfz
spec:
  gatewayClassName: pptfz
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: All
    - name: https
      protocol: HTTPS
      port: 443
      allowedRoutes:
        namespaces:
          from: All
EOF
```



查看创建的gateway

```shell
$ k get gateway
NAME    CLASS   ADDRESS      PROGRAMMED   AGE
pptfz   pptfz   10.0.0.231   False        8s
```



gateway创建完后会自动创建LoadBalancer类型的svc

:::tip 说明

svc的命名规则是 `envoy-<gateway-namespace>-<gateway-name>-<哈希值>`

:::

```shell
$ k get svc
NAME                                        TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                                            AGE
envoy-envoy-gateway-system-pptfz-a1c63820   LoadBalancer   10.109.214.77   10.0.0.230    80:30828/TCP                                       5s
envoy-gateway                               ClusterIP      10.96.250.227   <none>        18000/TCP,18001/TCP,18002/TCP,19001/TCP,9443/TCP   8m20s
```



## 创建HTTPRoute

[HTTPRoute](https://gateway-api.sigs.k8s.io/api-types/httproute/)

:::tip 说明

HTTPRoute 是 **Gateway API 中的路由规则定义**，相当于 **Ingress 的升级版**



官方示例 `HTTPRoute` 配置

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: backend
spec:
  parentRefs:
    - name: eg
  hostnames:
    - "www.example.com"
  rules:
    - backendRefs:
        - group: ""
          kind: Service
          name: backend
          port: 3000
          weight: 1
      matches:
        - path:
            type: PathPrefix
            value: /
```

:::



创建HTTPRoute

```yaml
cat << 'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: gitea-envoy-gateway.ops.com
spec:
  parentRefs:
    - name: pptfz
      namespace: envoy-gateway-system # 主要这里要填写gateway的namespace
  hostnames:
    - "gitea-envoy-gateway.ops.com"
  rules:
    - backendRefs:
        - group: ""
          kind: Service
          name: gitea-http # 注意这里要填写正确的svc名称
          port: 3000
          weight: 1
      matches:
        - path:
            type: PathPrefix
            value: /
EOF
```



