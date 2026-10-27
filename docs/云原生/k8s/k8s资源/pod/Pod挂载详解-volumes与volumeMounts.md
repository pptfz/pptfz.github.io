# Pod 挂载详解：volumes 与 volumeMounts 的对应关系

Pod 的挂载配置由两部分组成：`spec.volumes`（声明有哪些卷、卷从哪来）和容器的 `volumeMounts`（声明把哪个卷挂到容器内的哪个路径）。初学时最容易迷糊的是这两段之间的对应关系——本文以最常见的 hostPath 挂载时区文件为例，把对应关系掰开讲清楚。

## 完整示例：挂载宿主机时区文件到容器

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tz-test
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:                # 容器视角：往容器里"装"卷
        - name: host-time          # ① 要挂哪个卷（引用 volumes.name）
          mountPath: /etc/localtime    # ③ 挂到容器内的哪个路径
          readOnly: true
  volumes:                     # Pod 视角：声明卷从哪里来
    - name: host-time          # ② 卷的名字（被 volumeMounts 引用）
      hostPath:
        path: /etc/localtime   # ④ 宿主机上的源文件
        type: File
```

这是一个把宿主机 `/etc/localtime` 挂进容器、让容器时区与宿主机保持一致的典型用法。

## 对应关系图

图中把 YAML 的关键行和挂载链路画在了一起，四条对应关系一一标注：

![Pod 挂载对应关系图](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/pod-volumes-mounts.png)

## 四个对应关系逐一拆解

### ① `volumes.name` ↔ `volumeMounts.name`：同名匹配，是两段配置之间的桥梁

`volumeMounts.name: host-time` 和 `volumes.name: host-time` 必须完全一致（区分大小写）。kubelet 就是靠这个名字把两段配置"焊"在一起的：

- `volumes` 只负责回答"这个卷是什么、数据从哪来"（hostPath？configMap？PVC？），它自己不知道会被哪个容器用；
- `volumeMounts` 只负责回答"往容器里挂哪个卷、挂到哪、可不可写"，它自己不知道卷的数据源。

名字对不上时 Pod 无法调度，事件会直接报 `container "app" refers to a non-existent volume`（或反向的 volume 未被使用并不报错，但卷白声明了）。

### ② `hostPath.path`：宿主机上的"源"

`hostPath.path: /etc/localtime` 指的是**节点（宿主机）**上的路径，与容器内路径无关。kubelet 拿到 Pod 后，会在这个 Pod 所调度到的节点上解析该路径。

`type: File` 是校验规则：调度前检查宿主机上该路径必须存在且是普通文件，不存在则 Pod 卡在 `CreateContainerError`。`type` 常见取值：

| type | 含义 |
| ---- | ---- |
| `""`（默认） | 不做任何检查 |
| `Directory` | 必须存在且是目录 |
| `DirectoryOrCreate` | 不存在就按 0755 创建目录 |
| `File` | 必须存在且是普通文件 |
| `FileOrCreate` | 不存在就按 0644 创建文件 |
| `Socket` / `CharDevice` / `BlockDevice` | 必须是对应类型的设备文件 |

### ③ `mountPath`：容器内的"目标"

`mountPath: /etc/localtime` 是容器**内部**看到的路径。挂载完成后，容器里读写这个路径，实际读写的都是宿主机上 `hostPath.path` 指向的那个文件。

`readOnly: true` 表示容器内只读——时区文件本来就不该在容器里改，加上它是好习惯。

### ④ 本质：一次 bind mount

最终落到内核层面，这一整套 YAML 就是让 kubelet 通过 CRI 调用容器运行时，执行了一次 **bind mount**：把宿主机文件"绑定"到容器的挂载命名空间里。宿主机的 `/etc/localtime` 和容器内的 `/etc/localtime` 是**同一个文件、同一个 inode**——不是复制，是同一个对象的两条路径。

容器里可以直接验证：

```bash
# 容器内：时区与宿主机一致
date

# 容器内：两个路径 inode 相同，说明就是同一文件
ls -i /etc/localtime
```

宿主机上对照：

```bash
ls -i /etc/localtime   # inode 编号应与容器内一致
```

## 挂载的完整链路

把机制串起来，从 YAML 提交到文件可用，经历这几步：

1. `kube-apiserver` 接收 Pod，校验 volumeMounts 与 volumes 的 name 能对上；
2. 调度器选中某个节点（hostPath 不参与调度决策，所以节点上没这个文件时会出问题，见下文坑）；
3. 目标节点的 `kubelet` 监听到新 Pod，处理卷：对 hostPath 直接解析本地路径并按 `type` 校验；
4. kubelet 通过 CRI 通知容器运行时创建容器，把 `volumeMounts` 翻译成 bind mount 参数；
5. 运行时执行 `mount --bind <hostPath> <rootfs>/<mountPath>`，容器启动。

卷的准备工作（第 3 步）发生在容器启动之前——这也是为什么 type 校验失败时 Pod 状态会是 `CreateContainerError` / `ContainerCreating`，而不是镜像拉取失败那种报错。

## 常见坑

### mountPath 会覆盖镜像里的同名文件/目录

挂载是"遮盖"而不是"合并"：把一个目录挂到容器内 `/etc`，镜像里 `/etc` 的原有内容会被整体盖住。所以单文件挂载（如本例）比挂整个目录更精准；若挂目录只为了暴露其中一两个文件，考虑用 subPath：

```yaml
volumeMounts:
  - name: conf
    mountPath: /etc/nginx/nginx.conf
    subPath: nginx.conf    # 只遮盖这一个文件，不动目录里的其他文件
```

### hostPath 与调度无关，节点上没文件就翻车

hostPath 的内容不会跟着 Pod 走。Pod 调度到哪个节点，就读哪个节点的路径——如果只有 node-A 上有 `/etc/localtime` 之外的某个自定义文件，Pod 漂到 node-B 就会因 `type` 校验失败而卡住。时区这类所有节点都有的系统文件无所谓，自定义文件要小心。

### 单文件挂载可能挂成目录（或反之）

挂单文件时，如果容器内 `mountPath` 的父目录不存在，某些运行时会先建目录再挂，结果文件变成了目录。用 `type: File` 显式声明可以提前暴露问题；`FileOrCreate` 则是"没有就建一个"的兜底。

### 多容器共享同一个卷是合法的

`spec.volumes` 定义在 Pod 级别，多个容器的 `volumeMounts` 可以引用同一个 `name`，各自挂到不同的 `mountPath`——Pod 内多容器共享数据正是靠这一点（配合 `emptyDir` 最典型）。

:::tip 与 Downward API 的联系
Downward API 的卷也是同一套对应关系：`volumes` 里声明 `downwardAPI` 卷，容器 `volumeMounts` 里用同名 `name` 引用并指定 `mountPath`，kubelet 会把 Pod 元数据写进宿主机上的卷目录再 bind mount 进容器。细节见 [Downward API](./Downward%20API.md)。
:::

:::caution hostPath 的安全边界
hostPath 让容器直接触碰宿主机文件系统，`type` 一定要显式声明，路径尽量收窄到具体文件而非目录根。对不可信工作负载，集群应通过 PSA（Pod Security Admission）限制 hostPath 的使用。
:::
