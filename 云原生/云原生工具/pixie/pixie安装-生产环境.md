# pixie安装-生产环境

[pixie github地址](https://github.com/pixie-io/pixie)

[pixie官网](https://px.dev/)

[pixie安装官方文档](https://docs.px.dev/installing-pixie/)



官方有多种安装方式，生产环境暴露公网域名按照这个 [安装文档](https://docs.px.dev/installing-pixie/install-guides/production-readiness/) 来进行安装，内网环境按照这个 [安装文档](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/) 来进行安装

## 1.安装要求

- k8s1.21+

- 内核版本4.14+

- 架构x86-64
- Pixie 与 Linux 内核交互安装 BPF 程序来收集遥测数据。为了安装 BPF 程序，Pixie [`vizier-pem-*`](https://docs.px.dev/about-pixie/what-is-pixie/#architecture)pod 需要[特权访问](https://github.com/pixie-io/pixie/blob/e03434a5e41d82159aa7602638804159830f9949/k8s/vizier/base/pem_daemonset.yaml#L115)。





## 2.安装NGINX Ingress Controller

可以参考官方安装文档 [NGINX Ingress Controller Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/) 

```shell
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```



安装成功后会提示如下

```shell
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
WARNING: Kubernetes configuration file is world-readable. This is insecure. Location: /root/.kube/config
Release "ingress-nginx" does not exist. Installing it now.
NAME: ingress-nginx
LAST DEPLOYED: Fri May 12 15:13:59 2023
NAMESPACE: ingress-nginx
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
The ingress-nginx controller has been installed.
It may take a few minutes for the LoadBalancer IP to be available.
You can watch the status by running 'kubectl --namespace ingress-nginx get services -o wide -w ingress-nginx-controller'

An example Ingress that makes use of the controller:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: example
    namespace: foo
  spec:
    ingressClassName: nginx
    rules:
      - host: www.example.com
        http:
          paths:
            - pathType: Prefix
              backend:
                service:
                  name: exampleService
                  port:
                    number: 80
              path: /
    # This section is only required if TLS is to be enabled for the Ingress
    tls:
      - hosts:
        - www.example.com
        secretName: example-tls

If TLS is enabled for the Ingress, a Secret containing the certificate and key must also be provided:

  apiVersion: v1
  kind: Secret
  metadata:
    name: example-tls
    namespace: foo
  data:
    tls.crt: <base64 encoded cert>
    tls.key: <base64 encoded key>
  type: kubernetes.io/tls
```



安装的pod

```shell
$ kubectl get pod -n ingress-nginx
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-65c4cbf667-8nb8l   1/1     Running   0          6m8s
```



安装的svc

```shell
$ kubectl get svc -n ingress-nginx
NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   192.168.17.145   8.217.114.146   80:32508/TCP,443:30026/TCP   6m27s
ingress-nginx-controller-admission   ClusterIP      192.168.43.210   <none>          443/TCP                      6m27s
```



## 3.创建DNS A记录

:::tip

需要创建两条DNA A记录，指向上面获取的 ingress-nginx-controller  地址

:::

```shell
pixie.example.com 8.217.114.146
work.pixie.example.com 8.217.114.146
```





## 4.安装 Pixie Cloud

:::tip说明

因为使用的是 [自托管安装](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/) ，因此需要按照以下步骤进行

1. [按照部署 Pixie Cloud](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/#1.-deploy-pixie-cloud) 中的步骤 1-5 和 8 进行操作
2. 注释`./scripts/create_cloud_secrets.sh` 中的94到106行(应该是94到108行)
3. [按照Deploy Pixie Cloud](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/#1.-deploy-pixie-cloud) 的步骤 9 中的说明执行脚本

:::



按照 [此文档](https://docs.px.dev/installing-pixie/install-guides/self-hosted-pixie/#1.-deploy-pixie-cloud) 中的步骤1-5和8进行安装



### 4.1 克隆仓库

```shell
git clone https://github.com/pixie-io/pixie.git
cd pixie
```



### 4.2 从repo上的标签中选择一个云发布版本

执行以下命令可以查看当前git仓库中所有的tag

```shell
$ git tag | grep 'release/cloud' | sort -r
release/cloud/staging/1679419561
release/cloud/prod/1683050579
release/cloud/prod/1681245428
release/cloud/prod/1680807534
release/cloud/prod/1679436203
release/cloud/prod/1678398018
release/cloud/prod/1678386321
release/cloud/prod/1678217044
release/cloud/prod/1677799529
release/cloud/prod/1676669858
release/cloud/prod/1676065759
release/cloud/prod/1674596375
release/cloud/prod/1672961079
release/cloud/prod/1670351615
release/cloud/prod/1668540618
......
```



以下是官方文档中选择最新版的命令，但是这个命令有坑

```shell
export LATEST_CLOUD_RELEASE=$(git tag | grep 'release/cloud'  | sort -r | head -n 1 | awk -F/ '{print $NF}')
```



如果按照官方的命令获取的是第一行，但是正确的应该是第二行

```shell
$ git tag | grep 'release/cloud' | sort -r
release/cloud/staging/1679419561
release/cloud/prod/1683050579
......
```



所以应该使用如下命令，直接过滤 `release/cloud/prod`

```shell
export LATEST_CLOUD_RELEASE=$(git tag | grep 'release/cloud/prod' | sort -r | awk -F/ 'NR==1{print $NF}')
```



### 4.3 检查发布标签

```shell
git checkout "release/cloud/prod/${LATEST_CLOUD_RELEASE}"
```



成功会有如下提示

```shell
Note: switching to 'release/cloud/prod/1683050579'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 7b1ef6aec [perf_tool] Specify experiments in terms of actions. (#1262)
```



### 4.4 更新相应的 kustomization 文件中的版本

```shell
perl -pi -e "s|newTag: latest|newTag: \"${LATEST_CLOUD_RELEASE}\"|g" k8s/cloud/public/kustomization.yaml
```



### 4.5 默认情况下，可以通过访问自托管的 Pixie Cloud `dev.withpixie.dev` ，如果使用自定义域名，需要将以下文件中出现的 `dev.withpixie.dev` 替换为自己的域名

```shell
k8s/cloud/public/base/proxy_envoy.yaml
k8s/cloud/public/base/domain_config.yaml
scripts/create_cloud_secrets.sh
```



使用如下命令修改

```shell
export MY_DOMAIN=pixie.example.com
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" k8s/cloud/public/base/proxy_envoy.yaml
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" k8s/cloud/public/base/domain_config.yaml
sed -i.bak "s/dev.withpixie.dev/$MY_DOMAIN/g" scripts/create_cloud_secrets.sh
```





### 4.6 创建 `plc` 命名空间

```shell
kubectl create ns plc
```



### 4.7 创建 pixie 云密钥

:::tip说明

需要注释以下脚本中的94到108行然后再执行

:::

注释行

```shell
sed -i.bak '94,108s/^/#/' scripts/create_cloud_secrets.sh
```



注释了以下内容

```shell
popd || exit 1

PROXY_TLS_CERTS="$(mktemp -d)"
PROXY_CERT_FILE="${PROXY_TLS_CERTS}/server.crt"
PROXY_KEY_FILE="${PROXY_TLS_CERTS}/server.key"

mkcert \
  -cert-file "${PROXY_CERT_FILE}" \
  -key-file "${PROXY_KEY_FILE}" \
  pixie.pptfz.cn "*.pixie.pptfz.cn" localhost 127.0.0.1 ::1

kubectl create secret tls -n "${namespace}" \
  cloud-proxy-tls-certs \
  --cert="${PROXY_CERT_FILE}" \
  --key="${PROXY_KEY_FILE}"
```



[按照Deploy Pixie Cloud](https://docs.px.dev/installing-pixie/install-guides/airgap-pixie/#deploy-pixie-cloud)的步骤 6 中的说明执行脚本

```shell
./scripts/create_cloud_secrets.sh
```



创建成功后会有如下提示

```shell
secret/cloud-auth-secrets created
secret/pl-hydra-secrets created
secret/pl-db-secrets created
secret/cloud-session-secrets created
/tmp/tmp.hhlhm3PF83 /data/k8s/pixie
Generating RSA private key, 4096 bit long modulus
................................................................................................................++
........++
e is 65537 (0x10001)
Generating RSA private key, 4096 bit long modulus
.................................................................++
..........................................................................................++
e is 65537 (0x10001)
Signature ok
subject=/O=Pixie/CN=pixie.server
Getting CA Private Key
Generating RSA private key, 4096 bit long modulus
..............................................................................................................++
...................................................................................................................................++
e is 65537 (0x10001)
Signature ok
subject=/O=Pixie/CN=pixie.client
Getting CA Private Key
secret/service-tls-certs created
/data/k8s/pixie

Created a new certificate valid for the following names 📜
 - "pixie.vipkid.com.cn"
 - "*.pixie.vipkid.com.cn"
 - "localhost"
 - "127.0.0.1"
 - "::1"

Reminder: X.509 wildcards only go one level deep, so this won't match a.b.pixie.vipkid.com.cn ℹ️

The certificate is at "/tmp/tmp.SdT6dAn93v/server.crt" and the key at "/tmp/tmp.SdT6dAn93v/server.key" ✅

It will expire on 9 August 2025 🗓

secret/cloud-proxy-tls-certs created
```



## 5.创建TLS证书

:::tip说明

与pixie一起使用的自定义域名需要TSL证书

假设你的pixie自定义域名是 `pixie.example.com` ，你需要获取一个对 `pixie.example.com` 和 `work.pixie.example.com` 都有效的证书，最后

使用证书在 `plc` 命名空间中创建一个名为 `cloud-proxy-tls-certs` 的secret

获取它的一种方法是使用  [cert-manager](https://cert-manager.io/) 创建 Let's Encrypt 证书。[来自 cert-manager 的Securing NGINX-ingress 教程](https://cert-manager.io/docs/tutorials/acme/nginx-ingress/)包含有关该过程的详细信息。

:::



编辑 `ClusterIssuer.yaml` ，需要修改 `admin@example.com` 为自己的邮箱

```yaml
cat > ClusterIssuer.yaml << EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-cluster-issuer
  namespace: plc
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-cluster-issuer-key
    solvers:
    - http01:
       ingress:
          class: nginx
EOF
```



编辑 `Certificate.yaml` ，需要修改 `pixie.example.com` 和 `work.pixie.example.com` 为自己的域名

```yaml
cat > Certificate.yaml << EOF
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: cloud-proxy-tls-certs
  namespace: plc
spec:
  dnsNames:
  - pixie.example.com
  - work.pixie.example.com
  secretName: cloud-proxy-tls-certs
  issuerRef:
    name: letsencrypt-cluster-issuer
    kind: ClusterIssuer
EOF
```







### 5.1 部署证书管理器

:::tip说明

cert-manager[安装文档](https://cert-manager.io/docs/installation//)

:::



安装 cert-manager

```shell
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```



### 5.2 配置 Let's Encrypt 发行者

编辑 `production-issuer.yaml` ，需要把 `user@example.com` 改为自己的邮箱

```yaml
cat > production-issuer.yaml << EOF
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # The ACME server URL
    server: https://acme-v02.api.letsencrypt.org/directory
    # Email address used for ACME registration
    email: user@example.com
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-prod
    # Enable the HTTP-01 challenge provider
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```



创建 Issuer

```shell
kubectl apply -f production-issuer.yaml
```



查看

```shell
$ kubectl get Issuer
NAME               READY   AGE
letsencrypt-prod   True    2s
```



### 5.3 部署 TLS 入口资源

:::tip说明

修改 `example.example.com` 为自己的域名

:::

```yaml
cat > ingress-tls.yaml << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kuard
  annotations:
    kubernetes.io/ingress.class: "nginx"    
    cert-manager.io/issuer: "letsencrypt-staging"

spec:
  tls:
  - hosts:
    - example.example.com
    secretName: quickstart-example-tls
  rules:
  - host: example.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kuard
            port:
              number: 80
EOF
```



创建

```shell
kubectl apply -f ingress-tls.yaml
```



查看

```shell
$ kubectl get ingress
NAME    CLASS    HOSTS            ADDRESS         PORTS     AGE
kuard   <none>   pixie.pptfz.cn   8.217.114.146   80, 443   10s
```









### 2.10 安装 `kustomize`

[kustomize官方网站](https://kubectl.docs.kubernetes.io/zh/)

:::tip说明

Kustomize 提供了一种自定义 Kubernetes 资源配置的解决方案，该方案摆脱了模板和 DSL。

:::



```shell
wget https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv5.0.2/kustomize_v5.0.2_linux_amd64.tar.gz
tar xf kustomize_v5.0.2_linux_amd64.tar.gz
mv kustomize /usr/local/bin
```



### 2.11 部署 pixie cloud 依赖项

:::caution

由于这里使用的是阿里云ack，而阿里云ack对使用CSI插件创建云盘静态存储和动态存储有大小限制，可以查看[说明文档](https://help.aliyun.com/document_detail/127601.html?spm=a2c4g.134767.0.0.67c63ef4lJZ85f)

因此需要将以下文件中的 `storage` 修改为至少 `20Gi` 

```shell
k8s/cloud_deps/public/postgres/postgres_persistent_volume.yaml
k8s/cloud_deps/public/nats/storage_patch.yaml
k8s/cloud_deps/base/elastic/cluster/elastic_cluster.yaml
k8s/cloud_deps/public/elastic/elastic_storage_patch.yaml
k8s/cloud_deps/public/postgres/postgres_persistent_volume.yaml
k8s/cloud_deps/public/nats/storage_patch.yaml
k8s/vizier/persistent_metadata/base/metadata_claim.yaml
k8s/cloud_deps/dev/postgres/postgres_persistent_volume.yaml
k8s/cloud_deps/dev/nats/storage_patch.yaml
```



还需要注意的是这个文件中的镜像是 `gcr.io/pixie-oss/pixie-dev-public/elasticsearch:7.6.0-patched1@sha256:f734909115be9dba66736c4b7356fd52da58b1ffdb895ba74cb5c2fca2b133dd` ，由于某些特殊原因，因此需要进行一些科学操作

```shell
k8s/cloud_deps/base/elastic/cluster/elastic_cluster.yaml
```

:::





```shell
kustomize build k8s/cloud_deps/base/elastic/operator | kubectl apply -f -
kustomize build k8s/cloud_deps/public | kubectl apply -f -
```



### 2.12 部署pixie cloud

:::tip说明

修改 `k8s/cloud/public/base/plugin_db_updater_job.yaml` 文件中的镜像版本，否则有坑

```shell
修改
	image: gcr.io/pixie-oss/pixie-dev/cloud/plugin/load_db:latest

修改为
	image: gcr.io/pixie-oss/pixie-prod/cloud/plugin/load_db:0.0.1
```



修改如下文件中 `gcr.io` 镜像地址 `gcr.io/pixie-oss/pixie-dev-public/curl:multiarch-7.87.0@sha256:f7f265d5c64eb4463a43a99b6bf773f9e61a50aaa7cefaf564f43e42549a01dd`

```shell
cat > result.txt << EOF
k8s/vizier/etcd_metadata/base/metadata_deployment.yaml
k8s/vizier/bootstrap/cloud_connector_deployment.yaml
k8s/vizier/sanitizer/kelvin_deployment.yaml
k8s/vizier/pem/base/pem_daemonset.yaml
k8s/vizier/persistent_metadata/base/metadata_statefulset.yaml
k8s/vizier/base/patch_sentry.yaml
k8s/vizier/base/query_broker_deployment.yaml
k8s/vizier/base/kelvin_deployment.yaml
k8s/cloud/base/ory_auth/kratos/kratos_deployment.yaml
src/e2e_test/protocol_loadtest/k8s/client/client_deployment.yaml
src/e2e_test/protocol_loadtest/http/wrk/k8s/client_deployment.yaml
src/e2e_test/jetstream_loadtest/k8s/subscriber_deployment.yaml
demos/sock-shop/sock-shop-loadgen.yaml
EOF
```



直接替换

```
for i in `awk -F: '{print $1}' result.txt `;do sed -i.bak "s#gcr.io/pixie-oss/pixie-dev-public/curl:multiarch-7.87.0@sha256:f7f265d5c64eb4463a43a99b6bf773f9e61a50aaa7cefaf564f43e42549a01dd#uhub.service.ucloud.cn/996.icu/curl:multiarch-7.87.0#" $i;done
```



 `k8s/cloud/public/kustomization.yaml` 文件中的镜像地址都是 `gcr.io` 的，因此需要修改，需要将 `newName` 对应的地址修改

```yaml
- name: gcr.io/pixie-oss/pixie-dev/cloud/api_server_image
  newName: gcr.io/pixie-oss/pixie-prod/cloud/api_server_image
  newTag: "1683050579"
- name: gcr.io/pixie-oss/pixie-dev/cloud/artifact_tracker_server_image
  newName: gcr.io/pixie-oss/pixie-prod/cloud/artifact_tracker_server_image
  newTag: "1683050579"
......
```



:::



```shell
kustomize build k8s/cloud/public/ | kubectl apply -f -
```



### 2.13 设置DNS

#### 2.13.1 确保svc  `cloud-proxy-service` 和 `vzconn-service` 已经分配外部ip

```shell
$ kubectl get service cloud-proxy-service -n plc
NAME                  TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                       AGE
cloud-proxy-service   LoadBalancer   10.110.7.140   8.218.189.247   443:30965/TCP,4444:31467/TCP,5555:30103/TCP   5m5s

$ kubectl get service vzconn-service -n plc
NAME             TYPE           CLUSTER-IP       EXTERNAL-IP    PORT(S)           AGE
vzconn-service   LoadBalancer   10.110.234.174   8.217.144.55   51600:32023/TCP   5m10s
```



#### 2.13.2 设置DNS

:::tip说明

执行以下命令会在 `pixie` 目录生成二进制文件 `dev_dns_updater`

:::

```shell
go build src/utils/dev_dns_updater/dev_dns_updater.go
```



#### 2.13.3 在 `kube config` 进行硬编码

```shell
export MY_DOMAIN=pixie.pptfz.cn
./dev_dns_updater --domain-name="${MY_DOMAIN}"  --kubeconfig=$HOME/.kube/config --n=plc
```





## 3.部署 Pixie