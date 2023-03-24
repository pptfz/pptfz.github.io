# shell脚本实现企业微信告警

## 一、背景需求说明

**背景说明**

> 公司官网由4个服务模块组成，分别监听4个不同的端口，每个服务都是随机启动在5台机器中的某一台上，虽然nginx中配置了upstream但实际上还是属于单点运行(不明白为何要这么做。。。)



**需求说明**

> 5台机器分别为dn1-5，4个服务分别随机运行在其中某一台机器上，需要对端口进行存活监控



## 二、外部脚本

### 2.1 调用企业微信机器人

```shell
#!/bin/bash

wx(){
# 将下面的webhook地址替换成你的企业微信机器人地址，$1为告警消息 $2为@人的手机号 $2可以为空
cat > $0.msg << EOF
curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx-xxx-xxx-xxx' \
   -H 'Content-Type: application/json' \
   -d '
   {
        "msgtype": "text",
        "text": {
            "content": "$1",
            "mentioned_mobile_list":["$2"]
        }
   }'
EOF
sh $0.msg && rm -rf $0.msg
}
```





## 二、初级第一版 能发送告警但不能发送恢复

**监控脚本**

```sh
#!/bin/bash
#
# nc命令检测端口，存在返回0，不存在返回1
dn1=`nc -z dn1.com 8888 ; echo $?`
dn2=`nc -z dn2.com 8888 ; echo $?` 
dn3=`nc -z dn3.com 8888 ; echo $?` 
dn4=`nc -z dn4.com 8888 ; echo $?` 
dn5=`nc -z dn5.com 8888 ; echo $?`

# 加载外部脚本，内容为调用企业微信机器人
. ./qiyewx.sh

if [[ $dn1 -eq $dn2 && $dn2 -eq $dn3 && $dn3 -eq $dn4 && $dn4 -eq $dn5 && $dn5 -eq 1 ]];then
    # 调用户外部脚本，实现企业微信告警
    wx "集群数据接口8888异常"
fi
```



## 三、初级第二版 能发送告警也能发送恢复

```shell
#!/bin/bash
#
# nc命令检测端口，存在返回0，不存在返回1
dn1=`nc -z dn1.com 8888 ; echo $?`
dn2=`nc -z dn2.com 8888 ; echo $?` 
dn3=`nc -z dn3.com 8888 ; echo $?` 
dn4=`nc -z dn4.com 8888 ; echo $?` 
dn5=`nc -z dn5.com 8888 ; echo $?`
ALARM_FILE=alarm_txt

# 加载外部脚本，内容为调用企业微信机器人
. ./qiyewx.sh

# 如果5个返回值都相等并且都为1，则说明服务挂了
if [[ $dn1 -eq $dn2 && $dn2 -eq $dn3 && $dn3 -eq $dn4 && $dn4 -eq $dn5 && $dn5 -eq 1 ]];then
    wx "集群数据接口8888异常"
    
    # 当服务挂掉的时候向一个文件中写入一行内容
    echo '集群数据接口18891异常' > $ALARM_FILE

# 判断文件内容行数是否为1，如果为1，则说明是服务挂掉过，如果为空则说明告警恢复已发过了
elif [[ `wc -l $ALARM_FILE|awk '{print $1}'` -eq 1 ]];then
    wx "集群数据接口8888异常已恢复"
    
    # 当服务恢复的时候告警并清空文件内容，这样就只发送一次告警恢复
    > $ALARM_FILE
fi
```

