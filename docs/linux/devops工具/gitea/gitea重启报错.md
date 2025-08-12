# gitea重启报错

使用helm安装的gitea，在修改了 `app.ini` 配置文件后重启报错如下

```shell
$ kubectl logs -f gitea-fb87474cc-8n6dc 
Defaulted container "gitea" out of: gitea, init-directories (init), init-app-ini (init), configure-gitea (init)
2024/06/12 12:38:37 cmd/web.go:242:runWeb() [I] Starting Gitea on PID: 10
2024/06/12 12:38:37 cmd/web.go:111:showWebStartupMessage() [I] Gitea version: 1.22.0 built with GNU Make 4.4.1, go1.22.3 : bindata, timetzdata, sqlite, sqlite_unlock_notify
2024/06/12 12:38:37 cmd/web.go:112:showWebStartupMessage() [I] * RunMode: prod
2024/06/12 12:38:37 cmd/web.go:113:showWebStartupMessage() [I] * AppPath: /usr/local/bin/gitea
2024/06/12 12:38:37 cmd/web.go:114:showWebStartupMessage() [I] * WorkPath: /data
2024/06/12 12:38:37 cmd/web.go:115:showWebStartupMessage() [I] * CustomPath: /data/gitea
2024/06/12 12:38:37 cmd/web.go:116:showWebStartupMessage() [I] * ConfigFile: /data/gitea/conf/app.ini
2024/06/12 12:38:37 cmd/web.go:117:showWebStartupMessage() [I] Prepare to run web server
2024/06/12 12:38:37 routers/init.go:116:InitWebInstalled() [I] Git version: 2.45.1 (home: /data/home)
2024/06/12 12:38:38 ...s/setting/session.go:77:loadSessionFrom() [I] Session Service Enabled
2024/06/12 12:38:38 ...s/storage/storage.go:176:initAttachments() [I] Initialising Attachment storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/attachments
2024/06/12 12:38:38 ...s/storage/storage.go:166:initAvatars() [I] Initialising Avatar storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/avatars
2024/06/12 12:38:38 ...s/storage/storage.go:192:initRepoAvatars() [I] Initialising Repository Avatar storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/repo-avatars
2024/06/12 12:38:38 ...s/storage/storage.go:198:initRepoArchives() [I] Initialising Repository Archive storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/repo-archive
2024/06/12 12:38:38 ...s/storage/storage.go:208:initPackages() [I] Initialising Packages storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/packages
2024/06/12 12:38:38 ...s/storage/storage.go:219:initActions() [I] Initialising Actions storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/actions_log
2024/06/12 12:38:38 ...s/storage/storage.go:223:initActions() [I] Initialising ActionsArtifacts storage with type: local
2024/06/12 12:38:38 ...les/storage/local.go:33:NewLocalStorage() [I] Creating new Local Storage at /data/actions_artifacts
2024/06/12 12:38:48 ...les/queue/manager.go:108:]() [E] Failed to create queue "notification-service": unable to lock level db at /data/queues/common: resource temporarily unavailable
2024/06/12 12:38:48 ...tification/notify.go:48:NewNotifier() [F] Unable to create notification-service queue
```





原因如下

![iShot_2024-06-13_10.45.34](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2024-06-13_10.45.34.png)



```
The previous shutdown wasn’t clean, so the queues still have a lock attached to them.  Since the new queues can’t get a lock for themselves they error.  For k8s it is recommended you don’t rely on disk related queues such as leveldb but rather something such as redis
```



```
之前的关闭不是干净的，因此队列仍然附加了一个锁。由于新队列无法为自己获得锁，因此它们会出错。对于k8s，建议不要依赖与磁盘相关的队列，比如leveldb，而是像redis这样的东西
```



解决方法是在使用helm安装的时候，不要关闭redis cluster集群的安装