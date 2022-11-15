# nfs共享存储

[nfs存储官方文档](https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#nfs)



# 1.安装配置nfs

## 1.1 安装nfs

```shell
yum -y install nfs-utils rpcbind
```



## 1.2 创建共享目录

```
[ -d /data/nfs ] || mkdir -p /data/nfs && chown nfsnobody.nfsnobody /data/nfs
```



## 1.3 编辑配置文件

```shell
cat > /etc/exports << EOF
/data/nfs 192.168.1.0/24(rw,sync,no_root_squash)
EOF
```



**参数说明**

| 参数           | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| /data/nfs      | nfs服务端共享目录                                            |
| 192.168.1.0/24 | 允许挂载的客户端网段                                         |
| rw             | 挂载权限                                                     |
| sync           | 同时将数据写入到内存与硬盘中，保证不丢失数据                 |
| no_root_squash | 当登录 NFS 主机使用共享目录的使用者是 root 时，其权限将被转换成为匿名使用者，通常它的 UID 与 GID，都会变成 nobody 身份 |



## 1.4 启动nfs

```shell
systemctl start rpcbind nfs-server && systemctl enable rpcbind nfs-server
```



## 1.5 查看启动状态

```shell
$ systemctl status rpcbind nfs-server
● rpcbind.service - RPC bind service
   Loaded: loaded (/usr/lib/systemd/system/rpcbind.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2022-11-14 21:31:52 CST; 55s ago
 Main PID: 21841 (rpcbind)
   CGroup: /system.slice/rpcbind.service
           └─21841 /sbin/rpcbind -w

Nov 14 21:31:52 ctyun systemd[1]: Starting RPC bind service...
Nov 14 21:31:52 ctyun systemd[1]: Started RPC bind service.

● nfs-server.service - NFS server and services
   Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled; vendor preset: disabled)
  Drop-In: /run/systemd/generator/nfs-server.service.d
           └─order-with-mounts.conf
   Active: active (exited) since Mon 2022-11-14 21:31:52 CST; 55s ago
 Main PID: 21874 (code=exited, status=0/SUCCESS)
   CGroup: /system.slice/nfs-server.service

Nov 14 21:31:52 ctyun systemd[1]: Starting NFS server and services...
Nov 14 21:31:52 ctyun systemd[1]: Started NFS server and services.
```



## 1.6 查看nfs共享记录信息

**nfs启动后会在 `/var/lib/nfs/etab` 文件中记录共享内容**

```shell
$ cat /var/lib/nfs/etab 
/data/nfs	192.168.1.0/24(rw,sync,wdelay,hide,nocrossmnt,secure,no_root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,no_root_squash,no_all_squash)
```



# 2.在k8s集群中使用nfs

## 2.1 手动创建pv

### 2.1.1 编辑yaml文件

:::tip说明

用户真正使用的是pvc，而要使用pvc的前提就是必须要先和某个符合条件的pv进行一对一的绑定，比如存储容器、访问模式，以及pvc和pv的storageClassName 字段必须一样，这样才能够进行绑定，当pvc和pv绑定成功后就可以直接使用这个pvc对象了

:::

```yaml
cat > nfs-volume.yaml << EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /data/nfs  # 指定nfs的挂载点
    server: 192.168.1.96  # 指定nfs服务地址
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc
spec:
  storageClassName: manual
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF
```



### 2.1.2 创建pv pvc

```shell
$ kubectl apply -f nfs-volume.yaml 
persistentvolume/nfs-pv created
persistentvolumeclaim/nfs-pvc created
```



### 2.1.3 查看pv pvc

查看pv

```shell
$ kubectl get pv
NAME     CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM          STORAGECLASS   REASON   AGE
nfs-pv   1Gi        RWO            Retain           Bound    test/nfs-pvc   manual                  30s
```



查看pvc

```shell
$ kubectl get pvc
NAME      STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
nfs-pvc   Bound    nfs-pv   1Gi        RWO            manual         29s
```



### 2.1.4 创建pod并引用创建的pvc

编辑yaml文件

```yaml
cat > nfs-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: test-volumes
spec:
  volumes:
  - name: nfs
    persistentVolumeClaim:
      claimName: nfs-pvc
  containers:
  - name: web
    image: nginx
    ports:
    - name: web
      containerPort: 80
    volumeMounts:
    - name: nfs
      subPath: test-volumes
      mountPath: "/usr/share/nginx/html"
EOF
```



创建pod

```shell
$ kubectl apply -f nfs-pod.yaml 
pod/test-volumes created
```



查看pod

```shell
$ kubectl get pod -o wide
NAME           READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
test-volumes   1/1     Running   0          31s   100.108.251.8   ctyun   <none>           <none>
```



由于我们这里pv中的数据为空，所以挂载后会将nginx容器中的 `/usr/share/nginx/html` 目录覆盖，那么访问应用的时候就没有内容了

```shell
$ curl 100.108.251.8
<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<hr><center>nginx/1.23.2</center>
</body>
</html>
```



向pv目录写入文件内容

```shell
echo 'test-volumes' > /data/nfs/test-volumes/index.html
```



再次访问就可以看到刚才写入的内容了

```shell
$ curl 100.108.251.8
test-volumes
```





## 2.2 通过StorageClass自动创建pv

:::tip说明

上述这种方式是手动创建pv pvc，如果想要自动创建pv pvc则需要使用StorageClass了，并且需要一个对应的provisioner来自动创建pv，比如这里我们使用的nfs存储，则可以使用 [nfs-subdir-external-provisioner](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner) 这个 provisioner，它使用现有的和已配置的nfs服务器来支持通过pvc动态配置pv，持久卷配置为 `${namespace}-${pvcName}-${pvName}`

:::



### 2.2.1 安装 [nfs-subdir-external-provisioner](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner) 

添加helm仓库

```shell
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
```



安装

:::tip说明

`--set storageClass.defaultClass=true` 指定sc为默认sc

`nfs-subdir-external-provisioner/nfs-subdir-external-provisioner` 会从 `k8s.gcr.io/sig-storage/nfs-subdir-external-provisioner` pull镜像，但是由于某些特殊原因这个地址是无法访问的，因此需要科学上网，这里我们使用ucloud提供的镜像加速服务 `uhub.service.ucloud.cn/996.icu/nfs-subdir-external-provisioner:v4.0.2` ，并把这个镜像推送到docker hub仓库

截止到2022.11.15，`nfs-subdir-external-provisioner/nfs-subdir-external-provisioner` 镜像最新版本是 `v4.0.2`

:::



```shell
export NFS_SERVER_IP=192.168.1.96
export NFS_SHARE_DIR=/data/nfs
helm upgrade --install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
    --set nfs.server=${NFS_SERVER_IP} \
    --set nfs.path=${NFS_SHARE_DIR} \
    --set storageClass.defaultClass=true \
    --set image.repository=pptfz/nfs-subdir-external-provisioner
```



查看sc

```shell
$ kubectl get sc
NAME                   PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-client (default)   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   7m20s
```



查看sc的yaml文件

```yaml
$ kubectl get sc nfs-client -o yaml
allowVolumeExpansion: true
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    meta.helm.sh/release-name: nfs-subdir-external-provisioner
    meta.helm.sh/release-namespace: test
  creationTimestamp: "2022-11-14T14:35:46Z"
  labels:
    app: nfs-subdir-external-provisioner
    app.kubernetes.io/managed-by: Helm
    chart: nfs-subdir-external-provisioner-4.0.17
    heritage: Helm
    release: nfs-subdir-external-provisioner
  name: nfs-client
  resourceVersion: "217312"
  uid: 5186b712-8214-46e1-b26e-aaed6bf1de7e
parameters:
  archiveOnDelete: "true"
provisioner: cluster.local/nfs-subdir-external-provisioner
reclaimPolicy: Delete
volumeBindingMode: Immediate
```



使用helm安装实际上是部署一个deployment

```shell
$ kubectl get all
NAME                                                   READY   STATUS    RESTARTS   AGE
pod/nfs-subdir-external-provisioner-69f5686876-z47fl   1/1     Running   0          3m45s

NAME                                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nfs-subdir-external-provisioner   1/1     1            1           3m45s

NAME                                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/nfs-subdir-external-provisioner-69f5686876   1         1         1       3m45s
```



### 2.2.2 自动创建pv

编辑yaml文件

```yaml
cat > nfs-sc-pvc << EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-sc-pvc
spec:
  # storageClassName: nfs-client  # 不指定则使用默认的sc
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF
```



创建pvc

```shell
kubectl apply -f nfs-sc-pvc.yaml
```



查看创建的pvc

```shell
$ kubectl get pvc
NAME         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
nfs-sc-pvc   Bound    pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb   1Gi        RWO            nfs-client     3s
```



创建完pvc后就会自动绑定一个pv

```shell
$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM             STORAGECLASS   REASON   AGE
pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb   1Gi        RWO            Delete           Bound    test/nfs-sc-pvc   nfs-client              5s
```



查看pv yaml文件

```yaml
$ kubectl get pv -o yaml
apiVersion: v1
items:
- apiVersion: v1
  kind: PersistentVolume
  metadata:
    annotations:
      pv.kubernetes.io/provisioned-by: cluster.local/nfs-subdir-external-provisioner
    creationTimestamp: "2022-11-14T16:12:08Z"
    finalizers:
    - kubernetes.io/pv-protection
    name: pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb
    resourceVersion: "231102"
    uid: 51c97978-298b-4015-a250-2b694fefe90c
  spec:
    accessModes:
    - ReadWriteOnce
    capacity:
      storage: 1Gi
    claimRef:
      apiVersion: v1
      kind: PersistentVolumeClaim
      name: nfs-sc-pvc
      namespace: test
      resourceVersion: "231097"
      uid: e1357f25-9ffe-41d7-8607-4d311f0338bb
    nfs:
      path: /data/nfs/test-nfs-sc-pvc-pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb
      server: 192.168.1.96
    persistentVolumeReclaimPolicy: Delete
    storageClassName: nfs-client
    volumeMode: Filesystem
  status:
    phase: Bound
kind: List
metadata:
  resourceVersion: ""
```

可以看到挂载的nfs目录为 `/data/nfs/test-nfs-sc-pvc-pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb` ，命名格式为  `${namespace}-${pvcName}-${pvName}`，其中 `test` 是命名空间名称，`nfs-sc-pvc` 是pvc名称，`pvc-e1357f25-9ffe-41d7-8607-4d311f0338bb` 是pv名称