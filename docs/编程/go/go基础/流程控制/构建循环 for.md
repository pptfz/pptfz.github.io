# 构建循环 `for`

## 定义方式

:::tip 说明

循环体不停的进行循环，直到条件表达式返回 `false` 时自动退出循环，执行 `for` 的 `}` 之后的语句

`for` 循环可以通过 `break` 、`goto` 、`return` 、`panic` 语句强制退出循环

:::

```go
for 初始语句; 条件表达式; 结束语句 {
  循环体代码
}
```



## 使用示例

### `for` 中的初始语句 - 开始循环时执行的语句

:::tip 说明

初始语句是在第一次循环前执行的语句，一般使用初始语句执行变量初始化，如果变量在此处被声明，其作用域将被局限在这个 `for` 的范畴内

:::

`setp` 放在 `for` 循环的前面进行初始化，此时 `setp` 的作用域是整个 `main` 函数，比在初始语句中声明的 `setp` 作用域要大

```go
package main

import "fmt"

func main() {
	setp := 3
	for ; setp > 0; setp-- {
		fmt.Println(setp)
	}
}
```



`setp` 放在 `for` 循环内部，此时 `setp` 的作用域仅限于 `for` 循环内部

```go
package main

import "fmt"

func main() {
	for setp := 3; setp > 0; setp-- {
		fmt.Println(setp)
	}
}
```

输出

```shell
3
2
1
```



### `for` 中的条件表达式 - 控制是否循环的开关

#### 结束循环时带可执行语句的无限循环

:::tip 说明

`for ; ; i++{}` 是一个典型的无限循环，初始化部分为空，条件部分为空则表示条件恒为 `true` ，形成无限循环

:::

```go
package main

import "fmt"

func main() {
	var i int

	for ; ; i++ {
		fmt.Println(i)
		if i > 10 {
			break
		}
	}
}
```

输出

```shell
0
1
2
3
4
5
6
7
8
9
10
11
```



#### 无限循环

:::tip 说明

`i` 的值始终是0，在循环内没有修改 `i` 的值，所以条件 `i > 10` 永远不会成立

:::

```go
package main

func main() {
	var i int

	for {
		if i > 10 {
			break
		}
	}

	i++
}
```

输出

```shell
死循环，无输出，程序会一直执行
```



#### 只有一个循环条件的循环

```go
package main

func main() {
	var i int

	for i <= 10 {
		i++
		println(i)
	}
}
```

输出

```shell
1
2
3
4
5
6
7
8
9
10
11
```



### `for` 中的结束语句 - 每次循环结束时执行的语句



```go
package main

import "fmt"

func main() {
	// 遍历，决定处理第几行
	for y := 1; y <= 9; y++ {

		// 遍历，决定这一行有多少列
		for x := 1; x <= y; x++ {
			
			// 使用%2d来确保每个数字占2个字符位置，保持对齐
			fmt.Printf("%d*%d=%2d ", x, y, x*y)
		}

		// 手动生成回车
		fmt.Println()
	}
}
```

输出

```shell
1*1= 1 
1*2= 2 2*2= 4 
1*3= 3 2*3= 6 3*3= 9 
1*4= 4 2*4= 8 3*4=12 4*4=16 
1*5= 5 2*5=10 3*5=15 4*5=20 5*5=25 
1*6= 6 2*6=12 3*6=18 4*6=24 5*6=30 6*6=36 
1*7= 7 2*7=14 3*7=21 4*7=28 5*7=35 6*7=42 7*7=49 
1*8= 8 2*8=16 3*8=24 4*8=32 5*8=40 6*8=48 7*8=56 8*8=64 
1*9= 9 2*9=18 3*9=27 4*9=36 5*9=45 6*9=54 7*9=63 8*9=72 9*9=81
```



更详细的说明

```go
package main

import "fmt"

func main() {
	// 第一个部分：九九乘法表
	for y := 1; y <= 9; y++ {
		// 遍历，决定这一行有多少列
		for x := 1; x <= y; x++ {
			// 使用%2d来确保每个数字占2个字符位置，保持对齐
			fmt.Printf("%d*%d=%2d ", x, y, x*y)
		}
		// 手动生成回车
		fmt.Println()
	}

	// 第二个部分：外循环和内循环的调试信息
	for i := 1; i <= 9; i++ {
		fmt.Printf("外循环开始: i = %d, 判断条件 %d <= 9 -> true\n", i, i)

		// 遍历，决定这一行有多少列
		for x := 1; x <= i; x++ {
			fmt.Printf("  内循环开始: x = %d, 判断条件 %d <= %d -> true\n", x, x, i)
			fmt.Printf("  计算: %d * %d = %d\n", x, i, x*i)
			fmt.Printf("  打印: %d*%d=%d\n", x, i, x*i)
			fmt.Printf("  内循环结束: x = %d, 增加 x++\n", x)
		}

		// 内循环完成后，准备换行
		fmt.Printf("外循环结束: i = %d, 增加 i++\n\n", i)
	}

	// 循环完全结束
	fmt.Println("循环结束")
}
```



输出

```shell
1*1= 1 
1*2= 2 2*2= 4 
1*3= 3 2*3= 6 3*3= 9 
1*4= 4 2*4= 8 3*4=12 4*4=16 
1*5= 5 2*5=10 3*5=15 4*5=20 5*5=25 
1*6= 6 2*6=12 3*6=18 4*6=24 5*6=30 6*6=36 
1*7= 7 2*7=14 3*7=21 4*7=28 5*7=35 6*7=42 7*7=49 
1*8= 8 2*8=16 3*8=24 4*8=32 5*8=40 6*8=48 7*8=56 8*8=64 
1*9= 9 2*9=18 3*9=27 4*9=36 5*9=45 6*9=54 7*9=63 8*9=72 9*9=81 
外循环开始: i = 1, 判断条件 1 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 1 -> true
  计算: 1 * 1 = 1
  打印: 1*1=1
  内循环结束: x = 1, 增加 x++
外循环结束: i = 1, 增加 i++

外循环开始: i = 2, 判断条件 2 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 2 -> true
  计算: 1 * 2 = 2
  打印: 1*2=2
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 2 -> true
  计算: 2 * 2 = 4
  打印: 2*2=4
  内循环结束: x = 2, 增加 x++
外循环结束: i = 2, 增加 i++

外循环开始: i = 3, 判断条件 3 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 3 -> true
  计算: 1 * 3 = 3
  打印: 1*3=3
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 3 -> true
  计算: 2 * 3 = 6
  打印: 2*3=6
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 3 -> true
  计算: 3 * 3 = 9
  打印: 3*3=9
  内循环结束: x = 3, 增加 x++
外循环结束: i = 3, 增加 i++

外循环开始: i = 4, 判断条件 4 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 4 -> true
  计算: 1 * 4 = 4
  打印: 1*4=4
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 4 -> true
  计算: 2 * 4 = 8
  打印: 2*4=8
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 4 -> true
  计算: 3 * 4 = 12
  打印: 3*4=12
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 4 -> true
  计算: 4 * 4 = 16
  打印: 4*4=16
  内循环结束: x = 4, 增加 x++
外循环结束: i = 4, 增加 i++

外循环开始: i = 5, 判断条件 5 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 5 -> true
  计算: 1 * 5 = 5
  打印: 1*5=5
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 5 -> true
  计算: 2 * 5 = 10
  打印: 2*5=10
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 5 -> true
  计算: 3 * 5 = 15
  打印: 3*5=15
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 5 -> true
  计算: 4 * 5 = 20
  打印: 4*5=20
  内循环结束: x = 4, 增加 x++
  内循环开始: x = 5, 判断条件 5 <= 5 -> true
  计算: 5 * 5 = 25
  打印: 5*5=25
  内循环结束: x = 5, 增加 x++
外循环结束: i = 5, 增加 i++

外循环开始: i = 6, 判断条件 6 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 6 -> true
  计算: 1 * 6 = 6
  打印: 1*6=6
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 6 -> true
  计算: 2 * 6 = 12
  打印: 2*6=12
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 6 -> true
  计算: 3 * 6 = 18
  打印: 3*6=18
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 6 -> true
  计算: 4 * 6 = 24
  打印: 4*6=24
  内循环结束: x = 4, 增加 x++
  内循环开始: x = 5, 判断条件 5 <= 6 -> true
  计算: 5 * 6 = 30
  打印: 5*6=30
  内循环结束: x = 5, 增加 x++
  内循环开始: x = 6, 判断条件 6 <= 6 -> true
  计算: 6 * 6 = 36
  打印: 6*6=36
  内循环结束: x = 6, 增加 x++
外循环结束: i = 6, 增加 i++

外循环开始: i = 7, 判断条件 7 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 7 -> true
  计算: 1 * 7 = 7
  打印: 1*7=7
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 7 -> true
  计算: 2 * 7 = 14
  打印: 2*7=14
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 7 -> true
  计算: 3 * 7 = 21
  打印: 3*7=21
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 7 -> true
  计算: 4 * 7 = 28
  打印: 4*7=28
  内循环结束: x = 4, 增加 x++
  内循环开始: x = 5, 判断条件 5 <= 7 -> true
  计算: 5 * 7 = 35
  打印: 5*7=35
  内循环结束: x = 5, 增加 x++
  内循环开始: x = 6, 判断条件 6 <= 7 -> true
  计算: 6 * 7 = 42
  打印: 6*7=42
  内循环结束: x = 6, 增加 x++
  内循环开始: x = 7, 判断条件 7 <= 7 -> true
  计算: 7 * 7 = 49
  打印: 7*7=49
  内循环结束: x = 7, 增加 x++
外循环结束: i = 7, 增加 i++

外循环开始: i = 8, 判断条件 8 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 8 -> true
  计算: 1 * 8 = 8
  打印: 1*8=8
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 8 -> true
  计算: 2 * 8 = 16
  打印: 2*8=16
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 8 -> true
  计算: 3 * 8 = 24
  打印: 3*8=24
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 8 -> true
  计算: 4 * 8 = 32
  打印: 4*8=32
  内循环结束: x = 4, 增加 x++
  内循环开始: x = 5, 判断条件 5 <= 8 -> true
  计算: 5 * 8 = 40
  打印: 5*8=40
  内循环结束: x = 5, 增加 x++
  内循环开始: x = 6, 判断条件 6 <= 8 -> true
  计算: 6 * 8 = 48
  打印: 6*8=48
  内循环结束: x = 6, 增加 x++
  内循环开始: x = 7, 判断条件 7 <= 8 -> true
  计算: 7 * 8 = 56
  打印: 7*8=56
  内循环结束: x = 7, 增加 x++
  内循环开始: x = 8, 判断条件 8 <= 8 -> true
  计算: 8 * 8 = 64
  打印: 8*8=64
  内循环结束: x = 8, 增加 x++
外循环结束: i = 8, 增加 i++

外循环开始: i = 9, 判断条件 9 <= 9 -> true
  内循环开始: x = 1, 判断条件 1 <= 9 -> true
  计算: 1 * 9 = 9
  打印: 1*9=9
  内循环结束: x = 1, 增加 x++
  内循环开始: x = 2, 判断条件 2 <= 9 -> true
  计算: 2 * 9 = 18
  打印: 2*9=18
  内循环结束: x = 2, 增加 x++
  内循环开始: x = 3, 判断条件 3 <= 9 -> true
  计算: 3 * 9 = 27
  打印: 3*9=27
  内循环结束: x = 3, 增加 x++
  内循环开始: x = 4, 判断条件 4 <= 9 -> true
  计算: 4 * 9 = 36
  打印: 4*9=36
  内循环结束: x = 4, 增加 x++
  内循环开始: x = 5, 判断条件 5 <= 9 -> true
  计算: 5 * 9 = 45
  打印: 5*9=45
  内循环结束: x = 5, 增加 x++
  内循环开始: x = 6, 判断条件 6 <= 9 -> true
  计算: 6 * 9 = 54
  打印: 6*9=54
  内循环结束: x = 6, 增加 x++
  内循环开始: x = 7, 判断条件 7 <= 9 -> true
  计算: 7 * 9 = 63
  打印: 7*9=63
  内循环结束: x = 7, 增加 x++
  内循环开始: x = 8, 判断条件 8 <= 9 -> true
  计算: 8 * 9 = 72
  打印: 8*9=72
  内循环结束: x = 8, 增加 x++
  内循环开始: x = 9, 判断条件 9 <= 9 -> true
  计算: 9 * 9 = 81
  打印: 9*9=81
  内循环结束: x = 9, 增加 x++
外循环结束: i = 9, 增加 i++

循环结束
```



### 键值循环 - `for range` 直接获得对象的索引和数据

go语言可以使用 `for range` 遍历数组、切片、字符串、map、channel，通过 `for range` 遍历的返回值有一定的规律

- 数组、切片、字符串返回索引和值
- map返回键和值
- channel只返回通道内的值



#### 遍历数组、切片 - 获得索引和元素

:::tip 说明

遍历数组、切片，`key` 和 `value` 分别代表**切片的下标**及**下标对应的值**

:::

```go
package main

import "fmt"

func main() {
	for key, value := range []int{1, 2, 3, 4, 5} {
		fmt.Printf("key:%d value:%d\n", key, value)
	}
}
```

输出

```shell
key:0 value:1
key:1 value:2
key:2 value:3
key:3 value:4
key:4 value:5
```



#### 遍历字符串 - 获得字符

:::tip 说明

遍历字符串，`key` 和 `value` 分别代表**字符串的索引**和**字符串中的每一个字符**

:::

```go
package main

import "fmt"

func main() {
	var str = "我尼玛，爱嫂子啊？"
	for key, value := range str {
		fmt.Printf("key:%d	value:0x%x\n", key, value)
	}
}
```

输出

:::tip 说明

`key` 表示当前字符的字节偏移位置，`value` 是字符的 Unicode 编码（十六进制）

`0x%x` 格式化字符串是用来以十六进制的形式显示 Unicode 字符

:::

```shell
key:0   value:0x6211
key:3   value:0x5c3c
key:6   value:0x739b
key:9   value:0xff0c
key:12  value:0x7231
key:15  value:0x5ac2
key:18  value:0x5b50
key:21  value:0x554a
key:24  value:0xff1f
```



如果想要输出每个字符，而不是字节索引，可以直接遍历字符串中的每个字符

:::tip 说明

`value` 在这里是每个字符的 Unicode 编码（`rune` 类型）

`%c` 用来打印 Unicode 字符本身

:::

```go
package main

import "fmt"

func main() {
	var str = "我尼玛，爱嫂子啊？"
	for _, value := range str {
		fmt.Printf("%c\n", value)
	}
}
```

输出

```shell
我
尼
玛
，
爱
嫂
子
啊
？
```



#### 遍历 `map` - 获得  `map` 的键和值

:::tip 说明

遍历 `map` ，`key` 和 `value` 分别代表 `map的索引键key` 和 `索引对应的值`

:::

```go
package main

import "fmt"

func main() {
	m := map[string]int{
		"a": 1,
		"b": 2,
	}

	for key, value := range m {
		fmt.Println(key, value)
	}
}
```

输出

:::caution 注意

对 `map` 遍历时，遍历输出的键值是无需的，如果需要有序的键值对输出，需要对结果进行排序

:::

```shell
a 1
b 2
```



### 跳转到指定代码标签 - `goto`

#### 使用 `goto` 退出多层循环

普通写法

:::tip 说明

这个程序通过双重 `for` 循环实现了在满足特定条件时跳出两个嵌套循环的功能，核心逻辑如下：

- 使用布尔变量 `breakAgain` 作为标记，用于指示是否需要在外循环中断

- 当 `y == 2` 时，设置 `breakAgain = true`，并通过 `break` 跳出内循环

- 内循环结束后，检查 `breakAgain` 的值。如果为 `true`，则通过外循环中的 `break` 跳出外循环

- 最后输出 `"done"`

程序运行逻辑

- 外循环从 `x = 0` 开始，循环条件是 `x < 10`
- 内循环从 `y = 0` 开始，循环条件是 `y < 10`
- 当 `y == 2` 时，设置标记 `breakAgain = true`，并通过 `break` 跳出内循环
- 外循环检查 `breakAgain`，如果为 `true`，外循环也中断

:::

```go
package main

import "fmt"

func main() {
	var breakAgain bool

	// 外循环
	for x := 0; x < 10; x++ {

		// 内循环
		for y := 0; y < 10; y++ {

			// 当满足某个条件时，退出循环
			if y == 2 {

				// 设置退出标记
				breakAgain = true

				// 退出本次循环
				break
			}
		}

		// 根据标记，还需要退出一次循环
		if breakAgain {
			break
		}
	}
	fmt.Println("done") // 输出 done
}
```

使用 `goto`

:::tip 说明

**外层循环和内层循环**：

- 外层循环：`for x := 0; x < 10; x++`
- 内层循环：`for y := 0; y < 10; y++`

**条件判断**：

- 当内层循环满足 `y == 2` 时，直接使用 `goto breakHere` 跳转到标签 `breakHere`。

**手动返回**：

- 在外循环之后加上 `return`，防止程序在跳转到标签前继续执行无关代码。

**标签**：

- `breakHere` 是一个标签，执行到此标签时会打印 `"done"`

:::

```go
package main

import "fmt"

func main() {
	for x := 0; x < 10; x++ {

		for y := 0; y < 10; y++ {

			if y == 2 {
				// 跳转到标签
				goto breakHere
			}
		}
	}

	// 手动返回，避免执行进入标签
	return

	// 标签，标签一般推荐写在行首
breakHere:
	fmt.Println("done") // 输出 done
}
```

使用 `goto` 的注意事项

1. **优点**：
   - 代码简洁，逻辑清晰
   - 避免了通过布尔标记变量来控制循环退出的复杂性
2. **缺点**：
   - `goto` 的使用在复杂代码中可能导致程序流程难以跟踪，影响可读性
   - 在团队协作中，使用 `goto` 通常需要明确说明逻辑，避免误解
3. **最佳实践**：
   - `goto` 应仅在跳出嵌套循环、资源清理等简单场景下使用
   - 如果逻辑复杂，可以考虑用函数封装或使用标签 `break` 来替代

##### 替代实现(推荐)

对于这种跳出多层循环的需求，Go 提供了标签 `break` 的方式，更加语义化

```go
package main

import "fmt"

func main() {
	// 外层循环的标签
OuterLoop:
	for x := 0; x < 10; x++ {

		for y := 0; y < 10; y++ {

			if y == 2 {
				// 使用标签退出外层循环
				break OuterLoop
			}
		}
	}
	fmt.Println("done") // 输出 done
}
```



#### 使用 `goto` 集中处理错误

在如下代码示例中，是存在一些重复的错误处理代码，后续在这些代码中如果添加更多的判断，则需要在每一个雷同代码中依次修改，极易造成疏忽和错误

```go
err := firstcheckError()
if err != nil {
  fmt.Println(err)
  exitProcess()
  return
}

err = secondcheckError()
if err != nil {
  fmt.Println(err)
  exitProcess()
  return
}

fmt.Println("done")
```



改用 `goto` 语句来处理

```go
	err := firstcheckError()
	if err != nil {
		goto onExit
	}

	err = secondcheckError()
	if err != nil {
		goto onExit
	}

	fmt.Println("done")

	return

onExit:
	fmt.Println(err)
	exitProcess()
```



### 跳出指定循环（break）- 可以跳出多层循环

:::tip 说明

`break` 语句可以结束 `for` 、`switch` 、`select` 的代码块，`break` 语句还可以在语句后面添加标签，表示退出某个标签对应的代码块，标签要求必须定义在对应的`for` 、`switch` 、`select` 的代码块上

:::

```go
package main

import "fmt"

func main() {
OuterLoop:
	for i := 0; i < 2; i++ {
		for j := 0; j < 5; j++ {
			fmt.Printf("i: %d, j: %d\n", i, j) // 调试输出
			switch j {
			case 2:
				fmt.Println("Breaking at case 2")
				break OuterLoop
			case 3:
				fmt.Println("Breaking at case 3")
				break OuterLoop
			}
		}
	}
	fmt.Println("Loop exited")
}
```

输出

```shell
i: 0, j: 0
i: 0, j: 1
i: 0, j: 2
Breaking at case 2
Loop exited
```



### 继续下一次循环 - `continue`

:::tip 说明

`continue` 语句可以结束当前循环，开始下一次的循环迭代过程，仅限在 `for` 循环内使用，在 `continue` 语句后添加标签时，表示开始标签对应的循环

:::

```go
package main

import "fmt"

func main() {

OuterLoop:
	for i := 0; i < 2; i++ {
		for j := 0; j < 5; j++ {
			fmt.Printf("i: %d, j: %d\n", i, j) // 调试输出
			switch j {
			case 2:
				fmt.Println("Breaking at case 2")
				continue OuterLoop
			}
		}
	}
}
```

输出

:::tip 说明

**第一次外循环 (`i = 0`)**：

- `j = 0, 1`: 正常输出
- `j = 2`: 满足 `case 2`，打印 `Breaking at case 2`，执行 `continue OuterLoop`，跳过当前外循环的剩余部分
- 进入下一次外循环

**第二次外循环 (`i = 1`)**：

- `j = 0, 1`: 正常输出
- `j = 2`: 满足 `case 2`，打印 `Breaking at case 2`，执行 `continue OuterLoop`，跳过当前外循环的剩余部分
- 外循环结束，因为 `i < 2` 不再满足

:::

```shell
i: 0, j: 0
i: 0, j: 1
i: 0, j: 2
Breaking at case 2
i: 1, j: 0
i: 1, j: 1
i: 1, j: 2
Breaking at case 2
```

























