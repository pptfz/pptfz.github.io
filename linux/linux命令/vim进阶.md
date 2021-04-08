[toc]



# vim进阶

# vim进阶一	使用F1键执行文件

**vim是一个类似于Vi的著名的功能强大、高度可定制的文本编辑器**

**我们Linux运维经常在Linux中使用到Vim编辑器，当使用Vim写shell脚本或者python脚本的时候，想要运行测试时候怎么办？Esc➡：➡wq，到shell终端执行脚本**

**上述情况很复杂！！**

**下面设置vim配置文件，让vim编辑器在不退出就能执行脚本**



## 1.创建并编辑当前用户的vim配置文件

**vim ~/.vimrc**

**添加如下代码：**

```python
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
```



## 2.编辑脚本，并进行测试

**//编辑测试脚本**

```python
[root@web01 ~]# cat test.sh 
# !/usr/bin/env bash
echo "test"
```



**//测试，vim编辑脚本，末行模式按F1**

![iShot2020-10-15 21.12.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 21.12.39.png)

**//再次按回车，会回到脚本当中,这样就可以不退出脚本，直接执行脚本进行测试了！！！**

![iShot2020-10-15 21.12.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 21.12.55.png)



# vim进阶二	linux脚本自动添加脚本头

**编辑当前用户vim配置文件**

- **\#vim ~/.vimrc**

**或者定义全局也行**

- **\#vim /etc/vimrc**

**在最下方添加如下代码：**

**CentOS7**

```python
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



**CentOS6**

```python
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

**保存退出后，我们试试开始使用vim编辑.py文件和.sh文件**

**就会发现py文件会自动添加了python脚本头！**

**sh文件自动添加了shell脚本头！**





# vim进阶三	vim编辑python脚本时Tab补全

**使用Linux写python脚本的时候，初期最痛苦的是什么？当然是各种库的不熟悉，知道了库，里面的方法还要挨个看，挨个记。**

**所以这时候，很多小伙伴使用了ipython，最强大的功能是什么呢？小伙伴们都知道，可以自动填充缩进，最重要的一点当然是可以补全啦！**

**在这里不得不提，vim的强大，可以定制化，支持python补全。**

**下面进行设置，如何能够让vim编写python脚本可以tab补全：**



## 第一步、安装git

```python
[root@web01 ~]# yum -y install git
```



## 第二步、创建当前用户隐藏vim目录，并进入到这个目录

```python
[root@web01 ~]# mkdir ~/.vim ; cd ~/.vim
```



## 第三步、使用git克隆下插件包（也可提前下载好，copy进来）

```python
[root@web01 .vim]# git clone https://github.com/rkulla/pydiction.git
[root@web01 .vim]# cp -r ~/.vim/pydiction/after/ ~/.vim
```



## 第四步、编辑vim配置文件，并添加如下内容

```python
[root@web01 .vim]# vim ~/.vimrc
filetype plugin on
let g:pydiction_location = '/root/.vim/pydiction/complete-dict'
let g:pydiction_menu_height = 10


⚠️⚠️⚠️此处有坑请注意！！
代码第二行，使用find命令查找一下自己的complete-dict文件路径，一定要写对！！
```



## 第五步、编辑python脚本，进行测试

 **编辑python脚本，然后输入库名，然后tab补齐即可**

![iShot2020-10-15 21.13.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 21.13.23.png)

 