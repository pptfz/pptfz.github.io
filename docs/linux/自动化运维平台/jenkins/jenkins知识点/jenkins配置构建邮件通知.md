[toc]

# jenkins配置构建邮件通知

[本文严重抄袭于互联网](https://www.cnblogs.com/imyalost/p/8781759.html)



## 1.安装邮件插件 `Email Extension Plugin`

![iShot2021-09-05 11.52.26](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2011.52.26.png)







## 2.配置管理员邮件地址

`Manage Jenkins` -> `Jenkins Location` -> `System Admin e-mail address`

![iShot2021-09-05 12.02.12](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2012.02.12.png)





## 3.配置发件人信息

`Manage Jenkins` -> `Extended E-mail Notification`

:::tip

**SMTP Password 处填写的是邮箱授权码**

:::

![iShot2021-09-05 16.43.44](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.43.44.png)





## 4.配置邮件内容模板

`Default Content` 默认内容

```shell
$PROJECT_NAME - Build # $BUILD_NUMBER - $BUILD_STATUS:

Check console output at $BUILD_URL to view the results.
```





![iShot2021-09-05 16.15.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.15.50.png)



邮件内容模板

```html
<!DOCTYPE html>    
<html>    
<head>    
<meta charset="UTF-8">    
<title>${ENV, var="JOB_NAME"}-第${BUILD_NUMBER}次构建日志</title>    
</head>    
    
<body leftmargin="8" marginwidth="0" topmargin="8" marginheight="4"    
    offset="0">    
    <table width="95%" cellpadding="0" cellspacing="0"  style="font-size: 11pt; font-family: Tahoma, Arial, Helvetica, sans-serif">    
        <tr>    
            本邮件由系统自动发出，无需回复！<br/>            
            各位同事，大家好，以下为${PROJECT_NAME }项目构建信息</br> 
            <td><font color="#CC0000">构建结果 - ${BUILD_STATUS}</font></td>   
        </tr>    
        <tr>    
            <td><br />    
            <b><font color="#0B610B">构建信息</font></b>    
            <hr size="2" width="100%" align="center" /></td>    
        </tr>    
        <tr>    
            <td>    
                <ul>    
                    <li>项目名称 ： ${PROJECT_NAME}</li>    
                    <li>构建编号 ： 第${BUILD_NUMBER}次构建</li>    
                    <li>触发原因： ${CAUSE}</li>    
                    <li>构建状态： ${BUILD_STATUS}</li>    
                    <li>构建日志： <a href="${BUILD_URL}console">${BUILD_URL}console</a></li>    
                    <li>构建  Url ： <a href="${BUILD_URL}">${BUILD_URL}</a></li>    
                    <li>工作目录 ： <a href="${PROJECT_URL}ws">${PROJECT_URL}ws</a></li>    
                    <li>项目  Url ： <a href="${PROJECT_URL}">${PROJECT_URL}</a></li>    
                </ul>    

<h4><font color="#0B610B">失败用例</font></h4>
<hr size="2" width="100%" />
$FAILED_TESTS<br/>

<h4><font color="#0B610B">最近提交(#$SVN_REVISION)</font></h4>
<hr size="2" width="100%" />
<ul>
${CHANGES_SINCE_LAST_SUCCESS, reverse=true, format="%c", changesFormat="<li>%d [%a] %m</li>"}
</ul>
详细提交: <a href="${PROJECT_URL}changes">${PROJECT_URL}changes</a><br/>

            </td>    
        </tr>    
    </table>    
</body>    
</html>
```



## 5.配置邮件触发机制

在 `Default Triggers` 处配置触发机制



![iShot2021-09-05 16.49.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.49.10.png)





## 6.配置项目发送邮件

在项目下 `Post-build Actions` -> `Editable Email Notification`

![iShot2021-09-05 16.21.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.21.13.png)





相关信息配置

![iShot2021-09-05 16.34.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.34.40.png)





配置触发

`Post-build Actions` -> `Advanced settings`

![iShot2021-09-05 16.56.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2016.56.51.png)





默认只有 `Failuer - Any` ，点击 `Add` 增加 `Success` ，既构建失败和成功后发送邮件通知

![iShot2021-09-05 17.03.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2017.03.11.png)





选择发送至 `Recipient List` 是全局配置，如果想针对单个项目发送指定的邮箱则需要去掉 `Recipient List` 选项，在下方的 `Recipient List` 中单独进行配置，单独配置适用场景为针对某个项目只给相关开发发送邮件，而全局配置 `Recipient List` 配置运维组邮箱，这样就可以运维接受所有构建邮件，而开发只需要接受自己组的项目的邮件

![iShot2021-09-05 17.32.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2017.32.51.png)







## 7.构建项目测试

构建项目，可以看到最后会有 `Email was triggered for: Success`

![iShot2021-09-05 17.19.37](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2017.19.37.png)





收到的邮件

![iShot2021-09-05 17.16.10](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2021-09-05%2017.16.10.png)



