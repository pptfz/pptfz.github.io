[toc]

# VuePress



[VuePress 1.x 官方网站](https://vuepress.vuejs.org/zh/)

[VuePress 2.x 官方网站](https://v2.vuepress.vuejs.org/zh/)

[VuePress github地址](https://github.com/vuejs/vuepress)



## 1.安装nodejs

[nodejs官网](https://nodejs.org/en/)

[nodejs官方下载地址](https://nodejs.org/en/download/)

[nodejs历史版本官方下载地址](https://nodejs.org/en/download/releases/)

### 1.1 下载二进制包

```shell
export NODE_VERSION=12.22.3
wget https://nodejs.org/dist/latest-v12.x/node-v${NODE_VERSION}-linux-x64.tar.xz
```



### 1.2 解压缩包、修改名称

```shell
tar xf node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/local/ && mv /usr/local/node-v${NODE_VERSION}-linux-x64/ /usr/local/node-v${NODE_VERSION}
```



### 1.3 导出环境变量

```shell
echo "export PATH=$PATH:/usr/local/node-v${NODE_VERSION}/bin" > /etc/profile.d/node.sh  && source /etc/profile
```



### 1.4 验证

```shell
$ node -v
v12.22.3

$ npm -v
6.14.13
```



### 1.5 配置npm加速

```shell
npm config set registry https://registry.npm.taobao.org
```



**验证加速**

```shell
$ npm config get registry
https://registry.npm.taobao.org/
```



### 1.6 安装yarn

```shell
npm -g install yarn
```



## 2.安装VuePress

### 2.1 创建一个新目录

```shell
[ -d /vuepress ] || mkdir /vuepress && cd /vuepress
```



### 2.2 初始化项目

```shell
# 一路会车默认即可，执行完成后会生成一个 package.json 文件
yarn init
```



`package.json` 文件内容如下

```json
{
  "name": "vuepress",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}
```



### 2.3 将 VuePress 安装为本地依赖

```shell
# 执行完成后会生成 node_modules 目录和 yarn.lock 文件
yarn add -D vuepress
```



### 2.4 创建第一篇文档

```shell
mkdir docs && echo '# Hello VuePress' > docs/README.md
```



### 2.5 在 `package.json` 中添加一些scripts

```shell
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```



### 2.6 在本地启动服务器

VuePress 会在 http://localhost:8080 本地启动一个热重载的开发服务器。当你修改你的 Markdown 文件时，浏览器中的内容也会自动更新。

```shell
yarn docs:dev
```

直接执行 `yarn docs:dev &` 是不能在后台运行的，原因未知， 如果想要后台运行，执行以下命令，nohup.out文件必须存在

```shell
yarn docs:dev < /dev/null  >nohup.out&
```



浏览器访问 `IP:8080`，初始效果如下

![iShot2021-07-18 23.45.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-18%2023.45.34.png)

## 3.目录结构

VuePress 遵循 **“约定优于配置”** 的原则，推荐的目录结构如下：

![iShot2021-07-18 23.50.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-18%2023.50.14.png)

- `docs/.vuepress`: 用于存放全局的配置、组件、静态资源等。
- `docs/.vuepress/components`: 该目录中的 Vue 组件将会被自动注册为全局组件。
- `docs/.vuepress/theme`: 用于存放本地主题。
- `docs/.vuepress/styles`: 用于存放样式相关的文件。
- `docs/.vuepress/styles/index.styl`: 将会被自动应用的全局样式文件，会生成在最终的 CSS 文件结尾，具有比默认样式更高的优先级。
- `docs/.vuepress/styles/palette.styl`: 用于重写默认颜色常量，或者设置新的 stylus 颜色常量。
- `docs/.vuepress/public`: 静态资源目录。
- `docs/.vuepress/templates`: 存储 HTML 模板文件。
- `docs/.vuepress/templates/dev.html`: 用于开发环境的 HTML 模板文件。
- `docs/.vuepress/templates/ssr.html`: 构建时基于 Vue SSR 的 HTML 模板文件。
- `docs/.vuepress/config.js`: 配置文件的入口文件，也可以是 `YML` 或 `toml`。
- `docs/.vuepress/enhanceApp.js`: 客户端应用的增强。



> 当你想要去自定义 `templates/ssr.html` 或 `templates/dev.html` 时，最好基于 [默认的模板文件](https://github.com/vuejs/vuepress/raw/branch/branch/master/packages/%40vuepress/core/lib/client/index.dev.html)来修改，否则可能会导致构建出错。



### 3.1 默认的页面路由

此处我们把 `docs` 目录作为 `targetDir` （参考 [命令行接口](https://vuepress.vuejs.org/zh/api/cli.html#基本用法)），下面所有的“文件的相对路径”都是相对于 `docs` 目录的。在项目根目录下的 `package.json` 中添加 `scripts` ：

```json
{
  "scripts": {
    "dev": "vuepress dev docs",
    "build": "vuepress build docs"
  }
}
```

对于上述的目录结构，默认页面路由地址如下：

| 文件的相对路径     | 页面路由地址   |
| ------------------ | -------------- |
| `/README.md`       | `/`            |
| `/guide/README.md` | `/guide/`      |
| `/config.md`       | `/config.html` |



## 4.配置VuePress首页面及目录映射规则简单示例

### 4.1 配置VuePress首页面

在 `docs/README.md` 中加入以下内容

```markdown
---
home: true
#heroImage: /hero.png
heroText: Hero 标题
tagline: Hero 副标题
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
# Hello VuePress
```



效果如下

![iShot2021-07-19 00.22.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-19%2000.22.09.png)

### 4.2 配置VuePress目录

在 `docs` 目录下创建一个目录 `test`

```shell
mkdir docs/test
```



写入内容

```shell
cat > docs/test/test.md <<EOF
# test
这是一个测试页面
EOF
```



浏览器访问 `IP:port/test/test.html`，效果如下

![iShot2021-07-19 00.38.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-19%2000.38.44.png)

> VuePress是以docs目录下的目录为映射路径的，即默认的根目录为docs



## 5.配置VuePress导航栏

### 5.1 配置VuePress导航栏logo

[VuePress1.x导航栏logo官方文档](https://v1.vuepress.vuejs.org/zh/theme/default-theme-config.html#%E5%AF%BC%E8%88%AA%E6%A0%8F-logo)

你可以通过 `themeConfig.logo` 增加导航栏 Logo ，Logo 可以被放置在[公共文件目录 `.vuepress/public`](https://v1.vuepress.vuejs.org/zh/guide/assets.html#public-files)：

```shell
# 创建 docs/.vuepress/ 目录
mkdir docs/.vuepress

# 创建 docs/.vuepress/config.js 文件
cat > docs/.vuepress/config.js <<EOF
module.exports = {
  themeConfig: {
    logo: '/assets/img/logo.png',
  }
}
EOF

# 这里的logo文件放置于/assets/img，也就是 docs/.vuepress/public/assets/img 目录下，因此需要创建目录，然后手动上传一个名为logo.png的图片到此目录下
mkdir -p docs/.vuepress/public/assets/img
```



效果如下

![iShot2021-07-19 00.58.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-19%2000.58.57.png)

### 5.2 配置VuePress导航栏链接

[VuePress1.x 导航栏链接官方文档](https://v1.vuepress.vuejs.org/zh/theme/default-theme-config.html#%E5%AF%BC%E8%88%AA%E6%A0%8F%E9%93%BE%E6%8E%A5)

#### 5.2.1 配置导航栏

配置示例

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    nav: [
      {
        text: 'Languages',
        ariaLabel: 'Language Menu',
        items: [
          { text: 'Chinese', link: '/language/chinese/' },
          { text: 'Japanese', link: '/language/japanese/' }
        ]
      }
    ]
  }
}
```



效果如下

![iShot2021-08-01 22.18.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2022.18.56.png)



此外，还可以使用items嵌套，语法如下

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    nav: [
      {
        text: 'Languages',
        items: [
          { text: 'Group1', items: [/*  */] },
          { text: 'Group2', items: [/*  */] }
        ]
      }
    ]
  }
}
```



使用示例

```js
// .vuepress/config.js
module.exports = {
    themeConfig: {
      nav: [
        {
          text: 'Languages',
          items: [
            { 
                text: 'Group1', 
                items: [
                    { text: 'Chinese', link: '/language/chinese/' },
                    { text: 'Japanese', link: '/language/japanese/' }
                ] 
            },
            { 
                text: 'Group2', 
                items: [
                    { text: 'Chinese', link: '/language/chinese/' },
                    { text: 'Japanese', link: '/language/japanese/' }
                ] 
            }
          ]
        }
      ]
    }
  }
```



效果如下

![iShot2021-08-01 22.49.36](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2022.49.36.png)

如果想要增加多个导航链接，写法如下

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' },
    ]
  }
}
```



效果如下

![iShot2021-08-01 23.00.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2023.00.37.png)

使用示例

```js
// .vuepress/config.js
module.exports = {
    themeConfig: {
      nav: [
        {
          text: 'linux',
          items: [
            { 
                text: 'linux基础命令', 
                items: [
                    { text: 'sed', link: '/language/chinese/' },
                    { text: 'awk', link: '/language/japanese/' }
                ] 
            },
            { 
                text: 'linux服务', 
                items: [
                    { text: 'nginx', link: '/language/chinese/' },
                    { text: 'ssh', link: '/language/japanese/' }
                ] 
            }
          ]
        },
        {
            text: 'python',
            items: [
              { 
                  text: 'python基础', 
                  items: [
                      { text: 'python基础1', link: '/language/chinese/' },
                      { text: 'python基础2', link: '/language/japanese/' }
                  ] 
              },
              { 
                  text: 'python框架', 
                  items: [
                      { text: 'django', link: '/language/chinese/' },
                      { text: 'flash', link: '/language/japanese/' }
                  ] 
              }
            ]
          }
      ]
    }
  }
```



效果如下

![iShot2021-08-01 23.05.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2023.05.17.png)

#### 5.2.2 禁用导航栏

禁用导航栏，语法如下

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    navbar: false
  }
}
```



在某个md文件中禁用导航栏

```markdown
---
navbar: false
---
```



例如，在 `docs/about/about.md` 文件中有如下内容

```markdown
# 你好
## 萨瓦迪卡
```



浏览器访问 `ip:port/about/about.html`

![iShot2021-08-01 23.13.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2023.13.23.png)

修改 `docs/about/about.md` 文件

```markdown
---
navbar: false
---
# 你好
## 萨瓦迪卡
```



浏览器再次访问 `ip:port/about/about.html`

![iShot2021-08-01 23.15.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-01%2023.15.39.png)

### 5.3 配置VuePress侧边栏

#### 5.3.1 自动生成侧边栏

在md文件中开头写入以下内容

```markdown
---
sidebar: auto
---
```



在全局 `config.js` 中配置

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: 'auto'
  }
}
```



使用示例

`docs/about/about.md` 文件内容如下

```markdown
---
navbar: false
---
# 你好
## 萨瓦迪卡

# 哈哈
## 呵呵

# 123
## jqk
```



浏览器访问 `ip:port/about/about.html`，效果如下

![iShot2021-08-02 20.30.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-02%2020.30.25.png)

编辑 `config.js` ，配置自动生成侧边栏

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: 'auto'
  }
}
```



效果如下

![iShot2021-08-02 20.34.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-02%2020.34.50.png)

#### 5.3.2 侧边栏分组

示例代码

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: [
      {
        title: 'Group 1',   // 必要的
        path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          '/'
        ]
      },
      {
        title: 'Group 2',
        children: [ /* ... */ ],
        initialOpenGroupIndex: -1 // 可选的, 默认值是 0
      }
    ]
  }
}
```



准备工作

```shell
# 在docs目录下新建多个目录，并在每个目录下编辑测试文件
mkdir -p linux

echo nginx > linux/nginx.md
echo ssh > linux/ssh.md
echo php > linux/php.md
```



代码

```js
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: [
      {
        title: 'Group 1',   // 必要的
        path: '/linux/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          '/linux/nginx.html',
          '/linux/ssh.html',
          '/linux/php.html',
        ]
      },
      {
        title: 'Group 2',
        children: [ /* ... */ ],
        initialOpenGroupIndex: -1 // 可选的, 默认值是 0
      }
    ]
  }
}
```



效果如下

![iShot2021-08-02 21.45.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-08-02%2021.45.28.png)
