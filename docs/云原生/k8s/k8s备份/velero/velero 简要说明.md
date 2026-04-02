# Velero 简要说明

## 什么是 Velero

Velero（原名 Heptio Ark）是一个专为 Kubernetes 集群设计的开源备份、恢复和迁移工具。

- **开源项目**：由 VMware 维护的 CNCF 沙箱项目
- **生产就绪**：被广泛用于生产环境的 Kubernetes 集群保护
- **多云支持**：支持 AWS、Azure、GCP 及任何兼容 S3 API 的对象存储

### 主要功能

| 功能 | 说明 |
|------|------|
| **备份集群资源** | 备份 Deployment、Service、ConfigMap 等所有 Kubernetes 资源 |
| **备份持久卷** | 通过快照或文件系统备份方式保护 PV 数据 |
| **灾难恢复** | 在集群故障、数据丢失时快速恢复 |
| **集群迁移** | 将应用和资源从一个集群迁移到另一个 |
| **环境复制** | 将生产环境配置复制到开发/测试环境 |
| **定时备份** | 通过 Schedule 资源实现自动定期备份 |

## 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                      用户本地环境                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Velero CLI (命令行工具)             │    │
│  │  • 创建/管理备份                                 │    │
│  │  • 执行恢复操作                                  │    │
│  │  • 查看备份状态                                  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            │ API 调用
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Kubernetes 集群                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Velero Server (部署在集群内)           │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │    │
│  │  │ Controller  │  │   Server    │  │  Restic │ │    │
│  │  │  (控制器)   │  │   (服务端)  │  │ (可选)  │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│                            │                             │
│                            ▼                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │              对象存储 (备份目标)                  │    │
│  │  • AWS S3 / 阿里云 OSS / 腾讯云 COS             │    │
│  │  • MinIO / RustFS 等 S3 兼容存储                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 组件说明

| 组件 | 运行位置 | 职责 |
|------|----------|------|
| **Velero CLI** | 用户本地机器 | 命令行接口，用于管理备份和恢复操作 |
| **Velero Server** | Kubernetes 集群 | 接收 CLI 请求，协调备份/恢复流程 |
| **Controller** | Kubernetes 集群 | 监听自定义资源（Backup、Restore 等）并执行相应操作 |
| **Restic/Kopia** | Kubernetes 集群（可选） | 提供文件系统级别的卷备份，无需云厂商快照支持 |

## 工作原理

### 备份流程

```
1. 用户执行 velero backup create
              │
              ▼
2. Velero Controller 监听到 Backup 资源创建
              │
              ▼
3. 收集需要备份的 Kubernetes 资源
   (Deployments, Services, ConfigMaps, Secrets 等)
              │
              ▼
4. 调用云厂商 API 创建 PV 快照 (如支持)
   或通过 Restic/Kopia 进行文件系统备份
              │
              ▼
5. 将资源清单和快照信息上传到对象存储
              │
              ▼
6. 更新 Backup 资源状态为 Completed
```

### 恢复流程

```
1. 用户执行 velero restore create --from-backup xxx
              │
              ▼
2. Velero Controller 监听到 Restore 资源创建
              │
              ▼
3. 从对象存储下载备份的资源清单和快照信息
              │
              ▼
4. 调用云厂商 API 从快照恢复 PV 数据
              │
              ▼
5. 将 Kubernetes 资源应用到集群
              │
              ▼
6. 更新 Restore 资源状态为 Completed
```

## 基本概念

| 概念 | 英文 | 说明 |
|------|------|------|
| **备份** | Backup | 一次备份操作的结果，包含资源清单和快照引用 |
| **恢复** | Restore | 将备份还原到集群的操作 |
| **定时备份** | Schedule | 定义备份计划，自动创建 Backup |
| **备份存储位置** | BackupStorageLocation (BSL) | 配置备份数据存储的位置和访问方式 |
| **快照存储位置** | VolumeSnapshotLocation (VSL) | 配置卷快照的存储位置 |
| **选择器** | Label Selector | 通过标签选择器过滤需要备份的资源 |
| **TTL** | Time To Live | 备份的存活时间，过期自动删除 |

### 备份类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **完整备份** | 备份整个集群或命名空间的所有资源 | 定期全量备份 |
| **按需备份** | 备份指定的资源或命名空间 | 重要操作前的手动备份 |
| **定时备份** | 按 Cron 表达式自动执行备份 | 日常自动化保护 |
| **增量备份** | 仅备份变化的数据 (需要 Restic/Kopia) | 节省存储空间 |

## 典型使用场景

### 1. 灾难恢复

```bash
# 场景：集群故障或数据丢失后恢复

# 1. 在新集群安装 Velero
# 2. 配置相同的备份存储位置
# 3. 执行恢复
velero restore create --from-backup production-backup-20240101
```

### 2. 集群迁移

```bash
# 场景：从旧集群迁移到新集群

# 源集群：创建完整备份
velero backup create full-cluster-backup

# 目标集群：恢复备份
velero restore create --from-backup full-cluster-backup
```

### 3. 环境复制

```bash
# 场景：将生产环境配置复制到测试环境

# 只备份特定命名空间
velero backup create prod-to-test --include-namespaces app-prod

# 恢复到测试集群时更改命名空间
velero restore create --from-backup prod-to-test \
  --namespace-mappings app-prod:app-test
```

### 4. 实验回滚

```bash
# 场景：进行危险操作前创建快照

# 创建即时备份
velero backup create before-upgrade --ttl 72h

# 如果升级失败，恢复到备份时的状态
velero restore create --from-backup before-upgrade
```

### 5. 定时备份

```bash
# 创建每天凌晨 2 点的定时备份
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces critical-apps \
  --ttl 720h
```

## 快速开始

### 安装 CLI

```bash
# macOS (Homebrew)
brew install velero

# Linux (下载二进制)
wget https://github.com/vmware-tanzu/velero/releases/download/v1.18.0/velero-v1.18.0-linux-amd64.tar.gz
tar -xvf velero-v1.18.0-linux-amd64.tar.gz
sudo mv velero-v1.18.0-linux-amd64/velero /usr/local/bin/

# 验证安装
velero version
```

### 安装服务端

```bash
# 添加 Helm 仓库
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts/

# 安装 Velero (以 S3 兼容存储为例)
helm install velero vmware-tanzu/velero \
  --namespace velero --create-namespace \
  --set credentials.useSecret=true \
  --set credentials.secretContents.cloud="\
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY" \
  --set configuration.backupStorageLocation[0].name=default \
  --set configuration.backupStorageLocation[0].provider=aws \
  --set configuration.backupStorageLocation[0].bucket=velero-backups \
  --set configuration.backupStorageLocation[0].config.region=minio \
  --set configuration.backupStorageLocation[0].config.s3Url=http://minio.example.com \
  --set configuration.backupStorageLocation[0].config.s3ForcePathStyle=true \
  --set snapshotsEnabled=false
```

### 常用命令

```bash
# ========== 备份管理 ==========
# 创建备份
velero backup create <backup-name>
velero backup create <backup-name> --include-namespaces <ns1,ns2>
velero backup create <backup-name> --selector <label-key>=<label-value>

# 查看备份
velero backup get
velero backup describe <backup-name>
velero backup logs <backup-name>

# 删除备份
velero backup delete <backup-name>

# ========== 恢复管理 ==========
# 创建恢复
velero restore create --from-backup <backup-name>
velero restore create --from-backup <backup-name> --namespace-mappings old-ns:new-ns

# 查看恢复
velero restore get
velero restore describe <restore-name>
velero restore logs <restore-name>

# ========== 定时备份 ==========
# 创建定时任务
velero schedule create <schedule-name> --schedule="0 2 * * *"

# 查看定时任务
velero schedule get

# ========== 查看状态 ==========
# 查看 Velero 状态
velero status

# 查看备份存储位置
velero backup-location get
```

### Cron 表达式示例

| 表达式 | 说明 |
|--------|------|
| `0 2 * * *` | 每天凌晨 2 点 |
| `0 2 * * 0` | 每周日凌晨 2 点 |
| `0 */6 * * *` | 每 6 小时 |
| `0 0 1 * *` | 每月 1 号零点 |

## 配置示例

### 备份特定命名空间

```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: app-backup
  namespace: velero
spec:
  includedNamespaces:
    - app-production
    - app-staging
  ttl: 720h0m0s  # 备份保留 30 天
```

### 排除某些资源

```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: selective-backup
  namespace: velero
spec:
  includedNamespaces:
    - "*"
  excludedResources:
    - nodes
    - events
    - backups.velero.io
    - restores.velero.io
  ttl: 168h0m0s  # 保留 7 天
```

### 按标签选择备份

```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: labeled-backup
  namespace: velero
spec:
  labelSelector:
    matchLabels:
      app: critical
      backup: "true"
```

## 最佳实践

### 备份策略

| 场景 | 建议 |
|------|------|
| **生产环境** | 每日全量备份 + 关键操作前手动备份 |
| **测试环境** | 每周备份或按需备份 |
| **重要数据** | 启用 Restic/Kopia 进行文件系统级备份 |
| **长期归档** | 设置较长 TTL 或永久保存关键备份 |

### 安全建议

1. **访问控制**：限制 Velero ServiceAccount 权限，遵循最小权限原则
2. **加密存储**：启用对象存储的服务端加密
3. **凭证管理**：使用 Kubernetes Secrets 存储访问凭证
4. **网络隔离**：限制 Velero 与对象存储之间的网络访问
5. **定期演练**：定期测试备份恢复流程，确保备份可用

### 监控告警

```bash
# 检查备份状态
velero backup get --sort-by=.status.startTimestamp

# 查看失败的备份
velero backup get | grep Failed

# 检查备份存储位置状态
velero backup-location get
```

## 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 备份失败 | 对象存储配置错误 | 检查 BSL 配置和访问凭证 |
| 快照失败 | 云厂商 API 权限不足 | 检查 IAM 权限配置 |
| 恢复失败 | 资源冲突或依赖问题 | 使用 `--wait` 参数或调整恢复顺序 |
| 备份过大 | 包含了不必要的资源 | 使用排除列表过滤资源 |
| 备份过慢 | 大量小文件或大卷 | 启用并发备份或优化网络 |

## 相关文档

- [Velero 安装指南](./velero 安装.md)
- [Velero 备份恢复操作](./velero 备份恢复.md)
- [官方文档](https://velero.io/)
- [GitHub 仓库](https://github.com/vmware-tanzu/velero)
- [版本兼容性](https://github.com/vmware-tanzu/velero#velero-compatibility-matrix)
