# shell脚本批量免密



**生成ssh密钥对**

```sh
[ -e ~/.ssh/id_rsa ] || ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa &>/dev/null
```



**编辑expect自动化交互脚本**

**在expect脚本中设置变量是 `set 变量名=变量`**

```sh
cat > ssh.exp <<'EOF'
#!/usr/bin/expect
if { $argc !=2 } {
  send_user "usage: expect ssh.exp FILE HOST_IP\n"
  exit
}

set FILE [lindex $argv 0]
set HOST_IP [lindex $argv 1]
set HOST_PWD "1"
set HOST_PORT 22
set HOST_USER root

spawn ssh-copy-id -i $FILE -p ${HOST_PORT} ${HOST_USER}@${HOST_IP}
expect {
  "yes/no" {send "yes\r";exp_continue}
  "*password" {send "${HOST_PWD}\r"}
}
expect eof
EOF
```



**编辑shell脚本循环执行expect脚本**

```sh
# 编辑shell脚本
cat > ssh.sh <<'EOF'
#!/bin/bash
HOST_IPS=(10.0.0.30 10.0.0.31 10.0.0.32 10.0.0.33 10.0.0.34 10.0.0.35)
for i in ${HOST_IPS[@]}
do
  expect ~/ssh.exp ~/.ssh/id_rsa.pub $i
done
EOF

# 安装 expect 命令
yum -y install expect

# 执行脚本
sh ssh.sh
```



