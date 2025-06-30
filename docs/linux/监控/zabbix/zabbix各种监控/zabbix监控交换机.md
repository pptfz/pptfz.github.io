[toc]

# zabbix监控交换机

## 1.交换机开启SNMP

在交换机中执行如下命令，设置一个只读的团体名，名称唯一

```shell
snmp-agent community read  public100
```



在zabbix-server中执行如下命令，会返回交换机中的所有配置信息

```shell
snmpwalk  -v 2c -c public100 10.0.0.123
```





## 2.zabbix添加主机

SNMP接口处填写交换机的IP，端口默认161

![iShot2021-06-07_12.44.22](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-06-07_12.44.22.png)





交换机是华为的，所以模版选择 `Template Net Huawei VRP SNMPv2`

![iShot2021-06-07_13.00.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-06-07_13.00.45.png)





:::tip

**这里的宏必须填写正确，要和交换机中设置的 `snmp-agent community read  public100` 名称对应**

:::

![iShot2021-06-07_12.59.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-06-07_12.59.42.png)



宏： `{$SNMP_COMMUNITY}`

值：`public100`



效果示意图

![iShot2021-06-07_13.04.33](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-06-07_13.04.33.png)

