# shell脚本获取k8s集群资源配置信息

:::tip 说明

[yq github地址](https://github.com/mikefarah/yq)

[yq官方网站](https://mikefarah.gitbook.io/yq)

yq是一个可以处理 `yaml` 、 `json` 、  `xml` 、  `csv` 、   `toml` 的命令行工具

:::



脚本内容如下

```shell
#!/bin/bash

# 打印表头
echo -e "ServiceName\tRequestCPU\tRequestMemory\tLimitCPU\tLimitMemory"

# 获取所有 cd 资源的名称
for cd in $(kubectl get cd -o custom-columns=NAME:.metadata.name --no-headers); do
    # 获取当前 cd 资源的 YAML 并提取相关信息
    kubectl get cd $cd -o yaml | yq eval -o=json - | jq -r '
    .spec.template.spec.containers[] | 
    [
        "'$cd'",
        .resources.requests.cpu // "N/A",
        .resources.requests.memory // "N/A",
        .resources.limits.cpu // "N/A",
        .resources.limits.memory // "N/A"
    ] | @tsv'
done
```



输出效果如下

```bash
ServiceName	RequestCPU	RequestMemory	LimitCPU	LimitMemory
activity-manager.pre.ali.ratel-pod-deploy	250m	2Gi	2	2Gi
activity-server.pre.ali.ratel-pod-deploy	250m	2Gi	2	2Gi
```

