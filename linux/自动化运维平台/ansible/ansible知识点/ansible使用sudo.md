# ansible使用sudo

**场景**

> 在生产环境中，禁止root登陆，使用ops运维用户密钥登陆，在ansible主控机上只有ops用户的密钥，在root用户下执行ansible命令或者playbook时，就需要使用sudo来执行了



**示例**

`/etc/ansible/hosts` 文件内容如下

```shell
[test]
172.16.0.12 ansible_ssh_port=222 ansible_ssh_user=ops ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops
```



在ansible主控机上用到的密钥是有sudo权限的 `ops` 用户，执行新建目录操作，报错权限拒绝

```shell
$ whoami 
root

$ ansible 172.16.0.12 -m shell -a "mkdir /opt/test"
[WARNING]: Consider using the file module with state=directory rather than running 'mkdir'.  If you need to use command because file is insufficient you can add 'warn:
false' to this command task or set 'command_warnings=False' in ansible.cfg to get rid of this message.
172.16.0.12 | FAILED | rc=1 >>
mkdir: cannot create directory ‘/opt/test’: Permission deniednon-zero return code
```



解决方法

> 生产中禁止root远程登陆，因此使用拥有sudo权限的用户进行操作，此时就需要使用sudo来执行(避免一些操作无权限)

```shell
# 编辑 /etc/ansible/hosts 文件，写入以下内容
[test]
172.16.0.12

[test:vars]
ansible_ssh_user=ops
ansible_ssh_port=222
ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops
ansible_become=true 
ansible_become_method=sudo 
ansible_become_user=root
```



[ansible sudo 官方文档](https://docs.ansible.com/ansible/latest/user_guide/become.html)

| 参数                         | 说明               |
| ---------------------------- | ------------------ |
| ansible_ssh_user             | ssh用户            |
| ansible_ssh_port             | ssh端口            |
| ansible_ssh_private_key_file | ssh用户密钥        |
| ansible_ssh_pass             | ssh用户密码        |
| ansible_sudo_pass            | ssh sudo 用户密码  |
| ansible_become               | 为true表示启用sudo |
| ansible_become_method        | 常用方法为sudo     |
| ansible_become_user          | 提权用户           |



写法优化

```shell
# test组下边可能有多个主机，如果每个主机后边都单独写参数会导致阅读性变差，同时还会有重复的参数项
[test]
172.16.0.12 ansible_ssh_port=222 ansible_ssh_user=ops ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops
172.16.0.13 ansible_ssh_port=222 ansible_ssh_user=ops ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops

# 优化写法，在相同组名后指定变量，例如 [test:vars] ，这样以后只需要在这个组下边增加主机即可，而不用在每一个主机后都增加变量
[test]
172.16.0.12

[test:vars]
ansible_ssh_user=ops
ansible_ssh_port=222
ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops
ansible_become=true 
ansible_become_method=sudo 
ansible_become_user=root
```







 