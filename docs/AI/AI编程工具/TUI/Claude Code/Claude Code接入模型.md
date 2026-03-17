# Claude Code接入模型

[Claude Code接入阿里云百炼](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model&url=3023078)



## 阿里云百炼

### 在Claude Code配置Coding Plan

:::tip 说明

在 Claude Code 中接入百炼 Coding Plan，需要配置以下信息：

- `ANTHROPIC_BASE_URL`：设置为 `https://coding.dashscope.aliyuncs.com/apps/anthropic`。

- `ANTHROPIC_AUTH_TOKEN`：设置为Coding Plan专属 [API Key](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/efm/coding_plan)。

- `ANTHROPIC_MODEL`：设置为 Coding Plan [支持的模型](https://help.aliyun.com/zh/model-studio/coding-plan)。

:::



编辑文件 `~/.claude/settings.json` ，写入以下内容，替换为 Coding Plan 专属 [API Key](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/efm/coding_plan)

```json
{    
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
        "ANTHROPIC_BASE_URL": "https://coding.dashscope.aliyuncs.com/apps/anthropic",
        "ANTHROPIC_MODEL": "qwen3.5-plus"
    }
}
```



编辑文件 `~/.claude.json` ，将`hasCompletedOnboarding` 字段的值设置为 `true`并保存文件。该步骤可避免启动Claude Code时报错：`Unable to connect to Anthropic services`。

```json
{
  "hasCompletedOnboarding": true
}
```



### 使用Claude Code

进入项目所在目录，然后执行 `claude`

![iShot_2026-03-16_17.37.05](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_17.37.05.png)



输入 `/status` 确认模型、`Base URL` 、`API Key` 是否配置正确

![iShot_2026-03-16_18.45.15](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_18.45.15.png)



在 Claude Code 中对话

![iShot_2026-03-16_18.47.13](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-03-16_18.47.13.png)







