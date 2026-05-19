---
created: 2026-05-19T11:30:46 (UTC +08:00)
tags: []
source: https://mp.weixin.qq.com/s/WxRd25lnmQ3bzo4qz2NySw
author: aaron
---

# OpenCode使用系列课程连载（1）——入门基础篇（极简版）

> ## Excerpt
> 哈喽大家好～ 本期咱们不讲复杂理论，只讲OpenCode日常能用得上的基础操作，参考官方教程逻辑，一步步教大家轻松上手，新手也能快速搞定，不用怕看不懂！

---
命令类别

具体命令

用途说明（新手重点）

Windows安装

Set-ExecutionPolicy RemoteSigned -Scope CurrentUser; irm get.scoop.sh | iex

scoop bucket add extras; scoop install extras/opencode

1\. 安装Scoop包管理器；2. 添加存储桶并安装OpenCode，全程PowerShell执行

Linux安装

curl -fsSL https://opencode.ai/install | bash

npm install -g opencode-ai

1\. 首选：curl一键安装（适配所有Linux）；2. 备用：npm全局安装（需Node.js v18+）

启动方式

opencode

cd 项目目录 && opencode

1\. 普通启动，直接打开交互式界面；2. 项目启动，关联当前项目（最常用）

核心操作

@ 文件名

! 命令

/init

/exit

/undo

/redo

1\. 加载目标文件；2. 执行终端命令；3. 项目初始化（重点）；4. 退出工具；5. 撤销上一步；6. 重做被撤销操作

模型操作

/connect 模型名称

/models

1\. 连接目标AI模型（如/connect GPT-3.5）；2. 切换模型，调出列表选择即可

会话/项目管理

/save

opencode --continue

opencode init 项目名

1\. 保存当前会话；2. 恢复上次会话；3. 终端初始化项目（备用）

验证/问题解决

opencode --version

set-ExecutionPolicy RemoteSigned

1\. 验证OpenCode是否安装成功；2. Windows解决脚本无法执行问题
