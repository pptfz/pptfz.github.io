[toc]

# jenkins用户权限管理



## 1.安装插件 `Role-based Authorization Strategy`



在jenkins插件中心搜索 `Role-based` 

![iShot2021-07-23 20.26.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2020.26.32.png)





## 2.开启插件

`Manage Jenkins` --> `Configure Global Security` --> `Authorization` --> `Role-Based Strategy`

勾选  `Role-Based Strategy` 后就会出现 `Manage and Assign Roles` 

![iShot2021-07-23 20.41.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2020.41.42.png)



![iShot2021-07-23 20.43.15](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2020.43.15.png)



## 3.环境准备

### 3.1 新建项目

新建2个文件夹 `online_web` 和 `test_web`，其中 `online_web` 模拟生产web项目，`test_web` 模拟测试web项目

![iShot2021-07-23 21.06.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.06.14.png)





`online_web` 下有2个项目 `abc.baidu.com` 、`online.baidu.com`

![iShot2021-07-23 21.10.26](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.10.26.png)





`test_web` 下有2个项目 `abctest.baidu.com` 、`test.baidu.com`

![iShot2021-07-23 21.11.38](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.11.38.png)







### 3.2 新建用户

新建 `online` 和 `test` 用户，其中 `online` 用户模拟生产用户、`test` 模拟测试用户

![iShot2021-07-23 21.13.48](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.13.48.png)





## 4.角色权限分配

### 4.1 新建角色

在 `Manage Roles` 管理角色选项中新建角色

![iShot2021-07-23 21.18.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.18.45.png)





新建2个角色 `测试` 和 `生产` ，必须勾选 `Overall` 中的 `Read` 选项，表示角色对全局可读，否则用户登陆后无任何查看权限

![iShot2021-07-26 16.22.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-26%2016.22.46.png)



新建角色之后，开始给角色匹配项目，在 `Item roles` 中匹配项目，主要用到的就是正则表达式，例如在 `Pattern` 中填写 `test_web.*` 表示的就是对 `test_web` 目录下的所有项目有权限

![iShot2021-07-26 17.57.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-26%2017.57.45.png)







### 4.2 分配角色

![iShot2021-07-23 21.19.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-23%2021.19.02.png)





在 `Global roles` 中配置test用户对测试角色有权限，online用户对生产角色有权限

![iShot2021-07-26 21.33.42](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-26%2021.33.42.png)





### 4.3 测试验证

用test用户登陆，可以看到test用户只对test_web下的所有项目有权限，online用户同理

![iShot2021-07-26 21.45.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-07-26%2021.45.45.png)





### 4.4 `Role-based Authorization Strategy` 插件授权步骤

- 1.在 `Manage Roles` 中新建角色，必须创建全局角色设置可读，然后在角色下边利用正则匹配项目

- 2.在 `Assign Roles` 中分配角色，是针对 `Manage Roles` 中设置的角色，在 `Assign Roles` 设置哪个用户对 `Manage Roles` 中设置的角色有什么权限

  
