# ansible任务控制-判断语句when

ansible任务控制中的判断语句when使用场景为依据不同的环境执行不同的动作，例如操作系统是centos与ubuntu，我们可能需要在不同的操作系统上执行不同的操作，这个时候就会用到when



使用示例，在2个主机上执行不同的命令

编辑yml文件，判断当主机明是devops01时才操作

```yaml
cat > task_when.yml << EOF
- hosts: all
  tasks:
    - name: devops01 test
      file:
        name: /opt/devops01
        state: directory
      when: (ansible_fqdn == "devops01")
EOF
```



执行yml文件，可以看到只有主机名为devops01的机器执行了，其余主机均为skip状态

```shell
$ ansible-playbook task_when.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [devops01 test] ***********************************************************************************************************************************
skipping: [devops02]
skipping: [devops03]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=1    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
devops03                   : ok=1    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
```

