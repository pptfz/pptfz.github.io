# 从 kubeconfig 中提取指定上下文（Context）并生成独立 kubeconfig 文件

:::tip 背景说明 

在一个合并的 `kubeconfig` 文件中，想要把某一个上下文 `context` 单独获取出来

:::

```shell
kubectl config view \
  --kubeconfig=config \
  --context=aws-us \
  --minify \
  --flatten \
  -o yaml > aws-kubeconfig.yaml
```



参数说明

| 参数                  | 作用                                                       |
| --------------------- | ---------------------------------------------------------- |
| `--kubeconfig=config` | 指定你的原始 config 文件                                   |
| `--context=aws-us`    | 只提取 AWS 对应的上下文配置                                |
| `--minify`            | 仅导出与该 context 相关的 `cluster` 、`user` 、`namespace` |
| `--flatten`           | 把引用的嵌套结构扁平化，方便使用                           |
| `-o yaml`             | 输出成标准 kubeconfig 格式                                 |



提取后的 `aws-kubeconfig.yaml` 包括以下几部分（都只针对 `aws-us` context）：

- `clusters`：只保留了 `aws-uswest2-prod` 这个集群的连接信息（如 server 地址、`certificate-authority` 等）

- `users`：只保留了 `aws-us-west-2-763683855564` 这个用户的认证信息（`token`、`cert` / `key` 、`exec` 等）

- `contexts`：只保留了 `aws-us` 这个 `context`（绑定了 `cluster` 和 `user`）

- `current-context`：自动设置为 `aws-us`