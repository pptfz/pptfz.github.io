# harbor使用腾讯云cos做为存储后端报错500问题



[harbor官方文档对于 `sorage_service` 的说明](https://goharbor.io/docs/latest/install-config/configure-yml-file/)

[CNCF对于使用不同存储后端的说明](https://distribution.github.io/distribution/about/configuration/)



## `harbor.yml` 存储配置

[腾讯云cos地域和访问域名文档](https://cloud.tencent.com/document/product/436/6224)

:::tip 说明

在配置文件中，regionendpoint的格式是 `<BucketName-APPID>.cos.ap-beijing.myqcloud.com` 如果指定了 `bucket` ，则 `<BucketName-APPID>` 可以不写，例如在北京有一个cos桶，那么 `regionendpoint` 对应的地址就是 `https://cos.ap-beijing.myqcloud.com`

:::

```yaml
storage_service:
    s3: 
      region: ap-beijing
      bucket:  xxx
      accesskey: xxx
      secretkey: xxx
      regionendpoint: https://cos.ap-beijing.myqcloud.com
      rootdirectory: / 
```



## 上传镜像报错500

```shell
$ docker push xxx.com/devops/node:10.16.3
The push refers to repository [xxx.com/devops/node]
4af45d82c6e8: Pushing [==================================================>]  3.584kB
35dc986a1895: Retrying in 1 second 
daca4f0b76e3: Retrying in 1 second 
799e7111d6d4: Pushing [==================================================>]  349.2kB
a72a7e555fe1: Retrying in 1 second 
b8f8aeff56a8: Waiting 
687890749166: Waiting 
2f77733e9824: Waiting 
97041f29baff: Waiting 
received unexpected HTTP status: 500 Internal Server Error
```



## 同步镜像报错

```shell
2024-09-13T08:38:21Z [INFO] [/replication/transfer/image/transfer.go:240]: copying the blob sha256:686b0b2c85da0e7da2069190089960ff92969951bde1aecb2884f1ee8262287d(the 5th running)...
2024-09-13T08:38:22Z [ERROR] [/replication/transfer/image/transfer.go:278]: failed to pushing the blob sha256:686b0b2c85da0e7da2069190089960ff92969951bde1aecb2884f1ee8262287d, size 10456: http error: code 500, message {"errors":[{"code":"UNKNOWN","message":"unknown error","detail":{"DriverName":"s3aws","Enclosed":{"RequestFailure":{}}}}]}
2024-09-13T08:38:22Z [ERROR] [/replication/transfer/image/transfer.go:245]: failed to copy the blob sha256:686b0b2c85da0e7da2069190089960ff92969951bde1aecb2884f1ee8262287d: http error: code 500, message {"errors":[{"code":"UNKNOWN","message":"unknown error","detail":{"DriverName":"s3aws","Enclosed":{"RequestFailure":{}}}}]}
2024-09-13T08:38:22Z [ERROR] [/replication/transfer/image/transfer.go:154]: http error: code 500, message {"errors":[{"code":"UNKNOWN","message":"unknown error","detail":{"DriverName":"s3aws","Enclosed":{"RequestFailure":{}}}}]}
```



## 原因

:::tip 说明

腾讯云cos桶有最终一致性特性，即往存储桶中上传了一个对象，并立即调用 `GET Bucket` 接口，由于此接口的最终一致性特性，返回的结果中可能不会包含刚刚上传的对象。

:::

cos桶list强一致性问题，具体可以看 [腾讯云GET Bucket文档说明](https://cloud.tencent.com/document/product/436/7734) ，在[腾讯云社区文章](https://cloud.tencent.com/developer/article/1855894?from_column=20421&from=20421) 中也有人遇到过这个问题



## 解决方法

需要腾讯云cos团队修改后台配置