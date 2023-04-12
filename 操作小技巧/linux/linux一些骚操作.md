# linux一些骚操作



```shell
timeout 1m tail -Fn 0 "/data/log/console.log" |(sed /"register finished"/q;)
```

