[toc]



# vim命令

[vim github](https://github.com/vim/vim)

[vim官网](https://www.vim.org/)



## 1.vim编辑器

Vim 是旧的 UNIX 编辑器 [vi](https://en.wikipedia.org/wiki/Vi_(text_editor)) 的一个大大改进的版本。添加了许多新功能：多级撤消、语法高亮、命令行历史记录、在线帮助、拼写检查、文件名补全、块操作、脚本语言等。此外，还提供图形用户界面 （GUI）



## 2.vim模式及模式转换

### 2.1 vim模式

| 模式               | 说明                             |
| ------------------ | -------------------------------- |
| 命令模式           | 刚打开一个文件就是命令模式       |
| 编辑模式           | 可以编辑内容                     |
| 末行模式(一般模式) | 可进行搜索、替换、切换文件等操作 |



### 2.2 vim模式转换

**命令模式 -> 编辑模式**

| 操作 | 说明                                       |
| ---- | ------------------------------------------ |
| `i`  | 在当前光标所在行的字符前面，转换为编辑模式 |
| `I`  | 在当前光标所在行的行首，转换为编辑模式     |
| `a`  | 在当前光标所在行的字符后面，转换为编辑模式 |
| `A`  | 在当前光标所在行的行尾，转换为编辑模式     |
| `o`  | 在当前光标所在行的下方，新建一行           |
| `O`  | 在当前光标所在行的上方，新建一行           |



**编辑模式-->命令模式**

直接按 `esc` 键即可



**编辑模式-->末行模式**

先按 `esc` 键，然后按 `:` 或 `/` 或 `?`



![iShot_2024-08-20_15.06.11](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-20_15.06.11.png)





## 3.vim打开/关闭文件方式

### 3.1 打开文件方式

| 操作              | 说明                                               | 示例                                                       |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| vim               | 打开文件，并定位于首行                             | `vim file` 打开文件 `file` 并定位至首行                    |
| vim +             | 打开文件，并定位至最后一行                         | `vim + file` 打开文件 `file` 并定位至最后一行              |
| vim +n            | 打开文件，并定位至 `n` 行，`n` 代表数字            | `vim +6 file` 打开文件 `file` 并定位至第6行                |
| vim + /正则表达式 | 打开文件，定位至第一次被正则表达式匹配到的行的行首 | `vim + /^9 file` 打开文件 `file` 并定位至以9开头的行的行首 |





### 3.2 关闭文件方式

#### 末行模式关闭文件

| 操作  | 说明         |
| ----- | ------------ |
| `:q`  | 退出         |
| `:wq` | 退出并保存   |
| `:q!` | 不保存退出   |
| `:w`  | 保存         |
| `wq!` | 强行保存退出 |



#### 编辑模式关闭文件

| 操作 | 说明       |
| ---- | ---------- |
| `ZZ` | 保存并退出 |
| `ZQ` | 不保存退出 |





## 4.vim文件内操作

### 4.1 移动光标

#### 4.1.1 逐字符移动(也可以使用上下左右箭头)

:::tip 说明

以下操作也可以使用上下左右箭头操作

5l就是向右移动5个字符

:::

| 操作 | 说明 |
| ---- | ---- |
| `h`  | 向左 |
| `j`  | 向下 |
| `k`  | 向上 |
| `l`  | 向右 |



#### 4.1.2 以单词为单位移动

| 操作 | 说明                       |
| ---- | -------------------------- |
| `w`  | 移至下一个词的词首         |
| `e`  | 跳至当前或下一个单词的词尾 |
| `b`  | 跳至当前或前一个单词的词首 |



#### 4.1.3 行内跳转

| 操作 | 说明                 |
| ---- | -------------------- |
| `0`  | 绝对行首             |
| `^`  | 行首的第一个非空字符 |
| `$`  | 绝对行尾             |





#### 4.1.4 行间跳转

##### 编辑模式跳转

| 操作          | 说明                   |
| ------------- | ---------------------- |
| `nG` 或 `ngg` | 跳转至 `n` 行          |
| `G`           | 跳转至最后一行         |
| `gg`          | 跳转至第一行第一个字符 |



##### 末行模式跳转

| 操作 | 说明           |
| ---- | -------------- |
| `:n` | 跳转至n行      |
| `:$` | 跳转至最后一行 |



### 4.2 翻屏



| 操作     | 说明       |
| -------- | ---------- |
| `Ctrl+f` | 向下翻一屏 |
| `Ctrl+b` | 向上翻一屏 |
| `Ctrl+d` | 向下翻半屏 |
| `Ctrl+u` | 向上翻半屏 |





### 4.3 删除	d



| 操作  | 说明                                     |
| ----- | ---------------------------------------- |
| `x`   | 删除当前光标所在处的单个字符             |
| `X`   | 删除当前光标所在处前面的单个字符         |
| `nx`  | 删除光标所在处及向后的n个字符，n代表数字 |
| `dd`  | 删除当前光标所在行                       |
| `ndd` | 删除包括当前光标所在行的n行，n代表数字   |
| `dw`  | 删除光标所在处到下一个词的词首           |
| `de`  | 删除光标所在处到当前词的词尾             |
| `db`  | 删除光标所在处到上一个单词的词首         |





### 4.4 复制	yy

| 操作  | 说明                                 |
| ----- | ------------------------------------ |
| `yy`  | 复制当前光标所在行                   |
| `nyy` | 复制当前光标所在行及后n行，n代表数字 |



### 4.5 粘贴	p

| 操作       | 说明                     |
| ---------- | ------------------------ |
| `p(小写)`  | 粘贴至光标所在行的下一行 |
| `P(大写) ` | 粘贴至光标所在行的上一行 |



### 4.6 修改	c

| 操作 | 说明                                   |
| ---- | -------------------------------------- |
| `cc` | 删除光标所在行并进入编辑模式           |
| `C`  | 删除光标所在处到本行结尾并进入编辑模式 |



### 4.7 替换	r

| 操作 | 说明                                  |
| ---- | ------------------------------------- |
| `r`  | 编辑模式直接按r替换，一次只能替换一个 |
| `R`  | 替换模式，可以替换多个                |





### 4.8 撤销	u

| 操作     | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| `u`      | 撤销前一次的编辑操作，连续u命令可以撤销此前的n次编辑操作，n代表数字 |
| `nu`     | 直接撤销最近n次编辑操作，n代表数字                           |
| `Ctrl+r` | 撤销 `撤销操作`                                              |





### 4.9 重复前一次操作

**编辑模式按 `.` 键，会重复前一次的操作，比替换、编辑、删除等**



### 4.10 可视化操作

| 操作     | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| `v`      | 按字符选取                                                   |
| `V`      | 按矩形选取                                                   |
| `Ctrl+v` | 批量操作，先选中要操作的区域，然后大写 `I` 编辑，接着按 `esc` 键，最后回车即可完成编辑 |





### 4.11 查找(末行模式)

| 操作 | 说明     |
| ---- | -------- |
| `/`  | 从上而下 |
| `?`  | 从下而上 |



### 4.12 查找并替换(末行模式)

语法

```shell
s
	% 表示全文
	g 表示全部替换
```



**示例**

| 操作       | 说明                                                    |
| ---------- | ------------------------------------------------------- |
| `1,3s/A/B` | 将1-3行的 `A` 替换为 `B`                                |
| `1,$s/A/B` | 将1-末尾行的 `A` 替换为 `B`                             |
| `%s/A/B`   | 在每一行中，只替换第一个出现的 `A` 为 `B`               |
| `%s/A/B/g` | 在每一行中，替换所有出现的 `A` 为 `B`，而不仅仅是第一个 |



## 5.vim编辑多个文件

语法

`vim file1 file2 file3 ...`



| 操作     | 说明               |
| -------- | ------------------ |
| `:next`  | 切换至下一个文件   |
| `:prev`  | 切换至上一个文件   |
| `:last`  | 切换至最后一个文件 |
| `:first` | 切换至第一个文件   |





## 6.配置选项

### 6.1 基本配置

| 配置       | 说明                                         |
| ---------- | -------------------------------------------- |
| `set nu`   | 显示行号 (number)                            |
| `set rnu`  | 显示相对行号(relativenumber)                 |
| `set cul`  | 高亮当前行 (cursorline)                      |
| `set ai`   | 自动缩进 (autoindent)                        |
| `set si`   | 智能缩进 (smartindent)                       |
| `set ts=4` | 一个 tab 显示为 4 个空格 (tabstop)           |
| `set sw=4` | 缩进时使用 4 个空格 (shiftwidth)             |
| `set et`   | 将 tab 转换为空格 (expandtab)                |
| `set hls`  | 搜索时高亮匹配项 (hlsearch)                  |
| `set is`   | 搜索时逐字符高亮 (incsearch)                 |
| `set ic`   | 搜索时忽略大小写 (ignorecase)                |
| `set scs`  | 当搜索包含大写字母时，区分大小写 (smartcase) |



### 6.2 外观

| 配置          | 说明                                             |
| ------------- | ------------------------------------------------ |
| `set bg=dark` | 设定背景色为暗色系（light 为浅色系）(background) |
| `syn on`      | 开启语法高亮 (syntax on)                         |
| `set sc`      | 显示命令输入 (showcmd)                           |
| `set sm`      | 高亮匹配的括号 (showmatch)                       |



### 6.3 文件操作

| 配置                             | 说明                             |
| -------------------------------- | -------------------------------- |
| `set backup`                     | 保存文件时备份旧文件 (backup)    |
| `set ufo`                        | 开启撤销文件 (undofile)          |
| `set undodir=~/.vim/undodir`     | 设置撤销文件保存位置 (undodir)   |
| `set backupdir=~/.vim/backupdir` | 设置备份文件保存位置 (backupdir) |



### 6.4 其他配置

| 配置                 | 说明                                                  |
| -------------------- | ----------------------------------------------------- |
| `set cb=unnamedplus` | 使用系统剪贴板 (clipboard)                            |
| `set wrap`           | 自动换行 (wrap)                                       |
| `set mouse=a`        | 启用鼠标支持 (mouse)                                  |
| `set so=8`           | 光标移动时，上下留 8 行缓冲区 (scrolloff)             |
| `set ch=2`           | 命令行高度设置为 2 行 (cmdheight)                     |
| `set wmnu`           | 命令行补全增强 (wildmenu)                             |
| `set lz`             | 在宏执行或脚本执行时不重绘屏幕，提高效率 (lazyredraw) |
| `set sb`             | 水平分割窗口时，新窗口放在下方 (splitbelow)           |
| `set sr`             | 垂直分割窗口时，新窗口放在右侧 (splitright)           |
| `set tgc`            | 终端使用 24 位色彩 (termguicolors)                    |



### 6.5 快捷键映射

| 配置                    | 说明                    |
| ----------------------- | ----------------------- |
| `nnoremap <C-s> :w<CR>` | Ctrl+s 保存文件         |
| `vnoremap <C-c> "+y`    | Ctrl+c 复制到系统剪贴板 |
| `nnoremap <C-v> "+p`    | Ctrl+v 从系统剪贴板粘贴 |





## 7.vim高级用法

### 7.1 使用 `F1` 键执行文件

:::tip 说明

当编写完shell脚本或者python脚本后，想要运行测试一般的方法是保存退出脚本然后再运行

使用如下配置就可以不退出vim编辑执行脚本

:::



编辑 `~/.vimrc` 并写入以下内容

```shell
cat >> ~/.vimrc << EOF
"""""""""""""""""""""""""""""""""""""""""""""""""""
"Programming makes the world better
"""""""""""""""""""""""""""""""""""""""""""""""""""
map <F1> :call CompileRunGcc()<CR>
func! CompileRunGcc()
exec "w"
if &filetype == 'c'
exec '!g++ % -o %<'
exec '!time ./%<'
elseif &filetype == 'cpp'
exec '!g++ % -o %<'
exec '!time ./%<'
elseif &filetype == 'python'
exec '!time python %'
elseif &filetype == 'sh'
:!time bash %
endif
endfunc
EOF
```



编辑测试脚本

```shell
cat >> test.sh << EOF
# !/usr/bin/env bash
awk 'BEGIN{print 10+10}
EOF
```



在末行模式下按 `F1` 键，就会执行脚本并输出

![iShot_2024-08-21_11.13.27](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-21_11.13.27.png)



再次按回车，会回到脚本当中，这样就可以不退出脚本，直接执行脚本进行测试了

![iShot_2024-08-21_11.15.34](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-21_11.15.34.png)



### 7.2 Linux脚本自动添加脚本头

:::tip 说明



:::

编辑 `~/.vimrc` 并写入以下内容

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="centos7" label="centos7" default>

```shell
function HappyPython()
call setline(1, "#!/usr/bin/env python")
call append(1, "#-*- coding:utf8 -*-")
normal G
normal o
endf
autocmd bufnewfile *.py call HappyPython()
function HappyShell()
call setline(1, "#!/usr/bin/env bash")
call append(1, "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin")
normal G
normal o
endf
autocmd bufnewfile *.sh call HappyShell()
```

  </TabItem>
  <TabItem value="centos6" label="centos6">

```shell
function HappyPython()
call setline(1, "#!/usr/bin/env python")
call append(1, "#-*- coding:utf8 -*-")
normal G
normal o
endf
autocmd bufnewfile *.py call HappyPython()
function HappyShell()
call setline(1, "#!/usr/bin/env bash")
call append(1, "export PATH=/usr/lib64/qt-3.3/bin:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/root/bin")
normal G
normal o
endf
autocmd bufnewfile *.sh call HappyShell()
```

  </TabItem>
</Tabs>



编辑 `.py` 文件就会自动添加如下内容

```python
#!/usr/bin/env python
#-*- coding:utf8 -*-
```



编辑 `.sh` 文件就会自动添加如下内容

```shell
#!/usr/bin/env bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
```



### 7.3 设置自动配置 `set paste`

:::tip 说明

vim在粘贴的时候，如果遇到粘贴的格式不正确，则需要手动执行命令 `:set paste` ，可以使用以下配置设置自动配置

:::

```shell
cat >> ~/.vimrc << EOF
let &t_SI .= "\<Esc>[?2004h"
let &t_EI .= "\<Esc>[?2004l"

inoremap <special> <expr> <Esc>[200~ XTermPasteBegin()

function! XTermPasteBegin()
	  set pastetoggle=<Esc>[201~
	    set paste
	      return ""
      endfunction
EOF
```

