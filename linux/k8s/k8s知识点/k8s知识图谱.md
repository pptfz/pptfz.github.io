# k8s知识图谱



![iShot2020-10-15 16.24.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-10-15 16.24.55.png)







## 1.部署k8s集群

- Ansible
- kubeadm
- 二进制
- 第三方工具([sealos](https://sealyun.com/))



## 2.数据库

- etcd：存储k8s对象信息



## 3.配置管理

- configmap
- secret



## 4.包管理器

- helm



## 5.微服务

- istio



## 6.存储

- volumes
- PV、PVC
- storage classse
- rook基于ceph
- 分布式存储
  - glusterFS
  - ceph
- nfs



## 7.网络

- flannel
- calico
- cannel



## 8.机器学习

- kubeflow



## 9.日志收集

- elasticsearch+fluentd+kibana
- elasticearch+logstash+filebeat+kibana





## 10.开放接口

- CRI（Container Runtime Interface）：容器运行时接口，提供计算资源
- CNI（Container Network Interface）：容器网络接口，提供网络资源
- CSI（Container Storage Interface）：容器存储接口，提供存储资源





## 11.容器引擎（docker）

- 镜像、容器、网络、数据持久化
- Dockerfile
- Supervisor多进程管理
- GPU
  - nvidia-docker
  - device-plugin



## 12.镜像仓库

- harbor
- nexus



## 13.常用资源对象

- Pod
- namespaces
- Labels and Selectors
- Annotations



## 14.控制器

- ReplicaSet
- Deployment
- SatefulSet
- DaemonSet
- job
- CronJob
- HPA
- Operater



## 15.DNS

- CoreDNS
- KubeDNS



## 16.服务发现与负载均衡

- Ingress
  - nginx
  - Traefik
- Service



## 17.安全

- Namespace
- ServiceAccout
- RBAC



## 18.监控

- cAdvisor+Prometheus+Grafana
- Metrice-server
- kube-state-metrics
- Heapster



## 19.CI/CD

- jenkins
- gitlab
- git
- 发布策略
  - 滚动更新
  - 蓝绿发布
  - 灰度发布