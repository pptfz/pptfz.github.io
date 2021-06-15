

# jenkins webhook







# 一、gitee jenkins webhook

本文参考于[码云官方教程](https://gitee.com/help/articles/4193#article-header2)

## 1.1 使用场景

> 个人博客为gitbook，远程代码仓库用的是gitee，之前的做法是本机推送代码到gitee，然后手动登陆服务器进行gitbook构建，现在想做成自动化，即本机只需要推送代码到gitee，然后自动触发在gitee中配置的jenkins webhook进行gitbook构建



## 1.2 简介

> Gitee Jenkins Plugin 是Gitee基于 [GitLab Plugin](https://github.com/jenkinsci/gitlab-plugin) 开发的 Jenkins 插件。用于配置 Jenkins 触发器，接受Gitee平台发送的 WebHook 触发 Jenkins 进行自动化持续集成或持续部署，并可将构建状态反馈回Gitee平台。



**目前支持的特性**

- 推送代码到Gitee时，由配置的 WebHook 触发 Jenkins 任务构建。
- 评论提交记录触发提交记录对应版本 Jenkins 任务构建
- 提交 Pull Request 到Gitee项目时，由配置的 WebHook 触发 Jenkins 任务构建，支持PR动作：新建，更新，接受，关闭，审查通过，测试通过。
- 支持 [ci-skip] 指令过滤 或者 [ci-build] 指令触发构建。
- 过滤已经构建的 Commit 版本，若是分支 Push，则相同分支Push才过滤，若是 PR，则是同一个PR才过滤。
- 按分支名过滤触发器。
- 正则表达式过滤可触发的分支。
- 设置 WebHook 验证密码。
- 构建后操作可配置 PR 触发的构建结果评论到Gitee对应的PR中。
- 构建后操作可配置 PR 触发的构建成功后可自动合并对应PR。
- 对于 PR 相关的所有事件，若 PR 代码冲突不可自动合并，则不触发构建；且若配置了评论到PR的功能，则评论到 PR 提示冲突。
- PR 评论可通过 WebHook 触发构建（可用于 PR 触发构建失败是便于从Gitee平台评论重新触发构建）
- 支持配置 PR 不要求必须测试时过滤触发构建。（可用于不需测试则不构建部署测试环境）
- 支持相同 PR 触发构建时，取消进行中的未完成构建，进行当前构建（相同 PR 构建不排队，多个不同 PR 构建仍需排队）



## 1.3 jenkins插件安装

### 1.3.1 在线安装

- 前往 Manage Jenkins -> Manage Plugins -> Available
- 右侧 Filter 输入： Gitee
- 下方可选列表中勾选 Gitee（如列表中不存在 Gitee，则点击 Check now 更新插件列表）
- 点击 Download now and install after restart

![iShot2021-06-15 14.35.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 14.35.59.png)



### 1.3.2 手动安装

- 从 [release](https://gitee.com/oschina/Gitee-Jenkins-Plugin/releases) 列表中进入最新发行版，下载对应的 XXX.hpi 文件
- 前往 Manage Jenkins -> Manage Plugins -> Advanced
- Upload Plugin File 中选择刚才下载的 XXX.hpi 点击 Upload
- 后续页面中勾选 Restart Jenkins when installation is complete and no jobs are running

![iShot2021-06-15 14.43.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 14.43.39.png)



## 1.4 插件配置

**第一步、前往 `Jenkins` -> `Manage Jenkins` -> `Configure System` -> `Gitee Configuration` -> `Gitee connections`**

**第二步、在 `Connection name` 中输入 `Gitee` 或者你想要的名字，`Gitee host URL` 中输入Gitee完整 URL地址：`https://gitee.com` （Gitee私有化客户输入部署的域名）**

![iShot2021-06-15 14.58.53](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 14.58.53.png)

**第三步、配置令牌，`Credentials` 中如还未配置 `Gitee APIV5 私人令牌`，点击 `Add` - > `Jenkins`**

- `Domin` 选择 `Global credentials`
- `Kind` 选择 `Gitee API Token`
- `Scope` 选择你需要的范围

- `Gitee APIV5 Token` 输入你的Gitee私人令牌，[获取地址](https://gitee.com/profile/personal_access_tokens)

- `ID` 、`Description` 中输入你想要的 ID 和描述即可

![iShot2021-06-15 15.22.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 15.22.54.png)



**第四步、`Credentials` 选择配置好的 `Gitee APIV5 Token`，点击 `Advanced` ，可配置是否忽略 SSL 错误（视您的Jenkins环境是否支持），并可设置链接测超时时间（视您的网络环境而定），最后点击 `Test Connection` 测试是否成功**

![iShot2021-06-15 15.32.42](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 15.32.42.png)



## 1.5 jenkins配置

### 1.5.1 新建构建任务

前往 `Jenkins` -> `New Item` , name 输入 `gitbook`，选择 `Freestyle project` 保存即可创建构建项目。

![iShot2021-06-15 15.42.48](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 15.42.48.png)



### 1.5.2 任务全局配置

任务全局配置中需要选择前一步中的Gitee链接。前往某个任务（如`gitbook`）的 `Configure` -> `General`，`Gitee connection` 中选择前面所配置的Gitee链接

![iShot2021-06-15 15.48.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 15.48.59.png)



### 1.5.3 源码管理配置

#### 1.5.3.1 创建凭据

在 `Manage Jenkins` -> `Manage Credentials` -> `Credentials` -> 选择 `Jenkins` 

![iShot2021-06-15 17.27.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 17.27.10.png)



选择  `全局凭据(unrestricted)`

![iShot2021-06-15 17.30.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 17.30.15.png)



选择 `Add Credentials`

![iShot2021-06-15 17.32.44](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 17.32.44.png)



#### 1.5.3.2 源码管理相关配置

前往某个任务（如 `gitbook` ）的 `Configure` -> `Source Code Management` 选项卡

- 输入你的仓库地址，例如 `git@your.gitee.server:gitee_group/gitee_project.git`

- 点击 `Advanced` 按钮，`Name` 字段中输入 `origin`， `Refspec` 字段输入 `+refs/heads/*:refs/remotes/origin/* +refs/pull/*/MERGE:refs/pull/*/MERGE`
  ，注意新版jenkins不再接受多条同时包含 `*` 通配符的refs描述，如只对push触发可写前半部分(`+refs/heads/*:refs/remotes/origin/*`)，如只对PR触发可只写后半段(`+refs/pull/*/MERGE:refs/pull/*/MERGE`)
- 凭据 `Credentials` 中请输入 git 仓库 `https` 地址对应的 `用户名密码` 凭据，或者 `ssh` 对应的 `ssh key` 凭据，注意 `Gitee API Token` 凭据不可用于源码管理的凭据，只用于 gitee 插件的 API 调用凭据
- `Branch Specifier` 选项
  - 对于单仓库工作流输入: `origin/${giteeSourceBranch}`
  - 对于 PR 工作流输入: `pull/${giteePullRequestIid}/MERGE`



![iShot2021-06-15 18.39.29](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 18.39.29.png)





### 1.5.4 触发器配置

#### 1.5.4.1 在giee中新建webhook

[gitee webhook官方文档](https://gitee.com/help/categories/40)



在gitee项目中的  `管理` 下选择  `WebHooks` ，新建webhook，URL在jenkins项目下的 `Build Tri` 中查看

![iShot2021-06-15 19.20.04](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 19.20.04.png)



gitee webhook中的url填写jenkins中 `Build Triggers` 下显示的地址

![iShot2021-06-15 19.12.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 19.12.37.png)





创建完成后的webhook

![iShot2021-06-15 19.21.07](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 19.21.07.png)



点击 `测试` 验证

![iShot2021-06-15 19.23.07](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-15 19.23.07.png)









#### 1.5.4.2 配置触发器构建

前往任务配置的触发器构建： `Configure` -> `Build Triggers` 选项卡







```
https://jenkins.pptfz.cn/gitee-project/gitbook
```



