# 博客 Docusaurus 安装

[docusaurus官网](https://docusaurus.io/)

[docusaurus github](https://github.com/facebook/docusaurus)



# 1.安装nodejs



# 2.安装docusaurus



```
[ -d /docusaurus ] || mkdir docusaurus
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





