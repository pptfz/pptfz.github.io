# 阿里云ack默认sc

[容器服务 Kubernetes 版**的StorageClass模板说明**](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/storage-basics?spm=a2c4g.11186623.help-menu-85222.d_2_4_0.27366abdyaFhAY)



```shell
$ k get sc -A
NAME                             PROVISIONER                       RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
alibabacloud-cnfs-nas            nasplugin.csi.alibabacloud.com    Delete          Immediate              true                   2d1h
alicloud-disk-efficiency         diskplugin.csi.alibabacloud.com   Delete          Immediate              true                   2d1h
alicloud-disk-essd               diskplugin.csi.alibabacloud.com   Delete          Immediate              true                   2d1h
alicloud-disk-ssd                diskplugin.csi.alibabacloud.com   Delete          Immediate              true                   2d1h
alicloud-disk-topology-alltype   diskplugin.csi.alibabacloud.com   Delete          WaitForFirstConsumer   true                   2d1h
```

