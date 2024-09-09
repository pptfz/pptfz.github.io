# zabbix5.0配置web监控并告警

[zabbix5.0 web监控官方文档](https://www.zabbix.com/documentation/5.0/zh/manual/web_monitoring)



## 1.配置web监控

### 1.1 选择web监测

> 创建web监测有2种方式
>
> 1.直接在单台主机上创建
>
> 2.直接在模板上创建

建议是新建一个模板，然后在这个模板上单独新建web监测

![iShot2021-12-10_20.34.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-10_20.34.23.png)







### 1.2 创建web场景

![iShot2021-12-10_20.45.23](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-10_20.45.23.png)







配置web监测 `名称`、`应用集(可选)`、`客户端(默认是zabbix)`

![iShot2021-12-10_20.49.20](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-10_20.49.20.png)







在 `步骤` 中配置要监控的域名，`名称` 和 `URL` 最好写成一样的，便于识别，勾选 `跟随跳转`，这里主要是网站可能涉及到 `301` 和 `302` 条转，超时默认为 `15s`，要求的状态码多个以 `,` 分割

![iShot2021-12-10_20.52.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-10_20.52.18.png)





## 2.配置web监控告警

### 2.1 web场景信息说明

这里提前创建了一个模板，名称为 `web site monitor` 

![iShot2021-12-13_17.48.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_17.48.50.png)





其中的web场景名称为 `www.baidu.com`

:::tip

**这里的操作方法是一个域名对应一个web场景，当然一个web场景是可以包含多个域名的，但是有一个问题没有解决，就是在告警的时候告警内容只能包含到web场景名称，不能包含web场景中的具体域名**

:::

![iShot2021-12-13_17.49.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_17.49.39.png)





web场景中的域名只有一个，其中期望的状态码故意写成 `502`，方便后续告警验证

![iShot2021-12-13_18.14.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.14.46.png)







### 2.2 配置web监控告警

#### 2.2.1 创建触发器

在新建的模板中创建触发器

![iShot2021-12-13_18.23.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.23.07.png)









定义触发器名称，监控项选择 `web site monitor: Failed step of scenario "www.baidu.com".`

![iShot2021-12-13_18.33.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.33.02.png)



触发器条件设置监控项 `web site monitor: Failed step of scenario "www.baidu.com".` 结果不等于0

> `Failed step of scenario` 为web场景监测失败的返回码，如果等于0则说明网站返回码和期望的返回状态码相同，非0则说明网站返回状态码与期望值不相同

![iShot2021-12-13_18.38.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.38.33.png)







恢复表达式和问题表达式触发条件相反

![iShot2021-12-13_18.40.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.40.16.png)





创建后的触发器

![iShot2021-12-13_18.47.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.47.54.png)







#### 2.2.2 告警测试

因为期望的状态码故意写成了 `502` ，因此触发器一旦创建就会触发告警

![iShot2021-12-13_18.49.43](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-12-13_18.49.43.png)











