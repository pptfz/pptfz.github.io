# gitlab Server hooks

[gitlab 文档地址](https://docs.gitlab.com/)

[gitlab文档归档地址](https://docs.gitlab.com/archives/)



在文档中搜索 `Server hooks` 即可

## 1.简介

Git支持在不同的操作上执行钩子。这些钩子运行在服务器上，可用于强制特定的提交策略或基于存储库状态执行其他任务。

gitlab支持以下的 hooks

- `pre-receive`
- `post-receive`
- `update`





## 2.配置

背景说明

> 公司使用gitlab作为代码仓库，有些开发配置本地git仓库时不配置个人企业邮箱，因此配置Server hooks来强制使用特定的邮箱格式



gitlab的配置文件 `/etc/gitlab/gitlab.rd` 中有这样一行默认配置 `gitlab_shell['custom_hooks_dir'] = "/opt/gitlab/embedded/service/gitlab-shell/hooks"` ，这个目录定义了Server hooks 脚本存放路径，在这个路径下可以新建 `pre-receive.d` 、 `post-receive.d` 、`update.d`，然后在这些目录中存放相应的脚本



新建目录，默认没有 `hooks` 目录

```shell
mkdir /opt/gitlab/embedded/service/gitlab-shell/hooks
```



新建子目录

```shell
mkdir /opt/gitlab/embedded/service/gitlab-shell/hooks/pre-receive.d
```



新建脚本

> 脚本内容为判断本地git仓库中配置的邮箱是否为要求的格式，如不是则报错并提示如何修改为正确格式
>
> 脚本名称任意

```shell
cat > pre-receive << EOF
#!/bin/sh
#
# An example hook script to make use of push options.
# The example simply echoes all push options that start with 'echoback='
# and rejects all pushes when the "reject" push option is used.
#
# To enable this hook, rename this file to "pre-receive".
read  new ref
log=$(git log -1 $ref )
em=${log#*<}
email=${em%>*}
temp=${log#*@}
email_suffix=${temp%>*}
if [[ ${email_suffix} != '163.com' ]];then
    echo -e '\033[31m    you commit code use email is: "'$email'" the suffix of this email is: '${email_suffix}'
    Email format error: "'$email'" is not formal XXOO LDAP email
    can not commit your code unless follow these steps to modify your email to LDAP email\033[0m
    \033[32msteps:
	1. git config --global --replace-all user.email xxx@163.com
	2. git commit --amend --author "xxx <xxx@163.com>" (modify author email to LDAP email(xxx@163.com) in your commit infos)
	3. :wq\033[0m
    \033[33mattention: if your commit code use email is different from your LDAP email (xxx@163.com),your code will not statistical\033[0m'
    exit 1
else
    echo -e '\033[32myour email is right\033[0m'
    exit 0
fi
EOF
```



修改脚本所有者及赋予可执行权限

```shell
chown git.git pre-receive && chmod u+x pre-receive
```



git本地仓库配置的邮箱是126邮箱，在进行提交代码的时候就会报错如下

![iShot2022-04-18_15.58.47](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-04-18_15.58.47.png)



修改为163格式邮箱

```shell
git config --global --replace-all user.email xxx@163.com
git commit --amend --author "xxx <xxx@163.com>"
```



修改完成后再提交就可以了

![iShot2022-04-18_16.33.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-04-18_16.33.09.png)



### 遇到的报错

在有合并操作的时候遇到了如下报错，gitlab中日志也没有有用的信息，但是查看提交信息，显示还是规则外的邮箱，所以这里有地方影响了合并操作

![iShot2022-04-18_17.47.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-04-18_17.47.32.png)

解决方法就是合并人修改一下commit邮箱就可以了

![iShot2022-04-18_19.31.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2022-04-18_19.31.18.png)