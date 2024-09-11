[toc]

# jenkins配置构建企业微信通知

## 1.安装插件 `Qy Wechat Notification`



![iShot2021-09-05_22.11.06](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-09-05_22.11.06.png)



## 2.配置构建后企业微信通知

`Post-build Actions` -> `Add post-build action` -> `企业微信通知`



![iShot2021-09-05_22.14.10](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-09-05_22.14.10.png)



填写企业微信机器人webhook地址，设置触发的条件，通知的用户和手机号码插件中说明的已经很清楚了

![iShot2021-09-05_22.14.10](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-09-05_22.14.10.png)





## 3.构建测试

构建成功后，相应的企业微信群中就会收到信息

![iShot2021-09-05_22.22.08](https://github.com/pptfz/picgo-images/blob/master/img/iShot2021-09-05_22.22.08.png)
