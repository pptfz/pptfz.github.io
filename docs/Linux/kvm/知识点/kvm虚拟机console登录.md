# kvm虚拟机console登录

 在宿主机执行命令 `virsh console 虚拟机名称`，此时是无法console连接的，因为没有做配置， `ctrl+]` 退出

```shell
$ virsh console linux-new-xxx 
Connected to domain linux-new-xxx
Escape character is ^]
```

​              

连接虚拟机，备份虚拟机内核文件

```shell
cp /boot/grub2/grub.cfg{,.bak}
```



修改内核参数

```shell
grubby --update-kernel=ALL --args="console=ttyS0,115200n8"
```



| 参数                  | 说明                                                         |
| --------------------- | ------------------------------------------------------------ |
| `--update-kernel=ALL` | 指定内核信息，ALL代表全部                                    |
| `console=ttyS0`       | 可以通过ttys0终端登陆虚拟机                                  |
| `115200n8`            | 频率参数，波特率，不加也可以，登陆虚拟机重启后可以看到重启过程 |



重启机器后就可以使用console登录了

```shell
$ virsh console linux-new-xxx 
Connected to domain linux-new-xxx
Escape character is ^]

# 按下回车就会出现登录界面，ctrl+] 退出
CentOS Linux 7 (Core)
Kernel 3.10.0-1160.el7.x86_64 on an x86_64

linux-templet-mini login: 
```





登录方式

:::tip 说明

ctrl+alt+f2	切换终端

:::

| 登录方式                            | 对应标识 | 说明     |
| ----------------------------------- | -------- | -------- |
| 宿主机登陆到虚拟机                  | ttyS0    | 终端     |
| VNC登陆虚拟机                       | tty1     | 终端     |
| 终端工具登陆虚拟机(xshell、iterm等) | pts/0    | 虚拟终端 |





```shell
# 宿主机登陆到虚拟机
$ who
root     ttyS0        2022-03-06 21:32

# VNC登陆虚拟机
$ who
root     tty1        2022-03-06 21:32

# 终端工具登陆虚拟机
$ who
root     pts/0        2022-03-06 21:37 (10.0.19.22)
```

