# go初学者基本知识

## 安装

:::tip 说明

可以在 [go官网](https://go.dev/) 下载相应的安装包，这里以M芯片的mac示例

:::



### 下载安装包

```shell
wget https://go.dev/dl/go1.22.3.darwin-arm64.pkg
```



### 安装

mac安装比较简单，点击继续等下一步即可

![iShot_2024-05-15_20.41.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/iShot_2024-05-15_20.41.13.png)



### 查看安装

```shell
$ go version
go version go1.22.2 darwin/arm64
```







```
mkdir go-project
cd go-project/
go mod init go-project
go: creating new go.mod: module go-project

ls
go.mod

cat go.mod 
module go-project

go 1.22.3
```





配置go下载加速

```
go env -w GOPROXY=https://goproxy.cn,direct
```





