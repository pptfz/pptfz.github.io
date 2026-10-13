# harbor配置镜像同步

[harbor配置镜像同步官方文档](https://goharbor.io/docs/2.8.0/administration/configuring-replication/)



## 1.实验环境

| 域名               | IP        | 角色 | harbor版本 |
| ------------------ | --------- | ---- | ---------- |
| harbor.ops.com     | 10.0.0.10 | 主   | 2.8        |
| harbor-bak.ops.com | 10.0.0.11 | 备   | 2.8        |







## 2.配置同步

### 2.1 创建目标仓库

在 `系统管理` -> `仓库管理` -> `新建目标` 新建一个目标仓库

:::tip 说明

如果使用的是自签证书，则需要取消勾选 `验证远程证书` ，否则会报证书错误

:::

![iShot_2023-04-27_15.18.18](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_15.18.18.png)





创建完成后的目标仓库

![iShot_2023-04-27_11.06.47](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_11.06.47.png)



### 2.2 创建同步规则

在 `系统管理` -> `复制管理` -> `新建规则` 配置复制的相关规则



![iShot_2023-04-27_11.19.16](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_11.19.16.png)



创建后的同步规则

![iShot_2023-04-27_14.14.22](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.14.22.png)





`源资源过滤器` 选项配置说明

| 选项 | 子选项              | 说明                                                         |
| ---- | ------------------- | ------------------------------------------------------------ |
| 名称 | 🈚️                   | 过滤资源的名字，不填或者填写 `**` 匹配所有资源<br />`library/**`只匹配 `library` 下的资源 |
| Tag  | 匹配/排除           | 过滤资源的tag/version，不填或者填写 `**` 匹配所有<br />`1.0*` 表示只匹配以 `1.0` 开头的tag/version |
| 标签 | 匹配/排除           | 根据标签筛选资源                                             |
| 资源 | 全部/image/artifact | 过滤资源的类型                                               |



`目标` 选项配置说明

| 选项       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| 名称空间   | 指定目标名称空间。如果不填，资源会被放到和源相同的名称空间下。 |
| 仓库扁平化 | 此项用以在复制镜像时减少仓库的层级结构。假设仓库的层级结构为 `a/b/c/d/img` 且目标名称空间为 `ns`，则每一项对应的结果如下：<br/>替换所有级(v2.3之前版本所使用的行为）: `a/b/c/d/img` -> `ns/img` <br/>无替换：`a/b/c/d/img` -> `ns/a/b/c/d/img`<br/>替换1级(默认项)：`a/b/c/d/img` -> `ns/b/c/d/img`<br/>替换2级：`a/b/c/d/img` -> `ns/c/d/img` <br/>替换3级：`a/b/c/d/img`  -> `ns/d/img` |



`触发模式` 选项配置说明

:::tip 说明

 选择定时的格式如下，为 `秒 分 时 日 月 周`

![iShot_2023-04-27_11.44.28](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_11.44.28.png)



:::



| 选项     | 说明                                               |
| -------- | -------------------------------------------------- |
| 手动     | 手动操作同步                                       |
| 定时     | 定时同步，可以使用cron配置                         |
| 事件驱动 | 只有一个选项，即删除本地资源时同时也删除远程的资源 |



### 2.3 手动运行同步

在 `harbor.ops.com` 中手动创建一个项目 `devops`

![iShot_2023-04-27_14.20.01](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.20.01.png)





然后上传2个镜像

```shell
# 登陆harbor
docker login harbor.ops.com

# 拉取镜像
docker pull centos
docker pull busybox

# 给镜像打tag
docker tag busybox:latest harbor.ops.com/devops/busybox:latest
docker tag centos:latest harbor.ops.com/devops/centos:latest

# 推送镜像到harbor
docker push harbor.ops.com/devops/busybox:latest
docker push harbor.ops.com/devops/centos:latest
```

![iShot_2023-04-27_14.30.18](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.30.18.png)



在 `复制管理` 手动点击 `复制`

![iShot_2023-04-27_14.31.53](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.31.53.png)

确认复制

![iShot_2023-04-27_14.32.28](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.32.28.png)



稍等一会刷新进度就可以看到这次的同步了

![iShot_2023-04-27_14.35.05](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_14.35.05.png)



在 `harbor-bak.ops.com` 中查看，可以看到已经同步过来了

![iShot_2023-04-27_15.10.16](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_15.10.16.png)



### 2.4 配置自动同步

触发模式选择 `自动` ，然后定义 `0 */2 * * * *` 表示每隔2分钟执行一次同步，需要注意的是，harbor中的计划任务多了一个秒，即最开头的0表示秒且无法修改

![iShot_2023-04-27_15.34.52](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_15.34.52.png)



在 `复制任务` 中就可以看到执行的同步历史记录

![iShot_2023-04-27_15.30.36](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2023-04-27_15.30.36.png)





