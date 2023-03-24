# gitlab文档

[gitlab官方文档](https://docs.gitlab.com/)

[gitlab官方文档归档地址](https://docs.gitlab.com/archives/)

[gitlab github地址](https://github.com/gitlabhq/gitlabhq)

gitlab官方提供了启动一个容器即可查看相应版本文档的方式

![iShot_2022-07-03_22.33.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_22.33.59.png)



```shell
docker run -it --rm -p 4000:4000 registry.gitlab.com/gitlab-org/gitlab-docs:14.0
```



浏览器访问 `IP:4000`

![iShot_2022-07-03_22.35.58](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2022-07-03_22.35.58.png)