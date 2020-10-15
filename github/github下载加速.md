# github下载加速

## 方法一：利用[码云](https://gitee.com/)实现github下载加速

先来看一下直接从github下载的速度，3kB/s，这。。。

![iShot2020-03-0916.49.50](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0916.49.50.png)



接下来使用码云实现下载加速

**第一步、点击码云首页右上角的➕，选择从``GitHub/GitLab导入仓库``**

![iShot2020-03-0917.05.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0917.05.14.png)

**第二步、填写要下载的github链接并导入**

这一步还是非常快的

![iShot2020-03-0917.10.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-03-0917.10.22.png)

导入成功后直接下载速度就会很快了！



**第三步(可选步骤)、修改原仓库地址**

经过码云中转后的仓库地址发生了改变，已经不是原先的github地址了，如果我们想要对原github仓库做一些仓库操作，就需要修改链接地址了

```python
//进入克隆后的仓库中，先移除码云的链接
git remote rm origin

//然后再添加原先github仓库的链接
git remote add origin
```



## 方法二：使用加速地址

**将``github.com``修改为``github.com.cnpmjs.org``**

```python
#原先下载方式
git clone https://github.com/xxx

#修改为如下地址
git clone https://github.com.cnpmjs.org/xxx
```

