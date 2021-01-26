# python虚拟环境 

# 为什么要创建python虚拟环境

> **python版本众多，部分版本功能差异较大，centOS7.5 默认python版本2.7.5，centOS6.9 默认python版本2.6.6，在使用过程中经常遇到第三方库依赖的python版本和系统python版本不一致的情况，同时又因系统底层需要调用当前版本python，所以不能随意变更当前系统python版本，如此情境下就会有python多版本共存的情况，因此python多环境管理工具应用而生**



# 一、pyenv

[pyenv github地址](https://github.com/pyenv/pyenv)

## 1.1 pyenv简介

> **pyenv是一个简单的python版本管理工具，以前叫做pythonbrew，这个工具可以方便切换全局python版本，安装多个不同的python版本，设置独立的某个文件夹或者工程目录特异的python版本，同时创建python虚拟环境**

## 1.2 pyenv原理

**pyenv作为python的版本管理工具，通过改变shell的环境变量来切换不同的python版本，以达到多版本共存的目的**

**1) pyenv安装后会在系统PATH中插入shims路径，每次执行python相关的可执行文件，会优先在shims里寻找python路径`~/.pyenv/shims:/usr/local/bin:/usr/bin:/bin`**

**2) 系统选择python版本，按照如下顺序选择python脚本**

​	**①shell变量设置(执行 `pyenv` 查看)**

​	**②当前可执行文件目录下的 `.python_version` 文件里的版本号(执行 `pyenv shell` 查看)**

​	**③上层目录查询找到的第一个 `.pyenv-version文件`**

​	**④全局的版本号在 `~/.pyenv/version` 文件内(执行 `pyenv global` 查看)**

**3) 确定版本文件的位置和python版本后，pyenv会根据版本号在 `~/.pyenv/versions/` 目录中查找对应的python版本，执行命令 `pyenv versions` 可查看系统目前安装的python版本**

## 1.3 部署pyenv

```python
# 1.克隆pyenv至root家目录
git clone git://github.com/yyuu/pyenv.git ~/.pyenv

# 2.修改环境变量
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc 
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

$ tail -3 ~/.bashrc
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# 3.使配置生效
source ~/.bashrc

# 4.测试安装是否正确，返回如下即表明正确
$ pyenv versions
* system (set by /root/.pyenv/version)

# 5.设置pip国内源
mkdir ~/.pip
cat > ~/.pip/pip.conf <<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF
```



## 1.4 通过oyenv管理多版本python

**pyenv命令语法**

> **Usage: pyenv <command> [<args>]**

```python
# 1.查看可安装的版本列表
pyenv install --list
会列出好多不同版本

# 2.安装依赖包
yum -y install python-pip python-devel gcc gcc-c++ zlib-devel libffi-devel bzip2-devel bzip2-libs readline readline-devel readline-static openssl openssl-devel openssl-static sqlite-devel

# 3.安装指定的python版本
$ pyenv install 3.7.1
Downloading Python-3.7.1.tar.xz...
-> https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tar.xz
Installing Python-3.7.1...
Installed Python-3.7.1 to /root/.pyenv/versions/3.7.1

# 4.切换当前目录python目录为3.7.1
//未切换前
$ python
Python 2.7.5 (default， Aug  7 2019， 00:51:29) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-39)] on linux2
Type "help"， "copyright"， "credits" or "license" for more information.
>>> 

//切换后
$ pyenv local 3.7.1
$ python
Python 3.7.1 (default， Feb 18 2020， 13:20:03) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-39)] on linux
Type "help"， "copyright"， "credits" or "license" for more information.

# 5.切换后刷新shims
pyenv rehash

# 6.切换回系统版本
pyenv global system
```

<h3>pyenv遇到的问题</h3>

<p style=color:red>1.pyenv global system切换失败，正常应该是回切换到系统默认的python2.7.5，但是切换失败，原因未知</p>

<p style=color:red>2.pyenv切换到安装的python版本后，会导致原先编译安装的python环境变量失效，例如，原先编译安装了python3.6，然后通过pyenv安装了python3.7，切换后会导致python3.6的环境变量失效，原因未知！！！</p>



# 二、virtualenv

## 2.1 virtualenv简介

> **python的第三方包很多，在一个python环境下开发时间越久，安装依赖越多，就越容易出现依赖包冲突问题，为了解决这个问题，virtualenv被开发出来，它可以搭建虚拟且独立的python环境，这样就可以使每个项目环境与其他项目独立开来，保持环境的干净，避免包冲突问题，另外，在开发python应用程序的时候，所有第三方的包都会被pip安装到系统python版本的site-packages目录下，如果要开发多个应用程序，那么这些程序会共用一个python，这意味着所有的包都安装在系统的python目录下，这不仅影响正常开发工作，还有可能因为随意变更系统python版本信息而造成系统不稳定，这种情况下，每个应用可能需要各自拥有一套独立的python运行环境，virtualenv就是用来为一个应用创建一套隔离的python运行环境的，virtualenv是底层基于python开发的python环境隔离工具，其通过虚拟目录的方式来实现多环境的并存**

## 2.2 virtualenv原理

> **在系统中创建工作目录，该目录类似安装系统的python目录，保留完整的python环境，解释器，标准库和第三方库等，当需要时，切换环境变量激活即可使用**



## 2.3 安装virtualenv

```python
# 1.安装python-pip和python-devel程序包
yum -y install python-pip python-devel

# 2.安装virtualenv
pip install virtualenv
```



## 2.4 通过virtualenv管理多python版本

> **virtualenv不是通过多版本管理的方式来实现系统同时兼容多python环境的，而是通过其在工作目录中虚拟完整的python环境来实现python多环境并存**

### 2.4.1 virtualenv命令用法说明

**virtualenv命令语法**

> **virtualenv [options] dest_dir**



| 选项                               | 说明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| --version                          | 显示当前版本号                                               |
| -h，--help                         | 显示帮助信息                                                 |
| -v，--verbose                      | 显示详细信息                                                 |
| -q，--quiet                        | 不显示详细信息                                               |
| -p PYTHON_EXE，--python=PYTHON_EXE | 指定所用的python解析器的版本，比如 --python=python2.5就是使用python2.5版本的解析器创建新的隔离环境，默认使用的是当前系统安装的python解析器(/usr/bin/python) |
| --clear                            | 清空非root用户的安装，并从头开始创建隔离环境                 |
| --no-site-packages                 | 令隔离环境不能访问系统全局的site-packages目录                |
| --system-site-packages             | 令隔离环境可以访问系统全局的site-packages目录                |
| --unzip-setuptools                 | 安装时解压setuptools或distribute                             |
| --relocatable                      | 重定位某个已存在的隔离环境，使用该选项将修正脚本，并令所有 .pth文件使用相应路径 |
| --distribute                       | 使用distribute代替setuptools，也可以设置环境变量 VIRTUALENV_DISTRIBUTE达到同样效果 |
| --extra-search-dir=SEARCH_DIRS     | 用于查找setuptools/distribute/pip发布包的目录，可以添加任意数量的 -extra-search-dir路径 |
| --never-dowload                    | 禁止从网上下载任何数据，此时，如果在本地搜索发布包失败，virtualenv就会报错 |
| --prompt==PROMPT                   | 定义隔离环境的命令行前缀                                     |



### 2.4.2 virtualenv创建python虚拟环境示例

**⚠️这里提前已经安装好python3.6**

```python
# 1.创建python虚拟工作目录，这里指定使用python3
virtualenv -p /usr/local/python36/bin/python3  /opt/venv1

# 2.加载虚拟环境
$ source /opt/venv1/bin/activate
(venv1) [root@test1 ~]# python
Python 3.6.9 (default， Feb 18 2020， 19:47:30) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-39)] on linux
Type "help"， "copyright"， "credits" or "license" for more information.
>>> 

# 3.查看当前python环境安装的包
(venv1) [root@test1 ~]# pip3 list
Package    Version
---------- -------
pip        20.0.2 
setuptools 45.2.0 
wheel      0.34.2 

# 4.退出虚拟环境
(venv1) [root@test ~]# deactivate 
[root@test2 ~]# 
```



# 三、virtualenvwrapper

## 3.1 virtualenvwrapper简介

> **鉴于virtualenv不便于对虚拟环境集中管理，所以推荐直接使用virtualenvwrapper，virtualenvwrapper提供了一系列命令使得和虚拟环境工作变得便利，它把你所有的虚拟环境都放在一个地方**



**virtualenvwrapper整体工作过程**

> **1.安装virtualenvwrapper**
>
> **2.在 `~/.bashrc` 文件中指定virtualenvwrapper存放虚拟环境总目录，指定virtualenvwrapper.sh存放位置(find查找)**
>
> **3. `mkvirtualenv` 命令创建python虚拟环境，`-p` 选项指定不同python版本命令路径**
>
> **4.  `workon` 命令切换不同python虚拟环境**



## 3.2 virtualenvwrapper配置过程

### 3.2.1 安装virtualenvwrapper(确保virtualenv已安装)

```python
pip install virtualenvwrapper
```



### 3.2.2 编辑环境变量

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



### 3.2.3 创建虚拟环境	``mkvirtualenv``

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

### 3.2.4 切换虚拟环境

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

### 3.2.5 其他操作

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

