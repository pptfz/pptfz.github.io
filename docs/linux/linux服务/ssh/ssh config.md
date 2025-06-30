# ssh config



配置 `.ssh` 下的 `config` 后，就可以通过 `ssh 别名` 的方式连接机器了

```shell
Host 别名
    Hostname 主机名
    Port 端口
    User 用户名
    IdentityFile 密钥
```



配置示例如下

```shell
Host test01
    HostName 10.0.0.10
    User test
    Port 222
    IdentityFile /home/test/.ssh/id_rsa
    IdentitiesOnly yes
Host test02
    HostName 10.0.0.11
    User test
    Port 222
    IdentityFile /home/test/.ssh/id_rsa
    IdentitiesOnly yes
```

