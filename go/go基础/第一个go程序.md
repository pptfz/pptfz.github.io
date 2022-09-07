# 第一个go程序



使用go输出 `hello world`

```go live
package main

import "fmt"

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







```jsx live
function Clock(props) {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  });

  function tick() {
    setDate(new Date());
  }

  return (
    <div>
      <h2>现在是 {date.toLocaleTimeString()}。</h2>
    </div>
  );
}
```

