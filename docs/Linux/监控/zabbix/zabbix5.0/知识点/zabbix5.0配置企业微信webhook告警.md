[toc]

# zabbix5.0配置企业微信webhook告警

[本文严重抄袭于此](https://cloud.tencent.com/developer/article/1782209?from=article.detail.1848055)



Zabbix 5.0对于告警（报警媒介）进行了扩展和优化，可以直接支持 WebHook 类型的报警媒介。我们再开发企业微信机器人可以直接通过 JavaScript 语言编写脚本，因为得到了 Zabbix 的原生支持，告警脚本通用性强且更加灵活。本文将分享如何通过 Zabbix 报警媒介在企业微信发送告警信息。



## 1.创建报警媒介类型

`管理` -> `报警媒介类型` -> `创建媒介类型`

![iShot2021-10-09_17.53.35](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-09_17.53.35.png)





### 1.1 编辑报警媒介类型相关信息

![iShot2021-10-09_17.59.51](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-09_17.59.51.png)





以下为脚本内容

```javascript
var Qiyeweixin = {
  key: null,

  message: null,
  msgtype: "markdown",
  proxy: null,

  sendMessage: function () {
    var params = {
        msgtype: Qiyeweixin.msgtype,
        markdown: {
          content: Qiyeweixin.message,
        },
      },
      data,
      response,
      request = new CurlHttpRequest(),
      url =
        "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" +
        Qiyeweixin.key;

    if (Qiyeweixin.proxy) {
      request.setProxy(Qiyeweixin.proxy);
    }

    request.AddHeader("Content-Type: application/json");
    data = JSON.stringify(params);

    // Remove replace() function if you want to see the exposed key in the log file.
    Zabbix.Log(
      4,
      "[Qiyeweixin Webhook] URL: " + url.replace(Qiyeweixin.key, "<BOT KEY>")
    );
    Zabbix.Log(4, "[Qiyeweixin Webhook] params: " + data);
    response = request.Post(url, data);
    Zabbix.Log(4, "[Qiyeweixin Webhook] HTTP code: " + request.Status());

    try {
      response = JSON.parse(response);
    } catch (error) {
      response = null;
    }

    if (request.Status() !== 200 || response.errcode !== 0) {
      if (typeof response.errmsg === "string") {
        throw response.errmsg;
      } else {
        throw "Unknown error. Check debug log for more information.";
      }
    }
  },
};

try {
  var params = JSON.parse(value);

  if (typeof params.Key === "undefined") {
    throw 'Incorrect value is given for parameter "Key": parameter is missing';
  }

  Qiyeweixin.key = params.Key;

  if (params.HTTPProxy) {
    Qiyeweixin.proxy = params.HTTPProxy;
  }

  Qiyeweixin.to = params.To;
  Qiyeweixin.message = params.Subject + "\n" + params.Message;
  Qiyeweixin.sendMessage();

  return "OK";
} catch (error) {
  Zabbix.Log(4, "[Qiyeweixin Webhook] notification failed: " + error);
  throw "Sending failed: " + error + ".";
}
```



### 1.2 编辑消息模板

#### 1.2.1 默认内容

Message template `问题` 默认内容

```sh
主题
	Problem: {EVENT.NAME}
消息
	Problem started at {EVENT.TIME} on {EVENT.DATE}
	Problem name: {EVENT.NAME}
	Host: {HOST.NAME}
	Severity: {EVENT.SEVERITY}
	Operational data: {EVENT.OPDATA}
	Original problem ID: {EVENT.ID}
	{TRIGGER.URL}
```



Message template `Problem recovery` 默认内容

```
主题
	Resolved in {EVENT.DURATION}: {EVENT.NAME}
消息
	Problem has been resolved at {EVENT.RECOVERY.TIME} on 				   {EVENT.RECOVERY.DATE}
	Problem name: {EVENT.NAME}
	Problem duration: {EVENT.DURATION}
	Host: {HOST.NAME}
	Severity: {EVENT.SEVERITY}
	Original problem ID: {EVENT.ID}
	{TRIGGER.URL}
```



Message template `Problem update` 默认内容

```
主题
	Updated problem in {EVENT.AGE}: {EVENT.NAME}
消息
	{USER.FULLNAME} {EVENT.UPDATE.ACTION} problem at {EVENT.UPDATE.DATE} 	{EVENT.UPDATE.TIME}.
	{EVENT.UPDATE.MESSAGE}

	Current problem status is {EVENT.STATUS}, age is {EVENT.AGE}, 	acknowledged: {EVENT.ACK.STATUS}.
```



#### 1.2.2 自定义内容

在模板中是支持 markdown 语法的。目前支持的 markdown 语法是如下的子集。这是由[**企业微信机器人开发文档定义**](https://work.weixin.qq.com/api/doc/90000/90136/91770#markdown类型)的。

- 标题 （支持 1 至 6 级标题，注意#与文字中间要有空格）
- 加粗
- 链接
- 行内代码段（不支持跨行）
- 引用
- 字体颜色（有三种内置颜色）



##### 1.2.2.1 问题

**修改主题内容如下**

- 普通写法

  ```
  服务器:  {HOST.NAME}  发生:  {TRIGGER.NAME}  故障!
  ```

- markdown写法

  ```markdown
  # 服务器:  `{HOST.NAME}`  发生:  `{TRIGGER.NAME}`  <font color="warning">故障!</font>
  ```




**修改消息内容如下**

- 普通写法

  ```
  告警主机: {HOST.NAME}
  告警地址: {HOST.IP}
  监控项目: {ITEM.NAME}
  监控取值: {ITEM.LASTVALUE}
  告警等级: {TRIGGER.SEVERITY}
  当前状态: {TRIGGER.STATUS}
  告警信息: {TRIGGER.NAME}
  告警时间: {EVENT.DATE} {EVENT.TIME}
  事件ID: {EVENT.ID}
  ```
  
- markdown写法

  ```markdown
  >**告警主机**:   `{HOST.NAME}`
  >**告警地址**:   `{HOST.IP}`
  >**监控项目**:   `{ITEM.NAME}`
  >**监控取值**:   `{ITEM.LASTVALUE}`
  >**告警等级**:   `{TRIGGER.SEVERITY}`
  >**当前状态**:   `{TRIGGER.STATUS}`
  >**告警信息**:   `{TRIGGER.NAME}`
  >**告警时间**:   `{EVENT.DATE} {EVENT.TIME}`
  >**事件ID**:   `{EVENT.ID}`
  ```
  



![iShot2021-10-10_20.14.49](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_20.14.49.png)



##### 1.2.2.2 恢复

**修改主题内容如下**

- 普通写法

  ```
  服务器:  {HOST.NAME}:  故障  {TRIGGER.NAME}  已恢复!
  ```

- markdown写法

  ```markdown
  # 服务器:  `{HOST.NAME}`  故障:  `{TRIGGER.NAME}`  <font color="info">已恢复!</font>
  ```



**修改消息内容如下**

- 普通写法

  ```
  告警主机:    {HOST.NAME}
  告警地址:    {HOST.IP}
  监控项目:    {ITEM.NAME}
  监控取值:    {ITEM.LASTVALUE}
  告警等级:    {TRIGGER.SEVERITY}
  当前状态:    {TRIGGER.STATUS}
  告警信息:    {TRIGGER.NAME}
  告警时间:    {EVENT.DATE} {EVENT.TIME}
  恢复时间:    {EVENT.RECOVERY.DATE} {EVENT.RECOVERY.TIME}
  持续时间:    {EVENT.AGE}
  事件ID:    {EVENT.ID}
  ```

- markdown写法

  ```markdown
  >**告警主机**:    `{HOST.NAME}`
  >**告警地址**:    `{HOST.IP}`
  >**监控项目**:    `{ITEM.NAME}`
  >**监控取值**:    `{ITEM.LASTVALUE}`
  >**告警等级**:    `{TRIGGER.SEVERITY}`
  >**当前状态**:    `{TRIGGER.STATUS}`
  >**告警信息**:    `{TRIGGER.NAME}`
  >**告警时间**:    `{EVENT.DATE} {EVENT.TIME}`
  >**恢复时间**:    `{EVENT.RECOVERY.DATE} {EVENT.RECOVERY.TIME}`
  >**持续时间**:    `{EVENT.AGE}`
  >**事件ID**:    `{EVENT.ID}`
  ```

![iShot2021-10-10_21.09.11](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.09.11.png)





##### 1.2.2.3 更新

**修改主题内容如下**

- 普通写法

  ```
  服务器:    {HOST.NAME}:    报警更新
  ```

- markdown写法

  ```markdown
  # 服务器:    `{HOST.NAME}:`    <font color="info">报警更新</font>
  ```

  



**修改消息内容如下**

- 普通写法

  ```
  更新人: {USER.FULLNAME} 
  时间: {ACK.DATE} {ACK.TIME} 
  更新信息如下: "{ACK.MESSAGE}"
  问题服务器IP: {HOSTNAME1}
  问题ID: {EVENT.ID}
  当前的问题是: {TRIGGER.NAME}
  ```

- markdown写法

  ```markdown
  >**更新人**:    `{USER.FULLNAME}` 
  >**时间**:    `{ACK.DATE} {ACK.TIME}`
  >**更新信息如下**:    `"{ACK.MESSAGE}"`
  >**问题服务器IP**:    `{HOSTNAME1}`
  >**问题ID**:    `{EVENT.ID}`
  >**当前的问题是**:    `{TRIGGER.NAME}`
  ```

  

![iShot2021-10-10_21.23.05](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.23.05.png)



## 2.创建触发动作

`配置` -> `动作` -> `创建动作`

![iShot2021-10-10_21.25.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.25.12.png)





依次编辑 `操作`、`恢复操作`、`更新操作`，需要配置的就是发送的组和发送的报警媒介

![iShot2021-10-10_21.29.12](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.29.12.png)







## 3.创建接收人

点击左下角的 `User settings`

![iShot2021-10-10_21.32.42](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.32.42.png)



添加报警媒介收件人

![iShot2021-10-10_21.34.30](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.34.30.png)





![iShot2021-10-10_21.35.23](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-10-10_21.35.23.png)





创建完成后如果发生告警则相应的企业微信群就会收到告警了，这里效果图就不展示了



