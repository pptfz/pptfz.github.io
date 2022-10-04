# ssh连接报错

## 报错1 WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!



ssh连接报错 `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` ，原因是 `.ssh/known_hosts` 中ECDSA密钥指纹发生了变化

```shell
$ ssh root@10.0.0.222
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ED25519 key sent by the remote host is
SHA256:kqEBDEZiLWDx62xvYHlhvF77srsdzCg7OaoDbyZjkzA.
Please contact your system administrator.
Add correct host key in /Users/hehe/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /Users/hehe/.ssh/known_hosts:32
Host key for 10.0.0.222 has changed and you have requested strict checking.
Host key verification failed.
```



解决方法是手动删除报错提示的行或者执行 `ssh-keygen -R IP`

```shell
$ ssh-keygen -R 10.0.0.222
# Host 10.0.0.222 found: line 30
# Host 10.0.0.222 found: line 31
# Host 10.0.0.222 found: line 32
/Users/hehe/.ssh/known_hosts updated.
Original contents retained as /Users/hehe/.ssh/known_hosts.old
```

