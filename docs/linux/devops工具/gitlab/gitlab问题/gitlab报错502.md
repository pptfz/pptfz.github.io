# gitlab报错502

## 背景说明

> 公司腾讯云gitlab服务器要迁移到阿里云，然后利用阿里云提供的 [腾讯云CVM迁移至阿里云ECS](https://help.aliyun.com/document_detail/171194.html#section-tkm-ns6-1t0) 文档做相关迁移操作，迁移完成后在阿里云使用迁移的镜像启动gitlab，结果gitlab报错502，注意此502并非真正意义上的502，因为gitlab的各个服务均运行正常

**错误页面**

![iShot2021-07-30_17.37.45](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot2021-07-30_17.37.45.png)





## 排查

使用命令 `gitlab-ctl status` 查看gitlab所有服务运行状态均无问题

使用命令 `gitlab-ctl tail` 查看gitlab实时日志，发现有如下报错，日志文件位置是 `/var/log/gitlab/gitlab-workhorse/current` 

```shell
==> /var/log/gitlab/gitlab-workhorse/current <==
{"correlation_id":"01FBVBTMK7G91E56YWDMM5AJTR","duration_ms":0,"error":"badgateway: failed to receive response: dial unix /var/opt/gitlab/gitlab-rails/sockets/gitlab.socket: connect: connection refused","level":"error","method":"GET","msg":"","time":"2021-07-30T17:27:20+08:00","uri":"/favicon.ico"}
```

在[stackoverflow](https://stackoverflow.com/questions/64589918/gitlab-socket-connect-connection-refused)中有外国老哥回答了这个问题，文章中有提到 `puma.id` 和 `puma.state` 这2个文件权限问题，这2个文件位于 `/opt/gitlab/var/puma`， `puma.id` 和 `puma.state` 文件原先权限为 `git` 用户所有，但是gitlab从腾讯云迁移到阿里云后，这2个文件的权限发生了变化，变成了腾讯云机器上的sudo用户，原因未知！



## 解决方法

修改 `/opt/gitlab/var/puma` 下 `puma.pid` 和 `puma.state` 文件权限为 `git` 用户所有，然后执行命令 `gitlab-ctl restart` 重启gitlab即可

