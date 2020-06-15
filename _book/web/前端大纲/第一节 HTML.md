# 第七章 前端开发

本阶段课程我们将来给大家讲解前端开发相关知识点，关于前端开发需要告知同学们以下几点：

- 最简单，前端开发是整个学习周期中最简单的部分，他不需要复杂的逻辑思维和知识储备，仅需多写多练加深印象便可以掌握。 
- 新起点，前端开发部分和之前学习的Python知识点无关，所以，对于大家而言是一个全新的开始，所有人都重新在同一起跑线开始学习。  

### 引入

在正式开始学习前端之前，有很多同学会提出夺命三连问，所以，在正式开始讲课之前咱一起来聊聊这几个问题。

```
1. 前端开发都是学啥？
2. 为什么要学前端开发？
3. 前端开发和Python有什么关系？
```

想要把以上的几个问题从根源解释清楚，必须要从之前学习的网络编程开始一步一步来聊。

#### 第一步：网络传输都基于socket实现

在网络中双方如果想要进行通信，必须依赖socket，并且分为客户端和服务端两部分。

![image-20191019102844239](/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191019102844239.png)

简单代码如下：

- socket服务端

  ```python
  # !/usr/bin/env python
  # -*- coding:utf-8 -*-
  import socket
  
  server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  server.bind(('localhost', 8000))
  server.listen(5)
  
  # 阻塞，等待客户端连接
  conn, address = server.accept()
  
  # 接收到客户端发送的数据
  data = conn.recv(1024)
  print('收到客户端发来的数据：',data)
  
  # 给客户端回复数据
  conn.send(b'fuck off')
  
  # 关闭与客户端的链接
  conn.close()
  
  server.close()
  ```

- socket客户端

  ```python
  # !/usr/bin/env python
  # -*- coding:utf-8 -*-
  import socket
  
  client = socket.socket()
  
  client.connect(('127.0.0.1', 8000))
  
  client.send(b'i want you')
  
  reply = client.recv(1024)
  print('收到服务端回复：',reply)
  
  client.close()
  ```

#### 第二步：浏览器是特殊的socket客户端

平时我们在使用浏览器访问网站时，浏览器其实就充当了socket客户端的角色，例如：通过浏览器在百度上进行搜索，浏览器（socket客户端）向百度（socket服务端）发送请求，百度将结果返回给浏览器，浏览器进行呈现。

![image-20191019105444226](/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191019105444226.png)

浏览器在做呈现时，浏览器会对服务端返回的数据进行解析，浏览器遇到如下格式，会呈现不同效果，例如：

- `<h1>高清无码</h1>` ，用此标签包裹的内容，浏览器会把内容加大加粗显示。
- `<div style='color:red'>震惊了，Alex居然...</div>`，用此标签包裹的内容，浏览器会把字变红色。
- `<a href='http://www.pythonav.com'>臭妹妹</a>`，浏览器会给字设置点击跳转的功能。

自定义socket服务端并返回一些特殊标记，用浏览器当做socket客户端去访问，代码如下：

- socket服务端代码

  ```python
  # !/usr/bin/env python
  # -*- coding:utf-8 -*-
  import socket
  
  server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  server.bind(('127.0.0.1', 80)) # 注意：请使用80端口
  server.listen(5)
  
  # 阻塞，等待客户端连接
  conn, address = server.accept()
  
  # 接收到客户端发送的数据
  data = conn.recv(1024)
  
  # 给客户端回复数据
  tpl = "<h1>高清无码</h1> <div style='color:red'>震惊了，Alex居然...</div> <a href='http://www.pythonav.com'>臭妹妹</a>"
  conn.send(tpl.encode('gbk'))
  
  # 关闭与客户端的链接
  conn.close()
  
  server.close()
  ```

- 客户端浏览器访问查看

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191019113348762.png" alt="image-20191019113348762" style="zoom: 25%;float:left;" />

所以，如果想要让浏览器显示出各种各样的好看效果，就需要服务端返回各种浏览器能够识别的特殊标签。

#### 第三步：程序猿开发网站

作为一枚程序员，如果想要开发网站，其本质就是在socket服务端接收浏览器请求并给其返回数据，并且返回数据格式要符合浏览器能识别的规则。

前端开发的课程目的就是带大家去学习浏览器能识别的所有规则，这样我们就可以服务端给浏览器返回特定规则的数据，从而控制用户浏览器显示的效果。

so，夺命三连问就答案了。

```
1. 前端开发都是学啥？
答：学习浏览器能识别的所有规则。
   
2. 为什么要学前端开发？
答：所有人都使用浏览器访问去网站，没有人自己写socket来访问网站。 所以，作为程序员的我们开发网站(服务端)时返回的内容必须遵守浏览器能识别的规则，否则无法展示。
   
3. 前端开发和Python有什么关系？
前端和后端语言（Python、Java、C#、PHP等）都没有直接关系，只不过在开发网站时，需要前端和后端一起配合。即：后端语言处理业务逻辑，将想要呈现的内容嵌套到前端的各种特殊标签中，从而在浏览器上进行呈现。

注意：Java、PHP、C#程序员想要开发网站也需要学习前端知识。
```

### 概述

前端开发的学习本质上就是学习浏览器能够识别的规则，对所有规则可以划分为三大类，如下所示：

- HTML，呈现一些基本的格式，类似于一个裸体的人。
- CSS，对格式进行调整，类似于给裸体的人穿上漂亮的衣服。
- JavaScript，添加一些动态效果，类似于让人可以动起来。

## 第一节 HTML

HTML，称为超文本标记语言。

### 1.1 本地查看

之前的示例中，如果想要查看浏览器上呈现效果需要依赖socket服务端。为了方便本地开发调试，在学习前端开发的过程，都会在本地浏览器直接打开编写的html文件，例如：

- 创建 page1.html 文件（前端页面一般都是以 .html 后缀结尾）。

  ```html
  <h1>高清无码</h1>
  <div style='color:red'>震惊了，Alex居然...</div>
  <a href='http://www.pythonav.com'>臭妹妹</a>
  ```

- 使用浏览器直接打开文件查看内容
  ![image-20191019140748305](/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191019140748305.png)




等以后学习后端Web框架之后，才会将编写的前端页面放在服务端

### 1.2 基本结构

从这一部分开始，我们将正式开始学习HTML标签。并在写完效果之后在本地浏览器打开去查看效果。

```html
<!DOCTYPE html>
<html lang="en">  <!--  -->
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
    </head>
    <body>

    </body>
</html>
```

每个html都应该包含上述部分，否则就是不规范（之前的示例仅为展示效果，编写方式都是不规范）。

- `<!DOCTYPE html>`，指定文档类型为html格式，浏览器会根据html格式去渲染下面的标签.
- `<html lang="en">...</html>`，HTML文件内容区域，所有的内容都应该写到它的内部。其中lang="en"表示页面是英文格式，翻译页面时会读取此值来获取当前页面是什么语言编写。
  - `<head>...</head>`，放一些描述信息。
  - `<body>...</body>`，放希望浏览器呈现出的内容。

规范的编写方式应该如下：

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>我的网页</title>
    </head>
    <body>

        <h1>高清无码</h1>
        <div style='color:red'>震惊了，Alex居然...</div>
        <a href='http://www.pythonav.com'>武沛齐</a>

    </body>
</html>
```

### 1.3 head标签

head标签相当于人的大脑，内部可以放一些页面的描述信息，该部分内容虽然不会在页面展示，但也起到非常重要的作用。

#### 1.3.1 title 标题

title标签用于指定网页的标题，所有网站页面标签部分的文字都是基于title实现。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>我的网页</title>
    </head>
    <body>
        ...
    </body>
</html>
```

#### 1.3.2 meta 文档字符编码

meta标签可以定义文档的字符编码，即：浏览器会按照charset设置的编码去读取下面的文档内容。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>我的网页</title>
    </head>
    <body>
        <h1>叫爸爸</h1>
    </body>
</html>
```

注意：1. 定义字符编码的标签必须放在最上方；2. 乱码现象：文件编码和charset字符串编码不一致时，浏览器会根据charset定义去读取内容，所以就会出现乱码。

#### 1.3.3 meta 页面刷新

meta标签设置页面定时刷新。不常用，只做了解即可。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>世上最牛逼的页面标题</title>
        <meta http-equiv="Refresh" content="5" />
    </head>
    <body>
        <h1>这是个栗子，快尼玛给我运行起来。</h1>
    </body>
</html>
```

特别的：页面跳转可以用 `<meta http-equiv="Refresh" content="5;Url=http://www.pythonav.com" />`

#### 1.3.4 meta 关键字

meta标签可以设置关键字，用于搜索引擎收录和关键字搜索。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>世上最牛逼的页面标题</title>
        <meta name="keywords" content="欧美，日韩，国产，网红" />
    </head>
    <body>
        <h1>这个栗子就别运行老子了，随便去看一个网站的源代码吧。</h1>
    </body>
</html>
```

#### 1.3.5 meta 网站描述

meta标签可以设置网站描述信息，用于在搜索引擎搜索时，显示网站基本描述信息。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>野鸭子</title>
        <meta name="keywords" content="欧美，日韩，国产，网红" />
        <meta name="description" content="野鸭子是一个面向全球的皮条平台。" />
    </head>
    <body>
        <h1>这个栗子就别运行老子了，随便去看一个网站的源代码吧。</h1>
    </body>
</html>
```

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023093455330.png" alt="image-20191023093455330" style="zoom:33%;float:left" />

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023093544672.png" alt="image-20191023093544672" style="zoom:33%;float:left" />

#### 1.3.6 meta IE浏览器

在前端开发领域，IE浏览器因为兼容性一直被鄙视，因为IE遵循自己的标准而其他浏览器遵循另一套标准，所以同样的代码在其他浏览器都可以运行，唯独IE需要特殊设置。

以下是专门针对IE浏览器设置，在IE浏览器上运行时，按照最新的默认渲染页面，例如：使用 IE10 浏览器访问页面，如果在IE浏览器兼容中切换到IE8，倘若没有设置X-UA-Compatible，那么页面就会按照IE8模式去显示页面，而设置X-UA-Compatible之后，浏览器永远会按照最新的默认来对页面进行渲染。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>野鸭子</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    </head>
    <body>
        <h1>傻逼IE浏览器</h1>
    </body>
</html>
```

#### 1.3.7 meta 国产浏览器

针对国产浏览器（例如：360浏览器、搜狗浏览器、QQ浏览器等），这些浏览器一般都支持 IE内核（兼容模式）和webkit 内核（高速模式）两种模式。

国产浏览器都是默认使用IE内核（兼容模式），如下设置可以让部分国产浏览器默认按照高速模式渲染页面。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>野鸭子</title>
        <meta name="renderer" content="webkit">
    </head>
    <body>
        <h1>我是国产，我骄傲</h1>
    </body>
</html>
```

目前只有[360浏览器](http://se.360.cn/v6/help/meta.html)支持此 `meta` 标签。希望更多国内浏览器尽快采取行动、尽快进入高速时代！

#### 1.3.9 meta 触屏缩放

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
    <title>标题标题标题标题</title>
    
    <!--支持触屏缩放-->
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">

    <!--不支触屏持缩放-->
    <!--<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">-->

</head>
<body>

    <h1 style="width: 1500px;background-color: green;">一起为爱鼓掌吧</h1>
</body>
</html>
```

#### 1.3.10 link 图标

link标签可以设置网页标题上的图标。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>野鸭子</title>
		<link rel="shortcut icon" href="图标文件路径">
    </head>
    <body>
        <h1>隔壁王老汉的幸福生活</h1>
    </body>
</html>
```

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023102805423.png" alt="image-20191023102805423" style="zoom:33%;float:left" />

#### 总结

上述就是关于head部分的最常用设置，最后给大家提供一个业内绝大部分网站的页面设置参考代码，当然，以后也可以根据自己公司的需要去定义。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
    <meta name="keywords" content="欧美，日韩，国产，网红"/>
    <meta name="description" content="野鸡是一个面向全球的皮条平台。"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
    <link rel="shortcut icon" href="/image/chicken.icon">

</head>
<body>
    <h1 style="width: 1500px;background-color: green;">我们一起为爱鼓掌呀！！！</h1>
</body>
</html>
```

### 1.4 body标签

在使用浏览器查看html页面时候，看得到内容都是body标签中呈现出来。body中所有标签可以划分为两类：

- 块级，标签自己独占整行。
- 行内，标签内容有多少就占多少空间。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023120130510.png" alt="image-20191023120130510" style="zoom: 33%;float:left;" />

#### 1.4.1 div和span

这两个标签属于html中最素的，他们本身没有携带太多的样式：

- div，仅块级标签样式。
- span，仅行内标签样式。

也恰恰正是因为他们是最素的，所以之后在对标签进行定制时会很方便，所以应用也会很广，示例如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <div style="background-color: green;">我想和你做</div>
    <div style="background-color: red">爱做的事。</div>

    <span style="background-color: green;">我想和你做</span>
    <span style="background-color: red;">爱做的事。</span>
</body>
</html>
```

#### 1.4.2 br 换行

br标签用于内容进行换行处理。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <div>挖掘机哪家强？<br/>快来山东找蓝翔。</div>
</body>
</html>
```

提示：效果和使用两个div标签类似。

#### 1.4.3 p 段落

p标签用于表示段落，段落和段落之间有些间距，一般用于多内容多段落展示，例如：文章、作文、博客等。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023141347415.png" alt="image-20191023141347415" style="zoom: 25%; float: left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <p>先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。诚宜开张圣听，以光先帝遗德，恢弘志士之气，不宜妄自菲薄，引喻失义，以塞忠谏之路也。</p>
    <p>宫中府中，俱为一体，陟罚臧否，不宜异同。若有作奸犯科及为忠善者，宜付有司论其刑赏，以昭陛下平明之理，不宜偏私，使内外异法也。</p>
    <p>侍中、侍郎郭攸之、费祎、董允等，此皆良实，志虑忠纯，是以先帝简拔以遗陛下。愚以为宫中之事，事无大小，悉以咨之，然后施行，必能裨补阙漏，有所广益。</p>
</body>
</html>
```



#### 1.4.4 h 标题系列

h标签用于展示标题数据（加大加粗的样式），h系列标签共有6种，从h1~h6依次变小。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023141253604.png" alt="image-20191023141253604" style="zoom: 25%; float: left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <div>默认文字字体</div>
    <h1>再再再再再粗一点</h1>
    <h2>再再再再粗一点</h2>
    <h3>再再再粗一点</h3>
    <h4>再再粗一点</h4>
    <h5>再粗一点</h5>
    <h6>粗一点</h6>
</body>
</html>
```

#### 1.4.5 a 超链接

a标签主要有两个作用：分别是做超链接，点击之后可以跳转到指定地址；做锚点，点击后跳转到页面指定位置。

- 做超链接，点击之后可以跳转到指定地址

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023141930424.png" alt="image-20191023141930424" style="zoom: 25%; float: left;" />

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>野鸡平台</title>
  </head>
  <body>
      <a href="http://www.luffycity.com" title="撸撸撸撸撸飞">路飞学城</a>
  </body>
  </html>
  ```

- 做锚点，点击后跳转到页面指定位置。

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023143113184.png" alt="image-20191023143113184" style="zoom: 25%; float: left;" />

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>野鸡平台</title>
  </head>
  <body>
  <h1>章节</h1>
  <a href="#i1" title="第一章">第一章 寂寞的春天</a>
  <a href="#i2" title="第二章">第二章 寂寞的夏天</a>
  <a href="#i3" title="第三章">第三章 寂寞的秋天</a>
  <a href="#i4" title="第四章">第四章 寂寞的冬天</a>
  
  <h1>内容</h1>
  
  <div style="height: 1000px;" id="i1">
      <h3>第一章 寂寞的春天</h3>
      <p>春暖花开,万物复苏,又到了交配的季节。</p>
  </div>
  <div style="height: 1000px;" id="i2">
      <h3>第二章 寂寞的夏天</h3>
      <p>夏天夏天悄悄过去留下小咪咪</p>
  </div>
  <div style="height: 1000px;" id="i3">
      <h3>第三章 寂寞的秋天</h3>
      <p>今年的秋天真是寂寞呀！！！</p>
  </div>
  <div style="height: 1000px;" id="i4">
      <h3>第四章 寂寞的冬天</h3>
      <p>下雪</p>
  </div>
  </body>
  </html>
  ```

#### 1.4.6 ul 列表系列

在html中 ul、ol、dl用于展示列表数据。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023143942040.png" alt="image-20191023143942040" style="zoom: 25%; float: left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <ul>
        <li>周杰伦</li>
        <li>林俊杰</li>
        <li>王力宏</li>
    </ul>

    <ol>
        <li>铁锤</li>
        <li>钢弹</li>
        <li>狗蛋</li>
    </ol>

    <dl>
        <dt>河北省</dt>
        <dd>邯郸</dd>
        <dd>石家庄</dd>
        <dt>山西省</dt>
        <dd>太原</dd>
        <dd>平遥</dd>
    </dl>
</body>
</html>
```

#### 1.4.7 table 表格

table标签用于在html页面展示表格，一般在网站中看到的表格都是基于table标签实现。

- 表格基本显示

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023150022530.png" alt="image-20191023150022530" style="zoom:25%;float:left;" />

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>野鸡平台</title>
  </head>
  <body>
      <table border="1">
          <thead>
              <tr>
                  <th>姓名</th>
                  <th>年龄</th>
                  <th>爱好</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>武沛齐</td>
                  <td>18</td>
                  <td>看书</td>
              </tr>
              <tr>
                  <td>Alex</td>
                  <td>18</td>
                  <td>吃翔</td>
              </tr>
          </tbody>
      </table>
  </body>
  </html>
  ```

- 合并单元格，表格除了基本的显示以外还支持合并单元格。

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023150736896.png" alt="image-20191023150736896" style="zoom:25%;float:left;" />

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>野鸡平台</title>
  </head>
  <body>
  <table border="1">
      <thead>
          <tr>
              <th colspan="3">人员信息</th>
          </tr>
          <tr>
              <th>姓名</th>
              <th>年龄</th>
              <th>爱好</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>武沛齐</td>
              <td>18</td>
              <td>看书</td>
          </tr>
          <tr>
              <td rowspan="3">Alex</td>
              <td>18</td>
              <td>搞女神</td>
          </tr>
          <tr>
              <td>25</td>
              <td>搞男人</td>
          </tr>
          <tr>
              <td>30</td>
              <td>搞自己</td>
          </tr>
          <tr>
              <td>村长</td>
              <td>男</td>
              <td>保健</td>
          </tr>
      </tbody>
  </table>
  </body>
  </html>
  ```

注意：`border="1"` 用于设置表格边框，默认比较丑，以后可以通过样式修改让其变好看。

#### 1.4.8 img 图片

img标签用于显示图片。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023152219702.png" alt="image-20191023152219702" style="zoom: 25%; float: left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <!--显示本地图片，找不到图片则显示alt中的文字-->
    <img src="img/lover.png" alt="美女">

    <!--显示网络图片-->
    <img src="https://images.cnblogs.com/cnblogs_com/wupeiqi/662608/t_212313579359018.png" alt="大波妹子">

</body>
</html>
```

#### 1.4.9 input 系列【用户交互】

input系列中共有5个至关重要的标签，他为浏览器提供了数据交互的功能，即：用户可以在浏览器上输入数据和选择选项，以后可以把输入和选择的内容提交给后端。

- text，文本框。
- password，密码框。
- radio，单选框（必须设置name属性相同，否则无法实现）。
- checkbox，复选框。
- file，文件上传。 

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023155005141.png" alt="image-20191023155005141" style="zoom: 25%; float: left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>野鸡平台</title>
</head>
<body>
    <h3>文本框</h3>
    <input type="text">

    <h3>密码框</h3>
    <input type="password">

    <h3>单选框</h3>
    <input type="radio" name="gender">男
    <input type="radio" name="gender">女

    <h3>复选框</h3>
    <input type="checkbox">篮球
    <input type="checkbox">足球
    <input type="checkbox">橄榄球

    <h3>上传文件</h3>
    <input type="file">
</body>
</html>
```

#### 1.4.10 select 下拉框【用户交互】

select标签用于在浏览器上展示下拉框。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023160221719.png" alt="image-20191023160221719" style="zoom:25%;float:left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HTML学习</title>
</head>
<body>
    <h3>单选</h3>
    <select>
        <option>上海</option>
        <option>北京</option>
        <option>深圳</option>
    </select>

    <h3>多选</h3>
    <select multiple>
        <option>上海</option>
        <option>北京</option>
        <option>深圳</option>
    </select>

</body>
</html>
```

#### 1.4.11 textarea 多行文本框【用户交互】

textarea用于在浏览器上展示多行文本输入框。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023160607146.png" alt="image-20191023160607146" style="zoom:25%;float:left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HTML学习</title>
</head>
<body>
    <textarea></textarea>
</body>
</html>
```

#### 1.4.12 form 表单

在网站开发的过程中，用户可以使用上述【用户交互】相关的标签让用户输入内容，但如果想要再浏览器上把输入的内容提交到后台，则需要 `表单` 和 `提交按钮` 。

<img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023163711350.png" alt="image-20191023163711350" style="zoom:25%;float:left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HTML学习</title>
</head>
<body>
    <form action="http://www.x.cn" method="get">
        <p>用户名：<input type="text" name="user"></p>
        <p>密  码：<input type="password" name="pwd"></p>
        <p>性别：
            <input type="radio" name="gender" value="2">男
            <input type="radio" name="gender" values="3">女
        <p/>
        <p>爱好：
            <input type="checkbox" name="favor" value="2">篮球
            <input type="checkbox" name="favor" value="8">足球
            <input type="checkbox" name="favor" value="10">橄榄球
        </p>
        <p>城市：
            <select name="city">
                <option value="1">上海</option>
                <option value="2">北京</option>
            </select>
        </p>
        <p>备注：<textarea name="memo"></textarea></p>
        
        <input type="submit" value="提交">
        <input type="reset" value="重置">
    </form>
</body>
</html>
```

在使用form表单进行提交数据时，需要注意以下几点：

- 提交时，只会提交form标签内部【用户交互】相关的标签。

- `<input type="submit" value="提交">`用于提交当前所在的表单。

- `<input type="reset" value="重置">`用于重置当前标签中的选项。

- form标签内置属性

  - `action="/xx/"` ，表示表单要提交的地址。

  - `method="get"`，表示表单的提交方式（get 或  post，以后框架部分细讲）。

  - `enctype="multipart/form-data"`，如果form内部有文件上传，必须加上此设置。

    ```html
    <form action="http://www.luffycity.com" method="get" enctype="multipart/form-data">
        <input type="file" name="xxxxx">
        <input type="submit" value="提交">
    </form>
    ```

- form内部【用户交互】相关标签必须设置name，不然提交数据后后端无法获取。

  ```javascript
  // 提交表单之后，实际上会将表单中的数据构造成一种特殊的结构，发送给后台，类似于：
  {
      user:用户输入的姓名,
  	pwd:用户输入的密码,
      ...
  }
  ```

- `radio`、`checkbox`、`select` 除了要设置name属性以外，还必须设置value属性，因为这三中标签在form表单提交时，不会把看到的内容提交到后台，而是把选择选项对应的value值提交到后台。

#### 扩展：基于Python编写网站并接收数据

为了能让学生只管的感受表单提交的效果，可以自己基于Python写一个简单的网站来接收数据。

- 第一步：安装flask框架

  ```shell
  pip3 install flask
  ```

- 第二步：编写一个简单网站并运行起来，用于接收数据。
  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023165602667.png" alt="image-20191023165602667" style="zoom:25%;" />

  ```python
  #!/usr/bin/env python
  # -*- coding:utf-8 -*-
  from flask import Flask, request
  
  app = Flask(__name__)
  
  @app.route('/index/')
  def index():
      print(request.args)
      return '接收成功'
  
  if __name__ == '__main__':
      app.run()
  ```

- 第三步：编写html页面并提交表单

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>HTML学习</title>
  </head>
  <body>
      <form action="http://127.0.0.1:5000/index/" method="get">
          <p>用户名：<input type="text" name="user"></p>
          <p>密  码：<input type="password" name="pwd"></p>
          <p>性别：
              <input type="radio" name="gender" value="2">男
              <input type="radio" name="gender" values="3">女
          <p/>
          <p>爱好：
              <input type="checkbox" name="favor" value="2">篮球
              <input type="checkbox" name="favor" value="8">足球
              <input type="checkbox" name="favor" value="10">橄榄球
          </p>
          <p>城市：
              <select name="city">
                  <option value="1">上海</option>
                  <option value="2">北京</option>
              </select>
          </p>
          <p>备注：<textarea name="memo"></textarea></p>
          
          <input type="submit" value="提交">
          <input type="reset" value="重置">
      </form>
  </body>
  </html>
  ```

- 第四步：在网站后端查看接收数据

  <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023165946962.png" alt="image-20191023165946962" style="zoom:25%;float:left;" />



### 1.5 本节作业

根据要求编写html页面，今日共需要先实现三个页面：

1. 注册页面，需要包含：头像（文件上传）、用户名、密码、邮箱、性别、爱好、自我介绍。
   <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023192358327.png" alt="image-20191023192358327" style="zoom: 33%;" />
2. 登录页面，需要包含：用户名、密码。
   <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023192444477.png" alt="image-20191023192444477" style="zoom:50%;" />
3. 后台展示页面 ，按照下图实现（点击编辑或删除都可以跳转到百度）
   <img src="/Users/wupeiqi/Documents/work/4.教材/1.前端教材/assets/image-20191023192846114.png" alt="image-20191023192846114" style="zoom:33%;" />







