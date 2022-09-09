# 第一个go程序



使用go输出 `hello world`

```go live
package main

import (
	"fmt"
)

func main() {
	fmt.Println("hello world !")
}
```



使用 `go run` 运行

```shell
$ go run hello.go
hello world !
```



还可以使用 `go build` 生成go二进制文件

```shell
$ go build hello.go 
$ ./hello 
hello world !
```



