# openclaw接入机器人

## 钉钉机器人

[接入钉钉机器人](https://help.aliyun.com/zh/model-studio/openclaw-coding-plan?spm=0.0.0.i6#20f16d81e9i01)



### 创建钉钉应用并获取凭证

#### 选择或创建组织

登录[钉钉开放平台](https://open-dev.dingtalk.com/)，选择您有开发者权限的组织，或者选择某个组织后，[获取开发者权限](https://open.dingtalk.com/document/orgapp/obtain-developer-permissions)，没有组织的话可以按照提示窗间组织

![iShot_2026-03-13_17.34.59](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.34.59.png)

#### 创建钉钉机器人应用

登录[钉钉开放平台](https://open-dev.dingtalk.com/)，在顶部菜单栏，选择**应用开发**。

![iShot_2026-03-13_17.45.44](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.45.44.png)



在页面右侧，单击**创建应用**，填写应用名称（例如"AI 助手"）和描述，然后点击**保存**，系统自动进入应用详情页。

![iShot_2026-03-13_17.46.58](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.46.58.png)

![iShot_2026-03-13_17.48.46](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.48.46.png)

在应用详情的**添加应用能力**页面，选择添加**机器人**。

![iShot_2026-03-13_17.50.02](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.50.02.png)



配置机器人

- 开启**机器人配置**开关。
- 填写机器人名称等必填项。
- **消息接收模式** 采用默认的 **Stream 模式**。
- 单击**发布**。

![iShot_2026-03-13_17.53.38](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.53.38.png)



#### 获取应用凭证

在左侧导航栏，单击**凭证与基础信息**，获取Client ID和Client Secret。后续部署时使用。

![iShot_2026-03-13_17.55.35](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.55.35.png)



#### 发布应用

- 在应用详情的左侧导航栏，单击**版本管理与发布**。

- 在页面右侧，单击**创建新版本**，填写版本号（例如 1.0.0）。

- 设置可见范围，例如**仅我可见**。

- 单击**保存**，然后确认发布。

![iShot_2026-03-13_17.57.26](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.57.26.png)

![iShot_2026-03-13_17.58.43](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.58.43.png)



### 安装钉钉渠道插件

安装插件

```shell
openclaw plugins install @soimy/dingtalk
```



确认安装

```shell
openclaw plugins list
```

输出

```shell
│ DingTalk     │ dingtalk │ loaded   │ global:dingtalk/index.ts                                            │ 3.2.0     │
```



### 配置钉钉渠道

在 `~/.openclaw/openclaw.json` 中添加 `channels` 和 `plugins.allow` 配置，替换为自己的 `clientId` 、`clientSecret` 、`robotCode` ，让ai工具整合一下，不要覆盖原有的配置，注意 `clientId` 和 `robotCode` 值一样

:::tip 说明

以下配置中 `dmPolicy` 和 `groupPolicy` 均设为 `open`，适用于测试或个人使用场景。生产环境中建议设为 `allowlist`，通过白名单限制可访问的用户和群组，降低安全风险。

:::

```json
{
  "channels": {
    "dingtalk": {
      "enabled": true,
      "clientId": "YOUR_DINGTALK_APPKEY",
      "clientSecret": "YOUR_DINGTALK_APPSECRET",
      "robotCode": "YOUR_DINGTALK_APPKEY",
      "dmPolicy": "open",
      "groupPolicy": "open",
      "messageType": "markdown"
    }
  },
  "plugins": {
    "allow": ["dingtalk"],
    "entries": {
      "dingtalk": {
        "enabled": true
      }
    }
  }
}
```



### 测试

重启网关

```shell
openclaw gateway restart
```



查看钉钉渠道状态

```shell
openclaw status
```



在 `Channels` 部分，`DingTalk` 应显示为 `ON` 且状态为 `OK - configured`

```shell
Channels
┌──────────┬─────────┬────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Channel  │ Enabled │ State  │ Detail                                                                                                                                       │
├──────────┼─────────┼────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ DingTalk │ ON      │ OK     │ configured                                                                                                                                   │
└──────────┴─────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```





在群聊机器人管理中

![iShot_2026-03-14_10.52.23](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_10.52.23.png)



搜索创建的机器人并添加

![iShot_2026-03-14_10.53.28](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_10.53.28.png)



添加后的机器人

![iShot_2026-03-14_10.54.38](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_10.54.38.png)



`@` 机器人与其对话

![iShot_2026-03-14_10.59.08](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_10.59.08.png)



## 飞书机器人

[接入飞书机器人](https://docs.openclaw.ai/channels/feishu?utm_source=chatgpt.com)



### 捆绑飞书插件

飞书插件和openclaw版本是捆绑在一起的，执行 `openclaw plugins list|grep feishu` 查看

```shell
│ Feishu       │ feishu   │ loaded   │ stock:feishu/index.ts                                               │ 2026.3.12 │
```





如果使用的是较旧的版本或不包含捆绑的，则需要手动安装插件

```shell
openclaw plugins install @openclaw/feishu
```





### 创建飞书应用

登陆 [飞书开放平台](https://open.feishu.cn/app) ，选择 `创建企业自建应用`

![iShot_2026-03-14_18.27.24](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_18.27.24.png)



创建一个企业自建应用

输入应用名称、应用描述，选择应用图标

![iShot_2026-03-14_18.30.25](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_18.30.25.png)



### 获取 `App ID` 和 `App Secret`

点击左侧 `凭证与基础信息`

![iShot_2026-03-14_18.36.04](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_18.36.04.png)



### 配置权限

点击 `批量导入/导出权限`

![iShot_2026-03-14_18.56.25](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_18.56.25.png)

粘贴以下内容

```json
{
  "scopes": {
    "tenant": [
      "aily:file:read",
      "aily:file:write",
      "application:application.app_message_stats.overview:readonly",
      "application:application:self_manage",
      "application:bot.menu:write",
      "cardkit:card:read",
      "cardkit:card:write",
      "contact:user.employee_id:readonly",
      "corehr:file:download",
      "event:ip_list",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:chat.members:bot_access",
      "im:message",
      "im:message.group_at_msg:readonly",
      "im:message.p2p_msg:readonly",
      "im:message:readonly",
      "im:message:send_as_bot",
      "im:resource"
    ],
    "user": ["aily:file:read", "aily:file:write", "im:chat.access_event.bot_p2p_chat:read"]
  }
}
```



确认导入权限

![iShot_2026-03-16_16.48.21](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_16.48.21.png)





### 启用机器人功能



![iShot_2026-03-14_19.07.56](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_19.07.56.png)



### 配置事件订阅



![iShot_2026-03-14_19.10.49](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_19.10.49.png)



添加事件 `im.message.receive_v1`

![iShot_2026-03-14_19.22.12](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_19.22.12.png)



### 发布应用程序

创建版本

![iShot_2026-03-14_19.23.46](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_19.23.46.png)



填写版本详情相关信息

![iShot_2026-03-14_19.24.48](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-14_19.24.48.png)



### 配置openclaw

编辑配置文件 `~/.openclaw/openclaw.json` ，替换 `appId` 、`appSecret`

```shell
{
  channels: {
    feishu: {
      enabled: true,
      dmPolicy: "pairing",
      accounts: {
        main: {
          appId: "cli_xxx",
          appSecret: "xxx",
          botName: "My AI assistant",
        },
      },
    },
  },
}
```



批准配对

在飞书中，与机器人对话，获取 `openclaw pairing approve feishu` 后显示的code

![iShot_2026-03-16_10.28.31](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_10.28.31.png)



批准配对

```shell
openclaw pairing approve feishu xxx
```



批准之后就可以和机器人对话了

![iShot_2026-03-16_10.32.54](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_10.32.54.png)



## 企业微信机器人

[接入企业微信机器人](https://open.work.weixin.qq.com/help2/pc/cat?doc_id=21657)

### 创建机器人

企业微信客户端 -> 工作台 -> 智能机器人

![iShot_2026-03-16_11.02.34](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.02.34.png)



创建机器人

![iShot_2026-03-16_11.05.37](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.05.37.png)



选择 手动创建

![iShot_2026-03-16_11.09.01](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.09.01.png)



选择 API模式创建

![iShot_2026-03-16_11.18.20](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.18.20.png)



连接方式选择 使用长连接，在 `Secret` 处点击 点击获取

![iShot_2026-03-16_11.26.31](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.26.31.png)





配置完成后，页面将自动生成并展示 `Bot ID` 和 `Secret`，妥善保存该信息（后续关联OpenClaw需使用）

![iShot_2026-03-16_11.22.56](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.22.56.png)



配置完成

![iShot_2026-03-16_11.25.29](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.25.29.png)



### 关联企业微信机器人与OpenClaw

#### 安装企业微信插件

```shell
npx -y @wecom/wecom-openclaw-cli install
```



#### 配置企业微信机器人接入

选择企业微信机器人接入方式，有扫码接入和手动输入2种

![iShot_2026-03-16_11.36.25](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_11.36.25.png)



选择推荐的扫码方式，会自动获取 `Bot ID` 和 `Secret`

![iShot_2026-03-16_13.46.55](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_13.46.55.png)



一键创建智能机器人

![iShot_2026-03-16_13.52.58](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_13.52.58.png)

![iShot_2026-03-16_13.52.17](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_13.52.17.png)



### 使用机器人

与机器人对话

![iShot_2026-03-16_13.54.55](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_13.54.55.png)

