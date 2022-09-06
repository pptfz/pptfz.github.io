[toc]



# css基本知识

# 1.css样式引入方式

## 第一种方式	head标签中引入

**在body中写的标签在head标签下的style标签中引入样式**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div>
        我是一个div标签
    </div>
</body>
</html>
```

![iShot2020-10-16 15.23.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.23.13.png)





## 第二种方式	外部css文件引入(常用)

```css
/*css代码*/
/*创建一个css文件，在html文件中使用link标签引入*/
div{
    /*css注释写法*/
    width: 200px;
    height: 200px;
    background-color: greenyellow;
}

<!--html代码-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <div>
        <!--href后边加上css文件的路径-->
        <link rel="stylesheet" href="testcss.css">
        我是一个div标签
    </div>
</body>
</html>
```

![iShot2020-10-16 15.23.51](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.23.51.png)





## 第三种方式	内联样式，标签中写样式

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <div style="background-color: greenyellow;height: 200px;width: 200px;">
        我是一个div标签
    </div>
</body>
</html>
```

![iShot2020-10-16 15.24.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.24.24.png)



# 2.css选择器

## 2.1基本选择器

### 2.1.1元素选择器

**元素选择器写法**

```css
标签名称{
	css属性:值
}

div{
	width:100px;
}
```

**html代码示例**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div>
        我是一个div标签
    </div>
</body>
</html>
```

![iShot2020-10-16 15.24.53](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.24.53.png)



### 2.1.2id选择器

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        #d1{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div id="d1">
        我是一个div标签
    </div>
</body>
</html>
```

![iShot2020-10-16 15.25.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.25.29.png)





### 2.1.3类选择器

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div class="c1">
        我是一个div标签
    </div>
</body>
</html>
```



![iShot2020-10-16 15.25.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.25.54.png)



## 2.2属性选择器

**根据自定义属性查找**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        [xx]{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div xx="x1">
        我是第一个div标签
    </div>
    <div xx="x2">
        我是第二个div标签
    </div>
</body>
</html>

```



![iShot2020-10-16 15.26.20](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.26.20.png)



**根据自定义属性值查找**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        [xx='x1']{
            width: 200px;
            height: 200px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>
    <div xx="x1">
        我是第一个div标签
    </div>
    <div xx="x2">
        我是第二个div标签
    </div>
</body>
</html>

```

![iShot2020-10-16 15.26.40](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.26.40.png)





## 2.3后代选择器

**以下代码中，只有在div标签下的a标签才能生效(有颜色)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        /*只有在div标签下的a标签(多级标签都可以)才能生效*/
        div a{
        color:orange; /* 字体颜色 */
    }
    </style>
</head>
<body>
  	<div id="d1" class="c1" xx="ss">
        <span>
            <a href="http://www.baidu.com">我是div标签的孙子</a>
        </span>
    </div>
    <div id="d2" class="c2" xx="kk">
        <a href="http://www.baidu.com">我是div标签的儿子</a>
    </div>

    <div id="d3" class="c1">
        我是一个div标签
    </div>
        <a href="http://www.baidu.com">百度</a>
</body>
</html>
```

![iShot2020-10-16 15.27.01](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.27.01.png)







## 2.4组合选择器(逗号连接)

**必须找到a标签才可以生效**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        #d1 a,#d2 a{
        color:orange;
    }
    </style>
</head>
<body>
  	<div id="d1">
        <span>
            <a href="http://www.baidu.com">我是div1</a>
        </span>
    </div>
    <div id="d2">
        <a href="http://www.baidu.com">我是div2</a>
    </div>

    <div id="d3" class="c1">
        我是div3
    </div>
        <a href="http://www.baidu.com">百度</a>
</body>
</html>

```

![iShot2020-10-16 15.27.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.27.25.png)





# 3.css样式相关

## 3.1高度、宽度

```html
<!--html代码-->
    <div>
       div1
    </div>
    <span>
        span1
    </span>


<!--css代码-->
<style>
    div{
        height: 200px;
        width: 100px;
        background-color: pink;
    }
    span{
        height: 200px;
        width: 100px;
        background-color: green;
    }
</style>

<!--完整代码-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

</head>
<body>
    <style>
    div{
        height: 200px;	<!--高度-->
        width: 100px;		<!--宽度-->
        background-color: pink;	<!--背景色-->
    }
    span{
        height: 200px;
        width: 100px;
        background-color: green;
    }
    </style>


    <div>
       div1
    </div>
    <span>
        span1
    </span>
</body>
</html>
```



![iShot2020-10-16 15.27.52](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.27.52.png)





## 3.2字体相关

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            font-size: 20px;    /* 默认字体大小是16px */
            color: olivedrab;
            font-family: '微软雅黑';    /* 字体格式 */
            font-weight: 500;   /* 字体粗细，100-900，默认是400 */
        }
    </style>
</head>
<body>
  	<div>
        写作日当午，<br>
        谁知学生苦。<br>
        几本小破书，<br>
        一坐一上午。
    </div>
</body>
</html>
```

![iShot2020-10-16 15.28.16](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.28.16.png)





## 3.3字体对齐

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
           color: #2a8282;
            /*!*右对齐*!*/
            /*text-align: right;*/

            /* 水平居中*/
            /*text-align: center; */
            height: 100px;
            width: 200px;
            text-align: left;

            /*和height高度相同，标签文本垂直居中*/
            line-height: 50px;
        }
    </style>
</head>
<body>
  	<div>
        只身赴宴鸡毛装！<br>
        都是同学装鸡毛！
    </div>
</body>
</html>

```



![iShot2020-10-16 15.28.35](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.28.35.png)



## 3.4颜色设置

- **三种方式:**

  - **英文单词:red;**

  - **十六进制: #ff746d;**

  - **rgb: rgb(155, 255, 236);**

    ​    **带透明度的: rgba(255, 0, 0,0.3);  单纯的就是颜色透明度**
    ​	**标签透明度:opacity: 0.3;  0到1的数字,这是整个标签的透明度**



**rgba是带透明度的，第4个数越小，透明度越高**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
           color: rgba(255,0,0,0.3);
        }
    </style>
</head>
<body>
  	<div>
        只身赴宴鸡毛装！<br>
        都是同学装鸡毛！
    </div>
</body>
</html>

```

**透明度为0.3**

![iShot2020-10-16 15.29.02](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.29.02.png)





**opacity，整个标签的透明度**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            /*单纯的颜色透明度*/
           /*color: rgba(255,0,0,0.3);*/
           
           /*整个标签的透明度 */
           opacity: 0.3;
        }
    </style>
</head>
<body>
  	<div>
        只身赴宴鸡毛装！<br>
        都是同学装鸡毛！
    </div>
</body>
</html>
```



![iShot2020-10-16 15.29.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.29.24.png)



## 3.5背景

### 3.5.1背景图片

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
            height: 1000px;
            width: 800px;
            background-image: url("cjk.jpeg");
        }
    </style>
</head>
<body>
  	<div class="c1">

    </div>
</body>
</html>

```



**背景图片，默认会平铺，即设置了样式的高度和宽度，如果图片比设置的小，会继续显示图片的一部分**

![iShot2020-10-16 15.30.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.30.11.png)







**加参数``background-repeat: no-repeat;``设置背景图片不平铺**

![iShot2020-10-16 15.34.29](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.34.29.png)





### 3.5.2背景图片的位置

![iShot2020-10-16 15.35.13](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.35.13.png)







**先截取一个200x200像素的图片，然后背景颜色为600x600像素，效果如下，图片默认的位置是left top**

![iShot2020-10-16 15.35.50](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.35.50.png)





**center center示例**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
            height: 600px;
            width: 600px;
            background-color: pink;
            background-image: url("200.png");
            background-repeat: no-repeat;
          	/*背景图片居中显示*/
            background-position: center center;
          	/* 简写方式 */
    				background: #ff0000 url("200.png") no-repeat center center;

        }
    </style>
</head>
<body>
   <div class="c1">

    </div>
</body>
</html>
```

![iShot2020-10-16 15.36.14](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.36.14.png)





### 3.5.3背景颜色

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
            height: 200px;
            width: 200px;
            background-color: pink;
        }
    </style>
</head>
<body>
  	<div class="c1">

    </div>
</body>
</html>

```

**200x200像素的背景颜色**

![iShot2020-10-16 15.36.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.36.39.png)









## 3.6边框

- **border-width  边框宽度**
- **border-style   边框样式(dashed是虚线，solid是实线)**
- **border-color   边框颜色**



### 3.6.1对4个边框设置

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            width: 200px;
            height: 100px;

            /*边框简写方式,边框粗为1px，solid是实线*/
            border: 1px solid red;
        }
    </style>
</head>
<body>
  	<div>
            都是同学装鸡毛！
    </div>
</body>
</html>

```

![iShot2020-10-16 15.36.57](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.36.57.png)





### 3.6.2单独对一个边框设置

- **border-left       左边框**

- **border-right    右边框**
- **border-top       上边框**
- **border-bottom    下边框**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        div{
            width: 200px;
            height: 100px;
        
            /*边框简写方式,边框粗为1px，solid是实线*/
            border-right: 1px solid red;
        }
    </style>
</head>
<body>
  	<div>
            都是同学装鸡毛！
    </div>
</body>
</html>

```

**``solid ``   实线边框**

![iShot2020-10-16 15.37.15](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.37.15.png)





**`dashed`   虚线边框**

![iShot2020-10-16 15.37.54](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.37.54.png)





## 3.7盒子模型

**盒子模型的各个值**

> margin: 外边距  距离其他标签或者自己父级标签的距离
> padding: 内边距  内容和边框之间的距离
> border: 边框
> content: 内容部分  设置的width和height

![iShot2020-10-16 15.38.25](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.38.25.png)





### 3.7.1内边距	padding

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        #d1{
            width: 200px;
            height: 100px;

            /*边框4像素，实线，红色*/
            border: 4px solid red;

            /*上下6px   左右8px*/
            /*padding: 6px 8px;*/

            /*上4右2下6左8*/
            /*padding: 4px 2px 6px 8px*/

            /*左上右下*/
            /*padding-left: 200px;*/
            /*padding-top: 20px;*/
            /*padding-right: 20px;*/
            /*padding-bottom: 20px;*/
        }
    </style>
</head>
<body>
    <div id="d1">我是一个div标签</div>
</body>
</html>
```

**原先效果**

![iShot2020-10-16 15.38.43](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.38.43.png)







**padding: 4px 2px 6px 80px效果**

![iShot2020-10-16 15.38.59](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.38.59.png)







### 3.7.2外边距	margin

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
     .c1{
        background-color: red;
        height: 100px;
        width: 100px;
        /*margin-left: -1000px;*/
        /*margin: 10px 15px;*/
     }

    .c2{
        background-color: green;
        height: 20px;
        width: 20px;
        /*margin: 10px 15px;*/
        margin-left: 20px;
    }
    </style>
</head>
<body>
    <div>
        都是同学装鸡毛!
    </div>
    <div class="c1">
        <div class="c2">
        </div>
    </div>
</body>
</html>
```

![iShot2020-10-16 15.39.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.39.24.png)





## 3.8display属性

**display的几个值:**

> inline: 将块级标签变成了内联标签
> block:将内联标签变成块级标签
> inline-block: 同时具备内联标签和块级标签的属性,也就是不独占一行,但是可以设置高度宽度
> none: 设置标签隐藏

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
    span{
        /*display: block;*/
        /*display: none;*/
        }
    .c1{
        background-color: red;
        height: 100px;
        width: 100px;
        /*display: inline;*/
        display: inline-block;
        /*display: none;*/
    }
    .c2{
        background-color: green;
        height: 100px;
        width: 100px;
    }
    </style>
</head>
<body>
    <span>
        我是span标签
    </span>
    <div class="c1">
        鹅鹅鹅,曲项向天歌!

    </div>

    <div class="c2">
        拔毛烧开水,铁锅炖大鹅!
    </div>
</body>
</html>
```

![iShot2020-10-16 15.39.49](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.39.49.png)





**display:none隐藏标签**

![iShot2020-10-16 15.40.22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.40.22.png)



## 3.9浮动

**浮动的元素,不独占一行,并且可以设置高度宽度**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        body{
            margin: 0;
        }
        .c1{
            background-color: red;
            height: 100px;
            width: 200px;
            float: left;
        }
        .c2{
            background-color: brown;
            height: 100px;
            width: 200px;
            float: right;
        }
        .c3{
            background-color: pink;
            height: 100px;
            width: 100%;
        }


    </style>
</head>
<body>
   <div class="cc">
        <!--<div>吟诗作对</div>-->
        <div class="c1"></div>
        <div class="c2"></div>
    </div>
    <div class="c3"></div>
</body>
</html>
```

**左右浮动效果**

**粉色标签设置了宽度100%，但是设置左右浮动后会覆盖这个粉色标签，这种现象就是父级标签塌陷(cc是父级标签，左右浮动的c1和c2是儿子标签)，因为左右两边的标签设置了浮动，已经脱离了文档流，所以粉色的标签(和cc同级的c3)会向上顶，正确情况应该为粉色单独占一行**

![iShot2020-10-16 15.40.49](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.40.49.png)





**解决父级标签塌陷问题:**

```html
方法一
	给父级标签加高度，本示例中是给cc加高度

方法二
	清除浮动:clear属性，本示例中给c3添加清除浮动，clear:both的意思是本标签的上边不允许有浮动元素	
	 .c3{
            background-color: pink;
            height: 100px;
            width: 100%;
            clear: both;
        }

方式三(常用)伪元素选择器解决
css样式:
.clearfix:after{
            content: '';	#这里设置个空值，因为是伪元素，所以无法选中，并且占一行，这样就解决了父级标签塌陷的问题
            display: block;	#将内联标签变成块级标签，占一行
            clear: both;
        }
	
html代码:
    <div class="cc clearfix">
        <!--<div>吟诗作对</div>-->
        <div class="c1"></div>
        <div class="c2"></div>
    </div>
    <div class="c3"></div>

```

**解决后的效果**

![iShot2020-10-16 15.41.11](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.41.11.png)



## 3.10伪元素选择器

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
    div{
        background-color: pink;
        height: 100px;
        width: 200px;
    }
    div:after{
        content: '我是无法选中的0.0';
        color:white;
    }
    </style>
</head>
<body>


<div id="d1"></div>
<div class="c2">
    这是c2
</div>
</body>

<div>都是同学装鸡毛!</div>
</html>
```

**div:after表示找到div标签后的内容且内容无法选中**

![after](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/after.gif)





## 3.11伪类选择器

### 3.11.1hover、pointer	

**hover表示当鼠标悬浮时的效果**

**pointer表示鼠标悬浮时显示小手**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
        background-color: red;
        height: 200px;
        width: 200px;

        }
        .c1:hover{
            /*background-color: green;*/
            background-image: url("200.png");
            cursor: pointer;
        }

    </style>
</head>
<body>
      <div class="c1"></div>
</body>
</html>
```

![hover](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/hover.gif)

### 3.11.2其他伪类选择器

```html
        /* a标签未访问的时候设置效果 */
        a:link{
            color:yellow;
        }
        /* 鼠标悬浮上去时设置效果 */
        a:hover{
            color:black;
        }
        /* 鼠标左键点击下去的还没有抬起来的时候,设置效果 */
        a:active{
            color:green;
        }

        /* 鼠标抬起后,访问过之后设置效果 */
        a:visited{
            color:purple;
        }
```



**完整代码**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>我不适合学前端</title>
    <style>
        a:link {
            color: #000000;
        }

        /* 未访问链接*/
        a:visited {
            color: #00FF00;
        }

        /* 已访问链接 */
        a:hover {
            color: #FF00FF;
        }

        /* 鼠标移动到链接上 */
        a:active {
            color: #0000FF;
        }

        /* 鼠标点击时 */
    </style>
</head>
<body>
<p><b><a href="" target="_blank">这是一个链接</a></b></p>
<p><b>注意：</b> a:hover 必须在 a:link 和 a:visited 之后，需要严格按顺序才能看到效果。</p>
<p><b>注意：</b> a:active 必须在 a:hover 之后。</p>
</body>
</html>
```

![hover22](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/hover22.gif)





## 3.12文字装饰

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        a{
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="c1"></div>
<a href="" target="_blank">来点我！！！</a>
</body>
</html>
```

**没有去除超链接下划线前的效果**

![iShot2020-10-16 15.41.56](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.41.56.png)



**去除超链接下划线后的效果**

![iShot2020-10-16 15.42.17](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.42.17.png)





## 3.13定位postion

> **static:  静态定位,也就是标签默认**
>
> **relative:  相对定位,按照自己原来的位置进行移动**
>
> **absolute: 绝对定位,按照父级标签或者祖先辈儿标签设置了相对定位的标签位置进行移动,如果没有找到相对定位标签,会找到整个文档的位置进行移动**
>
> **fixed: 固定定位, 按照浏览器窗口的位置进行移动**

```html
固定定位示例
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
        <style>
            body{
                margin: 0;
            }

            .c1{
                background-color: red;
                height: 1000px;
                width: 800px;
            }
            .c2{
                background-color: green;
                height: 1000px;
                width: 800px;
            }
            .c3{
                background-color: blue;
                height: 1000px;
                width: 800px;
            }

            .s1{
                position: fixed;
                left: 1000px;
                bottom: 20px;
                height: 40px;
                width: 60px;
                background-color: aqua;

                line-height: 40px;
                text-align: center;
            }

            .s1 a{
                color:white;
                text-decoration: none;
                font-size: 12px;
            }

        </style>
    </head>
    <body>
    <div id="top">这是顶部</div>

    <div class="c1"></div>
    <div class="c2"></div>
    <div class="c3"></div>
    <span class="s1">
        <a href="">返回顶部</a>
    </span>
    </body>
    </html>定位示例

```



## 3.14选择器优先级

```css
/* css属性有继承的概念  权重0*/
/* 标签(元素)选择器  权重1*/
/* 类选择器  权重10*/
/* id选择器  权重100*/
/* 内联样式  权重1000*/
/* color:green!important; 无敌! */
/* 如果优先级相同,按照后面的为准 */
		别忘了,class属性的值可以写多个
```

**简单示例**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .c1{
            height: 100px;
            width: 100px;
            background-color: red;
        }

        #d1{
            height: 100px;
            width: 100px;
            background-color: greenyellow;
        }
    </style>
</head>
<body>

<div class="c1" id="d1">我是一个div标签</div>
</body>
</html>
```

**id选择器优先级大于类选择器优先级，所以显示的颜色是d1中的绿黄色**



![iShot2020-10-16 15.42.39](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16%2015.42.39.png)
