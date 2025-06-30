# ansible变量注册register

> ansible变量注册register就是在执行的playbook中如果想获取某些信息，但是plabybook又不支持输出的情况下使用，这个时候使用register把想要获取的输入的信息放到一个变量中，然后通过这个变量再输出



示例：安装启动httpd的同时想要查看httpd的启动状态

这里通过shell模块执行 `ps aux` 命令

```yaml
- hosts: devops
  
  tasks:
    - name: install httpd 
      yum: 
        name: 
          - httpd
        state:
          present
    
    - name: start httpd
      service:
        name: httpd
        state: started

    - name: check httpd status
      shell:
        ps aux|grep httpd
```



但是没有得到我们想要的输出

```yaml
$ ansible-playbook install_httpd.yml 

PLAY [devops] ******************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [install httpd] ***********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [start httpd] *************************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [check httpd status] ******************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0 
```



修改一下yml文件

```yaml
- hosts: devops
  
  tasks:
    - name: install httpd 
      yum: 
        name: 
          - httpd
        state:
          present
    
    - name: start httpd
      service:
        name: httpd
        state: started

    - name: check httpd status
      shell:
        ps aux|grep httpd
      # 这里增加一个register关键字，下边是变量的名称
      # register的作用是接收上一步shell模块的输出
      register:
        check_httpd
        
    - name: print output
      debug:
        msg: 
          "{{ check_httpd }}"
```



可以看到有很多的输出，如果不想看到所有的输出，则需要指定关键字输出

```yaml
$ ansible-playbook install_httpd.yml 

PLAY [devops] ******************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [install httpd] ***********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [start httpd] *************************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [check httpd status] ******************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

TASK [print output] ************************************************************************************************************************************
ok: [devops01] => {
    "msg": {
        "changed": true, 
        "cmd": "ps aux|grep httpd", 
        "delta": "0:00:00.042416", 
        "end": "2021-09-12 23:11:20.304771", 
        "failed": false, 
        "rc": 0, 
        "start": "2021-09-12 23:11:20.262355", 
        "stderr": "", 
        "stderr_lines": [], 
        "stdout": "root     25808  0.0  0.1 224080  5036 ?        Ss   22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25810  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25811  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25812  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25813  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25814  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\nroot     30483 17.4  1.1 392188 44092 pts/0    Sl+  23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml\nroot     31578  6.0  1.1 395864 41904 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml\nroot     31580 14.0  1.3 403088 49884 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml\nroot     31591  7.0  1.0 394384 40928 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml\nroot     31840  0.0  0.0 113280  1196 pts/4    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd\nroot     31844  0.0  0.0 112812   948 pts/4    S+   23:11   0:00 grep httpd", 
        "stdout_lines": [
            "root     25808  0.0  0.1 224080  5036 ?        Ss   22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25810  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25811  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25812  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25813  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25814  0.0  0.0 226164  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "root     30483 17.4  1.1 392188 44092 pts/0    Sl+  23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml", 
            "root     31578  6.0  1.1 395864 41904 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml", 
            "root     31580 14.0  1.3 403088 49884 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml", 
            "root     31591  7.0  1.0 394384 40928 pts/0    S+   23:11   0:00 /usr/bin/python2 /usr/bin/ansible-playbook install_httpd.yml", 
            "root     31840  0.0  0.0 113280  1196 pts/4    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd", 
            "root     31844  0.0  0.0 112812   948 pts/4    S+   23:11   0:00 grep httpd"
        ]
    }
}
ok: [devops02] => {
    "msg": {
        "changed": true, 
        "cmd": "ps aux|grep httpd", 
        "delta": "0:00:00.037817", 
        "end": "2021-09-12 23:11:20.254390", 
        "failed": false, 
        "rc": 0, 
        "start": "2021-09-12 23:11:20.216573", 
        "stderr": "", 
        "stderr_lines": [], 
        "stdout": "root      3190  0.0  0.4 224084  5036 ?        Ss   22:33   0:00 /usr/sbin/httpd -DFOREGROUND\napache    3191  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND\napache    3192  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND\napache    3193  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND\napache    3194  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND\napache    3195  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND\nroot      9953  0.0  0.1 113280  1196 pts/1    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd\nroot      9955  0.0  0.0 112808   952 pts/1    S+   23:11   0:00 grep httpd", 
        "stdout_lines": [
            "root      3190  0.0  0.4 224084  5036 ?        Ss   22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache    3191  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache    3192  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache    3193  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache    3194  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache    3195  0.0  0.3 226168  3092 ?        S    22:33   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "root      9953  0.0  0.1 113280  1196 pts/1    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd", 
            "root      9955  0.0  0.0 112808   952 pts/1    S+   23:11   0:00 grep httpd"
        ]
    }
}
ok: [devops03] => {
    "msg": {
        "changed": true, 
        "cmd": "ps aux|grep httpd", 
        "delta": "0:00:00.037784", 
        "end": "2021-09-12 23:11:20.266617", 
        "failed": false, 
        "rc": 0, 
        "start": "2021-09-12 23:11:20.228833", 
        "stderr": "", 
        "stderr_lines": [], 
        "stdout": "root     25572  0.0  0.4 224084  5036 ?        Ss   22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25573  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25574  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25575  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25576  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\napache   25577  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND\nroot     30803  0.0  0.1 113280  1196 pts/0    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd\nroot     30805  0.0  0.0 112808   952 pts/0    S+   23:11   0:00 grep httpd", 
        "stdout_lines": [
            "root     25572  0.0  0.4 224084  5036 ?        Ss   22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25573  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25574  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25575  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25576  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "apache   25577  0.0  0.3 226168  3092 ?        S    22:31   0:00 /usr/sbin/httpd -DFOREGROUND", 
            "root     30803  0.0  0.1 113280  1196 pts/0    S+   23:11   0:00 /bin/sh -c ps aux|grep httpd", 
            "root     30805  0.0  0.0 112808   952 pts/0    S+   23:11   0:00 grep httpd"
        ]
    }
}

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



msg输出的关键字说明

| 关键字       | 说明                                 |
| ------------ | ------------------------------------ |
| changed      | 是否改变                             |
| cmd          | register上一步执行的命令             |
| delta        | 执行花费的时间                       |
| end          | 结束时间                             |
| failed       | 是否失败                             |
| rc           | 返回0表明执行成功，返回1表明执行失败 |
| start        | 开始时间                             |
| stderr       | 错误输出                             |
| stderr_lines | 错误输出，以行展示                   |
| stdout       | 输出信息                             |
| stdout_lines | 输出信息，以行展示                   |



再次修改yml文件，这次我们只获取rc信息

```yaml
- hosts: devops
  
  tasks:
    - name: install httpd 
      yum: 
        name: 
          - httpd
        state:
          present
    
    - name: start httpd
      service:
        name: httpd
        state: started

    - name: check httpd status
      shell:
        ps aux|grep httpd
      # 这里增加一个register关键字，下边是变量的名称
      # register的作用是接收上一步shell模块的输出
      register:
        check_httpd
        
    - name: print output
      debug:
        msg: 
          # 变量.关键字 就是输出指定的信息
          "{{ check_httpd.rc }}"
```



可以看到，只输出了rc的相关信息  

```yaml
$ ansible-playbook install_httpd.yml 

PLAY [devops] ******************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [install httpd] ***********************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [start httpd] *************************************************************************************************************************************
ok: [devops02]
ok: [devops03]
ok: [devops01]

TASK [check httpd status] ******************************************************************************************************************************
changed: [devops02]
changed: [devops03]
changed: [devops01]

TASK [print output] ************************************************************************************************************************************
ok: [devops01] => {
    "msg": "0"
}
ok: [devops02] => {
    "msg": "0"
}
ok: [devops03] => {
    "msg": "0"
}

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops03                   : ok=5    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```





**ansible变量注册register的使用步骤如下**

> 1.ansible playbook在某些情况下无法直接输出，因此使用register来获取我们想要的输出结果，例如想要获取shell模块执行的命令的输出
>
> 2.register的作用就是将命令的输出保存到一个变量中，变量名任意
>
> 3.通过debug模块的msg方法输出全部结果，如果想要指定某些字段的输出，则需要使用 变量名.关键字 的方法来获取指定的输出

```yaml
   - name: check httpd status
      shell:
        ps aux|grep httpd
      # 这里增加一个register关键字，下边是变量的名称
      # register的作用是接收上一步shell模块的输出
      register:
        check_httpd
        
    - name: print output
      debug:
        msg: 
          # 变量.关键字 就是输出指定的信息
          "{{ check_httpd.rc }}"
```



