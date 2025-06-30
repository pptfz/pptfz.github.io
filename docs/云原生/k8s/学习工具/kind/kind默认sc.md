# kind默认sc



kind安装完成后，会安装一个默认的sc `standard`

```sh
$ kubectl get sc
NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
standard (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  37d
```



安装一个mysql并且使用 `standard` 作为默认sc

```sh
# 查看pvc
$ kubectl get pvc
NAME           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data-mysql-0   Bound    pvc-c7f72e3b-b652-4a22-9409-eb795c206e99   8Gi        RWO            standard       21m

# 查看pv
kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM             STORAGECLASS   REASON   AGE
pvc-c7f72e3b-b652-4a22-9409-eb795c206e99   8Gi        RWO            Delete           Bound    db/data-mysql-0   standard                21m
```



持久化存储目录在 `/var/lib/docker/volumes` 目录下

```sh
$ find / -name "wonima"
/var/lib/docker/volumes/0b66faf65adb584a331f65d718ba758bfbd30edfa7c2fe65021051337ba857b0/_data/local-path-provisioner/pvc-c7f72e3b-b652-4a22-9409-eb795c206e99_db_data-mysql-0/data/wonima
```

