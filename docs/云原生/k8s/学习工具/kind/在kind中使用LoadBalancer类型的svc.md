# 在kind中使用LoadBalancer类型的svc

[cloud-provider-kind github](https://github.com/kubernetes-sigs/cloud-provider-kind)



`cloud-provider-kind` 这个插件可以解决在kind安装的k8s集群中使用LoadBalancer类型的svc



安装

```shell
go install sigs.k8s.io/cloud-provider-kind@latest
```



这将把二进制文件安装到 `$GOBIN`（通常是 `~/go/bin`）中，可以移动到其他路径

```sh
sudo install ~/go/bin/cloud-provider-kind /usr/local/bin
```



运行cloud-provider-kind

我们需要在终端中运行 `cloud-provider-kind` 并保持运行。`cloud-provider-kind` 将监控所有 KIND 群集和 `Services` 类型 `LoadBalancer`，并创建相应的 LoadBalancer 容器来公开这些服务

:::caution 注意

在运行 `cloud-provider-kind` 命令时，在mac中必须使用sudo权限，否则会导致LoadBalancer类型的svc获取ip失败

:::

```bash
sudo cloud-provider-kind
```





`cloud-provider-kind` 运行成功后，可以看到LoadBalancer类型的svc已经获取到了ip

![iShot_2024-06-12_19.23.10](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-06-12_19.23.10.png)

同时会运行一个docker容器用于暴露端口

```bash
$ docker ps -a
CONTAINER ID   IMAGE                      COMMAND                   CREATED          STATUS          PORTS                                                                    NAMES
2ccb7c3ab2a9   envoyproxy/envoy:v1.30.1   "/docker-entrypoint.…"   21 minutes ago   Up 21 minutes   127.0.0.1:55005->22/tcp, 0.0.0.0:55004->10000/tcp, :::55004->10000/tcp   kindccm-ZWHVOQK77FGBMGRRVRJDFYOQRB5DX3QHLYDGLG2F
```

