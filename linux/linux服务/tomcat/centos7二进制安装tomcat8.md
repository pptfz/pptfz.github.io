# centos7二进制安装tomcat8

[tomcat官网](https://tomcat.apache.org/)



[tomcat官方安装文档](https://tomcat.apache.org/tomcat-8.5-doc/RUNNING.txt)



# 1.下载安装包

```shell
wget https://mirrors.tuna.tsinghua.edu.cn/apache/tomcat/tomcat-8/v8.5.56/bin/apache-tomcat-8.5.56.tar.gz
```



# 2.解压缩包

```shell
tar xf apache-tomcat-8.5.56.tar.gz -C /usr/local/
```



# 3.做软连接

```shell
ln -s /usr/local/apache-tomcat-8.5.56/ /usr/local/tomcat-8.5.56
```



# 4.安装jdk

[oracle jdk官方下载地址](https://www.oracle.com/java/technologies/javase-downloads.html)



这里选择下载tar包，因为下载jdk需要登陆oracle账号，因此不能使用wget

```shell
$ ls 
jdk-8u251-linux-x64.tar.gz
```



解压缩包

```shell
tar xf jdk-8u251-linux-x64.tar.gz -C /usr/local
```



导出环境变量

```shell
#导出jdk环境变量
cat >/etc/profile.d/jdk8.sh<<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_251
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF

#使配置生效
source /etc/profile.d/jdk8.sh

#验证
$ java -version
java version "1.8.0_251"
Java(TM) SE Runtime Environment (build 1.8.0_251-b08)
Java HotSpot(TM) 64-Bit Server VM (build 25.251-b08, mixed mode)
```



# 5.使用systemd管理tomcat

## 5.1 为Tomcat添加启动参数

**catalina.sh在执行的时候会调用同级路径下的setenv.sh来设置额外的环境变量，因此在/usr/local/tomcat-8.5.56/bin路径下创建setenv.sh文件，内容如下**

```shell
cat >/usr/local/tomcat-8.5.56/bin/setenv.sh <<'EOF' 
export CATALINA_HOME=/usr/local/tomcat-8.5.56
export CATALINA_BASE=/usr/local/tomcat-8.5.56
#设置Tomcat的PID文件
CATALINA_PID="$CATALINA_BASE/tomcat.pid"
#添加JVM选项
JAVA_OPTS="-server -XX:PermSize=20M -XX:MaxPermSize=50m -Xms30M -Xmx50M -XX:MaxNewSize=20m"
EOF
```

**JVM选项说明**

> **JAVA_OPTS='-Xms【初始化内存大小】 -Xmx【可以使用的最大内存】'**



## 5.2 编写tomcat.service文件

**在/usr/lib/systemd/system路径下添加tomcat.service文件，内容如下：**

```shell
cat >/usr/lib/systemd/system/tomcat.service<<'EOF'
[Unit] 
Description=Tomcat 
After=syslog.target network.target remote-fs.target nss-lookup.target 
[Service] 
Type=oneshot 
ExecStart=/usr/local/tomcat-8.5.56/bin/startup.sh 
ExecStop=/usr/local/tomcat-8.5.56/bin/shutdown.sh 
ExecReload=/bin/kill -s HUP $MAINPID 
RemainAfterExit=yes 
[Install] 
WantedBy=multi-user.target
EOF
```

**参数说明**

> **[unit]	配置了服务的描述，规定了在network启动之后执行**
> **[service]	配置服务的pid，服务的启动，停止，重启**
> **[install]	配置了使用用户**



## 5.3 修改tomcat bin目录下的catalina.sh

**在catalina.sh文件中第2行开始添加如下内容，导出JAVA_HOME和JRE_HOME环境变量**

```shell
sed -i.bak '2cexport JAVA_HOME=/usr/local/jdk1.8.0_251\nexport JRE_HOME=/usr/local/jdk1.8.0_251/jre' /usr/local/tomcat-8.5.56/bin/catalina.sh
```



# 6.启动tomcat

```shell
systemctl daemon-reload
systemctl start tomcat && systemctl enable tomcat
```



浏览器访问8080端口

![iShot2020-06-2309.17.30](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2020-06-2309.17.30.png)

