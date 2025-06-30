# mac安装ohmyzsh

[参考链接](https://lilyssh.blog.csdn.net/article/details/118178091?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&utm_relevant_index=1)

[oh-my-zsh官网](https://ohmyz.sh/)

[ohmyzsh github](https://github.com/ohmyzsh/ohmyzsh)



## 1.安装ohmyzsh

```shell
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```



![iShot2022-01-17_10.51.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-17_10.51.12.png)



安装完成后界面就会变成如下效果

![iShot2022-01-17_21.35.21](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-17_21.35.21.png)





切换目录效果如下

![iShot2022-01-17_21.36.15](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-17_21.36.15.png)



## 2.安装插件

### 2.1 语法高亮插件 `zsh-syntax-highlighting`

[zsh-syntax-highlighting github地址](https://github.com/zsh-users/zsh-syntax-highlighting/)



安装前，无论命令正确与否都是白色

![iShot2022-01-17_21.38.32](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-17_21.38.32.png)





安装后，输入的命令正确时是绿色，错误时是红色

![iShot2022-01-17_21.38.39](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-17_21.38.39.png)





下载插件

```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```



编辑 `～/.zshrc` 文件增加插件配置

> 默认内容是 `plugins=(git)`

```shell
plugins=(
        git
        zsh-syntax-highlighting
)
```



加载配置生效

```shell
source ~/.zshrc
```



## 3.更新ohmyzsh

### 3.1 修改仓库地址

在 `.oh-my-zsh` 目录中，默认的远程仓库是github，如果想要加速可以修改为国内加速源

```shell
$ cd ~/.oh-my-zsh/ && git config -l | grep remote.origin.url
remote.origin.url=https://github.com/ohmyzsh/ohmyzsh.git
```



修改为 [清华源](https://mirrors4.tuna.tsinghua.edu.cn/help/ohmyzsh.git/)

```shell
git -C $ZSH remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/ohmyzsh.git
```



修改完后查看

```shell
$ git config -l | grep remote.origin.url
remote.origin.url=https://mirrors.tuna.tsinghua.edu.cn/git/ohmyzsh.git
```



### 3.2 更新

默认情况下会每2周检查一次更新，其他更新方式可以参考 [github](https://github.com/ohmyzsh/ohmyzsh?tab=readme-ov-file#getting-updates)

手动执行命令更新

```sh
omz update
```







