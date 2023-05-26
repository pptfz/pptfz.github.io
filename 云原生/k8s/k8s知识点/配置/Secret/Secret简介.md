# Secret简介

[Secret官方文档](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/)



## Secret简介

Secret 是一种包含少量敏感信息例如密码、令牌或密钥的对象。 这样的信息可能会被放在 [Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 规约中或者镜像中。 使用 Secret 意味着你不需要在应用程序代码中包含机密数据。

由于创建 Secret 可以独立于使用它们的 Pod， 因此在创建、查看和编辑 Pod 的工作流程中暴露 Secret（及其数据）的风险较小。 Kubernetes 和在集群中运行的应用程序也可以对 Secret 采取额外的预防措施， 例如避免将机密数据写入非易失性存储。

Secret 类似于 [ConfigMap](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/) 但专门用于保存机密数据。



:::catution注意

默认情况下，Kubernetes Secret 未加密地存储在 API 服务器的底层数据存储（etcd）中。 任何拥有 API 访问权限的人都可以检索或修改 Secret，任何有权访问 etcd 的人也可以。 此外，任何有权限在命名空间中创建 Pod 的人都可以使用该访问权限读取该命名空间中的任何 Secret； 这包括间接访问，例如创建 Deployment 的能力。

为了安全地使用 Secret，请至少执行以下步骤：

1. 为 Secret [启用静态加密](https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/encrypt-data/)。
2. 以最小特权访问 Secret 并[启用或配置 RBAC 规则](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authorization/)。
3. 限制 Secret 对特定容器的访问。
4. [考虑使用外部 Secret 存储驱动](https://secrets-store-csi-driver.sigs.k8s.io/concepts.html#provider-for-the-secrets-store-csi-driver)。

有关管理和提升 Secret 安全性的指南，请参阅 [Kubernetes Secret 良好实践](https://kubernetes.io/zh-cn/docs/concepts/security/secrets-good-practices)。

:::





## Secret使用

Pod 可以用三种方式之一来使用 Secret：

- 作为挂载到一个或多个容器上的[卷](https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/) 中的[文件](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/#using-secrets-as-files-from-a-pod)。
- 作为[容器的环境变量](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/#using-secrets-as-environment-variables)。
- 由 [kubelet 在为 Pod 拉取镜像时使用](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/#using-imagepullsecrets)。

Kubernetes 控制面也使用 Secret； 例如，[引导令牌 Secret](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/#bootstrap-token-secrets) 是一种帮助自动化节点注册的机制。





## 使用Secret

### 创建Secret

#### 方式

##### 方式一 [使用 `kubectl`](https://kubernetes.io/zh-cn/docs/tasks/configmap-secret/managing-secret-using-kubectl/)

###### 创建Secret

:::tip说明

`Secret` 对象用来存储敏感数据，如 Pod 用于访问服务的凭据。例如，为访问数据库，你可能需要一个 Secret 来存储所需的用户名及密码。

你可以通过在命令中传递原始数据，或将凭据存储文件中，然后再在命令行中创建 Secret。以下命令 将创建一个存储用户名 `admin` 和密码 `S!B\*d$zDsb=` 的 Secret。

:::



**方法1	使用原始数据**

:::tip说明

你必须使用单引号 `''` 转义字符串中的特殊字符，如 `$`、`\`、`*`、`=`和`!` 。否则，你的 shell 将会解析这些字符。

:::

```shell
kubectl create secret generic db-user-pass \
    --from-literal=username=admin \
    --from-literal=password='S!B\*d$zDsb='
```



**方法2	使用源文件**

1.将凭据保存到文件

:::tip说明

`-n` 标志用来确保生成文件的文末没有多余的换行符。这很重要，因为当 `kubectl` 读取文件并将内容编码为 base64 字符串时，额外的换行符也会被编码。 你不需要对文件中包含的字符串中的特殊字符进行转义。

:::

```shell
echo -n 'admin' > ./username
echo -n 'S!B\*d$zDsb=' > ./password
```



2.使用 `kubectl` 命令指定文件路径

```shell
kubectl create secret generic db-user-pass \
    --from-file=./username \
    --from-file=./password
```



默认键名为文件名。你也可以通过 `--from-file=[key=]source` 设置键名，例如：

```shell
kubectl create secret generic db-user-pass \
    --from-file=username=./username \
    --from-file=password=./password
```



###### 验证Secret

查看Secret

```shell
$ kubectl get secrets
NAME           TYPE     DATA   AGE
db-user-pass   Opaque   2      2m10s
```



查看Secret细节

```shell
$ kubectl describe secret db-user-pass
Name:         db-user-pass
Namespace:    test
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
password.txt:  12 bytes
username.txt:  5 bytes
```



###### 解码Secret

1.查看创建的Secret内容

```shell
$ kubectl get secret db-user-pass -o jsonpath='{.data}'
{"password.txt":"UyFCXCpkJHpEc2I9","username.txt":"YWRtaW4="}
```



2.解码 `password` 数据

:::caution注意

这是一个出于文档编制目的的示例。实际上，该方法可能会导致包含编码数据的命令存储在 Shell 的历史记录中。任何可以访问你的计算机的人都可以找到该命令并对 Secret 进行解码。 更好的办法是将查看和解码命令一同使用。

```shell
kubectl get secret db-user-pass -o jsonpath='{.data.password}' | base64 --decode
```

:::

```shell
$ echo 'UyFCXCpkJHpEc2I9' | base64 --decode
S!B\*d$zDsb=
```



###### 编辑Secret

你可以编辑一个现存的 `Secret` 对象，除非它是[不可改变的](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/#secret-immutable)。 要想编辑一个 Secret，请执行以下命令：

```shell
kubectl edit secrets <secret-name>
```

这将打开默认编辑器，并允许你更新 `data` 字段中的 base64 编码的 Secret 值，示例如下：

```yaml
#请编辑下面的对象。以“#”开头的行将被忽略，
#空文件将中止编辑。如果在保存此文件时发生错误，
#则将重新打开该文件并显示相关的失败。
apiVersion: v1
data:
  password: UyFCXCpkJHpEc2I9
  username: YWRtaW4=
kind: Secret
metadata:
  creationTimestamp: "2022-06-28T17:44:13Z"
  name: db-user-pass
  namespace: default
  resourceVersion: "12708504"
  uid: 91becd59-78fa-4c85-823f-6d44436242ac
type: Opaque
```







##### 方式二 [使用配置文件](https://kubernetes.io/zh-cn/docs/tasks/configmap-secret/managing-secret-using-config-file/)

###### 创建Secret

:::tip说明

你可以先用 JSON 或 YAML 格式在一个清单文件中定义 `Secret` 对象，然后创建该对象。 [Secret](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#secret-v1-core) 资源包含 2 个键值对：`data` 和 `stringData`。 `data` 字段用来存储 base64 编码的任意数据。 提供 `stringData` 字段是为了方便，它允许 Secret 使用未编码的字符串。 `data` 和 `stringData` 的键必须由字母、数字、`-`、`_` 或 `.` 组成。

:::



以下示例使用 `data` 字段在 Secret 中存储两个字符串：

1.将这些字符串转换为 base64

:::tip说明

Secret 数据的 JSON 和 YAML 序列化结果是以 base64 编码的。 换行符在这些字符串中无效，必须省略。 在 Darwin/macOS 上使用 `base64` 工具时，用户不应该使用 `-b` 选项分割长行。 相反地，Linux 用户**应该**在 `base64` 地命令中添加 `-w 0` 选项， 或者在 `-w` 选项不可用的情况下，输入 `base64 | tr -d '\n'`。

:::

```shell
$ echo -n 'admin' | base64
YWRtaW4=

$ echo -n '1f2d1e2e67df' | base64
MWYyZDFlMmU2N2Rm
```



2.创建yaml文件

```yaml
cat > secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm
EOF
```



3.创建secret

```shell
kubectl apply -f secret.yaml 
```

若要验证 Secret 被创建以及想要解码 Secret 数据， 请参阅[使用 kubectl 管理 Secret](https://kubernetes.io/zh-cn/docs/tasks/configmap-secret/managing-secret-using-kubectl/#verify-the-secret)



---



**创建secret时提供未编码的数据**

对于某些场景，你可能希望使用 `stringData` 字段。 这个字段可以将一个非 base64 编码的字符串直接放入 Secret 中， 当创建或更新该 Secret 时，此字段将被编码。

上述用例的实际场景可能是这样：当你部署应用时，使用 Secret 存储配置文件， 你希望在部署过程中，填入部分内容到该配置文件。

例如，如果你的应用程序使用以下配置文件:

```yaml
apiUrl: "https://my.api.com/api/v1"
username: "<user>"
password: "<password>"
```

你可以使用以下定义将其存储在 Secret 中:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
stringData:
  config.yaml: |
    apiUrl: "https://my.api.com/api/v1"
    username: <user>
    password: <password>    
```

当你检索 Secret 数据时，此命令将返回编码的值，并不是你在 `stringData` 中提供的纯文本值。



查看创建的secret

```yaml
$ kubectl get secret mysecret -o yaml
apiVersion: v1
data:
  config.yaml: YXBpVXJsOiAiaHR0cHM6Ly9teS5hcGkuY29tL2FwaS92MSIKdXNlcm5hbWU6IHVzZXIKcGFzc3dvcmQ6IHBhc3N3b3JkICAgIAo=
kind: Secret
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Secret","metadata":{"annotations":{},"name":"mysecret","namespace":"test"},"stringData":{"config.yaml":"apiUrl: \"https://my.api.com/api/v1\"\nusername: user\npassword: password    \n"},"type":"Opaque"}
  creationTimestamp: "2023-05-23T03:35:25Z"
  name: mysecret
  namespace: test
  resourceVersion: "2795292"
  uid: 39e81b35-8580-4f15-ada3-745753b25e0f
type: Opaque
```



解密一下

```shell
$ echo YXBpVXJsOiAiaHR0cHM6Ly9teS5hcGkuY29tL2FwaS92MSIKdXNlcm5hbWU6IHVzZXIKcGFzc3dvcmQ6IHBhc3N3b3JkICAgIAo= |base64 -d
apiUrl: "https://my.api.com/api/v1"
username: user
password: password    
```



**同时指定 `data` 和 `stringData`**

如果你在 `data` 和 `stringData` 中设置了同一个字段，则使用来自 `stringData` 中的值。

例如，如果你定义以下 Secret：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4= # base64解密后是 admin
stringData:
  username: administrator
```



所创建的 `Secret` 对象如下：

```yaml
apiVersion: v1
data:
  username: YWRtaW5pc3RyYXRvcg==
kind: Secret
metadata:
  creationTimestamp: 2018-11-15T20:46:46Z
  name: mysecret
  namespace: default
  resourceVersion: "7579"
  uid: 91460ecb-e917-11e8-98f2-025000000001
type: Opaque
```

`YWRtaW5pc3RyYXRvcg==` 解码成 `administrator`





##### 方式三 [使用 Kustomize 工具](https://kubernetes.io/zh-cn/docs/tasks/configmap-secret/managing-secret-using-kustomize/)

你可以在 `kustomization.yaml` 文件中定义 `secreteGenerator` 字段， 并在定义中引用其它本地文件、`.env` 文件或文字值生成 Secret。 例如：下面的指令为用户名 `admin` 和密码 `1f2d1e2e67df` 创建 Kustomization 文件。

```shell
secretGenerator:
- name: database-creds
  literals:
  - username=admin
  - password=1f2d1e2e67df
```









#### Secret名称约束

Secret 对象的名称必须是合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)。

在为创建 Secret 编写配置文件时，你可以设置 `data` 与/或 `stringData` 字段。 `data` 和 `stringData` 字段都是可选的。`data` 字段中所有键值都必须是 base64 编码的字符串。如果不希望执行这种 base64 字符串的转换操作，你可以选择设置 `stringData` 字段，其中可以使用任何字符串作为其取值。

`data` 和 `stringData` 中的键名只能包含字母、数字、`-`、`_` 或 `.` 字符。 `stringData` 字段中的所有键值对都会在内部被合并到 `data` 字段中。 如果某个主键同时出现在 `data` 和 `stringData` 字段中，`stringData` 所指定的键值具有高优先级。

#### Secret大小限制

每个 Secret 的尺寸最多为 1MiB。施加这一限制是为了避免用户创建非常大的 Secret， 进而导致 API 服务器和 kubelet 内存耗尽。不过创建很多小的 Secret 也可能耗尽内存。 你可以使用[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)来约束每个名字空间中 Secret（或其他资源）的个数。





## Secret的类型

创建 Secret 时，你可以使用 [Secret](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/config-and-storage-resources/secret-v1/) 资源的 `type` 字段，或者与其等价的 `kubectl` 命令行参数（如果有的话）为其设置类型。 Secret 类型有助于对 Secret 数据进行编程处理。

Kubernetes 提供若干种内置的类型，用于一些常见的使用场景。 针对这些类型，Kubernetes 所执行的合法性检查操作以及对其所实施的限制各不相同。

| 内置类型                              | 用法                                     |
| ------------------------------------- | ---------------------------------------- |
| `Opaque`                              | 用户定义的任意数据                       |
| `kubernetes.io/service-account-token` | 服务账号令牌                             |
| `kubernetes.io/dockercfg`             | `~/.dockercfg` 文件的序列化形式          |
| `kubernetes.io/dockerconfigjson`      | `~/.docker/config.json` 文件的序列化形式 |
| `kubernetes.io/basic-auth`            | 用于基本身份认证的凭据                   |
| `kubernetes.io/ssh-auth`              | 用于 SSH 身份认证的凭据                  |
| `kubernetes.io/tls`                   | 用于 TLS 客户端或者服务器端的数据        |
| `bootstrap.kubernetes.io/token`       | 启动引导令牌数据                         |

通过为 Secret 对象的 `type` 字段设置一个非空的字符串值，你也可以定义并使用自己 Secret 类型（如果 `type` 值为空字符串，则被视为 `Opaque` 类型）。

Kubernetes 并不对类型的名称作任何限制。不过，如果你要使用内置类型之一， 则你必须满足为该类型所定义的所有要求。

如果你要定义一种公开使用的 Secret 类型，请遵守 Secret 类型的约定和结构， 在类型名签名添加域名，并用 `/` 隔开。 例如：`cloud-hosting.example.net/cloud-api-credentials`。



## 不可更改的Secret

**特性状态：** `Kubernetes v1.21 [stable]`

Kubernetes 允许你将特定的 Secret（和 ConfigMap）标记为 **不可更改（Immutable）**。 禁止更改现有 Secret 的数据有下列好处：

- 防止意外（或非预期的）更新导致应用程序中断
- （对于大量使用 Secret 的集群而言，至少数万个不同的 Secret 供 Pod 挂载）， 通过将 Secret 标记为不可变，可以极大降低 kube-apiserver 的负载，提升集群性能。 kubelet 不需要监视那些被标记为不可更改的 Secret。

### 将 Secret 标记为不可更改

你可以通过将 Secret 的 `immutable` 字段设置为 `true` 创建不可更改的 Secret。 例如：

```yaml
apiVersion: v1
kind: Secret
metadata:
  ...
data:
  ...
immutable: true
```

你也可以更改现有的 Secret，令其不可更改。

**说明：**

一旦一个 Secret 或 ConfigMap 被标记为不可更改，撤销此操作或者更改 `data` 字段的内容都是 **不** 可能的。 只能删除并重新创建这个 Secret。现有的 Pod 将维持对已删除 Secret 的挂载点 -- 建议重新创建这些 Pod。

























