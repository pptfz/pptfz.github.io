# ansible playbook

[ansible2.9官方文档](https://docs.ansible.com/ansible/2.9/user_guide/playbooks_intro.html)



**<span style=color:red>ansible playbook使用 -C 选项进行模拟执行，和sed命令 -i 选项类似</span>**



ansible playbook 官方示例，单task

```yaml
---
- hosts: webservers
  vars:
    http_port: 80
    max_clients: 200
  remote_user: root
  tasks:
  - name: ensure apache is at the latest version
    yum:
      name: httpd
      state: latest
  - name: write the apache config file
    template:
      src: /srv/httpd.j2
      dest: /etc/httpd.conf
    notify:
    - restart apache
  - name: ensure apache is running
    service:
      name: httpd
      state: started
  handlers:
    - name: restart apache
      service:
        name: httpd
        state: restarted
```



ansible playbook 官方示例，多task

```yaml
---
- hosts: webservers
  remote_user: root

  tasks:
  - name: ensure apache is at the latest version
    yum:
      name: httpd
      state: latest
  - name: write the apache config file
    template:
      src: /srv/httpd.j2
      dest: /etc/httpd.conf

- hosts: databases
  remote_user: root

  tasks:
  - name: ensure postgresql is at the latest version
    yum:
      name: postgresql
      state: latest
  - name: ensure that postgresql is started
    service:
      name: postgresql
      state: started
```





# 1.playbook基础

## 1.1 主机与用户

> hosts 行的内容是一个或多个组或主机的 patterns,以逗号为分隔符
>
> remote_user 就是账户名

```yaml
---
- hosts: webservers
  remote_user: root
```



> 还可以在每一个task中定义自己的远程用户

```yaml
---
- hosts: webservers
  remote_user: root
  tasks:
    - name: test connection
      ping:
      remote_user: yourname
```





支持以另一个用户的身份运行， [ansible2.9 becom官方文档](https://docs.ansible.com/ansible/2.9/user_guide/become.html#become)

```yaml
---
- hosts: webservers
  remote_user: yourname
  become: yes
```





可以在一个特定的task中使用关键字become

```yaml
---
- hosts: webservers
  remote_user: yourname
  tasks:
    - service:
        name: nginx
        state: started
      become: yes
      become_method: sudo
```



你也可以以你的身份登录，然后变成一个不同于root的用户

```yaml
---
- hosts: webservers
  remote_user: yourname
  become: yes
  become_user: postgres
```



还可以使用其他提权方法，如 `su`

```yaml
---
- hosts: webservers
  remote_user: yourname
  become: yes
  become_method: su
```



如果你需要在使用 sudo 时指定密码,可在运行 ansible-playbook 命令时加上选项 `--ask-sudo-pass` (-K). 如果使用 sudo 时,playbook 疑似被挂起,可能是在 sudo prompt 处被卡住,这时可执行 Control-C 杀死卡住的任务,再重新运行一次.



> 当使用 `become_user` 切换到 非root 用户时,模块的参数会暂时写入` /tmp` 目录下的一个随机临时文件. 当命令执行结束后,临时文件立即删除.这种情况发生在普通用户的切换时,比如从 ‘bob’ 切换到 ‘timmy’, 切换到 root 账户时,不会发生,如从 ‘bob’ 切换到 ‘root’,直接以普通用户或root身份登录也不会发生. 如果你不希望这些数据在短暂的时间内可以被读取（不可写）,请避免在 sudo_user 中传递未加密的密码. 其他情况下,`/tmp` 目录不被使用,这种情况不会发生.Ansible 也有意识的在日志中不记录密码参数.



## 1.2 Tasks列表

基本tasks示例

```yaml
tasks:
  - name: make sure apache is running
    service:
      name: httpd
      state: started
```



copy模块使用示例

```yaml
tasks:
  - name: Copy ansible inventory file to client
    copy: src=/etc/ansible/hosts dest=/etc/ansible/hosts
            owner=root group=root mode=0644
```

也可以写成这样

```yaml
tasks:
  - name: Copy ansible inventory file to client
    copy: 
      src: /etc/ansible/hosts 
      dest: /etc/ansible/hosts
      owner: root 
      group: root 
      mode: 0644
```



还可以使用变量

```yaml
tasks:
  - name: create a virtual host file for {{ vhost }}
    template:
      src: somefile.j2
      dest: /etc/httpd/conf.d/{{ vhost }}
```



## 1.3 Handlers

**<span style=color:red>Handlers 最佳的应用场景是用来重启服务，或者触发系统重启操作，除此以外很少用到了</span>**

> handlers:在发生改变时执行的操作

`notify` 动作会在playbook的每一个task结束时触发，而且即使有多个不同的task通知改变的发生，`notify` 动作只会被触发一次

举例来说，比如多个 resources(资源) 因为一个配置文件被改动，所以 apache 需要重新启动，但是重新启动的操作只会被执行一次

如下的例子是当配置文件修改时，重启memcache和apache

```yaml
- name: template configuration file
  template:
    src: template.j2
    dest: /etc/foo.conf
  notify:
     - restart memcached
     - restart apache
```



`notify` 动作下就是 `handlers` ，即 `notify` 和 `handlers` 是一一对应的

> notify定义一个动作，比如叫 `restart apache` ，在 handlers 中使用 `- name: restart apache` 引用，然后接着执行后续的操作，例如进行服务重启

```yaml
handlers:
    - name: restart memcached
      service:
        name: memcached
        state: restarted
    - name: restart apache
      service:
        name: apache
        state: restarted
```



如果想要handlers使用变量，例如，如果服务的名称因为分布而略有不同，想显示每个目标机器重新启动的服务的确切名称。避免在handlers中放置变量。由于handlers很早就被模块化了，ansible可能没有这样的处理handlers的可用值

```yaml
handlers:
# this handler name may cause your play to fail!
- name: restart "{{ web_service_name }}"
```



如果handlers中使用的变量是不可用的，则会导致整个play失败，在play中更改该变量不会影响handlers，相反，将变量放在handlers的任务参数重，可以使用 `include_vars`

```yaml
tasks:
  - name: Set host variables based on distribution
    include_vars: "{{ ansible_facts.distribution }}.yml"

handlers:
  - name: restart web service
    service:
      name: "{{ web_service_name | default('httpd') }}"
      state: restarted
```



从ansible2.2开始，handlers还可以使用 listen ，task可以按如下方式通知这些主题

```yaml
handlers:
    - name: restart memcached
      service:
        name: memcached
        state: restarted
      listen: "restart web services"
    - name: restart apache
      service:
        name: apache
        state: restarted
      listen: "restart web services"

tasks:
    - name: restart everything
      command: echo "this task will restart the web services"
      notify: "restart web services"
```



## 1.4 Ansible-Pull(拉取配置而非推送配置)

[ansible pull 官方文档(ansible2.9)](https://docs.ansible.com/ansible/2.9/cli/ansible-pull.html)

### 1.4.1 Ansible-Pull简介

我们可不可以将 ansible 的体系架构颠倒过来，让托管节点从一个 central location 做 check in 获取配置信息，而不是推送配置信息到所有的托管节点？这样是可以的。

Ansible-pull 是一个小脚本，它从 git 上 checkout 一个关于配置指令的 repo，然后以这个配置指令来运行 ansible-playbook

也有一个叫做 clever playbook 的东西: [clever playbook](https://github.com/ansible/ansible-examples/blob/master/language_features/ansible_pull.yml) ， 这个可以通过 crontab 来配置 ansible-pull（from push mode）



### 1.4.2 ansible pull模式

ansible模式使用的是push模式，即只需要在ansible主控端编排playbook，然后push到远程主机即可，pull模式则正好和push相反，pull模式适用于以下场景

- 被控节点在配置时不可用，比如自动伸缩的场景

- 被控节点较多，ansible控制机资源有限无法实现高并发操作



ansible基于pull模式的工作流程

- 每台被控端需要安装ansible和git
- 所有的配置及playbook yaml文件都存放在git仓库
- 被控端的 ansible-pull 计划任务会定期检查给定的git的tag或者分支
- 如果ansible主控端上传到git上特定的文件发生了变更，则执行相应的动作



#### 1.4.2.1 ansible pull 模式测试

ansible主控制机编辑yaml文件并上传至git，⚠️<span style=color:red>yml文件中的 `- hosts` 参数必须为 `127.0.0.1` </span>

```yaml
cat > local.yml << EOF
---
- hosts: 127.0.0.1

  tasks:
    - name: touch file
      file:
        path: /opt/test
        state: touch
        mode: 0644
        owner: root
        group: root
EOF        
```



被控机手动执行验证

> 如果ansible控制端上传到git的yml文件名称不是 `local.yml` ，则需要在命令后边手动指定yml文件名称，不需要参数，在git地址后直接写上文件名即可

```shell
ansible-pull -o -C master -d /opt -i /etc/ansible/hosts -U git@gitee.com:abc/ansible_pull.git 
```

ansible-pull 参数说明

| 参数 | 说明                              |
| ---- | --------------------------------- |
| -C   | 指定git分支                       |
| -d   | git仓库检出的目录                 |
| -i   | 主机hosts路径                     |
| -U   | git仓库地址                       |
| -e   | 添加参数                          |
| -o   | 只有git仓库发生改变才执行playbook |



完成输出，可以看到当git仓库中的yml文件发生改变时，被控端拉取yml文件后会自动执行

```shell
$ ansible-pull -o -C master -d /opt -U git@gitee.com:abc/ansible_pull.git 
Starting Ansible Pull at 2021-08-06 17:42:37
/usr/bin/ansible-pull -o -C master -d /opt -U git@gitee.com:abc/ansible_pull.git
[WARNING]: Could not match supplied host pattern, ignoring: devops02
[WARNING]: Your git version is too old to fully support the depth argument. Falling back to full checkouts.
localhost | CHANGED => {
    "after": "da5e7724ecefbe59ccb308ff1bbd38903803142e", 
    "before": null, 
    "changed": true
}
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: Could not match supplied host pattern, ignoring: devops02

PLAY [127.0.0.1] *************************************************************************************************************************************************************

TASK [Gathering Facts] *******************************************************************************************************************************************************
ok: [localhost]

TASK [touch file] ************************************************************************************************************************************************************
changed: [localhost]

PLAY RECAP *******************************************************************************************************************************************************************
localhost                  : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0  
```



在被控机查看执行结果，在 `/opt` 下创建了test文件

```shell
$ ll /opt/test 
-rw-r--r-- 1 root root 0 Aug  6 17:42 /opt/test
```



配置计划任务

> 计划任务成功执行后就会在  `opt` 下自动pull下 `local.yml` 以及自动执行 playbook

```shell
*/1 * * * * ansible-pull -o -C master -d /opt -U git@gitee.com:pptfz/ansible_pull.git
```





## 1.5 Linting playbooks

> 在执playbook之前，可以使用命令 `ansible-lint` 对其进行详细检查

以下检测结果表明相应的行后边有多余的空格(不过没有影响，只是检测会有提示)，如果没有任何输出则表明playbook没有任何问题

```shell
$ ansible-lint copy.yaml 
[201] Trailing whitespace
copy.yaml:6
    copy: 

[201] Trailing whitespace
copy.yaml:9
      owner: root 

[201] Trailing whitespace
copy.yaml:10
      group: root 
```











