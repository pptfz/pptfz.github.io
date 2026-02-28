# OpenCode安装

[OpenCode github](https://github.com/anomalyco/opencode)

[OpenCode官网](https://opencode.ai/zh)



## 简介

[**OpenCode**](https://opencode.ai/) 是一个开源的 AI 编码代理。它提供终端界面、桌面应用和 IDE 扩展等多种使用方式。





## 安装

### OpenCode终端

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="brew" label="brew" default>

```shell
brew install anomalyco/tap/opencode
```

  </TabItem>
  <TabItem value="npm" label="npm">

```shell
npm i -g opencode-ai
```

  </TabItem>
  <TabItem value="shell" label="shell">

```shell
curl -fsSL https://opencode.ai/install | bash
```

  </TabItem>
</Tabs>



查看版本

```shell
$ opencode -v
1.2.10
```



终端执行 `opencode` 会进入交互式命令行

![iShot_2026-02-28_17.14.22](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-02-28_17.14.22.png)





### OpenCode桌面版

<Tabs>

  <TabItem value="brew" label="brew" default>

```shell
brew install --cask opencode-desktop
```

  </TabItem>

  <TabItem value="release" label="release">

[release](https://github.com/anomalyco/opencode/releases) 下载

  </TabItem>

</Tabs>



![iShot_2026-02-28_17.19.04](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-02-28_17.19.04.png)



