



```
ssh -T -p 2222 git@gitea-ssh.ops.com

Hi there, gitea_admin! You've successfully authenticated with the key named pptfz@devops, but Gitea does not provide shell access.
If this is unexpected, please log in with password and setup Gitea under another user.

```







# Kubernetes + Gitea 部署笔记

## 一、环境概览

- **集群安装方式**：`kubeadm`
- **K8s 版本**：1.30+
- **外部网络负载**：使用 **MetalLB** 提供 LoadBalancer
- **服务**：Gitea
  - HTTP/HTTPS：`gitea.ops.com`（Web访问）
  - SSH：`gitea-ssh.ops.com:2222`（Git push/pull）

------

## 二、核心组件配置

### 1. MetalLB

- 用于给 Service 类型为 LoadBalancer 的资源分配 **虚拟 IP**
- 注意事项：
  - IP 池与内网网段一致，避免冲突
  - 确保 DNS 指向 MetalLB 分配的 IP
  - 对于 SSH Service，可以指定 `loadBalancerIP`

示例：

```
service:
  ssh:
    type: LoadBalancer
    port: 2222
    loadBalancerIP: 10.0.0.232
```

------

### 2. Gitea HTTP Web（Web UI）

- 通过 **Ingress** 暴露
- 配置示例：

```
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: gitea.ops.com
      paths:
        - path: /
          pathType: Prefix
```

- 注意：
  - Ingress 只能转发 HTTP/HTTPS，不支持 SSH
  - 可以使用 TLS/HTTPS，推荐证书管理

------

### 3. Gitea SSH 服务

- **必须独立 Service**，不能通过普通 Ingress 转发
- 端口：`2222`
- 使用 **LoadBalancer** 或 **NodePort**
- **K8s 1.30+ 注意事项**：
  - LoadBalancer 类型 Service **不能**设置 `clusterIP: None`
  - 旧 Service 若是 `clusterIP=None`，无法直接升级为 LoadBalancer
  - 解决方法：
    1. 删除旧 Service 再升级
    2. 或创建新的 SSH Service（推荐使用新域名 `gitea-ssh.ops.com`）

示例 Helm 配置：

```
service:
  ssh:
    type: LoadBalancer
    port: 2222
    # clusterIP 不要设置
    loadBalancerIP: 10.0.0.232
```

------

### 4. DNS 设置

- Web UI 域名：`gitea.ops.com` → 指向 HTTP LoadBalancer IP
- SSH 域名：`gitea-ssh.ops.com` → 指向 SSH LoadBalancer IP
- 内网测试可修改 `/etc/hosts`，外网需 DNS 正确解析

------

### 5. Git 客户端配置

- **SSH 访问**：

```
git remote set-url origin ssh://git@gitea-ssh.ops.com:2222/username/repo.git
ssh -T -p 2222 git@gitea-ssh.ops.com
git push origin master
```

- **HTTP 访问**：
  - 每次推送需要输入账号密码或 Access Token
  - 可以通过 Personal Access Token 免密推送

------

## 三、注意事项总结

1. **Ingress 与 SSH Service 区分**
   - Ingress 只能处理 HTTP/HTTPS
   - SSH 必须单独 Service（LoadBalancer/NodePort）
2. **K8s 1.30+ ClusterIP 限制**
   - LoadBalancer Service 不能使用 `clusterIP=None`
   - 旧 Service 修改类型可能失败 → 需删除重建
3. **MetalLB IP 管理**
   - 避免 IP 冲突
   - 同一个集群内，HTTP/SSH Service IP 可以分开
4. **域名管理**
   - Web UI 和 SSH 分域名，方便管理
   - DNS 或 /etc/hosts 必须正确解析
5. **Git 推送习惯**
   - 内网可直接用 SSH
   - 外网或 CI/CD 使用 HTTP + Token
   - SSH 服务端口可自定义（例如 2222）
6. **Helm Chart 注意点**
   - 不要给 LoadBalancer SSH Service 设置 clusterIP
   - 升级 Chart 时，注意旧 Service 遗留的 clusterIP 配置

