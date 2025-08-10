# 列表 `list`

## 说明

- 列表是一种**非连续**存储的容器，由多个节点组成，节点通过一些变量记录彼此之间的关系，列表有多种实现方法，例如单链表、双链表

- 在go语言中，将列表使用 `container/list` 包来实现，内部的实现原理是双链表

单链表

- 每个节点只有一个指向下一个节点的指针
- 只能从前向后遍历
- 占用内存较少
- 适合只需要单向遍历的场景

![iShot_2024-12-31_11.38.19](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-31_11.38.19.png)





双链表

- 每个节点有两个指针，分别指向前一个和后一个节点

- 可以双向遍历

- 占用内存较多

- 支持从任意节点双向遍历

- 删除和插入操作更方便

![iShot_2024-12-31_14.45.17](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-12-31_14.45.17.png)



指向 `null` 的必要性：

- 标记结束点：`null` 指针用来表示链表的结束位置，这是一个重要的边界标记
- 避免悬空指针：如果不指向 `null`，最后一个节点的指针将指向一个未定义的内存位置，这是非常危险的
- 便于判断：在遍历链表时，通过检查指针是否为 `null` 来判断是否到达链表末尾



## 定义方式

#### 通过 `container/list` 包的 `New` 方法初始化 `list`

```go
变量名 := list.New()
```



#### 通过声明初始化 `list`

```go
var 变量名 list.List
```





## 使用示例

### 在列表中插入元素

双链表支持从队列前方或后方插入元素，分别对应的方法是 `PushFront` 和 `PushBack` 

:::tip 说明

这2个方法都会返回一个 `*list.Element` 结构，如果在以后的使用中需要删除插入的元素，则只能通过 `*list.Element` 配合 `Remove()` 方法进行删除，这种方法可以让删除更加效率化，也是双链表特性之一

:::

```go
l := list.New()

// 将aaa字符插入到列表的前边
l.PushFront("aaa")

// 将zzz字符插入到列表的尾部
l.PushBack("zzz")
```



### 从列表中删除元素

:::tip 说明

列表的插入函数的返回值会提供一个 `*list.Element` 结构，这个机构记录着列表元素的值以及和其他节点之间的关系等信息，从列表中删除元素时，需要用到这个结构进行快速删除

:::

```go
package main

import (
	"container/list"
	"fmt"
)

func main() {
	l := list.New()

	// 头部添加
	l.PushFront("aaa")

	// 尾部添加
	l.PushBack("zzz")

	// 尾部添加后保存元素句柄
	element := l.PushBack("bbb")

	// 在bbb之后添加ccc
	l.InsertAfter("ccc", element)

	// 在bbb之前添加ddd
	l.InsertBefore("ddd", element)

	// 删除bbb
	l.Remove(element)

	for i := l.Front(); i != nil; i = i.Next() {
		fmt.Println(i.Value)
	}
}
```

输出

```sh
aaa
zzz
ddd
ccc
```



### 遍历列表-访问列表的每一个元素

:::tip 说明

遍历双链表需要配合 `Front()` 函数获取头元素，遍历时只需要元素不为空就可以继续进行，每一次遍历调用元素的 `Next`

:::

:::tip 说明

使用for语句进行遍历，其中 `i := l.Front()` 表示初始赋值，只会在一开始执行一次，每次循环会进行一次 `i != nil` 的语句判断，如果返回 `false` 表示退出循环，反之则会执行 `i = i.Next()`

:::

```go
package main

import (
	"container/list"
	"fmt"
)

func main() {
	l := list.New()

	// 头部添加
	l.PushFront("aaa")

	// 尾部添加
	l.PushBack("zzz")
	
	for i := l.Front(); i != nil; i = i.Next() {
		fmt.Println(i.Value)
	}
}
```

输出

```shell
aaa
zzz
```

