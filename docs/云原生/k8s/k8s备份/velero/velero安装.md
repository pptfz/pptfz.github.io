# velero安装

[velero github](https://github.com/vmware-tanzu/velero)

[velero官网](https://velero.io/)



## 说明

Velero（以前称为 Heptio Ark）是一个提供备份和恢复 k8s 集群资源和持久卷的工具

- 备份集群并在丢失时进行恢复
- 将集群资源迁移到其他集群
- 将生产集群复制到开发和测试集群



velero版本支持的k8s版本请参考 [版本兼容说明](https://github.com/vmware-tanzu/velero?tab=readme-ov-file#velero-compatibility-matrix)



velero有如下组件

- 在集群中运行的服务端
- 在本地运行的命令行客户端



## 安装

### 命令行工具

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="brew" label="brew" default>

```shell
brew install velero
```

  </TabItem>
  <TabItem value="二进制包" label="二进制包">

<Tabs>

  <TabItem value="amd64" label="amd64" default>

下载包

```shell
export VELERO_VERSION=1.18.0
wget https://github.com/vmware-tanzu/velero/releases/download/v${VELERO_VERSION}/velero-v${VELERO_VERSION}-linux-amd64.tar.gz
```

 

解压缩

```shell
tar xf velero-v${VELERO_VERSION}-linux-amd64.tar.gz
```



移动二进制文件

```shell
mv velero-v${VELERO_VERSION}-linux-amd64/velero /usr/local/bin
```



 </TabItem>

  <TabItem value="arm64" label="arm64">

下载包

```shell
export VELERO_VERSION=1.18.0
wget https://github.com/vmware-tanzu/velero/releases/download/v${VELERO_VERSION}/velero-v${VELERO_VERSION}-linux-arm64.tar.gz
```



解压缩

```shell
tar xf velero-v${VELERO_VERSION}-linux-arm64.tar.gz
```



移动二进制文件

```shell
mv velero-v${VELERO_VERSION}-linux-arm64/velero /usr/local/bin
```

  </TabItem>

  </TabItem>
</Tabs>







### 服务端



#### helm安装

##### 添加仓库

```shell
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts/
```



##### 下载包

```shell
helm pull vmware-tanzu/velero
```



##### 解压缩

```sh
tar xf velero-12.0.0.tgz
```



##### 编辑 `values.yaml`



```yaml
configuration:
  backupStorageLocation:
  - name: rustfs
    provider: "aws"
    bucket: "velero"
    caCert:
    prefix:
    default: true
    validationFrequency:
    accessMode: ReadWrite
    credential:
      name: velero-credentials
      key: cloud
    config: 
      s3ForcePathStyle: "true"
      s3Url: http://rustfs-svc.rustfs.svc.cluster.local:9000
      region: us-east-1 
```



| 字段                      | 含义                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `name`                    | BackupStorageLocation 的名字，必须唯一，用来在 Velero 中引用 |
| `provider`                | 云存储类型，这里用 `aws` 兼容 S3 API                         |
| `bucket`                  | Bucket 名称，你在 RustFS 中创建的 bucket                     |
| `caCert`                  | TLS 证书（Base64 编码），用于 HTTPS 校验，如果用 HTTP 可以不填 |
| `prefix`                  | 存储在 bucket 下的目录路径（可选），比如 `velero-backups`    |
| `default`                 | 是否是默认存储位置，备份和恢复不指定位置时会用这个           |
| `validationFrequency`     | 检查存储是否可写的频率，可留空                               |
| `accessMode`              | 访问模式，`ReadWrite` 可读写，`ReadOnly` 只读                |
| `credential.name`         | Kubernetes Secret 名称，Velero 用它读取 AccessKey/SecretKey  |
| `credential.key`          | Secret 中存储 AccessKey/SecretKey 的字段名，默认是 `cloud`   |
| `config.s3ForcePathStyle` | S3 API 兼容参数，RustFS 需要 `true`                          |
| `config.s3Url`            | RustFS 的服务地址，包括端口                                  |
| `config.region`           | S3 区域，RustFS 可以随意填一个，比如 `us-east-1`             |





###### 创建secret

```yaml
credentials:
  useSecret: true
  name: velero-credentials
  secretContents:
    cloud: |
      [default]
      aws_access_key_id=velero
      aws_secret_access_key=DcPSl6AVo0VOjDYmd85rXiv5HHSacID1lWoWgLbC
```



不打算使用快照，也可以直接禁用 Snapshots

```yaml
snapshotsEnabled: false
```



###### 配置对象存储



```yaml
configuration:
  backupStorageLocation:
  - name:
    config: 
      s3ForcePathStyle: "true"
      s3Url: http://rustfs-svc.rustfs.svc.cluster.local:9000
      region: us-east-1
```

![iShot_2026-03-24_11.18.00](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-24_11.18.00.png)









##### 安装

```shell
helm upgrade --install velero -n velero --create-namespace .
```





