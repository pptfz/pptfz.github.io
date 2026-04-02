# rustfs安装

[rustfs github](https://github.com/rustfs/rustfs)

[rustfs官网](https://rustfs.com.cn/)





## 安装

### docker安装







### helm安装

更多安装说明参考 [官方文档](https://docs.rustfs.com.cn/installation/cloud-native/)

#### 添加仓库

```shell
helm repo add rustfs https://charts.rustfs.com
```



#### 下载包

```shell
helm pull rustfs/rustfs
```



#### 解压缩

```
tar xf rustfs-0.0.86.tgz 
```



#### 编辑 `values.yaml`

:::caution 注意

当node节点数为4时，`config.rustfs.volumes`  必须这么配置

```yaml
volumes: "/data/rustfs0,/data/rustfs1,/data/rustfs2,/data/rustfs3"
```



当集群节点数小于4时，可以采取 `standalone` 模式，并关闭 `distributed` 模式(默认开启)

```shell
mode:
  standalone:
    enabled: true
  distributed:
    enabled: false
```

:::



#### 安装

```shell
helm upgrade --install rustfs -n rustfs --create-namespace .
```



#### 访问

用户名密码均为 `rustfsadmin`

![iShot_2026-03-18_17.38.42](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-18_17.38.42.png)



登陆后首页

![iShot_2026-03-18_17.40.01](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-18_17.40.01.png)



