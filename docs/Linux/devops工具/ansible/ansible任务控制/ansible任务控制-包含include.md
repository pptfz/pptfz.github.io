# ansible任务控制-包含include

include的使用场景比较简单，就是多个playbook需要执行相同的操作，例如有5个playbook，这5个playbook都是安装不同的服务，但是都会安装nginx，同时也都会重启nginx，这个时候就可以使用include



首先编辑一个没有play的yml，其他的yml中使用include来包含这个yml

```yaml
cat > task_include_tem.yml <<EOF
- name: restart nginx
  service:
    name: nginx
    state: restarted
EOF
```



编辑a.yml

> 这里我们仅仅使用shell模块echo一句话，然后重启nginx

```yaml
cat > a.yml << EOF
- hosts: all
  tasks:
    - name: print test a
      shell: echo 'test a'
    - name: restat nginx
      include: ./task_include_tem.yml
EOF
```



执行a.yml

```shell
$ ansible-playbook a.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]
ok: [devops02]
ok: [devops01]

TASK [print test a] ************************************************************************************************************************************
changed: [devops03]
changed: [devops02]
changed: [devops01]

TASK [restart nginx] ***********************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



编辑b.yml

```yaml
cat > b.yml << EOF
- hosts: all
  tasks:
    - name: print test b
      shell: echo 'test b'
    - name: restat nginx
      include: ./task_include_tem.yml
EOF
```



执行b.yml

```shell
$ ansible-playbook b.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [print test b] ************************************************************************************************************************************
changed: [devops03]
changed: [devops02]
changed: [devops01]

TASK [restart nginx] ***********************************************************************************************************************************
changed: [devops03]
changed: [devops02]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```





yml文件中的 `include` 还可以写成 `include_tasks`

```yaml
cat > b.yml << EOF
- hosts: all
  tasks:
    - name: print test b
      shell: echo 'test b'
    - name: restat nginx
      include_tasks: ./task_include_tem.yml
EOF
```



执行的时候会多了一个 `included: /root/yml/task_include_tem.yml for devops01, devops02, devops03` 提示

```shell
$ ansible-playbook b.yml 

PLAY [all] *********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]
ok: [devops02]
ok: [devops01]

TASK [print test b] ************************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

TASK [restat nginx] ************************************************************************************************************************************
included: /root/yml/task_include_tem.yml for devops01, devops02, devops03

TASK [restart nginx] ***********************************************************************************************************************************
changed: [devops03]
changed: [devops02]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

