[toc]



## 生成密钥



### 不加参数生成

```shell
$ ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): # 密钥存放路径
Enter passphrase (empty for no passphrase): # 设置密钥密码
Enter same passphrase again: # 确认密钥密码
Your identification has been saved in /root/.ssh/id_rsa
Your public key has been saved in /root/.ssh/id_rsa.pub
```





### 加参数生成

```shell
ssh-keygen -t rsa -P '' -q -f ~/.ssh/id_rsa
```



选项说明

| 选项 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| `-t` | 密钥类型，可选有 `dsa` 、 `ecdsa`  、`ecdsa-sk`  、 `ed25519` 、 `ed25519-sk` 、 `rsa` |
| `-f` | 密钥目录位置，指定生成密钥的保存路径和文件名。省略的情况下， 默认为当前用户 `home` 路径下的 `.ssh` 隐藏目录, 也就是 `~/.ssh/` ， 同时默认密钥文件名以 `id_rsa` 开头。-f省略的情况下，默认目录就是 `~/.ssh/`，不会再次提醒输入。但是会再次提是你输入文件名，如果不输入直接回车，则默认的密钥文件名就是 `id_rsa` |
| `-N` | -N: 指定此密钥对的密码，如果指定此参数，则命令执行过程中就不会出现交互确认密码的信息了，如果省略此参数，会提示你输入密码和密码确认。一般情况下不用输入，直接回车就行。 如果输入密码之后，以后每次都要输入密码。这里请根据你的安全需要决定是否需要密码，如果不需要，直接回车。 |
| `-P` | -P(大写)： 提供旧密码                                        |
| `-p` | -p(小写)：要求改变某私钥文件的密码而不重建私钥。程序将提示输入私钥文件名、原来的密码、以及两次输入新密码 |
| `-C` | 指定此密钥的备注信息，需要配置多个免密登录时，建议携带；生成的公钥会在最后面显示此备注信息 |
| `-q` | 静默模式                                                     |
| `-b` | 指定密钥的长度，对于 `RSA` 密钥，最小长度为1024，默认为3072  |





### 查看密钥长度

```shell
$ ssh-keygen -lf ~/.ssh/id_rsa
3072 SHA256:t9FFlDU7+PMBouLMNPv9Z3d8dloYZF0f973m9SPXX2E root@devops (RSA)
```



### 确认密钥是否设置密码

:::tip 说明

如果密钥设置了密码，则会提示 `Enter passphrase:` ，如果密钥没有设置密码，则会直接输出公钥

:::

```shell
ssh-keygen -yf ~/.ssh/id_rsa
```



## 密钥格式转换

一些工具，例如 `ZenTermLite(mac ssh工具)` ，`Another Redis Desktop Manager(redis远程连接工具)`不支持openssh格式的私钥，这个时候就需要将openssh格式的私钥转换为rsa格式



openssh格式的私钥文件开头如下

```shell
-----BEGIN OPENSSH PRIVATE KEY-----
```



rsa格式的私钥文件开头如下

```sh
-----BEGIN RSA PRIVATE KEY-----
```



**转换命令**

```sh
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa
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

:::tip 说明

如果diff命令输出为空则说明密钥匹配

:::

```shell
PRIVATE_KEY=id_rsa
PUBLIC_KEY=id_rsa.pub
diff <( ssh-keygen -y -e -f "${PRIVATE_KEY}" ) <( ssh-keygen -y -e -f "${PUBLIC_KEY}" )
```



## 加密/解密密钥

### 加密

#### gpg

安装 `pinentry` ，以便执行 `gpg` 命令加密时可以弹出密码输入交互框

```shell
yum -y install pinentry
```



执行加密

```shell
gpg -c id_rsa
```

输入加密密码

![iShot_2025-06-30_11.44.14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-30_11.44.14.png)

确认加密密码

![iShot_2025-06-30_11.47.28](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-30_11.47.28.png)



执行完成后会生成一个名为 `id_rsa.gpg` 的文件

```shell
-rw-r--r-- 1 root root 2081 Jun 30 11:47 id_rsa.gpg
```



查看文件类型

```shell
$ file id_rsa.gpg 
id_rsa.gpg: GPG symmetrically encrypted data (AES256 cipher)
```



此时文件查看是乱码

![iShot_2025-06-30_11.50.48](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-06-30_11.50.48.png)



### 解密

#### gpg

:::tip 说明

- `-o id_rsa.decrypted`：指定输出文件名（可以改为原始名字，比如 `id_rsa`）

- `-d id_rsa.gpg`：对加密文件进行解密

:::

此命令同样会提示之前加密设置的密码

```shell
gpg -o id_rsa.decrypted -d id_rsa.gpg
```



解密后会生成如下明文文件

```shell
id_rsa.decrypted
```

