[toc]



# ansible配置文件

## 1.ansible配置文件优先级

### 1.1 ansible默认配置文件说明

ansible配置文件 `/etc/ansible/ansible.cfg` 开头关于ansible配置文件优先级的说明

```yaml
# config file for ansible -- https://ansible.com/
# ===============================================

# nearly all parameters can be overridden in ansible-playbook
# or with command line flags. ansible will read ANSIBLE_CONFIG,
# ansible.cfg in the current working directory, .ansible.cfg in
# the home directory or /etc/ansible/ansible.cfg, whichever it
# finds first
```



### 1.2 ansible配置文件优先级

> ANSIBLE_CONFIG > 项目 > 用户家目录 >  /etc/ansible/ansible.cfg

优先级第1(名为ANSIBLE_CONFIG的环境变量)

​	ANSIBLE_CONFIG

优先级第2(项目中)

​	ansible.cfg

优先级第3(用户家目录)

​	.ansible.cfg

优先级最低

​	/etc/ansible/ansible.cfg



### 1.3 ansible配置文件优先级示例

#### 1.3.1 ansible初始读取的配置文件

ansible默认读取的配置文件，可以使用 `ansible --version` 命令查看，可以看到，ansible初始默认读取的是 `/etc/ansible/ansible.cfg`

```sh
$ ansible --version
ansible 2.9.16
  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]
```



#### 1.3.2 优先级示例

手动指定 `ANSIBLE_CONFIG` 变量 ，然后查看ansible读取的配置文件

```sh
$ mkdir /root/ansible && touch /root/ansible/ansible.cfg
$ export ANSIBLE_CONFIG=/root/ansible/ansible.cfg
$ ansible --version
ansible 2.9.16
  config file = /root/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]
```



创建项目，有时候我们不想把主机地址全部写在默认的主机清单 `/etc/ansible/hosts`中，这个时候就需要单独创建一些项目

⚠️注意需要进入项目中查看

```sh
$ mkdir /root/web_project/ && touch /root/web_project/ansible.cfg


# 不进入项目不生效
$ ansible --version
ansible 2.9.16
  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]

# 必须进入项目中查看
$ cd /root/web_project
$ ansible --version
ansible 2.9.16
  config file = /root/web_project/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]
```



创建用户家目录下的 `.ansible.cfg`

```sh
$ touch .ansible.cfg0
$ ansible --version
ansible 2.9.16
  config file = /root/.ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]
```



