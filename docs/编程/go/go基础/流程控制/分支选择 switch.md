# 分支选择 `switch`

## 说明

:::tip 说明

分支选择可以理解为一种批量的 `if` 语句，使用 `switch` 语句可以方便的对大量的值进行判断，go语言的 `switch` 不仅可以基于常量进行判断，还可以基于表达式进行判断

:::



## 定义方式

```go
switch 表达式 {
case 值1:
    // 执行语句
case 值2:
    // 执行语句
default:
    // 默认执行语句
}
```





## 使用示例

### 基本写法

```go
package main

import "fmt"

func main() {
	var a = "hello"

	switch a {
	case "hello":
		println(1)
	case "word":
		println(2)
	default:
		fmt.Println(0)
	}
}
```

输出

```shell
1
```



### 一分支多值

```go
package main

import "fmt"

func main() {
	day := "Saturday"

	switch day {
	case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
		fmt.Println("It's a weekday.")
	case "Saturday", "Sunday":
		fmt.Println("It's a weekend.")
	default:
		fmt.Println("Not a valid day.")
	}
}
```

输出

```shell
It's a weekend.
```



### 分支表达式

:::tip 说明

`case` 后不仅仅只是常量，还可以和 `if` 一样添加表达式

这种情况下，`switch` 后面不再跟判断变量，没有判断的目标

:::

```go
package main

import "fmt"

func main() {
	var num int = 11

	switch {
	case num > 10 && num < 20:
		fmt.Println(num) // 输出 11
	}
}
```



### `fallthrough` 关键字

:::tip 说明

`case` 分支默认是不会自动执行下一个分支的，如果希望执行当前分支后继续执行下一个分支的代码，可以使用关键字 `fallthrough`

:::

:::caution 注意

`fallthrough` 会直接执行下一个 `case` 的代码块，而不会检查其条件是否为 `true`

`fallthrough` 必须在 `case` 分支中使用，不能出现在其他地方

:::

```go
package main

import "fmt"

func main() {
	var num int = 1

	switch num {
	case 1:
		fmt.Println("Case 1")
		fallthrough // 继续执行下一个 case 的代码
	case 2:
		fmt.Println("Case 2")
		fallthrough // 再次执行下一个 case 的代码
	case 3:
		fmt.Println("Case 3")
	default:
		fmt.Println("Default case")
	}
}
```

输出

```shell
Case 1
Case 2
Case 3
```



