# 无法删除replicasets

集群中有一个异常的pod

```shell
$ kubectl get pod|grep uc-admin
uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b-hchqr      0/1     CrashLoopBackOff   2716       2y18d
```



但是deployment却不存在，过滤为空

```shell
kubectl get deploy|grep uc-admin
```



查看相应的rs

```shell
$ kubectl get rs |grep uc-admin
uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b                                 1         1         0       2y277d
uc-admin.stage-default.ten.ratel-pod-deploy-8696449756                                 0         0         0       2y296d
```



尝试删除rs

```shell
$ kubectl delete rs uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b
replicaset.apps "uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b" deleted
```



但是刚被删除的rs又会自动创建

```shell
$ kubectl get rs |grep uc-admin
uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b                                 1         1         0       9s
uc-admin.stage-default.ten.ratel-pod-deploy-8696449756                                 0         0         0       2y296d
```



查看一下这个rs

可以看到是通过 `CanaryDeployment` 管理的，这个就是 [金丝雀](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#canary-deployment) 部署

```shell
$ kubectl describe rs uc-admin.stage-default.ten.ratel-pod-deploy-57bb47794b|grep Controlled
Controlled By:  CanaryDeployment/uc-admin.stage-default.ten.ratel-pod-deploy
```



查看这个CanaryDeployment

```shell
$ kubectl get CanaryDeployment|grep uc-admin
uc-admin.stage-default.ten.ratel-pod-deploy                    0/0   0/1   0/0     0/0      3y35d
```



删除这个CanaryDeployment

```shell
$ kubectl delete CanaryDeployment uc-admin.stage-default.ten.ratel-pod-deploy
canarydeployment.infra.vipkid.com.cn "uc-admin.stage-default.ten.ratel-pod-deploy" deleted
```



删除CanaryDeployment就会自动删除rs

```shell
$ kubectl get rs|grep uc-admin
```

