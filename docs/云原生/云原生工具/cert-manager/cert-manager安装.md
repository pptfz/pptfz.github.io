# cert-manager安装

[cert-manager github](https://github.com/cert-manager/cert-manager)

[cert-manager 官网](https://cert-manager.io/)

[cert-manager 官方安装文档](https://cert-manager.io/docs/installation/)



## 简介

### 概念

| 名称                   | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| **Certificate**        | 用于定义一个证书的资源，包含了证书的元数据和所需的配置       |
| **Issuer**             | 负责签发证书的实体，可以是自签名的（SelfSigned）或外部的（如 Let's Encrypt），作用范围是某个命名空间 |
| **ClusterIssuer**      | 类似于 Issuer，但作用范围是整个 Kubernetes 集群，而不是特定的命名空间 |
| **CertificateRequest** | 一个请求对象，用于向 Issuer 请求签发证书，包含证书所需的信息 |
| **Secret**             | 存储生成的证书和私钥的 Kubernetes 资源，cert-manager 会自动创建并管理这些 Secret |
| **ACME**               | 一种协议，cert-manager 支持通过 ACME 协议与 Let's Encrypt 等 CA 进行交互，以自动化证书的获取和续期 |
| **Challenge**          | 在 ACME 流程中，CA 用于验证域名所有权的机制，cert-manager 可以处理不同类型的挑战 |
| **Webhook**            | cert-manager 使用的扩展机制，允许与其他系统进行集成，例如验证请求或处理证书签发 |
| **Renewal**            | 证书到期前的自动续期过程，cert-manager 会根据配置自动进行    |
| **Validation**         | 在签发证书之前，cert-manager 会进行域名验证，以确保请求者对域名的所有权 |
| **Finalizer**          | 在 Kubernetes 中的概念，用于确保某些清理操作在删除资源之前完成，cert-manager 使用 Finalizer 来确保证书的清理 |





### 核心功能概述

cert-manager 是一款专为 Kubernetes 和 OpenShift 集群设计的自动化证书管理工具，其核心功能包括：

- **证书自动颁发**：为集群内工作负载生成 TLS 证书
- **证书生命周期管理**：在证书到期前自动续期，确保持续的加密通信
- **多证书源支持**：支持从多种证书颁发机构（CA）获取证书，涵盖公有 CA 和私有 PKI 体系



### **支持的证书颁发机构（CA）类型**

cert-manager 兼容以下主流证书颁发源：

-  [Let's Encrypt](https://cert-manager.io/docs/configuration/acme/) ：免费公共 CA，通过 ACME 协议自动化签发证书（需开放 HTTP/DNS 验证）。

- [HashiCorp Vault](https://cert-manager.io/docs/configuration/vault/) ：企业级私有 CA，适用于内部 PKI 体系
- [Venafi](https://cert-manager.io/docs/configuration/venafi/) ：企业级证书全生命周期管理平台
- [private PKI](https://cert-manager.io/docs/configuration/ca/) ：自定义根证书的私有证书颁发体系



### 证书存储与安全机制

cert-manager 提供多种证书存储方案，适应不同安全需求：

#### 传统 Kubernetes Secret 存储

- **工作流程**：
  通过 `Certificate` 资源生成私钥和证书，并保存为 Kubernetes Secret

- **适用场景**：
  常规应用 Pod 挂载或 Ingress 控制器使用

- **示例配置**:

  ```yaml
  apiVersion: cert-manager.io/v1
  kind: Certificate
  metadata:
    name: example-cert
  spec:
    secretName: example-tls-secret  # 存储证书的 Secret
    issuerRef:
      name: letsencrypt-prod
      kind: ClusterIssuer
    dnsNames:
      - example.com
  ```





#### 动态密钥生成方案

- [csi-driver](https://cert-manager.io/docs/usage/csi-driver/) / [csi-driver-spiffe](https://cert-manager.io/docs/usage/csi-driver-spiffe/)
  - **密钥生成时机**：在应用 Pod 启动前按需生成私钥
  - **安全优势**：私钥仅存在于节点内存，不落盘且不存储为 Secret
- [istio-csr](https://cert-manager.io/docs/usage/istio-csr/)
  - **集成场景**：专为 Istio 服务网格设计，实现零信任架构下的证书自动化





## 架构



![iShot_2025-04-27_18.55.15](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-27_18.55.15.png)









## 安装







添加仓库

```sh
helm repo add cert-manager https://charts.jetstack.io
```



下载安装包

```shell
helm pull cert-manager/cert-manager
```



解压缩

```shell
tar xf cert-manager-v1.17.1.tgz && cd cert-manager
```



修改 `values.yaml` 文件

```yaml
  leaderElection:
    # Override the namespace used for the leader election lease.
    namespace: "devops"
```





使用如下开关开启crd

:::tip 说明

以下选项是弃用的

```yaml
installCRDs: false
```

:::

```yaml
crds:
  # This option decides if the CRDs should be installed
  # as part of the Helm installation.
  enabled: true
```



默认使用 `latest` 标签，建议修改为固定版本的标签

```yaml
repository: quay.io/jetstack/cert-manager-controller
repository: quay.io/jetstack/cert-manager-webhook
repository: quay.io/jetstack/cert-manager-cainjector
repository: quay.io/jetstack/cert-manager-acmesolver
repository: quay.io/jetstack/cert-manager-startupapicheck
```





配置issuer

