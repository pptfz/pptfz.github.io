# gitea+jenkins实现webhook

## 1.jenkins安装插件 `Generic Webhook Trigger`



![iShot2021-12-25_15.23.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_15.23.06.png)



## 2.jenkins项目配置

在jenkins项目中构建触发器下勾选 `Generic Webhook Trigger`，然后在 `Token` 处填写一个任意名称的token名

![iShot2021-12-25_15.28.16](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_15.28.16.png)







## 3.gitea项目配置

在项目中点击 `设置`

![iShot2021-12-25_15.38.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_15.38.18.png)







在 `Web钩子` 处点击 `添加 Web 钩子`

![iShot2021-12-25_15.41.01](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_15.41.01.png)







配置webhook，目标url填写如下格式，只需要替换 `JENKINS_URL` 和 `token=xxx`

```
http://JENKINS_URL/generic-webhook-trigger/invoke?token=xxx
```



![iShot2021-12-25_16.02.54](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_16.02.54.png)



添加后的webhook

![iShot2021-12-25_16.04.38](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_16.04.38.png)







如果推送有问题我们可以点击 `测试推送` 来查看问题

![iShot2021-12-25_16.16.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-12-25_16.16.50.png)









