# Codex接入模型

## 阿里云百炼 Coding Plan

访问 [阿里云百炼 Coding Plan](https://www.aliyun.com/benefit/scene/codingplan?scm=20140722.M_10973880.P_152.MO_5552-ID_10966842-MID_10966842-CID_37554-ST_15642-PA_se@1021221087-V_1) 购买套餐，购买后按照提示获取套餐专属API Key

[Coding Plan概述](https://help.aliyun.com/zh/model-studio/coding-plan)

[在 Codex 中配置 Coding Plan](https://bailian.console.aliyun.com/cn-beijing/?spm=5176.42831342.commonbuy2container.4.5f0b778bGwtMwt&tab=doc#/doc/?type=model&url=3023087)



:::caution 注意

阿里云百炼目前支持的最新codex版本为0.80.0

```shell
npm install -g @openai/codex@0.80.0
```

:::



## 修改配置文件

编辑 `~/.codex/config.toml` ，新增如下内容，替换实际的apices

```toml
model_provider = "Model_Studio_Coding_Plan"
model = "qwen3.5-plus"
[model_providers.Model_Studio_Coding_Plan]
name = "Model_Studio_Coding_Plan"
base_url = "https://coding.dashscope.aliyuncs.com/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```





## **配置环境变量**

:::tip 说明

codex接入模型需要配置环境变量，但是我现在的 `.zshrc` 是通过git管理的，因为我有多台mac电脑，想要实现文件统一管理，但是又不能把带有密钥的文件推送到git仓库中，可以采取拆分成2个文件的方法

git里的 `.zshrc` 只写如下内容

```shell
[ -f ~/.zshrc.local ] && source ~/.zshrc.local
```



每台机器单独创建 `.zshrc.local`（不推送到git），把密钥写入到 `.zshrc.local` 中

```shell
echo 'export OPENAI_API_KEY="YOUR_API_KEY"' >> .zshrc.local
```

:::

将配置文件中的 `OPENAI_API_KEY` 环境变量设置为 Coding Plan 专属 [API Key](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/efm/coding_plan)

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="zsh" label="zsh" default>

```shell
echo 'export OPENAI_API_KEY="YOUR_API_KEY"' >> ~/.zshrc && source ~/.zshrc
```

  </TabItem>
  <TabItem value="bash" label="bash">

```shell
echo 'export OPENAI_API_KEY="YOUR_API_KEY"' >> ~/.bash_profile && source ~/.bash_profile
```

  </TabItem>
</Tabs>





