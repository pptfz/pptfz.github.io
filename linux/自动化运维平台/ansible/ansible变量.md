# ansible变量

[ansible2.9变量官方文档](https://docs.ansible.com/ansible/2.9/user_guide/playbooks_variables.html)



# 1.ansible定义变量

## 1.1 在playbook中的play进行定义

在yml文件中通过 `vars` 关键字定义变量，引用变量使用 `{{}}`

```yaml
vars:
  - 变量名1： 变量值1
  - 变量名2： 变量值2
```



使用示例

```yaml
- hosts: all
  vars:
    - pkg_name1: httpd
    - pkg_name2: nginx

  tasks:
    - name: install httpd
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
```



在playbook中还可以通过 `vars_files` 关键字引用变量文件

```yaml
vars_files: 变量文件
```



编辑一个变量文件

```yaml
pkg_name1: httpd
pkg_name2: nginx
```



在yml文件使用关键字 `vars_files` 引用变量文件

```yaml
- hosts: devops02
  
  vars_files:
    ./vars_pub.yml
  
  tasks:
    - name: install httpd nginx
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
```



## 1.2 通过inventory主机清单进行定义

在inventory主机清单中通过 `[组名:vars]` 定义变量，这个变量既可以在inventory中引用，也可以在playbook中引用

```sh
[all_server:vars]
ansible_ssh_user=ops
ansible_ssh_port=2233
ansible_ssh_private_key_file=/home/ops/.ssh/id_rsa_ops
ansible_become=true 
ansible_become_method=sudo 
ansible_become_user=root

[all_server]
devops01
devops02
```



### 1.2.1 `group_vars` 与 `host_vars`

官方推荐在项目目录下，创建两个变量目录 `host_vars`、`group_vars` ，在这2个目录下存放变量的文件

- 在组(group_vars)下面创建一个和inventory中组名相同的变量文件，那么inventory中某个组下面的主机就会引用 `group_vars` 目录下与组名同名的变量文件中的变量

- 在主机(host_vars)下面创建一个和inventory中主机名相同的变量文件，那么invertory中的某个主机就会引用 `host_vars` 目录下和主机同名的变量文件中的变量



#### 1.2.1.1 `group_vars` 使用示例

 在项目下创建 `group_vars` 目录

```shell
mkdir group_vars
```



项目下hosts文件内容如下

```shell
[devops]
devops01
devops02
```



在 `group_vars` 目录下创建与组名同名的文件并写入变量

```shell
cat > group_vars/devops <<EOF
pkg_name1: nginx
pkg_name2: httpd
EOF
```



编辑yml文件

```yaml
cat > vars01.yml <<EOF
- hosts: devops
  
  tasks:
    - name: install httpd nginx
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
EOF
```



执行playbook，可以看到在yml文件中没有指定变量文件的情况下会自动读取 `group_vars` 目录下与invertory中组名同名的变量文件中的变量

```shell
$ ansible-playbook vars01.yml -i hosts

PLAY [devops] ******************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]
ok: [devops01]

TASK [install httpd nginx] *****************************************************************************************************************************
ok: [devops02]
ok: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
devops02                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

```



#### 1.2.1.2 `host_vars` 使用示例

 在项目下创建 `host_vars` 目录

```shell
mkdir host_vars
```



项目下hosts文件内容如下

```shell
[devops]
devops01
```



在 `host_vars` 目录下创建与主机同名的文件并写入变量

```shell
cat > host_vars/devops01 <<EOF
pkg_name1: nginx
pkg_name2: httpd
EOF
```



编辑yml文件

```yaml
cat > vars02.yml <<EOF
- hosts: devops01
  
  tasks:
    - name: install httpd nginx
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
EOF
```



执行playbook，可以看到在yml文件中没有指定变量文件的情况下会自动读取 `host_vars` 目录下与invertory中主机名同名的变量文件中的变量

```shell
$ ansible-playbook vars02.yml -i hosts

PLAY [devops01] ****************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops01]

TASK [install httpd nginx] *****************************************************************************************************************************
ok: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



### 1.2.2 特殊组 `all`

> `group_vars` 与 `host_vars` 有一个共同的缺点，如果有多个组或者多台主机的话，那就得编辑多个变量文件，即使变量文件内容一致也需要编辑多个与组名相同的变量文件，这样的话就会有很多重复的工作

例如在 `group_vars` 目录下有2个与组名相同的变量文件v1与v2，v1与v2文件内容是相同的，但是v1与v2不能互相调用对方的变量，此时使用 `all` 这个组就可以解决这个问题



项目下 `hosts` 文件内容如下

```shell
[d1]
devops01

[d2]
devops02
```



在 `host_vars` 目录下创建 `all` 组并写入变量

```shell
cat > group_vars/all <<EOF
pkg_name1: nginx
pkg_name2: httpd
EOF
```



编辑yml文件d1

```shell
cat > d1.yml <<EOF
- hosts: d1
  
  tasks:
    - name: install httpd nginx
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
EOF
```



执行playbook，可以从 `group_vars` 目录下读取 `all` 组中的变量

```shell
$ ansible-playbook d1.yml -i hosts

PLAY [d1] **********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops01]

TASK [install httpd nginx] *****************************************************************************************************************************
ok: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



编辑yml文件d2

```shell
cat > d2.yml <<EOF
- hosts: d2
  
  tasks:
    - name: install httpd nginx
      yum: 
        name: 
          - "{{ pkg_name1 }}"
          - "{{ pkg_name2 }}"
        state:
          present
EOF
```



执行playbook，可以从 `group_vars` 目录下读取 `all` 组中的变量

```shell
$ ansible-playbook d2.yml -i hosts

PLAY [d2] **********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops02]

TASK [install httpd nginx] *****************************************************************************************************************************
ok: [devops02]

PLAY RECAP *********************************************************************************************************************************************
devops02                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



playbook指定执行单个主机的时候，会先从 `host_vars` 下查找变量，如果没有就从 `group_vars` 中查找，最后从 `group_vars/all` 中查找



## 1.3 通过执行playbook时进行定义

> 执行playbook通过 `-e` 参数指定变量



项目下hosts文件内容如下

```yaml
[prod]
devops01

[test]
devops02
```



编辑yml文件，主机处定义一个变量，在执行playbook的时候通过 `-e` 参数指定要执行的主机组

```yaml
cat > var.yml <<EOF
- hosts: "{{ hosts }}"
  
  tasks:
    - name: install nginx
      yum: 
        name: 
          - nginx
        state:
          present
EOF
```



执行playbook的时候，通过 `-e` 指定要执行的主机组

```shell
$ ansible-playbook -i hosts var.yml -e "hosts=prod"
[WARNING]: Found variable using reserved name: hosts

PLAY [prod] ********************************************************************************************************************************************

TASK [Gathering Facts] *********************************************************************************************************************************
ok: [devops01]

TASK [install nginx] ***********************************************************************************************************************************
ok: [devops01]

PLAY RECAP *********************************************************************************************************************************************
devops01                   : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```





# 2.ansible变量优先级

`-e` 传参 > `vars_files(playbook)` > `vars(playbook)`  > `host_vars(inventory)` > `group_vars(inventory)`> 特殊组all

























