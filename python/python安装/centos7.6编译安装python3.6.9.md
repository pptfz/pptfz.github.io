[toc]



# centos7.6编译安装python3.6.9

[python各版本下载地址](https://www.python.org/ftp/python/)

## 1.安装依赖包

```python
yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel libffi-devel gcc gcc-c++ make
```



## 2.下载python包

```python
wget https://www.python.org/ftp/python/3.6.9/Python-3.6.9.tar.xz
```



## 3.解压缩包并编译安装

```python
tar xf Python-3.6.9.tar.xz && cd Python-3.6.9
./configure --prefix=/usr/local/python36 --with-ssl
make && make install
```



## 4.导出python命令环境变量

```python
echo 'PATH=/usr/local/python36/bin:$PATH' >/etc/profile.d/python36.sh && source /etc/profile
```

**⚠️如果把python环境变量写在/etc/profile.d/*.sh，在使用pip3安装的时候<span style=color:red>可能</span>会报错``Caused by SSLError("Can't connect to HTTPS URL because the SSL module is not available.",）``，但是导入到/etc/profile中就没有问题，<span style=color:red>不知道怎么解决，并且绝对不是网上说的openssl问题</span>**





## 5.配置pip国内源

```python
mkdir ~/.pip
cat >~/.pip/pip.conf<<EOF
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF
```



**pip更新**

```python
pip install --upgrade pip
或者
python -m pip install --upgrade pip 
```
