# helm知识点

## `nameOverride` 与 `fullnameOverride` 字段

### 作用

在 Helm 中，`fullnameOverride` 是一个常用的 **值（Values）字段**，用于**完全覆盖资源名称的生成规则**。它的核心作用是**简化或自定义 Kubernetes 资源的命名前缀**，避免默认生成的冗长名称



### 说明

**默认命名规则**

Helm 默认的资源名称生成规则为：
**`{{ .Release.Name }}-{{ .Chart.Name }}-<资源后缀>`**
例如：

- Release 名称：`my-release`
- Chart 名称：`argo-cd`
- 生成的 Deployment 名称：`my-release-argo-cd-server`



**`fullnameOverride` 的作用**

当设置 `fullnameOverride` 时，它会**替换默认的 `{{ .Release.Name }}-{{ .Chart.Name }}` 部分**，直接使用指定的字符串作为前缀
例如：

```yaml
# values.yaml
fullnameOverride: "argocd"
```

生成的资源名称会变为：`argocd-server`（去掉了默认的冗余前缀）



**与 `nameOverride` 的区别**

- `fullnameOverride`：**完全替换** `{{ .Release.Name }}-{{ .Chart.Name }}`
- `nameOverride`：**仅替换 `{{ .Chart.Name }}`** 部分（保留 Release 名称）



Helm 生成的资源名称格式为：
**`{{ .Release.Name }}-{{ .Chart.Name }}-<资源后缀>`**

- 如果 Release 名称是 `my-argo`，Chart 名称是 `argo-cd`，默认生成的资源名称会是：
  **`my-argo-argo-cd-server`**

- `nameOverride` 只会替换 **`{{ .Chart.Name }}`** 部分（即 `argo-cd`），而保留 `{{ .Release.Name }}` ，假设 `nameOverride` 的值为 `cd` ， 则生成的资源名称会变为：`my-argo-cd-server` ，即仅将 `argo-cd` 替换为 `cd`，但保留了 `my-argo` 前缀

- 如果改用 `fullnameOverride`，它会完全覆盖 **`{{ .Release.Name }}-{{ .Chart.Name }}`** 部分 ，假设 `fullnameOverride` 的值为 `argocd` ，则生成的资源名称会变为：`argocd-server` ，即直接丢弃 `my-argo-argo-cd`，使用自定义的 `argocd`



### 示例

执行如下命令安装argocd

```shell
helm upgrade --install argo-cd -n argocd --create-namespace .
```



安装后的资源(`pod` 、`svc` 等)名称如下，前边会带有我们 指定的安装名称+`argocd-xxx`

```shell
$ k get pods
NAME                                                        READY   STATUS    RESTARTS     AGE
argo-cd-argocd-application-controller-0                     1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-applicationset-controller-7896794747-z8spc   1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-commit-server-5bff49df6b-pl8z6               1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-dex-server-64d464c675-4njtq                  1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-notifications-controller-7789c97448-mps59    1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-redis-bb6b78f97-r8zfz                        1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-repo-server-67d46bf85-kv46w                  1/1     Running   1 (2d ago)   2d18h
argo-cd-argocd-server-64887c9b5f-fctjh                      1/1     Running   1 (2d ago)   2d18h
```



如果想要把显示的名称改为 `argocd-xxx` ，则需要修改 `fullnameOverride` 字段

:::tip 说明

在 Helm 安装或升级时，还可以通过 `--set fullnameOverride=argocd` 覆盖默认命名规则

```shell
helm upgrade --install argocd \
  -n devops \
  --create-namespace \
  --set fullnameOverride=argocd \
  argo-cd/argo-cd \
  --version 8.0.1
```

:::

```yaml
# -- String to fully override `"argo-cd.fullname"`
fullnameOverride: "argocd"
```



修改完 `fullnameOverride` 字段后再执行安装命令 `helm upgrade --install argocd -n argocd --create-namespace .` 资源名称就会变为 `argocd-xxx` 了

```shell
$ k get pods
NAME                                                READY   STATUS      RESTARTS   AGE
argocd-application-controller-0                     1/1     Running     0          33s
argocd-applicationset-controller-6697b7744d-27ds7   1/1     Running     0          33s
argocd-commit-server-ffd87b89c-vq9kt                1/1     Running     0          33s
argocd-dex-server-6bfbcb7498-q2psn                  1/1     Running     0          33s
argocd-notifications-controller-7bb47d8dd5-psx4w    1/1     Running     0          33s
argocd-redis-758ccf98bd-25q6d                       1/1     Running     0          33s
argocd-redis-secret-init-bpj4l                      0/1     Completed   0          36s
argocd-repo-server-cbbc665bf-2ltfg                  1/1     Running     0          33s
argocd-server-5488f89cd7-bmr4j                      1/1     Running     0          33s
```

