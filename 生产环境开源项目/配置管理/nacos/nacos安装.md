# nacos安装

[nacos官网](https://nacos.io/zh-cn)

[nacos github地址](https://github.com/alibaba/nacos)

[nacos三种部署模式官方说明文档](https://nacos.io/zh-cn/docs/deployment.html)

[nacos集群部署官方文档](https://nacos.io/zh-cn/docs/cluster-mode-quick-start.html)





# 一、单机模式

## 1.1 下载编译后压缩包

```shell
# 下载包
wget https://github.com/alibaba/nacos/releases/download/1.4.2/nacos-server-1.4.2.tar.gz

# 解压缩至/usr/local
tar xf nacos-server-1.4.2.tar.gz -C /usr/local
```



## 1.2 启动服务

```shell
sh bin/startup.sh -m standalone
```





# 二、集群部署

**集群部署架构图**

开源的时候推荐用户把所有服务列表放到一个vip下面，然后挂到一个域名下面

[http://ip1](http://ip1/):port/openAPI 直连ip模式，机器挂则需要修改ip才可以使用。

[http://SLB](http://slb/):port/openAPI 挂载SLB模式(内网SLB，不可暴露到公网，以免带来安全风险)，直连SLB即可，下面挂server真实ip，可读性不好。

[http://nacos.com](http://nacos.com/):port/openAPI 域名 + SLB模式(内网SLB，不可暴露到公网，以免带来安全风险)，可读性好，而且换ip方便，推荐模式



![iShot2021-05-25 20.00.37](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-05-25 20.00.37.png)



## 2.0 实验环境



| **主机名**  | **IP**        | **配置** | **系统**      | **内核**                   |
| ----------- | ------------- | -------- | ------------- | -------------------------- |
| **nacos01** | **10.0.0.33** | **2c4g** | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |
| **nacos02** | **10.0.0.34** | **2c4g** | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |
| **nacos03** | **10.0.0.35** | **2c4g** | **CentOS7.9** | **3.10.0-1160.el7.x86_64** |



## 2.1 环境准备

请确保是在环境中安装使用:

1. 64 bit OS Linux/Unix/Mac，推荐使用Linux系统。
2. 64 bit JDK 1.8+；[下载](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).[配置](https://docs.oracle.com/cd/E19182-01/820-7851/inst_cli_jdk_javahome_t/)。
3. Maven 3.2.x+；[下载](https://maven.apache.org/download.cgi).[配置](https://maven.apache.org/settings.html)。
4. 3个或3个以上Nacos节点才能构成集群。



### 2.1.1 安装jdk1.8+

[jdk官网下载地址](https://www.oracle.com/java/technologies/javase-downloads.html)

[jdk历史版本下载地址](https://www.oracle.com/java/technologies/oracle-java-archive-downloads.html)



下载jdk1.8二进制包并解压缩至 `/usr/local`

```sh
# 安装jdk1.8.0_211
cat >/etc/profile.d/jdk8.sh<<'EOF'
export JAVA_HOME=/usr/local/jdk1.8.0_211
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre:$JAVA_HOME/lib:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME PATH CLASSPATH
```



### 2.1.2 安装maven3.2.x+

[maven官网下载地址](https://maven.apache.org/download.cgi)

[maven3.x版本官方下载地址](https://archive.apache.org/dist/maven/maven-3/)

[maven历史版本官方下载地址](https://archive.apache.org/dist/maven/binaries/)

**⚠️<span style=color:red>只有采用从github下载源码包自行编译的方式才需要安装maven</span>**

**⚠️<span style=color:red>maven版本需要3.2.5以上，否则后续有坑</span>**

![iShot2021-05-27 10.35.39](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-05-27 10.35.39.png)



下载maven3.2.5

```shell
wget https://archive.apache.org/dist/maven/maven-3/3.2.5/binaries/apache-maven-3.2.5-bin.tar.gz
```



解压缩至 `/usr/local` 并修改名称

```shell
tar xf apache-maven-3.2.5-bin.tar.gz -C /usr/local/ && mv /usr/local/apache-maven-3.2.5/ /usr/local/maven-3.2.5
```



配置maven仓库为阿里云仓库，编辑 `conf/settings.xml` 文件，找到 `mirrors` 标签并加入以下内容 

```xml
<mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf>       
</mirror>
```



导出环境变量

```shell
echo 'export PATH=$PATH:/usr/local/maven-3.2.5/bin' > /etc/profile.d/maven.sh & source /etc/profile
```



验证

```shell
$  mvn -v
Apache Maven 3.2.5 (12a6b3acb947671f09b81f49094c53f426d8cea1; 2014-12-15T01:29:23+08:00)
Maven home: /usr/local/maven-3.2.5
Java version: 1.8.0_162, vendor: Oracle Corporation
Java home: /usr/local/jdk1.8.0_162/jre
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "3.10.0-1160.el7.x86_64", arch: "amd64", family: "unix"
```



## 2.2 下载安装包

## 2.2.1 从github上下载源码方式



```shell
# 下载包
wget https://github.com/alibaba/nacos/archive/refs/tags/1.4.2.tar.gz

# 解压缩至/usr/local
tar xf nacos-1.4.2.tar.gz -C /usr/local

# 进入目录编译安装
cd /usr/local/nacos-1.4.2
mvn -Prelease-nacos clean install -U


```



编译从未成功过，各种报错，直接放弃！

![iShot2021-05-27 11.25.51](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-05-27 11.25.51.png)





### 2.2.2 下载编译后压缩包

```shell
# 下载包
wget https://github.com/alibaba/nacos/releases/download/1.4.2/nacos-server-1.4.2.tar.gz

# 解压缩至/usr/local
tar xf nacos-server-1.4.2.tar.gz -C /usr/local
```



## 2.3 配置集群配置文件

在nacos的解压目录 `conf` 下，编辑配置文件 `cluster.conf` ，请每行配置成 `ip:port` （请配置3个或3个以上节点）

**⚠️<span style=color:red>nacos集群模式必须指定IP，不支持域名，否则会报错！</span>**

```shell
cat > cluster.conf << EOF
# ip:port
10.0.0.33:8848
10.0.0.34:8848
10.0.0.35:8848
EOF
```





## 2.4 确定数据源

### 2.4.1 使用内置数据源

**<span style=color:red>使用内置数据源无需进行任何配置</span>**



### 2.4.2 使用外置数据源

这里提前安装好了mysql5.6，官方要求数据库版本 5.6.5+



导入sql，在nacos解压目录下有 `conf/nacos-mysql.sql` 

```shell
# 创建数据库
mysql -uroot -e "CREATE DATABASE nacos_config DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci"

# 创建用户并授权
mysql -uroot -e "grant all on nacos_config.* to 'nacos'@'%' identified by 'nacos'"
mysql -uroot -e "flush privileges"

# 导入sql
mysql -uroot -D nacos_config < nacos-mysql.sql
```



### 2.4.3 配置 `application.properties`

需要修改的项

```shell
# nacos监听的端口
server.port=8848

# 如果使用外置数据源mysql，需要打开以下注释
spring.datasource.platform=mysql

# mysql的相关配置，官方文档中的db.url.0一行有坑，必须写以下格式的
db.num=1
db.url.0=jdbc:mysql://10.0.0.33:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user.0=nacos
db.password.0=nacos
```





## 2.5 启动服务

**集群模式**

> 使用内置数据源

```shell
sh bin/startup.sh -p embedded
```



> 使用外置数据源

```shell
sh bin/startup.sh
```





## 2.6 访问管理后台

浏览器访问 `IP:端口/nacos`

默认用户名密码都是 `nacos`

![iShot2021-05-26 19.54.35](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-05-26 19.54.35.png)



登陆后首页面

![iShot2021-05-26 19.56.52](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-05-26 19.56.52.png)





