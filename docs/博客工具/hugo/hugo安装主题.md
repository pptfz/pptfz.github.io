# hugo安装主题

[hugo主题](https://themes.gohugo.io/)



## hugo-teek

[hugo-teek cnb](https://cnb.cool/yuwen-gueen/hugo-teeker-theme)

[hugo-teek配置文档](https://wiki.xxdevops.cn/hobby/)



### 克隆代码

```shell
git clone https://cnb.cool/yuwen-gueen/hugo-teeker-theme
```



### 拷贝主题

:::tip 说明

hugo的主题全部放置在项目根目录下的 `themes` 目录下

:::

```shell
cp hugo-teeker-theme/hugo-teek-site/themes/hugo-teek themes
```



### 编辑配置文件

编辑 `hugo.toml` ，指定主题为 `hugo-teek`

```shell
theme = "hugo-teek"
```



### 启动

```shell
hugo server
```



### 访问

`hugo-teek` 主题初始页面如下

![iShot_2026-03-11_16.19.16](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-11_16.19.16.png)







## FeelIt

[FeelIt github](https://github.com/khusika/FeelIt)

[FeelIt主题配置文档](https://feelit.khusika.id/zh-cn/theme-documentation-basics/#basic-configuration)



### 安装主题

```shell
git submodule add https://github.com/khusika/FeelIt.git themes/FeelIt
```



### 编辑配置文件

编辑 `hugo.toml` ，以下为FeelIt 主题的基本配置

```toml
baseURL = "http://example.org/"
# [en, zh-cn, fr, ...] 设置默认的语言
defaultContentLanguage = "zh-cn"
# 网站语言, 仅在这里 CN 大写
languageCode = "zh-CN"
# 是否包括中日韩文字
hasCJKLanguage = true
# 网站标题
title = "我的全新 Hugo 网站"

# 更改使用 Hugo 构建网站时使用的默认主题
theme = "FeelIt"

[params]
  # FeelIt 主题版本
  version = "1.0.X"

[menu]
  [[menu.main]]
    identifier = "posts"
    # 你可以在名称 (允许 HTML 格式) 之前添加其他信息, 例如图标
    pre = ""
    # 你可以在名称 (允许 HTML 格式) 之后添加其他信息, 例如图标
    post = ""
    name = "文章"
    url = "/posts/"
    # 当你将鼠标悬停在此菜单链接上时, 将显示的标题
    title = ""
    weight = 1
  [[menu.main]]
    identifier = "tags"
    pre = ""
    post = ""
    name = "标签"
    url = "/tags/"
    title = ""
    weight = 2
  [[menu.main]]
    identifier = "categories"
    pre = ""
    post = ""
    name = "分类"
    url = "/categories/"
    title = ""
    weight = 3

# Hugo 解析文档的配置
[markup]
  # 语法高亮设置 (https://gohugo.io/content-management/syntax-highlighting)
  [markup.highlight]
    # false 是必要的设置 (https://github.com/khusika/FeelIt/issues/158)
    noClasses = false
```



### 启动

```shell
hugo server
```



### 访问

![iShot_2026-03-11_16.51.57](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-11_16.51.57.png)







