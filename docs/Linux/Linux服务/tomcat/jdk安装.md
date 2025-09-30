# jdk安装

## oracle jdk

[oracl jdk官网下载地址](https://www.oracle.com/java/technologies/javase-downloads.html)

[oracl jdk历史版本下载地址](https://www.oracle.com/java/technologies/oracle-java-archive-downloads.html)



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="jdk8" label="jdk8" default>

解压缩包

```shell
tar xf jdk-8u451-linux-aarch64.tar.gz -C /usr/local
```



导出环境变量

```shell
cat >> /etc/profile.d/jdk8.sh << 'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_451
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF
```



使配置生效

```shell
source /etc/profile
```



查看版本

```shell
$ java -version
java version "1.8.0_451"
Java(TM) SE Runtime Environment (build 1.8.0_451-b10)
Java HotSpot(TM) 64-Bit Server VM (build 25.451-b10, mixed mode)
```

  </TabItem>
  <TabItem value="jdk25" label="jdk25">

解压缩包

```shell
tar xf jdk-25_linux-aarch64_bin.tar.gz -C /usr/local
```



导出环境变量

```shell
cat >> /etc/profile.d/jdk25.sh << 'EOF'
export JAVA_HOME=/usr/local/jdk-25
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF
```



使配置生效

```shell
source /etc/profile
```



查看版本

```shell
$ java -version
java version "25" 2025-09-16 LTS
Java(TM) SE Runtime Environment (build 25+37-LTS-3491)
Java HotSpot(TM) 64-Bit Server VM (build 25+37-LTS-3491, mixed mode, sharing)
```

  </TabItem>
</Tabs>



## openjdk

[openjdk官网](https://openjdk.org/)

[openjdk官方安装文档](https://openjdk.org/install/)

[openjdk历史版本下载地址](https://jdk.java.net/archive/)



解压缩包

```shell
tar xf openjdk-25_linux-aarch64_bin.tar.gz -C /usr/local/
```



导出环境变量

```shell
cat >> /etc/profile.d/jdk25.sh << 'EOF'
export JAVA_HOME=/usr/local/jdk-25
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
EOF
```



使配置生效

```shell
source /etc/profile
```



查看版本

```shell
$ java -version
openjdk version "25" 2025-09-16
OpenJDK Runtime Environment (build 25+36-3489)
OpenJDK 64-Bit Server VM (build 25+36-3489, mixed mode, sharing)
```

