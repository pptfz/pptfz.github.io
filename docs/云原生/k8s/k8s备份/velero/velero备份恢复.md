# velero备份恢复

## 备份











创建备份

```shell
velero backup create gitea-backup --include-namespaces gitea --wait
```



```shell
velero backup create gitea-backup-$(date +%s) --include-namespaces gitea
```



删除备份

```sh
velero backup delete gitea-backup
```





### 备份问题





创建备份

```shell
$ velero backup create gitea-backup --include-namespaces gitea
Backup request "gitea-backup" submitted successfully.
Waiting for backup to complete. You may safely press ctrl-c to stop waiting - your backup will continue in the background.

Backup completed with status: FailedValidation. You may check for more information using the commands `velero backup describe gitea-backup` and `velero backup logs gitea-backup`.
```





查看备份，发现有报错 `Validation errors:  backup can't be created because BackupStorageLocation default is in Unavailable status.`

```shell
$ velero backup describe gitea-backup
Name:         gitea-backup
Namespace:    velero
Labels:       velero.io/storage-location=default
Annotations:  velero.io/resource-timeout=10m0s
              velero.io/source-cluster-k8s-gitversion=v1.33.3
              velero.io/source-cluster-k8s-major-version=1
              velero.io/source-cluster-k8s-minor-version=33

Phase:  FailedValidation

Validation errors:  backup can't be created because BackupStorageLocation default is in Unavailable status.


Namespaces:
  Included:  gitea
  Excluded:  <none>

Resources:
  Included cluster-scoped:    <none>
  Excluded cluster-scoped:    volumesnapshotcontents.snapshot.storage.k8s.io
  Included namespace-scoped:  *
  Excluded namespace-scoped:  volumesnapshots.snapshot.storage.k8s.io

Label selector:  <none>

Or label selector:  <none>

Storage Location:  default

Velero-Native Snapshot PVs:    auto
File System Backup (Default):  false
Snapshot Move Data:            false
Data Mover:                    velero

TTL:  720h0m0s

CSISnapshotTimeout:    10m0s
ItemOperationTimeout:  4h0m0s

Hooks:  <none>

Backup Format Version:  1.1.0

Started:    <n/a>
Completed:  <n/a>

Expiration:  2026-04-17 19:12:08 +0800 CST

Backup Volumes:
  <error getting backup volume info: client rate limiter Wait returned an error: rate: Wait(n=1) would exceed context deadline>
```





velero无法连接对象存储

```shell
$ velero get backup-locations
NAME      PROVIDER   BUCKET/PREFIX   PHASE         LAST VALIDATED                  ACCESS MODE   DEFAULT
default   aws        velero          Unavailable   2026-03-18 19:13:05 +0800 CST   ReadWrite     true
```







```shell
$ velero backup create gitea-backup --include-namespaces gitea --wait
Backup request "gitea-backup" submitted successfully.
Waiting for backup to complete. You may safely press ctrl-c to stop waiting - your backup will continue in the background.

Backup completed with status: FailedValidation. You may check for more information using the commands `velero backup describe gitea-backup` and `velero backup logs gitea-backup`.
```





运行测试pod

```shell
kubectl -n velero run debugpod --rm -it --image=busybox --restart=Never -- sh
```





访问对象存储权限拒绝

```shell
$ wget -qO- http://rustfs-svc.rustfs.svc.cluster.local:9000 
wget: server returned error: HTTP/1.1 403 Forbidden
```



查看 velero 服务账号权限，返回结果都为no

```shell
kubectl auth can-i get pods --as=system:serviceaccount:velero:velero
kubectl auth can-i get secrets --as=system:serviceaccount:velero:velero
```



解决方法

创建一个 `ClusterRole`

```shell
kubectl create clusterrole velero-full-access \
  --verb=* \
  --resource=pods,secrets,configmaps,persistentvolumeclaims,persistentvolumes,services,endpoints,namespaces
```



绑定到 Velero 的 `ServiceAccount`

```shell
kubectl create clusterrolebinding velero-full-access \
  --clusterrole=velero-full-access \
  --serviceaccount=velero:velero
```



velero 没有安装 AWS 插件，所以无法访问 S3 兼容存储

`message: 'BackupStorageLocation "default" is unavailable: unable to locate ObjectStore plugin named velero.io/aws'`



```
$ velero get backup-locations
NAME      PROVIDER   BUCKET/PREFIX   PHASE         LAST VALIDATED                  ACCESS MODE   DEFAULT
default   aws        velero          Unavailable   2026-03-18 19:46:14 +0800 CST   ReadWrite     true
```

```shell
$ kubectl -n velero get backupstoragelocation default -o yaml
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  annotations:
    meta.helm.sh/release-name: velero
    meta.helm.sh/release-namespace: velero
  creationTimestamp: "2026-03-18T11:23:14Z"
  generation: 25
  labels:
    app.kubernetes.io/instance: velero
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: velero
    helm.sh/chart: velero-12.0.0
  name: default
  namespace: velero
  resourceVersion: "5363849"
  uid: 18e0a5d0-61ab-4dba-8422-75309b3ee808
spec:
  accessMode: ReadWrite
  config:
    region: us-east-1
    s3ForcePathStyle: "true"
    s3Url: http://rustfs-svc.rustfs.svc.cluster.local:9000
  credential:
    key: cloud
    name: velero-credentials
  default: true
  objectStorage:
    bucket: velero
  provider: aws
status:
  lastValidationTime: "2026-03-18T11:46:14Z"
  message: 'BackupStorageLocation "default" is unavailable: unable to locate ObjectStore
    plugin named velero.io/aws'
  phase: Unavailable
```



添加插件

```shell
velero plugin add velero/velero-plugin-for-aws
```



备份可用

```
$ velero get backup-locations
NAME      PROVIDER   BUCKET/PREFIX   PHASE       LAST VALIDATED                  ACCESS MODE   DEFAULT
default   aws        velero          Available   2026-03-24 14:13:07 +0800 CST   ReadWrite     true
```





## 恢复

:::tip 说明

这会把 `gitea` 里的资源恢复到 `gitea-restore-test`

:::

```shell
$ velero restore create --from-backup gitea-backup --namespace-mappings gitea:gitea-restore-test
Restore request "gitea-backup-20260324142758" submitted successfully.
Run `velero restore describe gitea-backup-20260324142758` or `velero restore logs gitea-backup-20260324142758` for more details.
```



