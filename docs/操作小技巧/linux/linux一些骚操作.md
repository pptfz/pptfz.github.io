# linux一些骚操作

从指定的文件中实时查看日志，并且当日志中出现 `register finished` 字符串时停止查看日志

:::tip 说明

- `timeout 1m`: 这个部分设置了超时时间为 1 分钟，意味着命令会在 1 分钟后自动终止。
- `tail -Fn 0 "/data/log/console.log"`: 这部分使用 `tail` 命令来监视文件 `"/data/log/console.log"` 的变化。`-F` 选项让 `tail` 命令在文件被删除或者被移动后重新打开文件，而不是退出。`-n 0` 选项表示显示文件的所有内容，并且随着内容的增加持续输出。
- `|(sed /"register finished"/q;)`: 这部分通过管道将 `tail` 命令的输出传递给 `sed` 命令。`sed /"register finished"/q;` 命令会匹配日志中包含 `register finished` 字符串的行，并且在匹配到第一行后退出。

:::

```shell
timeout 1m tail -Fn 0 "/data/log/console.log" |(sed /"register finished"/q;)
```

