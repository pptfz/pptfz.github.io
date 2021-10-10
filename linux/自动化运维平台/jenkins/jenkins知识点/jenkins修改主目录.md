# jenkins修改主目录

# 1.rpm包安装

rpm包安装的jenkins默认主目录是 `/var/lib/jenkins`

安装后的默认目录结构

```shell
$ rpm -ql jenkinsls
/etc/init.d/jenkins
/etc/logrotate.d/jenkins
/etc/sysconfig/jenkins
/usr/lib/jenkins
/usr/lib/jenkins/jenkins.war
/usr/sbin/rcjenkins
/var/cache/jenkins
/var/lib/jenkins
/var/log/jenkins
```



修改配置文件`/etc/sysconfig/jenkins`

```shell
修改
	JENKINS_HOME="/var/lib/jenkins"

修改为
	JENKINS_HOME="xxx"
```



修改完成后重启jenkins即可



# 2.war包安装