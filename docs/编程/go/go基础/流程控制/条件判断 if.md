# 条件判断 `if`

## 定义方式

格式

:::tip 说明

当 `表达式1` 的结果为 `true` 时，执行 `分支1`，否则判断 `表达式2`，如果满足则执行 `分支2`，都不满足时，则执行 `分支3`，`表达式2` 、`分支2` 、`分支3` 都是可选的，可以根据实际需要进行选择

:::

:::caution 注意

go语言规定与 `if` 匹配的左括号 `{` 必须与 `if` 和表达式放在同一行，如果尝试将 `{`  放在其他位置，将会触发编译报错

同理，与 `else` 匹配的 `{` 也必须与 `else` 在同一行，`else` 也必须与上一个 `if` 或 `else if` 的右边的大括号在一行

:::

```go
if 表达式1 {
  分支1
} else if 表达式2 {
  分支2
} else {
  分支3
}
```



### 基本用法

```go
if 条件 {
    // 当条件为 true 时执行的代码
}
```



### 带 `else` 的用法

```go
if 条件 {
    // 条件为 true 时执行
} else {
    // 条件为 false 时执行
}
```



### `else if` 链

```go
if 条件1 {
    // 条件1为 true 时执行
} else if 条件2 {
    // 条件2为 true 时执行
} else {
    // 上述条件都不满足时执行
}
```





## 使用示例

### 基础用法

```go
package main

import "fmt"

func main() {
	age := 18

	if age >= 18 {
		fmt.Println("成年人") 
	}
}
```



### 带 `else` 的用法

```go
package main

import "fmt"

func main() {
	age := 16

	if age >= 18 {
		fmt.Println("成年人")
	} else {
		fmt.Println("未成年人")
	}
}
```





### `else if` 链

```go
package main

import "fmt"

func main() {
    score := 85

    if score >= 90 {
        fmt.Println("优秀")
    } else if score >= 60 {
        fmt.Println("及格")
    } else {
        fmt.Println("不及格")
    }
}
```



### 特殊写法

`if` 还有一种特殊写法，可以在 `if` 表达式之前添加一个执行语句，再根据变量值进行判断

:::tip 说明

`Connect` 是一个带有返回值的函数，`err := Connect()` 是一个语句，执行 `Connect` 后，将错误保存到 `err` 变量中

`err != nil` 才是 `if` 的判断表达式，当 `err` 不为空是，打印错误并返回

这种写法可以将返回值与判断放在一行进行处理，而且返回值的作用范围被限制在 `if` 、`else` 语句组合中

:::

```go
package main

import "fmt"

// 示例的Connect函数，模拟一个可能返回错误的函数
func Connect() error {
	return fmt.Errorf("connection failed") // 返回一个错误
}

func main() {
	// 尝试连接，如果出现错误，打印错误并退出
	if err := Connect(); err != nil {
		fmt.Println(err)
		return
	}
}
```

输出

```shell
connection failed
```











