# nightingale安装

[nightingale github](https://github.com/ccfos/nightingale)

[nightingale官网](https://n9e.github.io/)

[nightingale helm github仓库](https://github.com/flashcatcloud/n9e-helm)





## 安装

更多安装方式请参考 [官方文档](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/install/intro/) ，这里我们选择 [helm](https://github.com/flashcatcloud/n9e-helm) 安装



获取repo

```sh
git clone https://github.com/flashcatcloud/n9e-helm.git
```



安装

:::tip 说明

可自行修改 `values.yaml` 中的配置项

如果集群的容器运行时不是docker(例如是containerd或其他)，则需要把 `categraf` 配置项下的 `docker_socket: unix:///var/run/docker.sock` 注释掉

:::

```shell
helm upgrade --install n9e -n monitor --create-namespace .
```





## 访问

默认用户名是 `root` ，密码是 `root.2020`

![iShot_2025-04-16_16.04.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-16_16.04.12.png)



登录后首页面

![iShot_2025-04-16_16.05.03](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-04-16_16.05.03.png)

















