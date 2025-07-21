# argocd问题记录

## https访问报错

使用helm安装的argocd，浏览器访问报错 `重定向次数过多`



![iShot_2024-06-14_20.25.14](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-06-14_20.25.14.png)



![iShot_2024-06-14_20.25.09](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-06-14_20.25.09.png)



解决方法

在ingress配置文件中的 `annotations` 下增加如下一行即可

```yaml
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
```



## 连接k8s集群失败

argocd是部署在kind安装的k8s集群上，连接状态显示为 `Unknown`

![iShot_2025-05-14_18.55.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-14_18.55.18.png)



原因是没有创建 `Applications`  ，以下为slack中来自老外的回复

![iShot_2025-05-16_17.02.13](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-16_17.02.13.png)



增加一个 `Applications` 后集群连接状态就显示为 `Successful` 了

![iShot_2025-05-16_16.46.57](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-05-16_16.46.57.png)





