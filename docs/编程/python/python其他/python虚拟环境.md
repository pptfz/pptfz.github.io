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
| `-p PYTHON_EXE，--python=PYTHON_EXE` | 指定所用的python解析器的版本，比如 `--python=python2.5`就是使用python2.5版本的解析器创建新的隔离环境，默认使用的是当前系统安装的python解析器(`/usr/bin/python`) |
| `--clear`                            | 清空非root用户的安装，并从头开始创建隔离环境                 |
| `--no-site-packages`                 | 令隔离环境不能访问系统全局的 `site-packages` 目录            |
| `--system-site-packages`             | 令隔离环境可以访问系统全局的 `site-packages` 目录            |
| `--unzip-setuptools`                 | 安装时解压 `setuptools` 或 `distribute`                      |
| `--relocatable`                      | 重定位某个已存在的隔离环境，使用该选项将修正脚本，并令所有 .pth文件使用相应路径 |
| `--distribute`                       | 使用 `distribute` 代替 `setuptools` ，也可以设置环境变量  `VIRTUALENV_DISTRIBUTE` 达到同样效果 |
| `--extra-search-dir=SEARCH_DIRS`     | 用于查找 `setuptools/distribute/pip` 发布包的目录，可以添加任意数量的 `-extra-search-dir` 路径 |
| `--never-dowload`                    | 禁止从网上下载任何数据，此时，如果在本地搜索发布包失败，`virtualenv` 就会报错 |
| `--prompt==PROMPT`                   | 定义隔离环境的命令行前缀                                     |



#### 2.4.2 virtualenv创建python虚拟环境

:::tip 说明

virtualenv创建python虚拟环境需要提前安装好python3

:::



创建python虚拟工作目录，这里指定使用python3.12.3

```shell
$ virtualenv -p /usr/local/python3.12.3/bin/python3.12 /opt/venv1
created virtual environment CPython3.12.3.final.0-64 in 150ms
  creator CPython3Posix(dest=/opt/venv1, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, via=copy, app_data_dir=/root/.local/share/virtualenv)
    added seed packages: pip==24.1
  activators BashActivator,CShellActivator,FishActivator,NushellActivator,PowerShellActivator,PythonActivator
```



加载虚拟环境

```shell
$ source /opt/venv1/bin/activate
(venv1) [root@localhost.localdomain ~]# python
Python 3.12.3 (main, Jun 27 2024, 11:17:01) [GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```



查看当前python环境安装的包

```shell
$ pip3 list
Package Version
------- -------
pip     24.1
(venv1) [root@localhost.localdomain ~]# 
```



退出虚拟环境

```shell
(venv1) [root@localhost.localdomain ~]# deactivate 
[root@localhost.localdomain ~]# 
```



## 3.virtualenvwrapper

### 3.1 virtualenvwrapper简介

[virtualenvwrapper github](https://github.com/python-virtualenvwrapper/virtualenvwrapper)

[virtualenvwrapper官方文档](https://virtualenvwrapper.readthedocs.io/en/latest/)

:::tip 说明

鉴于 `virtualenv` 不便于对虚拟环境集中管理，所以推荐直接使用 [virtualenvwrapper](https://pypi.org/project/virtualenvwrapper/)，`virtualenvwrapper` 提供了一系列命令使得和虚拟环境工作变得便利，它把你所有的虚拟环境都放在一个地方

:::



**virtualenvwrapper整体工作过程**

:::tip 说明

1.安装 `virtualenvwrapper`

2.在 `~/.bashrc` 文件中指定 `virtualenvwrapper` 存放虚拟环境总目录，指定`virtualenvwrapper.sh` 存放位置(find或which查找)

3.`mkvirtualenv` 命令创建python虚拟环境，`-p` 选项指定不同python版本命令路径

4.`workon` 命令切换不同python虚拟环境

:::



### 3.2 virtualenvwrapper配置过程

#### 3.2.1 安装virtualenvwrapper

:::caution 注意

在安装 `virtualenvwrapper` 之前，需要确保 `virtualenv` 已安装

在安装 `virtualenvwrapper` 的时候，需要使用所安装的python路径下的pip

:::

例如我这里把python3安装在了 `/usr/local/python36`

```shell
/usr/local/python36/bin/pip3 install virtualenvwrapper
```



#### 3.2.2 编辑环境变量

:::tip 说明

需要查找一下 `virtualenvwrapper.sh` 所在位置，一般在 `/usr/bin` 下或者 `/usr/local/bin`

```shell
find / -name "virtualenvwrapper.sh"
```

或者

```shell
which virtualenvwrapper.sh
```

:::



向 `~/.bashrc` 中写入以下内容

```shell
echo "export WORKON_HOME=$HOME/.virtualenvs" >> ~/.bashrc
echo "source $(which virtualenvwrapper.sh)" >> ~/.bashrc
```



参数说明

| 参数                                         | 说明                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| `export WORKON_HOME=$HOME/.virtualenvs`      | `virtualenvwrapper` 存放虚拟环境目录，这里自定义在 `$HOME/.virtualenvs` |
| `source /usr/local/bin/virtualenvwrapper.sh` | `virtrualenvwrapper` 会安装到python的bin目录下，所以该路径是python安装目录下 `bin/virtualenvwrapper.sh` ，本文python安装在了 `/usr/local/python36` |



使配置生效

```shell
$ source .bashrc 
virtualenvwrapper.user_scripts creating /root/.virtualenvs/premkproject
virtualenvwrapper.user_scripts creating /root/.virtualenvs/postmkproject
virtualenvwrapper.user_scripts creating /root/.virtualenvs/initialize
virtualenvwrapper.user_scripts creating /root/.virtualenvs/premkvirtualenv
virtualenvwrapper.user_scripts creating /root/.virtualenvs/postmkvirtualenv
virtualenvwrapper.user_scripts creating /root/.virtualenvs/prermvirtualenv
virtualenvwrapper.user_scripts creating /root/.virtualenvs/postrmvirtualenv
virtualenvwrapper.user_scripts creating /root/.virtualenvs/predeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/postdeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/preactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/postactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/get_env_details
```





#### 3.2.3 创建虚拟环境

:::tip 说明

通过 `mkvirtualenv` 命令创建虚拟环境，不加 `-p` 参数是默认使用系统环境的python，`-p` 参数用于指定不同版本的python命令路径

因为指定了 `WORKON_HOME=$HOME/.virtualenvs` 所以创建的python虚拟环境都会在这个目录下

:::



```shell
$ mkvirtualenv venv1
created virtual environment CPython3.9.18.final.0-64 in 266ms
  creator CPython3Posix(dest=/root/.virtualenvs/venv1, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=/root/.local/share/virtualenv)
    added seed packages: pip==24.1, setuptools==70.1.0, wheel==0.43.0
  activators BashActivator,CShellActivator,FishActivator,NushellActivator,PowerShellActivator,PythonActivator
virtualenvwrapper.user_scripts creating /root/.virtualenvs/venv1/bin/predeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/venv1/bin/postdeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/venv1/bin/preactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/venv1/bin/postactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/venv1/bin/get_env_details
(venv1) [root@localhost.localdomain ~]# 
```



查看创建的虚拟环境，venv1就是刚刚创建的虚拟环境

```shell
$ ls -a .virtualenvs/
.   get_env_details  postactivate    postmkproject     postrmvirtualenv  predeactivate  premkvirtualenv  venv1
..  initialize       postdeactivate  postmkvirtualenv  preactivate       premkproject   prermvirtualenv
```





#### 3.2.4 切换虚拟环境

:::tip 说明

如果系统中存在多个版本的python，则在使用 `mkvirtualenv` 命令创建虚拟环境的时候，可以使用 `-p` 参数指定不同的python版本

:::



系统中安装了python3.12.3和python3.11.9，安装目录分别为 `/usr/local/python3.12.3` 、`/usr/local/python3.11.9`



创建第一个虚拟环境，指定python版本为3.11.9

```shell
$ mkvirtualenv -p /usr/local/python3.11.9/bin/python3.11 py3.11
created virtual environment CPython3.11.9.final.0-64 in 208ms
  creator CPython3Posix(dest=/root/.virtualenvs/py3.11, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=/root/.local/share/virtualenv)
    added seed packages: pip==24.1, setuptools==70.1.0, wheel==0.43.0
  activators BashActivator,CShellActivator,FishActivator,NushellActivator,PowerShellActivator,PythonActivator
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.11/bin/predeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.11/bin/postdeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.11/bin/preactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.11/bin/postactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.11/bin/get_env_details
(py3.11) [root@localhost.localdomain ~]# 
```



创建第二个虚拟环境，指定python版本为3.12.3

```shell
$ mkvirtualenv -p /usr/local/python3.12.3/bin/python3.12 py3.12
created virtual environment CPython3.12.3.final.0-64 in 107ms
  creator CPython3Posix(dest=/root/.virtualenvs/py3.12, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, via=copy, app_data_dir=/root/.local/share/virtualenv)
    added seed packages: pip==24.1
  activators BashActivator,CShellActivator,FishActivator,NushellActivator,PowerShellActivator,PythonActivator
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.12/bin/predeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.12/bin/postdeactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.12/bin/preactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.12/bin/postactivate
virtualenvwrapper.user_scripts creating /root/.virtualenvs/py3.12/bin/get_env_details
(py3.12) [root@localhost.localdomain ~]# 
```



切换虚拟环境

:::tip 说明

执行 `workon` 命令切换虚拟环境

:::

切换到python3.11

```python
$ workon py3.11
(py3.11) [root@localhost.localdomain ~]# python
Python 3.11.9 (main, Jun 27 2024, 19:39:48) [GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```



切换到python3.12

```python
$ workon py3.12
(py3.12) [root@localhost.localdomain ~]# python
Python 3.12.3 (main, Jun 27 2024, 19:34:57) [GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```







#### 3.2.5 其他操作

##### 查看当前创建的虚拟环境

```
$ workon 
py3.11
py3.12
venv1
```



##### 退出虚拟环境

:::tip 说明

执行命令 `deactivate` 退出虚拟环境

:::

```shell
$ deactivate 
[root@localhost.localdomain ~]# python
Python 3.9.18 (main, Jan 24 2024, 00:00:00) 
[GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```



##### 删除虚拟环境

:::tip 说明

执行命令 `rmvirtualenv` 可以删除虚拟环境

:::

```shell
$ rmvirtualenv env1
Removing env1...
Did not find environment /root/.virtualenvs/env1 to remove.
```



