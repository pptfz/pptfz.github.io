# 映射 `map`

## 说明

:::tip 说明

- map是一种无序的基于 `key-value` 的数据结构

- map必须使用 `make()` 初始化才能使用

:::



## 定义方式

:::tip 说明

- `KeyType` 为健类型
- `ValueType` 为健对应的值类型

:::

```go
map[KeyType]ValueType
```



## 使用示例

### 添加关联到 map 并访问关联和数据

#### 使用 `map()` 定义

```go
package main

import "fmt"

func main() {
	m := make(map[string]int)
	m["route"] = 66

	fmt.Println(m["route"]) // 输出 66

	v := m["route2"]
	fmt.Println(v) // 输出 0，当尝试查找不存在的健，返回的是 ValueType 的默认值
}
```



#### 声明时填充内容

```go
package main

func main() {
	m := map[string]string{
		"W": "forward",
		"A": "left",
		"D": "right",
		"S": "backward",
	}

	println(m["W"]) // 输出 forward
}
```



### 遍历map的键值对

#### 遍历键和值

map的遍历过程使用 `for range` 循环完成

```go
package main

import "fmt"

func main() {
	m := make(map[string]int)

	m["a"] = 1
	m["b"] = 2
	m["c"] = 3

	for k, v := range m {
		fmt.Println(k, v)
	}
}
```

输出

```shell
a 1
b 2
c 3
```



#### 只遍历值

:::caution 注意

遍历值的输出是无序的

:::

```go
for _, v := range
```



如果需要特定顺序的遍历结果，正确的做法是排序

```go
package main

import (
	"fmt"
	"sort"
)

func main() {
	m := make(map[string]int)

	// 准备map数据
	m["a"] = 1
	m["b"] = 2
	m["c"] = 3

	// 声明一个切片保存map数据
	var s []string

	// 将map数据遍历复制到切片中
	for k := range m {
		s = append(s, k)
	}

	// 对切片进行排序
	sort.Strings(s)

	fmt.Println(s) // 始终输出 [a b c]
}
```



#### 只遍历键

```go
for k := range
```





### 使用 `delete()` 函数从map中删除键值对

`delete()` 函数的格式如下

:::tip 说明

- map为要删除的map实例
- 键为要删除的map键值对中的键

:::

```go
delete(map, 键)
```



```go
package main

import "fmt"

func main() {
	m := make(map[string]int)

	// 准备map数据
	m["a"] = 1
	m["b"] = 2
	m["c"] = 3

	// 删除map中的一个键
	delete(m, "a")

	for k, v := range m {
		fmt.Println(k, v)
	}
}
```

输出

```shell
b 2
c 3
```



### 能够在并发环境中使用的map - `sync.Map`

:::tip 说明

`sync.Map` 和 `map` 不同，不是以语言原生态提供，而是在 `sync` 包下的特殊结构，有如下特性

- 无须初始化，直接声明即可
- `sync.Map` 不能使用 `map` 的方式进行取值和设置等操作，而是使用 `sync.Map` 的方法进行调用
  - `Store` 表示存储
  - `Load` 表示获取
  - `Delete` 表示删除
- 使用 `Range` 配合一个回调函数进行遍历操作，通过回调函数返回内部遍历出来的值，`Range` 参数中的回调函数的返回值功能是
  - 需要继续迭代遍历时，返回 `true`
  - 终止迭代遍历时，返回 `false`

:::



```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var m sync.Map

	// 将键值对保存到 m.map
	m.Store("a", 1)
	m.Store("b", 2)
	m.Store("c", 3)

	// 从 sync.Map 中根据键取值
	fmt.Println(m.Load("a")) // 输出 1 true

	// 根据键删除对应的键值对
	m.Delete("b")

	// 遍历所有的 sync.Map 中的键值对
	m.Range(func(k, v interface{}) bool {
		fmt.Println("interate:", k, v)
		return true
	})
}
```

输出

```shell
1 true
interate: a 1
interate: c 3
```





