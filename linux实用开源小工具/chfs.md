# chfs



[chfs github地址](https://github.com/ods-im/CuteHttpFileServer)

[chfs官网](http://iscute.cn/chfs)



**生产环境使用场景说明**

> **前端需要对一个网站下边的图片、html、css等文件做频繁的更换，但是又不太好做CI/CD，因为每次前端都需要提交代码然后在CI/CD工具(jenkins、gitlab)中做操作，这样既不方便又比较费时间，因此利用chfs这个工具，运维启动chfs并配置相关用户，然后让这个用户只针对于某一个或多个目录有操作权限，这样前端就能够只针对一个目录下边的文件做快速替换了**



## 1.下载包

```shell
wget http://iscute.cn/tar/chfs/2.0/chfs-linux-amd64-2.0.zip
```



## 2.解压缩、赋予执行权限

```sh
unzip chfs-linux-amd64-2.0.zip && chmod +x chfs
```



> **解压缩后就是一个没有执行权限的 `chfs` 文件**

**查看文件类型**

```shell
$ file chfs
chfs: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, stripped
```





## 3.chfs命令选项

> **执行 `./chfs --help` 查看chfs命令的选项**

```shell
$ ./chfs --help
usage: chfs [<flags>]

Flags:
  --help              Show context-sensitive help (also try --help-long and --help-man).
  --path=DIRECTORIES  Directories where store shared files, separated by '|'.
  --port=PORT         HTTP listening port(Default is 80).
  --allow=LIST        Allowed IPv4 addresses(Allow any address by default).
                      
                      White list mode: "listitem1[,listitem2,...]" e.g. "192.168.1.2-192.168.1.10,192.169.1.222" allows this 10 addresses.
                      
                      Black list mode: "not(listitem1[,listitem2,...])" e.g. "not(192.168.1.2-192.168.1.10,192.169.1.222)" bans this 10 addresses!
  --rule=LIST         Access rules(anybody can access any thing by default).
                      
                      List defines like:"USER:PWD:MASK[:DIR:MASK...][|...]":
                      
                        1,USER and PWD is account name and password
                        2,MASK:''=NO present,'r'=read,'w'=write,'d'=delete
                        3,r=view+download,w=r+upload+create+rename,d=w+delete
                        4,DIR is directory name, allows wildcard('*' & '?')
                        5,The 3rd field is access mask of shared root directory
                        6,The optional fields is pairs of sub-directory and mask
                        7,The optional sub-directory's mask overwrite parent's
                        8,You should avoid '|' ':' and white space(exclude DIR)
                      
                      For instance: "::|root:123456:rw" bans guest, and defines a account 'root' can do anything
  --log=DIRECTORY     Log directory. Empty value will disable log.
  --file=FILE         A configuration file which overwrites & enhence the settings.
  --version           Show application version.
```



**参数说明**

![iShot2021-06-22 10.58.59](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-22 10.58.59.png)





## 4.chfs使用示例

> **以下示例为官方文档中的示例，设置目录的部分是以windows为例的，在实际应用中，把windows目录替换为linux目录即可，用法相同**

```shell
# 都使用默认参数，共享目录为程序运行目录，监听端口号为80
chfs

# 共享目录为D盘，监听端口号为8080
chfs --path="d:/" --port=8080

# 共享目录为"d:\\projects"和"e:\\nsis"，监听端口号为80
chfs --path="d:\\projects|e:\\nsis"

# 白名单模式，允许192.168.1.2-192.168.1.100以及192.168.1.200进行访问
chfs --allow="192.168.1.2-192.168.1.100,192.168.1.200"

# 黑名单模式，禁止192.168.1.2-192.168.1.100以及192.168.1.200进行访问
chfs --allow="not(192.168.1.2-192.168.1.100,192.168.1.200)"

# 匿名用户具有只读权限（默认情况下匿名用户具有读写权限）
# 账户ceshizu，密码为ceshizu123，对根目录的权限为只读，但对test目录具有读写权限
# 账户yanfazu，密码为yanfazu123，对根目录的权限为只读，但对yanfa目录具有读写权限
chfs --rule="::r|ceshizu:ceshizu123:r:test:rw|yanfazu:yanfazu123:r:yanfa:rw"

# 匿名用户什么权限都没有（默认情况下匿名用户具有读写权限）
# 账户admin，密码为admin123，具有读写权限
# 账户zhangsan，密码为zhangsan123，对根目录的权限为不可读写，但对zhangsanfiles目录具有读写权限
chfs --rule="::|admin:admin123:rw|zhangsan:zhangsan123::zhangsanfiles:rw"

# 通过配置文件进行配置，该文件可以不存在，待以后需要更改配置时使用
chfs --file="d:\chfs\chfs.ini"
```



## 5.启动chfs

### 5.1 命令方式

> 匿名用户没有任何权限，nima用户具有读写删除权限

```shell
nohup ./chfs --path="/data/website/down" --port=8088 --rule="::|nima:nima:rwd" &
```



浏览器访问 `IP:端口`，需要点击 `登陆` 

![iShot2021-06-16 20.01.15](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-16 20.01.15.png)



输入用户名密码

![iShot2021-06-16 20.03.18](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-16 20.03.18.png)



登陆成功后就可以对权限目录下的文件目录操作了，绿色为 `下载` 、橘色为 `修改` 和 `重命名` 、红色为 `删除`

![iShot2021-06-16 20.06.12](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-16 20.06.12.png)





### 5.2 配置文件方式

> 官方配置文件示例，通过 `--file=文件` 选项启动

```ini
#---------------------------------------
# 请注意：
#     1，如果不存在键或对应值为空，则不影响对应的配置
#     2，配置项的值，语法如同其对应的命令行参数
#---------------------------------------


# 监听端口
port=


# 共享根目录，通过字符'|'进行分割
# 注意：
#     1，带空格的目录须用引号包住，如 path="c:\a uply name\folder"
#     2，可配置多个path，分别对应不同的目录
path=


# IP地址过滤
allow=


#----------------- 账户控制规则 -------------------
# 注意：该键值可以同时存在多个，你可以将每个用户的访问规则写成一个rule，这样比较清晰，如：
#     rule=::
#     rule=root:123456:RW
#     rule=readonlyuser:123456:R
rule=


# 用户操作日志存放目录，默认为空
# 如果赋值为空，表示禁用日志
log=


# 网页标题
html.title=


# 网页顶部的公告板。可以是文字，也可以是HTML标签，此时，需要适用一对``(反单引号，通过键盘左上角的ESC键下面的那个键输出)来包住所有HTML标签。几个例子：
#     1,html.notice=内部资料，请勿传播
#     2,html.notice=`<img src="https://mat1.gtimg.com/pingjs/ext2020/qqindex2018/dist/img/qq_logo_2x.png" width="100%"/>`
#     3,html.notice=`<div style="background:black;color:white"><p>目录说明：</p><ul>一期工程：一期工程资料目录</ul><ul>二期工程：二期工程资料目录</ul></div>`
html.notice=


# 是否启用图片预览(网页中显示图片文件的缩略图)，true表示开启，false为关闭。默认开启
image.preview=



# 下载目录策略。disable:禁用; leaf:仅限叶子目录的下载; enable或其他值:不进行限制。
# 默认值为 enable
folder.download=



#-------------- 设置生效后启用HTTPS，注意监听端口设置为443-------------
# 指定certificate文件
ssl.cert=
# 指定private key文件
ssl.key=



# 设置会话的生命周期，单位：分钟，默认为30分钟
session.timeout=
```







**编辑配置文件**

```shell
cat > chfs.ini <<EOF
# 监听端口
port=8088

# 共享根目录，通过字符'|'进行分割
path=/data/website/down

# IP地址过滤
allow=

# 账户控制规则
rule=::
rule=nima:nima:rwd

# 用户操作日志存放目录，默认为空，如果赋值为空，表示禁用日志
log=/var/log/chfs/chfs.log

# 网页标题
html.title=泡泡吐肥皂o

# 网页顶部的公告板
html.notice=泡泡吐肥皂o

# 是否启用图片预览(网页中显示图片文件的缩略图)，true表示开启，false为关闭。默认开启
image.preview=true

# 下载目录策略。disable:禁用; leaf:仅限叶子目录的下载; enable或其他值:不进行限制。默认值为 enable
folder.download=

#-------------- 设置生效后启用HTTPS，注意监听端口设置为443-------------
# 指定certificate文件
ssl.cert=
# 指定private key文件
ssl.key=

# 设置会话的生命周期，单位：分钟，默认为30分钟
session.timeout=
EOF
```



启动

```shell
nohup ./chfs --file=chfs.ini &
```





## 6.chfs开发文档

**运行chfs后，通过访问 `IP:port/asset/api.html` 查看chfs API文档**



![iShot2021-06-16 21.05.48](https://gitee.com/pptfz/picgo-images/raw/master/img/iShot2021-06-16 21.05.48.png)