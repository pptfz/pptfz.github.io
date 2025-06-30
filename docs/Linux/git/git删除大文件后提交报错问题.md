

# git删除大文件后提交报错问题

## git提交报错

git提交报错，原因是github限制单个文件不能超过100M，但是当把超过100M的文件 (这里是 `优点知识学习文档及代码/go运维开发训练营第3期/学习课件/Go开发环境准备.zip`) 删除后重新提交，依然有报错

```shell
Enumerating objects: 2952, done.
Counting objects: 100% (2952/2952), done.
Delta compression using up to 12 threads
Compressing objects: 100% (2878/2878), done.
Writing objects: 100% (2952/2952), 477.04 MiB | 2.04 MiB/s, done.
Total 2952 (delta 1109), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1109/1109), done.
remote: error: Trace: b921c775e0e6db45dcd2d6cd550b93f7938e9aeb185ff2c1add4460f2e3d7845
remote: error: See https://gh.io/lfs for more information.
remote: error: File 优点知识学习文档及代码/go运维开发训练营第3期/学习课件/Go开发环境准备.zip is 405.67 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
To github.com:pptfz/study.git
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'github.com:pptfz/study.git'
```





## 解决方法

### 确认文件已删除

```shell
$ git rm --cached "优点知识学习文档及代码/go运维开发训练营第3期/学习课件/Go开发环境准备.zip"

$ git commit -m "Remove large file"
```





### 使用 `git filter-branch` 清理历史

```shell
$ git filter-branch --index-filter \
'git rm --cached --ignore-unmatch "优点知识学习文档及代码/go运维开发训练营第3期/学习课件/Go开发环境准备.zip"' \
--prune-empty --tag-name-filter cat -- --all
WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.

Proceeding with filter-branch...

Rewrite 3239257a2644baae7f70b5d04aecff7576c4e1fc (1/2) (0 seconds passed, remaining 0 predicted)    rm '优点知识学习文档及代码/go运维开发训练营第3期/学习课件/Go开发环境准备.zip'
Rewrite 45c7c3cd67c200385e7887a15fa96e7b236ee675 (2/2) (0 seconds passed, remaining 0 predicted)    
Ref 'refs/heads/main' was rewritten
Ref 'refs/heads/master' was rewritten
```



### 强制将本地 `master` 分支的最新状态推送到远程仓库，覆盖远程历史记录

:::tip 说明

- `git push origin master`：将 `master` 分支推送到 `origin`（远程仓库）

- `--force`：强制 push，即使远程仓库的历史和本地不一致

:::

```shell
git push origin master --force
```



本方法适用于无他人协作的场景，即本仓库只有自己使用或者作为测试性的仓库，生产环境中涉及到多人协作则不建议这么做





