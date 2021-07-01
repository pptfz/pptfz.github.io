# jenkins从构建生成进程



[参考文章](https://wiki.jenkins.io/display/JENKINS/Spawning+processes+from+build)



## 从构建生成进程

> 有时，您希望从比构建本身寿命更长的构建中生成一个进程。例如，构建的一部分可能是使用构建结果启动新的应用程序服务器。执行此操作时，您经常会遇到构建未终止的问题；你会看到 shell script/ant/maven 按预期终止，但 Jenkins 只是坚持等待，好像它没有注意到构建已经结束。
>
> 从 Jenkins 1.136 开始，Jenkins 检测到这种情况，而不是导致无限阻塞，它只会打印出警告并让您继续。但是您仍然应该了解导致这种情况的原因。



以上为 [官方文章](https://wiki.jenkins.io/display/JENKINS/Spawning+processes+from+build) 对于这个问题的描述，现在结合实际使用场景再描述一下当前的问题，比如说我们在jenkins项目构建中使用的是shell命令，并且又涉及到启动后台服务命令，例如 `gitbook serve &` ，当我们在jenkins项目构建中执行此命令，jenkins的构建会报错，大致原因是不能执行后台进程，但是当把 `&` 去掉让进程前台执行，jenkins的构建会无法结束，jenkins会一直显示构建中



## 造成此现象的原因

> 发生此问题的原因是文件描述符泄漏以及它们如何从一个进程继承到另一个进程。Jenkins 和子进程通过三个管道（stdin/stdout/stderr）相连。这使得 Jenkins 可以捕获子进程的输出。由于子进程可能会向管道写入大量数据并在此之后立即退出，因此 Jenkins 需要确保它在认为构建结束之前排空管道。詹金斯通过等待 EOF 来做到这一点。
>
> 当进程因任何原因终止时，操作系统会关闭它拥有的所有文件描述符。因此，即使该过程没有关闭 stdout/stderr，Jenkins 仍将获得 EOF。
>
> 当这些文件描述符被继承给其他进程时，就会出现复杂情况。假设子进程将另一个进程派生到后台。后台进程（AKA 守护进程）继承父进程的所有文件描述符，包括连接子进程和 Jenkins 的 stdout/stderr 管道的写入端。如果守护进程忘记关闭它们，即使子进程退出，Jenkins 也不会获得管道的 EOF，因为守护进程仍然打开这些描述符。这个问题就是这样发生的。
>
> 一个好的守护程序会关闭所有文件描述符以避免出现这样的问题，但通常会有不遵守规则的坏文件描述符。



## 解决方法

在linux中，可以使用如下方法执行，⚠️在 Jenkins Pipeline 的情况下使用 `JENKINS_NODE_COOKIE` 而不是 `BUILD_ID`

```shell
daemonize -E BUILD_ID=dontKillMe /path/to/your/command
```



**使用示例**

```shell
# 原先执行方式，jenkins构建不会停止
cd /gitbook && gitbook serve

# 修改为
cd /gitbook && daemonize -E BUILD_ID=dontKillMe gitbook serve
```

























