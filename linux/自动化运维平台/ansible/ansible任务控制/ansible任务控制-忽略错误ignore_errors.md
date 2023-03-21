# ansible任务控制-忽略错误ignore_errors



编辑yml文件

> 这里故意执行一个返回值永远是错误的命令false

```yaml
cat > task_ingore_errors.yml << EOF
- hosts: devops03
  tasks:
    - name: exec error cmd
      shell: /bin/false
    
    - name: touch file
      file:
        path: /tmp/test.txt
        state: touch
EOF
```



执行yml文件，因为 `/bin/false` 永远是错误的返回，因此不能继续往下执行

```yaml
$ ansible-playbook task_ingore_errors.yml

PLAY [devops03] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]

TASK [exec error cmd] **********************************************************************************************************************************
fatal: [devops03]: FAILED! => {"changed": true, "cmd": "/bin/false", "delta": "0:00:00.031517", "end": "2021-09-21 23:51:30.811885", "msg": "non-zero return code", "rc": 1, "start": "2021-09-21 23:51:30.780368", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}

PLAY RECAP *********************************************************************************************************************************************
devops03                   : ok=1    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0  
```



如果想要忽略错误不影响后边的task，就需要用到 `ignore_errors`

```yaml
cat > task_ingore_errors.yml << EOF
- hosts: devops03
  tasks:
    - name: exec error cmd
      shell: /bin/false
      ignore_errors: yes
    
    - name: touch file
      file:
        path: /tmp/test.txt
        state: touch
EOF
```



再次执行yml就会忽略错误继续执行了

```shell
$ ansible-playbook task_ingore_errors.yml

PLAY [devops03] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]

TASK [exec error cmd] **********************************************************************************************************************************
fatal: [devops03]: FAILED! => {"changed": true, "cmd": "/bin/false", "delta": "0:00:00.029109", "end": "2021-09-21 23:54:38.138763", "msg": "non-zero return code", "rc": 1, "start": "2021-09-21 23:54:38.109654", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}
...ignoring

TASK [touch file] **************************************************************************************************************************************
changed: [devops03]

PLAY RECAP *********************************************************************************************************************************************
devops03                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=1   
```

