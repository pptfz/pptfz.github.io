# gvm安装

[gvm github地址](https://github.com/moovweb/gvm)



## 简介

gvm是一个go版本管理工具，可以很方便的切换当前系统使用的go的不同版本，以解决在不同开发环境下go版本和api等的依赖关系



## 安装

:::tip 说明

如果系统使用的是 `zsh` 则需要将 `bash` 修改为 `zsh` 

mac操作系统要求

- [从https://www.mercurial-scm.org/downloads](https://www.mercurial-scm.org/downloads)安装 Mercurial
- 从 App Store 安装 Xcode 命令行工具。

```shell
xcode-select --install
brew update
brew install mercurial
```

:::

可以使用官方的一键安装脚本进行安装

```shell
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
```



脚本内容如下，其中有一行配置 `SRC_REPO=${SRC_REPO:-https://github.com/moovweb/gvm.git}` ，这里的地址是 `github.com` ，由于某些特殊原因，我们需要将这个地址修改为加速地址

:::tip 说明

修改

​	`https://github.com/moovweb/gvm.git`

修改为	`https://gh.api.99988866.xyz/https://github.com/moovweb/gvm.git`

:::

脚本中已经有 `EOF` 了，因此这里使用 `AAA`

```shell
cat > gvm-install.sh << 'AAA'
#!/usr/bin/env bash

display_error() {
	tput sgr0
	tput setaf 1
	echo "ERROR: $1"
	tput sgr0
	exit 1
}

update_profile() {
	[ -f "$1" ] || return 1

	grep -F "$source_line" "$1" > /dev/null 2>&1
	if [ $? -ne 0 ]; then
		echo -e "\n$source_line" >> "$1"
	fi
}

check_existing_go() {

	if [ "$GOROOT" = "" ]; then
		if which go > /dev/null; then
			GOROOT=$(go env | grep GOROOT | cut -d"=" -f2)
		else
			echo "No existing Go versions detected"
			return
		fi
	fi
	echo "Created profile for existing install of Go at $GOROOT"
	mkdir -p "$GVM_DEST/$GVM_NAME/environments" &> /dev/null || display_error "Failed to create environment directory"
	mkdir -p "$GVM_DEST/$GVM_NAME/pkgsets/system/global" &> /dev/null || display_error "Failed to create new package set"
	mkdir -p "$GVM_DEST/$GVM_NAME/gos/system" &> /dev/null || display_error "Failed to create new Go folder"
	cat << EOF > $GVM_DEST/$GVM_NAME/environments/system
# Automatically generated file. DO NOT EDIT!
export GVM_ROOT; GVM_ROOT="$GVM_DEST/$GVM_NAME"
export gvm_go_name; gvm_go_name="system"
export gvm_pkgset_name; gvm_pkgset_name="global"
export GOROOT; GOROOT="$GOROOT"
export GOPATH; GOPATH="$GVM_DEST/$GVM_NAME/pkgsets/system/global"
export PATH; PATH="$GVM_DEST/$GVM_NAME/pkgsets/system/global/bin:$GOROOT/bin:$GVM_ROOT/bin:\$PATH"
EOF
}

BRANCH=${1:-master}
GVM_DEST=${2:-$HOME}
GVM_NAME="gvm"
# SRC_REPO=${SRC_REPO:-https://github.com/moovweb/gvm.git}
SRC_REPO=${SRC_REPO:-https://ghproxy.com/https://github.com/moovweb/gvm.git}

[ "$GVM_DEST" = "$HOME" ] && GVM_NAME=".gvm"

[ -d "$GVM_DEST/$GVM_NAME" ] && display_error \
    "Already installed! Remove old installation by running

    rm -rf $GVM_DEST/$GVM_NAME"

[ -d "$GVM_DEST" ] || mkdir -p "$GVM_DEST" > /dev/null 2>&1 || display_error "Failed to create $GVM_DEST"
[ -z "$(which git)" ] && display_error "Could not find git

  debian/ubuntu: apt-get install git
  redhat/centos: yum install git
  archlinux: pacman -S git
  mac:   brew install git
"

# Is gvm-installer being called from the origin repo?
# If so, skip the clone and source locally!
# This prevents CI from breaking on non-merge commits.

GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [[ -z "$GIT_ROOT" || "$(basename "$GIT_ROOT")" != "gvm" ]]
then
  echo "Cloning from $SRC_REPO to $GVM_DEST/$GVM_NAME"

  git clone --quiet "$SRC_REPO" "$GVM_DEST/$GVM_NAME" 2> /dev/null ||
	  display_error "Failed to clone from $SRC_REPO into $GVM_DEST/$GVM_NAME"
else
  if [[ $GVM_DEST == *"$GIT_ROOT"* ]]
  then
    ln -s "$GIT_ROOT" "$GVM_DEST"
  else
    cp -r "$GIT_ROOT" "$GVM_DEST/$GVM_NAME"
  fi
fi

# GVM_DEST may be a non-relative path
# i.e: gvm-installer master foo
pushd . > /dev/null

cd "$GVM_DEST/$GVM_NAME" && git checkout --quiet "$BRANCH" 2> /dev/null ||	display_error "Failed to checkout $BRANCH branch"

popd > /dev/null

[ -z "$GVM_NO_GIT_BAK" ] && mv "$GVM_DEST/$GVM_NAME/.git" "$GVM_DEST/$GVM_NAME/git.bak"

source_line="[[ -s \"${GVM_DEST}/$GVM_NAME/scripts/gvm\" ]] && source \"${GVM_DEST}/$GVM_NAME/scripts/gvm\""
source_file="${GVM_DEST}/$GVM_NAME/scripts/gvm"

if [ -z "$GVM_NO_UPDATE_PROFILE" ] ; then
  if [ -n "$ZSH_NAME" ]; then
    update_profile "$HOME/.zshrc"
  elif [ "$(uname)" == "Linux" ]; then
    update_profile "$HOME/.bashrc" || update_profile "$HOME/.bash_profile"
  elif [ "$(uname)" == "Darwin" ]; then
    update_profile "$HOME/.profile" || update_profile "$HOME/.bash_profile"
  fi
fi

if [ -z "$GVM_NO_UPDATE_PROFILE" ] && [ "$?" != "0" ]; then
	echo "Unable to locate profile settings file(Something like $HOME/.bashrc or $HOME/.bash_profile)"
	echo
	echo " You will have to manually add the following line:"
	echo
	echo "  $source_line"
	echo
fi

echo "export GVM_ROOT=$GVM_DEST/$GVM_NAME" > "$GVM_DEST/$GVM_NAME/scripts/gvm"
echo ". \$GVM_ROOT/scripts/gvm-default" >> "$GVM_DEST/$GVM_NAME/scripts/gvm"
check_existing_go
[[ -s "$GVM_DEST/$GVM_NAME/scripts/gvm" ]] && source "$GVM_DEST/$GVM_NAME/scripts/gvm"
echo "Installed GVM v${GVM_VERSION}"
echo
echo "Please restart your terminal session or to get started right away run"
echo " \`source ${source_file}\`"
echo
AAA
```



手动执行脚本

```shell
zsh gvm-install.sh
```



安装完成后会提示如下，根据提示重启终端或者运行命令即可

```shell
Please restart your terminal session or to get started right away run
 `source /Users/pptfz/.gvm/scripts/gvm`
```



验证安装

```shell
$ gvm version
Go Version Manager v1.0.22 installed at /Users/pptfz/.gvm
```



## 使用

列出所有已安装的go版本

```shell
gvm list
```



列出所有可供下载的go版本

```shell
gvm listall
```



安装最新版

```shell
gvm install go
```



安装指定版本

```shell
gvm install go1.17.7
```



从二进制安装

```shell
gvm install go1.17.7 -B
```



删除某一个go版本

```shell
gvm uninstall go1.19.8
```



完全删除gvm和所有已安装的go版本和包

```sh
gvm implode
```



完全删除gvm也可以直接删除目录

```shell
rm -rf ~/.gvm
```

