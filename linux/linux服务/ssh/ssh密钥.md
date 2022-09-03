[toc]



## 生成密钥

**使用 `ssh-keygen` 命令生成密钥**

```shell
ssh-keygen -t rsa -P '' -q -f ~/.ssh/id_rsa
```



参数说明

| 参数 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| -t   | 密钥类型，可以选择 dsa                                       |
| -f   | 密钥目录位置，指定生成密钥的保存路径和文件名。省略的情况下， 默认为当前用户 `home` 路径下的 `.ssh` 隐藏目录, 也就是 `~/.ssh/` ， 同时默认密钥文件名以 `id_rsa` 开头。-f省略的情况下，默认目录就是 `~/.ssh/`，不会再次提醒输入。但是会再次提是你输入文件名，如果不输入直接回车，则默认的密钥文件名就是 `id_rsa` |
| -N   | -N: 指定此密钥对的密码，如果指定此参数，则命令执行过程中就不会出现交互确认密码的信息了，如果省略此参数，会提示你输入密码和密码确认。一般情况下不用输入，直接回车就行。 如果输入密码之后，以后每次都要输入密码。这里请根据你的安全需要决定是否需要密码，如果不需要，直接回车。 |
| -P   | -P(大写)： 提供旧密码                                        |
| -p   | -p(小写)：要求改变某私钥文件的密码而不重建私钥。程序将提示输入私钥文件名、原来的密码、以及两次输入新密码 |
| -C   | 指定此密钥的备注信息，需要配置多个免密登录时，建议携带；生成的公钥会在最后面显示此备注信息 |
| -q   | 静默模式                                                     |



## 密钥格式转换

一些工具，例如 `ZenTermLite(mac ssh工具)` ，`Another Redis Desktop Manager(redis远程连接工具)`不支持openssh格式的私钥，这个时候就需要将openssh格式的私钥转换为rsa格式



openssh格式开头如下

```shell
-----BEGIN OPENSSH PRIVATE KEY-----
```



rsa格式开头如下

```sh
-----BEGIN RSA PRIVATE KEY-----
```



**转换命令**

```sh
ssh-keygen -p -N"" -m pem -f 旧私钥
```



---





key格式开头如下

```shell
-----BEGIN PRIVATE KEY-----
```



转换为pem命令

```shell
openssl rsa -in xxx.key -out xxx.pem
```



pem格式开头如下

```shell
-----BEGIN RSA PRIVATE KEY-----
```





## 关于自定义秘钥名称的问题

在 `/etc/ssh/ssh_config` 中定义了默认的私钥文件名 `IdentityFile ~/.ssh/id_rsa` ，也就是说，当我们去使用密钥认证登陆的时候，会使用 `id_rsa` 这个私钥去进行认证，如果我们自定义了密钥文件名，在不指定私钥名称的情况下想进行认证，有2种方法解决

- 1.修改 `/etc/ssh/ssh_config` 文件中 `IdentityFile ~/.ssh/id_rsa` 一项，指定私钥文件名称
- 2.在 `.ssh` 目录下做私钥文件软连接，如私钥文件名称自定义为 `id_rsa_abc` ，执行命令 `ln -s id_rsa_abc id_rsa` 即可



## 确认密钥是否匹配

现在有一套密钥文件，公钥 `id_rsa.pub` ，私钥 `id_rsa`  ，想要确认这一套密钥是否匹配，可以使用如下方法

执行命令  `ssh-keygen -y -e -f 私钥文件` ，`Comment` 下边的内容就是当前私钥对应的公钥内容

```shell
$ ssh-keygen -y -e -f id_rsa
---- BEGIN SSH2 PUBLIC KEY ----
Comment: "2048-bit RSA, converted by hehe@tencent from OpenSSH"
AAAAB3NzaC1yc2EAAAADAQABAAABAQC5HqgUY0gaZT70DcvxMWoI9iuolofYrBHSRtWp9H
ecwuat/YS7GVKiMqo8FzkmzKtvdHxP9wAE0/Z0Z+dY5PjYKpPsE4z8bbFcvWkkOwMOSoiz
+aTofgiRaCkI7P+F/QTaabzfaThlDDBcxpQ8fs4czTZbXFZVjg4oWLf2RoRSjikKlE69pf
C/d0iehK5Sox1AeQ3q0nQIBmSRAEobZUVzMS8bGrBoiVMsL9AaLy+o/QszNCCGTNQHDZ8U
naDX3U4+vKh6vAuqaiyg89+a0tuaBayJDkpdjMNl9gIVNFk5onHG9anGmFXZRTI1Q5sGAM
+onztOfx9Oty9y2MqhhnXX
---- END SSH2 PUBLIC KEY ----
```



查看公钥内容

```shell
$ cat id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC5HqgUY0gaZT70DcvxMWoI9iuolofYrBHSRtWp9Hecwuat/YS7GVKiMqo8FzkmzKtvdHxP9wAE0/Z0Z+dY5PjYKpPsE4z8bbFcvWkkOwMOSoiz+aTofgiRaCkI7P+F/QTaabzfaThlDDBcxpQ8fs4czTZbXFZVjg4oWLf2RoRSjikKlE69pfC/d0iehK5Sox1AeQ3q0nQIBmSRAEobZUVzMS8bGrBoiVMsL9AaLy+o/QszNCCGTNQHDZ8UnaDX3U4+vKh6vAuqaiyg89+a0tuaBayJDkpdjMNl9gIVNFk5onHG9anGmFXZRTI1Q5sGAM+onztOfx9Oty9y2MqhhnXX hehe@hehe
```



可以使用 `diff` 命令进行验证

```shell
PRIVATE_KEY=id_rsa
PUBLIC_KEY=id_rsa.pub
diff <( ssh-keygen -y -e -f "${PRIVATE_KEY}" ) <( ssh-keygen -y -e -f "${PUBLIC_KEY}" )
```

