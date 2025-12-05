# Envoy Gateway使用

## 创建GatewayClass

:::tip 说明

`GatewayClass` 是 `Envoy Gateway` 的入口控制器

:::

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

```yaml
cat > Gateway.yaml << EOF
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
    - name: https
      protocol: HTTPS
      port: 443
EOF
```



查看创建的gateway

```shell
$ k get gateway
NAME    CLASS   ADDRESS      PROGRAMMED   AGE
pptfz   pptfz   10.0.0.231   False        8s
```



gateway创建完后会自动创建LoadBalancer类型的sec

```shell
$ k get svc         
NAME                                        TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                                            AGE
envoy-envoy-gateway-system-pptfz-a1c63820   LoadBalancer   10.103.151.34   10.0.0.231    80:30626/TCP                                       12s
```



