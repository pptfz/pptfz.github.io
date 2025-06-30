# 配置 Pod 使用 ConfigMap

[配置pod使用configmap官方文档](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/)



## 创建 ConfigMap

### 使用 kubectl create configmap 创建 ConfigMap

你可以使用 `kubectl create configmap` 命令基于[目录](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/#create-configmaps-from-directories)、 [文件](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/#create-configmaps-from-files)或者[字面值](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/#create-configmaps-from-literal-values)来创建 ConfigMap：

```shell
kubectl create configmap <映射名称> <数据源>
```

其中，`<映射名称>` 是为 ConfigMap 指定的名称，`<数据源>` 是要从中提取数据的目录、 文件或者字面值。ConfigMap 对象的名称必须是合法的 [DNS 子域名](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/names#dns-subdomain-names).

在你基于文件来创建 ConfigMap 时，`<数据源>` 中的键名默认取自文件的基本名， 而对应的值则默认为文件的内容。

你可以使用 [`kubectl describe`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#describe) 或者 [`kubectl get`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands/#get) 获取有关 ConfigMap 的信息。



#### 基于目录创建 ConfigMap

你可以使用 `kubectl create configmap` 基于同一目录中的多个文件创建 ConfigMap。 当你基于目录来创建 ConfigMap 时，kubectl 识别目录下基本名可以作为合法键名的文件， 并将这些文件打包到新的 ConfigMap 中。普通文件之外的所有目录项都会被忽略 （例如：子目录、符号链接、设备、管道等等）。

例如：

```shell
# 创建本地目录
mkdir -p configure-pod-container/configmap/

# 将示例文件下载到 `configure-pod-container/configmap/` 目录
wget https://kubernetes.io/examples/configmap/game.properties -O configure-pod-container/configmap/game.properties
wget https://kubernetes.io/examples/configmap/ui.properties -O configure-pod-container/configmap/ui.properties

# 文件内容如下
$ cat game.properties 
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
secret.code.passphrase=UUDDLRLRBABAS
secret.code.allowed=true
secret.code.lives=30

$ cat ui.properties 
color.good=purple
color.bad=yellow
allow.textmode=true
how.nice.to.look=fairlyNice


# 创建 configmap
kubectl create configmap game-config --from-file=configure-pod-container/configmap/
```

以上命令将 `configure-pod-container/configmap` 目录下的所有文件，也就是 `game.properties` 和 `ui.properties` 打包到 game-config ConfigMap 中。你可以使用下面的命令显示 ConfigMap 的详细信息：

```shell
kubectl describe configmaps game-config
```



输出类似以下内容：

```shell
Name:         game-config
Namespace:    test
Labels:       <none>
Annotations:  <none>

Data
====
game.properties:
----
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
secret.code.passphrase=UUDDLRLRBABAS
secret.code.allowed=true
secret.code.lives=30
ui.properties:
----
color.good=purple
color.bad=yellow
allow.textmode=true
how.nice.to.look=fairlyNice


BinaryData
====

Events:  <none>
```



`configure-pod-container/configmap/` 目录中的 `game.properties` 和 `ui.properties` 文件出现在 ConfigMap 的 `data` 部分。



```shell
kubectl get configmaps game-config -o yaml
```



输出类似以下内容:

```yaml
apiVersion: v1
data:
  game.properties: |-
    enemies=aliens
    lives=3
    enemies.cheat=true
    enemies.cheat.level=noGoodRotten
    secret.code.passphrase=UUDDLRLRBABAS
    secret.code.allowed=true
    secret.code.lives=30
  ui.properties: |
    color.good=purple
    color.bad=yellow
    allow.textmode=true
    how.nice.to.look=fairlyNice
kind: ConfigMap
metadata:
  creationTimestamp: "2023-01-16T14:16:56Z"
  name: game-config
  namespace: test
  resourceVersion: "15911248"
  uid: 17378c8b-7342-4e4f-a3a4-34bdf480b42d
```



#### 基于文件创建 ConfigMap

你可以使用 `kubectl create configmap` 基于单个文件或多个文件创建 ConfigMap。

```shell
kubectl create configmap game-config-2 --from-file=configure-pod-container/configmap/game.properties
```



将产生以下 ConfigMap:

```shell
kubectl describe configmaps game-config-2
```



输出类似以下内容:

```shell
Name:         game-config-2
Namespace:    test
Labels:       <none>
Annotations:  <none>

Data
====
game.properties:
----
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
secret.code.passphrase=UUDDLRLRBABAS
secret.code.allowed=true
secret.code.lives=30

BinaryData
====

Events:  <none>
```



你可以多次使用 `--from-file` 参数，从多个数据源创建 ConfigMap。

```shell
kubectl create configmap game-config-2 --from-file=configure-pod-container/configmap/game.properties --from-file=configure-pod-container/configmap/ui.properties
```



你可以使用以下命令显示 `game-config-2` ConfigMap 的详细信息：

```shell
kubectl describe configmaps game-config-2
```

输出类似以下内容:

```sh
Name:         game-config-2
Namespace:    test
Labels:       <none>
Annotations:  <none>

Data
====
game.properties:
----
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
secret.code.passphrase=UUDDLRLRBABAS
secret.code.allowed=true
secret.code.lives=30
ui.properties:
----
color.good=purple
color.bad=yellow
allow.textmode=true
how.nice.to.look=fairlyNice


BinaryData
====

Events:  <none>
```



当 `kubectl` 基于非 ASCII 或 UTF-8 的输入创建 ConfigMap 时， 该工具将这些输入放入 ConfigMap 的 `binaryData` 字段，而不是 `data` 中。 同一个 ConfigMap 中可同时包含文本数据和二进制数据源。 如果你想查看 ConfigMap 中的 `binaryData` 键（及其值）， 你可以运行 `kubectl get configmap -o jsonpath='{.binaryData}' <name>`。

使用 `--from-env-file` 选项从环境文件创建 ConfigMap，例如：

Env 文件包含环境变量列表。其中适用以下语法规则:

- Env 文件中的每一行必须为 VAR=VAL 格式。
- 以＃开头的行（即注释）将被忽略。
- 空行将被忽略。
- 引号不会被特殊处理（即它们将成为 ConfigMap 值的一部分）。





将示例文件下载到 `configure-pod-container/configmap/` 目录：

```shell
wget https://kubernetes.io/examples/configmap/game-env-file.properties -O configure-pod-container/configmap/game-env-file.properties
wget https://kubernetes.io/examples/configmap/ui-env-file.properties -O configure-pod-container/configmap/ui-env-file.properties
```



文件内容如下

```properties
$ cat configure-pod-container/configmap/game-env-file.properties
enemies=aliens
lives=3
allowed="true"

# This comment and the empty line above it are ignored


$ cat configure-pod-container/configmap/ui-env-file.properties
color=purple
textmode=true
how=fairlyNice
```



创建configmap

```shell
kubectl create configmap game-config-env-file --from-env-file=configure-pod-container/configmap/game-env-file.properties
```



查看configmap

```shell
kubectl get configmap game-config-env-file -o yaml
```



输出类似以下内容：

```yaml
apiVersion: v1
data:
  allowed: '"true"'
  enemies: aliens
  lives: "3"
kind: ConfigMap
metadata:
  creationTimestamp: "2023-01-16T14:41:43Z"
  name: game-config-env-file
  namespace: test
  resourceVersion: "15915599"
  uid: 235a3696-8d3a-4e5e-b6f5-8ec90228b06a
```



从 Kubernetes 1.23 版本开始，`kubectl` 支持多次指定 `--from-env-file` 参数来从多个数据源创建 ConfigMap。

```shell
kubectl create configmap config-multi-env-files \
        --from-env-file=configure-pod-container/configmap/game-env-file.properties \
        --from-env-file=configure-pod-container/configmap/ui-env-file.properties
```



将产生以下 ConfigMap:

```shell
kubectl get configmap config-multi-env-files -o yaml
```

输出类似以下内容:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  creationTimestamp: 2017-12-27T18:38:34Z
  name: config-multi-env-files
  namespace: default
  resourceVersion: "810136"
  uid: 252c4572-eb35-11e7-887b-42010a8002b8
data:
  allowed: '"true"'
  color: purple
  enemies: aliens
  how: fairlyNice
  lives: "3"
  textmode: "true"
```

