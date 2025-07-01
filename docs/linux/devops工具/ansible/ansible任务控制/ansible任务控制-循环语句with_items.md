# ansible任务控制-循环语句with_items

ansible任务控制-循环语句with_items使用场景为当我们要对某一些任务需要批量处理，例如重启服务，如果使用原先的service模块是只能写一个服务的，再比如使用copy或者template模块拷贝文件或目录，单个模块只能拷贝一个文件，这个时候就需要用到循环了



## 使用示例

### 使用示例1，使用service模块同时重启2个服务

编辑yml文件

```yaml
cat > task_with_items.yml EOF
- hosts: devops01
  tasks:
    - name: restart nginx mysql
      service:
        name: 
          "{{ item }}"
        state:
          restarted
      with_items:
        - nginx
        - mysqld 
EOF        
```



执行yml文件

```shell
$ ansible-playbook task_with_items.yml 

PLAY [devops01] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops01]

TASK [restart nginx mysql] *****************************************************************************************************************************
changed: [devops01] => (item=nginx)
changed: [devops01] => (item=mysqld)

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0  
```



### 使用示例2，批量创建多个用户和组

编辑yml文件

```yaml
cat > task_with_items_adduser.yml EOF
- hosts: devops01
  tasks:
  - name: add user1-5 group1-5
    user:
      name:
        "{{ item.username }}"
      groups:
        "{{ item.groupname }}"
      state:
        present
    with_items:
      - { username: 'user1', groupname: 'root' }
      - { username: 'user2', groupname: 'root' }
      - { username: 'user3', groupname: 'root' }
      - { username: 'user4', groupname: 'root' }
      - { username: 'user5', groupname: 'root' }
EOF      
```



执行yml文件

```shell
$ ansible-playbook task_with_items_adduser.yml 

PLAY [devops01] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops01]

TASK [add user1-5 group1-5] ****************************************************************************************************************************
changed: [devops01] => (item={u'username': u'user1', u'groupname': u'root'})
changed: [devops01] => (item={u'username': u'user2', u'groupname': u'root'})
changed: [devops01] => (item={u'username': u'user3', u'groupname': u'root'})
changed: [devops01] => (item={u'username': u'user4', u'groupname': u'root'})
changed: [devops01] => (item={u'username': u'user5', u'groupname': u'root'})

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

