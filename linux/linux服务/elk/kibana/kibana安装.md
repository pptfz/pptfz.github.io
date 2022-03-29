# kibana安装



[kibana官方](https://www.elastic.co/cn/kibana)

[kibana官方下载地址](https://www.elastic.co/cn/downloads/kibana)

[kibana各版本官方下载地址](https://www.elastic.co/cn/downloads/past-releases#kibana)



kibana是基于node.js开发的

kIbana是运行于elasticsearch基础之上的，可以将kibana视为elasticsearch的用户图形界面(Graphic User Interface GUI)





## 下载安装包

```sh
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.1-linux-x86_64.tar.gz
```



## 解压缩安装包

```
tar xf kibana-7.12.1-linux-x86_64.tar.gz -C /usr/local/
```





## 修改kibana目录所有者

这里elasticsearch和kibana安装在同一台主机，并且目录所有者为es

```sh
chown -R es.es /usr/local/kibana-7.12.1-linux-x86_64/
```



## 开启kibana远程访问

kiban默认监听127.0.0.1，如果想要开启远程访问，需要修改 `conf/kibana.yml`，将 `server.host` 一行修改为如下

```sh
server.host: "0.0.0.0"
```



## 启动kibana

```sh
su es -c '/usr/local/kibana-7.12.1-linux-x86_64/bin/kibana' &
```



## 验证kibana启动

kibana默认监听tcp:5601端口

```sh
$ netstat -ntpl|grep 5601
tcp        0      0 0.0.0.0:5601            0.0.0.0:*               LISTEN      3672/node           

$ ps aux|grep 3672
es        3672  6.2  5.2 1097364 213860 ?      Ssl  00:28   0:14 /usr/local/kibana-7.12.1-linux-x86_64/bin/../node/bin/node /usr/local/kibana-7.12.1-linux-x86_64/bin/../src/cli/dist
```





## 访问kibana

浏览器输入 `IP:5601`

第一次访问的欢迎页面会有2个按钮，添加数据源 `Add data` 和 独自探索 `Explore on my own` 

![iShot2021-05-24 00.30.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-05-24 00.30.07.png)







![iShot2021-05-24 00.33.26](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-05-24 00.33.26.png)
