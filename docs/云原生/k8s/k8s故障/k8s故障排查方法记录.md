# k8s排查方法记录

## 获取pod重启之前的日志

[kubectl logs官方文档](https://kubernetes.io/zh-cn/docs/reference/kubectl/generated/kubectl_logs/)

:::tip 说明

`--previous` 选项表示打印 Pod 中容器的前一个实例的日志（如果存在）

:::

```go
$ kubectl logs abc-666-mxx --previous
===&{SecretId:xxx SecretKey:xxx Region:ap-beijing Appid:1318590712 Bucket:static-123}
====&{SecretId:xxx SecretKey:xxx Region:ap-beijing Appid:1318590712 Bucket:static-123}
====&{SecretId:xxx SecretKey:xxx Region:ap-beijing Appid:1318590712 Bucket:static-123}
Error decoding fixed JSON: invalid character '\n' in string literal
unboundInfo====&{Id:46146 SpeakerId:S_7LB5xrtx1 Appid:8843256757 TrainedTimes:0 Status:1 CreatedAt:2025-07-07 09:52:33 +0800 CST UpdatedAt:2025-07-07 09:52:33 +0800 CST}


responseresponse======{"BaseResp":{"StatusCode":0,"StatusMessage":""},"speaker_id":"S_7LB5xrtx1"}


panic: send on closed channel

goroutine 1901871 [running]:
muse-ability/pkg/third/cog.(*Voice).streamParseResult.func2()
	/build/pkg/third/cog/voice.go:102 +0x29e
created by muse-ability/pkg/third/cog.(*Voice).streamParseResult in goroutine 1901869
	/build/pkg/third/cog/voice.go:90 +0x14f
```

