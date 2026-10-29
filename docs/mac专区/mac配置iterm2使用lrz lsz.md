# mac配置iterm2使用trzsz

[trzsz github](https://github.com/trzsz/trzsz)

[trzsz官网](https://trzsz.github.io/cn/iterm2)



## 安装

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="brew" label="brew" default>

```shell
brew install trzsz
```

  </TabItem>
  <TabItem value="python3" label="python3">

:::caution 注意

```shell
# Debian 12 (Bookworm) / Ubuntu 23.04 及更新版本有 PEP 668 限制，需加 --break-system-packages
sudo python3 -m pip install --upgrade trzsz --break-system-packages
```

:::

```shell
sudo python3 -m pip install --upgrade trzsz-iterm2
```

  </TabItem>

<TabItem value="nodejs" label="nodejs">

```shell
sudo npm install -g trzsz
```

  </TabItem>

</Tabs>



## 配置



`iterm2` -> `设置`

![iShot_2026-10-29_17.23.49](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_17.23.49.png)



`通用` -> `Magic` -> 勾选 `Python API`

![iShot_2026-10-29_17.42.46](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_17.42.46.png)



`配置文件` -> `高级` -> `触发器`

![iShot_2026-10-29_17.52.17](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_17.52.17.png)



点击 `+`

![iShot_2026-10-29_17.53.32](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_17.53.32.png)



配置触发器

:::tip 说明

- 正则表达式填写

  ```shell
  :(:TRZSZ:TRANSFER:[SRD]:\d+\.\d+\.\d+:\d+)
  ```

  

- 操作选择 `运行静默协处理器` ，并在下方填写 `trzsz-iterm2` 的绝对路径

  ```shell
  /opt/homebrew/bin/trzsz-iterm2 \1
  ```

- 勾选 `已启用`

:::

![iShot_2026-10-29_18.57.41](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_18.57.41.png)



## 验证

输入如下指令

```shell
echo '::TRZSZ:TRANSFER:R:1.1.7:1111:2222'
```



如果有弹窗说明配置正确

![iShot_2026-10-29_19.07.25](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iShot_2026-10-29_19.07.25.png)



## 进度条配置

### 使用文本进度条

在触发器操作命令增加 `-p text`

```shell
/opt/homebrew/bin/trzsz-iterm2 -p text \1
```



![iterm2_text](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iterm2_text.gif)



### 使用 [zenity](https://github.com/ncruces/zenity) 进度条

安装 zenity

<Tabs>

  <TabItem value="brew" label="brew" default>

```shell
brew install ncruces/tap/zenity
```

  </TabItem>

  <TabItem value="编译安装" label="编译安装">

```shell
go install github.com/ncruces/zenity/cmd/zenity@latest
sudo cp ~/go/bin/zenity /usr/local/bin/zenity
```

  </TabItem>

</Tabs>



![iterm2_zenity](https://raw.githubusercontent.com/pptfz/piclist-images/master/img/iterm2_zenity.gif)



