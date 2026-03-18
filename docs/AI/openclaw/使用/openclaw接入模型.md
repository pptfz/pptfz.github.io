# openclaw接入模型

## 阿里云百炼coding plan

[在OpenClaw接入阿里云 Coding Plan](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model&url=3023085)

### 配置

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="通过web ui修改配置文件" label="通过web ui修改配置文件" default>

![iShot_2026-03-13_16.56.18](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_16.56.18.png)

  </TabItem>
  <TabItem value="通过终端修改配置文件" label="通过终端修改配置文件">

编辑 `~/.openclaw/openclaw.json` ，替换 `apiKey`，如果之前有内容了则不能直接替换，让ai工具自动合并一下

```shell
{
  "models": {
    "mode": "merge",
    "providers": {
      "bailian": {
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "apiKey": "xxx",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.5-plus",
            "name": "qwen3.5-plus",
            "reasoning": false,
            "input": ["text", "image"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 1000000,
            "maxTokens": 65536,
            "compat": {
              "thinkingFormat": "qwen"
            }
          },
          {
            "id": "qwen3-max-2026-01-23",
            "name": "qwen3-max-2026-01-23",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 262144,
            "maxTokens": 65536,
            "compat": {
              "thinkingFormat": "qwen"
            }
          },
          {
            "id": "qwen3-coder-next",
            "name": "qwen3-coder-next",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 262144,
            "maxTokens": 65536
          },
          {
            "id": "qwen3-coder-plus",
            "name": "qwen3-coder-plus",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 1000000,
            "maxTokens": 65536
          },
          {
            "id": "MiniMax-M2.5",
            "name": "MiniMax-M2.5",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 196608,
            "maxTokens": 32768
          },
          {
            "id": "glm-5",
            "name": "glm-5",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 202752,
            "maxTokens": 16384,
            "compat": {
              "thinkingFormat": "qwen"
            }
          },
          {
            "id": "glm-4.7",
            "name": "glm-4.7",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 202752,
            "maxTokens": 16384,
            "compat": {
              "thinkingFormat": "qwen"
            }
          },
          {
            "id": "kimi-k2.5",
            "name": "kimi-k2.5",
            "reasoning": false,
            "input": ["text", "image"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 262144,
            "maxTokens": 32768,
            "compat": {
              "thinkingFormat": "qwen"
            }
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "bailian/qwen3.5-plus"
      },
      "models": {
        "bailian/qwen3.5-plus": {},
        "bailian/qwen3-max-2026-01-23": {},
        "bailian/qwen3-coder-next": {},
        "bailian/qwen3-coder-plus": {},
        "bailian/MiniMax-M2.5": {},
        "bailian/glm-5": {},
        "bailian/glm-4.7": {},
        "bailian/kimi-k2.5": {}
      }
    }
  },
  "gateway": {
    "mode": "local"
  }
}
```

  </TabItem>
</Tabs>

编辑完成后重启 `gateway`

```shell
openclaw gateway restart
```





### 使用openclaw

<Tabs>

  <TabItem value="web ui" label="web ui" default>

启动 `dashboard`

```shell
openclaw dashboard
```



进行对话

![iShot_2026-03-13_17.02.05](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.02.05.png)

  </TabItem>

  <TabItem value="tui" label="tui">

启动 `tui`

```shell
openclaw tui
```



对话

![iShot_2026-03-13_17.06.55](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.06.55.png)

  </TabItem>

</Tabs>



### 切换模型

<Tabs>

  <TabItem value="临时" label="临时" default>

在 `tui` 界面执行 `/model` 切换模型

![iShot_2026-03-13_17.13.44](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-13_17.13.44.png)

  </TabItem>

  <TabItem value="永久" label="永久">



编辑 `~/.openclaw/openclaw.json` 修改 `agents.defaults.model.primary` 字段指定模型

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "bailian/qwen3.5-plus"
      }
    }
  }
}
```

  </TabItem>

</Tabs>