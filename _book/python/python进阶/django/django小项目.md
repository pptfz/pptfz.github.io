[toc]



# django小项目(基于django1.11.9)

# 一、利用form表单简单的登陆认证

**整个项目的目录及文件**

![iShot2020-10-16 14.07.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.07.24.png)





# 1.urls文件配置

```python
from django.conf.urls import url
from django.contrib import admin

#从应用程序中导入视图文件
from app01 import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
  
    #这里匹配的路径是模拟登陆成功后返回的页面
    url(r'^home/', views.home),
  
    #这里匹配的路径就是模拟form表单中登陆的界面
    url(r'^login/', views.login),
    # url(r'^login/', views.LoginView.as_view()),
]
```

# 2.views文件配置

```python
#导入相关模块
from django.shortcuts import render,HttpResponse,redirect

# Create your views here.

#写一个函数，如果登陆成功就返回index.html页面，这里随便写了一个index.html页面
def home(request):
    # return HttpResponse('登陆成功')
    return render(request,'index.html')

#写一个函数，用户名和密码这里为固定的admin，如果登陆成功就重定向到/home  如果登陆失败就还返回登陆界面
def login(request):
    if request.method == 'GET':
        return render(request,'login.html')
    else:
        uname = request.POST.get('username')
        pwd = request.POST.get('password')

        if uname == 'admin' and pwd == 'admin':
            # return HttpResponse('登陆成功')
            return redirect('/home/')
        else:
            # return HttpResponse('登陆失败')
            return redirect('/login/')
```

# 3.settings文件配置

**为了验证POST请求效果，修改settings文件如下**

```python
Django项目下同名目录中的settings文件，48行
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```





# 4.html文件

## 4.1login.html文件

**简单的form表单登陆界面，login.html文件存放于templates目录下**

```python
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form action="" method="post">
    用户名：<input type="text" name="username">
    密码：<input type="password" name="password">
    <input type="submit" value="登陆">
</form>

</body>
</html>
```



![iShot2020-10-16 14.08.08](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.08.08.png)



## 4.2index.html文件

**登陆成功后返回的界面，index.html文件存放于templates目录下**

```python
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="/static/bootstrap-3.3.7-dist/css/bootstrap.min.css">
</head>
<body>
<div class="container-fluid">
    <h1>查看书籍</h1>
    <div class="row">
    <div class="col-md-9 col-md-push-3">
        <button type="button" class="btn btn-primary">添加书籍</button>

    <table class="table table-striped">
        <thead>
        <tr>
            <th>编号</th>
            <th>书籍名称</th>
            <th>价格</th>
            <th>出版日期</th>
            <th>出版社</th>
            <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>1</td>
            <td>python从入门到放弃</td>
            <td>9.9</td>
            <td>2012-12-12</td>
            <td>人民出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
        <tr>
            <td>2</td>
            <td>Linux从入门到放弃</td>
            <td>10.11</td>
            <td>2013-12-12</td>
            <td>机械出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
        <tr>
            <td>3</td>
            <td>mysql从删库到跑路</td>
            <td>66</td>
            <td>2015-12-12</td>
            <td>北京出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
         <tr>
            <td>4</td>
            <td>隔壁老王的故事</td>
            <td>100</td>
            <td>2016-11-11</td>
            <td>上海出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
         <tr>
            <td>5</td>
            <td>放开那个女孩！！！</td>
            <td>30</td>
            <td>2017-11-11</td>
            <td>广州出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
         <tr>
            <td>6</td>
            <td>GO语言从入门到放弃</td>
            <td>50</td>
            <td>2018-11-11</td>
            <td>北方出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
         <tr>
            <td>7</td>
            <td>金瓶梅是一本什么样的书</td>
            <td>7.7</td>
            <td>2019-12-12</td>
            <td>南方出版社</td>
            <td>
                  <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>
            </td>
        </tr>
         <tr>
            <td>8</td>
            <td>隔壁母猪的叫声</td>
            <td>66</td>
            <td>2020-01-01</td>
            <td>生活出版社</td>
            <td>
                <button type="button" class="btn btn-warning">编辑</button>
                <button type="button" class="btn btn-danger">删除</button>

            </td>
        </tr>
        </tbody>
    </table>

    </div>


    </div>
</div>


</body>
    <script src="jquery.js"></script>
    <script src="/static/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>
</html>
```

## 4.3静态文件的相关配置

**由于index.html文件中引入了bootstrap，因此需要进行相关的配置**

**第一步、在项目的同级目录下创建一个名为static_file的目录，用于存放静态文件，并且在这个目录下引入bootstrap**

![iShot2020-10-16 14.08.43](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.08.43.png)



**第二步、修改setting配置文件**

```python
在index.html文件中引入的bootstrap是这样写的
<link rel="stylesheet" href="/static/bootstrap-3.3.7-dist/css/bootstrap.min.css">


//需要设置的项如下
static是什么？static是settings配置文件中设置的路径别名，设置项如下
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'static_file'),
]


os.path.join(BASE_DIR,'static_file')这一项中的static_file是django项目同目录级别下的目录，用于存放静态文件，而STATIC_URL = '/static/'中的static则是访问时候的别名，这里说的访问指的是index.html文件中引入bootstrap指定的路径开头的static

这里需要说明一下，给静态文件设置别名是为了安全，因为别人访问只能找到你的别名路径，而不知道真正的存放路径，真正的路径是/static——file/bootstrap-3.3.7-dist/css/bootstrap.min.css，而客户访问的路径则是/static/bootstrap-3.3.7-dist/css/bootstrap.min.css

需要注意的是，必须设置别名才可以引入bootstrap样式，否则不生效
```



# 5.访问效果

**输入正确的用户名返回index.html，登陆失败还是则重定向到登陆界面**

![login2](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/login2.gif)





# 二、项目一的提升版，与后台进行数据交互

**项目一中实现的书籍编辑界面只是一个静态页面，现在将添加书籍、编辑、删除按钮实现与后台交互功能**

# 1.urls文件配置

```python
from django.conf.urls import url
from django.contrib import admin
from app01 import views
urlpatterns = [
    url(r'^admin/', admin.site.urls),
  
  	#访问路径为book/list，起了一个url别名book_list
    url(r'^book/list', views.book_list, name='book_list'),
  	
    #后续页面中有一个添加书籍的按钮，这里设置为点击添加数据跳转到另外一个页面
  	url(r'^book/add', views.book_add, name='book_add'),
  
    #后续页面中有一个编辑书籍的按钮，这里设置为编辑书籍
    url(r'^book/edit/', views.book_edit, name='book_edit'),
  
    #后续页面中有一个删除书籍的按钮
    url(r'^book/del/(\d+)/', views.book_del, name='book_del'),
]
```



# 2.views文件配置

**展示页面和添加书籍的配置**

```python
from django.shortcuts import render,HttpResponse,redirect
from app01 import models
from django.urls import reverse
# Create your views here.

def book_list(request):
    all_books = models.Book.objects.all()
    return render(request,'book_list.html',{'all_books':all_books})


def book_add(request):
    #如果是get请求就返回添加书籍的页面
    if request.method == 'GET':
        return render(request,'book_add.html')
    else:
        #打印一下请求的post方法
        print(request.POST)
        # < QueryDict: {'csrfmiddlewaretoken': ['M5sNsaCjFaTCDjy8AGfEmDaeC5GCKDvClAQpHLdHCzUjZGtLMWjwi2YPXdzr6482'],
        #               'title': ['我是一本书'], 'price': ['9'], 'publish_date': ['2019-11-30'], 'publish': ['奔跑出版社']} >

        #添加书籍low版写法
        #添加书籍，请求是post，在book_add.html中的form表单定义，分别获取各个字段
        # title = request.POST.get('title')
        # price = request.POST.get('price')
        # publish_date = request.POST.get('publish_date')
        # publish = request.POST.get('publish')

        #添加书籍，牛逼版写法
        #代码意思为删除返回的post请求中的这个键，剩下的就是表中的字段和添加的信息对应的字典了
        data = request.POST.dict()
        del data['csrfmiddlewaretoken']


        #上边已经获取了各个字段，现在要把获取的字段添加到数据库中
        models.Book.objects.create(
            #low版写法，比较麻烦
            # title=title,
            # price=price,
            # publish_date=publish_date,
            # publish=publish,

            #牛逼版写法
            **data

            #⚠️这里用到的是字典打散的用法，字典中的键必须和表中的字段名相同，而book_add中input标签中定义的name属性就是表中的字段名，因此返回的post请求中的字典的键就和表中的字段名相同了，所以这里可以用字典打散
        )
        #对于GET方法，不加reverse也可以
        return redirect('book_list')
```

**编辑书籍的配置**

**编辑书籍的重点是点击编辑书籍，需要找到编辑按钮对应的那一行的数据**

**获取写法一**

```python
def book_edit(request):
    if request.method == 'GET':
        #这里就拿到了后台提交过来的编辑按钮对应的那一行的数据，
        book_id = request.GET.get('id')

        #这里是获取表中的对应编辑按钮的那一行数据的id，这里最好写pk=book_id，因为orm会自动帮我们创建一个id字段，但是如果后续我们自定义的字段不叫id，这里写pk就比较合适了，pk是主键的意思
        old_book_obj = models.Book.objects.filter(pk=book_id)[0]

        return render(request,'book_edit.html',{'old_book_obj':old_book_obj})
```





**获取写法二**

```python
//方式二 直接传参book.id而不需要在后面写上对应的路径
<a href="{% url 'book_edit' book.id %}" class="btn btn-warning btn-sm">编辑</a>

//如果为以上的写法，则url文件中编辑路径需要修改为如下，即edit后边跟一个参数
url(r'^book/edit/(\d+)', views.book_edit, name='book_edit'),

//views中的写法
def book_edit(request,book_id):
    if request.method == 'GET':
        #这里就拿到了后台提交过来的编辑按钮对应的那一行的数据，
        # book_id = request.GET.get('id')

        #这里是获取表中的对应编辑按钮的那一行数据的id，这里最好写pk=book_id，因为orm会自动帮我们创建一个id字段，但是如果后续我们自定义的字段不叫id，这里写pk就比较合适了，pk是主键的意思
        old_book_obj = models.Book.objects.filter(pk=book_id)[0]
        return render(request,'book_edit.html',{'old_book_obj':old_book_obj})
```





**编辑按钮携带数据写法**

```python
<a href="{% url 'book_edit' %}?book_id={{ book.id }}" class="btn btn-warning btn-sm">编辑</a>#}

{#   <a href="/book/edit/{{ book.id }}/" class="btn btn-warning btn-sm">编辑</a>#}

<a href="{% url 'book_edit' book.id %}" class="btn btn-warning btn-sm">编辑</a>
```

**url别名反向解析时 如果需要参数**

```python
html
	{% url '别名' 3 %}         url(r'^index/(\d+)/',views.index,name='index');
	-- /index/3/
	
views视图
	reverse('index',args=(3,))    -- /index/3/
```



**删除书籍的配置**





# 3.settings文件配置

```python
#关于静态文件的配置项
在index.html文件中引入的bootstrap是这样写的
<link rel="stylesheet" href="/static/bootstrap-3.3.7-dist/css/bootstrap.min.css">


//需要设置的项如下
static是什么？static是settings配置文件中设置的路径别名，设置项如下
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'statics'),	#⚠️这里的名字不要和上边的static重名
]


os.path.join(BASE_DIR,'statics')这一项中的statics是django项目同目录级别下的目录，用于存放静态文件，而STATIC_URL = '/static/'中的static则是访问时候的别名，这里说的访问指的是index.html文件中引入bootstrap指定的路径开头的static

这里需要说明一下，给静态文件设置别名是为了安全，因为别人访问只能找到你的别名路径，而不知道真正的存放路径，真正的路径是/statics/bootstrap-3.3.7-dist/css/bootstrap.min.css，而客户访问的路径则是/static/bootstrap-3.3.7-dist/css/bootstrap.min.css

需要注意的是，必须设置别名才可以引入bootstrap样式，否则不生效



#关于数据库的配置项目
#先注释默认项
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'book',				#数据库名
        'HOST': '127.0.0.1',	#数据库IP
        'PORT': '3306',				#数据库端口
        'USER': 'root',				#数据库用户
        'PASSWORD': 'xxx'			#数据库密码
    }
}
```



# 4.Django项目同名目录下的``__init__.py``文件

```python
import pymysql
pymysql.install_as_MySQLdb()
```

# 5.models文件配置

```python
from django.db import models
class Book(models.Model):
    title = models.CharField(max_length=32)
    price = models.FloatField()
    publish_date = models.DateField()
    publish = models.CharField(max_length=32)
```

**models文件为创建表操作，配置完成后需要进入django项目下进行数据库同步**

```python
python3 manage.py makemigrations
python3 manage.py migrate
```

![iShot2020-10-16 14.09.27](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.09.27.png)



**同步完数据库查看表**

![iShot2020-10-16 14.09.48](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.09.48.png)



**向表中插入几条数据**

```python
#向表中插入数据
insert into app01_book values(1,'linux从入门到放弃',99,'2010-10-10','工业出版社'),(2,'mysql之从删库到跑路',100,'2018-11-11','跑路出版社'),(3,'隔壁老王的故事',66.6,'2020-02-02','老王出版社');


#查看插入的数据
mysql> select * from app01_book;
+----+----------------------------+-------+--------------+-----------------+
| id | title                      | price | publish_date | publish         |
+----+----------------------------+-------+--------------+-----------------+
|  1 | linux从入门到放弃          |    99 | 2010-10-10   | 工业出版社      |
|  2 | mysql之从删库到跑路        |   100 | 2018-11-11   | 跑路出版社      |
|  3 | 隔壁老王的故事             |  66.6 | 2020-02-02   | 老王出版社      |
+----+----------------------------+-------+--------------+-----------------+
3 rows in set (0.00 sec)
```





# 6.html文件配置

**这里先说明一下静态文件的引入，我们自定义了返回book_list.html，在这个文件中需要引入jquery和bootstrap**

```html
{#在settings文件中定义了静态文件的别名为static，这里为导入这个路径，即static_file#}
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="{% static 'bootstrap-3.3.7-dist/css/bootstrap.min.css' %}">
</head>
<body>

</body>
{#以下为引入jquery和bootstrap，因为在settings文件中已经定义了静态文件的别名static，因此直接引入就能自动找到static_file下存放的jquery和bootstrap文件#}
<script src="{% static 'jquery.js' %}"></script>
<script src="{% static 'bootstrap-3.3.7-dist/js/bootstrap.min.js' %}"></script>
</html>
```



book_list.html

```html
{#在settings文件中定义了静态文件的别名为static，这里为导入这个路径，即static_file#}
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="{% static 'bootstrap-3.3.7-dist/css/bootstrap.min.css' %}">
</head>
<body>
<div class="container-fluid">
    <h1>查看书籍</h1>
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
{#            添加一个添加书籍按钮，这里用到了url别名，即url文件中定义的访问book/add的url别名#}
            <a href="{% url 'book_add' %}" class="btn btn-primary">添加书籍</a>
            <table class="table table-striped table-hover table-bordered">
                <thead>
                    <tr>
                        <th>编号</th>
                        <th>书名</th>
                        <th>价格</th>
                        <th>出版日期</th>
                        <th>出版社</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
{#                因为这里要获取到的是从数据库中读取的数据，因此需要循环展示views中all_books，即获取到的所有书籍的信息#}
                {% for book in all_books %}
                    <tr>
{#                        这里为展示循环的次数#}
                        <td>{{ forloop.counter }}</td>

{#                        下边为获取书名、价格、出版日期、出版社等等#}
                        <td>{{ book.title }}</td>
                        <td>{{ book.price }}</td>
{#                        这里需要用过滤器展示时间显示，否则是这样的Oct. 10, 2010#}
                        <td>{{ book.publish_date | date:'Y-m-d'}}</td>
                        <td>{{ book.publish }}</td>
{#                        定义两个按钮、编辑、删除#}
                        <td>
{#                            方式一 点击编辑按钮跳转到url别名为book_edit的路径，并且还携带了对应的book id#}
{#                            <a href="{% url 'book_edit' %}?id={{ book.id }}" class="btn btn-warning btn-sm">编辑</a>#}

{#                            方式二 直接传参book.id而不需要在后面写上对应的路径#}
                            <a href="{% url 'book_edit' book.id %}" class="btn btn-warning btn-sm">编辑</a>
                            <a href="{% url 'book_del' book.id %}" class="btn btn-danger btn-sm">删除</a>
                        </td>
                    </tr>
                {% endfor %}

                </tbody>
            </table>

        </div>
    </div>
</div>

</body>
{#以下为引入jquery和bootstrap，因为在settings文件中已经定义了静态文件的别名static，因此直接引入就能自动找到static_file下存放的jquery和bootstrap文件#}
<script src="{% static 'jquery.js' %}"></script>
<script src="{% static 'bootstrap-3.3.7-dist/js/bootstrap.min.js' %}"></script>
</html>

```



book_edit.html

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="{% static 'bootstrap-3.3.7-dist/css/bootstrap.min.css' %}">
</head>
<body>

<div class="container-fluid">
    <h1>编辑书籍</h1>
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <form action="" method="post">
                {% csrf_token %}
                <div class="form-group">
                    <label for="title">书籍名称</label>


                    <input type="text" class="form-control" id="title" placeholder="书籍名称" name="title" value="{{ old_book_obj.title }}">
                </div>

                <div class="form-group">
                    <label for="price">价格</label>
                    <input type="number" class="form-control" id="price" placeholder="价格" name="price" value="{{ old_book_obj.price }}">
                </div>
                <div class="form-group">
                    <label for="publish_date">出版日期</label>

{#                    日期这里需要用过滤器过滤一下，否则不显示#}
                    <input type="date" class="form-control" id="publish_date" name="publish_date" value="{{ old_book_obj.publish_date|date:'Y-m-d' }}">
                </div>
                <div class="form-group">
                    <label for="publish">出版社</label>
                    <input type="text" class="form-control" id="publish" placeholder="出版社" name="publish" value="{{ old_book_obj.publish }}" >
                </div>

                <button type="submit" class="btn btn-success pull-right">提交</button>
            </form>


        </div>

    </div>


</div>


</body>
<script src="{% static 'jquery.js' %}"></script>
<script src="{% static 'bootstrap-3.3.7-dist/js/bootstrap.min.js' %}"></script>
</html>

```



book_add.html

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="{% static 'bootstrap-3.3.7-dist/css/bootstrap.min.css' %}">
</head>
<body>

<div class="container-fluid">
    <h1>添加书籍</h1>
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <form action="" method="post">
                {% csrf_token %}
                <div class="form-group">
                    <label for="title">书籍名称</label>
                    <input type="text" class="form-control" id="title" placeholder="书籍名称" name="title">
                </div>

                <div class="form-group">
                    <label for="price">价格</label>
                    <input type="number" class="form-control" id="price" placeholder="价格" name="price">
                </div>
                <div class="form-group">
                    <label for="publish_date">出版日期</label>
                    <input type="date" class="form-control" id="publish_date" name="publish_date">
                </div>
                <div class="form-group">
                    <label for="publish">出版社</label>
                    <input type="text" class="form-control" id="publish" placeholder="出版社" name="publish">
                </div>

                <button type="submit" class="btn btn-success pull-right">提交</button>
            </form>
        </div>
    </div>
</div>

</body>
<script src="{% static 'jquery.js' %}"></script>
<script src="{% static 'bootstrap-3.3.7-dist/js/bootstrap.min.js' %}"></script>
</html>

```



**最终效果**

![book](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/book.gif)







# 三、项目二的进阶版本，项目二中用到的是单表增删改查，现在改为多表进行增删改查

**表字段及表之间的关系**

![iShot2020-10-16 14.10.45](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.10.45.png)



# 1.urls文件配置

```python
from django.conf.urls import url
from django.contrib import admin
from app01 import views
urlpatterns = [
    url(r'^admin/', admin.site.urls),
  
  	#访问路径为book/list，起了一个url别名book_list
    url(r'^book/list', views.book_list, name='book_list'),
  	
    #后续页面中有一个添加书籍的按钮，这里设置为点击添加数据跳转到另外一个页面
  	url(r'^book/add', views.book_add, name='book_add'),
  
    #后续页面中有一个编辑书籍的按钮，这里设置为编辑书籍
    url(r'^book/edit/', views.book_edit, name='book_edit'),
  
    #后续页面中有一个删除书籍的按钮
    url(r'^book/del/(\d+)/', views.book_del, name='book_del'),
]
```

# 2.views文件配置

**展示页面和添加书籍**

```python
#展示书籍
def book_list(request):
    all_books = models.Book.objects.all()

    return render(request,'book_list.html',{'all_books':all_books})

#添加书籍
def book_add(request):
    all_publish = models.Publish.objects.all()

    all_author = models.Author.objects.all()



    #如果是get请求就返回添加书籍的页面
    if request.method == 'GET':
        return render(request,'book_add.html',{'all_publish':all_publish,'all_author':all_author})
    else:
        #打印一下请求的post方法
        print(request.POST)
        """
        ⚠️csrm我们是不需要到，还要注意到是，这次提交过来的数据有作者信息，但是book表中没有作者相关信息，因此还需要去掉结尾的作者信息
        
        < QueryDict: {'csrfmiddlewaretoken': ['6auuMHKofHokDAZr04FGVyRVk0u2AXFSFFS61ilMc6p1ZXU4ckJyRXFwF8nRWoii'],
'title': ['天龙八部'], 'price': ['99'], 'publishDate': ['2019-11-22'], 'publishs_id': ['1']，'authors': ['2', '3']} >
        """


        #添加书籍low版写法
        #添加书籍，请求是post，在book_add.html中的form表单定义，分别获取各个字段
        # title = request.POST.get('title')
        # price = request.POST.get('price')
        # publish_date = request.POST.get('publish_date')
        # publish = request.POST.get('publish')

        #添加书籍，牛逼版写法
        #代码意思为删除返回的post请求中的这个键，剩下的就是表中的字段和添加的信息对应的字典了


        # data = request.POST.dict()
        # del data['csrfmiddlewaretoken']


        #上边已经获取了各个字段，现在要把获取的字段添加到数据库中
        # models.Book.objects.create(
            #low版写法，比较麻烦
            # title=title,
            # price=price,
            # publish_date=publish_date,
            # publish=publish,



        data = request.POST.dict()
        data.pop('csrfmiddlewaretoken')

        #将最后的作者信息删除
        data.pop('authors')

        #获取返回的post请求中作者列表信息
        authors = request.POST.getlist('authors')
        # print(authors)


        #这里需要注意**data打散的问题，post返回的内容必须是publishs_id，因为我们在书籍表中定义的字段是叫publishs，但是django会自动把它变成publishs_id

        new_book_obj = models.Book.objects.create(
            **data
        )
        # book_obj= models.Book.objects.get(title=data['title'])
        # book_obj.authors.add(*authors)

        # create有一个返回对象，返回的就是添加的书籍内容，因此不需要在进行查询，然后再添加了
        new_book_obj.authors.add(*authors)


            #⚠️这里用到的是字典打散的用法，字典中的键必须和表中的字段名相同，而book_add中input标签中定义的name属性就是表中的字段名，因此返回的post请求中的字典的键就和表中的字段名相同了，所以这里可以用字典打散

        #对于GET方法，不加reverse也可以
        return redirect('book_list')
```

**编辑书籍**

```python

```



**删除书籍**

```python

```





# 3.settings文件配置

```python
#关于静态文件的配置项
在index.html文件中引入的bootstrap是这样写的
<link rel="stylesheet" href="/static/bootstrap-3.3.7-dist/css/bootstrap.min.css">


//需要设置的项如下
static是什么？static是settings配置文件中设置的路径别名，设置项如下
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'statics'),	#⚠️这里的名字不要和上边的static重名
]


os.path.join(BASE_DIR,'statics')这一项中的statics是django项目同目录级别下的目录，用于存放静态文件，而STATIC_URL = '/static/'中的static则是访问时候的别名，这里说的访问指的是index.html文件中引入bootstrap指定的路径开头的static

这里需要说明一下，给静态文件设置别名是为了安全，因为别人访问只能找到你的别名路径，而不知道真正的存放路径，真正的路径是/statics/bootstrap-3.3.7-dist/css/bootstrap.min.css，而客户访问的路径则是/static/bootstrap-3.3.7-dist/css/bootstrap.min.css

需要注意的是，必须设置别名才可以引入bootstrap样式，否则不生效



#关于数据库的配置项目
#先注释默认项
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'book',				#数据库名
        'HOST': '127.0.0.1',	#数据库IP
        'PORT': '3306',				#数据库端口
        'USER': 'root',				#数据库用户
        'PASSWORD': 'xxx'			#数据库密码
    }
}
```

# 4.Django项目同名目录下的``__init__.py``文件

```python
import pymysql
pymysql.install_as_MySQLdb()
```

# 5.models文件配置

```python
from django.db import models

# Create your models here.

class Author(models.Model):
    name=models.CharField(max_length=32)
    age=models.IntegerField()
    ad=models.OneToOneField(to="AuthorDetail",to_field="id",on_delete=models.CASCADE)
    # to_field="id"  可以不写,默认找主键
    # to="AuthorDetail",  to=可以不用写
    # models.SET_NULL  置空
    # on_delete=models.CASCADE  默认是级联删除,想做级联更新,直接去数据库修改表结构

class AuthorDetail(models.Model):
    birthday=models.DateField()
    telephone=models.CharField(max_length=16)
    addr=models.CharField(max_length=64)


class Publish(models.Model):
    name=models.CharField(max_length=32)
    city=models.CharField(max_length=32)

class Book(models.Model):
    title = models.CharField(max_length=32)
    publishDate=models.DateField()
    price=models.DecimalField(max_digits=5,decimal_places=2)
    publishs=models.ForeignKey(to="Publish",to_field="id",on_delete=models.CASCADE)

    #这行代码的意思是生成第3张表关联book表和author表
    authors=models.ManyToManyField(to='Author',)
```



# 6.html文件配置

展示页面中，出版社和作者的信息不在book表中，但是出版社可以利用书籍表与出版社表的一对多关系从书籍表获取的对象中获取到出版社的信息(book.publishs.name 出版社表与书籍表之间的关联字段是publishs，因此可以从获取到的书籍表对象再获取到出版社的信息，但是仅限于一对多关系，多对多关系不可以这样取值)

但是作者的信息不能利用一对多关系获取到，有两种方法可以获取

```python
//方法1，在html文件中写for循环
{# 这一步拿到了作者的对象，下边的for循环就是循环这个对象，然后取name值#}
{# <td>{{ book.authors.all.name }}</td>#}
<td>
{% for author in book.authors.all %}
{{ author.name }}
{# 这里给作者之间加一个逗号，做一下判断，如果是循环的最后一次就什么也不加#}
{% if forloop.last %}

{% else %}
     ,
{% endif %}
{% endfor %}
</td>


//方法2,models文件中
在Book类中
#函数写法  
      def get_all_authors(self):
        authors = self.authors.all()
        authors_list = []
        for i in authors:
            authors_list.append(i.name)

        ret = ','.join(authors_list)
        return ret
  
#列表推倒式写法
return '.'.join([i.name for i in self.authors.all()])

html文件中引用
{{ book.get_all_authors }}
```

![iShot2020-10-16 14.12.24](https://gitea.pptfz.cn/pptfz/picgo-images/raw/branch/master/img/iShot2020-10-16 14.12.24.png)





