# mac安装oh-my-zsh

[参考链接](https://lilyssh.blog.csdn.net/article/details/118178091?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&utm_relevant_index=1)

[oh-my-zsh官网](https://ohmyz.sh/)



# 1.安装oh-my-zsh

```shell
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```



![iShot2022-01-17 10.51.12](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2022-01-17 10.51.12.png)



安装完成后界面就会变成如下效果

![iShot2022-01-17 21.35.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2022-01-17 21.35.21.png)

切换目录效果如下

![iShot2022-01-17 21.36.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2022-01-17 21.36.15.png)



# 2.安装插件

## 2.1 语法高亮插件 `zsh-syntax-highlighting`

[zsh-syntax-highlighting github地址](https://github.com/zsh-users/zsh-syntax-highlighting/)



安装前，无论命令正确与否都是白色

![iShot2022-01-17 21.38.32](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2022-01-17 21.38.32.png)



安装后，输入的命令正确时是绿色，错误时是红色

![iShot2022-01-17 21.38.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2022-01-17 21.38.39.png)



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

