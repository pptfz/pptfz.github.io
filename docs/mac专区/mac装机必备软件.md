# mac装机必备软件

## 宁波上官科技专区

### [直接上官网看，都是精品](https://www.better365.cn/)



## 运维工具

### 小工具类

#### SwitchHosts

- [SwitchHosts](https://github.com/oldj/SwitchHosts) 是一个管理、切换多个 hosts 方案的工具



### ssh终端类

#### ZenTermLite

- [ZenTermLite](https://apps.apple.com/cn/app/zen-term-lite-ssh%E5%AE%A2%E6%88%B7%E7%AB%AF/id1422475219) 是mac上一款非常好用且免费的国产ssh工具



#### iTerm2

- [iTerm2](https://github.com/gnachman/iTerm2)是mac上一款非常经典的开源ssh工具



## 编辑器

### macvim

- [macvim](https://github.com/macvim-dev/macvim) 是一款适用于macOS的vim文本编辑器



### Sublime Text

- [Sublime Text](https://www.sublimetext.com/) 是一款非常好用且同时适用于文本编辑、多语言代码编辑的编辑器



### Builder x

- [HBuilder X](https://www.dcloud.io/hbuilderx.html) 是**轻如编辑器、强如IDE**的合体版本





## 视频工具

### you-get

- [you-get](https://github.com/soimort/you-get) 是一个小型命令行实用程序，用于从 Web 下载媒体内容（视频、音频、图像等）





## 效率小工具

### Kiro CLI（原 Amazon Q CLI / q）

- **来源**：这款工具经历了三代：`q`（Amazon CodeWhisperer CLI）→ Amazon Q CLI → **Kiro CLI**（Amazon 收购 Fig 后于 2025-11 改名，配置从 ~/.aws/amazonq 迁移到 ~/.kiro）
- **用途**：终端里的**内联 ghost 补全**（灰色建议，Tab 采纳）——靠桌面引擎 + macOS 辅助功能权限实现，也是 Kiro 收购 Fig 的技术。本人只用这一个功能，agent/chat 功能一概不用
- 官方文档：https://kiro.dev/docs/cli/ ｜ 更新日志：https://kiro.dev/changelog

#### 版本锁定 2.37.0（重要）

- **CLI 3.0 起移除了内联 shell 补全**（同时移除 use_aws 工具、Classic 界面、/checkpoint），所以必须钉死 2.x 最后一版 2.37.0
- 关闭更新：dashboard → Preferences → Startup → 关闭 **Automatic updates** 和 **Beta**
- 物理锁死（防手滑升级）：`sudo chflags -R uchg "/Applications/Kiro CLI.app"`，解锁用 `nouchg`
- 历史版本按版本号直接下载（官方保留所有旧版）：`https://prod.download.cli.kiro.dev/stable/<版本号>/Kiro%20CLI.dmg`，校验和见同目录 manifest.json
- 安装时用 `ditto` 复制比 Finder 拖拽稳：`ditto "/Volumes/Kiro CLI/Kiro CLI.app" "/Applications/Kiro CLI.app"`

#### 常用命令备忘（本次排查实际用过的）

**禁止更新（重点，三层防线）**

```bash
# 第 1 层（UI 开关，必做）：dashboard → Preferences → Startup
#   关闭 "Automatic updates" 和 "Beta"。
#   原理：桌面引擎的自动升级由这个开关控制，关掉后不再静默拉新版本。

# 第 2 层（行为约束，养成习惯）：以下两样永远不要碰
#   ① 不执行 kiro-cli update（这是手动升级命令，不跑就不会升）
#   ② 不重新执行 curl -fsSL https://cli.kiro.dev/install | bash（脚本永远拉最新版）
#   弹窗引导切 V3 时选 "Don't ask again"

# 第 3 层（物理锁，终极保险）：把 app 文件锁成不可写，任何更新程序都覆盖不了
sudo chflags -R uchg "/Applications/Kiro CLI.app"
# 解锁（升级/卸载/重装前必须先解锁）：
sudo chflags -R nouchg "/Applications/Kiro CLI.app"
```

**安装 / 重装**

```bash
# 下载指定版本（官方保留所有历史版本，校验和看同目录 manifest.json）
curl -L "https://prod.download.cli.kiro.dev/stable/2.37.0/Kiro%20CLI.dmg" -o ~/Desktop/KiroCLI-2.37.0.dmg

# 校验：sha256 必须与 manifest.json 里对应包一致
shasum -a 256 ~/Desktop/KiroCLI-2.37.0.dmg

# 挂载 / 卸载 DMG（"资源忙"时先 hdiutil info 查残留挂载，找到 /dev/diskX 后 detach -force）
hdiutil attach ~/Desktop/KiroCLI-2.37.0.dmg -nobrowse -readonly
hdiutil detach "/Volumes/Kiro CLI"

# 用 ditto 安装（比 Finder 拖拽稳，不会产生复制中断的 .BC.T_* 残片）
ditto "/Volumes/Kiro CLI/Kiro CLI.app" "/Applications/Kiro CLI.app"
```

**日常排查**

```bash
kiro-cli version                     # 确认还是 2.37.0（只要版本没变，补全功能就在）
pgrep -fl kiro_cli_desktop           # 补全引擎进程在不在（不在就没有一切提示）
pkill -f kiro_cli_desktop && open -a "Kiro CLI"   # 重启补全引擎（授权/改设置后必须做）
codesign --verify --deep "/Applications/Kiro CLI.app"   # 报"已损坏"时验签名是否真坏
xattr -l 文件                        # 查看隔离/来源属性（quarantine 会触发 Gatekeeper 拦截）
sqlite3 ~/Library/Application\ Support/kiro-cli/data.sqlite3 \
  "SELECT key,value FROM state;"     # 看引擎状态：logged-in、补全触发计数等
```


#### 踩坑记录（2026-11-01 排查实录）

1. **装完没提示，引擎没运行**：补全引擎是 app 里的 `kiro_cli_desktop` 进程，app 不在 /Applications 就一切免谈。一次是安装脚本卡半路（DMG 挂在 /private/var/folders 临时目录没弹出来，`hdiutil info` 能看到），一次是 Finder 拖拽复制被打断
2. **"已损坏，无法打开"**：不是包有毒，是拖拽复制中断留下 .BC.T_* 残片导致签名缺失（`codesign --verify --deep` 报 sealed resource invalid）。重新完整复制即可，不用删 DMG
3. **授权了辅助功能还是没提示**：权限要**进程重启**才生效，`pkill -f kiro_cli_desktop && open -a "Kiro CLI"`
4. **最大的坑**：CLI 登录了 ≠ 桌面引擎登录了。状态库（`~/Library/Application Support/kiro-cli/data.sqlite3` 的 state 表）里 `desktop.auth-watcher.logged-in=false` 时，补全引擎不会调云端模型，永远没提示。要在 dashboard 里确认已登录
5. **补全只在普通 shell 提示符出现**，vim 等全屏程序里没有；Linux 从未支持此功能，macOS 独享
6. **完整卸载清单**（重装修复用）：`/Applications/Kiro CLI.app`、`~/.local/bin/`（kiro-cli、q、kiro-cli-chat、kiro-cli-term）、`~/Library/Application Support/kiro-cli`（800M+，含会话）、`~/Library/Application Support/fig`、`~/.kiro`（agent 配置，删前备份）



### Manico

- [Manico](https://manico.im/) 是一个为 macOS 设计的快速的App启动和切换工具



### Go2Shell

- [Go2Shell](https://zipzapmac.com/Go2Shell) 是一个在访达中打开一个终端窗口到当前目录的工具



### Manico

[Manico](https://manico.im/) 是一个可以在mac上快速启动以及切换app的工具



## 图片压缩

### uPic / ImageOptim

- [uPic](https://upic.iluoxiao.com/) / [ImageOptim](https://upic.iluoxiao.com/) 是同一个作者开发的一款支持图片压缩、格式转换的图片压缩工具

![upic](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/upic.gif)



### 智图

- [智图](https://zhitu.isux.us/)是腾讯 ISUX 团队开发的一款图片压缩工具





## 图床工具

### PicGo

- [PicGo](https://github.com/Molunerfinn/PicGo) 是一个用于快速上传图片并获取图片 URL 链接的工具



## 同步工具

### OneDrive

- [OneDrive](https://onedrive.live.com/) 是微软出品的一款同步工具



### Google Drive

- [Google Drive](https://workspace.google.com/products/drive/) 是谷歌出品的一款同步工具



## 软件卸载

### appcleaner

- [appcleaner](https://freemacsoft.net/appcleaner/) 是一个删除mac软件的工具



## 可视化工具

### Cork

- [Cork](https://github.com/buresdv/Cork) 是一款mac homebrew 可视化管理工具
