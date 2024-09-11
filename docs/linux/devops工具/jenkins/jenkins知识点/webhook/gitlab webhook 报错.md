# gitlab webhook 报错 

## 报错1 `Hook executed successfully but returned HTTP 422`



gitlab+jenkins 配置webhook自动触发，在gitlab项目中配置好webhook后点击 `Test Push events` 报错如下

![iShot2021-10-19_14.29.32](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-10-19_14.29.32.png)





原因：jenkins url回调地址写错了，复制 `Build when a change is pushed to GitLab. GitLab webhook URL` 后面的url即可



![iShot2021-10-19_14.49.14](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-10-19_14.49.14.png)







## 报错2 `Hook executed successfully but returned HTTP 403`

gitlab+jenkins 配置webhook自动触发，在gitlab项目中配置好webhook后点击 `Test Push events` 报错如下

![iShot2021-10-19_15.32.01](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-10-19_15.32.01.png)





需要在jenkins中 `系统管理` -> `系统配置` -> `Gitlab` 

![iShot2021-10-19_16.02.05](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-10-19_16.02.05.png)











