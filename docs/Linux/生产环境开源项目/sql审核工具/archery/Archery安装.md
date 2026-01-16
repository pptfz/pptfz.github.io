# archery安装

[archery官网](https://archerydms.com/)

[archery github](https://github.com/hhyo/Archery)



## 安装报错

### `SECRET_KEY` 未设置

```shell
[2026-01-13 11:12:20 +0800] [20] [INFO] Worker exiting (pid: 20)
[2026-01-13 11:12:20 +0800] [21] [ERROR] Exception in worker process
Traceback (most recent call last):
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/arbiter.py", line 609, in spawn_worker
    worker.init_process()
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/workers/base.py", line 134, in init_process
    self.load_wsgi()
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/workers/base.py", line 146, in load_wsgi
    self.wsgi = self.app.wsgi()
                ^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/app/base.py", line 67, in wsgi
    self.callable = self.load()
                    ^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/app/wsgiapp.py", line 58, in load
    return self.load_wsgiapp()
           ^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/app/wsgiapp.py", line 48, in load_wsgiapp
    return util.import_app(self.app_uri)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/gunicorn/util.py", line 371, in import_app
    mod = importlib.import_module(module)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 940, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "/opt/archery/archery/wsgi.py", line 16, in <module>
    application = get_wsgi_application()
                  ^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/core/wsgi.py", line 12, in get_wsgi_application
    django.setup(set_prefix=False)
  File "/opt/venv4archery/lib/python3.11/site-packages/django/__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "/opt/venv4archery/lib/python3.11/site-packages/django/apps/registry.py", line 91, in populate
    app_config = AppConfig.create(entry)
                 ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/apps/config.py", line 123, in create
    mod = import_module(mod_path)
          ^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 940, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "/opt/venv4archery/lib/python3.11/site-packages/django_q/apps.py", line 3, in <module>
    from django_q.conf import Conf
  File "/opt/venv4archery/lib/python3.11/site-packages/django_q/conf.py", line 31, in <module>
    class Conf:
  File "/opt/venv4archery/lib/python3.11/site-packages/django_q/conf.py", line 171, in Conf
    SECRET_KEY = settings.SECRET_KEY
                 ^^^^^^^^^^^^^^^^^^^
  File "/opt/venv4archery/lib/python3.11/site-packages/django/conf/__init__.py", line 101, in __getattr__
    raise ImproperlyConfigured("The SECRET_KEY setting must not be empty.")
django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty.
```



#### 解决方法

编辑 `.env`  新增

:::caution 注意

`SECRET_KEY` 的长度必须大于32位，否则 `archery` 容器会报错如下

```shell
AssertionError: 
django-mirage-field key length (MIRAGE_SECRET_KEY or SECRET_KEY) must be longer than 32 characters!
```

:::

```shell
SECRET_KEY="4GjsJiFenGBICVd0HDhcCoLRusXmJCNr"
```



### `/opt/archery/.env not found`

执行 `python3 manage.py makemigrations sql` 报错如下

```shell
2026-01-13 14:23:09,043 - environ.environ - INFO - /opt/archery/.env not found - if you're not configuring your environment separately, check this.
```



#### 解决方法

修改 `docker-compose.yml` 文件，在 `archery` 容器 `volumes` 下挂载 `.env` 文件

```yaml
volumes:
......
  - "./.env:/opt/archery/.env"
```



## 安装步骤

### 克隆代码

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="github" label="github" default>

```shell
git clone -b v1.13.0 https://github.com/hhyo/Archery.git
```

  </TabItem>
  <TabItem value="gitee" label="gitee">

```shell
git clone -b v1.13.0 https://gitee.com/rtttte/Archery
```

  </TabItem>
</Tabs>



### 修改文件

修改 `docker-compose.yml` 文件，在 `archery` 容器 `volumes` 下挂载 `.env` 文件

```yaml
volumes:
......
  - "./.env:/opt/archery/.env"
```



修改  `.env`  文件，新增 `SECRET_KEY`

```shell
SECRET_KEY="4GjsJiFenGBICVd0HDhcCoLRusXmJCNr"
```





### 启动容器

```shell
cd Archery/src/docker-compose
docker compose up -d
```



### 查看启动

```shell
$ docker compose ps
NAME          IMAGE                       COMMAND                  SERVICE       CREATED         STATUS                   PORTS
archery       hhyo/archery:v1.13.0        "bash /opt/archery/s…"   archery       8 minutes ago   Up 8 minutes             0.0.0.0:9123->9123/tcp, :::9123->9123/tcp
goinception   hanchuanchuan/goinception   "/usr/local/bin/dumb…"   goinception   9 minutes ago   Up 9 minutes             0.0.0.0:4000->4000/tcp, :::4000->4000/tcp
mysql         mysql:5.7                   "docker-entrypoint.s…"   mysql         9 minutes ago   Up 9 minutes (healthy)   0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp
redis         redis:5                     "docker-entrypoint.s…"   redis         9 minutes ago   Up 9 minutes (healthy)   6379/tcp
```



### 表结构初始化

```shell
docker exec -ti archery /bin/bash
cd /opt/archery
source /opt/venv4archery/bin/activate
python3 manage.py makemigrations sql  
python3 manage.py migrate 
```



### 数据初始化

```shell
python3 manage.py dbshell<sql/fixtures/auth_group.sql
python3 manage.py dbshell<src/init_sql/mysql_slow_query_review.sql
```



### 创建管理用户

```shell
$ python3 manage.py createsuperuser
用户名: admin
电子邮件地址: xxx@xxx.com
Password: 
Password (again): 
Superuser created successfully.
```





## django配置 `settings.py`

编辑 `archery/settings.py` 增加如下安全配置项

:::caution 注意

如果访问的域名前边是云厂商的lb，则必须注释如下配置，否则访问会变成 `域名:9123` 

```python
SESSION_COOKIE_SECURE = True
```

:::

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
#SECURE_SSL_REDIRECT = True                  # 将所有非SSL请求永久重定向到SSL
SESSION_COOKIE_SECURE = True                # 仅通过https传输cookie
CSRF_COOKIE_SECURE = True                   # 仅通过https传输cookie
SECURE_HSTS_INCLUDE_SUBDOMAINS = True       # 严格要求使用https协议传输
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 60
SECURE_CONTENT_TYPE_NOSNIFF = True          # 防止浏览器猜测资产的内容类型
CSRF_TRUSTED_ORIGINS = ['192.168.1.3']      # 这里填写访问 archery的 ip或域名
CORS_ORIGIN_WHITELIST = (
'192.168.1.3',
)
```



在不配置 `settings.py` 相关安全配置的情况下，登陆显示如下

![iShot_2026-01-13_14.52.50](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-13_14.52.50.png)



并且 `archery` 容器会有如下报错

```shell
2026-01-13 14:50:06,022 - django.security.csrf - WARNING - Forbidden (Origin checking failed - https://archery.xxx.com does not match any trusted origins.): /authenticate/
```



## 启动后配置

在启动后 Archery 有一些配置(如Inception , 资源组, 权限组等)需要按需配置, 请详细阅读 [配置项说明](https://archerydms.com/configuration/) , 按照自己的需要进行配置



## 登陆

![iShot_2026-01-13_15.36.18](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-13_15.36.18.png)



登陆后首页面

![iShot_2026-01-13_15.37.36](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2026-01-13_15.37.36.png)

