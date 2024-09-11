# kibana报错

## 报错1：`Unable to navigate to space \"default\", redirecting to Space Selector. Error: Saved object [space/default] not found`



kibana是通过从 [artifacthub](https://artifacthub.io/)  中下载的chart安装的，运行一段时间后开发反馈说kibana挂了，于是登录机器执行命令 `kubectl get pod` 看到 `READY` 为 `0/1` ，查看日志报错如下

![iShot_2022-06-13_17.05.13](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-06-13_17.05.13.png)

```json
{"type":"log","@timestamp":"2022-06-13T08:40:09Z","tags":["spaces","error"],"pid":1,"message":"Unable to navigate to space \"default\", redirecting to Space Selector. Error: Saved object [space/default] not found"}
{"type":"response","@timestamp":"2022-06-13T08:40:09Z","tags":[],"pid":1,"method":"get","statusCode":302,"req":{"url":"/app/kibana","method":"get","headers":{"user-agent":"curl/7.29.0","host":"localhost:5601","accept":"*/*"},"remoteAddress":"127.0.0.1","userAgent":"127.0.0.1"},"res":{"statusCode":302,"responseTime":1,"contentLength":9},"message":"GET /app/kibana 302 1ms - 9.0B"}
```



暂时的结局方式是删除pod后重启，然后就可以了，但是运行一段时间后kibana又会自动挂掉

谷歌 `Unable to navigate to space \"default\", redirecting to Space Selector. Error: Saved object [space/default] not found` 找到一些链接有人也遇到过同样的问题

在github这个isseu中可以看到 https://github.com/elastic/kibana/issues/35213

![iShot_2022-06-15_18.54.14](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-06-15_18.54.14.png)



在es的官方论坛中有人提到过解决方法 https://discuss.elastic.co/t/unable-to-navigate-to-space-default-redirecting-to-space-selector-error-saved-object-space-default-not-found/177393/3

![iShot_2022-06-15_18.55.32](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2022-06-15_18.55.32.png)





官方给到的解释是当存储空间很低时，kibana会把 `.kibana` 索引设置为只读，从而导致日志中的只读报错，可以通过如下命令解决此问题



在这个链接中可以看到解决方法[](https://discuss.elastic.co/t/forbidden-12-index-read-only-allow-delete-api/110282/2?u=larry_gregory)



```json
PUT _settings
  {
  "index": {
  "blocks": {
  "read_only_allow_delete": "false"
  }
  }
  }
```



```json
PUT your_index_name/_settings
  {
  "index": {
  "blocks": {
  "read_only_allow_delete": "false"
  }
  }
  }
```



