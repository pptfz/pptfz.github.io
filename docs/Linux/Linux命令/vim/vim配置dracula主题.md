# vim配置dracula主题

[Dracula Theme for Vim](https://draculatheme.com/vim)



## 创建目录

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="8.2+" label="8.2+" default>

```shell
mkdir -p ~/.vim/pack/themes/start && cd ~/.vim/pack/themes/start
```

  </TabItem>
  <TabItem value="8.0" label="8.0">

```shell
mkdir -p ~/.vim/pack/themes/opt && cd ~/.vim/pack/themes/opt
```

  </TabItem>
</Tabs>



## 克隆仓库

```shell
git clone https://github.com/dracula/vim.git dracula
```





## 编辑 `vimrc`

:::tip 说明

- `~/.vimrc` 的优先级大于 `~/.vim/vimrc`
- **单机使用**用 `~/.vimrc` 即可，这是最传统和通用的方式
- **需要整洁管理**用 `~/.vim/vimrc` ，可以把所有插件、配置都放在 `~/.vim/` 目录下，便于版本控制

:::



```shell
cat > .vim/vimrc << EOF
set nocompatible
syntax on

set termguicolors
set background=dark

colorscheme dracula
EOF
```









