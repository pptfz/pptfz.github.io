# nginx配置代理websocket

:::caution 注意

如果服务前边有cdn，则还需要在cdn中开启websocket

![iShot_2025-07-08_16.52.37](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-07-08_16.52.37.png)

:::

[jupyter](https://github.com/jupyter/notebook) 的websocket路径是 `/api/kernels`

[参考配置](https://gist.github.com/cboettig/8643341bd3c93b62b5c2)

```nginx
location ~* /(api/kernels/[^/]+/(channels|iopub|shell|stdin)|terminals/websocket)/? {
	proxy_pass http://jupyter;
	
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header Host $host;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	# 以下配置为websocket必须项
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection $connection_upgrade;	
}
```

