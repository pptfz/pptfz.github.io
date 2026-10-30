# istio VirtualService uri重定向



nacos需要 `ip:port/nacos` 这样访问，如果想要直接输入域名访问，则vs的配置文件如下

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: nacos-vs
  namespace: xxx
spec:
  gateways:
  - xxx # istio gw 的名称
  hosts:
  - xxx # nacos访问的域名
  http:
  - match:
    - uri:
        exact: / # 匹配 URI 为 /
    redirect:
      uri: /nacos # 将匹配到的请求重定向到 /nacos 这个重定向规则会让用户访问根路径时，自动转到 /nacos，且浏览器 URL 会变成 /nacos
  - match:
    - uri:
        prefix: /nacos # 匹配 URI 前缀为 /nacos 的请求
    route:
    - destination:
        host: nacos-cs.int-middleware.svc.cluster.local # nacos的svc名称
        port:
          number: 8848
```

