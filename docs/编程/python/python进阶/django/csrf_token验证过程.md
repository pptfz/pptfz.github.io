# csrf_token验证过程

**csrf_token，跨站请求伪造保护**



```python
#写法
{% csrf_token %}

csrf_token
　　　　我们以post方式提交表单的时候，会报错，我们在settings里面的中间件配置里面把一个csrf的防御机制给注销了，本身不应该注销的，而是应该学会怎么使用它，并且不让自己的操作被forbiden，通过这个东西就能搞定。

　　　　这个标签用于跨站请求伪造保护，

　　　　在页面的form表单里面（注意是在form表单里面）任何位置写上{% csrf_token %}，这个东西模板渲染的时候替换成了<input type="hidden" name="csrfmiddlewaretoken" value="8J4z1wiUEXt0gJSN59dLMnktrXFW0hv7m4d40Mtl37D7vJZfrxLir9L3jSTDjtG8">，隐藏的，这个标签的值是个随机字符串，提交的时候，这个东西也被提交了，首先这个东西是我们后端渲染的时候给页面加上的，那么当你通过我给你的form表单提交数据的时候，你带着这个内容我就认识你，不带着，我就禁止你，因为后台我们django也存着这个东西，和你这个值相同的一个值，可以做对应验证是不是我给你的token，就像一个我们后台给这个用户的一个通行证，如果你用户没有按照我给你的这个正常的页面来post提交表单数据，或者说你没有先去请求我这个登陆页面，而是直接模拟请求来提交数据，那么我就能知道，你这个请求是非法的，反爬虫或者恶意攻击我的网站
```



**csrf_token验证过程**

![iShot_2024-08-30_17.06.20](https://github.com/pptfz/picgo-images/blob/master/img/iShot_2024-08-30_17.06.20.png)



**1.浏览器请求服务端的index.html**

**2.服务端index.html中有 `{% csrf_token %}` ，这个代码会把csrf_token渲染成一个input标签**

**3.服务端会把2中渲染的input标签的内容加入到响应数据中，cookie会加入到响应头中，格式如下**

**cookie信息``render('login').set_cookie('csrftoken','xxoo')``**

**渲染后input标签中的value值``input name='csrfmiddiewaretoken' value='xxoo'``**

**4.浏览器第二次请求就会拿到服务端返回的cookie和input标签中的value值**

**5.服务端收到浏览器请求内容后，会拿到cookie和value值，然后django会用cookie、value值的后几位通过一种算法解密前几位，如果解密后的结果一致则通过验证**
