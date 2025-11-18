[toc]



# helm3安装

[helm官网](https://helm.sh/)

[helm github地址](https://github.com/helm/helm)



## 1.helm3简介

helm3相较于helm2的变化

1、最明显的变化是 `Tiller`的删除!

2、Release 不再是全局资源，而是存储在各自命名空间内

3、Values 支持 JSON Schema校验器，自动检查所有输入的变量格式

4、移除了用于本地临时搭建 Chart Repository 的 helm serve 命令

5、helm install 不再默认生成一个 Release 的名称，除非指定了 --generate-name

6、Helm CLI 个别更名

- helm delete更名为 helm uninstall

- helm inspect更名为 helm show

- helm fetch更名为 helm pull





## 2.下载helm3

[helm github下载地址](https://github.com/helm/helm/releases)



```shell
export HELM_VERSION=3.2.4
wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz
tar xf helm-v{HELM_VERSION}-linux-amd64.tar.gz
mv linux-amd64/helm /usr/local/bin
```



**验证版本**

```shell
$ helm version
version.BuildInfo{Version:"v3.2.4", GitCommit:"0ad800ef43d3b826f31a5ad8dfbb4fe05d143688", GitTreeState:"clean", GoVersion:"go1.13.12"}
```









