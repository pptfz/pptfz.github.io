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

![iShot_2024-05-15_20.41.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-05-15_20.41.13.png)



### 查看安装

```shell
$ go version
go version go1.22.2 darwin/arm64
```



## 配置代理

### 临时设置

```shell
go env -w GOPROXY=https://goproxy.cn,direct
```



### 永久设置

可以根据自身环境选择配置在 `~/.zshrc` 或 ` ~/.bashrc` 中

```sh
export GOPROXY=https://goproxy.cn,direct
```



### 查看配置

```shell
$ go env | grep GOPROXY
GOPROXY='https://goproxy.cn,direct'
```





## 初始化项目

### 创建目录

```shell
mkdir go-project
cd go-project 
```



### 初始化模块

:::tip 说明

在 `go mod init` 命令中指定的模块名称是可以随意的。它通常是你的项目名称或项目所在的仓库路径，但具体名称并没有严格的限制。

模块名称的选择

- 本地项目

  如果你的项目是一个本地项目，没有计划发布到公共代码仓库，可以使用任何名称

  ```go
  go mod init my-go-project
  ```

- 发布到公共仓库

  如果你计划将你的项目发布到 GitHub、GitLab 或其他公共代码仓库，建议使用仓库的完整路径作为模块名称。例如，如果你的项目将托管在 GitHub 上的 `https://github.com/username/my-go-project`，你可以这样初始化模块

  ```go
  go mod init github.com/username/my-go-project
  ```

  这样做的好处是，当其他人使用 `go get` 下载你的项目时，Go 会知道从哪里获取代码，并正确解析依赖关系。

:::

```shell
$ go mod init go-project
go: creating new go.mod: module go-project
```



执行完 ``go mod init go-project` 命令后会生成 `go.mod` ，`go.mod` 文件内容如下

```shell
$ cat go.mod
module go-project

go 1.22.2
```



### 下载依赖包

这里有一个示例代码，用于创建一个简单的http服务器，其中 `fmt` 和 `net/http` 都是内置包，`github.com/sirupsen/logrus` 是第三方包

```go
cat > main.go << EOF
package main

import (
    "fmt"
    "github.com/sirupsen/logrus"
    "net/http"
)

var log = logrus.New()

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
    log.Info("Handled a request")
}

func main() {
    http.HandleFunc("/", helloHandler)
    log.Info("Starting server on :8080")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}
EOF
```



运行 `go mod tidy` 可以将代码中需要的第三方以来包下载下来

:::tip 说明

`go mod tidy` 作用有以下

- **移除未使用的依赖**：如果在项目开发过程中删除了某些代码，导致一些依赖不再被使用，`go mod tidy` 会从 `go.mod` 文件中移除这些未使用的依赖。
- **添加遗漏的依赖**：如果某些依赖被直接使用，但未在 `go.mod` 中明确列出，`go mod tidy` 会自动添加它们。
- **更新 `go.sum` 文件**：`go.sum` 文件包含了所有模块的校验和信息，用于确保模块的完整性和安全性。`go mod tidy` 会更新 `go.sum` 文件，确保它是最新的，并且与 `go.mod` 文件一致。

:::

```go
$ go mod tidy
go: finding module for package github.com/sirupsen/logrus
go: found github.com/sirupsen/logrus in github.com/sirupsen/logrus v1.9.3
```



运行  `go mod tidy` 后会自动生成  `go.sum`文件，`go.sum` 文件内容如下

```shell
$ cat go.sum
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/davecgh/go-spew v1.1.1 h1:vj9j/u1bqnvCEfJOwUhtlOARqs3+rkHYY13jYWTU97c=
github.com/davecgh/go-spew v1.1.1/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/pmezard/go-difflib v1.0.0 h1:4DBwDE0NGyQoBHbLQYPwSUPoCMWR5BEzIk/f1lZbAQM=
github.com/pmezard/go-difflib v1.0.0/go.mod h1:iKH77koFhYxTK1pcRnkKkqfTogsbg7gZNVY4sRDYZ/4=
github.com/sirupsen/logrus v1.9.3 h1:dueUQJ1C2q9oE3F7wvmSGAaVtTmUizReu6fjN8uqzbQ=
github.com/sirupsen/logrus v1.9.3/go.mod h1:naHLuLoDiP4jHNo9R0sCBMtWGeIprob74mVsIT4qYEQ=
github.com/stretchr/objx v0.1.0/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/testify v1.7.0 h1:nwc3DEeHmmLAfoZucVR881uASk0Mfjw8xYJ99tb5CcY=
github.com/stretchr/testify v1.7.0/go.mod h1:6Fq8oRcR53rry900zMqJjRRixrwX3KX962/h/Wwjteg=
golang.org/x/sys v0.0.0-20220715151400-c0bba94af5f8 h1:0A+M6Uqn+Eje4kHMK80dtF3JCXC4ykBgQG4Fe06QRhQ=
golang.org/x/sys v0.0.0-20220715151400-c0bba94af5f8/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c h1:dUUwHk2QECo/6vqA44rthZ8ie2QXMNeKRTHCNY2nXvo=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
```



运行代码

```go
$ go run main.go 
INFO[0000] Starting server on :8080   
```



访问本机 `8080` 端口

```shell
$ curl 127.0.0.1:8080
Hello, World!
```



### 下载的包存放路径

通过 `go get` 下载的依赖包存放于 `GOPATH` 中，可以通过 `go env GOPATH` 查看，默认为 `~/go` 

```shell
$ go env GOPATH
/Users/pptfz/go
```







