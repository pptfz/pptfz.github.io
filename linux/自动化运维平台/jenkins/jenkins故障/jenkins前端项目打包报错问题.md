# jenkins前端项目打包报错问题



# 问题描述

项目相同的配置，并没有做任何改动，同一天时间，上午还没有问题，到了晚上打包就报错了

打包命令如下

```shell
yarn install
yarn build:prod
```

![iShot2021-12-31 19.46.01](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-12-31 19.46.01.png)



报错信息如下，前端说是因为部分依赖包没有安装成功![iShot2021-12-31 19.55.17](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-12-31 19.55.17.png)



# 排查步骤

以root用户在jenkins服务器上手动拉取代码打包，没有问题，以jenkins运行用户(有sudo权限)在jenkins服务器上手动拉取代码打包，也没有问题，这样就排除了权限问题，因为之前也出现过因为权限问题而导致打包失败的情况



# 解决方式

架构师给了个解决思路，即把项目目录清除后再打包，然后我们尝试执行后问题解决

在项目中构建环境下勾选 `Delete workspace before build starts` 这样就会在项目构建前把项目目录删除后再构建

![iShot2021-12-31 20.02.31](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-12-31 20.02.31.png)