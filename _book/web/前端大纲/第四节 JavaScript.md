## 第四节 JavaScript

学习本节课程的目的是让我们的页面可以动起来（HTML、CSS只能写出静态效果），并且可以添加一些用户交互交互的行为，例如：模态对话框、全选反选、可折叠菜单等。本节所有内容主要包含以下三部分：

- JavaScript，他和Python一样是一门编程语言，而浏览器内置了JavaScript语言的解释器，所以JavaScript代码在浏览器上就可以运行。
- DOM，（Document Object Model）是指文档对象模型，通过它，可以操作HTML文档的相关功能，例如：对标签内容进行删除和替换等。
- BOM，（Browser Object Model）是指浏览器对象模型，通过他，可以操作浏览器相关的功能，例如：浏览器设置定时器，浏览器定时刷新页面。

他们三者之间的关系可以简单理解为：JavaScript是编程语言，DOM和BOM是两个模块，利用JavaScript语言再结合DOM、BOM模块可以让我们的页面出现动态的效果。

### 4.1 JavaScript

学习一门编程语言，需要了解他的编写方式以及语法规则，接下来开始学习新的一门编程语言JavaScript（简称JS）。

注意：JavaScript和Java没有任何关系。

#### 4.1.1 代码存在形式

常见的JavaScript代码有两种存在形式：

- Script代码块，只能在当前页面使用。
  应用场景：所有功能仅当前页面需要（如果代码太多也推荐放入js文件）。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
      
      <script type="text/javascript">
      // 内部编写JavaScript代码
      </script>
      
  </head>
  <body>
    
  </body>
  </html>
  ```

- 独立js文件，可以被多个引入之后使用。
  应用场景：多个页面公共功能可以放入文件，避免重复编写。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
      <script type="text/javascript" src="JavaScript文件路径"></script>
     
  </head>
  <body>
    
  </body>
  </html>
  ```

#### 4.1.2 推荐位置

上述我们了解JS的存在形式，而JS代码库和引入文件的存放位置也是有讲究，推荐大家把js代码都放在body标签的底部。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <!-- CSS代码推荐位置 -->
    <link rel="stylesheet" href="CSS文件路径">
    <style>
    	/* 内部编写CSS代码 */
    </style>
</head>
<body>
    
    <h1>HTML标签和样式</h1>
    
    <!-- JavaScript代码推荐位置 -->
    <script type="text/javascript" src="JavaScript文件路径"></script>
    <script type="text/javascript">
    // 内部编写JavaScript代码
    </script>
</body>
</html>
```

**这是为什么呢？**

因为浏览器在解析HTML、CSS、JavaScript文件时，是按照从上到下逐步解释并执行，如果JavaScript代码或文件放在head中可能会有因为耗时（网络请求或代码）导致页面显示速度太慢，影响用户感受，例如：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <script src="https://www.google.com"></script>
    <script>
        alert(123);
    </script>
</head>
<body>

<h1>HTML标签和样式</h1>

</body>
</html>
```

注意：JS放在下面可以让用户快速看到页面上的 HTML和CSS效果，但JS的效果必须还要等耗时操作处理完才能用。

#### 4.1.3 变量

JavaScript中变量的声明是一个非常容易出错的点，局部变量必须一个 var 开头，如果未使用var，则默认表示声明的是全局变量。

```html
<script type="text/javascript">

    // 全局变量
    name = '武沛齐';

    function func(){
        // 局部变量
        var age = 18;

        // 全局变量
        gender = "男"
    }
    func();
    console.log(gender); // 男
    console.log(name); // 武沛齐
    console.log(age); // 报错：age是fun的局部变量，外部无法获取。
</script>
```

提醒：js中单行注释用 `//` ；多行注释用 ` /* */`

#### 4.1.4 常见数据类型

##### 1. 数字（Number）

JavaScript中不区分整数值和浮点数值，JavaScript中所有数字均用浮点数值表示。

```JavaScript
// 声明
var page = 111;
var age = Number(18);
var a1 = 1,a2 = 2, a3 = 3;
// 转换
parseInt("1.2");  // 将某值转换成数字，不成功则NaN
parseFloat("1.2");	// 将某值转换成浮点数，不成功则NaN

/*
NaN，非数字。可使用 isNaN(num) 来判断。
Infinity，无穷大。可使用 isFinite(num) 来判断。
*/
```

扩展：可以用 typeof("xx") 查看数据类型。

##### 2. 字符串(String)

```JavaScript
// 声明
var name = "wupeiqi";
var name = String("wupeiqi");
var age_str = String(18);
```

```javascript
// 常用方法
var name = "wupeiqi";

var value = names[0]					// 索引
var value = name.length 				// 获取字符串长度
var value = name.trim()  				// 去除空白
var value = name.charAt(index) 			// 根据索引获取字符
var value = name.substring(start,end) 	// 根据索引获取子序列
```

###### 案例：标题跑马灯

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>真人比例充气老男孩</title>
</head>
<body>

<h1>HTML标签和样式</h1>

<script type="text/javascript">

    setInterval(function () {
        // 从HTML文档的title标签中获取标题文字
        var title = document.title;

        var lastChar = title.charAt(title.length - 1);
        var preString = title.substring(0, title.length - 1);

        var newTitle = lastChar + preString;

        // 新字符串赋值到HTML文档的title标签中。
        document.title = newTitle;
    }, 1000);

</script>
</body>
</html>
```

##### 3. 布尔类型（Boolean）

布尔类型仅包含真假，与Python不同的是其首字母小写。

```javascript
var status = true;
var status = false;

/*
在js中进行比较时，需要注意：
	==       比较值相等
	!=       不等于
	===      比较值和类型相等
	!===     不等于
	||        或
	&&        且
*/
```

##### 4. 数组（Array）

JavaScript中的数组类似于Python中的列表。

```javascript
// 声明
var names = ['武沛齐', '肖峰', '于超']
var names = Array('武沛齐', '肖峰', '于超')
```

```javascript
// 常见方法
var names = ['武沛齐', '肖峰', '于超']

names[0]						// 索引
names.push(ele)     			// 尾部追加元素
var ele = names.obj.pop()     	// 尾部移除一个元素
names.unshift(ele)  			// 头部插入元素
var ele = obj.shift()         	// 头部移除一个元素
names.splice(index,0,ele) 		// 在指定索引位置插入元素
names.splice(index,1,ele) 		// 指定索引位置替换元素
names.splice(index,1)     		// 指定位置删除元素
names.slice(start,end)        	// 切片
names.reverse()      			// 原数组反转
names.join(sep)       			// 将数组元素连接起来以构建一个字符串
names.concat(val,..)  			// 连接数组
names.sort()         			// 对原数组进行排序
```

##### 5. 字典（对象Object）

JavaScript中其实没有字典类型，字典是通过对象object构造出来的。

```javascript
// 声明
info = {
    name:'武沛齐',
    "age":18
}
```

```javascript
// 常用方法
var val = info['name']		// 获取
info['age'] = 20			// 修改
info['gender'] = 'male'		// 新增
delete info['age']			// 删除
```

###### 案例：动态表格

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <style>
        table{
            /*边框合并*/
            border-collapse: collapse;

        }
        table th,table td{
            border: 1px solid #ddd;
            padding: 8px;
        }
        table th{
            font-weight: bold;
        }
    </style>
</head>
<body>

<table>
    <thead>
        <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>性别</th>
        </tr>
    </thead>
    <tbody id="body">

    </tbody>
</table>

<script type="text/javascript">
    var userList = [
        {id:1,name:'武沛齐',gender:'男'},
        {id:2,name:'吴老板',gender:'男'},
        {id:3,name:'肖老板',gender:'男'}
    ];
    // 笨方法
    for(var i in userList){
        var row = userList[i];

        var trNode = document.createElement('tr');

        var tdNodeId = document.createElement('td');
        tdNodeId.innerText = row.id;
        trNode.appendChild(tdNodeId);

        var tdNodeName = document.createElement('td');
        tdNodeName.innerText = row.name;
        trNode.appendChild(tdNodeName);

        var tdNodeGender = document.createElement('td');
        tdNodeGender.innerText = row.gender;
        trNode.appendChild(tdNodeGender);

        var bodyNode = document.getElementById('body');
        bodyNode.appendChild(trNode);
    }
    
    // 简便方法
    /*
    for(var i in userList){
        var row = userList[i];
        var trNode = document.createElement('tr');
        for(var key in row){
             var tdNode = document.createElement('td');
            tdNode.innerText = row[key];
            trNode.appendChild(tdNode);
        }
        var bodyNode = document.getElementById('body');
        bodyNode.appendChild(trNode);
    }
    */
</script>
</body>
</html>
```

##### 6. 其他（null、undefine）

- null是JavaScript语言的关键字，它表示一个特殊值，常用来描述“空值”，相当于Python的None。

- undefined是一个特殊值，表示只是声明而变量未定义。

  ```javascript
  var name;
  console.log(typeof(name));
  ```

#### 4.1.5 条件

Python中的条件语句有两种，用于解决判断的问题。

- if,else，用于判断。

  ```javascript
  var age = 18;
  if(age <18){
      
  }else if(age>=18 and 1 == 1){
      
  }else if(age>=30){
      
  }else{
      
  }
  ```

- switch,case，用于判断等于某些值。

  ```javascript
  var num = 18;
  switch(num){
      case 10:
          console.log('未成年');
          break;
      case 18:
          console.log('成年');
          break;
      case 35:
          console.log('油腻老男人');
          break;
      case 100:
          console.log('....');
          break;
      default:
          console.log('太大了');
  }
  ```

#### 4.1.6 循环语句

JavaScript中循环有两种写法，用于解决循环问题。

- `for(var i in ['国产','日韩','欧美'])`，默认生成索引，适用于：字符串、元组、字典。

  ```javascript
  var names = ['武沛齐', '肖峰', '于超']
  
  for(var index in names){
      console.log(index, names[index])
  }
  ```

- `for(var i=0;i<10;i++)`，自定义索引并设置增加步长，适用于：字符串、元组。（字典索引非有序）

  ```javascript
  var names = ['武沛齐', '肖峰', '于超']
  
  for(var i=0;i<names.lenght;i++){
      console.log(i, names[i])
  }
  ```

#### 4.1.7 异常处理

在JavaScript的异常处理中有两个注意事项：

- 主动抛异常 throw "xx" 或 throw Error({code:1000,error:'错了'})
- catch只能破获一次，如果想要对异常精细化处理可以在catch代码块中再做类型判断。

```javascript
try {
    //这段代码从上往下运行，其中任何一个语句抛出异常该代码块就结束运行
   	var name = ''
}
catch (e) {
    // 如果try代码块中抛出了异常，catch代码块中的代码就会被执行。
    //e是一个局部变量，用来指向Error对象或者其他抛出的对象
}
finally {
     //无论try中代码是否有异常抛出（甚至是try代码块中有return语句），finally代码块中始终会被执行。
}
```

#### 4.1.8 函数

JavaScript中的函数可以简单概括为以下三类：

- 函数

  ```javascript
  function func(arg){
      return arg + 1;
  }
  ```

- 匿名函数

  ```javascript
  function (arg){
      return arg + 1;
  }
  
  // 一般用于当做参数使用，例如：设置定时器 setInterval(function(){},1000)
  ```

- 自执行函数，自动触发执行。

  ```javascript
  (function(arg){
      console.log(arg);
  })('wupeiqi')
  ```

  ```html
  <!--【可选部分】一般用于做数据隔离使用，因为JS中是以函数为作用域，所以当js代码比较多时，通过自执行函数做数据隔离(闭包)。 -->
  
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  
  </head>
  <body>
  <script type="text/javascript">
      funcList = [];
      (function () {
          var name = '武沛齐';
  
          function f1() {
              console.log(name);
          }
          funcList.push(f1);
      })();
  
      (function () {
          var name = 'Alex';
  
          function f2() {
              console.log(name);
          }
  
          funcList.push(f2);
      })();
  
      funcList[0]()
  </script>
  </body>
  </html>
  ```

#### 4.1.9 json 序列化

JavaScript提供了json序列化功能，即：将对象和字符串之间进行转换。

- JSON.stringify(object) ，序列化

  ```javascript
  var info = {name:'alex',age:19,girls:['钢弹','铁锤']}
  var infoStr = JSON.stringify(info)
  console.log(infoStr) # '{"name":"alex","age":19,"girls":["钢弹","铁锤"]}'
  ```

- JSON.parse(str)，反序列化

  ```javascript
  var infoStr = '{"name":"alex","age":19,"girls":["钢弹","铁锤"]}'
  var info = JSON.parse(infoStr)
  console.log(info)
  ```

应用场景：网络中数据传输本质上是基于字符串进行，如果想要把一个js的对象通过网络发送到某个网站，就需要对对象进行序列化然后发送。（以后学习ajax会经常使用）。

#### 总结

以上就是JavaScript语法部分要学习的所有内容。当然，JavaScript语法远不止这些，在以后的案例和学习中会继续扩展。

### 4.2 DOM

文档对象模型（Document Object Model，DOM）是一种用于HTML编程接口。它给文档提供了一种结构化的表示方法，可以改变文档的内容和呈现方式。更直白一点讲：DOM相当于是一个模块，提供了关于HTML文档中对标签进行操作的功能，JavaScript结合DOM可以对HTML中的标签进行操作。

#### 4.2.1 选择器

DOM中提供了一些列的选择器用于在HTML文档中找到指定的相关标签对象。

- 直接查找

  ```javascript
  document.getElementById(arg)             // 根据ID获取一个标签对象
  document.getElementsByClassName(arg)     // 根据class属性获取标签对象集合
  document.getElementsByName(arg)     	// 根据name属性值获取标签对象集合
  document.getElementsByTagName(arg)       // 根据标签名获取标签对象集合
  ```

- 间接查找

  ```javascript
  var tag = document.getElementById(arg);
  
  tag.parentElement           // 找当前标签对象的父标签对象
  tag.children                // 找当前标签对象的所有子标签对象
  tag.firstElementChild       // 找当前标签对象的第一个子标签对象
  tag.lastElementChild        // 找当前标签对象最后一个子标签对象
  tag.nextElementtSibling     // 找当前标签对象下一个兄弟标签对象
  tag.previousElementSibling  // 找当前标签对象上一个兄弟标签对象
  ```

##### 案例：表格中删除案例

<img src=" assets/image-20191028153801573.png" alt="image-20191028153801573" style="zoom:33%;float:left;" />

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <style>
        table {
            /*边框合并*/
            border-collapse: collapse;

        }

        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        table th {
            font-weight: bold;
        }
    </style>
</head>
<body>

<table>
    <thead>
    <tr>
        <th>学号</th>
        <th>姓名</th>
        <th>性别</th>
        <th>操作</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>1</td>
        <td>郭德纲</td>
        <td>男</td>
        <td>
            <input type="button" value="删除" onclick="deleteRow(this);">
        </td>
    </tr>
    <tr>
        <td>2</td>
        <td>于谦</td>
        <td>女</td>
        <td>
            <input type="button" value="删除" onclick="deleteRow(this);">
        </td>
    </tr>
    <tr>
        <td>3</td>
        <td>烧饼</td>
        <td>男</td>
        <td>
            <input type="button" value="删除" onclick="deleteRow(this);">
        </td>
    </tr>

    </tbody>
</table>

<script type="text/javascript">

    /*
    删除表格中当前行的数据
     */
    function deleteRow(self) {
        var rowTr = self.parentElement.parentElement;
        rowTr.remove();
    }
</script>
</body>
</html>
```

#### 4.2.2 文本操作

对标签内部文本进行操作时，可以通过 innerText 和 innerHTML来进行。

- innerText
  - `标签对象.innerText`，读取标签内容（仅文本）。
  - `标签对象.innerText="武"`，修改标签内容（仅文本）。
- innerHTML
  - `标签对象.innerHTML`，读取标签内容（含标签）。
  - `标签对象.innerText="<a href='#'>武</a>"`，修改标签内容（可标签、课文本）。

##### 案例：读取表格文本内容

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <style>
        table {
            /*边框合并*/
            border-collapse: collapse;

        }

        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        table th {
            font-weight: bold;
        }
    </style>
</head>
<body>

<table>
    <thead>
    <tr>
        <th>ID</th>
        <th>网站</th>
        <th>介绍</th>
        <th>读取</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>1</td>
        <td>
            <a href="http://www.baidu.com">百度</a>
        </td>
        <td>百度是一个流氓网站。</td>
        <td>
            <input type="button" value="读取网站innerText" onclick="readSite(this)">
            <input type="button" value="读取网站innerHTML" onclick="readSummary(this)">
        </td>
    </tr>

    </tbody>
</table>

<script type="text/javascript">
    function readSite(self) {
        var tdTag = self.parentElement.previousElementSibling.previousElementSibling;
        console.log(tdTag.innerText);
    }

    function readSummary(self) {
        var tdTag = self.parentElement.previousElementSibling.previousElementSibling;
        console.log(tdTag.innerHTML);
    }
</script>
</body>
</html>
```

#### 4.2.3 值操作

值操作针对与用户交互相关的标签，其中内部使用value属性进行操作。

- 文本框

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  </head>
  <body>
      <input id="user" type="text" value="张鹤伦">
  
      <script type="text/javascript">
          var userTag = document.getElementById('user');
          console.log('获取输入框中的值：',userTag.value);
  
          // 修改input中的值
          userTag.value = "骚浪贱";
          console.log('获取修改完输入框中的值：',userTag.value);
      </script>
  </body>
  </html>
  ```

- 多行文本框

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  </head>
  <body>
  <h1>文章</h1>
  <textarea id="article" cols="30" rows="10">从前有座山，山里有座庙。</textarea>
  
  <input type="button" onclick="showArticle();" value="点击获取"/>
  <input type="button" onclick="setArticle();" value="点击设置"/>
  
  
  <script type="text/javascript">
  
      function showArticle() {
          // 获取textarea的值
          console.log(document.getElementById('article').value);
  
      }
      function setArticle() {
          // 设置textarea的值
          document.getElementById('article').value = "秃驴";
      }
  </script>
  </body>
  </html>
  ```

- 下拉框

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  </head>
  <body>
  <h1>城市</h1>
  <select id="city">
      <option value="10">上海</option>
      <option value="20">北京</option>
      <option value="30">深圳</option>
  </select>
  
  <input type="button" onclick="showCity();" value="点击获取选择"/>
  <input type="button" onclick="setCity();" value="点击设置"/>
  
  
  <script type="text/javascript">
  
      function showCity() {
          // 获取select下拉框选中项的值
          var cityTag = document.getElementById('city');
          console.log(cityTag.value);
      }
      function setCity() {
          // 设置select下拉框选中项的值，让select去选中。
          document.getElementById('city').value = "30";
      }
  </script>
  </body>
  </html>
  ```

- 单选框，通过value可以取值。但在应用时常常是以选择形式出现，所以在使用过程中还会去判断他是否已被选中。
  扩展：`标签对象.checked` 可以对选中状态进行读取和设置。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  </head>
  <body>
  <input type="radio" name="gender" value="11"/>男
  <input type="radio" name="gender" value="33"/>女
  <input type="radio" name="gender" value="66"/>中
  
  <input type="button" onclick="showGender();" value="点击获取选择"/>
  <input type="button" onclick="setGender();" value="点击设置选择状态"/>
  
  <script type="text/javascript">
      function showGender() {
          var radios = document.getElementsByName('gender');
  
          // 循环所有的radio标签，找到被选中的radio，获取他的value值。
          for (var i = 0; i < radios.length; i++) {
              if (radios[i].checked) {
                  // 弹出选中值
                  console.log(radios[i].value);
                  // 选中后退出循环
                  break;
              }
          }
      }
      function setGender(){
          var radios = document.getElementsByName('gender');
  
          // 循环所有的radio标签，找到被选中的radio，获取他的value值。
          for (var i = 0; i < radios.length; i++) {
              if (radios[i].value === "33") {
  				radios[i].checked = true;
              }
          }
      }
  
  </script>
  </body>
  </html>
  ```

- 复选框，通过value可以取值。但在应用时常常是以多选形式出现，所以在使用过程中还会去判断他是否已被选中。
  扩展：`标签对象.checked` 可以对选中状态进行读取和设置。

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>JavaScript学习</title>
  </head>
  <body>
  <h1>爱好</h1>
  <input class="hobby" type="checkbox" value="1">足球
  <input class="hobby" type="checkbox" value="2">篮球
  <input class="hobby" type="checkbox" value="3">乒乓球
  
  <input type="button" onclick="showHobby();" value="点击获取选择"/>
  <input type="button" onclick="setHobby();" value="点击设置选择"/>
  
  <script type="text/javascript">
  
      function showHobby() {
          var valueList = [];
          var checkboxList = document.getElementsByClassName('hobby');
  
          for (var i = 0; i < checkboxList.length; i++) {
              if (checkboxList[i].checked) {
                  // 弹出选中值
                  valueList.push(checkboxList[i].value);
              }
          }
          console.log(valueList);
      }
      function setHobby() {
           var checkboxList = document.getElementsByClassName('hobby');
  
          for (var i = 0; i < checkboxList.length; i++) {
              if(checkboxList[i].value === '1' || checkboxList[i].value === '3') {
  
                  checkboxList[i].checked = true;
              }else{
                  checkboxList[i].checked = false;
              }
          }
      }
  </script>
  </body>
  </html>
  ```

##### 案例：表格多选、反选、取消

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <style>
        table {
            /*边框合并*/
            border-collapse: collapse;

        }

        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        table th {
            font-weight: bold;
        }

    </style>
</head>
<body>
<div>
    <input type="button" value="全选" onclick="checkAll();"/>
    <input type="button" value="取消" onclick="cancelAll();"/>
    <input type="button" value="反选" onclick="reverseCheck();"/>

</div>
<table>
    <thead>
    <tr>
        <th>选择</th>
        <th>姓名</th>
        <th>性别</th>

    </tr>
    </thead>
    <tbody id="tableBody">
    <tr>
        <td><input type="checkbox" value="1"/></td>
        <td>郭德纲</td>
        <td>男</td>

    </tr>
    <tr>
        <td><input type="checkbox" value="2"/></td>
        <td>于谦</td>
        <td>女</td>

    </tr>
    <tr>
        <td><input type="checkbox" value="2"/></td>
        <td>烧饼</td>
        <td>男</td>

    </tr>

    </tbody>
</table>

<script type="text/javascript">

    /* 全选 */
    function checkAll() {
        var trTagList = document.getElementById('tableBody').children;
        for (var i = 0; i < trTagList.length; i++) {
            var trTag = trTagList[i];

            var inputTag = trTagList[i].firstElementChild.firstElementChild;
            inputTag.checked = true;
        }
    }

    /* 取消 */
    function cancelAll() {
        var trTagList = document.getElementById('tableBody').children;
        for (var i = 0; i < trTagList.length; i++) {
            var trTag = trTagList[i];

            var inputTag = trTagList[i].firstElementChild.firstElementChild;
            inputTag.checked = false;
        }
    }

    /* 取消 */
    function reverseCheck() {
        var trTagList = document.getElementById('tableBody').children;
        for (var i = 0; i < trTagList.length; i++) {
            var trTag = trTagList[i];

            var inputTag = trTagList[i].firstElementChild.firstElementChild;
            // inputTag.checked = ! inputTag.checked;
            inputTag.checked = inputTag.checked ? false : true;
        }
    }

</script>
</body>
</html>
```



#### 4.3.4 class 属性操作

DOM中主要提供了三个帮助我们操作class属性值的功能：

- `标签对象.className`，class属性对应的值直接操作。
- `标签对象.classList.remove(cls) `，class属性对应值删除某个样式。
- `标签对象.classList.add(cls)`，class属性中添加样式。

##### 案例：模态对话框

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

        .container{
            width: 980px;
            margin: 0 auto;
        }
        .header{
            height: 48px;
            background-color: #499ef3;
        }
        .shade{
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: black;
            opacity: 0.7;
        }
        .login{
            width: 400px;
            height: 300px;
            background-color: white;
            border: 1px solid #dddddd;
            position: fixed;
            top: 60px;
            left: 50%;
            margin-left: -200px;
        }
        .hide{
            display: none;
        }
    </style>
</head>
<body>

    <div class="header">
        <div style="float: right;margin: 10px;">
            <a onclick="showDialog();" style="padding: 5px 10px;background-color: goldenrod;color: white;">登录</a>
        </div>
    </div>
    <div class="body">
        <div class="container" style="text-align: center">
            <img src="https://images.cnblogs.com/cnblogs_com/wupeiqi/662608/o_big_girl.png" alt="">
        </div>
    </div>

    <!--遮罩层-->
    <div id="shade" class="shade hide"></div>

    <!--登录框-->
    <div id="login" class="login hide">
        <h2 style="text-align: center">用户登录</h2>
        <a onclick="hideDialog();" style="padding: 5px 10px;background-color: cornflowerblue;color: white;">关闭</a>
    </div>
    <script type="text/javascript">
        function showDialog() {
            document.getElementById('shade').classList.remove('hide');
            document.getElementById('login').classList.remove('hide');
        }
        function hideDialog() {
            document.getElementById('shade').classList.add('hide');
            document.getElementById('login').classList.add('hide');
        }
    </script>
</body>
</html>
```

#### 4.3.5 style 样式操作

如果想要对样式操作的粒度更细一些，可以使用style样式操作，他比class属性对样式的操作粒度更细。

例如：修改下标签的背景颜色。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
</head>
<body>
    <div id="header" style="height: 48px;background-color: red;"></div>

    <script type="text/javascript">
        document.getElementById('header').style.backgroundColor = 'green';
    </script>
</body>
</html>
```

##### 案例：点赞+1效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript学习</title>
    <style>
        body {
            margin: 0;
        }

        .container {
            width: 980px;
            margin: 0 auto;
        }

        .item {

            height: 120px;
            border: 1px solid #dddddd;
            margin-top: 20px;
            padding: 10px;
        }

        .item .title {
            margin-bottom: 10px;
            font-weight: bold;
        }

        .item img {
            width: 60px;
            height: 60px;
        }

        .item .favor {
            position: relative;
            cursor: pointer;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="item">
        <div class="title">震惊了...</div>
        <img src="https://images.cnblogs.com/cnblogs_com/wupeiqi/662608/o_20130809170025.png" alt="">
        <div class="favor" onclick="doFavor(this);">赞</div>
    </div>

    <div class="item">
        <div class="title">冷酷无情，无理取闹...</div>
        <img src="https://images.cnblogs.com/cnblogs_com/wupeiqi/662608/o_20130809170025.png" alt="">
        <div class="favor" onclick="doFavor(this);">赞</div>
    </div>
</div>
<script type="text/javascript">
    function doFavor(self) {
        var plusTag = document.createElement('span');
        var fontSize = 10;
        var marginLeft = 10;
        var marginTop = 10;
        var opacity = 1;

        plusTag.innerText = "+1";
        plusTag.style.color = 'green';
        plusTag.style.position = 'absolute';
        plusTag.style.fontSize = fontSize + 'px';
        plusTag.style.marginLeft = marginLeft + 'px';
        plusTag.style.marginTop = marginTop + 'px';
        plusTag.style.opacity = opacity;

        self.appendChild(plusTag);

        var interval = setInterval(function () {
            fontSize += 5;
            marginLeft += 5;
            marginTop -= 5;
            opacity -= 0.2;
            plusTag.style.fontSize = fontSize + 'px';
            plusTag.style.marginLeft = marginLeft + 'px';
            plusTag.style.marginTop = marginTop + 'px';
            plusTag.style.opacity = opacity;

            if (opacity <= 0) {
                self.removeChild(plusTag);
                clearInterval(interval);
            }
        }, 100)
    }
</script>
</body>
</html>
```

#### 4.3.6 事件

DOM中可以为标签设置事件，给指定标签绑定事件之后，只要对应事件被处罚，就会执行对应代码。常见事件有：

- `onclick`，单击时触发事件
- `ondblclick`，双击触发事件
- `onchange`，内容修改时触发事件
- `onfocus`，获取焦点时触发事件
- `onblur`，失去焦点触发事件
- 其他事件
  <img src=" assets/image-20191028174219720.png" alt="image-20191028174219720" style="zoom: 35%;" />

##### 案例：修改下拉框触发change事件

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>DOM学习</title>
</head>
<body>
<select id="city" onchange="changeEvent(this);">
    <option value="10">普通青年</option>
    <option value="20">文艺青年</option>
    <option value="30">二逼青年</option>
</select>

<script type="text/javascript">

    function changeEvent(self) {
        console.log(self.value);
    }
</script>
</body>
</html>
```

##### 案例：左侧菜单点击切换

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSS学习</title>
    <style>
        body {
            margin: 0;
        }

        .header {
            height: 48px;
            background-color: #499ef3;
        }

        .body .menu {
            position: fixed;
            top: 48px;
            left: 0;
            bottom: 0;
            width: 220px;
            border-right: 1px solid #dddddd;
            overflow: scroll;
        }

        .body .content {
            position: fixed;
            top: 48px;
            right: 0;
            bottom: 0;
            left: 225px;
            /* 超出范围的话，出现滚轮 */
            overflow: scroll;
        }

        .body .menu .title {
            padding: 8px;
            border-bottom: 1px solid #dddddd;
            background-color: #5f4687;
            color: white;

        }

        .body .menu .child {
            border-bottom: 1px solid #dddddd;
        }

        .body .menu .child a {
            display: block;
            padding: 5px 10px;
            color: black;
            text-decoration: none;
        }

        .body .menu .child a:hover {
            background-color: #dddddd;

        }

        .hide {
            display: none;
        }
    </style>
</head>
<body>
<div class="header"></div>
<div class="body">
    <div class="menu">
        <div class="item">
            <div class="title" onclick="showMenu(this);">国产</div>
            <div class="child">
                <a href="#">少年的你</a>
                <a href="#">我不是药神</a>
                <a href="#">我和我的祖国</a>
            </div>
        </div>
        <div class="item">
            <div class="title" onclick="showMenu(this);">欧美</div>
            <div class="child hide ">
                <a href="#">战争之王</a>
                <a href="#">华尔街之狼</a>
                <a href="#">聚焦</a>
            </div>
        </div>
        <div class="item">
            <div class="title" onclick="showMenu(this);">韩国</div>
            <div class="child hide">
                <a href="#">坏家伙们</a>
                <a href="#">寄生虫</a>
                <a href="#">燃烧</a>
            </div>
        </div>
    </div>
    <div class="content"></div>
</div>

<script type="text/javascript">

    function showMenu(self) {
        var childList = document.getElementsByClassName('child');
        for (var i = 0; i < childList.length; i++) {
            childList[i].classList.add('hide');
        }
        self.nextElementSibling.classList.remove('hide');
    }
</script>
</body>
</html>
```

##### 案例：请输入搜索关键字

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>DOM</title>

    <style>
        .gray {
            color: gray;
        }

        .black {
            color: black;
        }
    </style>

</head>
<body>
<input type='text' class='gray' value='请输入关键字' onfocus='getFocus(this);' onblur='leave(this);'/>

<script type="text/javascript">

    function getFocus(self) {
        self.className = 'black';
        if (self.value === '请输入关键字' || self.value.trim().length === 0) {
            self.value = '';
        }
    }

    function leave(self) {

        if (self.value.length === 0) {
            self.value = '请输入关键字';
            self.className = 'gray';
        } else {
            self.className = 'black';
        }
    }

</script>
</body>
</html>
```

###  4.3 BOM

BOM（Browser Object Model）是指浏览器对象模型，通过他，可以操作浏览器相关的功能。更直白一点讲：BOM相当于是一个模块，提供了关于浏览器操作的功能。

#### 4.3.1 提示框

- `alert`，提示框。
- `confirm`，确认框。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>BOM</title>
</head>
<body>
<input type="button" value="提示框" onclick="showAlert();">
<input type="button" value="确认框" onclick="showConfirm();">
<script type="text/javascript">
    function showAlert() {
        alert('震惊了，Alex居然..');
    }

    function showConfirm() {
        // 显示确认框
        // result为true，意味着点击了确认。
        // result为false，意味着点击了取消。
        var result = confirm('请确认是否删除？');
        console.log(result);
    }
</script>
</body>
</html>
```

#### 4.3.2 浏览器URL

- `location.href`，获取当前浏览器URL。
- `location.href = "url"`，设置URL，即：重定向。
- `location.reload()`，重新加载，即：刷新页面。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>BOM</title>
</head>
<body>
<input type="button" value="获取当前URL" onclick="getUrl();">
<input type="button" value="重新加载页面" onclick="reloadPage();">
<input type="button" value="重定向到百度" onclick="redirectToBaidu();">

<script type="text/javascript">
    function getUrl() {
        console.log(location.href);
    }

    function reloadPage() {
        location.reload();
    }

    function redirectToBaidu() {
        location.href = "http://www.baidu.com";
    }
</script>
</body>
</html>
```

#### 4.3.3 定时器

- `setInterval(function(){},1000)`，创建多次定时器。
- `clearInterval(定时器对象)`，删除多次定时器。
- `setTimeout(function(){},1000)`，创建单次定时器。
- `clearTimeout(定时器对象)`，删除单次定时器。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>BOM</title>
</head>
<body>

<h1>计时器：<span id="time"></span></h1>
<input type="button" value="开始计时" onclick="start();">
<input type="button" value="停止计时" onclick="stop();">

<script type="text/javascript">
    var time;

    function start() {
        time = 0;
        document.getElementById('time').innerText = time;

        interval = setInterval(function () {
            time += 1;
            document.getElementById('time').innerText = time;
        }, 1000);
    }

    function stop() {
        clearInterval(interval)
    }
</script>
</body>
</html>
```



































