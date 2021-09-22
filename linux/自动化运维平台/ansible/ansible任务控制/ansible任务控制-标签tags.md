# ansible任务控制-标签tags

tags使用场景为当有多个tasks的时候，想要指定某一个tasks执行，这个时候就可以利用为tasks打标签然后指定标签执行

tasks打标签有以下3种方式

- 一个tasks指定一个tags
- 一个tasks指定多个tags
- 多个tasks指定一个tags





编辑yml文件

```yaml
cat > task_tags.yml << EOF
- hosts: devops03
  tasks:
    - name: install nginx
      yum:
        name: nginx
        state: present
      tags: install nginx
    - name: restart nginx
      service:
        name: nginx
        state: restarted
        enabled: yes
      tags: start nginx  
EOF
```





执行yml文件，使用 `-t` 选项指定tags，这里只执行标签为 `install nginx` 的tasks

**<span style=color:red>使用 `--skip-tags` 选项排除要执行的tags</span>**

```shell
$ ansible-playbook task_tags.yml -t "install nginx"

PLAY [devops03] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops03]

TASK [install nginx] ***********************************************************************************************************************************
changed: [devops03]

PLAY RECAP *********************************************************************************************************************************************
devops03                   : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```





