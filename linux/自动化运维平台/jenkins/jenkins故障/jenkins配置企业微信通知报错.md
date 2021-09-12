# jenkins配置企业微信通知报错



> jenkins版本：2.303
>
> jenkins安装方式：rpm包
>
> 系统jdk版本：oracle jdk1.8.0_261
>
> 企业微信插件 `Qy Wechat Notification Plugin` 版本：1.0.2



构建通知报错 `通知异常javax.net.ssl.SSLHandshakeException: No appropriate protocol (protocol is disabled or cipher suites are inappropriate)`

![iShot2021-09-10 17.21.09](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-10 17.21.09.png)



[参考网上文章](https://blog.csdn.net/weixin_38111957/article/details/80577688)修改 `java.security` 文件，修改安装的jdk1.8的文件后重启jenkins不生效，查看jenkins系统信息才发现使用的是openjdk，原因未知，于是修改openjdk的 `java.security` ，重启jenkins

在 `Manage Jenkins` -> `System Properties` 下查看系统使用的jdk信息，不知为何使用的是openjdk

![iShot2021-09-10 17.22.21](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-09-10 17.22.21.png)



查找当前系统的 `java.security` 文件，发现有2个，一个是jdk的，另外一个是openjdk的

```shell
$ find / -name "java.security"
/usr/local/jdk1.8.0_261/jre/lib/security/java.security
/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.302.b08-0.el7_9.x86_64/jre/lib/security/java.security
```



修改 `/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.302.b08-0.el7_9.x86_64/jre/lib/security/java.security` 以下内容

```shell
jdk.tls.disabledAlgorithms=SSLv3, TLSv1, TLSv1.1, RC4, DES, MD5withRSA, \
    DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL, \
    include jdk.disabled.namedCurves
```

修改为

```shell
jdk.tls.disabledAlgorithms=RC4, DES, MD5withRSA, \
    DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL, \
    include jdk.disabled.namedCurves
```



修改完成后重启jenkins再构建就会成功收到企业微信通知了

问题的原因为jenkins系统使用了openjdk1.8，按照网上的文章修改 `java.security` 文件重启jenkins生效，但是不知为何jenkins使用的是openjdk，自己的jenkins和公司的jenkins都是自己装的，并且安装方式都是rpm包

