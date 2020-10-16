# mac ssh密钥转换问题

# 一、问题描述

**背景说明**

> 运维跳板机是通过本机的密钥方式登陆的，即把运维本机的公钥添加到跳板机的 `authorized_keys` 文件中，然后通过私钥登陆





**问题说明**

> mac使用命令 `ssh-keygen` 生成的rsa密钥是如下格式的

```
-----BEGIN OPENSSH PRIVATE KEY-----
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```



使用 ZenTermLite 登陆服务器报错如下

![iShot2020-10-12 09.48.30](https://gitee.com/pptfz/picgo-images/raw/master/img/007S8ZIlly1gjmb75g89gj30ns07kmym.jpg)



并且使用 FinallShell 登陆服务器提示如下

![iShot2020-10-12 09.53.46](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-12 09.53.46.png)



# 二、密钥格式转换

**执行以下命令进行密钥格式转换即可**

```shell
ssh-keygen -p -m PEM -f 私钥路径
```

