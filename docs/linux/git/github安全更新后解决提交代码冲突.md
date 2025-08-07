# github安全更新后解决提交代码冲突



## github安全更新

### 更新提示

![iShot_2025-01-21_10.52.57](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-01-21_10.52.57.png)



### 创建安全更新

![iShot_2025-01-21_10.56.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-01-21_10.56.06.png)



### 更新完成

![iShot_2025-01-21_10.57.51](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-01-21_10.57.51.png)



### 合并mr

![iShot_2025-01-21_10.59.35](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-01-21_10.59.35.png)



## 提交报错

合并后，远程仓库中的文件内容就发生了变化，此时和本地仓库中的文件内容是不一致的，进行提交会报错

```shell
To github.com:xxx.git
 ! [rejected]          master -> master (fetch first)
error: failed to push some refs to 'github.com:xxx.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```



### 拉取远程变更

```
git fetch origin
```



### 检查差异

在合并之前，查看本地和远程分支的差异

```sh
git merge origin/main
```



可能会有如下提示，直接保存退出即可

```shell
Merge remote-tracking branch 'origin/main'
# Please enter a commit message to explain why this merge is necessary,
# especially if it merges an updated upstream into a topic branch.
#
# Lines starting with '#' will be ignored, and an empty message aborts
# the commit.
```



保存后提示如下

```shell
Merge made by the 'ort' strategy.
 package-lock.json | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)
```



### 合并远程分支

如果你的本地分支与远程分支存在冲突，执行合并命令

```shell
git merge origin/main
```



### 解决冲突

```shell
打开冲突文件，手动解决冲突。Git 会标记冲突区域（<<<<<<<, =======, >>>>>>>），你需要保留正确的代码，并删除冲突标记
```



### 重新提交

标记冲突解决完成后，重新提交代码即可