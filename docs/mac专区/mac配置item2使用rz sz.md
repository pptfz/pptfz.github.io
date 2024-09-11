# mac配置item2使用rz sz

## 1.安装lrzsz

> 已提前安装好brew

```shell
brew install lrzsz
```



## 2.手动编辑 `iterm2-send-zmodem.sh` 和 `iterm2-recv-zmodem.sh`

**<span style={{color: 'red'}}>别尼玛从github下载了，作者都特么把[github仓库](https://github.com/aikuyun/iterm2-zmodem)删除了</span>**

编辑2个脚本并放到 `/usr/local/bin/` 下，然后授予执行权限

```shell
chmod +x /usr/local/bin/iterm2-send-zmodem.sh
chmod +x /usr/local/bin/iterm2-recv-zmodem.sh
```



**`iterm2-send-zmodem.sh` 脚本内容**

```shell
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required 
# Remainder of script public domain

osascript -e 'tell application "iTerm2" to version' > /dev/null 2>&1 && NAME=iTerm2 || NAME=iTerm
if [[ $NAME = "iTerm" ]]; then
	FILE=`osascript -e 'tell application "iTerm" to activate' -e 'tell application "iTerm" to set thefile to choose file with prompt "Choose a file to send"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
else
	FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose file with prompt "Choose a file to send"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
fi
if [[ $FILE = "" ]]; then
	echo Cancelled.
	# Send ZModem cancel
	echo -e \\x18\\x18\\x18\\x18\\x18
	sleep 1
	echo
	echo \# Cancelled transfer
else
	/usr/local/bin/sz "$FILE" -e -b
	sleep 1
	echo
	echo \# Received $FILE
fi
```



**`iterm2-recv-zmodem.sh` 脚本内容**

```shell
#!/bin/bash
# Author: Matt Mastracci (matthew@mastracci.com)
# AppleScript from http://stackoverflow.com/questions/4309087/cancel-button-on-osascript-in-a-bash-script
# licensed under cc-wiki with attribution required 
# Remainder of script public domain

osascript -e 'tell application "iTerm2" to version' > /dev/null 2>&1 && NAME=iTerm2 || NAME=iTerm
if [[ $NAME = "iTerm" ]]; then
	FILE=`osascript -e 'tell application "iTerm" to activate' -e 'tell application "iTerm" to set thefile to choose folder with prompt "Choose a folder to place received files in"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
else
	FILE=`osascript -e 'tell application "iTerm2" to activate' -e 'tell application "iTerm2" to set thefile to choose folder with prompt "Choose a folder to place received files in"' -e "do shell script (\"echo \"&(quoted form of POSIX path of thefile as Unicode text)&\"\")"`
fi

if [[ $FILE = "" ]]; then
	echo Cancelled.
	# Send ZModem cancel
	echo -e \\x18\\x18\\x18\\x18\\x18
	sleep 1
	echo
	echo \# Cancelled transfer
else
	cd "$FILE"
	/usr/local/bin/rz -E -e -b
	sleep 1
	echo
	echo
	echo \# Sent \-\> $FILE
fi
```



## 3.配置iTerm2

第一步、点击 `Preferences`

![iShot2022-01-15_16.50.19](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-15_16.50.19.png)





第二步、在 `Profiles` -> `Advanced` -> `Triggers` -> `Edit`

![iShot2022-01-15_16.57.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-15_16.57.18.png)





点击 `+` 

![iShot2022-01-15_16.58.55](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-15_16.58.55.png)





新增2个配置

```shell
\*\*B010	Run Silent Coprocess	/usr/local/bin/iterm2-send-zmodem.sh
\*\*B00000000000000	Run Silent Coprocess	/usr/local/bin/iterm2-recv-zmodem.sh
```



![iShot2022-01-15_17.01.47](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2022-01-15_17.01.47.png)

