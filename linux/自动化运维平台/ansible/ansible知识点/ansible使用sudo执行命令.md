# ansible使用sudo执行命令

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

```shell
# 
ansible host -u qikeops --become-method su --become-user root -a "mkdit /opt/test"
```

 