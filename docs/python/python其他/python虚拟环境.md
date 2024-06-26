[toc]



# python虚拟环境 

## 1.pyenv

[pyenv github地址](https://github.com/pyenv/pyenv)

### 1.1 pyenv简介

:::tip 说明

pyenv是一个简单的python版本管理工具，可以在多个python版本之间进行切换

:::



### 1.2 安装pyenv

[pyenv-installer](https://github.com/pyenv/pyenv-installer) 是一个用于安装pyenv的工具



#### 1.2.1 通过脚本安装

:::tip 说明

通过执行 `curl https://pyenv.run | bash` 安装的是最新版的pyenv，如果想要安装指定版本，可以设置环境变量，例如 `export PYENV_GIT_TAG=v2.2.5`

:::

```shell
curl https://pyenv.run | bash
```

上边的调用相当于如下

```
curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash
```



安装完成后会在 `$HOME` 生成 `.pyenv` 目录

```sh
$ ls -a .pyenv
.   .agignore  CHANGELOG.md  completions  CONTRIBUTING.md  .dockerignore  .git     .gitignore  LICENSE         Makefile  plugins  README.md  terminal_output.png  .vimrc
..  bin        COMMANDS.md   CONDUCT.md   Dockerfile       .editorconfig  .github  libexec     MAINTENANCE.md  man       pyenv.d  src        test
```



完整输出如下

```shell
 % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   270  100   270    0     0     85      0  0:00:03  0:00:03 --:--:--    85
Cloning into '/root/.pyenv'...
remote: Enumerating objects: 1259, done.
remote: Counting objects: 100% (1259/1259), done.
remote: Compressing objects: 100% (696/696), done.
remote: Total 1259 (delta 743), reused 714 (delta 430), pack-reused 0
Receiving objects: 100% (1259/1259), 623.93 KiB | 0 bytes/s, done.
Resolving deltas: 100% (743/743), done.
Cloning into '/root/.pyenv/plugins/pyenv-doctor'...
remote: Enumerating objects: 11, done.
remote: Counting objects: 100% (11/11), done.
remote: Compressing objects: 100% (9/9), done.
remote: Total 11 (delta 1), reused 5 (delta 0), pack-reused 0
Unpacking objects: 100% (11/11), done.
Cloning into '/root/.pyenv/plugins/pyenv-update'...
remote: Enumerating objects: 10, done.
remote: Counting objects: 100% (10/10), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 10 (delta 1), reused 5 (delta 0), pack-reused 0
Unpacking objects: 100% (10/10), done.
Cloning into '/root/.pyenv/plugins/pyenv-virtualenv'...
remote: Enumerating objects: 64, done.
remote: Counting objects: 100% (64/64), done.
remote: Compressing objects: 100% (56/56), done.
remote: Total 64 (delta 10), reused 30 (delta 1), pack-reused 0
Unpacking objects: 100% (64/64), done.

WARNING: seems you still have not added 'pyenv' to the load path.

# Load pyenv automatically by appending
# the following to 
# ~/.bash_profile if it exists, otherwise ~/.profile (for login shells)
# and ~/.bashrc (for interactive shells) :

export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Restart your shell for the changes to take effect.

# Load pyenv-virtualenv automatically by adding
# the following to ~/.bashrc:

eval "$(pyenv virtualenv-init -)"
```



#### 1.2.2 通过git安装

```shell
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
```



### 1.3 配置pyenv环境变量

[官方文档](https://github.com/pyenv/pyenv#set-up-your-shell-environment-for-pyenv)



将如下内容添加到相应的环境变量文件中

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="bash" label="bash" default>

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
```

  </TabItem>
  <TabItem value="zsh" label="zsh">

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
```

  </TabItem>
</Tabs>



使配置生效

```shell
exec "$SHELL"
```



测试安装是否正确，返回如下即表明正确

```shell
$ pyenv versions
* system (set by /root/.pyenv/version)
```



### 1.4 通过pyenv管理多版本python

[pyenv命令官方文档](https://github.com/pyenv/pyenv/blob/master/COMMANDS.md)



**pyenv命令语法**

`Usage: pyenv <command> [<args>]`





#### 1.4.1 安装指定的python版本

查看可安装的python版本列表

```shell
pyenv install --list
```



安装指定版本的python

:::tip 说明

[在安装新版本python之前需要先安装python构建依赖项](https://github.com/pyenv/pyenv/wiki#suggested-build-environment)

```shell
yum -y install gcc make patch zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel xz-devel
```

:::

```shell
$ pyenv install 3.12.3
Downloading Python-3.12.3.tar.xz...
-> https://www.python.org/ftp/python/3.12.3/Python-3.12.3.tar.xz
Installing Python-3.12.3...
Installed Python-3.12.3 to /root/.pyenv/versions/3.12.3
```



#### 1.4.2 切换python版本

通过执行 `pyenv global` 进行切换

```shell
$ pyenv global 3.12.3
$ python
Python 3.12.3 (main, Jun 26 2024, 17:25:44) [GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```



切换后刷新shims

```shell
pyenv rehash
```



切换回系统版本

```shell
pyenv global system
```



#### 1.4.3 查看安装的python版本

查看安装的所有python版本

```shell
$ pyenv versions
* system (set by /root/.pyenv/version)
  3.11.6
  3.12.3
```



查看当前使用的python版本

```shell
$ pyenv version
3.12.3 (set by /Users/pptfz/.pyenv/version)
```



## 2.virtualenv

[virtualenv github](https://github.com/pypa/virtualenv)

### 2.1 virtualenv简介

:::tip 说明

`virtualenv` 是创建隔离python环境的工具，通过虚拟目录的方式来实现多环境的并存

:::



### 2.2 virtualenv原理

:::tip 说明

virtualenv通过在系统中创建工作目录，该目录类似安装系统的python目录，保留完整的python环境，解释器，标准库和第三方库等，当需要时，切换环境变量激活即可使用

:::



### 2.3 安装virtualenv

virtualenv的安装方式有很多，具体可以查看[官方安装文档](https://virtualenv.pypa.io/en/latest/installation.html) ，这里选择其中一种安装方式

安装python-pip和python-devel程序包

```shell
yum -y install python-pip python-devel
```



安装virtualenv

```
pip install virtualenv
```



查看版本

```shell
$ virtualenv --version
virtualenv 20.26.3 from /usr/local/lib/python3.9/site-packages/virtualenv/__init__.py
```



### 2.4 通过virtualenv管理多python版本

:::tip 说明

`virtualenv` 不是通过多版本管理的方式来实现系统同时兼容多python环境的，而是通过其在工作目录中虚拟完整的python环境来实现python多环境并存的

:::



#### 2.4.1 virtualenv命令用法说明

**virtualenv命令语法**

`virtualenv [options] dest_dir`

选项说明

| 选项                                 | 说明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `--version`                          | 显示当前版本号                                               |
| `-h，--help`                         | 显示帮助信息                                                 |
| `-v，--verbose`                      | 显示详细信息                                                 |
| `-q，--quiet`                        | 不显示详细信息                                               |
| `-p PYTHON_EXE，--python=PYTHON_EXE` | 指定所用的python解析器的版本，比如 --python=python2.5就是使用python2.5版本的解析器创建新的隔离环境，默认使用的是当前系统安装的python解析器(/usr/bin/python) |
| `--clear`                            | 清空非root用户的安装，并从头开始创建隔离环境                 |
| `--no-site-packages`                 | 令隔离环境不能访问系统全局的site-packages目录                |
| `--system-site-packages`             | 令隔离环境可以访问系统全局的site-packages目录                |
| `--unzip-setuptools`                 | 安装时解压setuptools或distribute                             |
| `--relocatable`                      | 重定位某个已存在的隔离环境，使用该选项将修正脚本，并令所有 .pth文件使用相应路径 |
| `--distribute`                       | 使用distribute代替setuptools，也可以设置环境变量 VIRTUALENV_DISTRIBUTE达到同样效果 |
| `--extra-search-dir=SEARCH_DIRS`     | 用于查找setuptools/distribute/pip发布包的目录，可以添加任意数量的 -extra-search-dir路径 |
| `--never-dowload`                    | 禁止从网上下载任何数据，此时，如果在本地搜索发布包失败，virtualenv就会报错 |
| `--prompt==PROMPT`                   | 定义隔离环境的命令行前缀                                     |



#### 2.4.2 virtualenv创建python虚拟环境示例

**这里提前已经安装好python3.6**

创建python虚拟工作目录，这里指定使用python3

```shell
virtualenv -p /usr/local/python36/bin/python3  /opt/venv1
```



加载虚拟环境

```shell
$ source /opt/venv1/bin/activate
(venv1) [root@test1 ~]# python
Python 3.6.9 (default， Feb 18 2020， 19:47:30) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-39)] on linux
Type "help"， "copyright"， "credits" or "license" for more information.
>>> 
```



查看当前python环境安装的包

```shell
(venv1) [root@test1 ~]# pip3 list
Package    Version
---------- -------
pip        20.0.2 
setuptools 45.2.0 
wheel      0.34.2 
```



退出虚拟环境

```shell
(venv1) [root@test ~]# deactivate 
[root@test ~]# 
```



## 三、virtualenvwrapper

### 3.1 virtualenvwrapper简介

> **鉴于virtualenv不便于对虚拟环境集中管理，所以推荐直接使用virtualenvwrapper，virtualenvwrapper提供了一系列命令使得和虚拟环境工作变得便利，它把你所有的虚拟环境都放在一个地方**



**virtualenvwrapper整体工作过程**

> **1.安装virtualenvwrapper**
>
> **2.在 `~/.bashrc` 文件中指定virtualenvwrapper存放虚拟环境总目录，指定virtualenvwrapper.sh存放位置(find查找)**
>
> **3. `mkvirtualenv` 命令创建python虚拟环境，`-p` 选项指定不同python版本命令路径**
>
> **4.  `workon` 命令切换不同python虚拟环境**



### 3.2 virtualenvwrapper配置过程

#### 3.2.1 安装virtualenvwrapper(确保virtualenv已安装)

```python
pip install virtualenvwrapper
```



#### 3.2.2 编辑环境变量

`virtualenvwrapper.sh` 需要find查找一下  `find / -name "virtualenvwrapper.sh"`

一般在  `/usr/bin` 下或者 `/usr/local/bin`

```python
# 1.向~/.bashrc中写入以下内容
echo "export WORKON_HOME=/opt/virtualenvwrapper" >> ~/.bashrc
echo "source /usr/bin/virtualenvwrapper.sh" >> ~/.bashrc

# 2.使配置生效
source ~/.bashrc


# 参数说明
# virtualenvwrapper存放虚拟环境目录，这里自定义在/opt/virtualenvwrapper
export WORKON_HOME=/opt/virtualenvwrapper

# virtrualenvwrapper会安装到python的bin目录下，所以该路径是python安装目录下bin/virtualenvwrapper.sh，本文python安装在了/usr/local/
source /usr/bin/virtualenvwrapper.sh
```



#### 3.2.3 创建虚拟环境	``mkvirtualenv``

```python
# 1.因为在3.2.2中指定了WORKON_HOME=/opt/virtualenvwrapper，所以创建的python虚拟环境都会在这个目录下
$ mkvirtualenv -p /usr/local/python36/bin/python3 venv1
created virtual environment in 200ms CPython3Posix(dest=/opt/virtualenvwrapper/venv1， clear=False， global=False) with seeder FromAppData pip=latest setuptools=latest wheel=latest app_data_dir=/root/.local/share/virtualenv/seed-v1 via=copy
virtualenvwrapper.user_scripts creating /opt/virtualenvwrapper/venv1/bin/predeactivate
virtualenvwrapper.user_scripts creating /opt/virtualenvwrapper/venv1/bin/postdeactivate
virtualenvwrapper.user_scripts creating /opt/virtualenvwrapper/venv1/bin/preactivate
virtualenvwrapper.user_scripts creating /opt/virtualenvwrapper/venv1/bin/postactivate
virtualenvwrapper.user_scripts creating /opt/virtualenvwrapper/venv1/bin/get_env_details
(venv1) [root@test1 ~]# 

# 2.查看创建的虚拟环境，venv1就是刚刚创建的虚拟环境
$ ls /opt/virtualenvwrapper/
get_env_details  postmkproject     predeactivate    venv1
initialize       postmkvirtualenv  premkproject     
postactivate     postrmvirtualenv  premkvirtualenv
postdeactivate   preactivate       prermvirtualenv
```

#### 3.2.4 切换虚拟环境

```python
# 1.先创建两个虚拟环境，并指定python版本
[root@test1 ~]# mkvirtualenv -p /usr/bin/python py2		
[root@test1 ~]# mkvirtualenv -p /usr/local/python36/bin/python3 py3

# 2.切换虚拟环境
[root@test1 ~]# workon py2			
(py2) [root@test1 ~]# python -V
Python 2.7.5

[root@test1 ~]# workon py3
(py3) [root@test1 ~]# python -V
Python 3.6.9
```

#### 3.2.5 其他操作

```python
# 1.查看当前的虚拟环境目录，即通过mkvirtualenv命令创建的venv虚拟环境
[root@test1 ~]# workon 		
py2
py3

# 2.退出虚拟环境
(py3) [root@test1 ~]# deactivate 
[root@test1 ~]#

# 3.删除虚拟环境
[root@test1 ~]# rmvirtualenv py2
Removing py2...
```

