[toc]

# 编译安装python3



[python各版本下载地址](https://www.python.org/ftp/python/)

[python3官方文档](https://docs.python.org/zh-cn/3/)

[python3安装使用官方文档](https://docs.python.org/zh-cn/3/using/index.html)



## 1.安装依赖包

```shell
yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel libffi-devel gcc gcc-c++ make cmake
```



## 2.下载python源码包

编译安装CPython，需要先获取 [源代码](https://www.python.org/downloads/source/) 

```shell
export PYTHON_VERSION=3.12.3
wget https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tar.xz
```



## 3.解压缩包

```shell
tar xf Python-${PYTHON_VERSION}.tar.xz
```



## 4.编译安装

更多编译选项可参考 [官方文档](https://docs.python.org/zh-cn/3/using/configure.html)

:::tip 说明

要进行包含所有稳定优化（如 PGO，Profile Guided Optimization）在内的 Python 版本构建，可以使用 `./configure --enable-optimizations` 命令。这将确保 Python 在构建时启用所有稳定的优化，进而提升运行时的性能。

:::



:::danger 警告

`make install` 可以覆盖或伪装  `python3` 二进制文件。因此，建议使用 `make altinstall` 而不是 `make install` ，因为后者只安装了 `exec_prefix/bin/pythonversion`

:::

```shell
cd Python-${PYTHON_VERSION}
./configure --prefix=/usr/local/python${PYTHON_VERSION} --enable-optimizations
make -j`nproc` && make altinstall
```



## 5.导出python命令环境变量

```shell
echo "PATH=/usr/local/python${PYTHON_VERSION}/bin:$PATH" > /etc/profile.d/python${PYTHON_VERSION}.sh && source /etc/profile
```



## 6.更新pip命令

:::tip 说明

更新pip命令可以使用 `pip${PYTHON_VERSION} install --upgrade pip` 或者

`python${PYTHON_VERSION} -m pip install --upgrade pip`

:::

```shell
pip3.12 install --upgrade pip
或者
python3.12 -m pip install --upgrade pip
```

