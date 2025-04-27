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

