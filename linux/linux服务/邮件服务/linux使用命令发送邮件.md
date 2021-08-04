[toc]

# linux使用命令发送邮件

## 1.编辑 `/etc/mail.rc` ，加入以下内容

```shell
set from=123456@qq.com
set smtp=smtp.qq.com  
set smtp-auth-user=xiaoming
set smtp-auth-password=123456
set smtp-auth=login  
```



常用smtp

| smtp地址           | 说明             |
| ------------------ | ---------------- |
| smtp.exmail.qq.com | 腾讯企业邮箱smtp |
| smtp.qq.com        | qq邮箱smtp       |
| smtp.163.com       | 163邮箱smtp      |



## 2.发送邮件

### 2.1 普通发送

```shell
echo  hello word | mail -s "title" 123456@qq.com  
```

或者

```shell
mail -s "title" 123456@qq.com < file
```



### 2.2 发送html格式的邮件

```shell
mail -s "$(echo -e "标题 \nContent-Type: text/html; charset=utf-8")" 123456@qq.com < index.html
```





### 2.3 发送附件

> mail命令 -a 选项为发送附件，只能发送一个附件

```shell
echo test | mail -s test -a pkg.zip 1234562qq.com
```



使用命令 `postconf message_size_limit` 查看当前信息大小限制

```shell
$ postconf message_size_limit
message_size_limit = 10240000
```



使用命令 `postconf -e message_size_limit=` 设置大小限制值

```
postconf -e message_size_limit=20480000
```

