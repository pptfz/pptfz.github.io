# ansible任务控制-错误处理changed_when

## `force_handlers:yes` 强制执行handlers

默认情况下，当task失败后，play会终止，后续的handlers就不会被执行，可是使用参数 `force_handlers:yes` 强制执行handlers

编辑yml文件

```yaml
cat >tasks_changed_when.yml << EOF
- hosts: all
  tasks:
    - name: touch test file
      file:
        path: /tmp/test.txt
        state: touch
      notify: restart httpd   
    
    - name: exec error command
      shell: abc
      
  handlers:
    - name: restart httpd
      service:
        name: httpd
        state: restarted
EOF
```



执行yml文件

> 可以看到，当我们执行一个错误的命令abc后，后边重启httpd的handlers没有被执行

```shell
$ ansible-playbook tasks_changed_when.yml 

PLAY [all] **************************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [touch test file] **************************************************************************************************************
changed: [devops02]
changed: [devops01]

TASK [exec error command] ***********************************************************************************************************
fatal: [devops02]: FAILED! => {"changed": true, "cmd": "abc", "delta": "0:00:00.087827", "end": "2021-09-25 15:28:19.873285", "msg": "non-zero return code", "rc": 127, "start": "2021-09-25 15:28:19.785458", "stderr": "/bin/sh: abc: command not found", "stderr_lines": ["/bin/sh: abc: command not found"], "stdout": "", "stdout_lines": []}
fatal: [devops01]: FAILED! => {"changed": true, "cmd": "abc", "delta": "0:00:00.087584", "end": "2021-09-25 15:28:19.941478", "msg": "non-zero return code", "rc": 127, "start": "2021-09-25 15:28:19.853894", "stderr": "/bin/sh: abc: command not found", "stderr_lines": ["/bin/sh: abc: command not found"], "stdout": "", "stdout_lines": []}

RUNNING HANDLER [restart httpd] *****************************************************************************************************

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=2    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
devops02                   : ok=2    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0 
```



在yml文件中添加参数 ` force_handlers: yes` 强制执行handlers

```yaml
cat >tasks_changed_when.yml << EOF
- hosts: all
  force_handlers: yes
  tasks:
    - name: touch test file
      file:
        path: /tmp/test.txt
        state: touch
      notify: restart httpd   
    
    - name: exec error command
      shell: abc
      
  handlers:
    - name: restart httpd
      service:
        name: httpd
        state: restarted
EOF
```



再次执行yml文件，可以看到handlers被强制执行了

```yaml
$ ansible-playbook tasks_changed_when.yml 

PLAY [all] **************************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [touch test file] **************************************************************************************************************
changed: [devops02]
changed: [devops01]

TASK [exec error command] ***********************************************************************************************************
fatal: [devops01]: FAILED! => {"changed": true, "cmd": "abc", "delta": "0:00:00.080787", "end": "2021-09-25 15:34:15.667841", "msg": "non-zero return code", "rc": 127, "start": "2021-09-25 15:34:15.587054", "stderr": "/bin/sh: abc: command not found", "stderr_lines": ["/bin/sh: abc: command not found"], "stdout": "", "stdout_lines": []}
fatal: [devops02]: FAILED! => {"changed": true, "cmd": "abc", "delta": "0:00:00.078859", "end": "2021-09-25 15:34:15.747691", "msg": "non-zero return code", "rc": 127, "start": "2021-09-25 15:34:15.668832", "stderr": "/bin/sh: abc: command not found", "stderr_lines": ["/bin/sh: abc: command not found"], "stdout": "", "stdout_lines": []}

RUNNING HANDLER [restart httpd] *****************************************************************************************************
changed: [devops01]
changed: [devops02]

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=3    changed=2    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
devops02                   : ok=3    changed=2    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0  
```



## 使用 `changed_when` 检查任务返回的结果

例如，我们修改了某一个服务的配置文件，在重启服务之前做一下相应的检测(例如nginx服务的 `nginx -t` 命令)，如果检测成功我们就重启服务，否则就不重启服务，这个时候就需要用到`changed_when` 检查任务返回结果

编辑yml文件

```yaml
cat > tasks_changed_when.yml << EOF
- hosts: devops
  tasks:
  
    - name: install nginx
      yum:
        name: nginx
        state: present
        
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
$ ansible-playbook tasks_changed_when.yml 

PLAY [devops] ***********************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [install nginx] ****************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [copy nginx conf] **************************************************************************************************************
changed: [devops01]
changed: [devops02]

RUNNING HANDLER [restart nginx] *****************************************************************************************************
changed: [devops01]
changed: [devops02]

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0  
```



上边的yml文件是没有做配置文件是否正确校验的，如果我们不做配置文件语法校验，则推送错误文件后重启服务会导致服务重启失败，此时我们就需要对配置文件做一下校验，如果正确就重启服务

故意把nginx配置文件改错，然后再执行yml文件，可以看到重启nginx服务会失败，此时nginx服务是挂掉的

```shell
$ ansible-playbook tasks_changed_when.yml 

PLAY [devops] ***********************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [install nginx] ****************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [copy nginx conf] **************************************************************************************************************
changed: [devops01]
changed: [devops02]

RUNNING HANDLER [restart nginx] *****************************************************************************************************
fatal: [devops01]: FAILED! => {"changed": false, "msg": "Unable to restart service nginx: Job for nginx.service failed because the control process exited with error code. See \"systemctl status nginx.service\" and \"journalctl -xe\" for details.\n"}
fatal: [devops02]: FAILED! => {"changed": false, "msg": "Unable to restart service nginx: Job for nginx.service failed because the control process exited with error code. See \"systemctl status nginx.service\" and \"journalctl -xe\" for details.\n"}

NO MORE HOSTS LEFT ******************************************************************************************************************

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=3    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
devops02                   : ok=3    changed=1    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   

```





如果想避免因为配置文件拷贝错误导致服务重启失败的问题，则需要对配置文件做语法校验

再次编辑yml文件

```yaml
cat > tasks_changed_when.yml << EOF
- hosts: devops
  tasks:
  
    - name: install nginx
      yum:
        name: nginx
        state: present
        
    - name: copy nginx conf
      copy:
        src: ./file/nginx.conf
        dest: /etc/nginx
      notify: restart nginx  
     
    - name: check nginx conf
      shell: /usr/sbin/nginx -t
      register: check_nginx_conf
      changed_when: ( check_nginx_conf.stdout.find('successful'))
     
  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
EOF
```



还是拷贝错误的配置文件，可以看到由于检测失败并没有执行重启服务的操作

```shell
$ ansible-playbook tasks_changed_when.yml 

PLAY [devops] ***********************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [install nginx] ****************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [copy nginx conf] **************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [check nginx conf] *************************************************************************************************************
fatal: [devops01]: FAILED! => {"changed": true, "cmd": "/usr/sbin/nginx -t", "delta": "0:00:00.099378", "end": "2021-09-25 16:06:50.395384", "msg": "non-zero return code", "rc": 1, "start": "2021-09-25 16:06:50.296006", "stderr": "nginx: [emerg] unknown directive \"ser\" in /etc/nginx/nginx.conf:5\nnginx: configuration file /etc/nginx/nginx.conf test failed", "stderr_lines": ["nginx: [emerg] unknown directive \"ser\" in /etc/nginx/nginx.conf:5", "nginx: configuration file /etc/nginx/nginx.conf test failed"], "stdout": "", "stdout_lines": []}
fatal: [devops02]: FAILED! => {"changed": true, "cmd": "/usr/sbin/nginx -t", "delta": "0:00:00.101067", "end": "2021-09-25 16:06:50.474854", "msg": "non-zero return code", "rc": 1, "start": "2021-09-25 16:06:50.373787", "stderr": "nginx: [emerg] unknown directive \"ser\" in /etc/nginx/nginx.conf:5\nnginx: configuration file /etc/nginx/nginx.conf test failed", "stderr_lines": ["nginx: [emerg] unknown directive \"ser\" in /etc/nginx/nginx.conf:5", "nginx: configuration file /etc/nginx/nginx.conf test failed"], "stdout": "", "stdout_lines": []}

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=3    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
devops02                   : ok=3    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0 
```



我们把配置文件改为正确的再次执行，可以看到当检测到配置文件正确后才触发重启服务操作

```shell
$ ansible-playbook tasks_changed_when.yml 

PLAY [devops] ***********************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops01]
ok: [devops02]

TASK [install nginx] ****************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [copy nginx conf] **************************************************************************************************************
changed: [devops02]
changed: [devops01]

TASK [check nginx conf] *************************************************************************************************************
changed: [devops01]
changed: [devops02]

RUNNING HANDLER [restart nginx] *****************************************************************************************************
changed: [devops02]
changed: [devops01]

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=5    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=5    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



ansible每次检测配置文件都会提示changed，如果想要关闭显示可以使用参数 `chenged_when: false` ，使用这个参数的前提是当前操作并没有产生实际的操作(这里执行的 `nginx -t `只是检测nginx配置文件语法并没有真正的做操作)

```yaml
- name: check nginx conf
      shell: /usr/sbin/nginx -t
      register: check_nginx_conf
      changed_when: ( check_nginx_conf.stdout.find('successful'))
```



修改yml文件

```yaml
cat > tasks_changed_when.yml << EOF
- hosts: devops
  tasks:
  
    - name: install nginx
      yum:
        name: nginx
        state: present
        
    - name: copy nginx conf
      copy:
        src: ./file/nginx.conf
        dest: /etc/nginx
      notify: restart nginx  
     
    - name: check nginx conf
      shell: /usr/sbin/nginx -t
      register: check_nginx_conf
      changed_when: 
        - ( check_nginx_conf.stdout.find('successful'))
        - false
     
  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
EOF
```



再次执行yml文件就会看到 `TASK [check nginx conf] ` 处显示的不是 `changed `状态了

```shell
$ ansible-playbook tasks_changed_when.yml 

PLAY [devops] ***********************************************************************************************************************

TASK [Gathering Facts] **************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [install nginx] ****************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [copy nginx conf] **************************************************************************************************************
changed: [devops02]
changed: [devops01]

TASK [check nginx conf] *************************************************************************************************************
ok: [devops01]
ok: [devops02]

RUNNING HANDLER [restart nginx] *****************************************************************************************************
changed: [devops01]
changed: [devops02]

PLAY RECAP **************************************************************************************************************************
devops01                   : ok=5    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=5    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

