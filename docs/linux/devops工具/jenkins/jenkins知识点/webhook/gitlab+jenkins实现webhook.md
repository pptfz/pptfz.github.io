# gitlab+jenkins实现webhook



## 1.jenkins安装插件 `Gitlab Hook Plugin`



![iShot2021-10-19_14.46.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-19_14.46.23.png)



## 2.获取jenkins项目回调url地址

在jenkins项目中构建触发器下勾选 `Build when a change is pushed to GitLab. GitLab webhook URL` ，然后复制后边的url地址，这个地址后续是需要填写在gitlab webhook配置中的，并且在下边可以选择相应触发事件

![iShot_2022-09-20_17.50.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-09-20_17.50.28.png)





## 3.gitlab项目配置webhook

项目 `Settings` -> `Webhooks` 

在url处填写jenkins项目中的回调url地址

![iShot2021-10-19_16.14.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-19_16.14.06.png)





配置完成后保存，然后在 `Test` 下点击 `Push events` 进行测试

![iShot2021-10-19_16.54.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-19_16.54.31.png)



测试提示如下即为成功

![iShot2021-10-19_17.01.34](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-10-19_17.01.34.png)







