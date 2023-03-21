# mac升级到macOS Monterey后无法在根目录创建目录



[国内参考链接](https://dvel.me/posts/macos-create-root-dir/)

[原版链接](https://stackoverflow.com/questions/58396821/what-is-the-proper-way-to-create-a-root-sym-link-in-catalina)





**问题描述**

进入根目录创建目录提示 `Read-only file system`

```shell
$ mkdir /test
mkdir: /test: Read-only file system
```



## macOS 10.15 Catalina

在恢复模式关闭 SIP：

1. 重启并按住 Cmd + R 进入恢复模式
2. 菜单栏 - 实用工具 - 终端
3. 输入命令 `csrutil disable`
4. 重启

后接着执行：

```shell
$ sudo mount -uw /
```

重启电脑后就可以在根目录创建文件夹了。



## macOS 11 Big Sur 和 macOS 12 Monterey

不需要关闭 SIP。

直接对根目录进行软链接会报错：

```shell
$ ln -s /Users/dvel/foo/bar /bar
ln: /bar: Read-only file system
```



现在根目录是只读的，但可以使用 `synthetic.conf` 文件来创建一个虚拟链接连接到数据盘，类似 `ln -s` 的软链接。



假设要在根目录创建 `data` 文件夹。

编辑或创建 `synthetic.conf`：

```shell
sudo vim /etc/synthetic.conf
```



输入内容

:::tip

中间是 Tab，不是空格，切勿敲错

:::

```shell
data	/Users/dvel/data
```



`data` 是要链接到根目录的目录名称， `/Users/dvel/data` 是要链接到根目录的目录路径，保存后重启电脑即可



## Tab 写成空格的解决办法

如果写成了空格，会导致频繁重启，无法进入系统。

进入恢复模式，打开终端输入命令来挂载磁盘后删除 `/etc/synthetic.conf` 文件

```shell
$ diskutil apfs unlock "Macintosh HD - Data"
$ cd /Volumes/"Macintosh HD - Data"
$ cd private/etc
$ rm synthetic.conf
```



重启电脑即可

