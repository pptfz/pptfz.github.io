[toc]



# CentOS8部署kubeadm高可用k8s-v1.18 

[本文严重抄袭至张馆长的博客](http://zhangguanzhang.github.io/2019/11/24/kubeadm-base-use/)，然后虾改了一些东西

官方并未说明支持centos8，这里只是玩一下



# 一、环境准备

## 1.1实验环境

| 角色        | IP地址        | 主机名          | docker版本  | 硬件配置 | 系统          | 内核                      |
| ----------- | ------------- | --------------- | ----------- | -------- | ------------- | ------------------------- |
| **master1** | **10.0.0.30** | **k8s-master1** | **19.03.4** | **2c4g** | **CentOS8.1** | **4.18.0-147.el8.x86_64** |
| **master2** | **10.0.0.31** | **k8s-master2** | **19.03.4** | **2c4g** | **CentOS8.1** | **4.18.0-147.el8.x86_64** |
| **master3** | **10.0.0.32** | **k8s-master3** | **19.03.4** | **2c4g** | **CentOS8.1** | **4.18.0-147.el8.x86_64** |
| **node1**   | **10.0.0.33** | **k8s-node1**   | **19.03.4** | **2c4g** | **CentOS8.1** | **4.18.0-147.el8.x86_64** |
| **node2**   | **10.0.0.34** | **k8s-node2**   | **19.03.4** | **2c4g** | **CentOS8.1** | **4.18.0-147.el8.x86_64** |



## 1.2每个节点配置host信息

```python
cat >> /etc/hosts << EOF
10.0.0.30 k8s-master1
10.0.0.31 k8s-master2
10.0.0.32 k8s-master3
10.0.0.33 k8s-node1
10.0.0.34 k8s-node2
10.0.0.35 k8s-node3
EOF
```



##  1.3禁用防火墙和selinux

```python
//禁用防火墙
systemctl stop firewalld && systemctl disable firewalld

//禁用selinux
#临时修改
setenforce 0

#永久修改，重启服务器后生效
sed -i '7s/enforcing/disabled/' /etc/selinux/config
```





