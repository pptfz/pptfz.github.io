

# ansible只输出错误信息

[参考文章](https://blog.csdn.net/bruce_6/article/details/102604397)

[ansible2.9官方文档](https://docs.ansible.com/ansible/2.9/index.html)



**本文示例ansible版本**

```shell
$ ansible --version
ansible 2.9.17
  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Apr  2 2020, 13:16:51) [GCC 4.8.5 20150623 (Red Hat 4.8.5-39)]
```



有时主机较多时，我们只想关注有问题的主机。

Ansible callback 插件中有一个 actionable，官方描述为：

> actionable - shows only items that need attention

即只输出需要关注的部分。

但是 callback 插件只对 playbook 生效，如何对 Ad-hoc 起作用呢？


可以通过修改配置文件

```sh
[defaults]
bin_ansible_callbacks=True
```


或者修改环境变量来实现

```sh
export ANSIBLE_LOAD_CALLBACK_PLUGINS=1
```



这里我们通过环境变量的方式来进行，这样比较轻量，无需修改文件

在运行 Ad-hoc 命令时，前面加上两个参数即可：

```sh
ANSIBLE_LOAD_CALLBACK_PLUGINS=1 ANSIBLE_STDOUT_CALLBACK=actionable
```



完整命令如下：

```sh
ANSIBLE_LOAD_CALLBACK_PLUGINS=1 ANSIBLE_STDOUT_CALLBACK=actionable ansible all -m ping
```



例如，在机器数量多的时候，执行 ping 模块，就想要查看无法 ping 通的主机

![iShot2021-03-11 09.22.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-03-11%2009.22.55.png)
