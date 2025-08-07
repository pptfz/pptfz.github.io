# ingress-nginx默认证书



安装完 `ingress-nginx` 后，在 `/etc/ingress-controller/ssl` 下会生成一个名为 `default-fake-certificate.pem` 的自签名伪证书

这个证书的 `CN` 是 `Kubernetes Ingress Controller Fake Certificate`

这是 `Ingress-nginx` 的**默认行为**：

- 如果你配置了一个 `Ingress` 资源，但没有为它配置 TLS 证书（例如没有设置 `spec.tls`）
- 或者域名没有对应的有效证书 `secret`
- 那么 `nginx` 会回退使用它内置的 **自签名伪证书**

![iShot_2025-05-13_18.42.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-13_18.42.33.png)

