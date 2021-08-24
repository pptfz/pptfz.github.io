# linux使用mailx配置企业邮箱smtps 465端口发送邮件







```shell
mkdir -p /etc/mail/.certs
echo -n | openssl s_client -connect smtp.exmail.qq.com:465 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/mail/.certs/qq.crt
certutil -A -n "GeoTrust SSL CA" -t "C,," -d /etc/mail/.certs -i /etc/mail/.certs/qq.crt
certutil -A -n "GeoTrust Global CA" -t "C,," -d /etc/mail/.certs -i /etc/mail/.certs/qq.crt
certutil -L -d /etc/mail/.certs/
cd /etc/mail/.certs/ && certutil -A -n "GeoTrust SSL CA – G3" -t "Pu,Pu,Pu" -d ./ -i qq.crt
```









```
cp /etc/mail.rc{,.bak}
cat >> /etc/mail.rc <<EOF
# 发件人
set from=opit@qike366.cn　

# 设置smtps服务器
set smtp=smtps://smtp.exmail.qq.com:465　

# 企业邮箱
set smtp-auth-user=opit@qike366.cn　

# 企业邮箱密码
set smtp-auth-password=0b*Ymsk!H1^aft1Qx955　　　　  

# 证书所在目录
set nss-config-dir=/etc/mail/.certs 

set smtp-auth=login
set ssl-verify=ignore
EOF
```





```
mailx -s "测试标题" aa@aliyun.com < 1.txt #单个收件人

mailx -s test pptfzo@163.com < 1.txt




mailx  -s "hello"  ***@qq.com

```







```
# 企业邮箱
set from=xxxxx@xxx.com　　

# 设置smtps服务器
set smtp=smtps://smtp.exmail.qq.com:465　

# 企业邮箱
set smtp-auth-user=xxxxx@xxx.com　

# 企业邮箱密码
set smtp-auth-password=xxxxx　　　　　　  

# 证书所在目录
set nss-config-dir=/etc/mail/.certs 

set smtp-auth=login
set ssl-verify=ignore
```

