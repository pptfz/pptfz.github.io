

# git删除大文件后提交报错问题

## git提交报错

git提交报错，原因是github限制单个文件不能超过100M，但是当把超过100M的文件(这里是 `kvm/Linux KVM虚拟化架构实战指南.pdf`)删除后重新提交，依然有报错

```shell
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 12 threads
Compressing objects: 100% (7/7), done.
Writing objects: 100% (8/8), 114.38 MiB | 2.90 MiB/s, done.
Total 8 (delta 0), reused 7 (delta 0), pack-reused 0
remote: error: Trace: 2362d8450ce03b71b9b7bbf30b488300ecb90b6e91253062ae802dcd5d861666
remote: error: See https://gh.io/lfs for more information.
remote: error: File kvm/Linux KVM虚拟化架构实战指南.pdf is 100.06 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
To github.com:pptfz/book-pdf.git
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'github.com:pptfz/book-pdf.git'
```





## 解决方法

1.立即清除所有git引用日志（reflog），防止git保留删除的对象

:::tip 说明

- `git reflog expire`：让git的引用日志（reflog）过期

- `--expire=now`：立即让所有旧的 reflog 记录失效

- `--all`：作用于所有分支，而不仅仅是当前分支
   **注意**：这会导致 Git 不再保留被删除的提交，无法通过 `git reflog` 恢复

:::

```shell
git reflog expire --expire=now --all
```



2.清理git存储中的无用对象，彻底删除不再被引用的提交

:::tip 说明

- `git gc`（garbage collection）：执行git的垃圾回收。

- `--prune=now`：立即删除所有不再被引用的git对象（包括已删除但未被 push 的文件）。

- `--aggressive`：使用更强力的优化方式，彻底压缩和清理git仓库

:::

```shell
git gc --prune=now --aggressive
```



3.强制将本地 `master` 分支的最新状态推送到远程仓库，覆盖远程历史记录

:::tip 说明

- `git push origin master`：将 `master` 分支推送到 `origin`（远程仓库）

- `--force`：强制 push，即使远程仓库的历史和本地不一致

:::

```shell
git push origin master --force
```



本方法适用于无他人协作的场景，即本仓库只有自己使用或者作为测试性的仓库，生产环境中涉及到多人协作则不建议这么做





