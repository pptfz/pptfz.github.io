[toc]



# walle1.2 上线示例

## 1.瓦力上线流程示意图

### 1.1 个人总结版

**瓦力上线流程示意图**

![iShot2020-07-2010.13.06](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2010.13.06.png)





**过程说明**

**1.开发提交本地代码到gitlab(github、gitea等)仓库**

**2.瓦力从gitlab拉取最新代码到本机**

- 注意需要把进程用户的密钥放到gitlab的ssh-keys列表，这里的进程用户指的是一个程序的运行用户，例如nginx的运行用户是www
- 如果是java项目，则会在瓦力机器上进行编译打包，因此maven仓库是部署在瓦力机器上的

**3.瓦力推送最新代码到线上web机器的`发布版本库(瓦力中配置，就是web机器上的一个目录)`**

- 既然是瓦力主动推送代码到线上web机器，因此需要把进程用户的公钥添加到线上web机器的用户ssh-key信任列表，即做瓦力机器--->线上web机器的免密登陆

**4.程序web根目录软连接到`发布版本库`**

- 在瓦力中会配置`发布版本库`，这个`发布版本库`就是每一次瓦力推送的代码存放地址，然后程序的web根目录软连接到`发布版本库`，如果要做升级或者回滚的话就是改变软连接的位置



### 1.2 官方说明版

**瓦力原理示意图**

宿主机、目标机群、操作用户关系如下图所示，宿主机（walle所在的机器），是一个中间机器，是代码托管与远程目标机群的纽带。所以宿主机需要与代码托管(github/gitlab)和远程目标机群都建立ssh-key信任。

![iShot2020-07-2013.10.45](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2013.10.45.png)



**上线流程示意图**

![iShot2020-07-2013.11.31](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2013.11.31.png)





## 2.瓦力上线项目配置项说明

### 2.1 项目配置说明

![iShot2020-07-2011.44.44](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2012.48.29.png)





#### 2.1.1 项目配置

![iShot2020-07-2012.48.29](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2012.49.22.png)

- **项目名称**		需要上线的项目名称，最好与项目类型名相同，例如项目是兼容测试类，则名称就命名为`兼容-测试-1.0`

- **项目环境**        测试环境、预发布环境、线上环境

- **远程仓库地址**        一般为git居多





#### 2.1.2 宿主机配置(瓦力机器本身)

![iShot2020-07-2012.48.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2012.48.58.png)

- **代码检出仓库**        瓦力从gitlab拉取代码的存放路径，目录自定义设置，⚠️要保证程序运行用户对此目录有写权限
- **排除文件**        可以填写要排除的文件，自定义



#### 2.1.3 目标机器配置

![iShot2020-07-2012.49.22](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2011.44.44.png)

- **用户**        目标机器就是线上的web机器，这里填写程序的运行用户，例如tomcat的运行用户是www
- **webroot**    代码的最终部署路径，⚠️注意不要创建此目录，瓦力会自动生成软连接到此，正确设置父级目录即可
- **发布版本库**        代码发布的版本库，每次发布更新webroot的软链到当前最新版本，格式是`/data/releases/项目名/时间目录`，回滚只需要修改软连接即可，目录自定义
- **版本保留数**        过多的历史版本将被删除，只可回滚保留的版本
- **机器列表**        要发布的机器列表，一行一个，非22端口可`ip:port`



#### 2.1.3 高级任务(目标机器操作)

![iShot2020-07-2012.50.08](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2012.50.08.png)



- **pre_deploy**        在部署代码之前的准备工作，如git的一些前置检查、vendor的安装（更新），一行一条
- **post_deploy**        git代码检出之后，可能做一些调整处理， 如vendor拷贝， 环境适配（mv config一test.phpconfig.php）一行一条
- **pre_release**        同步完所有目标机器之后，更改版本软链之前触发任务。java可能要做一些暂停服务的操作（双引号将会被转义为\\"）
- **post_release**        所有目标机器都部署完毕之后，做一些清理工作， 如删除缓存、平滑重载/重启服务（nginx、php、task） ，一行一条（双引号将会被转义为\\"）
- **post_release_delay**        按顺序在每台目标机执行高级任务，每台服务器执行完毕后暂停x秒。默认设置为0，应用服务使用平滑重载，仅当应用服务无法支持平滑重载必须重启时才配置此参数。设置为大于0的值会出现代码发布阶段各个服务器业务代码逻辑不一致的情况，请谨慎配置



## 3.项目配置示例

### 3.1 前提条件

**生产环境程序运行环境及用户说明**

- 生产环境中一般会以一个非root用户运行程序，这里假设以`www`用户运行程序，生产中`www`用户是所有开发登陆系统所用的用户(需要cmdb授权登陆机器)，还有一个是运维专用用户，除特殊情况外，所有机器中的服务及相关目录权限都是`www`用户

  

**瓦力机器说明**

- 瓦力机器中代码检出仓库的权限应该设置`www`用户可写，生产中我们直接设置为`www`用户所有
- 禁止root远程登陆，登陆用户是`www`，登陆方式是密钥登陆



**目标机器说明**

- 目标机器的发布版本库权限所有者是`www`用户
- 目标机器中的服务以`supervisor`管理，并且`supervisor`运行用户是`www`
- 禁止root远程登陆，登陆用户是`www`，登陆方式是密钥登陆



**ssh-key说明**

- 瓦力机器需要与代码托管(github/gitlab)和远程目标机群都建立ssh-key信任，即瓦力机器要把自身的公钥放到代码托管、目标机器的ssh-key列表中



### 3.2 配置示例

**生产环境中有java、php、python项目，其中还是以java项目居多，本示例中以更新nginx首页面模拟项目**



**示例环境**

| **角色**   | **机器IP**    | **主机名**    |
| ---------- | ------------- | ------------- |
| **walle**  | **10.0.0.10** | **walle**     |
| **gitlab** | **10.0.0.12** | **gitlab**    |
| **web**    | **10.0.0.13** | **webserver** |



#### 3.2.1 用户、目录权限配置

##### 3.2.1.1 瓦力、目标web机共同配置

**瓦力机器、目标web机器禁止root远程登陆，配置`sudo`用户是`www`，并且`www`用户登陆方式是密钥登陆**

**禁止root远程登陆，编辑文件`/etc/ssh/sshd_config`，编辑完成后重启`ssh`服务**

```shell
#禁止root远程登陆
PermitRootLogin no

#禁用密码验证
PasswordAuthentication no
```



**`www`用户生成密钥**

```shell
su - www && ssh-keygen -t rsa -f /root/.ssh/id_dsa -P "" -q
```



##### 3.2.1.2 瓦力机器单独配置

**创建代码检出仓库并设置目录所有者为`www`**

```shell
mkdir -p /data/walle/WebServer && chown www.www /data/walle/WebServer
```



**推送本机`www`用户的公钥到目标web机器的`www`用户**

- 把瓦力机器`www`用户`~/.ssh/id_rsa.pub`文件中的内容复制到目标机器`www`用户下的`~/.ssh/authorized_keys`中，并且`authorized_keys`文件权设置为644或600，目前只能手动复制内容，没有找到命令解决方法



**把本机`.ssh/id_rsa.pub`放到后续创建的gitlab项目中，注意以下问题**

:::tip

**ssh服务配置文件`/etc/ssh/sshd_config`中有一项配置是`AuthorizedKeysFile .ssh/authorized_keys`，如果想要使用私钥免密登陆，则公钥必须写入到文件`.ssh/authorized_keys`中，即注册公钥，否则免密会失败！！！**

:::

##### 3.2.1.3 目标web机器单独配置

**已经rpm包安装好nginx1.16.1，并且nginx以www用户运行**

**编辑nginx虚拟主机配置测试文件**

```nginx
cat > /etc/nginx/conf.d/walle-test.conf <<EOF
server {
  listen 80;
  server_name _;

  location / {
    root /data/nginx/website;
    index index.html;
  }
}
EOF
```



**在瓦力中我们配置了webroot是`/data/nginx/website`，但是瓦力会自动生成此软连接，即瓦力会自动生成程序web根目录，因此只需要创建`/data/nginx`即可**

```shell
mkdir -p /data/nginx && chown www.www /data/nginx
```



**创建发布版本库并设置目录所有者为`www`**

```shell
mkdir -p /data/release && chown www.www /data/release
```



总结一下这里的流程就是

1.开发写好了`index.html`文件内容并提交到gitlab

2.瓦力从gitlab拉取`index.html`文件到本机的`/data/walle/WebServer(自定义的代码检出仓库)`

3.最后瓦力利用rsync推送代码至`/data/release/项目名/时间目录`，然后瓦力中配置的程序根目录(webroot中指定)会软链接到`/data/release/项目名/时间目录`，这样就可以访问web服务了



##### 3.2.1.4 gitlab配置

<h4>如果是初次使用gitlab的话，还需要把gitlab机器的root用户的密钥添加到gitlab的ssh-key列表中</h4>

![iShot2020-07-2017.51.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.18.45.png)





<h4>创建组</h4>

![iShot2020-07-2017.18.45](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.22.20.png)



![iShot2020-07-2017.22.20](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.51.58.png)



<h4>创建用户</h4>

![iShot2020-07-2017.23.20](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.28.23.png)



<h4>配置个人选项信息</h4>

![iShot2020-07-2017.28.23](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.29.54.png)



<h4>设置用户密码</h4>

![iShot2020-07-2017.29.54](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.23.20.png)



![iShot2020-07-2017.31.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.34.46.png)



⚠️未登陆的用户第一次登陆后需要重新设置密码，生产中我们给开发创建完用户后设置一个初始密码，然后由开发自行修改密码



<h4>将用户添加到组中</h4>

![iShot2020-07-2017.34.46](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.31.13.png)





![iShot2020-07-2018.26.03](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2018.26.03.png)



**gitlab用户在组里面有5种不同权限：**

- `Guest`：可以创建issue、发表评论，不能读写版本库 

- `Reporter`：可以克隆代码，不能提交，QA、PM 可以赋予这个权限 

- `Developer`：可以克隆代码、开发、提交、push，普通开发可以赋予这个权限 

- `Maintainer`：可以创建项目、添加tag、保护分支、添加项目成员、编辑项目，核心开发可以赋予这个权限 

- `Owner`：可以设置项目访问权限 - Visibility Level、删除项目、迁移项目、管理组成员，开发组组长可以赋予这个权限 

**⚠️新版的gitlab中的权限可能会不同**

![iShot_2024-09-02_19.25.09](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_19.25.09.png)





<h4>在用户组中创建项目</h4>

**以刚才创建的新用户身份登录到gitlab，然后在用户组中创建新的项目**

![iShot2020-07-2017.43.53](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.43.53.png)



![iShot2020-07-2017.45.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2017.45.37.png)



<h4>添加密钥，因为账号是给开发创建的，因此需要开发把本机的ssh密钥添加</h4>

![iShot2020-07-2018.40.45](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.12.51.png)





<h4>把程序运行用户www的密钥添加到gitlab的项目仓库中，瓦力机器操作</h4>

**⚠️要把瓦力机器`.ssh/id_rsa.pub`写入到`.ssh/authorized_keys`文件中，并且权限是600，否则瓦力检测会报错**

![iShot2020-07-2019.12.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2018.40.45.png)





#### 3.2.2 瓦力web页面项目具体配置及上线daemo演示

##### 3.2.2.1 这里仅仅做一个简单的更新nginx服务的index.html文件模拟上线过程

**配置项目**

![iShot2020-07-2019.28.38](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.28.38.png)



##### 3.2.2.2 配置完成后检测

![iShot2020-07-2019.29.40](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.29.40.png)



##### 3.2.2.3 创建上线单

![iShot2020-07-2019.30.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.30.18.png)



![iShot2020-07-2019.31.34](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.31.34.png)



##### 3.2.2.4 填写上线单信息

![iShot2020-07-2019.34.40](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.35.02.png)



##### 3.2.2.5 上线前提交测试代码，这一步应该是开发本机操作

**编辑测试代码，提交到WebServer仓库**

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h3>第一次测试</h3>
</body>
</html>
```



##### 3.2.2.6 开始上线

![iShot2020-07-2019.35.02](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.42.13.png)



**点击部署开始上线，如果报错根据报错内容解决**

![iShot2020-07-2019.35.38](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.35.38.png)



##### 3.2.2.7 浏览器访问  `目标web机器IP`  地址即可

![iShot2020-07-2019.42.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.34.40.png)





#### 3.2.3 web机器项目目录说明

我们在nginx配置文件中指定了root根目录是`/data/nginx/website`，但是不需要创建`website`子目录，因为瓦力会自动设置软连接，只需要创建父目录即可，nginx的root根目录会自动软连接至`/data/release/项目名/时间目录`

⚠️这里有一个问题，如果在瓦力配置界面中对于目标机器的发布版本库只指定`/data/release`的话，会默认在这个目录下面生成一个名为1的目录，虽然不影响访问，但是不太好见名知意，因此最好设置为`/data/release/项目名`

![iShot2020-07-2019.43.56](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.43.56.png)





**修改目标机器的发布版库为`/data/release/项目名`，这样的话就比较容易区分了**

![iShot2020-07-2019.59.28](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.59.28.png)



![iShot2020-07-2019.58.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2019.58.59.png)



#### 3.2.4 项目回滚操作

**有的时候升级完成后可能会出现一些问题，并不是bug上的问题，例如开发忘记打开某一个功能按钮(之前生产环境中出现过这种情况，虽然不是bug问题，但是服务功能上有影响)，这个时候可能需要做回滚操作**



:::tip

**回滚操作其实就是改变web机器上的软链接，web机器的程序根目录链接到不同的发布版本库下已实现不同的功能**

:::



##### 3.2.4.1 进行第二次上线 模拟问题

**之前已经有过第一次上线了，现在进行第二次上线，编辑代码并提交至WebServer仓库**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h3>增加一个很牛逼的功能</h3>
</body>
</html>
```



**瓦力上线**

![iShot2020-07-2020.15.25](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.15.25.png)



![iShot2020-07-2020.15.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.15.51.png)





**访问 `web机器IP` ，可以看到文件内容已更新**

![iShot2020-07-2020.16.14](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.16.14.png)



**此时web机器的目录链接情况如下**

链接的目录是`20200720-201541`，如果要回滚到上一个版本的话，链接应该会改为`20200720-195809`

![iShot2020-07-2020.17.58](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.17.58.png)





##### 3.2.4.2 发现问题，开始回滚

**找到上一次升级的上线单，可以根据上线单标题和上线cimmit号(推荐)，点击回滚**

![iShot2020-07-2020.20.13](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.20.13.png)



**开始回滚**

![iShot2020-07-2020.21.10](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.21.38.png)



**浏览器访问 `web机器IP`，可以看到已经回滚到上一次提交的内容**

![iShot2020-07-2020.21.38](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.21.10.png)



**此时web机器的目录链接情况如下**

链接的目录是`20200720-201541`，如果要回滚到上一个版本的话，链接应该会改为`20200720-195809`

![iShot2020-07-2020.24.30](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-07-2020.24.30.png)

