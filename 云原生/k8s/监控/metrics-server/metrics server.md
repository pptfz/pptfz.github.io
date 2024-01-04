# metrics server

[metrics server github地址](https://github.com/kubernetes-sigs/metrics-server)



## 安装

添加helm仓库

```shell
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server
helm repo update
```



下载安装包

```sh
helm pull metrics-server/metrics-server
```



解压缩

```sh
tar xf metrics-server-3.11.0.tgz && cd metrics-server
```



修改 `values.yaml` 文件中的镜像

```sh
修改
	registry.k8s.io/metrics-server/metrics-server:v0.6.4
修改为
	uhub.service.ucloud.cn/996.icu/metrics-server:v0.6.4	
```



安装

```sh
helm upgrade --install metircs-server -n monitor --create-namespace .
```





默认情况下， `metircs-server` pod会有如下报错，原因是默认情况下kubeadm 部署的 kubelet 服务证书是自签名的,这意味着从外部服务（例如metrics-server）到 kubelet 的连接无法使用 TLS 进行保护

```sh
E1227 06:51:11.516526       1 scraper.go:140] "Failed to scrape node" err="Get \"https://172.18.0.5:10250/metrics/resource\": x509: cannot validate certificate for 172.18.0.5 because it doesn't contain any IP SANs" node="ops-ingress-worker3"
```



在 [github](https://github.com/kubernetes-sigs/metrics-server/issues/196) 中有这个问题的相关讨论

[使用kubeadm部署集群的解决方法](https://particule.io/en/blog/kubeadm-metrics-server/)

[使用kind部署集群的解决方法](https://www.zeng.dev/post/2023-kubeadm-enable-kubelet-serving-certs/)



临时的解决方法是在 `metrics-server` 启动的时候添加 `--kubelet-insecure-tls` 参数跳过证书验证

```yaml
defaultArgs:
  - --cert-dir=/tmp
  - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
  - --kubelet-use-node-status-port
  - --metric-resolution=15s
  - --kubelet-insecure-tls
```





## 使用



```sh
$ kubectl top no
NAME                        CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
ops-ingress-control-plane   958m         23%    1029Mi          20%       
ops-ingress-worker          438m         10%    516Mi           10%       
ops-ingress-worker2         345m         8%     592Mi           12%       
ops-ingress-worker3         358m         8%     632Mi           12%  
```





```sh
$ kubectl top po
NAME                                                 CPU(cores)   MEMORY(bytes)   
metircs-server-metrics-server-85467c4898-v79w5       24m          17Mi            
prometheus-alertmanager-0                            8m           15Mi            
prometheus-kube-state-metrics-85596bfdb6-fs62r       14m          35Mi            
prometheus-prometheus-node-exporter-jkfs2            1m           6Mi             
prometheus-prometheus-node-exporter-jnhpb            1m           8Mi             
prometheus-prometheus-node-exporter-kxpzw            1m           7Mi             
prometheus-prometheus-node-exporter-z428z            1m           6Mi             
prometheus-prometheus-pushgateway-79745d4495-gdn2m   13m          6Mi             
prometheus-server-64f955868b-mkq8t                   0m           129Mi        
```

