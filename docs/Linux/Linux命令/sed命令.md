[toc]



# sed命令

## sed命令工作流程

1.输入流

- sed 从标准输入（如管道或文件）读取文本行。你可以将文件名作为参数传递给 sed，或者通过管道将输出传递给 sed。

2.模式匹配

- 对每一行输入，sed 将根据提供的模式（通常是正则表达式）进行匹配。模式可以指定哪些行或文本需要进行处理。

3.操作

- 根据匹配结果，sed 执行相应的操作。常见的操作包括：
  - 替换（s/pattern/replacement/）：用替换字符串替换匹配的模式。
  - 删除（d）：删除匹配的行。
  - 插入（i）或 追加（a）：在匹配行之前或之后插入文本。
  - 打印（p）：打印匹配的行。

4.输出:

- 处理完所有输入行后，sed 将结果输出到标准输出。
  - 默认情况下，它会输出所有未被删除的行。如果使用了 `-n` 选项，则只输出被打印操作处理过的行。
  - 默认情况下，sed将修改的行输出到屏幕，并没有修改源文件，使用 `-i` 选项修改源文件



## 命令格式

`sed 选项 地址1,地址2 命令 标记 文件名`



## 选项

### `-n`  拟制输出，不输出未修改的行，强制输出用命令 `p`

创建示例文件

```shell
cat > test.txt << EOF
line 1
line 2
line 3
EOF
```



这里，`/line 2/p` 表示匹配包含 `line 2` 的行，并打印它。由于使用了 `-n` 选项，只有匹配的行被打印，其他行不会自动输出

```shell
$ sed -n '/line 2/p' test.txt 
line 2

$ sed '/line 2/p' test.txt 
line 1
line 2
line 2
line 3
```



### `-i` 修改源文件，需要备份源文件 `-i.bak` 即可

不加 `-i` 不修改源文件

```shell
$ sed 's/line/abc/' test.txt 
abc 1
abc 2
abc 3

$ cat test.txt 
line 1
line 2
line 3
```



加 `-i` 修改源文件

```shell
$ sed -i 's/line/abc/' test.txt 
$ cat test.txt
abc 1
abc 2
abc 3
```



### `-r` 让sed支持扩展正则表达式，默认支持标准正则表达式

:::tip 说明

使用 `-r` 选项后，正则表达式中的一些特殊字符可以直接使用，而不需要反斜杠进行转义，例如：

- **`+`**：匹配前一个字符或子表达式一次或多次。
- **`?`**：匹配前一个字符或子表达式零次或一次。
- **`|`**：表示逻辑“或”，匹配多个模式中的任意一个。
- **`()`**：用于分组，不需要加反斜杠。

:::



创建示例文件

```shell
cat > test.txt << EOF
apple
apples
banana
bananas
EOF
```



不加 `-r`

```shell
$ sed 's/(apple|banana)s?/\1s/g' test.txt 
sed: -e expression #1, char 24: invalid reference \1 on `s' command's RHS
```



加 `-r`

```shell
$ sed -r 's/(apple|banana)s?/\1s/g' test.txt 
apples
apples
bananas
bananas
```





### `-f` 从文件中读取 `sed` 命令

创建一个包含 `sed` 命令的文件

```shell
cat > commands.sed << EOF
s/foo/bar/g     # 替换所有的 'foo' 为 'bar'
/baz/d          # 删除包含 'baz' 的行
i\Insert Text   # 在文件开头插入 'Insert Text'
EOF
```



创建一个测试文件

```shell
cat > input.txt << EOF
foo is a placeholder
this is a test
baz is here
foo again
EOF
```



执行命令

```shell
$ sed -f commands.sed input.txt
Insert Text   # 在文件开头插入 'Insert Text'
bar is a placeholder
Insert Text   # 在文件开头插入 'Insert Text'
this is a test
Insert Text   # 在文件开头插入 'Insert Text'
bar again
```



### `-e` 允许一条命令执行多个sed子命令

创建示例文件

```shell
cat > test.txt << EOF
apple pie
banana split
cherry tart
EOF
```



同时替换 `apple` 为 `fruit`，并将 `banana` 替换为 `dessert`

```shell
$ sed -e 's/apple/fruit/' -e 's/banana/dessert/' test.txt 
fruit pie
dessert split
cherry tart
```



可以结合删除和替换操作，比如想删除包含 `cherry` 的行，并将 `pie` 替换为 `cake`

```shell
$ sed -e '/cherry/d' -e 's/pie/cake/' test.txt 
apple cake
banana split
```



## 定位、匹配

### 使用行号

创建示例文件

```shell
cat > test.txt << EOF
111
abc
111
fgh
333
iop
789
EOF
```



#### 定位1-5行	1,5

```shell
$ sed '1,5s#111#999#' test.txt 
999
abc
999
fgh
333
iop
789
```



#### 定位到最后一行	$

```shell
$ sed '$s#789#AAA#' test.txt 
111
abc
111
fgh
333
iop
AAA
```



#### 指定起始匹配行和步长	1~5(从第一行开始，每隔5行匹配)

```shell
$ sed -n '1~5p' test.txt 
111
iop
```



#### 定位奇数行	1～2

```shell
$ sed -n '1~2p' test.txt 
111
111
333
789
```



#### 定位偶数行	0～2

```shell
$ sed -n '0~2p' test.txt 
abc
fgh
iop
```



#### 定位某行之后的n行	1,+3

:::tip 说明

以下表示定位第1行和之后的3行

:::

```shell
$ sed -n '1,+3p' test.txt 
111
abc
111
fgh
```



### 使用正则表达式

```shell
$ sed -n '/^1/p' test.txt 
111
111
```



## 命令

| 命令 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| `a`  | 在当前行后添加一行或多行                                     |
| `c`  | 用新文本修改（替换）当前行中的文本                           |
| `d`  | 删除行                                                       |
| `i`  | 在当前行之前插入文本                                         |
| `h`  | 把模式空间里的内容复制到暂存缓存区                           |
| `H`  | 把模式空间里的内容追加到暂存缓存区                           |
| `g`  | 取出暂存缓冲区里的内容，将其复制到模式空间，覆盖该处原有内容 |
| `G`  | 取出暂存缓冲区里的内容，将其复制到模式空间，追加在原有内容后面 |
| `l`  | 列出非打印字符                                               |
| `p`  | 打印行                                                       |
| `n`  | 读入下一输入行，并从下一条命令而不是第一条命令开始处理       |
| `q`  | 结束或退出sed                                                |
| `r`  | 从文件中读取输入行                                           |
| `!`  | 对所选行之外的所有行应用命令                                 |
| `s`  | 用一个字符串替换另一个                                       |



### `p`	打印

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



打印第1行

```shell
$ sed -n '1p' test.txt 
123456
```



打印以a开头的行到2结束的行

```shell
$ sed -n '/a/,/2/p' test.txt 
abcdef
(abc)def
2
```



打印以1开头的行到第3行

```shell
$ sed -n '/1/,3p' test.txt 
123456
111111
abcdef
```



### `d`	删除

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



将有1的行删除

```shell
$ sed '/1/d' test.txt
abcdef
(abc)def
2
222222
```



将文件的1到3行删除

```shell
$ sed '1,3d' test.txt
(abc)def
2
222222
```



将文件从以a开头的行到文件结尾删除

```shell
$ sed '/a/,$d' test.txt 
123456
111111
```



删除不包含abc的行

```shell
$ sed '/abc/!d' test.txt 
abcdef
(abc)def
```



#### sed删除指定内容后的行

删除abcdef后的所有内容(包含abcdef)

```shell
$ sed '/abcdef/,$d' test.txt 
123456
111111
```

但是上述写法把包含abcdef的行也删除了，如果想要把bbb保留下来，需要这么写

:::tip 说明

其中`N` 、`b` 是固定的字符，其余字符可以替换为任意字母，除了sed中的p和d，即除了a是任意字母外，其余均为固定写法

:::

用法说明 [链接](https://www.soinside.com/question/niV938HWFE7ZhkP4Cn4ygR)

```shell
$ sed '/abcdef/{p;:a;N;$!ba;d}' test.txt 
123456
111111
abcdef
```



### `s`	替换

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



将文件中的1全部替换为 `?`

```shell
$ sed 's/1/?/g' test.txt 
?23456
??????
abcdef
(abc)def
2
222222
```



将abcdef替换为abchehe, \1表示匹配的abc

```shell
$ sed -r 's/(abc)def/\1hehe/' test.txt
123456
111111
abchehe
(abc)def
2
222222
```



### 逗号	指定行的范围

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



匹配以1开头的行到以2开头的行之间的行

```shell
$ sed -n '/1/,/2/p' test.txt 
123456
111111
abcdef
(abc)def
2
```



匹配从第3行开始，到第一个以2开头之间的行

```shell
$ sed -n '3,/2/p' test.txt 
abcdef
(abc)def
2
```



匹配以1开头的行到第一个以2开头的行，然后将以1开头的行替换为hehe

```shell
$ sed -n '/1/,/2/s/^1/hehe/p' test.txt 
hehe23456
hehe11111
```





### `e`	多重编辑

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



将第一行删除，并且替换 `abc` 为 `ABC`

```shell
$ sed -e '1d' -e 's#abc#ABC#g' test.txt 
111111
ABCdef
(ABC)def
2
222222
```



### `a`	追加

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



在以2开头的行后追加 `HEHE`

```shell
$ sed '/^2/aHEHE' test.txt 
123456
111111
abcdef
(abc)def
2
HEHE
222222
HEHE
```



### `i`	插入

:::tip 说明

`i` 命令是插入命令，类似于 `a` 命令，但不是在当前行后增加文本，而是在**当前行前面**插入新的文本

:::

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



在以2开头的行前边插入 `HEHE`

```shell
$ sed '/^2/iHEHE' test.txt 
123456
111111
abcdef
(abc)def
HEHE
2
HEHE
222222
```



### `c`	修改

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



将文件中 `abcdef` 替换为666

```
$ sed '/abcdef/c666' test.txt 
123456
111111
666
(abc)def
2
222222
```



### `n`	获取下一行

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



匹配以 `a` 开头的一行，`n` 表示获取下一行，即 `(abc)def`，并且替换e为E

```shell
$ sed '/a/{n;s/e/E/;}' test.txt 
123456
111111
abcdef
(abc)dEf
2
222222
```



### `y`	转换

:::tip 说明

`y` 命令表示转换，该命令与 `tr` 命令相似，字符按照一对一的方式从左到右进行转换

例如 `y/abc/ABC/` ，会把小写字母转换成大写字母，`a-->A` 、`b-->B` 、`c-->C` ，与 `s` 不同的是，`y` 会全部替换，而 `s` 需要在最后加 `g`

:::

创建示例文件

```shell
cat > test.txt << EOF
123456
111111
abcdef
(abc)def
2
222222
EOF
```



将1-3行的1转换为Q

```shell
$ sed '1,3y/1/Q/' test.txt
Q23456
QQQQQQ
abcdef
(abc)def
2
222222
```

