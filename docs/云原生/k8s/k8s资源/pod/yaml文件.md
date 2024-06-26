[toc]



# k8s YAML文件

[本文严重抄袭至互联网](https://www.qikqiak.com/k8s-book/)

[k8s 1.18 api官方文档](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/)

## YAML 基础

它的基本语法规则如下：

- 大小写敏感
- 使用缩进表示层级关系
- 缩进时不允许使用Tab键，只允许使用空格。
- 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
- `#` 表示注释，从这个字符一直到行尾，都会被解析器忽略。

在我们的 kubernetes 中，你只需要两种结构类型就行了：

- Lists
- Maps

也就是说，你可能会遇到 Lists 的 Maps 和 Maps 的 Lists，等等。不过不用担心，你只要掌握了这两种结构也就可以了，其他更加复杂的我们暂不讨论。

### Maps

首先我们来看看 Maps，我们都知道 Map 是字典，就是一个`key:value`的键值对，Maps 可以让我们更加方便的去书写配置信息，例如：

```yaml
---
apiVersion: v1
kind: Pod
```

第一行的`---`是分隔符，是可选的，在单一文件中，可用连续三个连字号`---`区分多个文件。这里我们可以看到，我们有两个键： `apiVersion`和`kind` ，他们对应的值分别是：v1 和Pod。上面的 YAML 文件转换成 JSON 格式的话，你肯定就容易明白了：

```json
{
    "apiVersion": "v1",
    "kind": "pod"
}
```

我们在创建一个相对复杂一点的 YAML 文件，创建一个 KEY 对应的值不是字符串而是一个 Maps：

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: kube100-site
  labels:
    app: web
```

上面的 YAML 文件，metadata 这个 KEY 对应的值就是一个 Maps 了，而且嵌套的 labels 这个 KEY 的值又是一个 Map，你可以根据你自己的情况进行多层嵌套。

上面我们也提到了 YAML 文件的语法规则，YAML 处理器是根据行缩进来知道内容之间的关联性的。比如我们上面的 YAML 文件，**我用了两个空格作为缩进，空格的数量并不重要，但是你得保持一致，并且至少要求一个空格**（什么意思？就是你别一会缩进两个空格，一会缩进4个空格）。

我们可以看到 name 和 labels 是相同级别的缩进，所以 YAML 处理器就知道了他们属于同一个 MAP，而 app 是 labels 的值是因为 app 的缩进更大。

:::caution

**在 YAML 文件中绝对不要使用 `tab` 键**

:::

同样的，我们可以将上面的 YAML 文件转换成 JSON 文件：

```json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "kube100-site",
    "labels": {
      "app": "web"
    }
  }
}
```

或许你对上面的 JSON 文件更熟悉，但是你不得不承认 YAML 文件的语义化程度更高吧？

### Lists

Lists 就是列表，说白了就是数组，在 YAML 文件中我们可以这样定义：

```yaml
args
  - Cat
  - Dog
  - Fish
```

你可以有任何数量的项在列表中，每个项的定义以破折号（-）开头的，与父元素直接可以缩进一个空格。对应的 JSON 格式如下：

```json
{
    "args": ["Cat", "Dog", "Fish"]
}
```

当然，list 的子项也可以是 Maps，Maps 的子项也可以是list如下所示：

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: kube100-site
  labels:
    app: web
spec:
  containers:
    - name: front-end
      image: nginx
      ports:
        - containerPort: 80
    - name: flaskapp-demo
      image: jcdemo/flaskapp
      ports:
        - containerPort: 5000
```

比如这个 YAML 文件，我们定义了一个叫 containers 的 List 对象，每个子项都由 name、image、ports 组成，每个 ports 都有一个 key 为 containerPort 的 Map 组成，同样的，我们可以转成如下 JSON 格式文件：

```json
{
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
        "name": "kube100-site",
        "labels": {
            "app": "web"
        }
    },
    "spec": {
        "containers": [{
            "name": "front-end",
            "image": "nginx",
            "ports": [{
                "containerPort": 80
            }]
        }, {
            "name": "flaskapp-demo",
            "image": "jcdemo/flaskapp",
            "ports": [{
                "containerPort": 5000
            }]
        }]
    }
}
```

是不是觉得用 JSON 格式的话文件明显比 YAML 文件更复杂了呢？

### 使用 YAML 创建 Pod

现在我们已经对 YAML 文件有了大概的了解了，我相信你应该没有之前那么懵逼了吧？我们还是来使用 YAML 文件来创建一个 Deployment 吧。

#### 创建 Pod

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: kube100-site
  labels:
    app: web
spec:
  containers:
    - name: front-end
      image: nginx
      ports:
        - containerPort: 80
    - name: flaskapp-demo
      image: jcdemo/flaskapp
      ports:
        - containerPort: 5000
```

这是我们上面定义的一个普通的 POD 文件，我们先来简单分析下文件内容：

- apiVersion，这里它的值是 v1，这个版本号需要根据我们安装的 kubernetes 版本和资源类型进行变化的，记住不是写死的
- kind，这里我们创建的是一个 Pod，当然根据你的实际情况，这里资源类型可以是 Deployment、Job、Ingress、Service 等待。
- metadata：包含了我们定义的 Pod 的一些 meta 信息，比如名称、namespace、标签等等信息。
- spec：包括一些 containers，storage，volumes，或者其他 Kubernetes 需要知道的参数，以及诸如是否在容器失败时重新启动容器的属性。你可以在特定 Kubernetes API 找到完整的 Kubernetes Pod 的属性。

让我们来看一个典型的容器的定义：

```yaml
…spec:
  containers:
    - name: front-end
      image: nginx
      ports:
        - containerPort: 80
…
```

在这个例子中，这是一个简单的最小定义：一个名字（front-end），基于 nginx 的镜像，以及容器 将会监听的一个端口（80）。在这些当中，只有名字是非常需要的，你也可以指定一个更加复杂的属性，例如在容器启动时运行的命令，应使用的参数，工作目录，或每次实例化时是否拉取映像的新副本。以下是一些容器可选的设置属性：

- name
- image
- command
- args
- workingDir
- ports
- env
- resources
- volumeMounts
- livenessProbe
- readinessProbe
- livecycle
- terminationMessagePath
- imagePullPolicy
- securityContext
- stdin
- stdinOnce
- tty

明白了 POD 的定义后，我们将上面创建 POD 的 YAML 文件保存成 pod.yaml，然后使用`kubectl`创建 POD：

```shell
$ kubectl create -f pod.yaml
pod "kube100-site" created
```

然后我们就可以使用我们前面比较熟悉的 kubectl 命令来查看 POD 的状态了：

```shell
$ kubectl get pods
NAME           READY     STATUS    RESTARTS   AGE
kube100-site   2/2       Running   0          1m
```

到这里我们的 POD 就创建成功了，如果你在创建过程中有任何问题，我们同样可以使用前面的kubectl describe 进行排查。我们先删除上面创建的 POD：

```python
$ kubectl delete -f pod.yaml
pod "kube100-site" deleted
```

#### 创建 Deployment

现在我们可以来创建一个真正的 Deployment。在上面的例子中，我们只是单纯的创建了一个 POD 实例，但是如果这个 POD 出现了故障的话，我们的服务也就挂掉了，所以 kubernetes 提供了一个`Deployment`的概念，可以让 kubernetes 去管理一组 POD 的副本，也就是副本集，这样就可以保证一定数量的副本一直可用的，不会因为一个 POD 挂掉导致整个服务挂掉。我们可以这样定义一个 Deployment：

```yaml
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: kube100-site
spec:
  replicas: 2
```

注意这里的`apiVersion`对应的值是`extensions/v1beta1`，当然 kind 要指定为 Deployment，因为这就是我们需要的，然后我们可以指定一些 meta 信息，比如名字，或者标签之类的。最后，最重要的是`spec`配置选项，这里我们定义需要两个副本，当然还有很多可以设置的属性，比如一个 Pod 在没有任何错误变成准备的情况下必须达到的最小秒数。 我们可以在[Kubernetes v1beta1 API(官方已修改，早就404了，天天瞎鸡吧改，都尼玛找不到了)](https://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1beta1_deployment)参考中找到一个完整的 Depolyment 可指定的参数列表。 现在我们来定义一个完整的 Deployment 的 YAML 文件：

```yaml
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: kube100-site
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: front-end
          image: nginx
          ports:
            - containerPort: 80
        - name: flaskapp-demo
          image: jcdemo/flaskapp
          ports:
            - containerPort: 5000
```

看起来是不是和我们上面的 pod.yaml 很类似啊，注意其中的 template，其实就是对 POD 对象的定义。将上面的 YAML 文件保存为 deployment.yaml，然后创建 Deployment：

```shell
$ kubectl create -f deployment.yaml
deployment "kube100-site" created
```

同样的，想要查看它的状态，我们可以检查 Deployment的列表：

```shell
$ kubectl get deployments
NAME           DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
kube100-site   2         2         2            2           2m
```

我们可以看到所有的 Pods 都已经正常运行了。

到这里我们就完成了使用 YAML 文件创建 Kubernetes Deployment 的过程，在了解了 YAML 文件的基础后，定义 YAML 文件其实已经很简单了，最主要的是要根据实际情况去定义 YAML 文件，所以查阅 Kubernetes 文档很重要。

> 可以使用[yaml文件检测网站]( http://www.yamllint.com/)去检验 YAML 文件的合法性。
