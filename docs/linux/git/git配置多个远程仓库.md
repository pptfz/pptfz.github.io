# git配置多个远程仓库

## 背景说明

有些情况下我们需要将同一套代码推送到多个远程仓库，例如 `github` 、 `gitee` 、`gitlab` 等，这个时候就需要进行一些配置了



## 配置

### 添加远程仓库

查看当前的远程仓库配置

```bash
$ git remote -v
gitee	git@gitee.com:pptfz/docusaurus.git (fetch)
gitee	git@gitee.com:pptfz/docusaurus.git (push)
```



添加第二个远程仓库

```bash
git remote add github git@github.com:pptfz/docusaurus.git
```



再次查看查看当前的远程仓库配置

```bash
$ git remote -v
gitee	git@gitee.com:pptfz/docusaurus.git (fetch)
gitee	git@gitee.com:pptfz/docusaurus.git (push)
github	git@github.com:pptfz/docusaurus.git (fetch)
github	git@github.com:pptfz/docusaurus.git (push)
```



### 推送

#### 分别推送

```bash
git push gitee master
```



```bash
git push github master
```



#### 同时推送

编辑 `.git/config` 写入以下内容

```bash
[remote "all"]
        url = git@gitee.com:pptfz/docusaurus.git
        url = git@github.com:pptfz/docusaurus.git
```



使用以下命令同时推送到多个远程仓库

```bash
git push all master
```

