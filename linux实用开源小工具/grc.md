# grc

> 加强Linux颜色显示，效果如下
>
> ⚠️grc依赖python3

![iShot2020-10-13 10.06.16](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-13 10.06.16.png)

[grc github地址](https://github.com/garabik/grc)



---



## 1.下载源码

```shell
git clone https://github.com.cnpmjs.org/garabik/grc.git
```



## 2.执行安装脚本、拷贝文件

```shell
# 执行安装脚本
cd grc
sh install.sh

# 拷贝文件
cp grc.sh /etc
```

 

## 3.向 `~/.bashrc` 写入内容

```shell
echo "[[ -s "/etc/grc.sh" ]] && source /etc/grc.sh" >> ~/.bashrc
source ~/.bashrc
```













