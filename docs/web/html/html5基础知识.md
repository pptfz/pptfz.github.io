[toc]



# 前端基础

## 1.基础结构

```html
<!DOCTYPE html>     						<!--文档声明，表明这是一个html-->
<html lang="en">    						<!--语言，en为英文-->
<head>              						<!--头部标签，网站配置信息-->
    <meta charset="UTF-8">  		<!--解码方式-->
    <title>泡泡吐肥皂o</title>		 <!--网站标题-->
</head>
<body>  												<!--网站显示内容-->
    <h1>一级标题</h1>
    <div>普通文字</div>
</body>
</html>

```



![iShot_2024-09-02_11.35.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_11.35.11.png)







### 1.1 标签写法分类

```html
全封闭标签		 <h1 xx='ss'>xxx</h1>  
		标签属性			<h1 xx='ss'>xxx</h1>    xx:属性名  ss:属性值
自封闭标签    <meta charset="UTF-8">
```



### 1.2 标签分类

**块标签(行外标签):独占一行显示**

	- **h1-h6(标题标签)**
	- **p(段落标签)**
	- **br(换行标签)**
	- **hr(横线标签)**
	- **div(普通文本标签)**
	- **ul(无序列表)**
	- **ol(有序列表)**
	- **li(列表中用到的标签，列表中的行)**



**内联标签(行内标签):不独占一行显示，内联标签只能包含内联标签，不能包含块级标签**

- **img(图片标签)**
- **a(超链接标签)**
- **span(普通文本标签)**





## 2.head标签

### 2.1 meta标签

#### 2.2.1 meta	文档字符编码

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">		<!--指定编码-->
        <title>我的网页</title>
    </head>
    <body>
        <h1>一级标题</h1>
    </body>
</html>
```



#### 2.2.2 meta	页面刷新

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>世上最牛逼的页面标题</title>
      
 				<!-- http-equiv是固定写法，content="2"表示2秒刷新一次页面 -->     
        <meta http-equiv="Refresh" content="2"/>
    </head>
    <body>
        <h1>meta页面刷新测试</h1>
    </body>
</html>

```

**运行以上代码，浏览器中就会每隔2秒刷新一次**

![iShot_2024-09-02_11.36.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_11.36.13.png)





#### 2.2.3 meta	关键字

**meta标签可以设置关键字，用于搜索引擎收录和关键字搜索。**

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>世上最牛逼的页面标题</title>
        <meta name="keywords" content="python，linux，mysql，html5,css3" />
    </head>
    <body>
        <h1>给搜索引擎交钱就会优先显示上述关键字</h1>
    </body>
</html>
```

**例如，在百度搜索的html页面中有上述代码中content中的关键字，搜索框中输入关键字就会有返回结果，给搜索引擎交的钱越多，优先级越大，排在前面的概率也就越大**



![iShot_2024-09-02_11.37.32](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_11.37.32.png)





#### 2.2.4 meta	网站描述

**meta标签可以设置网站描述信息，用于在搜索引擎搜索时，显示网站基本描述信息。**

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>大保健会所</title>
        <meta name="keywords" content="欧美，日韩，国产，网红" />
      
        <!-- description就是网站描述信息-->
        <meta name="description" content="欢迎光临乔杉大保健会所" />
    </head>
    <body>
        <h1>搜索引擎搜索到</h1>
    </body>
</html>
```

![iShot_2024-09-02_11.39.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_11.39.11.png)





#### 2.2.5 meta	触屏缩放

meta标签可以设置页面是否支持触屏缩放功能，其中各元素的含义如下：

- `width=device-width` ，表示宽度按照设备屏幕的宽度。
- `initial-scale=1.0`，初始显示缩放比例。
- `minimum-scale=0.5`，最小缩放比例。
- `maximum-scale=1.0`，最大缩放比例。
- `user-scalable=yes`，是否支持可缩放比例（触屏缩放）

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>标题</title>
    
    <!--支持触屏缩放-->
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">

    <!--不支触屏持缩放-->
    <!--<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">-->

</head>
<body>

    <h1 style="width: 1500px;background-color: green;">哈哈哈</h1>
</body>
</html>
```



### 2.2 link标签

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
		<link rel="icon" href="图片文件路径">
    </head>
    <body>
        <h1>隔壁王老汉的幸福生活</h1>
    </body>
</html>


<!-- 获取京东左上角图标路径，然后在本地浏览器打开-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
		<link rel="icon" href="https://www.jd.com/favicon.ico">
    </head>
    <body>
        <h1>隔壁王老汉的幸福生活</h1>
    </body>
</html>
```



![iShot_2024-09-02_14.06.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.06.17.png)



## 3.body标签

### 3.1 h1-h6	标题标签

```html
<body>
    <h1>一级标题</h1>
    <h2>二级标题</h2>
    <h3>三级标题</h3>
    <h4>四级标题</h4>
    <h5>五级标题</h5>
    <h6>六级标题</h6>
</body>


<!--完整写法-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级标题</h1>
        <h2>二级标题</h2>
        <h3>三级标题</h3>
        <h4>四级标题</h4>
        <h5>五级标题</h5>
        <h6>六级标题</h6>
    </body>
</html>
```



![iShot_2024-09-02_14.07.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.07.17.png)



### 3.2 br	换行标签

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级<br>标题</h1>
    </body>
</html>
```



![iShot_2024-09-02_14.08.21](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.08.21.png)





### 3.3 hr	一行横线标签

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级标题</h1>
        <hr>
        <h1>一级标题</h1>
    </body>
</html>
```



![iShot_2024-09-02_14.09.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.09.29.png)



### 3.3 a	超链接标签

#### 3.3.1 不加href属性，就是普通文本显示

```html
<a>python从入门到放弃</a>

<!--完整写法-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级标题</h1>
        <a>python从入门到放弃</a>
    </body>
</html>
```



![iShot_2024-09-02_14.10.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.10.17.png)



#### 3.3.2 集上href属性，不加值，文字有颜色效果，还有下划线，并且点击后会刷新当前的html页面

```html
<a href="">python从入门到放弃</a>

<!--完整写法-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级标题</h1>
        <a href="">python从入门到放弃</a>
    </body>
</html>
```



![iShot_2024-09-02_14.11.01](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.11.01.png)





#### 3.3.3 加上href属性，并且加上值，点击后会跳转至对应的网址

```html
<a href="https://www.baidu.com" target="_self">python短片</a>

<!--完整写法-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>隔壁老王</title>
    </head>
    <body>
        <h1>一级标题</h1>
        <a href="https://www.baidu.com" target="_blank">python从入门到放弃</a>
    </body>
</html>
```



![iShot_2024-09-02_14.11.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.11.55.png)



#### 3.3.4 锚点	在页面内容进行跳转

**描述:标签设置id属性=值(xx)**

**a标签href属性的值写法:href='#xx',点击这个a标签就能跳转到id属性为xx的那个标签所在位置.**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="top">这是顶部</div>

<a href="#i1">第一章 开局(链接)</a>
<a href="#i2">第二章 捡了一只狗(链接)</a>
<a href="#i3">第三章 给狗洗澡(链接)</a>
<a href="#i4">第四章 二手洗澡液有毒(链接)</a>
<a href="#i5">第五章 大结局(链接)</a>

<div id="i1" style="background-color: green;">第一章 开局</div>
<p>
    没干啥好事儿!!
</p>
<p>
    没干啥好事儿!!
</p>
<p>
    没干啥好事儿!!
</p>
<div id="i2" style="background-color: yellowgreen;">第二章 捡了一只狗</div>
<p>
    草丛有动静!!
</p>
<p>
    走过去看看!!
</p>
<p>
    卧槽，是一条狗!!
</p>
<p>
    把狗捡走!!
</p>
<div id="i3" style="background-color: orange;">第三章 给狗洗澡</div>
<p>
    狗有点脏!!!
</p>
<p>
    需要给狗洗澡!!!
</p>
<p>
    买了一瓶二手洗澡液!!!
</p>
<p>
    开始给狗洗澡!!!
</p>
<p>
    洗完了!!!
</p>
<div id="i4" style="background-color: cornflowerblue;">第四章 二手洗澡液有毒</div>
<p>
    给狗洗完澡了!!!
</p>
<p>
    但是身体有点不适!!!
</p>
<p>
    逐渐开始麻木!!!
</p>
<p>
    糟糕，洗澡液有毒!!!
</p>
<p>
    情况不乐观!!!
</p>
<p>
    卧槽，后悔买二手的了!!!
</p>
<p>
    下次再也不买二手的了!!!
</p>
<div id="i5" style="background-color: pink;">第五章 大结局</div>
<p>
    中毒身亡!!!
</p>
<p>
    中毒身亡!!!
</p>
<p>
    中毒身亡!!!
</p>
<p>
    中毒身亡!!!
</p>
<a href="#top">返回顶部</a>

</body>
</html>
```



![iShot_2024-09-02_14.13.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.13.28.png)



### 3.4 img	图片标签

> 参数说明
>
> - src属性:图片路径  必须写
> - alt属性:图片加载失败或者正在加载时提示的内容
> - title属性:鼠标悬浮时显示的内容
>
> 不常用,通过css来控制
>
> - width:设置宽度
> - height:设置高度



**设置图片大小**

```html
<img src="图片地址(网络地址或者本地地址)" alt="">

<!--完整写法-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h1>一级标题</h1>
    <img width="200" height="200" src="http://b-ssl.duitang.com/uploads/item/201208/30/20120830173930_PBfJE.jpeg" alt="正在加载图片，请稍等"></img>
</body>
</html>
```

**img中width(设置宽度，单位:像素)，height(设置高度，单位:像素)设置图片大小**



![iShot_2024-09-02_14.15.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.15.03.png)



**设置鼠标悬浮时图片显示的内容**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h1>一级标题</h1>
    <img width="200" height="200" src="http://b-ssl.duitang.com/uploads/item/201208/30/20120830173930_PBfJE.jpeg" alt="正在加载图片，请稍等" title="这是一张图片"></img>
</body>
</html>
```



![iShot_2024-09-02_14.17.03](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.17.03.png)





### 3.5 div和span	普通文本标签

**div和span默认是没有任何修饰的文本标签，也可以指定样式，但是一般在css中指定**



**div默认是普通文本**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <div>div默认是普通文本</div>
</body>
</html>
```



![iShot_2024-09-02_14.18.04](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.18.04.png)



**div也可以指定文本颜色，一般写在css中**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <div style="color: yellowgreen">div也可以指定文本颜色，一般写在css中</div>
</body>
</html>
```



![iShot_2024-09-02_14.18.47](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.18.47.png)





**span默认是普通文本**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <span>span默认是普通文本</span>
</body>
</html>
```



![iShot_2024-09-02_14.19.36](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.19.36.png)

**span也可以指定文本颜色，一般写在css中**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <span style="color: pink">span也可以指定文本颜色，一般写在css中</span>
</body>
</html>
```



![iShot_2024-09-02_14.20.31](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.20.31.png)



### 3.6 列表标签

#### 3.6.1 ul	无序标签

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <ul>
        <li>篮球</li>
        <li>足球</li>
        <li>排球</li>
    </ul>
</body>
</html>
```



![iShot_2024-09-02_14.21.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.21.29.png)



#### 3.6.2 ol	有序标签

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <ol>
        <li>篮球</li>
        <li>足球</li>
        <li>排球</li>
    </ol>
</body>
</html>
```



![iShot_2024-09-02_14.23.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.23.39.png)



#### 3.6.3 dl	描述列表标签

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <dl>
        <dt>河北省</dt>
            <dd>邯郸</dd>
            <dd>石家庄</dd>
        <dt>山西省</dt>
            <dd>太原</dd>
            <dd>运城</dd>
    </dl>
</body>
</html>
```



![iShot_2024-09-02_14.24.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.24.35.png)



### 3.7 table	表格标签

**参数说明**

```html
<body>
    <table>									<!--table是表格标签-->
        <thead>							<!--thead是表格的标题-->
        <tr>								<!--tr是行-->
            <th>id</th>			<!--th是列-->
            <th>name</th>
            <th>hobby</th>
        </tr>
        </thead>
        <tbody>							<!--tbody是表格中的内容-->
        <tr>
            <td>1</td>
            <td>小明</td>
            <td>看电影</td>
        </tr>
        <tr>
            <td>2</td>
            <td>小洲</td>
            <td>打篮球</td>
        </tr>
        </tbody>
    </table>
</body>
```





**没有边框的表格**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <table>
        <thead>
        <tr>
            <th>id</th>
            <th>name</th>
            <th>hobby</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>1</td>
            <td>小明</td>
            <td>看电影</td>
        </tr>
        <tr>
            <td>2</td>
            <td>小洲</td>
            <td>打篮球</td>
        </tr>
        <tr>
            <td>3</td>
            <td>小颖</td>
            <td>逛街</td>
        </tr>
        </tbody>
    </table>
</body>
</html>
```



![iShot_2024-09-02_14.25.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.25.56.png)





**加上边框的表格**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <table border="1">
        <thead>
        <tr>
            <th>id</th>
            <th>name</th>
            <th>hobby</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>1</td>
            <td>小明</td>
            <td>看电影</td>
        </tr>
        <tr>
            <td>2</td>
            <td>小洲</td>
            <td>打篮球</td>
        </tr>
        <tr>
            <td>3</td>
            <td>小颖</td>
            <td>逛街</td>
        </tr>
        </tbody>
    </table>
</body>
</html>
```



![iShot_2024-09-02_14.26.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.26.55.png)





**表格合并(rowspan="2")	枞行合并**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <table border="1">
        <thead>
        <tr>
            <th>id</th>
            <th>name</th>
            <th>hobby</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>1</td>
            <td>小明</td>
            <td rowspan="2">看电影</td>	<!--纵行合并2行-->
        </tr>
        <tr>
            <td>2</td>
            <td>小洲</td>
        </tr>
        <tr>
            <td>3</td>
            <td>小颖</td>
            <td>逛街</td>
        </tr>
        </tbody>
    </table>
</body>
</html>
```



![iShot_2024-09-02_14.28.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.28.14.png)





**表格合并(colspan="2")	横列合并**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <table border="1">
        <thead>
        <tr>
            <th>id</th>
            <th>name</th>
            <th>hobby</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>1</td>
            <td>小明</td>
            <td>看电影</td>
        </tr>
        <tr>
            <td>2</td>
            <td>小洲</td>
            <td>打篮球</td>
        </tr>
        <tr>
            <td>3</td>
            <td colspan="2">小颖</td>
        </tr>
        </tbody>
    </table>
</body>
</html>
```



![iShot_2024-09-02_14.29.19](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.29.19.png)





### 3.8 input	输入框标签

#### 3.8.1 用户名、密码、登陆、重置、注册

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
  	<!--普通文本输入框-->
    用户名：<input type="text" >
  
  	<!--密文输入框-->
    密码：<input type="password" 
              
  	<!--提交按钮，触发form表单提交数据的动作-->
    <input type="submit" value="登陆">
  
  	<!--重置按钮，清空输入的内容-->
    <input type="reset">
  
  	<!--普通按钮，不会触发form表单提交数据的动作-->
    <input type="button" value="注册">
</body>
</html>
```



![iShot_2024-09-02_14.30.28](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.30.28.png)





#### 3.8.2 时间日期输入框

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<input type="date">
</body>
</html>
```



![iShot_2024-09-02_14.31.46](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.31.46.png)





#### 3.8.3 文件选择框

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<input type="file">
</body>
</html>
```



![iShot_2024-09-02_14.32.36](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.32.36.png)



#### 3.8.4 纯数字输入框

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<input type="number">
</body>
</html>
```



![iShot_2024-09-02_14.34.07](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.34.07.png)



### 3.9 select	下拉框标签

#### 3.9.1 单选

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <select name="city" id="city">
        <option value="1">北京</option>
        <option value="2">上海</option>
        <option value="3">广州</option>
        <option value="4">深圳</option>
    </select>
</body>
</html>
```

![iShot_2024-09-02_14.36.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.36.52.png)





#### 3.9.2 多选

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <select name="city" id="citys" multiple>
        <option value="1">北京</option>
        <option value="2">上海</option>
        <option value="3">广州</option>
        <option value="4">深圳</option>
         <option value="1">杭州</option>
        <option value="2">青岛</option>
        <option value="3">哈尔滨</option>
        <option value="4">成都</option>
    </select>
</body>
</html>
```



![iShot_2024-09-02_14.37.55](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.37.55.png)



### 3.10 textarea	多行文本输入框标签

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <textarea name="评论区" id="comment" cols="30" rows="10"></textarea>
</body>
</html>
```



![iShot_2024-09-02_14.39.19](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.39.19.png)





### 3.11 form	表单标签

在网站开发的过程中，用户可以使用``用户交互``相关的标签让用户输入内容，但如果想要再浏览器上把输入的内容提交到后台，则需要 `表单` 和 `提交按钮` 。

form标签内置属性

- `action="/xx/"` ，表示表单要提交的地址
- `method="get"`，表示表单的提交方式（get或post）
- `enctype="multipart/form-data"`，如果form内部有文件上传，必须加上此设置

```html
<form action="http://www.luffycity.com" method="get" enctype="multipart/form-data">
    <input type="file" name="xxxxx">
    <input type="submit" value="提交">
</form>

#action属性: 指定提交路径,提交到哪里去

#form表单标签会将嵌套在form标签里面的输入框的数据全部提交到指定路径


```

**form内部【用户交互】相关标签必须设置name，不然提交数据后后端无法获取，例如下方的模拟登陆界面中用户名后的input标签中指定name属性**

```python
// 提交表单之后，实际上会将表单中的数据构造成一种特殊的结构，发送给后台，类似于：
{
    user:用户输入的姓名,
	  pwd:用户输入的密码,
    ...
}
```

**简单编辑一个模拟登陆的界面**

```html
<!--完整代码-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <form action="http://127.0.0.1:8080">
        <p>
            用户名：<input type="text" name="user">
        </p>
        <p>
            密码：<input type="password" name="pwd">
        </p>
        <input type="submit" value="提交">

    </form>
</body>
</html>
```

**运行上述代码效果如下**

![iShot_2024-09-02_14.40.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.40.11.png)





**接下来编写一个简单的tcp服务端，服务端绑定本机8080端口**

```python
from socket import *

tcp_server = socket()
tcp_server.bind(('127.0.0.1',8080))
tcp_server.listen()

while True:
    conn, client_addr = tcp_server.accept()

    from_client_msg = conn.recv(1024)

    print(from_client_msg.decode('utf-8'))

    conn.send(b'HTTP/1.1 200 ok\r\n\r\n')
    # conn.send(b'<h1>lai le laodi!</h1>')
    with open('send.html', 'rb') as f:
        data = f.read()
    conn.send(data)

    conn.close()

tcp_server.close()
```

**tcp服务端用到的给客户端返回的内容send.html文件内容如下**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h1>恭喜登陆成功！！！</h1>
</body>
</html>
```

**运行模拟登陆界面的html文件，随便输入一个用户名和密码，然后点击登陆**

![iShot_2024-09-02_14.41.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.41.22.png)



**因为模拟登陆界面的html代码中指定了访问本地8080端口，因此tcp服务端会返回指定的send.html文件中的内容**

![iShot_2024-09-02_14.42.12](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot_2024-09-02_14.42.12.png)

