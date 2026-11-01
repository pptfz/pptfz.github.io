# 静态 Pod 详解

## 引言

`kubectl get pods -n kube-system` 里那些 `kube-apiserver-master`、`etcd-master`、`kube-scheduler-master`，既不归 Deployment 管、删了还会"自动复活"——它们就是**静态 Pod（Static Pod）**：由节点上的 kubelet 直接监管、完全绕过 API Server 和控制平面的 Pod。kubeadm 集群的控制平面组件正是以静态 Pod 方式运行的，所以理解静态 Pod 是理解 kubeadm 集群"怎么活下来"的基础。

## 官方文档参考

| 页面 | URL |
| --- | --- |
| 静态 Pod（概念页） | https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/static-pods/ |
| 创建静态 Pod（任务页） | https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/static-pod/ |

## 1. 什么是静态 Pod

静态 Pod 的两个决定性特征：

1. **由特定节点上的 kubelet 直接管理**：kubelet 监控它的运行状态，容器挂了就原地重启，全程不需要 API Server 参与
2. **总是绑定在其所在的节点上**：没有调度过程，kubelet 读到 manifest 就在本地启动

主要用途是运行**自托管控制平面**：kubeadm 就是用静态 Pod 在控制平面节点上运行 `kube-apiserver`、`kube-controller-manager`、`kube-scheduler` 和 `etcd`。好处是鸡生蛋问题被优雅解决——kubelet 是 systemd 拉起的服务，kubelet 先活，再由 kubelet 拉起整个控制平面。

## 2. kubelet 怎么发现静态 Pod

kubelet 从两个来源读取静态 Pod 的 manifest：

- **本地目录**：由 kubelet 启动参数 `--pod-manifest-path=<目录>` 指定，kubeadm 默认是 `/etc/kubernetes/manifests`
- **HTTP 端点**：由 `--manifest-url=<URL>` 指定，kubelet 定期下载该 URL 返回的 manifest 清单

```bash
# kubeadm 集群的静态 Pod manifest 目录
ls /etc/kubernetes/manifests/
# etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

kubelet 会周期性扫描该目录，**manifest 文件的变化就是静态 Pod 的"发布方式"**：新增文件即创建 Pod、修改文件即重建 Pod（按新配置）、删除文件即终止 Pod。这也是修改 apiserver 启动参数的标准操作——直接改 `/etc/kubernetes/manifests/kube-apiserver.yaml`，kubelet 检测到变化后自动重建。

## 3. 镜像 Pod（Mirror Pod）：静态 Pod 在 API 里的"影子"

静态 Pod 本身 API Server 是看不到的（它没经过 apiserver 创建）。为了让节点上的运行状态在集群中**可见**，kubelet 会自动为每个静态 Pod 在 API Server 上创建一个**镜像 Pod**：

- 镜像 Pod 名带**节点主机名后缀**，如 `kube-apiserver-master`（运行在 master 节点）、`etcd-worker1` 这样的形式
- kubelet 会把静态 Pod 的 labels 同步到镜像 Pod 上，可以正常用于选择器
- 识别方法：镜像 Pod 带 `kubernetes.io/config.mirror` 注解

```bash
# 识别 kube-system 里的镜像 Pod
kubectl get pods -n kube-system \
  -o jsonpath='{range .items[?(@.metadata.annotations.kubernetes\.io/config\.mirror)]}{.metadata.name}{"\n"}{end}'
```

:::caution 删除镜像 Pod 不会删掉静态 Pod
`kubectl delete pod kube-apiserver-master` 后，kubelet 发现镜像 Pod 消失会**立刻重新创建**它，静态 Pod 本身纹丝不动。想真正停掉一个静态 Pod，唯一方式是**登到节点上把 manifest 文件从目录里移走**。反过来，静态 Pod 也不受控制器管理——Deployment/RS 与它无关，没有滚动更新、没有副本管理。
:::

## 4. 限制

- **spec 不能引用其他 API 对象**：不能引用 ServiceAccount、ConfigMap、Secret 等（毕竟 manifest 在节点上、Pod 可能先于 API Server 存在）
- **不支持临时容器**：不能对静态 Pod 使用 `kubectl debug` 注入
- **不支持其他 API 对象依赖**：也就无法被 PDB 之类的机制保护

## 5. 静态 Pod 与 DaemonSet

两者都是"每个节点一份"的形态，但定位完全不同：

| 维度 | 静态 Pod | DaemonSet |
| --- | --- | --- |
| 管理者 | 节点上的 kubelet | 控制平面（DaemonSet 控制器） |
| 生命周期 | kubelet 读 manifest，独立存活 | 依赖 API Server 与控制器 |
| 滚动更新/回滚/扩缩 | **不支持**（改文件即重建，无编排） | 完整支持 |
| 启动时机 | **早于 API Server**（适合引导控制平面） | 需要控制平面已就绪 |
| 适用场景 | 引导/自托管控制平面、极早期组件 | 节点级业务组件（日志、监控、CNI） |

:::tip 选型结论
集群化运行时，想在"每个节点"上跑业务性质的组件，官方明确建议用 DaemonSet 而不是静态 Pod——前者才有滚动发布、回滚和规模化运维能力。静态 Pod 留给控制平面自托管这一类"必须比控制平面活得早"的组件。
:::

## 6. 实操：创建一个静态 Pod

```bash
# 1. 确认 kubelet 的 manifest 目录（kubeadm 默认 /etc/kubernetes/manifests）
ps aux | grep kubelet | grep -o 'pod-manifest-path=[^ ]*'

# 2. 放入 manifest 文件（普通 Pod 的 YAML，但要自包含，不能引用 ConfigMap 等）
cat > /etc/kubernetes/manifests/static-web.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: static-web
  labels:
    role: myrole
spec:
  containers:
  - name: web
    image: nginx:1.27
    ports:
    - name: web
      containerPort: 80
EOF

# 3. 几秒内在节点上出现（kubelet 自动重启之，无需任何操作）
crictl ps | grep static-web

# 4. API Server 上看到带节点后缀的镜像 Pod
kubectl get pods | grep static-web
# static-web-<节点名>   1/1   Running

# 5. 停止它：删除 manifest 文件（不要试图 kubectl delete）
rm /etc/kubernetes/manifests/static-web.yaml
```

:::caution 改控制平面静态 Pod 的注意事项
修改 `/etc/kubernetes/manifests/` 下的文件等于直接改控制平面组件的启动配置。kubelet 检测到变化就重建组件，写错参数可能导致 apiserver 起不来（连带 kubectl 不可用）。修改前备份原文件，出问题就还原文件等 kubelet 拉回。kubeadm 升级时也会重写这些文件，手工修改要做记录。
:::

## 7. 我的总结与避坑清单

1. **静态 Pod 的"重启"只有两把钥匙**：容器崩溃 kubelet 原地重启；改/删 manifest 文件触发重建/终止——kubectl 对它的删除永远会被"复活"
2. **镜像 Pod 只是影子**：API 里可见可查，但不可控；排查时先看 `kubernetes.io/config.mirror` 注解确认身份
3. **manifest 目录就是发布通道**：`/etc/kubernetes/manifests/` 的文件增删改 = 静态 Pod 的创建/终止/重建，kubeadm 参数调优就走这条路
4. **spec 不能引用 ConfigMap/Secret/ServiceAccount**：所有配置必须内联在 manifest 里
5. **不支持临时容器**，调试只能登节点看容器日志（`crictl`/容器运行时工具）
6. **别用静态 Pod 跑节点级业务组件**，DaemonSet 是正解；静态 Pod 的生态位是"比控制平面活得早"
7. **kubelet 不校验 API Schema 的全部规则**：manifest 写错可能只在 kubelet 日志里报错，Pod 不出现——排查从 `journalctl -u kubelet` 入手
