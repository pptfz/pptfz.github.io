[toc]



# ambari下载

## 一、令人懵逼的网站

[ambari官网](http://ambari.apache.org/)

[https://supportmatrix.hortonworks.com/ 不知道这是什么网站](https://supportmatrix.hortonworks.com/)

进入上面这个网站， `Products` 下 `Sofware Download` 

![iShot2020-11-06 09.46.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 09.46.03.png)



点击 `HDP` 后会跳转到 [另外一个网站](https://www.cloudera.com/downloads.html#data-platform)

[www.cloudera.com](https://www.cloudera.com/)

![iShot2020-11-06 09.53.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 09.53.18.png)



支持中文的网站才是好网站

![iShot2020-11-06 09.55.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 09.55.45.png)





点击  `Legacy HDP release ` 选择要下载的版本

![iShot2020-11-06 10.00.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.00.24.png)



## 二、下载hdp

⚠️<span style=color:red>从HDP3.1.5开始，下载会提示必须是HDP客户才能访问下载，无解，所以只能下载3.1.4</span>

![iShot2020-11-06 10.02.43](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.02.43.png)



> ## 限制访问
>
> 您必须是HDP客户才能访问这些下载。如果您认为自己应该可以使用这些软件，请与支持人员或您的客户服务代表联系。

![iShot2020-11-06 10.12.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.12.00.png)





选择 3.1.4 版本，然后点击 `Installation`

![iShot2020-11-06 10.15.47](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.15.47.png)



选择 `Apache Ambari Installation`

![iShot2020-11-06 10.17.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.17.06.png)



先选择 `Obtaining Public Repositories` 然后再选择 `HDP Stack Repositories`

![iShot2020-11-06 10.29.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.29.18.png)



选择 `HDP 3.1.4 Repositories`

![iShot2020-11-06 10.32.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.32.35.png)



这里可根据系统类型选择不同的下载

可以下载 `HDP3.1.4` 和 `HDP-UTILS1.1.0.22`

![iShot2020-11-06 10.34.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.34.24.png)



```shell
# 下载HDP
wget http://public-repo-1.hortonworks.com/HDP/centos7/3.x/updates/3.1.4.0/HDP-3.1.4.0-centos7-rpm.tar.gz

# 下载HDP-UTILS
wget http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7/HDP-UTILS-1.1.0.22-centos7.tar.gz

# 下载HDP-GPL
wget http://public-repo-1.hortonworks.com/HDP-GPL/centos7/3.x/updates/3.1.4.0/HDP-GPL-3.1.4.0-centos7-gpl.tar.gz
```





## 三、下载Ambari

⚠️<span style=color:red>从Ambari2.7.5.0开始，下载会提示必须是HDP客户才能访问下载，无解，所以只能下载2.7.4.0</span>

![iShot2020-11-06 10.38.30](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.38.30.png)



选择 `Installation`

![iShot2020-11-06 10.48.20](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.48.20.png)



选择 `Apache Ambari Installation`

![iShot2020-11-06 10.49.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.49.28.png)





选择 `Obtaining Public Repositories` 下的 `Ambari Repositories`

![iShot2020-11-06 10.19.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.19.00.png)



这里可根据系统类型选择不同的下载

![iShot2020-11-06 10.23.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-11-06 10.23.06.png)



```shell
wget http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.7.4.0/ambari-2.7.4.0-centos7.tar.gz
```



