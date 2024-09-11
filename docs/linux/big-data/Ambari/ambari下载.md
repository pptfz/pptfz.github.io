[toc]



# ambari下载

## 1.令人懵逼的网站

[ambari官网](http://ambari.apache.org/)

[https://supportmatrix.hortonworks.com/ 不知道这是什么网站](https://supportmatrix.hortonworks.com/)

进入上面这个网站， `Products` 下 `Sofware Download` 

![iShot_2024-09-02_17.35.19](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.35.19.png)





点击 `HDP` 后会跳转到 [另外一个网站](https://www.cloudera.com/downloads.html#data-platform)

[www.cloudera.com](https://www.cloudera.com/)

![iShot_2024-09-02_17.38.19](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.38.19.png)





支持中文的网站才是好网站

![iShot_2024-09-02_17.39.48](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.39.48.png)







点击  `Legacy HDP release ` 选择要下载的版本

![iShot_2024-09-02_17.42.32](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.42.32.png)



## 2.下载hdp

:::tip 说明

从HDP3.1.5开始，下载会提示必须是HDP客户才能访问下载，无解，所以只能下载3.1.4

:::

![iShot_2024-09-02_17.43.50](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.43.50.png)



## 限制访问

> 您必须是HDP客户才能访问这些下载。如果您认为自己应该可以使用这些软件，请与支持人员或您的客户服务代表联系。

![iShot_2024-09-02_17.45.20](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.45.20.png)







选择 3.1.4 版本，然后点击 `Installation`

![iShot_2024-09-02_17.46.17](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.46.17.png)





选择 `Apache Ambari Installation`

![iShot_2024-09-02_17.47.25](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.47.25.png)





先选择 `Obtaining Public Repositories` 然后再选择 `HDP Stack Repositories`

![iShot_2024-09-02_17.48.13](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.48.13.png)







![iShot_2024-09-02_17.49.26](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.49.26.png)



这里可根据系统类型选择不同的下载

可以下载 `HDP3.1.4` 和 `HDP-UTILS1.1.0.22`

![iShot_2024-09-02_17.50.37](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.50.37.png)





```shell
# 下载HDP
wget http://public-repo-1.hortonworks.com/HDP/centos7/3.x/updates/3.1.4.0/HDP-3.1.4.0-centos7-rpm.tar.gz

# 下载HDP-UTILS
wget http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7/HDP-UTILS-1.1.0.22-centos7.tar.gz

# 下载HDP-GPL
wget http://public-repo-1.hortonworks.com/HDP-GPL/centos7/3.x/updates/3.1.4.0/HDP-GPL-3.1.4.0-centos7-gpl.tar.gz
```





## 3.下载Ambari

:::tip 说明

从Ambari2.7.5.0开始，下载会提示必须是HDP客户才能访问下载，无解，所以只能下载2.7.4.0

:::

![iShot_2024-09-02_17.52.41](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.52.41.png)





选择 `Installation`

![iShot_2024-09-02_17.53.48](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.53.48.png)





选择 `Apache Ambari Installation`

![iShot_2024-09-02_17.54.44](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.54.44.png)





选择 `Obtaining Public Repositories` 下的 `Ambari Repositories`

![iShot_2024-09-02_17.57.16](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.57.16.png)







这里可根据系统类型选择不同的下载

![iShot_2024-09-02_17.58.33](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-09-02_17.58.33.png)



```shell
wget http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.7.4.0/ambari-2.7.4.0-centos7.tar.gz
```



