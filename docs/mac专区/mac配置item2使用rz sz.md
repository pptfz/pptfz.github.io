# mac配置item2使用rz sz

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

> 新方案（trzsz）见《[mac配置iterm2使用trzsz](./mac配置iterm2使用lrz%20lsz)》：不需要写脚本，自带进度条，支持传目录和断点续传。本篇 lrzsz 方案保留作参考，注意实测在部分环境（如 OrbStack 本地 VM）会死锁。

## 1.安装lrzsz

```shell
brew install lrzsz
```

> 装完用 `command -v rz sz` 确认路径：
> - Intel 芯片 Homebrew 装在 `/usr/local/bin`
> - Apple Silicon（M 系列）装在 `/opt/homebrew/bin`
>
> 下面脚本按芯片分两套，**把 `rz`/`sz` 路径直接写死**（不再用 `which` 动态探测）。写死比动态探测更稳：iTerm2 的 coprocess 不加载 `~/.zshrc`，PATH 里常不含 homebrew 目录，动态 `which` 会失败并向 stderr 报错，导致 coprocess 被 iTerm2 判定异常终止而卡死。先确认自己芯片（苹果菜单 → 关于本机），复制对应那套。如果之前装过又被卸了，直接 `brew install lrzsz` 重装即可。


## 2.创建 `iterm2-send-zmodem.sh` 和 `iterm2-recv-zmodem.sh`

先确认芯片：苹果菜单 → 关于本机。**切到对应选项卡，把里面的所有命令一次性复制粘贴到本机本地终端（不要 ssh 会话里）**。`sudo tee` 等价于 `cat >`，以 root 写入 `/usr/local/bin/`。

两个版本的唯一区别就是 `rz`/`sz` 写死的位置：Apple 芯片在 `/opt/homebrew/bin`，Intel 在 `/usr/local/bin`。脚本不再做任何路径探测，也不判断 iTerm / iTerm2（你的机器就是 iTerm2，直接用）。

<Tabs>
<TabItem value="apple" label="Apple 芯片（M 系列）" default>

**发送脚本 `iterm2-send-zmodem.sh`**（本地选文件 → 发到远端）：

```shell
sudo tee /usr/local/bin/iterm2-send-zmodem.sh >/dev/null <<'EOF'
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required
# Remainder of script public domain

# Apple 芯片：rz/sz 装在 /opt/homebrew/bin（写死）
SZ=/opt/homebrew/bin/sz
RZ=/opt/homebrew/bin/rz

FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose file with prompt "Choose a file to send"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
if [[ $FILE = "" ]]; then
  echo Cancelled.
  # Send ZModem cancel
  echo -e \\x18\\x18\\x18\\x18\\x18
  sleep 1
  echo
  echo \# Cancelled transfer
else
  "$SZ" "$FILE" -e -b
  sleep 1
  echo
  echo \# Received $FILE
fi
EOF
```

**接收脚本 `iterm2-recv-zmodem.sh`**（远端发文件 → 本地选目录接收）：

```shell
sudo tee /usr/local/bin/iterm2-recv-zmodem.sh >/dev/null <<'EOF'
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required
# Remainder of script public domain

# Apple 芯片：rz/sz 装在 /opt/homebrew/bin（写死）
SZ=/opt/homebrew/bin/sz
RZ=/opt/homebrew/bin/rz

FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose folder with prompt "Choose a folder to place received files in"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`

if [[ $FILE = "" ]]; then
  echo Cancelled.
  # Send ZModem cancel
  echo -e \\x18\\x18\\x18\\x18\\x18
  sleep 1
  echo
  echo \# Cancelled transfer
else
  cd "$FILE"
  "$RZ" -E -e -b
  sleep 1
  echo
  echo
  echo \# Sent \-\> $FILE
fi
EOF
```

</TabItem>
<TabItem value="intel" label="Intel 芯片">

**发送脚本 `iterm2-send-zmodem.sh`**（本地选文件 → 发到远端）：

```shell
sudo tee /usr/local/bin/iterm2-send-zmodem.sh >/dev/null <<'EOF'
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required
# Remainder of script public domain

# Intel 芯片：rz/sz 装在 /usr/local/bin（写死）
SZ=/usr/local/bin/sz
RZ=/usr/local/bin/rz

FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose file with prompt "Choose a file to send"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
if [[ $FILE = "" ]]; then
  echo Cancelled.
  # Send ZModem cancel
  echo -e \\x18\\x18\\x18\\x18\\x18
  sleep 1
  echo
  echo \# Cancelled transfer
else
  "$SZ" "$FILE" -e -b
  sleep 1
  echo
  echo \# Received $FILE
fi
EOF
```

**接收脚本 `iterm2-recv-zmodem.sh`**（远端发文件 → 本地选目录接收）：

```shell
sudo tee /usr/local/bin/iterm2-recv-zmodem.sh >/dev/null <<'EOF'
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required
# Remainder of script public domain

# Intel 芯片：rz/sz 装在 /usr/local/bin（写死）
SZ=/usr/local/bin/sz
RZ=/usr/local/bin/rz

FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose folder with prompt "Choose a folder to place received files in"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`

if [[ $FILE = "" ]]; then
  echo Cancelled.
  # Send ZModem cancel
  echo -e \\x18\\x18\\x18\\x18\\x18
  sleep 1
  echo
  echo \# Cancelled transfer
else
  cd "$FILE"
  "$RZ" -E -e -b
  sleep 1
  echo
  echo
  echo \# Sent \-\> $FILE
fi
EOF
```

</TabItem>
</Tabs>

最后赋执行权限（两个芯片都要）：

```shell
sudo chmod +x /usr/local/bin/iterm2-send-zmodem.sh /usr/local/bin/iterm2-recv-zmodem.sh
```


## 3.配置iTerm2

第一步、点击 `Preferences`

![iShot2022-01-15_16.50.19](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot2022-01-15_16.50.19.png)



第二步、在 `Profiles` -> `Advanced` -> `Triggers` -> `Edit`

![iShot2022-01-15_16.57.18](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot2022-01-15_16.57.18.png)



点击 `+` 

![iShot2022-01-15_16.58.55](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot2022-01-15_16.58.55.png)



新增 2 个配置。下面表格**只是排版参考，iTerm2 是三个独立输入框（正则 / 动作 / 参数）分别填的，千万不要整行连 `|` 一起复制**——直接照下面的「逐字段填写」一项项粘。

| 填到哪一栏 | 填什么 |
| :--- | :--- |
| Regular Expression（正则框） | `\*\*B0100` |
| Action（动作下拉） | `Run Silent Coprocess` |
| Parameters（参数框） | `/usr/local/bin/iterm2-send-zmodem.sh` |
| Instant（复选框） | 勾上 |

第二条同理：

| 填到哪一栏 | 填什么 |
| :--- | :--- |
| Regular Expression（正则框） | `\*\*B00000000000000` |
| Action（动作下拉） | `Run Silent Coprocess` |
| Parameters（参数框） | `/usr/local/bin/iterm2-recv-zmodem.sh` |
| Instant（复选框） | 勾上 |

**逐字段填写（只复制冒号后的值到对应框，别复制整行表格）：**

```
规则1  正则: \*\*B0100
规则1  Action: Run Silent Coprocess
规则1  参数: /usr/local/bin/iterm2-send-zmodem.sh

规则2  正则: \*\*B00000000000000
规则2  Action: Run Silent Coprocess
规则2  参数: /usr/local/bin/iterm2-recv-zmodem.sh
```

> - 正则里 `*` 是量词，字面星号必须写成 `\*`，所以 `**B0100` 要写成 `\*\*B0100`（末尾补一个 `0` 更精确，避免误匹配）。
> - **Action 选 `Run Silent Coprocess`**（不是 Run Coprocess）。
> - **两条规则都勾上 `Instant`**（新版 iTerm2 不勾 Instant 抓不到 zmodem 的流式握手包，就会卡住）。
> - Parameters 里的脚本路径是 `/usr/local/bin/...`（脚本本身放哪就在哪），跟 `rz`/`sz` 二进制路径无关——`rz`/`sz` 路径在第 2 步按芯片写死在脚本里（Apple 选 `/opt/homebrew/bin`，Intel 选 `/usr/local/bin`）。

![iShot2022-01-15_17.01.47](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot2022-01-15_17.01.47.png)


## 4.排错（rz/sz 卡住不动）

**现象**：远端执行 `rz` 或 `sz` 后，终端直接打印出 `**B0100...`、`**B00000000000000` 这类乱码，然后卡住没反应。

**原因**：这些乱码是 zmodem 的握手控制字符，本该被 iTerm2 的 Trigger 拦截并交给本地 coprocess 脚本处理。直接打印出来 = 本地没接管。按概率排查：

1. **lrzsz 被卸载 / 没装**（最常见）：本机跑 `command -v rz sz`，若为空就 `brew install lrzsz` 重装。脚本路径是写死的，前提是 `rz`/`sz` 得装在那条路径上（按芯片分两套）。
2. **脚本里 rz/sz 路径不对**（报错 `No such file or directory`）：你大概率选错了芯片版本。本机 `command -v rz sz` 看实际路径——`/opt/homebrew/bin` 就是 Apple 芯片版，`/usr/local/bin` 就是 Intel 版，照第 2 步重贴对应选项卡里的脚本即可。
3. **Trigger 没配好**：正则少了转义（`**B0100` 必须写成 `\*\*B0100`）、Action 没选 `Run Silent Coprocess`、或两条规则没勾 **Instant**。
4. **脚本没执行权限**：`ls -l /usr/local/bin/iterm2-*.sh` 确认带 `x`，没有就 `chmod +x`。

**验证本机脚本路径是否写对（应能看到四行，且是你芯片对应的路径，例如 Apple 芯片显示 `/opt/homebrew/bin/sz`）：**

```shell
grep -n '^SZ=\|^RZ=' /usr/local/bin/iterm2-send-zmodem.sh /usr/local/bin/iterm2-recv-zmodem.sh
```

**验证**：关掉当前 tab / 重连 ssh 后，`rz` 应弹出"选文件"窗口，`sz 文件名` 应弹出"选保存目录"窗口，能弹窗就说明接管成功。


## 5.取消传输

传输过程中 `Ctrl+C` 基本杀不掉（lrzsz 会吞掉 SIGINT），zmodem 的协议级取消是**连按 5 次 `Ctrl+X`**。还不行就开个新 tab 清场：

```shell
pkill sz; pkill rz
```
