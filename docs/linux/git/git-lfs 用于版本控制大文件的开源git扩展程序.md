# git-lfs 用于版本控制大文件的开源git扩展程序



git提交报错，原因是github限制单个文件不得大于100M

```shell
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 12 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 89.34 MiB | 2.76 MiB/s, done.
Total 4 (delta 0), reused 0 (delta 0), pack-reused 0
remote: error: Trace: 6a0adbfe8bf64ae8311f54ce09591384c6670642a7bf50cd919bcd665a3a1f25
remote: error: See https://gh.io/lfs for more information.
remote: error: File kvm/Linux KVM虚拟化架构实战指南.pdf is 100.06 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
To github.com:pptfz/book-pdf.git
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'github.com:pptfz/book-pdf.git'
```





## `git-lfs` 简介

[git-lfs官网](https://git-lfs.com/)

[git-lfs github](https://github.com/git-lfs/git-lfs)



`git-lfs` 是一个用于版本控制大文件的开源git扩展程序，Git大文件存储（LFS）替换了大型文件，例如音频示例，视频，数据集和图形，并带有git中的文本指针，同时将文件内容存储在 `github.com` 或 `github Enterprise` 等远程服务器上





## 安装 `git-lfs`

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="mac" label="mac" default>

```shell
brew install git-lfs
```

  </TabItem>
  <TabItem value="linux" label="linux">

[linux安装](https://github.com/git-lfs/git-lfs/blob/main/INSTALLING.md)

  </TabItem>
</Tabs>





## 配置 `git-lfs`

### 启用 Git LFS

```shell
git lfs install
```



### 告诉 Git LFS 要追踪的文件

:::tip 说明

这会在仓库中创建 `.gitattributes` 文件，表示所有 `.pdf` 文件都用 LFS 存储

```shell
$ cat .gitattributes
*.pdf filter=lfs diff=lfs merge=lfs -text
```

:::

:::caution 注意

`git lfs track "*.pdf"` 只需要执行一次，之后提交 `*.pdf` 文件时，git会自动使用 LFS

当要 **跟踪新的文件类型**（例如 `.zip`、`.mp4`）时才需要再次运行 `git lfs track`

```shell
git lfs track "*.zip"
git lfs track "*.mp4"
git add .gitattributes
git commit -m "Add LFS tracking for ZIP & MP4"
git push origin master
```

:::

```shell
git lfs track "*.pdf"
```



### 追踪 `.gitattributes`

:::caution 注意

此命令只需要执行一次

:::

```shell
git add .gitattributes
git commit -m "Enable LFS for PDF files"
```



## 重新提交

```shell
git add .
git commit -m 'xxx'
git push origin master
```



## 注意事项

使用git lfs是有存储限制的，具体  [查看 Git LFS 存储使用情况官方文档](https://docs.github.com/zh/billing/managing-billing-for-your-products/managing-billing-for-git-large-file-storage/viewing-your-git-large-file-storage-usage) ，如果超出限制则会报错如下

```shell
batch response: This repository is over its data quota. Account responsible for LFS bandwidth should purchase more data packs to restore access.
Uploading LFS objects:   0% (0/13), 0 B | 0 B/s, done.
error: failed to push some refs to 'github.com:pptfz/book-pdf.git'
```

