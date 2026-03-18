# openclaw安装

[openclaw github](https://github.com/openclaw/openclaw)

[openclaw官网](https://openclaw.ai/)



## 安装

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="脚本安装" label="脚本安装" default>

```shell
curl -fsSL https://openclaw.ai/install.sh | bash
```

  </TabItem>
  <TabItem value="npm安装" label="npm安装">

```shell
npm install -g openclaw@latest
```

  </TabItem>
  <TabItem value="源码安装" label="源码安装">

克隆代码并构建

```
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build
pnpm build
```



链接cli命令

```shell
pnpm link --global
```



运行onboarding

```shell
openclaw onboard --install-daemon
```

  </TabItem>
</Tabs>



出现以下界面，按照提示下一步即可

![iShot_2026-03-12_20.19.53](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-12_20.19.53.png)



## 配置

进行配置

```shell
openclaw configure
```



![iShot_2026-03-13_10.36.59](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_10.36.59.png)



## 启动服务

启动gateway

```sh
openclaw gateway
```

输出

```shell
🦞 OpenClaw 2026.3.11 (29dc654) — Like having a senior engineer on call, except I don't bill hourly or sigh audibly.

10:37:53 [canvas] host mounted at http://127.0.0.1:18789/__openclaw__/canvas/ (root /root/.openclaw/canvas)
10:37:53 [heartbeat] started
10:37:53 [health-monitor] started (interval: 300s, startup-grace: 60s, channel-connect-grace: 120s)
10:37:53 [gateway] agent model: anthropic/claude-opus-4-6
10:37:53 [gateway] listening on ws://127.0.0.1:18789, ws://[::1]:18789 (PID 207637)
10:37:53 [gateway] log file: /tmp/openclaw/openclaw-2026-03-13.log
10:37:53 [browser/server] Browser control listening on http://127.0.0.1:18791/ (auth=token)
```





## 访问

### 本地访问

`http://127.0.0.1:18789`

![iShot_2026-03-13_14.52.53](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_14.52.53.png)



执行以下命令获取token，然后填入网关令牌处

```shell
openclaw dashboard --no-open
```



点击连接

![iShot_2026-03-13_14.59.08](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_14.59.08.png)





### nginx转发



报错 `origin not allowed (open the Control UI from the gateway host or allow it in gateway.controlUi.allowedOrigins)`

![iShot_2026-03-13_10.48.36](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_10.48.36.png)



解决方法

```shell
openclaw config set gateway.controlUi.allowedOrigins '["https://openclaw.pptfz.cn"]'
```





报错 `unauthorized: gateway token missing (open the dashboard URL and paste the token in Control UI settings)`

![iShot_2026-03-13_13.49.28](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_13.49.28.png)



解决方法

运行以下命令获取token

```shell
openclaw dashboard --no-open
```



然后在 `概览` -> `网关令牌`

![iShot_2026-03-13_13.54.56](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_13.54.56.png)



配置后提示 `pairing required`



查看未批准的设备请求

```sh
openclaw devices list
```

输出

```shell
🦞 OpenClaw 2026.3.11 (29dc654) — I can grep it, git blame it, and gently roast it—pick your coping mechanism.

│
◇  
Pending (1)
┌──────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────┬──────────┬────────────┬──────────┬────────┐
│ Request                              │ Device                                                                                  │ Role     │ IP         │ Age      │ Flags  │
├──────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────┼──────────┼────────────┼──────────┼────────┤
│ 7cc695fd-8683-4ed6-b88c-035359dbb9ba │ 51ca254db2d4b1bf9ffe7e40a0bf6e5de7e6def4783bc022b4d49d3e23e119f4                        │ operator │            │ just now │        │
└──────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────┴──────────┴────────────┴──────────┴────────┘
Paired (1)
┌─────────────────────────────────────────────────────────┬────────────┬───────────────────────────────────────────────────────────────────────────┬────────────┬────────────┐
│ Device                                                  │ Roles      │ Scopes                                                                    │ Tokens     │ IP         │
├─────────────────────────────────────────────────────────┼────────────┼───────────────────────────────────────────────────────────────────────────┼────────────┼────────────┤
│ c43c26ea48dbf5886331a1f83482ef94ec2c8434a6c7926b16e55a3 │ operator   │ operator.admin, operator.read, operator.write, operator.approvals,        │ operator   │            │
│ 0cd425adf                                               │            │ operator.pairing                                                          │            │            │
└─────────────────────────────────────────────────────────┴────────────┴───────────────────────────────────────────────────────────────────────────┴────────────┴────────────┘
```



获取 `Pending` 中显示的设备的 `Request`

```shell
openclaw devices approve <requestId>
```

输出

```shell
🦞 OpenClaw 2026.3.11 (29dc654) — Your config is valid, your assumptions are not.

│
◇  
Approved 51ca254db2d4b1bf9ffe7e40a0bf6e5de7e6def4783bc022b4d49d3e23e119f4 (7cc695fd-8683-4ed6-b88c-035359dbb9ba)
```



刷新浏览器后就显示正常了

![iShot_2026-03-13_14.06.02](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_14.06.02.png)



nginx的配置如下

```nginx
server {
    listen 80;
    server_name openclaw.pptfz.cn;

    client_max_body_size 0;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name openclaw.pptfz.cn;

    ssl_certificate certs/openclaw/public.pem;
    ssl_certificate_key certs/openclaw/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 0;
    auth_basic "Restricted OpenClaw Dashboard";
    auth_basic_user_file /usr/local/nginx/conf/openclaw_passwd;

    access_log /var/log/openclaw/openclaw.pptfz.cn.access.log;
    error_log  /var/log/openclaw/openclaw.pptfz.cn.error.log;

    location / {
        proxy_pass http://127.0.0.1:18789;

        proxy_http_version 1.1;
        proxy_buffering off;

        # 关键：WebSocket支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 3600;
        proxy_send_timeout 3600;

        proxy_redirect off;
    }
}
```

