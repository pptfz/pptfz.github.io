# grc

:::tip

**grc依赖python3**

:::

**作用**

> 加强Linux颜色显示，效果如下

![iShot_2024-08-21_21.55.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-08-21_21.55.22.png)



[grc github地址](https://github.com/garabik/grc)



## 1.下载源码

```shell
git clone https://github.com/garabik/grc.git
```



## 2.执行安装脚本、拷贝文件

```shell
# 执行安装脚本
cd grc
sh install.sh

# 拷贝文件
cp grc.sh /etc
```

 

## 3.设置别名

### 3.1 Bash

向 `~/.bashrc` 写入以下内容

```shell
cat >> ~/.bashrc << EOF
GRC_ALIASES=true
[[ -s "/etc/profile.d/grc.sh" ]] && source /etc/grc.sh
EOF
```



加载生效

```shell
source ~/.bashrc
```



### 3.2 ZSH

向 `~/.zshrc` 写入以下内容

```shell
[[ -s "/etc/grc.zsh" ]] && source /etc/grc.zsh
```



加载生效

```shell
source ~/.zshrc
```

