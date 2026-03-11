# hugo安装配置

[hugo官网](https://gohugo.io/)

[hugo github](https://github.com/gohugoio/hugo)

[hugo官方安装文档](https://gohugo.io/installation/)

[hugo 版本说明](https://gohugo.io/installation/macos/#editions)



## 安装

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="apple" label="Apple" default>

构建标准版

```shell
go install github.com/gohugoio/hugo@latest
```



构建扩展版

```shell
CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@latest
```

  

构建扩展/部署版

```shell
CGO_ENABLED=1 go install -tags extended,withdeploy github.com/gohugoio/hugo@latest
```

</TabItem>
  <TabItem value="orange" label="Orange">

```
brew install hugo
```

  </TabItem>
</Tabs>



查看版本

```shell
$ hugo version
hugo v0.157.0+extended+withdeploy darwin/arm64 BuildDate=2026-02-25T16:38:33Z VendorInfo=Homebrew
```



## 创建项目框架

### 在 `hugo` 目录中创建项目框架

```shell
$ hugo new project hugo
Congratulations! Your new Hugo project was created in /Users/pptfz/Desktop/pptfz/hugo.

Just a few more steps...

1. Change the current directory to /Users/pptfz/Desktop/pptfz/hugo.
2. Create or install a theme:
   - Create a new theme with the command "hugo new theme <THEMENAME>"
   - Or, install a theme from https://themes.gohugo.io/
3. Edit hugo.toml, setting the "theme" property to the theme name.
4. Create new content with the command "hugo new content <SECTIONNAME>/<FILENAME>.<FORMAT>".
5. Start the embedded web server with the command "hugo server --buildDrafts".

See documentation at https://gohugo.io/.
```



![iShot_2026-03-09_19.04.42](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-09_19.04.42.png)

### 克隆主题

将 Ananke 主题克隆到 `themes` 目录中，将其作为 Git 子模块添加到项目中

```shell
cd hugo
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
```



在项目配置文件中添加一行，指示当前主题

```shell
echo "theme = 'ananke'" >> hugo.toml
```



## 启动服务

```shell
hugo server
```



浏览器访问 `http://localhost:1313` ，初始页面如下

![iShot_2026-03-09_19.15.43](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-09_19.15.43.png)



## 添加内容

```sh
hugo new content content/posts/my-first-post.md
```



文件默认内容如下

:::tip 说明

文件中 `draft` 的默认值是 `true` ，默认情况下，hugo在构建项目时不会发布草稿内容  [官方文档说明](https://gohugo.io/getting-started/usage/#draft-future-and-expired-content)

:::

```shell
+++
date = '2026-03-10T16:42:38+08:00'
draft = true
title = 'My First Post'
+++
```



运行以下任意命令启动hugo服务并包含草稿内容

:::tip 说明

当对新内容感到满意时，请将  `draft` 参数设置为 `false`

Hugo 的渲染引擎符合 Markdown 的 CommonMark [规范](https://spec.commonmark.org/)。 CommonMark 组织提供了一个有用的实时测试 [工具](https://spec.commonmark.org/dingus/)，由参考实现提供支持

:::

```shell
hugo server --buildDrafts
```

```shell
hugo server -D
```



访问效果如下

![iShot_2026-03-10_16.50.49](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-10_16.50.49.png)



## 配置项目

`hugo.toml` 默认内容如下，更多项目配置可参考 [官方文档](https://gohugo.io/configuration/)

```toml
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Project'
theme = 'ananke'
```



| 参数           | 说明           |
| -------------- | -------------- |
| `baseURL`      | 项目的访问域名 |
| `languageCode` | 项目的地区     |
| `title`        | 项目的标题     |
| `theme`        | 项目的主题     |



配置完成后启动hugo服务查看更改

```shell
hugo server -D
```



## 发布项目

:::tip 说明

当发布项目时，Hugo 会将所有构建工件渲染到项目根目录中的 `public` 目录中。这包括每个站点的 HTML 文件，以及图像、CSS 和 JavaScript 等资产

:::

```shell
hugo
```

