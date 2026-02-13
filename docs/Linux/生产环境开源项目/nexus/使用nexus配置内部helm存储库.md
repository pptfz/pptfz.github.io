# 使用nexus配置内部helm存储库





## 注意事项

从 3.71.0 版本开始，Helm chart **只能上传到根仓库**，不能上传到仓库里的子目录或子仓库。

[官方文档说明](https://help.sonatype.com/en/helm-repositories.html)

![iShot_2026-02-13_10.21.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-13_10.21.42.png)



![20260213103254_91_92](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/20260213103254_91_92.png)





点击左上角 `Settings`

![iShot_2026-02-11_18.58.03](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_18.58.03.png)





点击 `Repositories` 

![iShot_2026-02-11_19.03.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_19.03.21.png)



点击 `Create repository`

![iShot_2026-02-11_19.05.16](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_19.05.16.png)



选择 `helm（hosted）`

![iShot_2026-02-11_19.07.05](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_19.07.05.png)



配置仓库相关信息

:::tip 相关配置项说明

- **Name** : 仓库名称，唯一标识，例如 `my-helm`，后续 `helm repo add` 时会用到该仓库路径
- **Online** : 仓库是否启用
  - 勾选 : 仓库可访问、可上传下载
  - 不勾选 : 仓库离线，不接受请求
- **Blob store** : 存储位置，指定该仓库存储文件所在的 blob 存储，一般使用 `default` 即可，除非你有多存储策略
- **Strict Content Type Validation** : 严格内容类型校验
  - 勾选：只允许符合 Helm 包 MIME 类型的文件上传
  - 不勾选：允许任何文件上传
- **Deployment policy** : 部署策略（是否允许覆盖上传）
  - `Allow redeploy` : 允许覆盖上传同版本 chart
  - `Disable redeploy` : 不允许覆盖（推荐）
  - `Read-only` : 只读
- **Proprietary Components** : 标记为私有组件，需要 Sonatype Nexus 防火墙
- **Cleanup Policies** : 清理策略，符合任何已应用策略的组件都将被删除

:::

![iShot_2026-02-11_19.09.16](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_19.09.16.png)



![iShot_2026-02-11_19.34.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-02-11_19.34.18.png)







## 添加仓库

```shell
helm repo add nexus-helm \
  https://nexus.pptfz.cn/repository/nexus-helm \
  --username admin \
  --password 'kdlkblk!1'
```





## 安装 [Helm Push plugin](https://github.com/chartmuseum/helm-push)

```shell
helm plugin install https://github.com/chartmuseum/helm-push
```







### 生成chart

```shell
helm create demo1
```



### 打包chart

```shell
helm package demo1
```



### 推送chart

:::tip 说明

推送语法为 `helm push <chart_name_and_version>.tgz oci://<harbor_address>/<project>`

:::

```shell
helm push oci-chart-example-0.1.0.tgz oci://harbor.pptfz.cn/oci-charts
```





```sh
curl -u admin:admin \
  --upload-file kong-3.0.0.tgz \
  http://nexus.ops.com/repository/my-helm/kong-3.0.0.tgz
```



### 拉取chart

:::tip 说明

拉取语法为 `helm pull oci://<harbor_address>/<project>/<chart_name> --version <version>`

::;

```shell
helm pull oci://harbor.pptfz.cn/oci-charts/demo1 --version 0.1.0
```









