# linux配置企业邮箱smtps 465端口发送邮件

[参考链接](https://blog.csdn.net/u010452388/article/details/100052020?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-0.pc_relevant_paycolumn_v2&spm=1001.2101.3001.4242.1&utm_relevant_index=3)

## 1.生成证书

```shell
mkdir -p /etc/mail/.certs
echo -n | openssl s_client -connect smtp.exmail.qq.com:465 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/mail/.certs/qq.crt
certutil -A -n "GeoTrust SSL CA" -t "C,," -d /etc/mail/.certs -i /etc/mail/.certs/qq.crt
certutil -A -n "GeoTrust Global CA" -t "C,," -d /etc/mail/.certs -i /etc/mail/.certs/qq.crt
certutil -L -d /etc/mail/.certs/
cd /etc/mail/.certs/ && certutil -A -n "GeoTrust SSL CA – G3" -t "Pu,Pu,Pu" -d ./ -i qq.crt
```



最后会提示如下

```shell
Notice: Trust flag u is set automatically if the private key is present.
```





## 2.编辑 `/etc/mail.rc `

```shell
cp /etc/mail.rc{,.bak}
cat >> /etc/mail.rc <<EOF
# 发件人
set from=xxx

# 设置smtps服务器
set smtp=smtps://smtp.exmail.qq.com:465　

# 企业邮箱
set smtp-auth-user=xxx

# 企业邮箱密码
set smtp-auth-password=xxx　　　　  

# 证书所在目录
set nss-config-dir=/etc/mail/.certs 

set smtp-auth=login
set ssl-verify=ignore
EOF
```



## 3.验证

```shell
echo message | mail -s " title" xxx@163.com
```





