# Velero 简要说明

## 什么是 Velero

Velero 是一个用于 Kubernetes 集群的备份、恢复和迁移工具。

### 主要功能

- **备份**：备份集群资源和持久卷
- **恢复**：在数据丢失时恢复集群
- **迁移**：将集群资源迁移到其他集群
- **复制**：将生产环境复制到开发/测试环境

## 核心组件

| 组件 | 说明 |
|------|------|
| **Server** | 在 Kubernetes 集群中运行的服务端 |
| **CLI** | 本地命令行工具，用于管理备份操作 |

## 工作原理

```
┌─────────────┐
│   Velero    │
│    CLI      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Kubernetes Cluster    │
│  ┌───────────────────┐  │
│  │   Velero Server   │  │
│  │   (Deployment)    │  │
│  └─────────┬─────────┘  │
│            │            │
│            ▼            │
│  ┌───────────────────┐  │
│  │  备份到对象存储    │  │
│  │  (S3/OSS/COS 等)  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## 基本概念

| 概念 | 说明 |
|------|------|
| **Backup** | 备份操作，包含集群资源和卷快照 |
| **Restore** | 恢复操作，将备份还原到集群 |
| **Schedule** | 定时备份任务 |
| **BackupStorageLocation** | 备份存储位置配置 |
| **VolumeSnapshotLocation** | 卷快照存储位置配置 |

## 典型使用场景

1. **灾难恢复**：集群故障时恢复数据和配置
2. **集群迁移**：将应用从一个集群迁移到另一个
3. **环境复制**：将生产环境配置复制到测试环境
4. **实验回滚**：在进行危险操作前创建快照

## 快速开始

```bash
# 安装 velero CLI
brew install velero

# 查看版本
velero version

# 创建备份
velero backup create <backup-name> --include-namespaces <namespace>

# 查看备份
velero backup get

# 恢复备份
velero restore create --from-backup <backup-name>
```

## 相关文档

- [Velero 安装指南](./velero 安装.md)
- [Velero 备份恢复操作](./velero 备份恢复.md)
- [官方文档](https://velero.io/)
- [GitHub 仓库](https://github.com/vmware-tanzu/velero)
