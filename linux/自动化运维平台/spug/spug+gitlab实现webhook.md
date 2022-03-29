# spug+gitlab实现webhook

## 1.spug获取 `Webhook URL` 和 `Secret Token`

在 `应用管理` 下找到相应项目，然后点击 `Webhook`

![iShot2021-09-09 15.31.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 15.31.39.png)



选择分支或者tag，然后复制 `webhook URL` 和 `Secret Token`

![iShot2021-09-09 15.43.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 15.43.59.png)



## 2.gitlab配置webhook

在gitlab项目下，点击 `Settings` -> `Webhooks`

![iShot2021-09-09 15.23.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 15.23.54.png)



分别填写spug项目中的 `webhook url` 和 `sceret token`，设置触发条件

![iShot2021-09-09 15.52.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 15.52.52.png)



点击 `Add webhook` 报错 `Url is blocked: Requests to the local network are not allowed`

![iShot2021-09-09 15.58.06](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 15.58.06.png)



解决方法

`Settings` -> `network` -> `Outbound requests` -> `Expand` -> 勾选 `Allow requests to the local network from web hooks and services`

![iShot2021-09-09 16.04.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.04.59.png)



webhook配置完成后点击下方的 `Test` 按钮，然后点击 `push events`

![iShot2021-09-09 16.09.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.09.59.png)



提示如下即表示成功

![iShot2021-09-09 16.11.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.11.29.png)



## 3.验证

spug中项目配置如下，即本机提交代码至指定git仓库，则spug会自动触发构建，之后会在目标机器的 `/opt/test/test` 目录下生成一个当天日期txt文件

> 目标机器需要生成 /opt/test/release 目录，`/opt/test/test` 目录不需要生成，spug会自动生成，否则会报错

![iShot2021-09-09 16.14.53](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.14.53.png)



本机新建测试文件并提交至gitlab

在 `构建仓库` 下会看到相应的构建

![iShot2021-09-09 16.34.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.34.35.png)



在 `发布申请` 下会看到之前的构建已经成功发布

![iShot2021-09-09 16.35.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.35.56.png)

![iShot2021-09-09 16.37.00](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-09 16.37.00.png)



在服务器的 `/opt/test/test` 目录下也会生成相应文件

```shell
$ ls /opt/test/test/*.txt
/opt/test/test/2021-09-09.txt
```

