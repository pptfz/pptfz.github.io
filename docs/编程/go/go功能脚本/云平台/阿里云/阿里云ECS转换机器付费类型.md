# 阿里云ECS转换机器付费类型

[阿里云修改ECS付费类型文档](https://help.aliyun.com/zh/ecs/developer-reference/api-ecs-2014-05-26-modifyinstancechargetype?spm=a2c4g.11186623.0.0.6957652f5iXiQn)





```go
package main

import (
    "fmt"
    "github.com/aliyun/alibaba-cloud-sdk-go/services/ecs"
    "os"
)

func modifyInstanceChargeType(client *ecs.Client, instanceId string) error {
    request := ecs.CreateModifyInstanceChargeTypeRequest()
    request.Scheme = "https"
    request.InstanceIds = fmt.Sprintf("[\"%s\"]", instanceId) // 根据新字段使用实例 ID
    request.InstanceChargeType = "PostPaid" // PostPaid是将包年包月转换为按量付费    PrePaid是将按量付费实例转换为包年包月实例

    response, err := client.ModifyInstanceChargeType(request)
    if err != nil {
        return fmt.Errorf("failed to modify charge type for instance %s: %v", instanceId, err)
    }

    fmt.Printf("Instance %s charge type modified successfully. Request ID: %s\n", instanceId, response.RequestId)
    return nil
}

func main() {
    accessKeyId := os.Getenv("ALIYUN_ACCESS_KEY_ID")
    accessKeySecret := os.Getenv("ALIYUN_ACCESS_KEY_SECRET")
    regionId := "cn-beijing" // 修改为你的地域ID

    client, err := ecs.NewClientWithAccessKey(regionId, accessKeyId, accessKeySecret)
    if err != nil {
        fmt.Println("Failed to create Aliyun client:", err)
        return
    }

    instanceIds := []string{
        "i-xxx",
        "i-xxx",
        // 添加更多实例ID
    }

    for _, instanceId := range instanceIds {
        err := modifyInstanceChargeType(client, instanceId)
        if err != nil {
            fmt.Println("Error:", err)
        }
    }
}
```

