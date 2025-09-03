[toc]



## 一、ssh禁止root远程登陆

### 1.编辑文件``/etc/ssh/sshd_config``

```python
# 禁止root远程登陆
PermitRootLogin no

# 禁用密码验证
PasswordAuthentication no

# 启用密钥验证
RSAAuthentication yes //centos7没有这一项
PubkeyAuthentication yes
```



### 2.sudo免密配置等root权限用户

**``visudo``或者编辑文件``/etc/sudoers``**

```python
# 创建一个用户
useradd lcc

# visudo编辑,101行写入以下内容
lcc     ALL=NOPASSWD :ALL

```



### 3.配置ssh密钥

```python
# 切换到lcc用户
su - lcc

# 生成密钥
$ ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/home/lcc/.ssh/id_rsa): 
Created directory '/home/lcc/.ssh'.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/lcc/.ssh/id_rsa.
Your public key has been saved in /home/lcc/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:nSW5jEvQwr8zPZok5CfK+fnrhPJfk2motWOgx1/eNZ4 lcc@experiment
The key's randomart image is:
+---[RSA 2048]----+
|                 |
|     . .   .     |
|      + . o .    |
|       + + =     |
|      . S =      |
|     o.o = o     |
|    .o=.@ X   o  |
|   ..=oXo@ + o o |
|    +o=*Xo. . E  |
+----[SHA256]-----+


# 向authorized_keys文件写入公钥
cd .ssh && cat id_rsa.pub >authorized_keys

# 修改authorized_keys文件权限至少为644，默认为664，无法使用密钥登陆
chmod 644 authorized_keys
```



:::tip

**<span style={{color: 'red'}}>⚠️ssh服务配置文件`/etc/ssh/sshd_config`中有一项配置是`AuthorizedKeysFile      .ssh/authorized_keys`，如果想要使用私钥免密登陆，则公钥必须写入到文件`.ssh/authorized_keys`中，即注册私钥，否则免密会失败！！！</span>**

:::

### 4.配置完后验证

```python
# root无法远程登陆
baixuebingdeMacBook-Pro:~ baixuebing$ ssh root@10.0.0.13
root@10.0.0.13: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
  
# 无法使用密码登陆，只能使用密钥登陆
baixuebingdeMacBook-Pro:~ baixuebing$ ssh lcc@10.0.0.13
lcc@10.0.0.13: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
```





## 二、ssh免交互配置

### ssh-keygen免交互生成密钥

```python
# 免交互生成密钥
ssh-keygen -t rsa -f /root/.ssh/id_dsa -P "" -q

-f filename             	#指定密钥文件的文件名
-P passphrase           	#提供旧密钥口令
-q Silence ssh-keygen   	#静默输出
-t key type								#密钥类型
	dsa 
  ecdsa
  ed25519
  rsa(默认)
  rsa1
```



:::tip

**<span style={{color: 'red'}}>⚠️ssh服务配置文件`/etc/ssh/sshd_config`中有一项配置是`AuthorizedKeysFile      .ssh/authorized_keys`，如果想要使用私钥免密登陆，则公钥必须写入到文件`.ssh/authorized_keys`中，即注册私钥，否则免密会失败！！！</span>**

:::

### ssh-copy免交互推送密钥

```python
sshpass -p1 ssh-copy-id -i ~/.ssh/id_rsa.pub -o StrictHostKeyChecking=no root@IP
```



### 批量分发密钥脚本

```python
#!/bin/bash

# 生成密钥
\rm -f /root/.ssh/id_*
ssh-keygen -t rsa -f /root/.ssh/id_rsa -P "" -q

# 分发密钥
for ip in IP
do
   echo "=== 分发主机 10.0.0.$ip ==="
   sshpass -p1 ssh-copy-id -i ~/.ssh/id_rsa.pub -o StrictHostKeyChecking=no root@10.0.0.$ip
   echo "=== 分发ojbk ==="
   echo ""
done
```





## 三、ssh自动断开远程服务器问题

**编辑ssh服务配置文件`/etc/ssh/sshd_config`修改以下两项**

```shell
# 向客户端每30秒发一次保持连接的信号
ClientAliveInterval 30

# 如果客户端30次未响应就断开连接
ClientAliveCountMax 30
```



**重启服务**

```shell
systemctl restart sshd
```



