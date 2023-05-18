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





##### 方式三 [使用 Kustomize 工具](https://kubernetes.io/zh-cn/docs/tasks/configmap-secret/managing-secret-using-kustomize/)



#### Secret名称约束

Secret 对象的名称必须是合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names)。

在为创建 Secret 编写配置文件时，你可以设置 `data` 与/或 `stringData` 字段。 `data` 和 `stringData` 字段都是可选的。`data` 字段中所有键值都必须是 base64 编码的字符串。如果不希望执行这种 base64 字符串的转换操作，你可以选择设置 `stringData` 字段，其中可以使用任何字符串作为其取值。

`data` 和 `stringData` 中的键名只能包含字母、数字、`-`、`_` 或 `.` 字符。 `stringData` 字段中的所有键值对都会在内部被合并到 `data` 字段中。 如果某个主键同时出现在 `data` 和 `stringData` 字段中，`stringData` 所指定的键值具有高优先级。

#### Secret大小限制

每个 Secret 的尺寸最多为 1MiB。施加这一限制是为了避免用户创建非常大的 Secret， 进而导致 API 服务器和 kubelet 内存耗尽。不过创建很多小的 Secret 也可能耗尽内存。 你可以使用[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)来约束每个名字空间中 Secret（或其他资源）的个数。









