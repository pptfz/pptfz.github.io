# argocd报错



使用helm安装的argued，浏览器访问报错 `重定向次数过多`



![iShot_2024-06-14_20.25.14](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-06-14_20.25.14.png)



![iShot_2024-06-14_20.25.09](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-06-14_20.25.09.png)



解决方法

[在slack中老外的回复](https://app.slack.com/client/T08PSQ7BQ/C01TSERG0KZ)

在ingress配置文件中的 `annotations` 下增加如下一行即可

```yaml
nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
```

