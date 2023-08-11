# docusaurus 安装

[docusaurus官网](https://docusaurus.io/)

[docusaurus github](https://github.com/facebook/docusaurus)



## 1.安装nodejs

[nodejs官网](https://nodejs.org/zh-cn)

[nodejs github](https://github.com/nodejs/node)



:::tip说明

docusaurus2.x版本需要16.14+版本的nodejs

:::

### 1.1 下载二进制包

```shell
export NODEJS_VERSION=16.20.2
wget https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz
```



### 1.2 解压缩

```shell
tar xf node-v${NODEJS_VERSION}-linux-x64.tar.xz -C /usr/local/
mv /usr/local/node-v${NODEJS_VERSION}-linux-x64 /usr/local/node-v${NODEJS_VERSION}
```



### 1.3 导出命名环境变量

```shell
echo "export PATH=$PATH:/usr/local/node-v${NODEJS_VERSION}/bin" > /etc/profile.d/nodejs.sh
source /etc/profile
```



## 2.安装docusaurus

[docusaurus官方安装文档](https://docusaurus.io/zh-CN/docs/installation)

### 2.1 创建目录

```shell
[ -d /docusaurus ] || mkdir /docusaurus 
cd /docusaurus 
```





### 2.2 安装最新版docusaurus

```shell
npx create-docusaurus@latest my-website classic
```



安装完成后会生成 `my-website` 目录，目录结构如下

![iShot_2022-06-22_17.24.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-06-22_17.24.06.png)

```
$ ll
total 904
-rw-r--r--   1 root root     89 Jun 22 17:14 babel.config.js
drwxr-xr-x   3 root root   4096 Jun 22 17:14 blog
drwxr-xr-x   4 root root   4096 Jun 22 17:14 docs
-rw-r--r--   1 root root   3736 Jun 22 17:14 docusaurus.config.js
drwxr-xr-x 686 root root  20480 Jun 22 17:17 node_modules
-rw-r--r--   1 root root   1011 Jun 22 17:14 package.json
-rw-r--r--   1 root root 864744 Jun 22 17:17 package-lock.json
-rw-r--r--   1 root root    770 Jun 22 17:14 README.md
-rw-r--r--   1 root root    727 Jun 22 17:14 sidebars.js
drwxr-xr-x   5 root root   4096 Jun 22 17:14 src
drwxr-xr-x   3 root root   4096 Jun 22 17:14 static
```





`docusaurus.config.js` 文件初始内容

```js
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-test-site.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'My Site',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
```



## 3.运行

:::tip说明

执行 `npm run start` 命令，可以通过 `--port 端口` 参数指定运行端口

```shell
npm run start --port 8080
```



可以通过如下命令修改默认监听地址(docusaurus默认监听在127.0.0.1)

```shell
npm run start -- --host 0.0.0.0
```

:::



docusaurus默认监听 `127.0.0.1:3000`

```shell
cd my-website
npm run start
```



浏览器输入 `IP:3000` 访问，初始页如下

![iShot_2022-06-22_20.55.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-06-22_20.55.17.png)





