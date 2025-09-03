# jdk安装



[jdk官网下载地址](https://www.oracle.com/java/technologies/javase-downloads.html)

[jdk历史版本下载地址](https://www.oracle.com/java/technologies/oracle-java-archive-downloads.html)



## 1.解压缩包

```shell
tar xf jdk-8u211-linux-x64.tar.gz -C /usr/local
```



## 2.导出环境变量

```shell
cat >>/etc/profil <<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_211
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF
```



## 3.使配置生效

```shell
source /etc/profile
```



## 4.查看版本

```shell
$ java -version
java version "1.8.0_211"
Java(TM) SE Runtime Environment (build 1.8.0_211-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.211-b12, mixed mode)
```

