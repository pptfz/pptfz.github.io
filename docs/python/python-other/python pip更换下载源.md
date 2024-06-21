# python pip更换下载源

[pypi官方网站](https://pypi.org/)



可以使用如下命令升级pip版本

```bash
pip install -i https://mirrors.cloud.tencent.com/pypi/simple --upgrade pip
```



## 下载源地址

```shell
阿里源
	https://mirrors.aliyun.com/pypi/simple
豆瓣源
	http://pypi.douban.com/simple
清华源
	https://pypi.tuna.tsinghua.edu.cn/simple
腾讯源
	https://mirrors.cloud.tencent.com/pypi/simple
```





## 配置下载源

### 临时使用

```bash
pip install xxx -i https://mirrors.aliyun.com/pypi/simple
```



### 永久配置

:::tip 说明

使用 `pip config set` 命令执行后，会在用户家目录下生成  `.config/pip` 目录，同时生成 `pip.conf` 文件，例如设置腾讯源后，`.config/pip/pip.conf` 文件内容如下

```bash
$ cat .config/pip/pip.conf
[global]
index-url = https://mirrors.cloud.tencent.com/pypi/simple

[install]
trusted-host = mirrors.cloud.tencent.com
```



如果不使用命令的话还可以通过新建  `~/.pip/pip.conf` 的方式

```sh
[global]
index-url = https://mirrors.cloud.tencent.com/pypi/simple

[install]
trusted-host = mirrors.cloud.tencent.com
```

:::



[阿里下载源](https://developer.aliyun.com/mirror/pypi?spm=a2c6h.13651102.0.0.34c01b11MWU1N7)

```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple
pip config set install.trusted-host mirrors.aliyun.com
```



[清华下载源](https://mirrors4.tuna.tsinghua.edu.cn/help/pypi/)

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn
```



[腾讯下载源](https://mirrors.cloud.tencent.com/help/pypi.html)

```bash
pip config set global.index-url https://mirrors.cloud.tencent.com/pypi/simple
pip config set install.trusted-host mirrors.cloud.tencent.com
```

