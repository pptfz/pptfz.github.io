[toc]



### Command line instructions（命令行指令）

### You can also upload existing files from your computer using the instructions below.（您还可以使用下面的说明从您的计算机上载现有文件）

### Git global setup（git全局配置）

```shell
git config --global user.name "Administrator"
git config --global user.email "admin@example.com"


git本地配置
git config --local user.name "你的名字"
git config --local user.email "邮箱"
```

### Create a new repository（创建一个新的仓库）

```shell
git clone http://gitlab.example.com/root/python-exercise.git
cd python-exercise
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master
```

### Push an existing folder（推送现有文件夹）

```shell
cd existing_folder
git init
git remote add origin http://gitlab.example.com/root/python-exercise.git
git add .
git commit -m "Initial commit"
git push -u origin master
```

### Push an existing Git repository（推送现有git仓库）

```shell
cd existing_repo
git remote rename origin old-origin
git remote add origin http://gitlab.example.com/root/python-exercise.git
git push -u origin --all
git push -u origin --tags
```


