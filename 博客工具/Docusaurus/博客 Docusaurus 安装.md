# 博客 Docusaurus 安装

[docusaurus官网](https://docusaurus.io/)

[docusaurus github](https://github.com/facebook/docusaurus)



# 1.安装nodejs



# 2.安装docusaurus



```
[ -d /docusaurus ] || mkdir docusaurus
npx create-docusaurus@latest my-website classic
```



```shell
$ npx create-docusaurus@latest my-website classic
Need to install the following packages:
  create-docusaurus@2.0.1
Ok to proceed? (y) y
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
[INFO] Creating new Docusaurus project...
[INFO] Installing dependencies with npm...
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility

added 1083 packages in 39s
[SUCCESS] Created my-website.
[INFO] Inside that directory, you can run several commands:

  `npm start`
    Starts the development server.

  `npm run build`
    Bundles your website into static files for production.

  `npm run serve`
    Serves the built website locally.

  `npm deploy`
    Publishes the website to GitHub pages.

We recommend that you begin by typing:

  `cd my-website`
  `npm start`

Happy building awesome websites!

npm notice 
npm notice New minor version of npm available! 8.15.0 -> 8.18.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v8.18.0
npm notice Run npm install -g npm@8.18.0 to update!
npm notice 
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





原先内容

```js
blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
```



修改为

```js
blog: {
          showReadingTime: true,
          path: "./blog",
          routeBasePath: "blog",
          include: ['*.md', '*.mdx'],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
          //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
```





# 3.运行

```
cd my-website
yarn run start
```



默认监听 `127.0.0.1:3000`



初始访问页

![iShot_2022-06-22_20.55.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-06-22_20.55.17.png)









```

```

