[toc]



# spug上线示例

## 一、spug上线说明

[spug官方文档 上线配置说明](https://www.spug.dev/docs/deploy-config/)



### 1.1 spug上线方式

spug上线方式分为 `常规发布`和`自定义发布`，其中常规发布方式是沿用了 [瓦力](http://www.walle-web.io/) 的上线流程，但是 [瓦力 ](https://github.com/meolu/walle-web)的大神们在19年的时候被字节给撸走了，可以看到 [瓦力 github ](https://github.com/meolu/walle-web) 中最新的版本是 `v2.0.1` ，并且时间停留在了19年4月16日，瓦力2是python写的(瓦力1是php写的，之前我们的生产环境就是使用的瓦力1)，新增了一些实用的功能，但是 `v2.0.1` 版本有一个重大的BUG，那就是在拉取git代码的时候可能会无法获取分支，spug完美的修复了这个问题，目前生产环境中使用spug上线暂未发现重大BUG。



walle github

![iShot2021-02-07 20.38.49](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 20.38.49.png)



### 1.2 瓦力上线流程

spug上线方式，常规发布是沿用了瓦力的上线逻辑

![iShot2021-02-07 20.35.55](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 20.35.55.png)



瓦力上线流程示意图

![iShot2020-07-2010.13.06](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2010.13.06.png)





## 二、spug上线实践示例

<h3>实验环境说明</h3>

spug部署主机

- IP	10.0.0.10	docker部署

git地址

- ssh://git@10.0.0.11:10022/web_test/web_test_one.git

目标主机

- IP	10.0.0.12

- nginx配置

  ```nginx
  server {
  	listen 80;
  	server_name webtest.pptfz.com;
  	root /data/a01_web/webtest.pptfz.com;
  
  	location / {
  		index index.html;
  	}
  }
  ```

  

### 2.1 上传密钥

spug中新建主机有 `密码` 和 `密钥` 两种方式，其中密钥有 `全局密钥` 和 `独立密钥` 两种，如果上传了独立密钥则以上传的为主，反之以全局密钥为主，生产中我们是选择的修改全局密钥，因为我们是有一台跳板机，可以免密登陆其他机器

![iShot2021-02-07 21.57.17](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.57.17.png)





![iShot2021-02-07 22.02.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.02.22.png)



### 2.1 导入机器

后续的上线中会涉及到项目部署到的机器，因此需要先导入机器

机器导入有 `单个新建` 和 `批量导入` 两种方式，批量导入按照官方提供的模版填写导入即可，这里仅作演示，选择新建即可

![iShot2021-02-07 21.36.28](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.36.28.png)



新建主机会让你选择主机类别，如果是第一次添加的话需要手动设置类别

![iShot2021-02-07 21.46.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.46.10.png)



自定义主机类别

![iShot2021-02-07 21.47.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.47.13.png)



填写其他信息，包括 `主机名称`，`连接信息`，`备注信息`

![iShot2021-02-08 13.04.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.04.39.png)





如果连接成功则会提示操作成功

![iShot2021-02-08 13.05.06](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.05.06.png)



这样我们就手动添加了一台主机，如果想要批量添加主机则下载官方提供的主机导入模版填写上传即可

![iShot2021-02-07 22.12.29](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.12.29.png)





### 2.1 新建项目

在 `应用发布` 中选择 `应用管理`，点击 `新建`

![iShot2021-02-07 21.26.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.26.14.png)



新建应用

![iShot2021-02-07 21.32.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.32.59.png)



新建后的应用

![iShot2021-02-07 21.35.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 21.35.18.png)



### 2.2 新建发布

在要发布的项目中点击 `新建发布`

![iShot2021-02-07 22.20.20](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.20.20.png)



选择 `常规发布`

![iShot2021-02-07 22.21.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.21.35.png)



需要选择发布环境，如果是第一次发布则需要新建环境

![iShot2021-02-07 22.22.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.22.22.png)



新建环境可以在新建发布中选择 `新建环境`，也可以在 `配置中心`中选择 `环境管理`然后再新建环境

![iShot2021-02-07 22.23.34](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.23.34.png)



这里我们新建一个测试环境

![iShot2021-02-07 22.26.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.26.10.png)





选择发布环境、git仓库地址、是否发布审核(需要管理员审核)、消息通知(可选钉钉、企业微信、Webhook)

⚠️如果远程仓库是非22端口，则需要修改git仓库地址

> 原远程仓库中地址&emsp;&emsp;git@10.0.0.11:web_test/web_test_one.git
>
> 需要修改为&emsp;&emsp;ssh://git@10.0.0.11:10022/web_test/web_test_one.git

![iShot2021-02-07 22.40.17](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.40.17.png)





填写发布主机的信息

- **目标主机部署路径**
  - 目标主机部署路径就是程序的根目录，比如在nginx中配置的 `root /data/xxx`
- **目标主机仓库路径**
  - spug会将从远程仓库拉取的最新代码推送到目标主机，然后程序的根目录会软链接到此目录
- **保留历史版本数量**
  - 这里可以设置保留发布代码的个数，方便做回滚操作

- **发布目标主机**
  - 代码部署到机器，可以是单个，也可以是多个

![iShot2021-02-07 22.53.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-07 22.53.59.png)





这里可以做自定义配置

![iShot2021-02-08 10.33.11](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.33.11.png)



- 文件过滤

  - 可以选择传输包含的文件，也可以选择排除的文件，这个就看实际需求了，生产中我们暂无文件过滤需求
  - 

- 自定义全局变量

  - spug官网[内置了全局变量](https://spug.dev/docs/deploy-config/#%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)，当然也可以自定义全局变量

    ![iShot2021-02-08 10.39.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.39.58.png)





- 代码检出前执行

  - 在部署spug的服务器上执行

    ![iShot2021-02-08 10.43.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.43.09.png)



- 代码检出后执行

  - 在部署spug的服务器上执行，当前这个目录是spug从远程仓库拉取代码后存储的路径 `/data/spug/spug_api/repos` ，可以通过spug官方提供的全局变量 `SPUG_REPOS_DIR` 查看到

  - 在这里一般进行项目的依赖包安装和编译工作

    ![iShot2021-02-08 10.45.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.45.10.png)





- 应用发布前执行

  - 在发布的目标主机上运行，当前目录为目标主机上待发布的源代码目录，生产中我们设置为 `/data/release/项目名(一般为域名)`

    ![iShot2021-02-08 10.56.52](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.56.52.png)



- 应用发布后执行

  - 在发布的目标主机上执行，当前目录为已发布的应用目录，生产中我们设置为 `/data/公司简称_web|api/项目名(一般为域名)`

  - 生产中我们的php项目有用到这一块，php项目的 `vendor` 目录和 `.env`文件开发是不往远程仓库上传的，因为这2个目录很少做修改，但是spug每次上线都是生成最新的软链接，因此需要把`vendor` 目录和 `.env`文件拷贝到最新的软链接中

    ```sh
    # 项目名称
    PROJECT_NAME='callback.abc.com'
    
    # 获取瓦力最新链接目录
    LAST_DIR=`cd /data/xmadx_api && ls -l | grep $PROJECT_NAME | awk '{print $NF}'`
    
    # 项目vendor .env路径
    VENDOR_PATH="/data/vendor_xmadx/$PROJECT_NAME"
    
    # 拷贝vendor目录和env文件到瓦力最新链接目录
    \cp -rp $VENDOR_PATH/{vendor,.env} $LAST_DIR
    
    # 修改目录所有者
    chown -R www.www /data/release/$PROJECT_NAME /data/xmadx_api/$PROJECT_NAME
    ```

    ![iShot2021-02-08 10.59.48](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 10.59.48.png)



### 2.3 发布申请

新建发布完成自定义配置后就可以发布申请了

在 `应用发布` 中选择 `发布申请` ，然后点击 `新建发布申请`

![iShot2021-02-08 11.10.52](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 11.10.52.png)



新建发布申请前先做一下环境准备

- 提交测试页面到远程仓库，这里选择 [gogs](https://github.com/gogs/gogs)，当然也可以选择他的孪生兄弟 [gitea](https://github.com/go-gitea/gitea)

  ```html
  cat > index.html <<EOF
  <html>
      <head>
          <meta charset="utf-8" />
          <title>第一次测试</title>
      </head>
      <body><h1>第一次测试</h1></body>
  </html>
  EOF
  ```

- 目标主机配置nginx

  > 需要说明以下几点
  >
  > 1、nginx中指定的root根目录 `/data/a01_web/webtest.pptfz.com` 中`/data/a01_web`是必须存在的目录，而 `/data/a01_web/webtest.pptfz.com`则不能存在，因为spug会自动生成这个目录
  >
  > 2、源代码目录存放在自定义的 `/data/release/webtest.pptfz.com`，程序的根目录会软链接到此目录下以时间命名的目录

  ```nginx
  cat > /usr/local/nginx/conf/vhost/webtest.pptfz.com.conf <<EOF
  server {
      listen 80;
      server_name webtest.pptfz.com;
      root /data/a01_web/webtest.pptfz.com;
    
      location / {
          index index.html;
      }
  }
  EOF
  ```

  



开始发布，选择应用的环境(如测试、生产、灰度等)，点击要上线的项目

![iShot2021-02-08 12.02.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 12.02.18.png)



填写发布相关信息

![iShot2021-02-08 12.05.03](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 12.05.03.png)



开始发布，点击 `发布`

![iShot2021-02-08 12.06.30](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 12.06.30.png)



还需要再点击 `发布`

![iShot2021-02-08 12.54.34](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 12.54.34.png)



发布成功

![iShot2021-02-08 13.05.42](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.05.42.png)

![iShot2021-02-08 13.06.07](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.06.07.png)



### 2.4 查看上线

浏览器访问

![iShot2021-02-08 14.31.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.31.09.png)



这里可以看到nginx配置文件中的root根目录 `/data/a01_web/webtest.pptfz.com`实际上是软链接到了 `/data/release/webtest.pptfz.com/时间目录`

![iShot2021-02-08 13.07.42](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.07.42.png)



![iShot2021-02-08 13.08.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 13.08.14.png)



### 2.5 回滚操作

编辑测试文件 `index.html` 并提交至git

```html
cat > index.html <<EOF
<html>
    <head>
        <meta charset="utf-8" />
        <title>增加一个功能</title>
    </head>
    <body><h1>增加一个功能</h1></body>
</html>
EOF
```



在gogs中查看提交的文件

![iShot2021-02-08 14.37.06](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.37.06.png)



spug上线发布，操作流程和之前一样，找到对应的项目，然后点击发布

![iShot2021-02-08 14.38.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.38.13.png)



浏览器查看，已经更新

![iShot2021-02-08 14.38.53](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.38.53.png)



web机器查看，可以看到 `/data/release/webtest.pptfz.com`下已经有2个时间命名的目录了，这就是每一次发布的源码，而nginx中配置的root根目录总是指向最新的软链接， `1_1_20210208125502` 是第一次发布的内容，`1_2_20210208143842`是第二次发布的内容

![iShot2021-02-08 14.40.36](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.40.36.png)



现在做一下回滚操作，再要回滚的项目中点击 `回滚`

![iShot2021-02-08 14.44.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.44.35.png)



回滚确认

![iShot2021-02-08 14.45.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.45.10.png)



点击 `回滚` 后会重新生成上线单，点击 `发布` 即可，和正常上线流程一样

![iShot2021-02-08 14.45.48](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.45.48.png)



回滚成功

![iShot2021-02-08 14.47.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.47.23.png)



浏览器验证，可以看到，内容又回到了第一次提交的内容 `第一次测试`

![iShot2021-02-08 14.47.50](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-02-08 14.47.50.png)