# 部署到GitHub Pages

[docusaurus官方文档](https://docusaurus.io/zh-CN/docs/deployment#deploying-to-github-pages)

[github pages官方文档](https://docs.github.com/zh/pages)



## 访问说明

:::tip 说明

每个github仓库都关联有一个 [GitHub Pages](https://pages.github.com/) 服务

- 如果仓库名称是 `my-org/my-project` ，则访问的url是 `https://my-org.github.io/my-project/`
- 如果仓库名称是 `my-org/my-org.github.io` ，则访问的url是 `https://my-org.github.io/`

:::



## 配置docusaurus

编辑 `docusaurus.config.js` 添加如下参数

```js
export default {
  // ...
  url: 'https://endiliey.github.io', // Your website URL
  baseUrl: '/',
  projectName: 'endiliey.github.io',
  organizationName: 'endiliey',
  trailingSlash: false,
  // ...
};
```



参数说明

| 参数               | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| `organizationName` | 拥有部署仓库的 GitHub 用户或组织。                           |
| `projectName`      | 部署仓库的名字。                                             |
| `deploymentBranch` | 部署分支的名称，对于不以 `.github.io`结尾的非组织仓库项目名来说，默认分支是 `'gh-pages'` ， 否则，它需要显式地作为配置字段或环境变量。 |



这些字段还具有具有更高优先级的环境变量对应项：`ORGANIZATION_NAME`、 `PROJECT_NAME`和 `DEPLOYMENT_BRANCH`。一些命令行环境变量如下

| 参数             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `USE_SSH`        | 设置为 `true` ，使用 SSH 而不是默认 HTTPS 连接到 GitHub 存储库，如果源存储库 URL 是 SSH URL（例如 `git@github.com:facebook/docusaurus.git`），`USE_SSH`则推断为 `true` |
| `GIT_USER`       | 对部署存储库具有推送访问权限的 GitHub 帐户的用户名。对于你自己的仓库，这一般会是你自己的 GitHub 用户名。不使用 SSH 时必填，使用 SSH 时则会被忽略。 |
| `GIT_PASS`       | git 用户的个人访问令牌（由 `GIT_USER`指定），以方便非交互式部署（例如持续部署） |
| `CURRENT_BRANCH` | 源分支。通常，分支将是 `main` 或`master`，但它可以是除 `gh-pages` 之外的任何分支。如果未为此变量设置任何内容，则将使用从`docusaurus deploy`中调用的当前分支。 |
| `GIT_USER_NAME`  | 推送到部署存储库时使用的 `git config user.name` 值           |
| `GIT_USER_EMAIL` | 推送到部署存储库时使用的 `git config user.email` 值          |



:::caution 注意

- GitHub Pages 默认为 Docusaurus 网址链接添加末尾斜杠。建议设置配置 `trailingSlash`（`true` 或 `false`， 而不是  `undefined`）
- 默认情况下，GitHub Pages 通过 Jekyll 运行已发布的文件。由于 Jekyll 将丢弃任何以 `_`开头的文件，因此建议您通过将名为 `.nojekyll` file 的空文件添加到您的 `static` 目录中来禁用 Jekyll。

:::



使用如下命令把网站部署到GitHub Pages上

```
DEPLOYMENT_BRANCH=master USE_SSH=true yarn deploy
```



