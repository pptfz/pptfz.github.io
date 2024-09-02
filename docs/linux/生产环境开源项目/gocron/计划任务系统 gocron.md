[toc]



# 计划任务系统 gocron

[gocron github地址](https://github.com/ouqiang/gocron)

## 1.项目简介

使用Go语言开发的轻量级定时任务集中调度和管理系统，用于替代Linux-crontab [查看文档](https://github.com/ouqiang/gocron/wiki)

原有的延时任务拆分为独立项目[延迟队列](https://github.com/ouqiang/delay-queue)



### 功能特性

- Web界面管理定时任务

- crontab时间表达式, 精确到秒

- 任务执行失败可重试

- 任务执行超时, 强制结束

- 任务依赖配置, A任务完成后再执行B任务

- 账户权限控制

- 任务类型

  - shell任务

  > 在任务节点上执行shell命令, 支持任务同时在多个节点上运行

  - HTTP任务

  > 访问指定的URL地址, 由调度器直接执行, 不依赖任务节点

- 查看任务执行结果日志

- 任务执行结果通知, 支持邮件、Slack、Webhook



### gocron架构示意图

> gocron分为调度器和任务节点

![iShot_2024-09-02_16.46.18](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.46.18.png)

### gocron 命令

- gocron
  - -v 查看版本
- gocron web
  - --host 默认0.0.0.0
  - -p 端口, 指定端口, 默认5920
  - -e 指定运行环境, dev|test|prod, dev模式下可查看更多日志信息, 默认prod
  - -h 查看帮助
- gocron-node
  - -allow-root *nix平台允许以root用户运行
  - -s ip:port 监听地址
  - -enable-tls 开启TLS
  - -ca-file  CA证书文件  
  - -cert-file 证书文件
  - -key-file 私钥文件
  - -h 查看帮助
  - -v 查看版本







## 2.部署安装

从[relese](https://github.com/ouqiang/gocron/releases)下载安装包

 [版本升级参考这里](https://github.com/ouqiang/gocron/wiki/%E7%89%88%E6%9C%AC%E5%8D%87%E7%BA%A7)



### 2.1 下载包

**下载调度器二进制包**

```shell
wget https://github.com/ouqiang/gocron/releases/download/v1.5.3/gocron-v1.5.3-linux-amd64.tar.gz
```



**下载node节点二进制包**

```shell
wget https://github.com/ouqiang/gocron/releases/download/v1.5.3/gocron-node-v1.5.3-linux-amd64.tar.gz
```



### 2.2 启动gocron

#### 2.2.1 启动gocron调度器 

> **gocron调度器监听 5920 端口**

```shell
tar xf gocron-v1.5.3-linux-amd64.tar.gz && cd gocron-linux-amd64
./gocron web
```



#### 2.2.2 启动gocron node

:::tip

**gocron node监听 5921 端口**

**gocron node 默认不允许以 root 用户启动，如果想要以 root 用户启动，则需要加参数 `-allow-root`，经个人测试，如果以非 root 用户启动，会有N堆坑 🦙**

:::

```shell
tar xf gocron-node-v1.5.3-linux-amd64.tar.gz && cd gocron-node-linux-amd64
./gocron-node -allow-root
```



### 2.3 创建数据库

gocron需要连接数据库

```shell
create database gocron;
grant all on gocron.* to gocron@'127.0.0.1' identified by 'gocron';
```



### 2.4 访问gocron

浏览器访问 `IP:5920`



配置数据库、管理员账号

![iShot_2024-09-02_16.47.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.47.52.png)





![iShot_2024-09-02_16.50.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.50.45.png)





登陆后首界面

![iShot_2024-09-02_16.51.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.51.32.png)



## 3.使用示例

### 3.1 新增节点

![iShot_2024-09-02_16.52.15](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.52.15.png)







编辑节点信息，输入主机名(域名或者IP)，node节点默认端口是5921

![iShot_2024-09-02_16.53.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.53.10.png)





添加完的节点

![iShot_2024-09-02_16.53.48](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.53.48.png)





点击 `测试连接` 查看机器联通性

![iShot_2024-09-02_16.54.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.54.44.png)





点击 `任务管理` --> `新增`

![iShot_2024-09-02_16.59.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_16.59.31.png)





编辑任务

![iShot_2024-09-02_17.00.38](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.00.38.png)



可以选择绿色框处的手动执行，也可以选择灰色框中的查看日志

![iShot_2024-09-02_17.01.33](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.01.33.png)





查看日志，执行成功与否会在这里有显示

![iShot_2024-09-02_17.02.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.02.27.png)







### 3.2 配置邮件通知

`系统管理` --> `通知配置`  编辑邮件服务器配置和接受的用户

:::tip

**密码是相对应邮箱的授权码，不是邮箱登陆密码**

:::

![iShot_2024-09-02_17.03.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.03.35.png)



:::tip

**这里使用的是163邮箱，要注意开启SMTP服务**

:::

![iShot_2024-09-02_17.05.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.05.02.png)



在任务中选择任务通知、通知类型和接收通知用户

![iShot_2024-09-02_17.06.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.06.50.png)





执行成功的邮件通知

![iShot_2024-09-02_17.07.36](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.07.36.png)



执行失败的邮件通知

![iShot_2024-09-02_17.09.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_17.09.00.png)





## 4.使用supervisor管理gocron



**supervisor配置文件`/etc/supervisor/supervisord.conf`中定义了include，因此如果想要管理服务，就需要编辑`/etc/supervisor/config.d/*.ini`文件**

```shell
[include] 
files = /etc/supervisor/config.d/*.ini
```



**编辑gocron服务配置文件`/etc/supervisor/config.d/gocron.ini`**

:::tip

**gocron不能独立运行，需指定程序运行时目录，这里gocron调度器二进制文件的目录是 `/usr/local/gocron/gocron-linux-amd64`  **

:::

```shell
cat >/etc/supervisor/config.d/gocron.ini<<'EOF'
[program:gocron]
command=/usr/local/gocron/gocron-linux-amd64/gocron web
directory=/usr/local/gocron/gocron-linux-amd64
priority=1                    ; 数字越高，优先级越高
autostart=true                ; 随着supervisord的启动而启动
autorestart=true              ; 自动重启
startretries=10               ; 启动失败时的最多重试次数
exitcodes=0                   ; 正常退出代码
stopsignal=KILL               ; 用来杀死进程的信号
stopwaitsecs=10               ; 发送SIGKILL前的等待时间
redirect_stderr=true          ; 重定向stderr到stdout

stdout_logfile_maxbytes = 1024MB
stdout_logfile_backups  = 10
stdout_logfile          = /var/log/supervisor/gocron.log
EOF
```



**将gocron加入supervisor**

```shell
$ supervisor> update gocron
gocron: added process group
```



**查看gocron运行状态**

```shell
$ supervisor> status
gocron                           RUNNING   pid 17468, uptime 0:00:03
```

