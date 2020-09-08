# docker安装jenkins

**docker jenkins 中国定制版说明**

> **jenkins安装插件的时候由于源在国外，因此安装会非常慢甚至失败，当然也有国内源可以使用，但是需要自行修改文件，[jenkins中文社区](http://jenkins-zh.cn/)推出了中国定制版的jenkins docker镜像，只需要下载相应的docker镜像并启动容器即可，不需要做任何修改操作，并且安装后jenkins插件下载速度有明显的提升**





[docker jenkins中国定制版 dockerhub地址](https://hub.docker.com/r/jenkinszh/jenkins-zh)

[docker jenkins中国定制版 github地址](https://github.com/jenkins-zh/jenkins-formulas)

[jenkins中文社区维护的中文简体插件](https://github.com/jenkinsci/localization-zh-cn-plugin)

[jenkins插件下载地址](http://updates.jenkins-ci.org/download/plugins/)

---



**直接使用jenkins中国定制版镜像启动容器**

```sh
docker run \
  -u root \
  -d \
  -h jenkins \
  --name jenkins \
  -p 8081:8080 \
  -p 50000:50000 \
  -v /usr/local/jenkins:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkinszh/jenkins-zh:2.239
```

