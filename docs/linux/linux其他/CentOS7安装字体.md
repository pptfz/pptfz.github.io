# CentOS7安装字体

## 1.验证目录是否存在

查看 `/usr/share/` 下是否有 `fonts` 和 `fontconfig` 目录，如果没有执行命令 `yum -y install fontconfig` 安装



## 2.上传字体

在 `/usr/share/fonts` 下新建一个目录，以便和系统区分

```sh
cd /usr/share/fonts
mkdir chinese
```



在windows中 `C:\Windows\Fonts` 目录下找到相应的字体，并上传字体到 `/usr/share/fonts/chinese` 下，然后修改字体权限为600，这里选择微软雅黑 `MSYH.TTC` 

```sh
chmod 644 MSYH.TTC
```



## 3.修改配置文件

安装ttmkfdir

```sh
yum -y install ttmkfdir
ttmkfdir -e /usr/share/X11/fonts/encodings/encodings.dir
```



修改配置文件 `/etc/fonts/fonts.conf`，在 `Font directory` 下增加如下配置

```sh
<dir>/usr/share/fonts/chinese</dir>
```



## 4.验证安装是否成功

```sh
# 刷新
fc-cache           

# 验证安装是否成功，这里过滤我们在/usr/share/fonts新建的目录chinese
$ fc-list|grep chinese
/usr/share/fonts/chinese/MSYH.TTC: Microsoft YaHei:style=Normal
/usr/share/fonts/chinese/MSYH.TTC: Microsoft YaHei UI:style=Normal
```

