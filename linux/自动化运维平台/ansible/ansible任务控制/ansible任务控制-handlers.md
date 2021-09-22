# ansible任务控制-handlers

**handlers作用**

- handlers用于notify监控发生变更后的动作触发，例如当某一个服务配置文件发生变更时重启服务



**handlers流程**

- 1.配置notify监控，例如监控nginx的配置文件

- 2.发送通知到handlers

- 3.handlers触发动作



示例：当nginx配置文件发生变更时重启服务

编辑yml文件

**<span style=color:red>⚠️notify后的内容可以任意，但是handlers后的name下的内容必须与notify后定义的名称一致</span>**

handlers会在所有任务正确执行完成后执行，只会执行一次，并且只有当tasks改变后才会触发handlers

```yaml
cat > task_handlers.yml < EOF
- hosts: devops02
  tasks:
    - name: copy nginx conf
      copy:
        src: ./file/nginx.conf
        dest: /etc/nginx
      notify: restart nginx

  handlers: 
    - name: restart nginx
      service:
        name: nginx
        state: restarted
EOF        
```



执行yml文件

```shell
$ ansible-playbook task_handlers.yml 

PLAY [devops02] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]

TASK [copy nginx conf] *********************************************************************************************************************************
changed: [devops02]

RUNNING HANDLER [restart nginx] ************************************************************************************************************************
changed: [devops02]

PLAY RECAP *********************************************************************************************************************************************
devops02                   : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

