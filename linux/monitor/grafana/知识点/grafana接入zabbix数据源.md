[toc]

# grafana接入zabbix数据源

# 1.安装zabbix插件

[grafana 官方插件下载地址](https://grafana.com/grafana/plugins?utm_source=grafana_plugin_list&orderBy=weight&direction=asc)

```python
# 安装zabbix插件
grafana-cli plugins install alexanderzobnin-zabbix-app

# 插件安装完成后要重启grafana
systemctl restart grafana-server
```



# 2.启用zabbix插件

**第一步、点击左侧设置按钮，然后点击`Plugins`**

![iShot2020-06-1110.15.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.29.43.png)





**第二步、在最下边找到zabbix插件，红色警告表明插件是外部插件**

![iShot2020-06-1110.29.43](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.31.49.png)



**第三步、允许zabbix插件**

![iShot2020-06-1110.33.24](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.33.24.png)

![iShot2020-06-1110.34.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.34.36.png)



# 3.配置zabbix数据源

**第一步、点击左侧设置按钮，然后选择`Data Sources`**

![iShot2020-06-1110.35.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.35.58.png)



**第二步、选择`Add data source`**

![iShot2020-06-1112.14.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.37.26.png)





**第三步、选择zabbix**

![iShot2020-06-1110.38.16](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.38.16.png)



**第四步、配置zabbix用户密码信息**

grafana会自动使用默认的zabbix api地址

配置完成后点击下方的 `Save & Test`



zabbix api地址如下，如果localhost无法解析，则需要把localhost改成zabbix的域名

`http://localhost/zabbix/api_jsonrpc.php`

![iShot2020-06-1110.45.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.45.02.png)



**检测成功会提示如下**

![iShot2020-06-1110.37.26](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1110.58.20.png)





# 4.添加dashboard进行自定义监控

## 4.1 创建dashboard

**点击左侧`+`号，选择`Dashboard`**

![iShot2020-06-1110.58.20](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.14.15.png)



**选择右上角`Dashboard settings`**

![iShot2020-06-1112.16.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.16.18.png)



**对dashboard进行重命名**

![iShot2020-06-1112.19.24](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.19.24.png)

**确认dashboard名称**

![iShot2020-06-1112.20.47](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.20.47.png)



**创建完成后的dashboard**

![iShot2020-06-1112.21.45](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.21.45.png)





## 4.2 创建监控图形

**选择创建好的dashboard，然后点击右上角的`Add panel`，添加一个面板**

![iShot2020-06-1112.25.20](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.25.20.png)



![iShot2020-06-1112.26.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.26.11-1849599.png)



**示例：创建CPU负载监控图形**

![iShot2020-06-1112.36.31](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.36.31.png)



**修改标题**

![iShot2020-06-1112.45.50](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.42.25.png)





## 4.3 保存dashboard

**右上角点击`Save`**

![iShot2020-06-1112.45.04](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.45.04.png)



**保存dashboard的时候会要求添加改变的描述信息，即修改了哪些内容**

![iShot2020-06-1112.42.25](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.45.50.png)



**保存完后点击`Apply`**

![iShot2020-06-1112.50.25](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.47.26.png)





**最终效果如下，左上角是新建的dashboard，最好以部门名称命名，这样便于区分不同部门的机器，这里是示例创建了CPU负载监控图形，其余监控创建方法一致，面板大小也可以调整**

![iShot2020-06-1112.47.26](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.48.03.png)







## 4.4 创建其他监控图形

**如果想要创建其他监控项图形，先选择对应的dashboard，然后在创建面板，最后在面板中选择相应的监控信息即可**

![iShot2020-06-1112.48.03](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1112.50.25.png)



**修改监控图形指标单位**

**在可用内存监控中，默认的单位不太好识别**

![iShot2020-06-1113.18.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1113.18.10.png)



**修改指标单位**

**点击右侧的`Axes(轴)`，选择相对应的轴，比如`Left Y(左Y轴)`，然后在`Unit(单位)`选项卡处选择相应的单位，选择`Data(Metric)`下的`bytes(Metric)`**

![iShot2020-06-1113.30.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1113.21.31.png)



**最终效果，这样看起来左侧显示单位就比较明了了**

![iShot2020-06-1113.21.31](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-1113.30.36.png)


