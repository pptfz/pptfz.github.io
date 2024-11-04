# git拉取代码报错

git拉取代码报错如下

```shell
$ git clone ssh://git@xxx.com/xxx/xxx.git
Cloning into 'xxx'...
Unable to negotiate with 10.10.10.10 port 6666: no matching host key type found. Their offer: ssh-rsa,ssh-dss
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```



解决方法

参考 [stackoverflow](https://stackoverflow.com/questions/69875520/unable-to-negotiate-with-40-74-28-9-port-22-no-matching-host-key-type-found-th)

```shell
$ cat ~/.ssh/config
Host xxx.com
	PubkeyAcceptedAlgorithms +ssh-rsa
	HostKeyAlgorithms +ssh-rsa
```

