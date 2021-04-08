[toc]



# nginx日志

# 一、nginx日志默认格式

**nginx1.16.1`nginx.conf`文件中http模块nginx日志格式默认配置如下**

```nginx
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
```



**nginx日志格式内部变量及函数参数说明**

| **变量**                    | **说明**                                                     |
| --------------------------- | ------------------------------------------------------------ |
| **$remote_addr**            | **记录客户端IP地址**                                         |
| **$server_name**            | **虚拟主机名称**                                             |
| **$http_x_forwarded_for**   | **HTTP的请求端真实的IP**                                     |
| **$remote_user**            | **记录客户端用户名称**                                       |
| **$request**                | **记录请求的URL和HTTP协议**                                  |
| **$status**                 | **记录返回HTTP请求的状态**                                   |
| **$uptream_status**         | **upstream的状态**                                           |
| **$ssl_protocol**           | **SSL协议版本**                                              |
| **$body_bytes_sent**        | **发送给客户端的字节数，不包括响应头的大小**                 |
| **$bytes_sent**             | **发送给客户端的总字节数**                                   |
| **$connection_requests**    | **当前通过一个连接获得的请求数量**                           |
| **$http_referer**           | **记录从哪个页面链接访问过来的**                             |
| **$http_user_agent**        | **记录客户端浏览器相关信息**                                 |
| **$request_length**         | **请求的长度，包括请求行，请求头和请求正文**                 |
| **$msec**                   | **日志写入时间**                                             |
| **$request_time**           | **请求处理时间，单位为秒，精度毫秒，Nginx接受用户请求的第一个字节到发送完响应数据的时间，包括：接收请求数据时间、程序响应时间、输出、响应数据时间。** |
| **$upstream_response_time** | **应用程序响应时间，Nginx向后端服务建立连接开始到接受完数据然后关闭连接为止的总时间。** |



**access.log访问示例**

```nginx
177.188.199.220 - - [15/Jul/2020:11:01:56 +0800] "GET / HTTP/1.1" 200 4833 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" "-"
```





# 二、nginx常见统计

通过nginx日志，可以简单分析WEB网站的运行状态、数据报表、IP、UV（unique visitor）、PV（page view）访问量等需求，如下为常用需求分析



## 2.1 统计nginx服务器独立IP数

```shell
awk '{print $1}' access.log |sort -r|uniq -c | wc -l
```



## 2.2 统计Nginx服务器总PV量

```shell
awk '{print $7}' access.log |wc -l
```



## 2.3 统计Nginx访问日志截止目前为止访问量前20的IP列表

```sh
awk  '{print  $1}'  access.log|sort |uniq -c |sort -nr |head -20
或
awk '{a[$1]++}END{for(i in a) print a[i],i}' access.log|sort -nr|head -20
```



## 2.4 统计Nginx访问日志6点至12点的总请求量

sed和awk开始和结束时间必须存在，否则统计不准确

```shell
#不指定日期
sed -n "/2020:06:01/,/2020:11:45/"p access.log|wc -l

#指定日期
sed -n "/14\/Jul\/2020:06:01/,/14\/Jul\/2020:11:45/"p access.log|wc -l
```



```shell
#不指定日期
awk  '/2020:06:01/,/2020:11:45/' access.log|wc -l

#指定日期
awk  '/14\/Jul\/2020:06:01/,/14\/Jul\/2020:11:45/' access.log|wc -l
```



## 2.5 统计Nginx访问日志状态码404、502、503、500、499等错误信息页面，打印错误出现次数大于20的IP地址

```shell
awk '{if ($9~/502|499|500|503|404/) print $1,$9}' access.log | sort |uniq -c | sort -nr | awk '{if($1>20) print $2}'
```





## 2.6 统计Nginx访问日志访问最多的页面

```shell
awk '{print $7}' access.log |sort |uniq -c|sort -nr|head -20
```



## 2.7 分析Nginx访问日志请求处理时间大于5秒的URL，并打印出时间、URL、访客IP

```shell
awk '{if ($NF>5)  print $NF,$7,$1}' access.log|sort -nr|more
```





# 三、nginx日志切割

Nginx WEB服务器每天会产生大量的访问日志，而且不会自动地进行切割，如果持续天数访问，将会导致该access.log日志文件容量非常大，不便于查看相关的网站异常日志。

可以基于Shell 脚本结合Crontab计划任务对Nginx日志进行自动、快速的切割，其切割的方法使用mv命令即可



**nginx日志切割脚本，保留7天的日志**

```shell
#!/usr/bin/env bash
LOG_PATH=/var/log/nginx
TIME=`date -d "yesterday" "+%Y-%m-%d"`
for i in `ls $LOG_PATH/*.log`
do
   mv $i $i.$TIME
   gzip -9 $i.$TIME
done

/usr/sbin/nginx -s reopen
find $LOG_PATH -mtime +7 -name "*.log.*" |xargs rm -rf
```



**计划任务，每天凌晨0点执行脚本**

```shell
0  0  *  *  *  /bin/sh  /scripts/cut_nginx_log.sh &>/dev/null
```









