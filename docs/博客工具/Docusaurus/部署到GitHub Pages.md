# 部署到GitHub Pages

[docusaurus官方文档](https://docusaurus.io/zh-CN/docs/deployment#deploying-to-github-pages)

[github pages官方文档](https://docs.github.com/zh/pages)



## 访问说明

:::tip 说明

每个github仓库都关联有一个 [GitHub Pages](https://pages.github.com/) 服务

- 如果仓库名称是 `my-org/my-project` ，则访问的url是 `https://my-org.github.io/my-project/`
- 如果仓库名称是 `my-org/my-org.github.io` ，则访问的url是 `https://my-org.github.io/`

:::



## 配置 GitHub Pages

### 创建分支

这里我们定义代码源分支是 `master` ，发布分支是 `gh-pages`

:::tip 说明

使用 GitHub Actions 触发部署的过程中，涉及到2种分支，即 `源分支` 和 `部署分支` 

-  `源分支` : `源分支` 就是网站代码源所在的分支
- `部署分支` : `部署分支` 就是经过 GitHub Actions 构建后生成的静态文件分支

:::



### 配置GitHub Pages

在 `Settings` -> `Pages`  进行如下配置

- `Build and deployment` 下的 `Source` 选择 `Deploy from a branch`
- `Branch` 指定的是部署分支，即代码构建后生成的静态页面的分支，`/root` 是代码发布源的的入口文件目录

![iShot_2024-06-03_20.55.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-03_20.55.40.png)





在 `Build and deployment` 下的 `Source` 选择 `Deploy from a branch` 后，提交代码触发构建有如下报错

![iShot_2024-06-04_19.49.49](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-04_19.49.49.png)

![iShot_2024-06-04_19.48.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-04_19.48.17.png)



解决方法是将 `Deploy from a branch` 修改为 `GitHub Actions`



## 配置docusaurus

### 编辑配置文件 `docusaurus.config.js`

编辑 `docusaurus.config.js` 添加如下参数

```js
export default {
  // ...
  url: 'https://endiliey.github.io', // Your website URL
  baseUrl: '/',
  projectName: 'endiliey.github.io',
  organizationName: 'endiliey',
  deploymentBranch: 'gh-pages',
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



这些字段还具有更高优先级的环境变量对应项：`ORGANIZATION_NAME`、 `PROJECT_NAME`和 `DEPLOYMENT_BRANCH`。一些命令行环境变量如下

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

### 创建 `.nojekyl` 空文件

在 `static` 目录下创建 `.nojekyl` 空文件

```shell
touch static/.nojekyl
```



## 部署

### 手动部署

使用如下命令把网站部署到GitHub Pages上

:::tip 说明

如果在 `docusaurus.config.js` 没有配置 `deploymentBranch: 'gh-pages'` 一项，则需要使用 `DEPLOYMENT_BRANCH` 变量手动指定分支名称

```bash
DEPLOYMENT_BRANCH=gh-pages USE_SSH=true yarn deploy
```

:::

```shell
USE_SSH=true yarn deploy
```



### 自动部署

在代码根目录下创建 `.github/workflows` 目录，并创建 `deploy.yml` 和 `test-deploy.yml` 2个文件



:::tip 说明

[官方文档](https://docusaurus.io/docs/deployment#triggering-deployment-with-github-actions) 默认的配置文件中使用的是yarn，如果使用的是npm，则需要进行如下修改

```shell
cache: yarn -> cache: npm
yarn install --frozen-lockfile -> npm ci
yarn build -> npm run build
```

:::



`deploy.yml` 文件内容

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master
    # Review gh actions docs if you want to further define triggers, paths, etc
    # https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on

jobs:
  build:
    name: Build Docusaurus
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      # 使用yarn配置如下
      # - name: Install dependencies
      #   run: yarn install --frozen-lockfile
      # - name: Build website
      #   run: yarn build

      # 使用npm配置如下
      - name: Install dependencies
        run: npm ci
      - name: Build website
        run: npm run build

      - name: Upload Build Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    name: Deploy to GitHub Pages
    needs: build

    # Grant GITHUB_TOKEN the permissions required to make a Pages deployment
    permissions:
      pages: write # to deploy to Pages
      id-token: write # to verify the deployment originates from an appropriate source

    # Deploy to the github-pages environment
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```



`test-deploy.yml` 文件内容如下

```yaml
name: Test deployment

on:
  pull_request:
    branches:
      - master
    # Review gh actions docs if you want to further define triggers, paths, etc
    # https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on

jobs:
  test-deploy:
    name: Test deployment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      # 使用yarn配置如下
      # - name: Install dependencies
      #   run: yarn install --frozen-lockfile
      # - name: Test build website
      #   run: yarn build
      
      # 使用npm配置如下
      - name: Install dependencies
        run: npm ci
      - name: Test build website
        run: npm run build
```



配置完成后提交代码到指定分支就会自动触发 [GitHub Actions](https://docs.github.com/zh/actions) 从而更新网站内容

![iShot_2024-06-03_20.29.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-03_20.29.24.png)

![iShot_2024-06-03_20.29.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-03_20.29.57.png)



## 配置通知

如果我们想要配置构建成功后的通知，只需要在 `.github/workflows/deploy.yml` 文件中增加一个反馈通知即可



### 创建 `repository secrets`

:::tip 说明 

如果想要配置机器人通知，则需要在 `.github/workflows/deploy.yml` 文件中配置机器人的地址，但是GItHub Pages要求代码仓库必须是公开的，因此直接把机器人地址写在文件中不安全，为了解决这个问题可以在用github提供的 `repository secrets` 功能

 :::

通过如下步骤创建 `repository secrets`

`Settings` -> `Secrets and variables` -> `Actions` -> `Repository secrets` -> `New repository secrets`



![iShot_2024-06-03_21.27.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-03_21.27.40.png)



在这里我们可以创建一个 `secret` ，以企业微信机器人为例，健是 `WECHAT_WEBHOOK_KEY`  ， 值是企业微信机器人的 `Webhook key`

![iShot_2024-06-03_21.26.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-06-03_21.26.40.png)



### 编辑 `.github/workflows/deploy.yml` 文件

新增如下内容

```yml
      - name: Extract commit message
        id: extract_commit_message
        run: echo "COMMIT_MSG=$(git log -1 --pretty=%B | tr -d '\n')" >> $GITHUB_ENV

      - name: Send notification on success
        if: success()
        env:
          WEBHOOK_KEY: ${{ secrets.WECHAT_WEBHOOK_KEY }}
          COMMIT_MSG: ${{ env.COMMIT_MSG }}
        run: |
          TIMESTAMP=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
          curl -X POST -H 'Content-Type: application/json' \
          -d '{
                 "msgtype": "markdown",
                 "markdown": {
                  "content": "**发布结果通知**\n\n申请标题： '"${COMMIT_MSG}"'\n\n应用名称： docusaurus\n\n应用版本： master#${{ github.sha }}\n\n执行人员： Webhook\n\n发布结果： <font color=\"info\">成功</font>\n\n发布时间： '"${TIMESTAMP}"'\n\n> 来自 GitHub Actions"
                 }
              }' \
          https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WEBHOOK_KEY}

      - name: Send failure notification
        if: failure()
        env:
          WEBHOOK_KEY: ${{ secrets.WECHAT_WEBHOOK_KEY }}
          COMMIT_MSG: ${{ env.COMMIT_MSG }}
        run: |
          TIMESTAMP=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
          curl -X POST -H 'Content-Type: application/json' \
          -d '{
                "msgtype": "markdown",
                "markdown": {
                  "content": "**发布结果通知**\n\n申请标题： '"${COMMIT_MSG}"'\n\n应用名称： docusaurus\n\n应用版本： master#${{ github.sha }}\n\n执行人员： Webhook\n\n发布结果： <font color=\"waring\">失败</font>\n\n发布时间： '"${TIMESTAMP}"'\n\n> 来自 GitHub Actions"
                }
              }' \
          https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WEBHOOK_KEY}
```





`deploy.yml` 文件内容如下

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master
    # Review gh actions docs if you want to further define triggers, paths, etc
    # https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on

jobs:
  build:
    name: Build Docusaurus
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      # - name: Install dependencies
      #   run: yarn install --frozen-lockfile
      # - name: Build website
      #   run: yarn build

      - name: Install dependencies
        run: npm ci
      - name: Build website
        run: npm run build

      - name: Upload Build Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build
          
      - name: Extract commit message
        id: extract_commit_message
        run: echo "COMMIT_MSG=$(git log -1 --pretty=%B | tr -d '\n')" >> $GITHUB_ENV

      - name: Send notification on success
        if: success()
        env:
          WEBHOOK_KEY: ${{ secrets.WECHAT_WEBHOOK_KEY }}
          COMMIT_MSG: ${{ env.COMMIT_MSG }}
        run: |
          TIMESTAMP=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
          curl -X POST -H 'Content-Type: application/json' \
          -d '{
                 "msgtype": "markdown",
                 "markdown": {
                  "content": "**发布结果通知**\n\n申请标题： '"${COMMIT_MSG}"'\n\n应用名称： docusaurus\n\n应用版本： master#${{ github.sha }}\n\n执行人员： Webhook\n\n发布结果： <font color=\"info\">成功</font>\n\n发布时间： '"${TIMESTAMP}"'\n\n> 来自 GitHub Actions"
                 }
              }' \
          https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WEBHOOK_KEY}

      - name: Send failure notification
        if: failure()
        env:
          WEBHOOK_KEY: ${{ secrets.WECHAT_WEBHOOK_KEY }}
          COMMIT_MSG: ${{ env.COMMIT_MSG }}
        run: |
          TIMESTAMP=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
          curl -X POST -H 'Content-Type: application/json' \
          -d '{
                "msgtype": "markdown",
                "markdown": {
                  "content": "**发布结果通知**\n\n申请标题： '"${COMMIT_MSG}"'\n\n应用名称： docusaurus\n\n应用版本： master#${{ github.sha }}\n\n执行人员： Webhook\n\n发布结果： <font color=\"red\">失败</font>\n\n发布时间： '"${TIMESTAMP}"'\n\n> 来自 GitHub Actions"
                }
              }' \
          https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WEBHOOK_KEY}

  deploy:
    name: Deploy to GitHub Pages
    needs: build

    # Grant GITHUB_TOKEN the permissions required to make a Pages deployment
    permissions:
      pages: write # to deploy to Pages
      id-token: write # to verify the deployment originates from an appropriate source

    # Deploy to the github-pages environment
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

