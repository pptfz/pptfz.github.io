# Envoy Gateway安装

[Envoy Gateway helm](https://artifacthub.io/packages/helm/envoy-gateway/gateway-helm)

[Envoy Gateway github](https://github.com/envoyproxy/gateway)

[Envoy Gateway官网](https://gateway.envoyproxy.io/)





## 下载包

```shell
helm pull oci://docker.io/envoyproxy/gateway-helm
```



## 修改 `values.yaml`





## 安装 `Gateway API CRDs` 和 `Envoy Gateway`

:::caution 注意

 如果集群中安装了其他的网关，安装时需要指定 `--skip-crds` 跳过crd安装，否则会报错如下

```shell
Error: failed to install CRD crds/gatewayapi-crds.yaml: conflict occurred while applying object /udproutes.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /tlsroutes.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /referencegrants.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /backendtlspolicies.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /gatewayclasses.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 1 conflict: conflict with "helm" using apiextensions.k8s.io/v1: .metadata.annotations.gateway.networking.k8s.io/bundle-version
conflict occurred while applying object /grpcroutes.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /xbackendtrafficpolicies.gateway.networking.x-k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /tcproutes.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /gateways.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /xlistenersets.gateway.networking.x-k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
conflict occurred while applying object /httproutes.gateway.networking.k8s.io apiextensions.k8s.io/v1, Kind=CustomResourceDefinition: Apply failed with 2 conflicts: conflicts with "helm" using apiextensions.k8s.io/v1:
- .metadata.annotations.gateway.networking.k8s.io/bundle-version
- .spec.versions
```

:::

```shell
helm upgrade --install envoygateway -n envoy-gateway-system --create-namespace . --skip-crds
```



## 查看安装

```shell
$ k get pods
NAME                             READY   STATUS    RESTARTS   AGE
envoy-gateway-6fdc554576-klt4h   1/1     Running   0          73m
envoy-gateway-6fdc554576-qc4k6   1/1     Running   0          73m
```











