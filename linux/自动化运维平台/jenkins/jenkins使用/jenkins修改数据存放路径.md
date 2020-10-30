# jenkins修改数据存放路径



jenkins数据存放路径默认是 `/root/.jenkins`





## war包安装

如果是用tomcat做容器的话，则在./bin/catalina.sh文件添加以下语句即可：
export JENKINS_HOME="存放路径"



tomcat安装路径为 `/data/app/tomcat7`

jenkins war包路径为 `/data/app/tomcat7/webapps/jenkins.war`

修改文件 `/data/app/tomcat7/bin/catalina.sh` ，找到 `export JENKINS_HOME=`，指定路径即可





## rpm包安装

jenkins默认安装路径是 `/var/lib/jenkins`

修改配置文件 `/etc/sysconfig/jenkins` ，找到 `JENKINS_HOME="/var/lib/jenkins"`，重新指定路径即可





## docker安装

docker安装jenkins的目录为 `/var/jenkins_home`，这里要看你指定的挂载卷路径，从挂载卷的路径中找到

```shell
docker run -p 8080:8080 -p 50000:50000 -v /your/home:/var/jenkins_home jenkins
```













