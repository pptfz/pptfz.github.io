# brew安装

[brew官网](https://brew.sh/index_zh-cn)



国外源

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```



国内源

```shell
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```



# brew替换国内源

[中科大homebrew配置说明文档](https://mirrors.ustc.edu.cn/help/brew.git.html)



## 替换 `brew.git`

```shell
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
```



## 替换 `homebrew-core.git`

```shell
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git
```



## 替换 `homebrew-bottles`

```shell
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
```



## 应用生效

```shell
brew update
```





# 重置brew

## 重置 `brew.git`

```shell
cd "$(brew --repo)"
git remote set-url origin https://github.com/Homebrew/brew.git
```



## 重置 `homebrew-core.git`

```shell
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://github.com/Homebrew/homebrew-core.git
```



