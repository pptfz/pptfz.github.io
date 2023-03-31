# ansible安装

[ansible官网](https://www.ansible.com/)

[ansible github](https://github.com/ansible/ansible)

[ansible官网文档总地址](https://docs.ansible.com/)

[ansible官方安装文档](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)



## 1.yum安装

需要epel源

```shell
yum -y install ansible
```



yum安装的ansible二进制命令路径是 `/usr/bin/ansible`

```shell
$ which ansible
/usr/bin/ansible
```



默认读取的配置文件是 `/etc/ansible/ansible.cfg`

```shell
$ ansible --version
ansible 2.9.25
  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Oct 14 2020, 14:45:30) [GCC 4.8.5 20150623 (Red Hat 4.8.5-44)]
```



## 2.pip安装

安装pip

```shell
yum -y install python-pip
```



安装最新版ansible

```shell
pip install ansible
```



指定版本安装

```shell
pip install ansible==2.9.25
```



pip安装的ansible二进制命令路径是 `/usr/local/bin/ansible`

```shell
$ which ansible
/usr/local/bin/ansible
```



pip安装的ansible默认没有配置文件路径，需要手动创建目录和文件，和yum安装的ansible默认文件路径一致，都是在 `/etc/ansible` 下

```shell
ansible --version
ansible 2.9.25
  config file = None
  configured module search path = ['/root/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/local/lib/python3.6/site-packages/ansible
  executable location = /usr/local/bin/ansible
  python version = 3.6.8 (default, Nov 16 2020, 16:55:22) [GCC 4.8.5 20150623 (Red Hat 4.8.5-44)]
```

