# argucd cli使用









登录argocd

:::tip 说明

这里有警告是因为使用的证书是自签名证书，可以使用 `--insecure` 跳过

```shell
$ argocd login argocd.ops.com                      
WARNING: server certificate had error: tls: failed to verify certificate: x509: certificate signed by unknown authority. Proceed insecurely (y/n)?
```



使用 `--insecure` 跳过证书验证后又提示如下，这个警告信息表明，ArgoCD CLI 在尝试使用 gRPC 协议与服务器通信时失败，并建议你改用 **gRPC-Web** 协议（一种兼容浏览器和某些网络环境的 gRPC 变体）

```shell
$ argocd login argocd.ops.com --insecure           
{"level":"warning","msg":"Failed to invoke grpc call. Use flag --grpc-web in grpc calls. To avoid this warning message, use flag --grpc-web.","time":"2025-05-15T11:26:11+08:00"}
```

:::

```shell
$ argocd login argocd.ops.com --insecure --grpc-web         
Username: admin
Password: 
'admin:login' logged in successfully
Context 'argocd.ops.com' updated
```



查看当前集群

```shell
$ argocd cluster list
SERVER                          NAME        VERSION  STATUS   MESSAGE                                                  PROJECT
https://kubernetes.default.svc  in-cluster           Unknown  Cluster has no applications and is not being monitored.  
```





删除集群连接

```shell
argocd cluster rm 集群名称
```





```shell
$ argocd cluster rm  in-cluster
Are you sure you want to remove 'in-cluster'? Any Apps deploying to this cluster will go to health status Unknown.[y/n] y
{"level":"fatal","msg":"rpc error: code = NotFound desc = cluster \"https://kubernetes.default.svc\" not found","time":"2025-05-15T11:33:28+08:00"}
```





